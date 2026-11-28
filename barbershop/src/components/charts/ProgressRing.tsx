import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme';

export interface ProgressRingProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  accessibilityLabel?: string;
}

/** Circular progress (occupancy, attendance). Starts at 12 o'clock and runs with reading direction. */
export function ProgressRing({ value, size = 72, stroke = 8, color, track, children, accessibilityLabel }: ProgressRingProps) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityRole="progressbar" accessibilityLabel={accessibilityLabel} accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? colors.surfaceMuted} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={color ?? colors.accent} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} />
      </Svg>
      {children}
    </View>
  );
}
