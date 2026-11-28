import { useRef } from 'react';
import { TextInput, View, type TextInputInstance } from 'react-native';

import { Pressable, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { fontFamilies, useTheme } from '@/theme';

/** Six-box one-time-code field. Digits are always LTR. A single hidden input drives the boxes. */
export function OtpInput({ value, onChange, length = 6, error }: { value: string; onChange: (v: string) => void; length?: number; error?: boolean }) {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const ref = useRef<TextInputInstance>(null);
  return (
    <Pressable onPress={() => ref.current?.focus()} feedback="none" accessibilityLabel={t('auth.verify.codeLabel')}>
      <View style={{ flexDirection: 'row', direction: 'ltr', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length }).map((_, i) => {
          const ch = value[i];
          const active = i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              style={{
                flex: 1,
                maxWidth: 52,
                height: 58,
                borderRadius: radius.md,
                borderWidth: active ? 1.5 : 1,
                borderColor: error ? colors.danger : active ? colors.accent : colors.border,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="title2" align="center" style={{ fontFamily: fontFamilies.latin.semibold }}>
                {ch ?? ''}
              </Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(txt) => onChange(txt.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        autoFocus
        maxLength={length}
        style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
      />
    </Pressable>
  );
}
