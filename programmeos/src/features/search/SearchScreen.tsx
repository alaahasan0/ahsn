import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Chip, ChipRow, EmptyState, FileIcon, ListGroup, ListRow, NoResults, Screen, SearchField, Section, StatusPill, Text, Touchable } from '@/components';
import { facultyName, getProgramme, learnerName } from '@/data/selectors';
import { useDB } from '@/data/store';
import { formatDate } from '@/utils/dates';
import { searchMatch } from '@/utils/format';

const RECENT = ['Executive Leadership', 'Creekside Grand', 'Prof. Vasquez', 'hotel deposit'];
type Scope = 'all' | 'programmes' | 'people' | 'tasks' | 'documents' | 'sessions';

/** Global search across every record type — one source of truth, one search box. */
export default function SearchScreen() {
  const db = useDB();
  const [q, setQ] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const has = q.trim().length > 1;
  const programmes = has ? db.programmes.filter((p) => searchMatch(q, p.name, p.code, p.shortName, p.location, ...p.tags)) : [];
  const faculty = has ? db.faculty.filter((f) => searchMatch(q, f.name, f.honorific, f.institution, ...f.expertise)) : [];
  const learners = has ? db.learners.filter((l) => searchMatch(q, l.firstName, l.lastName, l.organisation, l.jobTitle)) : [];
  const staff = has ? db.staff.filter((s) => searchMatch(q, s.name, s.title, s.team)) : [];
  const tasks = has ? db.tasks.filter((t) => searchMatch(q, t.title, t.description)) : [];
  const docs = has ? db.documents.filter((d) => searchMatch(q, d.title, d.kind, d.summary)) : [];
  const sessions = has ? db.sessions.filter((s) => searchMatch(q, s.title, s.location, s.roomName)) : [];
  const hotels = has ? db.hotels.filter((h) => searchMatch(q, h.name, h.city)) : [];
  const total = programmes.length + faculty.length + learners.length + staff.length + tasks.length + docs.length + sessions.length + hotels.length;
  const show = (s: Scope) => scope === 'all' || scope === s;

  return (
    <Screen
      title="Search"
      large={false}
      headerBelow={
        <>
          <SearchField value={q} onChangeText={setQ} placeholder="Programmes, people, tasks, documents…" autoFocus />
          <ChipRow>
            {(['all', 'programmes', 'people', 'tasks', 'documents', 'sessions'] as Scope[]).map((s) => (
              <Chip key={s} label={s[0].toUpperCase() + s.slice(1)} selected={scope === s} onPress={() => setScope(s)} />
            ))}
          </ChipRow>
        </>
      }>
      {!has ? (
        <Section title="Recent searches" first>
          <View style={{ gap: 4 }}>
            {RECENT.map((r) => (
              <Touchable key={r} onPress={() => setQ(r)} style={{ paddingVertical: 10 }}>
                <Text tone="accent">{r}</Text>
              </Touchable>
            ))}
          </View>
        </Section>
      ) : !total ? (
        <NoResults query={q} onClear={() => setQ('')} />
      ) : (
        <>
          <Text variant="footnote" tone="tertiary">
            {total} result{total === 1 ? '' : 's'}
          </Text>
          {show('programmes') && programmes.length ? (
            <Section title="Programmes">
              <ListGroup>
                {programmes.map((p) => (
                  <ListRow key={p.id} icon="layers" iconTone="violet" title={p.name} subtitle={`${p.code} · ${formatDate(p.startDate)}`} onPress={() => router.push(`/programme/${p.id}` as Href)} />
                ))}
              </ListGroup>
            </Section>
          ) : null}
          {show('people') && faculty.length + learners.length + staff.length ? (
            <Section title="People">
              <ListGroup>
                {staff.map((s) => (
                  <ListRow key={s.id} leading={<Avatar name={s.name} hue={s.avatarHue} size={32} />} title={s.name} subtitle={`Staff · ${s.title}`} onPress={() => router.push(`/person/${s.id}` as Href)} />
                ))}
                {faculty.map((f) => (
                  <ListRow key={f.id} leading={<Avatar name={f.name} hue={f.avatarHue} size={32} />} title={facultyName(f)} subtitle={`Faculty · ${f.institution}`} onPress={() => router.push(`/faculty/${f.id}` as Href)} />
                ))}
                {learners.slice(0, 12).map((l) => (
                  <ListRow key={l.id} leading={<Avatar name={learnerName(l)} hue={l.avatarHue} size={32} />} title={learnerName(l)} subtitle={`Learner · ${l.organisation}`} onPress={() => router.push(`/learner/${l.id}` as Href)} />
                ))}
              </ListGroup>
            </Section>
          ) : null}
          {show('tasks') && tasks.length ? (
            <Section title="Tasks">
              <ListGroup>
                {tasks.map((t) => (
                  <ListRow key={t.id} icon="square-check-big" iconTone="accent" title={t.title} subtitle={getProgramme(db, t.programmeId)?.shortName} trailing={<StatusPill label={t.status} />} onPress={() => router.push(`/task/${t.id}` as Href)} />
                ))}
              </ListGroup>
            </Section>
          ) : null}
          {show('documents') && docs.length ? (
            <Section title="Documents">
              <ListGroup>
                {docs.map((d) => (
                  <ListRow key={d.id} leading={<FileIcon format={d.format} size={32} />} title={d.title} subtitle={d.kind} onPress={() => router.push(`/document/${d.id}` as Href)} />
                ))}
              </ListGroup>
            </Section>
          ) : null}
          {show('sessions') && sessions.length ? (
            <Section title="Sessions">
              <ListGroup>
                {sessions.map((s) => (
                  <ListRow key={s.id} icon="calendar-days" iconTone="info" title={s.title} subtitle={`${getProgramme(db, s.programmeId)?.shortName} · ${formatDate(s.date)}`} onPress={() => router.push(`/session/${s.id}` as Href)} />
                ))}
              </ListGroup>
            </Section>
          ) : null}
          {scope === 'all' && hotels.length ? (
            <Section title="Hotels">
              <ListGroup>
                {hotels.map((h) => (
                  <ListRow key={h.id} icon="hotel" iconTone="info" title={h.name} subtitle={h.city} onPress={() => router.push(`/hotel/${h.id}` as Href)} />
                ))}
              </ListGroup>
            </Section>
          ) : null}
        </>
      )}
      {has && total > 0 && scope !== 'all' && ![programmes, [...faculty, ...learners, ...staff], tasks, docs, sessions][['programmes', 'people', 'tasks', 'documents', 'sessions'].indexOf(scope)]?.length ? <EmptyState icon="search" title={`No ${scope} match`} message="Try All to see other record types." compact /> : null}
    </Screen>
  );
}
