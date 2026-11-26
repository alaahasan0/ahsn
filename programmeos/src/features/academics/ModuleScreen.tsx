import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Button, Card, EmptyState, Icon, KeyValue, ListGroup, ListRow, Screen, Section, StatusPill, Text } from '@/components';
import { facultyName, getFaculty, getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { formatDate, formatRange } from '@/utils/dates';

import { SessionRow } from '../shared/Rows';
import { MaterialRow } from './shared';

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const m = db.modules.find((x) => x.id === id);
  const p = getProgramme(db, m?.programmeId);

  if (!m || !p) {
    return (
      <Screen title="Module">
        <EmptyState icon="book-open" title="Module not found" actionLabel="Back to academics" onAction={() => router.replace('/academics')} />
      </Screen>
    );
  }

  const lead = getFaculty(db, m.leadFacultyId);
  const cohort = db.cohorts.find((c) => c.id === m.cohortId);
  const sessions = db.sessions.filter((s) => s.moduleId === m.id).sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  const materials = db.materials.filter((x) => x.moduleId === m.id);
  const assignments = db.assignments.filter((a) => a.moduleId === m.id);
  const assessments = db.assessments.filter((a) => a.moduleId === m.id);
  const approved = materials.filter((x) => ['Approved', 'Published'].includes(x.status)).length;

  return (
    <Screen title={m.title} eyebrow={`${p.shortName} · Module ${m.order}`} subtitle={m.summary}>
      <Card padding="sm" style={{ paddingHorizontal: 16 }}>
        <KeyValue label="Programme" value={p.name} icon="layers" onPress={() => router.push(`/programme/${p.id}`)} />
        <KeyValue label="Cohort" value={cohort?.name ?? '—'} icon="users" />
        <KeyValue label="Dates" value={m.startDate === m.endDate ? formatDate(m.startDate) : formatRange(m.startDate, m.endDate)} icon="calendar" />
        <KeyValue label="Materials" value={`${approved} of ${materials.length} approved`} icon="book-open" valueTone={approved === materials.length && materials.length ? 'success' : 'warning'} last />
      </Card>

      <Section title="Lead faculty">
        <ListGroup>
          <ListRow leading={<Avatar name={lead?.name ?? ''} hue={lead?.avatarHue} initials={lead?.initials} size={38} />} title={facultyName(lead)} subtitle={lead?.title} onPress={() => router.push(`/faculty/${m.leadFacultyId}`)} />
        </ListGroup>
      </Section>

      <Section title="Learning objectives">
        <Card style={{ gap: 10 }}>
          {m.objectives.map((o) => (
            <View key={o} style={{ flexDirection: 'row', gap: 10 }}>
              <Icon name="target" size={16} tone="accent" />
              <Text variant="callout" style={{ flex: 1 }}>
                {o}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Learning outcomes">
        <Card style={{ gap: 10 }}>
          {m.outcomes.map((o) => (
            <View key={o} style={{ flexDirection: 'row', gap: 10 }}>
              <Icon name="badge-check" size={16} tone="success" />
              <Text variant="callout" style={{ flex: 1 }}>
                {o}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Sessions" subtitle={`${sessions.length} scheduled`}>
        {sessions.length ? (
          <ListGroup>
            {sessions.map((s) => (
              <SessionRow key={s.id} session={s} showDate showProgramme={false} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="calendar" title="No sessions yet" message="Sessions for this module haven’t been scheduled." actionLabel="Schedule session" onAction={() => router.push(`/session/new?programme=${p.id}`)} compact />
        )}
      </Section>

      <Section title="Training materials" action="Submit" onAction={() => router.push(`/material/submit?module=${m.id}`)}>
        {materials.length ? (
          <ListGroup>
            {materials.map((x) => (
              <MaterialRow key={x.id} material={x} showProgramme={false} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="file-plus" title="No materials" message="Presentations, readings and case studies appear here once submitted." actionLabel="Submit material" onAction={() => router.push(`/material/submit?module=${m.id}`)} compact />
        )}
      </Section>

      {assignments.length || assessments.length ? (
        <Section title="Assignments & assessments">
          <ListGroup>
            {assignments.map((a) => (
              <ListRow key={a.id} icon="notebook-pen" iconTone="accent" title={a.title} subtitle={a.brief} numberOfLines={2} meta={`${a.kind} · ${a.weight}% · due ${formatDate(a.dueDate, { year: false })}`} />
            ))}
            {assessments.map((a) => (
              <ListRow key={a.id} icon="award" iconTone="violet" title={a.title} subtitle={`${a.kind} · ${formatDate(a.date, { year: false })} · out of ${a.maxScore}`} trailing={<StatusPill label={a.status} />} />
            ))}
          </ListGroup>
        </Section>
      ) : null}

      <Button title="Submit material for this module" icon="upload" variant="tinted" onPress={() => router.push(`/material/submit?module=${m.id}`)} style={{ marginTop: 20 }} fullWidth />
    </Screen>
  );
}
