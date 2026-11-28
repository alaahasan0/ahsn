import { useState } from 'react';
import { View } from 'react-native';

import { Header, Icon, ListRow, Screen, Section, SegmentedControl, Switch, Text, type IconName } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import type { UserRole } from '@/types/models';

const CAPS = ['calendarAll', 'calendarOwn', 'createBookings', 'manageCustomers', 'viewRevenue', 'manageServices', 'manageTeam', 'manageSettings', 'billing', 'voiceAssistant'] as const;
type Cap = (typeof CAPS)[number];

const CAP_ICON: Record<Cap, IconName> = {
  calendarAll: 'calendar',
  calendarOwn: 'user',
  createBookings: 'plus-circle',
  manageCustomers: 'users',
  viewRevenue: 'bar-chart-2',
  manageServices: 'scissors',
  manageTeam: 'briefcase',
  manageSettings: 'settings',
  billing: 'credit-card',
  voiceAssistant: 'mic',
};

const DEFAULTS: Record<UserRole, Cap[]> = {
  owner: [...CAPS],
  manager: ['calendarAll', 'calendarOwn', 'createBookings', 'manageCustomers', 'viewRevenue', 'manageServices', 'manageTeam', 'voiceAssistant'],
  barber: ['calendarOwn', 'createBookings', 'manageCustomers', 'voiceAssistant'],
  receptionist: ['calendarAll', 'createBookings', 'manageCustomers'],
};

export default function RolesScreen() {
  const { colors, radius } = useTheme();
  const { t, f } = useI18n();
  const [role, setRole] = useState<UserRole>('barber');
  const [matrix, setMatrix] = useState(DEFAULTS);
  const locked = role === 'owner';
  const granted = matrix[role];
  const toggle = (c: Cap, on: boolean) => setMatrix((m) => ({ ...m, [role]: on ? [...m[role], c] : m[role].filter((x) => x !== c) }));
  const roles: UserRole[] = ['owner', 'manager', 'barber', 'receptionist'];

  return (
    <Screen header={<Header title={t('settings.roles.title')} backFallback="/settings" />}>
      <View style={{ gap: 20, paddingTop: 8 }}>
        <Text variant="footnote" tone="secondary">
          {t('settings.roles.subtitle')}
        </Text>
        <SegmentedControl size="sm" value={role} onChange={setRole} segments={roles.map((r) => ({ value: r, label: t(`domain.role.${r}`) }))} />

        {/* Overview grid: every role × capability at a glance */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {roles.map((r) => (
            <View key={r} style={{ flex: 1, padding: 10, gap: 6, borderRadius: radius.md, backgroundColor: r === role ? colors.accentSoft : colors.surfaceMuted }}>
              <Text variant="caption" numberOfLines={1} color={r === role ? colors.accentOnSoft : colors.textSecondary}>
                {t(`domain.role.${r}`)}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
                {CAPS.map((c) => (
                  <View key={c} style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: matrix[r].includes(c) ? (r === role ? colors.accent : colors.textSecondary) : colors.border }} />
                ))}
              </View>
              <Text variant="caption" tone="tertiary" weight="regular" tabular>
                {f.digits(`${matrix[r].length}/${CAPS.length}`)}
              </Text>
            </View>
          ))}
        </View>

        <Section card footer={locked ? t('settings.roles.locked') : undefined}>
          {CAPS.map((c) => (
            <ListRow
              key={c}
              icon={CAP_ICON[c]}
              title={t(`settings.roles.caps.${c}`)}
              trailing={locked ? <Icon name="lock" size={16} color={colors.textTertiary} /> : <Switch value={granted.includes(c)} onValueChange={(on) => toggle(c, on)} accessibilityLabel={t(`settings.roles.caps.${c}`)} />}
            />
          ))}
        </Section>
      </View>
    </Screen>
  );
}
