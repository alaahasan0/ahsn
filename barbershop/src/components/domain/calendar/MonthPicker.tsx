import { useState } from 'react';
import { View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { addDays, addMonths, daysInMonth, isSameDay, startOfMonth } from '@/lib/dates';
import { useTheme } from '@/theme';

export interface MonthPickerProps {
  visible: boolean;
  onClose: () => void;
  value: Date;
  onChange: (d: Date) => void;
  /** Bookings count per day, for the density dot. */
  countFor?: (d: Date) => number;
  title?: string;
}

const WEEK_START = 6; // Saturday

/** Month grid date picker in a sheet. */
export function MonthPicker({ visible, onClose, value, onChange, countFor, title }: MonthPickerProps) {
  const { colors, radius } = useTheme();
  const { f, t } = useI18n();
  const [month, setMonth] = useState(startOfMonth(value));
  const first = startOfMonth(month);
  const lead = (first.getDay() - WEEK_START + 7) % 7;
  const total = daysInMonth(month);
  const cells: (Date | null)[] = [...Array.from({ length: lead }, () => null), ...Array.from({ length: total }, (_, i) => addDays(first, i))];
  while (cells.length % 7) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));

  return (
    <Sheet visible={visible} onClose={onClose} title={title ?? t('calendar.monthPicker')}>
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton icon="chevron-left" onPress={() => setMonth(addMonths(month, -1))} accessibilityLabel={t('calendar.previous')} />
          <Text variant="headline" align="center" style={{ flex: 1 }}>
            {f.monthYear(month)}
          </Text>
          <IconButton icon="chevron-right" onPress={() => setMonth(addMonths(month, 1))} accessibilityLabel={t('calendar.next')} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          {Array.from({ length: 7 }, (_, i) => (
            <Text key={i} variant="caption" tone="tertiary" align="center" style={{ flex: 1 }}>
              {f.weekday((WEEK_START + i) % 7, 'short')}
            </Text>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row' }}>
            {row.map((d, ci) => {
              if (!d) return <View key={ci} style={{ flex: 1, height: 46 }} />;
              const sel = isSameDay(d, value);
              const isToday = isSameDay(d, today());
              const count = countFor?.(d) ?? 0;
              return (
                <Pressable
                  key={ci}
                  haptic="selection"
                  onPress={() => {
                    onChange(d);
                    onClose();
                  }}
                  accessibilityLabel={f.dateLong(d)}
                  accessibilityState={{ selected: sel }}
                  style={{ flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' }}
                >
                  <View style={{ width: 38, height: 38, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.ink : isToday ? colors.accentSoft : 'transparent' }}>
                    <Text variant="callout" align="center" color={sel ? colors.inkText : isToday ? colors.accentOnSoft : colors.text} tabular>
                      {f.digits(String(d.getDate()))}
                    </Text>
                  </View>
                  <View style={{ position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2, backgroundColor: count > 0 ? (count > 20 ? colors.accent : colors.borderStrong) : 'transparent' }} />
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </Sheet>
  );
}
