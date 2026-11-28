import Svg, { Path } from 'react-native-svg';

import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** Tiny trend line for stat cards. */
export function Sparkline({ values, width = 64, height = 24, color }: { values: number[]; width?: number; height?: number; color?: string }) {
  const { colors } = useTheme();
  const { isRTL } = useI18n();
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const step = width / (values.length - 1);
  const y = (v: number) => height - 2 - ((v - min) / (max - min || 1)) * (height - 4);
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${y(v)}`).join(' ');
  return (
    <Svg width={width} height={height} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
      <Path d={d} stroke={color ?? colors.accent} strokeWidth={1.75} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
