import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { useTheme } from '@/theme';
import type { Weekday } from '@/types/models';

import { useBookingDraft } from '../BookingDraft';
import { PortalShell } from '../PortalShell';
import { ContactSalonButtons, SalonNotFound, SummaryRow } from '../shared';

const ORDER: Weekday[] = [6, 0, 1, 2, 3, 4, 5];

export default function InfoScreen() {
  const { colors } = useTheme();
  const { t, l, f } = useI18n();
  const { salon, path } = useBookingDraft();
  if (!salon) return <SalonNotFound />;
  return (
    <PortalShell salonName={salon.name} back={path()} title={t('portal.info.title')}>
      <Text variant="callout" tone="secondary">
        {l(salon.about)}
      </Text>
      <Section title={t('portal.info.location')} card>
        <SummaryRow icon="map-pin" label={t('common.labels.address')} value={l(salon.address)} sub={l(salon.city)} />
      </Section>
      <Section title={t('portal.info.hours')}>
        <Card padding={0}>
          {ORDER.map((wd, i) => {
            const d = salon.hours[wd];
            const isToday = today().getDay() === wd;
            return (
              <View key={wd} style={{ flexDirection: 'row', paddingVertical: 11, paddingHorizontal: 16, borderTopWidth: i ? 1 : 0, borderTopColor: colors.separator }}>
                <Text variant="callout" weight={isToday ? 'semibold' : 'regular'} style={{ flex: 1 }}>
                  {f.weekday(wd)}
                </Text>
                <Text variant="callout" tone={d.enabled ? 'primary' : 'tertiary'} weight={isToday ? 'semibold' : 'regular'} tabular>
                  {d.enabled ? `${f.clock(d.start)} – ${f.clock(d.end)}` : t('common.labels.closed')}
                </Text>
              </View>
            );
          })}
        </Card>
      </Section>
      <Section title={t('portal.info.contact')} card>
        <SummaryRow icon="phone" label={t('common.labels.phone')} value={f.phone(salon.phone.country, salon.phone.number)} ltr />
        <SummaryRow icon="message-circle" label={t('common.labels.whatsapp')} value={f.phone(salon.whatsapp.country, salon.whatsapp.number)} ltr />
        <SummaryRow icon="mail" label={t('common.labels.email')} value={salon.email} ltr />
      </Section>
      <ContactSalonButtons phone={salon.phone} whatsapp={salon.whatsapp} />
      <Section title={t('portal.info.policy')}>
        <Card variant="muted">
          <Text variant="callout" tone="secondary">
            {t('portal.review.policy', { hours: salon.cancellationPolicyHours })}
          </Text>
        </Card>
      </Section>
    </PortalShell>
  );
}
