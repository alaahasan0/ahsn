import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { barberShortName } from '@/components/domain/BarberAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { addMinutes, isSameDay, startOfDay } from '@/lib/dates';
import { now } from '@/lib/clock';
import { useActions } from '@/store/AppStore';
import { isSlotFree, type SlotOption } from '@/store/availability';
import { useAppointment, useAvailabilityContext, useBarbers, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';

import { SlotPicker } from './SlotPicker';

export default function RescheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = useAppointment(id);
  const { colors } = useTheme();
  const { t, l, f } = useI18n();
  const toast = useToast();
  const actions = useActions();
  const look = useLookup();
  const ctx = useAvailabilityContext();
  const barbers = useBarbers();
  const original = a ? new Date(a.start) : now();
  const [barberId, setBarberId] = useState(a?.barberId ?? '');
  const [date, setDate] = useState(original < now() ? startOfDay(now()) : startOfDay(original));
  const [slot, setSlot] = useState<SlotOption | null>(null);
  const [notify, setNotify] = useState(true);

  if (!a) {
    return (
      <Screen header={<Header title={t('appointment.reschedule.title')} />}>
        <EmptyState icon="calendar" title={t('appointment.notFound')} body={t('appointment.notFoundBody')} />
      </Screen>
    );
  }
  const service = look.service(a.serviceId)!;
  const customer = look.customer(a.customerId);
  const eligible = barbers.filter((b) => service.barberIds.includes(b.id));

  const confirm = () => {
    if (!slot) return;
    if (!isSlotFree(ctx, barberId, slot.start, service, a.id)) {
      toast({ message: t('appointment.new.conflict'), tone: 'danger' });
      setSlot(null);
      return;
    }
    const next = actions.rescheduleAppointment(a.id, slot.start, barberId);
    if (notify && next) actions.resendConfirmation(next.id, a.confirmation?.channel ?? (customer?.whatsapp ? 'whatsapp' : 'sms'));
    toast({ message: t('appointment.toast.rescheduled'), description: notify ? t('common.toast.simulated') : undefined, icon: 'repeat' });
    if (next) router.replace(`/appointment/${next.id}`);
  };

  return (
    <Screen
      header={<Header title={t('appointment.reschedule.title')} subtitle={l(customer?.name)} />}
      footer={
        <View style={{ gap: 8 }}>
          {slot ? (
            <Text variant="footnote" tone="secondary" align="center">
              {`${f.dateShort(slot.start)} · ${f.timeRange(slot.start, addMinutes(slot.start, a.durationMin))}`}
            </Text>
          ) : null}
          <Button label={t('appointment.reschedule.confirm')} icon="check" onPress={confirm} disabled={!slot} testID="reschedule-confirm" />
        </View>
      }
    >
      <View style={{ gap: 22, paddingTop: 4 }}>
        <Card variant="muted" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="clock" size={18} color={colors.textSecondary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="caption" tone="tertiary">
              {t('appointment.reschedule.current')}
            </Text>
            <Text variant="callout" weight="semibold" style={{ textDecorationLine: 'line-through' }}>
              {`${f.dateShort(original)} · ${f.time(original)}`}
            </Text>
            <Text variant="footnote" tone="secondary">
              {`${l(service.name)} · ${l(look.barber(a.barberId)?.name)}`}
            </Text>
          </View>
        </Card>

        <View style={{ gap: 10 }}>
          <Text variant="overline" tone="tertiary">
            {t('common.labels.barber')}
          </Text>
          <ChipRow contentPadding={0}>
            {eligible.map((b) => (
              <Chip key={b.id} label={barberShortName(b, l)} dot={b.color} selected={barberId === b.id} onPress={() => { setBarberId(b.id); setSlot(null); }} />
            ))}
          </ChipRow>
        </View>

        <View style={{ gap: 10 }}>
          <Text variant="title3">{t('appointment.reschedule.pickTime')}</Text>
          <SlotPicker service={service} barberId={barberId} date={date} onChangeDate={(d) => { setDate(d); if (slot && !isSameDay(slot.start, d)) setSlot(null); }} value={slot} onChange={setSlot} ignoreAppointmentId={a.id} />
        </View>

        <Card variant="outline" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="callout" weight="semibold">
              {t('appointment.reschedule.notify')}
            </Text>
            <Text variant="footnote" tone="secondary">
              {t('appointment.reschedule.notifyBody')}
            </Text>
          </View>
          <Switch value={notify} onValueChange={setNotify} accessibilityLabel={t('appointment.reschedule.notify')} />
        </Card>
      </View>
    </Screen>
  );
}
