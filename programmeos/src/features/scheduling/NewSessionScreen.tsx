import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Banner, Button, DateField, FormSection, Screen, SegmentedField, SelectField, StatusPill, Text, TextField, TimeField, useToast } from '@/components';
import type { DeliveryMode, Session, TimeZoneId } from '@/data/models';
import { facultyAvailability, facultyName, getFaculty, getProgramme, getVenue, programmePhase } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { addDays, convertZone, DEMO_TODAY, diffDays, formatDate, minutesOf, TIMEZONES } from '@/utils/dates';

const KINDS: Session['kind'][] = ['Lecture', 'Workshop', 'Case Study', 'Panel', 'Coaching', 'Simulation', 'Site Visit', 'Networking', 'Assessment'];

/** Schedule a session with live faculty availability and time-zone conversion. */
export default function NewSessionScreen() {
  const params = useLocalSearchParams<{ programme?: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { userId } = useSession();

  const active = db.programmes.filter((p) => !p.archived && !p.cancelled && programmePhase(p) !== 'completed');
  const initial = getProgramme(db, params.programme) ?? getProgramme(db, 'p-elp') ?? active[0];
  const [programmeId, setProgrammeId] = useState(initial.id);
  const prog = getProgramme(db, programmeId)!;
  const modules = db.modules.filter((m) => m.programmeId === programmeId);
  const [moduleId, setModuleId] = useState(modules[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<Session['kind']>('Workshop');
  const assigned = db.facultyAssignments.filter((a) => a.programmeId === programmeId && a.status !== 'Declined').map((a) => a.facultyId);
  const [facultyId, setFacultyId] = useState(assigned[0] ?? db.faculty[0].id);
  const [date, setDate] = useState(prog.startDate > DEMO_TODAY ? prog.startDate : addDays(DEMO_TODAY, 7));
  const [start, setStart] = useState('14:00');
  const [end, setEnd] = useState('15:30');
  const [tz, setTz] = useState<TimeZoneId>(prog.timeZone);
  const [mode, setMode] = useState<DeliveryMode>(prog.deliveryMode);
  const [venueId, setVenueId] = useState(prog.venueId ?? db.venues[0].id);
  const venue = getVenue(db, venueId);
  const [roomId, setRoomId] = useState(venue?.rooms[0]?.id ?? '');
  const [link] = useState(() => `https://emeritus.zoom.example/j/84${String(Date.now()).slice(-8)}`);
  const [recurrence, setRecurrence] = useState<'None' | 'Daily' | 'Weekly'>('None');
  const [capacity, setCapacity] = useState(String(prog.capacity));

  const changeProgramme = (id: string) => {
    const p = getProgramme(db, id)!;
    setProgrammeId(id);
    setModuleId(db.modules.find((m) => m.programmeId === id)?.id ?? '');
    setTz(p.timeZone);
    setMode(p.deliveryMode);
    if (p.venueId) {
      setVenueId(p.venueId);
      setRoomId(getVenue(db, p.venueId)?.rooms[0]?.id ?? '');
    }
    setCapacity(String(p.capacity));
    if (p.startDate > DEMO_TODAY) setDate(p.startDate);
    const fac = db.facultyAssignments.find((a) => a.programmeId === id && a.status !== 'Declined')?.facultyId;
    if (fac) setFacultyId(fac);
  };

  const validTime = minutesOf(end) > minutesOf(start);
  const avail = validTime ? facultyAvailability(db, facultyId, date, start, end, tz) : undefined;
  const fac = getFaculty(db, facultyId);
  const facLocal = fac && fac.timeZone !== tz ? convertZone(date, start, tz, fac.timeZone) : null;
  const viewerLocal = tz !== 'Asia/Dubai' ? convertZone(date, start, tz, 'Asia/Dubai') : null;

  const repeats = recurrence === 'None' ? 1 : Math.min(recurrence === 'Weekly' ? 6 : 5, Math.max(1, Math.floor(Math.max(0, diffDays(prog.endDate, date)) / (recurrence === 'Weekly' ? 7 : 1)) + 1));
  const valid = title.trim().length > 2 && validTime && !!moduleId;

  const create = () => {
    if (!valid) return;
    const room = venue?.rooms.find((r) => r.id === roomId);
    let firstId = '';
    for (let i = 0; i < repeats; i++) {
      const d = addDays(date, i * (recurrence === 'Weekly' ? 7 : 1));
      const sid = actions.createSession({
        programmeId,
        moduleId,
        title: title.trim(),
        kind,
        facultyIds: [facultyId],
        date: d,
        endDate: d,
        start,
        end,
        timeZone: tz,
        deliveryMode: mode,
        venueId: mode !== 'Virtual' ? venueId : undefined,
        roomName: mode !== 'Virtual' ? room?.name : undefined,
        location: mode !== 'Virtual' ? venue?.name : undefined,
        meetingLink: mode !== 'In-person' ? link : undefined,
        meetingId: mode !== 'In-person' ? link.slice(-10).replace(/(\d{3})(\d{4})(\d+)/, '$1 $2 $3') : undefined,
        capacity: Number(capacity) || prog.capacity,
        materialIds: [],
        attendance: 'Not Started',
        agenda: [],
        objectives: [],
        recurrence,
        status: avail?.free ? 'Scheduled' : 'Tentative',
      });
      if (!firstId) firstId = sid;
    }
    if (!assigned.includes(facultyId)) {
      actions.assignFaculty({ facultyId, programmeId, sessionIds: [firstId], role: 'Faculty', status: 'Proposed', days: 1, fee: fac?.dailyFee ?? 0, requestedOn: DEMO_TODAY });
    }
    actions.log(programmeId, 'session_scheduled', `scheduled ${repeats > 1 ? `${repeats} × ` : ''}“${title.trim()}”`, userId);
    toast.show({ message: repeats > 1 ? `${repeats} sessions scheduled` : 'Session scheduled', detail: `${formatDate(date, { weekday: true })} · ${start} ${TIMEZONES[tz].abbr}${avail?.free ? '' : ' · tentative (conflict)'}` });
    router.replace(`/session/${firstId}`);
  };

  return (
    <Screen title="New session" back="close" footer={<Button title={repeats > 1 ? `Schedule ${repeats} sessions` : 'Schedule session'} icon="calendar-plus" onPress={create} disabled={!valid} style={{ flex: 1 }} />}>
      <FormSection title="What">
        <SelectField label="Programme" value={programmeId} onChange={changeProgramme} icon="layers" options={active.map((p) => ({ value: p.id, label: p.name, detail: `${p.code} · ${p.deliveryMode}` }))} />
        <SelectField label="Module" value={moduleId || undefined} onChange={setModuleId} icon="book-open" placeholder={modules.length ? 'Select module' : 'No modules yet'} options={modules.map((m) => ({ value: m.id, label: `${m.order}. ${m.title}`, detail: m.summary }))} />
        <TextField label="Session title" value={title} onChangeText={setTitle} placeholder="e.g. Leading Through Ambiguity" required />
        <SelectField label="Session type" value={kind} onChange={setKind} options={KINDS.map((k) => ({ value: k, label: k }))} />
      </FormSection>

      <FormSection title="Who">
        <SelectField
          label="Instructor"
          value={facultyId}
          onChange={setFacultyId}
          options={db.faculty
            .map((f) => ({ f, av: validTime ? facultyAvailability(db, f.id, date, start, end, tz) : undefined }))
            .sort((a, b) => Number(assigned.includes(b.f.id)) - Number(assigned.includes(a.f.id)) || Number(!!b.av?.free) - Number(!!a.av?.free))
            .map(({ f, av }) => ({
              value: f.id,
              label: facultyName(f),
              detail: `${assigned.includes(f.id) ? 'On this programme · ' : ''}${f.expertise.slice(0, 2).join(', ')}`,
              leading: <Avatar name={f.name} hue={f.avatarHue} size={30} />,
              badge: av ? <StatusPill label={av.free ? 'Free' : 'Busy'} tone={av.free ? 'success' : 'danger'} /> : undefined,
            }))}
        />
        {avail ? (
          avail.free ? (
            <Banner tone="success" title={`${facultyName(fac)} is available`} message={facLocal ? `That’s ${facLocal.time} ${TIMEZONES[fac!.timeZone].abbr} for them in ${fac!.location.split(',')[0]}.` : 'No clashes with other sessions or blocked dates.'} />
          ) : (
            <Banner
              tone="danger"
              icon="calendar-x"
              title={avail.blocked.length ? `${facultyName(fac)} is unavailable` : `Conflict with ${avail.clashes.length} session${avail.clashes.length > 1 ? 's' : ''}`}
              message={avail.blocked.length ? `${avail.blocked[0].reason} (${formatDate(avail.blocked[0].from, { year: false })}–${formatDate(avail.blocked[0].to, { year: false })}).` : `Already teaching “${avail.clashes[0].title}” at ${avail.clashes[0].start} ${TIMEZONES[avail.clashes[0].timeZone].abbr}. The session will be saved as tentative.`}
            />
          )
        ) : null}
      </FormSection>

      <FormSection title="When">
        <DateField label="Date" value={date} onChange={setDate} minDate={DEMO_TODAY} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TimeField label="Starts" value={start} onChange={setStart} zoneLabel={TIMEZONES[tz].abbr} style={{ flex: 1 }} />
          <TimeField label="Ends" value={end} onChange={setEnd} zoneLabel={TIMEZONES[tz].abbr} style={{ flex: 1 }} />
        </View>
        {!validTime ? (
          <Text variant="footnote" tone="danger">
            End time must be after the start time.
          </Text>
        ) : viewerLocal ? (
          <Text variant="footnote" tone="secondary">
            {start} {TIMEZONES[tz].abbr} is {viewerLocal.time} GST in Dubai.
          </Text>
        ) : null}
        <SelectField label="Time zone" value={tz} onChange={setTz} icon="globe" options={(Object.keys(TIMEZONES) as TimeZoneId[]).map((z) => ({ value: z, label: `${TIMEZONES[z].city} · ${TIMEZONES[z].abbr}`, detail: TIMEZONES[z].label }))} />
        <SegmentedField
          label="Repeat"
          value={recurrence}
          onChange={setRecurrence}
          options={[
            { value: 'None', label: 'Does not repeat' },
            { value: 'Daily', label: 'Daily' },
            { value: 'Weekly', label: 'Weekly' },
          ]}
        />
        {recurrence !== 'None' ? (
          <Text variant="footnote" tone="secondary">
            Creates {repeats} sessions {recurrence === 'Weekly' ? 'every week' : 'on consecutive days'} within the programme dates.
          </Text>
        ) : null}
      </FormSection>

      <FormSection title="Where">
        <SegmentedField<DeliveryMode>
          label="Delivery mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'In-person', label: 'In-person' },
            { value: 'Virtual', label: 'Virtual' },
            { value: 'Hybrid', label: 'Hybrid' },
          ]}
        />
        {mode !== 'Virtual' ? (
          <>
            <SelectField
              label="Venue"
              value={venueId}
              icon="building-2"
              onChange={(v) => {
                setVenueId(v);
                setRoomId(getVenue(db, v)?.rooms[0]?.id ?? '');
              }}
              options={db.venues.map((v) => ({ value: v.id, label: v.name, detail: `${v.city} · ${v.kind}` }))}
            />
            <SelectField label="Room" value={roomId} icon="door-open" onChange={setRoomId} options={(venue?.rooms ?? []).map((r) => ({ value: r.id, label: r.name, detail: `${Object.entries(r.capacity).map(([k, n]) => `${k} ${n}`).join(' · ')}` }))} />
          </>
        ) : null}
        {mode !== 'In-person' ? <TextField label="Meeting link" value={link} onChangeText={() => {}} icon="video" helper="Generated automatically — Zoom integration is simulated in this prototype." /> : null}
        <TextField label="Capacity" value={capacity} onChangeText={(v) => setCapacity(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" suffix="seats" />
      </FormSection>
    </Screen>
  );
}
