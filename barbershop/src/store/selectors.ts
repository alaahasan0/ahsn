/** Focused read hooks over the prototype store. Screens use these instead of raw state. */
import { useMemo } from 'react';

import { now, today } from '@/lib/clock';
import { addDays, addMinutes, isSameDay, startOfDay } from '@/lib/dates';
import { normalizeNational, phoneSearchText } from '@/lib/phone';
import type {
  ActivityEvent,
  Appointment,
  AppointmentStatus,
  BookingSource,
  Customer,
  CustomerStats,
  ID,
} from '@/types/models';

import { useAppState, type AppState } from './AppStore';
import type { AvailabilityContext } from './availability';

export const appointmentEnd = (a: Appointment) => addMinutes(new Date(a.start), a.durationMin);

export function useSalon() {
  return useAppState().salon;
}

export function useBarbers(opts: { includeInactive?: boolean } = {}) {
  const { barbers } = useAppState();
  return useMemo(() => (opts.includeInactive ? barbers : barbers.filter((b) => b.active)), [barbers, opts.includeInactive]);
}

export function useBarber(id?: ID) {
  const { barbers } = useAppState();
  return useMemo(() => barbers.find((b) => b.id === id), [barbers, id]);
}

export function useServices(opts: { includeInactive?: boolean } = {}) {
  const { services } = useAppState();
  return useMemo(() => (opts.includeInactive ? services : services.filter((s) => s.active)), [services, opts.includeInactive]);
}

export function useService(id?: ID) {
  const { services } = useAppState();
  return useMemo(() => services.find((s) => s.id === id), [services, id]);
}

export function useCustomer(id?: ID) {
  const { customers } = useAppState();
  return useMemo(() => customers.find((c) => c.id === id), [customers, id]);
}

export function useAppointment(id?: ID) {
  const { appointments } = useAppState();
  return useMemo(() => appointments.find((a) => a.id === id), [appointments, id]);
}

/** Lookup helpers for rendering lists without a hook per row. */
export function useLookup() {
  const s = useAppState();
  return useMemo(() => {
    const barbers = new Map(s.barbers.map((b) => [b.id, b]));
    const services = new Map(s.services.map((x) => [x.id, x]));
    const customers = new Map(s.customers.map((c) => [c.id, c]));
    const appointments = new Map(s.appointments.map((a) => [a.id, a]));
    return {
      barber: (id?: ID) => (id ? barbers.get(id) : undefined),
      service: (id?: ID) => (id ? services.get(id) : undefined),
      customer: (id?: ID) => (id ? customers.get(id) : undefined),
      appointment: (id?: ID) => (id ? appointments.get(id) : undefined),
    };
  }, [s.barbers, s.services, s.customers, s.appointments]);
}

export interface AppointmentFilters {
  barberIds?: ID[];
  serviceIds?: ID[];
  statuses?: AppointmentStatus[];
  sources?: BookingSource[];
  query?: string;
}

export function filterAppointments(state: Pick<AppState, 'appointments' | 'customers' | 'services' | 'barbers'>, list: Appointment[], f: AppointmentFilters): Appointment[] {
  const q = f.query?.trim().toLowerCase();
  const customers = new Map(state.customers.map((c) => [c.id, c]));
  const services = new Map(state.services.map((s) => [s.id, s]));
  return list.filter((a) => {
    if (f.barberIds?.length && !f.barberIds.includes(a.barberId)) return false;
    if (f.serviceIds?.length && !f.serviceIds.includes(a.serviceId)) return false;
    if (f.statuses?.length && !f.statuses.includes(a.status)) return false;
    if (f.sources?.length && !f.sources.includes(a.source)) return false;
    if (q) {
      const c = customers.get(a.customerId);
      const s = services.get(a.serviceId);
      const hay = `${c?.name.en} ${c?.name.ar} ${phoneSearchText(c?.phone)} ${phoneSearchText(c?.whatsapp)} ${s?.name.en} ${s?.name.ar}`.toLowerCase();
      if (!hay.includes(q) && !hay.includes(normalizeNational(q) || '\u0000')) return false;
    }
    return true;
  });
}

/** Appointments in [from, to). */
export function useAppointmentsBetween(from: Date, to: Date, filters: AppointmentFilters = {}) {
  const state = useAppState();
  const key = JSON.stringify(filters);
  return useMemo(() => {
    const inRange = state.appointments.filter((a) => {
      const s = new Date(a.start);
      return s >= from && s < to;
    });
    return filterAppointments(state, inRange, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.appointments, state.customers, from.getTime(), to.getTime(), key]);
}

export function useAppointmentsOn(day: Date, filters: AppointmentFilters = {}) {
  const from = startOfDay(day);
  return useAppointmentsBetween(from, addDays(from, 1), filters);
}

export function computeCustomerStats(customerId: ID, appointments: Appointment[]): CustomerStats {
  const mine = appointments.filter((a) => a.customerId === customerId);
  const current = now();
  const past = mine.filter((a) => new Date(a.start) <= current).sort((a, b) => b.start.localeCompare(a.start));
  const completed = past.filter((a) => a.status === 'completed');
  const noShows = mine.filter((a) => a.status === 'no_show').length;
  const cancellations = mine.filter((a) => a.status === 'cancelled').length;
  const lateCancellations = mine.filter((a) => {
    if (a.status !== 'cancelled') return false;
    const c = a.history.find((h) => h.type === 'cancelled');
    return c ? new Date(a.start).getTime() - new Date(c.at).getTime() < 12 * 3600_000 : false;
  }).length;
  const next = mine
    .filter((a) => new Date(a.start) > current && ['confirmed', 'pending', 'draft'].includes(a.status))
    .sort((a, b) => a.start.localeCompare(b.start))[0];
  const tally = (key: 'barberId' | 'serviceId') => {
    const m = new Map<string, number>();
    completed.forEach((a) => m.set(a[key], (m.get(a[key]) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  };
  const decided = completed.length + noShows + cancellations;
  return {
    totalVisits: completed.length,
    completed: completed.length,
    cancellations,
    lateCancellations,
    noShows,
    lastVisit: completed[0],
    nextAppointment: next,
    totalSpent: completed.reduce((s, a) => s + a.price, 0),
    attendanceRate: decided === 0 ? 1 : completed.length / decided,
    favoriteBarberId: tally('barberId'),
    favoriteServiceId: tally('serviceId'),
  };
}

export function useCustomerStats(customerId?: ID): CustomerStats | undefined {
  const { appointments } = useAppState();
  return useMemo(() => (customerId ? computeCustomerStats(customerId, appointments) : undefined), [customerId, appointments]);
}

/** Map of customerId → stats for list screens. */
export function useAllCustomerStats() {
  const { appointments, customers } = useAppState();
  return useMemo(() => new Map(customers.map((c) => [c.id, computeCustomerStats(c.id, appointments)])), [appointments, customers]);
}

export function searchCustomers(customers: Customer[], query: string): Customer[] {
  const q = query.trim().toLowerCase();
  if (!q) return customers;
  const digits = normalizeNational(q);
  return customers.filter((c) => {
    const hay = `${c.name.en} ${c.name.ar}`.toLowerCase();
    if (hay.includes(q)) return true;
    if (digits.length >= 3) return phoneSearchText(c.phone).includes(digits) || phoneSearchText(c.whatsapp).includes(digits);
    return false;
  });
}

export function useCustomerSearch(query: string) {
  const { customers } = useAppState();
  return useMemo(() => searchCustomers(customers, query), [customers, query]);
}

export interface DaySummary {
  total: number;
  completed: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  noShows: number;
  checkedIn: number;
  revenue: number;
  expectedRevenue: number;
  occupancy: number; // 0..1
  bookedMinutes: number;
  capacityMinutes: number;
}

export function summarizeDay(state: Pick<AppState, 'appointments' | 'barbers'>, day: Date, barberIds?: ID[]): DaySummary {
  const list = state.appointments.filter((a) => isSameDay(new Date(a.start), day) && (!barberIds || barberIds.includes(a.barberId)));
  const live = list.filter((a) => !['cancelled', 'no_show', 'rescheduled', 'expired'].includes(a.status));
  const wd = day.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const capacity = state.barbers
    .filter((b) => b.active && (!barberIds || barberIds.includes(b.id)) && b.schedule[wd].enabled)
    .reduce((sum, b) => {
      const s = b.schedule[wd];
      const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
      const breaks = s.breaks.reduce((x, br) => x + toMin(br.end) - toMin(br.start), 0);
      return sum + toMin(s.end) - toMin(s.start) - breaks;
    }, 0);
  const booked = live.reduce((s, a) => s + a.durationMin, 0);
  return {
    total: list.filter((a) => a.status !== 'rescheduled').length,
    completed: list.filter((a) => a.status === 'completed').length,
    pending: list.filter((a) => a.status === 'pending' || a.status === 'draft').length,
    confirmed: list.filter((a) => a.status === 'confirmed').length,
    cancelled: list.filter((a) => a.status === 'cancelled').length,
    noShows: list.filter((a) => a.status === 'no_show').length,
    checkedIn: list.filter((a) => a.status === 'checked_in').length,
    revenue: list.filter((a) => a.status === 'completed').reduce((s, a) => s + a.price, 0),
    expectedRevenue: live.reduce((s, a) => s + a.price, 0),
    occupancy: capacity ? Math.min(1, booked / capacity) : 0,
    bookedMinutes: booked,
    capacityMinutes: capacity,
  };
}

export function useDaySummary(day: Date = today(), barberIds?: ID[]) {
  const state = useAppState();
  const key = barberIds?.join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => summarizeDay(state, day, barberIds), [state.appointments, state.barbers, day.getTime(), key]);
}

/** Booking activity feed derived from appointment history (newest first). */
export function useActivity(limit = 50, sinceHours = 72): ActivityEvent[] {
  const { appointments } = useAppState();
  return useMemo(() => {
    const since = now().getTime() - sinceHours * 3600_000;
    const until = now().getTime();
    const out: ActivityEvent[] = [];
    for (const a of appointments) {
      for (const e of a.history) {
        const t = new Date(e.at).getTime();
        if (t < since || t > until + 60_000) continue;
        const kind: ActivityEvent['kind'] | null =
          e.type === 'created' ? (a.status === 'draft' ? 'request' : 'created') : e.type === 'link_sent' ? 'link_sent' : e.type === 'confirmed' ? 'confirmed' : e.type === 'cancelled' ? 'cancelled' : e.type === 'rescheduled' ? 'rescheduled' : e.type === 'expired' ? 'link_expired' : e.type === 'checked_in' ? 'checked_in' : e.type === 'completed' ? 'completed' : e.type === 'no_show' ? 'no_show' : null;
        if (kind) out.push({ id: `${a.id}_${e.id}`, at: e.at, kind, appointmentId: a.id, actor: e.actor, source: a.source });
      }
    }
    return out.sort((x, y) => y.at.localeCompare(x.at)).slice(0, limit);
  }, [appointments, limit, sinceHours]);
}

export function useAvailabilityContext(): AvailabilityContext {
  const { salon, barbers, appointments, blocks } = useAppState();
  return useMemo(() => ({ salon, barbers, appointments, blocks }), [salon, barbers, appointments, blocks]);
}

export function useUnreadNotifications() {
  const { notifications } = useAppState();
  return useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
}

/** Counts for the Bookings inbox badges. */
export function useInboxCounts() {
  const { appointments } = useAppState();
  return useMemo(() => {
    const current = now();
    const upcoming = appointments.filter((a) => new Date(a.start) >= startOfDay(current));
    return {
      requests: upcoming.filter((a) => a.status === 'draft').length,
      awaiting: upcoming.filter((a) => a.status === 'pending').length,
      expired: appointments.filter((a) => a.status === 'expired').length,
    };
  }, [appointments]);
}
