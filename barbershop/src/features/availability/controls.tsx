/** Small form controls shared by CRM, team, availability and recurring screens. */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Sheet } from '@/components/ui/Sheet';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { addDays, addMonths, isSameDay, minutesToClock, clockToMinutes, startOfMonth, daysInMonth } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { ClockTime, Weekday } from '@/types/models';

/** Saturday-first week, as most Palestinian salons plan it. */
export const WEEK_ORDER: Weekday[] = [6, 0, 1, 2, 3, 4, 5];

export function FieldLabel({ label, hint, right }: { label: string; hint?: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="subhead" tone="secondary">
          {label}
        </Text>
        {hint ? (
          <Text variant="footnote" tone="tertiary">
            {hint}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

/** Row with a title, optional hint and a switch. */
export function ToggleRow({ title, hint, value, onChange, icon }: { title: string; hint?: string; value: boolean; onChange: (v: boolean) => void; icon?: IconName }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable onPress={() => onChange(!value)} feedback="none" accessibilityRole="switch" accessibilityState={{ checked: value }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 }}>
      {icon ? (
        <View style={{ width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={16} color={colors.text} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" weight="medium">
          {title}
        </Text>
        {hint ? (
          <Text variant="footnote" tone="secondary">
            {hint}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={title} />
    </Pressable>
  );
}

/** Numeric stepper with − / + buttons. `format` renders the value (e.g. duration, money). */
export function Stepper({ value, onChange, step = 1, min = 0, max = 9999, format }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; format?: (v: number) => string }) {
  const { colors, radius } = useTheme();
  const { t, f } = useI18n();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 4 }}>
      <IconButton icon="minus" size={40} iconSize={18} accessibilityLabel={t('common.actions.remove')} disabled={value - step < min} onPress={() => onChange(Math.max(min, value - step))} />
      <Text variant="headline" tabular align="center" style={{ flex: 1 }}>
        {format ? format(value) : f.number(value)}
      </Text>
      <IconButton icon="plus" size={40} iconSize={18} accessibilityLabel={t('common.actions.add')} disabled={value + step > max} onPress={() => onChange(Math.min(max, value + step))} />
    </View>
  );
}

/** Pill-shaped field that opens a picker. */
export function PickerField({ label, value, placeholder, icon, onPress, compact }: { label?: string; value?: string; placeholder?: string; icon?: IconName; onPress: () => void; compact?: boolean }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ gap: 6, flex: compact ? 1 : undefined }}>
      {label ? (
        <Text variant="subhead" tone="secondary">
          {label}
        </Text>
      ) : null}
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 14 }}>
        {icon ? <Icon name={icon} size={17} color={colors.textTertiary} /> : null}
        <Text variant="callout" tone={value ? 'primary' : 'tertiary'} numberOfLines={1} style={{ flex: 1 }} tabular>
          {value ?? placeholder}
        </Text>
        <Icon name="chevron-down" size={16} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

/** Time picker sheet: 15-minute grid. */
export function TimePickerSheet({ visible, onClose, value, onSelect, from = '06:00', to = '23:45', title }: { visible: boolean; onClose: () => void; value?: ClockTime; onSelect: (t: ClockTime) => void; from?: ClockTime; to?: ClockTime; title?: string }) {
  const { colors, radius } = useTheme();
  const { f, t } = useI18n();
  const times = useMemo(() => {
    const out: ClockTime[] = [];
    for (let m = clockToMinutes(from); m <= clockToMinutes(to); m += 15) out.push(minutesToClock(m));
    return out;
  }, [from, to]);
  const rows: ClockTime[][] = [];
  for (let i = 0; i < times.length; i += 4) rows.push(times.slice(i, i + 4));
  return (
    <Sheet visible={visible} onClose={onClose} title={title ?? t('availability.editor.pickTime')}>
      <View style={{ gap: 8 }}>
        {rows.map((row, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
            {row.map((tm) => {
              const sel = tm === value;
              return (
                <Pressable
                  key={tm}
                  haptic="selection"
                  onPress={() => {
                    onSelect(tm);
                    onClose();
                  }}
                  style={{ flex: 1, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.accent : colors.surfaceMuted }}
                >
                  <Text variant="subhead" tabular align="center" color={sel ? colors.accentText : colors.text}>
                    {f.clock(tm)}
                  </Text>
                </Pressable>
              );
            })}
            {row.length < 4 ? Array.from({ length: 4 - row.length }).map((_, k) => <View key={k} style={{ flex: 1 }} />) : null}
          </View>
        ))}
      </View>
    </Sheet>
  );
}

/** Compact time chip that opens the time sheet. */
export function TimeChip({ value, onChange, label, from, to }: { value: ClockTime; onChange: (t: ClockTime) => void; label?: string; from?: ClockTime; to?: ClockTime }) {
  const { colors, radius } = useTheme();
  const { f } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityLabel={label} style={{ paddingHorizontal: 12, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="subhead" tabular>
          {f.clock(value)}
        </Text>
      </Pressable>
      <TimePickerSheet visible={open} onClose={() => setOpen(false)} value={value} onSelect={onChange} title={label} from={from} to={to} />
    </>
  );
}

/** Month calendar in a sheet. */
export function DatePickerSheet({ visible, onClose, value, onSelect, minDate, title, isDisabled }: { visible: boolean; onClose: () => void; value?: Date; onSelect: (d: Date) => void; minDate?: Date; title?: string; isDisabled?: (d: Date) => boolean }) {
  const { colors, radius } = useTheme();
  const { f, t } = useI18n();
  const [month, setMonth] = useState(startOfMonth(value ?? today()));
  useEffect(() => {
    if (visible) setMonth(startOfMonth(value ?? today()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  const lead = (month.getDay() - 6 + 7) % 7;
  const cells: (Date | null)[] = [...Array.from({ length: lead }, () => null), ...Array.from({ length: daysInMonth(month) }, (_, i) => addDays(month, i))];
  while (cells.length % 7) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return (
    <Sheet visible={visible} onClose={onClose} title={title ?? t('availability.datePicker.title')}>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="chevron-left" accessibilityLabel={t('common.actions.back')} onPress={() => setMonth(addMonths(month, -1))} />
          <Text variant="headline" align="center" style={{ flex: 1 }}>
            {f.monthYear(month)}
          </Text>
          <IconButton icon="chevron-right" accessibilityLabel={t('common.actions.next')} onPress={() => setMonth(addMonths(month, 1))} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          {WEEK_ORDER.map((d) => (
            <Text key={d} variant="caption" tone="tertiary" align="center" style={{ flex: 1 }}>
              {f.weekday(d, 'short')}
            </Text>
          ))}
        </View>
        {weeks.map((w, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 4 }}>
            {w.map((d, j) => {
              if (!d) return <View key={j} style={{ flex: 1, height: 42 }} />;
              const disabled = (minDate && d < minDate) || isDisabled?.(d);
              const sel = value && isSameDay(d, value);
              const isToday = isSameDay(d, today());
              return (
                <Pressable
                  key={j}
                  disabled={!!disabled}
                  haptic="selection"
                  onPress={() => {
                    onSelect(d);
                    onClose();
                  }}
                  style={{ flex: 1, height: 42, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.accent : 'transparent', borderWidth: isToday && !sel ? 1 : 0, borderColor: colors.borderStrong, opacity: disabled ? 0.3 : 1 }}
                >
                  <Text variant="callout" tabular align="center" color={sel ? colors.accentText : colors.text}>
                    {f.digits(String(d.getDate()))}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </Sheet>
  );
}

/** Field showing a date that opens the month picker. */
export function DateField({ label, value, onChange, minDate, placeholder, isDisabled }: { label?: string; value?: Date; onChange: (d: Date) => void; minDate?: Date; placeholder?: string; isDisabled?: (d: Date) => boolean }) {
  const { f, t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <PickerField label={label} icon="calendar" value={value ? f.dateLong(value) : undefined} placeholder={placeholder ?? t('availability.datePicker.title')} onPress={() => setOpen(true)} />
      <DatePickerSheet visible={open} onClose={() => setOpen(false)} value={value} onSelect={onChange} minDate={minDate} isDisabled={isDisabled} title={label} />
    </>
  );
}

/** Chip grid for picking options (wraps). */
export function OptionGrid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>;
}

export function HScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {children}
    </ScrollView>
  );
}
