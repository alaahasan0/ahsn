import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Card, EmptyState, FileIcon, ListGroup, ListRow, NoResults, Screen, SearchField, Section, Text } from '@/components';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { formatDate } from '@/utils/dates';
import { searchMatch } from '@/utils/format';

import { useLearnerScope } from './data';

export default function LearnerMaterialsScreen() {
  const db = useDB();
  const scope = useLearnerScope();
  const [q, setQ] = useState('');
  const programmeIds = [...new Set(scope.materials.map((m) => m.programmeId))];
  const modules = db.modules.filter((m) => scope.activeIds.includes(m.programmeId) && (programmeIds.includes(m.programmeId) || m.programmeId === scope.currentProgramme?.id)).sort((a, b) => a.programmeId.localeCompare(b.programmeId) || a.order - b.order);
  const matches = scope.materials.filter((m) => searchMatch(q, m.title, m.kind));
  const briefs = scope.assignments.filter((a) => searchMatch(q, a.title, 'assignment brief'));

  return (
    <Screen title="Materials" subtitle="Slides, readings and cases shared by your faculty." back={false} headerBelow={<SearchField value={q} onChangeText={setQ} placeholder="Search materials" />}>
      {!scope.materials.length && !scope.assignments.length ? (
        <EmptyState icon="book-open" title="No materials yet" message="Materials appear here as faculty publish them, usually a week before each session." />
      ) : q && !matches.length && !briefs.length ? (
        <NoResults query={q} onClear={() => setQ('')} />
      ) : (
        <>
          {modules.map((mod) => {
            const items = matches.filter((m) => m.moduleId === mod.id);
            if (q && !items.length) return null;
            return (
              <Section key={mod.id} title={`Module ${mod.order} · ${mod.title}`} subtitle={getProgramme(db, mod.programmeId)?.shortName !== scope.currentProgramme?.shortName ? getProgramme(db, mod.programmeId)?.name : undefined}>
                {items.length ? (
                  <ListGroup>
                    {items.map((m) => (
                      <ListRow key={m.id} leading={<FileIcon format={m.format} size={38} />} title={m.title} subtitle={`${m.kind} · ${m.format}`} meta={`Published ${formatDate(m.versions[m.versions.length - 1]?.date ?? m.dueDate, { year: false })}`} onPress={() => router.push(`/lm/material/${m.id}`)} />
                    ))}
                  </ListGroup>
                ) : (
                  <Card variant="alt" padding="sm">
                    <Text variant="footnote" tone="secondary">
                      Materials for this module will be shared before its first session ({formatDate(mod.startDate, { year: false })}).
                    </Text>
                  </Card>
                )}
              </Section>
            );
          })}
          {briefs.length ? (
            <Section title="Assignment briefs">
              <ListGroup>
                {briefs.map((a) => (
                  <ListRow key={a.id} leading={<FileIcon format="DOCX" size={38} />} title={a.title} subtitle={`${a.kind} · ${a.weight}% of final grade`} meta={`Due ${formatDate(a.dueDate, { year: false })}`} onPress={() => router.push(`/lm/assignment/${a.id}`)} />
                ))}
              </ListGroup>
            </Section>
          ) : null}
          <View style={{ height: 8 }} />
        </>
      )}
    </Screen>
  );
}
