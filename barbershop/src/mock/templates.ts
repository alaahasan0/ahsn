import type { MessageTemplate } from '@/types/models';

/**
 * Message templates. Variables: {{customer}}, {{salon}}, {{day}}, {{date}}, {{time}},
 * {{service}}, {{barber}}, {{link}}, {{policyHours}}.
 */
const at = new Date().toISOString();
let n = 0;
const tpl = (event: MessageTemplate['event'], channel: MessageTemplate['channel'], language: MessageTemplate['language'], body: string, active = true): MessageTemplate => ({
  id: `t${++n}`,
  event,
  channel,
  language,
  body,
  active,
  updatedAt: at,
});

export const templates: MessageTemplate[] = [
  tpl('booking_created', 'whatsapp', 'ar', 'مرحباً {{customer}}، تم تسجيل موعدك في {{salon}} يوم {{day}} الساعة {{time}} لخدمة {{service}}. يمكنك تأكيد الموعد أو تعديله أو إلغاؤه من خلال الرابط التالي:\n{{link}}'),
  tpl('booking_created', 'whatsapp', 'en', 'Hi {{customer}}, your appointment at {{salon}} is booked for {{day}} at {{time}} ({{service}}). Confirm, change or cancel here:\n{{link}}'),
  tpl('booking_created', 'sms', 'ar', '{{salon}}: موعدك {{day}} {{time}} - {{service}}. للتأكيد أو التعديل: {{link}}'),
  tpl('booking_created', 'sms', 'en', '{{salon}}: {{service}} on {{day}} {{time}}. Confirm or change: {{link}}'),
  tpl('confirmation_request', 'whatsapp', 'ar', 'أهلاً {{customer}} 👋 بنذكّرك بموعدك بكرا الساعة {{time}} مع {{barber}}. اضغط على الرابط لتأكيد حضورك:\n{{link}}'),
  tpl('confirmation_request', 'whatsapp', 'en', 'Hi {{customer}} 👋 please confirm your visit tomorrow at {{time}} with {{barber}}:\n{{link}}'),
  tpl('reminder', 'whatsapp', 'ar', 'تذكير: موعدك في {{salon}} اليوم الساعة {{time}}. منستناك! إذا بدك تعدّل: {{link}}'),
  tpl('reminder', 'whatsapp', 'en', 'Reminder: your appointment at {{salon}} is today at {{time}}. See you soon! Need to change it? {{link}}'),
  tpl('reminder', 'sms', 'ar', 'تذكير من {{salon}}: موعدك اليوم {{time}}.'),
  tpl('reminder', 'sms', 'en', '{{salon}} reminder: today at {{time}}.'),
  tpl('rescheduled', 'whatsapp', 'ar', 'تم تغيير موعدك إلى {{day}} الساعة {{time}}. تفاصيل الموعد: {{link}}'),
  tpl('rescheduled', 'whatsapp', 'en', 'Your appointment has moved to {{day}} at {{time}}. Details: {{link}}'),
  tpl('cancelled', 'whatsapp', 'ar', 'تم إلغاء موعدك يوم {{day}} الساعة {{time}}. منتمنى نشوفك قريباً — احجز من جديد: {{link}}'),
  tpl('cancelled', 'whatsapp', 'en', 'Your appointment on {{day}} at {{time}} was cancelled. Book again anytime: {{link}}'),
  tpl('no_show_followup', 'whatsapp', 'ar', 'افتقدناك اليوم يا {{customer}}. إذا حابب نحجزلك موعد ثاني، اختار الوقت المناسب من هون: {{link}}', false),
  tpl('no_show_followup', 'whatsapp', 'en', 'We missed you today, {{customer}}. Pick a new time that works for you: {{link}}', false),
  tpl('recurring_invitation', 'whatsapp', 'ar', 'صار وقت موعدك الدوري يا {{customer}} ✂️ حاجزينلك مبدئياً {{day}} الساعة {{time}} مع {{barber}}. أكّد من هون: {{link}}'),
  tpl('recurring_invitation', 'whatsapp', 'en', 'Time for your regular visit, {{customer}} ✂️ We’ve pencilled you in for {{day}} at {{time}} with {{barber}}. Confirm here: {{link}}'),
];
