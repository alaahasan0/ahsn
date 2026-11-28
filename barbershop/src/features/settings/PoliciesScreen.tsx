import { useState } from 'react';
import { View } from 'react-native';

import { Card, Chip, Header, Icon, ListRow, Screen, Section, Switch, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useActions, useAppState } from '@/store/AppStore';
import { useTheme } from '@/theme';
import type { Salon } from '@/types/models';

const CANCEL_OPTIONS = [2, 6, 12, 24, 48];
const LINK_OPTIONS = [6, 12, 24, 48];
const SLOT_OPTIONS: Salon['slotIntervalMin'][] = [15, 20, 30];

export default function PoliciesScreen() {
  const { colors } = useTheme();
  const { t, l } = useI18n();
  const toast = useToast();
  const { salon } = useAppState();
  const actions = useActions();
  const [requireNew, setRequireNew] = useState(true);
  const save = (patch: Partial<Salon>) => {
    actions.updateSalon(patch);
    toast(t('settings.policies.saved'));
  };

  return (
    <Screen header={<Header title={t('settings.policies.title')} backFallback="/settings" />}>
      <View style={{ gap: 28, paddingTop: 8 }}>
        <Section title={t('settings.policies.cancellation')} footer={t('settings.policies.cancellationHint')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CANCEL_OPTIONS.map((h) => (
              <Chip key={h} label={t('settings.policies.hoursOption', { count: h })} selected={salon.cancellationPolicyHours === h} onPress={() => save({ cancellationPolicyHours: h })} />
            ))}
          </View>
        </Section>

        <Section title={t('settings.policies.preview')}>
          <Card variant="muted" style={{ flexDirection: 'row', gap: 12 }}>
            <Icon name="info" size={18} color={colors.textSecondary} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="subhead">{l(salon.name)}</Text>
              <Text variant="footnote" tone="secondary">
                {t('settings.policies.previewText', { hours: salon.cancellationPolicyHours })}
              </Text>
            </View>
          </Card>
        </Section>

        <Section title={t('settings.policies.confirmationLink')} footer={t('settings.policies.confirmationLinkHint')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {LINK_OPTIONS.map((h) => (
              <Chip key={h} label={t('settings.policies.hoursOption', { count: h })} selected={salon.confirmationLinkHours === h} onPress={() => save({ confirmationLinkHours: h })} />
            ))}
          </View>
        </Section>

        <Section title={t('settings.policies.slotInterval')} footer={t('settings.policies.slotIntervalHint')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SLOT_OPTIONS.map((m) => (
              <Chip key={m} label={t('settings.policies.minutesOption', { count: m })} selected={salon.slotIntervalMin === m} onPress={() => save({ slotIntervalMin: m })} />
            ))}
          </View>
        </Section>

        <Section card>
          <ListRow icon="user-check" title={t('settings.policies.newCustomers')} subtitle={t('settings.policies.newCustomersHint')} trailing={<Switch value={requireNew} onValueChange={setRequireNew} />} />
        </Section>
      </View>
    </Screen>
  );
}
