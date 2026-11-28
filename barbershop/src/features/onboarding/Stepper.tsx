import { View } from 'react-native';

import { IconButton, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** − value + control. Numbers are laid out LTR for clarity. */
export function MiniStepper({ value, onChange, step, min = 0, max = 999, format }: { value: number; onChange: (v: number) => void; step: number; min?: number; max?: number; format: (v: number) => string }) {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, paddingHorizontal: 2 }}>
      <IconButton icon="minus" size={28} iconSize={14} onPress={() => onChange(Math.max(min, value - step))} accessibilityLabel={`${t('common.actions.remove')} ${step}`} disabled={value <= min} />
      <Text variant="subhead" tabular align="center" style={{ minWidth: 56 }}>
        {format(value)}
      </Text>
      <IconButton icon="plus" size={28} iconSize={14} onPress={() => onChange(Math.min(max, value + step))} accessibilityLabel={`${t('common.actions.add')} ${step}`} disabled={value >= max} />
    </View>
  );
}
