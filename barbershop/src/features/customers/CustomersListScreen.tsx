import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { CustomerRow } from '@/components/domain/CustomerRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { SearchBar } from '@/components/ui/SearchBar';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { normalizeNational } from '@/lib/phone';
import { useAppState } from '@/store/AppStore';
import { searchCustomers, useAllCustomerStats } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { CustomerCategory } from '@/types/models';

type Sort = 'recent' | 'name' | 'visits';
type Filter = 'all' | CustomerCategory;

/** Customer list with search, category filter and sort. Shared by owner and barber workspaces. */
export default function CustomersListScreen({ inTabs }: { inTabs?: boolean }) {
  const { colors } = useTheme();
  const { t, tp, l, lang } = useI18n();
  const { customers } = useAppState();
  const stats = useAllCustomerStats();
  const [query, setQueryRaw] = useState('');
  const setQuery = (q: string) => {
    setQueryRaw(q);
    setLimit(40);
  };
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [sortOpen, setSortOpen] = useState(false);
  // Render progressively: the client base runs to hundreds of customers.
  const [limit, setLimit] = useState(40);

  const counts = useMemo(() => ({ all: customers.length, trusted: customers.filter((c) => c.category === 'trusted').length, regular: customers.filter((c) => c.category === 'regular').length, new: customers.filter((c) => c.category === 'new').length }), [customers]);

  const list = useMemo(() => {
    const found = searchCustomers(customers, query).filter((c) => filter === 'all' || c.category === filter);
    return found.sort((a, b) => {
      if (sort === 'name') return l(a.name).localeCompare(l(b.name), lang);
      const sa = stats.get(a.id);
      const sb = stats.get(b.id);
      if (sort === 'visits') return (sb?.totalVisits ?? 0) - (sa?.totalVisits ?? 0);
      return (sb?.lastVisit?.start ?? b.createdAt).localeCompare(sa?.lastVisit?.start ?? a.createdAt);
    });
  }, [customers, query, filter, sort, stats, l, lang]);

  const addFromQuery = () => {
    const digits = normalizeNational(query);
    router.push({ pathname: '/customers/new', params: digits.length >= 6 && /^[\d\s+]+$/.test(query) ? { phone: digits } : query ? { name: query } : {} });
  };

  return (
    <Screen
      inTabs={inTabs}
      header={
        <Header
          variant="large"
          back={!inTabs}
          title={t('customers.title')}
          subtitle={tp('customers.count', customers.length)}
          right={
            <>
              <IconButton icon="shield" variant="filled" accessibilityLabel={t('customers.trust.title')} onPress={() => router.push('/trust')} />
              <IconButton icon="user-plus" variant="accent" accessibilityLabel={t('customers.add')} onPress={() => router.push('/customers/new')} />
            </>
          }
        >
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('customers.searchPlaceholder')} />
        </Header>
      }
    >
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: -20 }}>
          <ChipRow style={{ flex: 1 }}>
            {(['all', 'trusted', 'regular', 'new'] as Filter[]).map((k) => (
              <Chip key={k} size="sm" label={k === 'all' ? t('common.labels.all') : t(`domain.category.${k}`)} count={counts[k]} selected={filter === k} onPress={() => setFilter(k)} />
            ))}
          </ChipRow>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="footnote" tone="tertiary">
            {tp('common.counts.results', list.length)}
          </Text>
          <Pressable onPress={() => setSortOpen(true)} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="bar-chart-2" size={14} color={colors.textSecondary} />
            <Text variant="footnote" tone="secondary">
              {t(`customers.sort.${sort}`)}
            </Text>
            <Icon name="chevron-down" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>

        {list.length === 0 ? (
          query ? (
            <View style={{ gap: 4 }}>
              <EmptyState icon="search" title={t('customers.noMatch', { query })} body={t('customers.noMatchBody')} />
              <Button label={t('customers.addNamed', { name: query })} icon="user-plus" variant="soft" onPress={addFromQuery} />
            </View>
          ) : (
            <EmptyState icon="users" title={t('customers.empty.title')} body={t('customers.empty.body')} actionLabel={t('customers.add')} onAction={() => router.push('/customers/new')} />
          )
        ) : (
          <View style={{ gap: 12 }}>
            <Card padding={4}>
              {list.slice(0, limit).map((c, i) => (
                <View key={c.id}>
                  {i > 0 ? <Divider inset={68} /> : null}
                  <CustomerRow customer={c} stats={stats.get(c.id)} />
                </View>
              ))}
            </Card>
            {list.length > limit ? <Button label={`${t('common.actions.more')} · ${list.length - limit}`} variant="secondary" icon="chevron-down" onPress={() => setLimit((n) => n + 60)} /> : null}
          </View>
        )}
      </View>

      <Sheet visible={sortOpen} onClose={() => setSortOpen(false)} title={t('customers.sort.label')}>
        <View style={{ gap: 8 }}>
          {(['recent', 'name', 'visits'] as Sort[]).map((s) => (
            <Pressable
              key={s}
              onPress={() => {
                setSort(s);
                setSortOpen(false);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: sort === s ? colors.accentSoft : colors.surfaceMuted }}
            >
              <Text variant="callout" weight="medium" style={{ flex: 1 }}>
                {t(`customers.sort.${s}`)}
              </Text>
              {sort === s ? <Icon name="check" size={18} color={colors.accent} /> : null}
            </Pressable>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}
