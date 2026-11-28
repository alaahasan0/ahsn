import { Stack, useLocalSearchParams } from 'expo-router';

import { BookingDraftProvider } from '@/features/portal/BookingDraft';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** Customer booking portal — public, no account. Kept apart from the salon app routes. */
export default function PortalLayout() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors } = useTheme();
  const { isRTL } = useI18n();
  return (
    <BookingDraftProvider slug={String(slug ?? '')}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: isRTL ? 'slide_from_left' : 'slide_from_right' }} />
    </BookingDraftProvider>
  );
}
