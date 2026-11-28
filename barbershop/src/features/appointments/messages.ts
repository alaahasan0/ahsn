import { createFormatters } from '@/i18n/format';
import type { Barber, CommunicationChannel, Customer, MessageTemplate, Salon, Service, TemplateEvent } from '@/types/models';

export interface MessageContext {
  salon: Salon;
  customer?: Customer;
  service?: Service;
  barber?: Barber;
  start?: Date;
  link: string;
}

/** Pick the best template for an event / channel / language (falls back across channel then language). */
export function pickTemplate(templates: MessageTemplate[], event: TemplateEvent, channel: CommunicationChannel, language: 'ar' | 'en'): MessageTemplate | undefined {
  const ch = channel === 'sms' ? 'sms' : 'whatsapp';
  return (
    templates.find((t) => t.event === event && t.channel === ch && t.language === language) ??
    templates.find((t) => t.event === event && t.channel === 'whatsapp' && t.language === language) ??
    templates.find((t) => t.event === event)
  );
}

/** Fill `{{variables}}` in a template, formatting in the template's own language. */
export function renderMessage(body: string, language: 'ar' | 'en', ctx: MessageContext): string {
  const f = createFormatters({ lang: language, digits: 'latin', currency: ctx.salon.currency });
  const first = (s?: string) => (s ?? '').split(' ')[0];
  const vars: Record<string, string> = {
    customer: first(ctx.customer?.name[language]),
    salon: ctx.salon.name[language],
    day: ctx.start ? f.weekday(ctx.start) : '',
    date: ctx.start ? f.dateLong(ctx.start) : '',
    time: ctx.start ? f.time(ctx.start) : '',
    service: ctx.service?.name[language] ?? '',
    barber: first(ctx.barber?.name[language]),
    // Keep URLs left-to-right inside Arabic text.
    link: language === 'ar' ? `\u2066${ctx.link}\u2069` : ctx.link,
    policyHours: String(ctx.salon.cancellationPolicyHours),
  };
  return body.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? `{{${k}}}`);
}

export const linkUrl = (token: string) => `barberhouse.ps/m/${token}`;
