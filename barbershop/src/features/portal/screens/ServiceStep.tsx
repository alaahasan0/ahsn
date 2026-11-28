import { router } from 'expo-router';
import { View } from 'react-native';

import { ServiceRow } from '@/components/domain/ServiceRow';
import { useI18n } from '@/i18n';
import { useServices } from '@/store/selectors';

import { useBookingDraft } from '../BookingDraft';
import { PortalShell } from '../PortalShell';
import { SalonNotFound } from '../shared';

export default function ServiceStep() {
  const { t } = useI18n();
  const { salon, draft, update, path } = useBookingDraft();
  const services = useServices().filter((s) => s.bookableOnline);
  if (!salon) return <SalonNotFound />;
  return (
    <PortalShell salonName={salon.name} step="service" back={path()} title={t('portal.steps.service')}>
      <View style={{ gap: 10 }}>
        {services.map((s) => (
          <ServiceRow
            key={s.id}
            service={s}
            showDescription
            selected={draft.serviceId === s.id}
            onPress={() => {
              update({ serviceId: s.id, barberId: 'any', slot: undefined });
              router.push(path('barber') as never);
            }}
          />
        ))}
      </View>
    </PortalShell>
  );
}
