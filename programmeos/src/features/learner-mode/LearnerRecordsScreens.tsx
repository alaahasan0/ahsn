import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, EmptyState, IconTile, ListGroup, ListRow, ProgressRing, Screen, Section, StatusPill, Text, useToast, type IconName } from '@/components';
import type { Assessment } from '@/data/models';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { dueLabel, formatDate } from '@/utils/dates';

import { NotificationList } from '../faculty-mode/FacultyInboxScreen';
import { useLocalState } from '../faculty-mode/localState';
import { attendanceHistory, useLearnerScope } from './data';

const KIND_ICON: Record<Assessment['kind'], IconName> = { Quiz: 'list-checks', 'Peer Review': 'users', Reflection: 'notebook-pen', Capstone: 'target' };

export function LearnerAssessmentsScreen() {
  const toast = useToast();
  const { colors } = useTheme();
  const scope = useLearnerScope();
  const list = [...scope.assessments].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <Screen title="Assessments" subtitle={scope.currentProgramme?.name}>
      {list.length ? (
        <View style={{ gap: 10 }}>
          {list.map((a) => {
            const pct = a.learnerScore != null ? (a.learnerScore / a.maxScore) * 100 : 0;
            return (
              <Card key={a.id} style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  {a.status === 'Completed' ? (
                    <ProgressRing value={pct} size={54} stroke={5} color={colors.success}>
                      <Text variant="label" tabular>
                        {a.learnerScore}
                      </Text>
                    </ProgressRing>
                  ) : (
                    <IconTile icon={KIND_ICON[a.kind]} tone={a.status === 'Open' ? 'violet' : 'neutral'} size={44} />
                  )}
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="headline">{a.title}</Text>
                    <Text variant="footnote" tone="secondary">
                      {a.kind} · {a.status === 'Completed' ? `Scored ${a.learnerScore} of ${a.maxScore}` : a.status === 'Open' ? dueLabel(a.date).text : formatDate(a.date, { weekday: true, year: false })}
                    </Text>
                  </View>
                  <StatusPill label={a.status} tone={a.status === 'Completed' ? 'success' : a.status === 'Open' ? 'violet' : 'neutral'} />
                </View>
                {a.status === 'Open' ? <Button title={a.kind === 'Peer Review' ? 'Start peer review' : 'Start'} icon="arrow-right" size="sm" variant="tinted" onPress={() => toast.show({ message: 'Opening in the Learning Hub', detail: 'Simulated — your two assigned memos are ready to review.', icon: 'external-link', tone: 'accent' })} /> : null}
              </Card>
            );
          })}
        </View>
      ) : (
        <EmptyState icon="award" title="No assessments" message="Quizzes and reviews will appear here." />
      )}
    </Screen>
  );
}

const ATT_TONE = { Present: 'success', Late: 'warning', Absent: 'danger', Excused: 'neutral' } as const;

export function LearnerAttendanceScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const scope = useLearnerScope();
  const rate = scope.current?.attendanceRate ?? 0;
  const rows = attendanceHistory(db, scope.me.id, scope.currentProgramme?.id);
  const present = rows.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  return (
    <Screen title="Attendance" subtitle={scope.currentProgramme?.name}>
      <Card padding="lg" style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <ProgressRing value={rate} size={86} stroke={8} color={rate >= 80 ? colors.success : colors.warning}>
          <Text variant="title3" tabular>
            {rate}%
          </Text>
        </ProgressRing>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="headline">{rate >= 80 ? 'On track for your certificate' : 'Below the 80% requirement'}</Text>
          <Text variant="footnote" tone="secondary">
            You’ve attended {present} of {rows.length} recorded sessions. Certificates require at least 80% attendance.
          </Text>
        </View>
      </Card>
      <Section title="Session record">
        {rows.length ? (
          <ListGroup>
            {rows.map((r) => (
              <ListRow key={r.id} title={r.title} subtitle={formatDate(r.date, { weekday: true })} trailing={<StatusPill label={r.status} tone={ATT_TONE[r.status]} />} onPress={r.session ? () => router.push(`/lm/session/${r.session!.id}`) : undefined} numberOfLines={2} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="user-check" title="No attendance yet" message="Attendance is recorded at each session." compact />
        )}
      </Section>
      <Text variant="footnote" tone="tertiary" style={{ marginTop: 12 }}>
        Something not right? Message learner support from the programme overview.
      </Text>
    </Screen>
  );
}

export function LearnerFeedbackScreen() {
  const db = useDB();
  const local = useLocalState();
  const scope = useLearnerScope();
  const past = scope.past.filter((s) => s.programmeId === scope.currentProgramme?.id || s.status === 'Completed');
  const pending = past.filter((s) => !local.feedbackGiven.includes(s.id));
  const given = past.filter((s) => local.feedbackGiven.includes(s.id));
  const completedProgrammes = scope.enrollments.filter((e) => e.status === 'Completed');
  return (
    <Screen title="Feedback" subtitle="Your feedback shapes every session — it’s anonymous and takes two minutes.">
      <Section title="Waiting for your feedback" first>
        {pending.length ? (
          <ListGroup>
            {pending.map((s) => (
              <ListRow key={s.id} icon="smile" iconTone="warning" title={s.title} subtitle={formatDate(s.date, { weekday: true })} trailing={<Button title="Rate" size="sm" variant="tinted" onPress={() => router.push(`/lm/feedback-form?session=${s.id}`)} />} />
            ))}
          </ListGroup>
        ) : (
          <Card>
            <Text tone="secondary">Nothing to rate right now — thank you!</Text>
          </Card>
        )}
      </Section>
      {given.length || completedProgrammes.length ? (
        <Section title="Already shared">
          <ListGroup>
            {given.map((s) => (
              <ListRow key={s.id} icon="circle-check" iconTone="success" title={s.title} subtitle="Session feedback submitted" />
            ))}
            {completedProgrammes.map((e) => (
              <ListRow key={e.id} icon="circle-check" iconTone="success" title={db.programmes.find((p) => p.id === e.programmeId)?.name ?? ''} subtitle={e.feedbackSubmitted ? 'Programme evaluation submitted' : 'Programme evaluation'} />
            ))}
          </ListGroup>
        </Section>
      ) : null}
    </Screen>
  );
}

export function LearnerNotificationsScreen() {
  const actions = useActions();
  const toast = useToast();
  const scope = useLearnerScope();
  return (
    <Screen
      title="Notifications"
      headerRight={
        <Button
          title="Read all"
          variant="plain"
          size="sm"
          accessibilityLabel="Mark all as read"
          onPress={() => {
            actions.markAllNotificationsRead('learner');
            toast.show({ message: 'All caught up', icon: 'check', tone: 'neutral' });
          }}
        />
      }>
      <NotificationList
        items={scope.notifications}
        filter="All"
        onOpen={(n) => {
          actions.markNotificationRead(n.id);
          if (n.route) router.push(n.route as Href);
        }}
      />
    </Screen>
  );
}
