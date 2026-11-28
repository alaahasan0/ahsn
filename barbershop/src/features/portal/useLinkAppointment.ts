import { useMemo } from 'react';

import { useAppState } from '@/store/AppStore';
import type { Appointment } from '@/types/models';

/**
 * Resolve a booking-management token to its appointment. After a reschedule both the old
 * and the new appointment carry the token; the live (non-rescheduled) one wins.
 */
export function useLinkAppointment(token?: string): Appointment | undefined {
  const { appointments } = useAppState();
  return useMemo(() => {
    if (!token) return undefined;
    const matches = appointments.filter((a) => a.confirmation?.token.toLowerCase() === token.toLowerCase());
    return matches.find((a) => a.status !== 'rescheduled') ?? matches[0];
  }, [appointments, token]);
}
