import { useState } from 'react';
import { View } from 'react-native';

import { CustomerRow } from '@/components/domain/CustomerRow';
import { SearchBar } from '@/components/ui/SearchBar';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState } from '@/components/ui/States';
import { useI18n } from '@/i18n';
import { useCustomerSearch } from '@/store/selectors';
import type { ID } from '@/types/models';

export function CustomerPickerSheet({ visible, onClose, value, onSelect }: { visible: boolean; onClose: () => void; value?: ID; onSelect: (id: ID) => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const results = useCustomerSearch(q);
  return (
    <Sheet visible={visible} onClose={onClose} title={t('recurring.form.chooseCustomer')}>
      <View style={{ gap: 8 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder={t('customers.searchPlaceholder')} />
        {results.length === 0 ? <EmptyState compact icon="search" title={t('customers.noMatch', { query: q })} body={t('customers.noMatchBody')} /> : null}
        {results.slice(0, 40).map((c) => (
          <CustomerRow
            key={c.id}
            customer={c}
            detail="phone"
            selected={value === c.id}
            onPress={() => {
              onSelect(c.id);
              onClose();
            }}
          />
        ))}
      </View>
    </Sheet>
  );
}
