import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Icon, IconTile, ListGroup, ListRow, Screen, Section, Sparkline, Text } from '@/components';
import { portfolioFinance } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { moneyCompact } from '@/utils/format';

import { RequireAccess } from '../shared/Widgets';
import { monthlySeries } from './data';
import { REPORTS } from './registry';

const GROUPS = ['Portfolio', 'Financial', 'People & learning', 'Operations'] as const;

/** Reporting hub — performance without asking anyone to build a spreadsheet. */
export default function ReportsHubScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const months = monthlySeries('ytd');
  const pf = portfolioFinance(db);
  return (
    <Screen title="Reports" subtitle="Live analytics across the portfolio. Every figure traces back to a programme record.">
      <RequireAccess module="reports">
        <Card padding="lg" onPress={() => router.push('/report/executive')} style={{ gap: 12 }} accessibilityLabel="Open executive overview">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <IconTile icon="layout-dashboard" tone="accent" size={34} />
            <View style={{ flex: 1 }}>
              <Text variant="overline" tone="accent">
                Featured
              </Text>
              <Text variant="title3">Executive Overview</Text>
            </View>
            <Icon name="chevron-right" size={18} tone="tertiary" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="caption" tone="secondary">
                FY27 revenue to date
              </Text>
              <Text variant="metric">{moneyCompact(months.reduce((s, m) => s + m.revenue, 0))}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="caption" tone="secondary">
                Forecast margin
              </Text>
              <Text variant="metric" tone="success">
                {pf.marginPct.toFixed(1)}%
              </Text>
            </View>
            <Sparkline values={months.map((m) => m.revenue)} width={84} height={34} color={colors.chart[0]} />
          </View>
        </Card>
        {GROUPS.map((g) => (
          <Section key={g} title={g}>
            <ListGroup>
              {REPORTS.filter((r) => r.group === g).map((r) => (
                <ListRow key={r.key} icon={r.icon} iconTone={r.tone} title={r.title} subtitle={r.description} onPress={() => router.push(`/report/${r.key}`)} />
              ))}
            </ListGroup>
          </Section>
        ))}
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 20, paddingHorizontal: 4 }}>
          <Icon name="info" size={13} tone="tertiary" />
          <Text variant="footnote" tone="tertiary" style={{ flex: 1 }}>
            Illustrative sample data. History before March 2027 is summarised for the prototype.
          </Text>
        </View>
      </RequireAccess>
    </Screen>
  );
}
