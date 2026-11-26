import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Button, Card, EmptyState, Icon, KeyValue, ListGroup, ListRow, Screen, Section, StatusPill, Text, useToast } from '@/components';
import { facultyName, getClient, getFaculty, getProgramme, getStaff, getVenue } from '@/data/selectors';
import { useDB } from '@/data/store';
import { countdown, durationLabel, formatRange, TIMEZONES } from '@/utils/dates';

import { useLearnerScope } from './data';

export default function LearnerOverviewScreen() {
  const { programme } = useLocalSearchParams<{ programme?: string }>();
  const db = useDB();
  const toast = useToast();
  const scope = useLearnerScope();
  const p = getProgramme(db, programme ?? scope.currentProgramme?.id);
  const enrolment = scope.enrollments.find((e) => e.programmeId === p?.id);
  if (!p || !enrolment) {
    return (
      <Screen title="Programme">
        <EmptyState icon="lock" title="Not available" message="You’re not enrolled in this programme." />
      </Screen>
    );
  }
  const faculty = [...new Set(db.facultyAssignments.filter((a) => a.programmeId === p.id && ['Confirmed', 'Contract Issued', 'Contracted'].includes(a.status)).map((a) => a.facultyId))].map((id) => getFaculty(db, id)!);
  const venue = getVenue(db, p.venueId);
  const cohort = db.enrollments.filter((e) => e.programmeId === p.id && ['Registered', 'Confirmed', 'Attending', 'Completed'].includes(e.status)).length;
  const support = [getStaff(db, 's-aisha'), getStaff(db, p.coordinatorId)].filter(Boolean);
  const upcoming = p.startDate > '2027-03-29';

  return (
    <Screen title={p.name} eyebrow={getClient(db, p.clientId)?.type === 'University' ? 'In partnership with Halden Business School' : 'Emeritus Executive Education'} subtitle={formatRange(p.startDate, p.endDate)}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <StatusPill label={enrolment.status === 'Attending' ? 'In progress' : enrolment.status} size="md" />
        {upcoming ? <StatusPill label={countdown(p.startDate)} tone="accent" size="md" icon="clock" /> : null}
      </View>

      <Section title="About this programme">
        <Card style={{ gap: 12 }}>
          <Text variant="body">{p.description}</Text>
          <Text variant="overline" tone="tertiary">
            You will
          </Text>
          {p.objectives.map((o) => (
            <View key={o} style={{ flexDirection: 'row', gap: 8 }}>
              <Icon name="circle-check" size={16} tone="success" />
              <Text variant="callout" style={{ flex: 1 }}>
                {o}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Essentials">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue icon="calendar" label="Dates" value={`${formatRange(p.startDate, p.endDate)} · ${durationLabel(p.startDate, p.endDate)}`} />
          <KeyValue icon="monitor-play" label="Format" value={p.deliveryMode === 'Hybrid' ? 'Hybrid · residencies + live online' : p.deliveryMode === 'Virtual' ? 'Live online' : 'In person'} />
          <KeyValue icon="map-pin" label="Location" value={venue ? `${venue.name}, ${venue.city}` : p.location} />
          <KeyValue icon="globe" label="Programme time" value={`${TIMEZONES[p.timeZone].city} (${TIMEZONES[p.timeZone].abbr})`} />
          <KeyValue icon="users" label="Your cohort" value={`${cohort} participants`} last />
        </Card>
      </Section>

      {faculty.length ? (
        <Section title="Your faculty">
          <ListGroup>
            {faculty.map((f) => (
              <ListRow key={f.id} leading={<Avatar name={f.name} hue={f.avatarHue} size={40} />} title={facultyName(f)} subtitle={`${f.title} · ${f.institution}`} numberOfLines={1} />
            ))}
          </ListGroup>
        </Section>
      ) : null}

      <Section title="Need help?" subtitle="Your learner support team replies within one working day.">
        <ListGroup>
          {support.map((s) => (
            <ListRow key={s!.id} leading={<Avatar name={s!.name} hue={s!.avatarHue} size={40} />} title={s!.name} subtitle={s!.id === 's-aisha' ? 'Learner Experience · access, schedules, certificates' : 'Programme Coordinator · on-site logistics'} />
          ))}
        </ListGroup>
        <Button title="Message learner support" icon="message-square" variant="tinted" onPress={() => toast.show({ message: 'Message sent', detail: 'Aisha Al Mansoori will get back to you shortly.', icon: 'send' })} />
      </Section>
    </Screen>
  );
}
