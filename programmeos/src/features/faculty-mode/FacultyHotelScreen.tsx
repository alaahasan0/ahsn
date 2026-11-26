import { View } from 'react-native';

import { Button, Card, EmptyState, Icon, KeyValue, Monogram, Screen, Section, StatusPill, Tag, Text, useToast } from '@/components';
import { getHotel, getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { diffDays, formatDate } from '@/utils/dates';

import { useFacultyScope } from './data';

export default function FacultyHotelScreen() {
  const db = useDB();
  const toast = useToast();
  const { colors } = useTheme();
  const scope = useFacultyScope();
  const stays = [...scope.bookings].filter((b) => b.status !== 'Checked Out').sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  return (
    <Screen title="Hotel" subtitle="Your accommodation, arranged and paid by Emeritus.">
      {stays.length ? (
        stays.map((b) => {
          const h = getHotel(db, b.hotelId)!;
          const p = getProgramme(db, b.programmeId);
          const nights = diffDays(b.checkOut, b.checkIn);
          return (
            <Section key={b.id} title={p?.name ?? 'Stay'}>
              <Card padding="lg" style={{ gap: 14 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Monogram name={h.name} hue={h.hue} size={48} />
                  <View style={{ flex: 1 }}>
                    <Text variant="title3">{h.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                      {Array.from({ length: h.stars }).map((_, i) => (
                        <Icon key={i} name="star" size={12} color={colors.warning} fill={colors.warning} />
                      ))}
                    </View>
                  </View>
                  <StatusPill label={b.status} size="md" />
                </View>
                <View style={{ flexDirection: 'row', borderRadius: 14, backgroundColor: colors.surfaceAlt, padding: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" tone="tertiary">
                      Check-in
                    </Text>
                    <Text variant="headline">{formatDate(b.checkIn, { weekday: true, year: false })}</Text>
                    <Text variant="footnote" tone="secondary">
                      from 15:00
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
                    <Text variant="caption" tone="tertiary">
                      {nights} night{nights === 1 ? '' : 's'}
                    </Text>
                    <Icon name="arrow-right" size={16} tone="tertiary" />
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text variant="caption" tone="tertiary">
                      Check-out
                    </Text>
                    <Text variant="headline">{formatDate(b.checkOut, { weekday: true, year: false })}</Text>
                    <Text variant="footnote" tone="secondary">
                      by 12:00
                    </Text>
                  </View>
                </View>
                <View>
                  <KeyValue icon="bed-double" label="Room" value={`${b.roomType}${b.roomNumber ? ` · ${b.roomNumber}` : ''}`} />
                  <KeyValue icon="ticket-check" label="Confirmation" value={b.confirmationNumber ?? 'Pending'} />
                  <KeyValue icon="map-pin" label="Address" value={h.address} />
                  <KeyValue icon="building-2" label="To venue" value={h.distanceToVenue} />
                  <KeyValue icon="phone" label="Hotel" value={h.phone} last={!b.specialRequests} />
                  {b.specialRequests ? <KeyValue icon="sparkles" label="Your request" value={b.specialRequests} last multiline /> : null}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {h.amenities.map((a) => (
                    <Tag key={a} label={a} />
                  ))}
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button title="Directions" icon="navigation" variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => toast.show({ message: 'Opening maps…', icon: 'map', tone: 'neutral' })} />
                  <Button title="Request change" icon="square-pen" variant="tinted" size="sm" style={{ flex: 1 }} onPress={() => toast.show({ message: 'Request sent to Logistics', detail: 'Sofia Marques will confirm with the hotel.', icon: 'send' })} />
                </View>
              </Card>
            </Section>
          );
        })
      ) : (
        <EmptyState icon="bed-double" title="No hotel stays" message="Accommodation for in-person teaching will appear here." />
      )}
    </Screen>
  );
}
