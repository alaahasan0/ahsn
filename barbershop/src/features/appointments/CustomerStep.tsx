import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { CustomerRow } from '@/components/domain/CustomerRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Pressable } from '@/components/ui/Pressable';
import { SearchBar } from '@/components/ui/SearchBar';
import { EmptyState } from '@/components/ui/States';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { isValidMobile, normalizeNational } from '@/lib/phone';
import { useActions, useAppState } from '@/store/AppStore';
import { searchCustomers, useAllCustomerStats } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { CommunicationChannel, Customer, PhoneNumber } from '@/types/models';

export function CustomerStep({ selectedId, onSelect }: { selectedId?: string; onSelect: (c: Customer) => void }) {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const { customers } = useAppState();
  const stats = useAllCustomerStats();
  const actions = useActions();
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);

  const list = useMemo(() => {
    if (query.trim()) return searchCustomers(customers, query).slice(0, 25);
    return [...customers]
      .sort((a, b) => (stats.get(b.id)?.lastVisit?.start ?? b.createdAt).localeCompare(stats.get(a.id)?.lastVisit?.start ?? a.createdAt))
      .slice(0, 8);
  }, [customers, query, stats]);

  if (adding) {
    return (
      <NewCustomerForm
        initialQuery={query}
        onCancel={() => setAdding(false)}
        onSave={(input) => {
          const c = actions.createCustomer(input);
          onSelect(c);
        }}
      />
    );
  }

  return (
    <View style={{ gap: 16 }}>
      <SearchBar value={query} onChangeText={setQuery} placeholder={t('appointment.new.customerSearch')} />
      <Pressable onPress={() => setAdding(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderStrong }} testID="add-customer">
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user-plus" size={18} color={colors.accent} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="callout" weight="semibold">
            {t('appointment.new.addNew')}
          </Text>
          <Text variant="footnote" tone="secondary">
            {query.trim() ? `“${query.trim()}”` : t('appointment.new.addNewBody')}
          </Text>
        </View>
        <Icon name="chevron-right" size={18} color={colors.textTertiary} />
      </Pressable>
      <View style={{ gap: 4 }}>
        <Text variant="overline" tone="tertiary" style={{ paddingHorizontal: 4, marginBottom: 4 }}>
          {query.trim() ? t('appointment.new.results') : t('appointment.new.recentCustomers')}
        </Text>
        {list.length === 0 ? (
          <EmptyState compact icon="search" title={t('appointment.new.noMatch', { query: query.trim() })} body={t('common.states.noResultsBody')} />
        ) : (
          list.map((c) => <CustomerRow key={c.id} customer={c} stats={stats.get(c.id)} detail="phone" selected={c.id === selectedId} onPress={() => onSelect(c)} />)
        )}
      </View>
    </View>
  );
}

type NewCustomerInput = Omit<Customer, 'id' | 'salonId' | 'createdAt'>;

function NewCustomerForm({ initialQuery, onCancel, onSave }: { initialQuery: string; onCancel: () => void; onSave: (c: NewCustomerInput) => void }) {
  const { t } = useI18n();
  const looksLikePhone = /\d{3,}/.test(initialQuery);
  const [name, setName] = useState(looksLikePhone ? '' : initialQuery.trim());
  const [phone, setPhone] = useState<PhoneNumber>({ country: '+970', number: looksLikePhone ? normalizeNational(initialQuery) : '' });
  const [sameWa, setSameWa] = useState(true);
  const [wa, setWa] = useState<PhoneNumber>({ country: '+970', number: '' });
  const [channel, setChannel] = useState<CommunicationChannel>('whatsapp');
  const [tried, setTried] = useState(false);

  const nameError = tried && !name.trim() ? t('appointment.new.nameRequired') : undefined;
  const phoneError = tried && !isValidMobile(phone) ? t('appointment.new.phoneInvalid') : undefined;
  const waError = tried && !sameWa && wa.number && !isValidMobile(wa) ? t('appointment.new.phoneInvalid') : undefined;

  const save = () => {
    setTried(true);
    if (!name.trim() || !isValidMobile(phone) || (!sameWa && wa.number && !isValidMobile(wa))) return;
    const whatsapp = sameWa ? phone : wa.number ? wa : undefined;
    onSave({
      name: { en: name.trim(), ar: name.trim() },
      phone,
      whatsapp,
      whatsappVerification: 'unverified',
      preferredChannel: whatsapp ? channel : channel === 'whatsapp' ? 'sms' : channel,
      preferredServiceIds: [],
      category: 'new',
      categoryManual: false,
      marketingOptIn: false,
    });
  };

  return (
    <Card style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text variant="headline" style={{ flex: 1 }}>
          {t('appointment.new.newCustomer')}
        </Text>
        <Button label={t('common.actions.cancel')} variant="ghost" size="sm" onPress={onCancel} />
      </View>
      <Input label={t('common.labels.fullName')} value={name} onChangeText={setName} placeholder={t('common.labels.fullName')} icon="user" error={nameError} autoFocus={!looksLikePhone} testID="new-customer-name" />
      <PhoneInput label={t('common.labels.phone')} value={phone} onChange={setPhone} error={phoneError} hint={t('common.phone.hint')} testID="new-customer-phone" />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="callout" weight="medium">
            {t('appointment.new.whatsappSame')}
          </Text>
          <Text variant="footnote" tone="secondary">
            {t('appointment.new.whatsappSameBody')}
          </Text>
        </View>
        <Switch value={sameWa} onValueChange={setSameWa} accessibilityLabel={t('appointment.new.whatsappSame')} />
      </View>
      {!sameWa ? <PhoneInput label={t('common.labels.whatsapp')} whatsapp optional value={wa} onChange={setWa} error={waError} /> : null}
      <View style={{ gap: 8 }}>
        <Text variant="subhead" tone="secondary">
          {t('common.phone.preferredChannel')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(['whatsapp', 'sms', 'call'] as const).map((c) => (
            <Chip key={c} label={t(`common.phone.channels.${c}`)} icon={c === 'whatsapp' ? 'ion:logo-whatsapp' : c === 'sms' ? 'message-square' : 'phone'} selected={channel === c} onPress={() => setChannel(c)} />
          ))}
        </View>
      </View>
      <Button label={t('appointment.new.newCustomerSave')} onPress={save} icon="check" testID="new-customer-save" />
    </Card>
  );
}
