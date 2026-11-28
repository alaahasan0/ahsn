import type en from './locales/en';
import type { DeepTranslation, PluralPaths, StringPaths } from './types';

export type SourceDictionary = typeof en;
export type Dictionary = DeepTranslation<SourceDictionary>;
export type TKey = StringPaths<SourceDictionary>;
export type TPluralKey = PluralPaths<SourceDictionary>;
