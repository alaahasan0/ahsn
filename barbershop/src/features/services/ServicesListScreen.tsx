import { router } from 'expo-router';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Header } from '@/components/ui/Header';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { useActions } from '@/store/AppStore';
import { useLookup, useServices } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Service } from '@/types/models';

function ServiceItem({ service }: { service: Service }) {
  const { colors, radius } = useTheme();
  const { t, tp, l, f } = useI18n();
  const actions = useActions();
  const toast = useToast();
  const look = useLookup();
  return (
    <Pressable onPress={() => router.push(`/services/${service.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, opacity: service.active ? 1 : 0.6 }}>
      <View style={{ width: 42, height: 42, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={service.icon as IconName} size={18} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="callout" weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {l(service.name)}
          </Text>
          {service.popular ? <Badge label={t('services.popular')} tone="accent" /> : null}
        </View>
        <Text variant="footnote" tone="secondary" numberOfLines={1}>
          {f.money(service.price)} · {f.duration(service.durationMin)}
          {service.bufferMin ? ` · ${t('services.bufferShort', { duration: f.duration(service.bufferMin) })}` : ''}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row' }}>
            {service.barberIds.map((id, i) => (
              <View key={id} style={{ marginStart: i ? -6 : 0 }}>
                <BarberAvatar barber={look.barber(id)} size={20} ring={colors.surface} />
              </View>
            ))}
          </View>
          <Text variant="caption" tone="tertiary">
            {tp('services.barbersShort', service.barberIds.length)}
          </Text>
          {!service.bookableOnline ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Icon name="phone" size={11} color={colors.textTertiary} />
              <Text variant="caption" tone="tertiary">
                {t('services.phoneOnly')}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <Switch
        value={service.active}
        accessibilityLabel={l(service.name)}
        onValueChange={(v) => {
          actions.upsertService({ ...service, active: v });
          toast(t(v ? 'services.activated' : 'services.deactivated', { name: l(service.name) }));
        }}
      />
    </Pressable>
  );
}

export default function ServicesListScreen() {
  const { t, tp } = useI18n();
  const all = useServices({ includeInactive: true });
  const active = all.filter((s) => s.active);
  const inactive = all.filter((s) => !s.active);
  const renderGroup = (list: Service[]) => (
    <Card padding={0}>
      {list.map((s, i) => (
        <View key={s.id}>
          {i > 0 ? <Divider inset={68} /> : null}
          <ServiceItem service={s} />
        </View>
      ))}
    </Card>
  );
  return (
    <Screen
      header={
        <Header
          variant="large"
          back
          backFallback="/owner/more"
          title={t('services.title')}
          subtitle={tp('services.count', active.length)}
          right={<IconButton icon="plus" variant="accent" accessibilityLabel={t('services.add')} onPress={() => router.push('/services/new')} />}
        />
      }
    >
      <View style={{ gap: 24, paddingTop: 4 }}>
        <Section title={t('services.activeSection')}>{renderGroup(active)}</Section>
        {inactive.length ? <Section title={t('services.inactiveSection')}>{renderGroup(inactive)}</Section> : null}
      </View>
    </Screen>
  );
}
