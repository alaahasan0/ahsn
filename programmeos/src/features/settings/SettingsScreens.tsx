import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Avatar,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  KeyValue,
  ListGroup,
  ListRow,
  ListSkeleton,
  NoFilterResults,
  NoResults,
  OfflineState,
  RestrictedState,
  Screen,
  Section,
  SegmentedControl,
  StatusPill,
  SuccessState,
  Text,
  useDialog,
  useToast,
  type IconName,
} from '@/components';
import { getProgramme, getStaff, groupTasks } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import type { ThemePreference } from '@/theme';
import { TIMEZONES, tzOffsetLabel } from '@/utils/dates';

import { ROLE_ICONS } from '../session/roles';
import { TaskRow } from '../shared/Rows';

// ─── Settings ─────────────────────────────────────────────────────────────────

export function SettingsScreen() {
  const session = useSession();
  const actions = useActions();
  const dialog = useDialog();
  const toast = useToast();
  const db = useDB();
  const [digest, setDigest] = useState(true);
  const [push, setPush] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);

  const reset = async () => {
    const { confirmed } = await dialog.confirm({ title: 'Reset sample data?', message: 'All changes you made in this prototype (approvals, tasks, bookings…) will be undone.', confirmLabel: 'Reset', destructive: true, icon: 'rotate-ccw' });
    if (confirmed) {
      actions.reset();
      toast.show({ message: 'Sample data restored', icon: 'rotate-ccw' });
    }
  };

  return (
    <Screen title="Settings">
      <Section title="Appearance" first>
        <Card style={{ gap: 12 }}>
          <Text variant="label" tone="secondary">
            Theme
          </Text>
          <SegmentedControl<ThemePreference>
            value={session.themePreference}
            onChange={(v) => session.setPreference('themePreference', v)}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </Card>
        <ListGroup>
          <ListRow icon="eye" iconTone="neutral" title="Reduce motion" subtitle="Minimise animations and transitions" switchValue={session.reduceMotion} onSwitch={(v) => session.setPreference('reduceMotion', v)} />
        </ListGroup>
      </Section>

      <Section title="Preview">
        <ListGroup>
          <ListRow icon={session.mode === 'staff' ? ROLE_ICONS[session.role] : 'repeat'} iconTone="accent" title="Preview as" value={session.mode === 'staff' ? db.roles.find((r) => r.key === session.role)?.label : session.mode === 'faculty' ? 'Faculty Mode' : 'Learner Mode'} onPress={() => router.push('/role-switcher')} />
          <ListRow icon="layout-dashboard" iconTone="neutral" title="UI states gallery" onPress={() => router.push('/states')} />
        </ListGroup>
      </Section>

      <Section title="Notifications">
        <ListGroup>
          <ListRow icon="bell" iconTone="warning" title="Push notifications" switchValue={push} onSwitch={setPush} />
          <ListRow icon="mail" iconTone="accent" title="Daily digest email" subtitle="07:30 in your time zone" switchValue={digest} onSwitch={setDigest} />
          <ListRow icon="message-circle" iconTone="success" title="WhatsApp alerts" subtitle="Available when the WhatsApp integration launches" switchValue={whatsapp} onSwitch={setWhatsapp} disabled />
        </ListGroup>
      </Section>

      <Section title="Region">
        <ListGroup>
          <ListRow icon="globe" iconTone="info" title="Time zone" value={`${TIMEZONES['Asia/Dubai'].city} (${tzOffsetLabel('Asia/Dubai')})`} />
          <ListRow icon="languages" iconTone="info" title="Language" value="English (UK)" />
          <ListRow icon="banknote" iconTone="info" title="Reporting currency" value="USD" />
        </ListGroup>
      </Section>

      <Section title="Integrations" subtitle="Designed for, not yet connected">
        <ListGroup>
          {([
            ['Microsoft 365 email', 'mail'],
            ['WhatsApp Business', 'message-circle'],
            ['Google / Outlook calendar', 'calendar'],
            ['Zoom & Microsoft Teams', 'video'],
            ['Finance system (ERP)', 'landmark'],
          ] as [string, IconName][]).map(([label, icon]) => (
            <ListRow key={label} icon={icon} iconTone="neutral" title={label} trailing={<StatusPill label="Planned" tone="neutral" />} />
          ))}
        </ListGroup>
      </Section>

      <Section title="Prototype controls" subtitle="Simulate conditions to review designed states">
        <ListGroup>
          <ListRow icon="wifi-off" iconTone="warning" title="Simulate offline" subtitle="Shows the offline banner across the app" switchValue={session.simulateOffline} onSwitch={(v) => session.setPreference('simulateOffline', v)} />
          <ListRow icon="hourglass" iconTone="accent" title="Simulate slow loading" subtitle="Longer skeletons on list screens" switchValue={session.simulateSlowLoading} onSwitch={(v) => session.setPreference('simulateSlowLoading', v)} />
          <ListRow icon="circle-alert" iconTone="danger" title="Simulate errors" subtitle="List screens fail once, then recover on retry" switchValue={session.simulateErrors} onSwitch={(v) => session.setPreference('simulateErrors', v)} />
          <ListRow icon="rotate-ccw" iconTone="danger" title="Reset sample data" destructive onPress={reset} />
        </ListGroup>
      </Section>

      <Section title="Account">
        <ListGroup>
          <ListRow icon="shield-check" iconTone="success" title="Signed in with Emeritus SSO" subtitle="Simulated — no real authentication" />
          <ListRow icon="log-out" iconTone="danger" title="Sign out" destructive onPress={() => { session.signOut(); router.replace('/welcome'); }} />
        </ListGroup>
      </Section>
      <Text variant="footnote" tone="tertiary" align="center" style={{ marginTop: 20 }}>
        ProgrammeOS prototype · Expo SDK 58 · all data is fictional
      </Text>
    </Screen>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const db = useDB();
  const { userId, role } = useSession();
  const me = getStaff(db, userId);
  const toast = useToast();
  if (!me) return null;
  const managed = db.programmes.filter((p) => [p.managerId, p.ownerId, p.coordinatorId].includes(me.id) && !p.archived);
  const g = groupTasks(db.tasks.filter((t) => t.ownerId === me.id));
  return (
    <Screen title="Profile" large={false}>
      <View style={{ alignItems: 'center', gap: 6, marginTop: 8 }}>
        <Avatar name={me.name} hue={me.avatarHue} size={84} />
        <Text variant="title2" align="center">
          {me.name}
        </Text>
        <Text variant="callout" tone="secondary" align="center">
          {me.title}
        </Text>
        <StatusPill label={db.roles.find((r) => r.key === role)?.label ?? ''} tone="accent" size="md" />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
        <Button title="Message" icon="message-square" variant="secondary" onPress={() => toast.show({ message: 'Opens a direct message (future integration)', tone: 'neutral' })} style={{ flex: 1 }} />
        <Button title="Switch role" icon="repeat" variant="tinted" onPress={() => router.push('/role-switcher')} style={{ flex: 1 }} />
      </View>
      <Section title="Contact">
        <Card style={{ paddingVertical: 4 }}>
          <KeyValue label="Email" value={me.email} icon="mail" />
          <KeyValue label="Phone" value={me.phone} icon="phone" />
          <KeyValue label="Team" value={me.team} icon="users" />
          <KeyValue label="Location" value={`${me.location} · ${TIMEZONES[me.timeZone].abbr}`} icon="map-pin" last />
        </Card>
      </Section>
      <Section title="My programmes">
        <ListGroup>
          {managed.length ? (
            managed.map((p) => <ListRow key={p.id} icon="layers" iconTone="violet" title={p.name} subtitle={p.managerId === me.id ? 'Programme manager' : p.ownerId === me.id ? 'Programme owner' : 'Coordinator'} onPress={() => router.push(`/programme/${p.id}` as Href)} />)
          ) : (
            <ListRow icon="layers" iconTone="neutral" title="No programmes assigned" subtitle="Programmes you manage or coordinate appear here" />
          )}
        </ListGroup>
      </Section>
      <Section title="Open tasks" action="All" onAction={() => router.push('/tasks')}>
        <ListGroup>
          {[...g.overdue, ...g.today, ...g.week].slice(0, 4).map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
          {!g.overdue.length && !g.today.length && !g.week.length ? <ListRow icon="circle-check-big" iconTone="success" title="Nothing due this week" /> : null}
        </ListGroup>
      </Section>
      <Section title="Preferences">
        <ListGroup>
          <ListRow icon="settings" iconTone="neutral" title="Settings" onPress={() => router.push('/settings')} />
        </ListGroup>
      </Section>
    </Screen>
  );
}

// ─── UI states gallery ────────────────────────────────────────────────────────

type StateKey = 'default' | 'empty' | 'loading' | 'error' | 'offline' | 'success' | 'noSearch' | 'noFilter' | 'restricted' | 'archived' | 'pending' | 'overdue' | 'completed' | 'cancelled' | 'unsaved';

const STATES: { key: StateKey; label: string }[] = [
  { key: 'default', label: 'Default' },
  { key: 'empty', label: 'Empty' },
  { key: 'loading', label: 'Loading' },
  { key: 'error', label: 'Error' },
  { key: 'offline', label: 'Offline' },
  { key: 'success', label: 'Success' },
  { key: 'noSearch', label: 'No search results' },
  { key: 'noFilter', label: 'No filter results' },
  { key: 'restricted', label: 'Permission restricted' },
  { key: 'archived', label: 'Archived' },
  { key: 'pending', label: 'Pending approval' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'unsaved', label: 'Unsaved changes' },
];

export function StatesGalleryScreen() {
  const db = useDB();
  const [state, setState] = useState<StateKey>('default');
  const elp = getProgramme(db, 'p-elp')!;
  const overdue = db.tasks.find((t) => t.id === 't-11')!;
  const done = db.tasks.find((t) => t.status === 'Done')!;
  return (
    <Screen
      title="UI states"
      subtitle="Every module is designed for more than the ideal case. Tap a state to preview it; most also appear in context across the app."
      headerBelow={
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {STATES.map((s) => (
            <Button key={s.key} title={s.label} size="sm" variant={state === s.key ? 'primary' : 'secondary'} onPress={() => setState(s.key)} />
          ))}
        </View>
      }>
      <Card padding="md" style={{ minHeight: 320, justifyContent: 'center' }}>
        {state === 'default' ? <ListGroup><ListRow icon="layers" iconTone="violet" title={elp.name} subtitle="In preparation · 82% ready" chevron /><ListRow icon="layers" iconTone="violet" title="Digital Transformation for Executives" subtitle="In preparation" chevron /></ListGroup> : null}
        {state === 'empty' ? <EmptyState icon="folder-open" title="No documents yet" message="Upload contracts, rooming lists and materials so everything lives with the programme." actionLabel="Upload document" /> : null}
        {state === 'loading' ? <ListSkeleton count={3} /> : null}
        {state === 'error' ? <ErrorState onRetry={() => setState('default')} /> : null}
        {state === 'offline' ? <OfflineState onRetry={() => setState('default')} /> : null}
        {state === 'success' ? <SuccessState title="Booking confirmed" message="Confirmation CGH-48210 recorded and the rooming list updated." actionLabel="View booking" /> : null}
        {state === 'noSearch' ? <NoResults query="Zanzibar" onClear={() => setState('default')} /> : null}
        {state === 'noFilter' ? <NoFilterResults onReset={() => setState('default')} /> : null}
        {state === 'restricted' ? <RestrictedState module="Finance" /> : null}
        {state === 'archived' ? <Banner tone="neutral" icon="archive" title="Archived · read-only" message="Women in Leadership Forum completed financial closure on 15 Jan 2027." action="Restore" /> : null}
        {state === 'pending' ? <Banner tone="warning" icon="hourglass" title="Pending approval" message="Hotel deposit $28,350 is waiting for Rajiv Menon. Requested 26 Mar." action="Send reminder" /> : null}
        {state === 'overdue' ? <ListGroup><TaskRow task={overdue} /></ListGroup> : null}
        {state === 'completed' ? <ListGroup><TaskRow task={done} /></ListGroup> : null}
        {state === 'cancelled' ? <Banner tone="neutral" icon="ban" title="Programme cancelled" message="Client postponed to FY2028. Venue hold released; cancellation fee recovered." /> : null}
        {state === 'unsaved' ? (
          <View style={{ alignItems: 'center', gap: 10, padding: 16 }}>
            <Icon name="triangle-alert" size={28} tone="warning" />
            <Text variant="title3">Discard changes?</Text>
            <Text tone="secondary" align="center">
              Leaving the edit screen with unsaved changes asks for confirmation. Try it: Programme → ⋯ → Edit, change a field and go back.
            </Text>
            <Button title="Open edit screen" variant="tinted" onPress={() => router.push('/programme/p-elp/edit')} />
          </View>
        ) : null}
      </Card>
      <Text variant="footnote" tone="tertiary" style={{ marginTop: 12 }}>
        Tip: Settings → Prototype controls simulates offline, slow loading and errors across real screens.
      </Text>
    </Screen>
  );
}
