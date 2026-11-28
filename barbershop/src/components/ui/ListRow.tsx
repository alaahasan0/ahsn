import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconColor?: string;
  iconBg?: string;
  leading?: ReactNode;
  value?: string;
  trailing?: ReactNode;
  chevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  testID?: string;
}

/** Settings-style row. Use inside <Section card>. */
export function ListRow({ title, subtitle, icon, iconColor, iconBg, leading, value, trailing, chevron, destructive, onPress, style, disabled, testID }: ListRowProps) {
  const { colors, radius } = useTheme();
  const content = (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, minHeight: 56, opacity: disabled ? 0.45 : 1 }, style]}>
      {icon ? (
        <View style={{ width: 32, height: 32, borderRadius: radius.sm, backgroundColor: iconBg ?? (destructive ? colors.dangerSoft : colors.surfaceMuted), alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={17} color={iconColor ?? (destructive ? colors.danger : colors.text)} />
        </View>
      ) : null}
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" weight="medium" tone={destructive ? 'danger' : 'primary'} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" tone="secondary" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="callout" tone="secondary" numberOfLines={1} style={{ maxWidth: '45%' }}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {chevron || (onPress && chevron !== false && !trailing) ? <Icon name="chevron-right" size={18} color={colors.textTertiary} /> : null}
    </View>
  );
  if (!onPress || disabled) return content;
  return (
    <Pressable onPress={onPress} feedback="opacity" testID={testID}>
      {content}
    </Pressable>
  );
}
