import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  dot?: boolean;
  /** Explicit colours (used by status badges). */
  fg?: string;
  bg?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'neutral', icon, dot, fg, bg, size = 'sm', style }: BadgeProps) {
  const { colors, radius } = useTheme();
  const tones: Record<BadgeTone, [string, string]> = {
    neutral: [colors.textSecondary, colors.surfaceMuted],
    accent: [colors.accentOnSoft, colors.accentSoft],
    success: [colors.success, colors.successSoft],
    warning: [colors.warning, colors.warningSoft],
    danger: [colors.danger, colors.dangerSoft],
    info: [colors.info, colors.infoSoft],
  };
  const [f, b] = [fg ?? tones[tone][0], bg ?? tones[tone][1]];
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: size === 'sm' ? 8 : 10, height: size === 'sm' ? 22 : 26, borderRadius: radius.pill, backgroundColor: b }, style]}>
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: f }} /> : null}
      {icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} color={f} /> : null}
      <Text variant="caption" color={f} numberOfLines={1} style={size === 'md' ? { fontSize: 13 } : undefined}>
        {label}
      </Text>
    </View>
  );
}
