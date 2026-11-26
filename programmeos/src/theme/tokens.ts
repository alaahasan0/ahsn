/**
 * ProgrammeOS design tokens.
 *
 * Brand palette (initial direction):
 *   Midnight #111827 · Cloud #F5F6F7 · White #FFFFFF · Accent Blue #587CFA
 *   Success #32B995 · Warning #D9A441 · Danger #D85D65 · Secondary #7A8290 · Border #E8EAED
 *
 * Components never use raw hex values — they read semantic tokens from `useTheme()`.
 * "*Text" variants are contrast-tuned (WCAG AA ≥ 4.5:1 on surfaces) versions of the
 * brand colours for use in small text; the raw brand values are used for fills and graphics.
 */

export const palette = {
  midnight: '#111827',
  cloud: '#F5F6F7',
  white: '#FFFFFF',
  accent: '#587CFA',
  success: '#32B995',
  warning: '#D9A441',
  danger: '#D85D65',
  slate: '#7A8290',
  border: '#E8EAED',
  violet: '#8B7CF6',
  sky: '#4FB3D9',
} as const;

export type ColorTokens = {
  /** App canvas behind grouped content */
  background: string;
  /** Cards, rows, sheets */
  surface: string;
  /** Secondary surface: input fills, nested groups, segmented tracks */
  surfaceAlt: string;
  /** Pressed/selected state for rows */
  surfacePressed: string;
  /** Elevated surfaces: sheets, dialogs, menus */
  surfaceRaised: string;
  /** Translucent nav/tab bars */
  chrome: string;
  border: string;
  borderStrong: string;
  separator: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textOnAccent: string;

  accent: string;
  accentText: string;
  accentSoft: string;
  accentSoftStrong: string;
  primary: string;
  primaryPressed: string;

  success: string;
  successText: string;
  successSoft: string;
  warning: string;
  warningText: string;
  warningSoft: string;
  danger: string;
  dangerText: string;
  dangerSoft: string;
  info: string;
  infoText: string;
  infoSoft: string;
  neutral: string;
  neutralText: string;
  neutralSoft: string;
  violet: string;
  violetText: string;
  violetSoft: string;

  overlay: string;
  shadow: string;
  skeleton: string;
  skeletonHighlight: string;
  /** Categorical palette for charts */
  chart: string[];
  chartGrid: string;
  chartTrack: string;
};

export const lightColors: ColorTokens = {
  background: '#F5F6F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F1F3',
  surfacePressed: '#EEF0F2',
  surfaceRaised: '#FFFFFF',
  chrome: 'rgba(245,246,247,0.86)',
  border: '#E8EAED',
  borderStrong: '#D8DBE0',
  separator: '#ECEEF0',

  text: '#111827',
  textSecondary: '#646B78',
  textTertiary: '#8A919D',
  textInverse: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  accent: '#587CFA',
  accentText: '#3D63E8',
  accentSoft: 'rgba(88,124,250,0.10)',
  accentSoftStrong: 'rgba(88,124,250,0.18)',
  primary: '#4468EE',
  primaryPressed: '#3657D6',

  success: '#32B995',
  successText: '#1B7F64',
  successSoft: 'rgba(50,185,149,0.12)',
  warning: '#D9A441',
  warningText: '#94650C',
  warningSoft: 'rgba(217,164,65,0.14)',
  danger: '#D85D65',
  dangerText: '#B83D47',
  dangerSoft: 'rgba(216,93,101,0.11)',
  info: '#4FB3D9',
  infoText: '#1F7598',
  infoSoft: 'rgba(79,179,217,0.13)',
  neutral: '#9AA1AC',
  neutralText: '#5D6471',
  neutralSoft: 'rgba(122,130,144,0.12)',
  violet: '#8B7CF6',
  violetText: '#6450E0',
  violetSoft: 'rgba(139,124,246,0.12)',

  overlay: 'rgba(17,24,39,0.38)',
  shadow: '#111827',
  skeleton: '#ECEEF1',
  skeletonHighlight: '#F6F7F8',
  chart: ['#587CFA', '#32B995', '#D9A441', '#D85D65', '#8B7CF6', '#4FB3D9', '#9AA1AC'],
  chartGrid: '#EDEFF2',
  chartTrack: '#EEF0F3',
};

/**
 * Dark theme — designed, not inverted: deep charcoal canvas, layered surfaces that get
 * lighter as they rise, desaturated semantic colours lifted for contrast on dark.
 */
export const darkColors: ColorTokens = {
  background: '#0C0E11',
  surface: '#15181D',
  surfaceAlt: '#1C2026',
  surfacePressed: '#20252C',
  surfaceRaised: '#1B1F25',
  chrome: 'rgba(12,14,17,0.82)',
  border: '#252A32',
  borderStrong: '#30363F',
  separator: '#22262D',

  text: '#F1F3F6',
  textSecondary: '#A2A9B5',
  textTertiary: '#7C8491',
  textInverse: '#111827',
  textOnAccent: '#FFFFFF',

  accent: '#6F8DFB',
  accentText: '#93A9FF',
  accentSoft: 'rgba(111,141,251,0.14)',
  accentSoftStrong: 'rgba(111,141,251,0.24)',
  primary: '#4E70F2',
  primaryPressed: '#3F60DE',

  success: '#3CC9A2',
  successText: '#5AD6B2',
  successSoft: 'rgba(60,201,162,0.14)',
  warning: '#E2B157',
  warningText: '#EBC06E',
  warningSoft: 'rgba(226,177,87,0.15)',
  danger: '#E46E76',
  dangerText: '#F08C93',
  dangerSoft: 'rgba(228,110,118,0.15)',
  info: '#5FC0E4',
  infoText: '#7DCDEA',
  infoSoft: 'rgba(95,192,228,0.14)',
  neutral: '#7C8491',
  neutralText: '#AEB5C0',
  neutralSoft: 'rgba(162,169,181,0.13)',
  violet: '#9D90F8',
  violetText: '#B4AAFB',
  violetSoft: 'rgba(157,144,248,0.15)',

  overlay: 'rgba(0,0,0,0.58)',
  shadow: '#000000',
  skeleton: '#1D2127',
  skeletonHighlight: '#262B32',
  chart: ['#6F8DFB', '#3CC9A2', '#E2B157', '#E46E76', '#9D90F8', '#5FC0E4', '#7C8491'],
  chartGrid: '#22262D',
  chartTrack: '#22272E',
};

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 44,
  /** Horizontal screen gutter */
  gutter: 16,
} as const;

export const radii = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

/** Minimum touch target (Apple HIG 44pt, Material 48dp → we use 44 with hitSlop). */
export const touch = { min: 44 } as const;

export const motion = {
  fast: 140,
  base: 220,
  slow: 320,
  spring: { damping: 22, stiffness: 240, mass: 0.9 },
} as const;

export type Spacing = typeof spacing;
export type Radii = typeof radii;
