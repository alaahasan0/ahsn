import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { StatusBadge } from '@/components/domain/Badges';
import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n, type TKey } from '@/i18n';
import { now } from '@/lib/clock';
import { addMinutes } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { useBarber, useCustomer, useService } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { AppointmentStatus } from '@/types/models';

import { PortalShell } from '../PortalShell';
import { ContactSalonButtons, maskPhone, StateHero, SummaryRow } from '../shared';
import { useLinkAppointment } from '../useLinkAppointment';

const INTRO: Record<AppointmentStatus, TKey> = {
  pending: 'portal.link.pendingIntro',
  confirmed: 'portal.link.confirmedIntro',
  draft: 'portal.link.draftIntro',
  cancelled: 'portal.link.cancelledIntro',
  completed: 'portal.link.completedIntro',
  rescheduled: 'portal.link.rescheduledIntro',
  no_show: 'portal.link.noShowIntro',
  checked_in: 'portal.link.checkedInIntro',
  expired: 'portal.link.expiredTitle',
};

/** Whether the customer may still change the booking online (outside the cancellation window). */
export function canChangeOnline(start: Date, policyHours: number) {
  return start.getTime() - now().getTime() >= policyHours * 3600_000;
}

export default function ManageLinkScreen() {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const toast = useToast();
  const { token } = useLocalSearchParams<{ token: string }>();
  const appt = useLinkAppointment(token);
  const { salon } = useAppState();
  const actions = useActions();
  const customer = useCustomer(appt?.customerId);
  const service = useService(appt?.serviceId);
  const barber = useBarber(appt?.barberId);

  if (!appt) {
    return (
      <PortalShell salonName={salon.name}>
        <EmptyState icon="link-2" title={t('portal.link.notFoundTitle')} body={t('portal.link.notFoundBody')} />
        <ContactSalonButtons phone={salon.phone} whatsapp={salon.whatsapp} />
      </PortalShell>
    );
  }

  const start = new Date(appt.start);
  const end = addMinutes(start, appt.durationMin);
  const upcoming = start > now();
  const changeable = upcoming && ['pending', 'confirmed', 'draft'].includes(appt.status);
  const insideWindow = changeable && !canChangeOnline(start, salon.cancellationPolicyHours);
  const firstName = l(customer?.name).split(' ')[0];

  if (appt.status === 'expired') {
    return (
      <PortalShell salonName={salon.name} testID="link-expired">
        <StateHero icon="clock" tone="warning" title={t('portal.link.expiredTitle')} body={t('portal.link.expiredBody', { hours: salon.confirmationLinkHours })} />
        <Section card>
          <SummaryRow icon="scissors" label={t('portal.review.service')} value={l(service?.name)} />
          <SummaryRow icon="calendar" label={t('portal.review.when')} value={f.dateLong(start)} sub={f.timeRange(start, end)} />
        </Section>
        <ContactSalonButtons phone={salon.phone} whatsapp={salon.whatsapp} />
      </PortalShell>
    );
  }

  const footer =
    changeable && !insideWindow ? (
      <>
        {appt.status === 'pending' ? (
          <Button
            label={t('portal.link.confirm')}
            size="lg"
            icon="check"
            testID="link-confirm"
            onPress={() => {
              actions.setAppointmentStatus(appt.id, 'confirmed', { actor: 'customer' });
              toast({ message: t('portal.link.confirmedToast') });
            }}
          />
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {appt.status !== 'draft' ? (
            <Button
              label={t('portal.link.reschedule')}
              variant="secondary"
              icon="calendar"
              style={{ flex: 1 }}
              onPress={() => router.push(`/m/${token}/reschedule` as never)}
              testID="link-reschedule"
            />
          ) : null}
          <Button label={t('portal.link.cancel')} variant="dangerSoft" icon="x" style={{ flex: 1 }} onPress={() => router.push(`/m/${token}/cancel` as never)} testID="link-cancel" />
        </View>
      </>
    ) : !upcoming || ['cancelled', 'completed', 'no_show'].includes(appt.status) ? (
      <Button label={t('portal.cancel.bookAgain')} size="lg" onPress={() => router.push(`/book/${salon.slug}` as never)} />
    ) : undefined;

  return (
    <PortalShell salonName={salon.name} footer={footer} testID="link-page">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, height: 28, borderRadius: radius.pill, backgroundColor: colors.successSoft }}>
        <Icon name="lock" size={12} color={colors.success} />
        <Text variant="caption" color={colors.success}>
          {t('portal.link.secure', { phone: f.ltr(maskPhone(customer?.phone)) })}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text variant="title2">{t('portal.link.greeting', { name: firstName })}</Text>
        <Text variant="callout" tone="secondary">
          {t(INTRO[appt.status], { salon: l(salon.name) })}
        </Text>
      </View>

      <Card style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 58, alignItems: 'center', paddingVertical: 8, borderRadius: radius.md, backgroundColor: colors.accentSoft }}>
            <Text variant="caption" color={colors.accentOnSoft} align="center">
              {f.weekday(start, 'short')}
            </Text>
            <Text variant="title2" color={colors.accentOnSoft} align="center" tabular>
              {f.digits(String(start.getDate()))}
            </Text>
            <Text variant="caption" color={colors.accentOnSoft} align="center" numberOfLines={1}>
              {f.month(start, 'short')}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="headline">{l(service?.name)}</Text>
            <Text variant="callout" tabular>
              {f.timeRange(start, end)}
            </Text>
            <StatusBadge status={appt.status} />
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: colors.separator }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <BarberAvatar barber={barber} size={32} />
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="tertiary">
              {t('common.labels.barber')}
            </Text>
            <Text variant="subhead">{l(barber?.name)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="caption" tone="tertiary">
              {t('portal.link.price')}
            </Text>
            <Text variant="subhead" tabular>
              {f.money(appt.price)}
            </Text>
          </View>
        </View>
      </Card>

      <Section card>
        <SummaryRow icon="map-pin" label={t('portal.link.address')} value={l(salon.address)} sub={l(salon.city)} />
      </Section>

      {insideWindow ? (
        <Card variant="muted" style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="alert-circle" size={16} color={colors.warning} />
            <Text variant="subhead">{t('portal.cancel.tooLateTitle')}</Text>
          </View>
          <Text variant="footnote" tone="secondary">
            {t('portal.cancel.tooLateBody', { hours: salon.cancellationPolicyHours })}
          </Text>
        </Card>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}>
          <Icon name="shield" size={16} color={colors.textSecondary} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="subhead">{t('portal.link.policyTitle')}</Text>
            <Text variant="footnote" tone="secondary">
              {t('portal.link.policy', { hours: salon.cancellationPolicyHours })}
            </Text>
          </View>
        </View>
      )}

      <View style={{ gap: 10 }}>
        <Text variant="footnote" tone="tertiary">
          {t('portal.link.contact')}
        </Text>
        <ContactSalonButtons phone={salon.phone} whatsapp={salon.whatsapp} />
      </View>
      <Text variant="caption" tone="tertiary" align="center">
        {t('portal.poweredBy')}
      </Text>
    </PortalShell>
  );
}
