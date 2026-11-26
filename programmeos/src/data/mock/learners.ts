import type { Enrollment, EnrollmentStatus, Learner } from '../models';

type Row = [id: string, first: string, last: string, title: string, org: string, clientId: string | undefined, base: string, gender: 'F' | 'M', dietary?: string, accessibility?: string];

const rows: Row[] = [
  // Meridian Energy Group
  ['l-01', 'Khalid', 'Al Suwaidi', 'VP Upstream Operations', 'Meridian Energy Group', 'c-meridian', 'Abu Dhabi, UAE', 'M'],
  ['l-02', 'Fatima', 'Al Nuaimi', 'Director, Strategy & Planning', 'Meridian Energy Group', 'c-meridian', 'Abu Dhabi, UAE', 'F', 'Vegetarian'],
  ['l-03', 'Ahmed', 'Al Hammadi', 'Head of HSE', 'Meridian Energy Group', 'c-meridian', 'Ruwais, UAE', 'M'],
  ['l-04', 'Sarah', 'Mitchell', 'Director, Commercial Trading', 'Meridian Energy Group', 'c-meridian', 'London, UK', 'F'],
  ['l-05', 'Rashid', 'Al Mazrouei', 'VP Refining', 'Meridian Energy Group', 'c-meridian', 'Ruwais, UAE', 'M'],
  ['l-06', 'Priyanka', 'Iyer', 'Head of Finance Transformation', 'Meridian Energy Group', 'c-meridian', 'Mumbai, India', 'F', 'Vegetarian (no eggs)'],
  ['l-07', 'Hamad', 'Al Shamsi', 'Director, New Energies', 'Meridian Energy Group', 'c-meridian', 'Abu Dhabi, UAE', 'M'],
  ['l-08', 'Omar', 'Saleh', 'Head of Asset Integrity', 'Meridian Energy Group', 'c-meridian', 'Muscat, Oman', 'M'],
  ['l-09', 'Laura', 'Fernández', 'Director, Digital & IT', 'Meridian Energy Group', 'c-meridian', 'Madrid, Spain', 'F'],
  ['l-10', 'Yousef', 'Al Ali', 'VP Human Capital', 'Meridian Energy Group', 'c-meridian', 'Riyadh, Saudi Arabia', 'M'],
  ['l-11', 'Shamma', 'Al Falasi', 'Head of Corporate Communications', 'Meridian Energy Group', 'c-meridian', 'Abu Dhabi, UAE', 'F'],
  ['l-12', 'David', 'Okonkwo', 'Director, LNG Projects', 'Meridian Energy Group', 'c-meridian', 'Lagos, Nigeria', 'M'],
  ['l-13', 'Noor', 'Al Hashimi', 'Head of Sustainability', 'Meridian Energy Group', 'c-meridian', 'Doha, Qatar', 'F', undefined, 'Step-free access; recovering from knee surgery'],
  ['l-14', 'Thomas', 'Becker', 'Director, Engineering', 'Meridian Energy Group', 'c-meridian', 'Hamburg, Germany', 'M'],
  ['l-15', 'Abdullah', 'Al Mutairi', 'VP Supply Chain', 'Meridian Energy Group', 'c-meridian', 'Kuwait City, Kuwait', 'M'],
  ['l-16', 'Hind', 'Mahmoud', 'Head of Legal', 'Meridian Energy Group', 'c-meridian', 'Cairo, Egypt', 'F'],
  ['l-17', 'Vikram', 'Nair', 'Director, Downstream Marketing', 'Meridian Energy Group', 'c-meridian', 'Mumbai, India', 'M', 'Vegetarian'],
  ['l-18', 'Aisha', 'Karim', 'Head of Internal Audit', 'Meridian Energy Group', 'c-meridian', 'Manama, Bahrain', 'F'],
  ['l-19', 'Saeed', 'Al Harthy', 'Director, Exploration', 'Meridian Energy Group', 'c-meridian', 'Muscat, Oman', 'M'],
  ['l-20', 'Elena', 'Petrova', 'Head of Enterprise Risk', 'Meridian Energy Group', 'c-meridian', 'Astana, Kazakhstan', 'F'],
  ['l-21', 'Majid', 'Al Rashidi', 'Director, Operational Excellence', 'Meridian Energy Group', 'c-meridian', 'Kuwait City, Kuwait', 'M'],
  ['l-22', 'Grace', 'Wanjiru', 'Head of Talent Management', 'Meridian Energy Group', 'c-meridian', 'Nairobi, Kenya', 'F', 'Gluten-free'],
  ['l-23', 'Faisal', 'Al Dhaheri', 'VP Gas Processing', 'Meridian Energy Group', 'c-meridian', 'Abu Dhabi, UAE', 'M'],
  ['l-24', 'James', 'O’Connor', 'Director, Major Projects', 'Meridian Energy Group', 'c-meridian', 'Aberdeen, UK', 'M'],
  // Atlas Bank
  ['l-mariam', 'Mariam', 'Al Khatib', 'Senior Strategy Manager', 'Atlas Bank', 'c-atlas', 'Singapore', 'F'],
  ['l-26', 'Daniel', 'Tan', 'Head of Retail Banking Strategy', 'Atlas Bank', 'c-atlas', 'Singapore', 'M'],
  ['l-27', 'Priya', 'Subramaniam', 'VP Risk Analytics', 'Atlas Bank', 'c-atlas', 'Singapore', 'F'],
  ['l-28', 'Arjun', 'Mehta', 'Director, Treasury', 'Atlas Bank', 'c-atlas', 'Mumbai, India', 'M', 'Vegetarian'],
  ['l-29', 'Siti', 'Rahmah', 'Head of Digital Channels', 'Atlas Bank', 'c-atlas', 'Kuala Lumpur, Malaysia', 'F', 'Halal'],
  ['l-30', 'Kevin', 'Ng', 'Director, Corporate Banking', 'Atlas Bank', 'c-atlas', 'Hong Kong', 'M'],
  ['l-31', 'Natasha', 'Wong', 'Head of Compliance', 'Atlas Bank', 'c-atlas', 'Singapore', 'F'],
  ['l-32', 'Rizal', 'Hakim', 'VP Operations', 'Atlas Bank', 'c-atlas', 'Jakarta, Indonesia', 'M', 'Halal'],
  ['l-33', 'Emily', 'Lau', 'Director, Wealth Management', 'Atlas Bank', 'c-atlas', 'Singapore', 'F'],
  ['l-34', 'Benjamin', 'Koh', 'Head of Data & AI', 'Atlas Bank', 'c-atlas', 'Singapore', 'M'],
  ['l-35', 'Anjali', 'Rao', 'Head of HR Business Partnering', 'Atlas Bank', 'c-atlas', 'Singapore', 'F', 'Vegetarian'],
  ['l-36', 'Marcus', 'Lim', 'Director, SME Banking', 'Atlas Bank', 'c-atlas', 'Singapore', 'M'],
  // Orion Health Systems
  ['l-37', 'Rania', 'Khoury', 'Chief Medical Officer', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'F'],
  ['l-38', 'Mohammed', 'Al Zaabi', 'Chief Operating Officer', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'M'],
  ['l-39', 'Sanjay', 'Gupta', 'Director of Clinical Operations', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'M', 'Vegetarian'],
  ['l-40', 'Claire', 'Thompson', 'Chief Nursing Officer', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'F'],
  ['l-41', 'Ali', 'Hassan', 'Chief Financial Officer', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'M'],
  ['l-42', 'Mei', 'Lin', 'Head of Diagnostics', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'F'],
  ['l-43', 'Ahmed', 'Siddiqui', 'Director of IT', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'M'],
  ['l-44', 'Nadia', 'Rahman', 'Medical Director, Abu Dhabi', 'Orion Health Systems', 'c-orion', 'Abu Dhabi, UAE', 'F'],
  ['l-45', 'Tom', 'Richards', 'Director of Strategy', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'M'],
  ['l-46', 'Huda', 'Al Shehhi', 'Head of Patient Experience', 'Orion Health Systems', 'c-orion', 'Sharjah, UAE', 'F', undefined, 'Uses a screen reader — accessible PDFs and captions required'],
  ['l-47', 'Kwame', 'Mensah', 'Chief of Surgery', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'M'],
  ['l-48', 'Lina', 'Barakat', 'Head of Quality & Patient Safety', 'Orion Health Systems', 'c-orion', 'Dubai, UAE', 'F', 'Nut allergy (severe)'],
  // Open enrolment (Halden)
  ['l-49', 'Lucas', 'Moreau', 'Regional Director, MEA', 'Lumina Foods', undefined, 'Dubai, UAE', 'M'],
  ['l-50', 'Zainab', 'Okoro', 'General Manager', 'Kestrel Logistics', undefined, 'Lagos, Nigeria', 'F'],
  ['l-51', 'Hiroshi', 'Tanaka', 'VP International', 'Sakura Robotics', undefined, 'Tokyo, Japan', 'M'],
  ['l-52', 'Sophie', 'Turner', 'Strategy Director', 'Brightwater Utilities', undefined, 'London, UK', 'F'],
  ['l-53', 'Karim', 'Mansour', 'Chief Executive Officer', 'Delta Pharma', undefined, 'Cairo, Egypt', 'M'],
  ['l-54', 'Isabella', 'Rossi', 'Head of International Expansion', 'Vela Fashion House', undefined, 'Milan, Italy', 'F', 'Pescatarian'],
  ['l-55', 'Rahul', 'Kapoor', 'Director, Product', 'Nimbus Software', undefined, 'Bengaluru, India', 'M', 'Vegetarian'],
  ['l-56', 'Leila', 'Ahmadi', 'VP Growth', 'Oasis Telecom', undefined, 'Dubai, UAE', 'F'],
  ['l-57', 'Michael', 'Brennan', 'Managing Director', 'Harbor Capital Partners', undefined, 'Dubai, UAE', 'M'],
  ['l-58', 'Yasmin', 'Al Amiri', 'Director, Commercial', 'Falcon Aviation Services', undefined, 'Abu Dhabi, UAE', 'F'],
  ['l-59', 'Jia', 'Chen', 'Head of Asia Partnerships', 'Terra Mining', undefined, 'Shanghai, China', 'F'],
  ['l-60', 'Oliver', 'Grant', 'Strategy Lead', 'Northwind Ventures', undefined, 'London, UK', 'M'],
];

function slug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '');
}

const DIAL: [string, number][] = [
  ['UAE', 971], ['Singapore', 65], ['UK', 44], ['Saudi', 966], ['India', 91], ['Oman', 968], ['Spain', 34], ['Nigeria', 234], ['Qatar', 974], ['Germany', 49],
  ['Kuwait', 965], ['Egypt', 20], ['Bahrain', 973], ['Kazakhstan', 7], ['Kenya', 254], ['Malaysia', 60], ['Hong Kong', 852], ['Indonesia', 62], ['Japan', 81], ['Italy', 39], ['China', 86],
];
function dialCode(base: string) {
  return DIAL.find(([k]) => base.includes(k))?.[1] ?? 971;
}

const domains: Record<string, string> = {
  'Meridian Energy Group': 'meridian.example',
  'Atlas Bank': 'atlasbank.example',
  'Orion Health Systems': 'orionhealth.example',
};

export const learners: Learner[] = rows.map(([id, first, last, title, org, clientId, base, gender, dietary, accessibility], i) => ({
  id,
  firstName: first,
  lastName: last,
  initials: `${first[0]}${last.replace(/^Al /, '')[0]}`.toUpperCase(),
  jobTitle: title,
  organisation: org,
  clientId,
  country: base,
  email: `${slug(first)}.${slug(last)}@${domains[org] ?? `${slug(org)}.example`}`,
  phone: `+${dialCode(base)} ${50 + (i % 9)} ${String(100 + ((i * 37) % 900)).padStart(3, '0')} ${String(1000 + ((i * 173) % 9000)).padStart(4, '0')}`,
  linkedIn: `linkedin.com/in/${slug(first)}-${slug(last)}`,
  dietary,
  accessibility,
  avatarHue: (i * 47) % 360,
  gender,
}));

// ─── Enrolments ───────────────────────────────────────────────────────────────

function e(programmeId: string, learnerId: string, status: EnrollmentStatus, extra: Partial<Enrollment> = {}): Enrollment {
  const done = ['Registered', 'Confirmed', 'Attending', 'Completed'].includes(status);
  return {
    id: `e-${programmeId.slice(2)}-${learnerId.slice(2)}`,
    learnerId,
    programmeId,
    status,
    learningAccess: status === 'Attending' || status === 'Completed' ? 'Active' : done ? 'Invited' : 'Not Issued',
    requiresHotel: false,
    requiresTravel: false,
    requirementsComplete: done,
    ...extra,
  };
}

const elpLocal = new Set(['l-01', 'l-02', 'l-03', 'l-05', 'l-07', 'l-11']);

export const enrollments: Enrollment[] = [
  // ELP — 21 of 24 registered
  ...Array.from({ length: 24 }, (_, i) => {
    const id = `l-${String(i + 1).padStart(2, '0')}`;
    const status: EnrollmentStatus = i < 21 ? (i % 3 === 0 ? 'Confirmed' : 'Registered') : i === 22 ? 'Nominated' : 'Invited';
    return e('p-elp', id, status, {
      cohortId: 'co-elp',
      nominatedBy: 'Noura Al Kaabi',
      nominatedOn: '2027-02-20',
      registeredOn: i < 21 ? `2027-03-${String(1 + (i % 20)).padStart(2, '0')}` : undefined,
      requiresHotel: i < 21,
      requiresTravel: !elpLocal.has(id) && i !== 22 && i !== 23,
      requirementsComplete: i < 19,
    });
  }),
  // SMP — all attending
  ...['l-mariam', 'l-26', 'l-27', 'l-28', 'l-29', 'l-30', 'l-31', 'l-32', 'l-33', 'l-34', 'l-35', 'l-36'].map((id, i) =>
    e('p-smp', id, 'Attending', {
      cohortId: 'co-smp', nominatedBy: 'Lim Wei Ling', nominatedOn: '2026-12-10', registeredOn: '2027-01-12',
      attendanceRate: [92, 100, 88, 96, 84, 100, 92, 76, 100, 96, 88, 92][i], progress: [68, 72, 61, 70, 55, 74, 66, 48, 71, 69, 62, 65][i],
      requiresHotel: !['l-mariam', 'l-26', 'l-27', 'l-31', 'l-33', 'l-34', 'l-35', 'l-36'].includes(id), requiresTravel: ['l-28', 'l-29', 'l-30', 'l-32'].includes(id),
    }),
  ),
  // AFL — Atlas pathway
  e('p-afl', 'l-mariam', 'Registered', { cohortId: 'co-afl', nominatedBy: 'Lim Wei Ling', nominatedOn: '2027-03-15', registeredOn: '2027-03-21', requiresHotel: true, requiresTravel: true }),
  e('p-afl', 'l-28', 'Registered', { cohortId: 'co-afl', nominatedBy: 'Lim Wei Ling', nominatedOn: '2027-03-15', registeredOn: '2027-03-23', requiresHotel: true, requiresTravel: true }),
  e('p-afl', 'l-30', 'Nominated', { cohortId: 'co-afl', nominatedBy: 'Lim Wei Ling', nominatedOn: '2027-03-15' }),
  e('p-afl', 'l-31', 'Nominated', { cohortId: 'co-afl', nominatedBy: 'Lim Wei Ling', nominatedOn: '2027-03-15' }),
  e('p-afl', 'l-33', 'Nominated', { cohortId: 'co-afl', nominatedBy: 'Ravi Shankar', nominatedOn: '2027-03-19' }),
  e('p-afl', 'l-34', 'Waitlisted', { cohortId: 'co-afl', nominatedBy: 'Ravi Shankar', nominatedOn: '2027-03-19' }),
  // DTE — Orion
  ...['l-37', 'l-38', 'l-39', 'l-40', 'l-41', 'l-42', 'l-43', 'l-44', 'l-45', 'l-46', 'l-47', 'l-48'].map((id, i) =>
    e('p-dte', id, i < 11 ? (i % 2 ? 'Confirmed' : 'Registered') : 'Invited', { cohortId: 'co-dte', nominatedBy: 'Dr. Hessa Al Marri', nominatedOn: '2027-03-01', registeredOn: i < 11 ? `2027-03-${String(8 + i).padStart(2, '0')}` : undefined }),
  ),
  // AI for Business Leaders — Orion executive committee
  ...[
    ['l-37', 'Registered'], ['l-38', 'Registered'], ['l-41', 'Registered'], ['l-43', 'Registered'], ['l-45', 'Registered'], ['l-39', 'Registered'], ['l-40', 'Invited'], ['l-47', 'Nominated'],
  ].map(([id, s]) => e('p-ai', id, s as EnrollmentStatus, { cohortId: 'co-ai', nominatedBy: 'Dr. Hessa Al Marri', nominatedOn: '2027-03-12', registeredOn: s === 'Registered' ? '2027-03-20' : undefined, requiresTravel: id === 'l-44' })),
  // GBS — open enrolment, two cohorts
  ...['l-49', 'l-50', 'l-51', 'l-52', 'l-53', 'l-54', 'l-55', 'l-56', 'l-57', 'l-58', 'l-59', 'l-60'].map((id, i) =>
    e('p-gbs', id, i === 7 ? 'Withdrawn' : 'Attending', {
      cohortId: i < 6 ? 'co-gbs-a' : 'co-gbs-b', registeredOn: '2026-12-15',
      attendanceRate: i === 7 ? 40 : [94, 88, 100, 91, 82, 97, 90, 0, 86, 93, 99, 89][i], progress: i === 7 ? 18 : [44, 39, 47, 42, 36, 45, 41, 0, 38, 43, 46, 40][i],
      requiresHotel: true, requiresTravel: !['l-49', 'l-56', 'l-57', 'l-58'].includes(id),
    }),
  ),
  // I&E — completed
  ...['l-01', 'l-02', 'l-06', 'l-07', 'l-09', 'l-13', 'l-16', 'l-20'].map((id, i) =>
    e('p-ie', id, 'Completed', { cohortId: 'co-ie', registeredOn: '2026-12-20', attendanceRate: [96, 100, 92, 88, 100, 96, 84, 92][i], progress: 100, assessmentScore: [88, 92, 85, 79, 94, 90, 81, 87][i], certificateIssued: true, certificateId: `EM-IE27-${String(101 + i)}`, feedbackSubmitted: i !== 3 }),
  ),
  // WIL — archived, completed
  ...['l-mariam', 'l-52', 'l-54', 'l-56', 'l-58', 'l-59'].map((id, i) =>
    e('p-wil', id, 'Completed', { cohortId: 'co-wil', registeredOn: '2026-09-30', attendanceRate: [100, 96, 100, 92, 100, 96][i], progress: 100, assessmentScore: [91, 88, 93, 86, 90, 89][i], certificateIssued: true, certificateId: `EM-WIL26-${String(201 + i)}`, feedbackSubmitted: true, requiresHotel: true, requiresTravel: true }),
  ),
];
