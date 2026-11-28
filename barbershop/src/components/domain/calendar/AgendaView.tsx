import { ScrollView, View } from 'react-native';

import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { addDays, isSameDay, startOfDay } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { Appointment } from '@/types/models';

import { INACTIVE } from './layout';

export interface AgendaViewProps {
  from: Date;
  days?: number;
  appointments: Appointment[];
  showBarber?: boolean;
  /** Show the date on each row instead of grouping (search results). */
  flat?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}

/** Chronological list grouped by day. */
export function AgendaView({ from, days = 14, appointments, showBarber = true, flat, emptyTitle, emptyBody }: AgendaViewProps) {
  const { colors } = useTheme();
  const { f, t, tp } = useI18n();
  const groups = flat
    ? [{ day: from, items: appointments }]
    : Array.from({ length: days }, (_, i) => addDays(startOfDay(from), i))
        .map((day) => ({ day, items: appointments.filter((a) => isSameDay(new Date(a.start), day)) }))
        .filter((g) => g.items.length);

  if (!groups.length || !groups.some((g) => g.items.length)) {
    return <EmptyState icon="calendar" title={emptyTitle ?? t('calendar.noAppointments')} body={emptyBody ?? t('calendar.noAppointmentsAgenda')} />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110, gap: 22, paddingTop: 8 }}>
      {groups.map(({ day, items }) => {
        const active = items.filter((a) => !INACTIVE.has(a.status));
        const revenue = active.reduce((s, a) => s + a.price, 0);
        const isToday = isSameDay(day, now());
        return (
          <View key={day.toISOString()} style={{ gap: 10 }}>
            {!flat ? (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  {isToday ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }} /> : null}
                  <Text variant="headline" numberOfLines={1}>
                    {isToday ? `${t('common.actions.today')} · ${f.dateShort(day)}` : f.dateLong(day)}
                  </Text>
                </View>
                <Text variant="footnote" tone="secondary">
                  {t('calendar.dayTotals', { count: tp('common.counts.appointments', active.length), revenue: f.money(revenue) })}
                </Text>
              </View>
            ) : null}
            <View style={{ gap: 8 }}>
              {items.map((a) => (
                <AppointmentCard key={a.id} appointment={a} showBarber={showBarber} showDate={flat} />
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
