import { createContext, useContext, useState, type ReactNode } from 'react';

import { DEMO_NOW, DEMO_TODAY } from '@/utils/dates';
import { newId } from '@/utils/format';

import { createInitialDB, type CollectionKey, type DB, type RecordOf } from './mock';
import type {
  ActivityKind,
  ApprovalStatus,
  AppNotification,
  BookingStatus,
  EnrollmentStatus,
  FacultyAssignment,
  ID,
  MaterialStatus,
  Programme,
  Session,
  Task,
  TaskStatus,
  TransactionStatus,
  TravelItinerary,
} from './models';

/**
 * Local, in-memory data store for the prototype.
 *
 * All mutations are immutable and go through named actions, mirroring the shape a future
 * API client would have (`actions.decideApproval(...)` → `POST /approvals/:id/decision`).
 * Nothing here talks to a network.
 */

type Updater<T> = Partial<T> | ((prev: T) => T);

function makeActions(setDb: (fn: (db: DB) => DB) => void, getActor: () => ID) {
  const update = <K extends CollectionKey>(key: K, id: ID, patch: Updater<RecordOf<K>>) =>
    setDb((db) => ({
      ...db,
      [key]: (db[key] as RecordOf<K>[]).map((r) => (r.id === id ? (typeof patch === 'function' ? (patch as (p: RecordOf<K>) => RecordOf<K>)(r) : { ...r, ...patch }) : r)),
    }));

  const add = <K extends CollectionKey>(key: K, record: RecordOf<K>, opts: { append?: boolean } = {}) =>
    setDb((db) => ({ ...db, [key]: opts.append ? [...(db[key] as RecordOf<K>[]), record] : [record, ...(db[key] as RecordOf<K>[])] }));

  const remove = <K extends CollectionKey>(key: K, id: ID) =>
    setDb((db) => ({ ...db, [key]: (db[key] as RecordOf<K>[]).filter((r) => r.id !== id) }));

  const log = (programmeId: ID, kind: ActivityKind, text: string, actorId: ID = getActor()) =>
    add('activity', { id: newId('ac'), programmeId, kind, actorId, text, date: DEMO_NOW });

  const notify = (n: Omit<AppNotification, 'id' | 'date' | 'read'>) => add('notifications', { ...n, id: newId('n'), date: DEMO_NOW, read: false });

  return {
    update,
    add,
    remove,
    log,
    notify,

    reset: () => setDb(() => createInitialDB()),

    // ── Tasks
    setTaskStatus: (taskId: ID, status: TaskStatus) =>
      update('tasks', taskId, (t) => ({
        ...t,
        status,
        completedOn: status === 'Done' ? DEMO_TODAY : undefined,
        history: [...t.history, { id: newId('th'), date: DEMO_NOW, actorId: getActor(), text: `Status changed to ${status}` }],
      })),
    addTaskComment: (taskId: ID, text: string) =>
      update('tasks', taskId, (t) => ({ ...t, comments: [...t.comments, { id: newId('tc'), authorId: getActor(), date: DEMO_NOW, text }] })),
    createTask: (input: Pick<Task, 'title' | 'programmeId' | 'ownerId' | 'dueDate' | 'priority' | 'category'> & Partial<Task>) => {
      const id = newId('t');
      const task: Task = {
        id,
        description: '',
        status: 'To Do',
        dependsOn: [],
        attachmentIds: [],
        comments: [],
        createdOn: DEMO_TODAY,
        history: [{ id: newId('th'), date: DEMO_NOW, actorId: getActor(), text: 'Task created' }],
        ...input,
      };
      add('tasks', task);
      return id;
    },

    // ── Approvals (side effects propagate to the linked operational record)
    decideApproval: (approvalId: ID, outcome: Exclude<ApprovalStatus, 'Pending'>, note?: string) =>
      setDb((db) => {
        const actor = getActor();
        const approval = db.approvals.find((a) => a.id === approvalId);
        if (!approval) return db;
        let next: DB = {
          ...db,
          approvals: db.approvals.map((a) =>
            a.id === approvalId
              ? {
                  ...a,
                  status: outcome,
                  chain: a.chain.some((c) => c.status === 'Waiting')
                    ? a.chain.map((c, i, arr) => (i === arr.findIndex((x) => x.status === 'Waiting') ? { ...c, approverId: c.approverId, status: outcome, date: DEMO_TODAY, note } : c))
                    : [...a.chain, { approverId: actor, status: outcome, date: DEMO_TODAY, note }],
                }
              : a,
          ),
        };
        // Linked transaction
        const txId = approval.relatedRoute?.startsWith('/finance/transaction/') ? approval.relatedRoute.split('/').pop() : undefined;
        if (txId) {
          const status: TransactionStatus = outcome === 'Approved' ? 'Approved' : outcome === 'Rejected' ? 'Rejected' : 'Submitted';
          next = { ...next, transactions: next.transactions.map((t) => (t.id === txId ? { ...t, status } : t)) };
        }
        // Readiness side effects for ELP finance checklist
        if (outcome === 'Approved' && (approvalId === 'a-01' || approvalId === 'a-02')) {
          const itemId = approvalId === 'a-01' ? 'ri-elp-f4' : 'ri-elp-f5';
          next = {
            ...next,
            readiness: next.readiness.map((r) => (r.programmeId === 'p-elp' ? { ...r, categories: r.categories.map((c) => (c.items ? { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, done: true } : it)) } : c)) } : r)),
          };
        }
        if (approval.kind === 'Material' && approval.relatedRoute?.startsWith('/material/')) {
          const mid = approval.relatedRoute.split('/').pop();
          const status: MaterialStatus = outcome === 'Approved' ? 'Approved' : 'Changes Requested';
          next = { ...next, materials: next.materials.map((m) => (m.id === mid ? { ...m, status } : m)) };
        }
        next = {
          ...next,
          activity: [{ id: newId('ac'), programmeId: approval.programmeId, kind: 'approval_granted', actorId: actor, text: `${outcome.toLowerCase()} “${approval.title}”`, date: DEMO_NOW }, ...next.activity],
        };
        return next;
      }),

    // ── Readiness
    toggleReadinessItem: (programmeId: ID, itemId: ID) =>
      setDb((db) => ({
        ...db,
        readiness: db.readiness.map((r) =>
          r.programmeId === programmeId ? { ...r, categories: r.categories.map((c) => (c.items ? { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)) } : c)) } : r,
        ),
      })),
    setReadinessItem: (programmeId: ID, itemId: ID, done: boolean) =>
      setDb((db) => ({
        ...db,
        readiness: db.readiness.map((r) =>
          r.programmeId === programmeId ? { ...r, categories: r.categories.map((c) => (c.items ? { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, done } : it)) } : c)) } : r,
        ),
      })),
    recordGoNoGo: (programmeId: ID, outcome: 'go' | 'no_go' | 'conditional', note?: string) => {
      setDb((db) => ({
        ...db,
        readiness: db.readiness.map((r) => (r.programmeId === programmeId ? { ...r, decision: { outcome, by: getActor(), date: DEMO_TODAY, note } } : r)),
        approvals: db.approvals.map((a) => (a.kind === 'Go / No-Go' && a.programmeId === programmeId ? { ...a, status: outcome === 'no_go' ? 'Rejected' : 'Approved', chain: a.chain.map((c) => ({ ...c, status: outcome === 'no_go' ? 'Rejected' : 'Approved', date: DEMO_TODAY })) } : a)),
        programmes: db.programmes.map((p) => (p.id === programmeId && outcome !== 'no_go' ? { ...p, stage: 'delivery_approval', status: { ...p.status, operational: 'Ready' } } : p)),
      }));
      log(programmeId, 'approval_granted', `recorded a ${outcome === 'go' ? 'Go' : outcome === 'no_go' ? 'No-Go' : 'Conditional Go'} decision`);
    },
    toggleLogisticsItem: (itemId: ID) => update('logisticsItems', itemId, (i) => ({ ...i, done: !i.done })),

    // ── Programmes
    createProgramme: (p: Programme) => {
      add('programmes', p);
      setDb((db) => ({
        ...db,
        readiness: [
          ...db.readiness,
          {
            programmeId: p.id,
            goNoGoDate: p.startDate,
            threshold: 90,
            categories: (['faculty', 'materials', 'hotel', 'participants', 'travel', 'venue', 'equipment'] as const).map((key) => ({
              key,
              ownerId: p.managerId,
              due: p.startDate,
              applicable: p.deliveryMode !== 'Virtual' || !['hotel', 'travel', 'venue'].includes(key),
            })).concat([
              { key: 'client' as never, ownerId: p.managerId, due: p.startDate, applicable: true, items: [{ id: newId('ri'), label: 'Programme design signed off by client', done: false, ownerId: p.managerId, due: p.startDate }] } as never,
              { key: 'finance' as never, ownerId: p.managerId, due: p.startDate, applicable: true, items: [{ id: newId('ri'), label: 'Programme budget approved', done: false, ownerId: 's-rajiv', due: p.startDate }] } as never,
            ]),
          },
        ],
      }));
      log(p.id, 'programme_created', `created the programme workspace${p.templateId ? ' from a workflow template' : ''}`);
    },
    updateProgramme: (id: ID, patch: Partial<Programme>) => update('programmes', id, patch),
    archiveProgramme: (id: ID, archived: boolean) => {
      update('programmes', id, { archived });
      log(id, 'status_changed', archived ? 'archived the programme' : 'restored the programme from the archive');
    },

    // ── Faculty
    assignFaculty: (a: Omit<FacultyAssignment, 'id'>) => {
      const id = newId('fa');
      add('facultyAssignments', { ...a, id });
      return id;
    },
    setAssignmentStatus: (id: ID, status: FacultyAssignment['status']) =>
      update('facultyAssignments', id, (a) => ({ ...a, status, confirmedOn: ['Confirmed', 'Contracted', 'Contract Issued'].includes(status) ? a.confirmedOn ?? DEMO_TODAY : a.confirmedOn })),

    // ── Academics
    setMaterialStatus: (id: ID, status: MaterialStatus, comment?: string) =>
      update('materials', id, (m) => ({
        ...m,
        status,
        learnerVisible: status === 'Published' ? true : m.learnerVisible,
        comments: comment ? [...m.comments, { id: newId('rc'), authorId: getActor(), date: DEMO_NOW, text: comment }] : m.comments,
      })),
    addMaterialVersion: (id: ID, stage: 'Draft' | 'Final' | 'Revised', note: string, authorName: string) =>
      update('materials', id, (m) => ({
        ...m,
        status: m.status === 'Not Submitted' || m.status === 'Changes Requested' || m.status === 'Draft' ? 'Submitted' : m.status,
        versions: [...m.versions, { id: newId('mv'), label: `v${m.versions.length + 1}`, stage, date: DEMO_TODAY, authorName, note, sizeKb: 2400 + m.versions.length * 120, pages: 24 }],
      })),

    // ── Learners
    setEnrollmentStatus: (id: ID, status: EnrollmentStatus) =>
      update('enrollments', id, (e) => ({
        ...e,
        status,
        registeredOn: ['Registered', 'Confirmed'].includes(status) ? e.registeredOn ?? DEMO_TODAY : e.registeredOn,
        requirementsComplete: ['Registered', 'Confirmed', 'Attending'].includes(status) ? true : e.requirementsComplete,
      })),
    recordAttendance: (sessionId: ID, learnerId: ID, status: 'Present' | 'Late' | 'Absent' | 'Excused') =>
      setDb((db) => {
        const existing = db.attendance.find((a) => a.sessionId === sessionId && a.learnerId === learnerId);
        return {
          ...db,
          attendance: existing
            ? db.attendance.map((a) => (a === existing ? { ...a, status } : a))
            : [...db.attendance, { id: newId('at'), sessionId, learnerId, status }],
        };
      }),

    // ── Logistics
    setBookingStatus: (id: ID, status: BookingStatus, confirmationNumber?: string) =>
      update('hotelBookings', id, (b) => ({ ...b, status, confirmationNumber: confirmationNumber ?? b.confirmationNumber })),
    setItineraryStatus: (id: ID, status: TravelItinerary['status']) => update('itineraries', id, { status }),

    // ── Scheduling
    createSession: (s: Omit<Session, 'id'>) => {
      const id = newId('ss');
      add('sessions', { ...s, id }, { append: true });
      log(s.programmeId, 'session_scheduled', `scheduled “${s.title}”`);
      return id;
    },

    // ── Finance
    setTransactionStatus: (id: ID, status: TransactionStatus) => update('transactions', id, { status }),

    // ── Communications
    markNotificationRead: (id: ID, read = true) => update('notifications', id, { read }),
    markAllNotificationsRead: (audience: AppNotification['audience']) =>
      setDb((db) => ({ ...db, notifications: db.notifications.map((n) => (n.audience === audience ? { ...n, read: true } : n)) })),
    addCommunicationNote: (id: ID, text: string) =>
      update('communications', id, (c) => ({ ...c, notes: [...c.notes, { id: newId('cn'), authorId: getActor(), date: DEMO_NOW, text }] })),
    addDiscussionPost: (programmeId: ID, text: string) =>
      add('discussions', { id: newId('dp'), programmeId, authorId: getActor(), date: DEMO_NOW, text, replies: [] }),
    replyToPost: (postId: ID, text: string) =>
      update('discussions', postId, (p) => ({ ...p, replies: [...(p.replies ?? []), { id: newId('dpr'), authorId: getActor(), date: DEMO_NOW, text }] })),
    dismissAlert: (id: ID) => update('smartAlerts', id, { dismissed: true }),
  };
}

export type Actions = ReturnType<typeof makeActions>;

const DataContext = createContext<DB | null>(null);
const ActionsContext = createContext<Actions | null>(null);

const actorRef: { current: ID } = { current: 's-layla' };
/** The session provider keeps this in sync so actions attribute changes to the active persona. */
export function setActiveActor(id: ID) {
  actorRef.current = id;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(createInitialDB);
  const [actions] = useState(() => makeActions((fn) => setDb(fn), () => actorRef.current));
  return (
    <ActionsContext.Provider value={actions}>
      <DataContext.Provider value={db}>{children}</DataContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useDB(): DB {
  const db = useContext(DataContext);
  if (!db) throw new Error('useDB must be used inside DataProvider');
  return db;
}

export function useActions(): Actions {
  const a = useContext(ActionsContext);
  if (!a) throw new Error('useActions must be used inside DataProvider');
  return a;
}

export type { DB };
