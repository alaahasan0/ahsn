import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Chip, Header, ListRow, Screen, Section, Switch } from '@/components/ui';
import { useI18n } from '@/i18n';

import { NOTIFICATION_ICON } from './NotificationsScreen';

const EVENTS = ['new_booking', 'confirmed', 'cancelled', 'rescheduled', 'upcoming', 'reminder', 'no_show'] as const;
type EventKey = (typeof EVENTS)[number];

export default function NotificationSettingsScreen() {
  const { t, f } = useI18n();
  const [events, setEvents] = useState<Record<EventKey, boolean>>({ new_booking: true, confirmed: true, cancelled: true, rescheduled: true, upcoming: true, reminder: false, no_show: true });
  const [reminders, setReminders] = useState<string[]>(['24h', '2h']);
  const [channels, setChannels] = useState({ push: true, whatsapp: true, sms: true });
  const [quiet, setQuiet] = useState(true);
  const [autoLink, setAutoLink] = useState(true);
  const toggleReminder = (k: string) => setReminders((r) => (r.includes(k) ? r.filter((x) => x !== k) : [...r, k]));

  return (
    <Screen header={<Header title={t('notifications.settings.title')} backFallback="/notifications" />}>
      <View style={{ gap: 28, paddingTop: 8 }}>
        <Section title={t('notifications.settings.events')} subtitle={t('notifications.settings.eventsHint')} card>
          {EVENTS.map((e) => (
            <ListRow key={e} icon={NOTIFICATION_ICON[e]} title={t(`notifications.settings.eventLabels.${e}`)} trailing={<Switch value={events[e]} onValueChange={(v) => setEvents((s) => ({ ...s, [e]: v }))} accessibilityLabel={t(`notifications.settings.eventLabels.${e}`)} />} />
          ))}
        </Section>

        <Section title={t('notifications.settings.reminders')} subtitle={t('notifications.settings.remindersHint')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['24h', '2h', '1h'] as const).map((k) => (
              <Chip key={k} label={t(`notifications.settings.reminder${k}`)} selected={reminders.includes(k)} onPress={() => toggleReminder(k)} icon={reminders.includes(k) ? 'check' : undefined} />
            ))}
          </View>
        </Section>

        <Section title={t('notifications.settings.channels')} card>
          <ListRow icon="smartphone" title={t('notifications.settings.push')} subtitle={t('notifications.settings.pushHint')} trailing={<Switch value={channels.push} onValueChange={(v) => setChannels((c) => ({ ...c, push: v }))} />} />
          <ListRow icon="ion:logo-whatsapp" title={t('notifications.settings.whatsapp')} subtitle={t('notifications.settings.whatsappHint')} trailing={<Switch value={channels.whatsapp} onValueChange={(v) => setChannels((c) => ({ ...c, whatsapp: v }))} />} />
          <ListRow icon="message-square" title={t('notifications.settings.sms')} subtitle={t('notifications.settings.smsHint')} trailing={<Switch value={channels.sms} onValueChange={(v) => setChannels((c) => ({ ...c, sms: v }))} />} />
        </Section>

        <Section title={t('notifications.settings.customerMessages')} card>
          <ListRow icon="send" title={t('notifications.settings.autoLink')} subtitle={t('notifications.settings.autoLinkHint')} trailing={<Switch value={autoLink} onValueChange={setAutoLink} />} />
          <ListRow icon="file-text" title={t('notifications.settings.templates')} subtitle={t('notifications.settings.templatesHint')} onPress={() => router.push('/notifications/templates')} />
        </Section>

        <Section card>
          <ListRow icon="moon" title={t('notifications.settings.quietHours')} subtitle={t('notifications.settings.quietHoursHint', { from: f.clock('22:30'), to: f.clock('08:00') })} trailing={<Switch value={quiet} onValueChange={setQuiet} />} />
        </Section>
      </View>
    </Screen>
  );
}
