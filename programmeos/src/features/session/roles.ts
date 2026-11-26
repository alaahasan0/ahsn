import type { IconName } from '@/components/ui/Icon';
import type { StaffRoleKey } from '@/data/models';

export const ROLE_ICONS: Record<StaffRoleKey, IconName> = {
  programme_manager: 'briefcase',
  programme_coordinator: 'clipboard-list',
  academic_coordinator: 'graduation-cap',
  faculty_operations: 'users',
  logistics_coordinator: 'plane',
  finance_officer: 'receipt',
  finance_approver: 'stamp',
  learner_support: 'heart-handshake',
  senior_management: 'chart-line',
  administrator: 'settings',
};

export const ROLE_TONES: Record<StaffRoleKey, 'accent' | 'success' | 'warning' | 'violet' | 'info' | 'danger' | 'neutral'> = {
  programme_manager: 'accent',
  programme_coordinator: 'info',
  academic_coordinator: 'violet',
  faculty_operations: 'warning',
  logistics_coordinator: 'info',
  finance_officer: 'success',
  finance_approver: 'success',
  learner_support: 'danger',
  senior_management: 'accent',
  administrator: 'neutral',
};
