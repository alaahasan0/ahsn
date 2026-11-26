import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, EmptyState, Legend, ListGroup, ListRow, MonthCalendar, Screen, Section, Text, useDialog, useToast } from '@/components';
import { getProgramme } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { addDays, formatDate, formatDateLong, formatRange, startOfMonth } from '@/utils/dates';

import { localNow } from './common';
import { useFacultyScope } from './data';
import { groupByLocalDate } from './FacultyScheduleScreen';

/** Availability calendar: teaching days, blocked periods, tap a day to block or free it. */
export default function FacultyAvailabilityScreen() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { colors } = useTheme();
  const scope = useFacultyScope();
  const { me } = scope;
  const today = localNow(me.timeZone).date;
  const [month, setMonth] = useState(startOfMonth('2027-04-01'));
  const [selected, setSelected] = useState(today);

  const teaching = groupByLocalDate(scope.sessions, me.timeZone);
  const teachingDays = new Map(teaching);
  const marks: Record<string, string[]> = {};
  for (const [d] of teaching) marks[d] = [colors.accent];
  for (const u of me.unavailable) {
    let d = u.from;
    while (d <= u.to) {
      marks[d] = [...(marks[d] ?? []), colors.danger];
      d = addDays(d, 1);
    }
  }
  const block = me.unavailable.find((u) => u.from <= selected && u.to >= selected);
  const sessionsThatDay = teachingDays.get(selected) ?? [];

  const markUnavailable = async () => {
    const { confirmed, text } = await dialog.confirm({ title: `Block ${formatDate(selected, { weekday: true, year: false })}?`, message: 'Faculty Operations won’t propose sessions on this day.', confirmLabel: 'Mark unavailable', icon: 'calendar-x', tone: 'warning', input: { placeholder: 'Reason (optional, visible to Faculty Operations)' } });
    if (!confirmed) return;
    actions.update('faculty', me.id, (f) => ({ ...f, unavailable: [...f.unavailable, { from: selected, to: selected, reason: text ?? 'Unavailable' }].sort((a, b) => a.from.localeCompare(b.from)) }));
    toast.show({ message: 'Marked unavailable', detail: formatDateLong(selected, true), icon: 'calendar-x', actionLabel: 'Undo', onAction: () => actions.update('faculty', me.id, (f) => ({ ...f, unavailable: f.unavailable.filter((u) => !(u.from === selected && u.to === selected)) })) });
  };

  const freeUp = (from: string, to: string) => {
    actions.update('faculty', me.id, (f) => ({ ...f, unavailable: f.unavailable.filter((u) => !(u.from === from && u.to === to)) }));
    toast.show({ message: 'Dates opened up', detail: formatRange(from, to), icon: 'calendar-check' });
  };

  return (
    <Screen title="Availability" subtitle="Keep your calendar current so we only propose dates that work for you.">
      <Card padding="md" style={{ gap: 12 }}>
        <MonthCalendar month={month} onMonthChange={setMonth} selected={selected} onSelect={setSelected} marks={marks} />
        <Legend
          items={[
            { label: 'Teaching', color: colors.accent },
            { label: 'Unavailable', color: colors.danger },
          ]}
        />
      </Card>

      <Section title={formatDateLong(selected, true)}>
        <Card style={{ gap: 10 }}>
          {sessionsThatDay.length ? (
            sessionsThatDay.map((s) => (
              <Text key={s.id} variant="callout">
                Teaching · {s.title} ({getProgramme(db, s.programmeId)?.shortName})
              </Text>
            ))
          ) : block ? (
            <Text variant="callout">Unavailable · {block.reason}</Text>
          ) : (
            <Text variant="callout" tone="secondary">
              Free — available for new requests.
            </Text>
          )}
          {block ? (
            <Button title="Make available" icon="calendar-check" variant="secondary" size="sm" onPress={() => freeUp(block.from, block.to)} />
          ) : !sessionsThatDay.length ? (
            <Button title="Mark unavailable" icon="calendar-x" variant="tinted" size="sm" onPress={markUnavailable} />
          ) : null}
        </Card>
      </Section>

      <Section title="Blocked periods">
        {me.unavailable.length ? (
          <ListGroup>
            {me.unavailable.map((u) => (
              <ListRow key={`${u.from}-${u.to}`} icon="calendar-x" iconTone="danger" title={formatRange(u.from, u.to)} subtitle={u.reason} trailing={<Button title="Remove" variant="plain" size="sm" onPress={() => freeUp(u.from, u.to)} />} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="calendar-check" title="No blocked dates" message="Tap any day above to mark yourself unavailable." compact />
        )}
      </Section>
      <View style={{ height: 8 }} />
    </Screen>
  );
}
