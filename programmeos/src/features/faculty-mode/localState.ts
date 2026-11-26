import { useSyncExternalStore } from 'react';

/**
 * Tiny in-memory store for prototype-only interactions in the external experiences
 * (submitted invoices, signed agreements, read messages, feedback given). Lives for the
 * session, like the rest of the sample data.
 */
type State = {
  submittedInvoices: string[];
  signedContracts: string[];
  readMessages: string[];
  feedbackGiven: string[];
  calendarAdded: string[];
  learnerPrefs: { reminders: boolean; announcements: boolean; grades: boolean; whatsapp: boolean };
};

let state: State = {
  submittedInvoices: [],
  signedContracts: [],
  readMessages: [],
  feedbackGiven: ['ss-ie-1'],
  calendarAdded: [],
  learnerPrefs: { reminders: true, announcements: true, grades: true, whatsapp: false },
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const localState = {
  get: () => state,
  set: (patch: Partial<State> | ((s: State) => Partial<State>)) => {
    state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
    emit();
  },
  addTo: (key: 'submittedInvoices' | 'signedContracts' | 'readMessages' | 'feedbackGiven' | 'calendarAdded', id: string) => {
    if (state[key].includes(id)) return;
    state = { ...state, [key]: [...state[key], id] };
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export function useLocalState() {
  return useSyncExternalStore(localState.subscribe, localState.get, localState.get);
}
