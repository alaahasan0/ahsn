import { useEffect, useRef } from 'react';
import { ScrollView, View, type ScrollViewInstance, type StyleProp, type ViewStyle } from 'react-native';

import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { addDays, isSameDay } from '@/lib/dates';
import { useTheme } from '@/theme';

export interface DateStripProps {
  value: Date;
  onChange: (d: Date) => void;
  start?: Date;
  days?: number;
  /** Optional dot indicator under days (e.g. has bookings). */
  marked?: (d: Date) => boolean;
  /** Disable days (closed/off). */
  disabled?: (d: Date) => boolean;
  style?: StyleProp<ViewStyle>;
  contentPadding?: number;
}

/** Horizontal scrolling day picker. */
export function DateStrip({ value, onChange, start = today(), days = 21, marked, disabled, style, contentPadding = 20 }: DateStripProps) {
  const { colors, radius } = useTheme();
  const { f, t } = useI18n();
  const ref = useRef<ScrollViewInstance>(null);
  const list = Array.from({ length: days }, (_, i) => addDays(start, i));
  const idx = list.findIndex((d) => isSameDay(d, value));

  useEffect(() => {
    if (idx > 3) ref.current?.scrollTo({ x: (idx - 2) * 60, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} style={style} contentContainerStyle={{ gap: 8, paddingHorizontal: contentPadding }}>
      {list.map((d) => {
        const selected = isSameDay(d, value);
        const isToday = isSameDay(d, today());
        const off = disabled?.(d);
        return (
          <Pressable
            key={d.toISOString()}
            onPress={() => !off && onChange(d)}
            haptic="selection"
            accessibilityState={{ selected, disabled: !!off }}
            accessibilityLabel={f.dateLong(d)}
            style={{ width: 52, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center', gap: 4, backgroundColor: selected ? colors.ink : colors.surface, borderWidth: 1, borderColor: selected ? colors.ink : colors.border, opacity: off ? 0.35 : 1 }}
          >
            <Text variant="caption" color={selected ? colors.inkText : colors.textTertiary} align="center" numberOfLines={1}>
              {isToday ? t('common.actions.today') : f.weekday(d, 'short')}
            </Text>
            <Text variant="title3" color={selected ? colors.inkText : colors.text} align="center" tabular>
              {f.digits(String(d.getDate()))}
            </Text>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: marked?.(d) ? (selected ? colors.accent : colors.accent) : 'transparent' }} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
