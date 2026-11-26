import type { ISODate, ISODateTime, TimeOfDay, TimeZoneId } from '@/data/models';

/**
 * Date utilities that never depend on the device clock or locale/ICU time-zone data.
 * The prototype runs on a fixed "today" so the sample scenario stays coherent.
 */
export const DEMO_TODAY: ISODate = '2027-03-29'; // Monday
export const DEMO_NOW: ISODateTime = '2027-03-29T08:40';

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAYS_SHORT = WEEKDAYS.map((d) => d.slice(0, 3));
export const WEEKDAYS_MIN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export type TimeZoneInfo = { id: TimeZoneId; abbr: string; offset: number; city: string; label: string };

/** Fixed offsets valid for the 2027 scenario (London on BST from 28 March 2027). */
export const TIMEZONES: Record<TimeZoneId, TimeZoneInfo> = {
  'Asia/Dubai': { id: 'Asia/Dubai', abbr: 'GST', offset: 4, city: 'Dubai', label: 'Gulf Standard Time' },
  'Asia/Singapore': { id: 'Asia/Singapore', abbr: 'SGT', offset: 8, city: 'Singapore', label: 'Singapore Time' },
  'Europe/London': { id: 'Europe/London', abbr: 'BST', offset: 1, city: 'London', label: 'British Summer Time' },
  'Asia/Riyadh': { id: 'Asia/Riyadh', abbr: 'AST', offset: 3, city: 'Riyadh', label: 'Arabia Standard Time' },
  'Asia/Kolkata': { id: 'Asia/Kolkata', abbr: 'IST', offset: 5.5, city: 'Mumbai', label: 'India Standard Time' },
  'America/New_York': { id: 'America/New_York', abbr: 'EDT', offset: -4, city: 'New York', label: 'Eastern Daylight Time' },
};

export function parseDate(d: ISODate): { y: number; m: number; day: number } {
  const [y, m, day] = d.split('-').map(Number);
  return { y, m, day };
}

/** Days since 1970-01-01 (UTC), computed arithmetically. */
export function toDayNumber(d: ISODate): number {
  const { y, m, day } = parseDate(d);
  return Math.floor(Date.UTC(y, m - 1, day) / 86400000);
}

export function fromDayNumber(n: number): ISODate {
  const dt = new Date(n * 86400000);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(d: ISODate, n: number): ISODate {
  return fromDayNumber(toDayNumber(d) + n);
}

export function diffDays(a: ISODate, b: ISODate): number {
  return toDayNumber(a) - toDayNumber(b);
}

export function weekday(d: ISODate): number {
  return new Date(toDayNumber(d) * 86400000).getUTCDay();
}

export function startOfWeek(d: ISODate, weekStartsOn: 0 | 1 = 1): ISODate {
  const wd = weekday(d);
  const delta = (wd - weekStartsOn + 7) % 7;
  return addDays(d, -delta);
}

export function startOfMonth(d: ISODate): ISODate {
  const { y, m } = parseDate(d);
  return `${y}-${String(m).padStart(2, '0')}-01`;
}

export function addMonths(d: ISODate, n: number): ISODate {
  const { y, m } = parseDate(d);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, '0')}-01`;
}

export function daysInMonth(d: ISODate): number {
  const { y, m } = parseDate(d);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** 6×7 grid of dates for a month view, weeks starting Monday. */
export function monthMatrix(monthStart: ISODate): ISODate[][] {
  const first = startOfMonth(monthStart);
  const gridStart = startOfWeek(first, 1);
  const weeks: ISODate[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: ISODate[] = [];
    for (let i = 0; i < 7; i++) row.push(addDays(gridStart, w * 7 + i));
    weeks.push(row);
  }
  return weeks;
}

export function sameMonth(a: ISODate, b: ISODate) {
  return a.slice(0, 7) === b.slice(0, 7);
}

export function isBetween(d: ISODate, from: ISODate, to: ISODate) {
  return d >= from && d <= to;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/** 12 Apr 2027 */
export function formatDate(d: ISODate, opts: { year?: boolean; weekday?: boolean } = { year: true }): string {
  const { y, m, day } = parseDate(d);
  const base = `${day} ${MONTHS_SHORT[m - 1]}`;
  const wd = opts.weekday ? `${WEEKDAYS_SHORT[weekday(d)]}, ` : '';
  return `${wd}${base}${opts.year === false ? '' : ` ${y}`}`;
}

/** 12 April 2027 */
export function formatDateLong(d: ISODate, withWeekday = false): string {
  const { y, m, day } = parseDate(d);
  return `${withWeekday ? `${WEEKDAYS[weekday(d)]}, ` : ''}${day} ${MONTHS[m - 1]} ${y}`;
}

export function formatMonthYear(d: ISODate): string {
  const { y, m } = parseDate(d);
  return `${MONTHS[m - 1]} ${y}`;
}

/** 12–16 Apr 2027 · 28 Mar – 2 Apr 2027 · 15 Feb – 30 Jul 2027 */
export function formatRange(from: ISODate, to: ISODate): string {
  const a = parseDate(from);
  const b = parseDate(to);
  if (from === to) return formatDate(from);
  if (a.y === b.y && a.m === b.m) return `${a.day}–${b.day} ${MONTHS_SHORT[a.m - 1]} ${a.y}`;
  if (a.y === b.y) return `${a.day} ${MONTHS_SHORT[a.m - 1]} – ${b.day} ${MONTHS_SHORT[b.m - 1]} ${a.y}`;
  return `${formatDate(from)} – ${formatDate(to)}`;
}

export function durationDays(from: ISODate, to: ISODate) {
  return diffDays(to, from) + 1;
}

export function durationLabel(from: ISODate, to: ISODate): string {
  const days = durationDays(from, to);
  if (days <= 10) return `${days} day${days === 1 ? '' : 's'}`;
  const weeks = Math.round(days / 7);
  if (days <= 70) return `${weeks} weeks`;
  return `${Math.round(days / 30.4)} months`;
}

/** "Today", "Tomorrow", "In 14 days", "3 days ago" */
export function relativeDay(d: ISODate, today: ISODate = DEMO_TODAY): string {
  const n = diffDays(d, today);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n > 1 && n < 7) return WEEKDAYS[weekday(d)];
  if (n > 0) return `In ${n} days`;
  return `${-n} days ago`;
}

/** Due-date phrasing for tasks: "Due today", "Overdue by 2 days", "Due Thu", "Due 12 Apr" */
export function dueLabel(d: ISODate, today: ISODate = DEMO_TODAY): { text: string; tone: 'danger' | 'warning' | 'neutral' } {
  const n = diffDays(d, today);
  if (n < 0) return { text: `Overdue ${-n}d`, tone: 'danger' };
  if (n === 0) return { text: 'Due today', tone: 'warning' };
  if (n === 1) return { text: 'Due tomorrow', tone: 'warning' };
  if (n < 7) return { text: `Due ${WEEKDAYS_SHORT[weekday(d)]}`, tone: 'neutral' };
  return { text: `Due ${formatDate(d, { year: false })}`, tone: 'neutral' };
}

export function countdown(d: ISODate, today: ISODate = DEMO_TODAY): string {
  const n = diffDays(d, today);
  if (n === 0) return 'Starts today';
  if (n > 0) return `Starts in ${n} day${n === 1 ? '' : 's'}`;
  return `Started ${-n} day${n === -1 ? '' : 's'} ago`;
}

// ─── Times & zones ────────────────────────────────────────────────────────────

export function minutesOf(t: TimeOfDay): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function timeFromMinutes(total: number): TimeOfDay {
  const t = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

export function formatTime(t: TimeOfDay): string {
  return t;
}

export function formatTimeRange(a: TimeOfDay, b: TimeOfDay) {
  return `${a}–${b}`;
}

export function durationMinutesLabel(a: TimeOfDay, b: TimeOfDay) {
  const mins = minutesOf(b) - minutesOf(a);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Absolute minutes (UTC) — used for conflict detection across time zones. */
export function absoluteMinutes(date: ISODate, time: TimeOfDay, tz: TimeZoneId): number {
  return toDayNumber(date) * 1440 + minutesOf(time) - TIMEZONES[tz].offset * 60;
}

/** Convert a local date/time from one zone into another. */
export function convertZone(date: ISODate, time: TimeOfDay, from: TimeZoneId, to: TimeZoneId): { date: ISODate; time: TimeOfDay } {
  const abs = absoluteMinutes(date, time, from) + TIMEZONES[to].offset * 60;
  const day = Math.floor(abs / 1440);
  return { date: fromDayNumber(day), time: timeFromMinutes(abs - day * 1440) };
}

export function tzAbbr(tz: TimeZoneId) {
  return TIMEZONES[tz].abbr;
}

export function tzOffsetLabel(tz: TimeZoneId) {
  const o = TIMEZONES[tz].offset;
  const sign = o >= 0 ? '+' : '−';
  const abs = Math.abs(o);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

// ─── Date-times (activity, messages) ──────────────────────────────────────────

export function splitDateTime(dt: ISODateTime): { date: ISODate; time: TimeOfDay } {
  const [date, time = '00:00'] = dt.split('T');
  return { date, time: time.slice(0, 5) };
}

/** "08:12", "Yesterday", "Fri", "12 Mar" — inbox-style timestamp */
export function inboxStamp(dt: ISODateTime, today: ISODate = DEMO_TODAY): string {
  const { date, time } = splitDateTime(dt);
  const n = diffDays(today, date);
  if (n === 0) return time;
  if (n === 1) return 'Yesterday';
  if (n < 7 && n > 0) return WEEKDAYS_SHORT[weekday(date)];
  return formatDate(date, { year: false });
}

/** "Today at 08:12", "Yesterday at 17:40", "12 Mar at 09:00" */
export function activityStamp(dt: ISODateTime, today: ISODate = DEMO_TODAY): string {
  const { date, time } = splitDateTime(dt);
  const n = diffDays(today, date);
  if (n === 0) return `Today at ${time}`;
  if (n === 1) return `Yesterday at ${time}`;
  return `${formatDate(date, { year: false })} at ${time}`;
}

export function timeAgo(dt: ISODateTime, now: ISODateTime = DEMO_NOW): string {
  const a = splitDateTime(dt);
  const b = splitDateTime(now);
  const mins = (toDayNumber(b.date) - toDayNumber(a.date)) * 1440 + minutesOf(b.time) - minutesOf(a.time);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  const d = Math.floor(mins / 1440);
  if (d < 7) return `${d}d ago`;
  return formatDate(a.date, { year: false });
}

export function greeting(time: TimeOfDay = splitDateTime(DEMO_NOW).time) {
  const h = Number(time.slice(0, 2));
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
