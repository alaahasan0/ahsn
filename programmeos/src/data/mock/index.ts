import { assessments, assignments, attendance, materials, modules, sessions, submissions } from './academics';
import { clientContacts, clientRequests, clients, contracts } from './clients';
import { faculty, facultyAssignments, facultyFeedback } from './faculty';
import { budgetLines, clientInvoices, transactions } from './finance';
import { enrollments, learners } from './learners';
import { hotelBookings, hotels, itineraries, logisticsItems, runSheet, venueBookings, venues } from './logistics';
import { organization, roles, staff } from './people';
import { cohorts, milestones, programmes, readiness } from './programmes';
import { activity, approvals, communications, discussions, documents, notifications, smartAlerts } from './records';
import { tasks, workflowTemplates } from './tasks';

/**
 * The full sample environment for Emeritus Education. Every relationship is by id and
 * resolves to a real record (see `scripts/validate-mock.ts` style checks in QA).
 */
function buildDB() {
  // Programme cost headlines are derived from budget lines so they always reconcile.
  const progs = programmes.map((p) => {
    const lines = budgetLines.filter((l) => l.programmeId === p.id);
    if (!lines.length) return p;
    return {
      ...p,
      budget: lines.reduce((s, l) => s + l.budget, 0),
      committed: lines.reduce((s, l) => s + l.committed, 0),
      actual: lines.reduce((s, l) => s + l.actual, 0),
    };
  });

  return {
    organization,
    roles,
    staff,
    clients,
    clientContacts,
    contracts,
    clientRequests,
    programmes: progs,
    cohorts,
    milestones,
    readiness,
    faculty,
    facultyAssignments,
    facultyFeedback,
    learners,
    enrollments,
    attendance,
    modules,
    sessions,
    materials,
    assignments,
    submissions,
    assessments,
    hotels,
    hotelBookings,
    itineraries,
    venues,
    venueBookings,
    logisticsItems,
    runSheet,
    budgetLines,
    transactions,
    clientInvoices,
    tasks,
    workflowTemplates,
    documents,
    approvals,
    notifications,
    activity,
    communications,
    discussions,
    smartAlerts,
  };
}

export type DB = ReturnType<typeof buildDB>;
export type CollectionKey = { [K in keyof DB]: DB[K] extends { id: string }[] ? K : never }[keyof DB];
export type RecordOf<K extends CollectionKey> = DB[K][number];

export function createInitialDB(): DB {
  // Deep clone so "Reset demo data" always returns to the pristine scenario.
  return JSON.parse(JSON.stringify(buildDB()));
}

export { costCategories, revenueByMonth } from './finance';
export { FACULTY_PERSONA_ID, LEARNER_PERSONA_ID, rolePersona } from './people';
