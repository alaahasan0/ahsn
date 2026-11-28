import { View } from 'react-native';

import { Card, Header, Screen, Section, Text } from '@/components/ui';
import { LANGUAGES, useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { atClock } from '@/lib/dates';
import { usePreferences } from '@/store/preferences';

import { OptionCard } from './OptionCard';

export default function LanguageScreen() {
  const { t, f, lang, setLanguage } = useI18n();
  const prefs = usePreferences();
  const sample = atClock(today(), '17:30');
  return (
    <Screen header={<Header title={t('settings.language.title')} backFallback="/settings" />}>
      <View style={{ gap: 28, paddingTop: 8 }}>
        <Section title={t('settings.language.appLanguage')}>
          {LANGUAGES.map((l) => (
            <OptionCard key={l.code} title={l.nativeName} subtitle={l.englishName} selected={lang === l.code} onPress={() => setLanguage(l.code)} icon="globe" />
          ))}
        </Section>
        <Section title={t('settings.language.digits')} footer={t('settings.language.digitsHint')}>
          <OptionCard title={t('settings.language.digitsLatin')} selected={prefs.digits === 'latin'} onPress={() => prefs.set('digits', 'latin')} />
          <OptionCard title={t('settings.language.digitsArabic')} selected={prefs.digits === 'arabic'} onPress={() => prefs.set('digits', 'arabic')} />
        </Section>
        <Section title={t('settings.language.preview')}>
          <Card style={{ gap: 6 }}>
            <Text variant="headline">{f.dateLong(sample)}</Text>
            <Text variant="callout" tone="secondary">
              {f.time(sample)} · {f.duration(50)} · {f.money(70)}
            </Text>
          </Card>
        </Section>
      </View>
    </Screen>
  );
}
