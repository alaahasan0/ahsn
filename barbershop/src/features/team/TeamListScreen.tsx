import { router } from 'expo-router';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { useBarbers, useDaySummary } from '@/store/selectors';
import { barberWorksOn } from '@/store/availability';
import { useTheme } from '@/theme';
import type { Barber } from '@/types/models';

function BarberCard({ barber }: { barber: Barber }) {
  const { colors } = useTheme();
  const { t, tp, l, f } = useI18n();
  const summary = useDaySummary(today(), [barber.id]);
  const working = barberWorksOn(barber, today());
  const sched = barber.schedule[today().getDay() as 0];
  return (
    <Card onPress={() => router.push(`/team/${barber.id}`)} style={{ gap: 14, opacity: barber.active ? 1 : 0.6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BarberAvatar barber={barber} size={52} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="headline" numberOfLines={1}>
            {l(barber.name)}
          </Text>
          <Text variant="footnote" tone="secondary" numberOfLines={1}>
            {l(barber.title)}
          </Text>
        </View>
        {!barber.active ? <Badge label={t('team.inactive')} /> : !working ? <Badge label={t('team.offToday')} tone="warning" /> : null}
        <Icon name="chevron-right" size={18} color={colors.textTertiary} />
      </View>
      {working ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text variant="footnote" tone="secondary">
              {tp('common.counts.appointments', summary.total - summary.cancelled)} · {f.clock(sched.start)} – {f.clock(sched.end)}
            </Text>
            <Text variant="footnote" tabular>
              {t('team.bookedToday', { pct: f.percent(summary.occupancy) })}
            </Text>
          </View>
          <ProgressBar value={summary.occupancy} color={barber.color} />
        </View>
      ) : null}
    </Card>
  );
}

export default function TeamListScreen() {
  const { t, tp } = useI18n();
  const barbers = useBarbers({ includeInactive: true });
  return (
    <Screen
      header={
        <Header
          variant="large"
          back
          backFallback="/owner/more"
          title={t('team.title')}
          subtitle={tp('team.count', barbers.filter((b) => b.active).length)}
          right={
            <>
              <IconButton icon="clock" variant="filled" accessibilityLabel={t('availability.title')} onPress={() => router.push('/availability')} />
              <IconButton icon="user-plus" variant="accent" accessibilityLabel={t('team.add')} onPress={() => router.push('/team/new')} />
            </>
          }
        />
      }
    >
      <View style={{ gap: 12, paddingTop: 4 }}>
        {barbers.map((b) => (
          <BarberCard key={b.id} barber={b} />
        ))}
      </View>
    </Screen>
  );
}
