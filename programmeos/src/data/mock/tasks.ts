import type { Priority, Task, TaskStatus, WorkflowTemplate } from '../models';

type T = [
  id: string, title: string, ownerId: string, programmeId: string, due: string, priority: Priority, status: TaskStatus, category: Task['category'],
  description: string, extra?: Partial<Task>,
];

const rows: T[] = [
  ['t-01', 'Return signed venue contract to Creekside Grand', 's-sofia', 'p-elp', '2027-04-02', 'High', 'In Progress', 'Logistics', 'Legal has reviewed the venue contract. Obtain countersignature from James and return the signed PDF to Nadine Saba before the hold expires on 2 April.', { attachmentIds: ['d-venue-contract'], relatedPerson: { kind: 'staff', id: 's-james' } }],
  ['t-02', 'Book remaining 7 participant flights', 's-sofia', 'p-elp', '2027-03-31', 'Urgent', 'In Progress', 'Logistics', 'Four travellers have options awaiting their choice; three have not shared preferences. Ticket all seven by Wednesday to protect fares.', { attachmentIds: ['d-travel-policy'] }],
  ['t-03', 'Chase 3 outstanding participant registrations', 's-aisha', 'p-elp', '2027-03-30', 'High', 'To Do', 'Learners', 'Grace Wanjiru and James O’Connor have been invited but not registered; Faisal Al Dhaheri’s nomination needs confirming with Noura.', { relatedPerson: { kind: 'learner', id: 'l-22' } }],
  ['t-04', 'Approve transport PO for airport transfers & coach', 's-rajiv', 'p-elp', '2027-03-31', 'High', 'To Do', 'Finance', 'PO-2027-0233 for Desert Line Transport ($6,800) covering 20 airport transfers and the site-visit coach.', { dependsOn: ['t-05'], attachmentIds: ['d-transport-quote'] }],
  ['t-05', 'Raise transport PO — Desert Line Transport', 's-hannah', 'p-elp', '2027-03-29', 'High', 'In Review', 'Finance', 'Raise purchase order against the accepted quotation and route to Rajiv for approval.', { attachmentIds: ['d-transport-quote'] }],
  ['t-06', 'Pay 30% hotel deposit to Creekside Grand', 's-hannah', 'p-elp', '2027-04-01', 'Urgent', 'To Do', 'Finance', 'Deposit of $28,350 due 1 April to guarantee the room block. Payment request awaiting approval.', { attachmentIds: ['d-hotel-invoice'] }],
  ['t-07', 'Arrange video recording for opening keynote', 's-sofia', 'p-elp', '2027-04-05', 'Medium', 'To Do', 'Logistics', 'Meridian would like the keynote recorded for internal use. Confirm crew and consent forms.'],
  ['t-08', 'Print participant workbooks (24 copies)', 's-omar', 'p-elp', '2027-04-07', 'Medium', 'To Do', 'Logistics', 'Send the approved workbook PDF to Inkwell Print Studio. A4 colour, spiral bound, 24 copies plus 4 spares.', { dependsOn: ['t-34'], attachmentIds: ['d-elp-workbook'] }],
  ['t-09', 'Confirm site-visit logistics with Meridian Innovation Hub', 's-omar', 'p-elp', '2027-04-02', 'High', 'In Progress', 'Client', 'Agree arrival time, security registration for 30 visitors and lunch with ExCo on 15 April.', { relatedPerson: { kind: 'contact', id: 'cc-tariq' } }],
  ['t-10', 'Send welcome pack & joining instructions', 's-aisha', 'p-elp', '2027-04-05', 'Medium', 'To Do', 'Learners', 'Email joining instructions, agenda, hotel details and pre-reading to all registered participants.', { dependsOn: ['t-03'] }],
  ['t-11', 'Finalise dietary & accessibility list for catering', 's-omar', 'p-elp', '2027-03-26', 'High', 'In Progress', 'Logistics', 'Two participants have not confirmed dietary requirements. Hotel needs the final list to plan menus.'],
  ['t-12', 'Brief faculty on Meridian’s strategy context', 's-layla', 'p-elp', '2027-04-06', 'Medium', 'To Do', 'Faculty', 'Thirty-minute call with all four faculty to walk through Meridian’s 2035 strategy and participant profiles.'],
  ['t-13', 'Run Go / No-Go review with Meridian L&D', 's-layla', 'p-elp', '2027-04-02', 'Urgent', 'To Do', 'Operations', 'Review the readiness dashboard with Noura Al Kaabi and record the Go / No-Go decision.', { relatedPerson: { kind: 'contact', id: 'cc-noura' } }],
  ['t-14', 'Review Module 2 slides — Data-Driven Decisions', 's-priya', 'p-dte', '2027-03-30', 'High', 'In Progress', 'Academic', 'Academic review of Prof. Sharma’s v2 slides against the Orion brief and accessibility checklist.', { relatedPerson: { kind: 'faculty', id: 'f-sharma' } }],
  ['t-15', 'Chase Prof. Laurent for session confirmation', 's-daniel', 'p-dte', '2027-03-29', 'Urgent', 'To Do', 'Faculty', 'Request sent 22 March for the 26 April culture workshop. No response yet.', { relatedPerson: { kind: 'faculty', id: 'f-laurent' } }],
  ['t-16', 'Configure Zoom webinar & breakout rooms', 's-omar', 'p-dte', '2027-04-09', 'Medium', 'To Do', 'Operations', 'Set up the webinar series, pre-assign breakout rooms by hospital and test recording settings.'],
  ['t-17', 'Tech rehearsal with all faculty', 's-omar', 'p-dte', '2027-04-15', 'Medium', 'To Do', 'Operations', 'Thirty-minute rehearsal per faculty member covering polls, breakouts and screen share.', { dependsOn: ['t-16'] }],
  ['t-18', 'Issue Learning Hub access to Orion cohort', 's-aisha', 'p-dte', '2027-04-12', 'Medium', 'To Do', 'Learners', 'Send activation emails once pre-reading is published.'],
  ['t-19', 'Follow up Prof. Lindqvist on AFL availability', 's-daniel', 'p-afl', '2027-04-01', 'Medium', 'To Do', 'Faculty', 'Confirm availability for 25 May risk session before booking travel.', { relatedPerson: { kind: 'faculty', id: 'f-lindqvist' } }],
  ['t-20', 'Shortlist London venues (3 options)', 's-sofia', 'p-afl', '2027-03-25', 'Medium', 'Done', 'Logistics', 'Shortlist presented: Guildhall Rooms (preferred), Kensington Forum, Bankside Loft.', { completedOn: '2027-03-24' }],
  ['t-21', 'Draft AFL agenda for Atlas sign-off', 's-claire', 'p-afl', '2027-04-09', 'High', 'In Progress', 'Client', 'Three-day agenda integrating capital allocation, risk and CFO-as-strategist sessions.', { relatedPerson: { kind: 'contact', id: 'cc-wei' } }],
  ['t-22', 'Source replacement coach (Dr. Bennett declined)', 's-daniel', 'p-ai', '2027-03-31', 'Urgent', 'In Progress', 'Faculty', 'Dr. Bennett is fully booked in May. Shortlist two accredited coaches with healthcare experience.'],
  ['t-23', 'Chase overdue case study from Prof. Sharma', 's-priya', 'p-ai', '2027-03-26', 'High', 'To Do', 'Academic', 'The Gulf Care Hospitals case was due 26 March and is blocking the materials review.', { relatedPerson: { kind: 'faculty', id: 'f-sharma' } }],
  ['t-24', 'Confirm hybrid AV setup at Executive Centre', 's-sofia', 'p-ai', '2027-04-16', 'Medium', 'To Do', 'Logistics', 'Test the Innovation Lab hybrid camera and ceiling mics with the facilities team.'],
  ['t-25', 'Reconcile Q1 travel overspend', 's-hannah', 'p-gbs', '2027-04-02', 'High', 'In Progress', 'Finance', 'Travel commitments are 18% over budget after Residency 2 fare increases. Prepare variance note for Rajiv.', { attachmentIds: ['d-gbs-recon'] }],
  ['t-26', 'Publish Module 3 materials to learner portal', 's-priya', 'p-gbs', '2027-03-30', 'Medium', 'In Review', 'Academic', 'Publish approved lecture slides ahead of Wednesday’s live session.'],
  ['t-27', 'Confirm Residency 2 room layout', 's-sofia', 'p-gbs', '2027-04-05', 'Medium', 'In Progress', 'Logistics', 'U-shape for 16 in the Strategy Studio with hybrid camera coverage.'],
  ['t-28', 'Collect closing-residency dietary requirements', 's-aisha', 'p-smp', '2027-04-06', 'Low', 'To Do', 'Learners', 'Short form to all 12 participants before the Singapore residency.'],
  ['t-29', 'Resolve schedule conflict — Dr. Thorne, 14 Apr', 's-daniel', 'p-smp', '2027-03-31', 'Urgent', 'To Do', 'Faculty', 'Dr. Thorne is scheduled for ELP in Dubai (09:00 GST) and SMP virtual (13:00 SGT) at the same moment. Move one session or assign cover.', { relatedPerson: { kind: 'faculty', id: 'f-thorne' } }],
  ['t-30', 'Request nominations list from NPSI', 's-yusuf', 'p-psl', '2027-04-12', 'Medium', 'To Do', 'Client', 'Send the nomination template and deadline (30 April) to Reem Al Saud.', { relatedPerson: { kind: 'contact', id: 'cc-reem' } }],
  ['t-31', 'Issue final invoice & reconcile I&E costs', 's-hannah', 'p-ie', '2027-03-31', 'High', 'In Progress', 'Finance', 'Final 20% invoice issued 25 March. Reconcile actuals and close the cost centre.'],
  ['t-32', 'Send I&E evaluation report to Meridian', 's-layla', 'p-ie', '2027-03-24', 'Medium', 'Done', 'Client', 'Evaluation report with NPS, outcomes and venture pipeline shared with Noura.', { completedOn: '2027-03-24', attachmentIds: ['d-ie-evaluation'] }],
  ['t-33', 'Confirm all faculty contracts', 's-daniel', 'p-elp', '2027-03-18', 'High', 'Done', 'Faculty', 'All four faculty agreements countersigned.', { completedOn: '2027-03-18' }],
  ['t-34', 'Approve ELP materials pack', 's-priya', 'p-elp', '2027-03-22', 'High', 'Done', 'Academic', 'All eight ELP materials reviewed and approved for print and portal.', { completedOn: '2027-03-22' }],
  ['t-35', 'Review DTE readiness gaps', 's-layla', 'p-dte', '2027-03-30', 'Medium', 'To Do', 'Operations', 'DTE readiness is below threshold three weeks out. Agree recovery actions with Priya and Daniel.'],
  ['t-36', 'Approve rooming list v3 for Creekside Grand', 's-layla', 'p-elp', '2027-03-29', 'High', 'To Do', 'Logistics', 'Sofia has updated the rooming list with two room swaps and an accessible room. Approve before it goes to the hotel.', { attachmentIds: ['d-rooming-list'] }],
];

export const tasks: Task[] = rows.map(([id, title, ownerId, programmeId, dueDate, priority, status, category, description, extra = {}]) => ({
  id, title, ownerId, programmeId, dueDate, priority, status, category, description,
  dependsOn: [],
  attachmentIds: [],
  comments: [],
  history: [
    { id: `${id}-h1`, date: '2027-03-15T09:00', actorId: 's-layla', text: 'Created from the programme checklist' },
    ...(status !== 'To Do' ? [{ id: `${id}-h2`, date: '2027-03-24T11:20', actorId: ownerId, text: `Status changed to ${status}` }] : []),
  ],
  createdOn: '2027-03-15',
  ...extra,
}));

// A few richer threads
const extraComments: Record<string, Task['comments']> = {
  't-02': [
    { id: 'tc-1', authorId: 's-layla', date: '2027-03-28T17:05', text: 'Please prioritise Majid and Saeed — both are presenting on Day 1.' },
    { id: 'tc-2', authorId: 's-sofia', date: '2027-03-29T08:12', text: 'On it. SkyTrail is holding fares until 18:00 today.' },
  ],
  't-01': [{ id: 'tc-3', authorId: 's-sofia', date: '2027-03-27T14:40', text: 'Legal approved with one change to the force-majeure clause. With James for signature.' }],
  't-29': [{ id: 'tc-4', authorId: 's-daniel', date: '2027-03-28T10:02', text: 'Prof. Nwosu could cover the SMP session — checking her availability.' }],
  't-25': [{ id: 'tc-5', authorId: 's-rajiv', date: '2027-03-27T12:15', text: 'Please include the fare comparison versus budget assumptions.' }],
};
for (const t of tasks) if (extraComments[t.id]) t.comments = extraComments[t.id];

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'wt-3day', name: '3-Day Executive Programme', description: 'Compact in-person programme for senior executives. 10-week preparation runway.', durationLabel: '3 days · 10-week runway', deliveryMode: 'In-person', usedCount: 14,
    phases: [
      { name: 'Set-up', tasks: [{ title: 'Create programme workspace', offsetDays: -70, category: 'Operations', role: 'programme_manager' }, { title: 'Approve programme budget', offsetDays: -63, category: 'Finance', role: 'finance_approver' }] },
      { name: 'Faculty & design', tasks: [{ title: 'Confirm lead faculty', offsetDays: -56, category: 'Faculty', role: 'faculty_operations' }, { title: 'Agenda signed off by client', offsetDays: -42, category: 'Client', role: 'programme_manager' }] },
      { name: 'Logistics', tasks: [{ title: 'Book venue', offsetDays: -49, category: 'Logistics', role: 'logistics_coordinator' }, { title: 'Hotel block confirmed', offsetDays: -35, category: 'Logistics', role: 'logistics_coordinator' }, { title: 'Travel booked', offsetDays: -21, category: 'Logistics', role: 'logistics_coordinator' }] },
      { name: 'Readiness', tasks: [{ title: 'Materials approved', offsetDays: -14, category: 'Academic', role: 'academic_coordinator' }, { title: 'Go / No-Go review', offsetDays: -7, category: 'Operations', role: 'programme_manager' }] },
      { name: 'Close', tasks: [{ title: 'Evaluation report', offsetDays: 14, category: 'Client', role: 'programme_manager' }, { title: 'Financial reconciliation', offsetDays: 30, category: 'Finance', role: 'finance_officer' }] },
    ],
  },
  {
    id: 'wt-5day', name: '5-Day Residential Programme', description: 'Residential programme with hotel block, transfers and social programme. 12-week runway.', durationLabel: '5 days · 12-week runway', deliveryMode: 'In-person', usedCount: 22,
    phases: [
      { name: 'Set-up', tasks: [{ title: 'Create workspace & assign PM', offsetDays: -84, category: 'Operations', role: 'programme_manager' }, { title: 'Approve budget', offsetDays: -77, category: 'Finance', role: 'finance_approver' }] },
      { name: 'Faculty', tasks: [{ title: 'Faculty line-up confirmed', offsetDays: -63, category: 'Faculty', role: 'faculty_operations' }, { title: 'Faculty contracts signed', offsetDays: -28, category: 'Faculty', role: 'faculty_operations' }] },
      { name: 'Accommodation & travel', tasks: [{ title: 'Hotel block contracted', offsetDays: -56, category: 'Logistics', role: 'logistics_coordinator' }, { title: 'Rooming list v1', offsetDays: -28, category: 'Logistics', role: 'logistics_coordinator' }, { title: 'All flights ticketed', offsetDays: -12, category: 'Logistics', role: 'logistics_coordinator' }] },
      { name: 'Academic', tasks: [{ title: 'Materials submitted', offsetDays: -35, category: 'Academic', role: 'academic_coordinator' }, { title: 'Materials approved', offsetDays: -21, category: 'Academic', role: 'academic_coordinator' }] },
      { name: 'Learners', tasks: [{ title: 'Registrations complete', offsetDays: -14, category: 'Learners', role: 'learner_support' }, { title: 'Welcome pack sent', offsetDays: -7, category: 'Learners', role: 'learner_support' }] },
      { name: 'Delivery & close', tasks: [{ title: 'Go / No-Go', offsetDays: -7, category: 'Operations', role: 'programme_manager' }, { title: 'Run sheet issued', offsetDays: -3, category: 'Operations', role: 'programme_coordinator' }, { title: 'Supplier invoices reconciled', offsetDays: 30, category: 'Finance', role: 'finance_officer' }] },
    ],
  },
  {
    id: 'wt-6month', name: '6-Month Hybrid Programme', description: 'Long-form hybrid journey: weekly virtual classes, two residencies and a capstone.', durationLabel: '26 weeks · 14-week runway', deliveryMode: 'Hybrid', usedCount: 6,
    phases: [
      { name: 'Set-up', tasks: [{ title: 'Create workspace & cohorts', offsetDays: -98, category: 'Operations', role: 'programme_manager' }] },
      { name: 'Curriculum', tasks: [{ title: 'Module map approved', offsetDays: -84, category: 'Academic', role: 'academic_coordinator' }, { title: 'Faculty per module confirmed', offsetDays: -70, category: 'Faculty', role: 'faculty_operations' }] },
      { name: 'Residency 1', tasks: [{ title: 'Venue & hotel booked', offsetDays: -60, category: 'Logistics', role: 'logistics_coordinator' }] },
      { name: 'Virtual delivery', tasks: [{ title: 'Learning platform configured', offsetDays: -21, category: 'Operations', role: 'programme_coordinator' }, { title: 'Recurring sessions scheduled', offsetDays: -14, category: 'Operations', role: 'programme_coordinator' }] },
      { name: 'Residency 2 & capstone', tasks: [{ title: 'Residency 2 logistics', offsetDays: 60, category: 'Logistics', role: 'logistics_coordinator' }, { title: 'Capstone panel confirmed', offsetDays: 120, category: 'Academic', role: 'academic_coordinator' }] },
    ],
  },
  {
    id: 'wt-virtual', name: 'Fully Virtual Programme', description: 'Live online programme with platform set-up, tech rehearsals and digital materials.', durationLabel: '2–6 weeks · 6-week runway', deliveryMode: 'Virtual', usedCount: 18,
    phases: [
      { name: 'Set-up', tasks: [{ title: 'Create workspace', offsetDays: -42, category: 'Operations', role: 'programme_manager' }] },
      { name: 'Faculty & materials', tasks: [{ title: 'Faculty confirmed', offsetDays: -35, category: 'Faculty', role: 'faculty_operations' }, { title: 'Digital materials approved', offsetDays: -14, category: 'Academic', role: 'academic_coordinator' }] },
      { name: 'Platform', tasks: [{ title: 'Zoom & Learning Hub configured', offsetDays: -10, category: 'Operations', role: 'programme_coordinator' }, { title: 'Tech rehearsals', offsetDays: -4, category: 'Operations', role: 'programme_coordinator' }] },
      { name: 'Learners', tasks: [{ title: 'Access issued', offsetDays: -7, category: 'Learners', role: 'learner_support' }] },
    ],
  },
  {
    id: 'wt-custom', name: 'Custom Programme', description: 'Start from a minimal checklist and add phases to suit bespoke client designs.', durationLabel: 'Flexible', deliveryMode: 'Any', usedCount: 9,
    phases: [
      { name: 'Set-up', tasks: [{ title: 'Create workspace & assign team', offsetDays: -56, category: 'Operations', role: 'programme_manager' }, { title: 'Approve budget', offsetDays: -49, category: 'Finance', role: 'finance_approver' }] },
      { name: 'Design', tasks: [{ title: 'Design signed off by client', offsetDays: -35, category: 'Client', role: 'programme_manager' }] },
      { name: 'Readiness', tasks: [{ title: 'Go / No-Go review', offsetDays: -7, category: 'Operations', role: 'programme_manager' }] },
    ],
  },
];
