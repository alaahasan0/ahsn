import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Section } from '@/components/ui/Section';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { addMinutes } from '@/lib/dates';
import { phonesEqual } from '@/lib/phone';
import { useActions, useAppState } from '@/store/AppStore';
import { useBarber, useService } from '@/store/selectors';
import { useTheme } from '@/theme';

import { useBookingDraft } from '../BookingDraft';
import { PortalShell } from '../PortalShell';
import { SalonNotFound, SummaryRow } from '../shared';

export default function ReviewStep() {
  const { colors } = useTheme();
  const { t, l, f } = useI18n();
  const { salon, draft, update, path } = useBookingDraft();
  const { customers } = useAppState();
  const actions = useActions();
  const service = useService(draft.serviceId);
  const barber = useBarber(draft.slot?.barberId);
  if (!salon) return <SalonNotFound />;
  if (!draft.slot || !service || !draft.verified) return <Redirect href={path(draft.slot ? 'verify' : 'service') as never} />;
  const start = draft.slot.start;

  const book = () => {
    const whatsapp = draft.whatsappSame ? draft.phone : draft.whatsapp.number ? draft.whatsapp : undefined;
    let customer = customers.find((c) => phonesEqual(c.phone, draft.phone));
    if (!customer) {
      customer = actions.createCustomer({
        name: { en: draft.name.trim(), ar: draft.name.trim() },
        phone: draft.phone,
        whatsapp,
        whatsappVerification: 'pending',
        preferredChannel: draft.channel,
        preferredBarberId: draft.barberId === 'any' ? undefined : draft.barberId,
        preferredServiceIds: [service.id],
        category: 'new',
        categoryManual: false,
        marketingOptIn: false,
      });
    }
    const appt = actions.createAppointment({
      customerId: customer.id,
      serviceId: service.id,
      barberId: draft.slot!.barberId,
      start,
      source: 'online',
      createdBy: 'customer',
      status: 'confirmed',
      sendLink: true,
      linkChannel: draft.channel === 'sms' ? 'sms' : 'whatsapp',
      note: draft.notes.trim() || undefined,
      autoAssigned: draft.barberId === 'any',
    });
    update({ appointmentId: appt.id });
    router.replace(path('confirmed') as never);
  };

  return (
    <PortalShell
      salonName={salon.name}
      step="review"
      back
      title={t('portal.review.title')}
      footer={
        <>
          <Button label={t('portal.review.confirm')} size="lg" icon="check" onPress={book} testID="portal-confirm" />
          <Text variant="caption" tone="tertiary" align="center">
            {t('portal.review.agree')}
          </Text>
        </>
      }
    >
      <Section card>
        <SummaryRow icon="scissors" label={t('portal.review.service')} value={l(service.name)} sub={f.duration(service.durationMin)} />
        <SummaryRow icon="user" label={t('portal.review.barber')} value={barber ? l(barber.name) : t('portal.barber.any')} sub={draft.barberId === 'any' ? t('portal.barber.anyBody') : undefined} />
        <SummaryRow icon="calendar" label={t('portal.review.when')} value={f.dateLong(start)} sub={f.timeRange(start, addMinutes(start, service.durationMin))} />
        <SummaryRow icon="map-pin" label={t('common.labels.address')} value={l(salon.address)} sub={l(salon.city)} />
      </Section>
      <Section card>
        <SummaryRow icon="user-check" label={t('portal.review.customer')} value={draft.name} />
        <SummaryRow icon="phone" label={t('portal.review.phone')} value={f.phone(draft.phone.country, draft.phone.number)} ltr />
        {!draft.whatsappSame && draft.whatsapp.number ? (
          <SummaryRow icon="message-circle" label={t('common.labels.whatsapp')} value={f.phone(draft.whatsapp.country, draft.whatsapp.number)} ltr />
        ) : null}
      </Section>
      <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text variant="callout" tone="secondary" style={{ flex: 1 }}>
          {t('portal.review.total')}
        </Text>
        <Text variant="title2" tabular>
          {f.money(service.price)}
        </Text>
      </Card>
      <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 14, backgroundColor: colors.surfaceMuted }}>
        <Icon name="shield" size={16} color={colors.textSecondary} style={{ marginTop: 2 }} />
        <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
          {t('portal.review.policy', { hours: salon.cancellationPolicyHours })}
        </Text>
      </View>
    </PortalShell>
  );
}
