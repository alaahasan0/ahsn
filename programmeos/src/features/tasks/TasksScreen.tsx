import { router } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  ActionSheet,
  Button,
  Chip,
  ChipRow,
  EmptyState,
  HeaderActions,
  Icon,
  IconButton,
  ListGroup,
  NoFilterResults,
  NoResults,
  Screen,
  SearchField,
  SegmentedControl,
  Sheet,
  Text,
  Touchable,
} from '@/components';
import type { Task } from '@/data/models';
import { getProgramme, getStaff, groupTasks, personName, programmePhase } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { searchMatch } from '@/utils/format';

import { TaskRow } from '../shared/Rows';
import { LoadGate } from '../shared/Widgets';
import { applyFilters, CATEGORIES, EMPTY_FILTERS, filterCount, PRIORITIES, SORT_LABELS, sortTasks, STATUSES, type TaskFilters, type TaskSort } from './taskFilters';

type Scope = 'mine' | 'team' | 'programme';

/**
 * Tasks tab: My Tasks / Team / By Programme. Time-bucketed sections keep the next action
 * obvious; search, filters and sort narrow long lists without leaving the screen.
 */
export default function TasksScreen() {
  const db = useDB();
  const { userId } = useSession();
  const s = useStyles(styles);
  const [scope, setScope] = useState<Scope>('mine');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<TaskSort>('due');
  const [owner, setOwner] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const base = useMemo(() => {
    const visible = db.tasks.filter((t) => {
      const p = getProgramme(db, t.programmeId);
      return p && !p.cancelled;
    });
    if (scope === 'mine') return visible.filter((t) => t.ownerId === userId);
    if (scope === 'team' && owner) return visible.filter((t) => t.ownerId === owner);
    return visible;
  }, [db, scope, userId, owner]);

  const searched = base.filter((t) => searchMatch(query, t.title, t.description, getProgramme(db, t.programmeId)?.name, getProgramme(db, t.programmeId)?.shortName, personName(db, t.ownerId)));
  const filtered = applyFilters(searched, filters);
  const sorted = sortTasks(filtered, sort);
  const groups = groupTasks(sorted);
  // groupTasks sorts by due date; respect the chosen sort inside each bucket
  const bucket = (list: Task[]) => (sort === 'due' ? list : sortTasks(list, sort));
  const open = base.filter((t) => t.status !== 'Done');
  const overdueCount = groupTasks(base).overdue.length;
  const nFilters = filterCount(filters);

  const teamOwners = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of db.tasks) if (t.status !== 'Done') counts.set(t.ownerId, (counts.get(t.ownerId) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [db.tasks]);

  const subtitle = `${open.length} open${overdueCount ? ` · ${overdueCount} overdue` : ''}`;

  let content: ReactNode;
  if (!base.length) {
    content = (
      <EmptyState
        icon="circle-check-big"
        title={scope === 'mine' ? 'No tasks assigned to you' : 'No tasks yet'}
        message="Tasks created from programme checklists and workflow templates appear here."
        actionLabel="Create a task"
        onAction={() => router.push('/task/new')}
      />
    );
  } else if (!searched.length) {
    content = <NoResults query={query} onClear={() => setQuery('')} />;
  } else if (!filtered.length) {
    content = <NoFilterResults onReset={() => setFilters(EMPTY_FILTERS)} />;
  } else if (scope === 'programme') {
    content = <ByProgramme tasks={sorted} />;
  } else {
    content = (
      <>
        <TaskSection title="Overdue" tone="danger" tasks={bucket(groups.overdue)} showOwner={scope === 'team'} />
        <TaskSection title="Today" tone="accent" tasks={bucket(groups.today)} showOwner={scope === 'team'} />
        <TaskSection title="Next 7 days" tasks={bucket(groups.week)} showOwner={scope === 'team'} />
        <TaskSection title="Later" tasks={bucket(groups.later)} showOwner={scope === 'team'} />
        <TaskSection title="Completed" tasks={groups.done} showOwner={scope === 'team'} collapsedByDefault />
      </>
    );
  }

  return (
    <Screen
      title="Tasks"
      subtitle={subtitle}
      back={false}
      refreshable
      headerRight={
        <HeaderActions>
          <IconButton icon="workflow" accessibilityLabel="Workflow templates" onPress={() => router.push('/workflows')} />
          <IconButton icon="plus" variant="tinted" accessibilityLabel="New task" onPress={() => router.push('/task/new')} />
        </HeaderActions>
      }
      headerBelow={
        <>
          <SegmentedControl<Scope>
            value={scope}
            onChange={(v) => {
              setScope(v);
              setOwner(null);
            }}
            options={[
              { value: 'mine', label: 'My Tasks' },
              { value: 'team', label: 'Team' },
              { value: 'programme', label: 'By Programme' },
            ]}
          />
          <SearchField value={query} onChangeText={setQuery} placeholder="Search tasks, programmes, people" onFilterPress={() => setFilterOpen(true)} filterCount={nFilters} />
          {scope === 'team' ? (
            <ChipRow>
              <Chip label="Everyone" selected={!owner} onPress={() => setOwner(null)} />
              {teamOwners.map(([id, count]) => {
                const st = getStaff(db, id);
                return <Chip key={id} label={st?.name.replace(/^Dr\. /, '').split(' ')[0] ?? id} count={count} selected={owner === id} onPress={() => setOwner(owner === id ? null : id)} />;
              })}
            </ChipRow>
          ) : null}
          <View style={s.toolbar}>
            <Text variant="footnote" tone="secondary">
              {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
              {nFilters ? ` · ${nFilters} filter${nFilters > 1 ? 's' : ''}` : ''}
            </Text>
            <View style={{ flex: 1 }} />
            <Touchable onPress={() => setSortOpen(true)} style={s.sortBtn} accessibilityLabel={`Sort by ${SORT_LABELS[sort]}`}>
              <Icon name="arrow-up-down" size={14} tone="accent" />
              <Text variant="footnote" tone="accent" weight="semibold">
                {SORT_LABELS[sort]}
              </Text>
            </Touchable>
          </View>
        </>
      }>
      <LoadGate loadKey="tasks">{content}</LoadGate>

      <Touchable onPress={() => router.push('/workflows')} style={s.templates} accessibilityLabel="Workflow templates">
        <Icon name="workflow" size={18} tone="violet" />
        <View style={{ flex: 1 }}>
          <Text variant="headline">Workflow templates</Text>
          <Text variant="footnote" tone="secondary">
            Generate a full checklist for a new programme in one step
          </Text>
        </View>
        <Icon name="chevron-right" size={18} tone="tertiary" />
      </Touchable>

      <FilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={filters} onChange={setFilters} resultCount={applyFilters(searched, filters).length} />
      <ActionSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort tasks"
        actions={(Object.keys(SORT_LABELS) as TaskSort[]).map((k) => ({ label: SORT_LABELS[k], icon: sort === k ? 'check' : undefined, onPress: () => setSort(k) }))}
      />
    </Screen>
  );
}

function TaskSection({ title, tasks, tone, showOwner, collapsedByDefault }: { title: string; tasks: Task[]; tone?: 'danger' | 'accent'; showOwner?: boolean; collapsedByDefault?: boolean }) {
  const s = useStyles(styles);
  const [open, setOpen] = useState(!collapsedByDefault);
  if (!tasks.length) return null;
  return (
    <View style={s.section}>
      <Touchable onPress={() => setOpen(!open)} style={s.sectionHead} accessibilityLabel={`${title}, ${tasks.length} tasks, ${open ? 'expanded' : 'collapsed'}`} accessibilityState={{ expanded: open }}>
        <Text variant="title3" tone={tone ?? 'primary'}>
          {title}
        </Text>
        <Text variant="callout" tone="tertiary" tabular>
          {tasks.length}
        </Text>
        <View style={{ flex: 1 }} />
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} tone="tertiary" />
      </Touchable>
      {open ? (
        <ListGroup>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} showOwner={showOwner} />
          ))}
        </ListGroup>
      ) : null}
    </View>
  );
}

function ByProgramme({ tasks }: { tasks: Task[] }) {
  const db = useDB();
  const s = useStyles(styles);
  const { colors } = useTheme();
  const byProg = new Map<string, Task[]>();
  for (const t of tasks) byProg.set(t.programmeId, [...(byProg.get(t.programmeId) ?? []), t]);
  const rank = (pid: string) => {
    const ph = programmePhase(getProgramme(db, pid)!);
    return ph === 'in_delivery' ? 0 : ph === 'upcoming' ? 1 : 2;
  };
  const ordered = [...byProg.entries()].sort((a, b) => rank(a[0]) - rank(b[0]) || (getProgramme(db, a[0])?.startDate ?? '').localeCompare(getProgramme(db, b[0])?.startDate ?? ''));
  return (
    <>
      {ordered.map(([pid, list]) => {
        const p = getProgramme(db, pid)!;
        const openCount = list.filter((t) => t.status !== 'Done').length;
        const phase = programmePhase(p);
        return (
          <View key={pid} style={s.section}>
            <Touchable onPress={() => router.push(`/programme/${pid}`)} style={s.progHead} accessibilityLabel={`${p.name}, ${openCount} open tasks`}>
              <View style={[s.progDot, { backgroundColor: `hsl(${p.accentHue}, 62%, 58%)` }]} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="title3" numberOfLines={1}>
                  {p.name}
                </Text>
                <Text variant="footnote" tone="secondary">
                  {openCount} open · {phase === 'upcoming' ? 'Upcoming' : phase === 'in_delivery' ? 'In delivery' : phase === 'completed' ? 'Completed' : 'Archived'}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.textTertiary} />
            </Touchable>
            <ListGroup>
              {sortTasks(list, 'due')
                .sort((a, b) => Number(a.status === 'Done') - Number(b.status === 'Done'))
                .map((t) => (
                  <TaskRow key={t.id} task={t} showProgramme={false} showOwner />
                ))}
            </ListGroup>
          </View>
        );
      })}
    </>
  );
}

function FilterSheet({ visible, onClose, value, onChange, resultCount }: { visible: boolean; onClose: () => void; value: TaskFilters; onChange: (f: TaskFilters) => void; resultCount: number }) {
  const db = useDB();
  const toggle = <K extends keyof TaskFilters>(key: K, v: TaskFilters[K][number]) => {
    const cur = value[key] as string[];
    onChange({ ...value, [key]: cur.includes(v as string) ? cur.filter((x) => x !== v) : [...cur, v] });
  };
  const programmes = db.programmes.filter((p) => !p.cancelled && !p.archived);
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Filter tasks"
      size="large"
      footer={
        <>
          <Button title="Reset" variant="secondary" onPress={() => onChange(EMPTY_FILTERS)} style={{ flex: 1 }} />
          <Button title={`Show ${resultCount} task${resultCount === 1 ? '' : 's'}`} onPress={onClose} style={{ flex: 2 }} />
        </>
      }>
      <FilterGroup title="Priority">
        {PRIORITIES.map((p) => (
          <Chip key={p} label={p} selected={value.priority.includes(p)} onPress={() => toggle('priority', p)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Status">
        {STATUSES.map((p) => (
          <Chip key={p} label={p} selected={value.status.includes(p)} onPress={() => toggle('status', p)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Category">
        {CATEGORIES.map((p) => (
          <Chip key={p} label={p} selected={value.category.includes(p)} onPress={() => toggle('category', p)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Programme">
        {programmes.map((p) => (
          <Chip key={p.id} label={p.shortName} selected={value.programme.includes(p.id)} onPress={() => toggle('programme', p.id)} />
        ))}
      </FilterGroup>
    </Sheet>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 10, marginBottom: 20 }}>
      <Text variant="overline" tone="tertiary">
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}

const styles = makeStyles((t) => ({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32 },
  section: { marginTop: t.spacing.xl, gap: t.spacing.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 36 },
  progHead: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  progDot: { width: 10, height: 10, borderRadius: 4 },
  templates: { marginTop: t.spacing.xxl, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: t.radii.lg, backgroundColor: t.colors.violetSoft },
}));
