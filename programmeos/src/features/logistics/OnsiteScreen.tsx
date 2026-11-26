import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ActionSheet, Avatar, Banner, Button, Card, Chip, ChipRow, EmptyState, Icon, ListGroup, ListRow, Screen, Section, StatusPill, Text, TextField, Touchable, toneColors, useToast, type Tone } from '@/components';
import type { RunSheetItem } from '@/data/models';
import { getHotel, getProgramme, getStaff, getVenue, personHue, personName, programmePhase } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { addDays, countdown, DEMO_NOW, durationDays, formatDate, splitDateTime } from '@/utils/dates';
import { newId } from '@/utils/format';

const STATUS_TONE: Record<RunSheetItem['status'], Tone> = { Upcoming: 'neutral', 'In Progress': 'accent', Done: 'success', Issue: 'danger' };

type Incident = { id: string; time: string; text: string; author: string; severity: 'Low' | 'Medium' | 'High' };

export default function OnsiteScreen() {
  const { programmeId } = useLocalSearchParams<{ programmeId: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { userId } = useSession();
  const { colors } = useTheme();
  const prog = getProgramme(db, programmeId);
  const items = db.runSheet.filter((r) => r.programmeId === programmeId).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const days = prog ? Array.from({ length: Math.min(durationDays(prog.startDate, prog.endDate), 7) }, (_, i) => addDays(prog.startDate, i)) : [];
  const [day, setDay] = useState(days[0]);
  const [editing, setEditing] = useState<RunSheetItem | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [note, setNote] = useState('');
  const [severity, setSeverity] = useState<Incident['severity']>('Low');

  if (!prog) {
    return (
      <Screen title="On-site operations">
        <EmptyState icon="clipboard-list" title="Programme not found" />
      </Screen>
    );
  }

  const dayItems = items.filter((i) => i.date === day);
  const venue = getVenue(db, prog.venueId);
  const hotelId = db.hotelBookings.find((b) => b.programmeId === prog.id)?.hotelId;
  const hotel = getHotel(db, hotelId);
  const phase = programmePhase(prog);
  const contacts = [
    { name: getStaff(db, prog.coordinatorId)?.name ?? 'Coordinator', role: 'On-site lead', phone: getStaff(db, prog.coordinatorId)?.phone ?? '', hue: personHue(db, prog.coordinatorId) },
    { name: getStaff(db, prog.managerId)?.name ?? 'Programme Manager', role: 'Programme Manager', phone: getStaff(db, prog.managerId)?.phone ?? '', hue: personHue(db, prog.managerId) },
    ...(venue ? [{ name: venue.contactName.split(' · ')[0], role: `Venue · ${venue.name}`, phone: venue.phone, hue: venue.hue }] : []),
    ...(hotel ? [{ name: hotel.contactName.split(' · ')[0], role: `Hotel · ${hotel.name}`, phone: hotel.phone, hue: hotel.hue }] : []),
    { name: 'Desert Line Transport', role: 'Transfers & coaches · 24h desk', phone: '+971 4 220 7788', hue: 30 },
  ];

  const setStatus = (item: RunSheetItem, status: RunSheetItem['status']) => {
    actions.update('runSheet', item.id, { status });
    toast.show({ message: `${item.time} · ${status}`, detail: item.title, icon: status === 'Done' ? 'circle-check' : status === 'Issue' ? 'triangle-alert' : 'play' });
  };

  const generate = () => {
    const base = prog.startDate;
    const template: [string, string, string, string][] = [
      ['07:00', 'Team on site · room check', 'Layout, signage, AV line check', 'Main room'],
      ['07:30', 'Registration desk opens', 'Badges and welcome kits', 'Foyer'],
      ['09:00', 'Opening session', 'Recording and photography consent check', 'Main room'],
      ['12:30', 'Lunch', 'Dietary table labelled', 'Restaurant'],
      ['17:30', 'Daily faculty debrief', 'Capture adjustments for tomorrow', 'Green room'],
    ];
    template.forEach(([time, title, detail, location]) => actions.add('runSheet', { id: newId('rs'), programmeId: prog.id, date: base, time, title, detail, location, ownerId: prog.coordinatorId, status: 'Upcoming' }, { append: true }));
    setDay(base);
    toast.show({ message: 'Run sheet generated', detail: 'From the residential programme template — edit as needed', icon: 'wand-sparkles' });
  };

  const logIncident = () => {
    const t = splitDateTime(DEMO_NOW).time;
    setIncidents((list) => [{ id: newId('inc'), time: t, text: note.trim(), author: personName(db, userId), severity }, ...list]);
    setNote('');
    toast.show({ message: 'Incident logged', detail: 'Shared with the programme team', icon: 'notebook-pen' });
  };

  return (
    <Screen title="On-site operations" eyebrow={`${prog.code} · ${prog.shortName}`} subtitle={`${prog.location} · ${formatDate(prog.startDate, { year: false })} – ${formatDate(prog.endDate, { year: false })}`}>
      {phase === 'upcoming' ? <Banner tone="info" title={`${countdown(prog.startDate)}`} message="This run sheet goes live on the day. Statuses can be updated in advance to rehearse." icon="calendar-clock" /> : null}

      {!items.length ? (
        <EmptyState icon="clipboard-list" title="No run sheet yet" message="Generate a day-one run sheet from the template, then tailor it to this programme." actionLabel="Generate from template" onAction={generate} />
      ) : (
        <>
          <ChipRow style={{ paddingTop: 14 }}>
            {days.map((d, i) => (
              <Chip key={d} label={`Day ${i + 1} · ${formatDate(d, { year: false })}`} selected={d === day} onPress={() => setDay(d)} />
            ))}
          </ChipRow>

          <Section title="Run sheet" subtitle={dayItems.length ? `${dayItems.filter((i) => i.status === 'Done').length} of ${dayItems.length} done` : undefined}>
            {dayItems.length ? (
              <Card padding="md">
                {dayItems.map((it, idx) => {
                  const tc = toneColors(STATUS_TONE[it.status], colors);
                  const last = idx === dayItems.length - 1;
                  return (
                    <Touchable key={it.id} onPress={() => setEditing(it)} accessibilityLabel={`${it.time} ${it.title}, ${it.status}. Tap to change status`} style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ width: 44 }}>
                        <Text variant="headline" tabular>
                          {it.time}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'center', width: 14 }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, marginTop: 4, backgroundColor: it.status === 'Upcoming' ? colors.surface : tc.solid, borderWidth: 2, borderColor: tc.solid }} />
                        {!last ? <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2 }} /> : null}
                      </View>
                      <View style={{ flex: 1, paddingBottom: last ? 0 : 16, gap: 3 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text variant="bodyStrong" style={{ flex: 1 }}>
                            {it.title}
                          </Text>
                          <StatusPill label={it.status} tone={STATUS_TONE[it.status]} />
                        </View>
                        <Text variant="subhead" tone="secondary">
                          {it.detail}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Icon name="map-pin" size={11} tone="tertiary" />
                          <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                            {it.location} · {personName(db, it.ownerId)}
                          </Text>
                        </View>
                      </View>
                    </Touchable>
                  );
                })}
              </Card>
            ) : (
              <EmptyState icon="calendar" title="Nothing scheduled" message="No run-sheet items for this day yet." compact />
            )}
          </Section>
        </>
      )}

      <Section title="Key contacts">
        <ListGroup>
          {contacts.map((c) => (
            <ListRow key={c.name + c.role} leading={<Avatar name={c.name} hue={c.hue} size={34} />} title={c.name} subtitle={c.role} trailing={<Icon name="phone" size={18} tone="accent" />} onPress={() => toast.show({ message: `Calling ${c.name}…`, detail: `${c.phone} (simulated)`, icon: 'phone', tone: 'neutral' })} />
          ))}
        </ListGroup>
      </Section>

      <Section title="Incident log" subtitle="Anything that affects delivery, safety or participant experience">
        <Card padding="md" style={{ gap: 10 }}>
          <TextField value={note} onChangeText={setNote} placeholder="What happened? e.g. Projector flicker in breakout 2 — AV tech called" multiline />
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {(['Low', 'Medium', 'High'] as const).map((s) => (
              <Chip key={s} label={s} selected={severity === s} onPress={() => setSeverity(s)} />
            ))}
            <View style={{ flex: 1 }} />
            <Button title="Log" size="sm" icon="plus" onPress={logIncident} disabled={note.trim().length < 4} />
          </View>
        </Card>
        {incidents.length ? (
          <ListGroup>
            {incidents.map((i) => (
              <ListRow key={i.id} icon="notebook-pen" iconTone={i.severity === 'High' ? 'danger' : i.severity === 'Medium' ? 'warning' : 'neutral'} title={i.text} numberOfLines={3} subtitle={`${i.time} · ${i.author} · ${i.severity}`} />
            ))}
          </ListGroup>
        ) : (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 4 }}>
            <Icon name="shield-check" size={16} tone="success" />
            <Text variant="subhead" tone="secondary">
              No incidents logged.
            </Text>
          </View>
        )}
      </Section>

      <Section title="Related">
        <ListGroup>
          <ListRow icon="list-checks" iconTone="success" title="Logistics checklist" onPress={() => router.push(`/logistics/checklist/${prog.id}`)} />
          <ListRow icon="bed-double" iconTone="violet" title="Rooming list" onPress={() => router.push(`/rooming/${prog.id}`)} />
        </ListGroup>
      </Section>

      <ActionSheet
        visible={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `${editing.time} · ${editing.title}` : undefined}
        subtitle="Update status"
        actions={(['Upcoming', 'In Progress', 'Done', 'Issue'] as const).map((s) => ({
          label: s === 'Issue' ? 'Flag an issue' : `Mark ${s.toLowerCase()}`,
          icon: s === 'Done' ? 'circle-check' : s === 'In Progress' ? 'play' : s === 'Issue' ? 'triangle-alert' : 'circle-dashed',
          destructive: s === 'Issue',
          disabled: editing?.status === s,
          onPress: () => editing && setStatus(editing, s),
        }))}
      />
    </Screen>
  );
}
