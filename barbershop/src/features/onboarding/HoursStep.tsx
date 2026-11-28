import { router } from 'expo-router';

import { WeeklyScheduleEditor } from '@/features/availability/WeeklyScheduleEditor';
import { useI18n } from '@/i18n';

import { useOnboarding } from './OnboardingContext';
import { OnboardingScaffold } from './OnboardingScaffold';

export default function HoursStep() {
  const { t } = useI18n();
  const { draft, patch } = useOnboarding();
  return (
    <OnboardingScaffold step={1} title={t('auth.onboarding.hours.title')} subtitle={t('auth.onboarding.hours.subtitle')} onNext={() => router.push('/onboarding/services')}>
      <WeeklyScheduleEditor value={draft.hours} onChange={(hours) => patch({ hours })} />
    </OnboardingScaffold>
  );
}
