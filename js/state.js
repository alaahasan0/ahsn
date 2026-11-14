/*
 * Application state: the bridge between storage (js/db) and the screens (js/ui).
 * Screens never talk to IndexedDB directly. They read from here and call the
 * mutation helpers, which save, reload and notify subscribers.
 *
 * Demo mode swaps in an in-memory sample dataset (nothing is saved) so the
 * dashboard can be previewed before real data exists.
 */

import * as db from './db/store.js';
import { todayISO, isValidDate } from './engine/dates.js';
import { DEFAULT_CONFIG } from './engine/ledger.js';

const listeners = new Set();
let real = { config: null, payments: [], adjustments: [] };
let demo = null;
let asOfOverride = null; // date chosen on the dashboard; null = today

const ss = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch { /* ignore */ } },
};

/* ---------- reading ---------- */

export const isDemo = () => !!demo;
export const getState = () => demo || real;
export const isConfigured = () => !!getState().config;

/** "Today" for the app. ?today=YYYY-MM-DD in the URL overrides it, for testing. */
export function today() {
  if (demo) return demo.today;
  const q = new URLSearchParams(location.search).get('today');
  return isValidDate(q) ? q : todayISO();
}

/** Date all dashboard balances are calculated at. */
export const asOf = () => asOfOverride || today();
export function setAsOf(date) {
  asOfOverride = isValidDate(date) && date !== today() ? date : null;
  notify();
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { listeners.forEach((fn) => fn(getState())); }

/* ---------- loading ---------- */

export async function load() {
  real = await db.loadState();
  if (ss.get('demo') === '1') demo = buildDemo();
  notify();
  return getState();
}

async function reload() {
  real = await db.loadState();
  notify();
}

function guardDemo() {
  if (demo) throw new Error('Demo mode is on. Turn it off in More to edit your real data.');
}

/* ---------- mutations ---------- */

export async function saveConfig(config) { guardDemo(); await db.saveConfig(config); await reload(); }
export async function savePayment(p) { guardDemo(); const r = await db.savePayment(p); await reload(); return r; }
export async function deletePayment(id) { guardDemo(); await db.deletePayment(id); await reload(); }
export async function saveAdjustment(a) { guardDemo(); const r = await db.saveAdjustment(a); await reload(); return r; }
export async function deleteAdjustment(id) { guardDemo(); await db.deleteAdjustment(id); await reload(); }
export async function eraseAll() { guardDemo(); await db.resetAll(); asOfOverride = null; await reload(); }

/* ---------- demo mode ---------- */

export function setDemo(on) {
  demo = on ? buildDemo() : null;
  asOfOverride = null;
  ss.set('demo', on ? '1' : null);
  notify();
}

function buildDemo() {
  let n = 0;
  const p = (date, so, cs, reference = '', notes = '') => ({
    id: `demo-p${++n}`, date, totalCents: (so + cs) * 100, smartOfficeCents: so * 100, classSolutionCents: cs * 100,
    reference, notes, createdAt: `${date}T09:00:0${n % 10}Z`,
  });
  return {
    today: '2027-03-10',
    config: { ...DEFAULT_CONFIG, openingBalanceCents: 40000 },
    payments: [
      p('2026-11-12', 300, 0, 'SO-1104'),
      p('2026-12-05', 600, 400, '', 'Covers November'),
      p('2026-12-28', 0, 300, 'TCS-88'),
      p('2027-01-20', 500, 0),
      p('2027-01-20', 0, 200, 'TCS-91'),
      p('2027-02-26', 700, 300),
      p('2027-03-04', 250, 250),
    ],
    adjustments: [
      { id: 'demo-a1', date: '2027-01-31', amountCents: -5000, reason: 'Agreed deduction for unpaid day', createdAt: '2027-01-31T10:00:00Z' },
    ],
  };
}
