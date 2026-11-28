import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import type { Service } from '@/types/models';

export function ServiceRow({ service, onPress, selected, showDescription, style, trailing }: { service: Service; onPress?: () => void; selected?: boolean; showDescription?: boolean; style?: StyleProp<ViewStyle>; trailing?: React.ReactNode }) {
  const { colors, radius } = useTheme();
  const { l, f } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityState={{ selected: !!selected }}
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: selected ? colors.accentSoft : colors.surface, borderWidth: 1.5, borderColor: selected ? colors.accent : colors.border, opacity: service.active ? 1 : 0.55 }, style]}
    >
      <View style={{ width: 40, height: 40, borderRadius: radius.sm, backgroundColor: selected ? colors.surface : colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={service.icon as IconName} size={18} color={selected ? colors.accent : colors.text} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" weight="semibold" numberOfLines={1}>
          {l(service.name)}
        </Text>
        <Text variant="footnote" tone="secondary" numberOfLines={showDescription ? 2 : 1}>
          {showDescription ? l(service.description) : f.duration(service.durationMin)}
        </Text>
        {showDescription ? (
          <Text variant="caption" tone="tertiary">
            {f.duration(service.durationMin)}
          </Text>
        ) : null}
      </View>
      {trailing ?? (
        <Text variant="headline" tabular>
          {f.money(service.price)}
        </Text>
      )}
      {selected ? <Icon name="check-circle" size={18} color={colors.accent} /> : null}
    </Pressable>
  );
}
