import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, EmptyState, KeyValue, ListGroup, ListRow, Monogram, Screen, Section, StatusPill, Tag, Text, useToast } from '@/components';
import { getProgramme } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { canSeeFinancials } from '@/navigation/access';
import { formatDate } from '@/utils/dates';
import { money } from '@/utils/format';

import { daysUntil, nights, PENDING_BOOKING, monoName } from './components';
import { Stars } from './HotelsScreen';

export default function HotelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const toast = useToast();
  const { role } = useSession();
  const hotel = db.hotels.find((h) => h.id === id);

  if (!hotel) {
    return (
      <Screen title="Hotel">
        <EmptyState icon="hotel" title="Hotel not found" actionLabel="All hotels" onAction={() => router.replace('/hotels')} />
      </Screen>
    );
  }

  const bookings = db.hotelBookings.filter((b) => b.hotelId === hotel.id);
  const active = bookings.filter((b) => b.status !== 'Cancelled');
  const byProgramme = [...new Set(active.map((b) => b.programmeId))].map((pid) => {
    const list = active.filter((b) => b.programmeId === pid);
    return {
      pid,
      list,
      confirmed: list.filter((b) => ['Confirmed', 'Checked In', 'Checked Out'].includes(b.status)).length,
      roomNights: list.reduce((s, b) => s + nights(b), 0),
      cost: list.reduce((s, b) => s + b.cost, 0),
      checkIn: list.map((b) => b.checkIn).sort()[0],
    };
  });
  const deadlines = [...new Set(active.filter((b) => !['Checked Out', 'Checked In'].includes(b.status)).map((b) => b.cancellationDeadline))]
    .sort()
    .map((d) => ({ date: d, list: active.filter((b) => b.cancellationDeadline === d && !['Checked Out', 'Checked In'].includes(b.status)) }));
  const invoiceStatuses = ['Not Invoiced', 'Invoice Received', 'Approved', 'Paid', 'Disputed'] as const;
  const showMoney = canSeeFinancials(role);

  return (
    <Screen title={hotel.name} eyebrow={`${hotel.city} · ${hotel.country}`} footer={<Button title="Book rooms" icon="bed-double" onPress={() => router.push(`/hotel-booking/new?hotel=${hotel.id}`)} style={{ flex: 1 }} />}>
      <Card padding="md" style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Monogram name={monoName(hotel.name)} hue={hotel.hue} size={52} />
          <View style={{ flex: 1, gap: 4 }}>
            <Stars count={hotel.stars} size={14} />
            <Text variant="subhead" tone="secondary">
              {hotel.address}
            </Text>
          </View>
          {hotel.preferred ? <StatusPill label="Preferred" tone="success" icon="badge-check" /> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Call" icon="phone" variant="tinted" size="sm" onPress={() => toast.show({ message: `Calling ${hotel.phone}… (simulated)`, icon: 'phone', tone: 'neutral' })} style={{ flex: 1 }} />
          <Button title="Email" icon="mail" variant="tinted" size="sm" onPress={() => toast.show({ message: `New email to ${hotel.email} (simulated)`, icon: 'mail', tone: 'neutral' })} style={{ flex: 1 }} />
          <Button title="Map" icon="map" variant="tinted" size="sm" onPress={() => toast.show({ message: 'Opening Maps… (simulated)', icon: 'map', tone: 'neutral' })} style={{ flex: 1 }} />
        </View>
      </Card>

      <Section title="Overview">
        <Card padding="md" style={{ paddingVertical: 4 }}>
          <KeyValue label="Contact" value={hotel.contactName} icon="contact" />
          <KeyValue label="Contracted rate" value={`${money(hotel.contractedRate)} / night`} icon="banknote" />
          <KeyValue label="Distance to venue" value={hotel.distanceToVenue} icon="navigation" />
          <KeyValue label="Guest rating" value={`${hotel.rating.toFixed(1)} / 5`} icon="star" last />
        </Card>
      </Section>

      <Section title="Room types">
        <ListGroup>
          {hotel.roomTypes.map((r) => (
            <ListRow key={r.name} icon="bed-double" iconTone="violet" title={r.name} subtitle={`${r.available} rooms available in block`} value={`${money(r.rate)}/night`} />
          ))}
        </ListGroup>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {hotel.amenities.map((a) => (
            <Tag key={a} label={a} icon="circle-check" />
          ))}
        </View>
      </Section>

      <Section title="Bookings by programme" subtitle={active.length ? `${active.length} rooms across ${byProgramme.length} programme${byProgramme.length === 1 ? '' : 's'}` : undefined}>
        {byProgramme.length ? (
          <ListGroup>
            {byProgramme.map((g) => (
              <ListRow
                key={g.pid}
                icon="layers"
                title={getProgramme(db, g.pid)?.name ?? g.pid}
                subtitle={`${g.confirmed}/${g.list.length} confirmed · ${g.roomNights} room nights · from ${formatDate(g.checkIn, { year: false })}`}
                value={showMoney ? money(g.cost) : undefined}
                onPress={() => router.push(`/rooming/${g.pid}`)}
              />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="bed-double" title="No bookings yet" message="Book rooms for a programme to start a rooming list." compact />
        )}
      </Section>

      {deadlines.length ? (
        <Section title="Cancellation deadlines" subtitle="Rooms can be released without penalty until these dates">
          <ListGroup>
            {deadlines.map((d) => {
              const days = daysUntil(d.date);
              const pending = d.list.filter((b) => PENDING_BOOKING.includes(b.status)).length;
              return (
                <ListRow
                  key={d.date}
                  icon="calendar-x"
                  iconTone={days < 0 ? 'neutral' : days <= 7 ? 'danger' : days <= 14 ? 'warning' : 'neutral'}
                  title={formatDate(d.date, { weekday: true })}
                  subtitle={`${d.list.length} room${d.list.length === 1 ? '' : 's'}${pending ? ` · ${pending} not yet guaranteed` : ''}`}
                  value={days < 0 ? 'Passed' : days === 0 ? 'Today' : `In ${days} days`}
                />
              );
            })}
          </ListGroup>
        </Section>
      ) : null}

      <Section title="Invoices">
        <Card padding="md" style={{ paddingVertical: 4 }}>
          {invoiceStatuses.map((s, i) => {
            const n = active.filter((b) => b.invoiceStatus === s).length;
            return <KeyValue key={s} label={s} value={`${n} booking${n === 1 ? '' : 's'}`} valueTone={s === 'Disputed' && n ? 'danger' : s === 'Paid' && n ? 'success' : 'primary'} last={i === invoiceStatuses.length - 1} />;
          })}
        </Card>
      </Section>
    </Screen>
  );
}
