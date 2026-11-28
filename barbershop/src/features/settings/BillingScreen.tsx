import { View } from 'react-native';

import { Badge, Card, Header, Icon, ListRow, Screen, Section, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { addDays, addMonths } from '@/lib/dates';
import { useAppState } from '@/store/AppStore';
import { useTheme } from '@/theme';

export default function BillingScreen() {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const toast = useToast();
  const { salon } = useAppState();
  const invoices = [1, 2, 3, 4].map((i) => ({ id: `INV-2026-${String(12 - i).padStart(3, '0')}`, date: addMonths(addDays(today(), 17), -i), amount: 189 }));
  const simulated = () => toast({ message: t('settings.billing.noRealPayments'), icon: 'info', tone: 'default' });

  return (
    <Screen header={<Header title={t('settings.billing.title')} backFallback="/settings" />}>
      <View style={{ gap: 24, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.infoSoft }}>
          <Icon name="info" size={16} color={colors.info} />
          <Text variant="footnote" color={colors.info} style={{ flex: 1 }}>
            {t('settings.billing.noRealPayments')}
          </Text>
        </View>
        <Card style={{ gap: 4 }}>
          <Text variant="footnote" tone="secondary">
            {t('settings.billing.nextInvoice')}
          </Text>
          <Text variant="title1" tabular>
            {f.money(189)}
          </Text>
          <Text variant="footnote" tone="secondary">
            {f.dateLong(addDays(today(), 17))} · {t(`settings.subscription.plans.${salon.plan}.name`)}
          </Text>
        </Card>
        <Section title={t('settings.billing.paymentMethod')} card>
          <ListRow icon="credit-card" title={t('settings.billing.cardEnding', { last4: f.ltr('4242') })} subtitle="12 / 28" trailing={<Text variant="subhead" tone="accent">{t('settings.billing.update')}</Text>} onPress={simulated} />
        </Section>
        <Section title={t('settings.billing.invoices')} card>
          {invoices.map((inv) => (
            <ListRow
              key={inv.id}
              icon="file-text"
              title={f.monthYear(inv.date)}
              subtitle={inv.id}
              trailing={
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text variant="subhead" tabular>
                    {f.money(inv.amount)}
                  </Text>
                  <Badge label={t('settings.billing.paid')} tone="success" />
                </View>
              }
              onPress={simulated}
            />
          ))}
        </Section>
        <Section title={t('settings.billing.billingAddress')} card>
          <ListRow icon="home" title={l(salon.name)} subtitle={`${l(salon.address)} · ${l(salon.city)}`} />
          <ListRow icon="mail" title={salon.email} />
        </Section>
      </View>
    </Screen>
  );
}
