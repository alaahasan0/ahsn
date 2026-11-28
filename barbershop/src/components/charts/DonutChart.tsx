import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme';

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
  children?: ReactNode;
  accessibilityLabel?: string;
}

/** Donut with small gaps between segments. Center slot for a total. */
export function DonutChart({ data, size = 140, thickness = 16, children, accessibilityLabel }: DonutChartProps) {
  const { colors } = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gap = data.filter((d) => d.value > 0).length > 1 ? 3 : 0;
  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={accessibilityLabel} accessibilityRole="image">
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceMuted} strokeWidth={thickness} fill="none" />
        {total > 0
          ? data.map((d) => {
              if (d.value <= 0) return null;
              const len = (d.value / total) * c;
              const seg = (
                <Circle
                  key={d.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={d.color}
                  strokeWidth={thickness}
                  fill="none"
                  strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += len;
              return seg;
            })
          : null}
      </Svg>
      {children}
    </View>
  );
}
