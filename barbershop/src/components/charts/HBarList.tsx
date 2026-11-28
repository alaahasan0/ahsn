import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export interface HBarItem {
  key: string;
  label: string;
  value: number;
  valueLabel: string;
  caption?: string;
  color?: string;
  leading?: ReactNode;
}

/** Ranked horizontal bars (barber / service performance). */
export function HBarList({ items, max }: { items: HBarItem[]; max?: number }) {
  const { colors } = useTheme();
  const m = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <View style={{ gap: 14 }}>
      {items.map((it) => (
        <View key={it.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {it.leading}
          <View style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text variant="subhead" numberOfLines={1} style={{ flex: 1 }}>
                {it.label}
              </Text>
              <Text variant="subhead" tabular>
                {it.valueLabel}
              </Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, overflow: 'hidden' }}>
              <View style={{ width: `${(it.value / m) * 100}%`, height: '100%', borderRadius: 3, backgroundColor: it.color ?? colors.accent }} />
            </View>
            {it.caption ? (
              <Text variant="caption" tone="tertiary" numberOfLines={1}>
                {it.caption}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
