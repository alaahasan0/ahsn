import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { barberShortName } from '@/components/domain/BarberAvatar';
import { DateStrip } from '@/components/domain/DateStrip';
import { TimeSlotGrid } from '@/components/domain/TimeSlotGrid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { addDays, isSameDay } from '@/lib/dates';
import { barberWorksOn, slotsFor, suggestAlternatives, type SlotOption } from '@/store/availability';
import { useAvailabilityContext, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Service } from '@/types/models';

export interface SlotPickerProps {
  service: Service;
  barberId: string | 'any';
  date: Date;
  onChangeDate: (d: Date) => void;
  value: SlotOption | null;
  onChange: (s: SlotOption) => void;
  ignoreAppointmentId?: string;
  /** A time someone asked for (e.g. tapped in the calendar). If it is taken, alternatives show straight away. */
  requested?: Date;
}

/** Date strip + time grid with a polished "taken → alternatives" state. Mock availability only. */
export function SlotPicker({ service, barberId, date, onChangeDate, value, onChange, ignoreAppointmentId, requested }: SlotPickerProps) {
  const { colors } = useTheme();
  const { t, f, l } = useI18n();
  const ctx = useAvailabilityContext();
  const look = useLookup();
  const [taken, setTaken] = useState<SlotOption | null>(() => {
    if (!requested || value) return null;
    const hit = slotsFor(ctx, barberId, requested, service, ignoreAppointmentId).find((s) => s.start.getTime() === requested.getTime());
    return hit && !hit.available && hit.reason !== 'past' ? hit : null;
  });

  const eligible = useMemo(() => ctx.barbers.filter((b) => b.active && service.barberIds.includes(b.id) && (barberId === 'any' || b.id === barberId)), [ctx.barbers, service, barberId]);
  const slots = useMemo(() => slotsFor(ctx, barberId, date, service, ignoreAppointmentId).filter((s) => s.reason !== 'past'), [ctx, barberId, date, service, ignoreAppointmentId]);
  const open = slots.filter((s) => s.available);
  const alternatives = useMemo(() => (taken ? suggestAlternatives(ctx, barberId, taken.start, service, 4) : []), [taken, ctx, barberId, service]);
  const nextFree = useMemo(() => {
    if (open.length) return null;
    for (let i = 1; i <= 21; i++) {
      const d = addDays(date, i);
      if (slotsFor(ctx, barberId, d, service, ignoreAppointmentId).some((s) => s.available)) return d;
    }
    return null;
  }, [open.length, date, ctx, barberId, service, ignoreAppointmentId]);

  const pick = (s: SlotOption) => {
    setTaken(null);
    if (!isSameDay(s.start, date)) onChangeDate(s.start);
    onChange(s);
  };

  return (
    <View style={{ gap: 18 }}>
      <DateStrip
        value={date}
        start={today()}
        days={28}
        contentPadding={0}
        onChange={(d) => {
          setTaken(null);
          onChangeDate(d);
        }}
        disabled={(d) => !eligible.some((b) => barberWorksOn(b, d))}
        marked={(d) => isSameDay(d, value?.start ?? new Date(0))}
      />
      {taken ? (
        <Card variant="outline" style={{ gap: 12, borderColor: colors.warning, backgroundColor: colors.warningSoft }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="alert-circle" size={18} color={colors.warning} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="callout" weight="semibold">
                {t('appointment.new.unavailableTitle', { time: f.time(taken.start) })}
              </Text>
              <Text variant="footnote" tone="secondary">
                {alternatives.length ? t('appointment.new.unavailableBody') : t('appointment.new.unavailableNone')}
              </Text>
            </View>
          </View>
          {alternatives.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {alternatives.map((s) => {
                const b = look.barber(s.barberId);
                const sameDay = isSameDay(s.start, taken.start);
                return <Chip key={`${s.start.getTime()}${s.barberId}`} icon="clock" label={`${sameDay ? '' : `${f.dayShort(s.start)} · `}${f.time(s.start)}${barberId === 'any' && b ? ` · ${barberShortName(b, l)}` : ''}`} onPress={() => pick(s)} />;
              })}
            </View>
          ) : null}
        </Card>
      ) : null}
      {open.length === 0 ? (
        <View style={{ gap: 6 }}>
          <EmptyState compact icon="calendar" title={t('appointment.new.noSlots')} body={t('appointment.new.noSlotsBody')} />
          {nextFree ? <Button label={t('appointment.new.nextFreeDay', { date: f.dateShort(nextFree) })} variant="secondary" icon="arrow-right" onPress={() => onChangeDate(nextFree)} style={{ alignSelf: 'center' }} /> : null}
        </View>
      ) : (
        <TimeSlotGrid slots={slots} value={value?.start} onChange={pick} onUnavailablePress={setTaken} />
      )}
      {value && barberId === 'any' && isSameDay(value.start, date) ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="user-check" size={14} color={colors.success} />
          <Text variant="footnote" tone="secondary">
            {t('appointment.new.assignedTo', { name: l(look.barber(value.barberId)?.name) })}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
