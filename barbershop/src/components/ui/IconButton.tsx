import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export interface IconButtonProps {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  variant?: 'plain' | 'filled' | 'outline' | 'accent' | 'ink';
  size?: number;
  iconSize?: number;
  color?: string;
  badge?: number | boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function IconButton({ icon, onPress, accessibilityLabel, variant = 'plain', size = 40, iconSize = 20, color, badge, style, disabled }: IconButtonProps) {
  const { colors } = useTheme();
  const bg = variant === 'filled' ? colors.surfaceMuted : variant === 'outline' ? colors.surface : variant === 'accent' ? colors.accent : variant === 'ink' ? colors.ink : 'transparent';
  const fg = color ?? (variant === 'accent' ? colors.accentText : variant === 'ink' ? colors.inkText : colors.text);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
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
      ]}
    >
      <Icon name={icon} size={iconSize} color={fg} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: typeof badge === 'number' ? 2 : 8,
            end: typeof badge === 'number' ? 0 : 9,
            minWidth: typeof badge === 'number' ? 18 : 8,
            height: typeof badge === 'number' ? 18 : 8,
            borderRadius: 9,
            paddingHorizontal: typeof badge === 'number' ? 4 : 0,
            backgroundColor: colors.danger,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.background,
          }}
        >
          {typeof badge === 'number' ? (
            <Text variant="caption" color="#fff" style={{ fontSize: 10, lineHeight: 12 }} align="center">
              {badge > 99 ? '99+' : badge}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
