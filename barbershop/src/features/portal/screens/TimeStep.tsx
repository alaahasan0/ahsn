import { Redirect, router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { DateStrip } from '@/components/domain/DateStrip';
import { TimeSlotGrid } from '@/components/domain/TimeSlotGrid';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { slotsFor } from '@/store/availability';
import { useBarber, useService } from '@/store/selectors';
import { useTheme } from '@/theme';

import { useBookingDraft } from '../BookingDraft';
import { PortalShell } from '../PortalShell';
import { SalonNotFound } from '../shared';
import { usePortalAvailability } from '../usePortalAvailability';

export default function TimeStep() {
  const { colors } = useTheme();
  const { t, l, f } = useI18n();
  const { salon, draft, update, path } = useBookingDraft();
  const service = useService(draft.serviceId);
  const barber = useBarber(draft.barberId === 'any' ? undefined : draft.barberId);
  const ctx = usePortalAvailability();
  const slots = useMemo(() => (service ? slotsFor(ctx, draft.barberId, draft.date, service).filter((s) => s.reason !== 'past') : []), [ctx, draft.barberId, draft.date, service]);

  if (!salon) return <SalonNotFound />;
  if (!service) return <Redirect href={path('service') as never} />;
  const anyFree = slots.some((s) => s.available);

  return (
    <PortalShell
      salonName={salon.name}
      step="time"
      back
      title={t('portal.steps.time')}
      subtitle={`${l(service.name)} · ${barber ? l(barber.name) : t('portal.barber.any')}`}
      footer={
        <Button
          label={draft.slot ? `${t('common.actions.continue')} · ${f.time(draft.slot.start)}` : t('common.actions.continue')}
          size="lg"
          disabled={!draft.slot}
          onPress={() => router.push(path('details') as never)}
          testID="portal-time-continue"
        />
      }
    >
      <View style={{ marginHorizontal: -20 }}>
        <DateStrip value={draft.date} onChange={(d) => update({ date: d, slot: undefined })} />
      </View>
      {anyFree ? (
        <>
          <TimeSlotGrid slots={slots} value={draft.slot?.start} onChange={(s) => update({ slot: { start: s.start, barberId: s.barberId } })} columns={3} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="lock" size={12} color={colors.textTertiary} />
            <Text variant="caption" tone="tertiary">
              {t('portal.time.legend')}
            </Text>
          </View>
        </>
      ) : (
        <EmptyState icon="calendar" title={t('portal.time.none')} body={t('portal.time.noneBody')} actionLabel={t('portal.time.pickAnother')} onAction={() => router.back()} />
      )}
    </PortalShell>
  );
}
