import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import type { CommunicationChannel } from '@/types/models';

/** Chat-bubble preview of the outgoing message, laid out in the message's own language direction. */
export function MessagePreview({ body, channel, language }: { body: string; channel: CommunicationChannel; language: 'ar' | 'en' }) {
  const { colors, radius, isDark } = useTheme();
  const { t } = useI18n();
  const wa = channel === 'whatsapp';
  const rtl = language === 'ar';
  return (
    <View style={{ backgroundColor: isDark ? colors.surfaceMuted : wa ? '#EFE7DD' : colors.surfaceMuted, borderRadius: radius.lg, padding: 12, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name={wa ? 'ion:logo-whatsapp' : 'message-square'} size={14} color={wa ? colors.whatsapp : colors.textSecondary} />
        <Text variant="caption" tone="secondary">
          {t(`common.phone.channels.${channel === 'sms' ? 'sms' : 'whatsapp'}`)}
        </Text>
      </View>
      <View style={{ alignSelf: 'flex-end', maxWidth: '92%', backgroundColor: isDark ? (wa ? '#103A2A' : colors.surface) : wa ? '#D9FDD3' : colors.surface, borderRadius: radius.md, borderTopEndRadius: 4, paddingHorizontal: 12, paddingVertical: 10 }}>
        <Text variant="callout" style={{ textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' }}>
          {body}
        </Text>
      </View>
    </View>
  );
}
