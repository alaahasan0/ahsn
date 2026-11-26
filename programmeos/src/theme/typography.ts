import { Platform, type TextStyle } from 'react-native';

/**
 * Type system.
 * iOS renders with the system face (SF Pro Display / SF Pro Text, which Apple switches
 * optically by size). Android and web use Inter, loaded at startup, as the cross-platform
 * fallback. Inter needs one family per weight, so weights map to families here.
 */
export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

const interFamily: Record<FontWeight, string> = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

const systemWeight: Record<FontWeight, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export function fontFor(weight: FontWeight): TextStyle {
  if (Platform.OS === 'ios') {
    return { fontFamily: undefined, fontWeight: systemWeight[weight] };
  }
  return { fontFamily: interFamily[weight], fontWeight: Platform.OS === 'web' ? systemWeight[weight] : undefined };
}

export type TypeVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'bodyStrong'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption'
  | 'overline'
  | 'label'
  | 'metricXL'
  | 'metric'
  | 'metricSm';

type VariantSpec = { size: number; line: number; weight: FontWeight; tracking?: number; tabular?: boolean; upper?: boolean };

/** Sized for phones first: restrained headings, readable 15pt body. */
export const typeScale: Record<TypeVariant, VariantSpec> = {
  largeTitle: { size: 30, line: 36, weight: 'bold', tracking: -0.6 },
  title1: { size: 24, line: 30, weight: 'bold', tracking: -0.4 },
  title2: { size: 20, line: 26, weight: 'semibold', tracking: -0.3 },
  title3: { size: 17, line: 22, weight: 'semibold', tracking: -0.2 },
  headline: { size: 15, line: 20, weight: 'semibold', tracking: -0.1 },
  body: { size: 15, line: 21, weight: 'regular', tracking: -0.1 },
  bodyStrong: { size: 15, line: 21, weight: 'medium', tracking: -0.1 },
  callout: { size: 14, line: 19, weight: 'regular', tracking: -0.05 },
  subhead: { size: 13, line: 18, weight: 'regular' },
  footnote: { size: 12, line: 16, weight: 'regular' },
  caption: { size: 11, line: 14, weight: 'medium', tracking: 0.1 },
  overline: { size: 11, line: 14, weight: 'semibold', tracking: 0.6, upper: true },
  label: { size: 13, line: 17, weight: 'medium' },
  metricXL: { size: 34, line: 38, weight: 'bold', tracking: -0.8, tabular: true },
  metric: { size: 22, line: 26, weight: 'semibold', tracking: -0.4, tabular: true },
  metricSm: { size: 17, line: 21, weight: 'semibold', tracking: -0.2, tabular: true },
};

export function textStyleFor(variant: TypeVariant): TextStyle {
  const v = typeScale[variant];
  return {
    ...fontFor(v.weight),
    fontSize: v.size,
    lineHeight: v.line,
    letterSpacing: v.tracking ?? 0,
    ...(v.tabular ? { fontVariant: ['tabular-nums'] } : null),
    ...(v.upper ? { textTransform: 'uppercase' } : null),
  };
}
