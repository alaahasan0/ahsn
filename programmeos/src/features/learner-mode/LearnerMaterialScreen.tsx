import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, DocumentPage, EmptyState, ListGroup, ListRow, Screen, Section, Tag, Text, useToast } from '@/components';
import { facultyName, getFaculty, getProgramme, getSession } from '@/data/selectors';
import { useDB } from '@/data/store';
import { formatDate } from '@/utils/dates';
import { fileSize } from '@/utils/format';

import { useLearnerScope } from './data';

export default function LearnerMaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const toast = useToast();
  const scope = useLearnerScope();
  const m = scope.materials.find((x) => x.id === id);
  if (!m) {
    return (
      <Screen title="Material">
        <EmptyState icon="lock" title="Not yet available" message="This material hasn’t been published to learners yet." />
      </Screen>
    );
  }
  const v = m.versions[m.versions.length - 1];
  const session = getSession(db, m.sessionId);
  const author = getFaculty(db, m.ownerFacultyId);
  const mod = db.modules.find((x) => x.id === m.moduleId);
  return (
    <Screen
      title={m.title}
      eyebrow={getProgramme(db, m.programmeId)?.name}
      footer={
        <>
          <Button title="Share" icon="share-2" variant="secondary" style={{ flex: 1 }} onPress={() => toast.show({ message: 'Only participants can open this link', detail: 'Materials are licensed for your personal learning.', icon: 'lock', tone: 'neutral' })} />
          <Button title="Download" icon="download" style={{ flex: 2 }} onPress={() => toast.show({ message: 'Saved for offline reading', detail: `${m.title} · ${v ? fileSize(v.sizeKb) : ''}`, icon: 'download' })} />
        </>
      }>
      <DocumentPage title={m.title} format={m.format} subtitle={`${facultyName(author)} · ${mod?.title ?? ''}`} lines={14} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
        <Tag label={m.kind} />
        <Tag label={m.format} />
        {v?.pages ? <Tag label={`${v.pages} pages`} /> : null}
        {v ? <Tag label={`Updated ${formatDate(v.date, { year: false })}`} /> : null}
      </View>
      <Text variant="callout" tone="secondary" style={{ marginTop: 12 }}>
        Prepared by {facultyName(author)} for {mod ? `Module ${mod.order}: ${mod.title}` : 'this programme'}. Please read before the session — your faculty will build on it in class.
      </Text>
      {session ? (
        <Section title="Used in">
          <ListGroup>
            <ListRow icon="calendar-days" title={session.title} subtitle={formatDate(session.date, { weekday: true })} onPress={() => router.push(`/lm/session/${session.id}`)} />
          </ListGroup>
        </Section>
      ) : null}
    </Screen>
  );
}
