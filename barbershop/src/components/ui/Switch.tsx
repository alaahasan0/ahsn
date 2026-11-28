import { Platform, Switch as RNSwitch } from 'react-native';

import { useTheme } from '@/theme';

export function Switch({ value, onValueChange, disabled, accessibilityLabel }: { value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean; accessibilityLabel?: string }) {
  const { colors } = useTheme();
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: colors.borderStrong, true: colors.accent }}
      thumbColor={Platform.OS === 'android' ? (value ? '#fff' : colors.surface) : undefined}
      {...(Platform.OS === 'web' ? ({ activeThumbColor: '#fff' } as object) : null)}
    />
  );
}
