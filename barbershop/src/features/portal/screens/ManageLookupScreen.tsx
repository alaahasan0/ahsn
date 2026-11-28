import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { StatusBadge } from '@/components/domain/Badges';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Pressable } from '@/components/ui/Pressable';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { isValidMobile, phonesEqual } from '@/lib/phone';
import { useAppState } from '@/store/AppStore';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { PhoneNumber } from '@/types/models';

import { useBookingDraft } from '../BookingDraft';
import { OtpInput } from '../OtpInput';
import { PortalShell } from '../PortalShell';
import { SalonNotFound } from '../shared';

export default function ManageLookupScreen() {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const toast = useToast();
  const { salon, path } = useBookingDraft();
  const { customers, appointments } = useAppState();
  const look = useLookup();
  const [phone, setPhone] = useState<PhoneNumber>({ country: '+970', number: '' });
  const [stage, setStage] = useState<'phone' | 'code' | 'list'>('phone');
  const [code, setCode] = useState('');

  const found = useMemo(() => {
    const ids = new Set(customers.filter((c) => phonesEqual(c.phone, phone) || phonesEqual(c.whatsapp, phone)).map((c) => c.id));
    return appointments.filter((a) => ids.has(a.customerId) && new Date(a.start) > now() && ['pending', 'confirmed', 'draft'].includes(a.status)).sort((a, b) => a.start.localeCompare(b.start));
  }, [customers, appointments, phone]);

  if (!salon) return <SalonNotFound />;

  return (
    <PortalShell
      salonName={salon.name}
      back={path()}
      title={t('portal.manage.title')}
      subtitle={stage === 'list' ? undefined : stage === 'code' ? t('portal.verify.body', { phone: f.ltr(f.phone(phone.country, phone.number)) }) : t('portal.manage.body')}
      footer={
        stage === 'phone' ? (
          <Button label={t('portal.manage.sendCode')} size="lg" disabled={!isValidMobile(phone)} onPress={() => setStage('code')} />
        ) : stage === 'code' ? (
          <Button label={t('portal.verify.verify')} size="lg" disabled={code.length < 6} onPress={() => setStage('list')} />
        ) : undefined
      }
    >
      {stage === 'phone' ? <PhoneInput label={t('common.labels.phone')} value={phone} onChange={setPhone} hint={t('common.phone.hint')} /> : null}
      {stage === 'code' ? (
        <View style={{ gap: 12 }}>
          <OtpInput value={code} onChange={setCode} autoFocus />
          <Text variant="footnote" tone="tertiary" align="center">
            {t('portal.verify.demo')}
          </Text>
        </View>
      ) : null}
      {stage === 'list' ? (
        found.length ? (
          <View style={{ gap: 10 }}>
            <Text variant="headline">{t('portal.manage.upcoming')}</Text>
            {found.map((a) => {
              const start = new Date(a.start);
              const token = a.confirmation?.token;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => (token ? router.push(`/m/${token}` as never) : toast({ message: t('portal.link.contact'), tone: 'default', icon: 'phone' }))}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                >
                  <View style={{ width: 52, alignItems: 'center', paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted }}>
                    <Text variant="caption" tone="secondary" align="center">
                      {f.weekday(start, 'short')}
                    </Text>
                    <Text variant="title3" align="center" tabular>
                      {f.digits(String(start.getDate()))}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text variant="callout" weight="semibold">
                      {l(look.service(a.serviceId)?.name)}
                    </Text>
                    <Text variant="footnote" tone="secondary">
                      {f.time(start)} · {l(look.barber(a.barberId)?.name)}
                    </Text>
                    <StatusBadge status={a.status} short />
                  </View>
                  <Icon name="chevron-right" size={18} color={colors.textTertiary} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="calendar"
            title={t('portal.manage.none')}
            body={t('portal.manage.noneBody')}
            actionLabel={t('portal.landing.bookNow')}
            onAction={() => router.replace(path('service') as never)}
          />
        )
      ) : null}
    </PortalShell>
  );
}
