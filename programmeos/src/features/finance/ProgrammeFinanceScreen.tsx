import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Banner, BarChart, Button, Card, EmptyState, IconButton, Legend, ListGroup, Screen, Section, SegmentedControl, Stat, StatGrid, StatusPill, Text, useToast } from '@/components';
import { getClient, getProgramme, programmeFinance, programmePhase } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { formatRange } from '@/utils/dates';
import { money, moneyCompact } from '@/utils/format';

import { RequireAccess } from '../shared/Widgets';
import { BudgetExplainer, BudgetLineRow, CATEGORY_SHORT, IllustrativeNote, InvoiceRow, TransactionRow } from './components';

/** Programme-level financial control: one programme, one honest set of numbers. */
export default function ProgrammeFinanceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const toast = useToast();
  const { colors } = useTheme();
  const [view, setView] = useState<'lines' | 'chart'>('lines');
  const p = getProgramme(db, id);

  if (!p) {
    return (
      <Screen title="Finance">
        <EmptyState icon="layers" title="Programme not found" actionLabel="All programmes" onAction={() => router.replace('/programmes')} />
      </Screen>
    );
  }

  const f = programmeFinance(db, p.id);
  const client = getClient(db, p.clientId);
  const budgetedMargin = p.contractValue - f.budget;
  const budgetedPct = p.contractValue ? (budgetedMargin / p.contractValue) * 100 : 0;
  const lines = f.lines.filter((l) => l.budget || l.committed);
  const txs = db.transactions.filter((t) => t.programmeId === p.id).sort((a, b) => b.date.localeCompare(a.date));
  const phase = programmePhase(p);

  return (
    <Screen
      title={p.name}
      eyebrow={`Finance · ${p.code}`}
      subtitle={`${client?.name} · ${formatRange(p.startDate, p.endDate)}`}
      headerRight={<IconButton icon="share-2" accessibilityLabel="Share financial summary" onPress={() => toast.show({ message: 'Summary ready to share', detail: `${p.shortName} financial summary (PDF) · sample`, icon: 'share-2', tone: 'neutral' })} />}
      footer={
        <>
          <Button title="Transactions" variant="secondary" onPress={() => router.push(`/finance/transactions?programme=${p.id}`)} style={{ flex: 1 }} />
          <Button title="Record expense" icon="receipt" onPress={() => router.push(`/expense/new?programme=${p.id}`)} style={{ flex: 1 }} />
        </>
      }>
      <RequireAccess module="finance">
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <StatusPill label={p.status.financial} size="md" />
          <StatusPill label={p.status.commercial} size="md" />
          {p.cancelled ? <StatusPill label="Cancelled" size="md" /> : null}
        </View>
        {p.cancelled ? <Banner tone="neutral" title="Programme cancelled" message={p.cancellationReason} style={{ marginTop: 12 }} /> : null}
        {f.overLines.length ? <Banner tone="warning" title={`${f.overLines.length} cost line${f.overLines.length > 1 ? 's' : ''} over budget`} message={f.overLines.map((l) => `${l.category} +${moneyCompact(l.committed - l.budget)}`).join(' · ')} style={{ marginTop: 12 }} /> : null}

        <Section title="Summary" first style={{ marginTop: 16 }}>
          <StatGrid>
            <Stat label="Contract value" value={moneyCompact(p.contractValue)} icon="file-signature" caption={client?.shortName} />
            <Stat label="Approved budget" value={moneyCompact(f.budget)} icon="wallet" caption={`Budgeted margin ${budgetedPct.toFixed(1)}%`} />
            <Stat label="Committed" value={moneyCompact(f.committed)} icon="file-check" caption={`${f.budget ? Math.round((f.committed / f.budget) * 100) : 0}% of budget`} />
            <Stat label="Actual" value={moneyCompact(f.actual)} icon="receipt" caption="Invoiced or paid" />
            <Stat label="Pending payments" value={moneyCompact(f.pending)} icon="hourglass" tone={f.pending ? 'warning' : undefined} caption="Approved, not paid" />
            <Stat label="Variance" value={`${f.variance >= 0 ? '' : '−'}${moneyCompact(Math.abs(f.variance))}`} icon="scale" tone={f.variance >= 0 ? 'success' : 'danger'} caption={f.variance >= 0 ? 'Headroom vs budget' : 'Over budget'} />
            <Stat label="Forecast margin" value={`${f.marginPct.toFixed(1)}%`} icon="percent" tone={f.marginPct >= 35 ? 'success' : f.marginPct >= 25 ? 'accent' : 'warning'} caption={money(f.margin)} />
            <Stat label="Revenue recognised" value={moneyCompact(p.revenue)} icon="trending-up" tone="accent" caption={`${p.contractValue ? Math.round((p.revenue / p.contractValue) * 100) : 0}% of contract`} />
          </StatGrid>
        </Section>

        <Section title="Cost control">
          <Card padding="lg">
            <BudgetExplainer budget={f.budget} committed={f.committed} actual={f.actual} pending={f.pending} />
          </Card>
        </Section>

        <Section title="Budget vs actual" subtitle="By cost category">
          <SegmentedControl
            value={view}
            onChange={setView}
            size="sm"
            options={[
              { value: 'lines', label: 'Lines' },
              { value: 'chart', label: 'Chart' },
            ]}
          />
          {lines.length === 0 ? (
            <Card>
              <Text tone="secondary">No budget has been set for this programme yet.</Text>
            </Card>
          ) : view === 'lines' ? (
            <ListGroup>
              {lines.map((l) => (
                <BudgetLineRow key={l.category} category={l.category} budget={l.budget} committed={l.committed} actual={l.actual} pending={l.pending} />
              ))}
            </ListGroup>
          ) : (
            <Card padding="md" style={{ gap: 12 }}>
              <BarChart
                labels={lines.map((l) => CATEGORY_SHORT[l.category])}
                series={[
                  { name: 'Budget', color: colors.borderStrong, values: lines.map((l) => l.budget) },
                  { name: 'Committed', color: colors.chart[0], values: lines.map((l) => l.committed) },
                  { name: 'Actual', color: colors.chart[1], values: lines.map((l) => l.actual) },
                ]}
                format={moneyCompact}
                height={200}
              />
              <Legend
                items={[
                  { label: 'Budget', color: colors.borderStrong },
                  { label: 'Committed', color: colors.chart[0] },
                  { label: 'Actual', color: colors.chart[1] },
                ]}
              />
            </Card>
          )}
        </Section>

        <Section title="Revenue" subtitle={`${money(f.invoiced)} invoiced · ${money(f.received)} received`} action="All invoices" onAction={() => router.push('/finance/invoices')}>
          {f.invoices.length ? (
            <ListGroup>
              {f.invoices.map((i) => (
                <InvoiceRow key={i.id} invoice={i} onPress={() => router.push('/finance/invoices')} />
              ))}
            </ListGroup>
          ) : (
            <Card>
              <Text tone="secondary">{phase === 'cancelled' ? 'No invoices — programme cancelled before invoicing.' : 'No invoices issued yet.'}</Text>
            </Card>
          )}
        </Section>

        <Section title="Transactions" subtitle={`${txs.length} records`} action={txs.length ? 'View all' : undefined} onAction={() => router.push(`/finance/transactions?programme=${p.id}`)}>
          {txs.length ? (
            <ListGroup>
              {txs.slice(0, 6).map((t) => (
                <TransactionRow key={t.id} tx={t} showProgramme={false} />
              ))}
            </ListGroup>
          ) : (
            <Card>
              <Text tone="secondary">No purchase orders, invoices or expenses recorded yet.</Text>
            </Card>
          )}
        </Section>
        <IllustrativeNote />
      </RequireAccess>
    </Screen>
  );
}
