// Financial engine tests. Run with:  npm test
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { parseToCents, formatCents, centsToPlain } from '../js/engine/money.js';
import { monthEnd, addMonths, monthRange, isValidDate, previousDay } from '../js/engine/dates.js';
import {
  DEFAULT_CONFIG, positionAsOf, buildLedger, salaryAccruals, monthlyStatements,
  cumulativeStatements, companyHistory, currentMonthSummary, validatePayment,
  validateAdjustment, validateConfig,
} from '../js/engine/ledger.js';

const $ = (dollars) => Math.round(dollars * 100);
let seq = 0;
const pay = (date, total, so = total, cs = total - so) => ({
  id: `p${++seq}`, date, totalCents: $(total), smartOfficeCents: $(so), classSolutionCents: $(cs),
  createdAt: `2026-01-01T00:00:${String(seq).padStart(2, '0')}Z`,
});
const adj = (date, amount, reason = 'test') => ({ id: `a${++seq}`, date, amountCents: $(amount), reason, createdAt: `2026-01-01T00:01:${String(seq).padStart(2, '0')}Z` });
const state = ({ opening = 0, payments = [], adjustments = [] } = {}) => ({
  config: { ...DEFAULT_CONFIG, openingBalanceCents: $(opening) }, payments, adjustments,
});
const bal = (s, date) => positionAsOf(s, date).balanceCents;

/* ------------------------------------------------------------------ */
describe('Required scenarios', () => {
  test('A: salary accrues 30 Nov, no transfers → $800 owed', () => {
    const s = state();
    assert.equal(bal(s, '2026-11-29'), 0, 'nothing accrues before due date');
    assert.equal(bal(s, '2026-11-30'), $(800));
    const p = positionAsOf(s, '2026-11-30');
    assert.equal(p.accruedCents, $(800));
    assert.equal(p.paidCents, 0);
    assert.equal(p.owedCents, $(800));
    assert.equal(p.advanceCreditCents, 0);
  });

  test('B: receive $300 on 15 Nov, salary 30 Nov → $500 owed', () => {
    const s = state({ payments: [pay('2026-11-15', 300)] });
    assert.equal(bal(s, '2026-11-14'), 0);
    assert.equal(bal(s, '2026-11-15'), -$(300), 'advance credit before salary due');
    assert.equal(positionAsOf(s, '2026-11-15').advanceCreditCents, $(300));
    assert.equal(bal(s, '2026-11-29'), -$(300));
    assert.equal(bal(s, '2026-11-30'), $(500));
    const entry = buildLedger(s, '2026-11-30').find((e) => e.type === 'payment');
    assert.equal(entry.advanceCents, $(300), 'whole payment was received in advance');
  });

  test('C: receive $1,000 on 15 Nov, salary 30 Nov → −$200 advance credit', () => {
    const s = state({ payments: [pay('2026-11-15', 1000)] });
    assert.equal(bal(s, '2026-11-15'), -$(1000));
    const p = positionAsOf(s, '2026-11-30');
    assert.equal(p.balanceCents, -$(200));
    assert.equal(p.advanceCreditCents, $(200));
    assert.equal(p.owedCents, 0);
    assert.equal(formatCents(p.balanceCents), '-$200.00');
  });

  test('D: Nov salary, $500 on 15 Dec, Dec salary → $1,100 owed', () => {
    const s = state({ payments: [pay('2026-12-15', 500)] });
    const expected = {
      '2026-11-29': 0, '2026-11-30': 800, '2026-12-01': 800, '2026-12-14': 800,
      '2026-12-15': 300, '2026-12-30': 300, '2026-12-31': 1100, '2027-01-15': 1100,
    };
    for (const [date, dollars] of Object.entries(expected)) {
      assert.equal(bal(s, date), $(dollars), `balance on ${date}`);
    }
    const p = positionAsOf(s, '2026-12-31');
    assert.equal(p.accruedCents, $(1600));
    assert.equal(p.paidCents, $(500));
    const entry = p.ledger.find((e) => e.type === 'payment');
    assert.equal(entry.advanceCents, 0, 'Dec 15 payment settled arrears, not an advance');
  });
});

/* ------------------------------------------------------------------ */
describe('Accruals', () => {
  test('first accrual is 30 Nov 2026, one per month on last calendar day', () => {
    const a = salaryAccruals(DEFAULT_CONFIG, '2027-03-31');
    assert.deepEqual(a.map((x) => x.date), ['2026-11-30', '2026-12-31', '2027-01-31', '2027-02-28', '2027-03-31']);
    assert.ok(a.every((x) => x.amountCents === 80000));
  });

  test('leap-year February accrues on the 29th', () => {
    const dates = salaryAccruals(DEFAULT_CONFIG, '2028-03-01').map((x) => x.date);
    assert.ok(dates.includes('2028-02-29'));
    assert.ok(!dates.includes('2028-02-28'));
  });

  test('no accrual before start date', () => {
    assert.deepEqual(salaryAccruals(DEFAULT_CONFIG, '2026-10-31'), []);
    assert.deepEqual(salaryAccruals(DEFAULT_CONFIG, '2026-11-01'), []);
  });

  test('salary schedule supports a future raise', () => {
    const s = state();
    s.config.salarySchedule = [{ fromMonth: '2026-11', amountCents: 80000 }, { fromMonth: '2027-01', amountCents: 90000 }];
    assert.equal(positionAsOf(s, '2027-01-31').accruedCents, 80000 + 80000 + 90000);
  });
});

/* ------------------------------------------------------------------ */
describe('Balance formula', () => {
  test('opening balance + accrued − paid + adjustments', () => {
    const s = state({
      opening: 1250.75,
      payments: [pay('2026-11-10', 1000, 600, 400), pay('2026-12-02', 300, 0, 300)],
      adjustments: [adj('2026-12-05', -50.25), adj('2026-12-20', 100)],
    });
    const p = positionAsOf(s, '2026-12-31');
    assert.equal(p.openingCents, $(1250.75));
    assert.equal(p.accruedCents, $(1600));
    assert.equal(p.paidCents, $(1300));
    assert.equal(p.adjustmentsCents, $(49.75));
    assert.equal(p.balanceCents, $(1250.75) + $(1600) - $(1300) + $(49.75));
    assert.deepEqual(p.byCompany, { smartOffice: $(600), classSolution: $(700) });
  });

  test('opening balance applies from the start date', () => {
    const s = state({ opening: 400 });
    assert.equal(bal(s, '2026-11-01'), $(400));
    assert.equal(bal(s, '2026-11-30'), $(1200));
  });

  test('multiple transfers on the same day and month', () => {
    const s = state({ payments: [pay('2026-11-30', 200), pay('2026-11-30', 150, 0, 150), pay('2026-11-05', 100)] });
    assert.equal(bal(s, '2026-11-30'), $(350));
    assert.equal(positionAsOf(s, '2026-11-30').paymentCount, 3);
  });

  test('payment on the due date settles salary (not an advance)', () => {
    const s = state({ payments: [pay('2026-11-30', 800)] });
    const e = buildLedger(s, '2026-11-30');
    assert.deepEqual(e.map((x) => x.type), ['opening', 'salary', 'payment']);
    assert.equal(e[2].advanceCents, 0);
    assert.equal(bal(s, '2026-11-30'), 0);
  });

  test('partial advance is measured against what was owed', () => {
    const s = state({ payments: [pay('2026-12-10', 1000)] }); // $800 owed, $1000 paid
    const e = buildLedger(s, '2026-12-10').find((x) => x.type === 'payment');
    assert.equal(e.advanceCents, $(200));
  });

  test('future-dated entries are ignored for earlier dates', () => {
    const s = state({ payments: [pay('2027-02-01', 999)], adjustments: [adj('2027-02-01', 5)] });
    assert.equal(bal(s, '2027-01-31'), $(2400));
  });

  test('ledger running balance matches the formula on every day', () => {
    const s = state({
      opening: 75,
      payments: [pay('2026-11-03', 120.1), pay('2026-12-31', 900, 450, 450), pay('2027-01-17', 33.33, 33.33, 0)],
      adjustments: [adj('2026-12-01', -10.01)],
    });
    for (let d = '2026-11-01'; d <= '2027-02-28'; d = nextDay(d)) {
      const p = positionAsOf(s, d); // throws internally on any mismatch
      assert.ok(Number.isSafeInteger(p.balanceCents));
    }
  });
});

/* ------------------------------------------------------------------ */
describe('Monthly statements', () => {
  test('opening/closing chain and month figures', () => {
    const s = state({
      opening: 100,
      payments: [pay('2026-11-15', 300), pay('2026-12-15', 500, 200, 300)],
      adjustments: [adj('2026-12-20', -25)],
    });
    const m = monthlyStatements(s, '2027-01-10', '2027-01-10');
    assert.deepEqual(m.map((x) => x.month), ['2026-11', '2026-12', '2027-01']);
    const [nov, dec, jan] = m;
    assert.equal(nov.openingCents, $(100));
    assert.equal(nov.closingCents, $(100 + 800 - 300));
    assert.equal(dec.openingCents, nov.closingCents);
    assert.equal(dec.paymentsCents, $(500));
    assert.equal(dec.smartOfficeCents, $(200));
    assert.equal(dec.classSolutionCents, $(300));
    assert.equal(dec.adjustmentsCents, -$(25));
    assert.equal(dec.closingCents, $(600 + 800 - 500 - 25));
    assert.equal(dec.closingCents, bal(s, '2026-12-31'), 'closing equals position on final day');
    assert.equal(jan.isComplete, false);
    assert.equal(jan.salaryCents, $(800), 'statement shows the month through its final day');
  });

  test('cumulative view', () => {
    const s = state({ payments: [pay('2026-11-15', 300), pay('2026-12-15', 500)] });
    const c = cumulativeStatements(s, '2026-12-31');
    assert.equal(c[1].cumulativeAccruedCents, $(1600));
    assert.equal(c[1].cumulativePaidCents, $(800));
    assert.equal(c[1].closingCents, $(800));
  });
});

/* ------------------------------------------------------------------ */
describe('Company & current month', () => {
  test('company history splits a single transfer across both companies', () => {
    const s = state({ payments: [pay('2026-11-15', 1000, 700, 300), pay('2026-11-20', 200, 200, 0)] });
    const so = companyHistory(s, 'smartOffice', '2026-12-31');
    const cs = companyHistory(s, 'classSolution', '2026-12-31');
    assert.equal(so.totalCents, $(900));
    assert.equal(so.rows.length, 2);
    assert.equal(cs.totalCents, $(300));
    assert.equal(cs.rows.length, 1);
  });

  test('current month summary', () => {
    const s = state({ payments: [pay('2026-12-15', 500)] });
    const c = currentMonthSummary(s, '2026-12-20');
    assert.equal(c.month, '2026-12');
    assert.equal(c.dueDate, '2026-12-31');
    assert.equal(c.isDue, false);
    assert.equal(c.openingCents, $(800));
    assert.equal(c.paymentsCents, $(500));
    assert.equal(c.balanceCents, $(300));
  });
});

/* ------------------------------------------------------------------ */
describe('Validation', () => {
  test('company allocations must equal the total', () => {
    assert.deepEqual(validatePayment(pay('2026-11-15', 500, 300, 200), DEFAULT_CONFIG), []);
    const bad = { ...pay('2026-11-15', 500), smartOfficeCents: 30000, classSolutionCents: 10000 };
    assert.match(validatePayment(bad, DEFAULT_CONFIG).join(), /add up/);
  });
  test('rejects zero, negative, invalid date, pre-start date', () => {
    assert.ok(validatePayment(pay('2026-11-15', 0), DEFAULT_CONFIG).length);
    assert.ok(validatePayment({ ...pay('2026-11-15', 5), smartOfficeCents: -100, classSolutionCents: 600 }, DEFAULT_CONFIG).length);
    assert.ok(validatePayment(pay('2026-02-30', 5), DEFAULT_CONFIG).length);
    assert.ok(validatePayment(pay('2026-10-31', 5), DEFAULT_CONFIG).length);
  });
  test('adjustment needs non-zero amount and a reason', () => {
    assert.deepEqual(validateAdjustment(adj('2026-11-20', -10, 'Correction'), DEFAULT_CONFIG), []);
    assert.ok(validateAdjustment(adj('2026-11-20', 0), DEFAULT_CONFIG).length);
    assert.ok(validateAdjustment(adj('2026-11-20', 10, '  '), DEFAULT_CONFIG).length);
  });
  test('config validation', () => {
    assert.deepEqual(validateConfig(DEFAULT_CONFIG), []);
    assert.ok(validateConfig({ ...DEFAULT_CONFIG, openingBalanceCents: 1.5 }).length);
  });
});

/* ------------------------------------------------------------------ */
describe('Money & dates', () => {
  test('parseToCents', () => {
    assert.equal(parseToCents('1,000'), 100000);
    assert.equal(parseToCents('$300.5'), 30050);
    assert.equal(parseToCents('0.1'), 10);
    assert.equal(parseToCents('-200'), -20000);
    assert.equal(parseToCents('.25'), 25);
    assert.equal(parseToCents('12.345'), null);
    assert.equal(parseToCents('abc'), null);
    assert.equal(parseToCents(''), null);
    assert.equal(parseToCents('-0'), 0);
  });
  test('no floating-point drift: 0.1 + 0.2', () => {
    assert.equal(parseToCents('0.1') + parseToCents('0.2'), parseToCents('0.3'));
  });
  test('formatCents', () => {
    assert.equal(formatCents(123456789), '$1,234,567.89');
    assert.equal(formatCents(-20000), '-$200.00');
    assert.equal(formatCents(5, { sign: 'always' }), '+$0.05');
    assert.equal(centsToPlain(-5), '-0.05');
  });
  test('dates', () => {
    assert.equal(monthEnd('2026-11'), '2026-11-30');
    assert.equal(monthEnd('2027-02'), '2027-02-28');
    assert.equal(addMonths('2026-12', 1), '2027-01');
    assert.equal(addMonths('2027-01', -1), '2026-12');
    assert.deepEqual(monthRange('2026-11', '2027-01'), ['2026-11', '2026-12', '2027-01']);
    assert.equal(isValidDate('2027-02-29'), false);
    assert.equal(previousDay('2027-01-01'), '2026-12-31');
  });
});

function nextDay(d) {
  const [y, m, day] = d.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, day + 1));
  return t.toISOString().slice(0, 10);
}
