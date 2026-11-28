import { View } from 'react-native';

import { Text } from '@/components/ui/Text';

export function LegendItem({ color, label, value }: { color: string; label: string; value?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color }} />
      <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
        {label}
      </Text>
      {value ? (
        <Text variant="footnote" weight="semibold" tabular>
          {value}
        </Text>
      ) : null}
    </View>
  );
}
