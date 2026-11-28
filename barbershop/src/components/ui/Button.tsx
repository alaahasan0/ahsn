import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ink' | 'soft' | 'dangerSoft';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconEnd?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

const HEIGHT: Record<ButtonSize, number> = { sm: 36, md: 46, lg: 54 };

export function Button({ label, onPress, variant = 'primary', size = 'md', icon, iconEnd, loading, disabled, fullWidth, style, accessibilityLabel, testID }: ButtonProps) {
  const { colors, radius } = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.accent, fg: colors.accentText },
    ink: { bg: colors.ink, fg: colors.inkText },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.borderStrong },
    ghost: { bg: 'transparent', fg: colors.text },
    soft: { bg: colors.accentSoft, fg: colors.accentOnSoft },
    danger: { bg: colors.danger, fg: '#FFFFFF' },
    dangerSoft: { bg: colors.dangerSoft, fg: colors.danger },
  };
  const p = palette[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      testID={testID}
      onPress={isDisabled ? undefined : onPress}
      feedback="scale"
      haptic={variant === 'primary' || variant === 'ink' ? 'light' : 'none'}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={[
        styles.base,
        {
          height: HEIGHT[size],
          paddingHorizontal: size === 'sm' ? 14 : 20,
          borderRadius: size === 'sm' ? radius.sm : radius.md,
          backgroundColor: p.bg,
          borderWidth: p.border ? StyleSheet.hairlineWidth * 2 : 0,
          borderColor: p.border,
          opacity: isDisabled ? 0.45 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} color={p.fg} /> : null}
          <Text variant={size === 'sm' ? 'subhead' : 'headline'} color={p.fg} numberOfLines={1} align="center">
            {label}
          </Text>
          {iconEnd ? <Icon name={iconEnd} size={size === 'sm' ? 16 : 18} color={p.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
