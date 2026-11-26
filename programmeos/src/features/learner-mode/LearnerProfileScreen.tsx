import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Card, KeyValue, ListGroup, ListRow, Screen, Section, Sheet, Text, TextField, useToast } from '@/components';
import { useActions } from '@/data/store';
import { TIMEZONES } from '@/utils/dates';

import { ExternalSettings } from '../faculty-mode/FacultyProfileScreen';
import { localState, useLocalState } from '../faculty-mode/localState';
import { useLearnerScope } from './data';

export default function LearnerProfileScreen() {
  const actions = useActions();
  const toast = useToast();
  const local = useLocalState();
  const scope = useLearnerScope();
  const { me } = scope;
  const [edit, setEdit] = useState(false);
  const [dietary, setDietary] = useState(me.dietary ?? '');
  const [access, setAccess] = useState(me.accessibility ?? '');
  const prefs = local.learnerPrefs;
  const setPref = (k: keyof typeof prefs, v: boolean) => localState.set((s) => ({ learnerPrefs: { ...s.learnerPrefs, [k]: v } }));

  return (
    <Screen title="Profile" back={false}>
      <Card padding="lg" style={{ alignItems: 'center', gap: 4 }}>
        <Avatar name={`${me.firstName} ${me.lastName}`} hue={me.avatarHue} size={76} />
        <Text variant="title2" style={{ marginTop: 8 }}>
          {me.firstName} {me.lastName}
        </Text>
        <Text variant="callout" tone="secondary" align="center">
          {me.jobTitle}
        </Text>
        <Text variant="footnote" tone="tertiary">
          {me.organisation} · {me.country}
        </Text>
      </Card>

      <Section title="My requirements" action="Edit" onAction={() => { setDietary(me.dietary ?? ''); setAccess(me.accessibility ?? ''); setEdit(true); }} subtitle="Shared with the programme team so every session works for you.">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue icon="salad" label="Dietary" value={me.dietary || 'No requirements'} />
          <KeyValue icon="accessibility" label="Accessibility" value={me.accessibility || 'No requirements'} last multiline />
        </Card>
      </Section>

      <Section title="Contact details">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue icon="mail" label="Email" value={me.email} />
          <KeyValue icon="phone" label="Phone" value={me.phone} />
          <KeyValue icon="globe" label="Time zone" value={`${TIMEZONES[scope.tz].city} · ${TIMEZONES[scope.tz].abbr}`} />
          <KeyValue icon="link-2" label="LinkedIn" value={me.linkedIn ?? '—'} last />
        </Card>
      </Section>

      <Section title="My learning">
        <ListGroup>
          <ListRow icon="badge-check" iconTone="warning" title="Certificates" onPress={() => router.push('/lm/certificates')} />
          <ListRow icon="user-check" iconTone="success" title="Attendance" onPress={() => router.push('/lm/attendance')} />
          <ListRow icon="smile" iconTone="violet" title="Feedback" onPress={() => router.push('/lm/feedback')} />
          <ListRow icon="bell" iconTone="accent" title="Notifications" onPress={() => router.push('/lm/notifications')} />
        </ListGroup>
      </Section>

      <Section title="Notify me about">
        <ListGroup>
          <ListRow title="Session reminders" subtitle="15 minutes before each live session" switchValue={prefs.reminders} onSwitch={(v) => setPref('reminders', v)} />
          <ListRow title="Programme announcements" switchValue={prefs.announcements} onSwitch={(v) => setPref('announcements', v)} />
          <ListRow title="Grades & feedback" switchValue={prefs.grades} onSwitch={(v) => setPref('grades', v)} />
          <ListRow title="WhatsApp updates" subtitle="Coming soon — reminders on WhatsApp" switchValue={prefs.whatsapp} onSwitch={(v) => setPref('whatsapp', v)} />
        </ListGroup>
      </Section>

      <ExternalSettings />

      <Sheet
        visible={edit}
        onClose={() => setEdit(false)}
        title="My requirements"
        footer={
          <Button
            title="Save"
            style={{ flex: 1 }}
            onPress={() => {
              actions.update('learners', me.id, { dietary: dietary.trim() || undefined, accessibility: access.trim() || undefined });
              actions.notify({ category: 'Learners', title: 'Participant requirements updated', body: `${me.firstName} ${me.lastName} updated dietary or accessibility requirements.`, audience: 'staff', route: `/learner/${me.id}` });
              setEdit(false);
              toast.show({ message: 'Requirements saved', detail: 'The programme team has been notified.', icon: 'circle-check' });
            }}
          />
        }>
        <View style={{ gap: 14 }}>
          <TextField label="Dietary requirements" value={dietary} onChangeText={setDietary} placeholder="e.g. Vegetarian, nut allergy" icon="salad" />
          <TextField label="Accessibility needs" value={access} onChangeText={setAccess} placeholder="e.g. Step-free access, captions" multiline />
          <Text variant="footnote" tone="tertiary">
            Only the people organising your programme can see this.
          </Text>
        </View>
      </Sheet>
    </Screen>
  );
}
