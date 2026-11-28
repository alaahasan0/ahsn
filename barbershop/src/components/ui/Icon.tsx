import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

export type FeatherName = ComponentProps<typeof Feather>['name'];
export type IonName = ComponentProps<typeof Ionicons>['name'];
export type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Feather by default; prefix `ion:` for Ionicons or `mci:` for Material Community (brand marks, a few glyphs Feather lacks). */
export type IconName = FeatherName | `ion:${IonName}` | `mci:${MciName}`;

const DIRECTIONAL = new Set<string>(['chevron-right', 'chevron-left', 'arrow-right', 'arrow-left', 'chevrons-right', 'chevrons-left', 'corner-up-left', 'corner-up-right', 'corner-down-right', 'corner-down-left', 'log-out', 'log-in', 'send', 'skip-forward', 'skip-back', 'arrow-up-right', 'external-link', 'ion:chevron-forward', 'ion:chevron-back', 'ion:arrow-forward', 'ion:arrow-back', 'ion:send']);

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Mirror directional glyphs in RTL (default true). */
  autoFlip?: boolean;
  style?: StyleProp<TextStyle>;
}

export function Icon({ name, size = 20, color, autoFlip = true, style }: IconProps) {
  const { colors } = useTheme();
  const { isRTL } = useI18n();
  const flip = autoFlip && isRTL && DIRECTIONAL.has(name);
  const s: StyleProp<TextStyle> = [flip ? { transform: [{ scaleX: -1 }] } : null, style];
  const c = color ?? colors.text;
  if (name.startsWith('ion:')) return <Ionicons name={name.slice(4) as IonName} size={size} color={c} style={s} />;
  if (name.startsWith('mci:')) return <MaterialCommunityIcons name={name.slice(4) as MciName} size={size} color={c} style={s} />;
  return <Feather name={name as FeatherName} size={size} color={c} style={s} />;
}
