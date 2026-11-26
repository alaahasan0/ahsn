import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ActionSheet, Button, Card, EmptyState, HeaderActions, Icon, IconButton, KeyValue, ListGroup, ListRow, Screen, Section, StatusPill, Text, useDialog, useToast } from '@/components';
import type { TravelItinerary } from '@/data/models';
import { getHotel, getProgramme, personName } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { formatDate } from '@/utils/dates';
import { money } from '@/utils/format';

import { FlightCard, guestKindLabel, PersonCell, profileRoute, READY_TRAVEL, stayLabel } from './components';

const NEXT: Partial<Record<TravelItinerary['status'], { label: string; to: TravelItinerary['status'] }>> = {
  Missing: { label: 'Send flight options', to: 'Options Sent' },
  Requested: { label: 'Send flight options', to: 'Options Sent' },
  'Options Sent': { label: 'Mark as ticketed', to: 'Ticketed' },
  Booked: { label: 'Mark as ticketed', to: 'Ticketed' },
  Changed: { label: 'Mark as ticketed', to: 'Ticketed' },
};

export default function ItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const [menu, setMenu] = useState(false);
  const t = db.itineraries.find((x) => x.id === id);

  if (!t) {
    return (
      <Screen title="Itinerary">
        <EmptyState icon="plane" title="Itinerary not found" message="It may have been removed or belongs to another programme." actionLabel="Open travel" onAction={() => router.replace('/travel')} />
      </Screen>
    );
  }

  const name = personName(db, t.traveller.id);
  const prog = getProgramme(db, t.programmeId);
  const booking = db.hotelBookings.find((b) => b.programmeId === t.programmeId && b.guest.id === t.traveller.id && b.status !== 'Cancelled');
  const hotel = booking ? getHotel(db, booking.hotelId) : undefined;
  const next = NEXT[t.status];
  const ready = READY_TRAVEL.includes(t.status);

  const setStatus = (to: TravelItinerary['status'], message: string) => {
    const prev = t.status;
    actions.setItineraryStatus(t.id, to);
    actions.log(t.programmeId, 'booking_changed', `updated ${name}’s itinerary to ${to}`);
    toast.show({ message, detail: `${name} · ${prog?.shortName}`, icon: to === 'Ticketed' ? 'ticket-check' : 'send', actionLabel: 'Undo', onAction: () => actions.setItineraryStatus(t.id, prev) });
  };

  const requestChange = async () => {
    const { confirmed, text } = await dialog.confirm({ title: 'Request a change?', message: 'SkyTrail will be asked to re-quote. The current ticket stays valid until a new one is issued.', confirmLabel: 'Request change', icon: 'repeat', input: { placeholder: 'What needs to change? (e.g. return a day later)' } });
    if (confirmed) {
      actions.setItineraryStatus(t.id, 'Changed');
      toast.show({ message: 'Change requested', detail: text ?? 'SkyTrail Travel Management notified', icon: 'repeat' });
    }
  };

  return (
    <Screen
      title={name}
      eyebrow={`Itinerary · ${prog?.shortName ?? ''}`}
      headerRight={
        <HeaderActions>
          <IconButton icon="ellipsis" accessibilityLabel="More actions" onPress={() => setMenu(true)} />
        </HeaderActions>
      }
      footer={
        next ? (
          <Button title={next.label} icon={next.to === 'Ticketed' ? 'ticket-check' : 'send'} onPress={() => setStatus(next.to, next.to === 'Ticketed' ? 'Marked as ticketed' : 'Flight options sent')} style={{ flex: 1 }} />
        ) : ready ? (
          <>
            <Button title="Share itinerary" variant="secondary" icon="share-2" onPress={() => toast.show({ message: 'Itinerary shared', detail: `Sent to ${name} by email (simulated)`, icon: 'send' })} style={{ flex: 1 }} />
            <Button title="Request change" icon="repeat" variant="tinted" onPress={requestChange} style={{ flex: 1 }} />
          </>
        ) : undefined
      }>
      <Card padding="md" style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <PersonCell db={db} person={t.traveller} size={44} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="headline" numberOfLines={1}>
              {name}
            </Text>
            <Text variant="footnote" tone="secondary" numberOfLines={1}>
              {guestKindLabel(t.traveller.kind)} · {prog?.name}
            </Text>
          </View>
          <StatusPill label={t.status} size="md" />
        </View>
        {t.notes ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Icon name="info" size={15} tone="tertiary" />
            <Text variant="subhead" tone="secondary" style={{ flex: 1 }}>
              {t.notes}
            </Text>
          </View>
        ) : null}
      </Card>

      <Section title="Flights">
        {t.segments.length ? (
          <View style={{ gap: 10 }}>
            {t.segments.map((s) => (
              <FlightCard key={s.id} segment={s} travellerName={name} />
            ))}
          </View>
        ) : (
          <Card padding="lg" style={{ alignItems: 'center', gap: 8 }}>
            <Icon name="plane-takeoff" size={26} tone="tertiary" />
            <Text variant="headline">No flights booked yet</Text>
            <Text variant="subhead" tone="secondary" align="center">
              {t.status === 'Options Sent' ? 'Options have been sent — waiting for the traveller to choose.' : t.transfers.length ? 'This traveller only needs ground transfers.' : 'Send options from SkyTrail to get this traveller booked.'}
            </Text>
          </Card>
        )}
      </Section>

      {t.transfers.length ? (
        <Section title="Transfers">
          <ListGroup>
            {t.transfers.map((tr) => (
              <ListRow key={tr.id} icon="car" iconTone="info" title={`${tr.from} → ${tr.to}`} subtitle={`${formatDate(tr.date, { weekday: true, year: false })} at ${tr.time} · ${tr.provider}`} trailing={<StatusPill label={tr.status} tone={tr.status === 'Booked' ? 'success' : 'warning'} />} />
            ))}
          </ListGroup>
        </Section>
      ) : null}

      <Section title="Details">
        <Card padding="md" style={{ paddingVertical: 4 }}>
          <KeyValue label="Programme" value={prog?.name ?? '—'} icon="layers" onPress={() => router.push(`/programme/${t.programmeId}`)} />
          <KeyValue label="Visa" value={t.visaRequired ? (t.visaStatus ?? 'In Progress') : 'Not required'} icon="id-card" valueTone={t.visaRequired && t.visaStatus !== 'Issued' ? 'warning' : 'primary'} />
          <KeyValue label="Ticket cost" value={t.cost ? money(t.cost) : '—'} icon="receipt" />
          <KeyValue label="Booked via" value="SkyTrail Travel Management" icon="briefcase" last />
        </Card>
      </Section>

      <Section title="Related">
        <ListGroup>
          <ListRow icon={t.traveller.kind === 'faculty' ? 'users' : 'graduation-cap'} title={`${guestKindLabel(t.traveller.kind)} profile`} subtitle={name} onPress={() => router.push(profileRoute(t.traveller) as never)} />
          {booking ? (
            <ListRow icon="bed-double" iconTone="violet" title={hotel?.name ?? 'Hotel booking'} subtitle={`${booking.roomType} · ${stayLabel(booking)}`} trailing={<StatusPill label={booking.status} />} onPress={() => router.push(`/booking/${booking.id}`)} />
          ) : (
            <ListRow icon="bed-double" iconTone="neutral" title="No hotel booking" subtitle="Add this traveller to a rooming list" onPress={() => router.push(`/hotel-booking/new?programme=${t.programmeId}`)} />
          )}
          <ListRow icon="file-text" iconTone="neutral" title="Duty of Care & Travel Policy" subtitle="Cabin classes, booking windows, traveller tracking" onPress={() => router.push('/document/d-travel-policy')} />
        </ListGroup>
      </Section>

      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title="Itinerary actions"
        actions={[
          { label: 'Mark as ticketed', icon: 'ticket-check', onPress: () => setStatus('Ticketed', 'Marked as ticketed'), disabled: t.status === 'Ticketed' },
          { label: 'Send new flight options', icon: 'send', onPress: () => setStatus('Options Sent', 'Flight options sent') },
          { label: 'Request change', icon: 'repeat', onPress: requestChange, disabled: !ready },
          { label: 'Message traveller', icon: 'message-circle', onPress: () => toast.show({ message: 'Opening WhatsApp… (simulated)', icon: 'message-circle', tone: 'neutral' }) },
          { label: 'Mark as missing', icon: 'circle-alert', destructive: true, onPress: () => setStatus('Missing', 'Itinerary marked missing') },
        ]}
      />
    </Screen>
  );
}
