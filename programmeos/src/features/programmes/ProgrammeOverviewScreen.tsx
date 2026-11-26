import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  ActionSheet,
  AvatarStack,
  Banner,
  Card,
  Icon,
  IconButton,
  KeyValue,
  ListGroup,
  ListRow,
  ProgressRing,
  Screen,
  Section,
  StageDots,
  StatusPill,
  Text,
  Touchable,
  toneColors,
  useDialog,
  useToast,
  type IconName,
} from '@/components';
import type { Programme } from '@/data/models';
import {
  deliveryProgress,
  facultyName,
  getClient,
  getFaculty,
  getStaff,
  LIFECYCLE,
  lifecycleIndex,
  programmeFinance,
  programmePhase,
  readinessFor,
  sortByPriority,
} from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { canSeeFinancials } from '@/navigation/access';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { countdown, durationLabel, formatRange, TIMEZONES, tzOffsetLabel } from '@/utils/dates';
import { moneyCompact } from '@/utils/format';

import { DELIVERY_ICON, readinessTone } from '../shared/helpers';
import { ActivityFeed, TaskRow } from '../shared/Rows';
import { QuickActionsSheet } from '../shared/Widgets';
import { ProgrammeNotFound, useProgrammeParam } from './useProgrammeParam';

const DIMENSIONS: { key: keyof Programme['status']; label: string; icon: IconName }[] = [
  { key: 'commercial', label: 'Commercial', icon: 'handshake' },
  { key: 'operational', label: 'Operational', icon: 'clipboard-list' },
  { key: 'academic', label: 'Academic', icon: 'book-open' },
  { key: 'logistics', label: 'Logistics', icon: 'plane' },
  { key: 'financial', label: 'Financial', icon: 'wallet' },
  { key: 'delivery', label: 'Delivery', icon: 'presentation' },
];

export default function ProgrammeOverviewScreen() {
  const p = useProgrammeParam();
  if (!p) return <ProgrammeNotFound />;
  return <Overview p={p} />;
}

function Overview({ p }: { p: Programme }) {
  const s = useStyles(styles);
  const db = useDB();
  const actions = useActions();
  const dialog = useDialog();
  const toast = useToast();
  const { colors } = useTheme();
  const { role } = useSession();
  const [menu, setMenu] = useState(false);
  const [quick, setQuick] = useState(false);

  const client = getClient(db, p.clientId);
  const phase = programmePhase(p);
  const r = readinessFor(db, p.id);
  const fin = programmeFinance(db, p.id);
  const seeFin = canSeeFinancials(role);
  const stageIdx = lifecycleIndex(p.stage);
  const assignments = db.facultyAssignments.filter((a) => a.programmeId === p.id && a.status !== 'Declined');
  const enrolments = db.enrollments.filter((e) => e.programmeId === p.id && e.status !== 'Withdrawn');
  const registered = enrolments.filter((e) => ['Registered', 'Confirmed', 'Attending', 'Completed'].includes(e.status)).length;
  const sessions = db.sessions.filter((x) => x.programmeId === p.id);
  const openTasks = db.tasks.filter((t) => t.programmeId === p.id && t.status !== 'Done').sort(sortByPriority);
  const docs = db.documents.filter((d) => d.programmeId === p.id);
  const posts = db.discussions.filter((d) => d.programmeId === p.id);
  const modules = db.modules.filter((m) => m.programmeId === p.id);
  const materials = db.materials.filter((m) => m.programmeId === p.id);
  const bookings = db.hotelBookings.filter((b) => b.programmeId === p.id);
  const activity = db.activity.filter((a) => a.programmeId === p.id);

  const archive = async () => {
    const { confirmed } = await dialog.confirm({
      title: p.archived ? 'Restore programme?' : 'Archive programme?',
      message: p.archived ? 'It will reappear in active lists.' : 'The workspace becomes read-only and moves to the archive. You can restore it at any time.',
      confirmLabel: p.archived ? 'Restore' : 'Archive',
      icon: 'archive',
      destructive: !p.archived,
    });
    if (confirmed) {
      actions.archiveProgramme(p.id, !p.archived);
      toast.show({ message: p.archived ? 'Programme restored' : 'Programme archived', icon: 'archive' });
    }
  };

  const ringValue = phase === 'upcoming' ? r.overall : phase === 'in_delivery' ? deliveryProgress(p) : 100;
  const ringTone = phase === 'upcoming' ? readinessTone(r.overall, r.threshold) : phase === 'in_delivery' ? 'violet' : 'success';

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title={p.name}
        eyebrow={`${p.code} · ${client?.name}`}
        headerRight={<IconButton icon="ellipsis" accessibilityLabel="Programme actions" onPress={() => setMenu(true)} variant="filled" size={32} />}>
        {p.cancelled ? <Banner tone="neutral" icon="ban" title="Programme cancelled" message={p.cancellationReason} style={{ marginBottom: 12 }} /> : null}
        {p.archived ? <Banner tone="neutral" icon="archive" title="Archived · read-only" message="This programme completed financial closure and was archived." action="Restore" onAction={archive} style={{ marginBottom: 12 }} /> : null}

        {/* Status hero */}
        <Card padding="lg" style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
            <ProgressRing value={ringValue} size={76} stroke={7} color={toneColors(ringTone as never, colors).solid}>
              <Text variant="title3" tabular>
                {Math.round(ringValue)}%
              </Text>
            </ProgressRing>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="overline" tone="tertiary">
                {phase === 'upcoming' ? 'Readiness' : phase === 'in_delivery' ? 'Delivery progress' : phase === 'cancelled' ? 'Cancelled' : 'Completed'}
              </Text>
              <Text variant="title3">{phase === 'upcoming' ? countdown(p.startDate) : phase === 'in_delivery' ? 'In delivery now' : formatRange(p.startDate, p.endDate)}</Text>
              <Text variant="subhead" tone="secondary">
                {phase === 'upcoming' ? `${r.pendingCount} open items · ${r.criticalCount} critical · Go/No-Go threshold ${r.threshold}%` : `${formatRange(p.startDate, p.endDate)} · ${durationLabel(p.startDate, p.endDate)}`}
              </Text>
            </View>
          </View>
          <Touchable onPress={() => router.push(`/programme/${p.id}/timeline`)} style={{ gap: 6 }} accessibilityLabel={`Lifecycle stage: ${LIFECYCLE[stageIdx]?.label}`}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="footnote" tone="secondary">
                Stage {stageIdx + 1} of {LIFECYCLE.length} · <Text variant="footnote" weight="semibold">{LIFECYCLE[stageIdx]?.label}</Text>
              </Text>
              <Icon name="chevron-right" size={14} tone="tertiary" />
            </View>
            <StageDots total={LIFECYCLE.length} current={stageIdx} />
          </Touchable>
          {phase === 'upcoming' ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PrimaryLink label="Readiness" icon="gauge" onPress={() => router.push(`/programme/${p.id}/readiness`)} />
              <PrimaryLink label="Quick action" icon="plus" onPress={() => setQuick(true)} />
            </View>
          ) : null}
        </Card>

        {/* Six operational dimensions instead of one generic status */}
        <Section title="Status">
          <View style={s.dims}>
            {DIMENSIONS.map((d) => (
              <View key={d.key} style={s.dim} accessibilityLabel={`${d.label}: ${p.status[d.key]}`}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Icon name={d.icon} size={14} tone="tertiary" />
                  <Text variant="caption" tone="secondary">
                    {d.label}
                  </Text>
                </View>
                <StatusPill label={p.status[d.key]} size="md" />
              </View>
            ))}
          </View>
        </Section>

        {openTasks.length ? (
          <Section title="Next actions" action={`All ${openTasks.length}`} onAction={() => router.push(`/programme/${p.id}/tasks`)}>
            <ListGroup>
              {openTasks.slice(0, 3).map((t) => (
                <TaskRow key={t.id} task={t} showProgramme={false} showOwner />
              ))}
            </ListGroup>
          </Section>
        ) : null}

        {seeFin ? (
          <Section title="Financials" subtitle="Illustrative" action="Details" onAction={() => router.push(`/programme/${p.id}/finance`)}>
            <View style={s.fin}>
              <FinCell label="Contract" value={moneyCompact(p.contractValue)} />
              <FinCell label="Budget" value={moneyCompact(fin.budget)} />
              <FinCell label="Revenue" value={moneyCompact(p.revenue)} />
              <FinCell label="Committed" value={moneyCompact(fin.committed)} />
              <FinCell label="Actual" value={moneyCompact(fin.actual)} />
              <FinCell label="Margin" value={`${fin.marginPct.toFixed(1)}%`} tone={fin.marginPct >= 30 ? 'success' : 'warning'} />
            </View>
          </Section>
        ) : null}

        <Section title="Workspace">
          <ListGroup>
            {phase === 'upcoming' ? <ListRow icon="gauge" iconTone="accent" title="Readiness" value={`${Math.round(r.overall)}%`} onPress={() => router.push(`/programme/${p.id}/readiness`)} /> : null}
            <ListRow icon="route" iconTone="violet" title="Timeline & milestones" value={LIFECYCLE[stageIdx]?.label.split(' ')[0]} onPress={() => router.push(`/programme/${p.id}/timeline`)} />
            <ListRow icon="calendar-days" iconTone="info" title="Schedule" value={`${sessions.length} sessions`} onPress={() => router.push(`/programme/${p.id}/sessions`)} />
            <ListRow icon="users" iconTone="warning" title="Faculty" trailing={<AvatarStack people={assignments.map((a) => ({ name: getFaculty(db, a.facultyId)?.name ?? '', hue: getFaculty(db, a.facultyId)?.avatarHue }))} size={24} />} onPress={() => router.push(`/programme/${p.id}/faculty`)} chevron />
            <ListRow icon="graduation-cap" iconTone="success" title="Participants" value={`${registered} / ${p.capacity}`} onPress={() => router.push(`/programme/${p.id}/participants`)} />
            <ListRow icon="book-open" iconTone="violet" title="Academics" value={`${modules.length} modules · ${materials.length} materials`} onPress={() => router.push(`/programme/${p.id}/academics`)} />
            {p.deliveryMode !== 'Virtual' || bookings.length ? <ListRow icon="bed-double" iconTone="info" title="Logistics & travel" value={p.status.logistics} onPress={() => router.push(`/programme/${p.id}/logistics`)} /> : null}
            {seeFin ? <ListRow icon="wallet" iconTone="success" title="Finance" value={p.status.financial} onPress={() => router.push(`/programme/${p.id}/finance`)} /> : null}
            <ListRow icon="square-check-big" iconTone="accent" title="Tasks" value={`${openTasks.length} open`} onPress={() => router.push(`/programme/${p.id}/tasks`)} />
            <ListRow icon="folder" iconTone="neutral" title="Documents" value={`${docs.length}`} onPress={() => router.push(`/programme/${p.id}/documents`)} />
            <ListRow icon="message-square" iconTone="accent" title="Discussion" value={`${posts.length}`} onPress={() => router.push(`/programme/${p.id}/discussion`)} />
            <ListRow icon="history" iconTone="neutral" title="Activity history" value={`${activity.length}`} onPress={() => router.push(`/programme/${p.id}/activity`)} />
          </ListGroup>
        </Section>

        <Section title="Programme details">
          <Card padding="md" style={{ paddingVertical: 4 }}>
            <KeyValue label="Client" value={client?.name ?? ''} icon="building-2" onPress={() => router.push(`/client/${p.clientId}`)} />
            <KeyValue label="Programme manager" value={getStaff(db, p.managerId)?.name ?? ''} icon="user-round" onPress={() => router.push(`/person/${p.managerId}`)} />
            <KeyValue label="Programme owner" value={getStaff(db, p.ownerId)?.name ?? ''} icon="briefcase" />
            <KeyValue label="Coordinator" value={getStaff(db, p.coordinatorId)?.name ?? ''} icon="clipboard-list" />
            <KeyValue label="Type" value={p.type} icon="layers" />
            <KeyValue label="Delivery mode" value={p.deliveryMode} icon={DELIVERY_ICON[p.deliveryMode]} />
            <KeyValue label="Dates" value={formatRange(p.startDate, p.endDate)} icon="calendar" />
            <KeyValue label="Location" value={p.location} icon="map-pin" multiline />
            <KeyValue label="Time zone" value={`${TIMEZONES[p.timeZone].city} · ${TIMEZONES[p.timeZone].abbr} (${tzOffsetLabel(p.timeZone)})`} icon="globe" />
            <KeyValue label="Capacity" value={`${p.capacity} participants`} icon="users" last />
          </Card>
        </Section>

        <Section title="About">
          <Card style={{ gap: 12 }}>
            <Text variant="body" tone="secondary">
              {p.description}
            </Text>
            <View style={{ gap: 8 }}>
              {p.objectives.map((o) => (
                <View key={o} style={{ flexDirection: 'row', gap: 10 }}>
                  <Icon name="target" size={16} tone="accent" />
                  <Text variant="callout" style={{ flex: 1 }}>
                    {o}
                  </Text>
                </View>
              ))}
            </View>
            {assignments.length ? (
              <Text variant="footnote" tone="tertiary">
                Faculty: {assignments.map((a) => facultyName(getFaculty(db, a.facultyId))).join(', ')}
              </Text>
            ) : null}
          </Card>
        </Section>

        {activity.length ? (
          <Section title="Recent activity" action="History" onAction={() => router.push(`/programme/${p.id}/activity`)}>
            <Card>
              <ActivityFeed items={activity} limit={4} />
            </Card>
          </Section>
        ) : null}
      </Screen>

      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title={p.shortName}
        actions={[
          { label: 'Edit programme', icon: 'pencil', onPress: () => router.push(`/programme/${p.id}/edit`), disabled: p.archived },
          { label: 'Quick actions', icon: 'plus', onPress: () => setQuick(true) },
          { label: 'Ask the assistant', icon: 'sparkles', onPress: () => router.push(`/assistant?q=${encodeURIComponent(`What is still pending before ${p.shortName}?`)}` as Href) },
          { label: 'Duplicate as new programme', icon: 'copy', onPress: () => router.push(`/programme/new?from=${p.id}` as Href) },
          { label: 'Share workspace link', icon: 'share-2', onPress: () => toast.show({ message: 'Link copied', detail: `programmeos.app/p/${p.code}`, icon: 'link-2' }) },
          { label: p.archived ? 'Restore from archive' : 'Archive programme', icon: 'archive', onPress: archive, destructive: !p.archived },
        ]}
      />
      <QuickActionsSheet visible={quick} onClose={() => setQuick(false)} programmeId={p.id} />
    </View>
  );
}

function PrimaryLink({ label, icon, onPress }: { label: string; icon: IconName; onPress: () => void }) {
  const s = useStyles(styles);
  return (
    <Touchable onPress={onPress} style={s.link} feedback="scale" accessibilityLabel={label}>
      <Icon name={icon} size={16} tone="accent" />
      <Text variant="label" tone="accent" weight="semibold">
        {label}
      </Text>
    </Touchable>
  );
}

function FinCell({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  const s = useStyles(styles);
  return (
    <View style={s.finCell}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="metricSm" tone={tone ?? 'primary'} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = makeStyles((t) => ({
  dims: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dim: { flexBasis: '47%', flexGrow: 1, backgroundColor: t.colors.surface, borderRadius: t.radii.lg, padding: 12, gap: 8, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  fin: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  finCell: { flexBasis: '30%', flexGrow: 1, backgroundColor: t.colors.surface, borderRadius: t.radii.lg, padding: 12, gap: 2, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  link: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: t.radii.md, backgroundColor: t.colors.accentSoft },
}));
