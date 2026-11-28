import { forwardRef, useState, type ReactNode } from 'react';
import { TextInput, View, type StyleProp, type TextInputInstance, type TextInputProps, type ViewStyle } from 'react-native';

import { useI18n } from '@/i18n';
import { fontFamilies, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: IconName;
  trailing?: ReactNode;
  leading?: ReactNode;
  optional?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** Force LTR content (phone numbers, emails, URLs) even in Arabic. */
  ltr?: boolean;
}

export const Input = forwardRef<TextInputInstance, InputProps>(function Input({ label, hint, error, icon, trailing, leading, optional, containerStyle, ltr, multiline, onFocus, onBlur, ...rest }, ref) {
  const { colors, radius } = useTheme();
  const { lang, isRTL, t } = useI18n();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.accent : colors.border;
  const forceLtr = ltr && isRTL;
  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="subhead" tone="secondary">
            {label}
          </Text>
          {optional ? (
            <Text variant="footnote" tone="tertiary">
              {t('common.labels.optional')}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          minHeight: multiline ? 96 : 48,
          borderRadius: radius.md,
          borderWidth: focused ? 1.5 : 1,
          borderColor,
          backgroundColor: colors.surface,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          gap: 10,
        }}
      >
        {icon ? <Icon name={icon} size={18} color={colors.textTertiary} /> : null}
        {leading}
        <TextInput
          ref={ref}
          multiline={multiline}
          placeholderTextColor={colors.textTertiary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: multiline ? 72 : 46,
            fontFamily: fontFamilies[lang === 'ar' && !ltr ? 'arabic' : 'latin'].regular,
            fontSize: 16,
            color: colors.text,
            textAlign: forceLtr ? 'right' : isRTL ? 'right' : 'left',
            writingDirection: ltr ? 'ltr' : isRTL ? 'rtl' : 'ltr',
            textAlignVertical: multiline ? 'top' : 'center',
            outlineStyle: 'none',
          } as never}
          {...rest}
        />
        {trailing}
      </View>
      {error ? (
        <Text variant="footnote" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="footnote" tone="tertiary">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});
