import type { Language, Plural } from './types';

/** CLDR plural category selection without relying on Intl.PluralRules (not guaranteed on every JS engine). */
export function pluralCategory(lang: Language, n: number): keyof Plural {
  const abs = Math.abs(n);
  if (lang === 'ar') {
    if (abs === 0) return 'zero';
    if (abs === 1) return 'one';
    if (abs === 2) return 'two';
    const mod100 = abs % 100;
    if (mod100 >= 3 && mod100 <= 10) return 'few';
    if (mod100 >= 11 && mod100 <= 99) return 'many';
    return 'other';
  }
  return abs === 1 ? 'one' : 'other';
}

export function selectPlural(lang: Language, entry: Plural, n: number): string {
  const cat = pluralCategory(lang, n);
  return entry[cat] ?? entry.other;
}
