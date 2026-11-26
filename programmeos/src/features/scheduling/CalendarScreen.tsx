import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Banner, Chip, ChipRow, HeaderActions, Icon, IconButton, Screen, SegmentedControl, SelectSheet, Text, Touchable } from '@/components';
import type { TimeZoneId } from '@/data/models';
import { facultyName, getFaculty, getProgramme, getStaff, scheduleConflicts } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { makeStyles, useStyles } from '@/theme';
import { addDays, addMonths, DEMO_TODAY, formatDate, formatMonthYear, formatRange, startOfWeek, TIMEZONES } from '@/utils/dates';

import { LoadGate, RequireAccess } from '../shared/Widgets';
import { AgendaView, DayView, MonthView, WeekView } from './CalendarViews';
import { matchesFilter, type CalendarFilter, type TzMode } from './occurrences';

type View_ = 'agenda' | 'day' | 'week' | 'month';

/**
 * Scheduling: agenda, day, week and month views over every session, with programme and
 * faculty calendars, time-zone aware display and live conflict detection.
 */
export default function CalendarScreen() {
  const params = useLocalSearchParams<{ programme?: string; faculty?: string; view?: string }>();
  const db = useDB();
  const s = useStyles(styles);
  const { userId, mode } = useSession();
  const viewerTz: TimeZoneId = (mode === 'staff' ? getStaff(db, userId)?.timeZone : undefined) ?? 'Asia/Dubai';
  const [view, setView] = useState<View_>((params.view as View_) ?? 'agenda');
  const [cursor, setCursor] = useState(DEMO_TODAY);
  const [tzMode, setTzMode] = useState<TzMode>('viewer');
  const [filter, setFilter] = useState<CalendarFilter>(params.programme ? { kind: 'programme', id: params.programme } : params.faculty ? { kind: 'faculty', id: params.faculty } : { kind: 'all' });
  const [picker, setPicker] = useState<null | 'programme' | 'faculty'>(null);

  const conflicts = scheduleConflicts(db).filter((c) => matchesFilter(c.a, filter) || matchesFilter(c.b, filter));
  const firstConflict = conflicts[0];

  const step = (dir: 1 | -1) => {
    if (view === 'day') setCursor(addDays(cursor, dir));
    else if (view === 'month') setCursor(addMonths(cursor, dir));
    else setCursor(addDays(cursor, dir * 7));
  };
  const weekStart = startOfWeek(cursor, 1);
  const rangeLabel = view === 'day' ? formatDate(cursor, { weekday: true }) : view === 'week' ? formatRange(weekStart, addDays(weekStart, 6)) : view === 'month' ? formatMonthYear(cursor) : `From ${formatDate(cursor, { year: false })}`;

  const programmesWithSessions = db.programmes.filter((p) => db.sessions.some((x) => x.programmeId === p.id));
  const facultyWithSessions = db.faculty.filter((f) => db.sessions.some((x) => x.facultyIds.includes(f.id)));
  const filterLabel = filter.kind === 'programme' ? getProgramme(db, filter.id)?.shortName : filter.kind === 'faculty' ? facultyName(getFaculty(db, filter.id)) : undefined;
  const props = { filter, tzMode, viewerTz, cursor, setCursor };

  return (
    <Screen
      title="Calendar"
      subtitle={filter.kind === 'programme' ? `${getProgramme(db, filter.id)?.name} calendar` : filter.kind === 'faculty' ? `${filterLabel}’s teaching calendar` : 'All programmes and faculty'}
      headerRight={
        <HeaderActions>
          <IconButton icon="building-2" accessibilityLabel="Resource scheduling" onPress={() => router.push('/calendar/resources')} />
          <IconButton icon="plus" variant="tinted" accessibilityLabel="Schedule a session" onPress={() => router.push(filter.kind === 'programme' ? `/session/new?programme=${filter.id}` : '/session/new')} />
        </HeaderActions>
      }
      headerBelow={
        <>
          <SegmentedControl<View_>
            value={view}
            onChange={setView}
            options={[
              { value: 'agenda', label: 'Agenda' },
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
          <ChipRow>
            <Chip label="All" selected={filter.kind === 'all'} onPress={() => setFilter({ kind: 'all' })} />
            <Chip label={filter.kind === 'programme' ? (filterLabel ?? 'Programme') : 'Programme'} icon="layers" selected={filter.kind === 'programme'} onPress={() => setPicker('programme')} onRemove={filter.kind === 'programme' ? () => setFilter({ kind: 'all' }) : undefined} />
            <Chip label={filter.kind === 'faculty' ? (filterLabel ?? 'Faculty') : 'Faculty'} icon="users" selected={filter.kind === 'faculty'} onPress={() => setPicker('faculty')} onRemove={filter.kind === 'faculty' ? () => setFilter({ kind: 'all' }) : undefined} />
          </ChipRow>
          {view !== 'month' ? (
            <View style={s.nav}>
              <IconButton icon="chevron-left" accessibilityLabel="Previous" onPress={() => step(-1)} variant="filled" size={34} />
              <Text variant="headline" align="center" style={{ flex: 1 }} numberOfLines={1}>
                {rangeLabel}
              </Text>
              <IconButton icon="chevron-right" accessibilityLabel="Next" onPress={() => step(1)} variant="filled" size={34} />
              {cursor !== DEMO_TODAY ? (
                <Touchable onPress={() => setCursor(DEMO_TODAY)} style={s.todayBtn} accessibilityLabel="Jump to today">
                  <Text variant="label" tone="accent" weight="semibold">
                    Today
                  </Text>
                </Touchable>
              ) : null}
            </View>
          ) : null}
          <Touchable onPress={() => setTzMode(tzMode === 'viewer' ? 'local' : 'viewer')} style={s.tz} accessibilityLabel="Toggle time zone display">
            <Icon name="globe" size={14} tone="secondary" />
            <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
              {tzMode === 'viewer' ? `Times in your zone · ${TIMEZONES[viewerTz].abbr} (${TIMEZONES[viewerTz].city})` : 'Times in each session’s local zone'}
            </Text>
            <Text variant="footnote" tone="accent" weight="semibold">
              {tzMode === 'viewer' ? 'Show local' : `Show ${TIMEZONES[viewerTz].abbr}`}
            </Text>
          </Touchable>
        </>
      }>
      <RequireAccess module="calendar">
        {firstConflict ? (
          <Banner
            tone="danger"
            icon="calendar-x"
            title={conflicts.length > 1 ? `${conflicts.length} schedule conflicts` : 'Schedule conflict'}
            message={`${facultyName(getFaculty(db, firstConflict.facultyId))} is booked for “${firstConflict.a.title}” and “${firstConflict.b.title}” at the same time (${formatDate(firstConflict.a.date, { year: false })}).`}
            action="Resolve"
            onAction={() => router.push(`/session/${firstConflict.b.id}`)}
            style={{ marginBottom: 6 }}
          />
        ) : null}
        <LoadGate loadKey="calendar">
          {view === 'agenda' ? <AgendaView {...props} /> : view === 'day' ? <DayView {...props} /> : view === 'week' ? <WeekView {...props} /> : <MonthView {...props} />}
        </LoadGate>
      </RequireAccess>

      <SelectSheet
        visible={picker === 'programme'}
        onClose={() => setPicker(null)}
        title="Programme calendar"
        value={filter.kind === 'programme' ? filter.id : undefined}
        onSelect={(id) => setFilter({ kind: 'programme', id })}
        options={programmesWithSessions.map((p) => ({ value: p.id, label: p.name, detail: `${p.code} · ${db.sessions.filter((x) => x.programmeId === p.id).length} sessions`, leading: <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: `hsl(${p.accentHue}, 62%, 58%)` }} /> }))}
      />
      <SelectSheet
        visible={picker === 'faculty'}
        onClose={() => setPicker(null)}
        title="Faculty calendar"
        value={filter.kind === 'faculty' ? filter.id : undefined}
        onSelect={(id) => setFilter({ kind: 'faculty', id })}
        options={facultyWithSessions.map((f) => ({ value: f.id, label: facultyName(f), detail: `${f.location} · ${TIMEZONES[f.timeZone].abbr}`, leading: <Avatar name={f.name} hue={f.avatarHue} size={30} /> }))}
      />
    </Screen>
  );
}

const styles = makeStyles((t) => ({
  nav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayBtn: { paddingHorizontal: 10, minHeight: 34, justifyContent: 'center', borderRadius: 17, backgroundColor: t.colors.accentSoft },
  tz: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: t.radii.md, backgroundColor: t.colors.surface },
}));
