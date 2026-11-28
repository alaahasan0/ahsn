import { router } from 'expo-router';
import { View } from 'react-native';

import { Badge, Button, Icon, IconButton, Input, PhoneInput, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

import { useOnboarding, type DraftBarber } from './OnboardingContext';
import { OnboardingScaffold } from './OnboardingScaffold';

export default function BarbersStep() {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const { draft, patch } = useOnboarding();
  const update = (id: string, p: Partial<DraftBarber>) => patch({ barbers: draft.barbers.map((b) => (b.id === id ? { ...b, ...p } : b)) });

  return (
    <OnboardingScaffold step={3} title={t('auth.onboarding.barbers.title')} subtitle={t('auth.onboarding.barbers.subtitle')} onNext={() => router.push('/onboarding/complete')}>
      <View style={{ gap: 12 }}>
        {draft.barbers.map((b, i) => (
          <View key={b.id} style={{ padding: 14, gap: 12, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="subhead" tone="secondary" style={{ flex: 1 }}>
                {t('common.labels.barber')} {i + 1}
              </Text>
              {b.isOwner ? <Badge label={t('auth.onboarding.barbers.you')} tone="accent" /> : <IconButton icon="trash-2" size={32} iconSize={16} color={colors.danger} onPress={() => patch({ barbers: draft.barbers.filter((x) => x.id !== b.id) })} accessibilityLabel={t('auth.onboarding.barbers.remove')} />}
            </View>
            <Input label={t('auth.onboarding.barbers.name')} value={b.name} onChangeText={(name) => update(b.id, { name })} icon="user" />
            <PhoneInput label={t('auth.onboarding.barbers.phone')} value={b.phone} onChange={(phone) => update(b.id, { phone })} />
          </View>
        ))}
        <Button label={t('auth.onboarding.barbers.addBarber')} variant="secondary" icon="user-plus" onPress={() => patch({ barbers: [...draft.barbers, { id: `b_${Date.now()}`, name: '', phone: { country: '+970', number: '' } }] })} />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Icon name="send" size={14} color={colors.textTertiary} />
          <Text variant="footnote" tone="tertiary" style={{ flex: 1 }}>
            {t('auth.onboarding.barbers.inviteNote')}
          </Text>
        </View>
      </View>
    </OnboardingScaffold>
  );
}
