import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, DateField, EmptyState, Icon, ListGroup, ListRow, Legend, MonthCalendar, Screen, Section, SelectField, Sheet, Text, useDialog, useToast } from '@/components';
import { facultyName, getFaculty } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { addDays, DEMO_TODAY, formatDate, formatDateLong, formatRange, startOfMonth } from '@/utils/dates';

import { SessionRow } from '../shared/Rows';

const REASONS = ['Teaching commitments', 'Conference', 'Annual leave', 'Personal', 'Consulting engagement'] as const;

export default function FacultyAvailabilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { colors } = useTheme();
  const f = getFaculty(db, id);
  const sessions = useMemo(() => db.sessions.filter((s) => f && s.facultyIds.includes(f.id) && s.status !== 'Cancelled'), [db.sessions, f]);
  const firstUpcoming = sessions.filter((s) => s.date >= DEMO_TODAY).sort((a, b) => a.date.localeCompare(b.date))[0];
  const [month, setMonth] = useState(startOfMonth(firstUpcoming?.date ?? DEMO_TODAY));
  const [selected, setSelected] = useState(firstUpcoming?.date ?? DEMO_TODAY);
  const [blockOpen, setBlockOpen] = useState(false);
  const [from, setFrom] = useState(addDays(DEMO_TODAY, 14));
  const [to, setTo] = useState(addDays(DEMO_TODAY, 16));
  const [reason, setReason] = useState<(typeof REASONS)[number]>('Conference');

  if (!f) {
    return (
      <Screen title="Availability">
        <EmptyState icon="user-x" title="Faculty member not found" />
      </Screen>
    );
  }

  const marks: Record<string, string[]> = {};
  const add = (d: string, c: string) => {
    marks[d] = [...(marks[d] ?? []), c];
  };
  sessions.forEach((s) => {
    for (let d = s.date; d <= s.endDate; d = addDays(d, 1)) add(d, s.status === 'Tentative' ? colors.warning : colors.accent);
  });
  f.unavailable.forEach((u) => {
    for (let d = u.from; d <= u.to; d = addDays(d, 1)) add(d, colors.danger);
  });

  const daySessions = sessions.filter((s) => s.date <= selected && s.endDate >= selected).sort((a, b) => a.start.localeCompare(b.start));
  const dayBlocks = f.unavailable.filter((u) => u.from <= selected && u.to >= selected);
  const name = facultyName(f);

  const saveBlock = () => {
    if (to < from) {
      toast.show({ message: 'End date is before start date', tone: 'danger' });
      return;
    }
    const clashes = sessions.filter((s) => s.date <= to && s.endDate >= from);
    actions.update('faculty', f.id, (prev) => ({ ...prev, unavailable: [...prev.unavailable, { from, to, reason }] }));
    setBlockOpen(false);
    toast.show({ message: 'Dates blocked', detail: clashes.length ? `${clashes.length} scheduled session${clashes.length === 1 ? '' : 's'} now conflict — Faculty Operations notified.` : `${formatRange(from, to)} · ${reason}`, tone: clashes.length ? 'danger' : 'success', icon: clashes.length ? 'triangle-alert' : 'calendar-x' });
    if (clashes.length) actions.notify({ category: 'Faculty', title: 'Availability change creates conflicts', body: `${name} blocked ${formatRange(from, to)} (${reason}).`, audience: 'staff', route: `/faculty/${f.id}/availability` });
  };

  const removeBlock = async (index: number) => {
    const u = f.unavailable[index];
    const { confirmed } = await dialog.confirm({ title: 'Remove blocked dates?', message: `${formatRange(u.from, u.to)} · ${u.reason}`, confirmLabel: 'Remove', destructive: true, icon: 'trash-2' });
    if (!confirmed) return;
    actions.update('faculty', f.id, (prev) => ({ ...prev, unavailable: prev.unavailable.filter((_, i) => i !== index) }));
    toast.show({ message: 'Dates unblocked', detail: formatRange(u.from, u.to) });
  };

  return (
    <Screen title="Availability" eyebrow={name} subtitle={`${f.availability} · ${f.utilisation}% utilised this quarter`} footer={<Button title="Block dates" icon="calendar-x" variant="secondary" onPress={() => setBlockOpen(true)} style={{ flex: 1 }} />}>
      <Card>
        <MonthCalendar month={month} onMonthChange={setMonth} selected={selected} onSelect={setSelected} marks={marks} />
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: colors.separator }}>
          <Legend
            items={[
              { label: 'Teaching', color: colors.accent },
              { label: 'Tentative', color: colors.warning },
              { label: 'Unavailable', color: colors.danger },
            ]}
          />
        </View>
      </Card>

      <Section title={formatDateLong(selected, true)}>
        {dayBlocks.map((u) => (
          <Card key={`${u.from}-${u.reason}`} variant="outline" style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="calendar-x" size={18} tone="danger" />
            <View style={{ flex: 1 }}>
              <Text variant="headline">Unavailable</Text>
              <Text variant="subhead" tone="secondary">
                {u.reason} · {formatRange(u.from, u.to)}
              </Text>
            </View>
          </Card>
        ))}
        {daySessions.length ? (
          <ListGroup>
            {daySessions.map((s) => (
              <SessionRow key={s.id} session={s} viewerTz={f.timeZone} />
            ))}
          </ListGroup>
        ) : !dayBlocks.length ? (
          <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="circle-check" size={18} tone="success" />
            <Text tone="secondary" style={{ flex: 1 }}>
              Available — no sessions or blocked dates.
            </Text>
          </Card>
        ) : null}
      </Section>

      <Section title="Blocked dates">
        {f.unavailable.length ? (
          <ListGroup>
            {f.unavailable.map((u, i) => (
              <ListRow key={`${u.from}-${i}`} icon="calendar-x" iconTone="danger" title={formatRange(u.from, u.to)} subtitle={u.reason} onPress={() => removeBlock(i)} accessibilityLabel={`Remove ${formatRange(u.from, u.to)}`} trailing={<Icon name="trash-2" size={16} tone="tertiary" />} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="calendar-check" title="No blocked dates" message="Block dates to stop this faculty member being scheduled." compact />
        )}
      </Section>

      <Button title="Assign to a session" variant="plain" icon="user-plus" onPress={() => router.push(`/faculty/assign?faculty=${f.id}`)} style={{ marginTop: 16, alignSelf: 'center' }} />

      <Sheet visible={blockOpen} onClose={() => setBlockOpen(false)} title="Block dates" subtitle={name} footer={<Button title="Block dates" onPress={saveBlock} style={{ flex: 1 }} />}>
        <View style={{ gap: 14 }}>
          <DateField label="From" value={from} onChange={setFrom} minDate={DEMO_TODAY} />
          <DateField label="To" value={to} onChange={setTo} minDate={from} />
          <SelectField label="Reason" value={reason} onChange={setReason} options={REASONS.map((r) => ({ value: r, label: r }))} icon="info" />
          <Text variant="footnote" tone="tertiary">
            Sessions already scheduled in this window will be flagged as conflicts on {formatDate(DEMO_TODAY)}.
          </Text>
        </View>
      </Sheet>
    </Screen>
  );
}
