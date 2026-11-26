import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Card, EmptyState, Icon, Screen, SegmentedControl, StatusPill, Text } from '@/components';
import { getClient, programmePhase } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { countdown, formatRange } from '@/utils/dates';

import { MODE_ICON } from './common';
import { READY_STATUSES, useFacultyScope } from './data';

export default function FacultyProgrammesScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const scope = useFacultyScope();
  const [tab, setTab] = useState<'current' | 'past'>('current');
  const rows = scope.programmes
    .map((p) => ({ p, a: scope.assignments.find((a) => a.programmeId === p.id)! }))
    .filter(({ p }) => (tab === 'current' ? ['upcoming', 'in_delivery'].includes(programmePhase(p)) : ['completed', 'archived'].includes(programmePhase(p))))
    .sort((x, y) => (tab === 'current' ? x.p.startDate.localeCompare(y.p.startDate) : y.p.startDate.localeCompare(x.p.startDate)));

  const counts = {
    current: scope.programmes.filter((p) => ['upcoming', 'in_delivery'].includes(programmePhase(p))).length,
    past: scope.programmes.filter((p) => ['completed', 'archived'].includes(programmePhase(p))).length,
  };

  return (
    <Screen
      title="My Programmes"
      subtitle="Programmes you teach on with Emeritus."
      back={false}
      headerBelow={
        <SegmentedControl
          options={[
            { value: 'current', label: 'Current & upcoming', count: counts.current },
            { value: 'past', label: 'Past', count: counts.past },
          ]}
          value={tab}
          onChange={setTab}
        />
      }>
      <View style={{ gap: 10 }}>
        {rows.length ? (
          rows.map(({ p, a }) => {
            const phase = programmePhase(p);
            const mySessions = scope.sessions.filter((s) => s.programmeId === p.id);
            const ready = READY_STATUSES.includes(a.status);
            return (
              <Card key={p.id} onPress={() => router.push(`/fm/programme/${p.id}`)} accessibilityLabel={p.name} style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: `hsl(${p.accentHue}, 62%, 58%)` }} />
                  <Text variant="caption" tone="tertiary" style={{ flex: 1 }} numberOfLines={1}>
                    {getClient(db, p.clientId)?.name}
                  </Text>
                  <StatusPill label={ready ? (phase === 'completed' || phase === 'archived' ? 'Delivered' : 'Confirmed') : a.status} tone={ready ? 'success' : a.status === 'Declined' ? 'danger' : 'warning'} />
                </View>
                <Text variant="title3">{p.name}</Text>
                <View style={{ gap: 6 }}>
                  <Row icon="calendar" text={`${formatRange(p.startDate, p.endDate)}${phase === 'upcoming' ? ` · ${countdown(p.startDate)}` : phase === 'in_delivery' ? ' · in delivery' : ''}`} />
                  <Row icon={MODE_ICON[p.deliveryMode]} text={p.location} />
                  <Row icon="briefcase" text={`${a.role} · ${a.days} day${a.days === 1 ? '' : 's'} · ${mySessions.length} session${mySessions.length === 1 ? '' : 's'}`} />
                </View>
                {!ready && a.status !== 'Declined' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 10, backgroundColor: colors.warningSoft }}>
                    <Icon name="mail-open" size={15} tone="warning" />
                    <Text variant="footnote" tone="warning" style={{ flex: 1 }}>
                      Awaiting your response — open to accept or decline.
                    </Text>
                  </View>
                ) : null}
              </Card>
            );
          })
        ) : (
          <EmptyState icon="layers" title={tab === 'current' ? 'No current programmes' : 'No past programmes'} message="Programmes appear here once you are assigned." />
        )}
      </View>
    </Screen>
  );
}

function Row({ icon, text }: { icon: Parameters<typeof Icon>[0]['name']; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name={icon} size={14} tone="tertiary" />
      <Text variant="subhead" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
