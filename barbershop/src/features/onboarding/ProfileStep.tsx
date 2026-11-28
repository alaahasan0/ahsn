import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon, Input, PhoneInput, Pressable, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

import { useOnboarding } from './OnboardingContext';
import { OnboardingScaffold } from './OnboardingScaffold';

export default function ProfileStep() {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const { draft, patch } = useOnboarding();
  return (
    <OnboardingScaffold step={0} title={t('auth.onboarding.profile.title')} subtitle={t('auth.onboarding.profile.subtitle')} onNext={() => router.push('/onboarding/hours')} nextDisabled={!draft.name.trim()}>
      <View style={{ gap: 18 }}>
        <Pressable
          onPress={() => {
            patch({ hasLogo: true });
            toast({ message: t('auth.onboarding.profile.uploadLogo'), description: t('auth.onboarding.profile.logoSimulated'), icon: 'image' });
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, backgroundColor: colors.surface }}
        >
          <View style={{ width: 64, height: 64, borderRadius: radius.lg, backgroundColor: draft.hasLogo ? colors.accent : colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
            {draft.hasLogo ? (
              <Text variant="title2" color={colors.accentText}>
                {(draft.name.trim()[0] ?? 'B').toUpperCase()}
              </Text>
            ) : (
              <Icon name="camera" size={22} color={colors.textTertiary} />
            )}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="callout" weight="semibold">
              {t('auth.onboarding.profile.uploadLogo')}
            </Text>
            <Text variant="footnote" tone="secondary">
              {t('auth.onboarding.profile.logoHint')}
            </Text>
          </View>
          <Icon name="upload" size={18} color={colors.textSecondary} />
        </Pressable>
        <Input label={t('auth.onboarding.profile.name')} placeholder={t('auth.onboarding.profile.namePlaceholder')} value={draft.name} onChangeText={(name) => patch({ name })} icon="scissors" testID="onboarding-name" />
        <Input label={t('auth.onboarding.profile.address')} placeholder={t('auth.onboarding.profile.addressPlaceholder')} value={draft.address} onChangeText={(address) => patch({ address })} icon="map-pin" />
        <Input label={t('auth.onboarding.profile.city')} placeholder={t('auth.onboarding.profile.cityPlaceholder')} value={draft.city} onChangeText={(city) => patch({ city })} icon="navigation" />
        <PhoneInput label={t('auth.onboarding.profile.phone')} value={draft.phone} onChange={(phone) => patch({ phone })} />
        <PhoneInput label={t('auth.onboarding.profile.whatsapp')} whatsapp value={draft.whatsapp} onChange={(whatsapp) => patch({ whatsapp })} hint={t('auth.onboarding.profile.whatsappHint')} />
      </View>
    </OnboardingScaffold>
  );
}
