/*
 * Financial calculation engine.
 *
 * Pure functions only: no DOM, no storage, no clock (the caller passes "as of"
 * dates). All amounts are integer cents. All dates are "YYYY-MM-DD" strings.
 *
 *   Outstanding = Opening balance + Accrued salary − Payments received + Adjustments
 *
 *   positive outstanding → money still owed to me
 *   negative outstanding → advance credit (I have been paid ahead)
 *
 * Accounting is cumulative: a payment never "belongs" to a specific month's salary.
 */

import { assertCents, sumCents } from './money.js';
import {
  isValidDate, isValidMonth, monthOf, monthEnd, monthStart, monthRange, addMonths, previousDay,
} from './dates.js';

export const COMPANIES = Object.freeze({
  smartOffice: 'Smart Office',
  classSolution: 'The Class Solution',
});

export const ENTRY_TYPES = Object.freeze({
  opening: 'Opening balance',
  salary: 'Salary accrued',
  adjustment: 'Adjustment',
  payment: 'Payment received',
});

// Order of entries that share the same date. Salary falls due first, so a
// payment made on the due date settles that salary rather than counting as an
// advance. The end-of-day balance is the same whatever the order.
const SAME_DAY_ORDER = { opening: 0, salary: 1, adjustment: 2, payment: 3 };

export const DEFAULT_CONFIG = Object.freeze({
  startDate: '2026-11-01',
  openingBalanceCents: 0,
  currency: 'USD',
  // Salary schedule supports future raises: each entry applies from its month onwards.
  salarySchedule: [{ fromMonth: '2026-11', amountCents: 80000 }],
});

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export function validateConfig(config) {
  const errors = [];
  if (!isValidDate(config?.startDate)) errors.push('Start date is not a valid date.');
  if (!Number.isSafeInteger(config?.openingBalanceCents)) errors.push('Opening balance must be a whole number of cents.');
  const sched = config?.salarySchedule;
  if (!Array.isArray(sched) || sched.length === 0) {
    errors.push('A monthly salary is required.');
  } else {
    sched.forEach((s, i) => {
      if (!isValidMonth(s.fromMonth)) errors.push(`Salary entry ${i + 1} has an invalid month.`);
      if (!Number.isSafeInteger(s.amountCents) || s.amountCents < 0) errors.push(`Salary entry ${i + 1} must be a non-negative amount.`);
    });
  }
  return errors;
}

export function validatePayment(p, config) {
  const errors = [];
  if (!isValidDate(p?.date)) errors.push('Enter a valid transfer date.');
  else if (config && p.date < config.startDate) errors.push('Transfer date cannot be before the tracking start date.');
  for (const [key, label] of [['totalCents', 'Total amount'], ['smartOfficeCents', COMPANIES.smartOffice], ['classSolutionCents', COMPANIES.classSolution]]) {
    if (!Number.isSafeInteger(p?.[key])) errors.push(`${label} must be a valid amount.`);
    else if (p[key] < 0) errors.push(`${label} cannot be negative.`);
  }
  if (errors.length) return errors;
  if (p.totalCents === 0) errors.push('Total amount must be greater than zero.');
  if (p.smartOfficeCents + p.classSolutionCents !== p.totalCents) {
    errors.push('Company amounts must add up to the total amount.');
  }
  return errors;
}

export function validateAdjustment(a, config) {
  const errors = [];
  if (!isValidDate(a?.date)) errors.push('Enter a valid adjustment date.');
  else if (config && a.date < config.startDate) errors.push('Adjustment date cannot be before the tracking start date.');
  if (!Number.isSafeInteger(a?.amountCents) || a.amountCents === 0) errors.push('Adjustment amount must be a non-zero amount.');
  if (!a?.reason || !String(a.reason).trim()) errors.push('Enter a reason for the adjustment.');
  return errors;
}

/* ------------------------------------------------------------------ */
/* Salary accruals                                                     */
/* ------------------------------------------------------------------ */

/** Monthly salary in force for a given "YYYY-MM". */
export function salaryForMonth(config, month) {
  const sched = [...config.salarySchedule].sort((a, b) => (a.fromMonth < b.fromMonth ? -1 : 1));
  let amount = 0;
  for (const s of sched) if (s.fromMonth <= month) amount = s.amountCents;
  return amount;
}

/**
 * Salary entitlements that have fallen due on or before `asOf`.
 * Each month accrues on its last calendar day. The first month is the month of
 * the start date (start 1 Nov 2026 → first accrual 30 Nov 2026).
 */
export function salaryAccruals(config, asOf) {
  if (!asOf || asOf < config.startDate) return [];
  const first = monthOf(config.startDate);
  let last = monthOf(asOf);
  if (monthEnd(last) > asOf) last = addMonths(last, -1);
  if (last < first) return [];
  return monthRange(first, last)
    .map((month) => ({
      id: `salary-${month}`,
      type: 'salary',
      date: monthEnd(month),
      month,
      amountCents: salaryForMonth(config, month),
    }))
    .filter((a) => a.amountCents > 0);
}

/* ------------------------------------------------------------------ */
/* Ledger                                                              */
/* ------------------------------------------------------------------ */

/**
 * Build the full chronological ledger up to and including `asOf`.
 *
 * Each entry has:
 *   effectCents          signed impact on the outstanding balance
 *   balanceBeforeCents   outstanding balance just before the entry
 *   balanceCents         outstanding balance just after it
 * Payment entries also have advanceCents: the part of the payment that went
 * beyond what was owed at that moment, i.e. money received ahead of salary due.
 */
export function buildLedger(state, asOf) {
  const { config, payments = [], adjustments = [] } = state;
  const entries = [];

  entries.push({
    id: 'opening',
    type: 'opening',
    date: config.startDate,
    amountCents: assertCents(config.openingBalanceCents, 'opening balance'),
    effectCents: config.openingBalanceCents,
  });

  for (const a of salaryAccruals(config, asOf)) {
    entries.push({ ...a, effectCents: a.amountCents });
  }

  for (const adj of adjustments) {
    if (adj.date > asOf) continue;
    entries.push({
      id: adj.id,
      type: 'adjustment',
      date: adj.date,
      amountCents: assertCents(adj.amountCents, 'adjustment amount'),
      effectCents: adj.amountCents,
      reason: adj.reason,
      createdAt: adj.createdAt,
      source: adj,
    });
  }

  for (const p of payments) {
    if (p.date > asOf) continue;
    entries.push({
      id: p.id,
      type: 'payment',
      date: p.date,
      amountCents: assertCents(p.totalCents, 'payment total'),
      effectCents: -p.totalCents,
      smartOfficeCents: p.smartOfficeCents,
      classSolutionCents: p.classSolutionCents,
      reference: p.reference || '',
      notes: p.notes || '',
      createdAt: p.createdAt,
      source: p,
    });
  }

  entries.sort(compareEntries);

  let balance = 0;
  for (const e of entries) {
    e.balanceBeforeCents = balance;
    balance += e.effectCents;
    e.balanceCents = balance;
    if (e.type === 'payment') {
      e.advanceCents = Math.max(0, e.amountCents - Math.max(0, e.balanceBeforeCents));
    }
  }
  return entries;
}

function compareEntries(a, b) {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  const t = SAME_DAY_ORDER[a.type] - SAME_DAY_ORDER[b.type];
  if (t) return t;
  const ca = a.createdAt || '', cb = b.createdAt || '';
  if (ca !== cb) return ca < cb ? -1 : 1;
  return String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/* Financial position                                                  */
/* ------------------------------------------------------------------ */

/** Full financial position as of the end of the day `asOf`. */
export function positionAsOf(state, asOf) {
  const ledger = buildLedger(state, asOf);
  const totals = summarise(ledger.filter((e) => e.type !== 'opening'));
  const openingCents = state.config.openingBalanceCents;
  const balanceCents = openingCents + totals.accruedCents - totals.paidCents + totals.adjustmentsCents;

  // Safety check: the running ledger and the formula must agree exactly.
  const ledgerBalance = ledger.length ? ledger[ledger.length - 1].balanceCents : 0;
  if (ledgerBalance !== balanceCents) {
    throw new Error(`Ledger mismatch: ${ledgerBalance} vs ${balanceCents}`);
  }

  return {
    asOf,
    openingCents,
    ...totals,
    balanceCents,
    owedCents: Math.max(0, balanceCents),          // still owed to me
    advanceCreditCents: Math.max(0, -balanceCents), // paid ahead
    ledger,
  };
}

function summarise(entries) {
  const of = (type) => entries.filter((e) => e.type === type);
  const payments = of('payment');
  const salaries = of('salary');
  return {
    accruedCents: sumCents(salaries.map((e) => e.amountCents)),
    salaryMonths: salaries.length,
    paidCents: sumCents(payments.map((e) => e.amountCents)),
    paymentCount: payments.length,
    adjustmentsCents: sumCents(of('adjustment').map((e) => e.amountCents)),
    byCompany: {
      smartOffice: sumCents(payments.map((e) => e.smartOfficeCents)),
      classSolution: sumCents(payments.map((e) => e.classSolutionCents)),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Monthly statements                                                  */
/* ------------------------------------------------------------------ */

/**
 * One statement per month, from the start month to the month containing `throughDate`.
 * Each month's closing balance is the position at the end of its final day,
 * and its opening balance is the previous month's closing balance (or the
 * configured opening balance for the first month).
 *
 * `today` marks months that have not finished yet (isComplete: false).
 */
export function monthlyStatements(state, throughDate, today = throughDate) {
  const { config } = state;
  const firstMonth = monthOf(config.startDate);
  const lastMonth = monthOf(throughDate);
  if (lastMonth < firstMonth) return [];

  const ledger = buildLedger(state, monthEnd(lastMonth));
  const months = monthRange(firstMonth, lastMonth);
  let opening = config.openingBalanceCents;

  return months.map((month) => {
    const inMonth = ledger.filter((e) => e.type !== 'opening' && monthOf(e.date) === month);
    const t = summarise(inMonth);
    const closing = opening + t.accruedCents - t.paidCents + t.adjustmentsCents;
    const row = {
      month,
      startDate: monthStart(month) < config.startDate ? config.startDate : monthStart(month),
      dueDate: monthEnd(month),
      openingCents: opening,
      salaryCents: t.accruedCents,
      salaryEntitlementCents: salaryForMonth(config, month),
      paymentsCents: t.paidCents,
      paymentCount: t.paymentCount,
      smartOfficeCents: t.byCompany.smartOffice,
      classSolutionCents: t.byCompany.classSolution,
      adjustmentsCents: t.adjustmentsCents,
      closingCents: closing,
      isComplete: monthEnd(month) <= today,
      entries: inMonth,
    };
    opening = closing;
    return row;
  });
}

/**
 * Cumulative view: running totals at the end of each month.
 */
export function cumulativeStatements(state, throughDate, today = throughDate) {
  let accrued = 0, paid = 0, adj = 0, so = 0, cs = 0;
  return monthlyStatements(state, throughDate, today).map((m) => {
    accrued += m.salaryCents;
    paid += m.paymentsCents;
    adj += m.adjustmentsCents;
    so += m.smartOfficeCents;
    cs += m.classSolutionCents;
    return {
      month: m.month,
      dueDate: m.dueDate,
      cumulativeAccruedCents: accrued,
      cumulativePaidCents: paid,
      cumulativeAdjustmentsCents: adj,
      cumulativeSmartOfficeCents: so,
      cumulativeClassSolutionCents: cs,
      closingCents: m.closingCents,
      isComplete: m.isComplete,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Company report                                                      */
/* ------------------------------------------------------------------ */

/** Payments received through one company, newest first, up to `asOf`. */
export function companyHistory(state, company, asOf) {
  const key = company === 'smartOffice' ? 'smartOfficeCents' : 'classSolutionCents';
  const rows = (state.payments || [])
    .filter((p) => p.date <= asOf && p[key] > 0)
    .map((p) => ({ id: p.id, date: p.date, amountCents: p[key], totalCents: p.totalCents, reference: p.reference || '', notes: p.notes || '' }))
    .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
  return { company, label: COMPANIES[company], totalCents: sumCents(rows.map((r) => r.amountCents)), rows };
}

/* ------------------------------------------------------------------ */
/* Current month                                                       */
/* ------------------------------------------------------------------ */

/** Summary of the month containing `today`, for the dashboard. */
export function currentMonthSummary(state, today) {
  const month = monthOf(today);
  const dueDate = monthEnd(month);
  const inMonth = (state.payments || []).filter((p) => monthOf(p.date) === month && p.date <= today);
  const before = month <= monthOf(state.config.startDate) ? null : previousDay(monthStart(month));
  return {
    month,
    dueDate,
    salaryEntitlementCents: salaryForMonth(state.config, month),
    isDue: today >= dueDate,
    paymentsCents: sumCents(inMonth.map((p) => p.totalCents)),
    paymentCount: inMonth.length,
    openingCents: before ? positionAsOf(state, before).balanceCents : state.config.openingBalanceCents,
    balanceCents: positionAsOf(state, today).balanceCents,
  };
}
