import { router } from 'expo-router';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { Avatar, Icon, StatusPill, Text, Touchable, type TimelineStep } from '@/components';
import type { DB } from '@/data/mock';
import type { FlightSegment, HotelBooking, ID, SeatingLayout, TravelItinerary } from '@/data/models';
import { personHue, personName } from '@/data/selectors';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { DEMO_TODAY, diffDays, formatDate, MONTHS_SHORT, parseDate } from '@/utils/dates';

// ─── Shared logic ─────────────────────────────────────────────────────────────

export const READY_TRAVEL = ['Booked', 'Ticketed', 'Completed'];
export const PENDING_BOOKING = ['Requested', 'Provisional', 'Amended'];

export function nights(b: { checkIn: string; checkOut: string }) {
  return Math.max(0, diffDays(b.checkOut, b.checkIn));
}

/** 11–16 Apr · 5 nights */
export function stayLabel(b: { checkIn: string; checkOut: string }) {
  const a = parseDate(b.checkIn);
  const c = parseDate(b.checkOut);
  const range = a.m === c.m ? `${a.day}–${c.day} ${MONTHS_SHORT[a.m - 1]}` : `${a.day} ${MONTHS_SHORT[a.m - 1]} – ${c.day} ${MONTHS_SHORT[c.m - 1]}`;
  const n = nights(b);
  return `${range} · ${n} night${n === 1 ? '' : 's'}`;
}

export function guestKindLabel(kind: 'learner' | 'faculty' | 'staff') {
  return kind === 'learner' ? 'Participant' : kind === 'faculty' ? 'Faculty' : 'Staff';
}

export function profileRoute(t: { kind: 'learner' | 'faculty' | 'staff'; id: ID }) {
  return t.kind === 'learner' ? `/learner/${t.id}` : t.kind === 'faculty' ? `/faculty/${t.id}` : `/person/${t.id}`;
}

export function routeSummary(t: TravelItinerary) {
  if (!t.segments.length) return t.transfers.length ? 'Ground transfer only' : 'No flights booked yet';
  const out = t.segments[0];
  return `${out.from} → ${out.to} · ${formatDate(out.date, { year: false })}`;
}

export function daysUntil(d: string) {
  return diffDays(d, DEMO_TODAY);
}

/** Workflow C — hotel booking lifecycle, derived from a booking's state. */
export function hotelWorkflowSteps(b: HotelBooking): TimelineStep[] {
  const confirmed = ['Confirmed', 'Checked In', 'Checked Out', 'Amended'].includes(b.status);
  const invoiced = b.invoiceStatus !== 'Not Invoiced';
  const reconciled = b.invoiceStatus === 'Paid';
  const cancelled = b.status === 'Cancelled';
  const steps: { key: string; title: string; done: boolean; detail?: string }[] = [
    { key: 'select', title: 'Select hotel', done: true },
    { key: 'req', title: 'Define requirements', done: true },
    { key: 'guests', title: 'Add guests', done: true },
    { key: 'rooming', title: 'Generate rooming list', done: true },
    { key: 'confirm', title: 'Confirm booking', done: confirmed },
    { key: 'number', title: 'Record confirmation number', done: !!b.confirmationNumber, detail: b.confirmationNumber },
    { key: 'monitor', title: 'Monitor changes', done: invoiced || b.status === 'Checked Out', detail: b.status === 'Amended' ? 'Booking amended' : undefined },
    { key: 'invoice', title: 'Receive invoice', done: invoiced, detail: invoiced ? b.invoiceStatus : undefined },
    { key: 'reconcile', title: 'Reconcile cost', done: reconciled },
  ];
  const currentIdx = steps.findIndex((s) => !s.done);
  return steps.map((s, i) => ({
    key: s.key,
    title: s.title,
    detail: s.detail,
    state: cancelled && i >= 4 ? 'skipped' : s.done ? 'done' : i === currentIdx ? (s.key === 'confirm' && daysUntil(b.cancellationDeadline) <= 7 ? 'at_risk' : 'current') : 'upcoming',
  }));
}

export function travellerLabel(db: DB, t: { kind: 'learner' | 'faculty' | 'staff'; id: ID }) {
  return personName(db, t.id);
}

// ─── Person cell ──────────────────────────────────────────────────────────────

export function PersonCell({ db, person, size = 34 }: { db: DB; person: { kind: 'learner' | 'faculty' | 'staff'; id: ID }; size?: number }) {
  return <Avatar name={personName(db, person.id)} hue={personHue(db, person.id)} size={size} />;
}

export function KindBadge({ kind }: { kind: 'learner' | 'faculty' | 'staff' }) {
  return <StatusPill label={guestKindLabel(kind)} tone={kind === 'faculty' ? 'violet' : kind === 'staff' ? 'neutral' : 'accent'} dot={false} />;
}

// ─── Boarding-pass flight card ────────────────────────────────────────────────

export function FlightCard({ segment, travellerName }: { segment: FlightSegment; travellerName?: string }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const nextDay = segment.arriveDate !== segment.date;
  return (
    <View style={s.pass} accessibilityLabel={`${segment.carrier} ${segment.flightNumber} from ${segment.fromCity} to ${segment.toCity}, departs ${segment.depart} on ${formatDate(segment.date)}`}>
      <View style={s.passTop}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <View style={[s.carrier, { backgroundColor: colors.accentSoft }]}>
            <Icon name="plane" size={15} tone="accent" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="headline" numberOfLines={1}>
              {segment.carrier}
            </Text>
            <Text variant="footnote" tone="secondary">
              {segment.flightNumber} · {segment.cabin}
            </Text>
          </View>
        </View>
        <Text variant="footnote" tone="secondary">
          {formatDate(segment.date, { weekday: true, year: false })}
        </Text>
      </View>
      <View style={s.route}>
        <View style={{ flex: 1 }}>
          <Text style={s.iata} weight="bold">
            {segment.from}
          </Text>
          <Text variant="footnote" tone="secondary" numberOfLines={1}>
            {segment.fromCity}
          </Text>
          <Text variant="headline" tabular style={{ marginTop: 4 }}>
            {segment.depart}
          </Text>
        </View>
        <View style={s.path}>
          <View style={[s.dash, { borderColor: colors.borderStrong }]} />
          <View style={[s.planeDot, { backgroundColor: colors.surface }]}>
            <Icon name="plane" size={16} tone="accent" />
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={s.iata} weight="bold">
            {segment.to}
          </Text>
          <Text variant="footnote" tone="secondary" numberOfLines={1}>
            {segment.toCity}
          </Text>
          <Text variant="headline" tabular style={{ marginTop: 4 }}>
            {segment.arrive}
            {nextDay ? (
              <Text variant="caption" tone="warning">
                {' '}+1
              </Text>
            ) : null}
          </Text>
        </View>
      </View>
      <View style={s.tear}>
        <View style={[s.notch, { left: -9, backgroundColor: colors.background }]} />
        <View style={[s.tearLine, { borderColor: colors.border }]} />
        <View style={[s.notch, { right: -9, backgroundColor: colors.background }]} />
      </View>
      <View style={s.passBottom}>
        <PassField label="Passenger" value={travellerName ?? '—'} flex={2} />
        <PassField label="Seat" value={segment.seat ?? 'TBC'} />
        <PassField label="PNR" value={segment.pnr ?? '—'} />
      </View>
    </View>
  );
}

function PassField({ label, value, flex = 1 }: { label: string; value: string; flex?: number }) {
  return (
    <View style={{ flex, gap: 1 }}>
      <Text variant="caption" tone="tertiary">
        {label.toUpperCase()}
      </Text>
      <Text variant="callout" weight="semibold" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ─── Seating layout diagrams ──────────────────────────────────────────────────

/** Simple top-down seating diagrams so planners can see the room set-up at a glance. */
export function SeatingDiagram({ layout, height = 150 }: { layout: SeatingLayout; height?: number }) {
  const { colors } = useTheme();
  const table = colors.surfaceAlt;
  const tableStroke = colors.borderStrong;
  const seat = colors.accent;
  const W = 300;
  const H = 170;
  const seats: { x: number; y: number }[] = [];
  const tables: React.ReactNode[] = [];
  const screen = <Rect key="screen" x={90} y={8} width={120} height={6} rx={3} fill={colors.textTertiary} />;

  if (layout === 'Classroom') {
    for (let r = 0; r < 4; r++)
      for (let c = 0; c < 2; c++) {
        const x = 40 + c * 120;
        const y = 40 + r * 32;
        tables.push(<Rect key={`t${r}${c}`} x={x} y={y} width={100} height={12} rx={3} fill={table} stroke={tableStroke} strokeWidth={1} />);
        for (let k = 0; k < 4; k++) seats.push({ x: x + 14 + k * 24, y: y + 22 });
      }
  } else if (layout === 'Theatre') {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++) seats.push({ x: 42 + c * 24 + (r % 2) * 6, y: 40 + r * 26 });
  } else if (layout === 'U-Shape') {
    tables.push(<Path key="u" d="M70 40 H230 V150 H200 V70 H100 V150 H70 Z" fill={table} stroke={tableStroke} strokeWidth={1} />);
    for (let k = 0; k < 6; k++) seats.push({ x: 82 + k * 27, y: 30 });
    for (let k = 0; k < 4; k++) {
      seats.push({ x: 58, y: 56 + k * 26 });
      seats.push({ x: 242, y: 56 + k * 26 });
    }
  } else if (layout === 'Boardroom') {
    tables.push(<Rect key="b" x={70} y={62} width={160} height={52} rx={10} fill={table} stroke={tableStroke} strokeWidth={1} />);
    for (let k = 0; k < 6; k++) {
      seats.push({ x: 84 + k * 26, y: 50 });
      seats.push({ x: 84 + k * 26, y: 126 });
    }
    seats.push({ x: 56, y: 88 }, { x: 244, y: 88 });
  } else {
    // Cabaret (open crescent facing the screen) and Banquet (full rounds)
    const centres = [
      { x: 70, y: 62 },
      { x: 150, y: 62 },
      { x: 230, y: 62 },
      { x: 70, y: 132 },
      { x: 150, y: 132 },
      { x: 230, y: 132 },
    ];
    centres.forEach((c, i) => {
      tables.push(<Circle key={`r${i}`} cx={c.x} cy={c.y} r={17} fill={table} stroke={tableStroke} strokeWidth={1} />);
      const count = layout === 'Banquet' ? 8 : 6;
      for (let k = 0; k < count; k++) {
        // Cabaret leaves the side facing the screen (top) open.
        const start = layout === 'Banquet' ? 0 : -Math.PI / 6;
        const span = layout === 'Banquet' ? Math.PI * 2 : (Math.PI * 4) / 3;
        const a = start + (span / (layout === 'Banquet' ? count : count - 1)) * k;
        seats.push({ x: c.x + Math.cos(a) * 27, y: c.y + Math.sin(a) * 27 });
      }
    });
  }

  return (
    <View style={{ height, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`${layout} seating diagram`}>
      <Svg width="100%" height={height} viewBox={`0 0 ${W} ${H}`}>
        {layout !== 'Banquet' ? screen : null}
        {layout !== 'Banquet' ? <Line x1={150} y1={18} x2={150} y2={22} stroke={colors.border} /> : null}
        {tables}
        {seats.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4.6} fill={seat} opacity={0.85} />
        ))}
      </Svg>
    </View>
  );
}

// ─── Stat chip row (compact KPIs) ─────────────────────────────────────────────

export function MiniStat({ label, value, tone, onPress }: { label: string; value: string; tone?: 'danger' | 'warning' | 'success' | 'accent'; onPress?: () => void }) {
  const s = useStyles(styles);
  const body = (
    <>
      <Text variant="metricSm" tone={tone ?? 'primary'} tabular numberOfLines={1}>
        {value}
      </Text>
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </>
  );
  return onPress ? (
    <Touchable onPress={onPress} feedback="scale" style={s.mini} accessibilityLabel={`${value} ${label}`}>
      {body}
    </Touchable>
  ) : (
    <View style={s.mini}>{body}</View>
  );
}

/** Organisation monogram source: drop a leading “The” so initials read well. */
export function monoName(name: string) {
  return name.replace(/^The\s+/i, '');
}

export function goBackOr(fallback: string) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}

const styles = makeStyles((t) => ({
  pass: { backgroundColor: t.colors.surface, borderRadius: t.radii.lg, borderWidth: t.hairline, borderColor: t.colors.border, overflow: 'hidden' },
  passTop: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 14 },
  carrier: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  route: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  iata: { fontSize: 30, lineHeight: 34, letterSpacing: -0.6, color: t.colors.text },
  path: { width: 70, alignItems: 'center', justifyContent: 'center' },
  dash: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderStyle: 'dashed' },
  planeDot: { paddingHorizontal: 4 },
  tear: { height: 18, justifyContent: 'center' },
  tearLine: { marginHorizontal: 14, borderTopWidth: 1.5, borderStyle: 'dashed' },
  notch: { position: 'absolute', width: 18, height: 18, borderRadius: 9 },
  passBottom: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 14, paddingTop: 2 },
  mini: { flex: 1, backgroundColor: t.colors.surface, borderRadius: t.radii.lg, paddingVertical: 12, paddingHorizontal: 10, gap: 2, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
}));
