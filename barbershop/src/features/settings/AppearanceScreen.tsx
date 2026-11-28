import { View } from 'react-native';

import { Header, Screen, Section } from '@/components/ui';
import { useI18n } from '@/i18n';
import { usePreferences, type ThemeMode } from '@/store/preferences';
import type { IconName } from '@/components/ui';

import { OptionCard } from './OptionCard';

export default function AppearanceScreen() {
  const { t } = useI18n();
  const prefs = usePreferences();
  const options: { mode: ThemeMode; icon: IconName; subtitle?: string }[] = [
    { mode: 'system', icon: 'smartphone', subtitle: t('settings.appearance.systemHint') },
    { mode: 'light', icon: 'sun' },
    { mode: 'dark', icon: 'moon' },
  ];
  return (
    <Screen header={<Header title={t('settings.appearance.title')} backFallback="/settings" />}>
      <View style={{ paddingTop: 8 }}>
        <Section>
          {options.map((o) => (
            <OptionCard key={o.mode} icon={o.icon} title={t(`settings.appearance.${o.mode}`)} subtitle={o.subtitle} selected={prefs.themeMode === o.mode} onPress={() => prefs.set('themeMode', o.mode)} />
          ))}
        </Section>
      </View>
    </Screen>
  );
}
