import { router } from 'expo-router';
import { View } from 'react-native';

import { EmptyState, Header, Icon, IconButton, Pressable, Screen, Section, Text, type IconName } from '@/components/ui';
import { useI18n } from '@/i18n';
import { now, today } from '@/lib/clock';
import { isSameDay } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { AppNotification, NotificationType } from '@/types/models';

export const NOTIFICATION_ICON: Record<NotificationType, IconName> = {
  new_booking: 'plus-circle',
  confirmed: 'check-circle',
  cancelled: 'x-circle',
  rescheduled: 'repeat',
  upcoming: 'clock',
  reminder: 'bell',
  no_show: 'user-x',
  link_expired: 'alert-triangle',
  request: 'inbox',
};

function NotificationRow({ n, onOpen }: { n: AppNotification; onOpen: () => void }) {
  const { colors, status } = useTheme();
  const { t, l, f } = useI18n();
  const look = useLookup();
  const appt = look.appointment(n.appointmentId);
  const customer = look.customer(n.customerId ?? appt?.customerId);
  const service = look.service(appt?.serviceId);
  const start = appt ? new Date(appt.start) : undefined;
  const tone =
    n.type === 'cancelled' ? status.cancelled : n.type === 'no_show' ? status.no_show : n.type === 'confirmed' ? status.completed : n.type === 'link_expired' || n.type === 'request' ? status.pending : n.type === 'rescheduled' ? status.rescheduled : status.confirmed;
  const params = {
    customer: l(customer?.name),
    service: l(service?.name),
    time: start ? f.time(start) : '',
    day: start ? (isSameDay(start, today()) ? t('common.actions.today') : f.dateShort(start)) : '',
  };
  return (
    <Pressable onPress={onOpen} style={{ flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 16 }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: tone.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={NOTIFICATION_ICON[n.type]} size={16} color={tone.fg} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="subhead" weight={n.read ? 'medium' : 'semibold'} style={{ flex: 1 }} numberOfLines={1}>
            {t(`notifications.types.${n.type}.title`)}
          </Text>
          <Text variant="caption" tone="tertiary" weight="regular">
            {f.relative(new Date(n.at), now())}
          </Text>
        </View>
        <Text variant="footnote" tone="secondary" numberOfLines={2}>
          {t(`notifications.types.${n.type}.body`, params)}
        </Text>
      </View>
      {!n.read ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 6 }} /> : null}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const { t } = useI18n();
  const { notifications } = useAppState();
  const actions = useActions();
  const unread = notifications.filter((n) => !n.read).length;
  const todays = notifications.filter((n) => isSameDay(new Date(n.at), today()));
  const earlier = notifications.filter((n) => !isSameDay(new Date(n.at), today()));
  const open = (n: AppNotification) => {
    actions.markNotificationRead(n.id);
    if (n.appointmentId) router.push(`/appointment/${n.appointmentId}`);
  };

  return (
    <Screen
      header={
        <Header
          title={t('notifications.title')}
          backFallback="/owner"
          right={<IconButton icon="sliders" onPress={() => router.push('/notifications/settings')} accessibilityLabel={t('notifications.settingsLink')} />}
        />
      }
    >
      {notifications.length === 0 ? (
        <EmptyState icon="bell" title={t('notifications.empty')} body={t('notifications.emptyBody')} />
      ) : (
        <View style={{ gap: 24, paddingTop: 4 }}>
          {unread > 0 ? (
            <Pressable onPress={() => actions.markNotificationRead('all')} style={{ alignSelf: 'flex-end' }}>
              <Text variant="subhead" tone="accent">
                {t('notifications.markAllRead')}
              </Text>
            </Pressable>
          ) : null}
          {todays.length ? (
            <Section title={t('notifications.today')} card>
              {todays.map((n) => (
                <NotificationRow key={n.id} n={n} onOpen={() => open(n)} />
              ))}
            </Section>
          ) : null}
          {earlier.length ? (
            <Section title={t('notifications.earlier')} card>
              {earlier.map((n) => (
                <NotificationRow key={n.id} n={n} onOpen={() => open(n)} />
              ))}
            </Section>
          ) : null}
        </View>
      )}
    </Screen>
  );
}
