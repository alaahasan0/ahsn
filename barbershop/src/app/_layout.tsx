import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, LocaleProvider, Stack, ThemeProvider as NavThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DirectionView } from '@/components/ui/Direction';
import { ToastProvider } from '@/components/ui/Toast';
import { I18nProvider, useI18n } from '@/i18n';
import { AppStoreProvider } from '@/store/AppStore';
import { PreferencesProvider, usePreferences } from '@/store/preferences';
import { appFonts } from '@/theme/fonts';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Navigation() {
  const theme = useTheme();
  const { isRTL } = useI18n();
  const navTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme : DefaultTheme).colors,
      background: theme.colors.background,
      card: theme.colors.backgroundElevated,
      text: theme.colors.text,
      border: theme.colors.separator,
      primary: theme.colors.accent,
    },
  };
  return (
    <LocaleProvider direction={isRTL ? 'rtl' : 'ltr'}>
      <NavThemeProvider value={navTheme}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <DirectionView style={{ backgroundColor: theme.colors.background }}>
          <ToastProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background }, animation: isRTL ? 'slide_from_left' : 'slide_from_right' }}>
              <Stack.Screen name="index" options={{ animation: 'fade' }} />
              <Stack.Screen name="owner" options={{ animation: 'fade' }} />
              <Stack.Screen name="barber" options={{ animation: 'fade' }} />
              <Stack.Screen name="appointment/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="block-time" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
              <Stack.Screen name="voice" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            </Stack>
          </ToastProvider>
        </DirectionView>
      </NavThemeProvider>
    </LocaleProvider>
  );
}

function Gate() {
  const { ready } = usePreferences();
  const [fontsLoaded, fontError] = useFonts(appFonts);
  const done = ready && (fontsLoaded || !!fontError);
  useEffect(() => {
    if (done) SplashScreen.hideAsync().catch(() => undefined);
  }, [done]);
  if (!done) return null;
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppStoreProvider>
          <Navigation />
        </AppStoreProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PreferencesProvider>
          <Gate />
        </PreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
