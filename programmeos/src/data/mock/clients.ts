import type { Client, ClientContact, ClientRequest, Contract } from '../models';

export const clients: Client[] = [
  { id: 'c-meridian', name: 'Meridian Energy Group', shortName: 'Meridian', type: 'Corporate', sector: 'Energy & Utilities', headquarters: 'Abu Dhabi, UAE', relationshipOwnerId: 's-james', since: '2021', status: 'Active', logoHue: 28, lifetimeValue: 2_410_000, satisfaction: 4.7 },
  { id: 'c-atlas', name: 'Atlas Bank', shortName: 'Atlas', type: 'Corporate', sector: 'Banking & Financial Services', headquarters: 'Singapore', relationshipOwnerId: 's-james', since: '2022', status: 'Active', logoHue: 210, lifetimeValue: 1_640_000, satisfaction: 4.5 },
  { id: 'c-orion', name: 'Orion Health Systems', shortName: 'Orion Health', type: 'Corporate', sector: 'Healthcare', headquarters: 'Dubai, UAE', relationshipOwnerId: 's-layla', since: '2024', status: 'Active', logoHue: 168, lifetimeValue: 862_000, satisfaction: 4.4 },
  { id: 'c-npsi', name: 'National Public Service Institute', shortName: 'NPSI', type: 'Government', sector: 'Public Administration', headquarters: 'Riyadh, Saudi Arabia', relationshipOwnerId: 's-james', since: '2023', status: 'Active', logoHue: 140, lifetimeValue: 1_120_000, satisfaction: 4.6 },
  { id: 'c-halden', name: 'Halden Business School', shortName: 'Halden', type: 'University', sector: 'Higher Education · Academic Partner', headquarters: 'London, UK', relationshipOwnerId: 's-james', since: '2020', status: 'Active', logoHue: 262, lifetimeValue: 3_080_000, satisfaction: 4.8 },
];

export const clientContacts: ClientContact[] = [
  { id: 'cc-noura', clientId: 'c-meridian', name: 'Noura Al Kaabi', title: 'Head of Leadership Development', email: 'noura.alkaabi@meridian.example', phone: '+971 2 615 4400', primary: true, approver: true },
  { id: 'cc-tariq', clientId: 'c-meridian', name: 'Tariq Haddad', title: 'L&D Programme Lead', email: 'tariq.haddad@meridian.example', phone: '+971 2 615 4418' },
  { id: 'cc-grace', clientId: 'c-meridian', name: 'Grace Pillai', title: 'Procurement Manager', email: 'grace.pillai@meridian.example', phone: '+971 2 615 4021' },
  { id: 'cc-wei', clientId: 'c-atlas', name: 'Lim Wei Ling', title: 'Chief Learning Officer', email: 'weiling.lim@atlasbank.example', phone: '+65 6123 8810', primary: true, approver: true },
  { id: 'cc-ravi', clientId: 'c-atlas', name: 'Ravi Shankar', title: 'Talent Programmes Manager', email: 'ravi.shankar@atlasbank.example', phone: '+65 6123 8842' },
  { id: 'cc-hessa', clientId: 'c-orion', name: 'Dr. Hessa Al Marri', title: 'VP People & Culture', email: 'hessa.almarri@orionhealth.example', phone: '+971 4 388 2100', primary: true, approver: true },
  { id: 'cc-ben', clientId: 'c-orion', name: 'Ben Carter', title: 'Digital Academy Lead', email: 'ben.carter@orionhealth.example', phone: '+971 4 388 2156' },
  { id: 'cc-faisal', clientId: 'c-npsi', name: 'Faisal Al Otaibi', title: 'Director, Leadership Academy', email: 'f.alotaibi@npsi.example', phone: '+966 11 402 7700', primary: true, approver: true },
  { id: 'cc-reem', clientId: 'c-npsi', name: 'Reem Al Saud', title: 'Programme Officer', email: 'r.alsaud@npsi.example', phone: '+966 11 402 7731' },
  { id: 'cc-alistair', clientId: 'c-halden', name: 'Prof. Alistair Grant', title: 'Associate Dean, Executive Education', email: 'a.grant@halden.example', phone: '+44 20 7946 0102', primary: true, approver: true },
  { id: 'cc-maya', clientId: 'c-halden', name: 'Maya Chen', title: 'Partnerships Manager', email: 'm.chen@halden.example', phone: '+44 20 7946 0177' },
];

export const contracts: Contract[] = [
  { id: 'k-meridian-msa', clientId: 'c-meridian', title: 'Leadership Development Framework 2026–2028', reference: 'MSA-MER-2026-01', type: 'Framework Agreement', status: 'Active', value: 1_800_000, startDate: '2026-01-01', endDate: '2028-12-31', signedDate: '2025-12-14', paymentTerms: '40% on signature · 40% on delivery · 20% on close, net 30', programmeIds: ['p-ie', 'p-elp', 'p-scr'] },
  { id: 'k-elp', clientId: 'c-meridian', title: 'Executive Leadership Programme 2027 — Statement of Work', reference: 'SOW-MER-2027-014', type: 'Statement of Work', status: 'Signed', value: 486_000, startDate: '2027-01-20', endDate: '2027-05-31', signedDate: '2027-01-20', paymentTerms: '40 / 40 / 20, net 30', programmeIds: ['p-elp'], documentId: 'd-elp-agreement' },
  { id: 'k-atlas-msa', clientId: 'c-atlas', title: 'Atlas Leadership Academy — Master Services Agreement', reference: 'MSA-ATL-2025-03', type: 'Master Services Agreement', status: 'Active', value: 1_200_000, startDate: '2025-06-01', endDate: '2028-05-31', signedDate: '2025-05-22', paymentTerms: '50% on signature · 50% on completion, net 45', programmeIds: ['p-smp', 'p-afl'], documentId: 'd-atlas-msa' },
  { id: 'k-orion', clientId: 'c-orion', title: 'Orion Digital Leaders Pathway', reference: 'PA-ORN-2027-02', type: 'Programme Agreement', status: 'Signed', value: 610_000, startDate: '2027-02-10', endDate: '2027-07-31', signedDate: '2027-02-10', paymentTerms: '30% on signature · 70% across milestones, net 30', programmeIds: ['p-dte', 'p-ai'] },
  { id: 'k-npsi', clientId: 'c-npsi', title: 'Public Sector Leadership 2027', reference: 'PA-NPSI-2027-01', type: 'Programme Agreement', status: 'Signed', value: 438_000, startDate: '2027-03-01', endDate: '2027-07-15', signedDate: '2027-03-04', paymentTerms: '30 / 50 / 20, net 60', programmeIds: ['p-psl'] },
  { id: 'k-halden', clientId: 'c-halden', title: 'Halden–Emeritus Open Programmes Partnership', reference: 'FA-HAL-2024-01', type: 'Framework Agreement', status: 'Active', value: 2_400_000, startDate: '2024-09-01', endDate: '2027-08-31', signedDate: '2024-08-12', paymentTerms: 'Revenue share 60/40, quarterly settlement', programmeIds: ['p-gbs', 'p-wil'] },
];

export const clientRequests: ClientRequest[] = [
  { id: 'cr-1', clientId: 'c-meridian', programmeId: 'p-elp', title: 'Add a session on energy-transition strategy', detail: 'Noura asked whether Day 2 could include a 45-minute segment on energy-transition strategy for the upstream leaders.', raisedBy: 'cc-noura', date: '2027-03-24', status: 'In Progress', kind: 'Request' },
  { id: 'cr-2', clientId: 'c-meridian', programmeId: 'p-elp', title: 'Approve final participant list', detail: 'Final list of 24 nominees approved by Meridian L&D.', raisedBy: 'cc-noura', date: '2027-03-18', status: 'Resolved', kind: 'Approval' },
  { id: 'cr-3', clientId: 'c-atlas', programmeId: 'p-afl', title: 'Sign off AFL programme agenda', detail: 'Draft agenda to be shared for Lim Wei Ling’s sign-off by 12 April.', raisedBy: 'cc-wei', date: '2027-03-22', status: 'Open', kind: 'Approval' },
  { id: 'cr-4', clientId: 'c-orion', programmeId: 'p-dte', title: 'Share pre-reading two weeks before kick-off', detail: 'Orion would like pre-reading released to participants by 5 April.', raisedBy: 'cc-ben', date: '2027-03-19', status: 'Open', kind: 'Request' },
  { id: 'cr-5', clientId: 'c-npsi', programmeId: 'p-psl', title: 'Arabic interpretation for plenary sessions', detail: 'NPSI requested simultaneous Arabic interpretation for keynote and panel sessions.', raisedBy: 'cc-reem', date: '2027-03-25', status: 'Open', kind: 'Request' },
  { id: 'cr-6', clientId: 'c-halden', programmeId: 'p-gbs', title: 'Approve additional residency day', detail: 'Proposal to extend Residency 2 by one day for capstone presentations.', raisedBy: 'cc-alistair', date: '2027-03-15', status: 'Resolved', kind: 'Approval' },
];
