import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, useColorScheme, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { darkColors, lightColors, motion, radii, spacing, type ColorTokens } from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

export type Theme = {
  scheme: 'light' | 'dark';
  isDark: boolean;
  colors: ColorTokens;
  spacing: typeof spacing;
  radii: typeof radii;
  motion: typeof motion;
  hairline: number;
};

const ThemeContext = createContext<Theme | null>(null);

export function buildTheme(scheme: 'light' | 'dark'): Theme {
  return {
    scheme,
    isDark: scheme === 'dark',
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    radii,
    motion,
    hairline: StyleSheet.hairlineWidth,
  };
}

const lightTheme = buildTheme('light');
const darkTheme = buildTheme('dark');

export function AppThemeProvider({ preference, children }: { preference: ThemePreference; children: ReactNode }) {
  const system = useColorScheme();
  const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used inside AppThemeProvider');
  return t;
}

/**
 * Themed StyleSheet factory. Styles are computed once per theme and cached, so
 * components can call `useStyles(makeStyles)` freely.
 */
const styleCache = new WeakMap<object, Map<string, unknown>>();

export type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };
type AnyStyles = NamedStyles<any>;

export function useStyles<T extends NamedStyles<T>>(factory: (t: Theme) => T & AnyStyles): T {
  const theme = useTheme();
  return useMemo(() => {
    let perFactory = styleCache.get(factory) as Map<string, T> | undefined;
    if (!perFactory) {
      perFactory = new Map();
      styleCache.set(factory, perFactory);
    }
    const hit = perFactory.get(theme.scheme);
    if (hit) return hit;
    const created = StyleSheet.create(factory(theme));
    perFactory.set(theme.scheme, created);
    return created;
  }, [factory, theme]);
}

export function makeStyles<T extends NamedStyles<T>>(factory: (t: Theme) => T & AnyStyles): (t: Theme) => T & AnyStyles {
  return factory;
}
