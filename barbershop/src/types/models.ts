/**
 * Domain entities. These mirror the future PostgreSQL schema (multi-tenant: every record
 * belongs to a salon via `salonId`). The UI depends only on these types — never on how
 * the data is fetched — so Supabase can replace the mock store without touching screens.
 */
import type { LocalizedText } from '@/i18n/types';

export type ID = string;
/** ISO-8601 timestamp, e.g. 2026-12-01T17:30:00.000Z */
export type ISODateTime = string;
/** Calendar date, YYYY-MM-DD (salon local time). */
export type ISODate = string;
/** Wall-clock time, HH:mm (24h, salon local time). */
export type ClockTime = string;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export type AppointmentStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled'
  | 'expired';

export const APPOINTMENT_STATUSES: AppointmentStatus[] = ['draft', 'pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show', 'rescheduled', 'expired'];

/** Statuses that occupy a slot in the calendar. */
export const ACTIVE_STATUSES: AppointmentStatus[] = ['draft', 'pending', 'confirmed', 'checked_in', 'completed'];

export type BookingSource = 'phone' | 'whatsapp' | 'online' | 'walk_in' | 'staff' | 'recurring' | 'voice';

export const BOOKING_SOURCES: BookingSource[] = ['phone', 'whatsapp', 'online', 'walk_in', 'staff', 'recurring', 'voice'];

export type CustomerCategory = 'trusted' | 'regular' | 'new';

export type CommunicationChannel = 'whatsapp' | 'sms' | 'call';

export type WhatsAppVerification = 'verified' | 'unverified' | 'pending';

export type CountryCode = '+970' | '+972' | '+962';

export interface PhoneNumber {
  country: CountryCode;
  /** National significant number without leading zero, e.g. 599123456 */
  number: string;
}

export interface TimeRange {
  start: ClockTime;
  end: ClockTime;
}

export interface DaySchedule {
  enabled: boolean;
  start: ClockTime;
  end: ClockTime;
  breaks: TimeRange[];
}

export type WeeklySchedule = Record<Weekday, DaySchedule>;

export type SubscriptionPlan = 'starter' | 'professional' | 'business';

export interface Branch {
  id: ID;
  name: LocalizedText;
  address: LocalizedText;
  phone: PhoneNumber;
  isPrimary: boolean;
  barberIds: ID[];
}

export interface Holiday {
  id: ID;
  date: ISODate;
  name: LocalizedText;
  closed: boolean;
}

export interface Salon {
  id: ID;
  slug: string;
  name: LocalizedText;
  tagline: LocalizedText;
  about: LocalizedText;
  address: LocalizedText;
  city: LocalizedText;
  phone: PhoneNumber;
  whatsapp: PhoneNumber;
  email: string;
  instagram?: string;
  currency: 'ILS' | 'USD' | 'JOD';
  timezone: string;
  hours: WeeklySchedule;
  /** Minimum hours before start a customer may cancel/reschedule via the link. */
  cancellationPolicyHours: number;
  /** Hours a confirmation link stays valid. */
  confirmationLinkHours: number;
  slotIntervalMin: 15 | 20 | 30;
  plan: SubscriptionPlan;
  branches: Branch[];
  holidays: Holiday[];
  brandColor: string;
  rating: number;
  reviewCount: number;
}

export type UserRole = 'owner' | 'manager' | 'barber' | 'receptionist';

export interface User {
  id: ID;
  salonId: ID;
  name: LocalizedText;
  email: string;
  phone: PhoneNumber;
  role: UserRole;
  /** Linked barber profile when the user is also a barber. */
  barberId?: ID;
  lastActiveAt: ISODateTime;
  twoFactor: boolean;
}

export interface Barber {
  id: ID;
  salonId: ID;
  name: LocalizedText;
  nickname?: LocalizedText;
  title: LocalizedText;
  bio: LocalizedText;
  phone: PhoneNumber;
  /** Avatar background tone — real photos come with Supabase Storage. */
  color: string;
  initials: LocalizedText;
  role: UserRole;
  serviceIds: ID[];
  schedule: WeeklySchedule;
  daysOff: ISODate[];
  active: boolean;
  acceptsOnline: boolean;
  joinedAt: ISODate;
  yearsExperience: number;
}

export interface Service {
  id: ID;
  salonId: ID;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  durationMin: number;
  bufferMin: number;
  barberIds: ID[];
  active: boolean;
  bookableOnline: boolean;
  category: 'hair' | 'beard' | 'combo' | 'care' | 'kids';
  icon: string;
  popular?: boolean;
}

export interface Customer {
  id: ID;
  salonId: ID;
  name: LocalizedText;
  phone: PhoneNumber;
  /** Separate from phone. Never assume they are the same. */
  whatsapp?: PhoneNumber;
  whatsappVerification: WhatsAppVerification;
  preferredChannel: CommunicationChannel;
  preferredBarberId?: ID;
  preferredServiceIds: ID[];
  category: CustomerCategory;
  /** True if the category was set by staff rather than suggested by history. */
  categoryManual: boolean;
  notes?: string;
  birthday?: ISODate;
  createdAt: ISODateTime;
  marketingOptIn: boolean;
}

export type ActorType = 'staff' | 'customer' | 'system' | 'voice';

export interface AppointmentEvent {
  id: ID;
  at: ISODateTime;
  type: 'created' | 'link_sent' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled' | 'expired' | 'note' | 'reminder_sent' | 'status';
  actor: ActorType;
  actorName?: LocalizedText;
  detail?: string;
}

export interface AppointmentNote {
  id: ID;
  at: ISODateTime;
  authorId: ID;
  text: string;
}

export interface ConfirmationLink {
  token: string;
  channel: CommunicationChannel;
  sentAt: ISODateTime;
  expiresAt: ISODateTime;
  openedAt?: ISODateTime;
}

export interface Appointment {
  id: ID;
  salonId: ID;
  customerId: ID;
  serviceId: ID;
  barberId: ID;
  start: ISODateTime;
  durationMin: number;
  price: number;
  status: AppointmentStatus;
  source: BookingSource;
  createdAt: ISODateTime;
  createdBy: ActorType;
  recurringId?: ID;
  /** When rescheduled, the appointment that replaced this one (and vice versa). */
  rescheduledToId?: ID;
  rescheduledFromId?: ID;
  confirmation?: ConfirmationLink;
  cancellationReason?: string;
  notes: AppointmentNote[];
  history: AppointmentEvent[];
  /** Assigned by "any available barber". */
  autoAssigned?: boolean;
}

export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'custom';
export type RecurringMode = 'fixed' | 'invitation';

export interface RecurringSeries {
  id: ID;
  salonId: ID;
  customerId: ID;
  barberId: ID;
  serviceId: ID;
  mode: RecurringMode;
  frequency: RecurrenceFrequency;
  /** For custom: every N weeks. */
  intervalWeeks: number;
  weekday: Weekday;
  time: ClockTime;
  startDate: ISODate;
  endDate?: ISODate;
  occurrenceLimit?: number;
  status: 'active' | 'paused' | 'ended';
  pausedUntil?: ISODate;
  excludeHolidays: boolean;
  /** Occurrences cancelled individually. */
  skippedDates: ISODate[];
  /** For invitations: how many days before each visit the request goes out. */
  inviteDaysBefore: number;
  createdAt: ISODateTime;
}

export interface TimeBlock {
  id: ID;
  barberId: ID | 'all';
  start: ISODateTime;
  end: ISODateTime;
  reason: 'break' | 'personal' | 'meeting' | 'holiday' | 'other';
  note?: string;
}

export type NotificationType = 'new_booking' | 'confirmed' | 'cancelled' | 'rescheduled' | 'upcoming' | 'reminder' | 'no_show' | 'link_expired' | 'request';

export interface AppNotification {
  id: ID;
  type: NotificationType;
  at: ISODateTime;
  read: boolean;
  appointmentId?: ID;
  customerId?: ID;
  barberId?: ID;
}

export type TemplateEvent = 'booking_created' | 'confirmation_request' | 'reminder' | 'rescheduled' | 'cancelled' | 'no_show_followup' | 'recurring_invitation';

export interface MessageTemplate {
  id: ID;
  event: TemplateEvent;
  channel: 'whatsapp' | 'sms';
  language: 'ar' | 'en';
  body: string;
  active: boolean;
  updatedAt: ISODateTime;
}

export interface ActivityEvent {
  id: ID;
  at: ISODateTime;
  kind: 'created' | 'confirmed' | 'cancelled' | 'rescheduled' | 'link_sent' | 'link_opened' | 'link_expired' | 'request' | 'checked_in' | 'completed' | 'no_show';
  appointmentId: ID;
  actor: ActorType;
  source: BookingSource;
}

export interface CustomerStats {
  totalVisits: number;
  completed: number;
  cancellations: number;
  lateCancellations: number;
  noShows: number;
  lastVisit?: Appointment;
  nextAppointment?: Appointment;
  totalSpent: number;
  attendanceRate: number; // 0..1
  favoriteBarberId?: ID;
  favoriteServiceId?: ID;
}

/** Slot suggestion returned by the (mock) availability engine. */
export interface Slot {
  start: Date;
  barberId: ID;
  available: boolean;
}
