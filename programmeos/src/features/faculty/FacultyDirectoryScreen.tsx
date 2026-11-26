import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { ActionSheet, Chip, ChipRow, EmptyState, HeaderActions, IconButton, NoFilterResults, NoResults, Screen, SearchField, SegmentedControl, Text } from '@/components';
import type { Faculty } from '@/data/models';
import { scheduleConflicts } from '@/data/selectors';
import { useDB } from '@/data/store';
import { searchMatch } from '@/utils/format';

import { LoadGate } from '../shared/Widgets';
import { FacultyCard } from './components';

type Avail = 'All' | Faculty['availability'];
type SortKey = 'name' | 'rating' | 'utilisation';

const SORT_LABEL: Record<SortKey, string> = { name: 'Name', rating: 'Rating', utilisation: 'Utilisation' };

export default function FacultyDirectoryScreen() {
  const db = useDB();
  const [q, setQ] = useState('');
  const [expertise, setExpertise] = useState<string | null>(null);
  const [avail, setAvail] = useState<Avail>('All');
  const [sort, setSort] = useState<SortKey>('name');
  const [sortOpen, setSortOpen] = useState(false);

  const topExpertise = useMemo(() => {
    const counts = new Map<string, number>();
    db.faculty.forEach((f) => f.expertise.forEach((e) => counts.set(e, (counts.get(e) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12).map(([e]) => e);
  }, [db.faculty]);

  const conflicts = scheduleConflicts(db);
  const conflictFaculty = new Set(conflicts.map((c) => c.facultyId));

  const base = db.faculty.filter((f) => searchMatch(q, f.name, f.honorific, f.title, f.institution, f.location, ...f.expertise));
  const list = base
    .filter((f) => (!expertise || f.expertise.includes(expertise)) && (avail === 'All' || f.availability === avail))
    .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : sort === 'rating' ? b.rating - a.rating : b.utilisation - a.utilisation));
  const filtered = !!expertise || avail !== 'All';

  return (
    <Screen
      title="Faculty"
      subtitle={`${db.faculty.length} faculty · ${db.faculty.filter((f) => f.availability === 'Available').length} available this quarter`}
      headerRight={
        <HeaderActions>
          <IconButton icon="arrow-up-down" accessibilityLabel={`Sort by ${SORT_LABEL[sort]}`} onPress={() => setSortOpen(true)} />
          <IconButton icon="plus" accessibilityLabel="Assign faculty" onPress={() => router.push('/faculty/assign')} />
        </HeaderActions>
      }
      headerBelow={
        <>
          <SearchField value={q} onChangeText={setQ} placeholder="Search name, expertise, institution" />
          <SegmentedControl<Avail>
            size="sm"
            value={avail}
            onChange={setAvail}
            options={[
              { value: 'All', label: 'All' },
              { value: 'Available', label: 'Available' },
              { value: 'Limited', label: 'Limited' },
              { value: 'Unavailable', label: 'Busy' },
            ]}
          />
          <ChipRow>
            {topExpertise.map((e) => (
              <Chip key={e} label={e} selected={expertise === e} onPress={() => setExpertise(expertise === e ? null : e)} />
            ))}
          </ChipRow>
        </>
      }>
      <LoadGate loadKey="faculty-directory">
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 4 }}>
          <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
            {list.length} {list.length === 1 ? 'person' : 'people'} · sorted by {SORT_LABEL[sort].toLowerCase()}
          </Text>
          {conflictFaculty.size ? (
            <Text variant="footnote" tone="danger">
              {conflictFaculty.size} with schedule conflicts
            </Text>
          ) : null}
        </View>
        {list.length ? (
          <View style={{ gap: 10 }}>
            {list.map((f) => (
              <FacultyCard key={f.id} faculty={f} />
            ))}
          </View>
        ) : !db.faculty.length ? (
          <EmptyState icon="users" title="No faculty yet" message="Add your first faculty member to start assigning sessions." actionLabel="Assign faculty" onAction={() => router.push('/faculty/assign')} />
        ) : !base.length ? (
          <NoResults query={q} onClear={() => setQ('')} />
        ) : filtered ? (
          <NoFilterResults
            onReset={() => {
              setExpertise(null);
              setAvail('All');
            }}
          />
        ) : null}
      </LoadGate>
      <ActionSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort faculty"
        actions={(Object.keys(SORT_LABEL) as SortKey[]).map((k) => ({ label: SORT_LABEL[k], icon: sort === k ? 'check' : undefined, onPress: () => setSort(k) }))}
      />
    </Screen>
  );
}
