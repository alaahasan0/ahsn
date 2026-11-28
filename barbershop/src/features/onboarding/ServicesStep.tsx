import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Icon, Input, Switch, Text, type IconName } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

import { useOnboarding } from './OnboardingContext';
import { OnboardingScaffold } from './OnboardingScaffold';
import { MiniStepper } from './Stepper';

export default function ServicesStep() {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const { draft, patch } = useOnboarding();
  const [custom, setCustom] = useState('');
  const update = (id: string, p: Partial<(typeof draft.services)[number]>) => patch({ services: draft.services.map((s) => (s.id === id ? { ...s, ...p } : s)) });
  const selected = draft.services.filter((s) => s.enabled).length;

  return (
    <OnboardingScaffold step={2} title={t('auth.onboarding.services.title')} subtitle={t('auth.onboarding.services.subtitle')} onNext={() => router.push('/onboarding/barbers')} nextDisabled={selected === 0}>
      <Text variant="footnote" tone="secondary" style={{ marginBottom: 10 }}>
        {t('auth.onboarding.services.selected', { count: selected })}
      </Text>
      <View style={{ gap: 10 }}>
        {draft.services.map((s) => (
          <View key={s.id} style={{ padding: 14, gap: 12, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: s.enabled ? colors.borderStrong : colors.border, opacity: s.enabled ? 1 : 0.6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon as IconName} size={17} />
              </View>
              <Text variant="callout" weight="semibold" style={{ flex: 1 }} numberOfLines={1}>
                {l(s.name)}
              </Text>
              <Switch value={s.enabled} onValueChange={(enabled) => update(s.id, { enabled })} accessibilityLabel={l(s.name)} />
            </View>
            {s.enabled ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
                <MiniStepper value={s.price} step={5} min={5} onChange={(price) => update(s.id, { price })} format={(v) => f.money(v)} />
                <MiniStepper value={s.durationMin} step={5} min={5} max={240} onChange={(durationMin) => update(s.id, { durationMin })} format={(v) => f.duration(v)} />
              </View>
            ) : null}
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: 6 }}>
          <Input containerStyle={{ flex: 1 }} label={t('auth.onboarding.services.addCustom')} placeholder={t('auth.onboarding.services.customName')} value={custom} onChangeText={setCustom} icon="plus" />
          <Button
            label={t('common.actions.add')}
            variant="secondary"
            disabled={!custom.trim()}
            onPress={() => {
              const name = custom.trim();
              patch({ services: [...draft.services, { id: `custom_${Date.now()}`, name: { en: name, ar: name }, price: 40, durationMin: 30, enabled: true, icon: 'scissors' }] });
              setCustom('');
            }}
            style={{ height: 48 }}
          />
        </View>
      </View>
    </OnboardingScaffold>
  );
}
