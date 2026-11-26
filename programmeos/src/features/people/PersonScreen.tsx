import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Card, EmptyState, KeyValue, ListGroup, ListRow, Screen, Section, Stat, StatGrid, StatusPill, Text, useToast } from '@/components';
import { getStaff, groupTasks, pendingApprovalsFor, programmePhase } from '@/data/selectors';
import { useDB } from '@/data/store';
import { DEMO_NOW, formatRange, splitDateTime, timeFromMinutes, minutesOf, TIMEZONES, tzAbbr } from '@/utils/dates';

import { ActivityFeed, TaskRow } from '../shared/Rows';
import { ProfileHeader } from './ProfileHeader';

/** Internal staff member profile. */
export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const toast = useToast();
  const s = getStaff(db, id);

  if (!s) {
    return (
      <Screen title="Person">
        <EmptyState icon="user-x" title="Person not found" actionLabel="Back to people" onAction={() => router.replace('/people')} />
      </Screen>
    );
  }

  const role = db.roles.find((r) => r.key === s.role);
  const programmes = db.programmes
    .filter((p) => [p.managerId, p.ownerId, p.coordinatorId].includes(s.id) && !p.cancelled)
    .sort((a, b) => (programmePhase(a) === 'completed' || a.archived ? 1 : 0) - (programmePhase(b) === 'completed' || b.archived ? 1 : 0) || a.startDate.localeCompare(b.startDate));
  const tasks = db.tasks.filter((t) => t.ownerId === s.id);
  const groups = groupTasks(tasks);
  const open = [...groups.overdue, ...groups.today, ...groups.week, ...groups.later];
  const approvals = pendingApprovalsFor(db, s.id);
  const activity = db.activity.filter((a) => a.actorId === s.id);
  const nowLocal = timeFromMinutes(minutesOf(splitDateTime(DEMO_NOW).time) + (TIMEZONES[s.timeZone].offset - 4) * 60);
  const contact = (what: string) => toast.show({ message: what, detail: 'Simulated — no message was sent.', tone: 'accent', icon: 'send' });
  const relation = (pid: string) => {
    const p = db.programmes.find((x) => x.id === pid)!;
    return [p.managerId === s.id && 'Programme Manager', p.ownerId === s.id && 'Owner', p.coordinatorId === s.id && 'Coordinator'].filter(Boolean).join(' · ');
  };

  return (
    <Screen title={s.name} eyebrow={role?.label}>
      <ProfileHeader
        name={s.name}
        hue={s.avatarHue}
        initials={s.initials}
        title={s.title}
        subtitle={s.team}
        meta={`${s.location} · ${nowLocal} ${tzAbbr(s.timeZone)} local time`}
        badges={<StatusPill label={role?.label ?? ''} tone="accent" dot={false} />}
        actions={[
          { icon: 'message-square', label: 'Message', onPress: () => contact(`Message to ${s.name.split(' ')[0]}`) },
          { icon: 'mail', label: 'Email', onPress: () => contact(`Email to ${s.name.split(' ')[0]}`) },
          { icon: 'phone', label: 'Call', onPress: () => contact(`Calling ${s.name.split(' ')[0]}`) },
          { icon: 'square-check-big', label: 'Assign task', onPress: () => router.push(`/task/new?owner=${s.id}`) },
        ]}
      />

      <Section title="Workload">
        <StatGrid>
          <Stat label="Open tasks" value={String(open.length)} caption={`${groups.overdue.length} overdue`} icon="square-check-big" tone={groups.overdue.length ? 'danger' : undefined} />
          <Stat label="Programmes" value={String(programmes.filter((p) => !p.archived && programmePhase(p) !== 'completed').length)} caption="Active & upcoming" icon="layers" />
        </StatGrid>
      </Section>

      <Section title="Contact">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue label="Email" value={s.email} icon="mail" />
          <KeyValue label="Phone" value={s.phone} icon="phone" />
          <KeyValue label="Time zone" value={`${TIMEZONES[s.timeZone].label} (${tzAbbr(s.timeZone)})`} icon="globe" last />
        </Card>
        {role ? (
          <Text variant="footnote" tone="tertiary" style={{ paddingHorizontal: 4 }}>
            {role.label}: {role.description}
          </Text>
        ) : null}
      </Section>

      <Section title="Programmes">
        {programmes.length ? (
          <ListGroup>
            {programmes.map((p) => (
              <ListRow key={p.id} leading={<View style={{ width: 6, height: 34, borderRadius: 3, backgroundColor: `hsl(${p.accentHue}, 62%, 58%)` }} />} title={p.name} numberOfLines={2} subtitle={`${relation(p.id)} · ${formatRange(p.startDate, p.endDate)}`} trailing={<StatusPill label={p.archived ? 'Archived' : p.status.operational} />} onPress={() => router.push(`/programme/${p.id}`)} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="layers" title="No programmes" message="Not currently managing, owning or coordinating a programme." compact />
        )}
      </Section>

      <Section title="Open tasks" action={open.length > 5 ? 'All tasks' : undefined} onAction={() => router.push('/tasks')}>
        {open.length ? (
          <ListGroup>
            {open.slice(0, 5).map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ListGroup>
        ) : (
          <EmptyState icon="circle-check-big" title="No open tasks" compact />
        )}
      </Section>

      {approvals.length ? (
        <Section title="Waiting on their approval">
          <ListGroup>
            {approvals.map((a) => (
              <ListRow key={a.id} icon="stamp" iconTone="warning" title={a.title} subtitle={a.kind} onPress={() => router.push(`/approval/${a.id}`)} />
            ))}
          </ListGroup>
        </Section>
      ) : null}

      {activity.length ? (
        <Section title="Recent activity">
          <Card>
            <ActivityFeed items={activity} showProgramme limit={5} />
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}
