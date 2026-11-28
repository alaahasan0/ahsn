import { createContext, useCallback, useContext, useEffect, useMemo, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { usePreferences } from '@/store/preferences';

import type { Dictionary, TKey, TPluralKey } from './dictionary';
import { createFormatters, type Formatters } from './format';
import ar from './locales/ar';
import en from './locales/en';
import { selectPlural } from './plural';
import { isRTLLanguage, type Language, type LocalizedText, type Plural } from './types';

const dictionaries: Record<Language, Dictionary> = { en: en as Dictionary, ar };

type Params = Record<string, string | number>;

export interface I18n {
  lang: Language;
  isRTL: boolean;
  /** Translate a key. `{{param}}` placeholders are interpolated. */
  t: (key: TKey, params?: Params) => string;
  /** Translate a plural key with `count`. */
  tp: (key: TPluralKey, count: number, params?: Params) => string;
  /** Pick the current language from bilingual content. */
  l: (text: LocalizedText | string | undefined | null) => string;
  f: Formatters;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18n | null>(null);

function lookup(dict: unknown, key: string): unknown {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return node;
}

function interpolate(template: string, params: Params | undefined, digits: (s: string) => string) {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const v = params[name];
    if (v === undefined) return `{{${name}}}`;
    return typeof v === 'number' ? digits(String(v)) : v;
  });
}

export function I18nProvider({ children }: PropsWithChildren) {
  const { language, digits, set } = usePreferences();
  const isRTL = isRTLLanguage(language);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
  }, [language, isRTL]);

  const f = useMemo(() => createFormatters({ lang: language, digits, currency: 'ILS' }), [language, digits]);

  const t = useCallback(
    (key: TKey, params?: Params) => {
      const value = lookup(dictionaries[language], key) ?? lookup(dictionaries.en, key);
      if (typeof value !== 'string' || value === '') {
        const fallback = lookup(dictionaries.en, key);
        if (typeof fallback === 'string' && fallback !== '') return interpolate(fallback, params, f.digits);
        if (__DEV__) console.warn(`[i18n] missing key: ${key}`);
        return key;
      }
      return interpolate(value, params, f.digits);
    },
    [language, f],
  );

  const tp = useCallback(
    (key: TPluralKey, count: number, params?: Params) => {
      const entry = (lookup(dictionaries[language], key) ?? lookup(dictionaries.en, key)) as Plural | undefined;
      if (!entry || typeof entry !== 'object') return key;
      return interpolate(selectPlural(language, entry, count), { count, ...params }, f.digits);
    },
    [language, f],
  );

  const l = useCallback((text: LocalizedText | string | undefined | null) => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[language] || text.en;
  }, [language]);

  const value = useMemo<I18n>(() => ({ lang: language, isRTL, t, tp, l, f, setLanguage: (lng) => set('language', lng) }), [language, isRTL, t, tp, l, f, set]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
