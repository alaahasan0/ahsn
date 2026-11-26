import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, EmptyState, Icon, ListGroup, ListRow, Screen, Section, StatusPill, Tag, Text, useToast } from '@/components';
import { facultyName, getFaculty, getProgramme, getSession, getStaff } from '@/data/selectors';
import { useDB } from '@/data/store';
import { makeStyles, useStyles } from '@/theme';
import { durationMinutesLabel, formatDate, formatDateLong, tzAbbr } from '@/utils/dates';

import { SESSION_KIND_ICON } from '../shared/helpers';
import { inZone, isUpcoming, JoinPanel, startsIn } from './common';
import { useFacultyScope } from './data';

export default function FacultySessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = useStyles(styles);
  const db = useDB();
  const toast = useToast();
  const scope = useFacultyScope();
  const session = getSession(db, id);
  if (!session || !session.facultyIds.includes(scope.me.id)) {
    return (
      <Screen title="Session">
        <EmptyState icon="calendar-x" title="Session not available" message="This session isn’t on your teaching schedule." />
      </Screen>
    );
  }
  const tz = scope.me.timeZone;
  const p = getProgramme(db, session.programmeId)!;
  const z = inZone(session, tz);
  const upcoming = isUpcoming(session);
  const materials = session.materialIds.map((mid) => db.materials.find((m) => m.id === mid)!).filter(Boolean);
  const coFaculty = session.facultyIds.filter((f) => f !== scope.me.id).map((f) => getFaculty(db, f)!);
  const enrolled = db.enrollments.filter((e) => e.programmeId === p.id && !['Withdrawn', 'Waitlisted', 'Nominated'].includes(e.status)).length;
  const room = db.venueBookings.find((b) => b.programmeId === p.id && b.venueId === session.venueId);
  const coordinator = getStaff(db, p.coordinatorId);
  const multiDay = session.date !== session.endDate;

  return (
    <Screen title={session.title} eyebrow={p.name} large>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <StatusPill label={upcoming ? startsIn(session, tz) : session.status} tone={upcoming ? 'accent' : 'neutral'} size="md" icon={upcoming ? 'clock' : undefined} />
        <Tag label={session.kind} icon={SESSION_KIND_ICON[session.kind]} />
        <Tag label={session.deliveryMode} />
      </View>

      <Card padding="lg" style={{ marginTop: 14, gap: 6 }}>
        <Text variant="overline" tone="tertiary">
          Your time · {tzAbbr(tz)}
        </Text>
        <Text variant="metric">
          {z.start}–{z.end}
        </Text>
        <Text variant="callout" tone="secondary">
          {multiDay ? `${formatDate(z.date, { weekday: true, year: false })} – ${formatDate(z.endDate, { weekday: true })}, daily` : formatDateLong(z.date, true)} · {durationMinutesLabel(session.start, session.end)}
        </Text>
        {session.timeZone !== tz ? (
          <View style={s.zoneNote}>
            <Icon name="globe" size={14} tone="secondary" />
            <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
              {session.start}–{session.end} {tzAbbr(session.timeZone)} for participants at the venue
            </Text>
          </View>
        ) : null}
      </Card>

      <Section title="Where">
        <JoinPanel session={session} />
      </Section>

      <Section title="Agenda">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          {session.agenda.map((a, i) => (
            <View key={a.time + a.item} style={[s.agendaRow, i < session.agenda.length - 1 && s.agendaBorder]}>
              <Text variant="headline" tabular style={{ width: 52 }}>
                {a.time}
              </Text>
              <Text variant="callout" style={{ flex: 1 }}>
                {a.item}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Objectives">
        <Card style={{ gap: 8 }}>
          {session.objectives.map((o) => (
            <View key={o} style={{ flexDirection: 'row', gap: 8 }}>
              <Icon name="target" size={15} tone="accent" />
              <Text variant="callout" style={{ flex: 1 }}>
                {o}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Materials" action="Upload" onAction={() => router.push(`/fm/upload?session=${session.id}`)}>
        {materials.length ? (
          <ListGroup>
            {materials.map((m) => (
              <ListRow key={m.id} icon="file-text" iconTone="violet" title={m.title} subtitle={`${m.ownerFacultyId === scope.me.id ? 'Yours' : facultyName(getFaculty(db, m.ownerFacultyId))} · ${m.format}`} trailing={<StatusPill label={m.status} />} onPress={() => router.push('/fm/materials')} />
            ))}
          </ListGroup>
        ) : (
          <Card>
            <Text tone="secondary">No materials linked to this session.</Text>
          </Card>
        )}
      </Section>

      <Section title="Room & participants">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <Fact icon="users" label="Participants" value={`${enrolled} confirmed · capacity ${session.capacity}`} />
          {room ? <Fact icon="armchair" label="Layout" value={`${room.layout}, ${room.attendees} seats`} /> : null}
          {room ? <Fact icon="projector" label="AV" value={room.av.map((x) => x.item).slice(0, 3).join(' · ')} /> : null}
          {session.deliveryMode !== 'In-person' ? <Fact icon="monitor-play" label="Online" value="Producer on call · breakout rooms pre-assigned" /> : null}
          {coFaculty.length ? <Fact icon="user-check" label="Co-faculty" value={coFaculty.map((f) => facultyName(f)).join(', ')} /> : null}
          <Fact icon="clipboard-list" label="On-site contact" value={`${coordinator?.name} · ${coordinator?.phone}`} last />
        </Card>
      </Section>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
        <Button title="Message team" icon="message-square" variant="secondary" style={{ flex: 1 }} onPress={() => toast.show({ message: 'Message sent to the programme team', detail: 'They usually reply within a few hours.', icon: 'send' })} />
        <Button title="Programme" icon="layers" variant="tinted" style={{ flex: 1 }} onPress={() => router.push(`/fm/programme/${p.id}`)} />
      </View>
    </Screen>
  );
}

function Fact({ icon, label, value, last }: { icon: Parameters<typeof Icon>[0]['name']; label: string; value: string; last?: boolean }) {
  const s = useStyles(styles);
  return (
    <View style={[s.fact, !last && s.agendaBorder]}>
      <Icon name={icon} size={16} tone="tertiary" />
      <View style={{ flex: 1 }}>
        <Text variant="footnote" tone="secondary">
          {label}
        </Text>
        <Text variant="callout">{value}</Text>
      </View>
    </View>
  );
}

const styles = makeStyles((t) => ({
  zoneNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, padding: 10, borderRadius: t.radii.md, backgroundColor: t.colors.surfaceAlt },
  agendaRow: { flexDirection: 'row', gap: 12, paddingVertical: 11 },
  agendaBorder: { borderBottomWidth: t.hairline, borderBottomColor: t.colors.separator },
  fact: { flexDirection: 'row', gap: 12, paddingVertical: 11, alignItems: 'flex-start' },
}));
