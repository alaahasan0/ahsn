import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import {
  ActionSheet,
  Avatar,
  Banner,
  Button,
  Card,
  DatePickerSheet,
  EmptyState,
  FileIcon,
  Icon,
  IconButton,
  IconTile,
  ListGroup,
  ListRow,
  Screen,
  Section,
  SelectSheet,
  StatusPill,
  Text,
  Touchable,
  useDialog,
  useToast,
} from '@/components';
import type { Priority, Task, TaskStatus } from '@/data/models';
import { blockedBy, byId, getProgramme, personHue, personName } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { fontFor, makeStyles, useStyles, useTheme } from '@/theme';
import { activityStamp, DEMO_NOW, dueLabel, formatDate } from '@/utils/dates';
import { fileSize, newId } from '@/utils/format';

import { TASK_CATEGORY_ICON } from '../shared/helpers';
import { PriorityFlag } from '../shared/Rows';
import { PRIORITIES, STATUSES } from './taskFilters';

const STATUS_ICON: Record<TaskStatus, 'circle-dashed' | 'circle-dot' | 'lock' | 'eye' | 'circle-check-big'> = {
  'To Do': 'circle-dashed',
  'In Progress': 'circle-dot',
  Blocked: 'lock',
  'In Review': 'eye',
  Done: 'circle-check-big',
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const { userId } = useSession();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const s = useStyles(styles);
  const { colors } = useTheme();
  const task = byId(db.tasks, id);
  const [sheet, setSheet] = useState<null | 'status' | 'owner' | 'priority' | 'due' | 'menu' | 'attach'>(null);
  const [comment, setComment] = useState('');

  if (!task) {
    return (
      <Screen title="Task" large={false}>
        <EmptyState icon="square-check-big" title="Task not found" message="It may have been deleted or moved to another programme." actionLabel="Back to tasks" onAction={() => router.replace('/tasks')} />
      </Screen>
    );
  }

  const prog = getProgramme(db, task.programmeId);
  const blockers = blockedBy(db, task);
  const allDeps = task.dependsOn.map((d) => byId(db.tasks, d)).filter((x): x is Task => !!x);
  const blocking = db.tasks.filter((t) => t.dependsOn.includes(task.id));
  const due = dueLabel(task.dueDate);
  const done = task.status === 'Done';
  const docs = task.attachmentIds.map((d) => byId(db.documents, d)).filter((d) => !!d);

  const change = (patch: Partial<Task>, text: string) => {
    actions.update('tasks', task.id, (t) => ({ ...t, ...patch, history: [...t.history, { id: newId('th'), date: DEMO_NOW, actorId: userId, text }] }));
    toast.show({ message: text, icon: 'circle-check', tone: 'neutral' });
  };

  const setStatus = (status: TaskStatus) => {
    if (status === task.status) return;
    const prev = task.status;
    actions.setTaskStatus(task.id, status);
    toast.show({ message: status === 'Done' ? 'Task completed' : `Status changed to ${status}`, detail: task.title, actionLabel: 'Undo', onAction: () => actions.setTaskStatus(task.id, prev) });
  };

  const related = task.relatedPerson;
  const relatedRoute = related ? (related.kind === 'faculty' ? `/faculty/${related.id}` : related.kind === 'learner' ? `/learner/${related.id}` : related.kind === 'staff' ? `/person/${related.id}` : prog ? `/client/${prog.clientId}` : undefined) : undefined;

  const send = () => {
    const text = comment.trim();
    if (!text) return;
    actions.addTaskComment(task.id, text);
    setComment('');
    toast.show({ message: 'Comment added', icon: 'message-square', tone: 'neutral' });
  };

  const remove = async () => {
    const { confirmed } = await dialog.confirm({ title: 'Delete this task?', message: `“${task.title}” and its comments will be removed. This can’t be undone.`, confirmLabel: 'Delete', destructive: true, icon: 'trash-2' });
    if (!confirmed) return;
    router.back();
    setTimeout(() => {
      actions.remove('tasks', task.id);
      if (prog) actions.log(prog.id, 'status_changed', `deleted the task “${task.title}”`);
      toast.show({ message: 'Task deleted', icon: 'trash-2', tone: 'neutral' });
    }, 250);
  };

  const duplicate = () => {
    const { id: _id, history: _h, comments: _c, ...rest } = task;
    const nid = actions.createTask({ ...rest, title: `${task.title} (copy)`, status: 'To Do', completedOn: undefined });
    toast.show({ message: 'Task duplicated', icon: 'copy' });
    router.replace(`/task/${nid}`);
  };

  const attachable = db.documents.filter((d) => (d.programmeId === task.programmeId || !d.programmeId) && !task.attachmentIds.includes(d.id));

  return (
    <Screen
      title={task.title}
      eyebrow={`${prog?.code ?? ''} · ${task.category}`}
      headerRight={<IconButton icon="ellipsis" accessibilityLabel="More actions" onPress={() => setSheet('menu')} />}
      footer={
        done ? (
          <Button title="Reopen task" icon="rotate-ccw" variant="secondary" onPress={() => setStatus('To Do')} style={{ flex: 1 }} />
        ) : (
          <>
            <Button title="Change status" variant="secondary" onPress={() => setSheet('status')} style={{ flex: 1 }} />
            <Button title="Mark done" icon="check" onPress={() => setStatus('Done')} style={{ flex: 1 }} disabled={blockers.length > 0} />
          </>
        )
      }>
      <View style={s.pills}>
        <StatusPill label={task.status} size="md" icon={STATUS_ICON[task.status]} />
        <StatusPill label={`${task.priority} priority`} tone={task.priority === 'Urgent' ? 'danger' : task.priority === 'High' ? 'warning' : task.priority === 'Medium' ? 'accent' : 'neutral'} size="md" icon="flag" />
        {!done ? <StatusPill label={due.text} tone={due.tone === 'danger' ? 'danger' : due.tone === 'warning' ? 'warning' : 'neutral'} size="md" icon="clock" /> : null}
      </View>

      {blockers.length && !done ? (
        <Banner tone="warning" icon="lock" title={`Waiting on ${blockers.length} task${blockers.length > 1 ? 's' : ''}`} message={`“${blockers[0].title}” must be completed first.`} action="Open blocking task" onAction={() => router.push(`/task/${blockers[0].id}`)} style={{ marginTop: 14 }} />
      ) : null}

      {task.description ? (
        <Card style={{ marginTop: 14 }}>
          <Text variant="body">{task.description}</Text>
        </Card>
      ) : null}

      <Section title="Details">
        <ListGroup>
          <ListRow leading={<Avatar name={personName(db, task.ownerId)} hue={personHue(db, task.ownerId)} size={30} />} title="Owner" value={personName(db, task.ownerId)} onPress={() => setSheet('owner')} />
          {prog ? <ListRow icon="layers" iconTone="violet" title="Programme" value={prog.shortName} subtitle={prog.name} onPress={() => router.push(`/programme/${prog.id}`)} /> : null}
          {related ? <ListRow icon={related.kind === 'faculty' ? 'users' : related.kind === 'learner' ? 'graduation-cap' : related.kind === 'contact' ? 'handshake' : 'user'} iconTone="info" title="Related person" value={personName(db, related.id)} onPress={relatedRoute ? () => router.push(relatedRoute as never) : undefined} /> : null}
          <ListRow icon="calendar" iconTone={due.tone === 'danger' && !done ? 'danger' : 'accent'} title="Due date" value={formatDate(task.dueDate, { weekday: true })} onPress={() => setSheet('due')} />
          <ListRow icon="flag" iconTone={task.priority === 'Urgent' ? 'danger' : 'warning'} title="Priority" value={task.priority} onPress={() => setSheet('priority')} />
          <ListRow icon={TASK_CATEGORY_ICON[task.category] ?? 'clipboard-list'} iconTone="neutral" title="Category" value={task.category} />
        </ListGroup>
      </Section>

      {allDeps.length || blocking.length ? (
        <Section title="Dependencies">
          <ListGroup>
            {allDeps.map((d) => (
              <ListRow key={d.id} icon={d.status === 'Done' ? 'circle-check-big' : 'lock'} iconTone={d.status === 'Done' ? 'success' : 'warning'} title={d.title} subtitle={`Blocked by · ${personName(db, d.ownerId)}`} trailing={<StatusPill label={d.status} />} onPress={() => router.push(`/task/${d.id}`)} />
            ))}
            {blocking.map((d) => (
              <ListRow key={d.id} icon="git-branch" iconTone="violet" title={d.title} subtitle={`Waiting on this · ${personName(db, d.ownerId)}`} trailing={<StatusPill label={d.status} />} onPress={() => router.push(`/task/${d.id}`)} />
            ))}
          </ListGroup>
        </Section>
      ) : null}

      <Section title="Attachments" action="Attach" onAction={() => setSheet('attach')}>
        {docs.length ? (
          <ListGroup>
            {docs.map((d) => (
              <ListRow key={d!.id} leading={<FileIcon format={d!.format} size={36} />} title={d!.title} subtitle={`${d!.format} · ${fileSize(d!.sizeKb)} · ${d!.version}`} onPress={() => router.push(`/document/${d!.id}`)} />
            ))}
          </ListGroup>
        ) : (
          <Touchable onPress={() => setSheet('attach')} style={s.dropzone} accessibilityLabel="Attach a document">
            <Icon name="paperclip" size={18} tone="tertiary" />
            <Text variant="callout" tone="secondary">
              Attach a document from this programme
            </Text>
          </Touchable>
        )}
      </Section>

      <Section title="Comments" subtitle={task.comments.length ? `${task.comments.length} comment${task.comments.length > 1 ? 's' : ''}` : undefined}>
        <Card padding="md" style={{ gap: 14 }}>
          {task.comments.map((c) => (
            <View key={c.id} style={s.comment}>
              <Avatar name={personName(db, c.authorId)} hue={personHue(db, c.authorId)} size={30} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'baseline' }}>
                  <Text variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {personName(db, c.authorId)}
                  </Text>
                  <Text variant="footnote" tone="tertiary">
                    {activityStamp(c.date)}
                  </Text>
                </View>
                <Text variant="callout">{c.text}</Text>
              </View>
            </View>
          ))}
          {!task.comments.length ? (
            <Text variant="callout" tone="tertiary">
              No comments yet. Mention a teammate or add context for whoever picks this up next.
            </Text>
          ) : null}
          <View style={s.composer}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a comment…"
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={1}
              style={[fontFor('regular'), s.input]}
              accessibilityLabel="Add a comment"
              onSubmitEditing={send}
            />
            <IconButton icon="send-horizontal" variant={comment.trim() ? 'primary' : 'filled'} size={36} accessibilityLabel="Send comment" onPress={send} disabled={!comment.trim()} />
          </View>
        </Card>
      </Section>

      <Section title="Activity">
        <Card padding="md">
          {[...task.history].reverse().map((h, i, arr) => (
            <View key={h.id} style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ alignItems: 'center', width: 26 }}>
                <IconTile icon={h.text.startsWith('Status changed to Done') ? 'circle-check' : h.text.startsWith('Status') ? 'activity' : h.text.startsWith('Created') || h.text.startsWith('Task created') ? 'plus' : 'pencil'} tone={h.text.includes('Done') ? 'success' : 'neutral'} size={26} />
                {i < arr.length - 1 ? <View style={{ width: 1.5, flex: 1, backgroundColor: colors.border, marginVertical: 3 }} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: i < arr.length - 1 ? 14 : 0, paddingTop: 3 }}>
                <Text variant="callout">
                  <Text variant="callout" weight="semibold">
                    {personName(db, h.actorId)}
                  </Text>{' '}
                  · {h.text}
                </Text>
                <Text variant="footnote" tone="tertiary">
                  {activityStamp(h.date)}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </Section>

      <SelectSheet<TaskStatus>
        visible={sheet === 'status'}
        onClose={() => setSheet(null)}
        title="Status"
        value={task.status}
        options={STATUSES.map((st) => ({ value: st, label: st, icon: STATUS_ICON[st], disabled: st === 'Done' && blockers.length > 0, detail: st === 'Done' && blockers.length ? 'Blocked by an open dependency' : undefined }))}
        onSelect={setStatus}
      />
      <SelectSheet
        visible={sheet === 'owner'}
        onClose={() => setSheet(null)}
        title="Owner"
        value={task.ownerId}
        options={db.staff.map((st) => ({ value: st.id, label: st.name, detail: st.title, leading: <Avatar name={st.name} hue={st.avatarHue} size={30} /> }))}
        onSelect={(v) => change({ ownerId: v }, `Reassigned to ${personName(db, v)}`)}
      />
      <SelectSheet<Priority>
        visible={sheet === 'priority'}
        onClose={() => setSheet(null)}
        title="Priority"
        value={task.priority}
        options={PRIORITIES.map((p) => ({ value: p, label: p, leading: <PriorityFlag priority={p} /> }))}
        onSelect={(v) => change({ priority: v }, `Priority changed to ${v}`)}
      />
      <DatePickerSheet visible={sheet === 'due'} onClose={() => setSheet(null)} value={task.dueDate} title="Due date" onChange={(d) => change({ dueDate: d }, `Due date moved to ${formatDate(d, { year: false })}`)} />
      <SelectSheet
        visible={sheet === 'attach'}
        onClose={() => setSheet(null)}
        title="Attach document"
        options={attachable.map((d) => ({ value: d.id, label: d.title, detail: `${d.kind} · ${d.format} · ${fileSize(d.sizeKb)}`, leading: <FileIcon format={d.format} size={32} /> }))}
        onSelect={(v) => change({ attachmentIds: [...task.attachmentIds, v] }, `Attached ${byId(db.documents, v)?.title ?? 'document'}`)}
      />
      <ActionSheet
        visible={sheet === 'menu'}
        onClose={() => setSheet(null)}
        title={task.title}
        actions={[
          { label: 'Duplicate task', icon: 'copy', onPress: duplicate },
          { label: 'Open programme', icon: 'layers', onPress: () => prog && router.push(`/programme/${prog.id}`) },
          { label: 'Copy link', icon: 'link-2', onPress: () => toast.show({ message: 'Link copied', detail: `programmeos://task/${task.id}`, icon: 'link-2', tone: 'neutral' }) },
          { label: 'Delete task', icon: 'trash-2', destructive: true, onPress: remove },
        ]}
      />
    </Screen>
  );
}

const styles = makeStyles((t) => ({
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dropzone: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 64, borderRadius: t.radii.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.colors.borderStrong },
  comment: { flexDirection: 'row', gap: 10 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 12, borderTopWidth: t.hairline, borderTopColor: t.colors.separator },
  input: { flex: 1, minHeight: 38, maxHeight: 120, fontSize: 15, color: t.colors.text, backgroundColor: t.colors.surfaceAlt, borderRadius: 19, paddingHorizontal: 14, paddingTop: 9, paddingBottom: 9, outlineStyle: 'none' } as never,
}));
