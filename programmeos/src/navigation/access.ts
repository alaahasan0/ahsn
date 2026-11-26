import type { StaffRoleKey } from '@/data/models';

/**
 * Role-based access for the internal staff experience. The prototype shows a designed
 * "Permission restricted" state instead of hiding modules entirely, so a reviewer can see
 * how access control will behave once real permissions exist.
 */
export type ModuleKey =
  | 'programmes'
  | 'people'
  | 'faculty'
  | 'learners'
  | 'clients'
  | 'calendar'
  | 'finance'
  | 'academics'
  | 'logistics'
  | 'approvals'
  | 'documents'
  | 'reports'
  | 'workflows'
  | 'assistant'
  | 'settings'
  | 'admin';

const ALL: StaffRoleKey[] = [
  'programme_manager',
  'programme_coordinator',
  'academic_coordinator',
  'faculty_operations',
  'logistics_coordinator',
  'finance_officer',
  'finance_approver',
  'learner_support',
  'senior_management',
  'administrator',
];

export const moduleAccess: Record<ModuleKey, StaffRoleKey[]> = {
  programmes: ALL,
  people: ALL,
  faculty: ALL,
  learners: ALL,
  clients: ['programme_manager', 'programme_coordinator', 'senior_management', 'finance_officer', 'finance_approver', 'administrator'],
  calendar: ALL,
  finance: ['programme_manager', 'finance_officer', 'finance_approver', 'senior_management', 'administrator'],
  academics: ALL,
  logistics: ['programme_manager', 'programme_coordinator', 'logistics_coordinator', 'faculty_operations', 'learner_support', 'senior_management', 'administrator', 'finance_officer', 'finance_approver'],
  approvals: ALL,
  documents: ALL,
  reports: ['programme_manager', 'senior_management', 'finance_officer', 'finance_approver', 'administrator', 'academic_coordinator'],
  workflows: ALL,
  assistant: ALL,
  settings: ALL,
  admin: ['administrator'],
};

export function canAccess(role: StaffRoleKey, module: ModuleKey) {
  return moduleAccess[module].includes(role);
}

/** Financial figures (contract value, margin) are hidden from roles without finance access. */
export function canSeeFinancials(role: StaffRoleKey) {
  return canAccess(role, 'finance');
}
