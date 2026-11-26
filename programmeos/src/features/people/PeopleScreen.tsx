import { router } from 'expo-router';
import { useState } from 'react';

import { Avatar, EmptyState, ListGroup, ListRow, Monogram, NoResults, Screen, SearchField, SegmentedControl, StatusPill } from '@/components';
import { facultyName, learnerName } from '@/data/selectors';
import { useDB } from '@/data/store';
import { searchMatch } from '@/utils/format';

import { LoadGate } from '../shared/Widgets';

type Seg = 'staff' | 'faculty' | 'learners' | 'contacts';

/** Everyone ProgrammeOS knows about, in one place. */
export default function PeopleScreen() {
  const db = useDB();
  const [seg, setSeg] = useState<Seg>('staff');
  const [q, setQ] = useState('');

  const staff = db.staff.filter((s) => searchMatch(q, s.name, s.title, s.team, s.location, db.roles.find((r) => r.key === s.role)?.label));
  const faculty = db.faculty.filter((f) => searchMatch(q, f.name, f.title, f.institution, ...f.expertise));
  const learners = db.learners.filter((l) => searchMatch(q, l.firstName, l.lastName, l.jobTitle, l.organisation)).sort((a, b) => a.firstName.localeCompare(b.firstName));
  const contacts = db.clientContacts.filter((c) => searchMatch(q, c.name, c.title, db.clients.find((x) => x.id === c.clientId)?.name));
  const counts = { staff: staff.length, faculty: faculty.length, learners: learners.length, contacts: contacts.length };
  const current = counts[seg];

  return (
    <Screen
      title="People"
      subtitle={`${db.staff.length + db.faculty.length + db.learners.length + db.clientContacts.length} people across the organisation`}
      headerBelow={
        <>
          <SearchField value={q} onChangeText={setQ} placeholder="Search everyone" />
          <SegmentedControl<Seg>
            size="sm"
            value={seg}
            onChange={setSeg}
            options={[
              { value: 'staff', label: 'Staff', count: counts.staff },
              { value: 'faculty', label: 'Faculty', count: counts.faculty },
              { value: 'learners', label: 'Learners', count: counts.learners },
              { value: 'contacts', label: 'Clients', count: counts.contacts },
            ]}
          />
        </>
      }>
      <LoadGate loadKey="people">
        {current ? (
          <ListGroup style={{ marginTop: 4 }}>
            {seg === 'staff'
              ? staff.map((s) => <ListRow key={s.id} leading={<Avatar name={s.name} hue={s.avatarHue} initials={s.initials} size={38} />} title={s.name} subtitle={s.title} meta={`${db.roles.find((r) => r.key === s.role)?.label} · ${s.location}`} onPress={() => router.push(`/person/${s.id}`)} />)
              : seg === 'faculty'
                ? faculty.map((f) => <ListRow key={f.id} leading={<Avatar name={f.name} hue={f.avatarHue} initials={f.initials} size={38} />} title={facultyName(f)} subtitle={`${f.title} · ${f.institution}`} onPress={() => router.push(`/faculty/${f.id}`)} />)
                : seg === 'learners'
                  ? learners.map((l) => <ListRow key={l.id} leading={<Avatar name={learnerName(l)} hue={l.avatarHue} initials={l.initials} size={38} />} title={learnerName(l)} subtitle={`${l.jobTitle} · ${l.organisation}`} onPress={() => router.push(`/learner/${l.id}`)} />)
                  : contacts.map((c) => {
                      const client = db.clients.find((x) => x.id === c.clientId);
                      return <ListRow key={c.id} leading={<Monogram name={client?.name ?? c.name} hue={client?.logoHue} size={38} />} title={c.name} subtitle={`${c.title} · ${client?.shortName}`} trailing={c.approver ? <StatusPill label="Approver" tone="violet" dot={false} /> : undefined} onPress={() => router.push(`/client/${c.clientId}`)} />;
                    })}
          </ListGroup>
        ) : q ? (
          <NoResults query={q} onClear={() => setQ('')} />
        ) : (
          <EmptyState icon="users" title="Nobody here yet" />
        )}
      </LoadGate>
    </Screen>
  );
}
