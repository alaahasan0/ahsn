import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Card, Chip, EmptyState, HeaderActions, Icon, IconButton, IconTile, ListGroup, ListRow, NoFilterResults, NoResults, Screen, SearchField, Sheet, Text, Touchable } from '@/components';
import type { EnrollmentStatus } from '@/data/models';
import { learnerName } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { searchMatch } from '@/utils/format';

import { LoadGate } from '../shared/Widgets';

const STATUSES: EnrollmentStatus[] = ['Nominated', 'Invited', 'Registered', 'Confirmed', 'Attending', 'Completed', 'Waitlisted', 'Withdrawn'];

export default function LearnerDirectoryScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const [q, setQ] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [programmes, setProgrammes] = useState<string[]>([]);
  const [orgs, setOrgs] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<EnrollmentStatus[]>([]);

  const toggle = <T,>(list: T[], v: T, set: (l: T[]) => void) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const filterCount = programmes.length + orgs.length + statuses.length;
  const orgOptions = [...new Set(db.learners.map((l) => (l.clientId ? db.clients.find((c) => c.id === l.clientId)?.shortName ?? l.organisation : 'Open enrolment')))];
  const progOptions = db.programmes.filter((p) => db.enrollments.some((e) => e.programmeId === p.id));

  const base = db.learners.filter((l) => searchMatch(q, l.firstName, l.lastName, l.jobTitle, l.organisation, l.country, l.email));
  const list = base
    .filter((l) => {
      const ens = db.enrollments.filter((e) => e.learnerId === l.id);
      const org = l.clientId ? db.clients.find((c) => c.id === l.clientId)?.shortName ?? l.organisation : 'Open enrolment';
      if (orgs.length && !orgs.includes(org)) return false;
      if (programmes.length || statuses.length) {
        return ens.some((e) => (!programmes.length || programmes.includes(e.programmeId)) && (!statuses.length || statuses.includes(e.status)));
      }
      return true;
    })
    .sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName));

  const groups = list.reduce<Record<string, typeof list>>((acc, l) => {
    const k = l.firstName[0].toUpperCase();
    (acc[k] ??= []).push(l);
    return acc;
  }, {});
  const nominations = db.enrollments.filter((e) => e.status === 'Nominated' || e.status === 'Waitlisted').length;
  const invited = db.enrollments.filter((e) => e.status === 'Invited').length;

  const reset = () => {
    setProgrammes([]);
    setOrgs([]);
    setStatuses([]);
  };

  return (
    <Screen
      title="Learners"
      subtitle={`${db.learners.length} people · ${db.enrollments.length} programme enrolments`}
      headerRight={
        <HeaderActions>
          <IconButton icon="import" accessibilityLabel="Import participants" onPress={() => router.push('/learners/import')} />
          <IconButton icon="user-plus" accessibilityLabel="Register participant" onPress={() => router.push('/learners/register')} />
        </HeaderActions>
      }
      headerBelow={<SearchField value={q} onChangeText={setQ} placeholder="Search name, organisation, role" onFilterPress={() => setFilterOpen(true)} filterCount={filterCount} />}>
      <LoadGate loadKey="learner-directory">
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <Touchable onPress={() => router.push('/learners/nominations')} feedback="scale" style={{ flex: 1 }} accessibilityLabel={`${nominations} nominations awaiting review`}>
            <Card style={{ gap: 8 }}>
              <IconTile icon="user-check" tone="warning" />
              <Text variant="metricSm" tabular>
                {nominations}
              </Text>
              <Text variant="footnote" tone="secondary">
                Nominations to review
              </Text>
            </Card>
          </Touchable>
          <Touchable onPress={() => router.push('/learners/nominations?status=Invited')} feedback="scale" style={{ flex: 1 }} accessibilityLabel={`${invited} invited, not registered`}>
            <Card style={{ gap: 8 }}>
              <IconTile icon="mail-open" tone="accent" />
              <Text variant="metricSm" tabular>
                {invited}
              </Text>
              <Text variant="footnote" tone="secondary">
                Invited, not registered
              </Text>
            </Card>
          </Touchable>
        </View>

        {filterCount ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {programmes.map((p) => (
              <Chip key={p} label={db.programmes.find((x) => x.id === p)?.shortName ?? p} selected onRemove={() => toggle(programmes, p, setProgrammes)} />
            ))}
            {orgs.map((o) => (
              <Chip key={o} label={o} selected onRemove={() => toggle(orgs, o, setOrgs)} />
            ))}
            {statuses.map((s) => (
              <Chip key={s} label={s} selected onRemove={() => toggle(statuses, s, setStatuses)} />
            ))}
          </View>
        ) : null}

        {list.length ? (
          <View style={{ gap: 6, marginTop: 18 }}>
            {Object.keys(groups).map((letter) => (
              <View key={letter} style={{ gap: 6, marginBottom: 10 }}>
                <Text variant="overline" tone="tertiary" style={{ paddingHorizontal: 4 }} accessibilityRole="header">
                  {letter}
                </Text>
                <ListGroup>
                  {groups[letter].map((l) => {
                    const count = db.enrollments.filter((e) => e.learnerId === l.id).length;
                    return (
                      <ListRow
                        key={l.id}
                        leading={<Avatar name={learnerName(l)} hue={l.avatarHue} initials={l.initials} size={38} />}
                        title={learnerName(l)}
                        subtitle={`${l.jobTitle} · ${l.organisation}`}
                        trailing={
                          <View style={{ alignItems: 'flex-end', gap: 4 }}>
                            <Text variant="caption" tone="secondary" tabular>
                              {count} {count === 1 ? 'programme' : 'programmes'}
                            </Text>
                            {l.accessibility ? <Icon name="accessibility" size={14} tone="accent" /> : null}
                          </View>
                        }
                        onPress={() => router.push(`/learner/${l.id}`)}
                      />
                    );
                  })}
                </ListGroup>
              </View>
            ))}
          </View>
        ) : !db.learners.length ? (
          <EmptyState icon="graduation-cap" title="No learners yet" message="Register participants or import a nomination list." actionLabel="Import list" onAction={() => router.push('/learners/import')} />
        ) : !base.length ? (
          <NoResults query={q} onClear={() => setQ('')} />
        ) : (
          <NoFilterResults onReset={reset} />
        )}
      </LoadGate>

      <Sheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter learners"
        size="large"
        footer={
          <>
            <Button title="Reset" variant="secondary" onPress={reset} style={{ flex: 1 }} />
            <Button title={`Show ${list.length}`} onPress={() => setFilterOpen(false)} style={{ flex: 2 }} />
          </>
        }>
        <View style={{ gap: 20 }}>
          <FilterGroup title="Programme">
            {progOptions.map((p) => (
              <Chip key={p.id} label={p.shortName} selected={programmes.includes(p.id)} onPress={() => toggle(programmes, p.id, setProgrammes)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Organisation">
            {orgOptions.map((o) => (
              <Chip key={o} label={o} selected={orgs.includes(o)} onPress={() => toggle(orgs, o, setOrgs)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Enrolment status">
            {STATUSES.map((s) => (
              <Chip key={s} label={s} selected={statuses.includes(s)} onPress={() => toggle(statuses, s, setStatuses)} />
            ))}
          </FilterGroup>
          <Text variant="footnote" tone="tertiary" style={{ color: colors.textTertiary }}>
            A learner matches when any of their enrolments matches the programme and status filters.
          </Text>
        </View>
      </Sheet>
    </Screen>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text variant="overline" tone="tertiary">
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );
}
