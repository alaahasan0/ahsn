import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { addDays, isSameDay, minutesOfDay, weekdayOf } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { Appointment, Barber, Weekday } from '@/types/models';

import { AppointmentBlock } from './AppointmentBlock';
import { hourRange, INACTIVE, positionColumn } from './layout';

const HOUR = 34;
const TIME_COL = 30;

export interface WeekViewProps {
  weekStart: Date;
  selected: Date;
  barbers: Barber[];
  appointments: Appointment[];
  onPressDay: (d: Date) => void;
  onPressAppointment: (a: Appointment) => void;
}

/** Seven-day overview: density at a glance; tap a day to open it. */
export function WeekView({ weekStart, selected, barbers, appointments, onPressDay, onPressAppointment }: WeekViewProps) {
  const { colors, radius } = useTheme();
  const { f, tp } = useI18n();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const [startHour, endHour] = useMemo(() => {
    let lo = 24;
    let hi = 0;
    for (let i = 0; i < 7; i++) {
      const [a, b] = hourRange(barbers, i as Weekday, []);
      lo = Math.min(lo, a);
      hi = Math.max(hi, b);
    }
    return [lo, hi];
  }, [barbers]);
  const hours = endHour - startHour;
  const byDay = days.map((d) => appointments.filter((a) => isSameDay(new Date(a.start), d)));
  const current = now();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }} stickyHeaderIndices={[0]}>
      <View style={{ flexDirection: 'row', backgroundColor: colors.background, paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }}>
        <View style={{ width: TIME_COL }} />
        {days.map((d, i) => {
          const isSel = isSameDay(d, selected);
          const isToday = isSameDay(d, current);
          const active = byDay[i].filter((a) => !INACTIVE.has(a.status));
          const working = barbers.some((b) => b.schedule[weekdayOf(d)].enabled);
          return (
            <Pressable key={i} onPress={() => onPressDay(d)} accessibilityLabel={`${f.dateLong(d)}, ${tp('common.counts.appointments', active.length)}`} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
              <Text variant="caption" tone={isToday ? 'accent' : 'tertiary'} align="center" style={{ fontSize: 10 }}>
                {f.weekday(d, 'short')}
              </Text>
              <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: isSel ? colors.ink : isToday ? colors.accentSoft : 'transparent' }}>
                <Text variant="subhead" align="center" color={isSel ? colors.inkText : isToday ? colors.accentOnSoft : colors.text} tabular>
                  {f.digits(String(d.getDate()))}
                </Text>
              </View>
              <Text variant="caption" tone="tertiary" align="center" style={{ fontSize: 10, lineHeight: 12 }}>
                {working ? f.digits(String(active.length)) : '–'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', height: hours * HOUR + 12, paddingTop: 6, paddingHorizontal: 4 }}>
        <View style={{ width: TIME_COL }}>
          {Array.from({ length: hours + 1 }).map((_, i) => {
            const h = startHour + i;
            return (
              <Text key={i} variant="caption" tone="tertiary" align="center" style={{ position: 'absolute', top: i * HOUR - 6, start: 0, width: TIME_COL - 4, fontSize: 9, lineHeight: 12 }} tabular>
                {f.digits(String(h % 12 === 0 ? 12 : h % 12))}
              </Text>
            );
          })}
        </View>
        {days.map((d, i) => {
          const positioned = positionColumn(byDay[i], startHour, HOUR);
          const working = barbers.some((b) => b.schedule[weekdayOf(d)].enabled);
          return (
            <View key={i} style={{ flex: 1, height: hours * HOUR, borderStartWidth: StyleSheet.hairlineWidth, borderStartColor: colors.separator, backgroundColor: working ? 'transparent' : colors.surfaceMuted }}>
              {Array.from({ length: hours }).map((_, h) => (
                <View key={h} pointerEvents="none" style={{ position: 'absolute', top: h * HOUR, start: 0, end: 0, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator }} />
              ))}
              <Pressable onPress={() => onPressDay(d)} feedback="none" style={StyleSheet.absoluteFill} accessibilityLabel={f.dateLong(d)} />
              {positioned.map((p) => {
                const w = 100 / p.lanes;
                return (
                  <View key={p.appointment.id} style={{ position: 'absolute', top: p.top + 0.5, height: p.height - 1, start: `${p.lane * w}%`, width: `${w}%`, paddingHorizontal: 1 }}>
                    <AppointmentBlock appointment={p.appointment} height={p.height - 1} compact onPress={() => onPressAppointment(p.appointment)} />
                  </View>
                );
              })}
              {isSameDay(d, current) ? (
                <View pointerEvents="none" style={{ position: 'absolute', top: ((minutesOfDay(current) - startHour * 60) / 60) * HOUR, start: 0, end: 0, height: 1.5, backgroundColor: colors.danger, borderRadius: radius.xs }} />
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
