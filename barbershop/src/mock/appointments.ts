/**
 * Deterministic mock schedule generator.
 *
 * Builds ~10 weeks of history and two weeks of upcoming bookings for The Barber House,
 * relative to the demo clock, so every screen (dashboard, calendar, analytics, CRM) shows a
 * coherent, realistic salon. This is prototype scaffolding — it is not business logic and
 * will be replaced by database reads.
 */
import { DEMO_NOW, today } from '@/lib/clock';
import { addDays, addMinutes, atClock, clockToMinutes, isSameDay, minutesToClock, overlaps, toISODate, weekdayOf } from '@/lib/dates';
import { linkToken, seeded } from '@/lib/id';
import { seriesOccurrences } from '@/lib/recurrence';
import type {
  Appointment,
  AppointmentEvent,
  AppointmentStatus,
  BookingSource,
  Barber,
  Customer,
  RecurringSeries,
  Service,
  TimeBlock,
} from '@/types/models';

import { customers as allCustomers } from './customers';
import { recurringSeries } from './recurring';
import { SALON_ID, salon } from './salon';
import { services as allServices } from './services';
import { barbers as allBarbers } from './team';

const rand = seeded(20261128);
const T = today();
const NOW = DEMO_NOW;
const HISTORY_DAYS = 70;
const FUTURE_DAYS = 21;

const pickWeighted = <T,>(items: T[], weight: (t: T) => number): T => {
  const total = items.reduce((s, it) => s + weight(it), 0);
  let r = rand() * total;
  for (const it of items) {
    r -= weight(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
};

const chance = (p: number) => rand() < p;
const roundTo = (min: number, step: number) => Math.ceil(min / step) * step;

const SERVICE_WEIGHT: Record<string, number> = { s1: 30, s3: 24, s7: 15, s2: 12, s5: 7, s4: 3, s6: 5, s8: 2, s9: 0.25 };
const SOURCE_WEIGHT: Record<BookingSource, number> = { phone: 30, whatsapp: 30, online: 21, walk_in: 12, staff: 7, recurring: 0, voice: 0 };
const CATEGORY_WEIGHT = { trusted: 4, regular: 3, new: 0.35 };
const NO_SHOW = { trusted: 0.005, regular: 0.04, new: 0.13 };
const CANCEL = { trusted: 0.03, regular: 0.06, new: 0.1 };

let seq = 0;
const nextId = () => `a${(++seq).toString().padStart(4, '0')}`;
let evSeq = 0;
const ev = (at: Date, type: AppointmentEvent['type'], actor: AppointmentEvent['actor'], detail?: string): AppointmentEvent => ({
  id: `e${++evSeq}`,
  at: at.toISOString(),
  type,
  actor,
  detail,
});

export const timeBlocks: TimeBlock[] = [
  { id: 'tb1', barberId: 'b1', start: atClock(T, '16:30').toISOString(), end: atClock(T, '17:00').toISOString(), reason: 'meeting', note: 'Supplier visit — new clippers' },
  { id: 'tb2', barberId: 'b3', start: atClock(addDays(T, 1), '12:00').toISOString(), end: atClock(addDays(T, 1), '13:00').toISOString(), reason: 'personal', note: 'University registration' },
  { id: 'tb3', barberId: 'all', start: atClock(addDays(T, 6), '09:00').toISOString(), end: atClock(addDays(T, 6), '11:00').toISOString(), reason: 'meeting', note: 'Team training: new booking system' },
];

interface Busy {
  start: Date;
  end: Date;
}

function buildHistory(a: Appointment, customer: Customer, service: Service): AppointmentEvent[] {
  const created = new Date(a.createdAt);
  const start = new Date(a.start);
  const end = addMinutes(start, a.durationMin);
  const createdActor: AppointmentEvent['actor'] = a.source === 'online' ? 'customer' : a.source === 'recurring' ? 'system' : a.source === 'voice' ? 'voice' : 'staff';
  const h: AppointmentEvent[] = [ev(created, 'created', createdActor, a.source)];
  if (a.confirmation) {
    h.push(ev(new Date(a.confirmation.sentAt), 'link_sent', 'system', a.confirmation.channel));
  }
  const confirmAt = a.confirmation ? addMinutes(new Date(a.confirmation.sentAt), 20 + Math.floor(rand() * 300)) : addMinutes(created, 1);
  switch (a.status) {
    case 'confirmed':
      if (a.confirmation) h.push(ev(confirmAt, 'confirmed', 'customer'));
      break;
    case 'checked_in':
      if (a.confirmation) h.push(ev(confirmAt, 'confirmed', 'customer'));
      h.push(ev(addMinutes(start, -3), 'checked_in', 'staff'));
      break;
    case 'completed':
      if (a.confirmation) h.push(ev(confirmAt, 'confirmed', 'customer'));
      if (start.getTime() - created.getTime() > 3 * 3600_000) h.push(ev(addMinutes(start, -120), 'reminder_sent', 'system', customer.preferredChannel));
      h.push(ev(addMinutes(start, -2), 'checked_in', 'staff'));
      h.push(ev(addMinutes(end, 2), 'completed', 'staff', String(service.price)));
      break;
    case 'no_show':
      if (a.confirmation) h.push(ev(confirmAt, 'confirmed', 'customer'));
      h.push(ev(addMinutes(start, 15), 'no_show', 'staff'));
      break;
    case 'cancelled': {
      const cancelAt = new Date(Math.min(addMinutes(start, -90).getTime(), Math.max(created.getTime() + 600_000, NOW.getTime() - 3600_000 * (1 + rand() * 20))));
      h.push(ev(cancelAt < created ? addMinutes(created, 10) : cancelAt, 'cancelled', chance(0.6) ? 'customer' : 'staff', a.cancellationReason));
      break;
    }
    case 'expired':
      if (a.confirmation) h.push(ev(new Date(a.confirmation.expiresAt), 'expired', 'system'));
      break;
    default:
      break;
  }
  return h.sort((x, y) => x.at.localeCompare(y.at));
}

const CANCEL_REASONS = ['Travelling', 'Work came up', 'Feeling unwell', 'Rescheduling with family', 'Exam day'];

function generate(barbers: Barber[], services: Service[], customers: Customer[], series: RecurringSeries[]): Appointment[] {
  const out: Appointment[] = [];
  const serviceById = new Map(services.map((s) => [s.id, s]));
  const customerById = new Map(customers.map((c) => [c.id, c]));

  for (let offset = -HISTORY_DAYS; offset <= FUTURE_DAYS; offset++) {
    const day = addDays(T, offset);
    const wd = weekdayOf(day);
    const isToday = offset === 0;
    const isPast = offset < 0;
    const bookedToday = new Set<string>();
    for (const s of series) {
      if (seriesOccurrences(s, day, addDays(day, 1)).some((o) => isSameDay(o, day))) bookedToday.add(s.customerId);
    }

    for (const barber of barbers) {
      const sched = barber.schedule[wd];
      if (!sched.enabled || barber.daysOff.includes(toISODate(day))) continue;

      const busy: Busy[] = sched.breaks.map((b) => ({ start: atClock(day, b.start), end: atClock(day, b.end) }));
      for (const tb of timeBlocks) {
        if ((tb.barberId === barber.id || tb.barberId === 'all') && isSameDay(new Date(tb.start), day)) busy.push({ start: new Date(tb.start), end: new Date(tb.end) });
      }

      // 1. Recurring occurrences first — they own their slots.
      for (const s of series.filter((x) => x.barberId === barber.id)) {
        for (const occ of seriesOccurrences(s, day, addDays(day, 1))) {
          if (!isSameDay(occ, day)) continue;
          const svc = serviceById.get(s.serviceId)!;
          const cust = customerById.get(s.customerId)!;
          const end = addMinutes(occ, svc.durationMin);
          if (busy.some((b) => overlaps(occ, end, b.start, b.end))) continue;
          busy.push({ start: occ, end: addMinutes(end, svc.bufferMin) });
          bookedToday.add(cust.id);
          let status: AppointmentStatus;
          if (end <= NOW) status = chance(NO_SHOW[cust.category] * 2) ? 'no_show' : 'completed';
          else if (occ <= NOW) status = 'checked_in';
          else status = s.mode === 'fixed' ? 'confirmed' : offset <= s.inviteDaysBefore ? 'pending' : 'draft';
          const createdAt = s.mode === 'fixed' ? addDays(occ, -14) : addDays(occ, -s.inviteDaysBefore);
          const appt: Appointment = {
            id: nextId(),
            salonId: SALON_ID,
            customerId: cust.id,
            serviceId: svc.id,
            barberId: barber.id,
            start: occ.toISOString(),
            durationMin: svc.durationMin,
            price: svc.price,
            status,
            source: 'recurring',
            createdAt: (createdAt > NOW ? NOW : createdAt).toISOString(),
            createdBy: 'system',
            recurringId: s.id,
            notes: [],
            history: [],
          };
          if (s.mode === 'invitation' && status !== 'draft') {
            const sentAt = createdAt > NOW ? NOW : createdAt;
            appt.confirmation = { token: linkToken(rand), channel: cust.preferredChannel === 'sms' ? 'sms' : 'whatsapp', sentAt: sentAt.toISOString(), expiresAt: addMinutes(sentAt, salon.confirmationLinkHours * 60).toISOString() };
          }
          out.push(appt);
        }
      }

      // 2. Fill the rest of the day.
      const dayStart = clockToMinutes(sched.start);
      const dayEnd = clockToMinutes(sched.end);
      const fill = isPast ? 0.8 : isToday ? 0.86 : Math.max(0.12, 0.8 - offset * 0.05);
      let cursor = dayStart + (chance(0.5) ? 0 : 15);
      while (cursor + 20 <= dayEnd) {
        const pool = customers.filter((c) => !bookedToday.has(c.id) && (c.category !== 'new' || offset > -Math.max(1, Math.round((NOW.getTime() - new Date(c.createdAt).getTime()) / 86_400_000))));
        if (pool.length === 0) break;
        const cust = pickWeighted(pool, (c) => CATEGORY_WEIGHT[c.category] * (c.preferredBarberId === barber.id ? 3.5 : c.preferredBarberId ? 0.5 : 1));
        const offered = services.filter((s) => barber.serviceIds.includes(s.id) && s.active);
        const preferred = offered.filter((s) => cust.preferredServiceIds.includes(s.id));
        const svc = preferred.length && chance(0.75) ? pickWeighted(preferred, () => 1) : pickWeighted(offered, (s) => SERVICE_WEIGHT[s.id] ?? 1);
        if (cursor + svc.durationMin > dayEnd) break;
        const start = atClock(day, minutesToClock(cursor));
        const end = addMinutes(start, svc.durationMin);
        const clash = busy.find((b) => overlaps(start, addMinutes(end, svc.bufferMin), b.start, b.end));
        if (clash) {
          cursor = roundTo(clash.end.getHours() * 60 + clash.end.getMinutes(), 15);
          continue;
        }
        if (!chance(fill)) {
          cursor += 15 * (1 + Math.floor(rand() * 3));
          continue;
        }
        bookedToday.add(cust.id);

        let source = pickWeighted(Object.keys(SOURCE_WEIGHT) as BookingSource[], (s) => SOURCE_WEIGHT[s]);
        if (source === 'walk_in' && start > NOW) source = 'phone';
        if (source === 'whatsapp' && !cust.whatsapp) source = 'phone';

        let status: AppointmentStatus;
        let cancellationReason: string | undefined;
        if (end <= NOW) {
          const r = rand();
          if (r < NO_SHOW[cust.category] && source !== 'walk_in') status = 'no_show';
          else if (r < NO_SHOW[cust.category] + CANCEL[cust.category] && source !== 'walk_in') status = 'cancelled';
          else status = 'completed';
        } else if (start <= NOW) {
          status = 'checked_in';
        } else {
          const r = rand();
          if (r < 0.035) status = 'cancelled';
          else if (cust.category === 'trusted' || source === 'walk_in') status = 'confirmed';
          else if (r < 0.06 && (source === 'online' || source === 'whatsapp')) status = 'draft';
          else if (r < 0.085 && offset >= 1 && offset <= 4) status = 'expired';
          else status = r < (offset === 0 ? 0.68 : 0.55) ? 'confirmed' : 'pending';
        }
        if (status === 'cancelled') cancellationReason = CANCEL_REASONS[Math.floor(rand() * CANCEL_REASONS.length)];

        const leadHours = source === 'walk_in' ? 0.15 : source === 'online' ? 6 + rand() * 100 : 2 + rand() * 120;
        let createdAt = addMinutes(start, -leadHours * 60);
        if (createdAt > NOW) createdAt = addMinutes(NOW, -Math.floor(rand() * 600) - 5);
        if (status === 'expired') createdAt = addMinutes(NOW, -(26 + Math.floor(rand() * 30)) * 60);

        const appt: Appointment = {
          id: nextId(),
          salonId: SALON_ID,
          customerId: cust.id,
          serviceId: svc.id,
          barberId: barber.id,
          start: start.toISOString(),
          durationMin: svc.durationMin,
          price: svc.price,
          status,
          source,
          createdAt: createdAt.toISOString(),
          createdBy: source === 'online' ? 'customer' : 'staff',
          cancellationReason,
          notes: [],
          history: [],
        };
        const needsLink = source !== 'walk_in' && source !== 'online' && status !== 'draft' && (cust.category !== 'trusted' || chance(0.3));
        if (needsLink) {
          const sentAt = addMinutes(createdAt, 1);
          appt.confirmation = {
            token: linkToken(rand),
            channel: cust.preferredChannel === 'sms' || !cust.whatsapp ? 'sms' : 'whatsapp',
            sentAt: sentAt.toISOString(),
            expiresAt: addMinutes(sentAt, salon.confirmationLinkHours * 60).toISOString(),
            openedAt: status !== 'pending' && status !== 'expired' ? addMinutes(sentAt, 12).toISOString() : chance(0.4) ? addMinutes(sentAt, 30).toISOString() : undefined,
          };
        }
        out.push(appt);
        busy.push({ start, end: addMinutes(end, svc.bufferMin) });
        const gap = pickWeighted([0, 0, 0, 15, 15, 30], () => 1);
        cursor = roundTo(cursor + svc.durationMin + svc.bufferMin + gap, 15);
      }
    }
  }
  return out;
}

function curate(list: Appointment[], customers: Customer[]): Appointment[] {
  const byCustomer = new Map(customers.map((c) => [c.id, c]));
  const todays = list.filter((a) => isSameDay(new Date(a.start), T)).sort((a, b) => a.start.localeCompare(b.start));
  const pastToday = todays.filter((a) => addMinutes(new Date(a.start), a.durationMin) <= NOW && a.source !== 'recurring' && a.source !== 'walk_in');
  const futureToday = todays.filter((a) => new Date(a.start) > NOW && a.source !== 'recurring');

  // Guarantee showcase states on the demo day.
  if (pastToday.length >= 4) {
    const ns = pastToday.find((a) => byCustomer.get(a.customerId)?.category !== 'trusted') ?? pastToday[1];
    ns.status = 'no_show';
    const cx = pastToday.find((a) => a !== ns && a.status === 'completed' && a.barberId !== ns.barberId);
    if (cx) {
      cx.status = 'cancelled';
      cx.cancellationReason = 'Work came up';
    }
  }
  futureToday.slice(0, 3).forEach((a, i) => {
    if (a.status === 'confirmed' && i < 2 && byCustomer.get(a.customerId)?.category !== 'trusted') a.status = 'pending';
  });
  for (const a of futureToday) {
    if (a.status === 'pending' && !a.confirmation) {
      const sentAt = addMinutes(new Date(a.createdAt), 1);
      a.confirmation = { token: linkToken(rand), channel: 'whatsapp', sentAt: sentAt.toISOString(), expiresAt: addMinutes(sentAt, 24 * 60).toISOString() };
    }
  }

  // One appointment from today moved to tomorrow (shows the rescheduled trail).
  const movable = futureToday.find((a) => a.status === 'confirmed' && a.source === 'phone');
  if (movable) {
    const newStart = addDays(new Date(movable.start), 1);
    const replacement: Appointment = {
      ...movable,
      id: nextId(),
      start: newStart.toISOString(),
      status: 'confirmed',
      rescheduledFromId: movable.id,
      createdAt: addMinutes(NOW, -95).toISOString(),
      notes: [],
      history: [],
    };
    movable.status = 'rescheduled';
    movable.rescheduledToId = replacement.id;
    list.push(replacement);
  }

  // Online booking requests waiting for the salon (inbox "Requests").
  const requestSlots: [string, string, number, string, string, BookingSource][] = [
    ['c23', 's1', 1, '18:30', 'b3', 'online'],
    ['c11', 's7', 2, '16:00', 'b2', 'whatsapp'],
    ['c26', 's7', 3, '12:15', 'b2', 'online'],
  ];
  for (const [cid, sid, dayOffset, time, bid, source] of requestSlots) {
    const svc = allServices.find((s) => s.id === sid)!;
    const start = atClock(addDays(T, dayOffset), time);
    const clash = list.some((a) => a.barberId === bid && ['confirmed', 'pending', 'draft', 'checked_in'].includes(a.status) && overlaps(new Date(a.start), addMinutes(new Date(a.start), a.durationMin), start, addMinutes(start, svc.durationMin)));
    if (clash) continue;
    list.push({
      id: nextId(),
      salonId: SALON_ID,
      customerId: cid,
      serviceId: sid,
      barberId: bid,
      start: start.toISOString(),
      durationMin: svc.durationMin,
      price: svc.price,
      status: 'draft',
      source,
      createdAt: addMinutes(NOW, -(20 + dayOffset * 37)).toISOString(),
      createdBy: source === 'online' ? 'customer' : 'staff',
      notes: [],
      history: [],
    });
  }

  // A few internal notes.
  const notes: [string, string][] = [
    ['c1', 'Asked to keep the top longer this time.'],
    ['c6', 'Bring the sandalwood aftershave — his favourite.'],
    ['c15', 'Coming with both kids. Book the next slot for the younger one.'],
    ['c9', 'Called to confirm — running 5 minutes late.'],
  ];
  for (const [cid, text] of notes) {
    const target = list.filter((a) => a.customerId === cid && new Date(a.start) >= addDays(T, -1)).sort((a, b) => a.start.localeCompare(b.start))[0];
    if (target) target.notes.push({ id: `n_${target.id}`, at: addMinutes(NOW, -180).toISOString(), authorId: 'u1', text });
  }

  return list;
}

function finalize(list: Appointment[]): Appointment[] {
  const customerById = new Map(allCustomers.map((c) => [c.id, c]));
  const serviceById = new Map(allServices.map((s) => [s.id, s]));
  for (const a of list) {
    a.history = buildHistory(a, customerById.get(a.customerId)!, serviceById.get(a.serviceId)!);
    if (a.status === 'rescheduled') a.history.push(ev(addMinutes(NOW, -95), 'rescheduled', 'customer'));
    if (a.rescheduledFromId) a.history.unshift(ev(new Date(a.createdAt), 'rescheduled', 'customer', a.rescheduledFromId));
    for (const n of a.notes) a.history.push(ev(new Date(n.at), 'note', 'staff', n.text));
    a.history.sort((x, y) => x.at.localeCompare(y.at));
  }
  return list.sort((a, b) => a.start.localeCompare(b.start));
}

export const appointments: Appointment[] = finalize(curate(generate(allBarbers, allServices, allCustomers, recurringSeries), allCustomers));
