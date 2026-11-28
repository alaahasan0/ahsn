import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ListRow } from '@/components/ui/ListRow';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/States';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { useActions, useAppState } from '@/store/AppStore';
import { useLookup, useService } from '@/store/selectors';
import { useTheme } from '@/theme';

import { MiniStat } from '../customers/parts';

export default function ServiceDetailScreen({ id }: { id: string }) {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const service = useService(id);
  const actions = useActions();
  const toast = useToast();
  const look = useLookup();
  const { appointments } = useAppState();

  const perf = useMemo(() => {
    const since = now().getTime() - 30 * 86_400_000;
    const recent = appointments.filter((a) => a.status === 'completed' && new Date(a.start).getTime() >= since);
    const mine = recent.filter((a) => a.serviceId === id);
    return { count: mine.length, revenue: mine.reduce((s, a) => s + a.price, 0), share: recent.length ? mine.length / recent.length : 0 };
  }, [appointments, id]);

  if (!service) {
    return (
      <Screen header={<Header backFallback="/services" />}>
        <EmptyState icon="scissors" title={t('services.details.notFound')} body={t('services.details.notFoundBody')} />
      </Screen>
    );
  }

  return (
    <Screen header={<Header backFallback="/services" right={<IconButton icon="edit-2" accessibilityLabel={t('common.actions.edit')} onPress={() => router.push(`/services/${id}/edit`)} />} />}>
      <View style={{ gap: 24 }}>
        <View style={{ gap: 12 }}>
          <View style={{ width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={service.icon as IconName} size={24} color={colors.accent} />
          </View>
          <View style={{ gap: 4 }}>
            <Text variant="title1">{l(service.name)}</Text>
            <Text variant="callout" tone="secondary">
              {l(service.description)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <MiniStat label={t('services.details.price')} value={f.money(service.price)} />
          <MiniStat label={t('services.details.duration')} value={f.duration(service.durationMin)} caption={service.bufferMin ? t('services.bufferShort', { duration: f.duration(service.bufferMin) }) : undefined} />
        </View>

        <Section title={t('services.details.performance')}>
          <Card style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="title2" tabular>
                  {f.number(perf.count)}
                </Text>
                <Text variant="footnote" tone="secondary">
                  {t('services.details.bookings')}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="title2" tabular>
                  {f.money(perf.revenue)}
                </Text>
                <Text variant="footnote" tone="secondary">
                  {t('services.details.revenue')}
                </Text>
              </View>
            </View>
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="footnote" tone="secondary">
                  {t('services.details.share')}
                </Text>
                <Text variant="footnote" tabular>
                  {f.percent(perf.share)}
                </Text>
              </View>
              <ProgressBar value={perf.share} />
            </View>
          </Card>
        </Section>

        <Section title={t('services.details.barbers')} card>
          {service.barberIds.map((bid) => {
            const b = look.barber(bid);
            return <ListRow key={bid} title={l(b?.name)} subtitle={l(b?.title)} leading={<BarberAvatar barber={b} size={32} />} onPress={() => router.push(`/team/${bid}`)} />;
          })}
        </Section>

        <Section card>
          <ListRow
            icon="power"
            title={t('services.details.status')}
            subtitle={service.active ? t('services.details.statusOn') : t('services.details.statusOff')}
            trailing={
              <Switch
                value={service.active}
                onValueChange={(v) => {
                  actions.upsertService({ ...service, active: v });
                  toast(t(v ? 'services.activated' : 'services.deactivated', { name: l(service.name) }));
                }}
              />
            }
          />
          <ListRow
            icon="globe"
            title={t('services.details.online')}
            subtitle={service.bookableOnline ? t('services.details.onlineOn') : t('services.details.onlineOff')}
            trailing={<Switch value={service.bookableOnline} onValueChange={(v) => actions.upsertService({ ...service, bookableOnline: v })} />}
          />
          <ListRow icon="clock" title={t('services.details.buffer')} value={service.bufferMin ? f.duration(service.bufferMin) : t('services.details.bufferNone')} />
        </Section>

        <Button label={t('common.actions.edit')} variant="secondary" icon="edit-2" onPress={() => router.push(`/services/${id}/edit`)} />
      </View>
    </Screen>
  );
}
