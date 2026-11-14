/*
 * Money helpers. Every amount in the app is an integer number of cents.
 * Never use floating-point dollars for arithmetic.
 */

/** Throws unless value is a safe integer (cents). */
export function assertCents(value, label = 'amount') {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`${label} must be an integer number of cents, got ${value}`);
  }
  return value;
}

/**
 * Parse user input such as "1,000", "300.5", "$12.34", "-200" into cents.
 * Returns null for empty or invalid input. Accepts at most 2 decimal places.
 */
export function parseToCents(input) {
  if (typeof input === 'number') {
    if (!Number.isFinite(input)) return null;
    input = input.toFixed(2);
  }
  if (typeof input !== 'string') return null;
  const s = input.trim().replace(/[$,\s]/g, '').replace(/^USD/i, '');
  const m = /^([+-])?(\d+)?(?:\.(\d{0,2}))?$/.exec(s);
  if (!m || (m[2] === undefined && !m[3])) return null;
  const sign = m[1] === '-' ? -1 : 1;
  const whole = Number(m[2] || '0');
  const frac = Number((m[3] || '').padEnd(2, '0'));
  const cents = whole * 100 + frac;
  if (!Number.isSafeInteger(cents)) return null;
  return sign * cents || 0; // avoid -0
}

/** Cents -> "1234.56" (no symbol, no grouping) for inputs and CSV. */
export function centsToPlain(cents) {
  assertCents(cents);
  const neg = cents < 0;
  const abs = Math.abs(cents);
  return `${neg ? '-' : ''}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

/**
 * Cents -> "$1,234.56".
 * options.sign: 'auto' (default, "-$200.00"), 'always' ("+$200.00"), 'never' ("$200.00")
 */
export function formatCents(cents, { sign = 'auto', symbol = '$' } = {}) {
  assertCents(cents);
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const body = `${symbol}${dollars}.${String(abs % 100).padStart(2, '0')}`;
  if (sign === 'never' || cents === 0) return body;
  if (cents < 0) return `-${body}`;
  return sign === 'always' ? `+${body}` : body;
}

export const sumCents = (values) => values.reduce((a, b) => a + assertCents(b), 0);
