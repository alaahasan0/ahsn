import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Avatar,
  Chip,
  ChipRow,
  EmptyState,
  HeaderActions,
  Icon,
  IconButton,
  NoResults,
  Screen,
  SearchField,
  SegmentedControl,
  StatusPill,
  Text,
  Touchable,
  toneColors,
  useToast,
  type IconName,
} from '@/components';
import type { AppNotification, Channel, CommunicationRef, NotificationCategory } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { inboxStamp, timeAgo } from '@/utils/dates';
import { searchMatch } from '@/utils/format';

import { NOTIFICATION_ICON } from '../shared/helpers';
import { ActivityFeed } from '../shared/Rows';
import { LoadGate } from '../shared/Widgets';

export const CHANNEL_META: Record<Channel, { icon: IconName; label: string; hue: number }> = {
  Email: { icon: 'mail', label: 'Email', hue: 215 },
  WhatsApp: { icon: 'message-circle', label: 'WhatsApp', hue: 145 },
  Internal: { icon: 'at-sign', label: 'Internal', hue: 262 },
  Discussion: { icon: 'message-square', label: 'Discussion', hue: 30 },
  'Call Note': { icon: 'phone', label: 'Call note', hue: 190 },
};

type Seg = 'messages' | 'notifications' | 'activity';

export default function InboxScreen() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const [seg, setSeg] = useState<Seg>('messages');
  const [q, setQ] = useState('');
  const [channel, setChannel] = useState<Channel | 'mentions' | 'open' | null>(null);
  const [cat, setCat] = useState<NotificationCategory | 'unread' | null>(null);

  const msgs = db.communications
    .filter((c) => (channel === 'mentions' ? c.mentionsMe : channel === 'open' ? !c.resolved : !channel || c.channel === channel))
    .filter((c) => searchMatch(q, c.subject, c.excerpt, c.counterpart.name, c.counterpart.org, getProgramme(db, c.programmeId)?.name))
    .sort((a, b) => b.date.localeCompare(a.date));
  const notes = db.notifications
    .filter((n) => n.audience === 'staff' && (cat === 'unread' ? !n.read : !cat || n.category === cat))
    .filter((n) => searchMatch(q, n.title, n.body))
    .sort((a, b) => b.date.localeCompare(a.date));
  const unreadMsgs = db.communications.filter((c) => c.unread).length;
  const unreadNotes = db.notifications.filter((n) => n.audience === 'staff' && !n.read).length;

  return (
    <Screen
      title="Inbox"
      back={false}
      refreshable
      headerRight={
        <HeaderActions>
          {seg === 'notifications' && unreadNotes ? (
            <IconButton
              icon="check"
              accessibilityLabel="Mark all as read"
              onPress={() => {
                actions.markAllNotificationsRead('staff');
                toast.show({ message: 'All notifications marked as read', tone: 'neutral', icon: 'check' });
              }}
            />
          ) : null}
          <IconButton icon="settings" accessibilityLabel="Notification settings" onPress={() => router.push('/settings')} />
        </HeaderActions>
      }
      headerBelow={
        <>
          <SegmentedControl
            value={seg}
            onChange={setSeg}
            options={[
              { value: 'messages', label: 'Messages', count: unreadMsgs || undefined },
              { value: 'notifications', label: 'Notifications', count: unreadNotes || undefined },
              { value: 'activity', label: 'Activity' },
            ]}
          />
          {seg !== 'activity' ? <SearchField value={q} onChangeText={setQ} placeholder={seg === 'messages' ? 'Search messages and people' : 'Search notifications'} /> : null}
          {seg === 'messages' ? (
            <ChipRow>
              <Chip label="All" selected={!channel} onPress={() => setChannel(null)} />
              <Chip label="Mentions" icon="at-sign" selected={channel === 'mentions'} onPress={() => setChannel('mentions')} />
              <Chip label="Open" selected={channel === 'open'} onPress={() => setChannel('open')} />
              {(['Email', 'WhatsApp', 'Internal', 'Call Note'] as Channel[]).map((c) => (
                <Chip key={c} label={CHANNEL_META[c].label} icon={CHANNEL_META[c].icon} selected={channel === c} onPress={() => setChannel(c)} />
              ))}
            </ChipRow>
          ) : seg === 'notifications' ? (
            <ChipRow>
              <Chip label="All" selected={!cat} onPress={() => setCat(null)} />
              <Chip label="Unread" selected={cat === 'unread'} onPress={() => setCat('unread')} />
              {(Object.keys(NOTIFICATION_ICON) as NotificationCategory[]).map((c) => (
                <Chip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />
              ))}
            </ChipRow>
          ) : null}
        </>
      }>
      <LoadGate loadKey={`inbox-${seg}`}>
        {seg === 'messages' ? (
          msgs.length ? (
            <View style={{ gap: 8 }}>
              {msgs.map((m) => (
                <MessageRow key={m.id} m={m} />
              ))}
              <Text variant="footnote" tone="tertiary" align="center" style={{ marginTop: 8 }}>
                Email and WhatsApp threads are shown as references. Live integrations arrive in a later phase.
              </Text>
            </View>
          ) : q ? (
            <NoResults query={q} onClear={() => setQ('')} />
          ) : (
            <EmptyState icon="inbox" title="Inbox zero" message="No messages in this view." />
          )
        ) : seg === 'notifications' ? (
          notes.length ? (
            <View style={{ gap: 8 }}>
              {notes.map((n) => (
                <NotificationRow key={n.id} n={n} />
              ))}
            </View>
          ) : q ? (
            <NoResults query={q} onClear={() => setQ('')} />
          ) : (
            <EmptyState icon="bell" title="You’re all caught up" message="New notifications will appear here." />
          )
        ) : (
          <View style={{ backgroundColor: 'transparent' }}>
            <ActivityFeed items={db.activity} showProgramme limit={30} />
          </View>
        )}
      </LoadGate>
    </Screen>
  );
}

export function MessageRow({ m }: { m: CommunicationRef }) {
  const s = useStyles(styles);
  const db = useDB();
  const { isDark } = useTheme();
  const meta = CHANNEL_META[m.channel];
  const prog = getProgramme(db, m.programmeId);
  return (
    <Touchable onPress={() => router.push(`/message/${m.id}` as Href)} feedback="highlight" style={s.row} accessibilityLabel={`${m.unread ? 'Unread. ' : ''}${meta.label} from ${m.counterpart.name}: ${m.subject}`}>
      <View>
        <Avatar name={m.counterpart.name} hue={meta.hue + 10} size={42} />
        <View style={[s.channel, { backgroundColor: isDark ? `hsl(${meta.hue},40%,30%)` : `hsl(${meta.hue},60%,46%)` }]}>
          <Icon name={meta.icon} size={10} color="#FFFFFF" strokeWidth={2.4} />
        </View>
      </View>
      <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="headline" weight={m.unread ? 'semibold' : 'medium'} numberOfLines={1} style={{ flex: 1 }}>
            {m.counterpart.name}
            {m.counterpart.org ? <Text variant="footnote" tone="tertiary">{`  ${m.counterpart.org}`}</Text> : null}
          </Text>
          <Text variant="footnote" tone={m.unread ? 'accent' : 'tertiary'}>
            {inboxStamp(m.date)}
          </Text>
        </View>
        <Text variant="callout" weight={m.unread ? 'medium' : 'regular'} numberOfLines={1}>
          {m.subject}
        </Text>
        <Text variant="subhead" tone="secondary" numberOfLines={2}>
          {m.excerpt}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {prog ? <StatusPill label={prog.shortName} tone="neutral" icon="layers" /> : null}
          {m.taskId ? <StatusPill label="Task linked" tone="accent" icon="square-check-big" /> : null}
          {m.resolved ? <StatusPill label="Resolved" /> : null}
          {m.mentionsMe ? <StatusPill label="Mention" tone="violet" icon="at-sign" /> : null}
        </View>
      </View>
      {m.unread ? <View style={s.dot} /> : null}
    </Touchable>
  );
}

export function NotificationRow({ n, onPress }: { n: AppNotification; onPress?: () => void }) {
  const s = useStyles(styles);
  const actions = useActions();
  const { colors } = useTheme();
  const meta = NOTIFICATION_ICON[n.category];
  const tc = toneColors(meta.tone, colors);
  return (
    <Touchable
      onPress={
        onPress ??
        (() => {
          actions.markNotificationRead(n.id);
          if (n.route) router.push(n.route as Href);
        })
      }
      onLongPress={() => actions.markNotificationRead(n.id, !n.read)}
      feedback="highlight"
      style={[s.row, !n.read && { backgroundColor: colors.surface }]}
      accessibilityLabel={`${n.read ? '' : 'Unread. '}${n.title}. ${n.body}`}
      accessibilityHint="Long press to toggle read">
      <View style={[s.nIcon, { backgroundColor: tc.bg }]}>
        <Icon name={meta.icon} size={18} color={tc.solid} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Text variant="headline" weight={n.read ? 'medium' : 'semibold'} style={{ flex: 1 }} numberOfLines={2}>
            {n.title}
          </Text>
          <Text variant="footnote" tone="tertiary">
            {timeAgo(n.date)}
          </Text>
        </View>
        <Text variant="subhead" tone="secondary" numberOfLines={3}>
          {n.body}
        </Text>
        <Text variant="caption" tone="tertiary" style={{ marginTop: 2 }}>
          {n.category}
          {n.actorName ? ` · ${n.actorName}` : ''}
        </Text>
      </View>
      {!n.read ? <View style={s.dot} /> : null}
    </Touchable>
  );
}

const styles = makeStyles((t) => ({
  row: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: t.radii.lg, backgroundColor: t.colors.surface, alignItems: 'flex-start', borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  channel: { position: 'absolute', right: -3, bottom: -3, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: t.colors.surface },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: t.colors.accent, marginTop: 6 },
  nIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
}));
