import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Card, KeyValue, ListGroup, ListRow, Screen, Section, SegmentedControl, Tag, Text, useDialog } from '@/components';
import { useSession } from '@/data/session';
import type { ThemePreference } from '@/theme';
import { TIMEZONES } from '@/utils/dates';

import { HubLink, Stars } from './common';
import { useFacultyScope } from './data';

/** Appearance, notification and experience settings shared by the external apps. */
export function ExternalSettings() {
  const session = useSession();
  const dialog = useDialog();
  return (
    <>
      <Section title="Appearance">
        <SegmentedControl<ThemePreference>
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          value={session.themePreference}
          onChange={(v) => session.setPreference('themePreference', v)}
        />
      </Section>
      <Section title="Account">
        <ListGroup>
          <ListRow icon="bell" title="Push notifications" switchValue={session.notificationsEnabled} onSwitch={(v) => session.setPreference('notificationsEnabled', v)} />
          <ListRow icon="repeat" title="Switch experience" subtitle="Preview another role or app" onPress={() => router.push('/role-switcher')} />
          <ListRow
            icon="log-out"
            iconTone="danger"
            title="Sign out"
            destructive
            onPress={async () => {
              const { confirmed } = await dialog.confirm({ title: 'Sign out of ProgrammeOS?', message: 'You can sign back in at any time with Emeritus SSO.', confirmLabel: 'Sign out', destructive: true, icon: 'log-out' });
              if (!confirmed) return;
              session.signOut();
              router.replace('/welcome');
            }}
          />
        </ListGroup>
      </Section>
    </>
  );
}

export default function FacultyProfileScreen() {
  const scope = useFacultyScope();
  const { me } = scope;
  const avg = scope.feedback.length ? scope.feedback.reduce((s, f) => s + f.rating, 0) / scope.feedback.length : me.rating;
  return (
    <Screen title="Profile" back={false}>
      <Card padding="lg" style={{ alignItems: 'center', gap: 6 }}>
        <Avatar name={me.name} hue={me.avatarHue} size={76} />
        <Text variant="title2" align="center" style={{ marginTop: 6 }}>
          {me.honorific} {me.name}
        </Text>
        <Text variant="callout" tone="secondary" align="center">
          {me.title}
        </Text>
        <Text variant="footnote" tone="tertiary" align="center">
          {me.institution} · {me.location}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 }}>
          <View style={{ alignItems: 'center', gap: 2 }}>
            <Stars value={avg} />
            <Text variant="caption" tone="tertiary">
              {avg.toFixed(1)} average
            </Text>
          </View>
          <View style={{ width: 1, height: 28, backgroundColor: 'rgba(127,127,127,0.25)' }} />
          <View style={{ alignItems: 'center' }}>
            <Text variant="headline" tabular>
              {me.sessionsDelivered}
            </Text>
            <Text variant="caption" tone="tertiary">
              sessions taught
            </Text>
          </View>
        </View>
      </Card>

      <Section title="My teaching">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <HubLink icon="calendar-check" label="Availability" detail={me.unavailable.length ? `${me.unavailable.length} blocked period${me.unavailable.length === 1 ? '' : 's'}` : 'All dates open'} route="/fm/availability" tone="accent" />
          <HubLink icon="book-open" label="Materials" detail={`${scope.materials.length} items`} route="/fm/materials" tone="violet" />
          <HubLink icon="file-signature" label="Contracts" detail="Agreements & status" route="/fm/contracts" tone="info" />
          <HubLink icon="wallet" label="Payments" detail="Your fees & invoices" route="/fm/payments" tone="success" />
          <HubLink icon="plane" label="Travel" detail={`${scope.itineraries.length} itineraries`} route="/fm/travel" tone="warning" />
          <HubLink icon="bed-double" label="Hotel" detail={`${scope.bookings.length} stays`} route="/fm/hotel" tone="info" />
          <HubLink icon="folder-open" label="Documents" detail={`${scope.documents.length} files`} route="/fm/documents" tone="neutral" />
          <HubLink icon="star" label="Feedback" detail={`${scope.feedback.length} evaluations`} route="/fm/feedback" tone="warning" />
        </View>
      </Section>

      <Section title="About">
        <Card>
          <Text variant="body">{me.bio}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {me.expertise.map((e) => (
              <Tag key={e} label={e} />
            ))}
          </View>
        </Card>
      </Section>

      <Section title="Details">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue icon="mail" label="Email" value={me.email} />
          <KeyValue icon="phone" label="Phone" value={me.phone} />
          <KeyValue icon="globe" label="Time zone" value={`${TIMEZONES[me.timeZone].city} · ${TIMEZONES[me.timeZone].abbr}`} />
          <KeyValue icon="languages" label="Languages" value={me.languages.join(', ')} />
          <KeyValue icon="plane-takeoff" label="Home airport" value={me.preferredAirport} />
          <KeyValue icon="salad" label="Dietary" value={me.dietary ?? 'No requirements'} last />
        </Card>
      </Section>

      <ExternalSettings />
    </Screen>
  );
}
