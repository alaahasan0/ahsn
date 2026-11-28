/**
 * Analytics computed from the in-memory appointments. In production these become SQL
 * aggregates (views / RPCs) — the shape of `PeriodReport` is the contract the screen uses.
 */
import { now, today } from '@/lib/clock';
import { addDays, startOfDay, startOfMonth } from '@/lib/dates';
import { summarizeDay } from '@/store/selectors';
import type { AppState } from '@/store/AppStore';
import type { Appointment, BookingSource, ID } from '@/types/models';

export type PeriodKey = 'day' | 'week' | 'month' | 'custom';
export type CustomPreset = 'last7' | 'last14' | 'last30' | 'last60' | 'thisMonth';

export interface Range {
  from: Date; // inclusive, start of day
  to: Date; // exclusive
  bucket: 'hour' | 'day' | 'week';
}

export function rangeFor(period: PeriodKey, preset: CustomPreset = 'last14'): Range {
  const t = today();
  const end = addDays(t, 1);
  if (period === 'day') return { from: t, to: end, bucket: 'hour' };
  if (period === 'week') return { from: addDays(t, -6), to: end, bucket: 'day' };
  if (period === 'month') return { from: addDays(t, -29), to: end, bucket: 'day' };
  switch (preset) {
    case 'last7':
      return { from: addDays(t, -6), to: end, bucket: 'day' };
    case 'last14':
      return { from: addDays(t, -13), to: end, bucket: 'day' };
    case 'last30':
      return { from: addDays(t, -29), to: end, bucket: 'day' };
    case 'last60':
      return { from: addDays(t, -59), to: end, bucket: 'week' };
    case 'thisMonth':
      return { from: startOfMonth(t), to: end, bucket: 'day' };
  }
}

export function previousRange(r: Range): Range {
  const len = Math.round((r.to.getTime() - r.from.getTime()) / 86_400_000);
  return { from: addDays(r.from, -len), to: r.from, bucket: r.bucket };
}

export interface Bucket {
  key: string;
  start: Date;
  appointments: number;
  revenue: number;
}

export interface PeriodReport {
  range: Range;
  total: number;
  completed: number;
  cancelled: number;
  noShows: number;
  noShowRate: number;
  revenue: number;
  avgTicket: number;
  occupancy: number;
  customersServed: number;
  newCustomers: number;
  returningCustomers: number;
  retention: number;
  sources: { source: BookingSource; count: number }[];
  barbers: { barberId: ID; completed: number; revenue: number; noShows: number; occupancy: number }[];
  services: { serviceId: ID; count: number; revenue: number }[];
  buckets: Bucket[];
}

const inRange = (a: Appointment, r: Range, until: Date) => {
  const s = new Date(a.start);
  return s >= r.from && s < r.to && s <= until && a.status !== 'rescheduled';
};

export function computeReport(state: Pick<AppState, 'appointments' | 'barbers'>, range: Range): PeriodReport {
  const current = now();
  const list = state.appointments.filter((a) => inRange(a, range, current));
  const completed = list.filter((a) => a.status === 'completed');
  const noShows = list.filter((a) => a.status === 'no_show').length;
  const cancelled = list.filter((a) => a.status === 'cancelled').length;
  const revenue = completed.reduce((s, a) => s + a.price, 0);

  // Occupancy: mean daily occupancy over the days in range up to today.
  const days: Date[] = [];
  for (let d = new Date(range.from); d < range.to && d <= current; d = addDays(d, 1)) days.push(new Date(d));
  const occ = days.map((d) => summarizeDay(state, d));
  const capacity = occ.reduce((s, o) => s + o.capacityMinutes, 0);
  const booked = occ.reduce((s, o) => s + o.bookedMinutes, 0);

  // Customers: returning = had a completed visit before the range.
  const served = new Set(completed.map((a) => a.customerId));
  const firstVisit = new Map<string, number>();
  for (const a of state.appointments) {
    if (a.status !== 'completed') continue;
    const tms = new Date(a.start).getTime();
    const prev = firstVisit.get(a.customerId);
    if (prev === undefined || tms < prev) firstVisit.set(a.customerId, tms);
  }
  let returning = 0;
  served.forEach((c) => {
    if ((firstVisit.get(c) ?? Infinity) < range.from.getTime()) returning += 1;
  });

  // Retention: share of previous-period customers who came back in this period.
  const prev = previousRange(range);
  const prevServed = new Set(state.appointments.filter((a) => a.status === 'completed' && inRange(a, prev, current)).map((a) => a.customerId));
  const retained = [...prevServed].filter((c) => served.has(c)).length;

  const sourceMap = new Map<BookingSource, number>();
  list.forEach((a) => sourceMap.set(a.source, (sourceMap.get(a.source) ?? 0) + 1));

  const barbers = state.barbers.map((b) => {
    const mine = list.filter((a) => a.barberId === b.id);
    const done = mine.filter((a) => a.status === 'completed');
    const cap = occ.length ? days.reduce((s, d) => s + summarizeDay(state, d, [b.id]).occupancy, 0) / days.length : 0;
    return { barberId: b.id, completed: done.length, revenue: done.reduce((s, a) => s + a.price, 0), noShows: mine.filter((a) => a.status === 'no_show').length, occupancy: cap };
  });

  const svcMap = new Map<string, { count: number; revenue: number }>();
  completed.forEach((a) => {
    const e = svcMap.get(a.serviceId) ?? { count: 0, revenue: 0 };
    e.count += 1;
    e.revenue += a.price;
    svcMap.set(a.serviceId, e);
  });

  return {
    range,
    total: list.length,
    completed: completed.length,
    cancelled,
    noShows,
    noShowRate: completed.length + noShows ? noShows / (completed.length + noShows) : 0,
    revenue,
    avgTicket: completed.length ? revenue / completed.length : 0,
    occupancy: capacity ? booked / capacity : 0,
    customersServed: served.size,
    newCustomers: served.size - returning,
    returningCustomers: returning,
    retention: prevServed.size ? retained / prevServed.size : 0,
    sources: [...sourceMap.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
    barbers: barbers.sort((a, b) => b.revenue - a.revenue),
    services: [...svcMap.entries()].map(([serviceId, v]) => ({ serviceId, ...v })).sort((a, b) => b.revenue - a.revenue),
    buckets: buildBuckets(list, range),
  };
}

function buildBuckets(list: Appointment[], r: Range): Bucket[] {
  const out: Bucket[] = [];
  if (r.bucket === 'hour') {
    for (let h = 9; h <= 21; h++) {
      const start = new Date(r.from);
      start.setHours(h);
      const items = list.filter((a) => new Date(a.start).getHours() === h && a.status !== 'cancelled');
      out.push({ key: `h${h}`, start, appointments: items.length, revenue: items.filter((a) => a.status === 'completed').reduce((s, a) => s + a.price, 0) });
    }
    return out;
  }
  const step = r.bucket === 'week' ? 7 : 1;
  for (let d = startOfDay(r.from); d < r.to; d = addDays(d, step)) {
    const end = addDays(d, step);
    const items = list.filter((a) => {
      const s = new Date(a.start);
      return s >= d && s < end && a.status !== 'cancelled';
    });
    out.push({ key: d.toISOString(), start: new Date(d), appointments: items.length, revenue: items.filter((a) => a.status === 'completed').reduce((s, a) => s + a.price, 0) });
  }
  return out;
}

/** Relative change, e.g. 0.12 for +12%. Undefined when there is no baseline. */
export function delta(current: number, previous: number): number | undefined {
  if (!previous) return undefined;
  return (current - previous) / previous;
}
