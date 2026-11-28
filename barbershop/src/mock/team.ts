import { addDays, toISODate } from '@/lib/dates';
import { today } from '@/lib/clock';
import type { Barber, WeeklySchedule } from '@/types/models';

import { SALON_ID } from './salon';

const d = (enabled: boolean, start = '10:00', end = '20:00', breaks = [{ start: '14:00', end: '14:45' }]) => ({ enabled, start, end, breaks });

const khaledSchedule: WeeklySchedule = {
  0: d(true, '09:00', '18:00', [{ start: '13:00', end: '13:45' }]),
  1: d(true, '09:00', '18:00', [{ start: '13:00', end: '13:45' }]),
  2: d(true, '09:00', '18:00', [{ start: '13:00', end: '13:45' }]),
  3: d(true, '09:00', '18:00', [{ start: '13:00', end: '13:45' }]),
  4: d(true, '09:00', '20:00', [{ start: '13:00', end: '13:45' }]),
  5: d(false, '14:00', '22:00', []),
  6: d(true, '09:00', '18:00', [{ start: '13:00', end: '13:45' }]),
};

const yousefSchedule: WeeklySchedule = {
  0: d(true, '11:00', '21:00', [{ start: '15:00', end: '15:45' }]),
  1: d(true, '11:00', '21:00', [{ start: '15:00', end: '15:45' }]),
  2: d(false),
  3: d(true, '11:00', '21:00', [{ start: '15:00', end: '15:45' }]),
  4: d(true, '11:00', '22:00', [{ start: '15:00', end: '15:45' }]),
  5: d(true, '14:00', '22:00', []),
  6: d(true, '11:00', '21:00', [{ start: '15:00', end: '15:45' }]),
};

const omarSchedule: WeeklySchedule = {
  0: d(true, '10:00', '20:00'),
  1: d(false),
  2: d(true, '10:00', '20:00'),
  3: d(true, '10:00', '20:00'),
  4: d(true, '12:00', '22:00', [{ start: '16:00', end: '16:30' }]),
  5: d(true, '14:00', '22:00', []),
  6: d(true, '10:00', '20:00'),
};

/**
 * Make sure all three barbers work on the demo "today" so the day view always shows three
 * busy columns, whatever weekday the prototype is opened on.
 */
function ensureWorksToday(s: WeeklySchedule): WeeklySchedule {
  const wd = today().getDay() as keyof WeeklySchedule;
  if (s[wd].enabled) return s;
  return { ...s, [wd]: { ...s[wd], enabled: true, start: '10:00', end: '20:00', breaks: [{ start: '15:00', end: '15:30' }] } };
}

export const barbers: Barber[] = [
  {
    id: 'b1',
    salonId: SALON_ID,
    name: { en: 'Khaled Nasser', ar: 'خالد ناصر' },
    nickname: { en: 'Abu Ali', ar: 'أبو علي' },
    title: { en: 'Owner · Master barber', ar: 'صاحب الصالون · حلاق رئيسي' },
    bio: { en: 'Twelve years behind the chair. Classic scissor cuts and hot-towel shaves.', ar: '12 سنة خبرة. قصّات بالمقص وحلاقة بالمنشفة السخنة.' },
    phone: { country: '+970', number: '599100200' },
    color: '#8A4520',
    initials: { en: 'KN', ar: 'خ' },
    role: 'owner',
    serviceIds: ['s1', 's2', 's3', 's4', 's6', 's8', 's9'],
    schedule: ensureWorksToday(khaledSchedule),
    daysOff: [toISODate(addDays(today(), 9))],
    active: true,
    acceptsOnline: true,
    joinedAt: '2014-03-01',
    yearsExperience: 12,
  },
  {
    id: 'b2',
    salonId: SALON_ID,
    name: { en: 'Yousef Odeh', ar: 'يوسف عودة' },
    title: { en: 'Senior barber · Fades', ar: 'حلاق أول · فيد' },
    bio: { en: 'Skin fades, tapers and sharp line-ups. Usually booked out on Thursdays.', ar: 'سكين فيد وتدريج وتحديد دقيق. الخميس عادةً محجوز كامل.' },
    phone: { country: '+970', number: '599300400' },
    color: '#2F5D50',
    initials: { en: 'YO', ar: 'ي' },
    role: 'barber',
    serviceIds: ['s1', 's2', 's3', 's4', 's5', 's7'],
    schedule: ensureWorksToday(yousefSchedule),
    daysOff: [toISODate(addDays(today(), 8))],
    active: true,
    acceptsOnline: true,
    joinedAt: '2019-06-15',
    yearsExperience: 7,
  },
  {
    id: 'b3',
    salonId: SALON_ID,
    name: { en: 'Omar Haddad', ar: 'عمر حداد' },
    title: { en: 'Barber · Kids & beards', ar: 'حلاق · أطفال ولحى' },
    bio: { en: 'Patient with kids, precise with beards. Joined the house in 2023.', ar: 'صبور مع الأطفال ودقيق باللحى. انضم للفريق سنة 2023.' },
    phone: { country: '+972', number: '527700800' },
    color: '#3D4C7A',
    initials: { en: 'OH', ar: 'ع' },
    role: 'barber',
    serviceIds: ['s1', 's2', 's3', 's4', 's5', 's7'],
    schedule: ensureWorksToday(omarSchedule),
    daysOff: [],
    active: true,
    acceptsOnline: true,
    joinedAt: '2023-02-01',
    yearsExperience: 3,
  },
];
