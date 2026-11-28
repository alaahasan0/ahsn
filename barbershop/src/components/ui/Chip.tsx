import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** Small colour dot before the label (status/barber colour). */
  dot?: string;
  count?: number;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected, onPress, icon, dot, count, size = 'md', style }: ChipProps) {
  const { colors, radius } = useTheme();
  const fg = selected ? colors.inkText : colors.text;
  return (
    <Pressable
      onPress={onPress}
      haptic="selection"
      accessibilityState={{ selected: !!selected }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          height: size === 'sm' ? 30 : 36,
          paddingHorizontal: size === 'sm' ? 10 : 14,
          borderRadius: radius.pill,
          backgroundColor: selected ? colors.ink : colors.surface,
          borderWidth: 1,
          borderColor: selected ? colors.ink : colors.border,
        },
        style,
      ]}
    >
      {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /> : null}
      {icon ? <Icon name={icon} size={14} color={fg} /> : null}
      <Text variant={size === 'sm' ? 'caption' : 'subhead'} color={fg} numberOfLines={1}>
        {label}
      </Text>
      {count !== undefined ? (
        <View style={{ minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, backgroundColor: selected ? colors.accent : colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="caption" color={selected ? colors.accentText : colors.textSecondary} style={{ fontSize: 11, lineHeight: 14 }}>
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Horizontally scrolling chip row with screen-edge padding. */
export function ChipRow({ children, style, contentPadding = 20 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; contentPadding?: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style} contentContainerStyle={{ gap: 8, paddingHorizontal: contentPadding }}>
      {children}
    </ScrollView>
  );
}
