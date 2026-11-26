import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Checkbox, Icon, StatusPill, Text, Touchable, useToast, type IconName } from '@/components';
import type { ActivityLog, Session, Task } from '@/data/models';
import { blockedBy, facultyName, getFaculty, getProgramme, personHue, personName } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { activityStamp, convertZone, dueLabel, formatDate, TIMEZONES, tzAbbr } from '@/utils/dates';

import { DELIVERY_ICON } from './helpers';

// ─── Task row ─────────────────────────────────────────────────────────────────

export function TaskRow({ task, showProgramme = true, showOwner }: { task: Task; showProgramme?: boolean; showOwner?: boolean }) {
  const s = useStyles(styles);
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const done = task.status === 'Done';
  const due = dueLabel(task.dueDate);
  const prog = getProgramme(db, task.programmeId);
  const blocked = blockedBy(db, task);
  const toggle = (v: boolean) => {
    actions.setTaskStatus(task.id, v ? 'Done' : 'To Do');
    if (v) toast.show({ message: 'Task completed', detail: task.title, actionLabel: 'Undo', onAction: () => actions.setTaskStatus(task.id, task.status) });
  };
  return (
    <Touchable onPress={() => router.push(`/task/${task.id}`)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={s.taskRow} accessibilityLabel={`${task.title}, ${task.priority} priority, ${due.text}`} hitSlop={0}>
      <View style={{ paddingTop: 1 }}>
        <Checkbox checked={done} onChange={toggle} accessibilityLabel={`Mark ${task.title} ${done ? 'not done' : 'done'}`} />
      </View>
      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
        <Text variant="bodyStrong" tone={done ? 'tertiary' : 'primary'} numberOfLines={2} style={done ? { textDecorationLine: 'line-through' } : undefined}>
          {task.title}
        </Text>
        <View style={s.meta}>
          {!done ? (
            <Text variant="footnote" tone={due.tone === 'danger' ? 'danger' : due.tone === 'warning' ? 'warning' : 'secondary'} weight={due.tone !== 'neutral' ? 'medium' : 'regular'}>
              {due.text}
            </Text>
          ) : (
            <Text variant="footnote" tone="tertiary">
              Completed
            </Text>
          )}
          {showProgramme && prog ? (
            <Text variant="footnote" tone="tertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
              · {prog.shortName}
            </Text>
          ) : null}
          {showOwner ? (
            <Text variant="footnote" tone="tertiary" numberOfLines={1}>
              · {personName(db, task.ownerId).replace(/^(Prof\.|Dr\.)\s+/, '').split(' ')[0]}
            </Text>
          ) : null}
          {blocked.length && !done ? (
            <View style={s.inline}>
              <Icon name="lock" size={11} tone="tertiary" />
              <Text variant="footnote" tone="tertiary">
                Waiting
              </Text>
            </View>
          ) : null}
          {task.comments.length ? (
            <View style={s.inline}>
              <Icon name="message-square" size={11} tone="tertiary" />
              <Text variant="footnote" tone="tertiary">
                {task.comments.length}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {!done && (task.priority === 'Urgent' || task.priority === 'High') ? <PriorityFlag priority={task.priority} /> : null}
    </Touchable>
  );
}

export function PriorityFlag({ priority }: { priority: Task['priority'] }) {
  const { colors } = useTheme();
  const color = priority === 'Urgent' ? colors.danger : priority === 'High' ? colors.warning : priority === 'Medium' ? colors.accent : colors.neutral;
  return (
    <View accessibilityLabel={`${priority} priority`} style={{ paddingTop: 3 }}>
      <Icon name="flag" size={15} color={color} fill={priority === 'Urgent' ? color : undefined} />
    </View>
  );
}

// ─── Session row ──────────────────────────────────────────────────────────────

export function SessionRow({ session, showProgramme = true, showDate, viewerTz = 'Asia/Dubai', onPress, compact }: { session: Session; showProgramme?: boolean; showDate?: boolean; viewerTz?: Session['timeZone']; onPress?: () => void; compact?: boolean }) {
  const s = useStyles(styles);
  const db = useDB();
  const { colors } = useTheme();
  const prog = getProgramme(db, session.programmeId);
  const fac = session.facultyIds.map((id) => getFaculty(db, id));
  const local = viewerTz !== session.timeZone ? convertZone(session.date, session.start, session.timeZone, viewerTz) : null;
  const hue = prog?.accentHue ?? 220;
  return (
    <Touchable onPress={onPress ?? (() => router.push(`/session/${session.id}`))} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={s.sessionRow} accessibilityLabel={`${session.title}, ${session.start} ${tzAbbr(session.timeZone)}`} hitSlop={0}>
      <View style={s.timeCol}>
        {showDate ? (
          <Text variant="caption" tone="tertiary">
            {formatDate(session.date, { year: false })}
          </Text>
        ) : null}
        <Text variant="headline" tabular>
          {session.start}
        </Text>
        <Text variant="caption" tone="tertiary" tabular>
          {session.date !== session.endDate ? 'Multi-day' : session.end}
        </Text>
      </View>
      <View style={[s.bar, { backgroundColor: `hsl(${hue}, 62%, 58%)` }]} />
      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
        <Text variant="bodyStrong" numberOfLines={compact ? 1 : 2}>
          {session.title}
        </Text>
        <View style={s.meta}>
          <Icon name={DELIVERY_ICON[session.deliveryMode]} size={12} tone="tertiary" />
          <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
            {showProgramme && prog ? `${prog.shortName} · ` : ''}
            {session.deliveryMode === 'Virtual' ? 'Zoom' : (session.roomName ?? session.location ?? '')}
          </Text>
        </View>
        {!compact ? (
          <Text variant="footnote" tone="tertiary" numberOfLines={1}>
            {fac.map((f) => facultyName(f)).join(', ')}
            {local ? ` · ${local.time} ${TIMEZONES[viewerTz].abbr} your time` : ` · ${tzAbbr(session.timeZone)}`}
          </Text>
        ) : null}
      </View>
      {session.status === 'Tentative' ? <StatusPill label="Tentative" /> : null}
    </Touchable>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const ACTIVITY_ICON: Record<ActivityLog['kind'], IconName> = {
  programme_created: 'layers',
  faculty_assigned: 'user-plus',
  material_uploaded: 'upload',
  material_approved: 'badge-check',
  hotel_confirmed: 'bed-double',
  task_completed: 'circle-check',
  invoice_received: 'receipt',
  invoice_issued: 'send',
  approval_granted: 'stamp',
  participant_registered: 'user-check',
  booking_changed: 'repeat',
  session_scheduled: 'calendar-plus',
  comment: 'message-square',
  status_changed: 'activity',
  document_uploaded: 'file-up',
  payment_received: 'banknote',
};

export function ActivityFeed({ items, showProgramme, limit }: { items: ActivityLog[]; showProgramme?: boolean; limit?: number }) {
  const db = useDB();
  const { colors } = useTheme();
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit ?? items.length);
  return (
    <View>
      {sorted.map((a, i) => {
        const isSystem = a.actorId === 'system';
        const name = personName(db, a.actorId);
        const prog = getProgramme(db, a.programmeId);
        return (
          <View key={a.id} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center' }}>
              {isSystem ? (
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ACTIVITY_ICON[a.kind] ?? 'activity'} size={15} tone="accent" />
                </View>
              ) : (
                <Avatar name={name} hue={personHue(db, a.actorId)} size={30} />
              )}
              {i < sorted.length - 1 ? <View style={{ width: 1.5, flex: 1, backgroundColor: colors.border, marginVertical: 4 }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: 16, paddingTop: 4 }}>
              <Text variant="callout">
                <Text variant="callout" weight="semibold">
                  {name}
                </Text>{' '}
                {a.text}
              </Text>
              <Text variant="footnote" tone="tertiary" style={{ marginTop: 2 }}>
                {activityStamp(a.date)}
                {showProgramme && prog ? ` · ${prog.shortName}` : ''}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = makeStyles((t) => ({
  taskRow: { flexDirection: 'row', gap: 12, paddingHorizontal: t.spacing.lg, paddingVertical: 12, alignItems: 'flex-start' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sessionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: t.spacing.lg, paddingVertical: 12, alignItems: 'center' },
  timeCol: { width: 52, alignItems: 'flex-start' },
  bar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
}));
