import { useRef } from 'react';
import { Pressable as RNPressable, TextInput, View, type TextInputInstance } from 'react-native';

import { Text } from '@/components/ui/Text';
import { fontFamilies, useTheme } from '@/theme';

/** Six-box one-time-code field. Always LTR. */
export function OtpInput({ value, onChange, length = 6, autoFocus }: { value: string; onChange: (v: string) => void; length?: number; autoFocus?: boolean }) {
  const { colors, radius } = useTheme();
  const ref = useRef<TextInputInstance>(null);
  return (
    <RNPressable onPress={() => ref.current?.focus()} accessibilityRole="none">
      <View style={{ flexDirection: 'row', direction: 'ltr', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length }).map((_, i) => {
          const active = i === value.length;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                maxWidth: 52,
                height: 58,
                borderRadius: radius.md,
                borderWidth: active ? 2 : 1,
                borderColor: active ? colors.accent : colors.border,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="title2" align="center" style={{ fontFamily: fontFamilies.latin.semibold }}>
                {value[i] ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        maxLength={length}
        testID="otp-input"
        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%' }}
      />
    </RNPressable>
  );
}
