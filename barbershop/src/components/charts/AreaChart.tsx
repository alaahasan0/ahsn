import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

export interface AreaChartProps {
  values: number[];
  /** Optional comparison series (previous period), drawn dashed. */
  compare?: number[];
  labels?: string[];
  height?: number;
  color?: string;
  labelEvery?: number;
  accessibilityLabel?: string;
}

function buildPath(values: number[], w: number, h: number, max: number, pad = 6) {
  if (values.length === 0) return { line: '', area: '', points: [] as [number, number][] };
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const points = values.map((v, i) => [i * step, pad + (h - pad * 2) * (1 - v / max)] as [number, number]);
  let line = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cx = (x0 + x1) / 2;
    line += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  const area = `${line} L ${points[points.length - 1][0]} ${h} L 0 ${h} Z`;
  return { line, area, points };
}

/** Smooth area chart. Mirrored in RTL so time runs in the reading direction. */
export function AreaChart({ values, compare, labels, height = 150, color, labelEvery = 1, accessibilityLabel }: AreaChartProps) {
  const { colors } = useTheme();
  const { isRTL } = useI18n();
  const [w, setW] = useState(0);
  const stroke = color ?? colors.accent;
  const max = Math.max(1, ...values, ...(compare ?? [])) * 1.08;
  const main = buildPath(values, w, height, max);
  const prev = compare ? buildPath(compare, w, height, max) : null;
  const last = main.points[main.points.length - 1];
  return (
    <View accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ gap: 8 }}>
      <View style={{ height }} onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}>
        {w > 0 ? (
          <Svg width={w} height={height} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
            <Defs>
              <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={stroke} stopOpacity={0.22} />
                <Stop offset="1" stopColor={stroke} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            {[0.25, 0.5, 0.75].map((p) => (
              <Line key={p} x1={0} x2={w} y1={height * p} y2={height * p} stroke={colors.separator} strokeWidth={1} />
            ))}
            {prev ? <Path d={prev.line} stroke={colors.textTertiary} strokeWidth={1.5} strokeDasharray="4 4" fill="none" /> : null}
            <Path d={main.area} fill="url(#area)" />
            <Path d={main.line} stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            {last ? <Circle cx={last[0]} cy={last[1]} r={4} fill={colors.surface} stroke={stroke} strokeWidth={2.5} /> : null}
          </Svg>
        ) : null}
      </View>
      {labels ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {labels.map((l, i) =>
            i % labelEvery === 0 || i === labels.length - 1 ? (
              <Text key={i} variant="caption" tone="tertiary" style={{ fontSize: 10 }}>
                {l}
              </Text>
            ) : null,
          )}
        </View>
      ) : null}
    </View>
  );
}
