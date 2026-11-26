import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Card, Checkbox, DateField, Icon, ListGroup, ListRow, Monogram, Screen, Section, SelectField, StatusPill, StepIndicator, SuccessState, Text, TextField, Timeline, Touchable, useToast } from '@/components';
import type { HotelBooking } from '@/data/models';
import { facultyName, getFaculty, getLearner, getProgramme, getStaff, learnerName, programmePhase } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { addDays, formatDate } from '@/utils/dates';
import { money, newId } from '@/utils/format';

import { Stars } from './HotelsScreen';
import { nights, monoName } from './components';

const STEPS = ['Select hotel', 'Requirements', 'Add guests', 'Rooming list', 'Confirm'];

type Candidate = { key: string; kind: 'learner' | 'faculty' | 'staff'; id: string; name: string; detail: string; hue: number; booked: boolean };

export default function HotelBookingWizard() {
  const params = useLocalSearchParams<{ hotel?: string; programme?: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();

  const eligible = db.programmes.filter((p) => !p.archived && !p.cancelled && p.deliveryMode !== 'Virtual' && programmePhase(p) !== 'completed');
  const [programmeId, setProgrammeId] = useState(params.programme && eligible.some((p) => p.id === params.programme) ? params.programme : eligible.find((p) => programmePhase(p) === 'upcoming')?.id ?? eligible[0]?.id);
  const prog = getProgramme(db, programmeId);
  const [hotelId, setHotelId] = useState<string | undefined>(params.hotel);
  const hotel = db.hotels.find((h) => h.id === hotelId);
  const [step, setStep] = useState(params.hotel ? 1 : 0);
  const [checkIn, setCheckIn] = useState(prog ? addDays(prog.startDate, -1) : '2027-04-11');
  const [checkOut, setCheckOut] = useState(prog?.endDate ?? '2027-04-16');
  const [roomType, setRoomType] = useState(hotel?.roomTypes[0]?.name ?? '');
  const [requests, setRequests] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [conf, setConf] = useState('');
  const [hotelConfirmed, setHotelConfirmed] = useState(true);
  const [created, setCreated] = useState<string[] | null>(null);

  const chooseProgramme = (id: string) => {
    const p = getProgramme(db, id);
    setProgrammeId(id);
    setSelected([]);
    if (p) {
      setCheckIn(addDays(p.startDate, -1));
      setCheckOut(p.endDate);
    }
  };
  const chooseHotel = (id: string) => {
    const h = db.hotels.find((x) => x.id === id);
    setHotelId(id);
    setRoomType(h?.roomTypes[0]?.name ?? '');
    setOverrides({});
  };

  const bookedIds = new Set(db.hotelBookings.filter((b) => b.programmeId === programmeId && b.status !== 'Cancelled' && b.checkOut > checkIn && b.checkIn < checkOut).map((b) => b.guest.id));
  const candidates: Candidate[] = prog
    ? [
        ...db.facultyAssignments
          .filter((a) => a.programmeId === prog.id && a.status !== 'Declined')
          .map((a) => {
            const f = getFaculty(db, a.facultyId);
            return { key: `faculty:${a.facultyId}`, kind: 'faculty' as const, id: a.facultyId, name: facultyName(f), detail: `${a.role} · ${f?.location ?? ''}`, hue: f?.avatarHue ?? 220, booked: bookedIds.has(a.facultyId) };
          }),
        ...db.enrollments
          .filter((e) => e.programmeId === prog.id && !['Withdrawn', 'Waitlisted', 'Completed'].includes(e.status))
          .map((e) => {
            const l = getLearner(db, e.learnerId);
            return { key: `learner:${e.learnerId}`, kind: 'learner' as const, id: e.learnerId, name: learnerName(l), detail: `${e.status} · ${l?.country ?? ''}`, hue: l?.avatarHue ?? 220, booked: bookedIds.has(e.learnerId) };
          }),
        ...[prog.coordinatorId].map((sid) => {
          const s = getStaff(db, sid);
          return { key: `staff:${sid}`, kind: 'staff' as const, id: sid, name: s?.name ?? sid, detail: 'On-site coordinator', hue: s?.avatarHue ?? 220, booked: bookedIds.has(sid) };
        }),
      ]
    : [];
  const available = candidates.filter((c) => !c.booked);
  const chosen = candidates.filter((c) => selected.includes(c.key));
  const n = nights({ checkIn, checkOut });
  const rateFor = (type: string) => hotel?.roomTypes.find((r) => r.name === type)?.rate ?? hotel?.contractedRate ?? 0;
  const typeFor = (c: Candidate) => overrides[c.key] ?? (c.kind === 'faculty' && hotel?.roomTypes.some((r) => /suite/i.test(r.name)) && candidates.findIndex((x) => x.kind === 'faculty') === candidates.indexOf(c) ? hotel.roomTypes.find((r) => /suite/i.test(r.name))!.name : roomType);
  const total = chosen.reduce((s, c) => s + rateFor(typeFor(c)) * n, 0);

  const canContinue = [!!hotel && !!prog, !!roomType && checkOut > checkIn, chosen.length > 0, true, !hotelConfirmed || conf.trim().length > 2][step];

  const cycleType = (c: Candidate) => {
    if (!hotel) return;
    const types = hotel.roomTypes.map((r) => r.name);
    const cur = typeFor(c);
    setOverrides((o) => ({ ...o, [c.key]: types[(types.indexOf(cur) + 1) % types.length] }));
  };

  const create = () => {
    if (!hotel || !prog) return;
    const ids: string[] = [];
    chosen.forEach((c, i) => {
      const id = newId('hb');
      ids.push(id);
      const type = typeFor(c);
      const booking: HotelBooking = {
        id,
        hotelId: hotel.id,
        programmeId: prog.id,
        guest: { kind: c.kind, id: c.id },
        roomType: type,
        checkIn,
        checkOut,
        confirmationNumber: hotelConfirmed ? `${conf.trim()}-${String(i + 1).padStart(2, '0')}` : undefined,
        status: hotelConfirmed ? 'Confirmed' : 'Provisional',
        cost: rateFor(type) * n,
        invoiceStatus: 'Not Invoiced',
        specialRequests: requests.trim() || undefined,
        cancellationDeadline: addDays(checkIn, -7),
      };
      actions.add('hotelBookings', booking, { append: true });
    });
    actions.log(prog.id, 'hotel_confirmed', `${hotelConfirmed ? 'confirmed' : 'requested'} ${chosen.length} room${chosen.length === 1 ? '' : 's'} at ${hotel.name}${hotelConfirmed ? ` (${conf.trim()})` : ''}`);
    setCreated(ids);
    toast.show({ message: hotelConfirmed ? 'Booking confirmed' : 'Booking requested', detail: `${chosen.length} rooms · ${hotel.name}`, icon: 'bed-double' });
  };

  if (created && hotel && prog) {
    return (
      <Screen title="Rooms booked" back="close" large={false}>
        <SuccessState title={hotelConfirmed ? 'Booking confirmed' : 'Booking requested'} message={`${created.length} room${created.length === 1 ? '' : 's'} at ${hotel.name} for ${prog.shortName}, ${formatDate(checkIn, { year: false })} – ${formatDate(checkOut, { year: false })}. The rooming list and readiness have been updated.`} />
        <Card padding="md">
          <Timeline
            dense
            steps={['Select hotel', 'Define requirements', 'Add guests', 'Generate rooming list', 'Confirm booking', 'Record confirmation number', 'Monitor changes', 'Receive invoice', 'Reconcile cost'].map((t, i) => ({
              key: t,
              title: t,
              detail: i === 5 && hotelConfirmed ? `${conf.trim()} (group)` : undefined,
              state: i < (hotelConfirmed ? 6 : 4) ? 'done' : i === (hotelConfirmed ? 6 : 4) ? 'current' : 'upcoming',
            }))}
          />
        </Card>
        <View style={{ gap: 10, marginTop: 16 }}>
          <Button title="View rooming list" icon="list" onPress={() => { router.dismiss(); setTimeout(() => router.push(`/rooming/${prog.id}`), 50); }} fullWidth />
          <Button title="Done" variant="secondary" onPress={() => router.back()} fullWidth />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      title="Book hotel rooms"
      back="close"
      headerBelow={<StepIndicator steps={STEPS} current={step} />}
      footer={
        <>
          {step > 0 ? <Button title="Back" variant="secondary" onPress={() => setStep(step - 1)} style={{ flex: 1 }} /> : null}
          <Button title={step === STEPS.length - 1 ? (hotelConfirmed ? 'Confirm booking' : 'Send request') : 'Continue'} iconRight={step === STEPS.length - 1 ? undefined : 'arrow-right'} disabled={!canContinue} onPress={() => (step === STEPS.length - 1 ? create() : setStep(step + 1))} style={{ flex: 2 }} />
        </>
      }>
      {step === 0 ? (
        <>
          <SelectField label="Programme" value={programmeId} options={eligible.map((p) => ({ value: p.id, label: p.name, detail: `${p.code} · ${p.location}` }))} onChange={chooseProgramme} icon="layers" />
          <Section title="Choose a hotel" subtitle={prog ? `Suggested hotels in ${prog.location.split(',').pop()?.trim().split(' ·')[0]} first` : undefined}>
            <View style={{ gap: 10 }}>
              {[...db.hotels]
                .sort((a, b) => Number(prog?.location.includes(b.city) ?? false) - Number(prog?.location.includes(a.city) ?? false))
                .map((h) => {
                  const sel = h.id === hotelId;
                  const suggested = prog?.location.includes(h.city);
                  return (
                    <Touchable key={h.id} onPress={() => chooseHotel(h.id)} feedback="scale" accessibilityState={{ selected: sel }} accessibilityLabel={h.name} style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: sel ? colors.accent : colors.border, backgroundColor: sel ? colors.accentSoft : colors.surface, alignItems: 'center' }}>
                      <Monogram name={monoName(h.name)} hue={h.hue} size={40} />
                      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                        <Text variant="headline" numberOfLines={1}>
                          {h.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Stars count={h.stars} size={11} />
                          <Text variant="footnote" tone="secondary" numberOfLines={1}>
                            {h.city} · {money(h.contractedRate)}/night
                          </Text>
                        </View>
                      </View>
                      {suggested ? <StatusPill label="Suggested" tone="accent" dot={false} /> : null}
                      {sel ? <Icon name="circle-check" size={22} tone="accent" /> : null}
                    </Touchable>
                  );
                })}
            </View>
          </Section>
        </>
      ) : null}

      {step === 1 && hotel ? (
        <View style={{ gap: 14 }}>
          <Card padding="sm" variant="alt" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Monogram name={monoName(hotel.name)} hue={hotel.hue} size={32} />
            <Text variant="headline" style={{ flex: 1 }} numberOfLines={1}>
              {hotel.name}
            </Text>
            <Button title="Change" variant="plain" size="sm" onPress={() => setStep(0)} />
          </Card>
          <DateField label="Check-in" value={checkIn} onChange={setCheckIn} helper={prog ? `Programme starts ${formatDate(prog.startDate, { weekday: true, year: false })}` : undefined} />
          <DateField label="Check-out" value={checkOut} onChange={setCheckOut} minDate={checkIn} helper={checkOut <= checkIn ? 'Check-out must be after check-in' : `${n} night${n === 1 ? '' : 's'}`} />
          <SelectField label="Default room type" value={roomType} options={hotel.roomTypes.map((r) => ({ value: r.name, label: r.name, detail: `${money(r.rate)}/night · ${r.available} in block` }))} onChange={setRoomType} icon="bed-double" />
          <TextField label="Special requests for all guests" value={requests} onChangeText={setRequests} placeholder="Optional — e.g. late check-out on final day" multiline />
          <Text variant="footnote" tone="tertiary">
            Free cancellation is assumed until 7 days before check-in ({formatDate(addDays(checkIn, -7), { year: false })}), per the Emeritus group contract.
          </Text>
        </View>
      ) : null}

      {step === 2 ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="headline">
              {chosen.length} of {available.length} selected
            </Text>
            <Button title={chosen.length === available.length ? 'Clear' : 'Select all'} variant="plain" size="sm" onPress={() => setSelected(chosen.length === available.length ? [] : available.map((c) => c.key))} />
          </View>
          {(['faculty', 'learner', 'staff'] as const).map((kind) => {
            const group = candidates.filter((c) => c.kind === kind);
            if (!group.length) return null;
            return (
              <Section key={kind} title={kind === 'faculty' ? 'Faculty' : kind === 'learner' ? 'Participants' : 'Programme team'}>
                <ListGroup>
                  {group.map((c) => {
                    const sel = selected.includes(c.key);
                    return (
                      <ListRow
                        key={c.key}
                        leading={<Avatar name={c.name} hue={c.hue} size={34} />}
                        title={c.name}
                        subtitle={c.booked ? 'Already has a room for these dates' : c.detail}
                        disabled={c.booked}
                        onPress={c.booked ? undefined : () => setSelected((s) => (sel ? s.filter((k) => k !== c.key) : [...s, c.key]))}
                        trailing={c.booked ? <StatusPill label="Booked" tone="success" /> : <Checkbox checked={sel} tone="accent" onChange={() => setSelected((s) => (sel ? s.filter((k) => k !== c.key) : [...s, c.key]))} accessibilityLabel={`Select ${c.name}`} />}
                      />
                    );
                  })}
                </ListGroup>
              </Section>
            );
          })}
        </>
      ) : null}

      {step === 3 && hotel ? (
        <>
          <Card padding="md" style={{ gap: 6 }}>
            <Text variant="overline" tone="accent">
              Rooming list preview
            </Text>
            <Text variant="title3">
              {chosen.length} rooms · {chosen.length * n} room nights
            </Text>
            <Text variant="subhead" tone="secondary">
              {hotel.name} · {formatDate(checkIn, { year: false })} – {formatDate(checkOut, { year: false })} · estimated {money(total)}
            </Text>
          </Card>
          <Text variant="footnote" tone="tertiary" style={{ marginTop: 12, marginBottom: 8 }}>
            Tap a room type to change it.
          </Text>
          <ListGroup>
            {chosen.map((c) => (
              <ListRow
                key={c.key}
                leading={<Avatar name={c.name} hue={c.hue} size={32} />}
                title={c.name}
                subtitle={`${n} nights · ${money(rateFor(typeFor(c)) * n)}`}
                trailing={
                  <Touchable onPress={() => cycleType(c)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.surfaceAlt, flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityLabel={`Room type ${typeFor(c)}, tap to change`}>
                    <Text variant="footnote" weight="medium" numberOfLines={1}>
                      {typeFor(c)}
                    </Text>
                    <Icon name="chevrons-up-down" size={12} tone="tertiary" />
                  </Touchable>
                }
              />
            ))}
          </ListGroup>
        </>
      ) : null}

      {step === 4 && hotel && prog ? (
        <View style={{ gap: 14 }}>
          <Card padding="md" style={{ paddingVertical: 4 }}>
            <SummaryRow label="Programme" value={prog.name} />
            <SummaryRow label="Hotel" value={hotel.name} />
            <SummaryRow label="Dates" value={`${formatDate(checkIn, { year: false })} – ${formatDate(checkOut, { year: false })} · ${n} nights`} />
            <SummaryRow label="Rooms" value={`${chosen.length}`} />
            <SummaryRow label="Estimated cost" value={money(total)} last />
          </Card>
          <ListGroup>
            <ListRow title="Hotel has confirmed the block" subtitle={hotelConfirmed ? 'Record the confirmation number below' : 'Send as a provisional request instead'} switchValue={hotelConfirmed} onSwitch={setHotelConfirmed} />
          </ListGroup>
          {hotelConfirmed ? <TextField label="Group confirmation number" value={conf} onChangeText={setConf} placeholder="e.g. CGH-48900" icon="hash" required helper="Individual room numbers are suffixed automatically (-01, -02…)" /> : null}
        </View>
      ) : null}
    </Screen>
  );
}

function SummaryRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 11, borderBottomWidth: last ? 0 : 0.5, borderBottomColor: colors.separator }}>
      <Text variant="callout" tone="secondary" style={{ width: 110 }}>
        {label}
      </Text>
      <Text variant="callout" weight="medium" style={{ flex: 1, textAlign: 'right' }} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}
