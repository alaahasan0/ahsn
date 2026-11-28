import { View } from 'react-native';

import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { clockToMinutes } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { DaySchedule, Weekday, WeeklySchedule } from '@/types/models';

import { TimeChip, WEEK_ORDER } from './controls';

export function weeklyHours(s: WeeklySchedule): number {
  return WEEK_ORDER.reduce<number>((sum, d) => {
    const day = s[d];
    if (!day.enabled) return sum;
    const breaks = day.breaks.reduce((b, br) => b + clockToMinutes(br.end) - clockToMinutes(br.start), 0);
    return sum + (clockToMinutes(day.end) - clockToMinutes(day.start) - breaks) / 60;
  }, 0);
}

/**
 * Per-day editor: open/closed switch, opening and closing time, breaks.
 * Reusable by availability, team hours and onboarding.
 */
export function WeeklyScheduleEditor({ value, onChange, bounds }: { value: WeeklySchedule; onChange: (s: WeeklySchedule) => void; /** Optional salon hours, used to show closed salon days. */ bounds?: WeeklySchedule }) {
  const { colors, radius, shadow, isDark } = useTheme();
  const { t, f } = useI18n();
  const toast = useToast();
  const setDay = (d: Weekday, patch: Partial<DaySchedule>) => onChange({ ...value, [d]: { ...value[d], ...patch } });

  const copyToAll = (d: Weekday) => {
    const src = value[d];
    const next = { ...value };
    WEEK_ORDER.forEach((k) => {
      if (k !== d && next[k].enabled) next[k] = { ...src, breaks: src.breaks.map((b) => ({ ...b })) };
    });
    onChange(next);
    toast(t('availability.editor.copied'));
  };

  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: isDark ? 1 : 0, borderColor: colors.border }, isDark ? null : shadow('sm')]}>
      {WEEK_ORDER.map((d, i) => {
        const day = value[d];
        const salonClosed = bounds && !bounds[d].enabled;
        return (
          <View key={d}>
            {i > 0 ? <Divider inset={16} /> : null}
            <View style={{ padding: 14, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text variant="callout" weight="semibold" style={{ width: 92 }} numberOfLines={1}>
                  {f.weekday(d)}
                </Text>
                {day.enabled ? (
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <TimeChip value={day.start} label={t('availability.editor.opens')} onChange={(v) => setDay(d, { start: v })} />
                    <Text variant="footnote" tone="tertiary">
                      –
                    </Text>
                    <TimeChip value={day.end} label={t('availability.editor.closes')} onChange={(v) => setDay(d, { end: v })} />
                  </View>
                ) : (
                  <Text variant="callout" tone="tertiary" style={{ flex: 1 }}>
                    {t('availability.editor.closed')}
                  </Text>
                )}
                <Switch value={day.enabled} onValueChange={(v) => setDay(d, { enabled: v })} accessibilityLabel={f.weekday(d)} disabled={salonClosed && !day.enabled} />
              </View>
              {day.enabled ? (
                <View style={{ gap: 8, paddingStart: 102 }}>
                  {day.breaks.map((b, bi) => (
                    <View key={bi} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Icon name="coffee" size={14} color={colors.textTertiary} />
                      <TimeChip value={b.start} label={t('availability.editor.break')} onChange={(v) => setDay(d, { breaks: day.breaks.map((x, k) => (k === bi ? { ...x, start: v } : x)) })} />
                      <Text variant="footnote" tone="tertiary">
                        –
                      </Text>
                      <TimeChip value={b.end} label={t('availability.editor.break')} onChange={(v) => setDay(d, { breaks: day.breaks.map((x, k) => (k === bi ? { ...x, end: v } : x)) })} />
                      <IconButton icon="x" size={30} iconSize={14} accessibilityLabel={t('common.actions.remove')} onPress={() => setDay(d, { breaks: day.breaks.filter((_, k) => k !== bi) })} />
                    </View>
                  ))}
                  <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
                    <Pressable onPress={() => setDay(d, { breaks: [...day.breaks, { start: '13:00', end: '13:30' }] })} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="plus" size={14} color={colors.accent} />
                      <Text variant="footnote" tone="accent">
                        {t('availability.editor.addBreak')}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => copyToAll(d)} hitSlop={6} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="copy" size={13} color={colors.textSecondary} />
                      <Text variant="footnote" tone="secondary">
                        {t('availability.editor.copyToAll')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default WeeklyScheduleEditor;
