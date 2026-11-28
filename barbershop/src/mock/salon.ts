import type { Salon, User, WeeklySchedule } from '@/types/models';

export const SALON_ID = 'salon_barber_house';

const day = (enabled: boolean, start = '09:00', end = '21:00', breaks = [{ start: '13:30', end: '14:00' }]) => ({ enabled, start, end, breaks });

/** Saturday–Thursday 9:00–21:00; Friday opens after Friday prayer. */
export const salonHours: WeeklySchedule = {
  0: day(true),
  1: day(true),
  2: day(true),
  3: day(true),
  4: day(true, '09:00', '22:00'),
  5: day(true, '14:00', '22:00', []),
  6: day(true, '09:00', '21:00'),
};

export const salon: Salon = {
  id: SALON_ID,
  slug: 'the-barber-house',
  name: { en: 'The Barber House', ar: 'بيت الحلاق' },
  tagline: { en: 'Classic cuts. Modern craft.', ar: 'قصّات كلاسيكية بلمسة عصرية' },
  about: {
    en: 'A neighbourhood barbershop in the heart of Ramallah since 2014. Precision fades, hot-towel shaves and beard work by a team that remembers how you like it.',
    ar: 'صالون حلاقة بقلب رام الله من سنة 2014. فيد دقيق، حلاقة بالمنشفة السخنة وترتيب لحية، مع فريق بيتذكّر كيف بتحبها.',
  },
  address: { en: 'Al-Irsal Street, Building 12, Ground Floor', ar: 'شارع الإرسال، عمارة 12، الطابق الأرضي' },
  city: { en: 'Ramallah', ar: 'رام الله' },
  phone: { country: '+970', number: '22987654' },
  whatsapp: { country: '+970', number: '599887766' },
  email: 'hello@thebarberhouse.ps',
  instagram: '@thebarberhouse.ps',
  currency: 'ILS',
  timezone: 'Asia/Hebron',
  hours: salonHours,
  cancellationPolicyHours: 12,
  confirmationLinkHours: 24,
  slotIntervalMin: 15,
  plan: 'professional',
  branches: [
    {
      id: 'br1',
      name: { en: 'Ramallah — Al-Irsal', ar: 'رام الله — الإرسال' },
      address: { en: 'Al-Irsal Street, Building 12', ar: 'شارع الإرسال، عمارة 12' },
      phone: { country: '+970', number: '22987654' },
      isPrimary: true,
      barberIds: ['b1', 'b2', 'b3'],
    },
    {
      id: 'br2',
      name: { en: 'Al-Bireh — Downtown (opening soon)', ar: 'البيرة — وسط البلد (قريباً)' },
      address: { en: 'Jerusalem Street, near the municipality', ar: 'شارع القدس، قرب البلدية' },
      phone: { country: '+970', number: '22401122' },
      isPrimary: false,
      barberIds: [],
    },
  ],
  holidays: [],
  brandColor: '#A9582A',
  rating: 4.9,
  reviewCount: 318,
};

export const currentOwner: User = {
  id: 'u1',
  salonId: SALON_ID,
  name: { en: 'Khaled Nasser', ar: 'خالد ناصر' },
  email: 'khaled@thebarberhouse.ps',
  phone: { country: '+970', number: '599100200' },
  role: 'owner',
  barberId: 'b1',
  lastActiveAt: new Date().toISOString(),
  twoFactor: true,
};

export const teamUsers: User[] = [
  currentOwner,
  {
    id: 'u2',
    salonId: SALON_ID,
    name: { en: 'Yousef Odeh', ar: 'يوسف عودة' },
    email: 'yousef@thebarberhouse.ps',
    phone: { country: '+970', number: '599300400' },
    role: 'barber',
    barberId: 'b2',
    lastActiveAt: new Date().toISOString(),
    twoFactor: false,
  },
  {
    id: 'u3',
    salonId: SALON_ID,
    name: { en: 'Omar Haddad', ar: 'عمر حداد' },
    email: 'omar@thebarberhouse.ps',
    phone: { country: '+972', number: '527700800' },
    role: 'barber',
    barberId: 'b3',
    lastActiveAt: new Date().toISOString(),
    twoFactor: false,
  },
  {
    id: 'u4',
    salonId: SALON_ID,
    name: { en: 'Lina Saadeh', ar: 'لينا سعادة' },
    email: 'lina@thebarberhouse.ps',
    phone: { country: '+970', number: '569112233' },
    role: 'receptionist',
    lastActiveAt: new Date().toISOString(),
    twoFactor: false,
  },
];
