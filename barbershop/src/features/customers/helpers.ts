import type { IconName } from '@/components/ui/Icon';
import type { AppointmentStatus, CustomerCategory, CustomerStats, PhoneNumber } from '@/types/models';
import { phonesEqual } from '@/lib/phone';

/** History-based suggestion shown next to the manual classification. Prototype heuristic. */
export function suggestCategory(stats: CustomerStats): CustomerCategory {
  if (stats.completed >= 8 && stats.noShows === 0 && stats.lateCancellations <= 1) return 'trusted';
  if (stats.completed >= 2) return 'regular';
  return 'new';
}

/** Risk score for sorting the trust list: no-shows weigh most, late cancellations next. */
export function riskScore(stats: CustomerStats): number {
  return stats.noShows * 3 + stats.lateCancellations * 2 + stats.cancellations * 0.5;
}

export type WhatsAppRelation = 'same' | 'none' | 'differentNumber' | 'differentPrefix';

export function whatsappRelation(phone: PhoneNumber, whatsapp?: PhoneNumber): WhatsAppRelation {
  if (!whatsapp) return 'none';
  if (phonesEqual(phone, whatsapp)) return 'same';
  if (phone.country !== whatsapp.country && phone.number.slice(-7) === whatsapp.number.slice(-7)) return 'differentPrefix';
  return 'differentNumber';
}

export const TIMELINE_META: Record<AppointmentStatus, { icon: IconName; key: 'completed' | 'upcoming' | 'pending' | 'draft' | 'cancelled' | 'noShow' | 'rescheduled' | 'expired' | 'checkedIn' }> = {
  completed: { icon: 'check', key: 'completed' },
  confirmed: { icon: 'calendar', key: 'upcoming' },
  pending: { icon: 'clock', key: 'pending' },
  draft: { icon: 'edit-3', key: 'draft' },
  cancelled: { icon: 'x', key: 'cancelled' },
  no_show: { icon: 'user-x', key: 'noShow' },
  rescheduled: { icon: 'repeat', key: 'rescheduled' },
  expired: { icon: 'alert-triangle', key: 'expired' },
  checked_in: { icon: 'scissors', key: 'checkedIn' },
};
