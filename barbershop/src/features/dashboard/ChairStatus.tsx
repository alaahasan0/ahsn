import { router } from 'expo-router';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain';
import { Pressable, ProgressBar, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { addMinutes } from '@/lib/dates';
import { barberWorksOn } from '@/store/availability';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Appointment, Barber } from '@/types/models';

/** Live state of one chair: who is being served now, or when the next customer is due. */
export function ChairStatus({ barber, todays }: { barber: Barber; todays: Appointment[] }) {
  const { colors, status } = useTheme();
  const { t, l, f } = useI18n();
  const look = useLookup();
  const current = now();
  const mine = todays.filter((a) => a.barberId === barber.id);
  const inChair = mine.find((a) => a.status === 'checked_in');
  const next = mine.find((a) => new Date(a.start) > current && ['confirmed', 'pending', 'draft'].includes(a.status));
  const working = barberWorksOn(barber, current);

  let line: string;
  let progress: number | null = null;
  let dot = colors.textTertiary;
  if (inChair) {
    const start = new Date(inChair.start);
    const end = addMinutes(start, inChair.durationMin);
    line = `${l(look.customer(inChair.customerId)?.name)} · ${l(look.service(inChair.serviceId)?.name)} · ${t('home.until', { time: f.time(end) })}`;
    progress = Math.min(1, Math.max(0, (current.getTime() - start.getTime()) / (end.getTime() - start.getTime())));
    dot = status.checked_in.dot;
  } else if (!working) {
    line = t('home.notWorking');
  } else if (next) {
    line = `${t('home.free')} · ${t('home.nextAt', { time: f.time(new Date(next.start)) })}`;
    dot = colors.success;
  } else {
    line = t('home.doneForDay');
  }

  return (
    <Pressable onPress={() => router.push(inChair ? `/appointment/${inChair.id}` : next ? `/appointment/${next.id}` : '/owner/calendar')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 }}>
      <View>
        <BarberAvatar barber={barber} size={40} />
        <View style={{ position: 'absolute', bottom: -1, end: -1, width: 12, height: 12, borderRadius: 6, backgroundColor: dot, borderWidth: 2, borderColor: colors.surface }} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="callout" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
            {l(barber.name)}
          </Text>
          {inChair ? (
            <Text variant="caption" color={status.checked_in.fg}>
              {t('home.inChair')}
            </Text>
          ) : null}
        </View>
        <Text variant="footnote" tone="secondary" numberOfLines={1}>
          {line}
        </Text>
        {progress !== null ? <ProgressBar value={progress} height={4} color={status.checked_in.dot} style={{ marginTop: 2 }} /> : null}
      </View>
    </Pressable>
  );
}
