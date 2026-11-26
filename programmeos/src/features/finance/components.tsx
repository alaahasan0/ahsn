import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Icon, IconTile, Monogram, ProgressBar, SegmentBar, StatusPill, Text, Touchable, type IconName } from '@/components';
import type { ClientInvoice, CostCategory, Transaction, TransactionKind } from '@/data/models';
import { getClient, getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme, type ColorTokens } from '@/theme';
import { DEMO_TODAY, diffDays, dueLabel, formatDate } from '@/utils/dates';
import { money, moneyCompact } from '@/utils/format';

export const KIND_ICON: Record<TransactionKind, IconName> = {
  'Purchase Request': 'file-plus',
  'Purchase Order': 'file-check',
  'Supplier Invoice': 'receipt',
  'Faculty Invoice': 'file-signature',
  'Payment Request': 'hand-coins',
  Expense: 'credit-card',
};

export const KIND_TONE: Record<TransactionKind, 'accent' | 'violet' | 'info' | 'warning' | 'success' | 'neutral'> = {
  'Purchase Request': 'neutral',
  'Purchase Order': 'accent',
  'Supplier Invoice': 'info',
  'Faculty Invoice': 'violet',
  'Payment Request': 'warning',
  Expense: 'success',
};

export const CATEGORY_ICON: Record<CostCategory, IconName> = {
  'Faculty Fees': 'users',
  Hotel: 'bed-double',
  Travel: 'plane',
  Transportation: 'bus',
  'Venue Rental': 'building-2',
  Catering: 'utensils-crossed',
  'Learning Materials': 'book-open',
  'External Services': 'briefcase',
  Other: 'package',
};

export const CATEGORY_SHORT: Record<CostCategory, string> = {
  'Faculty Fees': 'Faculty',
  Hotel: 'Hotel',
  Travel: 'Travel',
  Transportation: 'Transp.',
  'Venue Rental': 'Venue',
  Catering: 'Catering',
  'Learning Materials': 'Materials',
  'External Services': 'Services',
  Other: 'Other',
};

/** Nine distinguishable colours for the nine cost categories, derived from theme tokens. */
export function categoryColors(c: ColorTokens): string[] {
  return [c.chart[0], c.chart[1], c.chart[2], c.chart[3], c.chart[4], c.chart[5], c.accentText, c.successText, c.chart[6]];
}

// ─── Budget · Committed · Actual · Pending explainer ─────────────────────────

/**
 * The one visual that separates the four numbers people confuse:
 * budget (ceiling) ⊇ committed (signed POs / contracts) ⊇ actual (invoiced spend),
 * plus pending payments (approved, not yet paid).
 */
export function BudgetExplainer({ budget, committed, actual, pending, compact }: { budget: number; committed: number; actual: number; pending: number; compact?: boolean }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const over = Math.max(0, committed - budget);
  const scale = Math.max(budget, committed, 1);
  const segs = [
    { value: Math.min(actual, committed), color: colors.chart[0] },
    { value: Math.max(0, Math.min(committed, budget) - actual), color: colors.chart[5] },
    { value: Math.max(0, budget - committed), color: colors.chartTrack },
    { value: over, color: colors.danger },
  ];
  const pct = (n: number) => `${Math.round((n / Math.max(budget, 1)) * 100)}%`;
  const rows: { label: string; value: number; color: string; hint: string; border?: boolean }[] = [
    { label: 'Budget', value: budget, color: colors.chartTrack, hint: 'Approved spending ceiling', border: true },
    { label: 'Committed', value: committed, color: colors.chart[5], hint: 'signed POs, contracts and bookings' },
    { label: 'Actual', value: actual, color: colors.chart[0], hint: 'invoiced or paid to date' },
    { label: 'Pending payments', value: pending, color: colors.warning, hint: 'approved, awaiting payment run' },
  ];
  return (
    <View style={{ gap: compact ? 10 : 14 }}>
      <View>
        <SegmentBar segments={segs} height={14} total={scale} />
        {pending > 0 ? (
          <View style={[s.pendingMark, { left: `${Math.min(99, ((actual + pending) / scale) * 100)}%`, backgroundColor: colors.warning }]} />
        ) : null}
        <View style={s.scaleRow}>
          <Text variant="caption" tone="tertiary">
            $0
          </Text>
          {over > 0 ? (
            <Text variant="caption" tone="danger" weight="semibold">
              {moneyCompact(over)} over budget
            </Text>
          ) : (
            <Text variant="caption" tone="tertiary">
              {moneyCompact(budget - committed)} headroom
            </Text>
          )}
          <Text variant="caption" tone="tertiary">
            {moneyCompact(scale)}
          </Text>
        </View>
      </View>
      <View style={s.legendGrid}>
        {rows.map((r) => (
          <View key={r.label} style={s.legendItem} accessibilityLabel={`${r.label} ${money(r.value)}, ${r.hint}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[s.swatch, { backgroundColor: r.color }, r.border && { borderWidth: 1, borderColor: colors.borderStrong }]} />
              <Text variant="footnote" tone="secondary" numberOfLines={1}>
                {r.label}
              </Text>
            </View>
            <Text variant="metricSm" tabular numberOfLines={1} adjustsFontSizeToFit>
              {money(r.value)}
            </Text>
            {!compact ? (
              <Text variant="caption" tone="tertiary" numberOfLines={2}>
                {r.label === 'Budget' ? r.hint : `${pct(r.value)} of budget · ${r.hint}`}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

export function TransactionRow({ tx, showProgramme = true }: { tx: Transaction; showProgramme?: boolean }) {
  const s = useStyles(styles);
  const db = useDB();
  const { colors } = useTheme();
  const prog = getProgramme(db, tx.programmeId);
  const overdue = tx.status === 'Overdue';
  return (
    <Touchable onPress={() => router.push(`/finance/transaction/${tx.id}`)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={s.row} accessibilityLabel={`${tx.kind} ${tx.payee} ${money(tx.amount)} ${tx.status}`} hitSlop={0}>
      <IconTile icon={KIND_ICON[tx.kind]} tone={KIND_TONE[tx.kind]} size={34} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {tx.payee}
        </Text>
        <Text variant="footnote" tone="secondary" numberOfLines={1}>
          {showProgramme && prog ? `${prog.shortName} · ` : ''}
          {tx.kind}
        </Text>
        <Text variant="caption" tone="tertiary" numberOfLines={1}>
          {tx.reference} · {formatDate(tx.date, { year: false })}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text variant="headline" tabular tone={overdue ? 'danger' : 'primary'}>
          {money(tx.amount)}
        </Text>
        <StatusPill label={tx.status} />
      </View>
    </Touchable>
  );
}

export function invoiceOutstanding(i: ClientInvoice) {
  return Math.max(0, i.amount - i.paid);
}

export function invoiceIsOverdue(i: ClientInvoice) {
  return invoiceOutstanding(i) > 0 && i.status !== 'Draft' && i.dueDate < DEMO_TODAY;
}

export function InvoiceRow({ invoice: i, onPress }: { invoice: ClientInvoice; onPress?: () => void }) {
  const s = useStyles(styles);
  const db = useDB();
  const { colors } = useTheme();
  const client = getClient(db, i.clientId);
  const prog = getProgramme(db, i.programmeId);
  const outstanding = invoiceOutstanding(i);
  const overdue = invoiceIsOverdue(i);
  const status = overdue && i.status !== 'Overdue' ? 'Overdue' : i.status;
  const due = dueLabel(i.dueDate);
  return (
    <Touchable onPress={onPress} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={s.row} accessibilityLabel={`${i.reference} ${client?.name} ${money(i.amount)} ${status}`} hitSlop={0}>
      <Monogram name={client?.name ?? ''} hue={client?.logoHue} size={34} />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {prog?.shortName} · {i.milestone}
        </Text>
        <Text variant="footnote" tone="secondary" numberOfLines={1}>
          {i.reference} · {client?.shortName}
        </Text>
        {i.status !== 'Draft' && i.amount ? <ProgressBar value={(i.paid / i.amount) * 100} height={4} color={outstanding ? (overdue ? colors.danger : colors.chart[0]) : colors.success} animated={false} /> : null}
        <Text variant="caption" tone={overdue ? 'danger' : 'tertiary'} numberOfLines={1}>
          {i.status === 'Draft' ? `Scheduled ${formatDate(i.issuedOn, { year: false })}` : outstanding ? (overdue ? `${diffDays(DEMO_TODAY, i.dueDate)} days overdue · ${money(outstanding)} due` : `${money(outstanding)} due · ${due.text.replace('Due ', '')}`) : `Paid in full`}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text variant="headline" tabular>
          {money(i.amount)}
        </Text>
        <StatusPill label={status} />
      </View>
    </Touchable>
  );
}

/** Category budget line: committed vs budget with actual inside, flagged when over. */
export function BudgetLineRow({ category, budget, committed, actual, pending }: { category: CostCategory; budget: number; committed: number; actual: number; pending: number }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const over = committed > budget;
  const scale = Math.max(budget, committed, 1);
  return (
    <View style={s.lineRow} accessibilityLabel={`${category}: committed ${money(committed)} of ${money(budget)} budget, actual ${money(actual)}${over ? ', over budget' : ''}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name={CATEGORY_ICON[category]} size={16} tone={over ? 'danger' : 'secondary'} />
        <Text variant="callout" weight="medium" style={{ flex: 1 }} numberOfLines={1}>
          {category}
        </Text>
        {over ? <StatusPill label={`Over ${moneyCompact(committed - budget)}`} tone="danger" /> : null}
        <Text variant="callout" tabular weight="semibold" tone={over ? 'danger' : 'primary'}>
          {moneyCompact(committed)}
          <Text variant="footnote" tone="tertiary">{` / ${moneyCompact(budget)}`}</Text>
        </Text>
      </View>
      <SegmentBar
        height={8}
        total={scale}
        segments={[
          { value: Math.min(actual, committed), color: colors.chart[0] },
          { value: Math.max(0, Math.min(committed, budget) - actual), color: colors.chart[5] },
          { value: Math.max(0, budget - committed), color: colors.chartTrack },
          { value: Math.max(0, committed - budget), color: colors.danger },
        ]}
      />
      <Text variant="caption" tone="tertiary">
        Actual {money(actual)}
        {pending ? ` · ${money(pending)} pending payment` : ''}
        {budget ? ` · ${Math.round((committed / budget) * 100)}% committed` : ' · Unbudgeted'}
      </Text>
    </View>
  );
}

export function IllustrativeNote({ text = 'All financial figures are illustrative sample data in US dollars.' }: { text?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 20, paddingHorizontal: 4 }}>
      <Icon name="info" size={13} tone="tertiary" />
      <Text variant="footnote" tone="tertiary" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

export function MoneyHero({ label, amount, status, caption, tone }: { label: string; amount: number; status?: string; caption?: string; tone?: 'danger' | 'primary' }) {
  return (
    <Card padding="lg" style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="overline" tone="tertiary">
          {label}
        </Text>
        {status ? <StatusPill label={status} size="md" /> : null}
      </View>
      <Text variant="metricXL" tone={tone ?? 'primary'} numberOfLines={1} adjustsFontSizeToFit>
        {money(amount)}
      </Text>
      {caption ? (
        <Text variant="callout" tone="secondary">
          {caption}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = makeStyles((t) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: t.spacing.lg, paddingVertical: 12 },
  lineRow: { gap: 7, paddingHorizontal: t.spacing.lg, paddingVertical: 12 },
  pendingMark: { position: 'absolute', top: -3, width: 3, height: 20, borderRadius: 2 },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14, columnGap: 12 },
  legendItem: { flexBasis: '46%', flexGrow: 1, gap: 2 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
}));
