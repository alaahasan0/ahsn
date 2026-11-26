import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  ActionSheet,
  Button,
  Chip,
  ChipRow,
  EmptyState,
  HeaderActions,
  IconButton,
  NoFilterResults,
  NoResults,
  Screen,
  SearchField,
  SegmentedControl,
  Sheet,
  Text,
} from '@/components';
import type { DeliveryMode, Programme, ProgrammeType } from '@/data/models';
import { getClient, getStaff, isAtRisk, programmePhase, readinessFor } from '@/data/selectors';
import { useDB } from '@/data/store';
import { searchMatch } from '@/utils/format';

import { ProgrammeCard } from '../shared/ProgrammeCard';
import { LoadGate } from '../shared/Widgets';

type Segment = 'active' | 'upcoming' | 'completed' | 'archived';
type Sort = 'start' | 'name' | 'readiness' | 'value';

const SORT_LABEL: Record<Sort, string> = { start: 'Start date', name: 'Name (A–Z)', readiness: 'Readiness (lowest first)', value: 'Contract value' };

export default function ProgrammesScreen() {
  const db = useDB();
  const [segment, setSegment] = useState<Segment>('active');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('start');
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modes, setModes] = useState<DeliveryMode[]>([]);
  const [clients, setClients] = useState<string[]>([]);
  const [types, setTypes] = useState<ProgrammeType[]>([]);
  const [atRiskOnly, setAtRiskOnly] = useState(false);

  const filterCount = modes.length + clients.length + types.length + (atRiskOnly ? 1 : 0);
  const resetFilters = () => {
    setModes([]);
    setClients([]);
    setTypes([]);
    setAtRiskOnly(false);
  };

  const inSegment = (p: Programme) => {
    const ph = programmePhase(p);
    if (segment === 'active') return ph === 'in_delivery' || (ph === 'upcoming');
    if (segment === 'upcoming') return ph === 'upcoming';
    if (segment === 'completed') return ph === 'completed' || ph === 'cancelled';
    return ph === 'archived';
  };

  const counts = useMemo(() => {
    const c = { active: 0, upcoming: 0, completed: 0, archived: 0 };
    for (const p of db.programmes) {
      const ph = programmePhase(p);
      if (ph === 'in_delivery' || ph === 'upcoming') c.active++;
      if (ph === 'upcoming') c.upcoming++;
      if (ph === 'completed' || ph === 'cancelled') c.completed++;
      if (ph === 'archived') c.archived++;
    }
    return c;
  }, [db.programmes]);

  const segmentList = db.programmes.filter(inSegment);
  const searched = segmentList.filter((p) => searchMatch(query, p.name, p.code, p.shortName, getClient(db, p.clientId)?.name, getStaff(db, p.managerId)?.name, p.location, ...p.tags));
  const filtered = searched.filter(
    (p) => (!modes.length || modes.includes(p.deliveryMode)) && (!clients.length || clients.includes(p.clientId)) && (!types.length || types.includes(p.type)) && (!atRiskOnly || isAtRisk(db, p)),
  );
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'value') return b.contractValue - a.contractValue;
    if (sort === 'readiness') {
      const ra = programmePhase(a) === 'upcoming' ? readinessFor(db, a.id).overall : 101;
      const rb = programmePhase(b) === 'upcoming' ? readinessFor(db, b.id).overall : 101;
      return ra - rb;
    }
    return segment === 'completed' || segment === 'archived' ? b.startDate.localeCompare(a.startDate) : a.startDate.localeCompare(b.startDate);
  });

  const delivering = sorted.filter((p) => programmePhase(p) === 'in_delivery');
  const later = sorted.filter((p) => programmePhase(p) !== 'in_delivery');
  const toggle = <T,>(list: T[], set: (v: T[]) => void, v: T) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <Screen
      title="Programmes"
      back={false}
      refreshable
      headerRight={
        <HeaderActions>
          <IconButton icon="arrow-up-down" accessibilityLabel="Sort" onPress={() => setSortOpen(true)} />
          <IconButton icon="plus" accessibilityLabel="New programme" variant="tinted" onPress={() => router.push('/programme/new')} />
        </HeaderActions>
      }
      headerBelow={
        <>
          <SearchField value={query} onChangeText={setQuery} placeholder="Search programmes, clients, managers" onFilterPress={() => setFilterOpen(true)} filterCount={filterCount} />
          <SegmentedControl
            value={segment}
            onChange={setSegment}
            options={[
              { value: 'active', label: 'Active', count: counts.active },
              { value: 'upcoming', label: 'Upcoming', count: counts.upcoming },
              { value: 'completed', label: 'Past', count: counts.completed },
              { value: 'archived', label: 'Archive', count: counts.archived },
            ]}
          />
          {filterCount ? (
            <ChipRow>
              {modes.map((m) => (
                <Chip key={m} label={m} selected onRemove={() => toggle(modes, setModes, m)} />
              ))}
              {clients.map((c) => (
                <Chip key={c} label={getClient(db, c)?.shortName ?? c} selected onRemove={() => toggle(clients, setClients, c)} />
              ))}
              {types.map((t) => (
                <Chip key={t} label={t.replace(' Programme', '')} selected onRemove={() => toggle(types, setTypes, t)} />
              ))}
              {atRiskOnly ? <Chip label="At risk" selected onRemove={() => setAtRiskOnly(false)} /> : null}
            </ChipRow>
          ) : null}
        </>
      }>
      <LoadGate loadKey="programmes">
        {!segmentList.length ? (
          <EmptyState icon="archive" title={segment === 'archived' ? 'Nothing archived yet' : 'No programmes here'} message={segment === 'archived' ? 'Programmes move here after financial closure.' : 'Create a programme to start a new workspace.'} actionLabel="New programme" onAction={() => router.push('/programme/new')} />
        ) : !searched.length ? (
          <NoResults query={query} onClear={() => setQuery('')} />
        ) : !filtered.length ? (
          <NoFilterResults onReset={resetFilters} />
        ) : (
          <View style={{ gap: 10 }}>
            {segment === 'active' && delivering.length ? <GroupLabel text={`In delivery · ${delivering.length}`} /> : null}
            {(segment === 'active' ? delivering : []).map((p) => (
              <ProgrammeCard key={p.id} programme={p} />
            ))}
            {segment === 'active' && later.length ? <GroupLabel text={`Upcoming · ${later.length}`} /> : null}
            {(segment === 'active' ? later : sorted).map((p) => (
              <ProgrammeCard key={p.id} programme={p} />
            ))}
            <Text variant="footnote" tone="tertiary" align="center" style={{ marginTop: 8 }}>
              {sorted.length} programme{sorted.length === 1 ? '' : 's'} · sorted by {SORT_LABEL[sort].toLowerCase()}
            </Text>
          </View>
        )}
      </LoadGate>

      <ActionSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort programmes"
        actions={(Object.keys(SORT_LABEL) as Sort[]).map((k) => ({ label: SORT_LABEL[k], icon: sort === k ? 'check' : undefined, onPress: () => setSort(k) }))}
      />

      <Sheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter programmes"
        headerLeft={filterCount ? <Button title="Reset" variant="plain" size="sm" onPress={resetFilters} /> : undefined}
        footer={<Button title={`Show ${filtered.length} programme${filtered.length === 1 ? '' : 's'}`} onPress={() => setFilterOpen(false)} fullWidth style={{ flex: 1 }} />}>
        <FilterGroup title="Delivery mode">
          {(['In-person', 'Virtual', 'Hybrid'] as DeliveryMode[]).map((m) => (
            <Chip key={m} label={m} selected={modes.includes(m)} onPress={() => toggle(modes, setModes, m)} icon={m === 'Virtual' ? 'video' : m === 'Hybrid' ? 'monitor-play' : 'map-pin'} />
          ))}
        </FilterGroup>
        <FilterGroup title="Client">
          {db.clients.map((c) => (
            <Chip key={c.id} label={c.shortName} selected={clients.includes(c.id)} onPress={() => toggle(clients, setClients, c.id)} />
          ))}
        </FilterGroup>
        <FilterGroup title="Programme type">
          {(['3-Day Executive Programme', '5-Day Residential Programme', 'Multi-Week Programme', '6-Month Hybrid Programme', 'Fully Virtual Programme', 'Custom Programme'] as ProgrammeType[]).map((t) => (
            <Chip key={t} label={t.replace(' Programme', '')} selected={types.includes(t)} onPress={() => toggle(types, setTypes, t)} />
          ))}
        </FilterGroup>
        <FilterGroup title="Health">
          <Chip label="At risk only" icon="triangle-alert" selected={atRiskOnly} onPress={() => setAtRiskOnly(!atRiskOnly)} />
        </FilterGroup>
      </Sheet>
    </Screen>
  );
}

function GroupLabel({ text }: { text: string }) {
  return (
    <Text variant="overline" tone="tertiary" style={{ marginTop: 6, marginLeft: 2 }}>
      {text}
    </Text>
  );
}

export function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10, marginBottom: 18 }}>
      <Text variant="overline" tone="tertiary">
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}
