import { router } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/domain';
import { Button, Icon, Pressable, Screen, Text, type IconName } from '@/components/ui';
import { useI18n, type TKey } from '@/i18n';
import { useAppState } from '@/store/AppStore';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme';

import { LanguageToggle } from './LanguageToggle';

export default function WelcomeScreen() {
  const { colors, radius, layout } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { update } = usePreferences();
  const { appointments, salon } = useAppState();
  const token = appointments.find((a) => a.status === 'pending' && a.confirmation)?.confirmation?.token ?? 'demo';

  const features: { icon: IconName; key: TKey }[] = [
    { icon: 'calendar', key: 'auth.welcome.features.calendar' },
    { icon: 'ion:logo-whatsapp', key: 'auth.welcome.features.whatsapp' },
    { icon: 'mic', key: 'auth.welcome.features.voice' },
  ];

  const explore: { key: string; icon: IconName; title: TKey; body: TKey; go: () => void }[] = [
    { key: 'owner', icon: 'briefcase', title: 'common.demo.roles.owner', body: 'common.demo.roles.ownerBody', go: () => { update({ role: 'owner' }); router.replace('/owner'); } },
    { key: 'barber', icon: 'scissors', title: 'common.demo.roles.barber', body: 'common.demo.roles.barberBody', go: () => { update({ role: 'barber' }); router.replace('/barber'); } },
    { key: 'customer', icon: 'smartphone', title: 'common.demo.roles.customer', body: 'common.demo.roles.customerBody', go: () => router.push(`/book/${salon.slug}`) },
    { key: 'link', icon: 'link', title: 'common.demo.roles.manageLink', body: 'common.demo.roles.manageLinkBody', go: () => router.push(`/m/${token}`) },
  ];

  return (
    <Screen header={<View style={{ height: insets.top }} />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <BrandMark size={36} />
          <Text variant="headline">{t('common.appName')}</Text>
        </View>
        <LanguageToggle />
      </View>

      <View style={{ marginTop: 40, gap: 14 }}>
        <Text variant="overline" tone="accent">
          {t('auth.welcome.eyebrow')}
        </Text>
        <Text variant="display">{t('auth.welcome.headline')}</Text>
        <Text variant="body" tone="secondary">
          {t('auth.welcome.body')}
        </Text>
      </View>

      <View style={{ marginTop: 24, gap: 10 }}>
        {features.map((f) => (
          <View key={f.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={f.icon} size={15} color={colors.accent} />
            </View>
            <Text variant="callout">{t(f.key)}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 32, gap: 10 }}>
        <Button label={t('auth.welcome.signIn')} size="lg" onPress={() => router.push('/login')} testID="welcome-signin" />
        <Button label={t('auth.welcome.createAccount')} size="lg" variant="secondary" onPress={() => router.push('/register')} />
      </View>

      <View style={{ marginTop: 40, gap: 6 }}>
        <Text variant="headline">{t('auth.welcome.explore')}</Text>
        <Text variant="footnote" tone="secondary">
          {t('auth.welcome.exploreBody')}
        </Text>
      </View>
      <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {explore.map((o) => (
          <Pressable
            key={o.key}
            testID={`explore-${o.key}`}
            onPress={o.go}
            feedback="scale"
            style={{ flexBasis: '47%', flexGrow: 1, minWidth: 150, maxWidth: layout.maxContentWidth / 2, padding: 14, gap: 10, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={o.icon} size={18} color={colors.text} />
              </View>
              <Icon name="arrow-up-right" size={16} color={colors.textTertiary} />
            </View>
            <View style={{ gap: 2 }}>
              <Text variant="subhead" weight="semibold">
                {t(o.title)}
              </Text>
              <Text variant="caption" tone="secondary" numberOfLines={3} weight="regular">
                {t(o.body)}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
      <Text variant="caption" tone="tertiary" align="center" style={{ marginTop: 28 }} weight="regular">
        {t('auth.welcome.legal')}
      </Text>
    </Screen>
  );
}
