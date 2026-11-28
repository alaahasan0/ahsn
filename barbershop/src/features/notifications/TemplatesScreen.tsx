import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Badge, Chip, ChipRow, Header, Icon, Pressable, Screen, Section, SegmentedControl, Switch, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useActions, useAppState } from '@/store/AppStore';
import { useTheme } from '@/theme';
import type { MessageTemplate, TemplateEvent } from '@/types/models';

import { renderTemplate } from './renderTemplate';

const EVENT_ORDER: TemplateEvent[] = ['booking_created', 'confirmation_request', 'reminder', 'rescheduled', 'cancelled', 'recurring_invitation', 'no_show_followup'];

export default function TemplatesScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { templates, salon, customers, services, barbers } = useAppState();
  const actions = useActions();
  const [channel, setChannel] = useState<'all' | 'whatsapp' | 'sms'>('all');
  const [language, setLanguage] = useState<'all' | 'ar' | 'en'>('all');
  const ctx = { salon, customer: customers[0], service: services[0], barber: barbers[1] };

  const grouped = useMemo(
    () =>
      EVENT_ORDER.map((event) => ({
        event,
        items: templates.filter((tp) => tp.event === event && (channel === 'all' || tp.channel === channel) && (language === 'all' || tp.language === language)),
      })).filter((g) => g.items.length),
    [templates, channel, language],
  );

  const Row = ({ tpl }: { tpl: MessageTemplate }) => (
    <Pressable onPress={() => router.push(`/notifications/templates/${tpl.id}`)} style={{ flexDirection: 'row', gap: 12, padding: 14, opacity: tpl.active ? 1 : 0.6 }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={tpl.channel === 'whatsapp' ? 'ion:logo-whatsapp' : 'message-square'} size={16} color={tpl.channel === 'whatsapp' ? colors.whatsapp : colors.textSecondary} />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Badge label={tpl.channel === 'whatsapp' ? t('notifications.settings.whatsapp') : t('notifications.settings.sms')} />
          <Badge label={tpl.language === 'ar' ? t('notifications.templates.arabic') : t('notifications.templates.english')} tone="info" />
        </View>
        <Text variant="footnote" tone="secondary" numberOfLines={2} style={{ textAlign: tpl.language === 'ar' ? 'right' : 'left', writingDirection: tpl.language === 'ar' ? 'rtl' : 'ltr' }}>
          {renderTemplate(tpl, ctx)}
        </Text>
      </View>
      <Switch value={tpl.active} onValueChange={(active) => actions.upsertTemplate({ ...tpl, active })} accessibilityLabel={tpl.active ? t('notifications.templates.active') : t('notifications.templates.inactive')} />
    </Pressable>
  );

  return (
    <Screen
      padded={false}
      header={
        <Header title={t('notifications.templates.title')} subtitle={t('notifications.templates.subtitle')} backFallback="/owner/more">
          <SegmentedControl
            size="sm"
            value={language}
            onChange={setLanguage}
            segments={[
              { value: 'all', label: t('notifications.templates.all') },
              { value: 'ar', label: t('notifications.templates.arabic') },
              { value: 'en', label: t('notifications.templates.english') },
            ]}
          />
        </Header>
      }
    >
      <ChipRow style={{ marginTop: 4 }}>
        <Chip label={t('notifications.templates.all')} selected={channel === 'all'} onPress={() => setChannel('all')} />
        <Chip label={t('notifications.settings.whatsapp')} icon="ion:logo-whatsapp" selected={channel === 'whatsapp'} onPress={() => setChannel('whatsapp')} />
        <Chip label={t('notifications.settings.sms')} icon="message-square" selected={channel === 'sms'} onPress={() => setChannel('sms')} />
      </ChipRow>
      <View style={{ gap: 24, paddingTop: 20, paddingHorizontal: 20 }}>
        {grouped.map((g) => (
          <Section key={g.event} title={t(`notifications.templates.events.${g.event}`)} subtitle={t(`notifications.templates.eventHints.${g.event}`)} card>
            {g.items.map((tpl) => (
              <Row key={tpl.id} tpl={tpl} />
            ))}
          </Section>
        ))}
      </View>
    </Screen>
  );
}
