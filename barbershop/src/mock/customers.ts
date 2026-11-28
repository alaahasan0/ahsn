import type { CommunicationChannel, Customer, CustomerCategory, PhoneNumber, WhatsAppVerification } from '@/types/models';

import { SALON_ID } from './salon';

type Seed = [
  id: string,
  en: string,
  ar: string,
  phone: PhoneNumber,
  whatsapp: PhoneNumber | null,
  verification: WhatsAppVerification,
  channel: CommunicationChannel,
  category: CustomerCategory,
  preferredBarberId: string | undefined,
  preferredServiceIds: string[],
  createdDaysAgo: number,
  notes?: string,
];

const p = (country: PhoneNumber['country'], number: string): PhoneNumber => ({ country, number });

/**
 * 26 customers. Note the deliberate cases where the WhatsApp number differs from the phone
 * number, or uses the other prefix (+972 vs +970) — the UI must never assume they match.
 */
const seeds: Seed[] = [
  ['c1', 'Ahmad Khalil', 'أحمد خليل', p('+970', '599123456'), p('+970', '599123456'), 'verified', 'whatsapp', 'trusted', 'b2', ['s1', 's3'], 820, 'Prefers a low fade, #2 on the sides. Likes to chat about football.'],
  ['c2', 'Mohammad Saleh', 'محمد صالح', p('+970', '598234567'), p('+972', '548234567'), 'verified', 'whatsapp', 'trusted', 'b1', ['s3'], 1400, 'WhatsApp is on his +972 line.'],
  ['c3', 'Mahmoud Awad', 'محمود عوض', p('+970', '597345678'), p('+970', '597345678'), 'verified', 'whatsapp', 'regular', 'b2', ['s7'], 410],
  ['c4', 'Ibrahim Qasem', 'إبراهيم قاسم', p('+972', '527456789'), p('+972', '527456789'), 'verified', 'whatsapp', 'regular', 'b3', ['s1'], 300],
  ['c5', 'Ali Hamdan', 'علي حمدان', p('+970', '569567890'), null, 'unverified', 'sms', 'regular', 'b1', ['s1', 's2'], 600, 'No WhatsApp. Send SMS only.'],
  ['c6', 'Hasan Barghouti', 'حسن البرغوثي', p('+970', '599678901'), p('+970', '599678901'), 'verified', 'whatsapp', 'trusted', 'b1', ['s6', 's3'], 1900, 'Hot towel shave every Thursday. Has been coming since we opened.'],
  ['c7', 'Samer Jaber', 'سامر جابر', p('+970', '598789012'), p('+970', '592789012'), 'pending', 'whatsapp', 'new', undefined, ['s1'], 9],
  ['c8', 'Rami Shaheen', 'رامي شاهين', p('+970', '597890123'), p('+970', '597890123'), 'verified', 'whatsapp', 'regular', 'b2', ['s7', 's2'], 250],
  ['c9', 'Tareq Abu Ghosh', 'طارق أبو غوش', p('+972', '523901234'), p('+972', '523901234'), 'verified', 'call', 'regular', 'b3', ['s3'], 380, 'Prefers a phone call the day before.'],
  ['c10', 'Fadi Khoury', 'فادي خوري', p('+970', '599012345'), p('+970', '599012345'), 'verified', 'whatsapp', 'trusted', 'b1', ['s8', 's1'], 1100, 'Grey blending every 6 weeks.'],
  ['c11', 'Majd Zidan', 'مجد زيدان', p('+970', '598112233'), p('+970', '598112233'), 'unverified', 'whatsapp', 'new', 'b2', ['s7'], 21],
  ['c12', 'Nour Eldin Taha', 'نور الدين طه', p('+970', '597223344'), p('+970', '597223344'), 'verified', 'whatsapp', 'regular', 'b3', ['s1', 's4'], 200],
  ['c13', 'Bassel Mansour', 'باسل منصور', p('+972', '546334455'), p('+970', '596334455'), 'verified', 'whatsapp', 'regular', 'b2', ['s3'], 470, 'WhatsApp on a different number than his phone.'],
  ['c14', 'Wael Sabbah', 'وائل صبّاح', p('+970', '599445566'), p('+970', '599445566'), 'verified', 'whatsapp', 'trusted', 'b1', ['s1'], 1600],
  ['c15', 'Hamza Qawasmi', 'حمزة القواسمي', p('+970', '598556677'), p('+970', '598556677'), 'verified', 'whatsapp', 'regular', 'b3', ['s5', 's1'], 330, 'Books for his two sons as well.'],
  ['c16', 'Anas Hijazi', 'أنس حجازي', p('+970', '597667788'), null, 'unverified', 'call', 'new', undefined, ['s1'], 4],
  ['c17', 'Karim Nassar', 'كريم نصّار', p('+972', '525778899'), p('+972', '525778899'), 'verified', 'whatsapp', 'regular', 'b2', ['s7'], 150],
  ['c18', 'Yazan Abu Eid', 'يزن أبو عيد', p('+970', '599889900'), p('+970', '599889900'), 'verified', 'whatsapp', 'trusted', 'b2', ['s3', 's7'], 700],
  ['c19', 'Laith Hamed', 'ليث حامد', p('+970', '598990011'), p('+970', '598990011'), 'pending', 'whatsapp', 'new', 'b3', ['s7'], 14],
  ['c20', 'Adam Khalil', 'آدم خليل', p('+970', '599123456'), p('+970', '599123456'), 'verified', 'whatsapp', 'regular', 'b3', ['s5'], 500, 'Ahmad Khalil’s son (age 8). Same contact number.'],
  ['c21', 'Zaid Al-Masri', 'زيد المصري', p('+970', '597001122'), p('+970', '597001122'), 'verified', 'whatsapp', 'regular', 'b1', ['s3'], 260],
  ['c22', 'Osama Jarrar', 'أسامة جرار', p('+970', '569112244'), p('+970', '569112244'), 'unverified', 'sms', 'regular', 'b3', ['s2'], 190],
  ['c23', 'Jad Saliba', 'جاد صليبا', p('+972', '528223355'), p('+972', '528223355'), 'verified', 'whatsapp', 'new', undefined, ['s1'], 2],
  ['c24', 'Amir Dajani', 'أمير الدجاني', p('+970', '598334466'), p('+970', '598334466'), 'verified', 'whatsapp', 'trusted', 'b2', ['s1', 's2'], 900],
  ['c25', 'Mustafa Shawa', 'مصطفى الشوا', p('+970', '599445577'), p('+970', '599445577'), 'verified', 'whatsapp', 'regular', 'b1', ['s1'], 340],
  ['c26', 'Qusai Darwish', 'قصي درويش', p('+970', '597556688'), p('+972', '547556688'), 'pending', 'whatsapp', 'new', 'b2', ['s7'], 30],
];

const DAY = 86_400_000;

/**
 * The wider client base: occasional customers generated deterministically so the 26 named
 * profiles above keep realistic visit counts (a regular comes every 2–4 weeks, not daily).
 */
const FIRST: [string, string][] = [
  ['Saleh', 'صالح'], ['Khalil', 'خليل'], ['Yousef', 'يوسف'], ['Omar', 'عمر'], ['Hani', 'هاني'], ['Shadi', 'شادي'], ['Ammar', 'عمّار'], ['Bilal', 'بلال'],
  ['Eyad', 'إياد'], ['Fares', 'فارس'], ['Ghassan', 'غسان'], ['Iyad', 'عياد'], ['Jamal', 'جمال'], ['Kamal', 'كمال'], ['Loay', 'لؤي'], ['Moath', 'معاذ'],
  ['Nidal', 'نضال'], ['Raed', 'رائد'], ['Sami', 'سامي'], ['Tamer', 'تامر'], ['Wasim', 'وسيم'], ['Yahya', 'يحيى'], ['Zakaria', 'زكريا'], ['Murad', 'مراد'],
  ['Nasser', 'ناصر'], ['Odai', 'عدي'], ['Ihab', 'إيهاب'], ['Firas', 'فراس'], ['Mahdi', 'مهدي'], ['Hussam', 'حسام'],
];
const LAST: [string, string][] = [
  ['Abu Sharkh', 'أبو شرخ'], ['Odeh', 'عودة'], ['Nofal', 'نوفل'], ['Shalabi', 'شلبي'], ['Tamimi', 'التميمي'], ['Hamdan', 'حمدان'], ['Zaghal', 'زغل'],
  ['Kassab', 'قصّاب'], ['Mustafa', 'مصطفى'], ['Sharif', 'شريف'], ['Atallah', 'عطا الله'], ['Daoud', 'داود'], ['Hilal', 'هلال'], ['Issa', 'عيسى'],
  ['Juma', 'جمعة'], ['Khatib', 'الخطيب'], ['Labadi', 'لبادي'], ['Mansour', 'منصور'], ['Nimer', 'نمر'], ['Qaddoumi', 'القدومي'],
];

function occasionalCustomers(count: number): Customer[] {
  let x = 7;
  const r = () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
  const out: Customer[] = [];
  const used = new Set(seeds.map((x) => x[1]));
  for (let i = 0; i < count; i++) {
    let [fe, fa] = FIRST[Math.floor(r() * FIRST.length)];
    let [le, la] = LAST[Math.floor(r() * LAST.length)];
    for (let tries = 0; used.has(`${fe} ${le}`) && tries < 50; tries++) {
      [fe, fa] = FIRST[Math.floor(r() * FIRST.length)];
      [le, la] = LAST[Math.floor(r() * LAST.length)];
    }
    used.add(`${fe} ${le}`);
    const country = r() < 0.75 ? '+970' : '+972';
    const number = (country === '+970' ? (r() < 0.8 ? '59' : '56') : `5${2 + Math.floor(r() * 6)}`) + String(1000000 + Math.floor(r() * 8999999)).slice(0, 7);
    const hasWa = r() < 0.85;
    const category: CustomerCategory = r() < 0.12 ? 'trusted' : r() < 0.8 ? 'regular' : 'new';
    out.push({
      id: `c${27 + i}`,
      salonId: SALON_ID,
      name: { en: `${fe} ${le}`, ar: `${fa} ${la}` },
      phone: { country, number },
      whatsapp: hasWa ? { country, number } : undefined,
      whatsappVerification: hasWa ? (r() < 0.85 ? 'verified' : 'pending') : 'unverified',
      preferredChannel: hasWa ? 'whatsapp' : 'sms',
      preferredBarberId: r() < 0.6 ? ['b1', 'b2', 'b3'][Math.floor(r() * 3)] : undefined,
      preferredServiceIds: [['s1', 's3', 's7', 's2', 's5'][Math.floor(r() * 5)]],
      category,
      categoryManual: false,
      createdAt: new Date(Date.now() - (category === 'new' ? 5 + r() * 40 : 120 + r() * 900) * DAY).toISOString(),
      marketingOptIn: r() < 0.7,
    });
  }
  return out;
}

const named: Customer[] = seeds.map(([id, en, ar, phone, whatsapp, verification, channel, category, preferredBarberId, preferredServiceIds, daysAgo, notes]) => ({
  id,
  salonId: SALON_ID,
  name: { en, ar },
  phone,
  whatsapp: whatsapp ?? undefined,
  whatsappVerification: verification,
  preferredChannel: channel,
  preferredBarberId,
  preferredServiceIds,
  category,
  categoryManual: id === 'c6' || id === 'c14',
  notes,
  createdAt: new Date(Date.now() - daysAgo * DAY).toISOString(),
  marketingOptIn: category !== 'new',
}));

export const customers: Customer[] = [...named, ...occasionalCustomers(270)];
