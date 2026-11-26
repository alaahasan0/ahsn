import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { ThemePreference } from '@/theme';

import { FACULTY_PERSONA_ID, LEARNER_PERSONA_ID, rolePersona } from './mock';
import type { StaffRoleKey } from './models';
import { setActiveActor } from './store';

/**
 * Prototype session: which experience is being previewed, as whom, and UI preferences.
 * There is no authentication — the role switcher simply swaps personas.
 */
export type AppMode = 'staff' | 'faculty' | 'learner';

export type SessionState = {
  hydrated: boolean;
  signedIn: boolean;
  mode: AppMode;
  role: StaffRoleKey;
  /** Active persona id: staff id, faculty id or learner id depending on mode */
  userId: string;
  themePreference: ThemePreference;
  simulateOffline: boolean;
  simulateErrors: boolean;
  simulateSlowLoading: boolean;
  reduceMotion: boolean;
  notificationsEnabled: boolean;
};

type SessionApi = SessionState & {
  signIn: (mode: AppMode, role?: StaffRoleKey) => void;
  signOut: () => void;
  switchRole: (role: StaffRoleKey) => void;
  switchMode: (mode: AppMode) => void;
  setPreference: <K extends keyof SessionState>(key: K, value: SessionState[K]) => void;
};

const STORAGE_KEY = 'programmeos.session.v1';

const defaults: SessionState = {
  hydrated: false,
  signedIn: false,
  mode: 'staff',
  role: 'programme_manager',
  userId: rolePersona.programme_manager,
  themePreference: 'system',
  simulateOffline: false,
  simulateErrors: false,
  simulateSlowLoading: false,
  reduceMotion: false,
  notificationsEnabled: true,
};

const SessionContext = createContext<SessionApi | null>(null);

function personaFor(mode: AppMode, role: StaffRoleKey) {
  if (mode === 'faculty') return FACULTY_PERSONA_ID;
  if (mode === 'learner') return LEARNER_PERSONA_ID;
  return rolePersona[role];
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(defaults);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const saved = JSON.parse(raw) as Partial<SessionState>;
          setState((s) => {
            const next = { ...s, ...saved, hydrated: true };
            next.userId = personaFor(next.mode, next.role);
            return next;
          });
          return;
        }
      } catch {
        // Storage unavailable (private mode, etc.) — fall back to defaults.
      }
      if (!cancelled) setState((s) => ({ ...s, hydrated: true }));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setActiveActor(state.mode === 'staff' ? state.userId : state.userId);
    if (!state.hydrated) return;
    const { hydrated: _h, ...persist } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persist)).catch(() => {});
  }, [state]);

  const api = useMemo<SessionApi>(
    () => ({
      ...state,
      signIn: (mode, role = state.role) => setState((s) => ({ ...s, signedIn: true, mode, role, userId: personaFor(mode, role) })),
      signOut: () => setState((s) => ({ ...s, signedIn: false })),
      switchRole: (role) => setState((s) => ({ ...s, mode: 'staff', role, userId: personaFor('staff', role) })),
      switchMode: (mode) => setState((s) => ({ ...s, mode, userId: personaFor(mode, s.role) })),
      setPreference: (key, value) => setState((s) => ({ ...s, [key]: value })),
    }),
    [state],
  );

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionApi {
  const s = useContext(SessionContext);
  if (!s) throw new Error('useSession must be used inside SessionProvider');
  return s;
}

export function homeRouteFor(mode: AppMode) {
  return mode === 'faculty' ? '/faculty-mode' : mode === 'learner' ? '/learner-mode' : '/home';
}
