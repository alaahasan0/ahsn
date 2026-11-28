import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { isValidMobile } from '@/lib/phone';
import { useTheme } from '@/theme';
import type { CommunicationChannel } from '@/types/models';

import { useBookingDraft } from '../BookingDraft';
import { PortalShell } from '../PortalShell';
import { SalonNotFound } from '../shared';

export default function DetailsStep() {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const { salon, draft, update, path } = useBookingDraft();
  const [touched, setTouched] = useState(false);
  if (!salon) return <SalonNotFound />;
  if (!draft.slot) return <Redirect href={path('time') as never} />;

  const nameError = touched && draft.name.trim().length < 2 ? t('portal.details.nameRequired') : undefined;
  const phoneError = touched && !isValidMobile(draft.phone) ? t('portal.details.phoneInvalid') : undefined;
  const waError = touched && !draft.whatsappSame && draft.whatsapp.number && !isValidMobile(draft.whatsapp) ? t('portal.details.phoneInvalid') : undefined;

  const submit = () => {
    setTouched(true);
    if (draft.name.trim().length < 2 || !isValidMobile(draft.phone) || (!draft.whatsappSame && draft.whatsapp.number && !isValidMobile(draft.whatsapp))) return;
    update({ verified: false });
    router.push(path('verify') as never);
  };

  return (
    <PortalShell
      salonName={salon.name}
      step="details"
      back
      title={t('portal.steps.details')}
      footer={<Button label={t('common.actions.continue')} size="lg" onPress={submit} testID="portal-details-continue" />}
    >
      <View style={{ gap: 18 }}>
        <Input
          label={t('common.labels.fullName')}
          placeholder={t('portal.details.namePlaceholder')}
          value={draft.name}
          onChangeText={(name) => update({ name })}
          error={nameError}
          icon="user"
          autoComplete="name"
          testID="portal-name"
        />
        <PhoneInput label={t('common.labels.phone')} value={draft.phone} onChange={(phone) => update({ phone })} hint={t('portal.details.phoneHint')} error={phoneError} testID="portal-phone" />
        <View style={{ gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text variant="callout" weight="medium" style={{ flex: 1 }}>
              {t('portal.details.whatsappSame')}
            </Text>
            <Switch
              value={draft.whatsappSame}
              onValueChange={(v) => update({ whatsappSame: v, whatsapp: v ? draft.whatsapp : { country: draft.phone.country, number: '' } })}
              accessibilityLabel={t('portal.details.whatsappSame')}
            />
          </View>
          {!draft.whatsappSame ? (
            <PhoneInput
              label={t('common.labels.whatsapp')}
              whatsapp
              value={draft.whatsapp}
              onChange={(whatsapp) => update({ whatsapp })}
              hint={t('portal.details.whatsappHint')}
              error={waError}
              optional
            />
          ) : null}
        </View>
        <View style={{ gap: 8 }}>
          <Text variant="subhead" tone="secondary">
            {t('portal.details.channel')}
          </Text>
          <SegmentedControl<CommunicationChannel>
            segments={[
              { value: 'whatsapp', label: t('common.phone.channels.whatsapp') },
              { value: 'sms', label: t('common.phone.channels.sms') },
              { value: 'call', label: t('common.phone.channels.call') },
            ]}
            value={draft.channel}
            onChange={(channel) => update({ channel })}
          />
        </View>
        <Input label={t('portal.details.notes')} placeholder={t('portal.details.notesPlaceholder')} value={draft.notes} onChangeText={(notes) => update({ notes })} multiline optional />
      </View>
    </PortalShell>
  );
}
