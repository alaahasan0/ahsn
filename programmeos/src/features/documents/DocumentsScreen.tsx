import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ActionSheet, Chip, ChipRow, FileIcon, HeaderActions, IconButton, ListGroup, ListRow, NoFilterResults, NoResults, Screen, SearchField, SelectSheet, StatusPill, Text, EmptyState } from '@/components';
import type { DocumentKind } from '@/data/models';
import { getProgramme, personName } from '@/data/selectors';
import { useDB } from '@/data/store';
import { formatDate } from '@/utils/dates';
import { fileSize, searchMatch } from '@/utils/format';

import { LoadGate } from '../shared/Widgets';

type Sort = 'newest' | 'oldest' | 'name';

export default function DocumentsScreen() {
  const params = useLocalSearchParams<{ programme?: string }>();
  const db = useDB();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<DocumentKind | undefined>();
  const [programme, setProgramme] = useState<string | undefined>(params.programme);
  const [sort, setSort] = useState<Sort>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [progOpen, setProgOpen] = useState(false);

  const kinds = [...new Set(db.documents.map((d) => d.kind))];
  const filtered = db.documents.filter((d) => (!kind || d.kind === kind) && (!programme || d.programmeId === programme));
  const list = filtered
    .filter((d) => searchMatch(q, d.title, d.summary, d.kind, getProgramme(db, d.programmeId)?.shortName, ...d.tags))
    .sort((a, b) => (sort === 'name' ? a.title.localeCompare(b.title) : sort === 'oldest' ? a.uploadedOn.localeCompare(b.uploadedOn) : b.uploadedOn.localeCompare(a.uploadedOn)));
  const progIds = [...new Set(db.documents.map((d) => d.programmeId).filter((x): x is string => !!x))];
  const activeFilters = (kind ? 1 : 0) + (programme ? 1 : 0);

  return (
    <Screen
      title="Documents"
      subtitle="Contracts, rooming lists, materials and invoices — linked to their programme"
      refreshable
      headerRight={
        <HeaderActions>
          <IconButton icon="arrow-up-down" accessibilityLabel="Sort" onPress={() => setSortOpen(true)} />
          <IconButton icon="scan-text" accessibilityLabel="Upload document" variant="tinted" onPress={() => router.push(programme ? `/document/upload?programme=${programme}` : '/document/upload')} />
        </HeaderActions>
      }
      headerBelow={
        <>
          <SearchField value={q} onChangeText={setQ} placeholder="Search documents" onFilterPress={() => setProgOpen(true)} filterCount={programme ? 1 : 0} />
          <ChipRow>
            <Chip label="All types" selected={!kind} onPress={() => setKind(undefined)} />
            {kinds.map((k) => (
              <Chip key={k} label={k} selected={kind === k} onPress={() => setKind(kind === k ? undefined : k)} />
            ))}
          </ChipRow>
          {programme ? (
            <View style={{ flexDirection: 'row' }}>
              <Chip label={getProgramme(db, programme)?.shortName ?? programme} icon="layers" selected onRemove={() => setProgramme(undefined)} onPress={() => setProgOpen(true)} />
            </View>
          ) : null}
        </>
      }>
      <LoadGate loadKey="documents">
        {!db.documents.length ? (
          <EmptyState icon="folder-open" title="No documents yet" message="Upload contracts, invoices and itineraries — ProgrammeOS extracts the key details for you." actionLabel="Upload document" onAction={() => router.push('/document/upload')} />
        ) : !filtered.length ? (
          <NoFilterResults onReset={() => { setKind(undefined); setProgramme(undefined); }} />
        ) : !list.length ? (
          <NoResults query={q} onClear={() => setQ('')} />
        ) : (
          <>
            <Text variant="footnote" tone="tertiary" style={{ marginBottom: 8 }}>
              {list.length} document{list.length === 1 ? '' : 's'} · sorted by {sort === 'name' ? 'name' : sort === 'oldest' ? 'oldest first' : 'newest first'}
              {activeFilters ? ` · ${activeFilters} filter${activeFilters === 1 ? '' : 's'}` : ''}
            </Text>
            <ListGroup>
              {list.map((d) => {
                const prog = getProgramme(db, d.programmeId);
                return (
                  <ListRow
                    key={d.id}
                    leading={<FileIcon format={d.format} size={40} />}
                    title={d.title}
                    subtitle={`${prog?.shortName ?? d.kind} · ${d.version} · ${formatDate(d.uploadedOn, { year: false })}`}
                    meta={`${personName(db, d.uploadedBy)} · ${fileSize(d.sizeKb)}`}
                    trailing={<StatusPill label={d.status} />}
                    onPress={() => router.push(`/document/${d.id}`)}
                  />
                );
              })}
            </ListGroup>
          </>
        )}
      </LoadGate>

      <ActionSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort documents"
        actions={[
          { label: 'Newest first', icon: sort === 'newest' ? 'check' : 'calendar', onPress: () => setSort('newest') },
          { label: 'Oldest first', icon: sort === 'oldest' ? 'check' : 'history', onPress: () => setSort('oldest') },
          { label: 'Name (A–Z)', icon: sort === 'name' ? 'check' : 'type', onPress: () => setSort('name') },
        ]}
      />
      <SelectSheet
        visible={progOpen}
        onClose={() => setProgOpen(false)}
        title="Programme"
        value={programme ?? 'all'}
        options={[{ value: 'all', label: 'All programmes', icon: 'layers' }, ...progIds.map((id) => ({ value: id, label: getProgramme(db, id)?.name ?? id, detail: `${db.documents.filter((d) => d.programmeId === id).length} documents` }))]}
        onSelect={(v) => setProgramme(v === 'all' ? undefined : v)}
      />
    </Screen>
  );
}
