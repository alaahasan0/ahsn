import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, EmptyState, Icon, IconTile, ListGroup, ListRow, Screen, Section, SelectSheet, Sheet, Stat, StatGrid, Text, useToast } from '@/components';
import { rolePersona } from '@/data/mock';
import type { StaffRoleKey } from '@/data/models';
import { byId, getStaff, programmePhase } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { addDays, formatDate, formatRange } from '@/utils/dates';

import { TASK_CATEGORY_ICON } from '../shared/helpers';
import { templateTaskCount } from './WorkflowsScreen';

export function offsetLabel(days: number) {
  if (days === 0) return 'Start day';
  return days < 0 ? `T–${-days} days` : `T+${days} days`;
}

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { userId } = useSession();
  const tpl = byId(db.workflowTemplates, id);
  const [applyOpen, setApplyOpen] = useState(false);
  const [pickOpen, setPickOpen] = useState(false);
  const candidates = db.programmes.filter((p) => !p.archived && !p.cancelled && programmePhase(p) === 'upcoming');
  const [programmeId, setProgrammeId] = useState(candidates.find((p) => p.templateId === id)?.id ?? candidates[0]?.id);

  if (!tpl) {
    return (
      <Screen title="Template" large={false}>
        <EmptyState icon="workflow" title="Template not found" actionLabel="All workflows" onAction={() => router.replace('/workflows')} />
      </Screen>
    );
  }

  const roleLabel = (r: StaffRoleKey) => db.roles.find((x) => x.key === r)?.label ?? r;
  const total = templateTaskCount(tpl);
  const allOffsets = tpl.phases.flatMap((p) => p.tasks.map((t) => t.offsetDays));
  const runway = -Math.min(...allOffsets);
  const prog = byId(db.programmes, programmeId);

  const ownerFor = (role: StaffRoleKey) => (role === 'programme_manager' && prog ? prog.managerId : role === 'programme_coordinator' && prog ? prog.coordinatorId : rolePersona[role]);

  const apply = () => {
    if (!prog) return;
    let n = 0;
    for (const phase of tpl.phases)
      for (const t of phase.tasks) {
        actions.createTask({
          title: t.title,
          programmeId: prog.id,
          ownerId: ownerFor(t.role),
          dueDate: addDays(prog.startDate, t.offsetDays),
          priority: t.offsetDays > -14 && t.offsetDays < 0 ? 'High' : 'Medium',
          category: t.category,
          description: `Generated from the “${tpl.name}” template · ${phase.name} phase.`,
        });
        n++;
      }
    actions.log(prog.id, 'status_changed', `applied the “${tpl.name}” template — ${n} tasks generated`, userId);
    setApplyOpen(false);
    toast.show({ message: `${n} tasks generated`, detail: `${prog.shortName} checklist from ${tpl.name}`, actionLabel: 'View', onAction: () => router.push(`/programme/${prog.id}/tasks`) });
  };

  const first = prog ? addDays(prog.startDate, Math.min(...allOffsets)) : undefined;
  const last = prog ? addDays(prog.startDate, Math.max(...allOffsets)) : undefined;

  return (
    <Screen title={tpl.name} eyebrow="Workflow template" subtitle={tpl.description} footer={<Button title="Apply to a programme" icon="workflow" onPress={() => setApplyOpen(true)} style={{ flex: 1 }} />}>
      <StatGrid>
        <Stat label="Phases" value={String(tpl.phases.length)} icon="layers" />
        <Stat label="Tasks" value={String(total)} icon="list-checks" />
        <Stat label="Preparation runway" value={`${Math.round(runway / 7)} weeks`} icon="hourglass" />
        <Stat label="Used" value={`${tpl.usedCount}×`} icon="repeat" />
      </StatGrid>

      {tpl.phases.map((phase, pi) => (
        <Section key={phase.name} title={`${pi + 1}. ${phase.name}`} subtitle={`${phase.tasks.length} task${phase.tasks.length > 1 ? 's' : ''}`}>
          <ListGroup>
            {phase.tasks.map((t) => (
              <ListRow key={t.title} leading={<IconTile icon={TASK_CATEGORY_ICON[t.category] ?? 'clipboard-list'} tone="neutral" size={30} />} title={t.title} subtitle={`${roleLabel(t.role)} · ${t.category}`} value={offsetLabel(t.offsetDays)} numberOfLines={2} />
            ))}
          </ListGroup>
        </Section>
      ))}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 20, alignItems: 'flex-start' }}>
        <Icon name="info" size={15} tone="tertiary" />
        <Text variant="footnote" tone="tertiary" style={{ flex: 1 }}>
          Offsets are relative to the programme start date (T). Owners default to the person holding each role on the programme.
        </Text>
      </View>

      <Sheet
        visible={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="Apply template"
        subtitle={tpl.name}
        footer={<Button title={`Generate ${total} tasks`} icon="check" onPress={apply} disabled={!prog} style={{ flex: 1 }} />}>
        <ListGroup>
          <ListRow icon="layers" iconTone="violet" title="Programme" value={prog?.shortName ?? 'Choose'} subtitle={prog?.name} onPress={() => setPickOpen(true)} />
          {prog ? <ListRow icon="calendar" title="Programme starts" value={formatDate(prog.startDate)} /> : null}
          {first && last ? <ListRow icon="calendar-range" title="Task due dates" value={formatRange(first, last)} /> : null}
          {prog ? <ListRow icon="users" title="Default owners" value={`${getStaff(db, prog.managerId)?.name.split(' ')[0]} + ${new Set(tpl.phases.flatMap((p) => p.tasks.map((t) => t.role))).size - 1} roles`} /> : null}
        </ListGroup>
        <Text variant="footnote" tone="tertiary" style={{ marginTop: 12 }}>
          Tasks are created as “To Do”. Tasks due within two weeks of the start date are marked High priority.
        </Text>
      </Sheet>
      <SelectSheet
        visible={pickOpen}
        onClose={() => setPickOpen(false)}
        title="Programme"
        value={programmeId}
        onSelect={setProgrammeId}
        options={candidates.map((p) => ({ value: p.id, label: p.name, detail: `${p.code} · starts ${formatDate(p.startDate, { year: false })}${p.templateId === tpl.id ? ' · uses this template' : ''}` }))}
      />
    </Screen>
  );
}
