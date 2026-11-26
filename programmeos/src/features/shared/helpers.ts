import type { IconName } from '@/components/ui/Icon';
import type { Tone } from '@/components/ui/StatusPill';
import type { DeliveryMode, NotificationCategory, ReadinessCategoryKey, Session } from '@/data/models';
import type { ReadinessTone } from '@/data/selectors';

export const DELIVERY_ICON: Record<DeliveryMode, IconName> = {
  'In-person': 'map-pin',
  Virtual: 'video',
  Hybrid: 'monitor-play',
};

export const READINESS_ICON: Record<ReadinessCategoryKey, IconName> = {
  faculty: 'users',
  materials: 'book-open',
  hotel: 'bed-double',
  participants: 'user-check',
  travel: 'plane',
  venue: 'building-2',
  equipment: 'projector',
  client: 'handshake',
  finance: 'wallet',
};

export function readinessToneColor(tone: ReadinessTone): Tone {
  switch (tone) {
    case 'complete':
      return 'success';
    case 'on_track':
      return 'accent';
    case 'attention':
      return 'warning';
    case 'critical':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function readinessTone(percent: number, threshold = 90): Tone {
  if (percent >= threshold) return 'success';
  if (percent >= 75) return 'accent';
  if (percent >= 50) return 'warning';
  return 'danger';
}

export const NOTIFICATION_ICON: Record<NotificationCategory, { icon: IconName; tone: Tone }> = {
  Tasks: { icon: 'square-check-big', tone: 'accent' },
  Programme: { icon: 'layers', tone: 'violet' },
  Approvals: { icon: 'stamp', tone: 'warning' },
  Faculty: { icon: 'users', tone: 'info' },
  Learners: { icon: 'graduation-cap', tone: 'success' },
  Logistics: { icon: 'plane', tone: 'info' },
  Finance: { icon: 'wallet', tone: 'success' },
  System: { icon: 'settings', tone: 'neutral' },
};

export const SESSION_KIND_ICON: Record<Session['kind'], IconName> = {
  Lecture: 'presentation',
  Workshop: 'users',
  'Case Study': 'book-marked',
  Panel: 'mic',
  Coaching: 'heart-handshake',
  Simulation: 'target',
  'Site Visit': 'map',
  Networking: 'coffee',
  Assessment: 'award',
};

export const TASK_CATEGORY_ICON: Record<string, IconName> = {
  Faculty: 'users',
  Academic: 'book-open',
  Logistics: 'plane',
  Finance: 'wallet',
  Learners: 'graduation-cap',
  Client: 'handshake',
  Operations: 'clipboard-list',
};
