import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Button, Card, HeaderActions, Icon, IconButton, IconTile, ListGroup, ListRow, Screen, Section, StatusPill, Text, Touchable, useToast } from '@/components';
import { getProgramme, unreadCount } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { formatDate, formatDateLong, formatRange, greeting, timeAgo, tzAbbr } from '@/utils/dates';

import { inZone, localNow, modeLine, MODE_ICON, startsIn } from './common';
import { READY_STATUSES, useFacultyScope } from './data';
import { localState, useLocalState } from './localState';
import { useRequestResponse } from './useRequestResponse';
import { NOTIFICATION_ICON } from '../shared/helpers';

export default function FacultyHomeScreen() {
  const s = useStyles(styles);
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const local = useLocalState();
  const scope = useFacultyScope();
  const { me } = scope;
  const tz = me.timeZone;
  const now = localNow(tz);
  const next = scope.upcoming[0];
  const nextProg = next ? getProgramme(db, next.programmeId) : undefined;
  const z = next ? inZone(next, tz) : undefined;

  const request = scope.assignments.find((a) => a.status === 'Request Sent' || a.status === 'Proposed');
  const requestProg = request ? getProgramme(db, request.programmeId) : undefined;
  const pslAccepted = scope.assignments.find((a) => a.programmeId === 'p-psl' && READY_STATUSES.includes(a.status));
  const briefingAdded = local.calendarAdded.includes('briefing-elp');

  const respondTo = useRequestResponse();
  const respond = (accept: boolean) => request && respondTo(request, accept);

  const upcomingProgs = scope.programmes.filter((p) => p.endDate >= now.date && !p.archived && !p.cancelled).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const pendingMaterials = scope.materials.filter((m) => !['Approved', 'Published'].includes(m.status));
  const trip = scope.itineraries.filter((t) => t.segments.length && t.segments[0].date >= now.date).sort((a, b) => a.segments[0].date.localeCompare(b.segments[0].date))[0];
  const tripHotel = trip ? scope.bookings.find((b) => b.programmeId === trip.programmeId) : undefined;
  const notes = scope.notifications.slice(0, 3);

  return (
    <Screen
      title={`${greeting(now.time)}, ${me.name.split(' ')[0]}`}
      eyebrow={`${formatDateLong(now.date, true)} · ${tzAbbr(tz)}`}
      subtitle="Here’s what’s coming up in your teaching."
      back={false}
      refreshable
      headerRight={
        <HeaderActions>
          <IconButton icon="bell" accessibilityLabel="Inbox" badge={unreadCount(db, 'faculty') > 0} onPress={() => router.push('/faculty-mode/inbox')} />
          <Touchable onPress={() => router.push('/faculty-mode/profile')} accessibilityLabel="Profile" style={{ marginLeft: 4 }}>
            <Avatar name={me.name} hue={me.avatarHue} size={32} />
          </Touchable>
        </HeaderActions>
      }>
      {next && z && nextProg ? (
        <Card padding="lg" style={s.hero}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="overline" tone="accent" style={{ flex: 1 }}>
              Next teaching session
            </Text>
            <StatusPill label={startsIn(next, tz)} tone="accent" icon="clock" />
          </View>
          <Text variant="title2" style={{ marginTop: 8 }}>
            {next.title}
          </Text>
          <Text variant="callout" tone="secondary" style={{ marginTop: 2 }}>
            {nextProg.name}
          </Text>
          <View style={s.heroFacts}>
            <View style={s.fact}>
              <Icon name="calendar" size={15} tone="secondary" />
              <Text variant="callout">
                {formatDate(z.date, { weekday: true, year: false })} · {z.start}–{z.end} {tzAbbr(tz)}
              </Text>
            </View>
            {next.timeZone !== tz ? (
              <Text variant="footnote" tone="tertiary" style={{ marginLeft: 23 }}>
                {next.start}–{next.end} {tzAbbr(next.timeZone)} in {nextProg.location.split(',').pop()?.trim()}
              </Text>
            ) : null}
            <View style={s.fact}>
              <Icon name={MODE_ICON[next.deliveryMode]} size={15} tone="secondary" />
              <Text variant="callout" numberOfLines={1} style={{ flex: 1 }}>
                {modeLine(next)}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Button title="View session" iconRight="arrow-right" onPress={() => router.push(`/fm/session/${next.id}`)} style={{ flex: 1 }} />
            <Button title="Programme" variant="secondary" onPress={() => router.push(`/fm/programme/${next.programmeId}`)} style={{ flex: 1 }} />
          </View>
        </Card>
      ) : (
        <Card padding="lg">
          <Text variant="title3">No upcoming sessions</Text>
          <Text tone="secondary">New teaching requests will appear here.</Text>
        </Card>
      )}

      <Section title="Needs your response">
        <ListGroup>
          {request && requestProg ? (
            <View style={s.request}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <IconTile icon="mail-open" tone="warning" size={34} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="headline">Teaching request · {requestProg.shortName}</Text>
                  <Text variant="subhead" tone="secondary">
                    {requestProg.name} · {formatRange(requestProg.startDate, requestProg.endDate)} · {requestProg.location.split(',').pop()?.trim()} · {request.days} day{request.days === 1 ? '' : 's'}
                  </Text>
                  <Text variant="footnote" tone="warning">
                    Reply by 2 April · requested {formatDate(request.requestedOn, { year: false })}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button title="Accept" icon="check" size="sm" onPress={() => respond(true)} style={{ flex: 1 }} />
                <Button title="Decline" variant="secondary" size="sm" onPress={() => respond(false)} style={{ flex: 1 }} />
                <Button title="Details" variant="plain" size="sm" onPress={() => router.push(`/fm/programme/${requestProg.id}`)} />
              </View>
            </View>
          ) : null}
          {pslAccepted ? <ListRow icon="file-up" iconTone="violet" title="Share your PSL session outline" subtitle="Due 30 April · one page is enough" onPress={() => router.push('/fm/upload?programme=p-psl')} /> : null}
          <ListRow
            icon="video"
            iconTone="accent"
            title="Meridian context briefing"
            subtitle="Tue 6 April · 14:00 BST · 30 min with Layla Haddad"
            trailing={
              briefingAdded ? (
                <StatusPill label="Added" tone="success" icon="check" />
              ) : (
                <Button
                  title="Add"
                  size="sm"
                  variant="tinted"
                  icon="calendar-plus"
                  onPress={() => {
                    localState.addTo('calendarAdded', 'briefing-elp');
                    toast.show({ message: 'Added to your calendar', detail: 'Simulated — no calendar is connected yet.', icon: 'calendar-check' });
                  }}
                />
              )
            }
          />
          {pendingMaterials.map((m) => (
            <ListRow key={m.id} icon="book-open" iconTone="warning" title={m.title} subtitle={`${m.status} · due ${formatDate(m.dueDate, { year: false })}`} onPress={() => router.push('/fm/materials')} />
          ))}
        </ListGroup>
      </Section>

      {trip ? (
        <Section title="Travel" action="Itinerary" onAction={() => router.push('/fm/travel')}>
          <Card onPress={() => router.push('/fm/travel')} padding="md" style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ alignItems: 'flex-start' }}>
                <Text variant="metric">{trip.segments[0].from}</Text>
                <Text variant="caption" tone="tertiary">
                  {trip.segments[0].fromCity}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                <Icon name="plane" size={18} tone="accent" />
                <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: colors.border }} />
                <Text variant="caption" tone="tertiary">
                  {trip.segments[0].flightNumber}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="metric">{trip.segments[0].to}</Text>
                <Text variant="caption" tone="tertiary">
                  {trip.segments[0].toCity}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <StatusPill label={trip.status} />
              <Text variant="footnote" tone="secondary">
                {formatDate(trip.segments[0].date, { weekday: true, year: false })} · departs {trip.segments[0].depart}
              </Text>
            </View>
            {tripHotel ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="bed-double" size={15} tone="secondary" />
                <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
                  {db.hotels.find((h) => h.id === tripHotel.hotelId)?.name} · {tripHotel.roomType} · {tripHotel.status}
                </Text>
              </View>
            ) : null}
          </Card>
        </Section>
      ) : null}

      <Section title="Your programmes" action="All" onAction={() => router.push('/faculty-mode/programmes')}>
        <ListGroup>
          {upcomingProgs.map((p) => {
            const a = scope.assignments.find((x) => x.programmeId === p.id)!;
            return (
              <ListRow
                key={p.id}
                leading={<View style={[s.dot, { backgroundColor: `hsl(${p.accentHue}, 62%, 58%)` }]} />}
                title={p.name}
                subtitle={`${formatRange(p.startDate, p.endDate)} · ${a.role}`}
                trailing={<StatusPill label={READY_STATUSES.includes(a.status) ? 'Confirmed' : a.status} />}
                onPress={() => router.push(`/fm/programme/${p.id}`)}
              />
            );
          })}
        </ListGroup>
      </Section>

      <Section title="Latest updates" action="Inbox" onAction={() => router.push('/faculty-mode/inbox')}>
        <ListGroup>
          {notes.map((n) => (
            <ListRow
              key={n.id}
              icon={NOTIFICATION_ICON[n.category].icon}
              iconTone={NOTIFICATION_ICON[n.category].tone === 'neutral' ? 'neutral' : (NOTIFICATION_ICON[n.category].tone as 'accent')}
              title={n.title}
              subtitle={n.body}
              meta={timeAgo(n.date)}
              trailing={<View style={[s.unread, { backgroundColor: n.read ? 'transparent' : colors.accent }]} />}
              onPress={() => {
                actions.markNotificationRead(n.id);
                if (n.route) router.push(n.route as never);
              }}
            />
          ))}
        </ListGroup>
      </Section>
    </Screen>
  );
}

const styles = makeStyles((t) => ({
  hero: { borderWidth: t.hairline, borderColor: t.colors.border },
  heroFacts: { gap: 6, marginTop: 12, padding: 12, borderRadius: t.radii.md, backgroundColor: t.colors.surfaceAlt },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  request: { padding: 16 },
  dot: { width: 10, height: 34, borderRadius: 4 },
  unread: { width: 9, height: 9, borderRadius: 5 },
}));
