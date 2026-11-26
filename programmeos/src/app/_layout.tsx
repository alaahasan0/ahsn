import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogProvider } from '@/components/sheets/Dialog';
import { ToastProvider } from '@/components/sheets/Toast';
import { SessionProvider, useSession } from '@/data/session';
import { DataProvider } from '@/data/store';
import { AppThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Routes presented modally (create flows, assistant, role switcher). */
const MODAL_ROUTES = [
  'role-switcher',
  'programme/new',
  'programme/[id]/edit',
  'task/new',
  'session/new',
  'faculty/assign',
  'hotel-booking/new',
  'learners/import',
  'learners/register',
  'document/upload',
  'expense/new',
  'material/submit',
  'assistant',
  'voice',
  'fm/upload',
  'lm/feedback-form',
  'lm/submit',
];

function NavigationShell() {
  const theme = useTheme();
  const { hydrated } = useSession();
  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);
  const navTheme = theme.isDark ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider value={{ ...navTheme, colors: { ...navTheme.colors, background: theme.colors.background, card: theme.colors.surface, text: theme.colors.text, border: theme.colors.border, primary: theme.colors.accent } }}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
        }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="(staff)" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="faculty-mode" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="learner-mode" options={{ animation: 'fade', gestureEnabled: false }} />
        {MODAL_ROUTES.map((name) => (
          <Stack.Screen key={name} name={name} options={{ presentation: 'modal', animation: Platform.OS === 'android' ? 'slide_from_bottom' : 'default' }} />
        ))}
      </Stack>
    </ThemeProvider>
  );
}

function ThemedApp({ children }: { children: ReactNode }) {
  const { themePreference } = useSession();
  return <AppThemeProvider preference={themePreference}>{children}</AppThemeProvider>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const ready = fontsLoaded || !!fontError || Platform.OS === 'ios';
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <ThemedApp>
            <DataProvider>
              <ToastProvider>
                <DialogProvider>{ready ? <NavigationShell /> : <View style={{ flex: 1 }} />}</DialogProvider>
              </ToastProvider>
            </DataProvider>
          </ThemedApp>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
