import { addMinutes, clockToMinutes, minutesOfDay } from '@/lib/dates';
import type { Appointment, Barber, Weekday } from '@/types/models';

export const INACTIVE = new Set(['cancelled', 'no_show', 'rescheduled', 'expired']);

export interface PositionedAppointment {
  appointment: Appointment;
  top: number;
  height: number;
  lane: number;
  lanes: number;
}

/** Visible hour range for a day: earliest start / latest end across the given barbers (padded to the hour). */
export function hourRange(barbers: Barber[], weekday: Weekday, appointments: Appointment[] = []): [number, number] {
  let min = 24 * 60;
  let max = 0;
  for (const b of barbers) {
    const s = b.schedule[weekday];
    if (!s.enabled) continue;
    min = Math.min(min, clockToMinutes(s.start));
    max = Math.max(max, clockToMinutes(s.end));
  }
  for (const a of appointments) {
    const start = minutesOfDay(new Date(a.start));
    min = Math.min(min, start);
    max = Math.max(max, start + a.durationMin);
  }
  if (min >= max) return [9, 21];
  return [Math.floor(min / 60), Math.ceil(max / 60)];
}

/**
 * Positions appointments in a column. Active bookings get side-by-side lanes when they
 * overlap; inactive ones (cancelled, no-show…) are only drawn when they don't sit under
 * an active booking, so the grid stays readable.
 */
export function positionColumn(list: Appointment[], startHour: number, hourHeight: number): PositionedAppointment[] {
  const toTop = (d: Date) => ((minutesOfDay(d) - startHour * 60) / 60) * hourHeight;
  const active = list.filter((a) => !INACTIVE.has(a.status)).sort((a, b) => a.start.localeCompare(b.start));
  const inactive = list.filter((a) => INACTIVE.has(a.status));
  const overlaps = (a: Appointment, b: Appointment) => {
    const as = new Date(a.start).getTime();
    const bs = new Date(b.start).getTime();
    return as < bs + b.durationMin * 60000 && bs < as + a.durationMin * 60000;
  };
  const visibleInactive = inactive.filter((x) => !active.some((a) => overlaps(a, x)));
  const all = [...active, ...visibleInactive].sort((a, b) => a.start.localeCompare(b.start));

  const out: PositionedAppointment[] = [];
  let cluster: PositionedAppointment[] = [];
  let clusterEnd = 0;
  const laneEnds: number[] = [];
  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    cluster.forEach((c) => (c.lanes = lanes));
    out.push(...cluster);
    cluster = [];
    laneEnds.length = 0;
  };
  for (const a of all) {
    const s = new Date(a.start);
    const startMs = s.getTime();
    const endMs = addMinutes(s, a.durationMin).getTime();
    if (cluster.length && startMs >= clusterEnd) flush();
    let lane = laneEnds.findIndex((e) => e <= startMs);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = endMs;
    clusterEnd = Math.max(clusterEnd, endMs);
    cluster.push({ appointment: a, top: toTop(s), height: Math.max(18, (a.durationMin / 60) * hourHeight), lane, lanes: 1 });
  }
  flush();
  return out;
}
