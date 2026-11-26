import { useState } from 'react';
import { View } from 'react-native';

import { Button, DocumentPage, EmptyState, FileIcon, ListGroup, ListRow, NoResults, Screen, SearchField, Sheet, StatusPill, Text, useToast } from '@/components';
import type { DocumentRecord } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { formatDate } from '@/utils/dates';
import { fileSize, searchMatch } from '@/utils/format';

import { useFacultyScope } from './data';

/** Read-only document list with an in-app preview sheet; reused by Learner Mode. */
export function DocumentList({ docs }: { docs: DocumentRecord[] }) {
  const db = useDB();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<DocumentRecord | null>(null);
  const shown = docs.filter((d) => searchMatch(q, d.title, d.kind, d.summary));
  return (
    <>
      <SearchField value={q} onChangeText={setQ} placeholder="Search documents" style={{ marginBottom: 14 }} />
      {!docs.length ? (
        <EmptyState icon="folder-open" title="No documents yet" message="Shared files will appear here." />
      ) : shown.length ? (
        <ListGroup>
          {shown.map((d) => (
            <ListRow key={d.id} leading={<FileIcon format={d.format} size={38} />} title={d.title} subtitle={`${d.kind}${d.programmeId ? ` · ${getProgramme(db, d.programmeId)?.shortName}` : ''}`} meta={`${formatDate(d.uploadedOn, { year: false })} · ${fileSize(d.sizeKb)}`} onPress={() => setOpen(d)} />
          ))}
        </ListGroup>
      ) : (
        <NoResults query={q} onClear={() => setQ('')} />
      )}
      <Sheet
        visible={!!open}
        onClose={() => setOpen(null)}
        title={open?.kind}
        size="large"
        footer={
          <>
            <Button title="Share" icon="share-2" variant="secondary" style={{ flex: 1 }} onPress={() => toast.show({ message: 'Share sheet opened', detail: 'Simulated in this prototype.', icon: 'share-2', tone: 'neutral' })} />
            <Button title="Download" icon="download" style={{ flex: 1 }} onPress={() => { setOpen(null); toast.show({ message: 'Saved to Files', detail: open?.title, icon: 'download' }); }} />
          </>
        }>
        {open ? (
          <View style={{ gap: 14 }}>
            <DocumentPage title={open.title} format={open.format} subtitle={open.summary} lines={12} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <StatusPill label={open.status} />
              <Text variant="footnote" tone="secondary">
                {open.version} · {open.pages} page{open.pages === 1 ? '' : 's'} · {fileSize(open.sizeKb)}
              </Text>
            </View>
            <Text variant="callout">{open.summary}</Text>
          </View>
        ) : null}
      </Sheet>
    </>
  );
}

export default function FacultyDocumentsScreen() {
  const scope = useFacultyScope();
  const docs = [...scope.documents].sort((a, b) => b.uploadedOn.localeCompare(a.uploadedOn));
  return (
    <Screen title="Documents" subtitle="Agreements, itineraries and programme files shared with you.">
      <DocumentList docs={docs} />
    </Screen>
  );
}
