import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import type { DigitStyle } from '@/i18n/format';
import type { Language } from '@/i18n/types';

export type ThemeMode = 'system' | 'light' | 'dark';
export type DemoRole = 'owner' | 'barber';

export interface Preferences {
  language: Language;
  digits: DigitStyle;
  themeMode: ThemeMode;
  /** Which internal experience the prototype is showing. Real permissions arrive with auth. */
  role: DemoRole;
  /** The barber the barber workspace is signed in as. */
  barberId: string;
  /** Whether onboarding was completed in this prototype session. */
  onboarded: boolean;
}

const DEFAULTS: Preferences = {
  language: 'ar',
  digits: 'latin',
  themeMode: 'system',
  role: 'owner',
  barberId: 'b2',
  onboarded: true,
};

const STORAGE_KEY = 'bh.preferences.v1';

interface PreferencesContextValue extends Preferences {
  ready: boolean;
  set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  update: (patch: Partial<Preferences>) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive || !raw) return;
        try {
          setPrefs((p) => ({ ...p, ...(JSON.parse(raw) as Partial<Preferences>) }));
        } catch {
          // ignore malformed storage
        }
      })
      .catch(() => undefined)
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: Preferences) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const update = useCallback(
    (patch: Partial<Preferences>) => {
      setPrefs((p) => {
        const next = { ...p, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const set = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => update({ [key]: value } as Partial<Preferences>), [update]);

  const value = useMemo(() => ({ ...prefs, ready, set, update }), [prefs, ready, set, update]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
