import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, ListGroup, ListRow, Screen, Section, Text, useToast, IconTile, Icon } from '@/components';
import { FACULTY_PERSONA_ID, LEARNER_PERSONA_ID, rolePersona } from '@/data/mock';
import type { StaffRoleKey } from '@/data/models';
import { facultyName, getFaculty, getLearner, getStaff, learnerName } from '@/data/selectors';
import { homeRouteFor, useSession, type AppMode } from '@/data/session';
import { useDB } from '@/data/store';

import { ROLE_ICONS, ROLE_TONES } from './roles';

/**
 * Prototype-only: preview ProgrammeOS as any role. In production this is replaced by SSO
 * and real permissions; the experiences themselves are unchanged.
 */
export default function RoleSwitcherScreen() {
  const db = useDB();
  const session = useSession();
  const toast = useToast();

  const go = (mode: AppMode, role?: StaffRoleKey) => {
    if (mode === 'staff' && role) session.switchRole(role);
    else session.switchMode(mode);
    if (!session.signedIn) session.signIn(mode, role);
    router.dismissAll();
    setTimeout(() => router.replace(homeRouteFor(mode)), 10);
    const label = mode === 'staff' && role ? db.roles.find((r) => r.key === role)?.label : mode === 'faculty' ? 'Faculty Mode' : 'Learner Mode';
    toast.show({ message: `Now previewing ${label}`, icon: 'repeat', tone: 'accent' });
  };

  const fac = getFaculty(db, FACULTY_PERSONA_ID);
  const lea = getLearner(db, LEARNER_PERSONA_ID);

  return (
    <Screen title="Preview as" subtitle="Switch between the staff roles and the faculty and learner experiences. Sample data only — no sign-in required." back="close">
      <Section title="Internal staff" first>
        <ListGroup>
          {db.roles.map((r) => {
            const person = getStaff(db, rolePersona[r.key]);
            const active = session.mode === 'staff' && session.role === r.key;
            return (
              <ListRow
                key={r.key}
                leading={<IconTile icon={ROLE_ICONS[r.key]} tone={ROLE_TONES[r.key]} size={34} />}
                title={r.label}
                subtitle={`${person?.name} · ${r.description}`}
                onPress={() => go('staff', r.key)}
                trailing={active ? <Icon name="check" size={20} tone="accent" strokeWidth={2.6} /> : undefined}
                chevron={false}
              />
            );
          })}
        </ListGroup>
      </Section>
      <Section title="External experiences" subtitle="Separate, simplified apps with no access to internal management data.">
        <ListGroup>
          <ListRow
            leading={<Avatar name={fac?.name ?? ''} hue={fac?.avatarHue} size={34} />}
            title="Faculty Mode"
            subtitle={`${facultyName(fac)} · teaching schedule, materials, travel, contracts`}
            onPress={() => go('faculty')}
            trailing={session.mode === 'faculty' ? <Icon name="check" size={20} tone="accent" strokeWidth={2.6} /> : undefined}
            chevron={false}
          />
          <ListRow
            leading={<Avatar name={learnerName(lea)} hue={lea?.avatarHue} size={34} />}
            title="Learner Mode"
            subtitle={`${learnerName(lea)} · programme, sessions, materials, certificates`}
            onPress={() => go('learner')}
            trailing={session.mode === 'learner' ? <Icon name="check" size={20} tone="accent" strokeWidth={2.6} /> : undefined}
            chevron={false}
          />
        </ListGroup>
      </Section>
      <View style={{ marginTop: 20, paddingHorizontal: 4 }}>
        <Text variant="footnote" tone="tertiary">
          Client and supplier portals are planned for a later phase. Hotels, clients and suppliers are managed by Emeritus staff in this version.
        </Text>
      </View>
    </Screen>
  );
}
