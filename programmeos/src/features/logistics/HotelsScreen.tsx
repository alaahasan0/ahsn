import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Card, Chip, ChipRow, HeaderActions, Icon, IconButton, Monogram, NoResults, Screen, SearchField, StatusPill, Text } from '@/components';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { money, searchMatch } from '@/utils/format';

import { LoadGate } from '../shared/Widgets';
import { PENDING_BOOKING, monoName } from './components';

export function Stars({ count, size = 12 }: { count: number; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 1 }} accessibilityLabel={`${count} star hotel`}>
      {Array.from({ length: count }).map((_, i) => (
        <Icon key={i} name="star" size={size} color={colors.warning} fill={colors.warning} />
      ))}
    </View>
  );
}

export default function HotelsScreen() {
  const db = useDB();
  const [q, setQ] = useState('');
  const [city, setCity] = useState<string | undefined>();
  const cities = [...new Set(db.hotels.map((h) => h.city))];
  const list = db.hotels.filter((h) => (!city || h.city === city) && searchMatch(q, h.name, h.city, h.country));

  return (
    <Screen
      title="Hotels"
      subtitle="Partner hotels, contracted rates and live bookings"
      refreshable
      headerRight={
        <HeaderActions>
          <IconButton icon="plus" accessibilityLabel="New hotel booking" onPress={() => router.push('/hotel-booking/new')} />
        </HeaderActions>
      }
      headerBelow={
        <>
          <SearchField value={q} onChangeText={setQ} placeholder="Search hotels or cities" />
          <ChipRow>
            <Chip label="All cities" selected={!city} onPress={() => setCity(undefined)} />
            {cities.map((c) => (
              <Chip key={c} label={c} selected={city === c} onPress={() => setCity(city === c ? undefined : c)} />
            ))}
          </ChipRow>
        </>
      }>
      <LoadGate loadKey="hotels">
        {list.length ? (
          <View style={{ gap: 10 }}>
            {list.map((h) => {
              const bookings = db.hotelBookings.filter((b) => b.hotelId === h.id && b.status !== 'Cancelled' && b.status !== 'Checked Out');
              const pending = bookings.filter((b) => PENDING_BOOKING.includes(b.status)).length;
              return (
                <Card key={h.id} onPress={() => router.push(`/hotel/${h.id}`)} accessibilityLabel={`${h.name}, ${h.city}`}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Monogram name={monoName(h.name)} hue={h.hue} size={46} />
                    <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
                          {h.name}
                        </Text>
                        {h.preferred ? <StatusPill label="Preferred" tone="success" icon="badge-check" /> : null}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Stars count={h.stars} />
                        <Text variant="footnote" tone="secondary" numberOfLines={1}>
                          {h.city}, {h.country}
                        </Text>
                      </View>
                      <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                        From {money(h.contractedRate)}/night · {h.distanceToVenue}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 14, marginTop: 12 }}>
                    <Meta icon="bed-double" text={`${bookings.length} active booking${bookings.length === 1 ? '' : 's'}`} />
                    {pending ? <Meta icon="hourglass" text={`${pending} pending`} tone="warning" /> : null}
                    <Meta icon="star" text={`${h.rating.toFixed(1)} rating`} />
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <NoResults query={q} onClear={() => { setQ(''); setCity(undefined); }} />
        )}
      </LoadGate>
    </Screen>
  );
}

function Meta({ icon, text, tone }: { icon: 'bed-double' | 'hourglass' | 'star'; text: string; tone?: 'warning' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={13} tone={tone ?? 'tertiary'} />
      <Text variant="footnote" tone={tone ?? 'secondary'}>
        {text}
      </Text>
    </View>
  );
}
