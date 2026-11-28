import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BrandMark } from '@/components/domain';
import { Button, Card, Input, PhoneInput, Section, Screen, Header, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useActions, useAppState } from '@/store/AppStore';
import { useTheme } from '@/theme';

export default function SalonProfileScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const { salon } = useAppState();
  const actions = useActions();
  const [draft, setDraft] = useState(salon);
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Screen
      header={<Header title={t('settings.salon.title')} backFallback="/settings" />}
      footer={
        <Button
          label={t('common.actions.saveChanges')}
          size="lg"
          onPress={() => {
            actions.updateSalon({ name: draft.name, tagline: draft.tagline, address: draft.address, city: draft.city, phone: draft.phone, whatsapp: draft.whatsapp, email: draft.email, instagram: draft.instagram });
            toast(t('settings.salon.saved'));
            router.back();
          }}
        />
      }
    >
      <View style={{ gap: 24, paddingTop: 8 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <BrandMark size={84} />
          <Button label={t('settings.salon.changeLogo')} variant="secondary" size="sm" icon="camera" onPress={() => toast({ message: t('settings.salon.changeLogo'), description: t('auth.onboarding.profile.logoSimulated'), icon: 'image' })} />
        </View>
        <Section>
          <Input label={t('settings.salon.nameAr')} value={draft.name.ar} onChangeText={(ar) => set('name', { ...draft.name, ar })} />
          <Input label={t('settings.salon.nameEn')} value={draft.name.en} onChangeText={(en) => set('name', { ...draft.name, en })} ltr />
          <Input label={t('settings.salon.taglineAr')} value={draft.tagline.ar} onChangeText={(ar) => set('tagline', { ...draft.tagline, ar })} />
          <Input label={t('settings.salon.taglineEn')} value={draft.tagline.en} onChangeText={(en) => set('tagline', { ...draft.tagline, en })} ltr />
        </Section>
        <Section>
          <Input label={t('settings.salon.address')} icon="map-pin" value={draft.address.ar} onChangeText={(ar) => set('address', { ...draft.address, ar })} />
          <Input label={t('settings.salon.city')} icon="navigation" value={draft.city.ar} onChangeText={(ar) => set('city', { ...draft.city, ar })} />
          <PhoneInput label={t('settings.salon.phone')} value={draft.phone} onChange={(p) => set('phone', p)} />
          <PhoneInput label={t('settings.salon.whatsapp')} whatsapp value={draft.whatsapp} onChange={(p) => set('whatsapp', p)} />
          <Input label={t('settings.salon.email')} icon="mail" value={draft.email} onChangeText={(v) => set('email', v)} ltr autoCapitalize="none" />
          <Input label={t('settings.salon.instagram')} icon="instagram" value={draft.instagram ?? ''} onChangeText={(v) => set('instagram', v)} ltr autoCapitalize="none" />
        </Section>
        <Card variant="muted" style={{ gap: 4 }}>
          <Text variant="subhead" tone="secondary">
            {t('settings.salon.publicLink')}
          </Text>
          <Text variant="callout" weight="semibold" color={colors.accent} style={{ writingDirection: 'ltr' }}>
            {`barberhouse.app/book/${salon.slug}`}
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
