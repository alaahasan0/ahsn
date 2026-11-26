import type { Faculty, FacultyAssignment, FacultyFeedback } from '../models';

export const faculty: Faculty[] = [
  {
    id: 'f-vasquez', name: 'Elena Vasquez', honorific: 'Prof.', initials: 'EV', title: 'Professor of Leadership & Organisational Behaviour',
    institution: 'Halden Business School', location: 'London, UK', timeZone: 'Europe/London', email: 'e.vasquez@halden.example', phone: '+44 7700 900 112',
    bio: 'Former Associate Dean of Executive Education at Halden. Elena has taught leadership to more than 9,000 executives across 40 countries and advises boards on leadership succession. Her research focuses on leading under uncertainty.',
    expertise: ['Leadership', 'Change Management', 'Executive Presence', 'Board Effectiveness'], languages: ['English', 'Spanish'],
    rating: 4.9, sessionsDelivered: 412, dailyFee: 6_500, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'LHR', dietary: 'Pescatarian',
    availability: 'Limited', unavailable: [{ from: '2027-05-03', to: '2027-05-14', reason: 'Teaching commitments at Halden' }], avatarHue: 12, utilisation: 78,
  },
  {
    id: 'f-thorne', name: 'Marcus Thorne', honorific: 'Dr.', initials: 'MT', title: 'Senior Fellow in Strategy',
    institution: 'Independent · formerly McAllister & Co.', location: 'Singapore', timeZone: 'Asia/Singapore', email: 'marcus@thornestrategy.example', phone: '+65 9001 4432',
    bio: 'Strategy practitioner turned educator. Marcus spent 15 years advising banks and energy companies on portfolio strategy before founding his own advisory practice. Known for highly interactive case-based sessions.',
    expertise: ['Corporate Strategy', 'Strategy Execution', 'Scenario Planning'], languages: ['English', 'Mandarin'],
    rating: 4.7, sessionsDelivered: 286, dailyFee: 5_800, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'SIN',
    availability: 'Limited', unavailable: [], avatarHue: 205, utilisation: 86,
  },
  {
    id: 'f-nwosu', name: 'Amara Nwosu', honorific: 'Prof.', initials: 'AN', title: 'Professor of Finance',
    institution: 'Halden Business School', location: 'London, UK', timeZone: 'Europe/London', email: 'a.nwosu@halden.example', phone: '+44 7700 900 245',
    bio: 'Amara’s research on capital allocation has been published in leading finance journals. She chairs the audit committee of a FTSE 250 company and teaches CFO programmes globally.',
    expertise: ['Corporate Finance', 'Capital Allocation', 'Valuation', 'Risk'], languages: ['English', 'French'],
    rating: 4.8, sessionsDelivered: 198, dailyFee: 6_200, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'LHR',
    availability: 'Available', unavailable: [], avatarHue: 32, utilisation: 54,
  },
  {
    id: 'f-watanabe', name: 'Kenji Watanabe', honorific: 'Dr.', initials: 'KW', title: 'Adjunct Professor of Technology Strategy',
    institution: 'Pacific Institute of Technology', location: 'Tokyo, Japan', timeZone: 'Asia/Singapore', email: 'k.watanabe@pit.example', phone: '+81 90 1234 7781',
    bio: 'Kenji led digital transformation at a global electronics group before moving into academia. He teaches digital strategy, platforms and data-driven organisations.',
    expertise: ['Digital Transformation', 'Platform Strategy', 'Data & Analytics'], languages: ['English', 'Japanese'],
    rating: 4.6, sessionsDelivered: 143, dailyFee: 5_500, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'HND',
    availability: 'Available', unavailable: [{ from: '2027-04-26', to: '2027-04-30', reason: 'Conference keynote, Osaka' }], avatarHue: 190, utilisation: 61,
  },
  {
    id: 'f-laurent', name: 'Isabelle Laurent', honorific: 'Prof.', initials: 'IL', title: 'Professor of Innovation & Design',
    institution: 'École Supérieure de Management, Paris', location: 'Paris, France', timeZone: 'Europe/London', email: 'i.laurent@esm.example', phone: '+33 6 12 34 56 78',
    bio: 'Isabelle brings design thinking into the boardroom. She has coached over 300 corporate venture teams and is the author of “The Curious Organisation”.',
    expertise: ['Innovation', 'Design Thinking', 'Corporate Venturing', 'Digital Culture'], languages: ['English', 'French'],
    rating: 4.8, sessionsDelivered: 221, dailyFee: 5_200, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'CDG',
    availability: 'Available', unavailable: [], avatarHue: 300, utilisation: 47,
  },
  {
    id: 'f-qureshi', name: 'Samir Qureshi', honorific: 'Dr.', initials: 'SQ', title: 'Professor of Public Policy',
    institution: 'Gulf School of Government', location: 'Riyadh, Saudi Arabia', timeZone: 'Asia/Riyadh', email: 's.qureshi@gsg.example', phone: '+966 55 123 4410',
    bio: 'Samir advises governments across the GCC on delivery units and policy implementation. He previously led a national transformation office.',
    expertise: ['Public Policy', 'Government Delivery', 'Public Value'], languages: ['English', 'Arabic', 'Urdu'],
    rating: 4.7, sessionsDelivered: 167, dailyFee: 4_900, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'RUH',
    availability: 'Available', unavailable: [], avatarHue: 140, utilisation: 38,
  },
  {
    id: 'f-goldberg', name: 'Rachel Goldberg', honorific: 'Prof.', initials: 'RG', title: 'Professor of Negotiation',
    institution: 'Halden Business School', location: 'New York, USA', timeZone: 'America/New_York', email: 'r.goldberg@halden.example', phone: '+1 212 555 0148',
    bio: 'Rachel designs immersive negotiation simulations used by Fortune 500 companies and has trained diplomats and executives on high-stakes negotiation.',
    expertise: ['Negotiation', 'Influence', 'Conflict Resolution'], languages: ['English', 'Hebrew'],
    rating: 4.9, sessionsDelivered: 354, dailyFee: 6_800, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'JFK',
    availability: 'Limited', unavailable: [{ from: '2027-05-17', to: '2027-05-28', reason: 'Sabbatical research trip' }], avatarHue: 350, utilisation: 72,
  },
  {
    id: 'f-herrera', name: 'Tomás Herrera', honorific: 'Dr.', initials: 'TH', title: 'Associate Professor of Operations',
    institution: 'Halden Business School', location: 'Madrid, Spain', timeZone: 'Europe/London', email: 't.herrera@halden.example', phone: '+34 612 334 891',
    bio: 'Tomás specialises in global operations, supply chain resilience and operational excellence, with a decade in automotive manufacturing before academia.',
    expertise: ['Operations', 'Supply Chain', 'Global Operations'], languages: ['English', 'Spanish', 'Portuguese'],
    rating: 4.5, sessionsDelivered: 132, dailyFee: 4_800, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'MAD',
    availability: 'Available', unavailable: [], avatarHue: 60, utilisation: 44,
  },
  {
    id: 'f-sharma', name: 'Aditi Sharma', honorific: 'Prof.', initials: 'AS', title: 'Professor of AI & Business Analytics',
    institution: 'Indian School of Management', location: 'Mumbai, India', timeZone: 'Asia/Kolkata', email: 'aditi.sharma@ism.example', phone: '+91 98200 44120',
    bio: 'Aditi works at the intersection of AI, strategy and governance. She advises health and financial-services firms on responsible AI adoption.',
    expertise: ['Artificial Intelligence', 'Analytics', 'Responsible AI', 'Data Strategy'], languages: ['English', 'Hindi'],
    rating: 4.8, sessionsDelivered: 176, dailyFee: 5_600, feeCurrency: 'USD', contractStatus: 'Pending Signature', preferredAirport: 'BOM',
    availability: 'Available', unavailable: [], avatarHue: 265, utilisation: 66,
  },
  {
    id: 'f-bennett', name: 'Olivia Bennett', honorific: 'Dr.', initials: 'OB', title: 'Executive Coach & Organisational Psychologist',
    institution: 'Bennett Leadership Partners', location: 'Dubai, UAE', timeZone: 'Asia/Dubai', email: 'olivia@bennettlp.example', phone: '+971 50 442 1180',
    bio: 'Olivia is an accredited executive coach (ICF MCC) who has coached C-suite leaders across the Middle East for 18 years.',
    expertise: ['Executive Coaching', 'Team Effectiveness', 'Psychological Safety'], languages: ['English'],
    rating: 4.9, sessionsDelivered: 520, dailyFee: 3_900, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'DXB',
    availability: 'Limited', unavailable: [{ from: '2027-05-03', to: '2027-05-21', reason: 'Fully booked — coaching engagement' }], avatarHue: 170, utilisation: 91,
  },
  {
    id: 'f-lindqvist', name: 'Henrik Lindqvist', honorific: 'Prof.', initials: 'HL', title: 'Professor of International Business',
    institution: 'Nordic School of Economics', location: 'Stockholm, Sweden', timeZone: 'Europe/London', email: 'h.lindqvist@nse.example', phone: '+46 70 123 45 67',
    bio: 'Henrik researches internationalisation strategy and emerging-market multinationals. He has led executive programmes in more than 25 countries.',
    expertise: ['Global Strategy', 'Market Entry', 'International Business', 'Financial Risk'], languages: ['English', 'Swedish', 'German'],
    rating: 4.6, sessionsDelivered: 241, dailyFee: 5_400, feeCurrency: 'USD', contractStatus: 'Active', preferredAirport: 'ARN',
    availability: 'Available', unavailable: [], avatarHue: 215, utilisation: 69,
  },
  {
    id: 'f-elidrissi', name: 'Fatima Zahra El Idrissi', honorific: 'Dr.', initials: 'FE', title: 'Senior Lecturer in Change Leadership',
    institution: 'Atlas Institute of Management, Casablanca', location: 'Casablanca, Morocco', timeZone: 'Europe/London', email: 'f.elidrissi@aim.example', phone: '+212 661 234 567',
    bio: 'Fatima Zahra’s work on women’s leadership and large-scale change is widely cited across the region. She is a regular faculty member on Emeritus forums.',
    expertise: ['Change Leadership', 'Women in Leadership', 'Culture'], languages: ['English', 'French', 'Arabic'],
    rating: 4.8, sessionsDelivered: 158, dailyFee: 4_600, feeCurrency: 'USD', contractStatus: 'Draft', preferredAirport: 'CMN',
    availability: 'Available', unavailable: [], avatarHue: 320, utilisation: 33,
  },
];

export const facultyAssignments: FacultyAssignment[] = [
  // Executive Leadership Programme — fully contracted
  { id: 'fa-elp-1', facultyId: 'f-vasquez', programmeId: 'p-elp', sessionIds: ['ss-elp-1', 'ss-elp-6', 'ss-elp-7'], role: 'Lead Faculty', status: 'Contracted', days: 5, fee: 32_500, requestedOn: '2027-01-25', confirmedOn: '2027-02-02' },
  { id: 'fa-elp-2', facultyId: 'f-thorne', programmeId: 'p-elp', sessionIds: ['ss-elp-2', 'ss-elp-4'], role: 'Faculty', status: 'Contracted', days: 2, fee: 11_600, requestedOn: '2027-01-25', confirmedOn: '2027-02-08' },
  { id: 'fa-elp-3', facultyId: 'f-goldberg', programmeId: 'p-elp', sessionIds: ['ss-elp-3'], role: 'Faculty', status: 'Contracted', days: 1, fee: 6_800, requestedOn: '2027-02-01', confirmedOn: '2027-02-15' },
  { id: 'fa-elp-4', facultyId: 'f-bennett', programmeId: 'p-elp', sessionIds: ['ss-elp-5'], role: 'Coach', status: 'Contracted', days: 1, fee: 3_900, requestedOn: '2027-02-01', confirmedOn: '2027-02-10' },
  // Strategic Management Programme
  { id: 'fa-smp-1', facultyId: 'f-thorne', programmeId: 'p-smp', sessionIds: ['ss-smp-1', 'ss-smp-3', 'ss-smp-4'], role: 'Lead Faculty', status: 'Contracted', days: 6, fee: 34_800, requestedOn: '2026-12-01', confirmedOn: '2026-12-09' },
  { id: 'fa-smp-2', facultyId: 'f-lindqvist', programmeId: 'p-smp', sessionIds: ['ss-smp-2'], role: 'Faculty', status: 'Contracted', days: 2, fee: 10_800, requestedOn: '2026-12-01', confirmedOn: '2026-12-15' },
  { id: 'fa-smp-3', facultyId: 'f-nwosu', programmeId: 'p-smp', sessionIds: ['ss-smp-4'], role: 'Faculty', status: 'Contracted', days: 1, fee: 6_200, requestedOn: '2027-01-10', confirmedOn: '2027-01-18' },
  { id: 'fa-smp-4', facultyId: 'f-bennett', programmeId: 'p-smp', sessionIds: ['ss-smp-5'], role: 'Coach', status: 'Contracted', days: 2, fee: 7_800, requestedOn: '2027-01-10', confirmedOn: '2027-01-14' },
  // Digital Transformation for Executives
  { id: 'fa-dte-1', facultyId: 'f-watanabe', programmeId: 'p-dte', sessionIds: ['ss-dte-1'], role: 'Lead Faculty', status: 'Contracted', days: 4, fee: 22_000, requestedOn: '2027-02-15', confirmedOn: '2027-02-22' },
  { id: 'fa-dte-2', facultyId: 'f-sharma', programmeId: 'p-dte', sessionIds: ['ss-dte-2'], role: 'Faculty', status: 'Confirmed', days: 2, fee: 11_200, requestedOn: '2027-02-15', confirmedOn: '2027-03-01' },
  { id: 'fa-dte-3', facultyId: 'f-laurent', programmeId: 'p-dte', sessionIds: ['ss-dte-3'], role: 'Faculty', status: 'Request Sent', days: 1, fee: 5_200, requestedOn: '2027-03-22' },
  // Advanced Finance Leadership
  { id: 'fa-afl-1', facultyId: 'f-nwosu', programmeId: 'p-afl', sessionIds: ['ss-afl-1'], role: 'Lead Faculty', status: 'Confirmed', days: 3, fee: 18_600, requestedOn: '2027-03-08', confirmedOn: '2027-03-15' },
  { id: 'fa-afl-2', facultyId: 'f-lindqvist', programmeId: 'p-afl', sessionIds: ['ss-afl-2'], role: 'Faculty', status: 'Request Sent', days: 1, fee: 5_400, requestedOn: '2027-03-24' },
  // Global Business Strategy
  { id: 'fa-gbs-1', facultyId: 'f-lindqvist', programmeId: 'p-gbs', sessionIds: ['ss-gbs-1', 'ss-gbs-3'], role: 'Lead Faculty', status: 'Contracted', days: 9, fee: 48_600, requestedOn: '2026-10-12', confirmedOn: '2026-10-20' },
  { id: 'fa-gbs-2', facultyId: 'f-vasquez', programmeId: 'p-gbs', sessionIds: ['ss-gbs-4'], role: 'Faculty', status: 'Contracted', days: 2, fee: 13_000, requestedOn: '2026-10-12', confirmedOn: '2026-10-28' },
  { id: 'fa-gbs-3', facultyId: 'f-herrera', programmeId: 'p-gbs', sessionIds: ['ss-gbs-2', 'ss-gbs-0'], role: 'Faculty', status: 'Contracted', days: 4, fee: 19_200, requestedOn: '2026-10-12', confirmedOn: '2026-10-25' },
  // Innovation & Entrepreneurship
  { id: 'fa-ie-1', facultyId: 'f-laurent', programmeId: 'p-ie', sessionIds: ['ss-ie-1', 'ss-ie-2'], role: 'Lead Faculty', status: 'Contracted', days: 4, fee: 20_800, requestedOn: '2026-11-02', confirmedOn: '2026-11-10' },
  { id: 'fa-ie-2', facultyId: 'f-watanabe', programmeId: 'p-ie', sessionIds: [], role: 'Guest Speaker', status: 'Contracted', days: 1, fee: 5_500, requestedOn: '2026-11-02', confirmedOn: '2026-11-12' },
  // Public Sector Leadership
  { id: 'fa-psl-1', facultyId: 'f-qureshi', programmeId: 'p-psl', sessionIds: ['ss-psl-1'], role: 'Lead Faculty', status: 'Confirmed', days: 5, fee: 24_500, requestedOn: '2027-03-08', confirmedOn: '2027-03-16' },
  { id: 'fa-psl-2', facultyId: 'f-elidrissi', programmeId: 'p-psl', sessionIds: [], role: 'Faculty', status: 'Request Sent', days: 2, fee: 9_200, requestedOn: '2027-03-23' },
  { id: 'fa-psl-3', facultyId: 'f-vasquez', programmeId: 'p-psl', sessionIds: [], role: 'Faculty', status: 'Request Sent', days: 1, fee: 6_500, requestedOn: '2027-03-26' },
  // AI for Business Leaders
  { id: 'fa-ai-1', facultyId: 'f-sharma', programmeId: 'p-ai', sessionIds: ['ss-ai-1'], role: 'Lead Faculty', status: 'Contract Issued', days: 4, fee: 22_400, requestedOn: '2027-03-01', confirmedOn: '2027-03-10' },
  { id: 'fa-ai-2', facultyId: 'f-watanabe', programmeId: 'p-ai', sessionIds: ['ss-ai-2'], role: 'Faculty', status: 'Request Sent', days: 2, fee: 11_000, requestedOn: '2027-03-23' },
  { id: 'fa-ai-3', facultyId: 'f-bennett', programmeId: 'p-ai', sessionIds: [], role: 'Coach', status: 'Declined', days: 2, fee: 7_800, requestedOn: '2027-03-12' },
  // Women in Leadership Forum (archived)
  { id: 'fa-wil-1', facultyId: 'f-elidrissi', programmeId: 'p-wil', sessionIds: [], role: 'Lead Faculty', status: 'Contracted', days: 5, fee: 23_000, requestedOn: '2026-08-01', confirmedOn: '2026-08-09' },
  { id: 'fa-wil-2', facultyId: 'f-vasquez', programmeId: 'p-wil', sessionIds: [], role: 'Faculty', status: 'Contracted', days: 2, fee: 13_000, requestedOn: '2026-08-01', confirmedOn: '2026-08-12' },
];

export const facultyFeedback: FacultyFeedback[] = [
  { id: 'ff-1', facultyId: 'f-vasquez', programmeId: 'p-wil', rating: 4.9, comment: 'Elena created a room where everyone felt able to speak candidly. The executive presence session was the highlight of the week.', author: 'Participant evaluation', date: '2026-11-13' },
  { id: 'ff-2', facultyId: 'f-vasquez', programmeId: 'p-gbs', sessionId: 'ss-gbs-0', rating: 4.8, comment: 'Practical frameworks I used with my team the following Monday.', author: 'Participant evaluation', date: '2027-02-04' },
  { id: 'ff-3', facultyId: 'f-thorne', programmeId: 'p-smp', sessionId: 'ss-smp-1', rating: 4.7, comment: 'The Atlas case discussion was superb — sharp, challenging and directly relevant.', author: 'Participant evaluation', date: '2027-03-03' },
  { id: 'ff-4', facultyId: 'f-thorne', programmeId: 'p-smp', rating: 4.5, comment: 'Would value a little more time for group work in the virtual sessions.', author: 'Programme Manager debrief', date: '2027-03-27' },
  { id: 'ff-5', facultyId: 'f-laurent', programmeId: 'p-ie', sessionId: 'ss-ie-2', rating: 4.9, comment: 'Pitch day was run brilliantly. Two ventures are now being funded by Meridian.', author: 'Client feedback · Noura Al Kaabi', date: '2027-02-20' },
  { id: 'ff-6', facultyId: 'f-lindqvist', programmeId: 'p-gbs', rating: 4.6, comment: 'Excellent depth on market entry; slides could be lighter.', author: 'Participant evaluation', date: '2027-03-10' },
  { id: 'ff-7', facultyId: 'f-bennett', programmeId: 'p-smp', rating: 5.0, comment: 'The coaching circles were transformational for our team leads.', author: 'Participant evaluation', date: '2027-03-20' },
  { id: 'ff-8', facultyId: 'f-watanabe', programmeId: 'p-ie', rating: 4.5, comment: 'Inspiring talk on platform business models.', author: 'Participant evaluation', date: '2027-02-02' },
  { id: 'ff-9', facultyId: 'f-elidrissi', programmeId: 'p-wil', rating: 4.8, comment: 'A generous and challenging facilitator.', author: 'Participant evaluation', date: '2026-11-13' },
  { id: 'ff-10', facultyId: 'f-herrera', programmeId: 'p-gbs', sessionId: 'ss-gbs-2', rating: 4.4, comment: 'Great real-world examples from manufacturing.', author: 'Participant evaluation', date: '2027-03-18' },
];
