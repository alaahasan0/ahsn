/**
 * Mock availability engine — prototype simulation only.
 *
 * Computes open slots from the in-memory schedule so booking flows can demonstrate
 * "taken" slots and suggest alternatives. In production this moves server-side
 * (a validated RPC), because availability must be checked atomically when booking.
 */
import { now } from '@/lib/clock';
import { addMinutes, atClock, clockToMinutes, isSameDay, minutesToClock, overlaps, toISODate, weekdayOf } from '@/lib/dates';
import { ACTIVE_STATUSES, type Appointment, type Barber, type ID, type Salon, type Service, type TimeBlock } from '@/types/models';

export interface AvailabilityContext {
  salon: Salon;
  barbers: Barber[];
  appointments: Appointment[];
  blocks: TimeBlock[];
}

export interface SlotOption {
  start: Date;
  barberId: ID;
  available: boolean;
  /** Why a slot is unavailable (for the polished unavailable state). */
  reason?: 'booked' | 'break' | 'blocked' | 'past' | 'closed';
}

export function barberWorksOn(barber: Barber, day: Date): boolean {
  const s = barber.schedule[weekdayOf(day)];
  return barber.active && s.enabled && !barber.daysOff.includes(toISODate(day));
}

function busyReason(ctx: AvailabilityContext, barber: Barber, start: Date, end: Date, ignoreAppointmentId?: ID): SlotOption['reason'] | undefined {
  const day = start;
  const sched = barber.schedule[weekdayOf(day)];
  if (!barberWorksOn(barber, day)) return 'closed';
  const open = atClock(day, sched.start);
  const close = atClock(day, sched.end);
  if (start < open || end > close) return 'closed';
  if (sched.breaks.some((b) => overlaps(start, end, atClock(day, b.start), atClock(day, b.end)))) return 'break';
  if (ctx.blocks.some((b) => (b.barberId === barber.id || b.barberId === 'all') && overlaps(start, end, new Date(b.start), new Date(b.end)))) return 'blocked';
  const clash = ctx.appointments.some(
    (a) => a.id !== ignoreAppointmentId && a.barberId === barber.id && ACTIVE_STATUSES.includes(a.status) && overlaps(start, end, new Date(a.start), addMinutes(new Date(a.start), a.durationMin)),
  );
  if (clash) return 'booked';
  return undefined;
}

/** All candidate slots for one barber on one day, flagged available/unavailable. */
export function slotsForBarber(ctx: AvailabilityContext, barber: Barber, day: Date, service: Service, ignoreAppointmentId?: ID): SlotOption[] {
  if (!barberWorksOn(barber, day)) return [];
  const sched = barber.schedule[weekdayOf(day)];
  const step = ctx.salon.slotIntervalMin;
  const out: SlotOption[] = [];
  const current = now();
  for (let m = clockToMinutes(sched.start); m + service.durationMin <= clockToMinutes(sched.end); m += step) {
    const start = atClock(day, minutesToClock(m));
    const end = addMinutes(start, service.durationMin + service.bufferMin);
    if (start < current) {
      if (isSameDay(start, current)) out.push({ start, barberId: barber.id, available: false, reason: 'past' });
      continue;
    }
    const reason = busyReason(ctx, barber, start, end, ignoreAppointmentId);
    // Breaks and blocks are hidden rather than shown as taken.
    if (reason === 'break' || reason === 'closed') continue;
    out.push({ start, barberId: barber.id, available: !reason, reason });
  }
  return out;
}

/**
 * Slots for a specific barber, or merged across all eligible barbers for "any available".
 * For "any", each time shows as available if at least one barber is free (that barber is assigned).
 */
export function slotsFor(ctx: AvailabilityContext, barberId: ID | 'any', day: Date, service: Service, ignoreAppointmentId?: ID): SlotOption[] {
  const eligible = ctx.barbers.filter((b) => b.active && service.barberIds.includes(b.id) && (barberId === 'any' || b.id === barberId));
  if (barberId !== 'any') return eligible[0] ? slotsForBarber(ctx, eligible[0], day, service, ignoreAppointmentId) : [];
  const byTime = new Map<number, SlotOption>();
  for (const b of eligible) {
    for (const s of slotsForBarber(ctx, b, day, service, ignoreAppointmentId)) {
      const key = s.start.getTime();
      const existing = byTime.get(key);
      if (!existing || (!existing.available && s.available)) byTime.set(key, s);
    }
  }
  return [...byTime.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Nearest available alternatives to a requested time (same day first, then following days). */
export function suggestAlternatives(ctx: AvailabilityContext, barberId: ID | 'any', requested: Date, service: Service, count = 3): SlotOption[] {
  const out: SlotOption[] = [];
  for (let d = 0; d < 7 && out.length < count; d++) {
    const day = new Date(requested);
    day.setDate(day.getDate() + d);
    const open = slotsFor(ctx, barberId, day, service).filter((s) => s.available);
    const ranked = d === 0 ? open.sort((a, b) => Math.abs(a.start.getTime() - requested.getTime()) - Math.abs(b.start.getTime() - requested.getTime())) : open;
    for (const s of ranked) {
      if (out.length >= count) break;
      out.push(s);
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function isSlotFree(ctx: AvailabilityContext, barberId: ID, start: Date, service: Service, ignoreAppointmentId?: ID): boolean {
  const barber = ctx.barbers.find((b) => b.id === barberId);
  if (!barber) return false;
  return !busyReason(ctx, barber, start, addMinutes(start, service.durationMin + service.bufferMin), ignoreAppointmentId);
}
