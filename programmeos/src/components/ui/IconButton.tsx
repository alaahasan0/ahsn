import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Touchable } from './Touchable';

export type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  variant?: 'plain' | 'filled' | 'tinted' | 'primary' | 'outline';
  size?: number;
  iconSize?: number;
  tone?: 'default' | 'accent' | 'danger';
  accessibilityLabel: string;
  badge?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon, onPress, variant = 'plain', size = 36, iconSize, tone = 'default', accessibilityLabel, badge, disabled, style }: IconButtonProps) {
  const { colors } = useTheme();
  const bg = variant === 'filled' ? colors.surfaceAlt : variant === 'tinted' ? colors.accentSoft : variant === 'primary' ? colors.primary : variant === 'outline' ? colors.surface : 'transparent';
  const fg = variant === 'primary' ? colors.textOnAccent : tone === 'accent' || variant === 'tinted' ? colors.accentText : tone === 'danger' ? colors.dangerText : colors.text;
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      feedback="opacity"
      hitSlop={8}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}>
      <Icon name={icon} size={iconSize ?? Math.round(size * 0.55)} color={fg} strokeWidth={2} />
      {badge ? <View style={{ position: 'absolute', top: size * 0.14, right: size * 0.16, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.background }} /> : null}
    </Touchable>
  );
}
