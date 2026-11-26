import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Chip, EmptyState, Icon, KeyValue, ListGroup, ListRow, Monogram, Screen, Section, StatusPill, Tag, Text, useToast } from '@/components';
import type { SeatingLayout, VenueRoom } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { formatRange } from '@/utils/dates';
import { money } from '@/utils/format';

import { SeatingDiagram, monoName } from './components';

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const toast = useToast();
  const venue = db.venues.find((v) => v.id === id);

  if (!venue) {
    return (
      <Screen title="Venue">
        <EmptyState icon="building-2" title="Venue not found" actionLabel="All venues" onAction={() => router.replace('/venues')} />
      </Screen>
    );
  }

  const bookings = db.venueBookings.filter((b) => b.venueId === venue.id).sort((a, b) => a.dates.from.localeCompare(b.dates.from));

  return (
    <Screen title={venue.name} eyebrow={`${venue.kind} · ${venue.city}`}>
      <Card padding="md" style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Monogram name={monoName(venue.name)} hue={venue.hue} size={50} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="subhead" tone="secondary">
              {venue.address}
            </Text>
            <Text variant="footnote" tone="tertiary">
              {venue.contactName}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Call" icon="phone" variant="tinted" size="sm" onPress={() => toast.show({ message: `Calling ${venue.phone}… (simulated)`, icon: 'phone', tone: 'neutral' })} style={{ flex: 1 }} />
          <Button title="Email" icon="mail" variant="tinted" size="sm" onPress={() => toast.show({ message: `New email to ${venue.email} (simulated)`, icon: 'mail', tone: 'neutral' })} style={{ flex: 1 }} />
          <Button title="Site visit" icon="calendar-plus" variant="tinted" size="sm" onPress={() => toast.show({ message: 'Site visit requested', detail: `${venue.contactName.split(' · ')[0]} will propose times`, icon: 'calendar-plus' })} style={{ flex: 1 }} />
        </View>
      </Card>

      <Section title="Overview">
        <Card padding="md" style={{ paddingVertical: 4 }}>
          <KeyValue label="Day rate" value={venue.dayRate ? money(venue.dayRate) : 'Emeritus-owned'} icon="banknote" />
          <KeyValue label="Rooms" value={String(venue.rooms.length)} icon="door-open" />
          <KeyValue label="Rating" value={`${venue.rating.toFixed(1)} / 5`} icon="star" last />
        </Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {venue.amenities.map((a) => (
            <Tag key={a} label={a} icon="circle-check" />
          ))}
        </View>
      </Section>

      <Section title="Rooms & seating" subtitle="Tap a layout to preview the set-up">
        <View style={{ gap: 12 }}>
          {venue.rooms.map((r) => (
            <RoomCard key={r.id} room={r} />
          ))}
        </View>
      </Section>

      <Section title="Bookings">
        {bookings.length ? (
          <ListGroup>
            {bookings.map((b) => (
              <ListRow
                key={b.id}
                icon="calendar-check"
                iconTone={b.status === 'Confirmed' ? 'success' : 'warning'}
                title={getProgramme(db, b.programmeId)?.name ?? b.programmeId}
                subtitle={`${venue.rooms.find((r) => r.id === b.roomId)?.name} · ${formatRange(b.dates.from, b.dates.to)} · ${b.layout}`}
                trailing={<StatusPill label={b.status} />}
                onPress={() => router.push(`/venue-booking/${b.id}`)}
              />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="calendar" title="No bookings" message="This venue isn’t booked for any programme yet." compact />
        )}
      </Section>
    </Screen>
  );
}

function RoomCard({ room }: { room: VenueRoom }) {
  const layouts = Object.keys(room.capacity) as SeatingLayout[];
  const [layout, setLayout] = useState<SeatingLayout>(layouts[0]);
  const { colors } = useTheme();
  return (
    <Card padding="md" style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headline">{room.name}</Text>
          <Text variant="footnote" tone="secondary">
            {room.floor} · {room.sizeSqm} m²
          </Text>
        </View>
        {room.naturalLight ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="sun" size={14} tone="warning" />
            <Text variant="caption" tone="secondary">
              Daylight
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {layouts.map((l) => (
          <Chip key={l} label={`${l} · ${room.capacity[l]}`} selected={l === layout} onPress={() => setLayout(l)} />
        ))}
      </View>
      <View style={{ borderRadius: 12, backgroundColor: colors.surfaceAlt, padding: 8 }}>
        <SeatingDiagram layout={layout} height={140} />
        <Text variant="caption" tone="tertiary" align="center">
          {layout} · seats {room.capacity[layout]}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {room.av.map((a) => (
          <Tag key={a} label={a} icon="projector" />
        ))}
      </View>
    </Card>
  );
}
