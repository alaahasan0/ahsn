import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Banner, Button, Card, EmptyState, HeaderActions, IconButton, KeyValue, ListGroup, ListRow, Screen, Section, Sheet, Stat, StatGrid, StatusPill, Text, TextField, useToast } from '@/components';
import { getLearner, getProgramme, learnerName } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { formatDate, formatRange } from '@/utils/dates';

import { ProfileHeader } from '../people/ProfileHeader';

/** A person, independent of any single programme. Enrolments are listed separately. */
export default function LearnerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const l = getLearner(db, id);
  const [editOpen, setEditOpen] = useState(false);
  const [dietary, setDietary] = useState(l?.dietary ?? '');
  const [accessibility, setAccessibility] = useState(l?.accessibility ?? '');
  const [notes, setNotes] = useState(l?.notes ?? '');

  if (!l) {
    return (
      <Screen title="Learner">
        <EmptyState icon="user-x" title="Learner not found" message="This person may have been removed." actionLabel="Back to learners" onAction={() => router.replace('/learners')} />
      </Screen>
    );
  }

  const name = learnerName(l);
  const enrolments = db.enrollments.filter((e) => e.learnerId === l.id).sort((a, b) => (getProgramme(db, b.programmeId)?.startDate ?? '').localeCompare(getProgramme(db, a.programmeId)?.startDate ?? ''));
  const completed = enrolments.filter((e) => e.status === 'Completed');
  const withRate = enrolments.filter((e) => e.attendanceRate != null && e.status !== 'Withdrawn');
  const avgAttendance = withRate.length ? Math.round(withRate.reduce((s, e) => s + (e.attendanceRate ?? 0), 0) / withRate.length) : null;
  const certificates = enrolments.filter((e) => e.certificateIssued);
  const submissions = db.submissions.filter((s) => s.learnerId === l.id);
  const attendance = db.attendance.filter((a) => a.learnerId === l.id);

  const openEdit = () => {
    setDietary(l.dietary ?? '');
    setAccessibility(l.accessibility ?? '');
    setNotes(l.notes ?? '');
    setEditOpen(true);
  };
  const save = () => {
    actions.update('learners', l.id, { dietary: dietary.trim() || undefined, accessibility: accessibility.trim() || undefined, notes: notes.trim() || undefined });
    setEditOpen(false);
    toast.show({ message: 'Requirements updated', detail: `Shared with catering, hotel and on-site teams for ${l.firstName}’s programmes.` });
  };
  const contact = (what: string) => toast.show({ message: what, detail: 'Simulated — no message was sent.', tone: 'accent', icon: 'send' });

  return (
    <Screen
      title={name}
      eyebrow="Learner"
      headerRight={
        <HeaderActions>
          <IconButton icon="pencil" accessibilityLabel="Edit requirements" onPress={openEdit} />
        </HeaderActions>
      }>
      <ProfileHeader
        name={name}
        hue={l.avatarHue}
        initials={l.initials}
        title={l.jobTitle}
        subtitle={l.organisation}
        meta={l.country}
        badges={
          <>
            <StatusPill label={`${enrolments.length} programme${enrolments.length === 1 ? '' : 's'}`} tone="accent" dot={false} />
            {l.accessibility ? <StatusPill label="Accessibility needs" tone="info" icon="accessibility" /> : null}
          </>
        }
        actions={[
          { icon: 'mail', label: 'Email', onPress: () => contact(`Email to ${l.firstName}`) },
          { icon: 'phone', label: 'Call', onPress: () => contact(`Calling ${l.firstName}`) },
          { icon: 'message-circle', label: 'WhatsApp', onPress: () => contact(`WhatsApp to ${l.firstName}`) },
          { icon: 'graduation-cap', label: 'Enrol', onPress: () => router.push(`/learners/register?learner=${l.id}`) },
        ]}
      />

      {l.accessibility ? <Banner tone="info" icon="accessibility" style={{ marginTop: 16 }} title="Accessibility requirement" message={l.accessibility} /> : null}

      <Section title="Programme enrolments" subtitle="One person, many programmes" action="Enrol" onAction={() => router.push(`/learners/register?learner=${l.id}`)}>
        {enrolments.length ? (
          <ListGroup>
            {enrolments.map((e) => {
              const p = getProgramme(db, e.programmeId);
              return <ListRow key={e.id} icon="layers" iconTone={e.status === 'Completed' ? 'success' : e.status === 'Withdrawn' ? 'neutral' : 'accent'} title={p?.name ?? ''} numberOfLines={2} subtitle={p ? `${formatRange(p.startDate, p.endDate)} · ${p.deliveryMode}` : ''} trailing={<StatusPill label={e.status} />} onPress={() => router.push(`/enrollment/${e.id}`)} />;
            })}
          </ListGroup>
        ) : (
          <EmptyState icon="layers" title="Not enrolled yet" message="Enrol this person in a programme to start their journey." actionLabel="Enrol" onAction={() => router.push(`/learners/register?learner=${l.id}`)} compact />
        )}
      </Section>

      <Section title="Learning record">
        <StatGrid>
          <Stat label="Completed" value={String(completed.length)} caption="Programmes" icon="award" tone="success" />
          <Stat label="Attendance" value={avgAttendance != null ? `${avgAttendance}%` : '—'} caption="Average across programmes" icon="user-check" />
          <Stat label="Certificates" value={String(certificates.length)} caption="Issued" icon="badge-check" tone="violet" />
          <Stat label="Feedback" value={`${enrolments.filter((e) => e.feedbackSubmitted).length}/${completed.length || enrolments.length}`} caption="Evaluations submitted" icon="message-square" />
        </StatGrid>
      </Section>

      <Section title="Contact">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue label="Email" value={l.email} icon="mail" />
          <KeyValue label="Phone" value={l.phone} icon="phone" />
          {l.linkedIn ? <KeyValue label="LinkedIn" value={l.linkedIn} icon="link-2" /> : null}
          <KeyValue label="Based in" value={l.country} icon="map-pin" last />
        </Card>
      </Section>

      <Section title="Requirements" action="Edit" onAction={openEdit}>
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue label="Dietary" value={l.dietary ?? 'None recorded'} icon="salad" />
          <KeyValue label="Accessibility" value={l.accessibility ?? 'None recorded'} icon="accessibility" multiline />
          <KeyValue label="Notes" value={l.notes ?? '—'} icon="notebook-pen" multiline last />
        </Card>
      </Section>

      {submissions.length || completed.some((e) => e.assessmentScore != null) ? (
        <Section title="Assessments">
          <ListGroup>
            {completed
              .filter((e) => e.assessmentScore != null)
              .map((e) => (
                <ListRow key={e.id} icon="award" iconTone="violet" title={`${getProgramme(db, e.programmeId)?.shortName} final assessment`} value={`${e.assessmentScore}/100`} />
              ))}
            {submissions.map((sb) => {
              const a = db.assignments.find((x) => x.id === sb.assignmentId);
              return <ListRow key={sb.id} icon="notebook-pen" iconTone="accent" title={a?.title ?? 'Assignment'} subtitle={`${getProgramme(db, a?.programmeId)?.shortName} · ${sb.submittedOn ? `submitted ${formatDate(sb.submittedOn)}` : 'not yet submitted'}`} trailing={sb.grade ? <Text variant="headline">{sb.grade}</Text> : <StatusPill label={sb.status} />} />;
            })}
          </ListGroup>
        </Section>
      ) : null}

      <Section title="Certificates">
        {certificates.length ? (
          <ListGroup>
            {certificates.map((e) => (
              <ListRow key={e.id} icon="badge-check" iconTone="success" numberOfLines={2} title={getProgramme(db, e.programmeId)?.name ?? ''} subtitle={`Certificate ${e.certificateId}`} onPress={() => router.push(`/enrollment/${e.id}`)} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="award" title="No certificates yet" message="Certificates are issued when a programme is completed." compact />
        )}
      </Section>

      {attendance.length ? (
        <Section title="Attendance records">
          <ListGroup>
            {attendance.map((a) => {
              const s = db.sessions.find((x) => x.id === a.sessionId);
              return <ListRow key={a.id} icon="calendar-check" iconTone={a.status === 'Present' ? 'success' : a.status === 'Late' ? 'warning' : 'danger'} title={s?.title ?? 'Session'} subtitle={s ? formatDate(s.date) : ''} value={a.status} onPress={s ? () => router.push(`/session/${s.id}`) : undefined} />;
            })}
          </ListGroup>
        </Section>
      ) : null}

      <Sheet visible={editOpen} onClose={() => setEditOpen(false)} title="Requirements" subtitle={name} footer={<Button title="Save" onPress={save} style={{ flex: 1 }} />}>
        <View style={{ gap: 14 }}>
          <TextField label="Dietary requirements" value={dietary} onChangeText={setDietary} placeholder="e.g. Vegetarian, nut allergy" icon="salad" />
          <TextField label="Accessibility requirements" value={accessibility} onChangeText={setAccessibility} placeholder="e.g. Step-free access, captions" icon="accessibility" multiline />
          <TextField label="Notes for the programme team" value={notes} onChangeText={setNotes} placeholder="Visible to internal staff only" multiline />
          <Text variant="footnote" tone="tertiary">
            Requirements belong to the person and apply to every programme they attend.
          </Text>
        </View>
      </Sheet>
    </Screen>
  );
}
