import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BarberInline } from '@/components/domain/BarberAvatar';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { fromISODate } from '@/lib/dates';
import { nextOccurrences } from '@/lib/recurrence';
import { useAppState } from '@/store/AppStore';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { RecurringSeries } from '@/types/models';

import { ruleText } from './helpers';

type Filter = RecurringSeries['status'] | 'all';

export function RecurringCard({ series }: { series: RecurringSeries }) {
  const { colors } = useTheme();
  const i18n = useI18n();
  const { t, l, f } = i18n;
  const look = useLookup();
  const { salon } = useAppState();
  const customer = look.customer(series.customerId);
  const service = look.service(series.serviceId);
  const next = nextOccurrences(series, today(), 1, salon.holidays.map((h) => h.date))[0];
  return (
    <Card onPress={() => router.push(`/recurring/${series.id}`)} style={{ gap: 12, opacity: series.status === 'ended' ? 0.6 : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={l(customer?.name)} size={42} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headline" numberOfLines={1}>
            {l(customer?.name)}
          </Text>
          <Text variant="footnote" tone="secondary" numberOfLines={1}>
            {l(service?.name)}
          </Text>
        </View>
        <Badge label={t(`recurring.modes.${series.mode}`)} tone={series.mode === 'fixed' ? 'info' : 'accent'} icon={series.mode === 'fixed' ? 'lock' : 'send'} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="repeat" size={14} color={colors.textTertiary} />
        <Text variant="subhead" style={{ flex: 1 }} numberOfLines={1}>
          {ruleText(series, i18n)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <BarberInline barber={look.barber(series.barberId)} />
        <View style={{ flex: 1 }} />
        {series.status === 'paused' ? (
          <Badge label={series.pausedUntil ? t('recurring.pausedUntil', { date: f.dayMonth(fromISODate(series.pausedUntil)) }) : t('recurring.status.paused')} tone="warning" icon="pause" />
        ) : series.status === 'ended' ? (
          <Badge label={t('recurring.status.ended')} />
        ) : (
          <Text variant="footnote" tone="secondary">
            {next ? t('recurring.next', { date: f.dateShort(next) }) : t('recurring.noNext')}
          </Text>
        )}
      </View>
    </Card>
  );
}

export default function RecurringListScreen() {
  const { t } = useI18n();
  const { recurring } = useAppState();
  const [filter, setFilter] = useState<Filter>('active');
  const count = (s: Filter) => recurring.filter((r) => s === 'all' || r.status === s).length;
  const list = recurring.filter((r) => filter === 'all' || r.status === filter);
  return (
    <Screen
      header={
        <Header variant="large" back backFallback="/owner/more" title={t('recurring.title')} subtitle={t('recurring.subtitle')} right={<IconButton icon="plus" variant="accent" accessibilityLabel={t('recurring.add')} onPress={() => router.push('/recurring/new')} />}>
          <SegmentedControl
            size="sm"
            value={filter}
            onChange={setFilter}
            segments={(['active', 'paused', 'ended', 'all'] as Filter[]).map((s) => ({ value: s, label: t(`recurring.filters.${s}`), badge: s === 'paused' ? count('paused') || undefined : undefined }))}
          />
        </Header>
      }
    >
      <View style={{ gap: 12, paddingTop: 4 }}>
        {list.length === 0 ? <EmptyState icon="repeat" title={t('recurring.empty')} body={t('recurring.emptyBody')} actionLabel={t('recurring.add')} onAction={() => router.push('/recurring/new')} /> : list.map((r) => <RecurringCard key={r.id} series={r} />)}
      </View>
    </Screen>
  );
}
