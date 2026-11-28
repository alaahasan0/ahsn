import { router } from 'expo-router';
import { View } from 'react-native';

import { SourceTag } from '@/components/domain/Badges';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { now, today } from '@/lib/clock';
import { addMinutes, atClock, isSameDay } from '@/lib/dates';
import { useAppState } from '@/store/AppStore';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Appointment, Barber } from '@/types/models';

type Item = { kind: 'appt'; start: Date; end: Date; appointment: Appointment } | { kind: 'break' | 'block'; start: Date; end: Date; note?: string } | { kind: 'gap'; start: Date; end: Date };

/** Compact vertical timeline of a barber's day, with breaks and free gaps. */
export function ScheduleTimeline({ barber, appointments, currentId }: { barber: Barber; appointments: Appointment[]; currentId?: string }) {
  const { colors, radius, status } = useTheme();
  const { t, l, f } = useI18n();
  const look = useLookup();
  const { blocks } = useAppState();
  const day = today();
  const sched = barber.schedule[day.getDay() as 0];
  const current = now();

  const items: Item[] = [];
  for (const a of appointments) {
    if (a.status === 'rescheduled' || a.status === 'expired') continue;
    const s = new Date(a.start);
    items.push({ kind: 'appt', start: s, end: addMinutes(s, a.durationMin), appointment: a });
  }
  for (const b of sched.breaks) items.push({ kind: 'break', start: atClock(day, b.start), end: atClock(day, b.end) });
  for (const b of blocks) {
    if ((b.barberId === barber.id || b.barberId === 'all') && isSameDay(new Date(b.start), day)) items.push({ kind: 'block', start: new Date(b.start), end: new Date(b.end), note: b.note });
  }
  items.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Free gaps between occupied items (cancelled/no-show free their slot).
  const occupied = items.filter((i) => !(i.kind === 'appt' && ['cancelled', 'no_show'].includes(i.appointment.status)));
  const withGaps: Item[] = [];
  let cursor = atClock(day, sched.start);
  const close = atClock(day, sched.end);
  const pushGap = (until: Date) => {
    const mins = Math.round((until.getTime() - cursor.getTime()) / 60000);
    if (mins >= 15) withGaps.push({ kind: 'gap', start: cursor, end: until });
  };
  for (const it of items) {
    const occ = occupied.includes(it);
    if (occ && it.start > cursor) pushGap(it.start);
    withGaps.push(it);
    if (occ && it.end > cursor) cursor = it.end;
  }
  if (close > cursor) pushGap(close);

  return (
    <View>
      {withGaps.map((it, idx) => {
        const last = idx === withGaps.length - 1;
        const past = it.end <= current;
        const isCurrent = it.kind === 'appt' && it.appointment.id === currentId;
        const dot = it.kind === 'appt' ? status[it.appointment.status].dot : it.kind === 'gap' ? 'transparent' : colors.borderStrong;
        return (
          <View key={`${it.kind}${it.start.getTime()}${idx}`} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ width: 62, paddingTop: it.kind === 'gap' ? 6 : 14 }}>
              {it.kind !== 'gap' ? (
                <Text variant="caption" tone={past ? 'tertiary' : 'secondary'} tabular numberOfLines={1}>
                  {f.time(it.start)}
                </Text>
              ) : null}
            </View>
            <View style={{ width: 14, alignItems: 'center' }}>
              <View style={{ width: 2, height: it.kind === 'gap' ? 8 : 16, backgroundColor: idx === 0 ? 'transparent' : colors.separator }} />
              {it.kind === 'gap' ? null : <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot, borderWidth: isCurrent ? 2 : 0, borderColor: colors.accent }} />}
              <View style={{ width: 2, flex: 1, backgroundColor: last ? 'transparent' : colors.separator }} />
            </View>
            <View style={{ flex: 1, paddingVertical: 4 }}>
              {it.kind === 'appt' ? (
                <Pressable
                  onPress={() => router.push(`/appointment/${it.appointment.id}`)}
                  style={{
                    padding: 12,
                    borderRadius: radius.md,
                    backgroundColor: isCurrent ? colors.accentSoft : colors.surface,
                    borderWidth: 1,
                    borderColor: isCurrent ? colors.accent : colors.border,
                    opacity: past && !isCurrent ? 0.6 : 1,
                    gap: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text variant="callout" weight="semibold" numberOfLines={1} style={{ flex: 1, textDecorationLine: it.appointment.status === 'cancelled' ? 'line-through' : 'none' }}>
                      {l(look.customer(it.appointment.customerId)?.name)}
                    </Text>
                    {it.appointment.status === 'completed' ? (
                      <Icon name="check" size={15} color={colors.success} />
                    ) : (
                      <Text variant="caption" color={status[it.appointment.status].fg}>
                        {t(`domain.status.${it.appointment.status === 'pending' ? 'pendingShort' : it.appointment.status}`)}
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
                      {l(look.service(it.appointment.serviceId)?.name)} · {f.duration(it.appointment.durationMin)}
                    </Text>
                    <SourceTag source={it.appointment.source} showLabel={false} />
                  </View>
                </Pressable>
              ) : it.kind === 'gap' ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: radius.sm,
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: colors.border,
                    alignSelf: 'flex-start',
                    opacity: past ? 0.5 : 1,
                  }}
                >
                  <Icon name="plus" size={12} color={colors.textTertiary} />
                  <Text variant="caption" tone="tertiary">
                    {f.time(it.start)} · {t('barber.free', { duration: f.duration(Math.round((it.end.getTime() - it.start.getTime()) / 60000)) })}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, opacity: past ? 0.6 : 1 }}>
                  <Icon name={it.kind === 'break' ? 'coffee' : 'slash'} size={14} color={colors.textSecondary} />
                  <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
                    {it.kind === 'break' ? t('barber.breakLabel') : (it.note ?? t('barber.blocked'))} · {f.timeRange(it.start, it.end)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
