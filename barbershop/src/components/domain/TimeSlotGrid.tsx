import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import type { SlotOption } from '@/store/availability';
import { useTheme } from '@/theme';

export interface TimeSlotGridProps {
  slots: SlotOption[];
  value?: Date;
  onChange: (slot: SlotOption) => void;
  /** Tapping a taken slot (for the "unavailable → alternatives" flow). */
  onUnavailablePress?: (slot: SlotOption) => void;
  /** Group by morning / afternoon / evening. */
  grouped?: boolean;
  columns?: number;
}

function chunk<T>(items: T[], size: number): (T | null)[][] {
  const rows: (T | null)[][] = [];
  for (let i = 0; i < items.length; i += size) {
    const row: (T | null)[] = items.slice(i, i + size);
    while (row.length < size) row.push(null);
    rows.push(row);
  }
  return rows;
}

/** Time slot picker. Unavailable slots stay visible (struck through) so staff see the shape of the day. */
export function TimeSlotGrid({ slots, value, onChange, onUnavailablePress, grouped = true, columns = 4 }: TimeSlotGridProps) {
  const { colors, radius } = useTheme();
  const { f, t } = useI18n();
  const groups = grouped
    ? [
        { key: 'morning', label: t('common.labels.morning'), items: slots.filter((s) => s.start.getHours() < 12) },
        { key: 'afternoon', label: t('common.labels.afternoon'), items: slots.filter((s) => s.start.getHours() >= 12 && s.start.getHours() < 17) },
        { key: 'evening', label: t('common.labels.evening'), items: slots.filter((s) => s.start.getHours() >= 17) },
      ].filter((g) => g.items.length)
    : [{ key: 'all', label: '', items: slots }];

  return (
    <View style={{ gap: 18 }}>
      {groups.map((g) => (
        <View key={g.key} style={{ gap: 10 }}>
          {g.label ? (
            <Text variant="overline" tone="tertiary">
              {g.label}
            </Text>
          ) : null}
          <View style={{ gap: 8 }}>
            {chunk(g.items, columns).map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: 8 }}>
                {row.map((s, ci) => {
                  if (!s) return <View key={`pad${ci}`} style={{ flex: 1 }} />;
                  const selected = value && value.getTime() === s.start.getTime();
                  const past = s.reason === 'past';
                  return (
                    <Pressable
                      key={s.start.getTime()}
                      haptic="selection"
                      onPress={() => (s.available ? onChange(s) : !past && onUnavailablePress?.(s))}
                      disabled={past}
                      accessibilityState={{ selected: !!selected, disabled: !s.available }}
                      accessibilityLabel={f.time(s.start)}
                      style={{
                        flex: 1,
                        height: 42,
                        borderRadius: radius.sm,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        gap: 4,
                        backgroundColor: selected ? colors.accent : s.available ? colors.surface : colors.surfaceMuted,
                        borderWidth: 1,
                        borderColor: selected ? colors.accent : s.available ? colors.border : 'transparent',
                        opacity: past ? 0.35 : 1,
                      }}
                    >
                      {!s.available && !past ? <Icon name="lock" size={11} color={colors.textTertiary} /> : null}
                      <Text
                        variant="subhead"
                        tabular
                        align="center"
                        numberOfLines={1}
                        color={selected ? colors.accentText : s.available ? colors.text : colors.textTertiary}
                        style={!s.available ? { textDecorationLine: 'line-through' } : undefined}
                      >
                        {f.time(s.start)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
