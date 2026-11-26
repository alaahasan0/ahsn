import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Card, EmptyState, HeaderActions, Icon, IconButton, ListGroup, Screen, SearchField, Section, Text, toneColors, toneForStatus, Touchable } from '@/components';
import type { MaterialStatus } from '@/data/models';
import { facultyName, getFaculty, programmePhase } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { formatRange } from '@/utils/dates';
import { searchMatch } from '@/utils/format';

import { LoadGate } from '../shared/Widgets';
import { MATERIAL_STATUSES, MaterialRow, StatusMiniBar } from './shared';

/** Academic overview: material pipeline, review queue and the Programme → Cohort → Module hierarchy. */
export default function AcademicsScreen() {
  const db = useDB();
  const { colors, isDark } = useTheme();
  const [status, setStatus] = useState<MaterialStatus | null>(null);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({ 'p-elp': true });

  const active = db.materials.filter((m) => !db.programmes.find((p) => p.id === m.programmeId)?.archived);
  const queue = active.filter((m) => m.status === 'Submitted' || m.status === 'Under Review').sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const filtered = active.filter((m) => (!status || m.status === status) && searchMatch(q, m.title, m.kind, facultyName(getFaculty(db, m.ownerFacultyId)))).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const programmes = db.programmes.filter((p) => !p.cancelled && db.modules.some((m) => m.programmeId === p.id)).sort((a, b) => (programmePhase(a) === 'completed' ? 1 : 0) - (programmePhase(b) === 'completed' ? 1 : 0) || a.startDate.localeCompare(b.startDate));

  return (
    <Screen
      title="Academics"
      subtitle={`${active.length} learning materials · ${db.modules.length} modules`}
      headerRight={
        <HeaderActions>
          <IconButton icon="upload" accessibilityLabel="Submit material" onPress={() => router.push('/material/submit')} />
        </HeaderActions>
      }>
      <LoadGate loadKey="academics">
        <Section title="Material pipeline" subtitle="Tap a stage to filter" first>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MATERIAL_STATUSES.map((s) => {
              const n = active.filter((m) => m.status === s).length;
              const sel = status === s;
              const tc = toneColors(toneForStatus(s), colors);
              return (
                <Touchable key={s} onPress={() => setStatus(sel ? null : s)} feedback="scale" accessibilityState={{ selected: sel }} accessibilityLabel={`${s}: ${n}`} style={{ flexGrow: 1, flexBasis: '46%', minHeight: 46, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: sel ? tc.bg : colors.surface, borderWidth: 1.5, borderColor: sel ? tc.solid : isDark ? colors.border : 'transparent' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s === 'Not Submitted' ? colors.borderStrong : tc.solid }} />
                  <Text variant="footnote" tone={sel ? 'primary' : 'secondary'} weight={sel ? 'semibold' : 'medium'} numberOfLines={1} style={{ flex: 1 }}>
                    {s}
                  </Text>
                  <Text variant="headline" tabular>
                    {n}
                  </Text>
                </Touchable>
              );
            })}
          </View>
        </Section>

        {!status && !q ? (
          <Section title="Review queue" subtitle={queue.length ? 'Submitted materials, earliest due first' : undefined}>
            {queue.length ? (
              <ListGroup>
                {queue.map((m) => (
                  <MaterialRow key={m.id} material={m} />
                ))}
              </ListGroup>
            ) : (
              <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Icon name="circle-check-big" size={20} tone="success" />
                <Text tone="secondary">Nothing waiting for review.</Text>
              </Card>
            )}
          </Section>
        ) : null}

        <Section title={status ? `${status}` : 'All materials'} subtitle={`${filtered.length} item${filtered.length === 1 ? '' : 's'}`} action={status ? 'Clear' : undefined} onAction={() => setStatus(null)}>
          <SearchField value={q} onChangeText={setQ} placeholder="Search materials or faculty" />
          {filtered.length ? (
            <ListGroup>
              {filtered.slice(0, status || q ? undefined : 8).map((m) => (
                <MaterialRow key={m.id} material={m} />
              ))}
            </ListGroup>
          ) : (
            <EmptyState icon="file-search" title="No materials here" message={q ? `Nothing matches “${q}”.` : `No materials are currently ${status?.toLowerCase()}.`} compact />
          )}
          {!status && !q && filtered.length > 8 ? (
            <Text variant="footnote" tone="tertiary" align="center">
              Showing 8 of {filtered.length} — choose a stage or search to see more.
            </Text>
          ) : null}
        </Section>

        <Section title="Curriculum" subtitle="Programme → Cohort → Module → Session → Materials">
          <View style={{ gap: 10 }}>
            {programmes.map((p) => {
              const expanded = !!open[p.id];
              const cohorts = db.cohorts.filter((c) => c.programmeId === p.id);
              const mats = db.materials.filter((m) => m.programmeId === p.id);
              return (
                <Card key={p.id} padding="none">
                  <Touchable onPress={() => setOpen({ ...open, [p.id]: !expanded })} style={{ padding: 14, gap: 8 }} accessibilityState={{ expanded }} accessibilityLabel={`${p.name}, ${expanded ? 'collapse' : 'expand'}`}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 8, height: 30, borderRadius: 3, backgroundColor: `hsl(${p.accentHue}, 62%, 58%)` }} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text variant="headline" numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text variant="footnote" tone="secondary">
                          {formatRange(p.startDate, p.endDate)} · {p.status.academic}
                        </Text>
                      </View>
                      <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} tone="tertiary" />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <StatusMiniBar materials={mats} />
                      <Text variant="caption" tone="tertiary" tabular>
                        {mats.filter((m) => ['Approved', 'Published'].includes(m.status)).length}/{mats.length} approved
                      </Text>
                    </View>
                  </Touchable>
                  {expanded ? (
                    <View style={{ borderTopWidth: 0.5, borderTopColor: colors.separator, paddingVertical: 6 }}>
                      {cohorts.map((c) => {
                        // Cohorts of the same programme share one curriculum.
                        const mods = db.modules.filter((m) => m.programmeId === p.id).sort((a, b) => a.order - b.order);
                        return (
                          <View key={c.id} style={{ paddingHorizontal: 14, paddingVertical: 6, gap: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Icon name="users" size={13} tone="tertiary" />
                              <Text variant="overline" tone="tertiary">
                                {c.name} · {c.size} learners{cohorts.length > 1 ? ' · shared curriculum' : ''}
                              </Text>
                            </View>
                            {mods.map((m) => {
                              const mm = db.materials.filter((x) => x.moduleId === m.id);
                              const sess = db.sessions.filter((s) => s.moduleId === m.id).length;
                              return (
                                <Touchable key={`${c.id}-${m.id}`} onPress={() => router.push(`/module/${m.id}`)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingLeft: 18, borderRadius: 10 }} accessibilityLabel={`Module ${m.order}: ${m.title}`}>
                                  <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text variant="caption" weight="semibold">
                                      {m.order}
                                    </Text>
                                  </View>
                                  <View style={{ flex: 1, minWidth: 0 }}>
                                    <Text variant="bodyStrong" numberOfLines={1}>
                                      {m.title}
                                    </Text>
                                    <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                                      {sess} session{sess === 1 ? '' : 's'} · {mm.length} material{mm.length === 1 ? '' : 's'} · {facultyName(getFaculty(db, m.leadFacultyId))}
                                    </Text>
                                  </View>
                                  <Icon name="chevron-right" size={16} tone="tertiary" />
                                </Touchable>
                              );
                            })}
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </Card>
              );
            })}
          </View>
        </Section>
      </LoadGate>
    </Screen>
  );
}
