import type { DB } from '@/data/mock';
import type { AttendanceRecord, ID, Learner, LearningModule, Session, TimeZoneId } from '@/data/models';
import { getLearner, getProgramme } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { DEMO_TODAY, diffDays, durationDays } from '@/utils/dates';

import { isUpcoming, sortByStart } from '../faculty-mode/common';

/** A learner's home time zone, from where they are based. */
export function learnerTz(l?: Learner): TimeZoneId {
  const c = l?.country ?? '';
  if (c.includes('Singapore') || c.includes('Malaysia') || c.includes('Hong Kong') || c.includes('China') || c.includes('Indonesia')) return 'Asia/Singapore';
  if (c.includes('UK')) return 'Europe/London';
  if (c.includes('Saudi')) return 'Asia/Riyadh';
  if (c.includes('India')) return 'Asia/Kolkata';
  return 'Asia/Dubai';
}

const ACTIVE = ['Registered', 'Confirmed', 'Attending', 'Completed'];

/**
 * Learner-scoped view of the shared database — only the participant's own enrolments,
 * sessions, published materials, assessments and records.
 */
export function useLearnerScope() {
  const db = useDB();
  const { userId } = useSession();
  return learnerScope(db, userId);
}

export function learnerScope(db: DB, learnerId: ID) {
  const me = getLearner(db, learnerId) ?? db.learners[0];
  const tz = learnerTz(me);
  const enrollments = db.enrollments.filter((e) => e.learnerId === me.id && e.status !== 'Withdrawn');
  const current = enrollments.find((e) => e.status === 'Attending') ?? enrollments.find((e) => ['Registered', 'Confirmed'].includes(e.status)) ?? enrollments[0];
  const currentProgramme = current ? getProgramme(db, current.programmeId) : undefined;
  const activeIds = enrollments.filter((e) => ACTIVE.includes(e.status)).map((e) => e.programmeId);
  const sessions = db.sessions.filter((s) => activeIds.includes(s.programmeId) && s.status !== 'Cancelled').sort(sortByStart);
  const upcoming = sessions.filter(isUpcoming);
  const past = sessions.filter((s) => !isUpcoming(s)).reverse();
  const materials = db.materials.filter((m) => activeIds.includes(m.programmeId) && m.learnerVisible);
  const assignments = db.assignments.filter((a) => activeIds.includes(a.programmeId) && (!currentProgramme || a.programmeId === currentProgramme.id));
  const submissions = db.submissions.filter((s) => s.learnerId === me.id);
  const assessments = db.assessments.filter((a) => activeIds.includes(a.programmeId));
  const notifications = db.notifications.filter((n) => n.audience === 'learner').sort((a, b) => b.date.localeCompare(a.date));
  const modules = currentProgramme ? db.modules.filter((m) => m.programmeId === currentProgramme.id).sort((a, b) => a.order - b.order) : [];
  return { me, tz, enrollments, current, currentProgramme, activeIds, sessions, upcoming, past, materials, assignments, submissions, assessments, notifications, modules };
}

/** Module progress from its dates relative to today (completed / in progress / upcoming). */
export function moduleProgress(m: LearningModule) {
  if (DEMO_TODAY > m.endDate) return { value: 100, state: 'Completed' as const };
  if (DEMO_TODAY < m.startDate) return { value: 0, state: 'Upcoming' as const };
  const value = Math.round((diffDays(DEMO_TODAY, m.startDate) / Math.max(1, durationDays(m.startDate, m.endDate))) * 100);
  return { value: Math.max(8, value), state: 'In progress' as const };
}

export type AttendanceRow = { id: string; title: string; date: string; status: AttendanceRecord['status']; session?: Session };

/**
 * Attendance history: recorded attendance plus the weekly live classes that preceded the
 * prototype's data window (illustrative, consistent with the 92% rate on the enrolment).
 */
export function attendanceHistory(db: DB, learnerId: ID, programmeId?: ID): AttendanceRow[] {
  const recorded: AttendanceRow[] = db.attendance
    .filter((a) => a.learnerId === learnerId)
    .map((a) => {
      const s = db.sessions.find((x) => x.id === a.sessionId);
      return { id: a.id, title: s?.title ?? 'Session', date: s?.date ?? DEMO_TODAY, status: a.status, session: s };
    })
    .filter((r) => !programmeId || r.session?.programmeId === programmeId);
  if (programmeId && programmeId !== 'p-smp') return recorded;
  const weekly: AttendanceRow[] = [
    { id: 'aw-1', title: 'Weekly live class · Industry structure in banking', date: '2027-03-09', status: 'Present' },
    { id: 'aw-2', title: 'Weekly live class · Sources of advantage', date: '2027-03-11', status: 'Present' },
    { id: 'aw-3', title: 'Weekly live class · Positioning choices', date: '2027-03-16', status: 'Late' },
    { id: 'aw-4', title: 'Executive coaching circle 1', date: '2027-03-18', status: 'Present' },
    { id: 'aw-5', title: 'Weekly live class · Ecosystems & platforms', date: '2027-03-23', status: 'Excused' },
    { id: 'aw-6', title: 'Mid-programme review with Atlas leadership', date: '2027-03-26', status: 'Present' },
  ];
  return [...recorded, ...weekly].sort((a, b) => b.date.localeCompare(a.date));
}

/** Announcements from the programme team (Learner Mode home). */
export function announcements(db: DB, programmeId?: ID) {
  const p = programmeId ? getProgramme(db, programmeId) : undefined;
  if (!p) return [];
  return [
    { id: 'an-1', title: 'Closing residency details are out', body: 'Lumen Conference Centre, Orchid Hall · 21–23 April. Please arrive by 08:45 on Day 1 — coffee from 08:15.', from: 's-yusuf', date: '2027-03-26T12:00', pinned: true },
    { id: 'an-2', title: 'Guest CFO joins Module 3', body: 'Prof. Amara Nwosu will co-lead the leadership simulation with Dr. Thorne on 21 April.', from: 's-yusuf', date: '2027-03-24T09:30' },
    { id: 'an-3', title: 'Peer reviews open', body: 'Review two colleagues’ positioning memos by Friday 2 April. Guidance is in the Learning Hub.', from: 's-aisha', date: '2027-03-27T08:00' },
  ];
}
