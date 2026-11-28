import type { ISODate, RecurringSeries } from '@/types/models';

import { addDays, addMonths, atClock, fromISODate, isSameDay, startOfDay, toISODate } from './dates';

/** Step between occurrences, in weeks (monthly handled separately). */
export function intervalWeeks(series: Pick<RecurringSeries, 'frequency' | 'intervalWeeks'>): number {
  if (series.frequency === 'weekly') return 1;
  if (series.frequency === 'biweekly') return 2;
  if (series.frequency === 'custom') return Math.max(1, series.intervalWeeks);
  return 0;
}

/** First occurrence on/after the start date that falls on the series weekday. */
function firstOccurrence(series: RecurringSeries): Date {
  const start = fromISODate(series.startDate);
  const diff = (series.weekday - start.getDay() + 7) % 7;
  return addDays(start, diff);
}

/**
 * Occurrence dates (at series time) within [from, to]. Skipped dates are excluded;
 * pause windows are excluded; holidays are excluded when `excludeHolidays`.
 */
export function seriesOccurrences(series: RecurringSeries, from: Date, to: Date, holidays: ISODate[] = []): Date[] {
  const out: Date[] = [];
  const end = series.endDate ? fromISODate(series.endDate) : null;
  const limit = series.occurrenceLimit ?? Infinity;
  let cursor = firstOccurrence(series);
  let index = 0;
  let guard = 0;
  const step = intervalWeeks(series);
  const first = new Date(cursor);
  while (guard++ < 400) {
    if (end && cursor > end) break;
    if (index >= limit) break;
    if (cursor > to) break;
    const iso = toISODate(cursor);
    const skipped = series.skippedDates.includes(iso);
    const holiday = series.excludeHolidays && holidays.includes(iso);
    const paused = series.status === 'paused' && (!series.pausedUntil || iso <= series.pausedUntil);
    if (cursor >= startOfDay(from) && !skipped && !holiday && !paused && series.status !== 'ended') {
      out.push(atClock(cursor, series.time));
    }
    index += 1;
    if (step > 0) cursor = addDays(cursor, step * 7);
    else {
      // Monthly: same weekday, same week-of-month as the first occurrence (e.g. "first Saturday").
      const weekOfMonth = Math.floor((first.getDate() - 1) / 7);
      const nextMonth = addMonths(new Date(cursor.getFullYear(), cursor.getMonth(), 1), 1);
      const offset = (series.weekday - nextMonth.getDay() + 7) % 7;
      cursor = addDays(nextMonth, offset + weekOfMonth * 7);
    }
  }
  return out;
}

export function nextOccurrences(series: RecurringSeries, from: Date, count: number, holidays: ISODate[] = []): Date[] {
  return seriesOccurrences(series, from, addDays(from, 400), holidays).slice(0, count);
}

export function occursOn(series: RecurringSeries, day: Date, holidays: ISODate[] = []): boolean {
  return seriesOccurrences(series, startOfDay(day), addDays(startOfDay(day), 1), holidays).some((d) => isSameDay(d, day));
}
