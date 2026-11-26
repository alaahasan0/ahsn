import type { Hotel, HotelBooking, LogisticsItem, RunSheetItem, TravelItinerary, Venue, VenueBooking } from '../models';

export const hotels: Hotel[] = [
  { id: 'h-creekside', name: 'Creekside Grand Hotel', city: 'Dubai', country: 'UAE', address: 'Al Jaddaf Waterfront, Dubai', stars: 5, phone: '+971 4 556 1000', email: 'groups@creeksidegrand.example', contactName: 'Rohan Desai · Group Sales', contractedRate: 315, roomTypes: [{ name: 'Deluxe King', rate: 315, available: 40 }, { name: 'Deluxe Twin', rate: 315, available: 12 }, { name: 'Executive Suite', rate: 540, available: 4 }], distanceToVenue: 'On site', amenities: ['Conference wing', 'Executive lounge', 'Spa', 'Airport shuttle'], rating: 4.7, preferred: true, hue: 28 },
  { id: 'h-crescent', name: 'The Crescent Marina', city: 'Singapore', country: 'Singapore', address: '8 Marina View, Singapore 018960', stars: 5, phone: '+65 6880 2200', email: 'events@crescentmarina.example', contactName: 'Jasmine Teo · Events', contractedRate: 380, roomTypes: [{ name: 'Premier Room', rate: 380, available: 18 }, { name: 'Club Room', rate: 460, available: 6 }], distanceToVenue: '6 min walk to Lumen', amenities: ['Club lounge', 'Pool', 'Gym'], rating: 4.6, preferred: true, hue: 205 },
  { id: 'h-langford', name: 'The Langford Kensington', city: 'London', country: 'UK', address: '21 Cromwell Place, London SW7', stars: 5, phone: '+44 20 7946 0880', email: 'groups@langford.example', contactName: 'Edward Hale · Reservations', contractedRate: 345, roomTypes: [{ name: 'Superior Double', rate: 345, available: 10 }, { name: 'Junior Suite', rate: 520, available: 2 }], distanceToVenue: '18 min by taxi', amenities: ['Restaurant', 'Meeting rooms', 'Gym'], rating: 4.5, preferred: false, hue: 0 },
  { id: 'h-najd', name: 'Najd Heritage Hotel', city: 'Riyadh', country: 'Saudi Arabia', address: 'King Fahd Road, Al Olaya, Riyadh', stars: 5, phone: '+966 11 288 4000', email: 'mice@najdheritage.example', contactName: 'Sultan Al Harbi · MICE', contractedRate: 290, roomTypes: [{ name: 'Deluxe Room', rate: 290, available: 30 }, { name: 'Executive Room', rate: 360, available: 8 }], distanceToVenue: 'Connected to Najd Forum', amenities: ['Business centre', 'Pool', 'Prayer rooms'], rating: 4.6, preferred: true, hue: 140 },
  { id: 'h-sablebay', name: 'Sable Bay Resort', city: 'Abu Dhabi', country: 'UAE', address: 'Saadiyat Island, Abu Dhabi', stars: 5, phone: '+971 2 665 7000', email: 'groups@sablebay.example', contactName: 'Marta Kowalska · Groups', contractedRate: 410, roomTypes: [{ name: 'Sea View King', rate: 410, available: 20 }, { name: 'Villa', rate: 980, available: 2 }], distanceToVenue: '1h 20m to Dubai', amenities: ['Beach', 'Spa', 'Offsite meeting pavilion'], rating: 4.8, preferred: false, hue: 45 },
];

export const venues: Venue[] = [
  { id: 'v-eec', name: 'Emeritus Executive Centre', city: 'Dubai', country: 'UAE', address: 'Dubai Knowledge Park, Block 12', kind: 'Executive Centre', contactName: 'Facilities Desk', phone: '+971 4 390 1200', email: 'facilities@emeritus.example', dayRate: 0, rating: 4.8, hue: 222, amenities: ['In-house AV team', 'Hybrid studio', 'Prayer rooms', 'Parking'],
    rooms: [
      { id: 'vr-eec-1', name: 'Strategy Studio', capacity: { Classroom: 32, 'U-Shape': 22, Cabaret: 30 }, sizeSqm: 140, floor: 'Level 2', av: ['Hybrid camera system', 'Dual 98" displays', 'Ceiling mics'], naturalLight: true },
      { id: 'vr-eec-2', name: 'Innovation Lab', capacity: { Cabaret: 24, Boardroom: 16 }, sizeSqm: 96, floor: 'Level 2', av: ['Interactive whiteboards', 'Hybrid camera'], naturalLight: true },
    ] },
  { id: 'v-creekside', name: 'Creekside Grand Conference Wing', city: 'Dubai', country: 'UAE', address: 'Al Jaddaf Waterfront, Dubai', kind: 'Hotel Conference', contactName: 'Nadine Saba · Events Manager', phone: '+971 4 556 1040', email: 'events@creeksidegrand.example', dayRate: 6_400, rating: 4.6, hue: 28, amenities: ['Pre-function terrace', 'Business centre', 'Hotel catering'],
    rooms: [
      { id: 'vr-cs-1', name: 'Al Majlis Ballroom', capacity: { Theatre: 220, Classroom: 120, Cabaret: 96, Banquet: 160 }, sizeSqm: 420, floor: 'Ground', av: ['Projector & screens', 'Lapel & handheld mics', 'Stage lighting'], naturalLight: false },
      { id: 'vr-cs-2', name: 'Breakout Rooms 1–3', capacity: { Boardroom: 10, 'U-Shape': 12 }, sizeSqm: 48, floor: 'Mezzanine', av: ['65" display', 'Flipcharts'], naturalLight: true },
    ] },
  { id: 'v-lumen', name: 'Lumen Conference Centre', city: 'Singapore', country: 'Singapore', address: '3 Temasek Boulevard, Singapore', kind: 'Conference Centre', contactName: 'Daryl Goh · Venue Sales', phone: '+65 6338 9100', email: 'sales@lumencc.example', dayRate: 7_200, rating: 4.7, hue: 205, amenities: ['Harbour views', 'Hybrid broadcast', 'Green-certified'],
    rooms: [
      { id: 'vr-lu-1', name: 'Orchid Hall', capacity: { Classroom: 48, Cabaret: 40, 'U-Shape': 28 }, sizeSqm: 180, floor: 'Level 5', av: ['Broadcast cameras', 'Confidence monitors', 'Dual screens'], naturalLight: true },
    ] },
  { id: 'v-guildhall', name: 'The Guildhall Rooms', city: 'London', country: 'UK', address: '14 Gresham Street, London EC2', kind: 'Conference Centre', contactName: 'Harriet Cole · Events', phone: '+44 20 7946 0330', email: 'events@guildhallrooms.example', dayRate: 5_800, rating: 4.5, hue: 0, amenities: ['Historic interiors', 'Private dining', 'Step-free access'],
    rooms: [
      { id: 'vr-gh-1', name: 'Mercers’ Room', capacity: { Boardroom: 18, 'U-Shape': 20, Classroom: 30 }, sizeSqm: 110, floor: 'First', av: ['Projector', 'Ceiling mics'], naturalLight: true },
    ] },
  { id: 'v-najd', name: 'Najd Forum Centre', city: 'Riyadh', country: 'Saudi Arabia', address: 'King Fahd Road, Al Olaya, Riyadh', kind: 'Conference Centre', contactName: 'Abdulrahman Al Qahtani · Events', phone: '+966 11 288 4100', email: 'events@najdforum.example', dayRate: 6_900, rating: 4.6, hue: 140, amenities: ['Interpretation booths', 'Majlis lounge', 'Prayer rooms'],
    rooms: [
      { id: 'vr-nj-1', name: 'Diwan Hall', capacity: { Theatre: 160, Classroom: 80, Cabaret: 64 }, sizeSqm: 300, floor: 'Ground', av: ['Interpretation booths ×2', 'LED wall', 'Lapel mics'], naturalLight: false },
      { id: 'vr-nj-2', name: 'Majlis Suites', capacity: { Boardroom: 14 }, sizeSqm: 60, floor: 'First', av: ['75" display'], naturalLight: true },
    ] },
];

// ─── Hotel bookings ───────────────────────────────────────────────────────────

const elpGuests = [
  ...['l-01', 'l-02', 'l-03', 'l-04', 'l-05', 'l-06', 'l-07', 'l-08', 'l-09', 'l-10', 'l-11', 'l-12', 'l-13', 'l-14', 'l-15', 'l-16', 'l-17', 'l-18', 'l-19', 'l-20', 'l-21'].map((id) => ({ kind: 'learner' as const, id })),
];
const specialRequests: Record<string, string> = {
  'l-13': 'Accessible room near lifts (step-free access)',
  'l-06': 'High floor, quiet room',
  'l-22': 'Gluten-free welcome amenity',
  'f-vasquez': 'Early check-in requested (arrives 07:35)',
  'f-goldberg': 'Late check-out until 16:00',
};

export const hotelBookings: HotelBooking[] = [
  ...elpGuests.map((g, i) => ({
    id: `hb-elp-${i + 1}`,
    hotelId: 'h-creekside',
    programmeId: 'p-elp',
    guest: g,
    roomType: i % 5 === 4 ? 'Deluxe Twin' : 'Deluxe King',
    checkIn: '2027-04-11',
    checkOut: '2027-04-16',
    confirmationNumber: `CGH-${48210 + i * 7}`,
    status: 'Confirmed' as const,
    cost: 315 * 5,
    invoiceStatus: 'Not Invoiced' as const,
    specialRequests: specialRequests[g.id],
    cancellationDeadline: '2027-04-04',
    roomNumber: `${8 + Math.floor(i / 8)}${String(10 + (i % 8) * 2).padStart(2, '0')}`,
  })),
  { id: 'hb-elp-f1', hotelId: 'h-creekside', programmeId: 'p-elp', guest: { kind: 'faculty', id: 'f-vasquez' }, roomType: 'Executive Suite', checkIn: '2027-04-10', checkOut: '2027-04-16', confirmationNumber: 'CGH-48401', status: 'Confirmed', cost: 540 * 6, invoiceStatus: 'Not Invoiced', specialRequests: specialRequests['f-vasquez'], cancellationDeadline: '2027-04-03', roomNumber: '1402' },
  { id: 'hb-elp-f2', hotelId: 'h-creekside', programmeId: 'p-elp', guest: { kind: 'faculty', id: 'f-thorne' }, roomType: 'Deluxe King', checkIn: '2027-04-11', checkOut: '2027-04-15', confirmationNumber: 'CGH-48402', status: 'Confirmed', cost: 315 * 4, invoiceStatus: 'Not Invoiced', cancellationDeadline: '2027-04-04', roomNumber: '1206' },
  { id: 'hb-elp-f3', hotelId: 'h-creekside', programmeId: 'p-elp', guest: { kind: 'faculty', id: 'f-goldberg' }, roomType: 'Deluxe King', checkIn: '2027-04-12', checkOut: '2027-04-14', confirmationNumber: 'CGH-48403', status: 'Confirmed', cost: 315 * 2, invoiceStatus: 'Not Invoiced', specialRequests: specialRequests['f-goldberg'], cancellationDeadline: '2027-04-05', roomNumber: '1208' },
  { id: 'hb-elp-f4', hotelId: 'h-creekside', programmeId: 'p-elp', guest: { kind: 'faculty', id: 'f-bennett' }, roomType: 'Deluxe King', checkIn: '2027-04-14', checkOut: '2027-04-15', confirmationNumber: 'CGH-48404', status: 'Confirmed', cost: 315, invoiceStatus: 'Not Invoiced', cancellationDeadline: '2027-04-07', roomNumber: '1210' },
  { id: 'hb-elp-s1', hotelId: 'h-creekside', programmeId: 'p-elp', guest: { kind: 'staff', id: 's-omar' }, roomType: 'Deluxe King', checkIn: '2027-04-11', checkOut: '2027-04-16', confirmationNumber: 'CGH-48405', status: 'Confirmed', cost: 315 * 5, invoiceStatus: 'Not Invoiced', cancellationDeadline: '2027-04-04', roomNumber: '1212' },

  // SMP closing residency (Singapore) — travelling participants
  ...['l-28', 'l-29', 'l-30', 'l-32'].map((id, i) => ({ id: `hb-smp-${i + 1}`, hotelId: 'h-crescent', programmeId: 'p-smp', guest: { kind: 'learner' as const, id }, roomType: 'Premier Room', checkIn: '2027-04-20', checkOut: '2027-04-23', confirmationNumber: `CM-77${310 + i}`, status: 'Confirmed' as const, cost: 380 * 3, invoiceStatus: 'Not Invoiced' as const, cancellationDeadline: '2027-04-13', roomNumber: `21${10 + i}` })),
  { id: 'hb-smp-f1', hotelId: 'h-crescent', programmeId: 'p-smp', guest: { kind: 'faculty', id: 'f-nwosu' }, roomType: 'Club Room', checkIn: '2027-04-20', checkOut: '2027-04-23', confirmationNumber: 'CM-77320', status: 'Confirmed', cost: 460 * 3, invoiceStatus: 'Not Invoiced', cancellationDeadline: '2027-04-13' },
  { id: 'hb-smp-p1', hotelId: 'h-crescent', programmeId: 'p-smp', guest: { kind: 'learner', id: 'l-28' }, roomType: 'Premier Room', checkIn: '2027-02-28', checkOut: '2027-03-03', confirmationNumber: 'CM-75102', status: 'Checked Out', cost: 380 * 3, invoiceStatus: 'Paid', cancellationDeadline: '2027-02-21' },

  // AFL London — provisional block with cancellation deadline approaching
  { id: 'hb-afl-1', hotelId: 'h-langford', programmeId: 'p-afl', guest: { kind: 'learner', id: 'l-mariam' }, roomType: 'Superior Double', checkIn: '2027-05-23', checkOut: '2027-05-26', status: 'Provisional', cost: 345 * 3, invoiceStatus: 'Not Invoiced', cancellationDeadline: '2027-04-05', specialRequests: 'Quiet room away from lift' },
  { id: 'hb-afl-2', hotelId: 'h-langford', programmeId: 'p-afl', guest: { kind: 'learner', id: 'l-28' }, roomType: 'Superior Double', checkIn: '2027-05-23', checkOut: '2027-05-26', status: 'Provisional', cost: 345 * 3, invoiceStatus: 'Not Invoiced', cancellationDeadline: '2027-04-05' },
  { id: 'hb-afl-3', hotelId: 'h-langford', programmeId: 'p-afl', guest: { kind: 'faculty', id: 'f-lindqvist' }, roomType: 'Superior Double', checkIn: '2027-05-24', checkOut: '2027-05-26', status: 'Requested', cost: 345 * 2, invoiceStatus: 'Not Invoiced', cancellationDeadline: '2027-04-05' },
  { id: 'hb-afl-4', hotelId: 'h-langford', programmeId: 'p-afl', guest: { kind: 'faculty', id: 'f-nwosu' }, roomType: 'Junior Suite', checkIn: '2027-05-23', checkOut: '2027-05-26', confirmationNumber: 'LK-20931', status: 'Confirmed', cost: 520 * 3, invoiceStatus: 'Not Invoiced', cancellationDeadline: '2027-05-09' },

  // GBS Residency 2 (Dubai) — travelling participants
  ...['l-50', 'l-51', 'l-52', 'l-53', 'l-54', 'l-55', 'l-59', 'l-60'].map((id, i) => ({ id: `hb-gbs-${i + 1}`, hotelId: 'h-creekside', programmeId: 'p-gbs', guest: { kind: 'learner' as const, id }, roomType: 'Deluxe King', checkIn: '2027-04-25', checkOut: '2027-04-28', confirmationNumber: `CGH-49${100 + i}`, status: i === 6 ? ('Amended' as const) : ('Confirmed' as const), cost: 315 * 3, invoiceStatus: 'Not Invoiced' as const, cancellationDeadline: '2027-04-18', specialRequests: i === 6 ? 'Extended stay to 29 Apr — personal' : undefined })),
  { id: 'hb-gbs-f1', hotelId: 'h-creekside', programmeId: 'p-gbs', guest: { kind: 'faculty', id: 'f-vasquez' }, roomType: 'Executive Suite', checkIn: '2027-04-25', checkOut: '2027-04-28', confirmationNumber: 'CGH-49120', status: 'Confirmed', cost: 540 * 3, invoiceStatus: 'Not Invoiced', cancellationDeadline: '2027-04-18' },
  { id: 'hb-gbs-r1', hotelId: 'h-creekside', programmeId: 'p-gbs', guest: { kind: 'faculty', id: 'f-lindqvist' }, roomType: 'Deluxe King', checkIn: '2027-01-31', checkOut: '2027-02-03', confirmationNumber: 'CGH-46012', status: 'Checked Out', cost: 315 * 3, invoiceStatus: 'Invoice Received', cancellationDeadline: '2027-01-24' },
];

// ─── Travel itineraries ───────────────────────────────────────────────────────

type Leg = [from: string, fromCity: string, carrier: string, num: string, depart: string, arrive: string, arriveNextDay?: boolean];
const elpLegs: Record<string, Leg> = {
  'l-04': ['LHR', 'London', 'Emirates', 'EK 002', '20:40', '07:40', true],
  'l-06': ['BOM', 'Mumbai', 'Emirates', 'EK 501', '04:45', '06:20'],
  'l-08': ['MCT', 'Muscat', 'Oman Air', 'WY 605', '13:15', '14:25'],
  'l-09': ['MAD', 'Madrid', 'Emirates', 'EK 142', '15:05', '00:35', true],
  'l-10': ['RUH', 'Riyadh', 'Saudia', 'SV 554', '09:10', '12:20'],
  'l-12': ['LOS', 'Lagos', 'Emirates', 'EK 784', '15:00', '00:45', true],
  'l-13': ['DOH', 'Doha', 'Qatar Airways', 'QR 1002', '07:30', '09:40'],
  'l-14': ['HAM', 'Hamburg', 'Emirates', 'EK 060', '21:25', '06:55', true],
  'l-15': ['KWI', 'Kuwait City', 'Kuwait Airways', 'KU 671', '10:05', '13:10'],
  'l-16': ['CAI', 'Cairo', 'EgyptAir', 'MS 910', '16:00', '21:35'],
  'l-17': ['BOM', 'Mumbai', 'Emirates', 'EK 501', '04:45', '06:20'],
  'l-18': ['BAH', 'Manama', 'Gulf Air', 'GF 504', '11:25', '13:45'],
  'l-19': ['MCT', 'Muscat', 'Oman Air', 'WY 609', '17:40', '18:50'],
  'l-20': ['NQZ', 'Astana', 'Air Astana', 'KC 897', '23:40', '03:30', true],
  'l-21': ['KWI', 'Kuwait City', 'Kuwait Airways', 'KU 671', '10:05', '13:10'],
  'l-22': ['NBO', 'Nairobi', 'Kenya Airways', 'KQ 310', '18:45', '01:10', true],
  'f-vasquez': ['LHR', 'London', 'Emirates', 'EK 004', '21:55', '07:35', true],
  'f-thorne': ['SIN', 'Singapore', 'Singapore Airlines', 'SQ 494', '19:40', '22:55'],
  'f-goldberg': ['JFK', 'New York', 'Emirates', 'EK 202', '22:30', '19:45', true],
  'f-bennett': ['DXB', 'Dubai', '—', '—', '—', '—'],
};
const statusOf: Record<string, TravelItinerary['status']> = {
  'l-04': 'Ticketed', 'l-06': 'Ticketed', 'l-08': 'Ticketed', 'l-09': 'Ticketed', 'l-10': 'Booked', 'l-12': 'Ticketed', 'l-13': 'Ticketed', 'l-14': 'Booked', 'l-17': 'Ticketed',
  'l-15': 'Options Sent', 'l-16': 'Options Sent', 'l-18': 'Options Sent', 'l-20': 'Options Sent',
  'l-19': 'Missing', 'l-21': 'Missing', 'l-22': 'Missing',
  'f-vasquez': 'Ticketed', 'f-thorne': 'Ticketed', 'f-goldberg': 'Ticketed', 'f-bennett': 'Booked',
};

function elpItinerary(id: string, i: number): TravelItinerary {
  const [from, fromCity, carrier, num, depart, arrive, next] = elpLegs[id];
  const status = statusOf[id];
  const isFaculty = id.startsWith('f-');
  const outDate = id === 'f-vasquez' ? '2027-04-09' : id === 'f-goldberg' ? '2027-04-11' : next ? '2027-04-10' : '2027-04-11';
  const hasFlights = status !== 'Missing' && status !== 'Options Sent' && from !== 'DXB';
  const arriveDate = next ? (outDate === '2027-04-09' ? '2027-04-10' : outDate === '2027-04-10' ? '2027-04-11' : '2027-04-12') : outDate;
  return {
    id: `ti-elp-${i + 1}`,
    programmeId: 'p-elp',
    traveller: { kind: isFaculty ? 'faculty' : 'learner', id },
    status,
    segments: hasFlights
      ? [
          { id: `fs-elp-${i}-out`, carrier, flightNumber: num, from, fromCity, to: 'DXB', toCity: 'Dubai', date: outDate, depart, arrive, arriveDate, cabin: isFaculty ? 'Business' : 'Economy', seat: isFaculty ? `${2 + (i % 5)}A` : `${30 + i}C`, pnr: `${'QWERTYUIOPASDFGH'[i % 16]}${'ZXCVBNMLKJ'[i % 10]}${(4820 + i * 13).toString(36).toUpperCase()}` },
          { id: `fs-elp-${i}-ret`, carrier, flightNumber: num.replace(/\d+$/, (n) => String(Number(n) + 1).padStart(n.length, '0')), from: 'DXB', fromCity: 'Dubai', to: from, toCity: fromCity, date: '2027-04-16', depart: '16:30', arrive: '20:10', arriveDate: '2027-04-16', cabin: isFaculty ? 'Business' : 'Economy' },
        ]
      : [],
    transfers: hasFlights ? [{ id: `tr-elp-${i}`, date: arriveDate, time: arrive, from: 'DXB Terminal 3', to: 'Creekside Grand Hotel', provider: 'Desert Line Transport', status: i % 4 === 0 ? 'Pending' : 'Booked' }] : [],
    cost: hasFlights ? (isFaculty ? 4200 + i * 110 : 680 + i * 45) : 0,
    visaRequired: ['l-12', 'l-16', 'l-20', 'l-22'].includes(id),
    visaStatus: ['l-12', 'l-16', 'l-20', 'l-22'].includes(id) ? (status === 'Ticketed' ? 'Issued' : 'In Progress') : 'Not Required',
    notes: id === 'f-bennett' ? 'Dubai-based — local transfer only' : status === 'Options Sent' ? 'Three flight options sent; awaiting traveller choice' : status === 'Missing' ? 'Traveller has not yet shared travel preferences' : undefined,
  };
}

export const itineraries: TravelItinerary[] = [
  ...Object.keys(elpLegs).map((id, i) => elpItinerary(id, i)),
  {
    id: 'ti-afl-1', programmeId: 'p-afl', traveller: { kind: 'faculty', id: 'f-nwosu' }, status: 'Booked', cost: 0,
    segments: [], transfers: [{ id: 'tr-afl-1', date: '2027-05-23', time: '17:00', from: 'Home (London)', to: 'The Langford Kensington', provider: 'Addison Lee', status: 'Booked' }], notes: 'London-based — car transfer only',
  },
  { id: 'ti-afl-2', programmeId: 'p-afl', traveller: { kind: 'faculty', id: 'f-lindqvist' }, status: 'Requested', cost: 0, segments: [], transfers: [], notes: 'Awaiting confirmation of session before booking ARN–LHR' },
  { id: 'ti-afl-3', programmeId: 'p-afl', traveller: { kind: 'learner', id: 'l-mariam' }, status: 'Requested', cost: 0, segments: [], transfers: [], notes: 'Atlas travel desk to book SIN–LHR; Emeritus to arrange transfers' },
  { id: 'ti-afl-4', programmeId: 'p-afl', traveller: { kind: 'learner', id: 'l-28' }, status: 'Missing', cost: 0, segments: [], transfers: [] },
  {
    id: 'ti-smp-1', programmeId: 'p-smp', traveller: { kind: 'faculty', id: 'f-nwosu' }, status: 'Ticketed', cost: 5_840,
    segments: [
      { id: 'fs-smp-1', carrier: 'Singapore Airlines', flightNumber: 'SQ 317', from: 'LHR', fromCity: 'London', to: 'SIN', toCity: 'Singapore', date: '2027-04-19', depart: '11:35', arrive: '07:55', arriveDate: '2027-04-20', cabin: 'Business', seat: '14A', pnr: 'SQ7Y2K' },
      { id: 'fs-smp-2', carrier: 'Singapore Airlines', flightNumber: 'SQ 322', from: 'SIN', fromCity: 'Singapore', to: 'LHR', toCity: 'London', date: '2027-04-23', depart: '23:15', arrive: '05:50', arriveDate: '2027-04-24', cabin: 'Business', seat: '12K' },
    ],
    transfers: [{ id: 'tr-smp-1', date: '2027-04-20', time: '08:30', from: 'Changi T3', to: 'The Crescent Marina', provider: 'Lumen Concierge', status: 'Booked' }],
  },
  ...['l-28', 'l-29', 'l-30', 'l-32'].map((id, i) => ({
    id: `ti-smp-l${i}`, programmeId: 'p-smp', traveller: { kind: 'learner' as const, id }, status: 'Booked' as const, cost: [610, 280, 540, 320][i],
    segments: [{ id: `fs-smp-l${i}`, carrier: ['Singapore Airlines', 'Malaysia Airlines', 'Cathay Pacific', 'Garuda Indonesia'][i], flightNumber: ['SQ 421', 'MH 603', 'CX 715', 'GA 828'][i], from: ['BOM', 'KUL', 'HKG', 'CGK'][i], fromCity: ['Mumbai', 'Kuala Lumpur', 'Hong Kong', 'Jakarta'][i], to: 'SIN', toCity: 'Singapore', date: '2027-04-20', depart: ['23:30', '07:10', '08:15', '06:40'][i], arrive: ['07:35', '08:15', '12:05', '09:30'][i], arriveDate: i === 0 ? '2027-04-21' : '2027-04-20', cabin: 'Economy' as const }],
    transfers: [],
  })),
  {
    id: 'ti-gbs-f1', programmeId: 'p-gbs', traveller: { kind: 'faculty', id: 'f-vasquez' }, status: 'Ticketed', cost: 4_380,
    segments: [
      { id: 'fs-gbs-1', carrier: 'British Airways', flightNumber: 'BA 107', from: 'LHR', fromCity: 'London', to: 'DXB', toCity: 'Dubai', date: '2027-04-24', depart: '20:50', arrive: '07:15', arriveDate: '2027-04-25', cabin: 'Business', seat: '5K', pnr: 'BA4KQ9' },
      { id: 'fs-gbs-2', carrier: 'British Airways', flightNumber: 'BA 106', from: 'DXB', fromCity: 'Dubai', to: 'LHR', toCity: 'London', date: '2027-04-28', depart: '09:30', arrive: '13:55', arriveDate: '2027-04-28', cabin: 'Business', seat: '5A' },
    ],
    transfers: [{ id: 'tr-gbs-1', date: '2027-04-25', time: '07:15', from: 'DXB Terminal 1', to: 'Creekside Grand Hotel', provider: 'Desert Line Transport', status: 'Booked' }],
  },
  { id: 'ti-ai-1', programmeId: 'p-ai', traveller: { kind: 'faculty', id: 'f-sharma' }, status: 'Options Sent', cost: 0, segments: [], transfers: [], notes: 'BOM–DXB options sent 26 Mar' },
  { id: 'ti-ai-2', programmeId: 'p-ai', traveller: { kind: 'learner', id: 'l-44' }, status: 'Booked', cost: 0, segments: [], transfers: [{ id: 'tr-ai-1', date: '2027-05-03', time: '06:30', from: 'Abu Dhabi', to: 'Emeritus Executive Centre', provider: 'Desert Line Transport', status: 'Booked' }], notes: 'Road transfer from Abu Dhabi' },
];

// ─── Venue bookings ───────────────────────────────────────────────────────────

export const venueBookings: VenueBooking[] = [
  {
    id: 'vb-elp-1', venueId: 'v-creekside', roomId: 'vr-cs-1', programmeId: 'p-elp', dates: { from: '2027-04-12', to: '2027-04-16' }, layout: 'Cabaret', attendees: 30, status: 'Provisional', cost: 32_000,
    av: [{ item: 'Laser projector + dual 4m screens', qty: 1, confirmed: true }, { item: 'Lapel microphones', qty: 2, confirmed: true }, { item: 'Handheld microphones', qty: 4, confirmed: true }, { item: 'Confidence monitor', qty: 1, confirmed: true }, { item: 'Video recording kit (keynote)', qty: 1, confirmed: false }],
    catering: [
      { time: '08:00', item: 'Arrival coffee & pastries', covers: 30, confirmed: true },
      { time: '10:30', item: 'Morning refreshment break', covers: 30, confirmed: true },
      { time: '12:30', item: 'Working lunch — Levantine buffet', covers: 30, dietaryNotes: '4 vegetarian · 1 gluten-free · 1 no eggs', confirmed: false },
      { time: '15:30', item: 'Afternoon tea & dates', covers: 30, confirmed: true },
      { time: '19:30', item: 'Welcome dinner (12 Apr) — Terrace', covers: 34, confirmed: false },
    ],
    notes: 'Contract with venue awaiting countersignature. Hold expires 2 Apr.',
  },
  {
    id: 'vb-elp-2', venueId: 'v-creekside', roomId: 'vr-cs-2', programmeId: 'p-elp', dates: { from: '2027-04-13', to: '2027-04-14' }, layout: 'Boardroom', attendees: 10, status: 'Confirmed', cost: 4_800,
    av: [{ item: '65" display', qty: 3, confirmed: true }, { item: 'Flipcharts', qty: 6, confirmed: true }], catering: [],
  },
  {
    id: 'vb-gbs-1', venueId: 'v-eec', roomId: 'vr-eec-1', programmeId: 'p-gbs', dates: { from: '2027-04-26', to: '2027-04-28' }, layout: 'U-Shape', attendees: 16, status: 'Provisional', cost: 0,
    av: [{ item: 'Hybrid camera system', qty: 1, confirmed: true }, { item: 'Ceiling mic array', qty: 1, confirmed: true }],
    catering: [{ time: '12:30', item: 'Lunch', covers: 16, confirmed: false }],
  },
  {
    id: 'vb-smp-1', venueId: 'v-lumen', roomId: 'vr-lu-1', programmeId: 'p-smp', dates: { from: '2027-04-21', to: '2027-04-23' }, layout: 'Cabaret', attendees: 18, status: 'Confirmed', cost: 21_600,
    av: [{ item: 'Broadcast cameras', qty: 2, confirmed: true }, { item: 'Confidence monitors', qty: 2, confirmed: true }],
    catering: [{ time: '12:30', item: 'Working lunch', covers: 18, confirmed: true }],
  },
  {
    id: 'vb-afl-1', venueId: 'v-guildhall', roomId: 'vr-gh-1', programmeId: 'p-afl', dates: { from: '2027-05-24', to: '2027-05-26' }, layout: 'U-Shape', attendees: 16, status: 'Provisional', cost: 17_400,
    av: [{ item: 'Projector', qty: 1, confirmed: false }], catering: [{ time: '12:30', item: 'Private dining lunch', covers: 16, confirmed: false }],
  },
  { id: 'vb-psl-1', venueId: 'v-najd', roomId: 'vr-nj-1', programmeId: 'p-psl', dates: { from: '2027-06-07', to: '2027-06-11' }, layout: 'Classroom', attendees: 24, status: 'Enquiry', cost: 34_500, av: [{ item: 'Interpretation booths', qty: 2, confirmed: false }], catering: [] },
  { id: 'vb-ai-1', venueId: 'v-eec', roomId: 'vr-eec-2', programmeId: 'p-ai', dates: { from: '2027-05-03', to: '2027-05-03' }, layout: 'Cabaret', attendees: 14, status: 'Confirmed', cost: 0, av: [{ item: 'Hybrid camera', qty: 1, confirmed: false }], catering: [{ time: '12:30', item: 'Lunch', covers: 14, confirmed: true }] },
];

// ─── Logistics checklist (feeds Venue & Equipment readiness) ─────────────────

function li(id: string, programmeId: string, area: LogisticsItem['area'], label: string, ownerId: string, due: string, done: boolean, extra: Partial<LogisticsItem> = {}): LogisticsItem {
  return { id, programmeId, area, label, ownerId, due, done, ...extra };
}

export const logisticsItems: LogisticsItem[] = [
  // ELP — venue 2/4, AV 3/4
  li('lg-elp-1', 'p-elp', 'Venue', 'Ballroom layout confirmed (cabaret, 24 + guests)', 's-sofia', '2027-03-20', true),
  li('lg-elp-2', 'p-elp', 'Venue', 'Breakout rooms ×3 confirmed', 's-sofia', '2027-03-22', true),
  li('lg-elp-3', 'p-elp', 'Venue', 'Signed venue contract returned', 's-sofia', '2027-04-02', false, { detail: 'Contract with legal for countersignature', taskId: 't-01' }),
  li('lg-elp-4', 'p-elp', 'Venue', 'Site inspection with venue AV team', 's-omar', '2027-04-05', false),
  li('lg-elp-5', 'p-elp', 'Audio/Visual', 'Projector & dual screens', 's-omar', '2027-03-24', true),
  li('lg-elp-6', 'p-elp', 'Audio/Visual', 'Lapel & handheld microphones (6)', 's-omar', '2027-03-24', true),
  li('lg-elp-7', 'p-elp', 'Audio/Visual', 'Confidence monitor & clicker', 's-omar', '2027-03-24', true),
  li('lg-elp-8', 'p-elp', 'Audio/Visual', 'Video recording kit for keynote', 's-sofia', '2027-04-05', false, { taskId: 't-07' }),
  li('lg-elp-9', 'p-elp', 'Catering', 'Daily coffee breaks confirmed', 's-omar', '2027-03-22', true),
  li('lg-elp-10', 'p-elp', 'Catering', 'Dietary requirements shared with hotel', 's-omar', '2027-03-26', false, { detail: '2 participants still to confirm', taskId: 't-11' }),
  li('lg-elp-11', 'p-elp', 'Catering', 'Welcome dinner menu approved', 's-layla', '2027-04-02', false),
  li('lg-elp-12', 'p-elp', 'Transport', 'Airport transfers scheduled', 's-sofia', '2027-04-05', true, { quantity: '20 arrivals' }),
  li('lg-elp-13', 'p-elp', 'Transport', 'Coach for site visit (15 Apr)', 's-sofia', '2027-04-02', false, { detail: 'Awaiting PO approval', taskId: 't-04' }),
  li('lg-elp-14', 'p-elp', 'Transport', 'Return transfers on 16 Apr', 's-sofia', '2027-04-07', false),
  li('lg-elp-15', 'p-elp', 'Printing', 'Participant workbooks', 's-omar', '2027-04-07', false, { quantity: '24 copies, A4 colour, spiral', taskId: 't-08' }),
  li('lg-elp-16', 'p-elp', 'Printing', 'Name badges & table tents', 's-omar', '2027-04-08', true, { quantity: '34 badges' }),
  li('lg-elp-17', 'p-elp', 'Printing', 'Certificates (printed & framed)', 's-aisha', '2027-04-09', false, { quantity: '24' }),
  li('lg-elp-18', 'p-elp', 'Event Materials', 'Welcome kits (notebook, pen, power bank)', 's-omar', '2027-04-08', true),
  li('lg-elp-19', 'p-elp', 'Event Materials', 'Branded pull-up banners ×2', 's-omar', '2027-04-08', true),
  li('lg-elp-20', 'p-elp', 'Event Materials', 'Speaker gifts', 's-layla', '2027-04-09', false),
  li('lg-elp-21', 'p-elp', 'On-site', 'Registration desk staffed 07:30–09:00', 's-omar', '2027-04-12', false),
  li('lg-elp-22', 'p-elp', 'On-site', 'Emergency contacts & first-aid briefing', 's-omar', '2027-04-09', true),
  li('lg-elp-23', 'p-elp', 'On-site', 'Wi-Fi codes & tech check', 's-omar', '2027-04-11', false),
  li('lg-elp-24', 'p-elp', 'On-site', 'Daily debrief with faculty', 's-layla', '2027-04-12', false),
  // DTE — virtual platform (equipment 2/4)
  li('lg-dte-1', 'p-dte', 'Audio/Visual', 'Zoom webinar licence allocated', 's-omar', '2027-03-26', true),
  li('lg-dte-2', 'p-dte', 'Audio/Visual', 'Learning Hub cohort space configured', 's-omar', '2027-03-29', true),
  li('lg-dte-3', 'p-dte', 'Audio/Visual', 'Breakout room plan built', 's-omar', '2027-04-09', false, { taskId: 't-16' }),
  li('lg-dte-4', 'p-dte', 'Audio/Visual', 'Tech rehearsal with all faculty', 's-omar', '2027-04-15', false, { taskId: 't-17' }),
  // AFL — venue 1/3, AV 0/2
  li('lg-afl-1', 'p-afl', 'Venue', 'Venue shortlist (3 options)', 's-sofia', '2027-03-25', true),
  li('lg-afl-2', 'p-afl', 'Venue', 'Venue contract signed', 's-sofia', '2027-04-23', false),
  li('lg-afl-3', 'p-afl', 'Venue', 'Private dining booked for closing dinner', 's-sofia', '2027-05-07', false),
  li('lg-afl-4', 'p-afl', 'Audio/Visual', 'Projector & mics confirmed', 's-omar', '2027-05-14', false),
  li('lg-afl-5', 'p-afl', 'Audio/Visual', 'Recording for faculty review', 's-omar', '2027-05-14', false),
  // AI — venue 1/2, AV 1/3
  li('lg-ai-1', 'p-ai', 'Venue', 'Innovation Lab booked for kick-off', 's-sofia', '2027-03-19', true),
  li('lg-ai-2', 'p-ai', 'Venue', 'Overflow room for hybrid team', 's-sofia', '2027-04-16', false),
  li('lg-ai-3', 'p-ai', 'Audio/Visual', 'Hybrid camera & mics tested', 's-omar', '2027-04-16', false, { taskId: 't-24' }),
  li('lg-ai-4', 'p-ai', 'Audio/Visual', 'Zoom licence allocated', 's-omar', '2027-04-09', true),
  li('lg-ai-5', 'p-ai', 'Audio/Visual', 'Live polling tool set up', 's-omar', '2027-04-26', false),
  // PSL — venue 0/3, AV 0/2
  li('lg-psl-1', 'p-psl', 'Venue', 'Diwan Hall hold confirmed', 's-sofia', '2027-04-16', false),
  li('lg-psl-2', 'p-psl', 'Venue', 'Site visit to Najd Forum', 's-sofia', '2027-04-30', false),
  li('lg-psl-3', 'p-psl', 'Venue', 'Majlis Suites for breakouts', 's-sofia', '2027-04-30', false),
  li('lg-psl-4', 'p-psl', 'Audio/Visual', 'Arabic interpretation booths & interpreters', 's-omar', '2027-05-14', false),
  li('lg-psl-5', 'p-psl', 'Audio/Visual', 'LED wall content check', 's-omar', '2027-05-28', false),
];

export const runSheet: RunSheetItem[] = [
  { id: 'rs-1', programmeId: 'p-elp', date: '2027-04-12', time: '07:00', title: 'Team on site · room check', detail: 'Layout, signage, AV line check, Wi-Fi codes on tables', ownerId: 's-omar', location: 'Al Majlis Ballroom', status: 'Upcoming' },
  { id: 'rs-2', programmeId: 'p-elp', date: '2027-04-12', time: '07:30', title: 'Registration desk opens', detail: 'Badges, welcome kits, dietary wristbands', ownerId: 's-aisha', location: 'Pre-function terrace', status: 'Upcoming' },
  { id: 'rs-3', programmeId: 'p-elp', date: '2027-04-12', time: '08:00', title: 'Arrival coffee', detail: '30 covers · pastries & dates', ownerId: 's-omar', location: 'Pre-function terrace', status: 'Upcoming' },
  { id: 'rs-4', programmeId: 'p-elp', date: '2027-04-12', time: '08:45', title: 'Faculty briefing', detail: 'Prof. Vasquez & Dr. Thorne with programme team', ownerId: 's-layla', location: 'Green room', status: 'Upcoming' },
  { id: 'rs-5', programmeId: 'p-elp', date: '2027-04-12', time: '09:00', title: 'Opening keynote', detail: 'Recording starts · Meridian welcome by Noura Al Kaabi', ownerId: 's-omar', location: 'Al Majlis Ballroom', status: 'Upcoming' },
  { id: 'rs-6', programmeId: 'p-elp', date: '2027-04-12', time: '10:30', title: 'Refreshment break', detail: 'Room reset for group work', ownerId: 's-omar', location: 'Terrace', status: 'Upcoming' },
  { id: 'rs-7', programmeId: 'p-elp', date: '2027-04-12', time: '12:30', title: 'Working lunch', detail: 'Dietary table labelled · 4 veg · 1 GF', ownerId: 's-omar', location: 'Al Bustan Restaurant', status: 'Upcoming' },
  { id: 'rs-8', programmeId: 'p-elp', date: '2027-04-12', time: '17:30', title: 'Daily faculty debrief', detail: 'Capture adjustments for Day 2', ownerId: 's-layla', location: 'Green room', status: 'Upcoming' },
  { id: 'rs-9', programmeId: 'p-elp', date: '2027-04-12', time: '19:30', title: 'Welcome dinner', detail: 'Terrace · 34 covers · Meridian ExCo attending', ownerId: 's-layla', location: 'Creek Terrace', status: 'Upcoming' },
];
