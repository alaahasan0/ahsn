import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { makeStyles, useStyles } from '@/theme';

import { Touchable } from './Touchable';

export type CardProps = ViewProps & {
  onPress?: () => void;
  onLongPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'surface' | 'alt' | 'outline' | 'tinted';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Card({ onPress, onLongPress, padding = 'md', variant = 'surface', style, children, accessibilityLabel, ...rest }: CardProps) {
  const s = useStyles(styles);
  const body = [s.base, s[variant], s[`p_${padding}` as const], style];
  if (onPress || onLongPress) {
    return (
      <Touchable onPress={onPress} onLongPress={onLongPress} feedback="highlight" pressedStyle={s.pressed} style={body} accessibilityLabel={accessibilityLabel}>
        {children}
      </Touchable>
    );
  }
  return (
    <View style={body} {...rest}>
      {children}
    </View>
  );
}

const styles = makeStyles((t) => ({
  base: { borderRadius: t.radii.lg, overflow: 'hidden' },
  surface: { backgroundColor: t.colors.surface, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  alt: { backgroundColor: t.colors.surfaceAlt },
  outline: { backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
  tinted: { backgroundColor: t.colors.accentSoft },
  pressed: { backgroundColor: t.colors.surfacePressed },
  p_none: { padding: 0 },
  p_sm: { padding: t.spacing.md },
  p_md: { padding: t.spacing.lg },
  p_lg: { padding: t.spacing.xl },
}));
