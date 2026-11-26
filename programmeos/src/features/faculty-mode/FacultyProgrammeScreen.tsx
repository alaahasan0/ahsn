import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Avatar, AvatarStack, Banner, Button, Card, EmptyState, Icon, IconButton, KeyValue, ListGroup, ListRow, Screen, Section, StatusPill, Text, useToast } from '@/components';
import { facultyName, getClient, getFaculty, getHotel, getProgramme, getStaff, getVenue, programmePhase } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { countdown, durationLabel, formatDate, formatRange, TIMEZONES } from '@/utils/dates';
import { money } from '@/utils/format';

import { PersonaSessionRow, TileRow, InfoTile } from './common';
import { READY_STATUSES, useFacultyScope } from './data';
import { useRequestResponse } from './useRequestResponse';

/** Programme as seen by faculty: everything needed to teach well, nothing commercial. */
export default function FacultyProgrammeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const toast = useToast();
  const { colors } = useTheme();
  const scope = useFacultyScope();
  const respond = useRequestResponse();
  const p = getProgramme(db, id);
  const a = scope.assignments.find((x) => x.programmeId === id);

  if (!p || !a) {
    return (
      <Screen title="Programme">
        <EmptyState icon="lock" title="Not available" message="This programme isn’t part of your teaching with Emeritus." actionLabel="My programmes" onAction={() => router.replace('/faculty-mode/programmes')} />
      </Screen>
    );
  }

  const tz = scope.me.timeZone;
  const client = getClient(db, p.clientId);
  const venue = getVenue(db, p.venueId);
  const phase = programmePhase(p);
  const ready = READY_STATUSES.includes(a.status);
  const mySessions = scope.sessions.filter((s) => s.programmeId === p.id);
  const myMaterials = scope.materials.filter((m) => m.programmeId === p.id);
  const colleagues = db.facultyAssignments.filter((x) => x.programmeId === p.id && x.facultyId !== scope.me.id && READY_STATUSES.includes(x.status)).map((x) => getFaculty(db, x.facultyId)!);
  const enrolled = db.enrollments.filter((e) => e.programmeId === p.id && !['Withdrawn', 'Waitlisted'].includes(e.status));
  const people = enrolled.map((e) => db.learners.find((l) => l.id === e.learnerId)!).filter(Boolean);
  const orgs = [...new Set(people.map((l) => l.organisation))];
  const bases = new Set(people.map((l) => l.country.split(',').pop()?.trim()));
  const titles = [...new Set(people.map((l) => l.jobTitle))].slice(0, 6);
  const accessCount = people.filter((l) => l.accessibility).length;
  const team = [getStaff(db, p.managerId), getStaff(db, p.coordinatorId)].filter(Boolean);
  const stay = scope.bookings.find((b) => b.programmeId === p.id);

  return (
    <Screen title={p.name} eyebrow={client?.name} subtitle={formatRange(p.startDate, p.endDate)}>
      {a.status === 'Request Sent' || a.status === 'Proposed' ? (
        <Card padding="md" style={{ gap: 10, backgroundColor: colors.warningSoft }}>
          <Text variant="headline">You’ve been invited to teach</Text>
          <Text variant="subhead" tone="secondary">
            {a.role} · {a.days} day{a.days === 1 ? '' : 's'} · fee {money(a.fee)} plus travel and accommodation. Please reply by 2 April.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Accept" icon="check" size="sm" style={{ flex: 1 }} onPress={() => respond(a, true)} />
            <Button title="Decline" variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => respond(a, false)} />
          </View>
        </Card>
      ) : a.status === 'Declined' ? (
        <Banner tone="neutral" title="You declined this request" message="The programme team has been notified. Contact Daniel Okafor if your availability changes." />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <StatusPill label={phase === 'upcoming' ? countdown(p.startDate) : phase === 'in_delivery' ? 'In delivery' : 'Delivered'} tone={phase === 'upcoming' ? 'accent' : phase === 'in_delivery' ? 'violet' : 'neutral'} size="md" />
          <StatusPill label={`${a.role} · ${ready ? 'Confirmed' : a.status}`} tone="success" size="md" />
        </View>
      )}

      <Section title="Overview">
        <Card style={{ gap: 12 }}>
          <Text variant="body">{p.description}</Text>
          <View style={{ gap: 6 }}>
            {p.objectives.map((o) => (
              <View key={o} style={{ flexDirection: 'row', gap: 8 }}>
                <Icon name="target" size={15} tone="accent" />
                <Text variant="callout" style={{ flex: 1 }}>
                  {o}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </Section>

      <Section title="Key facts">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue icon="calendar" label="Dates" value={`${formatRange(p.startDate, p.endDate)} · ${durationLabel(p.startDate, p.endDate)}`} />
          <KeyValue icon="monitor-play" label="Delivery" value={p.deliveryMode} />
          <KeyValue icon="map-pin" label="Location" value={venue ? `${venue.name}, ${venue.city}` : p.location} />
          <KeyValue icon="globe" label="Programme time" value={`${TIMEZONES[p.timeZone].label} (${TIMEZONES[p.timeZone].abbr})`} />
          <KeyValue icon="users" label="Cohort" value={`${enrolled.length} participants`} last />
        </Card>
      </Section>

      <Section title="Your sessions" subtitle={tz !== p.timeZone ? `Shown in your time (${TIMEZONES[tz].abbr}); venue time noted` : undefined}>
        {mySessions.length ? (
          <ListGroup>
            {mySessions.map((s) => (
              <PersonaSessionRow key={s.id} session={s} tz={tz} route={`/fm/session/${s.id}`} showProgramme={false} />
            ))}
          </ListGroup>
        ) : (
          <Card>
            <Text tone="secondary">{ready ? 'Your sessions are being scheduled. You’ll be notified when times are confirmed.' : 'Sessions will be scheduled once you accept.'}</Text>
          </Card>
        )}
      </Section>

      <Section title="Who you’ll be teaching" subtitle="Profile only — participant contact details stay with the programme team">
        <TileRow>
          <InfoTile icon="users" label="Participants" value={`${enrolled.length} of ${p.capacity}`} />
          <InfoTile icon="globe" label="Based in" value={`${bases.size} countr${bases.size === 1 ? 'y' : 'ies'}`} tone="violet" />
        </TileRow>
        <Card style={{ gap: 10 }}>
          <Text variant="footnote" tone="secondary">
            Organisations: {orgs.length ? orgs.slice(0, 4).join(', ') : 'Nominations in progress'}
            {orgs.length > 4 ? ` +${orgs.length - 4}` : ''}
          </Text>
          {titles.length ? (
            <View style={{ gap: 6 }}>
              {titles.map((t) => (
                <View key={t} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Icon name="briefcase" size={13} tone="tertiary" />
                  <Text variant="callout" numberOfLines={1} style={{ flex: 1 }}>
                    {t}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {accessCount ? (
            <View style={{ flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10, backgroundColor: colors.accentSoft }}>
              <Icon name="accessibility" size={15} tone="accent" />
              <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
                {accessCount} participant{accessCount === 1 ? ' has' : 's have'} accessibility requirements. The team will brief you before the programme.
              </Text>
            </View>
          ) : null}
        </Card>
      </Section>

      <Section title="Materials you provide" action="Upload" onAction={() => router.push(`/fm/upload?programme=${p.id}`)}>
        {myMaterials.length ? (
          <ListGroup>
            {myMaterials.map((m) => (
              <ListRow key={m.id} icon="file-text" iconTone="violet" title={m.title} subtitle={`${m.kind} · due ${formatDate(m.dueDate, { year: false })} · ${m.versions.length ? m.versions[m.versions.length - 1].label : 'no file yet'}`} trailing={<StatusPill label={m.status} />} onPress={() => router.push('/fm/materials')} />
            ))}
          </ListGroup>
        ) : (
          <Card>
            <Text tone="secondary">No materials requested yet.</Text>
          </Card>
        )}
      </Section>

      {colleagues.length ? (
        <Section title="Teaching alongside you">
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <AvatarStack people={colleagues.map((c) => ({ name: c.name, hue: c.avatarHue }))} size={34} />
            <Text variant="callout" tone="secondary" style={{ flex: 1 }}>
              {colleagues.map((c) => facultyName(c)).join(', ')}
            </Text>
          </Card>
        </Section>
      ) : null}

      <Section title="Programme team">
        <ListGroup>
          {team.map((m) => (
            <ListRow
              key={m!.id}
              leading={<Avatar name={m!.name} hue={m!.avatarHue} size={38} />}
              title={m!.name}
              subtitle={m!.id === p.managerId ? 'Programme Manager' : 'Programme Coordinator · on site'}
              trailing={
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <IconButton icon="mail" variant="tinted" accessibilityLabel={`Email ${m!.name}`} onPress={() => toast.show({ message: `Email to ${m!.name}`, detail: m!.email, icon: 'mail', tone: 'neutral' })} />
                  <IconButton icon="phone" variant="tinted" accessibilityLabel={`Call ${m!.name}`} onPress={() => toast.show({ message: `Calling ${m!.name}…`, detail: m!.phone, icon: 'phone', tone: 'neutral' })} />
                </View>
              }
            />
          ))}
        </ListGroup>
      </Section>

      {p.deliveryMode !== 'Virtual' && ready && phase !== 'completed' && phase !== 'archived' ? (
        <Section title="Joining information">
          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Icon name="info" size={16} tone="accent" />
              <Text variant="callout" style={{ flex: 1 }}>
                Please arrive 30 minutes before your first session for a room and AV check. Dress code is business attire.
              </Text>
            </View>
            {stay ? (
              <ListRow compact icon="bed-double" title={getHotel(db, stay.hotelId)?.name ?? 'Hotel'} subtitle={`${formatDate(stay.checkIn, { year: false })} – ${formatDate(stay.checkOut, { year: false })} · ${stay.status}`} onPress={() => router.push('/fm/hotel')} />
            ) : null}
            {scope.itineraries.some((t) => t.programmeId === p.id) ? <ListRow compact icon="plane" title="Your itinerary" subtitle="Flights and transfers" onPress={() => router.push('/fm/travel')} /> : null}
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}
