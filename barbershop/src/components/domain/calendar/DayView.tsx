import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';

import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { atClock, clockToMinutes, isSameDay, minutesOfDay, minutesToClock, toISODate, weekdayOf } from '@/lib/dates';
import { blockReasonKey } from './keys';
import { useTheme } from '@/theme';
import type { Appointment, Barber, TimeBlock } from '@/types/models';

import { barberShortName, BarberAvatar } from '../BarberAvatar';
import { AppointmentBlock } from './AppointmentBlock';
import { hourRange, INACTIVE, positionColumn } from './layout';

export interface DayViewProps {
  date: Date;
  barbers: Barber[];
  appointments: Appointment[];
  blocks: TimeBlock[];
  onPressAppointment: (a: Appointment) => void;
  onPressSlot?: (barberId: string, start: Date) => void;
  onPressBarber?: (barberId: string) => void;
}

const HOUR = 76;
const TIME_COL = 58;
const SLOT_MIN = 15;

interface Shade {
  top: number;
  height: number;
  kind: 'closed' | 'break' | 'blocked';
  label?: string;
}

export function DayView({ date, barbers, appointments, blocks, onPressAppointment, onPressSlot, onPressBarber }: DayViewProps) {
  const { colors, radius } = useTheme();
  const { f, t, l } = useI18n();
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const wd = weekdayOf(date);
  const [startHour, endHour] = useMemo(() => hourRange(barbers, wd, appointments), [barbers, wd, appointments]);
  const hours = endHour - startHour;
  const height = hours * HOUR;
  const showHeader = barbers.length > 1;
  const available = Math.max(0, width - TIME_COL - 8);
  const colW = barbers.length ? Math.max(barbers.length > 1 ? 104 : available, available / barbers.length) : available;
  const needsHScroll = colW * barbers.length > available + 1;
  const isToday = isSameDay(date, now());
  const toTop = (min: number) => ((min - startHour * 60) / 60) * HOUR;

  useEffect(() => {
    if (!width) return;
    const focus = isToday ? minutesOfDay(now()) - 60 : Math.min(...appointments.filter((a) => !INACTIVE.has(a.status)).map((a) => minutesOfDay(new Date(a.start))), (startHour + 1) * 60) - 30;
    const y = Math.max(0, toTop(focus));
    const id = setTimeout(() => scrollRef.current?.scrollTo({ y, animated: false }), 30);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, toISODate(date)]);

  const columns = useMemo(
    () =>
      barbers.map((b) => {
        const sched = b.schedule[wd];
        const off = !sched.enabled || b.daysOff.includes(toISODate(date));
        const shades: Shade[] = [];
        if (off) shades.push({ top: 0, height, kind: 'closed', label: t('calendar.dayOff') });
        else {
          const s = clockToMinutes(sched.start);
          const e = clockToMinutes(sched.end);
          if (s > startHour * 60) shades.push({ top: 0, height: toTop(s), kind: 'closed' });
          if (e < endHour * 60) shades.push({ top: toTop(e), height: height - toTop(e), kind: 'closed' });
          for (const br of sched.breaks) shades.push({ top: toTop(clockToMinutes(br.start)), height: ((clockToMinutes(br.end) - clockToMinutes(br.start)) / 60) * HOUR, kind: 'break', label: t('calendar.break') });
          for (const bl of blocks) {
            if ((bl.barberId !== b.id && bl.barberId !== 'all') || !isSameDay(new Date(bl.start), date)) continue;
            const bs = minutesOfDay(new Date(bl.start));
            const be = minutesOfDay(new Date(bl.end));
            shades.push({ top: toTop(bs), height: ((be - bs) / 60) * HOUR, kind: 'blocked', label: bl.note || t(blockReasonKey(bl.reason)) });
          }
        }
        const mine = appointments.filter((a) => a.barberId === b.id);
        return { barber: b, off, shades, sched, positioned: positionColumn(mine, startHour, HOUR), count: mine.filter((a) => !INACTIVE.has(a.status)).length };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [barbers, appointments, blocks, date.getTime(), startHour, endHour],
  );

  const gridWidth = needsHScroll ? TIME_COL + colW * barbers.length + 8 : '100%';
  const header = showHeader ? (
        <View key="h" style={{ width: gridWidth, flexDirection: 'row', backgroundColor: colors.background, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator }}>
          <View style={{ width: TIME_COL }} />
          {columns.map(({ barber, count, off }) => (
            <Pressable key={barber.id} onPress={() => onPressBarber?.(barber.id)} style={{ width: colW, alignItems: 'center', gap: 4 }} accessibilityLabel={l(barber.name)}>
              <BarberAvatar barber={barber} size={30} />
              <Text variant="caption" numberOfLines={1} align="center">
                {barberShortName(barber, l)}
              </Text>
              <Text variant="caption" tone="tertiary" numberOfLines={1} align="center" style={{ fontSize: 10, lineHeight: 12 }}>
                {off ? t('calendar.dayOff') : f.digits(String(count))}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null;
  const body = (
      <View key="b" style={{ width: gridWidth, flexDirection: 'row', height: height + 16, paddingTop: 8 }}>
        <View style={{ width: TIME_COL }}>
          {Array.from({ length: hours + 1 }).map((_, i) => (
            <Text key={i} variant="caption" tone="tertiary" align="center" style={{ position: 'absolute', top: i * HOUR - 7, start: 0, width: TIME_COL - 6, fontSize: 10, lineHeight: 14 }} tabular>
              {f.clock(minutesToClock((startHour + i) * 60))}
            </Text>
          ))}
        </View>
        {columns.map(({ barber, shades, positioned, off, sched }) => (
          <View key={barber.id} style={{ width: colW, height, borderStartWidth: StyleSheet.hairlineWidth, borderStartColor: colors.separator }}>
            {Array.from({ length: hours }).map((_, i) => (
              <View key={i} pointerEvents="none" style={{ position: 'absolute', top: i * HOUR, start: 0, end: 0, height: HOUR, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator }}>
                <View style={{ position: 'absolute', top: HOUR / 2, start: 0, end: 0, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator, opacity: 0.5 }} />
              </View>
            ))}
            {!off && onPressSlot
              ? Array.from({ length: (hours * 60) / SLOT_MIN }).map((_, i) => {
                  const min = startHour * 60 + i * SLOT_MIN;
                  if (min < clockToMinutes(sched.start) || min >= clockToMinutes(sched.end)) return null;
                  return (
                    <Pressable
                      key={i}
                      feedback="opacity"
                      accessibilityLabel={`${t('calendar.newAppointment')} ${f.clock(minutesToClock(min))}`}
                      onPress={() => onPressSlot(barber.id, atClock(date, minutesToClock(min)))}
                      style={{ position: 'absolute', top: toTop(min), height: (SLOT_MIN / 60) * HOUR, start: 0, end: 0 }}
                    />
                  );
                })
              : null}
            {shades.map((s, i) => (
              <View
                key={i}
                pointerEvents={s.kind === 'closed' ? 'auto' : 'none'}
                style={{
                  position: 'absolute',
                  top: s.top,
                  height: s.height,
                  start: s.kind === 'closed' ? 0 : 2,
                  end: s.kind === 'closed' ? 0 : 2,
                  backgroundColor: s.kind === 'closed' ? colors.surfaceMuted : s.kind === 'blocked' ? colors.warningSoft : colors.surfaceMuted,
                  opacity: s.kind === 'closed' ? 0.7 : 1,
                  borderRadius: s.kind === 'closed' ? 0 : radius.xs,
                  borderWidth: s.kind === 'blocked' ? 1 : 0,
                  borderColor: colors.warning,
                  borderStyle: 'dashed',
                  padding: 4,
                  overflow: 'hidden',
                  alignItems: s.kind === 'closed' && off ? 'center' : undefined,
                  justifyContent: s.kind === 'closed' && off ? 'center' : undefined,
                }}
              >
                {s.label && s.height >= 16 ? (
                  <Text variant="caption" tone={s.kind === 'blocked' ? 'warning' : 'tertiary'} numberOfLines={s.height > 40 ? 2 : 1} style={{ fontSize: 10, lineHeight: 13 }} align={off ? 'center' : 'start'}>
                    {s.label}
                  </Text>
                ) : null}
              </View>
            ))}
            {positioned.map((p) => {
              const laneW = (colW - 6) / p.lanes;
              return (
                <View key={p.appointment.id} style={{ position: 'absolute', top: p.top + 1, height: p.height - 2, start: 3 + p.lane * laneW, width: laneW - (p.lanes > 1 ? 2 : 0) }}>
                  <AppointmentBlock appointment={p.appointment} height={p.height - 2} onPress={() => onPressAppointment(p.appointment)} />
                </View>
              );
            })}
          </View>
        ))}
        {isToday && minutesOfDay(now()) >= startHour * 60 && minutesOfDay(now()) <= endHour * 60 ? (
          <View pointerEvents="none" style={{ position: 'absolute', top: 8 + toTop(minutesOfDay(now())) - 4, start: TIME_COL - 4, end: 0, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }} />
            <View style={{ flex: 1, height: 1.5, backgroundColor: colors.danger }} />
          </View>
        ) : null}
      </View>
  );
  const content = showHeader ? [header, body] : [body];

  return (
    <View style={{ flex: 1 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width ? (
        needsHScroll ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <ScrollView ref={scrollRef} stickyHeaderIndices={showHeader ? [0] : undefined} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
              {content}
            </ScrollView>
          </ScrollView>
        ) : (
          <ScrollView ref={scrollRef} stickyHeaderIndices={showHeader ? [0] : undefined} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
            {content}
          </ScrollView>
        )
      ) : null}
    </View>
  );
}
