import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useBarbers, useService } from '@/store/selectors';
import { useTheme } from '@/theme';

import { useBookingDraft } from '../BookingDraft';
import { PortalShell } from '../PortalShell';
import { SalonNotFound } from '../shared';

export default function BarberStep() {
  const { colors, radius } = useTheme();
  const { t, l } = useI18n();
  const { salon, draft, update, path } = useBookingDraft();
  const service = useService(draft.serviceId);
  const barbers = useBarbers().filter((b) => b.acceptsOnline && service?.barberIds.includes(b.id));
  if (!salon) return <SalonNotFound />;
  if (!service) return <Redirect href={path('service') as never} />;

  const choose = (id: string) => {
    update({ barberId: id, slot: undefined });
    router.push(path('date') as never);
  };

  const options = [{ id: 'any' }, ...barbers.map((b) => ({ id: b.id }))];
  return (
    <PortalShell salonName={salon.name} step="barber" back title={t('portal.steps.barber')} subtitle={l(service.name)}>
      <View style={{ gap: 10 }}>
        {options.map(({ id }) => {
          const b = barbers.find((x) => x.id === id);
          const selected = draft.barberId === id;
          return (
            <Pressable
              key={id}
              onPress={() => choose(id)}
              accessibilityState={{ selected }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 14,
                borderRadius: radius.lg,
                backgroundColor: selected ? colors.accentSoft : colors.surface,
                borderWidth: 1.5,
                borderColor: selected ? colors.accent : colors.border,
              }}
            >
              {b ? <BarberAvatar barber={b} size={52} /> : <Avatar size={52} icon="users" />}
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="headline">{b ? l(b.name) : t('portal.barber.any')}</Text>
                <Text variant="footnote" tone="secondary" numberOfLines={2}>
                  {b ? l(b.title) : t('portal.barber.anyBody')}
                </Text>
                {b ? (
                  <Text variant="caption" tone="tertiary">
                    {t('portal.barber.years', { count: b.yearsExperience })}
                  </Text>
                ) : null}
              </View>
              <Icon name={selected ? 'check-circle' : 'chevron-right'} size={20} color={selected ? colors.accent : colors.textTertiary} />
            </Pressable>
          );
        })}
      </View>
    </PortalShell>
  );
}
