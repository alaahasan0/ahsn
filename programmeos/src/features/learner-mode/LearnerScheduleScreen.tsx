import { useState } from 'react';
import { View } from 'react-native';

import { Card, EmptyState, ListGroup, MonthCalendar, Screen, Section, SegmentedControl, Text } from '@/components';
import type { Session } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { diffDays, formatDate, formatDateLong, startOfMonth, startOfWeek, TIMEZONES } from '@/utils/dates';

import { inZone, localNow, PersonaSessionRow } from '../faculty-mode/common';
import { groupByLocalDate, sessionMarks } from '../faculty-mode/FacultyScheduleScreen';
import { useLearnerScope } from './data';

function weekLabel(weekStart: string, today: string) {
  const thisWeek = startOfWeek(today, 1);
  const d = diffDays(weekStart, thisWeek);
  if (d === 0) return 'This week';
  if (d === 7) return 'Next week';
  if (d === -7) return 'Last week';
  return `Week of ${formatDate(weekStart, { year: false })}`;
}

export default function LearnerScheduleScreen() {
  const db = useDB();
  const scope = useLearnerScope();
  const tz = scope.tz;
  const today = localNow(tz).date;
  const [view, setView] = useState<'upcoming' | 'past' | 'month'>('upcoming');
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const list = view === 'past' ? scope.past : scope.upcoming;

  const weeks = new Map<string, Session[]>();
  for (const s of list) {
    const key = startOfWeek(inZone(s, tz).date, 1);
    weeks.set(key, [...(weeks.get(key) ?? []), s]);
  }
  const colorFor = (s: Session) => `hsl(${getProgramme(db, s.programmeId)?.accentHue ?? 220}, 62%, 58%)`;
  const day = groupByLocalDate(scope.sessions, tz).find(([d]) => d === selected)?.[1] ?? [];
  const multiProgramme = new Set(scope.sessions.map((s) => s.programmeId)).size > 1;

  return (
    <Screen
      title="Schedule"
      subtitle={`All times in ${TIMEZONES[tz].label} (${TIMEZONES[tz].abbr})`}
      back={false}
      headerBelow={
        <SegmentedControl
          options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
            { value: 'month', label: 'Month' },
          ]}
          value={view}
          onChange={setView}
        />
      }>
      {view === 'month' ? (
        <>
          <Card padding="md">
            <MonthCalendar month={month} onMonthChange={setMonth} selected={selected} onSelect={setSelected} marks={sessionMarks(scope.sessions, tz, colorFor)} />
          </Card>
          <Section title={formatDateLong(selected, true)}>
            {day.length ? (
              <ListGroup>
                {day.map((s) => (
                  <PersonaSessionRow key={s.id} session={s} tz={tz} route={`/lm/session/${s.id}`} showProgramme={multiProgramme} />
                ))}
              </ListGroup>
            ) : (
              <Card>
                <Text tone="secondary">No sessions on this day.</Text>
              </Card>
            )}
          </Section>
        </>
      ) : weeks.size ? (
        [...weeks.entries()].map(([week, items]) => (
          <Section key={week} title={weekLabel(week, today)}>
            <View style={{ gap: 8 }}>
              <ListGroup>
                {items.map((s) => (
                  <PersonaSessionRow key={s.id} session={s} tz={tz} route={`/lm/session/${s.id}`} showProgramme={multiProgramme} dim={view === 'past'} />
                ))}
              </ListGroup>
            </View>
          </Section>
        ))
      ) : (
        <EmptyState icon="calendar-days" title={view === 'past' ? 'No past sessions' : 'Nothing scheduled'} message={view === 'past' ? 'Sessions you’ve attended will appear here.' : 'New sessions will appear here as soon as they’re scheduled.'} />
      )}
    </Screen>
  );
}
