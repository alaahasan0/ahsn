import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Card, EmptyState, FileIcon, Icon, Screen, Section, StatusPill, Text, Touchable } from '@/components';
import { getProgramme, getStaff, personName } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { activityStamp, dueLabel, formatDate } from '@/utils/dates';
import { fileSize } from '@/utils/format';

import { InfoTile, TileRow } from './common';
import { useFacultyScope } from './data';

export default function FacultyMaterialsScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const scope = useFacultyScope();
  const [expanded, setExpanded] = useState<string | null>(null);
  const done = scope.materials.filter((m) => ['Approved', 'Published'].includes(m.status)).length;
  const inReview = scope.materials.filter((m) => ['Submitted', 'Under Review'].includes(m.status)).length;
  const action = scope.materials.filter((m) => ['Not Submitted', 'Draft', 'Changes Requested'].includes(m.status)).length;
  const byProgramme = scope.programmeIds.map((pid) => ({ p: getProgramme(db, pid)!, items: scope.materials.filter((m) => m.programmeId === pid) })).filter((g) => g.items.length);

  return (
    <Screen title="Learning materials" subtitle="Everything you’ve submitted, with review status and comments." headerRight={<Button title="Upload" icon="upload" size="sm" variant="tinted" onPress={() => router.push('/fm/upload')} />}>
      <TileRow>
        <InfoTile icon="badge-check" label="Approved" value={`${done}`} tone="success" />
        <InfoTile icon="hourglass" label="In review" value={`${inReview}`} tone="violet" />
        <InfoTile icon="file-warning" label="Action needed" value={`${action}`} tone="warning" />
      </TileRow>
      {byProgramme.length ? (
        byProgramme.map(({ p, items }) => (
          <Section key={p.id} title={p.name}>
            <View style={{ gap: 10 }}>
              {items.map((m) => {
                const latest = m.versions[m.versions.length - 1];
                const lastComment = m.comments[m.comments.length - 1];
                const needs = ['Not Submitted', 'Draft', 'Changes Requested'].includes(m.status);
                const due = dueLabel(m.dueDate);
                const open = expanded === m.id;
                return (
                  <Card key={m.id} style={{ gap: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <FileIcon format={m.format} size={42} />
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text variant="headline">{m.title}</Text>
                        <Text variant="footnote" tone="secondary">
                          {m.kind} · {latest ? `${latest.label} ${latest.stage} · ${fileSize(latest.sizeKb)}` : 'No file submitted yet'}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <StatusPill label={m.status} />
                      <Text variant="footnote" tone={needs && due.tone !== 'neutral' ? due.tone : 'tertiary'}>
                        {needs ? due.text : `Due ${formatDate(m.dueDate, { year: false })}`}
                      </Text>
                    </View>
                    {lastComment ? (
                      <View style={{ flexDirection: 'row', gap: 10, padding: 10, borderRadius: 10, backgroundColor: m.status === 'Changes Requested' ? colors.warningSoft : colors.surfaceAlt }}>
                        <Avatar name={personName(db, lastComment.authorId)} hue={getStaff(db, lastComment.authorId)?.avatarHue} size={26} />
                        <View style={{ flex: 1 }}>
                          <Text variant="footnote" weight="semibold">
                            {personName(db, lastComment.authorId)} · {activityStamp(lastComment.date)}
                          </Text>
                          <Text variant="footnote" tone="secondary">
                            {lastComment.text}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                    {m.versions.length ? (
                      <Touchable onPress={() => setExpanded(open ? null : m.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityLabel="Version history">
                        <Icon name="history" size={14} tone="accent" />
                        <Text variant="label" tone="accent">
                          {open ? 'Hide versions' : `${m.versions.length} version${m.versions.length === 1 ? '' : 's'}`}
                        </Text>
                      </Touchable>
                    ) : null}
                    {open ? (
                      <View style={{ gap: 8, paddingLeft: 4 }}>
                        {[...m.versions].reverse().map((v) => (
                          <View key={v.id} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                            <StatusPill label={v.label} tone={v.stage === 'Final' ? 'success' : v.stage === 'Revised' ? 'info' : 'neutral'} dot={false} />
                            <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={2}>
                              {v.stage} · {formatDate(v.date, { year: false })} · {v.note}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {m.status !== 'Published' ? <Button title={needs ? 'Upload file' : 'Upload new version'} icon="upload" size="sm" variant={needs ? 'primary' : 'secondary'} onPress={() => router.push(`/fm/upload?material=${m.id}`)} /> : null}
                  </Card>
                );
              })}
            </View>
          </Section>
        ))
      ) : (
        <EmptyState icon="book-open" title="No materials yet" message="When a programme asks for slides, readings or cases, they’ll appear here." />
      )}
    </Screen>
  );
}
