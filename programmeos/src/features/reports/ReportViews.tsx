import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { BarChart, Card, DonutChart, Gauge, HBarList, Icon, Legend, LineChart, ListGroup, ListRow, Section, Stat, StatGrid, StatusPill, Text, Touchable, toneColors } from '@/components';
import type { ReadinessCategoryKey } from '@/data/models';
import { getFaculty, getLearner, getProgramme, isAtRisk, learnerName, programmeFinance, programmePhase, readinessFor, READINESS_LABELS } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { countdown, DEMO_TODAY, formatDate } from '@/utils/dates';
import { money, moneyCompact } from '@/utils/format';

import { CATEGORY_SHORT, categoryColors } from '../finance/components';
import { READINESS_ICON, readinessTone } from '../shared/helpers';
import { deliveredInPeriod, forwardBook, monthlySeries, npsFrom, PERIODS, portfolioInPeriod, RATING_DISTRIBUTION, shortName, trendLabels, utilisationFor, wave, type PeriodKey } from './data';
import type { ReportKey } from './registry';

type P = { period: PeriodKey };

function ChartCard({ title, subtitle, action, onAction, children, first }: { title: string; subtitle?: string; action?: string; onAction?: () => void; children: ReactNode; first?: boolean }) {
  return (
    <Section title={title} subtitle={subtitle} action={action} onAction={onAction} first={first}>
      <Card padding="lg" style={{ gap: 14 }}>
        {children}
      </Card>
    </Section>
  );
}

function Insights({ items }: { items: string[] }) {
  return (
    <Section title="What stands out">
      <Card padding="lg" style={{ gap: 12 }}>
        {items.map((t, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
            <Icon name="sparkle" size={16} tone="violet" />
            <Text variant="callout" style={{ flex: 1 }}>
              {t}
            </Text>
          </View>
        ))}
      </Card>
    </Section>
  );
}

const pct = (n: number, d = 0) => `${n.toFixed(d)}%`;
const sum = <T,>(xs: T[], f: (x: T) => number) => xs.reduce((s, x) => s + f(x), 0);

// ─── 1. Executive overview ────────────────────────────────────────────────────

function Executive({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const months = monthlySeries(period);
  const rev = sum(months, (m) => m.revenue);
  const cost = sum(months, (m) => m.costs);
  const plan = sum(months, (m) => m.plan);
  const delivered = deliveredInPeriod(db, period);
  const pax = sum(delivered, (d) => d.participants);
  const rated = delivered.filter((d) => d.satisfaction != null);
  const sat = sum(rated, (d) => d.satisfaction! * d.participants) / Math.max(1, sum(rated, (d) => d.participants));
  const nps = Math.round(sum(rated, (d) => (d.nps ?? 0) * d.participants) / Math.max(1, sum(rated, (d) => d.participants)));
  const forward = forwardBook(db);
  const phases = [
    { label: 'In delivery', value: db.programmes.filter((p) => programmePhase(p) === 'in_delivery').length, color: colors.chart[4] },
    { label: 'Upcoming', value: db.programmes.filter((p) => programmePhase(p) === 'upcoming').length, color: colors.chart[0] },
    { label: 'Completed', value: db.programmes.filter((p) => programmePhase(p) === 'completed').length, color: colors.chart[1] },
    { label: 'Archived', value: db.programmes.filter((p) => programmePhase(p) === 'archived').length, color: colors.chart[6] },
    { label: 'Cancelled', value: db.programmes.filter((p) => programmePhase(p) === 'cancelled').length, color: colors.chart[3] },
  ].filter((x) => x.value);
  const atRisk = db.programmes.filter((p) => !p.archived && !p.cancelled && isAtRisk(db, p));
  const avgReady = forward.length ? sum(forward, (f) => readinessFor(db, f.id!).overall) / forward.length : 0;
  const topNps = [...rated].sort((a, b) => (b.nps ?? 0) - (a.nps ?? 0))[0];
  const nearest = atRisk.filter((p) => programmePhase(p) === 'upcoming').sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const nearestR = nearest ? readinessFor(db, nearest.id) : null;
  const weakest = nearestR ? [...nearestR.categories].filter((c) => c.applicable).sort((a, b) => a.percent - b.percent).slice(0, 2).map((c) => c.label.toLowerCase()) : [];
  return (
    <>
      <Section title="Headline" first>
        <StatGrid>
          <Stat label="Revenue recognised" value={moneyCompact(rev)} icon="trending-up" trend={{ dir: rev >= plan ? 'up' : 'down', text: `${rev >= plan ? '+' : '−'}${moneyCompact(Math.abs(rev - plan))} vs plan`, good: rev >= plan }} />
          <Stat label="Gross margin" value={pct(((rev - cost) / Math.max(1, rev)) * 100, 1)} icon="percent" tone="success" caption={moneyCompact(rev - cost)} />
          <Stat label="Delivered" value={String(delivered.length)} icon="layers" caption={`${delivered.filter((d) => d.phase === 'in_delivery').length} still running`} />
          <Stat label="Participants" value={String(pax)} icon="graduation-cap" caption="This period" />
          <Stat label="Satisfaction" value={`${sat.toFixed(2)} / 5`} icon="star" tone="warning" caption={`${rated.length} evaluated programmes`} />
          <Stat label="Net Promoter Score" value={String(nps)} icon="smile" tone="accent" caption="Participant weighted" />
        </StatGrid>
      </Section>
      <ChartCard title="Revenue trend" subtitle="Recognised revenue against plan" action="Details" onAction={() => router.push('/report/revenue')}>
        <LineChart
          labels={months.map((m) => m.month)}
          series={[
            { name: 'Revenue', color: colors.chart[0], values: months.map((m) => m.revenue) },
            { name: 'Plan', color: colors.textTertiary, values: months.map((m) => m.plan), dashed: true },
          ]}
          format={moneyCompact}
        />
        <Legend items={[{ label: 'Revenue', color: colors.chart[0] }, { label: 'Plan', color: colors.textTertiary, dashed: true }]} />
      </ChartCard>
      <ChartCard title="Portfolio status" subtitle="All programmes, as at 29 Mar 2027" action="Portfolio" onAction={() => router.push('/report/portfolio')}>
        <DonutChart data={phases} centerValue={String(db.programmes.length)} centerLabel="programmes" size={124} stroke={15} />
      </ChartCard>
      <Section title="Forward book" subtitle={`${forward.length} programmes · ${moneyCompact(sum(forward, (f) => f.contract))} contracted · avg readiness ${Math.round(avgReady)}%`}>
        <ListGroup>
          {atRisk.map((p) => (
            <ListRow key={p.id} icon="triangle-alert" iconTone="warning" title={p.name} subtitle={programmePhase(p) === 'upcoming' ? `${Math.round(readinessFor(db, p.id).overall)}% ready · ${countdown(p.startDate)}` : `Financial status: ${p.status.financial}`} onPress={() => router.push(`/programme/${p.id}`)} />
          ))}
        </ListGroup>
      </Section>
      <Insights
        items={[
          `Revenue is ${rev >= plan ? 'ahead of' : 'behind'} plan by ${moneyCompact(Math.abs(rev - plan))} for ${PERIODS[period].label}.`,
          nearest && nearestR ? `${atRisk.length} programmes need attention — ${nearest.shortName} is the nearest risk (${countdown(nearest.startDate).toLowerCase()}, ${Math.round(nearestR.overall)}% ready; ${weakest.join(' and ')} lag).` : `${atRisk.length} programmes need attention.`,
          topNps ? `Satisfaction averages ${sat.toFixed(1)}/5; ${topNps.name} led with NPS ${topNps.nps}.` : `Satisfaction averages ${sat.toFixed(1)}/5.`,
        ]}
      />
    </>
  );
}

// ─── 2. Portfolio ─────────────────────────────────────────────────────────────

function Portfolio({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const items = portfolioInPeriod(db, period);
  const modes = (['In-person', 'Hybrid', 'Virtual'] as const).map((m, i) => ({ label: m, value: sum(items.filter((x) => x.mode === m), (x) => x.contract), color: colors.chart[i] }));
  const types = Array.from(new Set(items.map((x) => x.type))).map((t) => ({ label: t, value: items.filter((x) => x.type === t).length, detail: moneyCompact(sum(items.filter((x) => x.type === t), (x) => x.contract)), color: colors.chart[4] })).sort((a, b) => b.value - a.value);
  const clients = Array.from(new Set(items.map((x) => x.client))).map((c) => ({ label: c, value: sum(items.filter((x) => x.client === c), (x) => x.contract), detail: `${items.filter((x) => x.client === c).length} prog.`, color: colors.chart[0] })).sort((a, b) => b.value - a.value);
  return (
    <>
      <Section title="Scope" first>
        <StatGrid>
          <Stat label="Programmes" value={String(items.length)} icon="layers" caption={`${items.filter((i) => i.phase === 'upcoming').length} in forward book`} />
          <Stat label="Contract value" value={moneyCompact(sum(items, (i) => i.contract))} icon="file-signature" />
        </StatGrid>
      </Section>
      <ChartCard title="By delivery mode" subtitle="Share of contract value">
        <DonutChart data={modes.filter((m) => m.value)} centerValue={moneyCompact(sum(modes, (m) => m.value))} centerLabel="contracted" format={moneyCompact} size={124} stroke={15} />
      </ChartCard>
      <ChartCard title="By programme type" subtitle="Number of programmes">
        <HBarList items={types} format={(n) => String(n)} />
      </ChartCard>
      <ChartCard title="By client" subtitle="Contract value">
        <HBarList items={clients} format={moneyCompact} />
      </ChartCard>
      <Section title="Programmes">
        <ListGroup>
          {items.map((x) => (
            <ListRow key={x.name} title={x.name} subtitle={`${x.client} · ${x.mode} · ${x.phase === 'upcoming' ? 'Upcoming' : x.phase === 'in_delivery' ? 'In delivery' : 'Completed'}`} meta={formatDate(x.start)} value={moneyCompact(x.contract)} onPress={x.id ? () => router.push(`/programme/${x.id}`) : undefined} />
          ))}
        </ListGroup>
      </Section>
    </>
  );
}

// ─── 3. Performance ───────────────────────────────────────────────────────────

function Performance({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const rated = deliveredInPeriod(db, period).filter((d) => d.satisfaction != null);
  const avg = sum(rated, (d) => d.satisfaction!) / Math.max(1, rated.length);
  const nps = Math.round(sum(rated, (d) => d.nps ?? 0) / Math.max(1, rated.length));
  const best = [...rated].sort((a, b) => b.satisfaction! - a.satisfaction!)[0];
  return (
    <>
      <ChartCard title="Average satisfaction" subtitle={`${rated.length} evaluated programmes`} first>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
          <Gauge value={avg} max={5} size={170} color={colors.chart[2]} valueLabel={avg.toFixed(2)} label="out of 5" />
          <View style={{ gap: 10 }}>
            <View>
              <Text variant="caption" tone="secondary">
                Average NPS
              </Text>
              <Text variant="metric">{nps}</Text>
            </View>
            <View>
              <Text variant="caption" tone="secondary">
                Top rated
              </Text>
              <Text variant="headline" numberOfLines={2} style={{ maxWidth: 140 }}>
                {best?.short ?? '—'}
              </Text>
            </View>
          </View>
        </View>
      </ChartCard>
      <ChartCard title="Satisfaction by programme" subtitle="Average evaluation score (out of 5)">
        <HBarList items={rated.map((d) => ({ label: shortName(d.name, 28), value: d.satisfaction!, color: d.satisfaction! >= 4.6 ? colors.chart[1] : d.satisfaction! >= 4.4 ? colors.chart[0] : colors.chart[2], onPress: d.id ? () => router.push(`/programme/${d.id}`) : undefined }))} format={(n) => n.toFixed(1)} max={5} />
      </ChartCard>
      <ChartCard title="Net Promoter Score" subtitle="Promoters minus detractors">
        <BarChart labels={rated.map((d) => d.short)} series={[{ name: 'NPS', color: colors.chart[4], values: rated.map((d) => d.nps ?? 0) }]} format={(n) => String(n)} height={170} targetLine={{ value: 50, label: 'Target 50' }} />
      </ChartCard>
      <Section title="Completion and attendance">
        <ListGroup>
          {rated.map((d) => (
            <ListRow key={d.name} title={d.name} subtitle={`${d.participants} participants · ${d.phase === 'in_delivery' ? 'in delivery' : `${Math.round((d.completed / Math.max(1, d.participants)) * 100)}% completed`}`} value={d.attendance ? `${Math.round(d.attendance)}% att.` : '—'} onPress={d.id ? () => router.push(`/programme/${d.id}`) : undefined} />
          ))}
        </ListGroup>
      </Section>
    </>
  );
}

// ─── 4. Readiness ─────────────────────────────────────────────────────────────

const HEAT_KEYS: ReadinessCategoryKey[] = ['faculty', 'materials', 'hotel', 'participants', 'travel', 'venue', 'equipment', 'client', 'finance'];

function Readiness({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const upcoming = db.programmes.filter((p) => programmePhase(p) === 'upcoming').sort((a, b) => a.startDate.localeCompare(b.startDate));
  const views = upcoming.map((p) => ({ p, r: readinessFor(db, p.id) }));
  const hist = deliveredInPeriod(db, period).filter((d) => d.readinessAtT14 != null);
  return (
    <>
      <ChartCard title="Forward book readiness" subtitle="Live, computed from bookings, contracts and registrations · Go threshold 90%" first>
        <HBarList
          items={views.map(({ p, r }) => ({ label: p.name, value: Math.round(r.overall), detail: countdown(p.startDate).replace('Starts in ', ''), color: toneColors(readinessTone(r.overall, r.threshold), colors).solid, onPress: () => router.push(`/programme/${p.id}/readiness`) }))}
          format={(n) => `${n}%`}
          max={100}
          threshold={90}
        />
      </ChartCard>
      <ChartCard title="Readiness heatmap" subtitle="Category status per programme">
        <View style={{ flexDirection: 'row', gap: 4, paddingLeft: 64 }}>
          {HEAT_KEYS.map((k) => (
            <View key={k} style={{ flex: 1, alignItems: 'center' }} accessibilityLabel={READINESS_LABELS[k]}>
              <Icon name={READINESS_ICON[k]} size={13} tone="tertiary" />
            </View>
          ))}
        </View>
        {views.map(({ p, r }) => (
          <Touchable key={p.id} onPress={() => router.push(`/programme/${p.id}/readiness`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityLabel={`${p.name} readiness by category`}>
            <Text variant="footnote" weight="medium" numberOfLines={1} style={{ width: 60 }}>
              {p.shortName}
            </Text>
            {HEAT_KEYS.map((k) => {
              const c = r.categories.find((x) => x.key === k);
              const na = !c || !c.applicable || c.total === 0;
              const tc = toneColors(na ? 'neutral' : readinessTone(c.percent, 100), colors);
              return (
                <View key={k} style={{ flex: 1, height: 26, borderRadius: 6, backgroundColor: na ? colors.surfaceAlt : tc.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="caption" color={na ? colors.textTertiary : tc.fg} style={{ fontSize: 9.5 }} tabular maxFontSizeMultiplier={1}>
                    {na ? '—' : Math.round(c.percent)}
                  </Text>
                </View>
              );
            })}
          </Touchable>
        ))}
        <Text variant="caption" tone="tertiary">
          Columns: faculty, materials, hotel, participants, travel, venue, equipment, client approval, finance. “—” means not applicable or nothing to measure yet.
        </Text>
      </ChartCard>
      <Section title="Go / No-Go checkpoints">
        <ListGroup>
          {views.map(({ p, r }) => (
            <ListRow
              key={p.id}
              title={p.name}
              subtitle={`Checkpoint ${formatDate(r.goNoGoDate, { year: false })} · ${r.criticalCount} critical · ${r.pendingCount} open`}
              trailing={<StatusPill label={r.decision ? (r.decision.outcome === 'go' ? 'Go recorded' : r.decision.outcome === 'no_go' ? 'No-Go' : 'Conditional') : r.recommendation === 'go' ? 'Go' : r.recommendation === 'conditional' ? 'Conditional' : 'No-Go'} tone={r.decision?.outcome === 'go' || r.recommendation === 'go' ? 'success' : r.recommendation === 'conditional' ? 'warning' : 'danger'} />}
              onPress={() => router.push(`/programme/${p.id}/readiness`)}
            />
          ))}
        </ListGroup>
      </Section>
      <ChartCard title="Readiness 14 days before start" subtitle={`Programmes delivered · ${PERIODS[period].label}`}>
        {hist.length ? <BarChart labels={hist.map((h) => h.short)} series={[{ name: 'Readiness at T-14', color: colors.chart[5], values: hist.map((h) => h.readinessAtT14!) }]} format={(n) => `${n}%`} targetLine={{ value: 90, label: '90% target' }} height={170} /> : <Text tone="secondary">No delivered programmes in this period.</Text>}
      </ChartCard>
    </>
  );
}

// ─── 5. Budget vs actual ──────────────────────────────────────────────────────

function Budget({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const ids = portfolioInPeriod(db, period).filter((x) => x.id).map((x) => x.id!);
  const rows = ids.map((id) => programmeFinance(db, id)).filter((f) => f.budget > 0);
  const totals = { budget: sum(rows, (r) => r.budget), committed: sum(rows, (r) => r.committed), actual: sum(rows, (r) => r.actual) };
  const over = rows.flatMap((r) => r.overLines.map((l) => ({ prog: r.programme, l })));
  return (
    <>
      <Section title="Totals" first>
        <StatGrid>
          <Stat label="Approved budget" value={moneyCompact(totals.budget)} icon="wallet" />
          <Stat label="Committed" value={moneyCompact(totals.committed)} icon="file-check" caption={pct((totals.committed / Math.max(1, totals.budget)) * 100)} />
          <Stat label="Actual" value={moneyCompact(totals.actual)} icon="receipt" caption={pct((totals.actual / Math.max(1, totals.budget)) * 100)} />
          <Stat label="Headroom" value={moneyCompact(totals.budget - totals.committed)} icon="scale" tone={totals.budget >= totals.committed ? 'success' : 'danger'} />
        </StatGrid>
      </Section>
      <ChartCard title="Budget, committed and actual" subtitle="Per programme · tap a group for values">
        <BarChart
          labels={rows.map((r) => r.programme.shortName)}
          series={[
            { name: 'Budget', color: colors.borderStrong, values: rows.map((r) => r.budget) },
            { name: 'Committed', color: colors.chart[0], values: rows.map((r) => r.committed) },
            { name: 'Actual', color: colors.chart[1], values: rows.map((r) => r.actual) },
          ]}
          format={moneyCompact}
          height={200}
        />
        <Legend items={[{ label: 'Budget', color: colors.borderStrong }, { label: 'Committed', color: colors.chart[0] }, { label: 'Actual', color: colors.chart[1] }]} />
      </ChartCard>
      <Section title="Variance by programme" subtitle="Budget minus committed">
        <ListGroup>
          {rows.map((r) => (
            <ListRow key={r.programme.id} title={r.programme.name} subtitle={`${pct((r.committed / Math.max(1, r.budget)) * 100)} committed · actual ${moneyCompact(r.actual)}`} trailing={<Text variant="callout" weight="semibold" tabular tone={r.variance >= 0 ? 'success' : 'danger'}>{`${r.variance >= 0 ? '+' : '−'}${moneyCompact(Math.abs(r.variance))}`}</Text>} onPress={() => router.push(`/programme/${r.programme.id}/finance`)} />
          ))}
        </ListGroup>
      </Section>
      {over.length ? (
        <Section title="Over-budget cost lines">
          <ListGroup>
            {over.map(({ prog, l }) => (
              <ListRow key={`${prog.id}-${l.category}`} icon="triangle-alert" iconTone="danger" title={`${prog.shortName} · ${l.category}`} subtitle={`Committed ${money(l.committed)} vs ${money(l.budget)} budget`} value={`+${moneyCompact(l.committed - l.budget)}`} onPress={() => router.push(`/programme/${prog.id}/finance`)} />
            ))}
          </ListGroup>
        </Section>
      ) : null}
    </>
  );
}

// ─── 6. Revenue and costs ─────────────────────────────────────────────────────

function Revenue({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const months = monthlySeries(period);
  const rev = sum(months, (m) => m.revenue);
  const cost = sum(months, (m) => m.costs);
  const plan = sum(months, (m) => m.plan);
  const delivered = deliveredInPeriod(db, period);
  const byClient = Array.from(new Set(delivered.map((d) => d.client))).map((c) => ({ label: c, value: sum(delivered.filter((d) => d.client === c), (d) => d.contract), color: colors.chart[0] })).sort((a, b) => b.value - a.value);
  const liveIds = delivered.filter((d) => d.id).map((d) => d.id!);
  const cats = (Object.keys(CATEGORY_SHORT) as (keyof typeof CATEGORY_SHORT)[]).map((c, i) => ({ label: c, value: sum(db.budgetLines.filter((l) => liveIds.includes(l.programmeId) && l.category === c), (l) => l.actual), color: categoryColors(colors)[i] })).filter((c) => c.value > 0);
  return (
    <>
      <Section title="Totals" first>
        <StatGrid>
          <Stat label="Revenue" value={moneyCompact(rev)} icon="trending-up" trend={{ dir: rev >= plan ? 'up' : 'down', text: `${pct((rev / Math.max(1, plan)) * 100)} of plan`, good: rev >= plan }} />
          <Stat label="Costs" value={moneyCompact(cost)} icon="receipt" />
          <Stat label="Gross profit" value={moneyCompact(rev - cost)} icon="piggy-bank" tone="success" />
          <Stat label="Margin" value={pct(((rev - cost) / Math.max(1, rev)) * 100, 1)} icon="percent" tone="success" />
        </StatGrid>
      </Section>
      <ChartCard title="Revenue and costs by month" subtitle="Tap a month for values">
        <BarChart labels={months.map((m) => m.month)} series={[{ name: 'Revenue', color: colors.chart[0], values: months.map((m) => m.revenue) }, { name: 'Costs', color: colors.chart[3], values: months.map((m) => m.costs) }]} format={moneyCompact} height={190} />
        <Legend items={[{ label: 'Revenue', color: colors.chart[0] }, { label: 'Costs', color: colors.chart[3] }]} />
      </ChartCard>
      <ChartCard title="Gross margin trend" subtitle="Monthly margin %">
        <LineChart labels={months.map((m) => m.month)} series={[{ name: 'Margin', color: colors.chart[1], values: months.map((m) => Math.round(((m.revenue - m.costs) / m.revenue) * 1000) / 10) }]} format={(n) => `${n}%`} yMax={50} />
      </ChartCard>
      <ChartCard title="Revenue by client" subtitle="Programmes delivered in period">
        <HBarList items={byClient} format={moneyCompact} />
      </ChartCard>
      {cats.length ? (
        <ChartCard title="Actual costs by category" subtitle="Live programmes in period">
          <DonutChart data={cats} centerValue={moneyCompact(sum(cats, (c) => c.value))} centerLabel="actual" format={moneyCompact} size={124} stroke={15} />
        </ChartCard>
      ) : null}
    </>
  );
}

// ─── 7. Profitability ─────────────────────────────────────────────────────────

function Profitability({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const items = portfolioInPeriod(db, period).filter((x) => x.contract > 0).sort((a, b) => b.marginPct - a.marginPct);
  const contract = sum(items, (x) => x.contract);
  const margin = sum(items, (x) => x.margin);
  const bands = [
    { label: '≥ 35% (target)', value: items.filter((x) => x.marginPct >= 35).length, color: colors.chart[1] },
    { label: '25–35%', value: items.filter((x) => x.marginPct >= 25 && x.marginPct < 35).length, color: colors.chart[0] },
    { label: '< 25%', value: items.filter((x) => x.marginPct < 25).length, color: colors.chart[2] },
  ].filter((b) => b.value);
  const clients = Array.from(new Set(items.map((x) => x.client))).map((c) => {
    const xs = items.filter((x) => x.client === c);
    return { label: c, value: (sum(xs, (x) => x.margin) / Math.max(1, sum(xs, (x) => x.contract))) * 100, detail: moneyCompact(sum(xs, (x) => x.margin)), color: colors.chart[4] };
  }).sort((a, b) => b.value - a.value);
  return (
    <>
      <Section title="Summary" first>
        <StatGrid>
          <Stat label="Portfolio margin" value={pct((margin / Math.max(1, contract)) * 100, 1)} icon="percent" tone="success" caption={moneyCompact(margin)} />
          <Stat label="Best" value={items[0] ? pct(items[0].marginPct, 1) : '—'} icon="trending-up" caption={items[0]?.short} />
          <Stat label="Lowest" value={items.at(-1) ? pct(items.at(-1)!.marginPct, 1) : '—'} icon="trending-down" tone="warning" caption={items.at(-1)?.short} />
          <Stat label="At or above target" value={`${items.filter((x) => x.marginPct >= 35).length}/${items.length}`} icon="target" />
        </StatGrid>
      </Section>
      <ChartCard title="Gross margin by programme" subtitle="Final for delivered, forecast for upcoming · target 35%">
        <HBarList
          items={items.map((x) => ({ label: `${shortName(x.name, 26)}${x.phase === 'upcoming' ? ' (fcst)' : ''}`, value: Math.max(0, x.marginPct), detail: moneyCompact(x.margin), color: x.marginPct >= 35 ? colors.chart[1] : x.marginPct >= 25 ? colors.chart[0] : colors.chart[2], onPress: x.id ? () => router.push(`/programme/${x.id}/finance`) : undefined }))}
          format={(n) => pct(n, 1)}
          max={60}
          threshold={35}
        />
      </ChartCard>
      <ChartCard title="Margin bands">
        <DonutChart data={bands} centerValue={String(items.length)} centerLabel="programmes" size={116} stroke={14} />
      </ChartCard>
      <ChartCard title="Margin by client">
        <HBarList items={clients} format={(n) => pct(n, 1)} max={60} threshold={35} />
      </ChartCard>
    </>
  );
}

// ─── 8. Faculty utilisation ───────────────────────────────────────────────────

function FacultyUtilisation({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const { from, to } = PERIODS[period];
  const rows = db.faculty.map((f, i) => ({ f, u: utilisationFor(f.utilisation, period, i) })).sort((a, b) => b.u - a.u);
  const days = db.faculty
    .map((f) => ({
      f,
      d: sum(
        db.facultyAssignments.filter((a) => {
          const p = getProgramme(db, a.programmeId);
          return a.facultyId === f.id && p && !p.cancelled && ['Confirmed', 'Contract Issued', 'Contracted'].includes(a.status) && p.startDate <= to && (p.endDate >= from || programmePhase(p) === 'upcoming');
        }),
        (a) => a.days,
      ),
    }))
    .filter((x) => x.d > 0)
    .sort((a, b) => b.d - a.d)
    .slice(0, 8);
  const avg = sum(rows, (r) => r.u) / rows.length;
  return (
    <>
      <Section title="Summary" first>
        <StatGrid>
          <Stat label="Average utilisation" value={pct(avg)} icon="gauge" />
          <Stat label="Over 85%" value={String(rows.filter((r) => r.u > 85).length)} icon="triangle-alert" tone="warning" caption="Risk of overload" />
          <Stat label="Capacity (< 50%)" value={String(rows.filter((r) => r.u < 50).length)} icon="user-plus" tone="success" caption="Available to assign" />
          <Stat label="Average rating" value={(sum(db.faculty, (f) => f.rating) / db.faculty.length).toFixed(2)} icon="star" caption="Participant evaluations" />
        </StatGrid>
      </Section>
      <ChartCard title="Utilisation by faculty" subtitle="Share of available teaching days · 85% overload line">
        <HBarList items={rows.map(({ f, u }) => ({ label: `${f.honorific} ${f.name}`, value: u, color: u > 85 ? colors.chart[3] : u >= 50 ? colors.chart[0] : colors.chart[6], onPress: () => router.push(`/faculty/${f.id}`) }))} format={(n) => pct(n)} max={100} threshold={85} />
      </ChartCard>
      <ChartCard title="Contracted teaching days" subtitle="Confirmed assignments in period and forward book">
        <BarChart labels={days.map((x) => x.f.initials)} series={[{ name: 'Days', color: colors.chart[4], values: days.map((x) => x.d) }]} format={(n) => `${n} days`} height={170} />
        <Text variant="caption" tone="tertiary">
          {days.map((x) => `${x.f.initials} ${x.f.name}`).join(' · ')}
        </Text>
      </ChartCard>
      <Section title="Experience">
        <ListGroup>
          {[...db.faculty].sort((a, b) => b.rating - a.rating).slice(0, 6).map((f) => (
            <ListRow key={f.id} title={`${f.honorific} ${f.name}`} subtitle={`${f.sessionsDelivered} sessions delivered · ${f.expertise.slice(0, 2).join(', ')}`} value={`★ ${f.rating.toFixed(1)}`} onPress={() => router.push(`/faculty/${f.id}`)} />
          ))}
        </ListGroup>
      </Section>
    </>
  );
}

// ─── 9. Learner participation ─────────────────────────────────────────────────

function Participation({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const items = portfolioInPeriod(db, period);
  const liveIds = items.filter((x) => x.id).map((x) => x.id!);
  const hist = items.filter((x) => !x.id);
  const ens = db.enrollments.filter((e) => liveIds.includes(e.programmeId));
  const hp = sum(hist, (h) => h.participants);
  const hc = sum(hist, (h) => h.completed);
  const stages = [
    { label: 'Nominated', value: ens.length + hp },
    { label: 'Invited', value: ens.filter((e) => e.status !== 'Nominated').length + hp },
    { label: 'Registered', value: ens.filter((e) => ['Registered', 'Confirmed', 'Attending', 'Completed'].includes(e.status)).length + hp },
    { label: 'Attending', value: ens.filter((e) => ['Attending', 'Completed'].includes(e.status)).length + hp },
    { label: 'Completed', value: ens.filter((e) => e.status === 'Completed').length + hc },
  ];
  const top = stages[0].value || 1;
  const byClient = Array.from(new Set(items.map((x) => x.client))).map((c) => ({ label: c, value: sum(items.filter((x) => x.client === c), (x) => (x.id ? db.enrollments.filter((e) => e.programmeId === x.id && e.status !== 'Withdrawn').length : x.participants)), color: colors.chart[5] })).sort((a, b) => b.value - a.value);
  const counts = new Map<string, number>();
  db.enrollments.forEach((e) => counts.set(e.learnerId, (counts.get(e.learnerId) ?? 0) + 1));
  const repeat = [...counts.entries()].filter(([, n]) => n > 1);
  return (
    <>
      <ChartCard title="Participation funnel" subtitle="From nomination to completion" first>
        <View style={{ gap: 10 }}>
          {stages.map((s, i) => (
            <View key={s.label} style={{ gap: 4 }} accessibilityLabel={`${s.label}: ${s.value}`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="callout">{s.label}</Text>
                <Text variant="callout" weight="semibold" tabular>
                  {s.value}
                  {i ? <Text variant="footnote" tone="tertiary">{`  ${Math.round((s.value / Math.max(1, stages[i - 1].value)) * 100)}%`}</Text> : null}
                </Text>
              </View>
              <View style={{ height: 22, borderRadius: 6, backgroundColor: colors.chartTrack, overflow: 'hidden', alignItems: 'center' }}>
                <View style={{ width: `${(s.value / top) * 100}%`, height: 22, borderRadius: 6, backgroundColor: colors.chart[i % 2 ? 4 : 0], opacity: 1 - i * 0.1 }} />
              </View>
            </View>
          ))}
        </View>
        <Text variant="caption" tone="tertiary">
          Percentages show conversion from the previous stage. Includes the forward book.
        </Text>
      </ChartCard>
      <ChartCard title="Participants by client">
        <HBarList items={byClient} format={(n) => String(n)} />
      </ChartCard>
      <Section title="Learning journeys" subtitle={`${repeat.length} learners on more than one programme`}>
        <ListGroup>
          {repeat.slice(0, 6).map(([id, n]) => {
            const l = getLearner(db, id);
            return <ListRow key={id} title={learnerName(l)} subtitle={`${l?.jobTitle} · ${l?.organisation}`} value={`${n} programmes`} onPress={() => router.push(`/learner/${id}`)} />;
          })}
        </ListGroup>
      </Section>
      <Section title="Requirements captured">
        <StatGrid>
          <Stat label="Dietary requirements" value={String(db.learners.filter((l) => l.dietary).length)} icon="salad" />
          <Stat label="Accessibility needs" value={String(db.learners.filter((l) => l.accessibility).length)} icon="accessibility" />
        </StatGrid>
      </Section>
    </>
  );
}

// ─── 10. Attendance ───────────────────────────────────────────────────────────

function Attendance({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const delivered = deliveredInPeriod(db, period).filter((d) => d.attendance > 0);
  const avg = sum(delivered, (d) => d.attendance * d.participants) / Math.max(1, sum(delivered, (d) => d.participants));
  const labels = trendLabels(period);
  const trend = wave(period, 91, 3.2, 2);
  const liveIds = delivered.filter((d) => d.id).map((d) => d.id!);
  const low = db.enrollments.filter((e) => liveIds.includes(e.programmeId) && e.attendanceRate != null && e.attendanceRate < 85 && e.status !== 'Withdrawn');
  return (
    <>
      <Section title="Summary" first>
        <StatGrid>
          <Stat label="Average attendance" value={pct(avg, 1)} icon="user-check" tone={avg >= 90 ? 'success' : 'warning'} />
          <Stat label="Learners below 85%" value={String(low.length)} icon="circle-alert" tone="warning" caption="Live programmes" />
        </StatGrid>
      </Section>
      <ChartCard title="Attendance trend" subtitle={period === 'q1' ? 'Weekly · Q1 2027' : 'Monthly'}>
        <LineChart labels={labels} series={[{ name: 'Attendance', color: colors.chart[5], values: trend }, { name: 'Target', color: colors.textTertiary, values: labels.map(() => 90), dashed: true }]} format={(n) => `${n}%`} yMax={100} />
        <Legend items={[{ label: 'Attendance rate', color: colors.chart[5] }, { label: '90% target', color: colors.textTertiary, dashed: true }]} />
      </ChartCard>
      <ChartCard title="By programme">
        <HBarList items={delivered.map((d) => ({ label: shortName(d.name, 28), value: Math.round(d.attendance), color: d.attendance >= 90 ? colors.chart[1] : d.attendance >= 85 ? colors.chart[0] : colors.chart[2], onPress: d.id ? () => router.push(`/programme/${d.id}/participants`) : undefined }))} format={(n) => `${n}%`} max={100} threshold={85} />
      </ChartCard>
      <Section title="Learners to support" subtitle="Attendance below 85%">
        {low.length ? (
          <ListGroup>
            {low.map((e) => {
              const l = getLearner(db, e.learnerId);
              return <ListRow key={e.id} title={learnerName(l)} subtitle={`${getProgramme(db, e.programmeId)?.shortName} · ${l?.organisation}`} value={`${e.attendanceRate}%`} onPress={() => router.push(`/learner/${e.learnerId}`)} />;
            })}
          </ListGroup>
        ) : (
          <Card>
            <Text tone="secondary">Everyone is above 85% this period.</Text>
          </Card>
        )}
      </Section>
    </>
  );
}

// ─── 11. Evaluations ──────────────────────────────────────────────────────────

function Evaluations({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const dist = RATING_DISTRIBUTION[period];
  const total = sum(dist, (n) => n);
  const nps = npsFrom(dist);
  const avg = (dist[0] * 5 + dist[1] * 4 + dist[2] * 3 + dist[3] * 2 + dist[4]) / Math.max(1, total);
  const { from, to } = PERIODS[period];
  const comments = db.facultyFeedback.filter((f) => f.date >= from && f.date <= to).sort((a, b) => b.date.localeCompare(a.date));
  const rated = deliveredInPeriod(db, period).filter((d) => d.satisfaction != null);
  return (
    <>
      <ChartCard title="Net Promoter Score" subtitle={`${total} responses`} first>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
          <Gauge value={nps + 100} max={200} size={170} color={nps >= 50 ? colors.chart[1] : colors.chart[0]} valueLabel={`${nps > 0 ? '+' : ''}${nps}`} label="NPS (−100 to +100)" />
          <View style={{ gap: 2 }}>
            <Text variant="caption" tone="secondary">
              Average rating
            </Text>
            <Text variant="metric">{avg.toFixed(2)}</Text>
            <Text variant="caption" tone="tertiary">
              out of 5
            </Text>
          </View>
        </View>
      </ChartCard>
      <ChartCard title="Ratings distribution">
        <HBarList items={dist.map((n, i) => ({ label: `${'★'.repeat(5 - i)}${'☆'.repeat(i)}`, value: n, detail: pct((n / Math.max(1, total)) * 100), color: i === 0 ? colors.chart[1] : i === 1 ? colors.chart[0] : i === 2 ? colors.chart[2] : colors.chart[3] }))} format={(n) => String(n)} />
      </ChartCard>
      <ChartCard title="Satisfaction by programme">
        <HBarList items={rated.map((d) => ({ label: shortName(d.name, 28), value: d.satisfaction!, color: colors.chart[2], onPress: d.id ? () => router.push(`/programme/${d.id}`) : undefined }))} format={(n) => n.toFixed(1)} max={5} />
      </ChartCard>
      <Section title="What participants and clients said" subtitle={comments.length ? `${comments.length} highlighted comments` : undefined}>
        {comments.length ? (
          <View style={{ gap: 10 }}>
            {comments.map((c) => {
              const f = getFaculty(db, c.facultyId);
              return (
                <Card key={c.id} padding="lg" style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="star" size={13} color={i < Math.round(c.rating) ? colors.warning : colors.chartTrack} fill={i < Math.round(c.rating) ? colors.warning : colors.chartTrack} />
                    ))}
                  </View>
                  <Text variant="callout">“{c.comment}”</Text>
                  <Text variant="footnote" tone="tertiary">
                    {c.author} · {getProgramme(db, c.programmeId)?.shortName} · on {f ? `${f.honorific} ${f.name}` : 'faculty'} · {formatDate(c.date, { year: false })}
                  </Text>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card>
            <Text tone="secondary">No written comments recorded for this period.</Text>
          </Card>
        )}
      </Section>
    </>
  );
}

// ─── 12. Operational performance ──────────────────────────────────────────────

function Operations({ period }: P) {
  const db = useDB();
  const { colors } = useTheme();
  const done = db.tasks.filter((t) => t.status === 'Done' && t.completedOn);
  const onTimeLive = done.length ? (done.filter((t) => t.completedOn! <= t.dueDate).length / done.length) * 100 : 100;
  const onTime = period === 'q1' ? onTimeLive : period === 'ytd' ? 91 : 88;
  const open = db.tasks.filter((t) => t.status !== 'Done');
  const overdue = open.filter((t) => t.dueDate < DEMO_TODAY);
  const labels = trendLabels(period);
  const overdueTrend = wave(period, 6, 2.4, 1, period === 'q1' ? 0.15 : 0).map((n) => Math.max(1, Math.round(n)));
  const lead = wave(period, 31, 6, 3).map((n) => Math.round(n));
  const t14 = deliveredInPeriod(db, period).filter((d) => d.readinessAtT14 != null);
  const avgT14 = sum(t14, (d) => d.readinessAtT14!) / Math.max(1, t14.length);
  const cats = Array.from(new Set(open.map((t) => t.category))).map((c) => ({ label: c, value: open.filter((t) => t.category === c).length, detail: `${open.filter((t) => t.category === c && t.dueDate < DEMO_TODAY).length} overdue`, color: colors.chart[0] })).sort((a, b) => b.value - a.value);
  return (
    <>
      <Section title="Summary" first>
        <StatGrid>
          <Stat label="Tasks on time" value={pct(onTime)} icon="circle-check" tone="success" />
          <Stat label="Overdue now" value={String(overdue.length)} icon="circle-alert" tone="danger" caption={`${open.length} open tasks`} onPress={() => router.push('/tasks')} />
          <Stat label="Readiness at T-14" value={pct(avgT14)} icon="gauge" tone={avgT14 >= 90 ? 'success' : 'warning'} caption="Target 90%" />
          <Stat label="Booking lead time" value={`${Math.round(sum(lead, (n) => n) / lead.length)} days`} icon="calendar-clock" caption="Booking to check-in" />
        </StatGrid>
      </Section>
      <ChartCard title="Tasks on time" subtitle="Completed on or before due date">
        <View style={{ alignItems: 'center' }}>
          <Gauge value={onTime} max={100} size={180} color={onTime >= 90 ? colors.chart[1] : colors.chart[2]} valueLabel={pct(onTime)} label="on time" />
        </View>
      </ChartCard>
      <ChartCard title="Overdue tasks" subtitle={period === 'q1' ? 'Weekly snapshot' : 'Monthly average'}>
        <LineChart labels={labels} series={[{ name: 'Overdue', color: colors.chart[3], values: overdueTrend }]} format={(n) => `${n} tasks`} />
      </ChartCard>
      <ChartCard title="Hotel booking lead time" subtitle="Average days between booking and check-in">
        <BarChart labels={labels} series={[{ name: 'Lead time', color: colors.chart[5], values: lead }]} format={(n) => `${n} days`} targetLine={{ value: 28, label: 'Min 28 days' }} height={170} />
      </ChartCard>
      <ChartCard title="Open tasks by area" action="Tasks" onAction={() => router.push('/tasks')}>
        <HBarList items={cats} format={(n) => String(n)} />
      </ChartCard>
      <Section title="Approvals">
        <StatGrid>
          <Stat label="Average cycle time" value={period === 'q1' ? '2.4 days' : period === 'ytd' ? '2.8 days' : '3.1 days'} icon="timer" caption="Request to decision" />
          <Stat label="Pending now" value={String(db.approvals.filter((a) => a.status === 'Pending').length)} icon="stamp" onPress={() => router.push('/approvals')} />
        </StatGrid>
      </Section>
    </>
  );
}

export const REPORT_VIEWS: Record<ReportKey, (p: P) => ReactNode> = {
  executive: Executive,
  portfolio: Portfolio,
  performance: Performance,
  readiness: Readiness,
  budget: Budget,
  revenue: Revenue,
  profitability: Profitability,
  'faculty-utilisation': FacultyUtilisation,
  participation: Participation,
  attendance: Attendance,
  evaluations: Evaluations,
  operations: Operations,
};
