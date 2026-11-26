import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Banner, Button, Card, Checkbox, Chip, EmptyState, Icon, KeyValue, ListGroup, ListRow, Monogram, ProgressBar, Screen, Section, StatusPill, Text, useDialog, useToast } from '@/components';
import type { SeatingLayout } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { canSeeFinancials } from '@/navigation/access';
import { useTheme } from '@/theme';
import { durationDays, formatRange } from '@/utils/dates';
import { money } from '@/utils/format';

import { SeatingDiagram, monoName } from './components';

export default function VenueBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { role } = useSession();
  const { colors } = useTheme();
  const vb = db.venueBookings.find((b) => b.id === id);
  const venue = vb ? db.venues.find((v) => v.id === vb.venueId) : undefined;
  const room = venue?.rooms.find((r) => r.id === vb?.roomId);

  if (!vb || !venue || !room) {
    return (
      <Screen title="Venue booking">
        <EmptyState icon="building-2" title="Booking not found" actionLabel="All venues" onAction={() => router.replace('/venues')} />
      </Screen>
    );
  }

  const prog = getProgramme(db, vb.programmeId);
  const layouts = Object.keys(room.capacity) as SeatingLayout[];
  const capacity = room.capacity[vb.layout] ?? 0;
  const over = vb.attendees > capacity;
  const avDone = vb.av.filter((a) => a.confirmed).length;
  const catDone = vb.catering.filter((c) => c.confirmed).length;
  const totalItems = vb.av.length + vb.catering.length;
  const pct = totalItems ? ((avDone + catDone) / totalItems) * 100 : 100;
  const confirmed = vb.status === 'Confirmed';

  const setLayout = (layout: SeatingLayout) => {
    actions.update('venueBookings', vb.id, { layout });
    toast.show({ message: `Layout changed to ${layout}`, detail: `${room.name} seats ${room.capacity[layout]} in this set-up`, icon: 'armchair' });
  };

  const toggleAv = (i: number) => {
    actions.update('venueBookings', vb.id, (b) => ({ ...b, av: b.av.map((a, j) => (j === i ? { ...a, confirmed: !a.confirmed } : a)) }));
  };
  const toggleCatering = (i: number) => {
    actions.update('venueBookings', vb.id, (b) => ({ ...b, catering: b.catering.map((c, j) => (j === i ? { ...c, confirmed: !c.confirmed } : c)) }));
  };

  const confirmVenue = async () => {
    const { confirmed: ok } = await dialog.confirm({ title: 'Confirm venue booking?', message: `${room.name} at ${venue.name} for ${formatRange(vb.dates.from, vb.dates.to)}. The venue will be notified and the hold converted to a booking.`, confirmLabel: 'Confirm venue', icon: 'building-2', tone: 'success' });
    if (ok) {
      actions.update('venueBookings', vb.id, { status: 'Confirmed' });
      actions.log(vb.programmeId, 'status_changed', `confirmed ${room.name} at ${venue.name}`);
      toast.show({ message: 'Venue confirmed', detail: `${venue.name} · ${room.name}`, icon: 'circle-check' });
    }
  };

  return (
    <Screen
      title={room.name}
      eyebrow={`Venue booking · ${prog?.shortName ?? ''}`}
      footer={
        <>
          <Button title="Message venue" variant="secondary" icon="message-square" onPress={() => toast.show({ message: `Message sent to ${venue.contactName.split(' · ')[0]}`, detail: 'Logged against the programme (simulated)', icon: 'send' })} style={{ flex: 1 }} />
          {!confirmed ? <Button title="Confirm venue" icon="circle-check" onPress={confirmVenue} style={{ flex: 1 }} /> : null}
        </>
      }>
      <Card padding="md" style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Monogram name={monoName(venue.name)} hue={venue.hue} size={44} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="headline" numberOfLines={1}>
              {venue.name}
            </Text>
            <Text variant="footnote" tone="secondary" numberOfLines={1}>
              {formatRange(vb.dates.from, vb.dates.to)} · {durationDays(vb.dates.from, vb.dates.to)} days
            </Text>
          </View>
          <StatusPill label={vb.status} size="md" />
        </View>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="footnote" tone="secondary">
              Set-up confirmed
            </Text>
            <Text variant="footnote" weight="semibold" tabular>
              {avDone + catDone}/{totalItems}
            </Text>
          </View>
          <ProgressBar value={pct} color={pct === 100 ? colors.success : colors.accent} />
        </View>
      </Card>

      {vb.notes ? <Banner tone={confirmed ? 'info' : 'warning'} title={confirmed ? 'Note' : 'Action needed'} message={vb.notes} style={{ marginTop: 12 }} /> : null}

      <Section title="Booking">
        <Card padding="md" style={{ paddingVertical: 4 }}>
          <KeyValue label="Programme" value={prog?.name ?? '—'} icon="layers" onPress={() => router.push(`/programme/${vb.programmeId}`)} />
          <KeyValue label="Venue" value={venue.name} icon="building-2" onPress={() => router.push(`/venue/${venue.id}`)} />
          <KeyValue label="Room" value={`${room.name} · ${room.floor}`} icon="door-open" />
          <KeyValue label="Attendees" value={`${vb.attendees} (capacity ${capacity})`} icon="users" valueTone={over ? 'danger' : 'primary'} />
          <KeyValue label="Cost" value={canSeeFinancials(role) ? (vb.cost ? money(vb.cost) : 'No hire fee') : 'Restricted'} icon="banknote" last />
        </Card>
      </Section>

      <Section title="Room set-up" subtitle="Seating layout for the main sessions">
        <Card padding="md" style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {layouts.map((l) => (
              <Chip key={l} label={`${l} · ${room.capacity[l]}`} selected={l === vb.layout} onPress={() => setLayout(l)} />
            ))}
          </View>
          <View style={{ borderRadius: 12, backgroundColor: colors.surfaceAlt, padding: 8 }}>
            <SeatingDiagram layout={vb.layout} height={150} />
          </View>
          {over ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="triangle-alert" size={16} tone="danger" />
              <Text variant="subhead" tone="danger" style={{ flex: 1 }}>
                {vb.attendees} attendees exceeds {vb.layout.toLowerCase()} capacity of {capacity}. Choose another layout.
              </Text>
            </View>
          ) : (
            <Text variant="footnote" tone="tertiary">
              {capacity - vb.attendees} spare seats in {vb.layout.toLowerCase()} set-up.
            </Text>
          )}
        </Card>
      </Section>

      <Section title="Audio / visual" subtitle={`${avDone} of ${vb.av.length} confirmed`}>
        {vb.av.length ? (
          <ListGroup>
            {vb.av.map((a, i) => (
              <View key={a.item} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
                <Checkbox checked={a.confirmed} onChange={() => toggleAv(i)} accessibilityLabel={`Confirm ${a.item}`} />
                <Text variant="body" style={{ flex: 1 }} numberOfLines={2}>
                  {a.item}
                </Text>
                <Text variant="footnote" tone="secondary" tabular>
                  ×{a.qty}
                </Text>
              </View>
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="projector" title="No AV requested" compact />
        )}
      </Section>

      <Section title="Catering & refreshments" subtitle={vb.catering.length ? `${catDone} of ${vb.catering.length} confirmed · daily schedule` : undefined}>
        {vb.catering.length ? (
          <ListGroup>
            {vb.catering.map((c, i) => (
              <View key={c.time + c.item} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
                <View style={{ width: 46 }}>
                  <Text variant="headline" tabular>
                    {c.time}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong">{c.item}</Text>
                  <Text variant="footnote" tone="secondary">
                    {c.covers} covers
                  </Text>
                  {c.dietaryNotes ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="salad" size={12} tone="success" />
                      <Text variant="footnote" tone="success">
                        {c.dietaryNotes}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Checkbox checked={c.confirmed} onChange={() => toggleCatering(i)} accessibilityLabel={`Confirm ${c.item}`} />
              </View>
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="utensils-crossed" title="No catering yet" message="Add refreshments and meals once timings are agreed." compact />
        )}
      </Section>

      <Section title="Related">
        <ListGroup>
          <ListRow icon="list-checks" iconTone="success" title="Logistics checklist" subtitle="Venue, AV, catering, printing and transport items" onPress={() => router.push(`/logistics/checklist/${vb.programmeId}`)} />
          <ListRow icon="clipboard-list" iconTone="danger" title="On-site run sheet" subtitle="Day-of timeline and incident log" onPress={() => router.push(`/onsite/${vb.programmeId}`)} />
        </ListGroup>
      </Section>
    </Screen>
  );
}
