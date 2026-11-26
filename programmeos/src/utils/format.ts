import type { Money } from '@/data/models';

/** Thousands separators without relying on Intl (consistent across Hermes / web). */
export function groupDigits(n: number): string {
  const neg = n < 0;
  const s = Math.round(Math.abs(n)).toString();
  const out = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return neg ? `−${out}` : out;
}

/** $486,000 */
export function money(n: Money): string {
  const neg = n < 0;
  return `${neg ? '−' : ''}$${groupDigits(Math.abs(n))}`;
}

/** $486K · $1.24M · $920 */
export function moneyCompact(n: Money): string {
  const neg = n < 0;
  const a = Math.abs(n);
  let s: string;
  if (a >= 1_000_000) s = `$${trimZeros((a / 1_000_000).toFixed(a >= 10_000_000 ? 1 : 2))}M`;
  else if (a >= 10_000) s = `$${Math.round(a / 1000)}K`;
  else if (a >= 1000) s = `$${trimZeros((a / 1000).toFixed(1))}K`;
  else s = `$${Math.round(a)}`;
  return neg ? `−${s}` : s;
}

function trimZeros(s: string) {
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

export function percent(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`;
}

export function ratio(part: number, whole: number): number {
  if (!whole) return 0;
  return (part / whole) * 100;
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

export function initialsOf(name: string) {
  const parts = name.replace(/^(Prof\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function fileSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

export function signed(n: number, fmt: (n: number) => string = (x) => String(x)) {
  if (n > 0) return `+${fmt(n)}`;
  if (n < 0) return `−${fmt(Math.abs(n))}`;
  return fmt(0);
}

let idCounter = 1000;
export function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${idCounter.toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

export function searchMatch(query: string, ...fields: (string | undefined | null)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = fields.filter(Boolean).join(' ').toLowerCase();
  return q.split(/\s+/).every((token) => hay.includes(token));
}
