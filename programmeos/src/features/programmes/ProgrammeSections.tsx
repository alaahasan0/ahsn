import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import {
  Avatar,
  Banner,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  FileIcon,
  HeaderActions,
  Icon,
  IconButton,
  ListGroup,
  ListRow,
  NoResults,
  ProgressBar,
  Screen,
  SearchField,
  Section,
  SegmentedControl,
  StatusPill,
  Text,
  Timeline,
  Touchable,
  useToast,
  type TimelineStep,
} from '@/components';
import type { EnrollmentStatus, Programme } from '@/data/models';
import {
  facultyName,
  getFaculty,
  getLearner,
  getStaff,
  getVenue,
  groupTasks,
  learnerName,
  LIFECYCLE,
  lifecycleIndex,
  personHue,
  personName,
  programmePhase,
  readinessFor,
} from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { fontFor, makeStyles, useStyles, useTheme } from '@/theme';
import { activityStamp, formatDate, formatDateLong, formatRange, relativeDay } from '@/utils/dates';
import { fileSize, searchMatch } from '@/utils/format';

import { ActivityFeed, SessionRow, TaskRow } from '../shared/Rows';
import { ProgrammeNotFound, useProgrammeParam } from './useProgrammeParam';

function withProgramme(Component: (props: { p: Programme }) => React.ReactNode) {
  return function Wrapped() {
    const p = useProgrammeParam();
    if (!p) return <ProgrammeNotFound />;
    return <Component p={p} />;
  };
}

// ─── Timeline & milestones ────────────────────────────────────────────────────

export const ProgrammeTimelineScreen = withProgramme(({ p }) => {
  const db = useDB();
  const ms = db.milestones.filter((m) => m.programmeId === p.id).sort((a, b) => a.date.localeCompare(b.date));
  const idx = lifecycleIndex(p.stage);
  const steps: TimelineStep[] = ms.map((m) => ({
    key: m.id,
    title: m.title,
    meta: formatDate(m.date, { year: false }),
    detail: [m.ownerId ? personName(db, m.ownerId) : undefined, m.note].filter(Boolean).join(' · '),
    state: m.status === 'done' ? 'done' : m.status === 'current' ? 'current' : m.status === 'at_risk' ? 'at_risk' : 'upcoming',
  }));
  const lifecycle: TimelineStep[] = LIFECYCLE.map((s, i) => ({
    key: s.key,
    title: s.label,
    state: p.cancelled ? (i <= idx ? 'done' : 'skipped') : i < idx ? 'done' : i === idx ? 'current' : 'upcoming',
  }));
  return (
    <Screen title="Timeline" eyebrow={p.name} subtitle={formatRange(p.startDate, p.endDate)}>
      <Section title="Milestones" first>
        <Card padding="lg">{steps.length ? <Timeline steps={steps} /> : <Text tone="secondary">No milestones yet.</Text>}</Card>
      </Section>
      <Section title="Programme lifecycle" subtitle="Workflow A · from approval to archive" action="Workflow view" onAction={() => router.push('/workflow/lifecycle')}>
        <Card padding="lg">
          <Timeline steps={lifecycle} dense />
        </Card>
      </Section>
    </Screen>
  );
});

// ─── Schedule ─────────────────────────────────────────────────────────────────

export const ProgrammeSessionsScreen = withProgramme(({ p }) => {
  const db = useDB();
  const list = db.sessions.filter((s) => s.programmeId === p.id).sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  const days = Array.from(new Set(list.map((s) => s.date)));
  return (
    <Screen title="Schedule" eyebrow={p.name} headerRight={<IconButton icon="plus" variant="tinted" accessibilityLabel="Add session" onPress={() => router.push(`/session/new?programme=${p.id}` as Href)} />}>
      {!list.length ? (
        <EmptyState icon="calendar-days" title="No sessions scheduled" message="Add the first session to build the programme schedule." actionLabel="Add session" onAction={() => router.push(`/session/new?programme=${p.id}` as Href)} />
      ) : (
        days.map((d) => (
          <Section key={d} title={formatDateLong(d, true)} subtitle={relativeDay(d)}>
            <ListGroup>
              {list
                .filter((s) => s.date === d)
                .map((s) => (
                  <SessionRow key={s.id} session={s} showProgramme={false} viewerTz={p.timeZone} />
                ))}
            </ListGroup>
          </Section>
        ))
      )}
    </Screen>
  );
});

// ─── Faculty ──────────────────────────────────────────────────────────────────

export const ProgrammeFacultyScreen = withProgramme(({ p }) => {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const list = db.facultyAssignments.filter((a) => a.programmeId === p.id);
  const r = readinessFor(db, p.id);
  const fac = r.categories.find((c) => c.key === 'faculty');
  return (
    <Screen title="Faculty" eyebrow={p.name} headerRight={<IconButton icon="user-plus" variant="tinted" accessibilityLabel="Assign faculty" onPress={() => router.push(`/faculty/assign?programme=${p.id}` as Href)} />}>
      {fac?.applicable && programmePhase(p) === 'upcoming' ? (
        <Card style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="headline">Faculty readiness</Text>
            <Text variant="headline" tabular>
              {Math.round(fac.percent)}%
            </Text>
          </View>
          <ProgressBar value={fac.percent} />
          <Text variant="footnote" tone="secondary">
            {fac.done} of {fac.total} confirmed · contracts tracked in Faculty profiles
          </Text>
        </Card>
      ) : null}
      {!list.length ? (
        <EmptyState icon="users" title="No faculty assigned" message="Assign faculty to sessions and send confirmation requests." actionLabel="Assign faculty" onAction={() => router.push(`/faculty/assign?programme=${p.id}` as Href)} />
      ) : (
        <Section title={`${list.length} assignments`}>
          <ListGroup>
            {list.map((a) => {
              const f = getFaculty(db, a.facultyId);
              const pending = a.status === 'Request Sent' || a.status === 'Proposed';
              return (
                <ListRow
                  key={a.id}
                  leading={<Avatar name={f?.name ?? ''} hue={f?.avatarHue} size={40} />}
                  title={facultyName(f)}
                  subtitle={`${a.role} · ${a.days} day${a.days === 1 ? '' : 's'} · ${a.sessionIds.length} session${a.sessionIds.length === 1 ? '' : 's'}`}
                  meta={a.confirmedOn ? `Confirmed ${formatDate(a.confirmedOn, { year: false })}` : `Requested ${formatDate(a.requestedOn, { year: false })}`}
                  trailing={
                    pending ? (
                      <Button
                        title="Remind"
                        size="sm"
                        variant="tinted"
                        onPress={() => {
                          actions.log(p.id, 'faculty_assigned', `sent a reminder to ${facultyName(f)}`);
                          toast.show({ message: 'Reminder sent', detail: `${facultyName(f)} · via email`, icon: 'send' });
                        }}
                      />
                    ) : (
                      <StatusPill label={a.status} />
                    )
                  }
                  onPress={() => router.push(`/faculty/${a.facultyId}`)}
                />
              );
            })}
          </ListGroup>
        </Section>
      )}
    </Screen>
  );
});

// ─── Participants ─────────────────────────────────────────────────────────────

const READY: EnrollmentStatus[] = ['Registered', 'Confirmed', 'Attending', 'Completed'];

export const ProgrammeParticipantsScreen = withProgramme(({ p }) => {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [seg, setSeg] = useState<'all' | 'ready' | 'pending' | 'other'>('all');
  const all = db.enrollments.filter((e) => e.programmeId === p.id);
  const ready = all.filter((e) => READY.includes(e.status));
  const pending = all.filter((e) => ['Nominated', 'Invited'].includes(e.status));
  const other = all.filter((e) => ['Withdrawn', 'Waitlisted'].includes(e.status));
  const base = seg === 'ready' ? ready : seg === 'pending' ? pending : seg === 'other' ? other : all;
  const shown = base.filter((e) => {
    const l = getLearner(db, e.learnerId);
    return searchMatch(q, learnerName(l), l?.jobTitle, l?.organisation, l?.country);
  });
  return (
    <Screen
      title="Participants"
      eyebrow={p.name}
      headerRight={
        <HeaderActions>
          <IconButton icon="import" accessibilityLabel="Import participants" onPress={() => router.push(`/learners/import?programme=${p.id}` as Href)} />
          <IconButton icon="user-plus" variant="tinted" accessibilityLabel="Register participant" onPress={() => router.push(`/learners/register?programme=${p.id}` as Href)} />
        </HeaderActions>
      }
      headerBelow={
        <>
          <Card style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text variant="headline">
                {ready.length} of {p.capacity} registered
              </Text>
              <Text variant="footnote" tone="secondary">
                {pending.length} pending
              </Text>
            </View>
            <ProgressBar value={(ready.length / Math.max(1, p.capacity)) * 100} color={undefined} />
            <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
              <Text variant="footnote" tone="secondary">
                <Icon name="salad" size={12} tone="tertiary" /> {all.filter((e) => getLearner(db, e.learnerId)?.dietary).length} dietary
              </Text>
              <Text variant="footnote" tone="secondary">
                <Icon name="accessibility" size={12} tone="tertiary" /> {all.filter((e) => getLearner(db, e.learnerId)?.accessibility).length} accessibility
              </Text>
              <Text variant="footnote" tone="secondary">
                <Icon name="bed-double" size={12} tone="tertiary" /> {all.filter((e) => e.requiresHotel).length} hotel
              </Text>
              <Text variant="footnote" tone="secondary">
                <Icon name="plane" size={12} tone="tertiary" /> {all.filter((e) => e.requiresTravel).length} travel
              </Text>
            </View>
          </Card>
          <SearchField value={q} onChangeText={setQ} placeholder="Search participants" />
          <SegmentedControl
            value={seg}
            onChange={setSeg}
            options={[
              { value: 'all', label: 'All', count: all.length },
              { value: 'ready', label: 'Registered', count: ready.length },
              { value: 'pending', label: 'Pending', count: pending.length },
              { value: 'other', label: 'Other', count: other.length },
            ]}
          />
        </>
      }>
      {!all.length ? (
        <EmptyState icon="users" title="No participants yet" message={`Waiting for nominations from the client. Import a list or register participants individually.`} actionLabel="Import participant list" onAction={() => router.push(`/learners/import?programme=${p.id}` as Href)} secondaryLabel="Register one participant" onSecondary={() => router.push(`/learners/register?programme=${p.id}` as Href)} />
      ) : !shown.length ? (
        q ? <NoResults query={q} onClear={() => setQ('')} /> : <EmptyState icon="circle-check-big" title="Nothing here" message="No participants in this group." compact />
      ) : (
        <ListGroup>
          {shown.map((e) => {
            const l = getLearner(db, e.learnerId);
            const isPending = e.status === 'Invited' || e.status === 'Nominated';
            return (
              <ListRow
                key={e.id}
                leading={<Avatar name={learnerName(l)} hue={l?.avatarHue} size={38} />}
                title={learnerName(l)}
                subtitle={`${l?.jobTitle} · ${l?.country}`}
                meta={[l?.dietary ? `Diet: ${l.dietary}` : null, l?.accessibility ? 'Accessibility needs' : null].filter(Boolean).join(' · ') || undefined}
                trailing={
                  isPending ? (
                    <Button
                      title={e.status === 'Nominated' ? 'Invite' : 'Register'}
                      size="sm"
                      variant="tinted"
                      onPress={() => {
                        actions.setEnrollmentStatus(e.id, e.status === 'Nominated' ? 'Invited' : 'Registered');
                        if (e.status === 'Invited') actions.log(p.id, 'participant_registered', `registered ${learnerName(l)}`);
                        toast.show({ message: e.status === 'Nominated' ? 'Invitation sent' : 'Participant registered', detail: learnerName(l) });
                      }}
                    />
                  ) : (
                    <StatusPill label={e.status} />
                  )
                }
                onPress={() => router.push(`/enrollment/${e.id}`)}
              />
            );
          })}
        </ListGroup>
      )}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Button title="Nominations" icon="user-check" variant="secondary" onPress={() => router.push('/learners/nominations')} style={{ flex: 1 }} />
        <Button title="Email all" icon="mail" variant="secondary" onPress={() => toast.show({ message: 'Email drafted', detail: `To ${ready.length} registered participants`, icon: 'mail' })} style={{ flex: 1 }} />
      </View>
    </Screen>
  );
});

// ─── Academics ────────────────────────────────────────────────────────────────

export const ProgrammeAcademicsScreen = withProgramme(({ p }) => {
  const db = useDB();
  const cohorts = db.cohorts.filter((c) => c.programmeId === p.id);
  const modules = db.modules.filter((m) => m.programmeId === p.id).sort((a, b) => a.order - b.order);
  const materials = db.materials.filter((m) => m.programmeId === p.id);
  const approved = materials.filter((m) => m.status === 'Approved' || m.status === 'Published').length;
  return (
    <Screen title="Academics" eyebrow={p.name} subtitle="Programme → Cohort → Module → Session → Materials" headerRight={<IconButton icon="upload" variant="tinted" accessibilityLabel="Submit material" onPress={() => router.push(`/material/submit?programme=${p.id}` as Href)} />}>
      <Card style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="headline">Materials approved</Text>
          <Text variant="headline" tabular>
            {approved}/{materials.length}
          </Text>
        </View>
        <ProgressBar value={materials.length ? (approved / materials.length) * 100 : 0} />
        <Text variant="footnote" tone="secondary">
          Cohorts: {cohorts.map((c) => `${c.name} (${c.size})`).join(' · ') || '—'}
        </Text>
      </Card>
      {modules.map((m) => {
        const mats = materials.filter((x) => x.moduleId === m.id);
        const sess = db.sessions.filter((s) => s.moduleId === m.id);
        return (
          <Section key={m.id} title={`Module ${m.order} · ${m.title}`} subtitle={`${facultyName(getFaculty(db, m.leadFacultyId))} · ${sess.length} session${sess.length === 1 ? '' : 's'}`} action="Open" onAction={() => router.push(`/module/${m.id}`)}>
            <ListGroup>
              {mats.length ? (
                mats.map((mt) => <ListRow key={mt.id} leading={<FileIcon format={mt.format} size={34} />} title={mt.title} subtitle={`${mt.kind} · ${mt.versions.length ? mt.versions[mt.versions.length - 1].label : 'no version'} · due ${formatDate(mt.dueDate, { year: false })}`} trailing={<StatusPill label={mt.status} />} onPress={() => router.push(`/material/${mt.id}`)} />)
              ) : (
                <ListRow icon="file-plus" iconTone="neutral" title="No materials yet" subtitle="Request or upload the first material" onPress={() => router.push(`/material/submit?programme=${p.id}` as Href)} />
              )}
            </ListGroup>
          </Section>
        );
      })}
      {!modules.length ? <EmptyState icon="book-open" title="No modules defined" message="Design the module structure to start collecting materials." /> : null}
    </Screen>
  );
});

// ─── Logistics ────────────────────────────────────────────────────────────────

export const ProgrammeLogisticsScreen = withProgramme(({ p }) => {
  const db = useDB();
  const bookings = db.hotelBookings.filter((b) => b.programmeId === p.id && b.status !== 'Cancelled');
  const confirmed = bookings.filter((b) => ['Confirmed', 'Checked In', 'Checked Out'].includes(b.status)).length;
  const trips = db.itineraries.filter((t) => t.programmeId === p.id);
  const booked = trips.filter((t) => ['Booked', 'Ticketed', 'Completed'].includes(t.status)).length;
  const vb = db.venueBookings.filter((v) => v.programmeId === p.id);
  const items = db.logisticsItems.filter((i) => i.programmeId === p.id);
  const done = items.filter((i) => i.done).length;
  const hotel = bookings[0] ? db.hotels.find((h) => h.id === bookings[0].hotelId) : undefined;
  const run = db.runSheet.filter((r) => r.programmeId === p.id);
  return (
    <Screen title="Logistics" eyebrow={p.name}>
      {p.deliveryMode === 'Virtual' && !bookings.length ? <Banner tone="info" title="Virtual programme" message="No hotel, travel or venue required. Platform set-up is tracked in the checklist." style={{ marginBottom: 8 }} /> : null}
      <Section title="Accommodation" first>
        <ListGroup>
          <ListRow icon="bed-double" iconTone="info" title={hotel ? hotel.name : 'No hotel booked'} subtitle={bookings.length ? `${confirmed} of ${bookings.length} rooms confirmed` : 'Start a hotel booking'} onPress={() => router.push(bookings.length ? (`/rooming/${p.id}` as Href) : (`/hotel-booking/new?programme=${p.id}` as Href))} />
          <ListRow icon="list" iconTone="neutral" title="Rooming list" value={`${bookings.length} guests`} onPress={() => router.push(`/rooming/${p.id}` as Href)} />
        </ListGroup>
      </Section>
      <Section title="Travel">
        <ListGroup>
          <ListRow icon="plane" iconTone="warning" title={`${booked} of ${trips.length} itineraries booked`} subtitle={trips.length - booked ? `${trips.length - booked} still to book` : 'All travel confirmed'} onPress={() => router.push(`/travel?programme=${p.id}` as Href)} />
        </ListGroup>
      </Section>
      <Section title="Venue">
        <ListGroup>
          {vb.length ? (
            vb.map((v) => {
              const venue = getVenue(db, v.venueId);
              const room = venue?.rooms.find((r) => r.id === v.roomId);
              return <ListRow key={v.id} icon="building-2" iconTone="violet" title={`${venue?.name} · ${room?.name}`} subtitle={`${formatRange(v.dates.from, v.dates.to)} · ${v.layout} · ${v.attendees} pax`} trailing={<StatusPill label={v.status} />} onPress={() => router.push(`/venue-booking/${v.id}` as Href)} />;
            })
          ) : (
            <ListRow icon="building-2" iconTone="neutral" title="No venue booking" subtitle="Browse venues" onPress={() => router.push('/venues')} />
          )}
        </ListGroup>
      </Section>
      <Section title="Checklist" action="Open" onAction={() => router.push(`/logistics/checklist/${p.id}` as Href)}>
        <Card style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="headline">Logistics checklist</Text>
            <Text variant="headline" tabular>
              {done}/{items.length}
            </Text>
          </View>
          <ProgressBar value={items.length ? (done / items.length) * 100 : 0} />
          <Text variant="footnote" tone="secondary">
            Venue, AV, catering, transport, printing, event materials and on-site operations
          </Text>
        </Card>
      </Section>
      {run.length ? (
        <Section title="On-site operations">
          <ListGroup>
            <ListRow icon="clipboard-list" iconTone="accent" title="Day 1 run sheet" subtitle={`${run.length} timed items · ${formatDate(run[0].date)}`} onPress={() => router.push(`/onsite/${p.id}` as Href)} />
          </ListGroup>
        </Section>
      ) : null}
    </Screen>
  );
});

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const ProgrammeTasksScreen = withProgramme(({ p }) => {
  const db = useDB();
  const g = groupTasks(db.tasks.filter((t) => t.programmeId === p.id));
  const groups = [
    { title: 'Overdue', list: g.overdue },
    { title: 'Today', list: g.today },
    { title: 'Next 7 days', list: g.week },
    { title: 'Later', list: g.later },
    { title: 'Completed', list: g.done },
  ].filter((x) => x.list.length);
  return (
    <Screen title="Tasks" eyebrow={p.name} headerRight={<IconButton icon="plus" variant="tinted" accessibilityLabel="Add task" onPress={() => router.push(`/task/new?programme=${p.id}` as Href)} />}>
      {!groups.length ? (
        <EmptyState icon="square-check-big" title="No tasks yet" message="Apply a workflow template to generate the operational checklist." actionLabel="Browse templates" onAction={() => router.push('/workflows')} />
      ) : (
        groups.map((grp) => (
          <Section key={grp.title} title={`${grp.title} · ${grp.list.length}`}>
            <ListGroup>
              {grp.list.map((t) => (
                <TaskRow key={t.id} task={t} showProgramme={false} showOwner />
              ))}
            </ListGroup>
          </Section>
        ))
      )}
    </Screen>
  );
});

// ─── Documents ────────────────────────────────────────────────────────────────

export const ProgrammeDocumentsScreen = withProgramme(({ p }) => {
  const db = useDB();
  const [kind, setKind] = useState<string | null>(null);
  const docs = db.documents.filter((d) => d.programmeId === p.id);
  const kinds = Array.from(new Set(docs.map((d) => d.kind)));
  const shown = docs.filter((d) => !kind || d.kind === kind).sort((a, b) => b.uploadedOn.localeCompare(a.uploadedOn));
  return (
    <Screen title="Documents" eyebrow={p.name} headerRight={<IconButton icon="upload" variant="tinted" accessibilityLabel="Upload document" onPress={() => router.push(`/document/upload?programme=${p.id}` as Href)} />} headerBelow={kinds.length > 1 ? <ChipRow><Chip label="All" selected={!kind} onPress={() => setKind(null)} />{kinds.map((k) => <Chip key={k} label={k} selected={kind === k} onPress={() => setKind(k)} />)}</ChipRow> : undefined}>
      {!docs.length ? (
        <EmptyState icon="folder-open" title="No documents yet" message="Upload contracts, rooming lists, itineraries and materials so everything lives with the programme." actionLabel="Upload document" onAction={() => router.push(`/document/upload?programme=${p.id}` as Href)} />
      ) : (
        <ListGroup>
          {shown.map((d) => (
            <ListRow key={d.id} leading={<FileIcon format={d.format} size={38} />} title={d.title} subtitle={`${d.kind} · ${d.version} · ${fileSize(d.sizeKb)}`} meta={`${personName(db, d.uploadedBy)} · ${formatDate(d.uploadedOn, { year: false })}`} trailing={<StatusPill label={d.status} />} onPress={() => router.push(`/document/${d.id}`)} />
          ))}
        </ListGroup>
      )}
    </Screen>
  );
});

// ─── Activity history ─────────────────────────────────────────────────────────

export const ProgrammeActivityScreen = withProgramme(({ p }) => {
  const db = useDB();
  const items = db.activity.filter((a) => a.programmeId === p.id);
  return (
    <Screen title="Activity history" eyebrow={p.name} subtitle="Every change to this programme, newest first">
      {items.length ? (
        <Card padding="lg">
          <ActivityFeed items={items} />
        </Card>
      ) : (
        <EmptyState icon="history" title="No activity yet" message="Changes made in this workspace will appear here." />
      )}
    </Screen>
  );
});

// ─── Discussion ───────────────────────────────────────────────────────────────

export const ProgrammeDiscussionScreen = withProgramme(({ p }) => {
  const s = useStyles(styles);
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const posts = db.discussions.filter((d) => d.programmeId === p.id).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.date.localeCompare(a.date));
  const post = () => {
    if (!text.trim()) return;
    actions.addDiscussionPost(p.id, text.trim());
    actions.log(p.id, 'comment', 'posted in the programme discussion');
    setText('');
    toast.show({ message: 'Posted to discussion', detail: 'The programme team has been notified' });
  };
  return (
    <Screen
      title="Discussion"
      eyebrow={p.name}
      subtitle="Internal programme team channel"
      footer={
        <View style={s.composer}>
          <TextInput value={text} onChangeText={setText} placeholder="Share an update with the team…" placeholderTextColor={colors.textTertiary} style={[fontFor('regular'), s.input]} multiline accessibilityLabel="Message" />
          <IconButton icon="send" variant="primary" accessibilityLabel="Post" onPress={post} disabled={!text.trim()} />
        </View>
      }>
      {!posts.length ? (
        <EmptyState icon="message-square" title="Start the conversation" message="Keep decisions and updates next to the programme instead of scattered across email." />
      ) : (
        <View style={{ gap: 10 }}>
          {posts.map((d) => (
            <Card key={d.id} style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Avatar name={personName(db, d.authorId)} hue={personHue(db, d.authorId)} size={34} />
                <View style={{ flex: 1 }}>
                  <Text variant="headline">{personName(db, d.authorId)}</Text>
                  <Text variant="footnote" tone="tertiary">
                    {getStaff(db, d.authorId)?.title} · {activityStamp(d.date)}
                  </Text>
                </View>
                {d.pinned ? <StatusPill label="Pinned" tone="accent" icon="pin" /> : null}
              </View>
              <Text variant="body">{d.text}</Text>
              {d.replies?.map((r) => (
                <View key={r.id} style={s.reply}>
                  <Avatar name={personName(db, r.authorId)} hue={personHue(db, r.authorId)} size={24} />
                  <View style={{ flex: 1 }}>
                    <Text variant="footnote" weight="semibold">
                      {personName(db, r.authorId)} <Text variant="footnote" tone="tertiary">{activityStamp(r.date)}</Text>
                    </Text>
                    <Text variant="callout">{r.text}</Text>
                  </View>
                </View>
              ))}
              <Touchable
                onPress={() => {
                  actions.replyToPost(d.id, 'Thanks — noted. I’ll pick this up today.');
                  toast.show({ message: 'Reply posted' });
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Icon name="reply" size={14} tone="accent" />
                <Text variant="footnote" tone="accent" weight="medium">
                  Quick reply
                </Text>
              </Touchable>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
});

const styles = makeStyles((t) => ({
  composer: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: { flex: 1, minHeight: 40, maxHeight: 120, borderRadius: 20, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 15, color: t.colors.text, backgroundColor: t.colors.surfaceAlt, outlineStyle: 'none' } as never,
  reply: { flexDirection: 'row', gap: 8, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: t.colors.border },
}));
