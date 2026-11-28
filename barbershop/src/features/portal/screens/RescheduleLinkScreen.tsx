import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { DateStrip } from '@/components/domain/DateStrip';
import { TimeSlotGrid } from '@/components/domain/TimeSlotGrid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { startOfDay } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { slotsFor, type SlotOption } from '@/store/availability';
import { useService } from '@/store/selectors';

import { PortalShell } from '../PortalShell';
import { StateHero } from '../shared';
import { usePortalAvailability } from '../usePortalAvailability';
import { useLinkAppointment } from '../useLinkAppointment';
import { canChangeOnline } from './ManageLinkScreen';

export default function RescheduleLinkScreen() {
  const { t, l, f } = useI18n();
  const { token } = useLocalSearchParams<{ token: string }>();
  const appt = useLinkAppointment(token);
  const { salon } = useAppState();
  const actions = useActions();
  const service = useService(appt?.serviceId);
  const ctx = usePortalAvailability();
  const [day, setDay] = useState(() => (appt ? startOfDay(new Date(appt.start)) : today()));
  const [slot, setSlot] = useState<SlotOption | undefined>();
  const [doneAt, setDoneAt] = useState<Date | null>(null);
  const slots = useMemo(() => (appt && service ? slotsFor(ctx, appt.barberId, day, service, appt.id).filter((s) => s.reason !== 'past') : []), [ctx, appt, service, day]);

  if (!appt || !service)
    return (
      <PortalShell salonName={salon.name} back>
        <EmptyState icon="link-2" title={t('portal.link.notFoundTitle')} body={t('portal.link.notFoundBody')} />
      </PortalShell>
    );

  if (doneAt) {
    return (
      <PortalShell salonName={salon.name} footer={<Button label={t('portal.reschedule.backToBooking')} size="lg" onPress={() => router.replace(`/m/${token}` as never)} />}>
        <StateHero icon="check" tone="success" title={t('portal.reschedule.done')} body={t('portal.reschedule.doneBody', { when: `${f.dateLong(doneAt)} · ${f.time(doneAt)}` })} />
      </PortalShell>
    );
  }

  const start = new Date(appt.start);
  if (!canChangeOnline(start, salon.cancellationPolicyHours) || !['pending', 'confirmed'].includes(appt.status)) {
    return <Redirect href={`/m/${token}` as never} />;
  }

  return (
    <PortalShell
      salonName={salon.name}
      back
      title={t('portal.reschedule.title')}
      footer={
        <Button
          label={slot ? `${t('portal.reschedule.save')} · ${f.time(slot.start)}` : t('portal.reschedule.save')}
          size="lg"
          disabled={!slot}
          testID="link-reschedule-save"
          onPress={() => {
            if (!slot) return;
            actions.rescheduleAppointment(appt.id, slot.start, slot.barberId, 'customer');
            setDoneAt(slot.start);
          }}
        />
      }
    >
      <Card variant="muted" style={{ gap: 2 }}>
        <Text variant="caption" tone="tertiary">
          {t('portal.reschedule.current')}
        </Text>
        <Text variant="callout" weight="medium">
          {l(service.name)} · {f.dateShort(start)} · {f.time(start)}
        </Text>
      </Card>
      <View style={{ marginHorizontal: -20 }}>
        <DateStrip
          value={day}
          onChange={(d) => {
            setDay(d);
            setSlot(undefined);
          }}
        />
      </View>
      {slots.some((s) => s.available) ? (
        <TimeSlotGrid slots={slots} value={slot?.start} onChange={setSlot} columns={3} />
      ) : (
        <EmptyState icon="calendar" title={t('portal.time.none')} body={t('portal.time.noneBody')} compact />
      )}
    </PortalShell>
  );
}
