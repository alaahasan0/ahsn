import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { usePreferences } from '@/store/preferences';

import { colors, layout, motion, radius, shadows, spacing, statusColors, typography, type ColorScheme, type ThemeColors, type StatusTone } from './tokens';

export interface Theme {
  scheme: ColorScheme;
  isDark: boolean;
  colors: ThemeColors;
  status: Record<string, StatusTone>;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  layout: typeof layout;
  motion: typeof motion;
  /** Platform shadow style using the theme's shadow colour. Prefer 'sm'/'md' — restraint. */
  shadow: (level: keyof typeof shadows) => object;
}

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const { themeMode } = usePreferences();
  const scheme: ColorScheme = themeMode === 'system' ? (system === 'dark' ? 'dark' : 'light') : themeMode;

  const theme = useMemo<Theme>(() => {
    const c = colors[scheme];
    return {
      scheme,
      isDark: scheme === 'dark',
      colors: c,
      status: statusColors[scheme],
      spacing,
      radius,
      typography,
      layout,
      motion,
      shadow: (level) => (level === 'none' ? {} : { ...shadows[level], shadowColor: c.shadow, ...(scheme === 'dark' ? { shadowOpacity: (shadows[level] as { shadowOpacity: number }).shadowOpacity * 2 } : null) }),
    };
  }, [scheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
