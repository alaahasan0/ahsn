import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

/** Thin linear progress bar. */
export function ProgressBar({ value, color, track, height = 6, style }: { value: number; color?: string; track?: string; height?: number; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: track ?? colors.surfaceMuted, overflow: 'hidden' }, style]}>
      <View style={{ width: `${pct * 100}%`, height: '100%', borderRadius: height / 2, backgroundColor: color ?? colors.accent }} />
    </View>
  );
}

/** Segmented step indicator for multi-step flows. */
export function StepIndicator({ total, current, style }: { total: number; current: number; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', gap: 4 }, style]} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: current + 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= current ? colors.accent : colors.surfaceMuted }} />
      ))}
    </View>
  );
}
