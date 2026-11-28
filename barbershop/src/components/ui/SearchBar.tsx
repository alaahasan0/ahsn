import { TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { useI18n } from '@/i18n';
import { fontFamilies, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Pressable } from './Pressable';

export interface SearchBarProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  onSubmit?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder, autoFocus, style, onSubmit }: SearchBarProps) {
  const { colors, radius } = useTheme();
  const { lang, isRTL, t } = useI18n();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, paddingHorizontal: 12, gap: 8 }, style]}>
      <Icon name="search" size={18} color={colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('common.actions.search')}
        placeholderTextColor={colors.textTertiary}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCorrect={false}
        style={{ flex: 1, height: 44, fontFamily: fontFamilies[lang === 'ar' ? 'arabic' : 'latin'].regular, fontSize: 16, color: colors.text, textAlign: isRTL ? 'right' : 'left', outlineStyle: 'none' } as never}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} accessibilityLabel={t('common.actions.clear')} hitSlop={8}>
          <Icon name="x-circle" size={18} color={colors.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}
