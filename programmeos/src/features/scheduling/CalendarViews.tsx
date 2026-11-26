import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, EmptyState, Icon, ListGroup, MonthCalendar, StatusPill, Text, Touchable } from '@/components';
import type { DB } from '@/data/mock';
import type { TimeZoneId } from '@/data/models';
import { conflictsForSession, facultyName, getFaculty, getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { addDays, DEMO_NOW, DEMO_TODAY, formatDateLong, minutesOf, monthMatrix, parseDate, relativeDay, splitDateTime, startOfMonth, startOfWeek, TIMEZONES, WEEKDAYS_SHORT, weekday } from '@/utils/dates';

import { DELIVERY_ICON } from '../shared/helpers';
import { layoutLanes, occurrencesOn, type CalendarFilter, type Occurrence, type TzMode } from './occurrences';

export type ViewProps = { filter: CalendarFilter; tzMode: TzMode; viewerTz: TimeZoneId; cursor: string; setCursor: (d: string) => void };

const hueOf = (db: DB, programmeId: string) => getProgramme(db, programmeId)?.accentHue ?? 220;

// ─── Occurrence row (agenda lists) ────────────────────────────────────────────

export function OccurrenceRow({ o, viewerTz, tzMode }: { o: Occurrence; viewerTz: TimeZoneId; tzMode: TzMode }) {
  const s = useStyles(styles);
  const db = useDB();
  const { colors } = useTheme();
  const p = getProgramme(db, o.session.programmeId);
  const conflict = conflictsForSession(db, o.session.id).length > 0;
  const other = tzMode === 'viewer' ? (o.session.timeZone !== viewerTz ? `${o.session.start} ${TIMEZONES[o.session.timeZone].abbr} local` : null) : o.session.timeZone !== viewerTz ? 'Tap for your time' : null;
  return (
    <Touchable onPress={() => router.push(`/session/${o.session.id}`)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={s.occ} hitSlop={0} accessibilityLabel={`${o.session.title}, ${o.start} ${o.zone}`}>
      <View style={s.timeCol}>
        <Text variant="headline" tabular>
          {o.start}
        </Text>
        <Text variant="caption" tone="tertiary" tabular>
          {o.end === '23:59' ? '→' : o.end} {o.zone}
        </Text>
      </View>
      <View style={[s.bar, { backgroundColor: `hsl(${p?.accentHue ?? 220}, 62%, 58%)` }]} />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Text variant="bodyStrong" numberOfLines={2}>
          {o.session.title}
        </Text>
        <View style={s.meta}>
          <Icon name={DELIVERY_ICON[o.session.deliveryMode]} size={12} tone="tertiary" />
          <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
            {p?.shortName} · {o.session.deliveryMode === 'Virtual' ? 'Zoom' : (o.session.roomName ?? o.session.location ?? o.session.deliveryMode)}
          </Text>
          {o.session.recurrence === 'Weekly' ? <Icon name="repeat" size={12} tone="tertiary" /> : null}
        </View>
        <Text variant="footnote" tone="tertiary" numberOfLines={1}>
          {o.session.facultyIds.map((id) => facultyName(getFaculty(db, id))).join(', ')}
          {o.dayTotal > 1 ? ` · Day ${o.dayIndex} of ${o.dayTotal}` : ''}
          {other ? ` · ${other}` : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        {conflict ? <StatusPill label="Conflict" tone="danger" icon="calendar-x" /> : null}
        {o.session.status === 'Tentative' ? <StatusPill label="Tentative" /> : null}
        {o.session.status === 'Completed' ? <StatusPill label="Completed" /> : null}
      </View>
    </Touchable>
  );
}

function DayList({ day, list, viewerTz, tzMode, emptyText }: { day: string; list: Occurrence[]; viewerTz: TimeZoneId; tzMode: TzMode; emptyText?: string }) {
  if (!list.length) {
    return (
      <Card variant="alt" padding="md" style={{ alignItems: 'center', gap: 4 }}>
        <Icon name="sun" size={20} tone="tertiary" />
        <Text variant="callout" tone="secondary">
          {emptyText ?? `Nothing scheduled ${relativeDay(day).toLowerCase() === 'today' ? 'today' : `on ${formatDateLong(day, true)}`}`}
        </Text>
      </Card>
    );
  }
  return (
    <ListGroup>
      {list.map((o) => (
        <OccurrenceRow key={o.key} o={o} viewerTz={viewerTz} tzMode={tzMode} />
      ))}
    </ListGroup>
  );
}

// ─── Agenda ───────────────────────────────────────────────────────────────────

export function AgendaView({ filter, tzMode, viewerTz, cursor }: ViewProps) {
  const db = useDB();
  const s = useStyles(styles);
  const days: { day: string; list: Occurrence[] }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(cursor, i);
    const list = occurrencesOn(db, d, filter, tzMode, viewerTz);
    if (list.length) days.push({ day: d, list });
  }
  if (!days.length) {
    return <EmptyState icon="calendar-days" title="No sessions in the next six weeks" message="Try another programme or faculty filter, or move forward in time." />;
  }
  return (
    <View style={{ gap: 18, marginTop: 6 }}>
      {days.map(({ day, list }) => (
        <View key={day} style={{ gap: 8 }}>
          <View style={s.agendaHead}>
            <Text variant="headline" tone={day === DEMO_TODAY ? 'accent' : 'primary'}>
              {day === DEMO_TODAY ? 'Today' : relativeDay(day) === 'Tomorrow' ? 'Tomorrow' : WEEKDAYS_SHORT[weekday(day)]}
            </Text>
            <Text variant="footnote" tone="secondary">
              {formatDateLong(day)}
            </Text>
            <View style={{ flex: 1 }} />
            <Text variant="footnote" tone="tertiary">
              {list.length} session{list.length > 1 ? 's' : ''}
            </Text>
          </View>
          <DayList day={day} list={list} viewerTz={viewerTz} tzMode={tzMode} />
        </View>
      ))}
    </View>
  );
}

// ─── Day (time grid) ──────────────────────────────────────────────────────────

const START_H = 7;
const END_H = 21;
const HOUR = 56;

export function DayView({ filter, tzMode, viewerTz, cursor }: ViewProps) {
  const db = useDB();
  const s = useStyles(styles);
  const { colors } = useTheme();
  const list = occurrencesOn(db, cursor, filter, tzMode, viewerTz);
  const placed = layoutLanes(list);
  const outside = list.filter((o) => minutesOf(o.end) <= START_H * 60 || minutesOf(o.start) >= END_H * 60);
  const nowMin = minutesOf(splitDateTime(DEMO_NOW).time);
  const showNow = cursor === DEMO_TODAY && tzMode === 'viewer' && nowMin >= START_H * 60 && nowMin <= END_H * 60;
  return (
    <View style={{ marginTop: 6 }}>
      {outside.length ? (
        <Text variant="footnote" tone="tertiary" style={{ marginBottom: 8 }}>
          {outside.length} session{outside.length > 1 ? 's' : ''} outside 07:00–21:00 — see Agenda.
        </Text>
      ) : null}
      <View style={[s.grid, { height: (END_H - START_H) * HOUR + 12 }]}>
        {Array.from({ length: END_H - START_H + 1 }).map((_, i) => (
          <View key={i} style={[s.hourRow, { top: i * HOUR }]}>
            <Text variant="caption" tone="tertiary" tabular style={s.hourLabel}>
              {String(START_H + i).padStart(2, '0')}:00
            </Text>
            <View style={[s.hourLine, { backgroundColor: colors.chartGrid }]} />
          </View>
        ))}
        <View style={s.lanes}>
          {placed.map(({ o, lane, count, s: st, e }) => {
            const top = ((Math.max(st, START_H * 60) - START_H * 60) / 60) * HOUR + 6;
            const height = Math.max(30, ((Math.min(e, END_H * 60) - Math.max(st, START_H * 60)) / 60) * HOUR - 3);
            const hue = hueOf(db, o.session.programmeId);
            const p = getProgramme(db, o.session.programmeId);
            const conflict = conflictsForSession(db, o.session.id).length > 0;
            return (
              <Touchable
                key={o.key}
                onPress={() => router.push(`/session/${o.session.id}`)}
                feedback="opacity"
                accessibilityLabel={`${o.session.title}, ${o.start} to ${o.end}`}
                style={[
                  s.block,
                  {
                    top,
                    height,
                    left: `${(lane / count) * 100}%`,
                    width: `${100 / count}%`,
                    backgroundColor: colors.surface,
                    borderLeftColor: conflict ? colors.danger : `hsl(${hue}, 62%, 58%)`,
                  },
                ]}>
                <View style={[StyleSheetFill, { backgroundColor: `hsla(${hue}, 70%, 60%, 0.12)`, borderRadius: 8 }]} />
                <Text variant="footnote" weight="semibold" numberOfLines={height > 50 ? 2 : 1}>
                  {o.session.title}
                </Text>
                {height > 44 ? (
                  <Text variant="caption" tone="secondary" numberOfLines={1}>
                    {o.start}–{o.end === '23:59' ? '…' : o.end} · {p?.shortName}
                    {conflict ? ' · Conflict' : ''}
                  </Text>
                ) : null}
              </Touchable>
            );
          })}
        </View>
        {!list.length ? (
          <View style={s.emptyDay} pointerEvents="none">
            <Text variant="callout" tone="secondary">
              No sessions on this day
            </Text>
          </View>
        ) : null}
        {showNow ? (
          <View style={[s.now, { top: ((nowMin - START_H * 60) / 60) * HOUR + 6 }]} pointerEvents="none">
            <View style={[s.nowDot, { backgroundColor: colors.danger }]} />
            <View style={[s.nowLine, { backgroundColor: colors.danger }]} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const StyleSheetFill = { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 };

// ─── Week (compact 7-column grid) ─────────────────────────────────────────────

export function WeekView({ filter, tzMode, viewerTz, cursor, setCursor }: ViewProps) {
  const db = useDB();
  const s = useStyles(styles);
  const { colors } = useTheme();
  const weekStart = startOfWeek(cursor, 1);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const byDay = days.map((d) => occurrencesOn(db, d, filter, tzMode, viewerTz));
  return (
    <View style={{ marginTop: 6, gap: 16 }}>
      <View style={s.week}>
        {days.map((d, i) => {
          const selected = d === cursor;
          const today = d === DEMO_TODAY;
          const list = byDay[i];
          return (
            <Touchable key={d} onPress={() => setCursor(d)} feedback="opacity" style={[s.weekCol, selected && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]} accessibilityLabel={`${formatDateLong(d, true)}, ${list.length} sessions`} accessibilityState={{ selected }} hitSlop={0}>
              <Text variant="caption" tone={today ? 'accent' : 'tertiary'} align="center">
                {WEEKDAYS_SHORT[weekday(d)].slice(0, 1)}
              </Text>
              <View style={[s.weekNum, today && { backgroundColor: colors.primary }]}>
                <Text variant="headline" tabular align="center" color={today ? colors.textOnAccent : undefined}>
                  {parseDate(d).day}
                </Text>
              </View>
              <View style={{ gap: 3, alignSelf: 'stretch' }}>
                {list.slice(0, 4).map((o) => {
                  const hue = hueOf(db, o.session.programmeId);
                  return (
                    <View key={o.key} style={[s.chip, { backgroundColor: `hsla(${hue}, 70%, 60%, 0.16)`, borderLeftColor: `hsl(${hue}, 62%, 56%)` }]}>
                      <Text variant="caption" tabular numberOfLines={1} style={{ fontSize: 10 }}>
                        {o.start}
                      </Text>
                      <Text variant="caption" tone="secondary" numberOfLines={1} style={{ fontSize: 9.5 }}>
                        {getProgramme(db, o.session.programmeId)?.shortName}
                      </Text>
                    </View>
                  );
                })}
                {list.length > 4 ? (
                  <Text variant="caption" tone="tertiary" align="center" style={{ fontSize: 10 }}>
                    +{list.length - 4}
                  </Text>
                ) : null}
              </View>
            </Touchable>
          );
        })}
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="headline">{cursor === DEMO_TODAY ? 'Today' : formatDateLong(cursor, true)}</Text>
        <DayList day={cursor} list={byDay[days.indexOf(cursor)] ?? occurrencesOn(db, cursor, filter, tzMode, viewerTz)} viewerTz={viewerTz} tzMode={tzMode} />
      </View>
    </View>
  );
}

// ─── Month ────────────────────────────────────────────────────────────────────

export function MonthView({ filter, tzMode, viewerTz, cursor, setCursor }: ViewProps) {
  const db = useDB();
  const month = startOfMonth(cursor);
  const marks: Record<string, string[]> = {};
  for (const row of monthMatrix(month))
    for (const d of row) {
      const list = occurrencesOn(db, d, filter, tzMode, viewerTz);
      if (list.length) marks[d] = [...new Set(list.map((o) => `hsl(${hueOf(db, o.session.programmeId)}, 62%, 56%)`))];
    }
  const list = occurrencesOn(db, cursor, filter, tzMode, viewerTz);
  return (
    <View style={{ marginTop: 6, gap: 16 }}>
      <Card padding="md">
        <MonthCalendar
          month={month}
          onMonthChange={(m) => setCursor(m)}
          selected={cursor}
          onSelect={setCursor}
          marks={marks}
        />
      </Card>
      <View style={{ gap: 8 }}>
        <Text variant="headline">{cursor === DEMO_TODAY ? 'Today' : formatDateLong(cursor, true)}</Text>
        <DayList day={cursor} list={list} viewerTz={viewerTz} tzMode={tzMode} />
      </View>
    </View>
  );
}

const styles = makeStyles((t) => ({
  occ: { flexDirection: 'row', gap: 12, paddingHorizontal: t.spacing.lg, paddingVertical: 12, alignItems: 'center' },
  timeCol: { width: 58 },
  bar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  agendaHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  grid: { position: 'relative', backgroundColor: t.colors.surface, borderRadius: t.radii.lg, overflow: 'hidden' },
  hourRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', height: 12, marginTop: 0 },
  hourLabel: { width: 48, paddingLeft: 10 },
  hourLine: { flex: 1, height: 1 },
  lanes: { position: 'absolute', left: 52, right: 8, top: 0, bottom: 0 },
  block: { position: 'absolute', borderRadius: 8, borderLeftWidth: 3, paddingHorizontal: 7, paddingVertical: 4, overflow: 'hidden', borderWidth: 0, marginRight: 2 },
  now: { position: 'absolute', left: 46, right: 0, flexDirection: 'row', alignItems: 'center' },
  nowDot: { width: 8, height: 8, borderRadius: 4 },
  nowLine: { flex: 1, height: 1.5 },
  emptyDay: { position: 'absolute', left: 52, right: 0, top: 120, alignItems: 'center' },
  week: { flexDirection: 'row', gap: 4 },
  weekCol: { flex: 1, minHeight: 150, alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 2, borderRadius: 12, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: 'transparent' },
  weekNum: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  chip: { borderRadius: 5, borderLeftWidth: 2, paddingHorizontal: 3, paddingVertical: 2 },
}));
