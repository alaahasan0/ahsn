import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Banner, Card, HeaderActions, Icon, IconButton, ListGroup, ListRow, ProgressBar, Screen, Section, SkeletonCard, StatusPill, Text, Touchable, toneColors } from '@/components';
import { getHotel, getProgramme, getVenue, personName, programmePhase } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { countdown, DEMO_TODAY, formatDate } from '@/utils/dates';

import { LoadGate, RequireAccess } from '../shared/Widgets';
import { daysUntil, MiniStat, PENDING_BOOKING, READY_TRAVEL } from './components';

/** Logistics hub: one place for travel, accommodation, venues and on-site operations. */
export default function LogisticsHubScreen() {
  return (
    <Screen
      title="Logistics"
      subtitle="Travel, accommodation, venues and on-site operations"
      refreshable
      headerRight={
        <HeaderActions>
          <IconButton icon="bed-double" accessibilityLabel="Book hotel rooms" onPress={() => router.push('/hotel-booking/new')} />
        </HeaderActions>
      }>
      <RequireAccess module="logistics">
        <LoadGate
          loadKey="logistics-hub"
          skeleton={
            <View style={{ gap: 10 }}>
              <SkeletonCard lines={2} />
              <SkeletonCard lines={4} />
              <SkeletonCard lines={3} />
            </View>
          }>
          <HubContent />
        </LoadGate>
      </RequireAccess>
    </Screen>
  );
}

function HubContent() {
  const db = useDB();
  const { colors } = useTheme();
  const live = db.programmes.filter((p) => !p.archived && !p.cancelled && programmePhase(p) !== 'completed');
  const liveIds = new Set(live.map((p) => p.id));
  const bookings = db.hotelBookings.filter((b) => liveIds.has(b.programmeId) && b.status !== 'Cancelled' && b.status !== 'Checked Out');
  const confirmed = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Checked In').length;
  const itins = db.itineraries.filter((t) => liveIds.has(t.programmeId));
  const outstanding = itins.filter((t) => !READY_TRAVEL.includes(t.status)).length;
  const holds = db.venueBookings.filter((v) => liveIds.has(v.programmeId) && (v.status === 'Provisional' || v.status === 'Enquiry'));
  const deadlines = bookings.filter((b) => PENDING_BOOKING.includes(b.status) && daysUntil(b.cancellationDeadline) <= 14);
  const fareAlert = db.smartAlerts.find((a) => a.kind === 'itinerary_missing' && !a.dismissed);

  const inPerson = live.filter((p) => p.deliveryMode !== 'Virtual').sort((a, b) => a.startDate.localeCompare(b.startDate));
  const nextWithRunSheet = db.runSheet[0]?.programmeId ?? 'p-elp';

  const upcomingDeadlines = [
    ...deadlines.map((b) => ({ id: b.id, date: b.cancellationDeadline, title: `${getHotel(db, b.hotelId)?.name} — release`, detail: `${personName(db, b.guest.id)} · ${b.status}`, route: `/booking/${b.id}`, icon: 'bed-double' as const })),
    ...holds.map((v) => ({ id: v.id, date: v.dates.from, title: `${getVenue(db, v.venueId)?.name} — ${v.status.toLowerCase()}`, detail: `${getProgramme(db, v.programmeId)?.shortName} · ${v.attendees} attendees`, route: `/venue-booking/${v.id}`, icon: 'building-2' as const })),
    ...db.logisticsItems.filter((i) => !i.done && liveIds.has(i.programmeId) && daysUntil(i.due) <= 7).map((i) => ({ id: i.id, date: i.due, title: i.label, detail: `${getProgramme(db, i.programmeId)?.shortName} · ${i.area}`, route: `/logistics/checklist/${i.programmeId}`, icon: 'list-checks' as const })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <>
      {fareAlert ? <Banner tone="danger" title={fareAlert.title} message={fareAlert.detail} action={fareAlert.actionLabel} onAction={() => router.push(fareAlert.route as Href)} /> : null}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: fareAlert ? 12 : 0 }}>
        <MiniStat label="Rooms confirmed" value={`${confirmed}/${bookings.length}`} tone="success" onPress={() => router.push('/hotels')} />
        <MiniStat label="Flights to book" value={String(outstanding)} tone={outstanding ? 'danger' : 'success'} onPress={() => router.push('/travel')} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <MiniStat label="Venue holds" value={String(holds.length)} tone={holds.length ? 'warning' : 'success'} onPress={() => router.push('/venues')} />
        <MiniStat label="Deadlines ≤ 14 days" value={String(deadlines.length)} tone={deadlines.length ? 'warning' : 'success'} />
      </View>

      <Section title="Manage">
        <ListGroup>
          <ListRow icon="plane" iconTone="info" title="Travel & transfers" subtitle={`${itins.length} itineraries · ${outstanding} need action`} onPress={() => router.push('/travel')} />
          <ListRow icon="hotel" iconTone="accent" title="Hotels" subtitle={`${db.hotels.length} partner hotels · ${bookings.length} active bookings`} onPress={() => router.push('/hotels')} />
          <ListRow icon="bed-double" iconTone="violet" title="Rooming lists" subtitle="Executive Leadership Programme · 26 rooms" onPress={() => router.push('/rooming/p-elp')} />
          <ListRow icon="building-2" iconTone="warning" title="Venues & room set-up" subtitle={`${db.venues.length} venues · ${holds.length} on hold`} onPress={() => router.push('/venues')} />
          <ListRow icon="list-checks" iconTone="success" title="Logistics checklists" subtitle="Catering, transport, printing, AV and more" onPress={() => router.push('/logistics/checklist/p-elp')} />
          <ListRow icon="clipboard-list" iconTone="danger" title="On-site run sheet" subtitle={`${getProgramme(db, nextWithRunSheet)?.shortName} · Day 1 timeline and incident log`} onPress={() => router.push(`/onsite/${nextWithRunSheet}`)} />
        </ListGroup>
      </Section>

      <Section title="By programme" subtitle="In-person and hybrid programmes, soonest first">
        <View style={{ gap: 10 }}>
          {inPerson.map((p) => {
            const pb = db.hotelBookings.filter((b) => b.programmeId === p.id && b.status !== 'Cancelled' && (programmePhase(p) !== 'in_delivery' || b.checkIn >= DEMO_TODAY));
            const pbOk = pb.filter((b) => ['Confirmed', 'Checked In', 'Checked Out'].includes(b.status)).length;
            const pt = db.itineraries.filter((t) => t.programmeId === p.id);
            const ptOk = pt.filter((t) => READY_TRAVEL.includes(t.status)).length;
            const pl = db.logisticsItems.filter((i) => i.programmeId === p.id);
            const plOk = pl.filter((i) => i.done).length;
            const total = pb.length + pt.length + pl.length;
            const pct = total ? ((pbOk + ptOk + plOk) / total) * 100 : 100;
            const tone = pct >= 90 ? 'success' : pct >= 60 ? 'accent' : pct >= 40 ? 'warning' : 'danger';
            return (
              <Card key={p.id} padding="md" style={{ gap: 10 }}>
                <Touchable onPress={() => router.push(`/programme/${p.id}`)} accessibilityLabel={`${p.name} logistics`} style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="caption" tone="tertiary" numberOfLines={1}>
                        {p.code} · {p.location}
                      </Text>
                      <Text variant="headline" numberOfLines={1}>
                        {p.name}
                      </Text>
                    </View>
                    <StatusPill label={p.status.logistics} />
                  </View>
                  <ProgressBar value={pct} color={toneColors(tone, colors).solid} />
                  <Text variant="footnote" tone="secondary">
                    {programmePhase(p) === 'upcoming' ? countdown(p.startDate) : 'In delivery'} · {Math.round(pct)}% of logistics confirmed
                  </Text>
                </Touchable>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <LinkChip icon="bed-double" label={pb.length ? `${pbOk}/${pb.length}` : '—'} a11y={`Rooms ${pbOk} of ${pb.length} confirmed`} onPress={() => router.push(`/rooming/${p.id}`)} />
                  <LinkChip icon="plane" label={pt.length ? `${ptOk}/${pt.length}` : '—'} a11y={`Travel ${ptOk} of ${pt.length} booked`} onPress={() => router.push(`/travel?programme=${p.id}`)} />
                  <LinkChip icon="list-checks" label={pl.length ? `${plOk}/${pl.length}` : 'Add'} a11y={`Checklist ${plOk} of ${pl.length} done`} onPress={() => router.push(`/logistics/checklist/${p.id}`)} />
                </View>
              </Card>
            );
          })}
        </View>
      </Section>

      <Section title="Coming up" subtitle="Holds, releases and checklist items due within two weeks">
        {upcomingDeadlines.length ? (
          <ListGroup>
            {upcomingDeadlines.map((d) => {
              const days = daysUntil(d.date);
              return (
                <ListRow
                  key={d.id}
                  icon={d.icon}
                  iconTone={days < 0 ? 'danger' : days <= 4 ? 'warning' : 'neutral'}
                  title={d.title}
                  subtitle={d.detail}
                  value={days < 0 ? `${-days}d overdue` : days === 0 ? 'Today' : formatDate(d.date, { year: false })}
                  onPress={() => router.push(d.route as Href)}
                />
              );
            })}
          </ListGroup>
        ) : (
          <Card>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Icon name="circle-check-big" size={20} tone="success" />
              <Text tone="secondary">Nothing due in the next two weeks.</Text>
            </View>
          </Card>
        )}
      </Section>
    </>
  );
}

function LinkChip({ icon, label, onPress, a11y }: { icon: 'bed-double' | 'plane' | 'list-checks'; label: string; onPress: () => void; a11y: string }) {
  const { colors } = useTheme();
  return (
    <Touchable onPress={onPress} feedback="opacity" accessibilityLabel={a11y} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 36, borderRadius: 10, backgroundColor: colors.surfaceAlt, paddingHorizontal: 6 }}>
      <Icon name={icon} size={14} tone="secondary" />
      <Text variant="footnote" weight="semibold" tabular numberOfLines={1}>
        {label}
      </Text>
    </Touchable>
  );
}
