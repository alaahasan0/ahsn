import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Card, Dialog, Header, Icon, ListRow, Screen, Section, Text } from '@/components/ui';
import { LANGUAGES, useI18n } from '@/i18n';
import { useAppState } from '@/store/AppStore';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme';

export default function SettingsScreen() {
  const { colors, radius } = useTheme();
  const { t, l, lang } = useI18n();
  const prefs = usePreferences();
  const { salon, currentUser, users } = useAppState();
  const [signOut, setSignOut] = useState(false);
  const themeLabel = t(`settings.appearance.${prefs.themeMode === 'system' ? 'system' : prefs.themeMode}`);

  return (
    <Screen header={<Header title={t('settings.title')} backFallback="/owner/more" />}>
      <View style={{ gap: 28, paddingTop: 8 }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={l(currentUser.name)} size={52} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headline">{l(currentUser.name)}</Text>
            <Text variant="footnote" tone="secondary">
              {t(`domain.role.${currentUser.role}`)} · {l(salon.name)}
            </Text>
            <Text variant="caption" tone="tertiary" style={{ writingDirection: 'ltr' }} weight="regular">
              {currentUser.email}
            </Text>
          </View>
        </Card>

        <Section title={t('settings.sections.salon')} card>
          <ListRow icon="home" title={t('settings.rows.salonProfile')} value={l(salon.name)} onPress={() => router.push('/settings/salon')} />
          <ListRow icon="map-pin" title={t('settings.rows.branches')} value={String(salon.branches.length)} onPress={() => router.push('/settings/branches')} />
          <ListRow icon="shield" title={t('settings.rows.policies')} value={t('settings.policies.hoursOption', { count: salon.cancellationPolicyHours })} onPress={() => router.push('/settings/policies')} />
        </Section>

        <Section title={t('settings.sections.team')} card>
          <ListRow icon="users" title={t('settings.rows.users')} value={String(users.length)} onPress={() => router.push('/settings/users')} />
          <ListRow icon="key" title={t('settings.rows.roles')} onPress={() => router.push('/settings/roles')} />
          <ListRow icon="star" title={t('settings.rows.subscription')} value={t(`settings.subscription.plans.${salon.plan}.name`)} onPress={() => router.push('/settings/subscription')} />
          <ListRow icon="credit-card" title={t('settings.rows.billing')} onPress={() => router.push('/settings/billing')} />
        </Section>

        <Section title={t('settings.sections.communication')} card>
          <ListRow icon="bell" title={t('settings.rows.notifications')} onPress={() => router.push('/notifications/settings')} />
          <ListRow icon="message-square" title={t('settings.rows.templates')} onPress={() => router.push('/notifications/templates')} />
        </Section>

        <Section title={t('settings.sections.preferences')} card>
          <ListRow icon="globe" title={t('settings.rows.language')} value={LANGUAGES.find((x) => x.code === lang)?.nativeName} onPress={() => router.push('/settings/language')} />
          <ListRow icon="moon" title={t('settings.rows.appearance')} value={themeLabel} onPress={() => router.push('/settings/appearance')} />
        </Section>

        <Section title={t('settings.sections.account')} card>
          <ListRow icon="lock" title={t('settings.rows.security')} onPress={() => router.push('/settings/security')} />
          <ListRow icon="log-out" title={t('settings.rows.signOut')} destructive onPress={() => setSignOut(true)} />
        </Section>

        <View style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted }}>
          <Icon name="layers" size={18} color={colors.textSecondary} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="subhead">{t('settings.workspace')}</Text>
            <Text variant="footnote" tone="secondary">
              {t('settings.workspaceHint')}
            </Text>
            <Text variant="caption" tone="tertiary" style={{ writingDirection: 'ltr' }} weight="regular">
              {t('settings.workspaceId')}: {salon.id} · {salon.slug}
            </Text>
          </View>
        </View>
      </View>
      <Dialog
        visible={signOut}
        onClose={() => setSignOut(false)}
        icon="log-out"
        title={t('settings.signOutTitle')}
        message={t('settings.signOutBody')}
        confirmLabel={t('settings.rows.signOut')}
        tone="danger"
        onConfirm={() => router.replace('/welcome')}
      />
    </Screen>
  );
}
