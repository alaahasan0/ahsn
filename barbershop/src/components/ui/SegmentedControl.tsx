import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Pressable } from './Pressable';
import { Text } from './Text';

export interface Segment<T extends string> {
  value: T;
  label: string;
  badge?: number;
}

export function SegmentedControl<T extends string>({ segments, value, onChange, style, size = 'md' }: { segments: Segment<T>[]; value: T; onChange: (v: T) => void; style?: StyleProp<ViewStyle>; size?: 'sm' | 'md' }) {
  const { colors, radius, shadow, isDark } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 3 }, style]} accessibilityRole="tablist">
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <Pressable
            key={s.value}
            onPress={() => onChange(s.value)}
            haptic="selection"
            feedback="none"
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[
              { flex: 1, height: size === 'sm' ? 30 : 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
              active ? [{ backgroundColor: isDark ? colors.surfacePressed : colors.surface }, isDark ? null : shadow('sm')] : null,
            ]}
          >
            <Text variant={size === 'sm' ? 'caption' : 'subhead'} tone={active ? 'primary' : 'secondary'} numberOfLines={1}>
              {s.label}
            </Text>
            {s.badge ? (
              <View style={{ minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="caption" color={colors.accentText} style={{ fontSize: 10, lineHeight: 13 }}>
                  {s.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
