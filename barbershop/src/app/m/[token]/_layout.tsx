import { Stack } from 'expo-router';

import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** Secure booking-management link (opened from WhatsApp/SMS). */
export default function ManageLinkLayout() {
  const { colors } = useTheme();
  const { isRTL } = useI18n();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: isRTL ? 'slide_from_left' : 'slide_from_right' }} />;
}
