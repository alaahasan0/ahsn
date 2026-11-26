/**
 * Referential-integrity check for the sample environment.
 * Every id a record points at must resolve to a real record.
 *   npm run validate:data
 */
import { createInitialDB } from '../src/data/mock/index';

const db = createInitialDB();
const errors: string[] = [];
const ids = (list: { id: string }[]) => new Set(list.map((x) => x.id));
const S = {
  staff: ids(db.staff), clients: ids(db.clients), contacts: ids(db.clientContacts), contracts: ids(db.contracts), programmes: ids(db.programmes),
  cohorts: ids(db.cohorts), faculty: ids(db.faculty), learners: ids(db.learners), modules: ids(db.modules), sessions: ids(db.sessions),
  materials: ids(db.materials), hotels: ids(db.hotels), venues: ids(db.venues), tasks: ids(db.tasks), documents: ids(db.documents), transactions: ids(db.transactions),
  assignments: ids(db.assignments), enrollments: ids(db.enrollments),
};
const anyPerson = (id: string) => S.staff.has(id) || S.faculty.has(id) || S.learners.has(id) || S.contacts.has(id) || id === 'system';
function check(cond: unknown, msg: string) { if (!cond) errors.push(msg); }
function ref(set: Set<string>, id: string | undefined, where: string, optional = false) {
  if (!id) { if (!optional) errors.push(`${where}: missing id`); return; }
  check(set.has(id), `${where}: unknown id "${id}"`);
}

for (const p of db.programmes) {
  ref(S.clients, p.clientId, `programme ${p.id}.clientId`); ref(S.staff, p.managerId, `programme ${p.id}.managerId`); ref(S.staff, p.ownerId, `programme ${p.id}.ownerId`);
  ref(S.staff, p.coordinatorId, `programme ${p.id}.coordinatorId`); ref(S.contracts, p.contractId, `programme ${p.id}.contractId`, true); ref(S.venues, p.venueId, `programme ${p.id}.venueId`, true);
  check(p.startDate <= p.endDate, `programme ${p.id}: start after end`);
}
for (const c of db.contracts) { ref(S.clients, c.clientId, `contract ${c.id}`); c.programmeIds.forEach((x) => ref(S.programmes, x, `contract ${c.id}.programmeIds`)); ref(S.documents, c.documentId, `contract ${c.id}.documentId`, true); }
for (const c of db.clientContacts) ref(S.clients, c.clientId, `contact ${c.id}`);
for (const r of db.clientRequests) { ref(S.clients, r.clientId, `clientRequest ${r.id}`); ref(S.programmes, r.programmeId, `clientRequest ${r.id}`, true); ref(S.contacts, r.raisedBy, `clientRequest ${r.id}.raisedBy`); }
for (const c of db.cohorts) ref(S.programmes, c.programmeId, `cohort ${c.id}`);
for (const m of db.milestones) { ref(S.programmes, m.programmeId, `milestone ${m.id}`); ref(S.staff, m.ownerId, `milestone ${m.id}.owner`, true); }
for (const r of db.readiness) { ref(S.programmes, r.programmeId, `readiness ${r.programmeId}`); r.categories.forEach((c) => { ref(S.staff, c.ownerId, `readiness ${r.programmeId}.${c.key}.owner`); c.items?.forEach((i) => ref(S.staff, i.ownerId, `readiness item ${i.id}.owner`)); }); }
for (const m of db.modules) { ref(S.programmes, m.programmeId, `module ${m.id}`); ref(S.cohorts, m.cohortId, `module ${m.id}.cohort`); ref(S.faculty, m.leadFacultyId, `module ${m.id}.lead`); }
for (const s of db.sessions) {
  ref(S.programmes, s.programmeId, `session ${s.id}`); ref(S.modules, s.moduleId, `session ${s.id}.module`); s.facultyIds.forEach((f) => ref(S.faculty, f, `session ${s.id}.faculty`));
  ref(S.venues, s.venueId, `session ${s.id}.venue`, true); s.materialIds.forEach((m) => ref(S.materials, m, `session ${s.id}.materials`));
  check(db.modules.find((m) => m.id === s.moduleId)?.programmeId === s.programmeId, `session ${s.id}: module belongs to another programme`);
}
for (const m of db.materials) { ref(S.programmes, m.programmeId, `material ${m.id}`); ref(S.modules, m.moduleId, `material ${m.id}.module`); ref(S.sessions, m.sessionId, `material ${m.id}.session`, true); ref(S.faculty, m.ownerFacultyId, `material ${m.id}.owner`); ref(S.staff, m.reviewerId, `material ${m.id}.reviewer`); }
for (const a of db.facultyAssignments) { ref(S.faculty, a.facultyId, `assignment ${a.id}`); ref(S.programmes, a.programmeId, `assignment ${a.id}`); a.sessionIds.forEach((x) => ref(S.sessions, x, `assignment ${a.id}.sessions`)); }
for (const s of db.sessions) for (const f of s.facultyIds) check(db.facultyAssignments.some((a) => a.facultyId === f && a.programmeId === s.programmeId), `session ${s.id}: ${f} teaches without an assignment`);
for (const f of db.facultyFeedback) { ref(S.faculty, f.facultyId, `feedback ${f.id}`); ref(S.programmes, f.programmeId, `feedback ${f.id}`); ref(S.sessions, f.sessionId, `feedback ${f.id}.session`, true); }
for (const e of db.enrollments) { ref(S.learners, e.learnerId, `enrollment ${e.id}`); ref(S.programmes, e.programmeId, `enrollment ${e.id}`); ref(S.cohorts, e.cohortId, `enrollment ${e.id}.cohort`, true); }
check(new Set(db.enrollments.map((e) => e.id)).size === db.enrollments.length, 'enrollment ids are not unique');
for (const a of db.attendance) { ref(S.sessions, a.sessionId, `attendance ${a.id}`); ref(S.learners, a.learnerId, `attendance ${a.id}`); }
for (const a of db.assignments) { ref(S.programmes, a.programmeId, `assignment brief ${a.id}`); ref(S.modules, a.moduleId, `assignment brief ${a.id}`); }
for (const s of db.submissions) { check(db.assignments.some((a) => a.id === s.assignmentId), `submission ${s.id}: unknown assignment`); ref(S.learners, s.learnerId, `submission ${s.id}`); }
for (const a of db.assessments) { ref(S.programmes, a.programmeId, `assessment ${a.id}`); ref(S.modules, a.moduleId, `assessment ${a.id}`); }
const guestSet = (kind: string) => (kind === 'learner' ? S.learners : kind === 'faculty' ? S.faculty : S.staff);
for (const b of db.hotelBookings) { ref(S.hotels, b.hotelId, `booking ${b.id}`); ref(S.programmes, b.programmeId, `booking ${b.id}`); ref(guestSet(b.guest.kind), b.guest.id, `booking ${b.id}.guest`); check(b.checkIn < b.checkOut, `booking ${b.id}: check-out not after check-in`); }
for (const t of db.itineraries) { ref(S.programmes, t.programmeId, `itinerary ${t.id}`); ref(guestSet(t.traveller.kind), t.traveller.id, `itinerary ${t.id}.traveller`); }
for (const v of db.venueBookings) { ref(S.venues, v.venueId, `venueBooking ${v.id}`); ref(S.programmes, v.programmeId, `venueBooking ${v.id}`); check(db.venues.find((x) => x.id === v.venueId)?.rooms.some((r) => r.id === v.roomId), `venueBooking ${v.id}: unknown room ${v.roomId}`); }
for (const i of db.logisticsItems) { ref(S.programmes, i.programmeId, `logistics ${i.id}`); ref(S.staff, i.ownerId, `logistics ${i.id}.owner`); ref(S.tasks, i.taskId, `logistics ${i.id}.task`, true); }
for (const r of db.runSheet) { ref(S.programmes, r.programmeId, `runSheet ${r.id}`); ref(S.staff, r.ownerId, `runSheet ${r.id}.owner`); }
for (const l of db.budgetLines) ref(S.programmes, l.programmeId, `budgetLine ${l.programmeId}/${l.category}`);
for (const t of db.transactions) { ref(S.programmes, t.programmeId, `transaction ${t.id}`); ref(S.staff, t.requestedBy, `transaction ${t.id}.requestedBy`); ref(S.staff, t.approverId, `transaction ${t.id}.approver`, true); ref(S.documents, t.documentId, `transaction ${t.id}.document`, true); ref(S.transactions, t.linkedId, `transaction ${t.id}.linked`, true); }
for (const i of db.clientInvoices) { ref(S.programmes, i.programmeId, `invoice ${i.id}`); ref(S.clients, i.clientId, `invoice ${i.id}.client`); check(db.programmes.find((p) => p.id === i.programmeId)?.clientId === i.clientId, `invoice ${i.id}: client does not own programme`); }
for (const t of db.tasks) {
  ref(S.staff, t.ownerId, `task ${t.id}.owner`); ref(S.programmes, t.programmeId, `task ${t.id}`); t.dependsOn.forEach((d) => ref(S.tasks, d, `task ${t.id}.dependsOn`)); t.attachmentIds.forEach((d) => ref(S.documents, d, `task ${t.id}.attachments`));
  t.comments.forEach((c) => check(anyPerson(c.authorId), `task ${t.id}: unknown comment author ${c.authorId}`));
  if (t.relatedPerson) check(anyPerson(t.relatedPerson.id), `task ${t.id}: unknown related person ${t.relatedPerson.id}`);
}
for (const d of db.documents) { ref(S.programmes, d.programmeId, `document ${d.id}`, true); ref(S.clients, d.clientId, `document ${d.id}.client`, true); ref(S.faculty, d.facultyId, `document ${d.id}.faculty`, true); ref(S.staff, d.uploadedBy, `document ${d.id}.uploadedBy`); }
for (const a of db.approvals) { ref(S.programmes, a.programmeId, `approval ${a.id}`); ref(S.staff, a.requestedBy, `approval ${a.id}.requestedBy`); a.approverIds.forEach((x) => ref(S.staff, x, `approval ${a.id}.approver`)); a.chain.forEach((c) => ref(S.staff, c.approverId, `approval ${a.id}.chain`)); }
for (const n of db.notifications) ref(S.programmes, n.programmeId, `notification ${n.id}`, true);
for (const a of db.activity) { ref(S.programmes, a.programmeId, `activity ${a.id}`); check(anyPerson(a.actorId), `activity ${a.id}: unknown actor ${a.actorId}`); }
for (const c of db.communications) { ref(S.programmes, c.programmeId, `communication ${c.id}`, true); ref(S.tasks, c.taskId, `communication ${c.id}.task`, true); }
for (const d of db.discussions) { ref(S.programmes, d.programmeId, `discussion ${d.id}`); check(anyPerson(d.authorId), `discussion ${d.id}: unknown author`); }
for (const a of db.smartAlerts) { ref(S.programmes, a.programmeId, `alert ${a.id}`); ref(S.staff, a.ownerId, `alert ${a.id}.owner`); }

const counts = {
  programmes: db.programmes.length, faculty: db.faculty.length, learners: db.learners.length, clients: db.clients.length, hotels: db.hotels.length, venues: db.venues.length,
  tasks: db.tasks.length, sessions: db.sessions.length, financialRecords: db.transactions.length + db.clientInvoices.length, documents: db.documents.length, notifications: db.notifications.length,
};
const minimum = { programmes: 8, faculty: 12, learners: 40, clients: 5, hotels: 5, venues: 5, tasks: 30, sessions: 15, financialRecords: 10, documents: 15, notifications: 15 };
for (const [k, min] of Object.entries(minimum)) check(counts[k as keyof typeof counts] >= min, `count ${k} = ${counts[k as keyof typeof counts]} (< ${min})`);

console.log('Sample data counts:', counts);
if (errors.length) {
  console.error(`\n✗ ${errors.length} integrity problem(s):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log('✓ All references resolve. Sample environment is consistent.');
