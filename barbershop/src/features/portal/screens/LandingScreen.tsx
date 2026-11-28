import { router } from 'expo-router';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { BrandMark } from '@/components/domain/BrandMark';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/ListRow';
import { Section } from '@/components/ui/Section';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { useBarbers, useServices } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Weekday } from '@/types/models';

import { useBookingDraft } from '../BookingDraft';
import { PortalShell } from '../PortalShell';
import { SalonNotFound } from '../shared';

export default function LandingScreen() {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const { salon, path, reset } = useBookingDraft();
  const services = useServices().filter((s) => s.bookableOnline);
  const barbers = useBarbers().filter((b) => b.acceptsOnline);
  if (!salon) return <SalonNotFound />;
  const hours = salon.hours[today().getDay() as Weekday];

  const chip = (icon: IconName, text: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={14} color="#D9D3CB" />
      <Text variant="footnote" color="#D9D3CB" numberOfLines={1} style={{ flexShrink: 1 }}>
        {text}
      </Text>
    </View>
  );

  return (
    <PortalShell salonName={salon.name} testID="portal-landing">
      <View style={{ backgroundColor: '#171513', borderRadius: radius.xl, padding: 22, gap: 18, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', end: -40, top: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: '#A9582A', opacity: 0.22 }} />
        <BrandMark size={56} />
        <View style={{ gap: 6 }}>
          <Text variant="title1" color="#F5F3F0">
            {l(salon.name)}
          </Text>
          <Text variant="callout" color="#B3ADA5">
            {l(salon.tagline)}
          </Text>
        </View>
        <View style={{ gap: 8 }}>
          {chip('star', `${f.number(salon.rating, 1)} · ${t('portal.landing.reviews', { count: salon.reviewCount })}`)}
          {chip('map-pin', `${l(salon.address)} · ${l(salon.city)}`)}
          {chip('clock', hours.enabled ? t('portal.landing.openToday', { from: f.clock(hours.start), to: f.clock(hours.end) }) : t('portal.landing.closedToday'))}
        </View>
        <Button
          label={t('portal.landing.bookNow')}
          size="lg"
          iconEnd="arrow-right"
          testID="portal-book-now"
          onPress={() => {
            reset();
            router.push(path('service') as never);
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <Icon name="lock" size={12} color="#8A847C" />
          <Text variant="caption" color="#8A847C" align="center">
            {t('portal.noAccount')}
          </Text>
        </View>
      </View>

      <Section title={t('portal.landing.services')}>
        <Card padding={0}>
          {services.slice(0, 5).map((s, i) => (
            <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16, borderTopWidth: i ? 1 : 0, borderTopColor: colors.separator }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="callout" weight="semibold">
                  {l(s.name)}
                </Text>
                <Text variant="footnote" tone="secondary">
                  {f.duration(s.durationMin)}
                </Text>
              </View>
              <Text variant="callout" weight="semibold" tabular>
                {f.money(s.price)}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title={t('portal.landing.team')}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {barbers.map((b) => (
            <Card key={b.id} padding={12} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
              <BarberAvatar barber={b} size={48} />
              <Text variant="subhead" align="center" numberOfLines={1}>
                {l(b.name).split(' ')[0]}
              </Text>
              <Text variant="caption" tone="tertiary" align="center" numberOfLines={2}>
                {l(b.title).split('·').pop()?.trim()}
              </Text>
            </Card>
          ))}
        </View>
      </Section>

      <Section card>
        <ListRow icon="calendar" title={t('portal.landing.manage')} onPress={() => router.push(path('manage') as never)} />
        <ListRow icon="info" title={t('portal.landing.info')} onPress={() => router.push(path('info') as never)} />
      </Section>

      <Text variant="caption" tone="tertiary" align="center">
        {t('portal.poweredBy')}
      </Text>
    </PortalShell>
  );
}
