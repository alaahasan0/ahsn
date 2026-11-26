import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, useStyles, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { Touchable } from './Touchable';

export type ButtonVariant = 'primary' | 'secondary' | 'tinted' | 'plain' | 'destructive' | 'destructiveTinted' | 'success';
export type ButtonSize = 'lg' | 'md' | 'sm';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Button({ title, onPress, variant = 'primary', size = 'md', icon, iconRight, loading, disabled, fullWidth, style, accessibilityLabel }: ButtonProps) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.textOnAccent },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.borderStrong },
    tinted: { bg: colors.accentSoft, fg: colors.accentText },
    plain: { bg: 'transparent', fg: colors.accentText },
    destructive: { bg: colors.danger, fg: '#FFFFFF' },
    destructiveTinted: { bg: colors.dangerSoft, fg: colors.dangerText },
    success: { bg: colors.successSoft, fg: colors.successText },
  };
  const p = palette[variant];
  const iconSize = size === 'sm' ? 15 : 17;
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled || loading}
      feedback="scale"
      haptic={variant === 'primary' || variant === 'destructive' ? 'light' : false}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[
        s.base,
        s[size],
        { backgroundColor: p.bg, borderColor: p.border ?? 'transparent', borderWidth: p.border ? StyleSheet.hairlineWidth * 2 : 0 },
        fullWidth && s.full,
        (disabled || loading) && s.disabled,
        variant === 'plain' && s.plain,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={p.fg} />
      ) : (
        <View style={s.row}>
          {icon ? <Icon name={icon} size={iconSize} color={p.fg} strokeWidth={2.1} /> : null}
          <Text variant={size === 'sm' ? 'label' : 'headline'} color={p.fg} numberOfLines={1}>
            {title}
          </Text>
          {iconRight ? <Icon name={iconRight} size={iconSize} color={p.fg} strokeWidth={2.1} /> : null}
        </View>
      )}
    </Touchable>
  );
}

const styles = makeStyles((t) => ({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: t.radii.md },
  lg: { minHeight: 50, paddingHorizontal: t.spacing.xl, borderRadius: 14 },
  md: { minHeight: 44, paddingHorizontal: t.spacing.lg },
  sm: { minHeight: 34, paddingHorizontal: t.spacing.md, borderRadius: t.radii.sm },
  full: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  plain: { paddingHorizontal: t.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
}));
