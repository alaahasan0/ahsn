import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Card, Chip, ChipRow, Icon, Monogram, NoResults, Screen, SearchField, StatusPill, Text } from '@/components';
import type { Venue } from '@/data/models';
import { useDB } from '@/data/store';
import { money, searchMatch } from '@/utils/format';

import { LoadGate } from '../shared/Widgets';
import { monoName } from './components';

export function maxCapacity(v: Venue) {
  return Math.max(...v.rooms.flatMap((r) => Object.values(r.capacity).filter((n): n is number => typeof n === 'number')));
}

export default function VenuesScreen() {
  const db = useDB();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<Venue['kind'] | undefined>();
  const kinds = [...new Set(db.venues.map((v) => v.kind))];
  const list = db.venues.filter((v) => (!kind || v.kind === kind) && searchMatch(q, v.name, v.city, v.kind));

  return (
    <Screen
      title="Venues"
      subtitle="Rooms, capacity, set-up and bookings"
      refreshable
      headerBelow={
        <>
          <SearchField value={q} onChangeText={setQ} placeholder="Search venues or cities" />
          <ChipRow>
            <Chip label="All" selected={!kind} onPress={() => setKind(undefined)} />
            {kinds.map((k) => (
              <Chip key={k} label={k} selected={kind === k} onPress={() => setKind(kind === k ? undefined : k)} />
            ))}
          </ChipRow>
        </>
      }>
      <LoadGate loadKey="venues">
        {list.length ? (
          <View style={{ gap: 10 }}>
            {list.map((v) => {
              const bookings = db.venueBookings.filter((b) => b.venueId === v.id && b.status !== 'Cancelled');
              const holds = bookings.filter((b) => b.status !== 'Confirmed').length;
              return (
                <Card key={v.id} onPress={() => router.push(`/venue/${v.id}`)} accessibilityLabel={`${v.name}, ${v.city}`}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Monogram name={monoName(v.name)} hue={v.hue} size={46} />
                    <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                      <Text variant="headline" numberOfLines={1}>
                        {v.name}
                      </Text>
                      <Text variant="footnote" tone="secondary" numberOfLines={1}>
                        {v.kind} · {v.city}, {v.country}
                      </Text>
                      <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                        {v.dayRate ? `${money(v.dayRate)}/day` : 'Emeritus-owned · no hire fee'}
                      </Text>
                    </View>
                    {holds ? <StatusPill label={`${holds} on hold`} tone="warning" /> : null}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
                    <Meta icon="door-open" text={`${v.rooms.length} room${v.rooms.length === 1 ? '' : 's'}`} />
                    <Meta icon="users" text={`Up to ${maxCapacity(v)}`} />
                    <Meta icon="calendar-check" text={`${bookings.length} booking${bookings.length === 1 ? '' : 's'}`} />
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <NoResults query={q} onClear={() => { setQ(''); setKind(undefined); }} />
        )}
      </LoadGate>
    </Screen>
  );
}

function Meta({ icon, text }: { icon: 'door-open' | 'users' | 'calendar-check'; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={13} tone="tertiary" />
      <Text variant="footnote" tone="secondary">
        {text}
      </Text>
    </View>
  );
}
