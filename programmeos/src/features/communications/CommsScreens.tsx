import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  Avatar,
  Banner,
  Button,
  Card,
  Chip,
  ChipRow,
  EmptyState,
  HeaderActions,
  Icon,
  IconButton,
  ListGroup,
  ListRow,
  Screen,
  Section,
  SelectSheet,
  Sheet,
  StatusPill,
  Text,
  TextField,
  useToast,
  type IconName,
} from '@/components';
import type { NotificationCategory } from '@/data/models';
import { getProgramme, personHue, personName } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { activityStamp, addDays, DEMO_TODAY } from '@/utils/dates';

import { NOTIFICATION_ICON } from '../shared/helpers';
import { SmartAlertCard } from '../shared/Widgets';
import { CHANNEL_META, NotificationRow } from './InboxScreen';

// ─── Message / communication reference detail ─────────────────────────────────

export function MessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const m = db.communications.find((c) => c.id === id);
  const [noteOpen, setNoteOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (m?.unread) actions.update('communications', m.id, { unread: false });
  }, [m?.id, m?.unread, actions]);

  if (!m) return <Screen title="Message"><EmptyState icon="inbox" title="Message not found" /></Screen>;
  const meta = CHANNEL_META[m.channel];
  const prog = getProgramme(db, m.programmeId);
  const task = db.tasks.find((t) => t.id === m.taskId);

  const createTask = () => {
    const tid = actions.createTask({ title: m.subject.replace(/^Re:\s*/i, ''), programmeId: m.programmeId ?? 'p-elp', ownerId: 's-layla', dueDate: addDays(DEMO_TODAY, 2), priority: 'Medium', category: 'Operations', description: `From ${meta.label.toLowerCase()} with ${m.counterpart.name}: “${m.excerpt}”` });
    actions.update('communications', m.id, { taskId: tid });
    toast.show({ message: 'Task created from message', actionLabel: 'Open', onAction: () => router.push(`/task/${tid}` as Href) });
  };

  return (
    <Screen
      title={m.subject}
      eyebrow={`${meta.label} reference`}
      headerRight={
        <HeaderActions>
          <IconButton icon={m.resolved ? 'rotate-ccw' : 'circle-check'} accessibilityLabel={m.resolved ? 'Reopen' : 'Mark as resolved'} onPress={() => { actions.update('communications', m.id, { resolved: !m.resolved }); toast.show({ message: m.resolved ? 'Reopened' : 'Marked as resolved' }); }} />
        </HeaderActions>
      }>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={m.counterpart.name} hue={meta.hue + 10} size={44} />
          <View style={{ flex: 1 }}>
            <Text variant="headline">{m.counterpart.name}</Text>
            <Text variant="footnote" tone="secondary">
              {[m.counterpart.org, m.counterpart.kind[0].toUpperCase() + m.counterpart.kind.slice(1)].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <StatusPill label={m.resolved ? 'Resolved' : 'Open'} tone={m.resolved ? 'success' : 'accent'} />
        </View>
        <View style={{ padding: 12, borderRadius: 12, gap: 6 }}>
          <Text variant="body">{m.excerpt}</Text>
          <Text variant="footnote" tone="tertiary">
            {activityStamp(m.date)}
            {m.attachments ? ` · ${m.attachments} attachment` : ''}
          </Text>
        </View>
      </Card>
      <Banner tone="info" icon={meta.icon} title={`Linked ${meta.label.toLowerCase()} reference`} message={`The original ${m.channel === 'WhatsApp' ? 'chat' : m.channel === 'Email' ? 'email' : 'note'} stays in its source system. ProgrammeOS keeps the reference, context and follow-ups next to the programme.`} style={{ marginTop: 12 }} />

      <Section title="Actions">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <Button title="Add note" icon="notebook-pen" variant="secondary" onPress={() => setNoteOpen(true)} style={{ flexGrow: 1, flexBasis: '45%' }} />
          <Button title={prog ? 'Change programme' : 'Link to programme'} icon="link-2" variant="secondary" onPress={() => setLinkOpen(true)} style={{ flexGrow: 1, flexBasis: '45%' }} />
          <Button title={task ? 'Open task' : 'Create task'} icon="square-check-big" variant="secondary" onPress={() => (task ? router.push(`/task/${task.id}` as Href) : createTask())} style={{ flexGrow: 1, flexBasis: '45%' }} />
          <Button title={m.resolved ? 'Reopen' : 'Mark resolved'} icon="circle-check" variant={m.resolved ? 'secondary' : 'success'} onPress={() => { actions.update('communications', m.id, { resolved: !m.resolved }); toast.show({ message: m.resolved ? 'Reopened' : 'Marked as resolved' }); }} style={{ flexGrow: 1, flexBasis: '45%' }} />
        </View>
      </Section>

      <Section title="Related records">
        <ListGroup>
          {prog ? <ListRow icon="layers" iconTone="violet" title={prog.name} subtitle={`${prog.code} · open programme`} onPress={() => router.push(`/programme/${prog.id}` as Href)} /> : <ListRow icon="link-2" iconTone="neutral" title="Not linked to a programme" subtitle="Link it so the team can find it" onPress={() => setLinkOpen(true)} />}
          {task ? <ListRow icon="square-check-big" iconTone="accent" title={task.title} subtitle={`Task · ${task.status}`} onPress={() => router.push(`/task/${task.id}` as Href)} /> : null}
        </ListGroup>
      </Section>

      <Section title={`Notes · ${m.notes.length}`}>
        {m.notes.length ? (
          <Card style={{ gap: 14 }}>
            {m.notes.map((n) => (
              <View key={n.id} style={{ flexDirection: 'row', gap: 10 }}>
                <Avatar name={personName(db, n.authorId)} hue={personHue(db, n.authorId)} size={28} />
                <View style={{ flex: 1 }}>
                  <Text variant="footnote" weight="semibold">
                    {personName(db, n.authorId)} <Text variant="footnote" tone="tertiary">{activityStamp(n.date)}</Text>
                  </Text>
                  <Text variant="callout">{n.text}</Text>
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <Text variant="callout" tone="tertiary">
            No internal notes yet.
          </Text>
        )}
      </Section>

      <Sheet
        visible={noteOpen}
        onClose={() => setNoteOpen(false)}
        title="Add internal note"
        footer={<Button title="Save note" disabled={!note.trim()} onPress={() => { actions.addCommunicationNote(m.id, note.trim()); setNote(''); setNoteOpen(false); toast.show({ message: 'Note added' }); }} fullWidth style={{ flex: 1 }} />}>
        <TextField value={note} onChangeText={setNote} placeholder="Visible to the programme team only" multiline autoFocus />
      </Sheet>
      <SelectSheet
        visible={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Link to programme"
        value={m.programmeId}
        options={db.programmes.filter((p) => !p.archived).map((p) => ({ value: p.id, label: p.name, detail: p.code }))}
        onSelect={(pid) => { actions.update('communications', m.id, { programmeId: pid }); toast.show({ message: 'Linked to programme', detail: getProgramme(db, pid)?.name }); }}
      />
    </Screen>
  );
}

// ─── Notifications (standalone) ───────────────────────────────────────────────

export function NotificationsScreen() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const [cat, setCat] = useState<NotificationCategory | 'unread' | null>(null);
  const list = db.notifications.filter((n) => n.audience === 'staff' && (cat === 'unread' ? !n.read : !cat || n.category === cat)).sort((a, b) => b.date.localeCompare(a.date));
  const unread = db.notifications.filter((n) => n.audience === 'staff' && !n.read).length;
  const today = list.filter((n) => n.date.startsWith(DEMO_TODAY));
  const earlier = list.filter((n) => !n.date.startsWith(DEMO_TODAY));
  return (
    <Screen
      title="Notifications"
      subtitle={unread ? `${unread} unread` : 'All caught up'}
      headerRight={unread ? <Button title="Read all" variant="plain" size="sm" onPress={() => { actions.markAllNotificationsRead('staff'); toast.show({ message: 'Marked all as read', tone: 'neutral' }); }} /> : undefined}
      headerBelow={
        <ChipRow>
          <Chip label="All" selected={!cat} onPress={() => setCat(null)} />
          <Chip label="Unread" selected={cat === 'unread'} onPress={() => setCat('unread')} count={unread} />
          {(Object.keys(NOTIFICATION_ICON) as NotificationCategory[]).map((c) => (
            <Chip key={c} label={c} icon={NOTIFICATION_ICON[c].icon} selected={cat === c} onPress={() => setCat(c)} />
          ))}
        </ChipRow>
      }>
      {!list.length ? (
        <EmptyState icon="bell" title="Nothing here" message="No notifications match this filter." actionLabel="Show all" onAction={() => setCat(null)} />
      ) : (
        <>
          {today.length ? (
            <Section title="Today" first>
              <View style={{ gap: 8 }}>
                {today.map((n) => (
                  <NotificationRow key={n.id} n={n} />
                ))}
              </View>
            </Section>
          ) : null}
          {earlier.length ? (
            <Section title="Earlier">
              <View style={{ gap: 8 }}>
                {earlier.map((n) => (
                  <NotificationRow key={n.id} n={n} />
                ))}
              </View>
            </Section>
          ) : null}
          <Text variant="footnote" tone="tertiary" align="center" style={{ marginTop: 16 }}>
            Long-press a notification to mark it read or unread.
          </Text>
        </>
      )}
    </Screen>
  );
}

// ─── Smart alerts ─────────────────────────────────────────────────────────────

export function AlertsScreen() {
  const db = useDB();
  const actions = useActions();
  const active = db.smartAlerts.filter((a) => !a.dismissed);
  const dismissed = db.smartAlerts.filter((a) => a.dismissed);
  const order = { critical: 0, warning: 1, info: 2 } as const;
  return (
    <Screen title="Smart alerts" subtitle="ProgrammeOS watches every programme and raises what needs a person.">
      {active.length ? (
        <View style={{ gap: 10 }}>
          {[...active].sort((a, b) => order[a.severity] - order[b.severity]).map((a) => (
            <SmartAlertCard key={a.id} alert={a} />
          ))}
        </View>
      ) : (
        <EmptyState icon="shield-check" title="No active alerts" message="Everything ProgrammeOS monitors is on track." />
      )}
      {dismissed.length ? (
        <Section title="Dismissed">
          <ListGroup>
            {dismissed.map((a) => (
              <ListRow key={a.id} icon="eye-off" iconTone="neutral" title={a.title} subtitle={getProgramme(db, a.programmeId)?.shortName} trailing={<Button title="Restore" size="sm" variant="tinted" onPress={() => actions.update('smartAlerts', a.id, { dismissed: false })} />} />
            ))}
          </ListGroup>
        </Section>
      ) : null}
      <Section title="What ProgrammeOS monitors">
        <Card style={{ gap: 10 }}>
          {([
            ['user-x', 'Faculty confirmations pending beyond 5 days'],
            ['file-warning', 'Materials not submitted by their due date'],
            ['bed-double', 'Hotel blocks approaching release or cancellation deadlines'],
            ['user-plus', 'Participant registrations incomplete close to start'],
            ['plane', 'Travellers without confirmed itineraries'],
            ['trending-up', 'Budget lines committed above budget'],
            ['calendar-x', 'Faculty double-booked across time zones'],
          ] as [IconName, string][]).map(([icon, text]) => (
            <View key={text} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Icon name={icon} size={16} tone="secondary" />
              <Text variant="callout" tone="secondary" style={{ flex: 1 }}>
                {text}
              </Text>
            </View>
          ))}
        </Card>
      </Section>
    </Screen>
  );
}
