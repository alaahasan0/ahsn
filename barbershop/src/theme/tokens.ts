/**
 * Design tokens — the single source of truth for the visual language.
 * Change the accent or neutrals here and every screen follows.
 */

export type ColorScheme = 'light' | 'dark';

const palette = {
  // Warm neutral scale (stone-like) — a refined, hospitality feel.
  neutral0: '#FFFFFF',
  neutral25: '#FCFBFA',
  neutral50: '#F7F6F4',
  neutral100: '#EFEDEA',
  neutral200: '#E3E0DB',
  neutral300: '#CFCAC3',
  neutral400: '#A8A29A',
  neutral500: '#7C766E',
  neutral600: '#5C5750',
  neutral700: '#423E39',
  neutral800: '#2A2724',
  neutral850: '#201E1B',
  neutral900: '#171513',
  neutral950: '#0F0E0D',

  // Brand accent — "Copper". Distinctive, warm, used with restraint.
  copper50: '#FBF1EA',
  copper100: '#F4DCCB',
  copper400: '#E08A55',
  copper500: '#C46A35',
  copper600: '#A9582A',
  copper700: '#8A4520',
  copper900: '#3A1E0F',
};

export interface ThemeColors {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceMuted: string;
  surfacePressed: string;
  border: string;
  borderStrong: string;
  separator: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  accent: string;
  accentPressed: string;
  accentSoft: string;
  accentText: string; // text on accent
  accentOnSoft: string; // text on accentSoft

  ink: string; // strong neutral action
  inkText: string;

  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;

  overlay: string;
  shadow: string;
  skeleton: string;

  whatsapp: string;
}

export const colors: Record<ColorScheme, ThemeColors> = {
  light: {
    background: palette.neutral50,
    backgroundElevated: palette.neutral0,
    surface: palette.neutral0,
    surfaceMuted: palette.neutral100,
    surfacePressed: palette.neutral100,
    border: palette.neutral200,
    borderStrong: palette.neutral300,
    separator: '#ECE9E5',

    text: palette.neutral900,
    textSecondary: palette.neutral600,
    textTertiary: palette.neutral500,
    textInverse: palette.neutral0,

    accent: palette.copper600,
    accentPressed: palette.copper700,
    accentSoft: palette.copper50,
    accentText: '#FFFFFF',
    accentOnSoft: palette.copper700,

    ink: palette.neutral900,
    inkText: palette.neutral0,

    success: '#15803D',
    successSoft: '#E8F5EC',
    warning: '#B45309',
    warningSoft: '#FDF3E2',
    danger: '#C62828',
    dangerSoft: '#FCEBEA',
    info: '#1D5FD1',
    infoSoft: '#E9F0FC',

    overlay: 'rgba(15, 14, 13, 0.42)',
    shadow: '#1B140E',
    skeleton: palette.neutral100,
    whatsapp: '#1DA851',
  },
  dark: {
    background: palette.neutral950,
    backgroundElevated: palette.neutral900,
    surface: palette.neutral900,
    surfaceMuted: palette.neutral850,
    surfacePressed: palette.neutral800,
    border: '#2B2826',
    borderStrong: '#3A3633',
    separator: '#242120',

    text: '#F5F3F0',
    textSecondary: '#B3ADA5',
    textTertiary: '#8A847C',
    textInverse: palette.neutral900,

    accent: palette.copper400,
    accentPressed: palette.copper500,
    accentSoft: '#2C1C12',
    accentText: '#1A0F08',
    accentOnSoft: '#F0B48C',

    ink: '#F5F3F0',
    inkText: palette.neutral900,

    success: '#4ADE80',
    successSoft: '#12251A',
    warning: '#F5B04A',
    warningSoft: '#2A1F0E',
    danger: '#F87171',
    dangerSoft: '#2C1414',
    info: '#7AA7F5',
    infoSoft: '#121C2E',

    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
    skeleton: palette.neutral850,
    whatsapp: '#3DDC84',
  },
};

/** Semantic appointment status colours. Kept separate from the brand accent. */
export type StatusTone = { fg: string; bg: string; dot: string };

export const statusColors: Record<ColorScheme, Record<string, StatusTone>> = {
  light: {
    draft: { fg: '#5C5750', bg: '#EFEDEA', dot: '#A8A29A' },
    pending: { fg: '#9A5B00', bg: '#FDF1DC', dot: '#E0A100' },
    confirmed: { fg: '#1D5FD1', bg: '#E8EFFC', dot: '#3B7BEA' },
    checked_in: { fg: '#0E7C74', bg: '#E1F4F2', dot: '#14A396' },
    completed: { fg: '#15803D', bg: '#E6F4EA', dot: '#22A355' },
    cancelled: { fg: '#C62828', bg: '#FCEAEA', dot: '#E04545' },
    no_show: { fg: '#A3195B', bg: '#FAE6EF', dot: '#D23D7E' },
    rescheduled: { fg: '#6440C9', bg: '#EFEAFB', dot: '#8160E0' },
    expired: { fg: '#5B6472', bg: '#ECEEF1', dot: '#8A93A1' },
  },
  dark: {
    draft: { fg: '#C9C3BB', bg: '#2A2724', dot: '#8A847C' },
    pending: { fg: '#F7C25C', bg: '#2E2410', dot: '#E9AE2E' },
    confirmed: { fg: '#8DB4F7', bg: '#132036', dot: '#5D93EE' },
    checked_in: { fg: '#5ED6C9', bg: '#0F2926', dot: '#2BB8AA' },
    completed: { fg: '#6EE29A', bg: '#10281A', dot: '#3CC271' },
    cancelled: { fg: '#F79292', bg: '#311616', dot: '#E85C5C' },
    no_show: { fg: '#F28BBA', bg: '#2F1322', dot: '#DC5A94' },
    rescheduled: { fg: '#B6A0F5', bg: '#221A3A', dot: '#9178EA' },
    expired: { fg: '#A9B1BD', bg: '#22262C', dot: '#7A838F' },
  },
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
  huge: 48,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/** Font family names registered in the root layout (see src/theme/fonts.ts). */
export const fontFamilies: Record<'latin' | 'arabic', Record<FontWeight, string>> = {
  latin: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  arabic: {
    regular: 'IBMPlexSansArabic_400Regular',
    medium: 'IBMPlexSansArabic_500Medium',
    semibold: 'IBMPlexSansArabic_600SemiBold',
    bold: 'IBMPlexSansArabic_700Bold',
  },
};

export type TypeVariant =
  | 'display'
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
  | 'numeric';

export const typography: Record<
  TypeVariant,
  { size: number; lineHeight: number; weight: FontWeight; letterSpacing?: number; uppercase?: boolean }
> = {
  display: { size: 34, lineHeight: 40, weight: 'bold', letterSpacing: -0.8 },
  title1: { size: 28, lineHeight: 34, weight: 'bold', letterSpacing: -0.6 },
  title2: { size: 22, lineHeight: 28, weight: 'semibold', letterSpacing: -0.4 },
  title3: { size: 19, lineHeight: 25, weight: 'semibold', letterSpacing: -0.3 },
  headline: { size: 16, lineHeight: 22, weight: 'semibold', letterSpacing: -0.15 },
  body: { size: 16, lineHeight: 23, weight: 'regular', letterSpacing: -0.1 },
  bodyStrong: { size: 16, lineHeight: 23, weight: 'medium', letterSpacing: -0.1 },
  callout: { size: 15, lineHeight: 21, weight: 'regular', letterSpacing: -0.1 },
  subhead: { size: 14, lineHeight: 19, weight: 'medium', letterSpacing: -0.05 },
  footnote: { size: 13, lineHeight: 18, weight: 'regular' },
  caption: { size: 12, lineHeight: 16, weight: 'medium' },
  overline: { size: 11, lineHeight: 14, weight: 'semibold', letterSpacing: 0.6, uppercase: true },
  numeric: { size: 30, lineHeight: 36, weight: 'semibold', letterSpacing: -0.8 },
};

export const shadows = {
  none: {},
  sm: { shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  md: { shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  lg: { shadowOpacity: 0.12, shadowRadius: 28, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
} as const;

export const layout = {
  /** Max content width for tablet/desktop web so screens stay readable. */
  maxContentWidth: 760,
  screenPadding: 20,
  touchTarget: 44,
  tabBarHeight: 64,
} as const;

export const motion = {
  fast: 140,
  base: 220,
  slow: 360,
} as const;
