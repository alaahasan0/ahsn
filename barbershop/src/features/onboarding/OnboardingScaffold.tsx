import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button, Header, Pressable, Screen, StepIndicator, Text } from '@/components/ui';
import { useI18n } from '@/i18n';

export const ONBOARDING_STEPS = 5;

export function OnboardingScaffold({ step, title, subtitle, children, onNext, nextLabel, nextDisabled, back = true }: { step: number; title: string; subtitle?: string; children: ReactNode; onNext: () => void; nextLabel?: string; nextDisabled?: boolean; back?: boolean }) {
  const { t } = useI18n();
  return (
    <Screen
      header={
        <Header
          back={back}
          backFallback="/welcome"
          title={t('auth.onboarding.step', { current: step + 1, total: ONBOARDING_STEPS })}
          right={
            step < ONBOARDING_STEPS - 1 ? (
              <Pressable onPress={() => router.replace('/onboarding/complete')} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text variant="subhead" tone="secondary">
                  {t('auth.onboarding.skip')}
                </Text>
              </Pressable>
            ) : null
          }
        >
          <StepIndicator total={ONBOARDING_STEPS} current={step} />
        </Header>
      }
      footer={<Button label={nextLabel ?? t('common.actions.continue')} size="lg" onPress={onNext} disabled={nextDisabled} iconEnd="arrow-right" testID="onboarding-next" />}
    >
      <View style={{ gap: 6, marginTop: 12, marginBottom: 24 }}>
        <Text variant="title1">{title}</Text>
        {subtitle ? (
          <Text variant="callout" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </Screen>
  );
}
