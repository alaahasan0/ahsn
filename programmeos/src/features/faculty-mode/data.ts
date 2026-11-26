import type { DB } from '@/data/mock';
import type { FacultyAssignment, ID, ISODate, ISODateTime, Money } from '@/data/models';
import { getFaculty, getProgramme } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';

import { isUpcoming, sortByStart } from './common';

/**
 * Faculty-scoped view of the shared database. Only records that belong to the signed-in
 * instructor are exposed — no budgets, margins or other programmes' data.
 */
export function useFacultyScope() {
  const db = useDB();
  const { userId } = useSession();
  return facultyScope(db, userId);
}

export function facultyScope(db: DB, facultyId: ID) {
  const me = getFaculty(db, facultyId) ?? db.faculty[0];
  const assignments = db.facultyAssignments.filter((a) => a.facultyId === me.id);
  const programmeIds = [...new Set(assignments.map((a) => a.programmeId))];
  const programmes = programmeIds.map((id) => getProgramme(db, id)!).filter(Boolean);
  const sessions = db.sessions.filter((s) => s.facultyIds.includes(me.id)).sort(sortByStart);
  const upcoming = sessions.filter(isUpcoming);
  const past = sessions.filter((s) => !isUpcoming(s)).reverse();
  const materials = db.materials.filter((m) => m.ownerFacultyId === me.id);
  const itineraries = db.itineraries.filter((t) => t.traveller.kind === 'faculty' && t.traveller.id === me.id);
  const bookings = db.hotelBookings.filter((b) => b.guest.kind === 'faculty' && b.guest.id === me.id);
  const documents = db.documents.filter((d) => d.facultyId === me.id || (d.visibleToFaculty && (!d.programmeId || programmeIds.includes(d.programmeId))));
  const feedback = db.facultyFeedback.filter((f) => f.facultyId === me.id);
  const notifications = db.notifications.filter((n) => n.audience === 'faculty').sort((a, b) => b.date.localeCompare(a.date));
  return { me, assignments, programmeIds, programmes, sessions, upcoming, past, materials, itineraries, bookings, documents, feedback, notifications };
}

export const READY_STATUSES: FacultyAssignment['status'][] = ['Confirmed', 'Contract Issued', 'Contracted'];

// ─── Payment schedule (faculty's own fees only) ───────────────────────────────

export type FeeInstalment = { label: string; amount: Money; status: 'Paid' | 'Scheduled' | 'Invoice due' | 'Awaiting acceptance' | 'Submitted'; date: ISODate };

/** Instalments per engagement, derived from the assignment and programme dates. */
export function feeSchedule(db: DB, a: FacultyAssignment, submittedInvoices: ID[] = []): FeeInstalment[] {
  const p = getProgramme(db, a.programmeId);
  if (!p) return [];
  if (!READY_STATUSES.includes(a.status)) return [{ label: 'Proposed fee', amount: a.fee, status: 'Awaiting acceptance', date: p.startDate }];
  const finished = p.endDate < '2027-03-29' || p.archived;
  if (finished) return [{ label: 'Full fee', amount: a.fee, status: 'Paid', date: p.endDate }];
  if (p.deliveryMode === 'Hybrid' && p.type === '6-Month Hybrid Programme') {
    const half = Math.round(a.fee / 2);
    return [
      { label: 'On contract (50%)', amount: half, status: 'Paid', date: '2027-03-12' },
      { label: 'After delivery (50%)', amount: a.fee - half, status: submittedInvoices.includes(a.id) ? 'Submitted' : 'Scheduled', date: p.endDate },
    ];
  }
  return [{ label: 'After delivery', amount: a.fee, status: submittedInvoices.includes(a.id) ? 'Submitted' : 'Invoice due', date: p.endDate }];
}

// ─── Historical evaluation scores (for the trend line) ────────────────────────

/** Earlier engagements not modelled as programmes in the sample data; illustrative. */
export const RATING_HISTORY: Record<ID, { label: string; value: number }[]> = {
  'f-vasquez': [
    { label: 'Mar 26', value: 4.7 },
    { label: 'Jun 26', value: 4.8 },
    { label: 'Sep 26', value: 4.8 },
    { label: 'Nov 26', value: 4.9 },
    { label: 'Feb 27', value: 4.8 },
  ],
};

// ─── Messages from the programme team (faculty's point of view) ───────────────

export type TeamMessage = { id: ID; fromId: ID; subject: string; body: string; date: ISODateTime; programmeId?: ID; unread: boolean };

export function teamMessages(db: DB, facultyId: ID): TeamMessage[] {
  const me = getFaculty(db, facultyId);
  // Real references where this instructor is the counterpart…
  const fromComms: TeamMessage[] = db.communications
    .filter((c) => c.counterpart.kind === 'faculty' && me && c.counterpart.name.includes(me.name))
    .map((c) => ({ id: c.id, fromId: 's-daniel', subject: c.subject, body: c.excerpt, date: c.date, programmeId: c.programmeId, unread: c.unread }));
  // …plus the operational messages the team has sent this instructor.
  const sent: TeamMessage[] =
    facultyId === 'f-vasquez'
      ? [
          { id: 'tm-1', fromId: 's-layla', subject: 'Meridian context briefing — Tue 6 April', body: 'Hi Elena, I’ve booked 30 minutes on Tuesday at 14:00 BST to walk all four faculty through Meridian’s 2035 strategy and the participant profiles. Zoom link in the invite.', date: '2027-03-28T11:00', programmeId: 'p-elp', unread: true },
          { id: 'tm-2', fromId: 's-daniel', subject: 'Teaching request: Public Sector Leadership', body: 'Would you be available for one day on 9 June in Riyadh to lead the session on leading through ambiguity? Fee $6,500 plus travel. Please reply by 2 April.', date: '2027-03-26T10:30', programmeId: 'p-psl', unread: true },
          { id: 'tm-3', fromId: 's-sofia', subject: 'Your ELP itinerary is confirmed', body: 'EK 004 departs Heathrow Friday 9 April at 21:55. A driver from Desert Line will meet you at Arrivals, Terminal 3. Your early check-in is confirmed.', date: '2027-03-19T15:10', programmeId: 'p-elp', unread: false },
          { id: 'tm-4', fromId: 's-priya', subject: 'Keynote deck approved', body: 'Thank you for the quick turnaround on slide 14. The deck is approved for print and will be on the learner portal from 5 April.', date: '2027-03-21T09:40', programmeId: 'p-elp', unread: false },
          { id: 'tm-5', fromId: 's-omar', subject: 'Site visit on 15 April', body: 'The coach leaves the hotel at 08:30. Meridian security needs ID details for everyone — I’ll use the passport copy we hold unless you tell me otherwise.', date: '2027-03-26T12:20', programmeId: 'p-elp', unread: false },
        ]
      : [];
  return [...sent, ...fromComms].sort((a, b) => b.date.localeCompare(a.date));
}
