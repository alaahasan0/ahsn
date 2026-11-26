import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Checkbox, Chip, ChipRow, EmptyState, HeaderActions, Icon, IconButton, ListGroup, Monogram, NoFilterResults, Screen, SearchField, SelectField, Sheet, StatusPill, Text, TextField, Touchable, useToast } from '@/components';
import type { HotelBooking } from '@/data/models';
import { getHotel, getProgramme, personName } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { canSeeFinancials } from '@/navigation/access';
import { useTheme } from '@/theme';
import { money, searchMatch } from '@/utils/format';

import { KindBadge, nights, PENDING_BOOKING, PersonCell, stayLabel, monoName } from './components';

type Filter = 'all' | 'confirmed' | 'pending' | 'checked' | 'requests';

export default function RoomingScreen() {
  const { programmeId } = useLocalSearchParams<{ programmeId: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { role } = useSession();
  const { colors } = useTheme();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [edit, setEdit] = useState<HotelBooking | null>(null);
  const [draft, setDraft] = useState({ roomType: '', roomNumber: '' });
  const prog = getProgramme(db, programmeId);

  const all = db.hotelBookings.filter((b) => b.programmeId === programmeId && b.status !== 'Cancelled');
  const hotelIds = [...new Set(all.map((b) => b.hotelId))];
  const [hotelId, setHotelId] = useState<string | undefined>(undefined);
  const activeHotelId = hotelId ?? hotelIds.find((h) => all.some((b) => b.hotelId === h && b.status !== 'Checked Out')) ?? hotelIds[0];
  const hotel = getHotel(db, activeHotelId);
  const atHotel = all.filter((b) => b.hotelId === activeHotelId);

  const list = atHotel
    .filter((b) => {
      if (filter === 'confirmed') return b.status === 'Confirmed' || b.status === 'Amended';
      if (filter === 'pending') return PENDING_BOOKING.includes(b.status) && b.status !== 'Amended';
      if (filter === 'checked') return b.status === 'Checked In' || b.status === 'Checked Out';
      if (filter === 'requests') return !!b.specialRequests;
      return true;
    })
    .filter((b) => searchMatch(q, personName(db, b.guest.id), b.roomType, b.roomNumber))
    .sort((a, b) => (a.guest.kind === b.guest.kind ? personName(db, a.guest.id).localeCompare(personName(db, b.guest.id)) : a.guest.kind === 'faculty' ? -1 : 1));

  const roomNights = atHotel.reduce((s, b) => s + nights(b), 0);
  const cost = atHotel.reduce((s, b) => s + b.cost, 0);
  const mix = [...new Set(atHotel.map((b) => b.roomType))].map((t) => `${t} ×${atHotel.filter((b) => b.roomType === t).length}`);
  const confirmed = atHotel.filter((b) => ['Confirmed', 'Checked In', 'Checked Out', 'Amended'].includes(b.status)).length;

  if (!prog) {
    return (
      <Screen title="Rooming list">
        <EmptyState icon="bed-double" title="Programme not found" />
      </Screen>
    );
  }

  const toggleCheckIn = (b: HotelBooking, v: boolean) => {
    actions.setBookingStatus(b.id, v ? 'Checked In' : 'Confirmed');
    toast.show({ message: v ? 'Checked in' : 'Check-in undone', detail: `${personName(db, b.guest.id)} · Room ${b.roomNumber ?? 'TBC'}`, icon: 'key-round' });
  };

  const openEdit = (b: HotelBooking) => {
    setDraft({ roomType: b.roomType, roomNumber: b.roomNumber ?? '' });
    setEdit(b);
  };

  const saveEdit = () => {
    if (!edit || !hotel) return;
    const rate = hotel.roomTypes.find((r) => r.name === draft.roomType)?.rate ?? hotel.contractedRate;
    actions.update('hotelBookings', edit.id, { roomType: draft.roomType, roomNumber: draft.roomNumber || undefined, cost: rate * nights(edit), status: edit.status === 'Confirmed' && draft.roomType !== edit.roomType ? 'Amended' : edit.status });
    toast.show({ message: 'Room allocation updated', detail: `${personName(db, edit.guest.id)} · ${draft.roomType}${draft.roomNumber ? ` · ${draft.roomNumber}` : ''}` });
    setEdit(null);
  };

  return (
    <Screen
      title="Rooming list"
      eyebrow={`${prog.code} · ${prog.shortName}`}
      subtitle={prog.name}
      refreshable
      headerRight={
        <HeaderActions>
          <IconButton icon="share-2" accessibilityLabel="Share with hotel" onPress={() => toast.show({ message: `Rooming list sent to ${hotel?.name ?? 'hotel'}`, detail: `${hotel?.contactName ?? ''} · version ${atHotel.length > 20 ? 4 : 2} (simulated)`, icon: 'send' })} />
          <IconButton icon="download" accessibilityLabel="Export" onPress={() => toast.show({ message: 'Exported rooming list', detail: `${prog.shortName}_Rooming_List.xlsx (simulated)`, icon: 'file-spreadsheet' })} />
          <IconButton icon="user-plus" accessibilityLabel="Add guests" onPress={() => router.push(`/hotel-booking/new?programme=${prog.id}${activeHotelId ? `&hotel=${activeHotelId}` : ''}`)} />
        </HeaderActions>
      }>
      {!all.length ? (
        <EmptyState icon="bed-double" title="No rooms booked yet" message={prog.deliveryMode === 'Virtual' ? 'This is a virtual programme — no accommodation is required.' : 'Start a hotel booking to generate the rooming list.'} actionLabel={prog.deliveryMode === 'Virtual' ? undefined : 'Book rooms'} onAction={() => router.push(`/hotel-booking/new?programme=${prog.id}`)} />
      ) : (
        <>
          {hotelIds.length > 1 ? (
            <ChipRow style={{ paddingBottom: 12 }}>
              {hotelIds.map((h) => (
                <Chip key={h} label={getHotel(db, h)?.name ?? h} selected={h === activeHotelId} onPress={() => setHotelId(h)} />
              ))}
            </ChipRow>
          ) : null}

          <Card padding="md" style={{ gap: 12 }}>
            <Touchable onPress={() => hotel && router.push(`/hotel/${hotel.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} accessibilityLabel={hotel?.name}>
              <Monogram name={monoName(hotel?.name ?? '')} hue={hotel?.hue} size={40} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="headline" numberOfLines={1}>
                  {hotel?.name}
                </Text>
                <Text variant="footnote" tone="secondary" numberOfLines={1}>
                  {hotel?.contactName}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} tone="tertiary" />
            </Touchable>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Summary label="Rooms" value={`${atHotel.length}`} />
              <Summary label="Confirmed" value={`${confirmed}/${atHotel.length}`} tone={confirmed === atHotel.length ? 'success' : 'warning'} />
              <Summary label="Room nights" value={`${roomNights}`} />
              {canSeeFinancials(role) ? <Summary label="Cost" value={money(cost)} /> : null}
            </View>
            <Text variant="footnote" tone="tertiary" numberOfLines={2}>
              {mix.join(' · ')}
            </Text>
          </Card>

          <SearchField value={q} onChangeText={setQ} placeholder="Search guests or rooms" style={{ marginTop: 14 }} />
          <ChipRow style={{ paddingVertical: 12 }}>
            {(
              [
                ['all', 'All', atHotel.length],
                ['confirmed', 'Confirmed', atHotel.filter((b) => b.status === 'Confirmed' || b.status === 'Amended').length],
                ['pending', 'Pending', atHotel.filter((b) => PENDING_BOOKING.includes(b.status) && b.status !== 'Amended').length],
                ['checked', 'Checked in/out', atHotel.filter((b) => b.status === 'Checked In' || b.status === 'Checked Out').length],
                ['requests', 'Special requests', atHotel.filter((b) => b.specialRequests).length],
              ] as [Filter, string, number][]
            ).map(([k, label, count]) => (
              <Chip key={k} label={label} count={count} selected={filter === k} onPress={() => setFilter(k)} />
            ))}
          </ChipRow>

          {list.length ? (
            <ListGroup>
              {list.map((b) => {
                const canCheck = ['Confirmed', 'Amended', 'Checked In'].includes(b.status);
                return (
                  <Touchable key={b.id} onPress={() => openEdit(b)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }} accessibilityLabel={`${personName(db, b.guest.id)}, ${b.roomType}, ${b.status}`} hitSlop={0}>
                    <PersonCell db={db} person={b.guest} size={36} />
                    <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                          {personName(db, b.guest.id)}
                        </Text>
                        {b.guest.kind !== 'learner' ? <KindBadge kind={b.guest.kind} /> : null}
                        {b.specialRequests ? <Icon name="message-square" size={13} tone="warning" /> : null}
                      </View>
                      <Text variant="footnote" tone="secondary" numberOfLines={1}>
                        {b.roomType}
                        {b.roomNumber ? ` · Room ${b.roomNumber}` : ' · Room TBC'}
                      </Text>
                      <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                        {stayLabel(b)}
                      </Text>
                    </View>
                    {canCheck ? (
                      <View style={{ alignItems: 'center', gap: 2 }}>
                        <Checkbox checked={b.status === 'Checked In'} onChange={(v) => toggleCheckIn(b, v)} tone="accent" accessibilityLabel={`Check in ${personName(db, b.guest.id)}`} />
                        <Text variant="caption" tone="tertiary">
                          {b.status === 'Checked In' ? 'In' : 'Check in'}
                        </Text>
                      </View>
                    ) : (
                      <StatusPill label={b.status} />
                    )}
                  </Touchable>
                );
              })}
            </ListGroup>
          ) : (
            <NoFilterResults onReset={() => { setFilter('all'); setQ(''); }} />
          )}
        </>
      )}

      <Sheet
        visible={!!edit}
        onClose={() => setEdit(null)}
        title="Room allocation"
        subtitle={edit ? personName(db, edit.guest.id) : undefined}
        footer={
          <>
            <Button title="View booking" variant="secondary" onPress={() => { const id = edit?.id; setEdit(null); if (id) setTimeout(() => router.push(`/booking/${id}`), 240); }} style={{ flex: 1 }} />
            <Button title="Save" onPress={saveEdit} style={{ flex: 1 }} />
          </>
        }>
        {edit && hotel ? (
          <View style={{ gap: 14 }}>
            <SelectField label="Room type" value={draft.roomType} options={hotel.roomTypes.map((r) => ({ value: r.name, label: r.name, detail: `${money(r.rate)}/night · ${r.available} available` }))} onChange={(v) => setDraft((d) => ({ ...d, roomType: v }))} icon="bed-double" />
            <TextField label="Room number" value={draft.roomNumber} onChangeText={(v) => setDraft((d) => ({ ...d, roomNumber: v }))} placeholder="Assigned by hotel at check-in" keyboardType="number-pad" icon="door-open" />
            {edit.specialRequests ? (
              <Card variant="alt" padding="sm" style={{ flexDirection: 'row', gap: 8 }}>
                <Icon name="message-square" size={15} tone="warning" />
                <Text variant="subhead" tone="secondary" style={{ flex: 1 }}>
                  {edit.specialRequests}
                </Text>
              </Card>
            ) : null}
            <Text variant="footnote" tone="tertiary">
              {stayLabel(edit)} · {edit.confirmationNumber ? `Confirmation ${edit.confirmationNumber}` : 'Not yet confirmed'}
            </Text>
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  return (
    <View style={{ flex: 1, gap: 1, minWidth: 0 }}>
      <Text variant="metricSm" tone={tone ?? 'primary'} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
