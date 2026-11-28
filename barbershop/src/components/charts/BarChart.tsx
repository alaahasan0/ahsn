import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  highlight?: boolean;
}

export interface BarChartProps {
  data: BarDatum[];
  height?: number;
  color?: string;
  /** Show a label under every Nth bar (crowded ranges). */
  labelEvery?: number;
  formatValue?: (v: number) => string;
  showValues?: boolean;
  accessibilityLabel?: string;
}

/** Vertical bar chart from Views. Bars follow reading direction (RTL: time runs right→left). */
export function BarChart({ data, height = 140, color, labelEvery = 1, formatValue, showValues, accessibilityLabel }: BarChartProps) {
  const { colors, radius } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.value));
  const barColor = color ?? colors.accent;
  return (
    <View accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ gap: 8 }}>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: data.length > 20 ? 2 : 6 }}>
        {data.map((d) => (
          <View key={d.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 4 }}>
            {showValues && d.value > 0 ? (
              <Text variant="caption" tone="tertiary" align="center" numberOfLines={1} style={{ fontSize: 10 }}>
                {formatValue ? formatValue(d.value) : d.value}
              </Text>
            ) : null}
            <View
              style={{
                width: '100%',
                maxWidth: 28,
                height: `${Math.max(d.value > 0 ? 3 : 1.5, (d.value / max) * (showValues ? 82 : 100))}%`,
                borderRadius: data.length > 20 ? 2 : radius.xs,
                backgroundColor: d.value === 0 ? colors.surfaceMuted : d.highlight ? barColor : `${barColor}${d.highlight === false ? '55' : ''}`,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: data.length > 20 ? 2 : 6 }}>
        {data.map((d, i) => (
          <View key={d.key} style={{ flex: 1, alignItems: 'center' }}>
            {i % labelEvery === 0 ? (
              <Text variant="caption" tone="tertiary" align="center" numberOfLines={1} style={{ fontSize: 10, width: 44 }}>
                {d.label}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}
