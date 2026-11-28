import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { salonHours } from '@/mock/salon';
import { services as mockServices } from '@/mock/services';
import type { LocalizedText } from '@/i18n';
import type { PhoneNumber, WeeklySchedule } from '@/types/models';

export interface DraftService {
  id: string;
  name: LocalizedText;
  price: number;
  durationMin: number;
  enabled: boolean;
  icon: string;
}

export interface DraftBarber {
  id: string;
  name: string;
  phone: PhoneNumber;
  isOwner?: boolean;
}

export interface OnboardingDraft {
  name: string;
  address: string;
  city: string;
  phone: PhoneNumber;
  whatsapp: PhoneNumber;
  hasLogo: boolean;
  hours: WeeklySchedule;
  services: DraftService[];
  barbers: DraftBarber[];
}

interface Ctx {
  draft: OnboardingDraft;
  patch: (p: Partial<OnboardingDraft>) => void;
}

const OnboardingContext = createContext<Ctx | null>(null);

/** Onboarding answers stay local to the flow — nothing touches the demo salon. */
export function OnboardingProvider({ children, initialName = '' }: PropsWithChildren<{ initialName?: string }>) {
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    name: initialName,
    address: '',
    city: '',
    phone: { country: '+970', number: '' },
    whatsapp: { country: '+970', number: '' },
    hasLogo: false,
    hours: salonHours,
    services: mockServices.slice(0, 7).map((s, i) => ({ id: s.id, name: s.name, price: s.price, durationMin: s.durationMin, enabled: i < 5, icon: s.icon })),
    barbers: [{ id: 'me', name: '', phone: { country: '+970', number: '' }, isOwner: true }],
  }));
  const value = useMemo(() => ({ draft, patch: (p: Partial<OnboardingDraft>) => setDraft((d) => ({ ...d, ...p })) }), [draft]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
