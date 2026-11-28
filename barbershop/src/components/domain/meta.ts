import type { IconName } from '@/components/ui/Icon';
import type { AppointmentStatus, BookingSource, CustomerCategory } from '@/types/models';

export const STATUS_ICON: Record<AppointmentStatus, IconName> = {
  draft: 'edit-3',
  pending: 'clock',
  confirmed: 'check-circle',
  checked_in: 'user-check',
  completed: 'check',
  cancelled: 'x-circle',
  no_show: 'user-x',
  rescheduled: 'repeat',
  expired: 'alert-triangle',
};

export const SOURCE_ICON: Record<BookingSource, IconName> = {
  phone: 'phone',
  whatsapp: 'ion:logo-whatsapp',
  online: 'globe',
  walk_in: 'mci:walk',
  staff: 'user-check',
  recurring: 'repeat',
  voice: 'mic',
};

export const CATEGORY_ICON: Record<CustomerCategory, IconName> = {
  trusted: 'shield',
  regular: 'user',
  new: 'star',
};
