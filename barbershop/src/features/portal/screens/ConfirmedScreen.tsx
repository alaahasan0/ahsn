import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { addMinutes } from '@/lib/dates';
import { useAppointment, useBarber, useService } from '@/store/selectors';

import { useBookingDraft } from '../BookingDraft';
import { PortalShell } from '../PortalShell';
import { SalonNotFound, StateHero, SummaryRow } from '../shared';

export default function ConfirmedScreen() {
  const { t, l, f } = useI18n();
  const toast = useToast();
  const { salon, draft, reset, path } = useBookingDraft();
  const appt = useAppointment(draft.appointmentId);
  const service = useService(appt?.serviceId);
  const barber = useBarber(appt?.barberId);
  if (!salon) return <SalonNotFound />;
  if (!appt) return <Redirect href={path() as never} />;
  const start = new Date(appt.start);
  const token = appt.confirmation?.token;
  const simulated = (message: string) => toast({ message, description: t('common.toast.simulated') });

  return (
    <PortalShell
      salonName={salon.name}
      testID="portal-confirmed"
      footer={
        <>
          <Button label={t('portal.confirmed.manage')} size="lg" icon="settings" onPress={() => token && router.push(`/m/${token}` as never)} />
          <Button
            label={t('portal.confirmed.bookAnother')}
            variant="ghost"
            onPress={() => {
              reset();
              router.replace(path() as never);
            }}
          />
        </>
      }
    >
      <StateHero icon="check" tone="success" title={t('portal.confirmed.title')} body={t('portal.confirmed.body', { channel: t(`common.phone.channels.${draft.channel}`) })} />
      <Section card>
        <SummaryRow icon="scissors" label={t('portal.review.service')} value={l(service?.name)} sub={`${barber ? l(barber.name) : ''} · ${f.money(appt.price)}`} />
        <SummaryRow icon="calendar" label={t('portal.review.when')} value={f.dateLong(start)} sub={f.timeRange(start, addMinutes(start, appt.durationMin))} />
        <SummaryRow icon="map-pin" label={t('common.labels.address')} value={l(salon.address)} sub={l(salon.city)} />
      </Section>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button label={t('portal.confirmed.addToCalendar')} icon="calendar" variant="secondary" style={{ flex: 1 }} onPress={() => simulated(t('portal.confirmed.addToCalendar'))} />
        <Button label={t('portal.confirmed.share')} icon="share" variant="secondary" style={{ flex: 1 }} onPress={() => simulated(t('portal.confirmed.share'))} />
      </View>
      {token ? (
        <Card variant="muted" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
            {t('portal.confirmed.reference')}
          </Text>
          <Text variant="subhead" style={{ writingDirection: 'ltr', letterSpacing: 1 }}>
            {token.toUpperCase()}
          </Text>
        </Card>
      ) : null}
    </PortalShell>
  );
}
