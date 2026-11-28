import type { CountryCode, PhoneNumber } from '@/types/models';

export const COUNTRY_CODES: { code: CountryCode; flag: string; key: 'ps' | 'il' | 'jo'; example: string }[] = [
  { code: '+970', flag: '🇵🇸', key: 'ps', example: '59 912 3456' },
  { code: '+972', flag: '🇵🇸', key: 'il', example: '52 345 6789' },
  { code: '+962', flag: '🇯🇴', key: 'jo', example: '79 123 4567' },
];

/** Strip spaces, a leading 0 and an included country code. Accepts local "0599 123 456" input. */
export function normalizeNational(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('970') || digits.startsWith('972') || digits.startsWith('962')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, 9);
}

/** Prototype-level format check only. Real validation (and WhatsApp lookup) happens server-side later. */
export function isValidMobile(p: PhoneNumber): boolean {
  const n = normalizeNational(p.number);
  if (n.length !== 9) return false;
  if (p.country === '+970') return /^5[69]/.test(n);
  if (p.country === '+972') return /^5[0-8]/.test(n);
  return /^7[789]/.test(n);
}

export function phonesEqual(a?: PhoneNumber, b?: PhoneNumber): boolean {
  if (!a || !b) return false;
  return a.country === b.country && normalizeNational(a.number) === normalizeNational(b.number);
}

export function phoneSearchText(p?: PhoneNumber): string {
  if (!p) return '';
  const n = normalizeNational(p.number);
  return `${p.country}${n} 0${n} ${n}`;
}
