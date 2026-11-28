import { View } from 'react-native';

import { Badge, Button, Card, Header, Icon, ProgressBar, Screen, Section, Text, useToast } from '@/components/ui';
import { useI18n, type TKey } from '@/i18n';
import { today } from '@/lib/clock';
import { addDays } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { useTheme } from '@/theme';
import type { SubscriptionPlan } from '@/types/models';

const PLANS: { id: SubscriptionPlan; price: number; features: TKey[] }[] = [
  { id: 'starter', price: 79, features: ['settings.subscription.features.barbers1', 'settings.subscription.features.branches1', 'settings.subscription.features.messages300'] },
  { id: 'professional', price: 189, features: ['settings.subscription.features.barbers5', 'settings.subscription.features.branches1', 'settings.subscription.features.messages2000', 'settings.subscription.features.voice', 'settings.subscription.features.analytics'] },
  { id: 'business', price: 389, features: ['settings.subscription.features.barbersUnlimited', 'settings.subscription.features.branches3', 'settings.subscription.features.messages8000', 'settings.subscription.features.voice', 'settings.subscription.features.analytics', 'settings.subscription.features.support'] },
];

export default function SubscriptionScreen() {
  const { colors } = useTheme();
  const { t, f } = useI18n();
  const toast = useToast();
  const { salon, barbers } = useAppState();
  const actions = useActions();
  const usage = [
    { label: t('settings.subscription.usageBarbers'), used: barbers.filter((b) => b.active).length, limit: 5 },
    { label: t('settings.subscription.usageMessages'), used: 1284, limit: 2000 },
    { label: t('settings.subscription.usageVoice'), used: 46, limit: 120 },
  ];

  return (
    <Screen header={<Header title={t('settings.subscription.title')} backFallback="/settings" />}>
      <View style={{ gap: 24, paddingTop: 8 }}>
        <Section title={t('settings.subscription.usage')}>
          <Card style={{ gap: 16 }}>
            {usage.map((u) => (
              <View key={u.label} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="subhead">{u.label}</Text>
                  <Text variant="subhead" tone="secondary" tabular>
                    {f.ltr(`${f.number(u.used)} / ${f.number(u.limit)}`)}
                  </Text>
                </View>
                <ProgressBar value={u.used / u.limit} color={u.used / u.limit > 0.85 ? colors.warning : colors.accent} />
              </View>
            ))}
            <Text variant="caption" tone="tertiary" weight="regular">
              {t('settings.subscription.renews', { date: f.dateMedium(addDays(today(), 17)) })}
            </Text>
          </Card>
        </Section>

        {PLANS.map((p) => {
          const current = p.id === salon.plan;
          return (
            <Card key={p.id} style={{ gap: 14, borderWidth: current ? 1.5 : 1, borderColor: current ? colors.accent : colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="title3" style={{ flex: 1 }}>
                  {t(`settings.subscription.plans.${p.id}.name`)}
                </Text>
                {current ? <Badge label={t('settings.subscription.currentPlan')} tone="accent" icon="check" /> : p.id === 'professional' ? <Badge label={t('settings.subscription.popular')} /> : null}
              </View>
              <Text variant="footnote" tone="secondary">
                {t(`settings.subscription.plans.${p.id}.desc`)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text variant="title1" tabular>
                  {f.money(p.price)}
                </Text>
                <Text variant="footnote" tone="secondary">
                  {t('settings.subscription.perMonth')}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                {p.features.map((k) => (
                  <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon name="check" size={15} color={colors.success} />
                    <Text variant="footnote">{t(k)}</Text>
                  </View>
                ))}
              </View>
              {!current ? (
                <Button
                  label={t('settings.subscription.choose')}
                  variant="secondary"
                  onPress={() => {
                    actions.updateSalon({ plan: p.id });
                    toast({ message: t(`settings.subscription.plans.${p.id}.name`), description: t('settings.subscription.changed') });
                  }}
                />
              ) : null}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
