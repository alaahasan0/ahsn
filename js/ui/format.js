/* Display formatting shared by all screens. */

import { formatCents } from '../engine/money.js';
import { formatDate, formatMonth } from '../engine/dates.js';

export { formatDate, formatMonth };

/** "$1,234.56" / "−$200.00" with a true minus sign. */
export const money = (cents, opts) => formatCents(cents, opts).replace(/^-/, '−');

/** Always shows a sign: "+$800.00" / "−$300.00". */
export const signed = (cents) => money(cents, { sign: 'always' });

/** Plain-language status of an outstanding balance. */
export function balanceStatus(cents) {
  if (cents > 0) return { key: 'owed', label: 'Owed to you', tone: 'owed' };
  if (cents < 0) return { key: 'advance', label: 'Advance credit', tone: 'advance' };
  return { key: 'settled', label: 'Fully settled', tone: 'settled' };
}

export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

/** Whole days from a to b (ISO dates). */
export function daysBetween(a, b) {
  const t = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
  return Math.round((t(b) - t(a)) / 86400000);
}
