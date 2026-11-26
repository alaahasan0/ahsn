import { useTheme } from '@/theme';

import { iconRegistry, type IconName } from './icon-registry';
import type { TextTone } from './Text';

export type { IconName };

const toneColor = (tone: TextTone | undefined, c: ReturnType<typeof useTheme>['colors']) => {
  switch (tone) {
    case 'secondary':
      return c.textSecondary;
    case 'tertiary':
      return c.textTertiary;
    case 'accent':
      return c.accent;
    case 'success':
      return c.success;
    case 'warning':
      return c.warning;
    case 'danger':
      return c.danger;
    case 'info':
      return c.info;
    case 'violet':
      return c.violet;
    case 'onAccent':
      return c.textOnAccent;
    case 'inverse':
      return c.textInverse;
    case 'neutral':
      return c.neutral;
    default:
      return c.text;
  }
};

export type IconProps = {
  name: IconName;
  size?: number;
  tone?: TextTone;
  color?: string;
  strokeWidth?: number;
  fill?: string;
};

export function Icon({ name, size = 20, tone, color, strokeWidth = 1.9, fill }: IconProps) {
  const { colors } = useTheme();
  const Cmp = iconRegistry[name];
  return <Cmp size={size} color={color ?? toneColor(tone, colors)} strokeWidth={strokeWidth} fill={fill ?? 'none'} />;
}
