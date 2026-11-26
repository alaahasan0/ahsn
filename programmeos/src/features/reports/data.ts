import { revenueByMonth } from '@/data/mock';
import type { DB } from '@/data/store';
import type { DeliveryMode, ProgrammeType } from '@/data/models';
import { getClient, programmeFinance, programmePhase } from '@/data/selectors';

/**
 * Reporting dataset. Live records come from the store; history before the sample
 * scenario (programmes delivered in 2026) is summarised here so 12-month views are
 * meaningful. All figures are illustrative.
 */

export type PeriodKey = 'q1' | 'ytd' | '12m';

export const PERIODS: Record<PeriodKey, { label: string; caption: string; from: string; to: string; months: string[] }> = {
  q1: { label: 'Q1', caption: 'Q1 2027 · 1 Jan – 31 Mar', from: '2027-01-01', to: '2027-03-31', months: ['Jan', 'Feb', 'Mar'] },
  ytd: { label: 'YTD', caption: 'FY2027 to date · 1 Oct 2026 – 29 Mar 2027', from: '2026-10-01', to: '2027-03-31', months: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'] },
  '12m': { label: '12M', caption: 'Last 12 months · Apr 2026 – Mar 2027', from: '2026-04-01', to: '2027-03-31', months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'] },
};

const EARLIER: { month: string; revenue: number; costs: number; plan: number }[] = [
  { month: 'Apr', revenue: 118_000, costs: 79_000, plan: 120_000 },
  { month: 'May', revenue: 276_000, costs: 177_000, plan: 260_000 },
  { month: 'Jun', revenue: 184_000, costs: 116_000, plan: 200_000 },
  { month: 'Jul', revenue: 152_000, costs: 96_000, plan: 150_000 },
  { month: 'Aug', revenue: 64_000, costs: 47_000, plan: 80_000 },
  { month: 'Sep', revenue: 226_000, costs: 148_000, plan: 210_000 },
];

export function monthlySeries(period: PeriodKey) {
  const all = [...EARLIER, ...revenueByMonth.filter((m) => m.revenue > 0)];
  const months = PERIODS[period].months;
  return all.filter((m, i) => months.includes(m.month) && (period !== '12m' || i < 12)).slice(-months.length);
}

export type ProgrammeStat = {
  id?: string; // present when the programme is a live record (drill-down available)
  name: string;
  short: string;
  client: string;
  clientId?: string;
  mode: DeliveryMode;
  type: ProgrammeType;
  start: string;
  end: string;
  contract: number;
  cost: number; // forecast or final cost
  margin: number;
  marginPct: number;
  participants: number;
  completed: number;
  attendance: number; // %
  satisfaction?: number;
  nps?: number;
  readinessAtT14?: number;
  phase: 'upcoming' | 'in_delivery' | 'completed';
};

const HISTORY: Omit<ProgrammeStat, 'margin' | 'marginPct' | 'phase'>[] = [
  { name: 'Innovation Bootcamp', short: 'IB', client: 'Halden', mode: 'Virtual', type: 'Multi-Week Programme', start: '2026-04-20', end: '2026-05-15', contract: 124_000, cost: 79_000, participants: 22, completed: 20, attendance: 84, satisfaction: 4.2, nps: 41, readinessAtT14: 81 },
  { name: 'Strategy Sprint for Directors', short: 'SSD', client: 'NPSI', mode: 'In-person', type: '3-Day Executive Programme', start: '2026-05-17', end: '2026-05-19', contract: 152_000, cost: 98_000, participants: 18, completed: 18, attendance: 96, satisfaction: 4.4, nps: 49, readinessAtT14: 88 },
  { name: 'Digital Banking Academy', short: 'DBA', client: 'Atlas', mode: 'Virtual', type: 'Multi-Week Programme', start: '2026-06-01', end: '2026-07-10', contract: 236_000, cost: 141_000, participants: 30, completed: 27, attendance: 88, satisfaction: 4.3, nps: 44, readinessAtT14: 84 },
  { name: 'Healthcare Leadership Programme', short: 'HLP', client: 'Orion Health', mode: 'Hybrid', type: 'Multi-Week Programme', start: '2026-09-07', end: '2026-10-30', contract: 288_000, cost: 182_000, participants: 20, completed: 19, attendance: 91, satisfaction: 4.5, nps: 55, readinessAtT14: 92 },
  { name: 'Leadership Essentials', short: 'LE', client: 'Meridian', mode: 'In-person', type: '5-Day Residential Programme', start: '2026-10-12', end: '2026-10-16', contract: 312_000, cost: 201_000, participants: 24, completed: 24, attendance: 95, satisfaction: 4.6, nps: 57, readinessAtT14: 94 },
  { name: 'Board Effectiveness Masterclass', short: 'BEM', client: 'Atlas', mode: 'In-person', type: '3-Day Executive Programme', start: '2026-12-07', end: '2026-12-09', contract: 168_000, cost: 104_000, participants: 14, completed: 14, attendance: 97, satisfaction: 4.5, nps: 52, readinessAtT14: 90 },
];

/** Readiness at T-14 for live programmes already delivered (history). */
const LIVE_T14: Record<string, number> = { 'p-smp': 93, 'p-gbs': 86, 'p-ie': 91, 'p-wil': 96 };

function overlaps(a1: string, a2: string, b1: string, b2: string) {
  return a1 <= b2 && b1 <= a2;
}

export function liveStat(db: DB, id: string): ProgrammeStat {
  const p = db.programmes.find((x) => x.id === id)!;
  const f = programmeFinance(db, id);
  const ens = db.enrollments.filter((e) => e.programmeId === id && e.status !== 'Withdrawn');
  const rates = ens.filter((e) => e.attendanceRate != null).map((e) => e.attendanceRate!);
  const phase = programmePhase(p);
  const cost = Math.max(f.budget, f.committed);
  return {
    id,
    name: p.name,
    short: p.shortName,
    client: getClient(db, p.clientId)?.shortName ?? '',
    clientId: p.clientId,
    mode: p.deliveryMode,
    type: p.type,
    start: p.startDate,
    end: p.endDate,
    contract: p.contractValue,
    cost,
    margin: p.contractValue - cost,
    marginPct: p.contractValue ? ((p.contractValue - cost) / p.contractValue) * 100 : 0,
    participants: ens.length,
    completed: ens.filter((e) => e.status === 'Completed').length,
    attendance: rates.length ? rates.reduce((s, r) => s + r, 0) / rates.length : 0,
    satisfaction: p.satisfaction,
    nps: p.nps,
    readinessAtT14: LIVE_T14[id],
    phase: phase === 'upcoming' ? 'upcoming' : phase === 'in_delivery' ? 'in_delivery' : 'completed',
  };
}

/** Programmes delivered (completed or running) inside the period window. */
export function deliveredInPeriod(db: DB, period: PeriodKey): ProgrammeStat[] {
  const { from, to } = PERIODS[period];
  const live = db.programmes.filter((p) => !p.cancelled && programmePhase(p) !== 'upcoming' && overlaps(p.startDate, p.endDate, from, to)).map((p) => liveStat(db, p.id));
  const hist = HISTORY.filter((h) => overlaps(h.start, h.end, from, to)).map((h) => ({ ...h, margin: h.contract - h.cost, marginPct: ((h.contract - h.cost) / h.contract) * 100, phase: 'completed' as const }));
  return [...hist, ...live].sort((a, b) => a.start.localeCompare(b.start));
}

/** Forward book: contracted programmes not yet started (always shown, not period-bound). */
export function forwardBook(db: DB): ProgrammeStat[] {
  return db.programmes.filter((p) => !p.cancelled && programmePhase(p) === 'upcoming').map((p) => liveStat(db, p.id)).sort((a, b) => a.start.localeCompare(b.start));
}

/** Delivered in period + forward book — the portfolio a director would review. */
export function portfolioInPeriod(db: DB, period: PeriodKey) {
  return [...deliveredInPeriod(db, period), ...forwardBook(db)];
}

// ─── Period-shaped series for operational/people reports ──────────────────────

const WEEKS: Record<PeriodKey, string[]> = {
  q1: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12', 'W13'],
  ytd: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  '12m': ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
};

export function trendLabels(period: PeriodKey) {
  return WEEKS[period];
}

/** Deterministic pseudo-series around a base value. */
export function wave(period: PeriodKey, base: number, amp: number, seed = 1, drift = 0) {
  return WEEKS[period].map((_, i) => Math.round((base + Math.sin(i * 1.3 + seed) * amp + Math.cos(i * 0.7 + seed * 2) * amp * 0.4 + drift * i) * 10) / 10);
}

export const RATING_DISTRIBUTION: Record<PeriodKey, number[]> = {
  // 5★, 4★, 3★, 2★, 1★ responses
  q1: [118, 62, 14, 3, 1],
  ytd: [214, 109, 27, 6, 2],
  '12m': [389, 204, 51, 12, 4],
};

export function npsFrom(dist: number[]) {
  // Treat 5★ as promoters, 4★ passive, ≤3★ detractors (survey-mapped)
  const total = dist.reduce((s, n) => s + n, 0) || 1;
  return Math.round(((dist[0] - (dist[2] + dist[3] + dist[4])) / total) * 100);
}

/** Faculty utilisation shifts with the window (quarter vs longer horizons). */
export function utilisationFor(base: number, period: PeriodKey, idx: number) {
  if (period === 'q1') return base;
  const delta = period === 'ytd' ? ((idx * 7) % 11) - 6 : ((idx * 5) % 15) - 9;
  return Math.max(12, Math.min(98, base + delta));
}

export function shortName(name: string, max = 22) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}
