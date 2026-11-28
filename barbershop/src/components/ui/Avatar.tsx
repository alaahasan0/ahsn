import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface AvatarProps {
  name?: string;
  /** Pre-computed initials (e.g. Arabic single letter). */
  initials?: string;
  color?: string;
  size?: number;
  icon?: IconName;
  ring?: string;
  style?: StyleProp<ViewStyle>;
}

export function initialsOf(name = ''): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  // Arabic names: a single initial reads more naturally.
  if (/[؀-ۿ]/.test(parts[0])) return parts[0][0];
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

/** Stable soft colour from a string so customers keep their avatar tint. */
export function toneFor(seed: string, isDark: boolean): { bg: string; fg: string } {
  const hues = [18, 32, 150, 200, 220, 260, 330, 0, 95, 175];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = hues[h % hues.length];
  return isDark ? { bg: `hsl(${hue}, 22%, 22%)`, fg: `hsl(${hue}, 45%, 78%)` } : { bg: `hsl(${hue}, 38%, 92%)`, fg: `hsl(${hue}, 40%, 32%)` };
}

export function Avatar({ name, initials, color, size = 40, icon, ring, style }: AvatarProps) {
  const { isDark } = useTheme();
  const tone = color ? { bg: color, fg: '#FFFFFF' } : toneFor(name ?? '', isDark);
  const label = initials ?? initialsOf(name);
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tone.bg, alignItems: 'center', justifyContent: 'center' },
        ring ? { borderWidth: 2, borderColor: ring } : null,
        style,
      ]}
    >
      {icon ? (
        <Icon name={icon} size={size * 0.45} color={tone.fg} />
      ) : (
        <Text variant="subhead" color={tone.fg} weight="semibold" align="center" style={{ fontSize: size * 0.36, lineHeight: size * 0.5 }}>
          {label}
        </Text>
      )}
    </View>
  );
}
