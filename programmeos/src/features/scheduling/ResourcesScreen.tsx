import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Card, Chip, ChipRow, EmptyState, IconButton, ListGroup, ListRow, Screen, Section, StatusPill, Text, Touchable } from '@/components';
import type { Session, VenueBooking } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { addDays, DEMO_TODAY, formatRange, parseDate, startOfWeek, WEEKDAYS_SHORT, weekday } from '@/utils/dates';

import { LoadGate } from '../shared/Widgets';

/** Resource scheduling: room-by-day availability across venues. */
export default function ResourcesScreen() {
  const db = useDB();
  const s = useStyles(styles);
  const { colors } = useTheme();
  const [venueId, setVenueId] = useState('v-creekside');
  const firstWeekFor = (vid: string) => {
    const dates = [
      ...db.venueBookings.filter((b) => b.venueId === vid && b.status !== 'Cancelled' && b.dates.to >= DEMO_TODAY).map((b) => (b.dates.from < DEMO_TODAY ? DEMO_TODAY : b.dates.from)),
      ...db.sessions.filter((x) => x.venueId === vid && x.endDate >= DEMO_TODAY && x.status !== 'Cancelled').map((x) => (x.date < DEMO_TODAY ? DEMO_TODAY : x.date)),
    ].sort();
    return startOfWeek(dates[0] ?? DEMO_TODAY, 1);
  };
  const [weekStart, setWeekStart] = useState(() => firstWeekFor('v-creekside'));
  const venue = db.venues.find((v) => v.id === venueId)!;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const bookings = db.venueBookings.filter((b) => b.venueId === venueId && b.status !== 'Cancelled');
  const sessions = db.sessions.filter((x) => x.venueId === venueId && x.status !== 'Cancelled');

  const cellFor = (roomId: string, roomName: string, d: string): { booking?: VenueBooking; session?: Session } => {
    const booking = bookings.find((b) => b.roomId === roomId && b.dates.from <= d && b.dates.to >= d);
    const session = sessions.find((x) => x.roomName === roomName && x.date <= d && x.endDate >= d);
    return { booking, session };
  };

  let used = 0;
  for (const r of venue.rooms) for (const d of days) if (cellFor(r.id, r.name, d).booking || cellFor(r.id, r.name, d).session) used++;
  const total = venue.rooms.length * 7;

  const upcoming = bookings.filter((b) => b.dates.to >= DEMO_TODAY).sort((a, b) => a.dates.from.localeCompare(b.dates.from));

  return (
    <Screen
      title="Resources"
      subtitle="Room availability across venues — bookings and scheduled sessions in one view."
      headerBelow={
        <>
          <ChipRow>
            {db.venues.map((v) => (
              <Chip
                key={v.id}
                label={v.name.replace(' Conference Wing', '').replace(' Conference Centre', '')}
                selected={v.id === venueId}
                onPress={() => {
                  setVenueId(v.id);
                  setWeekStart(firstWeekFor(v.id));
                }}
              />
            ))}
          </ChipRow>
          <View style={s.nav}>
            <IconButton icon="chevron-left" accessibilityLabel="Previous week" variant="filled" size={34} onPress={() => setWeekStart(addDays(weekStart, -7))} />
            <Text variant="headline" align="center" style={{ flex: 1 }}>
              {formatRange(weekStart, addDays(weekStart, 6))}
            </Text>
            <IconButton icon="chevron-right" accessibilityLabel="Next week" variant="filled" size={34} onPress={() => setWeekStart(addDays(weekStart, 7))} />
          </View>
        </>
      }>
      <LoadGate loadKey="resources">
        <Card padding="md" style={{ gap: 4 }}>
          <Text variant="headline">{venue.name}</Text>
          <Text variant="footnote" tone="secondary">
            {venue.city} · {venue.rooms.length} room{venue.rooms.length > 1 ? 's' : ''} · {total - used} of {total} room-days free this week
          </Text>
        </Card>

        {venue.rooms.map((r) => (
          <Section key={r.id} title={r.name} subtitle={`${r.floor} · ${r.sizeSqm} m² · ${Object.entries(r.capacity).map(([k, n]) => `${k} ${n}`).join(' · ')}`}>
            <View style={s.strip}>
              {days.map((d) => {
                const { booking, session } = cellFor(r.id, r.name, d);
                const p = getProgramme(db, booking?.programmeId ?? session?.programmeId);
                const hue = p?.accentHue ?? 220;
                const busy = !!(booking || session);
                const route = booking ? `/venue-booking/${booking.id}` : session ? `/session/${session.id}` : undefined;
                return (
                  <Touchable
                    key={d}
                    disabled={!route}
                    onPress={route ? () => router.push(route as never) : undefined}
                    feedback="opacity"
                    accessibilityLabel={`${WEEKDAYS_SHORT[weekday(d)]} ${parseDate(d).day}: ${busy ? `${p?.shortName} ${booking?.status ?? 'session'}` : 'free'}`}
                    style={[
                      s.cell,
                      busy
                        ? { backgroundColor: booking?.status === 'Confirmed' || !booking ? `hsla(${hue}, 70%, 58%, 0.22)` : `hsla(${hue}, 70%, 58%, 0.1)`, borderColor: `hsl(${hue}, 62%, 56%)`, borderStyle: booking && booking.status !== 'Confirmed' ? 'dashed' : 'solid' }
                        : { backgroundColor: colors.surface, borderColor: colors.border },
                      d === DEMO_TODAY && { borderWidth: 2, borderColor: colors.accent },
                    ]}>
                    <Text variant="caption" tone="tertiary">
                      {WEEKDAYS_SHORT[weekday(d)].slice(0, 1)}
                    </Text>
                    <Text variant="headline" tabular>
                      {parseDate(d).day}
                    </Text>
                    <Text variant="caption" numberOfLines={1} tone={busy ? 'primary' : 'tertiary'} style={{ fontSize: 9.5 }}>
                      {busy ? p?.shortName : 'Free'}
                    </Text>
                  </Touchable>
                );
              })}
            </View>
          </Section>
        ))}

        <View style={s.legend}>
          <LegendSwatch label="Confirmed" solid />
          <LegendSwatch label="Provisional / enquiry" />
          <LegendSwatch label="Free" free />
        </View>

        <Section title="Bookings at this venue">
          {upcoming.length ? (
            <ListGroup>
              {upcoming.map((b) => {
                const p = getProgramme(db, b.programmeId);
                const room = venue.rooms.find((x) => x.id === b.roomId);
                return <ListRow key={b.id} icon="door-open" iconTone="info" title={`${p?.shortName} · ${room?.name}`} subtitle={`${formatRange(b.dates.from, b.dates.to)} · ${b.layout} for ${b.attendees}`} trailing={<StatusPill label={b.status} />} onPress={() => router.push(`/venue-booking/${b.id}`)} />;
              })}
            </ListGroup>
          ) : (
            <EmptyState icon="building-2" title="No upcoming bookings" message="This venue is free for all upcoming programmes." />
          )}
        </Section>
      </LoadGate>
    </Screen>
  );
}

function LegendSwatch({ label, solid, free }: { label: string; solid?: boolean; free?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 14, height: 14, borderRadius: 4, borderWidth: 1.5, borderStyle: solid || free ? 'solid' : 'dashed', borderColor: free ? colors.border : colors.accent, backgroundColor: free ? colors.surface : solid ? colors.accentSoftStrong : colors.accentSoft }} />
      <Text variant="footnote" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = makeStyles(() => ({
  nav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  strip: { flexDirection: 'row', gap: 4 },
  cell: { flex: 1, minHeight: 74, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 18 },
}));
