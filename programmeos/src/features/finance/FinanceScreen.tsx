import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BarChart, Card, DonutChart, HBarList, HeaderActions, IconButton, Legend, ListGroup, ListRow, Screen, Section, SegmentedControl, Stat, StatGrid, Text } from '@/components';
import { costCategories, revenueByMonth } from '@/data/mock';
import { pendingApprovalsFor, portfolioFinance, programmePhase } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { money, moneyCompact } from '@/utils/format';

import { LoadGate, RequireAccess } from '../shared/Widgets';
import { BudgetExplainer, categoryColors, IllustrativeNote, InvoiceRow, invoiceOutstanding, TransactionRow } from './components';

type Scope = 'active' | 'upcoming' | 'all';

/** Financial workspace: the portfolio's money in one calm, trustworthy view. */
export default function FinanceScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const { userId } = useSession();
  const [scope, setScope] = useState<Scope>('active');

  const programmes = db.programmes.filter((p) => {
    if (p.cancelled) return scope === 'all';
    const phase = programmePhase(p);
    if (scope === 'active') return phase === 'upcoming' || phase === 'in_delivery' || (phase === 'completed' && p.status.financial !== 'Closed');
    if (scope === 'upcoming') return phase === 'upcoming';
    return true;
  });
  const ids = programmes.map((p) => p.id);
  const pf = portfolioFinance(db, ids);
  const recognised = programmes.reduce((s, p) => s + p.revenue, 0);

  const catTotals = costCategories.map((c, i) => ({
    label: c,
    value: db.budgetLines.filter((l) => ids.includes(l.programmeId) && l.category === c).reduce((s, l) => s + l.committed, 0),
    color: categoryColors(colors)[i],
  }));
  const catSum = catTotals.reduce((s, c) => s + c.value, 0);

  const months = revenueByMonth.filter((m) => m.revenue > 0);
  const q1 = months.slice(-3);
  const q1Rev = q1.reduce((s, m) => s + m.revenue, 0);
  const q1Cost = q1.reduce((s, m) => s + m.costs, 0);

  const profit = pf.programmes
    .filter((f) => f.programme.contractValue > 0 && !f.programme.cancelled)
    .map((f) => ({ id: f.programme.id, label: f.programme.name, short: f.programme.shortName, pct: f.marginPct, margin: f.margin }))
    .sort((a, b) => b.pct - a.pct);

  const receivables = db.clientInvoices.filter((i) => ids.includes(i.programmeId) && i.status !== 'Draft' && invoiceOutstanding(i) > 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const attention = db.transactions.filter((t) => ids.includes(t.programmeId) && ['Pending Approval', 'Overdue', 'Submitted'].includes(t.status)).sort((a, b) => (a.status === 'Overdue' ? -1 : 0) - (b.status === 'Overdue' ? -1 : 0) || b.amount - a.amount);
  const myApprovals = pendingApprovalsFor(db, userId).length;
  const pendingApprovalsTotal = db.approvals.filter((a) => a.status === 'Pending').length;

  return (
    <Screen
      title="Finance"
      eyebrow="Emeritus Education · FY2027 · USD"
      subtitle="Budget, commitments, actuals and revenue across the portfolio."
      refreshable
      headerRight={
        <HeaderActions>
          <IconButton icon="chart-column" accessibilityLabel="Finance reports" onPress={() => router.push('/report/budget')} />
          <IconButton icon="plus" variant="tinted" accessibilityLabel="Record expense" onPress={() => router.push('/expense/new')} />
        </HeaderActions>
      }>
      <RequireAccess module="finance">
        <SegmentedControl
          value={scope}
          onChange={setScope}
          options={[
            { value: 'active', label: 'Active', count: db.programmes.filter((p) => !p.cancelled && p.status.financial !== 'Closed' && !p.archived).length },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'all', label: 'All programmes' },
          ]}
        />
        <LoadGate loadKey="finance-workspace">
          <Section title="Headline figures" subtitle={`${programmes.length} programmes in scope`} first>
            <StatGrid>
              <Stat label="Contract value" value={moneyCompact(pf.contract)} icon="file-signature" caption="Signed agreements" onPress={() => router.push('/finance/invoices')} />
              <Stat label="Revenue recognised" value={moneyCompact(recognised)} icon="trending-up" tone="accent" caption={`${pf.contract ? Math.round((recognised / pf.contract) * 100) : 0}% of contract value`} />
              <Stat label="Invoiced" value={moneyCompact(pf.invoiced)} icon="send" caption="Issued to clients" />
              <Stat label="Received" value={moneyCompact(pf.received)} icon="banknote" tone="success" caption="Cash collected" />
              <Stat label="Receivables" value={moneyCompact(pf.receivable)} icon="hourglass" tone="warning" caption={`${receivables.length} open invoices`} onPress={() => router.push('/finance/invoices')} />
              <Stat label="Committed costs" value={moneyCompact(pf.committed)} icon="file-check" caption={`${pf.budget ? Math.round((pf.committed / pf.budget) * 100) : 0}% of budget`} />
              <Stat label="Actual costs" value={moneyCompact(pf.actual)} icon="receipt" caption="Invoiced or paid" />
              <Stat label="Forecast margin" value={`${pf.marginPct.toFixed(1)}%`} icon="percent" tone={pf.marginPct >= 35 ? 'success' : 'warning'} caption={moneyCompact(pf.margin)} onPress={() => router.push('/report/profitability')} />
            </StatGrid>
          </Section>

          <Section title="Cost control" subtitle="How budget, commitments, actuals and pending payments relate">
            <Card padding="lg">
              <BudgetExplainer budget={pf.budget} committed={pf.committed} actual={pf.actual} pending={pf.pending} />
            </Card>
          </Section>

          <Section title="Revenue and costs" subtitle={`Q1 2027: ${moneyCompact(q1Rev)} revenue · ${q1Rev ? Math.round(((q1Rev - q1Cost) / q1Rev) * 100) : 0}% margin`} action="Report" onAction={() => router.push('/report/revenue')}>
            <Card padding="md" style={{ gap: 12 }}>
              <BarChart
                labels={months.map((m) => m.month)}
                series={[
                  { name: 'Revenue', color: colors.chart[0], values: months.map((m) => m.revenue) },
                  { name: 'Costs', color: colors.chart[3], values: months.map((m) => m.costs) },
                ]}
                format={moneyCompact}
                height={190}
              />
              <Legend
                items={[
                  { label: 'Revenue recognised', color: colors.chart[0] },
                  { label: 'Programme costs', color: colors.chart[3] },
                ]}
              />
              <Text variant="caption" tone="tertiary">
                Tap a month to see values. Oct 2026 – Mar 2027, portfolio-wide.
              </Text>
            </Card>
          </Section>

          <Section title="Where the money goes" subtitle="Committed costs by category">
            <Card padding="lg">
              {catSum ? <DonutChart data={catTotals.filter((c) => c.value > 0)} centerValue={moneyCompact(catSum)} centerLabel="committed" format={moneyCompact} size={132} stroke={16} /> : <Text tone="secondary">No commitments yet for this scope.</Text>}
            </Card>
          </Section>

          <Section title="Profitability by programme" subtitle="Forecast gross margin · target 35%" action="Ranking" onAction={() => router.push('/report/profitability')}>
            <Card padding="lg">
              <HBarList
                items={profit.map((p) => ({ label: p.label, value: Math.max(0, p.pct), detail: moneyCompact(p.margin), color: p.pct >= 35 ? colors.chart[1] : p.pct >= 25 ? colors.chart[0] : colors.chart[2], onPress: () => router.push(`/programme/${p.id}/finance`) }))}
                format={(n) => `${n.toFixed(1)}%`}
                max={60}
                threshold={35}
              />
            </Card>
          </Section>

          <Section title="Outstanding receivables" subtitle={`${money(pf.receivable)} owed by clients`} action="Revenue" onAction={() => router.push('/finance/invoices')}>
            {receivables.length ? (
              <ListGroup>
                {receivables.slice(0, 4).map((i) => (
                  <InvoiceRow key={i.id} invoice={i} onPress={() => router.push('/finance/invoices')} />
                ))}
              </ListGroup>
            ) : (
              <Card>
                <Text tone="secondary">No outstanding receivables in this scope.</Text>
              </Card>
            )}
          </Section>

          <Section title="Needs attention" subtitle="Awaiting approval, submitted or overdue" action="All" onAction={() => router.push('/finance/transactions')}>
            {attention.length ? (
              <ListGroup>
                {attention.slice(0, 5).map((t) => (
                  <TransactionRow key={t.id} tx={t} />
                ))}
              </ListGroup>
            ) : (
              <Card>
                <Text tone="secondary">Nothing waiting. All transactions are up to date.</Text>
              </Card>
            )}
          </Section>

          <Section title="Workspace">
            <ListGroup>
              <ListRow icon="list" title="Transactions" subtitle="POs, invoices, payment requests, expenses" value={`${db.transactions.length}`} onPress={() => router.push('/finance/transactions')} />
              <ListRow icon="landmark" iconTone="success" title="Invoices & revenue" subtitle="Recognition, invoices, receivables" value={`${db.clientInvoices.length}`} onPress={() => router.push('/finance/invoices')} />
              <ListRow icon="stamp" iconTone="warning" title="Approvals" subtitle={myApprovals ? `${myApprovals} waiting for you` : `${pendingApprovalsTotal} pending across the team`} onPress={() => router.push('/approvals')} />
              <ListRow icon="receipt" iconTone="violet" title="Record expense" subtitle="Snap a receipt — ProgrammeOS fills the rest" onPress={() => router.push('/expense/new')} />
              <ListRow icon="chart-column" iconTone="info" title="Budget vs actual report" onPress={() => router.push('/report/budget')} />
            </ListGroup>
          </Section>
          <View>
            <IllustrativeNote />
          </View>
        </LoadGate>
      </RequireAccess>
    </Screen>
  );
}
