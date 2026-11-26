import type { BudgetLine, ClientInvoice, CostCategory, RevenueSchedule, Transaction } from '../models';

export const costCategories: CostCategory[] = ['Faculty Fees', 'Hotel', 'Travel', 'Transportation', 'Venue Rental', 'Catering', 'Learning Materials', 'External Services', 'Other'];

/** [budget, committed, actual, pending] per category, in order of costCategories. */
type Lines = [number, number, number, number][];

const lines: Record<string, Lines> = {
  'p-elp': [
    [54_800, 54_800, 0, 0], [52_400, 50_700, 0, 28_350], [38_000, 31_800, 22_600, 0], [9_600, 6_800, 0, 6_800], [36_800, 36_800, 9_600, 0], [38_200, 30_400, 0, 0], [14_200, 11_900, 7_400, 0], [42_000, 12_000, 4_300, 0], [26_000, 3_400, 2_500, 0],
  ],
  'p-smp': [
    [60_000, 59_600, 41_200, 6_200], [22_000, 20_100, 6_840, 0], [24_000, 21_400, 18_900, 0], [6_000, 4_200, 3_100, 0], [43_200, 43_200, 21_600, 0], [26_000, 24_800, 14_200, 0], [12_000, 10_200, 10_200, 0], [38_000, 32_000, 26_860, 0], [16_800, 6_000, 6_000, 0],
  ],
  'p-dte': [
    [38_400, 38_400, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [9_600, 7_800, 4_200, 0], [68_000, 52_000, 17_600, 0], [25_000, 0, 0, 0],
  ],
  'p-afl': [
    [24_000, 18_600, 0, 0], [18_400, 1_560, 0, 0], [16_000, 0, 0, 0], [3_800, 600, 0, 0], [17_400, 17_400, 5_800, 0], [14_800, 0, 0, 0], [6_600, 0, 0, 0], [28_000, 20_240, 6_800, 0], [7_000, 0, 0, 0],
  ],
  'p-gbs': [
    [96_000, 80_800, 52_600, 9_600], [44_000, 41_400, 22_100, 0], [46_000, 54_100, 40_600, 0], [8_000, 7_200, 4_300, 0], [0, 0, 0, 0], [34_000, 28_000, 14_000, 0], [18_000, 16_500, 12_100, 0], [118_000, 66_000, 28_700, 0], [34_000, 8_000, 2_000, 0],
  ],
  'p-ie': [
    [26_300, 26_300, 26_300, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [8_400, 8_100, 8_100, 0], [54_000, 52_400, 52_400, 0], [15_300, 11_800, 11_800, 0],
  ],
  'p-psl': [
    [40_200, 24_500, 0, 0], [36_000, 0, 0, 0], [32_000, 0, 0, 0], [8_000, 0, 0, 0], [34_500, 0, 0, 0], [30_000, 0, 0, 0], [12_000, 0, 0, 0], [70_000, 17_500, 8_600, 0], [23_300, 0, 0, 0],
  ],
  'p-ai': [
    [41_200, 22_400, 0, 0], [6_000, 0, 0, 0], [12_000, 0, 0, 0], [3_000, 600, 0, 0], [0, 0, 0, 0], [8_200, 1_800, 0, 0], [9_600, 0, 0, 0], [96_000, 72_000, 18_200, 0], [38_000, 0, 0, 0],
  ],
  'p-wil': [
    [36_000, 36_000, 36_000, 0], [26_100, 24_800, 24_800, 0], [28_000, 26_400, 26_400, 0], [4_800, 4_100, 4_100, 0], [34_500, 34_500, 34_500, 0], [24_000, 22_300, 22_300, 0], [8_000, 7_200, 7_200, 0], [22_000, 20_000, 20_000, 0], [8_600, 6_000, 6_000, 0],
  ],
  'p-scr': [
    [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [6_400, 6_400, 6_400, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0],
  ],
};

export const budgetLines: BudgetLine[] = Object.entries(lines).flatMap(([programmeId, rows]) =>
  rows.map(([budget, committed, actual, pending], i) => ({ programmeId, category: costCategories[i], budget, committed, actual, pending })),
);

export const transactions: Transaction[] = [
  { id: 'tx-01', reference: 'PR-2027-0418', kind: 'Payment Request', programmeId: 'p-elp', category: 'Hotel', payee: 'Creekside Grand Hotel', description: '30% deposit for 26-room block, 10–16 April', amount: 28_350, date: '2027-03-26', dueDate: '2027-04-01', status: 'Pending Approval', requestedBy: 's-hannah', approverId: 's-rajiv', documentId: 'd-hotel-invoice', linkedId: 'tx-05' },
  { id: 'tx-02', reference: 'PO-2027-0233', kind: 'Purchase Order', programmeId: 'p-elp', category: 'Transportation', payee: 'Desert Line Transport', description: 'Airport transfers (20) and site-visit coach, 10–16 April', amount: 6_800, date: '2027-03-27', status: 'Pending Approval', requestedBy: 's-hannah', approverId: 's-rajiv', documentId: 'd-transport-quote' },
  { id: 'tx-03', reference: 'PO-2027-0198', kind: 'Purchase Order', programmeId: 'p-elp', category: 'Venue Rental', payee: 'Creekside Grand Conference Wing', description: 'Ballroom and breakout rooms, 5 days', amount: 36_800, date: '2027-03-12', status: 'Approved', requestedBy: 's-sofia', approverId: 's-rajiv', documentId: 'd-venue-contract' },
  { id: 'tx-04', reference: 'INV-CG-77120', kind: 'Supplier Invoice', programmeId: 'p-elp', category: 'Venue Rental', payee: 'Creekside Grand Conference Wing', description: 'Venue deposit (25%)', amount: 9_600, date: '2027-03-18', dueDate: '2027-04-17', status: 'Paid', requestedBy: 's-hannah', approverId: 's-rajiv', linkedId: 'tx-03' },
  { id: 'tx-05', reference: 'PO-2027-0201', kind: 'Purchase Order', programmeId: 'p-elp', category: 'Hotel', payee: 'Creekside Grand Hotel', description: 'Room block — 26 rooms, 5 nights', amount: 50_700, date: '2027-03-14', status: 'Approved', requestedBy: 's-sofia', approverId: 's-rajiv' },
  { id: 'tx-06', reference: 'INV-SKT-3391', kind: 'Supplier Invoice', programmeId: 'p-elp', category: 'Travel', payee: 'SkyTrail Travel Management', description: '13 tickets issued (faculty & participants)', amount: 22_600, date: '2027-03-24', dueDate: '2027-04-23', status: 'Approved', requestedBy: 's-sofia', approverId: 's-rajiv' },
  { id: 'tx-07', reference: 'EXP-2027-0612', kind: 'Expense', programmeId: 'p-elp', category: 'Learning Materials', payee: 'Omar Farouk', description: 'Proof prints for workbook and badge samples', amount: 412, date: '2027-03-25', status: 'Approved', requestedBy: 's-omar', approverId: 's-hannah' },
  { id: 'tx-08', reference: 'FI-2027-0087', kind: 'Faculty Invoice', programmeId: 'p-ie', category: 'Faculty Fees', payee: 'Prof. Isabelle Laurent', description: 'I&E lead faculty — 4 days', amount: 20_800, date: '2027-02-22', dueDate: '2027-03-24', status: 'Paid', requestedBy: 's-daniel', approverId: 's-rajiv' },
  { id: 'tx-09', reference: 'FI-2027-0102', kind: 'Faculty Invoice', programmeId: 'p-smp', category: 'Faculty Fees', payee: 'Prof. Henrik Lindqvist', description: 'SMP Module 2 — 2 days', amount: 10_800, date: '2027-03-27', dueDate: '2027-04-26', status: 'Submitted', requestedBy: 's-daniel', approverId: 's-rajiv' },
  { id: 'tx-10', reference: 'INV-SKT-3302', kind: 'Supplier Invoice', programmeId: 'p-gbs', category: 'Travel', payee: 'SkyTrail Travel Management', description: 'Residency 2 flights — 8 participants & faculty', amount: 18_400, date: '2027-03-15', dueDate: '2027-04-14', status: 'Pending Approval', requestedBy: 's-sofia', approverId: 's-rajiv' },
  { id: 'tx-11', reference: 'PR-2027-0391', kind: 'Purchase Request', programmeId: 'p-dte', category: 'External Services', payee: 'Zoom Video Communications', description: 'Webinar licence upgrade (500 seats, 1 month)', amount: 2_400, date: '2027-03-22', status: 'Submitted', requestedBy: 's-omar', approverId: 's-hannah' },
  { id: 'tx-12', reference: 'PR-2027-0402', kind: 'Purchase Request', programmeId: 'p-psl', category: 'External Services', payee: 'Lisan Interpretation Services', description: 'Simultaneous Arabic interpretation, 5 days', amount: 17_500, date: '2027-03-25', status: 'Draft', requestedBy: 's-yusuf' },
  { id: 'tx-13', reference: 'FI-2027-0095', kind: 'Faculty Invoice', programmeId: 'p-gbs', category: 'Faculty Fees', payee: 'Dr. Tomás Herrera', description: 'GBS Residency 1 & Module 2', amount: 19_200, date: '2027-03-05', dueDate: '2027-02-28', status: 'Overdue', requestedBy: 's-daniel', approverId: 's-rajiv' },
  { id: 'tx-14', reference: 'EXP-2027-0598', kind: 'Expense', programmeId: 'p-smp', category: 'Other', payee: 'Yusuf Rahman', description: 'Client dinner — mid-programme review with Atlas', amount: 640, date: '2027-03-26', status: 'Pending Approval', requestedBy: 's-yusuf', approverId: 's-hannah' },
  { id: 'tx-15', reference: 'PO-2027-0221', kind: 'Purchase Order', programmeId: 'p-afl', category: 'Venue Rental', payee: 'The Guildhall Rooms', description: 'Mercers’ Room, 3 days incl. private dining', amount: 17_400, date: '2027-03-23', status: 'Approved', requestedBy: 's-sofia', approverId: 's-rajiv' },
  { id: 'tx-16', reference: 'PR-2027-0412', kind: 'Payment Request', programmeId: 'p-ai', category: 'External Services', payee: 'Cognita Labs', description: 'Custom AI use-case simulation build — milestone 1', amount: 18_200, date: '2027-03-24', dueDate: '2027-04-07', status: 'Scheduled', requestedBy: 's-claire', approverId: 's-rajiv' },
  { id: 'tx-17', reference: 'INV-PRT-0911', kind: 'Supplier Invoice', programmeId: 'p-elp', category: 'Learning Materials', payee: 'Inkwell Print Studio', description: 'Workbook print run (deposit)', amount: 2_800, date: '2027-03-27', dueDate: '2027-04-26', status: 'Submitted', requestedBy: 's-omar', approverId: 's-hannah' },
  { id: 'tx-18', reference: 'FI-2027-0110', kind: 'Faculty Invoice', programmeId: 'p-smp', category: 'Faculty Fees', payee: 'Dr. Olivia Bennett', description: 'SMP coaching circles — 2 days', amount: 7_800, date: '2027-03-28', dueDate: '2027-04-27', status: 'Pending Approval', requestedBy: 's-daniel', approverId: 's-rajiv' },
];

export const clientInvoices: ClientInvoice[] = [
  { id: 'ci-01', reference: 'EM-INV-27-1041', programmeId: 'p-elp', clientId: 'c-meridian', milestone: '40% on signature', amount: 194_400, paid: 194_400, issuedOn: '2027-01-21', dueDate: '2027-02-20', status: 'Paid' },
  { id: 'ci-02', reference: 'EM-INV-27-1102', programmeId: 'p-smp', clientId: 'c-atlas', milestone: '50% on signature', amount: 196_000, paid: 196_000, issuedOn: '2026-12-10', dueDate: '2027-01-24', status: 'Paid' },
  { id: 'ci-03', reference: 'EM-INV-27-1139', programmeId: 'p-smp', clientId: 'c-atlas', milestone: 'Mid-programme (20%)', amount: 78_400, paid: 0, issuedOn: '2027-03-01', dueDate: '2027-04-15', status: 'Issued' },
  { id: 'ci-04', reference: 'EM-INV-27-1060', programmeId: 'p-dte', clientId: 'c-orion', milestone: '30% on signature', amount: 80_400, paid: 80_400, issuedOn: '2027-02-11', dueDate: '2027-03-13', status: 'Paid' },
  { id: 'ci-05', reference: 'EM-INV-27-1066', programmeId: 'p-ai', clientId: 'c-orion', milestone: '30% on signature', amount: 102_600, paid: 51_300, issuedOn: '2027-02-11', dueDate: '2027-03-13', status: 'Partially Paid' },
  { id: 'ci-06', reference: 'EM-INV-27-1011', programmeId: 'p-gbs', clientId: 'c-halden', milestone: 'Q1 revenue share', amount: 249_600, paid: 124_800, issuedOn: '2027-01-05', dueDate: '2027-02-04', status: 'Overdue' },
  { id: 'ci-07', reference: 'EM-INV-26-0988', programmeId: 'p-ie', clientId: 'c-meridian', milestone: '40% on signature', amount: 70_400, paid: 70_400, issuedOn: '2026-11-20', dueDate: '2026-12-20', status: 'Paid' },
  { id: 'ci-08', reference: 'EM-INV-27-1090', programmeId: 'p-ie', clientId: 'c-meridian', milestone: '40% on delivery', amount: 70_400, paid: 70_400, issuedOn: '2027-02-22', dueDate: '2027-03-24', status: 'Paid' },
  { id: 'ci-09', reference: 'EM-INV-27-1150', programmeId: 'p-ie', clientId: 'c-meridian', milestone: '20% on close', amount: 35_200, paid: 0, issuedOn: '2027-03-25', dueDate: '2027-04-24', status: 'Issued' },
  { id: 'ci-10', reference: 'EM-INV-27-1121', programmeId: 'p-afl', clientId: 'c-atlas', milestone: '30% on signature', amount: 64_200, paid: 64_200, issuedOn: '2027-03-02', dueDate: '2027-04-16', status: 'Paid' },
  { id: 'ci-11', reference: 'EM-INV-27-1131', programmeId: 'p-psl', clientId: 'c-npsi', milestone: '30% on signature', amount: 131_400, paid: 0, issuedOn: '2027-03-05', dueDate: '2027-05-04', status: 'Issued' },
  { id: 'ci-12', reference: 'EM-INV-27-1163', programmeId: 'p-elp', clientId: 'c-meridian', milestone: '40% on delivery', amount: 194_400, paid: 0, issuedOn: '2027-04-16', dueDate: '2027-05-16', status: 'Draft' },
];

/** Monthly revenue recognition (portfolio), used by finance and reporting. */
export const revenueByMonth: { month: string; revenue: number; costs: number; plan: number }[] = [
  { month: 'Oct', revenue: 212_000, costs: 141_000, plan: 205_000 },
  { month: 'Nov', revenue: 348_000, costs: 222_000, plan: 330_000 },
  { month: 'Dec', revenue: 196_000, costs: 118_000, plan: 210_000 },
  { month: 'Jan', revenue: 264_000, costs: 162_000, plan: 250_000 },
  { month: 'Feb', revenue: 318_000, costs: 201_000, plan: 300_000 },
  { month: 'Mar', revenue: 296_000, costs: 194_000, plan: 320_000 },
  { month: 'Apr', revenue: 0, costs: 0, plan: 440_000 },
  { month: 'May', revenue: 0, costs: 0, plan: 520_000 },
  { month: 'Jun', revenue: 0, costs: 0, plan: 390_000 },
];

export const revenueSchedule: RevenueSchedule[] = [
  { programmeId: 'p-elp', month: '2027-04', recognised: 0, planned: 486_000 },
  { programmeId: 'p-smp', month: '2027-03', recognised: 196_000, planned: 196_000 },
  { programmeId: 'p-smp', month: '2027-04', recognised: 0, planned: 196_000 },
  { programmeId: 'p-gbs', month: '2027-02', recognised: 104_000, planned: 104_000 },
  { programmeId: 'p-gbs', month: '2027-03', recognised: 104_000, planned: 104_000 },
];
