import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon, Pressable, Text, type IconName } from '@/components/ui';
import { useTheme } from '@/theme';

/** Radio-style selectable card used by language / appearance / policy pickers. */
export function OptionCard({ title, subtitle, selected, onPress, icon, trailing }: { title: string; subtitle?: string; selected: boolean; onPress: () => void; icon?: IconName; trailing?: ReactNode }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      haptic="selection"
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radius.lg, backgroundColor: selected ? colors.accentSoft : colors.surface, borderWidth: 1.5, borderColor: selected ? colors.accent : colors.border }}
    >
      {icon ? <Icon name={icon} size={20} color={selected ? colors.accent : colors.text} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" weight="semibold">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? colors.accent : colors.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
        {selected ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent }} /> : null}
      </View>
    </Pressable>
  );
}
