import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Banner, Button, Card, Chip, ChipRow, EmptyState, Icon, ProgressBar, Screen, Section, StageDots, StatusPill, Text, Timeline, useToast, type TimelineStep } from '@/components';
import type { FacultyAssignment, HotelBooking } from '@/data/models';
import {
  byId,
  facultyAvailability,
  facultyName,
  getFaculty,
  getHotel,
  getProgramme,
  getSession,
  getStaff,
  LIFECYCLE,
  lifecycleIndex,
  personName,
  programmePhase,
  readinessFor,
} from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { addDays, DEMO_TODAY, diffDays, formatDate, formatRange } from '@/utils/dates';
import { money, newId } from '@/utils/format';

import { VISUAL_WORKFLOWS } from './WorkflowsScreen';

export default function WorkflowVisualScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const meta = VISUAL_WORKFLOWS.find((w) => w.key === key);
  if (!meta) {
    return (
      <Screen title="Workflow" large={false}>
        <EmptyState icon="workflow" title="Workflow not found" actionLabel="All workflows" onAction={() => router.replace('/workflows')} />
      </Screen>
    );
  }
  return (
    <Screen title={meta.title} eyebrow={`Workflow ${meta.letter} · ${meta.steps} steps`} subtitle={meta.detail}>
      {key === 'lifecycle' ? <LifecycleWorkflow /> : key === 'faculty' ? <FacultyWorkflow /> : <HotelWorkflow />}
    </Screen>
  );
}

function stateFor(i: number, current: number, allDone = false): TimelineStep['state'] {
  if (allDone || i < current) return 'done';
  if (i === current) return 'current';
  return 'upcoming';
}

function ProgressHeader({ title, subtitle, done, total, pill }: { title: string; subtitle: string; done: number; total: number; pill?: string }) {
  return (
    <Card padding="md" style={{ gap: 10, marginTop: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="headline" numberOfLines={2}>
            {title}
          </Text>
          <Text variant="footnote" tone="secondary">
            {subtitle}
          </Text>
        </View>
        {pill ? <StatusPill label={pill} size="md" /> : null}
      </View>
      <StageDots total={total} current={done} />
      <Text variant="footnote" tone="tertiary">
        {done >= total ? 'All steps complete' : `Step ${done + 1} of ${total}`}
      </Text>
    </Card>
  );
}

// ─── Workflow A · New programme lifecycle ─────────────────────────────────────

const LIFECYCLE_TEXT: Record<string, string> = {
  approved: 'Contract signed and the programme approved commercially.',
  workspace: 'One workspace created — every record links back to it.',
  manager: 'Programme manager and coordinator assigned.',
  checklist: 'Operational checklist generated from the workflow template.',
  faculty: 'Faculty sourced, confirmed and contracted.',
  logistics: 'Venue, hotel, travel and transport requirements captured.',
  academic: 'Modules designed; materials submitted, reviewed and approved.',
  learners: 'Nominations, registrations and participant requirements.',
  readiness: 'Readiness monitored live across nine dimensions.',
  delivery_approval: 'Go / No-Go decision recorded against the threshold.',
  delivery: 'Sessions delivered; attendance and feedback captured.',
  financial_closure: 'Supplier invoices reconciled and the final client invoice issued.',
  archive: 'Programme archived with its complete history.',
};

function LifecycleWorkflow() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { userId } = useSession();
  const params = useLocalSearchParams<{ programme?: string }>();
  const list = db.programmes.filter((p) => !p.cancelled).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const [pid, setPid] = useState(params.programme && getProgramme(db, params.programme) ? params.programme : 'p-elp');
  const p = getProgramme(db, pid)!;
  const idx = lifecycleIndex(p.stage);
  const allDone = !!p.archived;
  const r = readinessFor(db, p.id);

  const assignments = db.facultyAssignments.filter((a) => a.programmeId === p.id && a.status !== 'Declined');
  const readyFac = assignments.filter((a) => ['Confirmed', 'Contract Issued', 'Contracted'].includes(a.status)).length;
  const mats = db.materials.filter((m) => m.programmeId === p.id);
  const approved = mats.filter((m) => ['Approved', 'Published'].includes(m.status)).length;
  const enrol = db.enrollments.filter((e) => e.programmeId === p.id && ['Registered', 'Confirmed', 'Attending', 'Completed'].includes(e.status)).length;
  const bookings = db.hotelBookings.filter((b) => b.programmeId === p.id);
  const tasks = db.tasks.filter((t) => t.programmeId === p.id);
  const invoices = db.clientInvoices.filter((i) => i.programmeId === p.id);
  const created = db.activity.find((a) => a.programmeId === p.id && a.kind === 'programme_created');

  const metaFor = (k: string): string | undefined => {
    switch (k) {
      case 'approved':
        return p.status.commercial;
      case 'workspace':
        return created ? formatDate(created.date.slice(0, 10), { year: false }) : undefined;
      case 'manager':
        return getStaff(db, p.managerId)?.name;
      case 'checklist':
        return `${tasks.length} tasks`;
      case 'faculty':
        return assignments.length ? `${readyFac}/${assignments.length} confirmed` : 'None yet';
      case 'logistics':
        return p.deliveryMode === 'Virtual' ? 'Platform only' : bookings.length ? `${bookings.filter((b) => b.status === 'Confirmed').length}/${bookings.length} rooms` : 'Not started';
      case 'academic':
        return mats.length ? `${approved}/${mats.length} approved` : 'Design';
      case 'learners':
        return `${enrol}/${p.capacity} registered`;
      case 'readiness':
        return r.configured ? `${Math.round(r.overall)}% ready` : undefined;
      case 'delivery_approval':
        return r.decision ? (r.decision.outcome === 'go' ? 'Go' : r.decision.outcome === 'no_go' ? 'No-Go' : 'Conditional') : r.configured ? `Due ${formatDate(r.goNoGoDate, { year: false })}` : undefined;
      case 'delivery':
        return formatRange(p.startDate, p.endDate);
      case 'financial_closure':
        return invoices.length ? `${money(invoices.reduce((s, i) => s + i.paid, 0))} received` : undefined;
      default:
        return undefined;
    }
  };

  const steps: TimelineStep[] = LIFECYCLE.map((s, i) => {
    let state = stateFor(i, idx, allDone);
    let detail = LIFECYCLE_TEXT[s.key];
    if (s.key === 'readiness' && state === 'current' && r.configured && r.overall < r.threshold) {
      state = 'at_risk';
      detail = `${Math.round(r.overall)}% ready against a ${r.threshold}% Go threshold — ${r.criticalCount} critical item${r.criticalCount === 1 ? '' : 's'}.`;
    }
    const route = s.key === 'readiness' || s.key === 'delivery_approval' ? `/programme/${p.id}/readiness` : s.key === 'faculty' ? `/programme/${p.id}/faculty` : s.key === 'learners' ? `/programme/${p.id}/participants` : s.key === 'academic' ? `/programme/${p.id}/academics` : s.key === 'logistics' ? `/programme/${p.id}/logistics` : s.key === 'checklist' ? `/programme/${p.id}/tasks` : s.key === 'financial_closure' ? `/programme/${p.id}/finance` : undefined;
    return { key: s.key, title: s.label, detail, meta: metaFor(s.key), state, onPress: route ? () => router.push(route as never) : undefined };
  });

  const advance = () => {
    const next = LIFECYCLE[idx + 1];
    if (!next) return;
    actions.updateProgramme(p.id, { stage: next.key });
    actions.log(p.id, 'status_changed', `moved the programme to “${next.label}”`, userId);
    toast.show({ message: `Moved to ${next.label}`, detail: p.name, actionLabel: 'Undo', onAction: () => actions.updateProgramme(p.id, { stage: p.stage }) });
  };

  return (
    <>
      <ChipRow>
        {list.map((x) => (
          <Chip key={x.id} label={x.shortName} selected={x.id === pid} onPress={() => setPid(x.id)} />
        ))}
      </ChipRow>
      <ProgressHeader title={p.name} subtitle={`${LIFECYCLE[idx]?.label ?? 'Archive'} · ${programmePhase(p) === 'upcoming' ? `starts ${formatDate(p.startDate, { year: false })}` : formatRange(p.startDate, p.endDate)}`} done={allDone ? LIFECYCLE.length : idx} total={LIFECYCLE.length} pill={p.status.operational} />
      <Section title="Steps">
        <Card padding="md">
          <Timeline steps={steps} />
        </Card>
      </Section>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Button title="Open workspace" variant="secondary" icon="layers" onPress={() => router.push(`/programme/${p.id}`)} style={{ flex: 1 }} />
        {!allDone && idx < LIFECYCLE.length - 1 ? <Button title="Advance stage" icon="arrow-right" onPress={advance} style={{ flex: 1 }} /> : null}
      </View>
    </>
  );
}

// ─── Workflow B · Faculty assignment ──────────────────────────────────────────

const FACULTY_STEPS: { title: string; detail: string }[] = [
  { title: 'Select faculty', detail: 'Match expertise, rating and fee to the session.' },
  { title: 'Check availability', detail: 'Live calendar check across time zones and blocked dates.' },
  { title: 'Create assignment', detail: 'Assignment created and linked to sessions.' },
  { title: 'Send confirmation', detail: 'Teaching request sent to the instructor.' },
  { title: 'Confirm participation', detail: 'Instructor accepts; sessions move from tentative to scheduled.' },
  { title: 'Generate contract task', detail: 'Faculty agreement drafted and routed for signature.' },
  { title: 'Generate material task', detail: 'Material submission deadline set with the academic reviewer.' },
  { title: 'Generate travel requirements', detail: 'Flights, hotel and transfers requested if travelling.' },
  { title: 'Update readiness', detail: 'Faculty readiness recalculated automatically.' },
];

const NEXT_STATUS: Partial<Record<FacultyAssignment['status'], FacultyAssignment['status']>> = {
  Proposed: 'Request Sent',
  'Request Sent': 'Confirmed',
  Confirmed: 'Contract Issued',
  'Contract Issued': 'Contracted',
};

function facultyCurrent(status: FacultyAssignment['status']) {
  switch (status) {
    case 'Proposed':
      return 3;
    case 'Request Sent':
    case 'Declined':
      return 4;
    case 'Confirmed':
      return 5;
    case 'Contract Issued':
      return 7;
    default:
      return 9;
  }
}

function FacultyWorkflow() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { userId } = useSession();
  const params = useLocalSearchParams<{ assignment?: string }>();
  const statusRank: Record<FacultyAssignment['status'], number> = { 'Request Sent': 0, Proposed: 1, Declined: 2, Confirmed: 3, 'Contract Issued': 4, Contracted: 5 };
  const list = db.facultyAssignments.filter((a) => !getProgramme(db, a.programmeId)?.archived).sort((x, y) => statusRank[x.status] - statusRank[y.status]);
  const [aid, setAid] = useState(params.assignment && byId(list, params.assignment) ? params.assignment : 'fa-dte-3');
  const a = byId(db.facultyAssignments, aid) ?? list[0];
  const f = getFaculty(db, a.facultyId)!;
  const p = getProgramme(db, a.programmeId)!;
  const firstSession = getSession(db, a.sessionIds[0]);
  const avail = firstSession ? facultyAvailability(db, f.id, firstSession.date, firstSession.start, firstSession.end, firstSession.timeZone) : undefined;
  const otherClashes = avail?.clashes.filter((c) => c.id !== firstSession?.id) ?? [];
  const mats = db.materials.filter((m) => m.programmeId === p.id && m.ownerFacultyId === f.id);
  const trip = db.itineraries.find((t) => t.programmeId === p.id && t.traveller.id === f.id);
  const r = readinessFor(db, p.id);
  const facCat = r.categories.find((c) => c.key === 'faculty');
  const current = facultyCurrent(a.status);
  const declined = a.status === 'Declined';

  const metas = [
    f.expertise.slice(0, 2).join(' · '),
    avail ? (avail.blocked.length ? 'Blocked dates' : otherClashes.length ? 'Conflict found' : 'Available') : 'No session yet',
    `${a.role} · ${a.days} day${a.days > 1 ? 's' : ''}`,
    formatDate(a.requestedOn, { year: false }),
    a.confirmedOn ? formatDate(a.confirmedOn, { year: false }) : declined ? 'Declined' : 'Awaiting reply',
    f.contractStatus,
    mats.length ? `${mats.length} material${mats.length > 1 ? 's' : ''}` : 'None',
    trip ? trip.status : f.location.split(',')[0],
    facCat?.applicable ? `${Math.round(facCat.percent)}% faculty readiness` : undefined,
  ];

  const steps: TimelineStep[] = FACULTY_STEPS.map((s, i) => {
    let state = stateFor(i, current, a.status === 'Contracted');
    let detail = s.detail;
    if (declined && i === 4) {
      state = 'at_risk';
      detail = `${facultyName(f)} declined the request. Choose another instructor to continue.`;
    }
    if (declined && i > 4) state = 'skipped';
    if (i === 1 && otherClashes.length) detail = `Conflict: also teaching “${otherClashes[0].title}”.`;
    return { key: s.title, title: s.title, detail, meta: i <= current || a.status === 'Contracted' ? metas[i] : undefined, state };
  });

  const advance = () => {
    const next = NEXT_STATUS[a.status];
    if (!next) return;
    actions.setAssignmentStatus(a.id, next);
    actions.log(p.id, 'faculty_assigned', `moved ${facultyName(f)}’s assignment to “${next}”`, userId);
    if (next === 'Confirmed') {
      actions.createTask({ title: `Issue faculty agreement — ${facultyName(f)}`, programmeId: p.id, ownerId: 's-daniel', dueDate: addDays(DEMO_TODAY, 5), priority: 'High', category: 'Faculty', relatedPerson: { kind: 'faculty', id: f.id }, description: `${a.role}, ${a.days} days at ${money(f.dailyFee)}/day.` });
      actions.createTask({ title: `Collect materials from ${facultyName(f)}`, programmeId: p.id, ownerId: 's-priya', dueDate: addDays(p.startDate, -21), priority: 'Medium', category: 'Academic', relatedPerson: { kind: 'faculty', id: f.id } });
      toast.show({ message: `${facultyName(f)} confirmed`, detail: 'Contract and material tasks generated' });
    } else if (next === 'Contract Issued') {
      if (!trip && p.deliveryMode !== 'Virtual') {
        actions.add('itineraries', { id: newId('ti'), programmeId: p.id, traveller: { kind: 'faculty', id: f.id }, status: 'Requested', segments: [], transfers: [], cost: 0, notes: `Generated from faculty assignment · preferred airport ${f.preferredAirport}` });
      }
      toast.show({ message: 'Contract issued', detail: p.deliveryMode === 'Virtual' ? 'Virtual programme — no travel needed' : 'Travel requirement created' });
    } else if (next === 'Contracted') {
      toast.show({ message: 'Assignment complete', detail: 'Faculty readiness updated' });
    } else {
      toast.show({ message: 'Teaching request sent', detail: `${facultyName(f)} will be notified`, icon: 'send' });
    }
  };

  return (
    <>
      <ChipRow>
        {list.map((x) => {
          const fx = getFaculty(db, x.facultyId);
          return <Chip key={x.id} label={`${fx?.name.split(' ').slice(-1)[0]} · ${getProgramme(db, x.programmeId)?.shortName}`} selected={x.id === a.id} onPress={() => setAid(x.id)} />;
        })}
      </ChipRow>
      <Card padding="md" style={{ marginTop: 14, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={f.name} hue={f.avatarHue} size={44} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="headline" numberOfLines={1}>
              {facultyName(f)}
            </Text>
            <Text variant="footnote" tone="secondary" numberOfLines={1}>
              {p.name} · {a.role}
            </Text>
          </View>
          <StatusPill label={a.status} size="md" />
        </View>
        <StageDots total={FACULTY_STEPS.length} current={Math.min(current, FACULTY_STEPS.length)} />
      </Card>
      {declined ? <Banner tone="danger" title="Request declined" message="Find an alternative with matching expertise and availability." action="Assign another instructor" onAction={() => router.push(`/faculty/assign?programme=${p.id}`)} style={{ marginTop: 12 }} /> : null}
      <Section title="Steps">
        <Card padding="md">
          <Timeline steps={steps} />
        </Card>
      </Section>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Button title="Faculty profile" variant="secondary" icon="user" onPress={() => router.push(`/faculty/${f.id}`)} style={{ flex: 1 }} />
        {NEXT_STATUS[a.status] ? <Button title={a.status === 'Proposed' ? 'Send request' : a.status === 'Request Sent' ? 'Record acceptance' : a.status === 'Confirmed' ? 'Issue contract' : 'Mark signed'} icon="arrow-right" onPress={advance} style={{ flex: 1 }} /> : null}
      </View>
    </>
  );
}

// ─── Workflow C · Hotel booking ───────────────────────────────────────────────

const HOTEL_STEPS: { title: string; detail: string }[] = [
  { title: 'Select hotel', detail: 'Preferred hotel chosen against rate, distance and rating.' },
  { title: 'Define requirements', detail: 'Dates, room types and the number of rooms.' },
  { title: 'Add guests', detail: 'Participants, faculty and staff added from the programme.' },
  { title: 'Generate rooming list', detail: 'Rooming list built automatically from guests and requests.' },
  { title: 'Confirm booking', detail: 'Hotel confirms the room block.' },
  { title: 'Record confirmation number', detail: 'Confirmation numbers stored against each guest.' },
  { title: 'Monitor changes', detail: 'Amendments, special requests and cancellation deadlines tracked.' },
  { title: 'Receive invoice', detail: 'Hotel invoice received and matched to bookings.' },
  { title: 'Reconcile cost', detail: 'Actual cost reconciled to the programme budget.' },
];

function hotelCurrent(list: HotelBooking[]) {
  const live = list.filter((b) => b.status !== 'Cancelled');
  if (live.some((b) => b.status === 'Requested' || b.status === 'Provisional')) return 4;
  if (live.some((b) => !b.confirmationNumber)) return 5;
  if (live.every((b) => b.invoiceStatus === 'Not Invoiced')) return 6;
  if (live.every((b) => b.invoiceStatus === 'Paid')) return 9;
  return 8;
}

function HotelWorkflow() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const { userId } = useSession();
  const params = useLocalSearchParams<{ programme?: string }>();
  const groups = ['p-elp', 'p-afl', 'p-gbs', 'p-smp'].filter((id) => db.hotelBookings.some((b) => b.programmeId === id));
  const [pid, setPid] = useState(params.programme && groups.includes(params.programme) ? params.programme : 'p-elp');
  const p = getProgramme(db, pid)!;
  const bookings = db.hotelBookings.filter((b) => b.programmeId === pid && b.status !== 'Checked Out');
  const hotel = getHotel(db, bookings[0]?.hotelId);
  const current = hotelCurrent(bookings);
  const confirmed = bookings.filter((b) => ['Confirmed', 'Checked In', 'Amended'].includes(b.status)).length;
  const withNumbers = bookings.filter((b) => b.confirmationNumber).length;
  const amended = bookings.filter((b) => b.status === 'Amended' || b.specialRequests).length;
  const invoiced = bookings.filter((b) => b.invoiceStatus !== 'Not Invoiced').length;
  const cost = bookings.reduce((s, b) => s + b.cost, 0);
  const line = db.budgetLines.find((l) => l.programmeId === pid && l.category === 'Hotel');
  const types = [...new Set(bookings.map((b) => b.roomType))];
  const fac = bookings.filter((b) => b.guest.kind === 'faculty').length;
  const nights = bookings.reduce((s, b) => s + diffDays(b.checkOut, b.checkIn), 0);
  const nextDeadline = bookings.filter((b) => ['Requested', 'Provisional'].includes(b.status)).map((b) => b.cancellationDeadline).sort()[0];
  const roomingDoc = pid === 'p-elp' ? byId(db.documents, 'd-rooming-list') : undefined;

  const metas = [
    hotel ? `${hotel.stars}★ · ${hotel.distanceToVenue}` : undefined,
    `${types.length} room type${types.length > 1 ? 's' : ''} · ${nights} nights`,
    `${bookings.length} guests · ${fac} faculty`,
    roomingDoc ? `${roomingDoc.title.replace('ELP ', '')}` : 'Auto-generated',
    `${confirmed}/${bookings.length} confirmed`,
    `${withNumbers}/${bookings.length} recorded`,
    amended ? `${amended} change${amended > 1 ? 's' : ''} / requests` : 'No changes',
    `${invoiced}/${bookings.length} invoiced`,
    line ? `${money(cost)} vs ${money(line.budget)} budget` : money(cost),
  ];

  const steps: TimelineStep[] = HOTEL_STEPS.map((s, i) => {
    let state = stateFor(i, current, current >= 9);
    let detail = s.detail;
    if (i === 4 && current === 4 && nextDeadline && diffDays(nextDeadline, DEMO_TODAY) <= 7) {
      state = 'at_risk';
      detail = `Provisional block releases on ${formatDate(nextDeadline, { year: false })} — confirm or lose the rooms.`;
    }
    return { key: s.title, title: s.title, detail, meta: metas[i], state };
  });

  const nextAction = current === 4 ? 'Confirm bookings' : current === 6 ? 'Record invoice' : current === 8 ? 'Reconcile & pay' : undefined;
  const advance = () => {
    if (current === 4) {
      bookings.filter((b) => ['Requested', 'Provisional'].includes(b.status)).forEach((b, i) => actions.setBookingStatus(b.id, 'Confirmed', b.confirmationNumber ?? `${hotel?.name.slice(0, 2).toUpperCase() ?? 'HB'}-${30100 + i * 7}`));
      actions.log(pid, 'hotel_confirmed', `confirmed the room block at ${hotel?.name}`, userId);
      toast.show({ message: 'Bookings confirmed', detail: 'Confirmation numbers recorded', icon: 'bed-double' });
    } else if (current === 6) {
      bookings.forEach((b) => actions.update('hotelBookings', b.id, { invoiceStatus: 'Invoice Received' }));
      actions.log(pid, 'invoice_received', `received the hotel invoice from ${hotel?.name} (${money(cost)})`, userId);
      toast.show({ message: 'Invoice recorded', detail: money(cost), icon: 'receipt' });
    } else if (current === 8) {
      bookings.forEach((b) => actions.update('hotelBookings', b.id, { invoiceStatus: 'Paid' }));
      toast.show({ message: 'Hotel cost reconciled', detail: line ? `${money(line.budget - cost)} under budget` : undefined });
    }
  };

  return (
    <>
      <ChipRow>
        {groups.map((id) => (
          <Chip key={id} label={getProgramme(db, id)?.shortName ?? id} selected={id === pid} onPress={() => setPid(id)} />
        ))}
      </ChipRow>
      <ProgressHeader title={hotel?.name ?? 'Hotel'} subtitle={`${p.name} · ${hotel?.city ?? ''}`} done={Math.min(current, HOTEL_STEPS.length)} total={HOTEL_STEPS.length} />
      {line ? (
        <Card padding="md" style={{ marginTop: 10, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="footnote" tone="secondary">
              Hotel cost vs budget
            </Text>
            <Text variant="footnote" weight="semibold" tabular>
              {money(cost)} / {money(line.budget)}
            </Text>
          </View>
          <ProgressBar value={(cost / Math.max(1, line.budget)) * 100} color={cost > line.budget ? colors.danger : colors.success} />
        </Card>
      ) : null}
      <Section title="Steps">
        <Card padding="md">
          <Timeline steps={steps} />
        </Card>
      </Section>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Button title="Rooming list" variant="secondary" icon="list" onPress={() => router.push(`/rooming/${pid}`)} style={{ flex: 1 }} />
        {nextAction ? <Button title={nextAction} icon="arrow-right" onPress={advance} style={{ flex: 1 }} /> : <Button title="New booking" icon="plus" onPress={() => router.push(`/hotel-booking/new?programme=${pid}`)} style={{ flex: 1 }} />}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 18, alignItems: 'flex-start' }}>
        <Icon name="info" size={15} tone="tertiary" />
        <Text variant="footnote" tone="tertiary" style={{ flex: 1 }}>
          Booking status feeds the Hotel dimension of programme readiness. {personName(db, 's-sofia')} owns hotel bookings for this programme.
        </Text>
      </View>
    </>
  );
}
