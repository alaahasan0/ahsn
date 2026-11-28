import { Stack, useLocalSearchParams } from 'expo-router';

import { OnboardingProvider } from '@/features/onboarding/OnboardingContext';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

export default function OnboardingLayout() {
  const { colors } = useTheme();
  const { isRTL } = useI18n();
  const { salon } = useLocalSearchParams<{ salon?: string }>();
  return (
    <OnboardingProvider initialName={salon ?? ''}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: isRTL ? 'slide_from_left' : 'slide_from_right' }} />
    </OnboardingProvider>
  );
}
