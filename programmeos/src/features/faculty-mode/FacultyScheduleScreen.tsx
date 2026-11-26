import { useState } from 'react';
import { View } from 'react-native';

import { Card, EmptyState, ListGroup, MonthCalendar, Screen, Section, SegmentedControl, Text } from '@/components';
import type { Session, TimeZoneId } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { addDays, formatDateLong, relativeDay, startOfMonth, TIMEZONES } from '@/utils/dates';

import { inZone, localNow, PersonaSessionRow } from './common';
import { useFacultyScope } from './data';

/** Group sessions by the viewer's local date, expanding multi-day sessions. */
export function groupByLocalDate(list: Session[], tz: TimeZoneId) {
  const map = new Map<string, Session[]>();
  for (const s of list) {
    const z = inZone(s, tz);
    let d = z.date;
    while (d <= z.endDate) {
      map.set(d, [...(map.get(d) ?? []), s]);
      d = addDays(d, 1);
    }
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function sessionMarks(list: Session[], tz: TimeZoneId, colorFor: (s: Session) => string) {
  const marks: Record<string, string[]> = {};
  for (const [date, items] of groupByLocalDate(list, tz)) marks[date] = items.map(colorFor);
  return marks;
}

export default function FacultyScheduleScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const scope = useFacultyScope();
  const tz = scope.me.timeZone;
  const today = localNow(tz).date;
  const [view, setView] = useState<'agenda' | 'month'>('agenda');
  const [month, setMonth] = useState(startOfMonth(scope.upcoming[0]?.date ?? today));
  const [selected, setSelected] = useState(scope.upcoming[0] ? inZone(scope.upcoming[0], tz).date : today);
  const [showPast, setShowPast] = useState(false);

  const colorFor = (s: Session) => `hsl(${getProgramme(db, s.programmeId)?.accentHue ?? 220}, 62%, 58%)`;
  const groups = groupByLocalDate(scope.upcoming, tz);
  const pastGroups = groupByLocalDate(scope.past, tz).reverse();
  const daySessions = groupByLocalDate(scope.sessions, tz).find(([d]) => d === selected)?.[1] ?? [];

  return (
    <Screen
      title="My Schedule"
      subtitle={`Times shown in ${TIMEZONES[tz].label} (${TIMEZONES[tz].abbr})`}
      back={false}
      headerBelow={
        <SegmentedControl
          options={[
            { value: 'agenda', label: 'Agenda' },
            { value: 'month', label: 'Month' },
          ]}
          value={view}
          onChange={setView}
        />
      }>
      {view === 'agenda' ? (
        <>
          {groups.length ? (
            groups.map(([date, items]) => (
              <Section key={date} title={relativeDay(date, today) === 'Today' ? 'Today' : formatDateLong(date, true)} subtitle={relativeDay(date, today) !== 'Today' ? relativeDay(date, today) : undefined}>
                <ListGroup>
                  {items.map((s) => (
                    <PersonaSessionRow key={`${date}-${s.id}`} session={s} tz={tz} route={`/fm/session/${s.id}`} />
                  ))}
                </ListGroup>
              </Section>
            ))
          ) : (
            <EmptyState icon="calendar-days" title="Nothing scheduled" message="Your confirmed sessions will appear here." />
          )}
          <Section title="Past sessions" action={showPast ? 'Hide' : `Show ${scope.past.length}`} onAction={() => setShowPast(!showPast)}>
            {showPast ? (
              pastGroups.length ? (
                pastGroups.map(([date, items]) => (
                  <View key={date} style={{ gap: 6 }}>
                    <Text variant="footnote" tone="tertiary">
                      {formatDateLong(date, true)}
                    </Text>
                    <ListGroup>
                      {items.map((s) => (
                        <PersonaSessionRow key={`${date}-${s.id}`} session={s} tz={tz} route={`/fm/session/${s.id}`} dim />
                      ))}
                    </ListGroup>
                  </View>
                ))
              ) : (
                <Text tone="secondary">No past sessions in ProgrammeOS yet.</Text>
              )
            ) : null}
          </Section>
        </>
      ) : (
        <>
          <Card padding="md">
            <MonthCalendar month={month} onMonthChange={setMonth} selected={selected} onSelect={setSelected} marks={sessionMarks(scope.sessions, tz, colorFor)} />
          </Card>
          <Section title={formatDateLong(selected, true)}>
            {daySessions.length ? (
              <ListGroup>
                {daySessions.map((s) => (
                  <PersonaSessionRow key={s.id} session={s} tz={tz} route={`/fm/session/${s.id}`} />
                ))}
              </ListGroup>
            ) : (
              <Card>
                <Text tone="secondary">No teaching on this day.</Text>
                <Text variant="footnote" tone="tertiary" style={{ marginTop: 4, color: colors.textTertiary }}>
                  Dots mark days with sessions.
                </Text>
              </Card>
            )}
          </Section>
        </>
      )}
    </Screen>
  );
}
