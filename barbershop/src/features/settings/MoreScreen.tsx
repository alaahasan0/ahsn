import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BrandMark, RoleSwitcherSheet } from '@/components/domain';
import { Card, Dialog, Header, ListRow, Screen, Section, Switch, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useActions, useAppState } from '@/store/AppStore';
import { usePreferences } from '@/store/preferences';
import { useUnreadNotifications } from '@/store/selectors';
import { useTheme } from '@/theme';

export default function MoreScreen() {
  const { colors, isDark } = useTheme();
  const { t, l, lang, setLanguage } = useI18n();
  const prefs = usePreferences();
  const { salon, services, barbers, recurring } = useAppState();
  const actions = useActions();
  const toast = useToast();
  const unread = useUnreadNotifications();
  const [switcher, setSwitcher] = useState(false);
  const [reset, setReset] = useState(false);
  const activeRecurring = recurring.filter((r) => r.status === 'active').length;

  return (
    <Screen inTabs header={<Header variant="large" back={false} title={t('settings.more.title')} />}>
      <View style={{ gap: 28, paddingTop: 8 }}>
        <Card onPress={() => router.push('/settings/salon')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <BrandMark size={52} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headline">{l(salon.name)}</Text>
            <Text variant="footnote" tone="secondary" numberOfLines={1}>
              {l(salon.city)} · {t(`settings.subscription.plans.${salon.plan}.name`)}
            </Text>
          </View>
          <Text variant="subhead" tone="accent">
            {t('common.actions.edit')}
          </Text>
        </Card>

        <Section title={t('settings.more.manage')} card>
          <ListRow icon="scissors" title={t('settings.more.rows.services')} value={String(services.filter((s) => s.active).length)} onPress={() => router.push('/services')} />
          <ListRow icon="users" title={t('settings.more.rows.barbers')} value={String(barbers.filter((b) => b.active).length)} onPress={() => router.push('/team')} />
          <ListRow icon="clock" title={t('settings.more.rows.availability')} onPress={() => router.push('/availability')} />
          <ListRow icon="repeat" title={t('settings.more.rows.recurring')} value={String(activeRecurring)} onPress={() => router.push('/recurring')} />
        </Section>

        <Section title={t('settings.more.insights')} card>
          <ListRow icon="bar-chart-2" title={t('settings.more.rows.analytics')} onPress={() => router.push('/analytics')} />
          <ListRow icon="shield" title={t('settings.more.rows.trust')} onPress={() => router.push('/trust')} />
        </Section>

        <Section title={t('settings.more.communication')} card>
          <ListRow icon="bell" title={t('settings.more.rows.notifications')} value={unread ? String(unread) : undefined} onPress={() => router.push('/notifications')} />
          <ListRow icon="message-square" title={t('settings.more.rows.templates')} onPress={() => router.push('/notifications/templates')} />
          <ListRow icon="settings" title={t('settings.more.rows.settings')} onPress={() => router.push('/settings')} />
        </Section>

        <Section title={t('settings.more.prototype')} footer={t('common.demo.bannerBody')} card>
          <ListRow icon="shuffle" iconBg={colors.accentSoft} iconColor={colors.accent} title={t('settings.more.rows.switchExperience')} onPress={() => setSwitcher(true)} />
          <ListRow icon="smartphone" title={t('settings.more.rows.portal')} onPress={() => router.push(`/book/${salon.slug}`)} />
          <ListRow icon="globe" title={t('settings.more.rows.language')} trailing={<Switch value={lang === 'en'} onValueChange={(v) => setLanguage(v ? 'en' : 'ar')} accessibilityLabel={t('settings.more.rows.language')} />} />
          <ListRow icon="moon" title={t('settings.more.rows.darkMode')} trailing={<Switch value={isDark} onValueChange={(v) => prefs.set('themeMode', v ? 'dark' : 'light')} accessibilityLabel={t('settings.more.rows.darkMode')} />} />
          <ListRow icon="rotate-ccw" title={t('settings.more.rows.reset')} destructive onPress={() => setReset(true)} />
        </Section>
      </View>
      <RoleSwitcherSheet visible={switcher} onClose={() => setSwitcher(false)} />
      <Dialog
        visible={reset}
        onClose={() => setReset(false)}
        icon="rotate-ccw"
        tone="danger"
        title={t('settings.more.resetTitle')}
        message={t('settings.more.resetBody')}
        confirmLabel={t('common.actions.reset')}
        onConfirm={() => {
          actions.resetDemo();
          toast(t('settings.more.resetDone'));
        }}
      />
    </Screen>
  );
}
