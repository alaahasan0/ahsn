import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { textStyleFor, useTheme, type ColorTokens, type FontWeight, fontFor, type TypeVariant } from '@/theme';

export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'inverse' | 'onAccent' | 'neutral';

const toneKey: Record<TextTone, keyof ColorTokens> = {
  primary: 'text',
  secondary: 'textSecondary',
  tertiary: 'textTertiary',
  accent: 'accentText',
  success: 'successText',
  warning: 'warningText',
  danger: 'dangerText',
  info: 'infoText',
  violet: 'violetText',
  inverse: 'textInverse',
  onAccent: 'textOnAccent',
  neutral: 'neutralText',
};

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
  color?: string;
  weight?: FontWeight;
  align?: TextStyle['textAlign'];
  tabular?: boolean;
};

export function Text({ variant = 'body', tone = 'primary', color, weight, align, tabular, style, ...rest }: TextProps) {
  const { colors } = useTheme();
  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[
        textStyleFor(variant),
        { color: color ?? (colors[toneKey[tone]] as string) },
        weight ? fontFor(weight) : null,
        align ? { textAlign: align } : null,
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
    />
  );
}
