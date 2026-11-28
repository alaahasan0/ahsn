/** Small, dependency-free date helpers operating in device local time (salon time in the prototype). */
import type { ClockTime, ISODate, Weekday } from '@/types/models';

export const MS_MIN = 60_000;
export const MS_DAY = 86_400_000;

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMinutes(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_MIN);
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Start of week. Defaults to Saturday, the usual first working day of the week in Palestine. */
export function startOfWeek(d: Date, weekStartsOn: Weekday = 6): Date {
  const x = startOfDay(d);
  const diff = (x.getDay() - weekStartsOn + 7) % 7;
  return addDays(x, -diff);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function toISODate(d: Date): ISODate {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${d.getFullYear()}-${m < 10 ? '0' : ''}${m}-${day < 10 ? '0' : ''}${day}`;
}

export function fromISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function clockToMinutes(t: ClockTime): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToClock(min: number): ClockTime {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
}

export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function atClock(day: Date, t: ClockTime): Date {
  const x = startOfDay(day);
  const min = clockToMinutes(t);
  x.setHours(Math.floor(min / 60), min % 60, 0, 0);
  return x;
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function diffInDays(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / MS_DAY);
}

export function weekdayOf(d: Date): Weekday {
  return d.getDay() as Weekday;
}

export function rangeDays(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}
