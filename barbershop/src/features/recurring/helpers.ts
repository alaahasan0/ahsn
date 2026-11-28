import type { I18n } from '@/i18n';
import type { RecurringSeries } from '@/types/models';

/** "Every 2 weeks · Tuesday · 5:30 PM" */
export function ruleText(s: Pick<RecurringSeries, 'frequency' | 'intervalWeeks' | 'weekday' | 'time'>, i18n: Pick<I18n, 't' | 'f'>): string {
  const { t, f } = i18n;
  const freq = s.frequency === 'custom' ? t('recurring.rule.custom', { count: s.intervalWeeks }) : t(`recurring.rule.${s.frequency}`);
  return `${freq} · ${f.weekday(s.weekday)} · ${f.clock(s.time)}`;
}
