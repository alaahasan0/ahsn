import { View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { fontFamilies, useTheme } from '@/theme';

/** Simulated device-message preview. WhatsApp uses its familiar chat colours; SMS a neutral bubble. */
const CHAT = {
  light: { wall: '#EFE7DD', bubble: '#D9FDD3', text: '#111B21', meta: '#667781' },
  dark: { wall: '#0B141A', bubble: '#005C4B', text: '#E9EDEF', meta: '#8FB5AD' },
};

export function MessagePreview({ text, channel, language, senderName }: { text: string; channel: 'whatsapp' | 'sms'; language: 'ar' | 'en'; senderName: string }) {
  const { colors, radius, isDark } = useTheme();
  const { f } = useI18n();
  const wa = CHAT[isDark ? 'dark' : 'light'];
  const rtl = language === 'ar';
  const bubbleBg = channel === 'whatsapp' ? wa.bubble : colors.surfaceMuted;
  const textColor = channel === 'whatsapp' ? wa.text : colors.text;
  return (
    <View style={{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: channel === 'whatsapp' ? wa.wall : colors.surface, borderWidth: channel === 'sms' ? 1 : 0, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: channel === 'whatsapp' ? (isDark ? '#202C33' : '#F0F2F5') : colors.surfaceMuted }}>
        <Icon name={channel === 'whatsapp' ? 'ion:logo-whatsapp' : 'message-square'} size={16} color={channel === 'whatsapp' ? colors.whatsapp : colors.textSecondary} />
        <Text variant="subhead" numberOfLines={1} style={{ flex: 1 }}>
          {senderName}
        </Text>
      </View>
      <View style={{ padding: 14, alignItems: 'flex-start' }}>
        <View style={{ maxWidth: '88%', backgroundColor: bubbleBg, borderRadius: 14, borderTopStartRadius: 4, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, gap: 4 }}>
          <Text
            variant="callout"
            color={textColor}
            style={{ fontFamily: fontFamilies[rtl ? 'arabic' : 'latin'].regular, textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr', letterSpacing: 0 }}
          >
            {text}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end' }}>
            <Text variant="caption" color={channel === 'whatsapp' ? wa.meta : colors.textTertiary} style={{ fontSize: 10 }} weight="regular">
              {f.clock('14:20')}
            </Text>
            {channel === 'whatsapp' ? <Icon name="ion:checkmark-done" size={14} color="#53BDEB" /> : null}
          </View>
        </View>
      </View>
    </View>
  );
}
