import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useI18n } from '@/i18n';
import { fontFamilies, useTheme, type FontWeight, type ThemeColors, type TypeVariant } from '@/theme';

export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'inverse' | 'danger' | 'success' | 'warning' | 'info' | 'onAccent';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: TextTone;
  /** Explicit colour overrides tone. */
  color?: string;
  weight?: FontWeight;
  align?: 'start' | 'center' | 'end';
  /** Use tabular figures for times and numbers that should not jitter. */
  tabular?: boolean;
}

const toneColor = (c: ThemeColors, tone: TextTone) =>
  ({
    primary: c.text,
    secondary: c.textSecondary,
    tertiary: c.textTertiary,
    accent: c.accent,
    inverse: c.textInverse,
    danger: c.danger,
    success: c.success,
    warning: c.warning,
    info: c.info,
    onAccent: c.accentText,
  })[tone];

/**
 * The only text primitive screens should use. Picks the Latin or Arabic family, keeps
 * Arabic letter-spacing at 0 (spacing breaks letter joining), and aligns to the reading
 * direction.
 */
export function Text({ variant = 'body', tone = 'primary', color, weight, align = 'start', tabular, style, ...rest }: TextProps) {
  const { colors, typography } = useTheme();
  const { lang, isRTL } = useI18n();
  const spec = typography[variant];
  const isArabic = lang === 'ar';
  const family = fontFamilies[isArabic ? 'arabic' : 'latin'][weight ?? spec.weight];
  const textAlign: TextStyle['textAlign'] = align === 'center' ? 'center' : (align === 'start') !== isRTL ? 'left' : 'right';
  const base: TextStyle = {
    fontFamily: family,
    fontSize: isArabic ? spec.size * 0.98 : spec.size,
    lineHeight: isArabic ? Math.round(spec.lineHeight * 1.14) : spec.lineHeight,
    letterSpacing: isArabic ? 0 : spec.letterSpacing ?? 0,
    color: color ?? toneColor(colors, tone),
    textAlign,
    writingDirection: isRTL ? 'rtl' : 'ltr',
    textTransform: spec.uppercase && !isArabic ? 'uppercase' : 'none',
    fontVariant: tabular ? ['tabular-nums'] : undefined,
  };
  return <RNText {...rest} style={[base, style]} />;
}
