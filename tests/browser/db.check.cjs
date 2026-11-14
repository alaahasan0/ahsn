// Browser test of the IndexedDB layer + engine together, in real Chromium.
// Needs a static server on the repo root:  python3 -m http.server 8765
// Run:  npm run test:browser
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const BASE = process.env.BASE_URL || 'http://localhost:8765/';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.error('Page error:', e.message); process.exitCode = 1; });
  await page.goto(BASE);

  // 1. Write data through the storage layer
  const r1 = await page.evaluate(async () => {
    const db = await import('./js/db/store.js');
    const { DEFAULT_CONFIG } = await import('./js/engine/ledger.js');
    await db.resetAll();
    await db.saveConfig({ ...DEFAULT_CONFIG, openingBalanceCents: 25000 });
    const p1 = await db.savePayment({ date: '2026-11-15', totalCents: 30000, smartOfficeCents: 10000, classSolutionCents: 20000, reference: ' TX-1 ' });
    await db.savePayment({ date: '2026-12-15', totalCents: 50000, smartOfficeCents: 50000, classSolutionCents: 0 });
    await db.saveAdjustment({ date: '2026-12-20', amountCents: -5000, reason: 'Correction' });
    // edit then delete flows
    await db.savePayment({ ...p1, notes: 'edited' });
    const tmp = await db.savePayment({ date: '2026-12-01', totalCents: 100, smartOfficeCents: 100, classSolutionCents: 0 });
    const deleted = await db.deletePayment(tmp.id);
    const missing = await db.deletePayment('nope');
    return { p1, deleted, missing };
  });
  assert.equal(r1.p1.reference, 'TX-1', 'reference trimmed');
  assert.equal(r1.deleted, true);
  assert.equal(r1.missing, false);

  // 2. Simulate closing and reopening the app: new page, same storage
  await page.close();
  const page2 = await ctx.newPage();
  await page2.goto(BASE);
  const r2 = await page2.evaluate(async () => {
    const db = await import('./js/db/store.js');
    const { positionAsOf } = await import('./js/engine/ledger.js');
    const state = await db.loadState();
    const pos = positionAsOf(state, '2026-12-31');
    const audit = await db.listAudit();
    return {
      payments: state.payments.length,
      notes: state.payments.find((p) => p.date === '2026-11-15').notes,
      balance: pos.balanceCents,
      audit: audit.map((a) => `${a.action}:${a.entity}`),
    };
  });
  assert.equal(r2.payments, 2);
  assert.equal(r2.notes, 'edited');
  // 250 + 1600 − 800 − 50 = 1000.00
  assert.equal(r2.balance, 100000);
  assert.deepEqual(r2.audit.slice().reverse(), [
    'create:config', 'create:payment', 'create:payment', 'create:adjustment',
    'update:payment', 'create:payment', 'delete:payment',
  ]);

  // 3. Backup → wipe → restore round trip
  const r3 = await page2.evaluate(async () => {
    const db = await import('./js/db/store.js');
    const backup = JSON.parse(JSON.stringify(await db.exportBackup()));
    await db.resetAll();
    const empty = (await db.loadState()).payments.length;
    const badErrors = db.checkBackup({ format: 'something-else' });
    await db.restoreBackup(backup);
    const s = await db.loadState();
    const audit = await db.listAudit();
    return { empty, badErrors, payments: s.payments.length, adjustments: s.adjustments.length,
      opening: s.config.openingBalanceCents, lastAudit: audit[0].action, auditCount: audit.length };
  });
  assert.equal(r3.empty, 0);
  assert.ok(r3.badErrors.length > 0);
  assert.equal(r3.payments, 2);
  assert.equal(r3.adjustments, 1);
  assert.equal(r3.opening, 25000);
  assert.equal(r3.lastAudit, 'restore');
  assert.equal(r3.auditCount, 8);

  await page2.evaluate(async () => (await import('./js/db/store.js')).resetAll());
  await browser.close();
  console.log(process.exitCode ? 'Browser DB checks FAILED' : 'Browser DB checks passed ✓');
})().catch((e) => { console.error(e); process.exit(1); });
