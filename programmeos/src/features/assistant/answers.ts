import type { IconName } from '@/components/ui/Icon';
import type { DB } from '@/data/mock';
import {
  facultyName,
  getClient,
  getFaculty,
  getProgramme,
  isAtRisk,
  pendingApprovalsFor,
  programmePhase,
  readinessFor,
  scheduleConflicts,
  sessionsOnDate,
  sortByPriority,
} from '@/data/selectors';
import { countdown, DEMO_TODAY, dueLabel, formatDate, tzAbbr } from '@/utils/dates';
import { money, moneyCompact } from '@/utils/format';

export type AnswerItem = { title: string; detail?: string; icon: IconName; tone?: 'danger' | 'warning' | 'accent' | 'success' | 'violet'; route?: string };
export type Answer = { text: string; items?: AnswerItem[]; footnote?: string; followUps?: string[] };

export const SUGGESTED = [
  'What is still pending before this programme?',
  'Which programmes are at risk?',
  'Show me faculty with scheduling conflicts.',
  'Summarise today’s priorities.',
  'What invoices are still outstanding?',
];

function findProgramme(db: DB, q: string, contextId?: string) {
  const lower = q.toLowerCase();
  return db.programmes.find((p) => lower.includes(p.name.toLowerCase()) || lower.includes(p.shortName.toLowerCase()) || lower.includes(p.code.toLowerCase())) ?? getProgramme(db, contextId) ?? getProgramme(db, 'p-elp');
}

/** Deterministic, rule-based answers computed from the live sample data (no AI service). */
export function answer(db: DB, question: string, userId: string, contextProgrammeId?: string): Answer {
  const q = question.toLowerCase();

  if (q.includes('pending') || q.includes('outstanding before') || q.includes('left to do') || q.includes('ready')) {
    const p = findProgramme(db, question, contextProgrammeId)!;
    const r = readinessFor(db, p.id);
    if (!r.configured) return { text: `${p.name} is ${programmePhase(p) === 'in_delivery' ? 'already in delivery' : 'not in readiness monitoring'}, so there’s no pre-start checklist. Want its open tasks instead?`, followUps: ['Summarise today’s priorities.'] };
    const items: AnswerItem[] = r.categories
      .filter((c) => c.applicable && c.pending.length)
      .sort((a, b) => a.percent - b.percent)
      .flatMap((c) => c.pending.slice(0, 2).map((i) => ({ title: i.label, detail: `${c.label} · ${Math.round(c.percent)}%${i.due ? ` · ${dueLabel(i.due).text}` : ''}`, icon: i.critical ? ('circle-alert' as IconName) : ('circle-dashed' as IconName), tone: i.critical ? ('danger' as const) : ('warning' as const), route: i.route ?? `/programme/${p.id}/readiness` })))
      .slice(0, 6);
    const weakest = r.categories.filter((c) => c.applicable).sort((a, b) => a.percent - b.percent).slice(0, 2);
    return {
      text: `${p.name} is ${Math.round(r.overall)}% ready and ${countdown(p.startDate).toLowerCase()}. ${r.pendingCount} items are still open (${r.criticalCount} critical). The biggest gaps are ${weakest.map((c) => `${c.label.toLowerCase()} (${Math.round(c.percent)}%)`).join(' and ')}.`,
      items,
      footnote: `Go / No-Go checkpoint: ${formatDate(r.goNoGoDate)}`,
      followUps: ['Which programmes are at risk?', 'Show me faculty with scheduling conflicts.'],
    };
  }

  if (q.includes('risk')) {
    const list = db.programmes.filter((p) => !p.archived && !p.cancelled && isAtRisk(db, p));
    return {
      text: `${list.length} programme${list.length === 1 ? ' needs' : 's need'} attention. I flag a programme when readiness is more than 5 points under its Go threshold within 45 days of start, or when its financial status is at risk.`,
      items: list.map((p) => {
        const up = programmePhase(p) === 'upcoming';
        const r = readinessFor(db, p.id);
        return { title: p.name, detail: up ? `${Math.round(r.overall)}% ready (target ${r.threshold}%) · ${countdown(p.startDate)}` : `Financial: ${p.status.financial} · ${getClient(db, p.clientId)?.shortName}`, icon: 'triangle-alert', tone: 'warning', route: up ? `/programme/${p.id}/readiness` : `/programme/${p.id}/finance` };
      }),
      followUps: ['What is still pending before AI for Business Leaders?'],
    };
  }

  if (q.includes('conflict') || q.includes('double')) {
    const conflicts = scheduleConflicts(db);
    const pending = db.facultyAssignments.filter((a) => a.status === 'Request Sent');
    return {
      text: conflicts.length ? `I found ${conflicts.length} scheduling conflict${conflicts.length === 1 ? '' : 's'} once sessions are compared in UTC. Different time zones hide these in spreadsheets.` : 'No faculty scheduling conflicts right now.',
      items: [
        ...conflicts.map((c) => ({ title: `${facultyName(getFaculty(db, c.facultyId))} double-booked`, detail: `${c.a.title} (${c.a.start} ${tzAbbr(c.a.timeZone)}) overlaps ${c.b.title} (${c.b.start} ${tzAbbr(c.b.timeZone)}) on ${formatDate(c.a.date, { year: false })}`, icon: 'calendar-x' as IconName, tone: 'danger' as const, route: `/session/${c.b.id}` })),
        ...pending.slice(0, 3).map((a) => ({ title: `${facultyName(getFaculty(db, a.facultyId))} hasn’t confirmed`, detail: `${getProgramme(db, a.programmeId)?.shortName} · request sent ${formatDate(a.requestedOn, { year: false })}`, icon: 'user-x' as IconName, tone: 'warning' as const, route: `/faculty/${a.facultyId}` })),
      ],
      followUps: ['Summarise today’s priorities.'],
    };
  }

  if (q.includes('priorit') || q.includes('today') || q.includes('summar')) {
    const mine = db.tasks.filter((t) => t.ownerId === userId && t.status !== 'Done' && t.dueDate <= '2027-03-31').sort(sortByPriority);
    const sessions = sessionsOnDate(db, DEMO_TODAY);
    const approvals = pendingApprovalsFor(db, userId);
    return {
      text: `Here’s your Monday: ${mine.length} task${mine.length === 1 ? '' : 's'} due by Wednesday, ${sessions.length} live session${sessions.length === 1 ? '' : 's'} today and ${approvals.length} approval${approvals.length === 1 ? '' : 's'} waiting for you. Start with the urgent items — the SkyTrail fare hold expires at 18:00.`,
      items: [
        ...mine.slice(0, 4).map((t) => ({ title: t.title, detail: `${getProgramme(db, t.programmeId)?.shortName} · ${dueLabel(t.dueDate).text} · ${t.priority}`, icon: 'square-check-big' as IconName, tone: t.priority === 'Urgent' ? ('danger' as const) : ('accent' as const), route: `/task/${t.id}` })),
        ...approvals.slice(0, 2).map((a) => ({ title: a.title, detail: `Approval · ${a.amount ? money(a.amount) : a.kind}`, icon: 'stamp' as IconName, tone: 'warning' as const, route: `/approval/${a.id}` })),
        ...sessions.map((s) => ({ title: s.title, detail: `${s.start} ${tzAbbr(s.timeZone)} · ${getProgramme(db, s.programmeId)?.shortName}`, icon: 'video' as IconName, tone: 'violet' as const, route: `/session/${s.id}` })),
      ],
      followUps: ['What is still pending before this programme?'],
    };
  }

  if (q.includes('invoice') || q.includes('receivable') || q.includes('owed') || q.includes('payment')) {
    const out = db.clientInvoices.filter((i) => i.status !== 'Draft' && i.amount > i.paid);
    const supplier = db.transactions.filter((t) => ['Supplier Invoice', 'Faculty Invoice'].includes(t.kind) && !['Paid', 'Rejected'].includes(t.status));
    const total = out.reduce((s, i) => s + i.amount - i.paid, 0);
    return {
      text: `${moneyCompact(total)} is outstanding from clients across ${out.length} invoices, and ${supplier.length} supplier or faculty invoices are not yet paid. Halden’s Q1 revenue-share invoice is overdue.`,
      items: [
        ...out.map((i) => ({ title: `${getClient(db, i.clientId)?.shortName} · ${i.reference}`, detail: `${money(i.amount - i.paid)} outstanding · ${i.status} · due ${formatDate(i.dueDate, { year: false })}`, icon: 'receipt' as IconName, tone: i.status === 'Overdue' ? ('danger' as const) : ('accent' as const), route: '/finance/invoices' })),
        ...supplier.slice(0, 3).map((t) => ({ title: `${t.payee}`, detail: `${t.kind} · ${money(t.amount)} · ${t.status}`, icon: 'file-clock' as IconName, tone: t.status === 'Overdue' ? ('danger' as const) : ('warning' as const), route: `/finance/transaction/${t.id}` })),
      ],
      followUps: ['Which programmes are at risk?'],
    };
  }

  return {
    text: 'I can answer questions about programmes, readiness, faculty, schedules, tasks and finance using live ProgrammeOS data. Try one of these:',
    followUps: SUGGESTED,
  };
}
