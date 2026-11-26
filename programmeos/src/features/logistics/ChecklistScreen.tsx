import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Checkbox, Chip, ChipRow, DateField, EmptyState, HeaderActions, Icon, IconButton, ListGroup, ListRow, ProgressBar, Screen, Section, SelectField, Sheet, StatusPill, Text, TextField, Touchable, toneColors, useToast, type IconName } from '@/components';
import type { LogisticsArea, LogisticsItem } from '@/data/models';
import { getProgramme, personName, programmePhase, readinessFor } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { addDays, DEMO_TODAY, dueLabel } from '@/utils/dates';
import { newId } from '@/utils/format';

const AREAS: { key: LogisticsArea; icon: IconName; readiness?: 'Venue' | 'Equipment' }[] = [
  { key: 'Venue', icon: 'building-2', readiness: 'Venue' },
  { key: 'Audio/Visual', icon: 'projector', readiness: 'Equipment' },
  { key: 'Catering', icon: 'utensils-crossed' },
  { key: 'Transport', icon: 'bus' },
  { key: 'Printing', icon: 'printer' },
  { key: 'Event Materials', icon: 'package' },
  { key: 'On-site', icon: 'clipboard-list' },
];

export default function ChecklistScreen() {
  const { programmeId } = useLocalSearchParams<{ programmeId: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ label: '', area: 'Venue' as LogisticsArea, ownerId: 's-sofia', due: addDays(DEMO_TODAY, 7), quantity: '', withTask: true });
  const prog = getProgramme(db, programmeId);
  const items = db.logisticsItems.filter((i) => i.programmeId === programmeId);
  const done = items.filter((i) => i.done).length;
  const switchable = db.programmes.filter((p) => !p.archived && !p.cancelled && programmePhase(p) !== 'completed' && (db.logisticsItems.some((i) => i.programmeId === p.id) || p.deliveryMode !== 'Virtual'));
  const r = prog ? readinessFor(db, prog.id) : undefined;
  const venuePct = r?.categories.find((c) => c.key === 'venue');
  const equipPct = r?.categories.find((c) => c.key === 'equipment');

  if (!prog) {
    return (
      <Screen title="Checklist">
        <EmptyState icon="list-checks" title="Programme not found" />
      </Screen>
    );
  }

  const toggle = (item: LogisticsItem) => {
    actions.toggleLogisticsItem(item.id);
    const areaItems = items.filter((i) => i.area === item.area);
    const after = areaItems.filter((i) => (i.id === item.id ? !i.done : i.done)).length;
    const area = AREAS.find((a) => a.key === item.area);
    const pct = Math.round((after / areaItems.length) * 100);
    toast.show({
      message: area?.readiness ? `${area.readiness} readiness now ${pct}%` : `${item.area}: ${after} of ${areaItems.length} done`,
      detail: item.label,
      icon: !item.done ? 'circle-check' : 'rotate-ccw',
      actionLabel: 'Undo',
      onAction: () => actions.toggleLogisticsItem(item.id),
    });
  };

  const addItem = () => {
    const id = newId('lg');
    let taskId: string | undefined;
    if (draft.withTask) {
      taskId = actions.createTask({ title: draft.label, programmeId: prog.id, ownerId: draft.ownerId, dueDate: draft.due, priority: 'Medium', category: 'Logistics', description: `Created from the ${draft.area} logistics checklist.` });
    }
    actions.add('logisticsItems', { id, programmeId: prog.id, area: draft.area, label: draft.label.trim(), ownerId: draft.ownerId, due: draft.due, done: false, quantity: draft.quantity.trim() || undefined, taskId }, { append: true });
    setAdding(false);
    toast.show({ message: 'Checklist item added', detail: draft.withTask ? 'A linked task was created for the owner' : draft.area, icon: 'list-checks' });
    setDraft((d) => ({ ...d, label: '', quantity: '' }));
  };

  return (
    <Screen
      title="Logistics checklist"
      eyebrow={`${prog.code} · ${prog.shortName}`}
      subtitle={prog.name}
      headerRight={
        <HeaderActions>
          <IconButton icon="plus" accessibilityLabel="Add checklist item" onPress={() => setAdding(true)} />
        </HeaderActions>
      }
      headerBelow={
        switchable.length > 1 ? (
          <ChipRow>
            {switchable.map((p) => (
              <Chip key={p.id} label={p.shortName} selected={p.id === prog.id} onPress={() => router.replace(`/logistics/checklist/${p.id}`)} />
            ))}
          </ChipRow>
        ) : undefined
      }>
      {!items.length ? (
        <EmptyState icon="list-checks" title="No checklist yet" message={prog.deliveryMode === 'Virtual' ? 'Virtual programmes usually only need platform and AV items.' : 'Add venue, catering, transport and printing requirements to start tracking.'} actionLabel="Add first item" onAction={() => setAdding(true)} />
      ) : (
        <>
          <Card padding="md" style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text variant="title3">
                {done} of {items.length} complete
              </Text>
              <Text variant="headline" tabular tone={done === items.length ? 'success' : 'accent'}>
                {Math.round((done / items.length) * 100)}%
              </Text>
            </View>
            <ProgressBar value={(done / items.length) * 100} color={done === items.length ? colors.success : colors.accent} />
            {venuePct?.applicable || equipPct?.applicable ? (
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingTop: 2 }}>
                <Icon name="gauge" size={15} tone="violet" />
                <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
                  Feeds programme readiness — Venue {Math.round(venuePct?.percent ?? 0)}% · Equipment {Math.round(equipPct?.percent ?? 0)}%
                </Text>
                <Touchable onPress={() => router.push(`/programme/${prog.id}/readiness`)} hitSlop={10} accessibilityLabel="Open readiness">
                  <Text variant="footnote" tone="accent" weight="semibold">
                    Readiness
                  </Text>
                </Touchable>
              </View>
            ) : null}
          </Card>

          {AREAS.map((area) => {
            const list = items.filter((i) => i.area === area.key);
            if (!list.length) return null;
            const areaDone = list.filter((i) => i.done).length;
            const tone = areaDone === list.length ? 'success' : list.some((i) => !i.done && i.due < DEMO_TODAY) ? 'danger' : 'accent';
            return (
              <Section key={area.key} title={area.key} subtitle={`${areaDone} of ${list.length} done${area.readiness ? ` · counts towards ${area.readiness.toLowerCase()} readiness` : ''}`}>
                <View style={{ gap: 0 }}>
                  <ProgressBar value={(areaDone / list.length) * 100} color={toneColors(tone, colors).solid} height={4} style={{ marginBottom: 10 }} />
                  <ListGroup>
                    {list.map((i) => {
                      const due = dueLabel(i.due);
                      const task = i.taskId ? db.tasks.find((t) => t.id === i.taskId) : undefined;
                      return (
                        <View key={i.id} style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'flex-start' }}>
                          <View style={{ paddingTop: 1 }}>
                            <Checkbox checked={i.done} onChange={() => toggle(i)} accessibilityLabel={`Mark ${i.label} ${i.done ? 'not done' : 'done'}`} />
                          </View>
                          <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                            <Text variant="bodyStrong" tone={i.done ? 'tertiary' : 'primary'} style={i.done ? { textDecorationLine: 'line-through' } : undefined}>
                              {i.label}
                            </Text>
                            {i.detail || i.quantity ? (
                              <Text variant="footnote" tone="secondary">
                                {[i.quantity, i.detail].filter(Boolean).join(' · ')}
                              </Text>
                            ) : null}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <Text variant="footnote" tone={i.done ? 'tertiary' : due.tone === 'danger' ? 'danger' : due.tone === 'warning' ? 'warning' : 'tertiary'}>
                                {i.done ? 'Done' : due.text}
                              </Text>
                              <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                                · {personName(db, i.ownerId)}
                              </Text>
                            </View>
                            {task ? (
                              <Touchable onPress={() => router.push(`/task/${task.id}`)} accessibilityLabel={`Linked task ${task.title}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.surfaceAlt }}>
                                <Icon name="link-2" size={12} tone="accent" />
                                <Text variant="caption" tone="accent">
                                  Linked task
                                </Text>
                                <StatusPill label={task.status} />
                              </Touchable>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </ListGroup>
                </View>
              </Section>
            );
          })}

          <Section title="Related">
            <ListGroup>
              <ListRow icon="clipboard-list" iconTone="danger" title="On-site run sheet" subtitle="Day-of timeline, contacts and incident log" onPress={() => router.push(`/onsite/${prog.id}`)} />
              <ListRow icon="bed-double" iconTone="violet" title="Rooming list" onPress={() => router.push(`/rooming/${prog.id}`)} />
              <ListRow icon="plane" iconTone="info" title="Travel" onPress={() => router.push(`/travel?programme=${prog.id}`)} />
            </ListGroup>
          </Section>
        </>
      )}

      <Sheet visible={adding} onClose={() => setAdding(false)} title="New checklist item" footer={<Button title="Add item" onPress={addItem} disabled={draft.label.trim().length < 3} style={{ flex: 1 }} />}>
        <View style={{ gap: 14 }}>
          <TextField label="Requirement" value={draft.label} onChangeText={(v) => setDraft((d) => ({ ...d, label: v }))} placeholder="e.g. Coach for airport return" required />
          <SelectField label="Area" value={draft.area} options={AREAS.map((a) => ({ value: a.key, label: a.key, icon: a.icon }))} onChange={(v) => setDraft((d) => ({ ...d, area: v }))} />
          <SelectField label="Owner" value={draft.ownerId} options={db.staff.map((s) => ({ value: s.id, label: s.name, detail: s.title }))} onChange={(v) => setDraft((d) => ({ ...d, ownerId: v }))} icon="user" />
          <DateField label="Due" value={draft.due} onChange={(v) => setDraft((d) => ({ ...d, due: v }))} />
          <TextField label="Quantity" value={draft.quantity} onChangeText={(v) => setDraft((d) => ({ ...d, quantity: v }))} placeholder="Optional — e.g. 24 copies" />
          <ListGroup>
            <ListRow title="Create a linked task" subtitle="The owner sees it in My Tasks" switchValue={draft.withTask} onSwitch={(v) => setDraft((d) => ({ ...d, withTask: v }))} />
          </ListGroup>
        </View>
      </Sheet>
    </Screen>
  );
}
