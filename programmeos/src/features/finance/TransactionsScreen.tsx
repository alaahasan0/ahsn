import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { ActionSheet, Button, Chip, ChipRow, IconButton, ListGroup, NoFilterResults, NoResults, Screen, SearchField, Section, SelectSheet, Sheet, Text, EmptyState } from '@/components';
import type { Transaction, TransactionKind, TransactionStatus } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { formatMonthYear } from '@/utils/dates';
import { money, searchMatch } from '@/utils/format';

import { LoadGate, RequireAccess } from '../shared/Widgets';
import { IllustrativeNote, TransactionRow } from './components';

const KINDS: TransactionKind[] = ['Purchase Request', 'Purchase Order', 'Supplier Invoice', 'Faculty Invoice', 'Payment Request', 'Expense'];
const KIND_PLURAL: Record<TransactionKind, string> = {
  'Purchase Request': 'Purchase requests',
  'Purchase Order': 'Purchase orders',
  'Supplier Invoice': 'Supplier invoices',
  'Faculty Invoice': 'Faculty invoices',
  'Payment Request': 'Payment requests',
  Expense: 'Expenses',
};
const STATUSES: TransactionStatus[] = ['Draft', 'Submitted', 'Pending Approval', 'Approved', 'Scheduled', 'Paid', 'Overdue', 'Rejected'];
type Sort = 'date' | 'amount' | 'due';

export default function TransactionsScreen() {
  const db = useDB();
  const params = useLocalSearchParams<{ programme?: string; kind?: string }>();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<TransactionKind | 'all'>((params.kind as TransactionKind) ?? 'all');
  const [statuses, setStatuses] = useState<TransactionStatus[]>([]);
  const [programmes, setProgrammes] = useState<string[]>(params.programme ? [params.programme] : []);
  const [sort, setSort] = useState<Sort>('date');
  const [filterOpen, setFilterOpen] = useState(false);
  const [progPicker, setProgPicker] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const base = db.transactions.filter((t) => (kind === 'all' || t.kind === kind) && (!statuses.length || statuses.includes(t.status)) && (!programmes.length || programmes.includes(t.programmeId)));
  const list = useMemo(
    () =>
      base
        .filter((t) => searchMatch(q, t.payee, t.description, t.reference, getProgramme(db, t.programmeId)?.name, t.category))
        .sort((a, b) => (sort === 'amount' ? b.amount - a.amount : sort === 'due' ? (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') : b.date.localeCompare(a.date))),
    [base, q, sort, db],
  );
  const filterCount = statuses.length + programmes.length;
  const total = list.reduce((s, t) => s + t.amount, 0);

  // Group by month when sorted by date
  const groups: { title: string; items: Transaction[] }[] = [];
  if (sort === 'date') {
    for (const t of list) {
      const title = formatMonthYear(t.date);
      const g = groups.find((x) => x.title === title);
      if (g) g.items.push(t);
      else groups.push({ title, items: [t] });
    }
  } else groups.push({ title: sort === 'amount' ? 'Largest first' : 'By due date', items: list });

  const reset = () => {
    setStatuses([]);
    setProgrammes([]);
    setKind('all');
  };

  return (
    <Screen
      title="Transactions"
      subtitle="Purchase requests, orders, invoices, payment requests and expenses."
      headerRight={<IconButton icon="arrow-up-down" accessibilityLabel="Sort" onPress={() => setSortOpen(true)} />}
      headerBelow={
        <>
          <SearchField value={q} onChangeText={setQ} placeholder="Search payee, reference, programme" onFilterPress={() => setFilterOpen(true)} filterCount={filterCount} />
          <ChipRow>
            <Chip label="All" selected={kind === 'all'} onPress={() => setKind('all')} count={db.transactions.length} />
            {KINDS.map((k) => (
              <Chip key={k} label={KIND_PLURAL[k]} selected={kind === k} onPress={() => setKind(kind === k ? 'all' : k)} count={db.transactions.filter((t) => t.kind === k).length} />
            ))}
          </ChipRow>
          {programmes.length || statuses.length ? (
            <ChipRow>
              {programmes.map((p) => (
                <Chip key={p} label={getProgramme(db, p)?.shortName ?? p} icon="layers" selected onRemove={() => setProgrammes(programmes.filter((x) => x !== p))} />
              ))}
              {statuses.map((st) => (
                <Chip key={st} label={st} selected onRemove={() => setStatuses(statuses.filter((x) => x !== st))} />
              ))}
            </ChipRow>
          ) : null}
        </>
      }>
      <RequireAccess module="finance">
        <LoadGate loadKey="finance-transactions">
          {db.transactions.length === 0 ? (
            <EmptyState icon="receipt" title="No transactions yet" message="Purchase orders, invoices and expenses will appear here as they’re raised." actionLabel="Record expense" onAction={() => router.push('/expense/new')} />
          ) : list.length === 0 ? (
            q ? <NoResults query={q} onClear={() => setQ('')} /> : <NoFilterResults onReset={reset} />
          ) : (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 4 }}>
                <Text variant="footnote" tone="secondary">
                  {list.length} record{list.length === 1 ? '' : 's'}
                </Text>
                <Text variant="footnote" tone="secondary" tabular>
                  Total {money(total)}
                </Text>
              </View>
              {groups.map((g, i) => (
                <Section key={g.title} title={g.title} first={i === 0} style={i === 0 ? { marginTop: 12 } : undefined}>
                  <ListGroup>
                    {g.items.map((t) => (
                      <TransactionRow key={t.id} tx={t} />
                    ))}
                  </ListGroup>
                </Section>
              ))}
              <IllustrativeNote />
            </>
          )}
        </LoadGate>
      </RequireAccess>

      <Sheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter transactions"
        footer={
          <>
            <Button title="Reset" variant="secondary" onPress={reset} style={{ flex: 1 }} />
            <Button title={`Show ${list.length}`} onPress={() => setFilterOpen(false)} style={{ flex: 2 }} />
          </>
        }>
        <Text variant="overline" tone="tertiary" style={{ marginBottom: 10 }}>
          Status
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {STATUSES.map((st) => (
            <Chip key={st} label={st} selected={statuses.includes(st)} onPress={() => setStatuses(statuses.includes(st) ? statuses.filter((x) => x !== st) : [...statuses, st])} count={db.transactions.filter((t) => t.status === st).length} />
          ))}
        </View>
        <Text variant="overline" tone="tertiary" style={{ marginTop: 20, marginBottom: 10 }}>
          Programme
        </Text>
        <Button title={programmes.length ? `${programmes.length} selected` : 'All programmes'} variant="secondary" icon="layers" onPress={() => setProgPicker(true)} />
      </Sheet>

      <SelectSheet
        visible={progPicker}
        onClose={() => setProgPicker(false)}
        title="Programmes"
        multiple
        values={programmes}
        onChangeValues={setProgrammes}
        options={db.programmes.map((p) => ({ value: p.id, label: p.name, detail: `${p.code} · ${db.transactions.filter((t) => t.programmeId === p.id).length} transactions` }))}
      />

      <ActionSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        title="Sort by"
        actions={[
          { label: 'Newest first', icon: sort === 'date' ? 'check' : 'calendar', onPress: () => setSort('date') },
          { label: 'Largest amount', icon: sort === 'amount' ? 'check' : 'arrow-down-up', onPress: () => setSort('amount') },
          { label: 'Due soonest', icon: sort === 'due' ? 'check' : 'clock', onPress: () => setSort('due') },
        ]}
      />
    </Screen>
  );
}
