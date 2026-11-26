import type { Organization, Role, StaffMember } from '../models';

export const organization: Organization = {
  id: 'org-emeritus',
  name: 'Emeritus Education',
  shortName: 'Emeritus',
  region: 'Middle East, Europe & APAC',
  defaultTimeZone: 'Asia/Dubai',
  currency: 'USD',
};

export const roles: Role[] = [
  { key: 'programme_manager', label: 'Programme Manager', description: 'Owns delivery of a portfolio of programmes end to end.' },
  { key: 'programme_coordinator', label: 'Programme Coordinator', description: 'Runs day-to-day operations, schedules and on-site delivery.' },
  { key: 'academic_coordinator', label: 'Academic Coordinator', description: 'Curates modules, reviews and publishes learning materials.' },
  { key: 'faculty_operations', label: 'Faculty Operations', description: 'Sources, assigns and contracts faculty.' },
  { key: 'logistics_coordinator', label: 'Logistics Coordinator', description: 'Hotels, travel, venues, transport and catering.' },
  { key: 'finance_officer', label: 'Finance Officer', description: 'Budgets, purchase orders, invoices and payments.' },
  { key: 'finance_approver', label: 'Finance Approver', description: 'Approves spend, payments and budget changes.' },
  { key: 'learner_support', label: 'Learner Support', description: 'Registration, access and participant care.' },
  { key: 'senior_management', label: 'Senior Management', description: 'Portfolio performance, risk and profitability.' },
  { key: 'administrator', label: 'Administrator', description: 'Users, permissions, templates and system settings.' },
];

export const staff: StaffMember[] = [
  { id: 's-layla', name: 'Layla Haddad', initials: 'LH', role: 'programme_manager', title: 'Senior Programme Manager', email: 'layla.haddad@emeritus.example', phone: '+971 50 214 7781', location: 'Dubai', timeZone: 'Asia/Dubai', team: 'Programme Delivery · MEA', avatarHue: 222 },
  { id: 's-omar', name: 'Omar Farouk', initials: 'OF', role: 'programme_coordinator', title: 'Programme Coordinator', email: 'omar.farouk@emeritus.example', phone: '+971 55 380 1192', location: 'Dubai', timeZone: 'Asia/Dubai', team: 'Programme Delivery · MEA', avatarHue: 160 },
  { id: 's-priya', name: 'Dr. Priya Raman', initials: 'PR', role: 'academic_coordinator', title: 'Academic Coordinator', email: 'priya.raman@emeritus.example', phone: '+971 52 902 4410', location: 'Dubai', timeZone: 'Asia/Dubai', team: 'Academic Affairs', avatarHue: 280 },
  { id: 's-daniel', name: 'Daniel Okafor', initials: 'DO', role: 'faculty_operations', title: 'Faculty Operations Lead', email: 'daniel.okafor@emeritus.example', phone: '+44 7700 900 418', location: 'London', timeZone: 'Europe/London', team: 'Faculty Operations', avatarHue: 24 },
  { id: 's-sofia', name: 'Sofia Marques', initials: 'SM', role: 'logistics_coordinator', title: 'Logistics & Travel Coordinator', email: 'sofia.marques@emeritus.example', phone: '+971 50 776 2310', location: 'Dubai', timeZone: 'Asia/Dubai', team: 'Operations', avatarHue: 340 },
  { id: 's-hannah', name: 'Hannah Weiss', initials: 'HW', role: 'finance_officer', title: 'Programme Finance Officer', email: 'hannah.weiss@emeritus.example', phone: '+971 56 118 5520', location: 'Dubai', timeZone: 'Asia/Dubai', team: 'Finance', avatarHue: 190 },
  { id: 's-rajiv', name: 'Rajiv Menon', initials: 'RM', role: 'finance_approver', title: 'Finance Director, MEA', email: 'rajiv.menon@emeritus.example', phone: '+971 50 661 0098', location: 'Dubai', timeZone: 'Asia/Dubai', team: 'Finance', avatarHue: 40 },
  { id: 's-aisha', name: 'Aisha Al Mansoori', initials: 'AA', role: 'learner_support', title: 'Learner Experience Specialist', email: 'aisha.almansoori@emeritus.example', phone: '+971 54 230 8871', location: 'Abu Dhabi', timeZone: 'Asia/Dubai', team: 'Learner Success', avatarHue: 310 },
  { id: 's-james', name: 'James Whitfield', initials: 'JW', role: 'senior_management', title: 'Regional Director, Executive Education', email: 'james.whitfield@emeritus.example', phone: '+971 50 100 4477', location: 'Dubai', timeZone: 'Asia/Dubai', team: 'Leadership', avatarHue: 205 },
  { id: 's-chen', name: 'Chen Wei', initials: 'CW', role: 'administrator', title: 'Platform Administrator', email: 'chen.wei@emeritus.example', phone: '+65 8123 4490', location: 'Singapore', timeZone: 'Asia/Singapore', team: 'Business Systems', avatarHue: 140 },
  { id: 's-yusuf', name: 'Yusuf Rahman', initials: 'YR', role: 'programme_manager', title: 'Programme Manager', email: 'yusuf.rahman@emeritus.example', phone: '+65 9177 2083', location: 'Singapore', timeZone: 'Asia/Singapore', team: 'Programme Delivery · APAC', avatarHue: 100 },
  { id: 's-claire', name: 'Claire Dubois', initials: 'CD', role: 'programme_manager', title: 'Programme Manager', email: 'claire.dubois@emeritus.example', phone: '+44 7700 900 731', location: 'London', timeZone: 'Europe/London', team: 'Programme Delivery · Europe', avatarHue: 0 },
];

/** Which staff member represents each role when previewing the app. */
export const rolePersona: Record<Role['key'], string> = {
  programme_manager: 's-layla',
  programme_coordinator: 's-omar',
  academic_coordinator: 's-priya',
  faculty_operations: 's-daniel',
  logistics_coordinator: 's-sofia',
  finance_officer: 's-hannah',
  finance_approver: 's-rajiv',
  learner_support: 's-aisha',
  senior_management: 's-james',
  administrator: 's-chen',
};

/** Personas for the two external experiences. */
export const FACULTY_PERSONA_ID = 'f-vasquez';
export const LEARNER_PERSONA_ID = 'l-mariam';
