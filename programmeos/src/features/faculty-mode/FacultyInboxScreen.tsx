import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Chip, ChipRow, EmptyState, IconTile, ListGroup, ListRow, Screen, SegmentedControl, Sheet, Text, TextField, useToast } from '@/components';
import type { AppNotification } from '@/data/models';
import { getProgramme, getStaff, personHue } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { activityStamp, inboxStamp } from '@/utils/dates';

import { NOTIFICATION_ICON } from '../shared/helpers';
import { teamMessages, useFacultyScope, type TeamMessage } from './data';
import { localState, useLocalState } from './localState';

/**
 * Notification list shared by the external experiences (faculty and learner).
 */
export function NotificationList({ items, onOpen, filter }: { items: AppNotification[]; onOpen: (n: AppNotification) => void; filter: string }) {
  const { colors } = useTheme();
  const shown = items.filter((n) => filter === 'All' || (filter === 'Unread' ? !n.read : n.category === filter));
  if (!shown.length) return <EmptyState icon="bell" title={filter === 'Unread' ? 'You’re all caught up' : 'Nothing here yet'} message="New updates from the programme team will appear here." />;
  return (
    <ListGroup>
      {shown.map((n) => {
        const meta = NOTIFICATION_ICON[n.category];
        return (
          <ListRow
            key={n.id}
            leading={<IconTile icon={meta.icon} tone={meta.tone === 'neutral' ? 'neutral' : (meta.tone as 'accent')} size={34} />}
            title={n.title}
            titleTone={n.read ? 'secondary' : 'primary'}
            subtitle={n.body}
            meta={`${inboxStamp(n.date)}${n.actorName ? ` · ${n.actorName}` : ''}`}
            numberOfLines={2}
            trailing={<View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: n.read ? 'transparent' : colors.accent }} />}
            onPress={() => onOpen(n)}
          />
        );
      })}
    </ListGroup>
  );
}

export default function FacultyInboxScreen() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const local = useLocalState();
  const scope = useFacultyScope();
  const [tab, setTab] = useState<'updates' | 'messages'>('updates');
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState<TeamMessage | null>(null);
  const [reply, setReply] = useState('');
  const messages = teamMessages(db, scope.me.id).map((m) => ({ ...m, unread: m.unread && !local.readMessages.includes(m.id) }));
  const unreadUpdates = scope.notifications.filter((n) => !n.read).length;
  const unreadMessages = messages.filter((m) => m.unread).length;
  const categories = ['All', 'Unread', ...new Set(scope.notifications.map((n) => n.category))];

  return (
    <Screen
      title="Inbox"
      subtitle="Updates and messages from your programme teams."
      back={false}
      headerRight={
        <Button
          title="Read all"
          variant="plain"
          size="sm"
          accessibilityLabel="Mark all as read"
          onPress={() => {
            actions.markAllNotificationsRead('faculty');
            messages.forEach((m) => localState.addTo('readMessages', m.id));
            toast.show({ message: 'All caught up', icon: 'check', tone: 'neutral' });
          }}
        />
      }
      headerBelow={
        <SegmentedControl
          options={[
            { value: 'updates', label: 'Updates', count: unreadUpdates || undefined },
            { value: 'messages', label: 'Messages', count: unreadMessages || undefined },
          ]}
          value={tab}
          onChange={setTab}
        />
      }>
      {tab === 'updates' ? (
        <View style={{ gap: 12 }}>
          <ChipRow>
            {categories.map((c) => (
              <Chip key={c} label={c} selected={filter === c} onPress={() => setFilter(c)} />
            ))}
          </ChipRow>
          <NotificationList
            items={scope.notifications}
            filter={filter}
            onOpen={(n) => {
              actions.markNotificationRead(n.id);
              if (n.route) router.push(n.route as Href);
            }}
          />
        </View>
      ) : messages.length ? (
        <ListGroup>
          {messages.map((m) => {
            const from = getStaff(db, m.fromId);
            return (
              <ListRow
                key={m.id}
                leading={<Avatar name={from?.name ?? 'Emeritus'} hue={personHue(db, m.fromId)} size={38} />}
                title={m.subject}
                titleTone={m.unread ? 'primary' : 'secondary'}
                subtitle={`${from?.name} · ${m.body}`}
                meta={`${inboxStamp(m.date)}${m.programmeId ? ` · ${getProgramme(db, m.programmeId)?.shortName}` : ''}`}
                numberOfLines={2}
                onPress={() => {
                  localState.addTo('readMessages', m.id);
                  setReply('');
                  setOpen(m);
                }}
              />
            );
          })}
        </ListGroup>
      ) : (
        <EmptyState icon="mail" title="No messages" message="Messages from your programme team will appear here." />
      )}

      <Sheet
        visible={!!open}
        onClose={() => setOpen(null)}
        title={open ? getStaff(db, open.fromId)?.name : undefined}
        subtitle={open ? getStaff(db, open.fromId)?.title : undefined}
        footer={
          <Button
            title="Send reply"
            icon="send"
            disabled={!reply.trim()}
            style={{ flex: 1 }}
            onPress={() => {
              setOpen(null);
              toast.show({ message: 'Reply sent', detail: 'Delivered to the programme team.', icon: 'send' });
            }}
          />
        }>
        {open ? (
          <View style={{ gap: 12 }}>
            <Text variant="title3">{open.subject}</Text>
            <Text variant="footnote" tone="tertiary">
              {activityStamp(open.date)}
              {open.programmeId ? ` · ${getProgramme(db, open.programmeId)?.name}` : ''}
            </Text>
            <Text variant="body">{open.body}</Text>
            <TextField label="Reply" value={reply} onChangeText={setReply} placeholder="Write a reply…" multiline />
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}
