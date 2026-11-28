/**
 * Demo clock. The prototype pins "now" to 2:20 PM today so the salon always looks mid-shift
 * when a stakeholder opens it (current customer, next customer, a partly completed day).
 * Replace with `new Date()` once real data exists.
 */
const real = new Date();
export const DEMO_NOW = new Date(real.getFullYear(), real.getMonth(), real.getDate(), 14, 20, 0, 0);

export function now(): Date {
  return new Date(DEMO_NOW);
}

export function today(): Date {
  const d = new Date(DEMO_NOW);
  d.setHours(0, 0, 0, 0);
  return d;
}
