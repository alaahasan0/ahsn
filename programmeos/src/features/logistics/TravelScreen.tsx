import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Chip, ChipRow, Icon, Legend, ListGroup, ListRow, NoFilterResults, NoResults, Screen, SearchField, Section, SegmentBar, SegmentedControl, StatusPill, Text, Card } from '@/components';
import type { TravelItinerary } from '@/data/models';
import { getProgramme, personName } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/dates';
import { searchMatch } from '@/utils/format';

import { LoadGate } from '../shared/Widgets';
import { PersonCell, READY_TRAVEL, routeSummary } from './components';

type Who = 'all' | 'faculty' | 'learner';

export default function TravelScreen() {
  const params = useLocalSearchParams<{ programme?: string }>();
  const db = useDB();
  const { colors } = useTheme();
  const [who, setWho] = useState<Who>('all');
  const [programme, setProgramme] = useState<string | undefined>(params.programme);
  const [q, setQ] = useState('');

  const programmeIds = [...new Set(db.itineraries.map((t) => t.programmeId))];
  const scoped = db.itineraries.filter((t) => (!programme || t.programmeId === programme) && (who === 'all' || t.traveller.kind === who));
  const list = scoped.filter((t) => searchMatch(q, personName(db, t.traveller.id), routeSummary(t), getProgramme(db, t.programmeId)?.shortName));
  const needs = list.filter((t) => !READY_TRAVEL.includes(t.status));
  const ready = list.filter((t) => READY_TRAVEL.includes(t.status));

  const count = (statuses: TravelItinerary['status'][]) => scoped.filter((t) => statuses.includes(t.status)).length;
  const booked = count(['Booked', 'Ticketed', 'Completed']);
  const options = count(['Options Sent', 'Requested', 'Changed']);
  const missing = count(['Missing']);
  const transfers = list.flatMap((t) => t.transfers.map((tr) => ({ ...tr, traveller: t.traveller, itineraryId: t.id }))).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const row = (t: TravelItinerary) => {
    const prog = getProgramme(db, t.programmeId);
    return (
      <ListRow
        key={t.id}
        leading={<PersonCell db={db} person={t.traveller} />}
        title={personName(db, t.traveller.id)}
        subtitle={`${routeSummary(t)}${programme ? '' : ` · ${prog?.shortName}`}`}
        meta={t.visaRequired && t.visaStatus !== 'Issued' ? 'Visa in progress' : t.notes}
        trailing={<StatusPill label={t.status} />}
        onPress={() => router.push(`/travel/${t.id}`)}
      />
    );
  };

  return (
    <Screen
      title="Travel"
      subtitle="Flights, transfers and visas for faculty and participants"
      refreshable
      headerBelow={
        <>
          <SegmentedControl
            options={[
              { value: 'all', label: 'All' },
              { value: 'faculty', label: 'Faculty' },
              { value: 'learner', label: 'Learners' },
            ]}
            value={who}
            onChange={setWho}
          />
          <ChipRow>
            <Chip label="All programmes" selected={!programme} onPress={() => setProgramme(undefined)} />
            {programmeIds.map((id) => (
              <Chip key={id} label={getProgramme(db, id)?.shortName ?? id} selected={programme === id} onPress={() => setProgramme(programme === id ? undefined : id)} count={db.itineraries.filter((t) => t.programmeId === id).length} />
            ))}
          </ChipRow>
        </>
      }>
      <LoadGate loadKey="travel">
        <Card padding="md" style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text variant="headline">
              {booked} of {scoped.length} booked
            </Text>
            <Text variant="footnote" tone="secondary">
              {scoped.length ? Math.round((booked / scoped.length) * 100) : 0}% ready
            </Text>
          </View>
          <SegmentBar
            segments={[
              { value: booked, color: colors.success },
              { value: options, color: colors.warning },
              { value: missing, color: colors.danger },
            ]}
          />
          <Legend
            items={[
              { label: `Booked ${booked}`, color: colors.success },
              { label: `In progress ${options}`, color: colors.warning },
              { label: `Missing ${missing}`, color: colors.danger },
            ]}
          />
        </Card>

        <SearchField value={q} onChangeText={setQ} placeholder="Search travellers or routes" style={{ marginTop: 14 }} />

        {!scoped.length ? (
          <NoFilterResults onReset={() => { setWho('all'); setProgramme(undefined); }} />
        ) : !list.length ? (
          <NoResults query={q} onClear={() => setQ('')} />
        ) : (
          <>
            {needs.length ? (
              <Section title="Needs action" subtitle={`${needs.length} traveller${needs.length === 1 ? '' : 's'} without confirmed flights`}>
                <ListGroup>{needs.map(row)}</ListGroup>
              </Section>
            ) : null}
            {ready.length ? (
              <Section title="Booked">
                <ListGroup>{ready.map(row)}</ListGroup>
              </Section>
            ) : null}
            <Section title="Airport transfers" subtitle={transfers.length ? `${transfers.length} scheduled` : undefined}>
              {transfers.length ? (
                <ListGroup>
                  {transfers.slice(0, 12).map((tr) => (
                    <ListRow
                      key={tr.id}
                      leading={
                        <View style={{ width: 44, alignItems: 'center' }}>
                          <Text variant="caption" tone="tertiary">
                            {formatDate(tr.date, { year: false })}
                          </Text>
                          <Text variant="headline" tabular>
                            {tr.time}
                          </Text>
                        </View>
                      }
                      title={personName(db, tr.traveller.id)}
                      subtitle={`${tr.from} → ${tr.to}`}
                      meta={tr.provider}
                      trailing={<StatusPill label={tr.status} tone={tr.status === 'Booked' ? 'success' : 'warning'} />}
                      onPress={() => router.push(`/travel/${tr.itineraryId}`)}
                    />
                  ))}
                </ListGroup>
              ) : (
                <Card>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Icon name="car" size={18} tone="tertiary" />
                    <Text tone="secondary">Transfers appear here once flights are ticketed.</Text>
                  </View>
                </Card>
              )}
            </Section>
          </>
        )}
      </LoadGate>
    </Screen>
  );
}
