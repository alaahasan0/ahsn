/**
 * Locale-aware formatting. Implemented with explicit tables rather than Intl so output is
 * identical on Hermes (iOS/Android) and the web, and Arabic renders correctly everywhere.
 */
import type { Language } from './types';

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  // Levantine month names, as used in Palestine.
  ar: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
};
const MONTHS_SHORT = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ar: MONTHS.ar,
};
const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};
const WEEKDAYS_SHORT = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
};
const WEEKDAYS_MIN = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  ar: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
};

const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export type DigitStyle = 'latin' | 'arabic';

export interface FormatOptions {
  lang: Language;
  digits: DigitStyle;
  currency: string; // ISO code
}

export function localizeDigits(input: string, opts: Pick<FormatOptions, 'lang' | 'digits'>): string {
  if (opts.lang !== 'ar' || opts.digits !== 'arabic') return input;
  return input.replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)]);
}

export function createFormatters(opts: FormatOptions) {
  const { lang } = opts;
  const D = (s: string) => localizeDigits(s, opts);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const number = (n: number, fractionDigits = 0) => {
    const fixed = n.toFixed(fractionDigits);
    const [int, frac] = fixed.split('.');
    const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return D(frac ? `${withSep}.${frac}` : withSep);
  };

  const currencySymbol = (code = opts.currency) => (code === 'ILS' ? '₪' : code === 'USD' ? '$' : code === 'JOD' ? (lang === 'ar' ? 'د.أ' : 'JOD') : code);

  const money = (amount: number, code = opts.currency) => {
    const value = number(amount, Number.isInteger(amount) ? 0 : 2);
    const sym = currencySymbol(code);
    return lang === 'ar' ? `${value} ${sym}` : `${sym}${value}`;
  };

  const percent = (ratio: number, fractionDigits = 0) => (lang === 'ar' ? `${number(ratio * 100, fractionDigits)}٪` : `${number(ratio * 100, fractionDigits)}%`);

  /** 17:30 → "5:30 PM" / "5:30 م" */
  const time = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const suffix = lang === 'ar' ? (h < 12 ? 'ص' : 'م') : h < 12 ? 'AM' : 'PM';
    return D(`${h12}:${pad(m)} ${suffix}`);
  };

  /** "17:30" HH:mm string → localized time */
  const clock = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date(2000, 0, 1, h, m);
    return time(d);
  };

  const timeRange = (start: Date, end: Date) => `${time(start)} – ${time(end)}`;

  const weekday = (d: Date | number, style: 'long' | 'short' | 'min' = 'long') => {
    const idx = typeof d === 'number' ? d : d.getDay();
    const table = style === 'long' ? WEEKDAYS : style === 'short' ? WEEKDAYS_SHORT : WEEKDAYS_MIN;
    return table[lang][idx];
  };

  const month = (d: Date | number, style: 'long' | 'short' = 'long') => {
    const idx = typeof d === 'number' ? d : d.getMonth();
    return (style === 'long' ? MONTHS : MONTHS_SHORT)[lang][idx];
  };

  /** "Tuesday, 3 December" / "الثلاثاء، 3 كانون الأول" */
  const dateLong = (d: Date) =>
    lang === 'ar'
      ? D(`${weekday(d)}، ${d.getDate()} ${month(d)}`)
      : `${weekday(d)}, ${D(String(d.getDate()))} ${month(d)}`;

  /** "3 Dec 2026" */
  const dateMedium = (d: Date) => D(`${d.getDate()} ${month(d, 'short')} ${d.getFullYear()}`);

  /** "3 Dec" */
  const dayMonth = (d: Date) => D(`${d.getDate()} ${month(d, 'short')}`);

  /** "Tue, 3 Dec" */
  const dateShort = (d: Date) => (lang === 'ar' ? D(`${weekday(d, 'short')}، ${d.getDate()} ${month(d, 'short')}`) : D(`${weekday(d, 'short')}, ${d.getDate()} ${month(d, 'short')}`));

  /** "Sat 19" / "سبت 19" — compact day label for narrow columns. */
  const dayShort = (d: Date) => D(`${weekday(d, 'short')} ${d.getDate()}`);

  /** "19/12" */
  const dateNumeric = (d: Date) => D(`${d.getDate()}/${d.getMonth() + 1}`);

  /**
   * Keep "+970 59 912 3456", "+12%" or codes in left-to-right order inside Arabic text.
   * Spaces become no-break spaces (bidi class CS) so digit groups form one number run, and the
   * whole string is wrapped in a left-to-right isolate for engines that honour it.
   */
  const ltr = (s: string) => `\u2066${s.replace(/ /g, '\u00A0')}\u2069`;

  /** "December 2026" */
  const monthYear = (d: Date) => D(`${month(d)} ${d.getFullYear()}`);

  /** 75 → "1h 15m" / "1 س 15 د" */
  const duration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (lang === 'ar') {
      if (h && m) return D(`${h} س ${m} د`);
      if (h) return D(`${h} س`);
      return D(`${m} د`);
    }
    if (h && m) return D(`${h}h ${m}m`);
    if (h) return D(`${h}h`);
    return D(`${m} min`);
  };

  /** Short relative time: "now", "5m ago", "in 2h", "3d ago" */
  const relative = (d: Date, now: Date) => {
    const diffMin = Math.round((d.getTime() - now.getTime()) / 60000);
    const abs = Math.abs(diffMin);
    const future = diffMin > 0;
    if (abs < 1) return lang === 'ar' ? 'الآن' : 'now';
    let value: string;
    if (abs < 60) value = lang === 'ar' ? `${abs} د` : `${abs}m`;
    else if (abs < 60 * 24) value = lang === 'ar' ? `${Math.round(abs / 60)} س` : `${Math.round(abs / 60)}h`;
    else value = lang === 'ar' ? `${Math.round(abs / 1440)} يوم` : `${Math.round(abs / 1440)}d`;
    value = D(value);
    if (lang === 'ar') return future ? `بعد ${value}` : `قبل ${value}`;
    return future ? `in ${value}` : `${value} ago`;
  };

  /** Phone display: "+970 59 912 3456" */
  const phone = (countryCode: string, national: string) => {
    const digits = national.replace(/\D/g, '');
    const grouped = digits.length === 9 ? `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}` : digits;
    // Phone numbers are always shown left-to-right with Latin digits; no-break spaces keep the
    // groups in order when the number sits inside right-to-left text.
    return `${countryCode} ${grouped}`.replace(/ /g, '\u00A0');
  };

  return { dayShort, dateNumeric, ltr, number, money, percent, currencySymbol, time, clock, timeRange, weekday, month, dateLong, dateMedium, dateShort, dayMonth, monthYear, duration, relative, phone, digits: D };
}

export type Formatters = ReturnType<typeof createFormatters>;
