import { router } from 'expo-router';
import { View } from 'react-native';

import { SOURCE_ICON } from '@/components/domain';
import { Icon, Pressable, Text, type IconName } from '@/components/ui';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { ActivityEvent } from '@/types/models';

const KIND_ICON: Record<ActivityEvent['kind'], IconName> = {
  created: 'plus-circle',
  confirmed: 'check-circle',
  cancelled: 'x-circle',
  rescheduled: 'repeat',
  link_sent: 'send',
  link_opened: 'eye',
  link_expired: 'alert-triangle',
  request: 'inbox',
  checked_in: 'user-check',
  completed: 'check',
  no_show: 'user-x',
};

export function useActivityTone() {
  const { colors } = useTheme();
  return (kind: ActivityEvent['kind']) =>
    kind === 'confirmed' || kind === 'completed' || kind === 'checked_in'
      ? { fg: colors.success, bg: colors.successSoft }
      : kind === 'cancelled' || kind === 'no_show'
        ? { fg: colors.danger, bg: colors.dangerSoft }
        : kind === 'link_expired' || kind === 'request'
          ? { fg: colors.warning, bg: colors.warningSoft }
          : { fg: colors.textSecondary, bg: colors.surfaceMuted };
}

/** One line of booking activity: what happened, to whom, when and from which channel. */
export function ActivityItem({ event }: { event: ActivityEvent }) {
  const { colors } = useTheme();
  const { t, l, f } = useI18n();
  const look = useLookup();
  const tone = useActivityTone()(event.kind);
  const appt = look.appointment(event.appointmentId);
  const customer = look.customer(appt?.customerId);
  const service = look.service(appt?.serviceId);
  return (
    <Pressable onPress={() => router.push(`/appointment/${event.appointmentId}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tone.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={KIND_ICON[event.kind]} size={15} color={tone.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="subhead" weight="regular" numberOfLines={1}>
          {t(`home.activityKinds.${event.kind}`, { customer: l(customer?.name), service: l(service?.name) })}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name={SOURCE_ICON[event.source]} size={11} color={event.source === 'whatsapp' ? colors.whatsapp : colors.textTertiary} />
          <Text variant="caption" tone="tertiary" weight="regular" numberOfLines={1}>
            {appt ? `${f.dateShort(new Date(appt.start))} · ${f.time(new Date(appt.start))}` : ''}
          </Text>
        </View>
      </View>
      <Text variant="caption" tone="tertiary" weight="regular">
        {f.relative(new Date(event.at), now())}
      </Text>
    </Pressable>
  );
}
