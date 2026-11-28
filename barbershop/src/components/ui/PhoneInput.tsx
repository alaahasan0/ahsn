import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { useI18n } from '@/i18n';
import { COUNTRY_CODES, isValidMobile, normalizeNational } from '@/lib/phone';
import { fontFamilies, useTheme } from '@/theme';
import type { CountryCode, PhoneNumber } from '@/types/models';

import { Icon } from './Icon';
import { Pressable } from './Pressable';
import { Sheet } from './Sheet';
import { Text } from './Text';

export interface PhoneInputProps {
  label?: string;
  value: PhoneNumber;
  onChange: (v: PhoneNumber) => void;
  hint?: string;
  error?: string;
  /** Show WhatsApp glyph in the label. */
  whatsapp?: boolean;
  optional?: boolean;
  testID?: string;
}

/**
 * Phone field with an explicit country-code selector (+970 / +972 / +962).
 * Numbers are always entered and displayed LTR, even in Arabic.
 */
export function PhoneInput({ label, value, onChange, hint, error, whatsapp, optional, testID }: PhoneInputProps) {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const country = COUNTRY_CODES.find((c) => c.code === value.country) ?? COUNTRY_CODES[0];
  const valid = value.number.length === 0 || isValidMobile(value);

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {whatsapp ? <Icon name="ion:logo-whatsapp" size={15} color={colors.whatsapp} /> : null}
          <Text variant="subhead" tone="secondary" style={{ flex: 1 }}>
            {label}
          </Text>
          {optional ? (
            <Text variant="footnote" tone="tertiary">
              {t('common.labels.optional')}
            </Text>
          ) : null}
        </View>
      ) : null}
      {/* Phone numbers read left-to-right in every language. */}
      <View style={{ flexDirection: 'row', direction: 'ltr', height: 48, borderRadius: radius.md, borderWidth: focused ? 1.5 : 1, borderColor: error ? colors.danger : focused ? colors.accent : colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
        <Pressable onPress={() => setOpen(true)} accessibilityLabel={t('common.phone.countryCode')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: colors.border, backgroundColor: colors.surfaceMuted }}>
          <Text variant="callout">{country.flag}</Text>
          <Text variant="callout" weight="medium" style={{ writingDirection: 'ltr' }}>
            {value.country}
          </Text>
          <Icon name="chevron-down" size={14} color={colors.textTertiary} />
        </Pressable>
        <TextInput
          testID={testID}
          value={value.number}
          onChangeText={(txt) => onChange({ ...value, number: normalizeNational(txt) })}
          keyboardType="phone-pad"
          placeholder={country.example}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, paddingHorizontal: 12, fontFamily: fontFamilies.latin.regular, fontSize: 16, color: colors.text, textAlign: 'left', writingDirection: 'ltr', outlineStyle: 'none' } as never}
        />
        {value.number.length > 0 ? (
          <View style={{ justifyContent: 'center', paddingEnd: 12 }}>
            <Icon name={valid ? 'check' : 'alert-circle'} size={16} color={valid ? colors.success : colors.warning} />
          </View>
        ) : null}
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
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('common.phone.countryCode')}>
        <View style={{ gap: 8 }}>
          {COUNTRY_CODES.map((c) => (
            <Pressable
              key={c.code}
              onPress={() => {
                onChange({ ...value, country: c.code as CountryCode });
                setOpen(false);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: c.code === value.country ? colors.accentSoft : colors.surfaceMuted }}
            >
              <Text variant="title3">{c.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text variant="callout" weight="medium">
                  {t(`common.phone.countries.${c.key}`)}
                </Text>
                <Text variant="footnote" tone="secondary" style={{ writingDirection: 'ltr' }}>
                  {c.code} {c.example}
                </Text>
              </View>
              {c.code === value.country ? <Icon name="check" size={18} color={colors.accent} /> : null}
            </Pressable>
          ))}
        </View>
      </Sheet>
    </View>
  );
}
