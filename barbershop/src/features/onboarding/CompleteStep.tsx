import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Icon, ListRow, Section, Text, useToast, type IconName } from '@/components/ui';
import { useI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { useActions } from '@/store/AppStore';
import { useTheme } from '@/theme';

import { useOnboarding } from './OnboardingContext';
import { OnboardingScaffold } from './OnboardingScaffold';

export default function CompleteStep() {
  const { colors } = useTheme();
  const { t, tp, l } = useI18n();
  const toast = useToast();
  const { update } = usePreferences();
  const actions = useActions();
  const { draft } = useOnboarding();
  const openDays = Object.values(draft.hours).filter((d) => d.enabled).length;
  const services = draft.services.filter((s) => s.enabled);
  const slug = (draft.name.trim() || 'the-barber-house').toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, '-');

  const rows: { icon: IconName; title: string; value: string }[] = [
    { icon: 'home', title: t('auth.onboarding.complete.summarySalon'), value: draft.name.trim() || '—' },
    { icon: 'clock', title: t('auth.onboarding.complete.summaryHours'), value: tp('common.counts.days', openDays) },
    { icon: 'scissors', title: t('auth.onboarding.complete.summaryServices'), value: services.length ? services.slice(0, 2).map((s) => l(s.name)).join('، ') + (services.length > 2 ? ` +${services.length - 2}` : '') : '—' },
    { icon: 'users', title: t('auth.onboarding.complete.summaryBarbers'), value: tp('common.counts.barbers', draft.barbers.length) },
  ];

  const finish = () => {
    if (draft.name.trim()) actions.updateSalon({ name: { en: draft.name.trim(), ar: draft.name.trim() } });
    update({ onboarded: true, role: 'owner' });
    router.replace('/owner');
  };

  return (
    <OnboardingScaffold step={4} title={t('auth.onboarding.complete.title')} subtitle={t('auth.onboarding.complete.subtitle')} onNext={finish} nextLabel={t('auth.onboarding.complete.goDashboard')}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={34} color={colors.success} />
        </View>
      </View>
      <View style={{ gap: 24 }}>
        <Section card>
          {rows.map((r) => (
            <ListRow key={r.title} icon={r.icon} title={r.title} value={r.value} />
          ))}
        </Section>
        <Card variant="accent" style={{ gap: 10 }}>
          <Text variant="subhead" color={colors.accentOnSoft}>
            {t('auth.onboarding.complete.bookingLink')}
          </Text>
          <Text variant="callout" weight="semibold" style={{ writingDirection: 'ltr' }} numberOfLines={1}>
            {`barberhouse.app/book/${slug}`}
          </Text>
          <Button label={t('auth.onboarding.complete.shareLink')} variant="secondary" size="sm" icon="share-2" onPress={() => toast({ message: t('common.actions.copied'), description: t('common.toast.simulated') })} style={{ alignSelf: 'flex-start' }} />
        </Card>
        <Section title={t('auth.onboarding.complete.next')} card>
          <ListRow icon="upload" title={t('auth.onboarding.complete.nextImport')} />
          <ListRow icon="message-circle" title={t('auth.onboarding.complete.nextTemplates')} />
          <ListRow icon="mic" title={t('auth.onboarding.complete.nextVoice')} />
        </Section>
      </View>
    </OnboardingScaffold>
  );
}
