import { createFormatters } from '@/i18n/format';
import { today } from '@/lib/clock';
import { addDays, atClock } from '@/lib/dates';
import type { Barber, Customer, MessageTemplate, Salon, Service } from '@/types/models';

export const TEMPLATE_VARIABLES = ['customer', 'salon', 'day', 'date', 'time', 'service', 'barber', 'link', 'policyHours'] as const;
export type TemplateVariable = (typeof TEMPLATE_VARIABLES)[number];

/**
 * Fill a template with sample details in the template's own language (an Arabic
 * template previews in Arabic even when the app is in English).
 */
export function renderTemplate(tpl: Pick<MessageTemplate, 'body' | 'language'>, ctx: { salon: Salon; customer?: Customer; service?: Service; barber?: Barber }): string {
  const lang = tpl.language;
  const f = createFormatters({ lang, digits: 'latin', currency: ctx.salon.currency });
  const when = atClock(addDays(today(), 2), '17:30');
  const values: Record<TemplateVariable, string> = {
    customer: (ctx.customer?.name[lang] ?? (lang === 'ar' ? 'أحمد' : 'Ahmad')).split(' ')[0],
    salon: ctx.salon.name[lang],
    day: f.weekday(when),
    date: f.dayMonth(when),
    time: f.time(when),
    service: ctx.service?.name[lang] ?? '',
    barber: (ctx.barber?.name[lang] ?? '').split(' ')[0],
    link: 'barberhouse.app/m/k7Qm-29xT',
    policyHours: String(ctx.salon.cancellationPolicyHours),
  };
  return tpl.body.replace(/\{\{(\w+)\}\}/g, (m, key: string) => (key in values ? values[key as TemplateVariable] : m));
}

/** SMS segment estimate: GSM-7 (160/153) for Latin, UCS-2 (70/67) when Arabic or emoji is present. */
export function smsSegments(text: string): number {
  const unicode = /[^\u0000-\u007F]/.test(text);
  const single = unicode ? 70 : 160;
  const multi = unicode ? 67 : 153;
  if (text.length <= single) return 1;
  return Math.ceil(text.length / multi);
}
