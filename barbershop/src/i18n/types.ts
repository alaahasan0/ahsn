export type Language = 'en' | 'ar';

export const LANGUAGES: { code: Language; nativeName: string; englishName: string; rtl: boolean }[] = [
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', rtl: true },
  { code: 'en', nativeName: 'English', englishName: 'English', rtl: false },
];

export const isRTLLanguage = (lang: Language) => LANGUAGES.find((l) => l.code === lang)?.rtl ?? false;

/** Plural entry. Arabic uses all six CLDR categories; English uses one/other. */
export type Plural = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

/** Maps a source (English) dictionary shape onto the shape every other language must provide. */
export type DeepTranslation<T> = {
  [K in keyof T]: T[K] extends { other: string } ? Plural : T[K] extends string ? string : DeepTranslation<T[K]>;
};

type Join<A extends string, B extends string> = `${A}.${B}`;

/** Dotted paths to string leaves. */
export type StringPaths<T, Depth extends unknown[] = []> = Depth['length'] extends 5
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends { other: string }
          ? never
          : Join<K, StringPaths<T[K], [...Depth, 1]>>;
    }[keyof T & string];

/** Dotted paths to plural leaves. */
export type PluralPaths<T, Depth extends unknown[] = []> = Depth['length'] extends 5
  ? never
  : {
      [K in keyof T & string]: T[K] extends { other: string }
        ? K
        : T[K] extends string
          ? never
          : Join<K, PluralPaths<T[K], [...Depth, 1]>>;
    }[keyof T & string];

/** Content that ships in both languages (mock data, salon-entered text). */
export type LocalizedText = { en: string; ar: string };
