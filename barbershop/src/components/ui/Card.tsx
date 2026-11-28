import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Pressable } from './Pressable';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outline' | 'muted' | 'accent' | 'ink';
  padding?: number;
  radius?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({ variant = 'elevated', padding = 16, radius: r, onPress, style, children, accessibilityLabel, ...rest }: CardProps) {
  const { colors, radius, shadow, isDark } = useTheme();
  const look: ViewStyle =
    variant === 'elevated'
      ? { backgroundColor: colors.surface, borderWidth: isDark ? 1 : 0, borderColor: colors.border, ...(isDark ? {} : shadow('sm')) }
      : variant === 'outline'
        ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
        : variant === 'muted'
          ? { backgroundColor: colors.surfaceMuted }
          : variant === 'accent'
            ? { backgroundColor: colors.accentSoft }
            : { backgroundColor: colors.ink };
  const s: StyleProp<ViewStyle> = [{ borderRadius: r ?? radius.lg, padding }, look, style];
  if (onPress)
    return (
      <Pressable onPress={onPress} feedback="scale" style={s} accessibilityLabel={accessibilityLabel} {...rest}>
        {children}
      </Pressable>
    );
  return (
    <View style={s} {...rest}>
      {children}
    </View>
  );
}
