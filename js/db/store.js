/*
 * IndexedDB storage layer.
 *
 * Stores:
 *   settings     key/value ('config' holds the financial configuration)
 *   payments     one record per incoming transfer
 *   adjustments  one record per balance adjustment (separate ledger entries)
 *   audit        append-only log of every create / update / delete
 *
 * Every write updates the audit log in the same transaction, so the history
 * can never get out of step with the data.
 *
 * This module knows nothing about the UI. It only does basic shape checks;
 * the financial rules are enforced by js/engine/ledger.js before saving.
 */

export const DB_NAME = 'salary-tracker';
export const DB_VERSION = 1;
export const BACKUP_FORMAT = 'salary-tracker-backup';
export const BACKUP_VERSION = 1;

let dbPromise = null;

export function openDB(name = DB_NAME) {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(name, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
      if (!db.objectStoreNames.contains('payments')) {
        db.createObjectStore('payments', { keyPath: 'id' }).createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains('adjustments')) {
        db.createObjectStore('adjustments', { keyPath: 'id' }).createIndex('date', 'date');
      }
      if (!db.objectStoreNames.contains('audit')) {
        db.createObjectStore('audit', { keyPath: 'seq', autoIncrement: true }).createIndex('at', 'at');
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => { db.close(); dbPromise = null; };
      resolve(db);
    };
    req.onerror = () => { dbPromise = null; reject(req.error); };
    req.onblocked = () => reject(new Error('Database is open in another tab. Close it and try again.'));
  });
  return dbPromise;
}

/** Close the connection (used by tests and before deleting the database). */
export async function closeDB() {
  if (!dbPromise) return;
  const db = await dbPromise.catch(() => null);
  db?.close();
  dbPromise = null;
}

/* ---------- small promise helpers ---------- */

const done = (tx) => new Promise((resolve, reject) => {
  tx.oncomplete = () => resolve();
  tx.onerror = () => reject(tx.error);
  tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
});

const result = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const nowISO = () => new Date().toISOString();

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function audit(tx, action, entity, id, before, after) {
  tx.objectStore('audit').add({
    at: nowISO(),
    action,          // 'create' | 'update' | 'delete' | 'restore' | 'reset'
    entity,          // 'config' | 'payment' | 'adjustment' | 'all'
    entityId: id ?? null,
    before: before ?? null,
    after: after ?? null,
  });
}

/* ---------- configuration ---------- */

export async function getConfig() {
  const db = await openDB();
  return result(db.transaction('settings').objectStore('settings').get('config')).then((c) => c ?? null);
}

export async function saveConfig(config) {
  const db = await openDB();
  const tx = db.transaction(['settings', 'audit'], 'readwrite');
  const store = tx.objectStore('settings');
  let record;
  // Read-then-write inside request callbacks (no awaits) keeps the
  // transaction alive on every Safari version.
  const getReq = store.get('config');
  getReq.onsuccess = () => {
    const before = getReq.result;
    record = { ...config, updatedAt: nowISO(), createdAt: before?.createdAt ?? nowISO() };
    store.put(record, 'config');
    audit(tx, before ? 'update' : 'create', 'config', 'config', before, record);
  };
  await done(tx);
  return record;
}

/* ---------- generic collection helpers ---------- */

async function listAll(storeName) {
  const db = await openDB();
  const rows = await result(db.transaction(storeName).objectStore(storeName).getAll());
  return rows.sort((a, b) => (a.date === b.date
    ? (a.createdAt < b.createdAt ? -1 : 1)
    : (a.date < b.date ? -1 : 1)));
}

async function putRecord(storeName, entity, record) {
  const db = await openDB();
  const tx = db.transaction([storeName, 'audit'], 'readwrite');
  const store = tx.objectStore(storeName);
  const id = record.id || newId();
  let saved;
  const getReq = store.get(id);
  getReq.onsuccess = () => {
    const before = getReq.result;
    const ts = nowISO();
    saved = { ...record, id, createdAt: before?.createdAt ?? record.createdAt ?? ts, updatedAt: ts };
    store.put(saved);
    audit(tx, before ? 'update' : 'create', entity, id, before, saved);
  };
  await done(tx);
  return saved;
}

async function deleteRecord(storeName, entity, id) {
  const db = await openDB();
  const tx = db.transaction([storeName, 'audit'], 'readwrite');
  const store = tx.objectStore(storeName);
  let found = false;
  const getReq = store.get(id);
  getReq.onsuccess = () => {
    const before = getReq.result;
    if (!before) return;
    found = true;
    store.delete(id);
    audit(tx, 'delete', entity, id, before, null);
  };
  await done(tx);
  return found;
}

/* ---------- payments ---------- */

export const listPayments = () => listAll('payments');

/**
 * Save a payment. Shape:
 * { id?, date, totalCents, smartOfficeCents, classSolutionCents, reference?, notes? }
 */
export function savePayment(p) {
  return putRecord('payments', 'payment', {
    id: p.id,
    date: p.date,
    totalCents: p.totalCents,
    smartOfficeCents: p.smartOfficeCents,
    classSolutionCents: p.classSolutionCents,
    reference: (p.reference || '').trim(),
    notes: (p.notes || '').trim(),
    createdAt: p.createdAt,
  });
}

export const deletePayment = (id) => deleteRecord('payments', 'payment', id);

/* ---------- adjustments ---------- */

export const listAdjustments = () => listAll('adjustments');

/**
 * Save an adjustment. Shape: { id?, date, amountCents (signed), reason }
 * Positive amountCents increases the outstanding balance; negative decreases it.
 */
export function saveAdjustment(a) {
  return putRecord('adjustments', 'adjustment', {
    id: a.id,
    date: a.date,
    amountCents: a.amountCents,
    reason: (a.reason || '').trim(),
    createdAt: a.createdAt,
  });
}

export const deleteAdjustment = (id) => deleteRecord('adjustments', 'adjustment', id);

/* ---------- audit ---------- */

export async function listAudit() {
  const db = await openDB();
  const rows = await result(db.transaction('audit').objectStore('audit').getAll());
  return rows.reverse(); // newest first
}

/* ---------- whole state ---------- */

/** Everything the engine needs, in one consistent read. */
export async function loadState() {
  const db = await openDB();
  const tx = db.transaction(['settings', 'payments', 'adjustments'], 'readonly');
  const [config, payments, adjustments] = await Promise.all([
    result(tx.objectStore('settings').get('config')),
    result(tx.objectStore('payments').getAll()),
    result(tx.objectStore('adjustments').getAll()),
  ]);
  return { config: config ?? null, payments, adjustments };
}

/* ---------- backup & restore ---------- */

export async function exportBackup() {
  const db = await openDB();
  const tx = db.transaction(['settings', 'payments', 'adjustments', 'audit'], 'readonly');
  const [config, payments, adjustments, auditLog] = await Promise.all([
    result(tx.objectStore('settings').get('config')),
    result(tx.objectStore('payments').getAll()),
    result(tx.objectStore('adjustments').getAll()),
    result(tx.objectStore('audit').getAll()),
  ]);
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: nowISO(),
    data: { config: config ?? null, payments, adjustments, audit: auditLog },
  };
}

/** Checks a backup file's structure. Returns a list of problems (empty = OK). */
export function checkBackup(backup) {
  const errors = [];
  if (!backup || backup.format !== BACKUP_FORMAT) errors.push('This file is not a Salary Tracker backup.');
  else if (backup.version > BACKUP_VERSION) errors.push('This backup was made by a newer version of the app.');
  const d = backup?.data;
  if (d) {
    if (!Array.isArray(d.payments)) errors.push('Backup has no payments list.');
    if (!Array.isArray(d.adjustments)) errors.push('Backup has no adjustments list.');
    const ints = (v) => Number.isSafeInteger(v);
    (d.payments || []).forEach((p, i) => {
      if (!p.id || !p.date || !ints(p.totalCents) || !ints(p.smartOfficeCents) || !ints(p.classSolutionCents)) {
        errors.push(`Payment ${i + 1} is incomplete.`);
      }
    });
    (d.adjustments || []).forEach((a, i) => {
      if (!a.id || !a.date || !ints(a.amountCents)) errors.push(`Adjustment ${i + 1} is incomplete.`);
    });
  } else if (!errors.length) {
    errors.push('Backup contains no data.');
  }
  return errors;
}

/** Replace all data with a backup's contents, in one transaction. */
export async function restoreBackup(backup) {
  const errors = checkBackup(backup);
  if (errors.length) throw new Error(errors.join(' '));
  const { config, payments, adjustments, audit: auditLog = [] } = backup.data;
  const db = await openDB();
  const tx = db.transaction(['settings', 'payments', 'adjustments', 'audit'], 'readwrite');
  for (const name of ['settings', 'payments', 'adjustments', 'audit']) tx.objectStore(name).clear();
  if (config) tx.objectStore('settings').put(config, 'config');
  payments.forEach((p) => tx.objectStore('payments').put(p));
  adjustments.forEach((a) => tx.objectStore('adjustments').put(a));
  auditLog.forEach(({ seq, ...entry }) => tx.objectStore('audit').add(entry));
  audit(tx, 'restore', 'all', null, null, { exportedAt: backup.exportedAt, payments: payments.length, adjustments: adjustments.length });
  await done(tx);
}

/** Delete all data (used by "Erase all data" and tests). */
export async function resetAll() {
  const db = await openDB();
  const tx = db.transaction(['settings', 'payments', 'adjustments', 'audit'], 'readwrite');
  for (const name of ['settings', 'payments', 'adjustments', 'audit']) tx.objectStore(name).clear();
  await done(tx);
}
