import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

import { useBookingDraft } from '../BookingDraft';
import { OtpInput } from '../OtpInput';
import { PortalShell } from '../PortalShell';
import { SalonNotFound } from '../shared';

export function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  return { left, restart: () => setLeft(seconds) };
}

export default function VerifyStep() {
  const { colors, radius } = useTheme();
  const { t, f } = useI18n();
  const toast = useToast();
  const { salon, draft, update, path } = useBookingDraft();
  const [code, setCode] = useState('');
  const { left, restart } = useCountdown(30);
  if (!salon) return <SalonNotFound />;
  if (!draft.slot) return <Redirect href={path('time') as never} />;

  return (
    <PortalShell
      salonName={salon.name}
      step="verify"
      back
      title={t('portal.steps.verify')}
      footer={
        <Button
          label={t('portal.verify.verify')}
          size="lg"
          disabled={code.length < 6}
          testID="portal-verify"
          onPress={() => {
            update({ verified: true });
            router.push(path('review') as never);
          }}
        />
      }
    >
      <Text variant="callout" tone="secondary">
        {t('portal.verify.body', { phone: f.ltr(f.phone(draft.phone.country, draft.phone.number)) })}
      </Text>
      <OtpInput value={code} onChange={setCode} autoFocus />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: colors.accentSoft }}>
        <Icon name="info" size={14} color={colors.accentOnSoft} />
        <Text variant="footnote" color={colors.accentOnSoft} style={{ flex: 1 }}>
          {t('portal.verify.demo')}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {left > 0 ? (
          <Text variant="footnote" tone="tertiary">
            {t('portal.verify.resendIn', { seconds: left })}
          </Text>
        ) : (
          <Pressable
            onPress={() => {
              restart();
              toast({ message: t('portal.verify.resent'), description: t('common.toast.simulated') });
            }}
          >
            <Text variant="subhead" tone="accent">
              {t('portal.verify.resend')}
            </Text>
          </Pressable>
        )}
        <Pressable onPress={() => router.back()}>
          <Text variant="subhead" tone="secondary">
            {t('portal.verify.wrong')}
          </Text>
        </Pressable>
      </View>
    </PortalShell>
  );
}
