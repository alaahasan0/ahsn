/**
 * Simulated intent engine for the voice assistant prototype.
 *
 * Pure functions over the current store state: given an intent (what a real speech + NLU
 * pipeline would extract), return the assistant's reply and, when something should change,
 * a *proposal*. Proposals are never applied here — the UI shows a confirmation card and only
 * then calls the same validated store actions a human would (createAppointment, etc.).
 *
 * In production this module is replaced by: speech-to-text → LLM intent extraction →
 * backend "controlled actions" that validate availability, permissions and booking rules.
 */
import type { I18n } from '@/i18n';
import type { AppState } from '@/store/AppStore';
import { barberWorksOn, isSlotFree, type AvailabilityContext } from '@/store/availability';
import { now, today } from '@/lib/clock';
import { addDays, addMinutes, atClock, clockToMinutes, isSameDay, minutesToClock, overlaps, weekdayOf } from '@/lib/dates';
import { ACTIVE_STATUSES, type Appointment, type Customer, type ID, type Service, type Weekday } from '@/types/models';

export type Intent = 'book' | 'bookQuick' | 'next' | 'today' | 'cancel' | 'usual' | 'close' | 'count' | 'affirm' | 'error';

export type Proposal =
  | {
      kind: 'book';
      customerId: ID;
      serviceId: ID;
      barberId: ID;
      start: Date;
      requested: Date;
      requestedTaken: boolean;
      alternatives: Date[];
      /** First turn asks "shall I use X?" — the final summary comes after the user agrees. */
      needsAgreement: boolean;
    }
  | { kind: 'cancel'; appointmentId: ID }
  | { kind: 'block'; barberId: ID; start: Date; end: Date; affected: number };

export interface EngineResult {
  reply: string;
  proposal?: Proposal;
  appointmentIds?: ID[];
  /** Quick spoken replies the user can give (e.g. "آه."). */
  quickReplies?: Intent[];
  error?: boolean;
}

export interface EngineContext {
  state: AppState;
  avail: AvailabilityContext;
  barberId: ID;
  i18n: I18n;
}

const ACTIVE_FOR_COUNT = (a: Appointment) => !['cancelled', 'rescheduled', 'expired'].includes(a.status);

const HOURS_AR = ['', 'وحدة', 'ثنتين', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة', 'حدعش', 'ثنعش'];

/** Time as people say it: "خمسة ونصف" in Arabic, "5:30 PM" in English. */
export function spokenTime(d: Date, i18n: I18n): string {
  if (i18n.lang !== 'ar') return i18n.f.time(d);
  const h = d.getHours();
  const m = d.getMinutes();
  const word = (hour: number) => HOURS_AR[hour % 12 === 0 ? 12 : hour % 12];
  if (m === 0) return word(h);
  if (m === 15) return `${word(h)} وربع`;
  if (m === 30) return `${word(h)} ونصف`;
  if (m === 45) return `${word(h + 1)} إلا ربع`;
  return i18n.f.time(d);
}

/** "today" / "tomorrow" / "on Tuesday" / "يوم الثلاثاء" */
export function spokenDay(d: Date, i18n: I18n): string {
  if (isSameDay(d, today())) return i18n.t('voice.words.today');
  if (isSameDay(d, addDays(today(), 1))) return i18n.t('voice.words.tomorrow');
  return i18n.t('voice.words.on', { day: i18n.f.weekday(d) });
}

/** "قص شعر" → "قص الشعر" so the sentence reads naturally ("لخدمة قص الشعر"). */
export function spokenService(service: Service | undefined, i18n: I18n): string {
  const name = i18n.l(service?.name);
  if (i18n.lang === 'ar') return name.replace(/^(\S+) شعر$/, '$1 الشعر');
  return name.toLowerCase();
}

function findAhmad(state: AppState): Customer | undefined {
  return state.customers.find((c) => c.id === 'c1') ?? state.customers.find((c) => /ahmad/i.test(c.name.en));
}

function customerBusy(state: AppState, customerId: ID, start: Date, durationMin: number): boolean {
  const end = addMinutes(start, durationMin);
  return state.appointments.some((a) => a.customerId === customerId && ACTIVE_STATUSES.includes(a.status) && overlaps(start, end, new Date(a.start), addMinutes(new Date(a.start), a.durationMin)));
}

function free(ctx: EngineContext, barberId: ID, start: Date, service: Service, customerId: ID): boolean {
  return start > now() && isSlotFree(ctx.avail, barberId, start, service) && !customerBusy(ctx.state, customerId, start, service.durationMin);
}

/** Alternatives in half-hour steps (how people book by voice): later the same day first, then earlier, then next days. */
function alternatives(ctx: EngineContext, barberId: ID, requested: Date, service: Service, customerId: ID, count = 3): Date[] {
  const out: Date[] = [];
  const barber = ctx.state.barbers.find((b) => b.id === barberId);
  if (!barber) return out;
  for (let d = 0; d < 7 && out.length < count; d++) {
    const day = addDays(requested, d);
    if (!barberWorksOn(barber, day)) continue;
    const sched = barber.schedule[weekdayOf(day)];
    const open = clockToMinutes(sched.start);
    const close = clockToMinutes(sched.end);
    const base = d === 0 ? requested.getHours() * 60 + requested.getMinutes() : open;
    const candidates: number[] = [];
    for (let m = Math.ceil(base / 30) * 30; m + service.durationMin <= close; m += 30) candidates.push(m);
    if (d === 0) for (let m = Math.floor((base - 30) / 30) * 30; m >= open; m -= 30) candidates.push(m);
    for (const m of candidates) {
      if (out.length >= count) break;
      const s = atClock(day, minutesToClock(m));
      if (d === 0 && s.getTime() === requested.getTime()) continue;
      if (free(ctx, barberId, s, service, customerId)) out.push(s);
    }
  }
  return out;
}

function nextWeekday(wd: Weekday, after: Date = now()): Date {
  const base = today();
  for (let i = 0; i < 8; i++) {
    const d = addDays(base, i);
    if (d.getDay() === wd && (i > 0 || after < atClock(d, '21:00'))) return d;
  }
  return addDays(base, 7);
}

function bookingReply(ctx: EngineContext, p: Extract<Proposal, { kind: 'book' }>): string {
  const { i18n, state } = ctx;
  const c = state.customers.find((x) => x.id === p.customerId);
  const s = state.services.find((x) => x.id === p.serviceId);
  const b = state.barbers.find((x) => x.id === p.barberId);
  const params = { customer: i18n.l(c?.name).split(' ')[0], day: spokenDay(p.start, i18n), time: spokenTime(p.start, i18n), service: spokenService(s, i18n), barber: i18n.l(b?.name).split(' ')[0] };
  return p.barberId === ctx.barberId ? i18n.t('voice.replies.confirmBooking', params) : i18n.t('voice.replies.confirmBookingWith', params);
}

/**
 * The hour used by the "book Ahmad at five" demo. Prefers 5 PM; if 5 PM happens to be free
 * for this barber today we still use it (the flow then goes straight to confirmation).
 */
export function quickBookHour(ctx: EngineContext): Date {
  const service = ctx.state.services.find((s) => s.id === 's1')!;
  const ahmad = findAhmad(ctx.state);
  const candidates = [17, 18, 16, 19, 20].map((h) => atClock(today(), minutesToClock(h * 60)));
  const showcase = candidates.find((d) => d > now() && !isSlotFree(ctx.avail, ctx.barberId, d, service) && ahmad && free(ctx, ctx.barberId, addMinutes(d, 30), service, ahmad.id));
  return showcase ?? candidates[0];
}

function proposeBooking(ctx: EngineContext, requested: Date, opts: { serviceId?: ID; barberId?: ID; customerId?: ID; quick?: boolean }): EngineResult {
  const { state, i18n } = ctx;
  const customer = opts.customerId ? state.customers.find((c) => c.id === opts.customerId) : findAhmad(state);
  const barberId = opts.barberId ?? ctx.barberId;
  const service = state.services.find((s) => s.id === (opts.serviceId ?? customer?.preferredServiceIds[0] ?? 's1')) ?? state.services[0];
  if (!customer) return { reply: i18n.t('voice.replies.error'), error: true };
  const ok = free(ctx, barberId, requested, service, customer.id);
  const alts = ok ? alternatives(ctx, barberId, requested, service, customer.id, 3) : alternatives(ctx, barberId, requested, service, customer.id, 4);
  if (!ok && alts.length === 0) return { reply: i18n.t('voice.replies.noAlternative') };
  const proposal: Extract<Proposal, { kind: 'book' }> = {
    kind: 'book',
    customerId: customer.id,
    serviceId: service.id,
    barberId,
    start: ok ? requested : alts[0],
    requested,
    requestedTaken: !ok,
    alternatives: ok ? [] : alts,
    needsAgreement: !ok,
  };
  if (!ok) {
    const alt = spokenTime(alts[0], i18n);
    const reply =
      opts.quick && isSameDay(alts[0], requested)
        ? i18n.t('voice.replies.slotTaken', { time: spokenTime(requested, i18n), alt })
        : i18n.t('voice.replies.slotTakenDay', { day: spokenDay(requested, i18n), time: spokenTime(requested, i18n), alt: isSameDay(alts[0], requested) ? alt : `${spokenDay(alts[0], i18n)} ${alt}` });
    return { reply, proposal, quickReplies: ['affirm'] };
  }
  return { reply: bookingReply(ctx, proposal), proposal };
}

export function runIntent(intent: Intent, ctx: EngineContext, pending?: Proposal): EngineResult {
  const { state, i18n, barberId } = ctx;
  const mine = (day: Date) => state.appointments.filter((a) => a.barberId === barberId && isSameDay(new Date(a.start), day)).sort((a, b) => a.start.localeCompare(b.start));

  switch (intent) {
    case 'affirm': {
      if (pending?.kind === 'book') {
        const p = { ...pending, needsAgreement: false };
        return { reply: bookingReply(ctx, p), proposal: p };
      }
      return { reply: i18n.t('voice.replies.dismissed') };
    }
    case 'bookQuick':
      return proposeBooking(ctx, quickBookHour(ctx), { serviceId: 's1', quick: true });
    case 'book': {
      const tuesday = nextWeekday(2);
      return proposeBooking(ctx, atClock(tuesday, '17:00'), { serviceId: 's1' });
    }
    case 'usual': {
      const ahmad = findAhmad(state);
      if (!ahmad) return { reply: i18n.t('voice.replies.error'), error: true };
      const series = state.recurring.find((r) => r.customerId === ahmad.id && r.status === 'active');
      const last = state.appointments.filter((a) => a.customerId === ahmad.id && a.status === 'completed').sort((a, b) => b.start.localeCompare(a.start))[0];
      const wd = (series?.weekday ?? (last ? new Date(last.start).getDay() : 2)) as Weekday;
      const time = series?.time ?? (last ? minutesToClock(new Date(last.start).getHours() * 60 + new Date(last.start).getMinutes()) : '17:30');
      const serviceId = series?.serviceId ?? last?.serviceId ?? 's1';
      const usualBarber = series?.barberId ?? last?.barberId ?? barberId;
      // "Next week": the same weekday in the coming calendar week.
      const requested = atClock(addDays(today(), ((wd - today().getDay() + 7) % 7) + 7), time);
      const svc = state.services.find((s) => s.id === serviceId);
      const intro = i18n.t('voice.replies.usual', {
        customer: i18n.l(ahmad.name).split(' ')[0],
        weekday: i18n.lang === 'ar' ? `يوم ${i18n.f.weekday(wd)}` : `on ${i18n.f.weekday(wd)}s`,
        time: spokenTime(atClock(today(), time), i18n),
        service: spokenService(svc, i18n),
        date: i18n.f.dateLong(requested),
      });
      const r = proposeBooking(ctx, requested, { serviceId, barberId: usualBarber, customerId: ahmad.id });
      return { ...r, reply: `${intro} ${r.reply}` };
    }
    case 'next': {
      const current = now();
      const next = mine(today()).find((a) => new Date(a.start) > current && ['confirmed', 'pending', 'draft'].includes(a.status));
      if (!next) return { reply: i18n.t('voice.replies.nextNone') };
      const c = state.customers.find((x) => x.id === next.customerId);
      const s = state.services.find((x) => x.id === next.serviceId);
      return { reply: i18n.t('voice.replies.next', { customer: i18n.l(c?.name), time: spokenTime(new Date(next.start), i18n), service: i18n.l(s?.name) }), appointmentIds: [next.id] };
    }
    case 'today': {
      const list = mine(today()).filter(ACTIVE_FOR_COUNT);
      if (!list.length) return { reply: i18n.t('voice.replies.todayNone') };
      return { reply: i18n.t('voice.replies.today', { count: list.length }), appointmentIds: list.map((a) => a.id) };
    }
    case 'count': {
      const list = mine(today()).filter((a) => ACTIVE_FOR_COUNT(a) && a.status !== 'no_show');
      if (!list.length) return { reply: i18n.t('voice.replies.countNone') };
      const done = list.filter((a) => a.status === 'completed').length;
      return { reply: i18n.t('voice.replies.count', { total: list.length, done, left: list.length - done }) };
    }
    case 'cancel': {
      const ahmad = findAhmad(state);
      const name = i18n.l(ahmad?.name).split(' ')[0];
      const next = state.appointments
        .filter((a) => a.customerId === ahmad?.id && new Date(a.start) > now() && ['confirmed', 'pending', 'draft'].includes(a.status))
        .sort((a, b) => a.start.localeCompare(b.start))[0];
      if (!next) return { reply: i18n.t('voice.replies.cancelNone', { customer: name }) };
      const s = state.services.find((x) => x.id === next.serviceId);
      const start = new Date(next.start);
      return {
        reply: i18n.t('voice.replies.cancel', { customer: name, day: spokenDay(start, i18n), time: spokenTime(start, i18n), service: i18n.l(s?.name) }),
        proposal: { kind: 'cancel', appointmentId: next.id },
      };
    }
    case 'close': {
      const thursday = nextWeekday(4);
      const barber = state.barbers.find((b) => b.id === barberId);
      const date = i18n.f.dateLong(thursday);
      if (!barber || !barberWorksOn(barber, thursday)) return { reply: i18n.t('voice.replies.closeOff', { date }) };
      const sched = barber.schedule[4];
      const affected = mine(thursday).filter((a) => ['confirmed', 'pending', 'draft'].includes(a.status)).length;
      const start = atClock(thursday, sched.start);
      const end = atClock(thursday, sched.end);
      return {
        reply: i18n.t('voice.replies.close', {
          date,
          hours: i18n.f.timeRange(start, end),
          affected: affected ? i18n.t('voice.replies.closeAffected', { count: affected }) : i18n.t('voice.replies.closeNoAffected'),
        }),
        proposal: { kind: 'block', barberId, start, end, affected },
      };
    }
    case 'error':
    default:
      return { reply: i18n.t('voice.replies.error'), error: true };
  }
}

/** The words the (simulated) speech recogniser "hears" for an intent. */
export function utteranceFor(intent: Intent, ctx: EngineContext): string {
  const { i18n } = ctx;
  if (intent === 'bookQuick') {
    const d = quickBookHour(ctx);
    return i18n.t('voice.commands.bookQuick', { hour: i18n.lang === 'ar' ? spokenTime(d, i18n) : i18n.f.time(d).replace(':00', '') });
  }
  if (intent === 'error') return i18n.lang === 'ar' ? 'احجز… اه… ال… بكرا…' : 'Book… uh… the… tomorrow…';
  return i18n.t(`voice.commands.${intent}`);
}

export const SUGGESTED_INTENTS: Intent[] = ['bookQuick', 'book', 'next', 'today', 'count', 'cancel', 'usual', 'close'];
