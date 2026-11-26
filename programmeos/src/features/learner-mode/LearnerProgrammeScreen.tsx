import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, EmptyState, Icon, ListGroup, ListRow, ProgressBar, ProgressRing, Screen, Section, StatusPill, Text } from '@/components';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { countdown, formatDate, formatRange } from '@/utils/dates';

import { HubLink, MODE_ICON } from '../faculty-mode/common';
import { moduleProgress, useLearnerScope } from './data';

export default function LearnerProgrammeScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const scope = useLearnerScope();
  const { current, currentProgramme: p } = scope;
  const others = scope.enrollments.filter((e) => e.id !== current?.id);

  if (!p || !current) {
    return (
      <Screen title="My Programme" back={false}>
        <EmptyState icon="graduation-cap" title="No active programme" message="When you’re enrolled in a programme it will appear here." />
      </Screen>
    );
  }

  return (
    <Screen title="My Programme" back={false}>
      <Card padding="lg" style={{ gap: 14 }} onPress={() => router.push('/lm/overview')} accessibilityLabel={`${p.name} overview`}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <ProgressRing value={current.progress ?? 0} size={72} stroke={7} color={colors.violet}>
            <Text variant="headline" tabular>
              {current.progress ?? 0}%
            </Text>
          </ProgressRing>
          <View style={{ flex: 1, gap: 4 }}>
            <StatusPill label={current.status === 'Attending' ? 'In progress' : current.status} tone="violet" />
            <Text variant="title3">{p.name}</Text>
            <Text variant="footnote" tone="secondary">
              {formatRange(p.startDate, p.endDate)}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name={MODE_ICON[p.deliveryMode]} size={14} tone="tertiary" />
          <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
            {p.deliveryMode} · {p.location}
          </Text>
          <Text variant="label" tone="accent">
            Overview
          </Text>
          <Icon name="chevron-right" size={14} tone="accent" />
        </View>
      </Card>

      <Section title="Modules">
        <ListGroup>
          {scope.modules.map((m, i) => {
            const mp = moduleProgress(m);
            return (
              <View key={m.id} style={{ padding: 16, gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: mp.state === 'Completed' ? colors.success : mp.state === 'In progress' ? colors.violetSoft : colors.surfaceAlt }}>
                    {mp.state === 'Completed' ? (
                      <Icon name="check" size={15} color="#FFFFFF" strokeWidth={3} />
                    ) : (
                      <Text variant="label" tone={mp.state === 'In progress' ? 'violet' : 'tertiary'}>
                        {i + 1}
                      </Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="headline">{m.title}</Text>
                    <Text variant="footnote" tone="secondary">
                      {formatRange(m.startDate, m.endDate)}
                    </Text>
                  </View>
                  <StatusPill label={mp.state} tone={mp.state === 'Completed' ? 'success' : mp.state === 'In progress' ? 'violet' : 'neutral'} />
                </View>
                <Text variant="subhead" tone="secondary">
                  {m.summary}
                </Text>
                {mp.state !== 'Upcoming' ? <ProgressBar value={mp.value} color={mp.state === 'Completed' ? colors.success : colors.violet} /> : null}
              </View>
            );
          })}
        </ListGroup>
      </Section>

      <Section title="Learning">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <HubLink icon="notebook-pen" label="Assignments" detail={`${scope.assignments.length} in this programme`} route="/lm/assignments" tone="accent" />
          <HubLink icon="award" label="Assessments" detail={`${scope.assessments.filter((a) => a.status === 'Open').length} open now`} route="/lm/assessments" tone="violet" />
          <HubLink icon="user-check" label="Attendance" detail={`${current.attendanceRate ?? 0}% attended`} route="/lm/attendance" tone="success" />
          <HubLink icon="smile" label="Feedback" detail="Share how sessions went" route="/lm/feedback" tone="warning" />
          <HubLink icon="badge-check" label="Certificates" detail="Your achievements" route="/lm/certificates" tone="info" />
          <HubLink icon="bell" label="Notifications" detail="Programme updates" route="/lm/notifications" tone="neutral" />
        </View>
      </Section>

      {others.length ? (
        <Section title="Your other programmes">
          <ListGroup>
            {others.map((e) => {
              const prog = getProgramme(db, e.programmeId)!;
              const completed = e.status === 'Completed';
              return (
                <ListRow
                  key={e.id}
                  icon={completed ? 'badge-check' : 'graduation-cap'}
                  iconTone={completed ? 'success' : 'accent'}
                  title={prog.name}
                  subtitle={completed ? `Completed ${formatDate(prog.endDate)} · certificate issued` : `${countdown(prog.startDate)} · ${prog.location}`}
                  trailing={<StatusPill label={completed ? 'Completed' : e.status} />}
                  onPress={() => router.push(completed ? `/lm/certificate/${e.id}` : `/lm/overview?programme=${prog.id}`)}
                />
              );
            })}
          </ListGroup>
        </Section>
      ) : null}
    </Screen>
  );
}
