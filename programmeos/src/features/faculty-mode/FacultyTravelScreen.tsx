import { View } from 'react-native';

import { Button, Card, EmptyState, Icon, Screen, Section, StatusPill, Text, useToast } from '@/components';
import type { FlightSegment, TravelItinerary } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { DEMO_TODAY, formatDate } from '@/utils/dates';

import { useFacultyScope } from './data';

/** Boarding-pass style flight card, shared with other external screens. */
export function FlightCard({ seg }: { seg: FlightSegment }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  return (
    <View style={s.pass} accessibilityLabel={`${seg.carrier} ${seg.flightNumber} from ${seg.fromCity} to ${seg.toCity}, ${formatDate(seg.date)} departing ${seg.depart}`}>
      <View style={s.passTop}>
        <Text variant="footnote" weight="semibold">
          {seg.carrier}
        </Text>
        <Text variant="footnote" tone="secondary">
          {seg.flightNumber} · {seg.cabin}
        </Text>
      </View>
      <View style={s.route}>
        <View>
          <Text variant="metricXL" style={{ fontSize: 30, lineHeight: 34 }}>
            {seg.from}
          </Text>
          <Text variant="footnote" tone="secondary">
            {seg.fromCity}
          </Text>
          <Text variant="headline" tabular style={{ marginTop: 6 }}>
            {seg.depart}
          </Text>
          <Text variant="caption" tone="tertiary">
            {formatDate(seg.date, { weekday: true, year: false })}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8, gap: 4 }}>
          <Icon name="plane" size={20} tone="accent" />
          <View style={{ height: 1, alignSelf: 'stretch', borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong }} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="metricXL" style={{ fontSize: 30, lineHeight: 34 }}>
            {seg.to}
          </Text>
          <Text variant="footnote" tone="secondary">
            {seg.toCity}
          </Text>
          <Text variant="headline" tabular style={{ marginTop: 6 }}>
            {seg.arrive}
          </Text>
          <Text variant="caption" tone="tertiary">
            {formatDate(seg.arriveDate, { weekday: true, year: false })}
          </Text>
        </View>
      </View>
      <View style={s.perforation}>
        <View style={[s.notch, { left: -9, backgroundColor: colors.background }]} />
        <View style={{ flex: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.border }} />
        <View style={[s.notch, { right: -9, backgroundColor: colors.background }]} />
      </View>
      <View style={s.passBottom}>
        <Cell label="Seat" value={seg.seat ?? 'Assigned at check-in'} />
        <Cell label="Booking ref" value={seg.pnr ?? '—'} />
      </View>
    </View>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
      <Text variant="headline" tabular numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function TripSection({ trip }: { trip: TravelItinerary }) {
  const db = useDB();
  const toast = useToast();
  const p = getProgramme(db, trip.programmeId);
  return (
    <Section title={p?.name ?? 'Trip'} subtitle={trip.notes}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <StatusPill label={trip.status} size="md" />
        {trip.visaRequired ? <StatusPill label={`Visa: ${trip.visaStatus}`} tone={trip.visaStatus === 'Issued' ? 'success' : 'warning'} size="md" /> : null}
      </View>
      {trip.segments.map((seg) => (
        <FlightCard key={seg.id} seg={seg} />
      ))}
      {trip.transfers.map((t) => (
        <Card key={t.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="car" size={20} tone="accent" />
          <View style={{ flex: 1 }}>
            <Text variant="headline">Transfer · {t.provider}</Text>
            <Text variant="footnote" tone="secondary">
              {formatDate(t.date, { weekday: true, year: false })} · {t.time} · {t.from} → {t.to}
            </Text>
          </View>
          <StatusPill label={t.status} />
        </Card>
      ))}
      {trip.segments.length ? (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Add to wallet" icon="ticket" variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => toast.show({ message: 'Boarding passes are issued at check-in', detail: 'Simulated — you’ll be reminded 24 hours before departure.', icon: 'ticket', tone: 'neutral' })} />
          <Button title="Request change" icon="repeat" variant="tinted" size="sm" style={{ flex: 1 }} onPress={() => toast.show({ message: 'Change request sent', detail: 'Sofia Marques will contact you with options.', icon: 'send' })} />
        </View>
      ) : null}
    </Section>
  );
}

export default function FacultyTravelScreen() {
  const scope = useFacultyScope();
  const trips = [...scope.itineraries].sort((a, b) => (a.segments[0]?.date ?? '9999').localeCompare(b.segments[0]?.date ?? '9999'));
  const upcoming = trips.filter((t) => !t.segments.length || t.segments[t.segments.length - 1].arriveDate >= DEMO_TODAY);
  return (
    <Screen title="Travel" subtitle="Flights and transfers booked for you by Emeritus Travel.">
      {upcoming.length ? upcoming.map((t) => <TripSection key={t.id} trip={t} />) : <EmptyState icon="plane" title="No trips booked" message="When you’re teaching in person, your itinerary will appear here." />}
    </Screen>
  );
}

const styles = makeStyles((t) => ({
  pass: { backgroundColor: t.colors.surface, borderRadius: t.radii.xl, overflow: 'hidden', borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  passTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14 },
  route: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  perforation: { flexDirection: 'row', alignItems: 'center', height: 18 },
  notch: { position: 'absolute', width: 18, height: 18, borderRadius: 9 },
  passBottom: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
}));
