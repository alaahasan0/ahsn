/**
 * ProgrammeOS conceptual data model.
 *
 * Shaped for a future PostgreSQL + API backend: every record has a stable string id,
 * relationships are expressed as foreign-key ids (never nested copies), and dates are
 * ISO strings. Mock data in `src/data/mock` follows these types exactly.
 */

export type ID = string;
/** 'YYYY-MM-DD' */
export type ISODate = string;
/** 'HH:mm' 24h, local to the record's time zone */
export type TimeOfDay = string;
/** 'YYYY-MM-DDTHH:mm' local to the demo user (used for activity, messages, notifications) */
export type ISODateTime = string;
export type Money = number; // whole US dollars
export type TimeZoneId = 'Asia/Dubai' | 'Asia/Singapore' | 'Europe/London' | 'Asia/Riyadh' | 'Asia/Kolkata' | 'America/New_York';

// ─── Organisation & people ─────────────────────────────────────────────────────

export type Organization = {
  id: ID;
  name: string;
  shortName: string;
  region: string;
  defaultTimeZone: TimeZoneId;
  currency: 'USD';
};

export type StaffRoleKey =
  | 'programme_manager'
  | 'programme_coordinator'
  | 'academic_coordinator'
  | 'faculty_operations'
  | 'logistics_coordinator'
  | 'finance_officer'
  | 'finance_approver'
  | 'learner_support'
  | 'senior_management'
  | 'administrator';

export type Role = {
  key: StaffRoleKey;
  label: string;
  description: string;
};

/** Internal Emeritus staff member (a User with a staff role). */
export type StaffMember = {
  id: ID;
  name: string;
  initials: string;
  role: StaffRoleKey;
  title: string;
  email: string;
  phone: string;
  location: string;
  timeZone: TimeZoneId;
  team: string;
  avatarHue: number;
};

export type User = {
  id: ID;
  personId: ID;
  kind: 'staff' | 'faculty' | 'learner';
};

// ─── Clients & contracts ──────────────────────────────────────────────────────

export type ClientType = 'Corporate' | 'Government' | 'University' | 'Institutional';

export type Client = {
  id: ID;
  name: string;
  shortName: string;
  type: ClientType;
  sector: string;
  headquarters: string;
  relationshipOwnerId: ID; // StaffMember
  since: string; // year
  status: 'Active' | 'Prospect' | 'Dormant';
  logoHue: number;
  lifetimeValue: Money;
  satisfaction: number; // 0-5
};

export type ClientContact = {
  id: ID;
  clientId: ID;
  name: string;
  title: string;
  email: string;
  phone: string;
  primary?: boolean;
  approver?: boolean;
};

export type ContractStatus = 'Draft' | 'Under Negotiation' | 'Signed' | 'Active' | 'Completed' | 'Expired';

export type Contract = {
  id: ID;
  clientId: ID;
  title: string;
  reference: string;
  type: 'Master Services Agreement' | 'Statement of Work' | 'Programme Agreement' | 'Framework Agreement';
  status: ContractStatus;
  value: Money;
  startDate: ISODate;
  endDate: ISODate;
  signedDate?: ISODate;
  paymentTerms: string;
  programmeIds: ID[];
  documentId?: ID;
};

export type ClientRequest = {
  id: ID;
  clientId: ID;
  programmeId?: ID;
  title: string;
  detail: string;
  raisedBy: ID; // ClientContact
  date: ISODate;
  status: 'Open' | 'In Progress' | 'Resolved';
  kind: 'Request' | 'Approval';
};

// ─── Programmes ───────────────────────────────────────────────────────────────

export type ProgrammeType =
  | '3-Day Executive Programme'
  | '5-Day Residential Programme'
  | 'Multi-Week Programme'
  | '6-Month Hybrid Programme'
  | 'Fully Virtual Programme'
  | 'Custom Programme';

export type DeliveryMode = 'In-person' | 'Virtual' | 'Hybrid';

export type CommercialStatus = 'Proposal' | 'Negotiation' | 'Contract Signed' | 'Invoiced' | 'Closed';
export type OperationalStatus = 'Planning' | 'In Preparation' | 'Ready' | 'In Delivery' | 'Closing' | 'Closed';
export type AcademicStatus = 'Design' | 'Materials Pending' | 'Materials Under Review' | 'Materials Approved' | 'Published' | 'Complete';
export type LogisticsStatus = 'Not Started' | 'In Progress' | 'Partially Confirmed' | 'Confirmed' | 'Not Required' | 'Complete';
export type FinancialStatus = 'Budget Draft' | 'Within Budget' | 'At Risk' | 'Over Budget' | 'Reconciling' | 'Closed';
export type DeliveryStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Cancelled';

export type ProgrammeStatusSet = {
  commercial: CommercialStatus;
  operational: OperationalStatus;
  academic: AcademicStatus;
  logistics: LogisticsStatus;
  financial: FinancialStatus;
  delivery: DeliveryStatus;
};

export type LifecycleStage =
  | 'approved'
  | 'workspace'
  | 'manager'
  | 'checklist'
  | 'faculty'
  | 'logistics'
  | 'academic'
  | 'learners'
  | 'readiness'
  | 'delivery_approval'
  | 'delivery'
  | 'financial_closure'
  | 'archive';

export type Programme = {
  id: ID;
  code: string; // e.g. PRG-2027-014
  name: string;
  shortName: string;
  clientId: ID;
  contractId?: ID;
  managerId: ID; // StaffMember
  ownerId: ID; // StaffMember (account owner)
  coordinatorId: ID;
  type: ProgrammeType;
  deliveryMode: DeliveryMode;
  startDate: ISODate;
  endDate: ISODate;
  location: string;
  venueId?: ID;
  timeZone: TimeZoneId;
  contractValue: Money;
  budget: Money;
  revenue: Money; // recognised to date
  committed: Money;
  actual: Money;
  status: ProgrammeStatusSet;
  stage: LifecycleStage;
  capacity: number;
  description: string;
  objectives: string[];
  tags: string[];
  archived?: boolean;
  cancelled?: boolean;
  cancellationReason?: string;
  satisfaction?: number; // 0-5 evaluation average (completed / in delivery)
  nps?: number;
  templateId?: ID;
  accentHue: number;
};

export type Cohort = {
  id: ID;
  programmeId: ID;
  name: string;
  startDate: ISODate;
  endDate: ISODate;
  size: number;
};

export type Milestone = {
  id: ID;
  programmeId: ID;
  title: string;
  date: ISODate;
  status: 'done' | 'current' | 'upcoming' | 'at_risk';
  ownerId?: ID;
  note?: string;
};

// ─── Readiness ────────────────────────────────────────────────────────────────

export type ReadinessCategoryKey =
  | 'faculty'
  | 'materials'
  | 'hotel'
  | 'participants'
  | 'travel'
  | 'venue'
  | 'equipment'
  | 'client'
  | 'finance';

export type ReadinessItem = {
  id: ID;
  label: string;
  done: boolean;
  ownerId: ID;
  due: ISODate;
  critical?: boolean;
};

/**
 * Readiness is derived from live operational records wherever possible
 * (assignments, materials, hotel bookings, enrolments, itineraries, logistics checklist),
 * so the dashboard is never a manually maintained spreadsheet. Only Client Approval and
 * Financial Preparation are explicit checklists.
 */
export type ReadinessCategoryConfig = {
  key: ReadinessCategoryKey;
  ownerId: ID;
  due: ISODate;
  applicable: boolean;
  items?: ReadinessItem[];
};

export type ProgrammeReadiness = {
  programmeId: ID;
  categories: ReadinessCategoryConfig[];
  goNoGoDate: ISODate;
  threshold: number; // % required for Go
  decision?: { outcome: 'go' | 'no_go' | 'conditional'; by: ID; date: ISODate; note?: string };
};

// ─── Academic hierarchy: Programme → Cohort → Module → Session → Material ─────

export type LearningModule = {
  id: ID;
  programmeId: ID;
  cohortId: ID;
  order: number;
  title: string;
  summary: string;
  leadFacultyId: ID;
  objectives: string[];
  outcomes: string[];
  startDate: ISODate;
  endDate: ISODate;
};

export type AttendanceStatus = 'Not Started' | 'Open' | 'Recorded' | 'Closed';

export type Session = {
  id: ID;
  programmeId: ID;
  moduleId: ID;
  title: string;
  kind: 'Lecture' | 'Workshop' | 'Case Study' | 'Panel' | 'Coaching' | 'Simulation' | 'Site Visit' | 'Networking' | 'Assessment';
  facultyIds: ID[];
  date: ISODate;
  endDate: ISODate;
  start: TimeOfDay;
  end: TimeOfDay;
  timeZone: TimeZoneId;
  deliveryMode: DeliveryMode;
  venueId?: ID;
  roomName?: string;
  location?: string;
  meetingLink?: string;
  meetingId?: string;
  capacity: number;
  materialIds: ID[];
  attendance: AttendanceStatus;
  attendedCount?: number;
  agenda: { time: TimeOfDay; item: string }[];
  objectives: string[];
  recurrence?: 'Weekly' | 'Daily' | 'None';
  status: 'Scheduled' | 'Tentative' | 'Completed' | 'Cancelled';
};

export type MaterialStatus = 'Not Submitted' | 'Draft' | 'Submitted' | 'Under Review' | 'Changes Requested' | 'Approved' | 'Published';
export type MaterialKind = 'Presentation' | 'Reading' | 'Case Study' | 'Assignment' | 'Assessment' | 'Workbook' | 'Video';

export type MaterialVersion = {
  id: ID;
  label: string; // v1, v2…
  stage: 'Draft' | 'Final' | 'Revised';
  date: ISODate;
  authorName: string;
  note: string;
  sizeKb: number;
  pages?: number;
};

export type ReviewComment = {
  id: ID;
  authorId: ID; // staff or faculty
  date: ISODateTime;
  text: string;
  resolved?: boolean;
};

export type Material = {
  id: ID;
  programmeId: ID;
  moduleId: ID;
  sessionId?: ID;
  title: string;
  kind: MaterialKind;
  ownerFacultyId: ID;
  reviewerId: ID; // staff
  status: MaterialStatus;
  dueDate: ISODate;
  format: 'PDF' | 'PPTX' | 'DOCX' | 'XLSX' | 'MP4' | 'Link';
  versions: MaterialVersion[];
  comments: ReviewComment[];
  learnerVisible: boolean;
};

// ─── Faculty ──────────────────────────────────────────────────────────────────

export type Faculty = {
  id: ID;
  name: string;
  honorific: string; // Prof., Dr.
  initials: string;
  title: string;
  institution: string;
  location: string;
  timeZone: TimeZoneId;
  email: string;
  phone: string;
  bio: string;
  expertise: string[];
  languages: string[];
  rating: number;
  sessionsDelivered: number;
  dailyFee: Money;
  feeCurrency: 'USD';
  contractStatus: 'Active' | 'Pending Signature' | 'Expired' | 'Draft';
  preferredAirport: string;
  dietary?: string;
  availability: 'Available' | 'Limited' | 'Unavailable';
  unavailable: { from: ISODate; to: ISODate; reason: string }[];
  avatarHue: number;
  utilisation: number; // 0-100 this quarter
};

export type FacultyAssignmentStatus = 'Proposed' | 'Request Sent' | 'Confirmed' | 'Declined' | 'Contract Issued' | 'Contracted';

export type FacultyAssignment = {
  id: ID;
  facultyId: ID;
  programmeId: ID;
  sessionIds: ID[];
  role: 'Lead Faculty' | 'Faculty' | 'Guest Speaker' | 'Coach';
  status: FacultyAssignmentStatus;
  days: number;
  fee: Money;
  requestedOn: ISODate;
  confirmedOn?: ISODate;
};

export type FacultyFeedback = {
  id: ID;
  facultyId: ID;
  programmeId: ID;
  sessionId?: ID;
  rating: number;
  comment: string;
  author: string;
  date: ISODate;
};

// ─── Learners & enrolment ─────────────────────────────────────────────────────

/** A person, independent of any programme. */
export type Learner = {
  id: ID;
  firstName: string;
  lastName: string;
  initials: string;
  jobTitle: string;
  organisation: string;
  clientId?: ID;
  country: string;
  email: string;
  phone: string;
  linkedIn?: string;
  dietary?: string;
  accessibility?: string;
  notes?: string;
  avatarHue: number;
  gender?: 'F' | 'M';
};

export type EnrollmentStatus = 'Nominated' | 'Invited' | 'Registered' | 'Confirmed' | 'Attending' | 'Completed' | 'Withdrawn' | 'Waitlisted';

/** A learner's participation in one programme. */
export type Enrollment = {
  id: ID;
  learnerId: ID;
  programmeId: ID;
  cohortId?: ID;
  status: EnrollmentStatus;
  nominatedBy?: string;
  nominatedOn?: ISODate;
  registeredOn?: ISODate;
  attendanceRate?: number; // 0-100
  progress?: number; // 0-100
  learningAccess: 'Not Issued' | 'Invited' | 'Active' | 'Suspended';
  requiresHotel: boolean;
  requiresTravel: boolean;
  assessmentScore?: number;
  certificateIssued?: boolean;
  certificateId?: string;
  feedbackSubmitted?: boolean;
  requirementsComplete: boolean;
};

export type AttendanceRecord = {
  id: ID;
  sessionId: ID;
  learnerId: ID;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
};

export type Assignment = {
  id: ID;
  programmeId: ID;
  moduleId: ID;
  title: string;
  brief: string;
  dueDate: ISODate;
  weight: number;
  kind: 'Individual' | 'Group';
};

export type AssignmentSubmission = {
  id: ID;
  assignmentId: ID;
  learnerId: ID;
  status: 'Not Started' | 'Draft' | 'Submitted' | 'Graded' | 'Late';
  submittedOn?: ISODate;
  grade?: string;
  score?: number;
  feedback?: string;
};

export type Assessment = {
  id: ID;
  programmeId: ID;
  moduleId: ID;
  title: string;
  kind: 'Quiz' | 'Peer Review' | 'Reflection' | 'Capstone';
  date: ISODate;
  maxScore: number;
  learnerScore?: number;
  status: 'Upcoming' | 'Open' | 'Completed';
};

// ─── Tasks & workflow ─────────────────────────────────────────────────────────

export type TaskStatus = 'To Do' | 'In Progress' | 'Blocked' | 'In Review' | 'Done';
export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type TaskComment = { id: ID; authorId: ID; date: ISODateTime; text: string };
export type TaskEvent = { id: ID; date: ISODateTime; actorId: ID; text: string };

export type Task = {
  id: ID;
  title: string;
  description: string;
  ownerId: ID; // StaffMember
  programmeId: ID;
  relatedPerson?: { kind: 'faculty' | 'learner' | 'contact' | 'staff'; id: ID };
  dueDate: ISODate;
  priority: Priority;
  status: TaskStatus;
  category: 'Faculty' | 'Academic' | 'Logistics' | 'Finance' | 'Learners' | 'Client' | 'Operations';
  dependsOn: ID[];
  attachmentIds: ID[]; // Document ids
  comments: TaskComment[];
  history: TaskEvent[];
  createdOn: ISODate;
  completedOn?: ISODate;
};

export type WorkflowTemplateTask = { title: string; offsetDays: number; category: Task['category']; role: StaffRoleKey };

export type WorkflowTemplate = {
  id: ID;
  name: string;
  description: string;
  durationLabel: string;
  deliveryMode: DeliveryMode | 'Any';
  phases: { name: string; tasks: WorkflowTemplateTask[] }[];
  usedCount: number;
};

// ─── Travel, accommodation, venues ────────────────────────────────────────────

export type Hotel = {
  id: ID;
  name: string;
  city: string;
  country: string;
  address: string;
  stars: number;
  phone: string;
  email: string;
  contactName: string;
  contractedRate: Money; // per night, standard room
  roomTypes: { name: string; rate: Money; available: number }[];
  distanceToVenue: string;
  amenities: string[];
  rating: number;
  preferred: boolean;
  hue: number;
};

export type BookingStatus = 'Requested' | 'Provisional' | 'Confirmed' | 'Amended' | 'Cancelled' | 'Checked In' | 'Checked Out';
export type InvoiceStatus = 'Not Invoiced' | 'Invoice Received' | 'Approved' | 'Paid' | 'Disputed';

/** Hotel booking record — one guest, one room. */
export type HotelBooking = {
  id: ID;
  hotelId: ID;
  programmeId: ID;
  guest: { kind: 'learner' | 'faculty' | 'staff'; id: ID };
  roomType: string;
  checkIn: ISODate;
  checkOut: ISODate;
  confirmationNumber?: string;
  status: BookingStatus;
  cost: Money;
  invoiceStatus: InvoiceStatus;
  specialRequests?: string;
  cancellationDeadline: ISODate;
  roomNumber?: string;
  sharing?: boolean;
};

export type FlightSegment = {
  id: ID;
  carrier: string;
  flightNumber: string;
  from: string; // IATA
  fromCity: string;
  to: string;
  toCity: string;
  date: ISODate;
  depart: TimeOfDay;
  arrive: TimeOfDay;
  arriveDate: ISODate;
  cabin: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  seat?: string;
  pnr?: string;
};

export type TravelItinerary = {
  id: ID;
  programmeId: ID;
  traveller: { kind: 'learner' | 'faculty' | 'staff'; id: ID };
  status: 'Missing' | 'Requested' | 'Options Sent' | 'Booked' | 'Ticketed' | 'Changed' | 'Completed';
  segments: FlightSegment[];
  transfers: { id: ID; date: ISODate; time: TimeOfDay; from: string; to: string; provider: string; status: 'Booked' | 'Pending' }[];
  cost: Money;
  visaRequired?: boolean;
  visaStatus?: 'Not Required' | 'In Progress' | 'Issued';
  notes?: string;
};

export type Venue = {
  id: ID;
  name: string;
  city: string;
  country: string;
  address: string;
  kind: 'Executive Centre' | 'Hotel Conference' | 'Conference Centre' | 'University Campus';
  contactName: string;
  phone: string;
  email: string;
  rooms: VenueRoom[];
  amenities: string[];
  dayRate: Money;
  rating: number;
  hue: number;
};

export type SeatingLayout = 'Classroom' | 'Theatre' | 'U-Shape' | 'Boardroom' | 'Cabaret' | 'Banquet';

export type VenueRoom = {
  id: ID;
  name: string;
  capacity: Partial<Record<SeatingLayout, number>>;
  sizeSqm: number;
  floor: string;
  av: string[];
  naturalLight: boolean;
};

export type VenueBooking = {
  id: ID;
  venueId: ID;
  roomId: ID;
  programmeId: ID;
  dates: { from: ISODate; to: ISODate };
  layout: SeatingLayout;
  attendees: number;
  status: 'Enquiry' | 'Provisional' | 'Confirmed' | 'Cancelled';
  cost: Money;
  av: { item: string; qty: number; confirmed: boolean }[];
  catering: { time: TimeOfDay; item: string; covers: number; dietaryNotes?: string; confirmed: boolean }[];
  notes?: string;
};

export type LogisticsArea = 'Venue' | 'Audio/Visual' | 'Catering' | 'Transport' | 'Printing' | 'Event Materials' | 'On-site';

export type LogisticsItem = {
  id: ID;
  programmeId: ID;
  area: LogisticsArea;
  label: string;
  detail?: string;
  ownerId: ID;
  due: ISODate;
  done: boolean;
  taskId?: ID;
  quantity?: string;
};

export type RunSheetItem = {
  id: ID;
  programmeId: ID;
  date: ISODate;
  time: TimeOfDay;
  title: string;
  detail: string;
  ownerId: ID;
  location: string;
  status: 'Upcoming' | 'In Progress' | 'Done' | 'Issue';
};

// ─── Finance ──────────────────────────────────────────────────────────────────

export type CostCategory =
  | 'Faculty Fees'
  | 'Hotel'
  | 'Travel'
  | 'Transportation'
  | 'Venue Rental'
  | 'Catering'
  | 'Learning Materials'
  | 'External Services'
  | 'Other';

export type BudgetLine = {
  programmeId: ID;
  category: CostCategory;
  budget: Money;
  committed: Money;
  actual: Money;
  pending: Money;
};

export type TransactionKind =
  | 'Purchase Request'
  | 'Purchase Order'
  | 'Supplier Invoice'
  | 'Faculty Invoice'
  | 'Payment Request'
  | 'Expense';

export type TransactionStatus = 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Scheduled' | 'Paid' | 'Overdue';

/** Expense-side financial record (cost). */
export type Transaction = {
  id: ID;
  reference: string;
  kind: TransactionKind;
  programmeId: ID;
  category: CostCategory;
  payee: string;
  description: string;
  amount: Money;
  date: ISODate;
  dueDate?: ISODate;
  status: TransactionStatus;
  requestedBy: ID;
  approverId?: ID;
  documentId?: ID;
  linkedId?: ID; // e.g. PO for an invoice
};

export type ClientInvoiceStatus = 'Draft' | 'Issued' | 'Partially Paid' | 'Paid' | 'Overdue';

/** Revenue-side record: an invoice issued to a client. */
export type ClientInvoice = {
  id: ID;
  reference: string;
  programmeId: ID;
  clientId: ID;
  milestone: string;
  amount: Money;
  paid: Money;
  issuedOn: ISODate;
  dueDate: ISODate;
  status: ClientInvoiceStatus;
};

export type RevenueSchedule = { programmeId: ID; month: string; recognised: Money; planned: Money };

// ─── Documents, approvals, communications ─────────────────────────────────────

export type DocumentKind =
  | 'Contract'
  | 'Agreement'
  | 'Rooming List'
  | 'Itinerary'
  | 'Invoice'
  | 'Material'
  | 'Participant List'
  | 'Report'
  | 'Confirmation'
  | 'Brief'
  | 'Quote'
  | 'Policy';

export type DocumentRecord = {
  id: ID;
  title: string;
  kind: DocumentKind;
  format: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'CSV' | 'JPG';
  programmeId?: ID;
  clientId?: ID;
  facultyId?: ID;
  uploadedBy: ID;
  uploadedOn: ISODate;
  sizeKb: number;
  pages: number;
  version: string;
  status: 'Draft' | 'Final' | 'Signed' | 'Superseded' | 'Under Review';
  summary: string;
  extracted?: { label: string; value: string }[];
  visibleToFaculty?: boolean;
  visibleToLearners?: boolean;
  tags: string[];
};

export type ApprovalKind =
  | 'Budget'
  | 'Payment'
  | 'Purchase Order'
  | 'Material'
  | 'Hotel Booking'
  | 'Faculty Contract'
  | 'Go / No-Go'
  | 'Expense'
  | 'Programme Change';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Changes Requested';

export type Approval = {
  id: ID;
  kind: ApprovalKind;
  title: string;
  detail: string;
  programmeId: ID;
  requestedBy: ID;
  requestedOn: ISODate;
  dueDate: ISODate;
  amount?: Money;
  status: ApprovalStatus;
  approverIds: ID[];
  chain: { approverId: ID; status: ApprovalStatus | 'Waiting'; date?: ISODate; note?: string }[];
  relatedRoute?: string;
  urgent?: boolean;
};

export type NotificationCategory = 'Tasks' | 'Programme' | 'Approvals' | 'Faculty' | 'Learners' | 'Logistics' | 'Finance' | 'System';

export type AppNotification = {
  id: ID;
  category: NotificationCategory;
  title: string;
  body: string;
  date: ISODateTime;
  read: boolean;
  programmeId?: ID;
  route?: string;
  audience: 'staff' | 'faculty' | 'learner';
  actorName?: string;
};

export type ActivityKind =
  | 'programme_created'
  | 'faculty_assigned'
  | 'material_uploaded'
  | 'material_approved'
  | 'hotel_confirmed'
  | 'task_completed'
  | 'invoice_received'
  | 'invoice_issued'
  | 'approval_granted'
  | 'participant_registered'
  | 'booking_changed'
  | 'session_scheduled'
  | 'comment'
  | 'status_changed'
  | 'document_uploaded'
  | 'payment_received';

export type ActivityLog = {
  id: ID;
  programmeId: ID;
  kind: ActivityKind;
  actorId: ID; // staff/faculty id or 'system'
  text: string;
  date: ISODateTime;
  route?: string;
};

export type Channel = 'Email' | 'WhatsApp' | 'Internal' | 'Discussion' | 'Call Note';

/** A reference to a communication held in an external system (email, WhatsApp) or internally. */
export type CommunicationRef = {
  id: ID;
  channel: Channel;
  counterpart: { kind: 'client' | 'faculty' | 'supplier' | 'learner' | 'staff'; name: string; org?: string };
  subject: string;
  excerpt: string;
  date: ISODateTime;
  programmeId?: ID;
  taskId?: ID;
  unread: boolean;
  resolved: boolean;
  mentionsMe?: boolean;
  notes: { id: ID; authorId: ID; date: ISODateTime; text: string }[];
  attachments?: number;
};

export type DiscussionPost = {
  id: ID;
  programmeId: ID;
  authorId: ID;
  date: ISODateTime;
  text: string;
  replies?: { id: ID; authorId: ID; date: ISODateTime; text: string }[];
  pinned?: boolean;
};

export type SmartAlertKind =
  | 'faculty_confirmation'
  | 'materials_missing'
  | 'hotel_deadline'
  | 'registration_incomplete'
  | 'itinerary_missing'
  | 'budget_overrun'
  | 'schedule_conflict';

export type SmartAlert = {
  id: ID;
  kind: SmartAlertKind;
  severity: 'critical' | 'warning' | 'info';
  programmeId: ID;
  title: string;
  detail: string;
  actionLabel: string;
  route: string;
  ownerId: ID;
  dismissed?: boolean;
};
