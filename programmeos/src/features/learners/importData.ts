/** Simulated import files — no real file is read in this phase. */
export type ImportRow = {
  row: number;
  first: string;
  last: string;
  email: string;
  title: string;
  organisation: string;
  phone: string;
  dietary?: string;
  status: 'valid' | 'warning' | 'error';
  message?: string;
};

export type ImportFile = {
  id: string;
  name: string;
  source: string;
  format: 'XLSX' | 'CSV';
  sizeKb: number;
  modified: string;
  programmeId: string;
  columns: { header: string; field: string | null; sample: string }[];
  rows: ImportRow[];
};

const NPSI = 'National Public Service Institute';

export const importFiles: ImportFile[] = [
  {
    id: 'if-1',
    name: 'NPSI_PSL_nominations_v2.xlsx',
    source: 'Email from Reem Al Saud · 27 Mar',
    format: 'XLSX',
    sizeKb: 42,
    modified: '2027-03-27',
    programmeId: 'p-psl',
    columns: [
      { header: 'First Name', field: 'First name', sample: 'Abdulaziz' },
      { header: 'Family Name', field: 'Last name', sample: 'Al Harbi' },
      { header: 'Email Address', field: 'Email', sample: 'a.alharbi@npsi.example' },
      { header: 'Position', field: 'Job title', sample: 'Director General' },
      { header: 'Entity', field: 'Organisation', sample: 'Ministry of Municipal Affairs' },
      { header: 'Mobile', field: 'Phone', sample: '+966 55 210 4471' },
      { header: 'Dietary', field: 'Dietary requirements', sample: 'None' },
      { header: 'Employee No.', field: null, sample: 'NP-20419' },
    ],
    rows: [
      { row: 2, first: 'Abdulaziz', last: 'Al Harbi', email: 'a.alharbi@npsi.example', title: 'Director General', organisation: 'Ministry of Municipal Affairs', phone: '+966 55 210 4471', status: 'valid' },
      { row: 3, first: 'Nouf', last: 'Al Qahtani', email: 'n.alqahtani@npsi.example', title: 'Director of Policy', organisation: NPSI, phone: '+966 55 381 2290', dietary: 'Vegetarian', status: 'valid' },
      { row: 4, first: 'Turki', last: 'Al Shammari', email: 't.alshammari@npsi.example', title: 'Director, Delivery Unit', organisation: 'Ministry of Economy', phone: '+966 50 774 1182', status: 'valid' },
      { row: 5, first: 'Hessa', last: 'Al Dosari', email: 'h.aldosari@npsi.example', title: 'Director of Digital Services', organisation: 'Digital Government Authority', phone: '+966 54 120 9934', status: 'warning', message: 'Dietary requirements blank — will be requested at registration' },
      { row: 6, first: 'Majed', last: 'Al Ghamdi', email: 'm.alghamdi@npsi.example', title: 'Director of Planning', organisation: 'Ministry of Health', phone: '+966 55 902 3317', status: 'valid' },
      { row: 7, first: 'Sara', last: 'Al Zahrani', email: 's.alzahrani@npsi.example', title: 'Director, Strategy Office', organisation: NPSI, phone: '0551 23 44', status: 'warning', message: 'Phone number incomplete — kept, flagged for follow-up' },
      { row: 8, first: 'Khalid', last: 'Al Otaibi', email: 't.alshammari@npsi.example', title: 'Director of Finance', organisation: 'Ministry of Finance', phone: '+966 50 667 0042', status: 'error', message: 'Duplicate email — same as row 4' },
      { row: 9, first: 'Lama', last: 'Al Subaie', email: 'l.alsubaie@npsi.example', title: 'Director of HR', organisation: NPSI, phone: '+966 56 331 7781', status: 'valid' },
      { row: 10, first: 'Fahad', last: 'Al Mutlaq', email: 'fahad.mutlaq@npsi', title: 'Director, Procurement', organisation: 'Ministry of Commerce', phone: '+966 55 441 9920', status: 'error', message: 'Invalid email address' },
      { row: 11, first: 'Reem', last: 'Al Rasheed', email: 'r.alrasheed@npsi.example', title: 'Director of Communications', organisation: NPSI, phone: '+966 50 118 6634', status: 'valid' },
    ],
  },
  {
    id: 'if-2',
    name: 'Orion_DTE_late_additions.csv',
    source: 'Downloads · from Ben Carter',
    format: 'CSV',
    sizeKb: 3,
    modified: '2027-03-28',
    programmeId: 'p-dte',
    columns: [
      { header: 'first_name', field: 'First name', sample: 'Omar' },
      { header: 'last_name', field: 'Last name', sample: 'Haddad' },
      { header: 'email', field: 'Email', sample: 'omar.k@orionhealth.example' },
      { header: 'role', field: 'Job title', sample: 'Head of Pharmacy' },
      { header: 'site', field: null, sample: 'Jumeirah' },
    ],
    rows: [
      { row: 2, first: 'Omar', last: 'Khalil', email: 'omar.khalil@orionhealth.example', title: 'Head of Pharmacy', organisation: 'Orion Health Systems', phone: '+971 4 388 2201', status: 'valid' },
      { row: 3, first: 'Priya', last: 'Varghese', email: 'priya.varghese@orionhealth.example', title: 'Head of Nursing Informatics', organisation: 'Orion Health Systems', phone: '+971 4 388 2245', status: 'warning', message: 'Programme is full — will be waitlisted' },
      { row: 4, first: 'Rania', last: 'Khoury', email: 'rania.khoury@orionhealth.example', title: 'Chief Medical Officer', organisation: 'Orion Health Systems', phone: '+971 4 388 2100', status: 'error', message: 'Already enrolled in this programme' },
    ],
  },
  {
    id: 'if-3',
    name: 'Atlas_AFL_nominees.xlsx',
    source: 'Shared drive · Atlas Leadership Academy',
    format: 'XLSX',
    sizeKb: 18,
    modified: '2027-03-21',
    programmeId: 'p-afl',
    columns: [
      { header: 'Name', field: 'First name + Last name', sample: 'Wong Mei Xin' },
      { header: 'Email', field: 'Email', sample: 'meixin.wong@atlasbank.example' },
      { header: 'Title', field: 'Job title', sample: 'Head of FP&A' },
    ],
    rows: [
      { row: 2, first: 'Mei Xin', last: 'Wong', email: 'meixin.wong@atlasbank.example', title: 'Head of FP&A', organisation: 'Atlas Bank', phone: '+65 6123 8890', status: 'valid' },
      { row: 3, first: 'Haris', last: 'Iskandar', email: 'haris.iskandar@atlasbank.example', title: 'Group Treasurer', organisation: 'Atlas Bank', phone: '+65 6123 8811', status: 'valid' },
    ],
  },
];
