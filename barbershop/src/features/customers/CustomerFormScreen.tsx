import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CATEGORY_ICON } from '@/components/domain/meta';
import { WhatsAppStatus } from '@/components/domain/Badges';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Header, goBack } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { isValidMobile, normalizeNational, phonesEqual } from '@/lib/phone';
import { useActions, useAppState } from '@/store/AppStore';
import { useCustomer } from '@/store/selectors';
import type { CommunicationChannel, CustomerCategory, ID, PhoneNumber } from '@/types/models';

import { FieldLabel, ToggleRow } from '../availability/controls';
import { ServiceMultiSelect } from '../services/ServiceSelect';
import { BarberSelect } from '../team/BarberSelect';

/** Add / edit customer. Phone and WhatsApp are separate fields by design. */
export default function CustomerFormScreen({ id }: { id?: string }) {
  const params = useLocalSearchParams<{ name?: string; phone?: string; returnTo?: string }>();
  const { t, l, lang } = useI18n();
  const toast = useToast();
  const actions = useActions();
  const { customers } = useAppState();
  const existing = useCustomer(id);
  const editing = !!id;

  const [name, setName] = useState(existing ? l(existing.name) : (params.name ?? ''));
  const [phone, setPhone] = useState<PhoneNumber>(existing?.phone ?? { country: '+970', number: params.phone ? normalizeNational(params.phone) : '' });
  const [same, setSame] = useState(existing ? phonesEqual(existing.phone, existing.whatsapp) : true);
  const [whatsapp, setWhatsapp] = useState<PhoneNumber>(existing?.whatsapp && !phonesEqual(existing.phone, existing.whatsapp) ? existing.whatsapp : { country: '+970', number: '' });
  const [hasWhatsapp, setHasWhatsapp] = useState(existing ? !!existing.whatsapp : true);
  const [channel, setChannel] = useState<CommunicationChannel>(existing?.preferredChannel ?? 'whatsapp');
  const [barberId, setBarberId] = useState<ID | undefined>(existing?.preferredBarberId);
  const [serviceIds, setServiceIds] = useState<ID[]>(existing?.preferredServiceIds ?? []);
  const [category, setCategory] = useState<CustomerCategory>(existing?.category ?? 'new');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [marketing, setMarketing] = useState(existing?.marketingOptIn ?? true);
  const [submitted, setSubmitted] = useState(false);

  if (editing && !existing) {
    return (
      <Screen header={<Header close />}>
        <EmptyState icon="user-x" title={t('customers.profile.notFound')} body={t('customers.profile.notFoundBody')} />
      </Screen>
    );
  }

  const nameError = submitted && !name.trim() ? t('customers.form.errors.name') : undefined;
  const phoneError = submitted && !isValidMobile(phone) ? t('customers.form.errors.phone') : undefined;
  const waError = submitted && hasWhatsapp && !same && !isValidMobile(whatsapp) ? t('customers.form.errors.whatsapp') : undefined;
  const duplicate = phone.number.length === 9 ? customers.find((c) => c.id !== id && phonesEqual(c.phone, phone)) : undefined;

  const save = () => {
    setSubmitted(true);
    if (!name.trim() || !isValidMobile(phone) || (hasWhatsapp && !same && !isValidMobile(whatsapp))) return;
    const wa = !hasWhatsapp ? undefined : same ? phone : whatsapp;
    const base = {
      phone,
      whatsapp: wa,
      whatsappVerification: existing && wa && existing.whatsapp && phonesEqual(existing.whatsapp, wa) ? existing.whatsappVerification : ('unverified' as const),
      preferredChannel: !wa && channel === 'whatsapp' ? ('sms' as const) : channel,
      preferredBarberId: barberId,
      preferredServiceIds: serviceIds,
      category,
      categoryManual: existing ? existing.categoryManual || existing.category !== category : category !== 'new',
      notes: notes.trim() || undefined,
      marketingOptIn: marketing,
    };
    if (existing) {
      actions.upsertCustomer({ ...existing, ...base, name: { ...existing.name, [lang]: name.trim() } });
      toast(t('customers.form.updated'));
      router.back();
    } else {
      const c = actions.createCustomer({ ...base, name: { en: name.trim(), ar: name.trim() } });
      toast(t('customers.form.created'));
      if (params.returnTo === 'back') router.back();
      else router.replace(`/customers/${c.id}`);
    }
  };

  return (
    <Screen
      header={<Header close title={editing ? t('customers.form.editTitle') : t('customers.form.newTitle')} onBack={() => goBack('/owner/customers')} />}
      footer={<Button label={t('customers.form.save')} onPress={save} fullWidth size="lg" testID="customer-save" />}
    >
      <View style={{ gap: 22, paddingTop: 8 }}>
        <Input label={t('customers.form.name')} placeholder={t('customers.form.namePlaceholder')} value={name} onChangeText={setName} error={nameError} icon="user" autoFocus={!editing && !params.name} />

        <View style={{ gap: 10 }}>
          <PhoneInput label={t('customers.form.phone')} value={phone} onChange={setPhone} error={phoneError} hint={duplicate ? undefined : t('common.phone.hint')} testID="customer-phone" />
          {duplicate ? (
            <Text variant="footnote" tone="warning">
              {t('customers.form.duplicate', { name: l(duplicate.name) })}
            </Text>
          ) : null}
        </View>

        <Card style={{ gap: 14 }}>
          <ToggleRow icon="ion:logo-whatsapp" title={t('customers.form.whatsapp')} hint={t('customers.form.whatsappHint')} value={hasWhatsapp} onChange={setHasWhatsapp} />
          {hasWhatsapp ? (
            <>
              <ToggleRow title={t('customers.form.sameWhatsapp')} hint={t('customers.form.sameWhatsappHint')} value={same} onChange={setSame} />
              {!same ? <PhoneInput whatsapp label={t('customers.form.whatsapp')} value={whatsapp} onChange={setWhatsapp} error={waError} /> : null}
              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text variant="subhead" tone="secondary">
                    {t('customers.form.verification')}
                  </Text>
                  <WhatsAppStatus status={existing?.whatsappVerification ?? 'unverified'} />
                </View>
                <Text variant="footnote" tone="tertiary">
                  {t('customers.form.verificationHint')}
                </Text>
              </View>
            </>
          ) : null}
        </Card>

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('customers.form.channel')} />
          <SegmentedControl
            segments={(['whatsapp', 'sms', 'call'] as CommunicationChannel[]).map((c) => ({ value: c, label: t(`common.phone.channels.${c}`) }))}
            value={channel}
            onChange={setChannel}
          />
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('customers.form.barber')} />
          <BarberSelect value={barberId} onChange={setBarberId} allowNone noneLabel={t('customers.profile.noPreference')} />
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('customers.form.services')} />
          <ServiceMultiSelect value={serviceIds} onChange={setServiceIds} />
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('customers.form.category')} hint={t('domain.categoryPrivacy')} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {(['trusted', 'regular', 'new'] as CustomerCategory[]).map((c) => (
              <Chip key={c} label={t(`domain.categoryLong.${c}`)} icon={CATEGORY_ICON[c]} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>

        <Input label={t('customers.form.notes')} placeholder={t('customers.form.notesPlaceholder')} value={notes} onChangeText={setNotes} multiline optional />

        <ToggleRow title={t('customers.form.marketing')} hint={t('customers.form.marketingHint')} value={marketing} onChange={setMarketing} />
      </View>
    </Screen>
  );
}
