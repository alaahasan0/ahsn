import { View } from 'react-native';

import { Card, EmptyState, Icon, LineChart, Screen, Section, Text } from '@/components';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/dates';

import { Stars } from './common';
import { RATING_HISTORY, useFacultyScope } from './data';

export default function FacultyFeedbackScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const scope = useFacultyScope();
  const list = [...scope.feedback].sort((a, b) => b.date.localeCompare(a.date));
  const avg = list.length ? list.reduce((s, f) => s + f.rating, 0) / list.length : scope.me.rating;
  const history = RATING_HISTORY[scope.me.id] ?? [];
  const trend = history.length ? [...history, { label: 'Now', value: Number(avg.toFixed(2)) }] : [];
  return (
    <Screen title="Feedback" subtitle="Participant evaluations and client comments on your teaching.">
      <Card padding="lg" style={{ alignItems: 'center', gap: 6 }}>
        <Text variant="metricXL">{avg.toFixed(1)}</Text>
        <Stars value={avg} size={18} />
        <Text variant="footnote" tone="secondary">
          Average of {list.length} recent evaluation{list.length === 1 ? '' : 's'} · {scope.me.sessionsDelivered} sessions taught
        </Text>
      </Card>
      {trend.length > 1 ? (
        <Section title="Rating trend" subtitle="Average evaluation score by quarter (out of 5)">
          <Card>
            <LineChart labels={trend.map((t) => t.label)} series={[{ name: 'Rating', color: colors.warning, values: trend.map((t) => t.value) }]} yMax={5} format={(n) => n.toFixed(1)} height={160} />
          </Card>
        </Section>
      ) : null}
      <Section title="What people said">
        {list.length ? (
          <View style={{ gap: 10 }}>
            {list.map((f) => (
              <Card key={f.id} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Stars value={f.rating} />
                  <Text variant="footnote" tone="tertiary" style={{ flex: 1 }} numberOfLines={1}>
                    {getProgramme(db, f.programmeId)?.name}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Icon name="quote" size={16} tone="tertiary" />
                  <Text variant="body" style={{ flex: 1 }}>
                    {f.comment}
                  </Text>
                </View>
                <Text variant="footnote" tone="secondary">
                  {f.author} · {formatDate(f.date)}
                </Text>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState icon="star" title="No feedback yet" message="Evaluations appear here after each programme." />
        )}
      </Section>
    </Screen>
  );
}
