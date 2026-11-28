import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { today } from '@/lib/clock';
import { useAppState } from '@/store/AppStore';
import type { CommunicationChannel, ID, PhoneNumber, Salon } from '@/types/models';

/** In-progress online booking. Lives only in memory for the portal session. */
export interface BookingDraft {
  serviceId?: ID;
  barberId: ID | 'any';
  date: Date;
  slot?: { start: Date; barberId: ID };
  name: string;
  phone: PhoneNumber;
  whatsappSame: boolean;
  whatsapp: PhoneNumber;
  channel: CommunicationChannel;
  notes: string;
  verified: boolean;
  appointmentId?: ID;
}

const initial = (): BookingDraft => ({
  barberId: 'any',
  date: today(),
  name: '',
  phone: { country: '+970', number: '' },
  whatsappSame: true,
  whatsapp: { country: '+970', number: '' },
  channel: 'whatsapp',
  notes: '',
  verified: false,
});

interface Ctx {
  slug: string;
  salon?: Salon;
  draft: BookingDraft;
  update: (patch: Partial<BookingDraft>) => void;
  reset: () => void;
  /** Path inside the portal, e.g. path('service') → /book/the-barber-house/service */
  path: (step?: string) => string;
}

const DraftContext = createContext<Ctx | null>(null);

export function BookingDraftProvider({ slug, children }: PropsWithChildren<{ slug: string }>) {
  const { salon } = useAppState();
  const [draft, setDraft] = useState<BookingDraft>(initial);
  const update = useCallback((patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const reset = useCallback(() => setDraft(initial()), []);
  const value = useMemo<Ctx>(
    () => ({ slug, salon: salon.slug === slug ? salon : undefined, draft, update, reset, path: (step) => `/book/${slug}${step ? `/${step}` : ''}` }),
    [slug, salon, draft, update, reset],
  );
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useBookingDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error('useBookingDraft must be used inside BookingDraftProvider');
  return ctx;
}

export const PORTAL_STEPS = ['service', 'barber', 'date', 'time', 'details', 'verify', 'review'] as const;
export type PortalStep = (typeof PORTAL_STEPS)[number];
