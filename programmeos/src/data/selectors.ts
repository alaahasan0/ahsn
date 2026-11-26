import { DEMO_TODAY, absoluteMinutes, diffDays, durationDays } from '@/utils/dates';
import { clamp } from '@/utils/format';

import type { DB } from './mock';
import type {
  Faculty,
  ID,
  Learner,
  Programme,
  ReadinessCategoryKey,
  Session,
  StaffMember,
  Task,
} from './models';

// ─── Lookups ──────────────────────────────────────────────────────────────────

export const byId = <T extends { id: string }>(list: T[], id?: string) => (id ? list.find((x) => x.id === id) : undefined);

export const getProgramme = (db: DB, id?: ID) => byId(db.programmes, id);
export const getClient = (db: DB, id?: ID) => byId(db.clients, id);
export const getStaff = (db: DB, id?: ID) => byId(db.staff, id);
export const getFaculty = (db: DB, id?: ID) => byId(db.faculty, id);
export const getLearner = (db: DB, id?: ID) => byId(db.learners, id);
export const getSession = (db: DB, id?: ID) => byId(db.sessions, id);
export const getVenue = (db: DB, id?: ID) => byId(db.venues, id);
export const getHotel = (db: DB, id?: ID) => byId(db.hotels, id);

export const facultyName = (f?: Faculty) => (f ? `${f.honorific} ${f.name}` : 'Unassigned');
export const learnerName = (l?: Learner) => (l ? `${l.firstName} ${l.lastName}` : 'Unknown');
export const staffName = (s?: StaffMember) => s?.name ?? 'Unassigned';

/** Resolve any person id (staff, faculty, learner, client contact) to a display name. */
export function personName(db: DB, id?: ID): string {
  if (!id) return 'Unknown';
  if (id === 'system') return 'ProgrammeOS';
  const s = getStaff(db, id);
  if (s) return s.name;
  const f = getFaculty(db, id);
  if (f) return facultyName(f);
  const l = getLearner(db, id);
  if (l) return learnerName(l);
  const c = byId(db.clientContacts, id);
  if (c) return c.name;
  return 'Unknown';
}

export function personHue(db: DB, id?: ID): number {
  if (!id) return 220;
  return getStaff(db, id)?.avatarHue ?? getFaculty(db, id)?.avatarHue ?? getLearner(db, id)?.avatarHue ?? 220;
}

export function guestName(db: DB, g: { kind: string; id: ID }) {
  return personName(db, g.id);
}

// ─── Programme lifecycle ──────────────────────────────────────────────────────

export type Phase = 'upcoming' | 'in_delivery' | 'completed' | 'archived' | 'cancelled';

export function programmePhase(p: Programme, today = DEMO_TODAY): Phase {
  if (p.cancelled) return 'cancelled';
  if (p.archived) return 'archived';
  if (today < p.startDate) return 'upcoming';
  if (today <= p.endDate) return 'in_delivery';
  return 'completed';
}

export function deliveryProgress(p: Programme, today = DEMO_TODAY) {
  if (today < p.startDate) return 0;
  if (today > p.endDate) return 100;
  return Math.round((diffDays(today, p.startDate) / Math.max(1, durationDays(p.startDate, p.endDate) - 1)) * 100);
}

export const LIFECYCLE: { key: Programme['stage']; label: string }[] = [
  { key: 'approved', label: 'Programme Approved' },
  { key: 'workspace', label: 'Workspace Created' },
  { key: 'manager', label: 'Programme Manager Assigned' },
  { key: 'checklist', label: 'Operational Checklist Generated' },
  { key: 'faculty', label: 'Faculty Requirements' },
  { key: 'logistics', label: 'Logistics Requirements' },
  { key: 'academic', label: 'Academic Requirements' },
  { key: 'learners', label: 'Learner Requirements' },
  { key: 'readiness', label: 'Readiness Monitoring' },
  { key: 'delivery_approval', label: 'Delivery Approval' },
  { key: 'delivery', label: 'Programme Delivery' },
  { key: 'financial_closure', label: 'Financial Closure' },
  { key: 'archive', label: 'Archive' },
];

export function lifecycleIndex(stage: Programme['stage']) {
  return LIFECYCLE.findIndex((s) => s.key === stage);
}

// ─── Readiness engine (derived from live records) ─────────────────────────────

export const READINESS_LABELS: Record<ReadinessCategoryKey, string> = {
  faculty: 'Faculty',
  materials: 'Academic Materials',
  hotel: 'Hotel',
  participants: 'Participants',
  travel: 'Travel',
  venue: 'Venue',
  equipment: 'Equipment',
  client: 'Client Approval',
  finance: 'Financial Preparation',
};

export type ReadinessTone = 'complete' | 'on_track' | 'attention' | 'critical' | 'na';

export type PendingItem = {
  id: ID;
  label: string;
  detail?: string;
  ownerId?: ID;
  due?: string;
  critical?: boolean;
  route?: string;
  /** How the readiness screen can resolve this inline (simulated). */
  resolve?: { label: string; kind: 'readinessItem' | 'logistics' | 'enrollment' | 'itinerary' | 'booking' | 'assignment' | 'material'; id: ID };
};

export type ReadinessCategoryView = {
  key: ReadinessCategoryKey;
  label: string;
  applicable: boolean;
  percent: number; // 0-100 (NaN-safe)
  done: number;
  total: number;
  ownerId: ID;
  due: string;
  tone: ReadinessTone;
  pending: PendingItem[];
  completed: PendingItem[];
};

export type ReadinessView = {
  programmeId: ID;
  overall: number;
  threshold: number;
  goNoGoDate: string;
  daysToStart: number;
  categories: ReadinessCategoryView[];
  criticalCount: number;
  pendingCount: number;
  recommendation: 'go' | 'conditional' | 'no_go';
  decision?: DB['readiness'][number]['decision'];
  configured: boolean;
};

const READY_ASSIGNMENT = ['Confirmed', 'Contract Issued', 'Contracted'];
const READY_MATERIAL = ['Approved', 'Published'];
const READY_BOOKING = ['Confirmed', 'Checked In', 'Checked Out'];
const READY_ENROLMENT = ['Registered', 'Confirmed', 'Attending', 'Completed'];
const READY_TRAVEL = ['Booked', 'Ticketed', 'Completed'];

function toneFor(percent: number, applicable: boolean): ReadinessTone {
  if (!applicable) return 'na';
  if (percent >= 100) return 'complete';
  if (percent >= 80) return 'on_track';
  if (percent >= 50) return 'attention';
  return 'critical';
}

export function readinessFor(db: DB, programmeId: ID): ReadinessView {
  const p = getProgramme(db, programmeId)!;
  const cfg = db.readiness.find((r) => r.programmeId === programmeId);
  const daysToStart = diffDays(p.startDate, DEMO_TODAY);
  if (!cfg) {
    const done = programmePhase(p) !== 'upcoming';
    return { programmeId, overall: done ? 100 : 0, threshold: 90, goNoGoDate: p.startDate, daysToStart, categories: [], criticalCount: 0, pendingCount: 0, recommendation: 'go', configured: false };
  }

  const categories: ReadinessCategoryView[] = cfg.categories.map((c) => {
    let pending: PendingItem[] = [];
    let completed: PendingItem[] = [];
    let done = 0;
    let total = 0;

    switch (c.key) {
      case 'faculty': {
        const list = db.facultyAssignments.filter((a) => a.programmeId === programmeId && a.status !== 'Declined');
        total = list.length;
        for (const a of list) {
          const f = getFaculty(db, a.facultyId);
          const item: PendingItem = { id: a.id, label: `${facultyName(f)} — confirmation`, detail: `${a.role} · ${a.status}`, route: `/faculty/${a.facultyId}`, ownerId: c.ownerId, due: c.due };
          if (READY_ASSIGNMENT.includes(a.status)) {
            done++;
            completed.push(item);
          } else pending.push({ ...item, critical: daysToStart < 45, resolve: { label: 'Mark confirmed', kind: 'assignment', id: a.id } });
        }
        if (!total) {
          total = 1;
          pending.push({ id: `${programmeId}-nofac`, label: 'No faculty assigned yet', route: '/faculty/assign', ownerId: c.ownerId, due: c.due, critical: true });
        }
        break;
      }
      case 'materials': {
        const list = db.materials.filter((m) => m.programmeId === programmeId);
        total = list.length;
        for (const m of list) {
          const item: PendingItem = { id: m.id, label: m.title, detail: m.status, route: `/material/${m.id}`, ownerId: m.reviewerId, due: m.dueDate };
          if (READY_MATERIAL.includes(m.status)) {
            done++;
            completed.push(item);
          } else pending.push({ ...item, critical: m.dueDate < DEMO_TODAY, resolve: m.status === 'Under Review' || m.status === 'Submitted' ? { label: 'Approve', kind: 'material', id: m.id } : undefined });
        }
        break;
      }
      case 'hotel': {
        const list = db.hotelBookings.filter((b) => b.programmeId === programmeId && b.status !== 'Cancelled');
        total = list.length;
        for (const b of list) {
          const item: PendingItem = { id: b.id, label: `Room for ${guestName(db, b.guest)}`, detail: `${b.roomType} · ${b.status}`, route: `/booking/${b.id}`, ownerId: c.ownerId, due: b.cancellationDeadline };
          if (READY_BOOKING.includes(b.status)) {
            done++;
            completed.push(item);
          } else pending.push({ ...item, critical: diffDays(b.cancellationDeadline, DEMO_TODAY) <= 7, resolve: { label: 'Confirm', kind: 'booking', id: b.id } });
        }
        break;
      }
      case 'participants': {
        const list = db.enrollments.filter((e) => e.programmeId === programmeId && e.status !== 'Withdrawn');
        total = Math.max(p.capacity, list.length);
        for (const e of list) {
          const l = getLearner(db, e.learnerId);
          const item: PendingItem = { id: e.id, label: `${learnerName(l)} — registration`, detail: e.status, route: `/learner/${e.learnerId}`, ownerId: c.ownerId, due: c.due };
          if (READY_ENROLMENT.includes(e.status)) {
            done++;
            completed.push(item);
          } else if (e.status !== 'Waitlisted') pending.push({ ...item, resolve: { label: 'Mark registered', kind: 'enrollment', id: e.id } });
        }
        const unfilled = total - list.filter((e) => e.status !== 'Waitlisted').length;
        if (unfilled > 0) pending.push({ id: `${programmeId}-seats`, label: `${unfilled} seat${unfilled === 1 ? '' : 's'} without a nomination`, detail: 'Awaiting client nominations', ownerId: c.ownerId, due: c.due });
        break;
      }
      case 'travel': {
        const list = db.itineraries.filter((t) => t.programmeId === programmeId);
        total = list.length;
        for (const t of list) {
          const item: PendingItem = { id: t.id, label: `Flights for ${personName(db, t.traveller.id)}`, detail: t.status, route: `/travel/${t.id}`, ownerId: c.ownerId, due: c.due };
          if (READY_TRAVEL.includes(t.status)) {
            done++;
            completed.push(item);
          } else pending.push({ ...item, critical: t.status === 'Missing' && daysToStart < 21, resolve: { label: 'Mark ticketed', kind: 'itinerary', id: t.id } });
        }
        break;
      }
      case 'venue':
      case 'equipment': {
        const area = c.key === 'venue' ? 'Venue' : 'Audio/Visual';
        const list = db.logisticsItems.filter((i) => i.programmeId === programmeId && i.area === area);
        total = list.length;
        for (const i of list) {
          const item: PendingItem = { id: i.id, label: i.label, detail: i.detail, ownerId: i.ownerId, due: i.due, route: i.taskId ? `/task/${i.taskId}` : undefined };
          if (i.done) {
            done++;
            completed.push(item);
          } else pending.push({ ...item, critical: i.due <= DEMO_TODAY || diffDays(i.due, DEMO_TODAY) <= 4, resolve: { label: 'Mark done', kind: 'logistics', id: i.id } });
        }
        break;
      }
      case 'client':
      case 'finance': {
        const list = c.items ?? [];
        total = list.length;
        for (const i of list) {
          const item: PendingItem = { id: i.id, label: i.label, ownerId: i.ownerId, due: i.due, critical: i.critical };
          if (i.done) {
            done++;
            completed.push(item);
          } else pending.push({ ...item, resolve: { label: 'Mark done', kind: 'readinessItem', id: i.id } });
        }
        break;
      }
    }
    // An applicable category with nothing in it yet is not ready (e.g. no rooms booked).
    if (c.applicable && total === 0) {
      const empty: Partial<Record<ReadinessCategoryKey, { label: string; route: string }>> = {
        hotel: { label: 'No hotel rooms booked yet', route: `/hotel-booking/new?programme=${programmeId}` },
        travel: { label: 'No travel itineraries yet', route: `/travel?programme=${programmeId}` },
        materials: { label: 'No learning materials requested yet', route: `/material/submit?programme=${programmeId}` },
        venue: { label: 'No venue checklist yet', route: `/logistics/checklist/${programmeId}` },
        equipment: { label: 'No equipment checklist yet', route: `/logistics/checklist/${programmeId}` },
        client: { label: 'No client approvals defined yet', route: `/programme/${programmeId}` },
        finance: { label: 'No financial checklist yet', route: `/programme/${programmeId}/finance` },
      };
      const e = empty[c.key];
      if (e) pending.push({ id: `${programmeId}-${c.key}-empty`, label: e.label, route: e.route, ownerId: c.ownerId, due: c.due, critical: daysToStart < 30 });
    }
    const percent = c.applicable ? (total ? (done / total) * 100 : 0) : 0;
    if (!c.applicable) {
      pending = [];
      completed = [];
    }
    return { key: c.key, label: READINESS_LABELS[c.key], applicable: c.applicable, percent, done, total, ownerId: c.ownerId, due: c.due, tone: toneFor(percent, c.applicable), pending, completed };
  });

  const applicable = categories.filter((c) => c.applicable);
  const overall = applicable.length ? applicable.reduce((s, c) => s + c.percent, 0) / applicable.length : 0;
  const criticalCount = applicable.reduce((s, c) => s + c.pending.filter((x) => x.critical).length, 0);
  const pendingCount = applicable.reduce((s, c) => s + c.pending.length, 0);
  const recommendation = overall >= cfg.threshold && criticalCount === 0 ? 'go' : overall >= cfg.threshold - 15 ? 'conditional' : 'no_go';
  return { programmeId, overall, threshold: cfg.threshold, goNoGoDate: cfg.goNoGoDate, daysToStart, categories, criticalCount, pendingCount, recommendation, decision: cfg.decision, configured: true };
}

/** Single number used on cards: readiness for upcoming, delivery progress for running. */
export function programmeHealth(db: DB, p: Programme) {
  const phase = programmePhase(p);
  if (phase === 'upcoming') {
    const r = readinessFor(db, p.id);
    return { kind: 'readiness' as const, value: Math.round(r.overall), label: 'Ready', tone: r.overall >= r.threshold ? 'success' : r.overall >= 70 ? 'accent' : r.overall >= 50 ? 'warning' : 'danger' };
  }
  if (phase === 'in_delivery') return { kind: 'progress' as const, value: deliveryProgress(p), label: 'Delivered', tone: 'accent' as const };
  return { kind: 'done' as const, value: 100, label: phase === 'cancelled' ? 'Cancelled' : 'Complete', tone: 'neutral' as const };
}

export function isAtRisk(db: DB, p: Programme) {
  const phase = programmePhase(p);
  if (phase === 'upcoming') {
    const r = readinessFor(db, p.id);
    return r.daysToStart <= 45 && r.overall < r.threshold - 5;
  }
  return p.status.financial === 'At Risk' || p.status.financial === 'Over Budget';
}

// ─── Finance ──────────────────────────────────────────────────────────────────

export function programmeFinance(db: DB, programmeId: ID) {
  const p = getProgramme(db, programmeId)!;
  const lines = db.budgetLines.filter((l) => l.programmeId === programmeId);
  const budget = lines.reduce((s, l) => s + l.budget, 0) || p.budget;
  const committed = lines.reduce((s, l) => s + l.committed, 0);
  const actual = lines.reduce((s, l) => s + l.actual, 0);
  const pending = lines.reduce((s, l) => s + l.pending, 0);
  const forecastCost = Math.max(committed, budget);
  const margin = p.contractValue - Math.max(budget, committed);
  const marginPct = p.contractValue ? (margin / p.contractValue) * 100 : 0;
  const invoices = db.clientInvoices.filter((i) => i.programmeId === programmeId);
  const invoiced = invoices.filter((i) => i.status !== 'Draft').reduce((s, i) => s + i.amount, 0);
  const received = invoices.reduce((s, i) => s + i.paid, 0);
  const receivable = invoiced - received;
  const variance = budget - committed; // positive = headroom
  const overLines = lines.filter((l) => l.committed > l.budget);
  return { programme: p, lines, budget, committed, actual, pending, forecastCost, margin, marginPct, invoiced, received, receivable, variance, overLines, invoices };
}

export function portfolioFinance(db: DB, programmeIds?: ID[]) {
  const ps = db.programmes.filter((p) => !p.cancelled && (!programmeIds || programmeIds.includes(p.id)));
  const totals = ps.map((p) => programmeFinance(db, p.id));
  const sum = (k: 'budget' | 'committed' | 'actual' | 'pending' | 'invoiced' | 'received' | 'receivable' | 'margin') => totals.reduce((s, t) => s + t[k], 0);
  const contract = ps.reduce((s, p) => s + p.contractValue, 0);
  return { programmes: totals, contract, budget: sum('budget'), committed: sum('committed'), actual: sum('actual'), pending: sum('pending'), invoiced: sum('invoiced'), received: sum('received'), receivable: sum('receivable'), margin: sum('margin'), marginPct: contract ? (sum('margin') / contract) * 100 : 0 };
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function isOverdue(t: Task, today = DEMO_TODAY) {
  return t.status !== 'Done' && t.dueDate < today;
}

export function groupTasks(tasks: Task[], today = DEMO_TODAY) {
  const open = tasks.filter((t) => t.status !== 'Done');
  return {
    overdue: open.filter((t) => t.dueDate < today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    today: open.filter((t) => t.dueDate === today),
    week: open.filter((t) => t.dueDate > today && diffDays(t.dueDate, today) <= 7).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    later: open.filter((t) => diffDays(t.dueDate, today) > 7).sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    done: tasks.filter((t) => t.status === 'Done'),
  };
}

const PRIORITY_RANK = { Urgent: 0, High: 1, Medium: 2, Low: 3 } as const;
export function sortByPriority(a: Task, b: Task) {
  return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.dueDate.localeCompare(b.dueDate);
}

export function blockedBy(db: DB, t: Task) {
  return t.dependsOn.map((id) => byId(db.tasks, id)).filter((x): x is Task => !!x && x.status !== 'Done');
}

// ─── Scheduling ───────────────────────────────────────────────────────────────

export function sessionInterval(s: Session) {
  return { start: absoluteMinutes(s.date, s.start, s.timeZone), end: absoluteMinutes(s.endDate, s.end, s.timeZone) };
}

export type Conflict = { id: string; facultyId: ID; a: Session; b: Session };

/** Faculty double-bookings across time zones (the kind spreadsheets miss). */
export function scheduleConflicts(db: DB): Conflict[] {
  const out: Conflict[] = [];
  const active = db.sessions.filter((s) => s.status !== 'Cancelled' && s.status !== 'Completed');
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      // multi-day sessions use their daily window; compare on each overlapping day
      const shared = a.facultyIds.filter((f) => b.facultyIds.includes(f));
      if (!shared.length) continue;
      const ai = sessionInterval(a);
      const bi = sessionInterval(b);
      const sameDayWindow = a.date === a.endDate && b.date === b.endDate;
      const overlap = sameDayWindow ? ai.start < bi.end && bi.start < ai.end : ai.start < bi.end && bi.start < ai.end && dailyOverlap(a, b);
      if (overlap) for (const f of shared) out.push({ id: `${a.id}~${b.id}~${f}`, facultyId: f, a, b });
    }
  }
  return out;
}

function dailyOverlap(a: Session, b: Session) {
  const as = absoluteMinutes('1970-01-01', a.start, a.timeZone);
  const ae = absoluteMinutes('1970-01-01', a.end, a.timeZone);
  const bs = absoluteMinutes('1970-01-01', b.start, b.timeZone);
  const be = absoluteMinutes('1970-01-01', b.end, b.timeZone);
  return as < be && bs < ae;
}

export function conflictsForSession(db: DB, sessionId: ID) {
  return scheduleConflicts(db).filter((c) => c.a.id === sessionId || c.b.id === sessionId);
}

export function sessionsOnDate(db: DB, date: string, filter?: (s: Session) => boolean) {
  return db.sessions
    .filter((s) => s.date <= date && s.endDate >= date && (!filter || filter(s)))
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** Is a faculty member free for a slot? Returns the clashing sessions / unavailability. */
export function facultyAvailability(db: DB, facultyId: ID, date: string, start: string, end: string, tz: Session['timeZone']) {
  const f = getFaculty(db, facultyId);
  const s = absoluteMinutes(date, start, tz);
  const e = absoluteMinutes(date, end, tz);
  const clashes = db.sessions.filter((x) => {
    if (!x.facultyIds.includes(facultyId) || x.status === 'Cancelled') return false;
    if (!(x.date <= date && x.endDate >= date)) {
      const xi = sessionInterval(x);
      return xi.start < e && s < xi.end;
    }
    const xs = absoluteMinutes(date, x.start, x.timeZone);
    const xe = absoluteMinutes(date, x.end, x.timeZone);
    return xs < e && s < xe;
  });
  const blocked = (f?.unavailable ?? []).filter((u) => u.from <= date && u.to >= date);
  return { free: !clashes.length && !blocked.length, clashes, blocked };
}

// ─── Counts for badges ───────────────────────────────────────────────────────

export function unreadCount(db: DB, audience: 'staff' | 'faculty' | 'learner') {
  return db.notifications.filter((n) => n.audience === audience && !n.read).length;
}

export function inboxUnread(db: DB) {
  return db.communications.filter((c) => c.unread).length + unreadCount(db, 'staff');
}

export function pendingApprovalsFor(db: DB, staffId: ID) {
  return db.approvals.filter((a) => a.status === 'Pending' && a.approverIds.includes(staffId));
}

export function clampPct(n: number) {
  return clamp(Math.round(n));
}
