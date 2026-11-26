import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Banner, Button, Card, EmptyState, FileIcon, Icon, KeyValue, ListGroup, ListRow, ProgressRing, Screen, Section, StatusPill, Text } from '@/components';
import type { Assignment, AssignmentSubmission } from '@/data/models';
import { facultyName, getFaculty, getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { dueLabel, formatDate, formatDateLong } from '@/utils/dates';

import { useLearnerScope } from './data';

function statusOf(sub?: AssignmentSubmission) {
  return sub?.status ?? 'Not Started';
}

export default function LearnerAssignmentsScreen() {
  const scope = useLearnerScope();
  const rows = scope.assignments.map((a) => ({ a, sub: scope.submissions.find((s) => s.assignmentId === a.id) })).sort((x, y) => x.a.dueDate.localeCompare(y.a.dueDate));
  const todo = rows.filter(({ sub }) => ['Not Started', 'Draft'].includes(statusOf(sub)));
  const done = rows.filter(({ sub }) => !['Not Started', 'Draft'].includes(statusOf(sub)));
  const Row = ({ a, sub }: { a: Assignment; sub?: AssignmentSubmission }) => {
    const st = statusOf(sub);
    const due = dueLabel(a.dueDate);
    return (
      <ListRow
        icon={st === 'Graded' ? 'badge-check' : st === 'Submitted' ? 'send' : 'notebook-pen'}
        iconTone={st === 'Graded' ? 'success' : st === 'Submitted' ? 'accent' : due.tone === 'neutral' ? 'violet' : due.tone}
        title={a.title}
        subtitle={`${a.kind} · ${a.weight}% of grade`}
        meta={st === 'Graded' ? `Grade ${sub?.grade}` : st === 'Submitted' ? `Submitted ${formatDate(sub!.submittedOn!, { year: false })}` : due.text}
        trailing={<StatusPill label={st} />}
        onPress={() => router.push(`/lm/assignment/${a.id}`)}
      />
    );
  };
  return (
    <Screen title="Assignments" subtitle={scope.currentProgramme?.name}>
      {!rows.length ? (
        <EmptyState icon="notebook-pen" title="No assignments" message="Your programme doesn’t have assignments yet." />
      ) : (
        <>
          <Section title="To do" first>
            {todo.length ? (
              <ListGroup>
                {todo.map((r) => (
                  <Row key={r.a.id} {...r} />
                ))}
              </ListGroup>
            ) : (
              <Card>
                <Text tone="secondary">You’re all caught up 🎉</Text>
              </Card>
            )}
          </Section>
          <Section title="Submitted & graded">
            {done.length ? (
              <ListGroup>
                {done.map((r) => (
                  <Row key={r.a.id} {...r} />
                ))}
              </ListGroup>
            ) : (
              <Card>
                <Text tone="secondary">Nothing submitted yet.</Text>
              </Card>
            )}
          </Section>
        </>
      )}
    </Screen>
  );
}

export function LearnerAssignmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const { colors } = useTheme();
  const scope = useLearnerScope();
  const a = scope.assignments.find((x) => x.id === id);
  if (!a) {
    return (
      <Screen title="Assignment">
        <EmptyState icon="notebook-pen" title="Assignment not found" />
      </Screen>
    );
  }
  const sub = scope.submissions.find((s) => s.assignmentId === a.id);
  const st = statusOf(sub);
  const mod = db.modules.find((m) => m.id === a.moduleId);
  const lead = getFaculty(db, mod?.leadFacultyId);
  const due = dueLabel(a.dueDate);
  const canSubmit = ['Not Started', 'Draft'].includes(st);
  return (
    <Screen
      title={a.title}
      eyebrow={`${getProgramme(db, a.programmeId)?.shortName}${mod ? ` · Module ${mod.order}` : ''}`}
      footer={canSubmit ? <Button title={st === 'Draft' ? 'Finish & submit' : 'Submit assignment'} icon="upload" size="lg" style={{ flex: 1 }} onPress={() => router.push(`/lm/submit?assignment=${a.id}`)} /> : undefined}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <StatusPill label={st} size="md" />
        {canSubmit ? <StatusPill label={due.text} tone={due.tone === 'neutral' ? 'accent' : due.tone} size="md" icon="clock" /> : null}
      </View>

      {st === 'Graded' && sub ? (
        <Card padding="lg" style={{ marginTop: 14, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <ProgressRing value={sub.score ?? 0} size={78} stroke={7} color={colors.success}>
            <Text variant="title2">{sub.grade}</Text>
          </ProgressRing>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="headline">
              {sub.score} / 100
            </Text>
            <Text variant="footnote" tone="secondary">
              Graded by {facultyName(lead)}
            </Text>
          </View>
        </Card>
      ) : null}
      {sub?.feedback ? (
        <Section title="Faculty feedback">
          <Card style={{ flexDirection: 'row', gap: 10 }}>
            <Icon name="quote" size={16} tone="tertiary" />
            <Text variant="body" style={{ flex: 1 }}>
              {sub.feedback}
            </Text>
          </Card>
        </Section>
      ) : null}
      {st === 'Submitted' ? <Banner tone="accent" title="Submitted — awaiting grading" message={`You submitted on ${formatDate(sub!.submittedOn!)}. Grades are usually released within 10 days.`} style={{ marginTop: 14 }} /> : null}
      {st === 'Draft' ? <Banner tone="info" title="Draft saved" message="Your team’s draft is saved in the Learning Hub. Submit it before the deadline." style={{ marginTop: 14 }} /> : null}

      <Section title="Brief">
        <Card style={{ gap: 12 }}>
          <Text variant="body">{a.brief}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <FileIcon format="DOCX" size={34} />
            <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
              Assignment brief & marking rubric
            </Text>
          </View>
        </Card>
      </Section>
      <Section title="Details">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue icon="calendar" label="Due" value={formatDateLong(a.dueDate, true)} />
          <KeyValue icon="percent" label="Weighting" value={`${a.weight}% of final grade`} />
          <KeyValue icon="users" label="Type" value={a.kind === 'Group' ? 'Group — one submission per team' : 'Individual'} />
          <KeyValue icon="user-round" label="Marked by" value={facultyName(lead)} last />
        </Card>
      </Section>
    </Screen>
  );
}
