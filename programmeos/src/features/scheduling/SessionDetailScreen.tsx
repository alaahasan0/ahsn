import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  ActionSheet,
  Avatar,
  Banner,
  Button,
  Card,
  EmptyState,
  FileIcon,
  Icon,
  IconButton,
  IconTile,
  KeyValue,
  ListGroup,
  ListRow,
  ProgressBar,
  Screen,
  Section,
  SelectSheet,
  Sheet,
  StatusPill,
  Text,
  TimePickerSheet,
  useDialog,
  useToast,
} from '@/components';
import type { Session } from '@/data/models';
import { byId, conflictsForSession, facultyAvailability, facultyName, getFaculty, getProgramme, getStaff, getVenue } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { convertZone, durationMinutesLabel, formatDateLong, formatRange, minutesOf, timeFromMinutes, TIMEZONES, tzOffsetLabel } from '@/utils/dates';

import { DELIVERY_ICON, SESSION_KIND_ICON } from '../shared/helpers';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const s = useStyles(styles);
  const { colors } = useTheme();
  const { userId, mode } = useSession();
  const session = byId(db.sessions, id);
  const [sheet, setSheet] = useState<null | 'menu' | 'resolve' | 'move' | 'cover'>(null);

  if (!session) {
    return (
      <Screen title="Session" large={false}>
        <EmptyState icon="calendar-x" title="Session not found" message="It may have been cancelled or removed." actionLabel="Open calendar" onAction={() => router.replace('/calendar')} />
      </Screen>
    );
  }

  const viewerTz = (mode === 'staff' ? getStaff(db, userId)?.timeZone : undefined) ?? 'Asia/Dubai';
  const prog = getProgramme(db, session.programmeId);
  const mod = byId(db.modules, session.moduleId);
  const venue = getVenue(db, session.venueId);
  const conflicts = conflictsForSession(db, session.id);
  const conflict = conflicts[0];
  const other = conflict ? (conflict.a.id === session.id ? conflict.b : conflict.a) : undefined;
  const clashFaculty = conflict ? getFaculty(db, conflict.facultyId) : undefined;
  const local = TIMEZONES[session.timeZone];
  const converted = session.timeZone !== viewerTz ? { s: convertZone(session.date, session.start, session.timeZone, viewerTz), e: convertZone(session.date, session.end, session.timeZone, viewerTz) } : null;
  const enrolled = db.enrollments.filter((e) => e.programmeId === session.programmeId && ['Registered', 'Confirmed', 'Attending', 'Completed'].includes(e.status)).length;
  const mats = session.materialIds.map((m) => byId(db.materials, m)).filter((m) => !!m);
  const multiDay = session.date !== session.endDate;
  const isVirtual = session.deliveryMode !== 'In-person';
  const isPhysical = session.deliveryMode !== 'Virtual';
  const attendancePct = session.attendedCount != null && enrolled ? (session.attendedCount / enrolled) * 100 : undefined;

  const moveTo = (start: string) => {
    const dur = minutesOf(session.end) - minutesOf(session.start);
    const end = timeFromMinutes(minutesOf(start) + dur);
    actions.update('sessions', session.id, { start, end });
    if (prog) actions.log(prog.id, 'session_scheduled', `moved “${session.title}” to ${start}–${end} ${local.abbr}`, userId);
    const after = conflictsForSession({ ...db, sessions: db.sessions.map((x) => (x.id === session.id ? { ...x, start, end } : x)) }, session.id);
    toast.show(after.length ? { message: 'Session moved — still a conflict', detail: 'Try a different time or assign cover', tone: 'danger' } : { message: 'Session moved', detail: `${start}–${end} ${local.abbr} · conflict resolved`, actionLabel: 'Undo', onAction: () => actions.update('sessions', session.id, { start: session.start, end: session.end }) });
  };

  const assignCover = (fid: string) => {
    if (!conflict) return;
    const ids = session.facultyIds.map((x) => (x === conflict.facultyId ? fid : x));
    actions.update('sessions', session.id, { facultyIds: ids });
    if (prog) actions.log(prog.id, 'faculty_assigned', `assigned ${facultyName(getFaculty(db, fid))} to cover “${session.title}”`, userId);
    toast.show({ message: `${facultyName(getFaculty(db, fid))} assigned`, detail: 'Conflict resolved · request sent to faculty', actionLabel: 'Undo', onAction: () => actions.update('sessions', session.id, { facultyIds: session.facultyIds }) });
  };

  const cancel = async () => {
    const { confirmed } = await dialog.confirm({ title: 'Cancel this session?', message: 'Participants and faculty will be notified and the calendar updated.', confirmLabel: 'Cancel session', cancelLabel: 'Keep', destructive: true, icon: 'calendar-x', input: { placeholder: 'Reason (optional)' } });
    if (!confirmed) return;
    actions.update('sessions', session.id, { status: 'Cancelled' });
    if (prog) actions.log(prog.id, 'status_changed', `cancelled the session “${session.title}”`, userId);
    toast.show({ message: 'Session cancelled', icon: 'calendar-x', tone: 'neutral', actionLabel: 'Undo', onAction: () => actions.update('sessions', session.id, { status: session.status }) });
  };

  const coverOptions = db.faculty
    .filter((f) => f.id !== conflict?.facultyId)
    .map((f) => {
      const av = facultyAvailability(db, f.id, session.date, session.start, session.end, session.timeZone);
      return { f, av };
    })
    .sort((a, b) => Number(b.av.free) - Number(a.av.free) || b.f.rating - a.f.rating);

  return (
    <Screen
      title={session.title}
      eyebrow={`${prog?.code ?? ''} · ${mod?.title ?? session.kind}`}
      headerRight={<IconButton icon="ellipsis" accessibilityLabel="Session actions" onPress={() => setSheet('menu')} />}
      footer={
        session.status === 'Cancelled' ? undefined : (
          <>
            {isVirtual && session.meetingLink ? <Button title="Join" icon="video" variant="secondary" onPress={() => toast.show({ message: 'Opening Zoom (simulated)', detail: session.meetingLink, icon: 'video', tone: 'accent' })} style={{ flex: 1 }} /> : null}
            <Button title={session.attendance === 'Recorded' || session.attendance === 'Closed' ? 'Review attendance' : 'Take attendance'} icon="user-check" onPress={() => router.push(`/attendance/${session.id}`)} style={{ flex: 1 }} />
          </>
        )
      }>
      <View style={s.pills}>
        <StatusPill label={session.status} size="md" />
        <StatusPill label={session.deliveryMode} tone="violet" icon={DELIVERY_ICON[session.deliveryMode]} size="md" />
        <StatusPill label={session.kind} tone="neutral" icon={SESSION_KIND_ICON[session.kind]} size="md" />
        {session.recurrence === 'Weekly' || session.recurrence === 'Daily' ? <StatusPill label={`Repeats ${session.recurrence.toLowerCase()}`} tone="info" icon="repeat" size="md" /> : null}
      </View>

      {conflict && other && session.status !== 'Cancelled' ? (
        <Banner
          tone="danger"
          icon="calendar-x"
          title="Schedule conflict"
          message={`${facultyName(clashFaculty)} is also teaching “${other.title}” (${getProgramme(db, other.programmeId)?.shortName}) at ${other.start} ${TIMEZONES[other.timeZone].abbr} — the same moment.`}
          action="Resolve conflict"
          onAction={() => setSheet('resolve')}
          style={{ marginTop: 14 }}
        />
      ) : null}
      {session.status === 'Cancelled' ? <Banner tone="neutral" icon="ban" title="This session was cancelled" message="It no longer appears in participant or faculty calendars." style={{ marginTop: 14 }} /> : null}

      <Section title="When">
        <Card padding="md">
          <View style={s.when}>
            <IconTile icon="calendar" tone="accent" size={40} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">{multiDay ? formatRange(session.date, session.endDate) : formatDateLong(session.date, true)}</Text>
              <Text variant="callout" tone="secondary">
                {session.start}–{session.end} {local.abbr} · {durationMinutesLabel(session.start, session.end)}
                {multiDay ? ' daily' : ''}
              </Text>
            </View>
          </View>
          <View style={[s.zoneRow, { borderTopWidth: 0.5, borderTopColor: colors.separator }]}>
            <Icon name="globe" size={15} tone="tertiary" />
            <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
              Session time zone: {local.label} ({tzOffsetLabel(session.timeZone)})
            </Text>
          </View>
          {converted ? (
            <View style={s.zoneRow}>
              <Icon name="clock" size={15} tone="accent" />
              <Text variant="footnote" tone="accent" weight="medium" style={{ flex: 1 }}>
                Your time: {converted.s.time}–{converted.e.time} {TIMEZONES[viewerTz].abbr}
                {converted.s.date !== session.date ? ` (${formatDateLong(converted.s.date)})` : ''}
              </Text>
            </View>
          ) : null}
        </Card>
      </Section>

      <Section title="Where">
        <ListGroup>
          {isPhysical ? (
            <ListRow icon="map-pin" iconTone="danger" title={session.roomName ?? session.location ?? 'Location to be confirmed'} subtitle={venue ? `${venue.name} · ${venue.address}` : session.location} onPress={venue ? () => router.push(`/venue/${venue.id}`) : undefined} numberOfLines={2} />
          ) : null}
          {isVirtual ? (
            <ListRow
              icon="video"
              iconTone="accent"
              title="Zoom meeting"
              subtitle={session.meetingLink ?? 'Link will be generated'}
              meta={session.meetingId ? `Meeting ID ${session.meetingId}` : undefined}
              trailing={session.meetingLink ? <IconButton icon="copy" accessibilityLabel="Copy meeting link" variant="filled" size={32} onPress={() => toast.show({ message: 'Meeting link copied', detail: session.meetingLink, icon: 'copy', tone: 'neutral' })} /> : undefined}
            />
          ) : null}
          {session.deliveryMode === 'Hybrid' ? <ListRow icon="monitor-play" iconTone="violet" title="Hybrid delivery" subtitle="In-room participants and remote attendees join the same session; the room has a hybrid camera and ceiling mics." numberOfLines={3} /> : null}
        </ListGroup>
      </Section>

      <Section title="People">
        <ListGroup>
          {session.facultyIds.map((fid) => {
            const f = getFaculty(db, fid);
            const clash = conflict?.facultyId === fid;
            return <ListRow key={fid} leading={<Avatar name={f?.name ?? ''} hue={f?.avatarHue} size={36} />} title={facultyName(f)} subtitle={f?.title} trailing={clash ? <StatusPill label="Double-booked" tone="danger" /> : undefined} onPress={() => router.push(`/faculty/${fid}`)} />;
          })}
          <ListRow icon="users" iconTone="success" title="Capacity" value={`${enrolled} / ${session.capacity} seats`} />
        </ListGroup>
        <ProgressBar value={(enrolled / Math.max(1, session.capacity)) * 100} color={colors.success} style={{ marginTop: 4 }} />
      </Section>

      <Section title="Programme">
        <ListGroup>
          {prog ? <ListRow icon="layers" iconTone="violet" title={prog.name} subtitle={`${prog.code} · ${formatRange(prog.startDate, prog.endDate)}`} onPress={() => router.push(`/programme/${prog.id}`)} /> : null}
          {mod ? <ListRow icon="book-open" iconTone="info" title={`Module ${mod.order}: ${mod.title}`} subtitle={mod.summary} onPress={() => router.push(`/module/${mod.id}`)} /> : null}
        </ListGroup>
      </Section>

      <Section title="Attendance">
        <Card padding="md" style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <StatusPill label={session.attendance} size="md" />
            <View style={{ flex: 1 }} />
            {session.attendedCount != null ? (
              <Text variant="headline" tabular>
                {session.attendedCount}/{enrolled} attended
              </Text>
            ) : (
              <Text variant="footnote" tone="secondary">
                {session.attendance === 'Open' ? 'Check-in open now' : 'Opens at session start'}
              </Text>
            )}
          </View>
          {attendancePct != null ? <ProgressBar value={attendancePct} color={colors.success} /> : null}
        </Card>
      </Section>

      {mats.length ? (
        <Section title="Materials" subtitle={`${mats.length} item${mats.length > 1 ? 's' : ''}`}>
          <ListGroup>
            {mats.map((m) => (
              <ListRow key={m!.id} leading={<FileIcon format={m!.format} size={36} />} title={m!.title} subtitle={`${m!.kind} · ${facultyName(getFaculty(db, m!.ownerFacultyId))}`} trailing={<StatusPill label={m!.status} />} onPress={() => router.push(`/material/${m!.id}`)} />
            ))}
          </ListGroup>
        </Section>
      ) : null}

      {session.agenda.length ? (
        <Section title="Agenda">
          <Card padding="md">
            {session.agenda.map((a, i) => (
              <View key={`${a.time}-${i}`} style={[s.agendaRow, i < session.agenda.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.separator }]}>
                <Text variant="headline" tabular style={{ width: 56 }}>
                  {a.time}
                </Text>
                <Text variant="callout" style={{ flex: 1 }}>
                  {a.item}
                </Text>
              </View>
            ))}
          </Card>
        </Section>
      ) : null}

      {session.objectives.length ? (
        <Section title="Learning objectives">
          <Card padding="md" style={{ gap: 10 }}>
            {session.objectives.map((o) => (
              <View key={o} style={{ flexDirection: 'row', gap: 10 }}>
                <Icon name="target" size={16} tone="accent" />
                <Text variant="callout" style={{ flex: 1 }}>
                  {o}
                </Text>
              </View>
            ))}
          </Card>
        </Section>
      ) : null}

      <KeyValueCard session={session} />

      <Sheet visible={sheet === 'resolve'} onClose={() => setSheet(null)} title="Resolve conflict" subtitle={facultyName(clashFaculty)}>
        {other ? (
          <View style={{ gap: 12 }}>
            {[session, other].map((x) => {
              const p = getProgramme(db, x.programmeId);
              const v = x.timeZone !== viewerTz ? convertZone(x.date, x.start, x.timeZone, viewerTz) : null;
              return (
                <Card key={x.id} variant="alt" padding="md" style={{ gap: 4 }}>
                  <Text variant="caption" tone="tertiary">
                    {p?.shortName} · {x.id === session.id ? 'THIS SESSION' : 'CLASHES WITH'}
                  </Text>
                  <Text variant="headline">{x.title}</Text>
                  <Text variant="footnote" tone="secondary">
                    {formatDateLong(x.date, true)} · {x.start}–{x.end} {TIMEZONES[x.timeZone].abbr}
                    {v ? ` (${v.time} ${TIMEZONES[viewerTz].abbr})` : ''}
                  </Text>
                </Card>
              );
            })}
            <ListGroup>
              <ListRow icon="clock" iconTone="accent" title="Move this session" subtitle="Pick a new start time; duration is kept" onPress={() => { setSheet(null); setTimeout(() => setSheet('move'), 260); }} />
              <ListRow icon="user-plus" iconTone="warning" title="Assign cover faculty" subtitle="Show who is free at this time" onPress={() => { setSheet(null); setTimeout(() => setSheet('cover'), 260); }} />
              <ListRow icon="message-square" iconTone="neutral" title="Ask the faculty member" subtitle="Log a note and create a follow-up task" onPress={() => { setSheet(null); if (prog) actions.createTask({ title: `Agree new time with ${facultyName(clashFaculty)}`, programmeId: prog.id, ownerId: 's-daniel', dueDate: session.date < '2027-04-01' ? session.date : '2027-03-31', priority: 'Urgent', category: 'Faculty', relatedPerson: clashFaculty ? { kind: 'faculty', id: clashFaculty.id } : undefined }); toast.show({ message: 'Follow-up task created', detail: 'Assigned to Daniel Okafor' }); }} />
            </ListGroup>
          </View>
        ) : null}
      </Sheet>
      <TimePickerSheet visible={sheet === 'move'} onClose={() => setSheet(null)} value={session.start} title="New start time" zoneLabel={`${local.label} (${local.abbr})`} onChange={moveTo} />
      <SelectSheet
        visible={sheet === 'cover'}
        onClose={() => setSheet(null)}
        title="Assign cover"
        options={coverOptions.map(({ f, av }) => ({
          value: f.id,
          label: facultyName(f),
          detail: av.free ? `Available · ${f.expertise.slice(0, 2).join(', ')}` : av.blocked.length ? `Unavailable · ${av.blocked[0].reason}` : `Busy · ${av.clashes[0]?.title}`,
          disabled: !av.free,
          leading: <Avatar name={f.name} hue={f.avatarHue} size={30} />,
          badge: av.free ? <StatusPill label="Free" tone="success" /> : <StatusPill label="Busy" tone="danger" />,
        }))}
        onSelect={assignCover}
      />
      <ActionSheet
        visible={sheet === 'menu'}
        onClose={() => setSheet(null)}
        title={session.title}
        actions={[
          { label: 'Change time', icon: 'clock', onPress: () => setSheet('move') },
          { label: 'Schedule a similar session', icon: 'calendar-plus', onPress: () => router.push(`/session/new?programme=${session.programmeId}`) },
          { label: 'Open in calendar', icon: 'calendar-days', onPress: () => router.push(`/calendar?programme=${session.programmeId}`) },
          ...(session.status !== 'Cancelled' ? [{ label: 'Cancel session', icon: 'calendar-x' as const, destructive: true, onPress: cancel }] : []),
        ]}
      />
    </Screen>
  );
}

function KeyValueCard({ session }: { session: Session }) {
  const recurrence = session.recurrence && session.recurrence !== 'None' ? session.recurrence : 'One-off';
  return (
    <Section title="Details">
      <Card padding="md" style={{ paddingVertical: 4 }}>
        <KeyValue label="Session type" value={session.kind} icon="presentation" />
        <KeyValue label="Recurrence" value={recurrence} icon="repeat" />
        <KeyValue label="Capacity" value={`${session.capacity} seats`} icon="armchair" />
        <KeyValue label="Reference" value={session.id.toUpperCase()} icon="hash" last />
      </Card>
    </Section>
  );
}

const styles = makeStyles((t) => ({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  when: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, marginTop: 10, borderTopWidth: 0 },
  agendaRow: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
}));
