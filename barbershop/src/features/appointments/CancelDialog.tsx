import { useState } from 'react';
import { View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { useSalon } from '@/store/selectors';
import type { Appointment } from '@/types/models';

const REASONS = ['customer', 'barber', 'duplicate', 'misc'] as const;

export function CancelDialog({ appointment, visible, onClose, onConfirm }: { appointment: Appointment; visible: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const { t } = useI18n();
  const salon = useSalon();
  const [reason, setReason] = useState<(typeof REASONS)[number]>('customer');
  const hoursLeft = (new Date(appointment.start).getTime() - now().getTime()) / 3600_000;
  const late = hoursLeft > 0 && hoursLeft < salon.cancellationPolicyHours;
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      icon="x-circle"
      tone="danger"
      title={t('appointment.cancelDialog.title')}
      message={t('appointment.cancelDialog.body')}
      confirmLabel={t('appointment.cancelDialog.confirm')}
      cancelLabel={t('appointment.cancelDialog.keep')}
      onConfirm={() => onConfirm(t(`appointment.cancelDialog.reasons.${reason}`))}
    >
      <View style={{ gap: 10 }}>
        <Text variant="overline" tone="tertiary">
          {t('appointment.cancelDialog.reasonLabel')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {REASONS.map((r) => (
            <Chip key={r} size="sm" label={t(`appointment.cancelDialog.reasons.${r}`)} selected={reason === r} onPress={() => setReason(r)} />
          ))}
        </View>
        {late ? (
          <Text variant="footnote" tone="warning">
            {t('appointment.cancelDialog.late', { hours: salon.cancellationPolicyHours })}
          </Text>
        ) : null}
      </View>
    </Dialog>
  );
}
