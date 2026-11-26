import type { DB } from '@/data/mock';
import type { ISODate, Session, TimeOfDay, TimeZoneId } from '@/data/models';
import { addDays, convertZone, diffDays, minutesOf, TIMEZONES } from '@/utils/dates';

export type CalendarFilter = { kind: 'all' } | { kind: 'programme'; id: string } | { kind: 'faculty'; id: string };
export type TzMode = 'viewer' | 'local';

export type Occurrence = {
  key: string;
  session: Session;
  date: ISODate;
  start: TimeOfDay;
  end: TimeOfDay;
  zone: string; // abbreviation of the zone the times are expressed in
  dayIndex: number; // 1-based day within a multi-day session
  dayTotal: number;
};

export function matchesFilter(s: Session, f: CalendarFilter) {
  if (s.status === 'Cancelled') return false;
  if (f.kind === 'programme') return s.programmeId === f.id;
  if (f.kind === 'faculty') return s.facultyIds.includes(f.id);
  return true;
}

/** Every appearance of a session on a given day, expressed in the viewer's zone or the session's own zone. */
export function occurrencesOn(db: DB, day: ISODate, filter: CalendarFilter, tzMode: TzMode, viewerTz: TimeZoneId): Occurrence[] {
  const from = addDays(day, -1);
  const to = addDays(day, 1);
  const out: Occurrence[] = [];
  for (const s of db.sessions) {
    if (!matchesFilter(s, filter)) continue;
    if (s.date > to || s.endDate < from) continue;
    const total = diffDays(s.endDate, s.date) + 1;
    for (let i = 0; i < total; i++) {
      const d = addDays(s.date, i);
      if (tzMode === 'viewer' && s.timeZone !== viewerTz) {
        const a = convertZone(d, s.start, s.timeZone, viewerTz);
        const b = convertZone(d, s.end, s.timeZone, viewerTz);
        if (a.date !== day) continue;
        out.push({ key: `${s.id}-${d}`, session: s, date: day, start: a.time, end: b.date === a.date ? b.time : '23:59', zone: TIMEZONES[viewerTz].abbr, dayIndex: i + 1, dayTotal: total });
      } else {
        if (d !== day) continue;
        out.push({ key: `${s.id}-${d}`, session: s, date: day, start: s.start, end: s.end, zone: TIMEZONES[tzMode === 'viewer' ? viewerTz : s.timeZone].abbr, dayIndex: i + 1, dayTotal: total });
      }
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start) || a.session.title.localeCompare(b.session.title));
}

/** Assign side-by-side lanes to overlapping occurrences for the day grid. */
export function layoutLanes(list: Occurrence[]) {
  const lanes: number[] = [];
  const placed = list.map((o) => {
    const s = minutesOf(o.start);
    const e = Math.max(s + 20, minutesOf(o.end));
    let lane = lanes.findIndex((end) => end <= s);
    if (lane === -1) {
      lane = lanes.length;
      lanes.push(e);
    } else lanes[lane] = e;
    return { o, lane, s, e };
  });
  // lane count per cluster of overlaps
  return placed.map((p) => {
    const overlapping = placed.filter((q) => q.s < p.e && p.s < q.e);
    const count = Math.max(...overlapping.map((q) => q.lane)) + 1;
    return { ...p, count };
  });
}
