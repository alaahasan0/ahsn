import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useActions, useAppState } from '@/store/AppStore';
import { useService } from '@/store/selectors';

import { PortalShell } from '../PortalShell';
import { ContactSalonButtons, StateHero } from '../shared';
import { useLinkAppointment } from '../useLinkAppointment';
import { canChangeOnline } from './ManageLinkScreen';

const REASONS = ['plans', 'sick', 'work', 'travel', 'somethingElse'] as const;

export default function CancelLinkScreen() {
  const { t, l, f } = useI18n();
  const { token } = useLocalSearchParams<{ token: string }>();
  const appt = useLinkAppointment(token);
  const { salon } = useAppState();
  const actions = useActions();
  const service = useService(appt?.serviceId);
  const [reason, setReason] = useState<(typeof REASONS)[number] | null>(null);
  const [ask, setAsk] = useState(false);
  const [done, setDone] = useState(false);

  if (!appt)
    return (
      <PortalShell salonName={salon.name} back>
        <EmptyState icon="link-2" title={t('portal.link.notFoundTitle')} body={t('portal.link.notFoundBody')} />
      </PortalShell>
    );

  if (done || appt.status === 'cancelled') {
    return (
      <PortalShell salonName={salon.name} footer={<Button label={t('portal.cancel.bookAgain')} size="lg" onPress={() => router.replace(`/book/${salon.slug}` as never)} />}>
        <StateHero icon="x" tone="neutral" title={t('portal.cancel.done')} body={t('portal.cancel.doneBody')} />
      </PortalShell>
    );
  }

  const start = new Date(appt.start);
  const allowed = canChangeOnline(start, salon.cancellationPolicyHours);

  if (!allowed) {
    return (
      <PortalShell salonName={salon.name} back title={t('portal.cancel.title')}>
        <StateHero icon="alert-circle" tone="warning" title={t('portal.cancel.tooLateTitle')} body={t('portal.cancel.tooLateBody', { hours: salon.cancellationPolicyHours })} />
        <ContactSalonButtons phone={salon.phone} whatsapp={salon.whatsapp} />
      </PortalShell>
    );
  }

  return (
    <PortalShell
      salonName={salon.name}
      back
      title={t('portal.cancel.title')}
      footer={
        <>
          <Button label={t('portal.cancel.confirm')} variant="danger" size="lg" onPress={() => setAsk(true)} testID="link-cancel-submit" />
          <Button label={t('portal.cancel.keep')} variant="ghost" onPress={() => router.back()} />
        </>
      }
    >
      <Card variant="muted" style={{ gap: 2 }}>
        <Text variant="callout" weight="medium">
          {l(service?.name)}
        </Text>
        <Text variant="footnote" tone="secondary">
          {f.dateLong(start)} · {f.time(start)}
        </Text>
      </Card>
      <View style={{ gap: 10 }}>
        <Text variant="subhead" tone="secondary">
          {t('portal.cancel.reason')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REASONS.map((r) => (
            <Chip key={r} label={t(`portal.cancel.reasons.${r}`)} selected={reason === r} onPress={() => setReason(reason === r ? null : r)} />
          ))}
        </View>
      </View>
      <Text variant="footnote" tone="tertiary">
        {t('portal.link.policy', { hours: salon.cancellationPolicyHours })}
      </Text>
      <Dialog
        visible={ask}
        onClose={() => setAsk(false)}
        icon="x-circle"
        tone="danger"
        title={t('portal.cancel.confirmTitle')}
        message={t('portal.cancel.confirmBody')}
        confirmLabel={t('portal.cancel.confirm')}
        cancelLabel={t('portal.cancel.keep')}
        onConfirm={() => {
          actions.setAppointmentStatus(appt.id, 'cancelled', { actor: 'customer', reason: reason ? t(`portal.cancel.reasons.${reason}`) : undefined });
          setDone(true);
        }}
      />
    </PortalShell>
  );
}
