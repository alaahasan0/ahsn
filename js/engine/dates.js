/*
 * Calendar-date helpers.
 * Dates are plain "YYYY-MM-DD" strings and months are "YYYY-MM" strings.
 * No times and no time zones, so a transfer dated 30 Nov is always 30 Nov.
 * ISO strings sort correctly with ordinary string comparison.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MONTH = /^(\d{4})-(\d{2})$/;

export function daysInMonth(year, month /* 1-12 */) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidDate(s) {
  const m = typeof s === 'string' && ISO_DATE.exec(s);
  if (!m) return false;
  const y = +m[1], mo = +m[2], d = +m[3];
  return mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}

export function isValidMonth(s) {
  const m = typeof s === 'string' && ISO_MONTH.exec(s);
  return !!m && +m[2] >= 1 && +m[2] <= 12;
}

const pad = (n, w = 2) => String(n).padStart(w, '0');

export function makeDate(year, month, day) {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

export function makeMonth(year, month) {
  return `${pad(year, 4)}-${pad(month)}`;
}

/** "2026-11-15" -> "2026-11" */
export const monthOf = (date) => date.slice(0, 7);

export function parseMonth(month) {
  return { year: +month.slice(0, 4), month: +month.slice(5, 7) };
}

/** Salary due date: last calendar day of the month. "2026-11" -> "2026-11-30" */
export function monthEnd(month) {
  const { year, month: m } = parseMonth(month);
  return makeDate(year, m, daysInMonth(year, m));
}

export const monthStart = (month) => `${month}-01`;

export function addMonths(month, n) {
  const { year, month: m } = parseMonth(month);
  const idx = year * 12 + (m - 1) + n;
  return makeMonth(Math.floor(idx / 12), (idx % 12) + 1);
}

/** Inclusive list of months from `from` to `to`. */
export function monthRange(from, to) {
  const out = [];
  for (let m = from; m <= to; m = addMonths(m, 1)) out.push(m);
  return out;
}

/** Day before an ISO date. */
export function previousDay(date) {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d - 1));
  return makeDate(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

/** Today's date on this device, as "YYYY-MM-DD". */
export function todayISO(now = new Date()) {
  return makeDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

/** "2026-11" -> "November 2026" (or "Nov 2026" when short) */
export function formatMonth(month, { short = false } = {}) {
  const { year, month: m } = parseMonth(month);
  const name = MONTH_NAMES[m - 1];
  return `${short ? name.slice(0, 3) : name} ${year}`;
}

/** "2026-11-30" -> "30 Nov 2026" */
export function formatDate(date, { withYear = true } = {}) {
  const [y, m, d] = date.split('-').map(Number);
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3)}${withYear ? ` ${y}` : ''}`;
}
