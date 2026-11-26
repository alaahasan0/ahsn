import { View } from 'react-native';

import { Button, Card, Icon, Screen, Section, StatusPill, Text, useDialog, useToast, type Tone } from '@/components';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { DEMO_TODAY, formatDate, formatRange } from '@/utils/dates';
import { money } from '@/utils/format';

import { InfoTile, TileRow } from './common';
import { feeSchedule, useFacultyScope, type FeeInstalment } from './data';
import { localState, useLocalState } from './localState';

const TONE: Record<FeeInstalment['status'], Tone> = { Paid: 'success', Scheduled: 'info', 'Invoice due': 'warning', 'Awaiting acceptance': 'neutral', Submitted: 'accent' };

/** The instructor's own fees only — never programme budgets or margins. */
export default function FacultyPaymentsScreen() {
  const db = useDB();
  const toast = useToast();
  const dialog = useDialog();
  const { colors } = useTheme();
  const local = useLocalState();
  const scope = useFacultyScope();
  const rows = scope.assignments
    .filter((a) => a.status !== 'Declined')
    .map((a) => ({ a, p: getProgramme(db, a.programmeId)!, plan: feeSchedule(db, a, local.submittedInvoices) }))
    .sort((x, y) => y.p.startDate.localeCompare(x.p.startDate));
  const all = rows.flatMap((r) => r.plan);
  const paid = all.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0);
  const pending = all.filter((i) => ['Scheduled', 'Invoice due', 'Submitted'].includes(i.status)).reduce((s, i) => s + i.amount, 0);
  const year = all.filter((i) => i.status === 'Paid' && i.date >= '2027-01-01').reduce((s, i) => s + i.amount, 0);

  const submit = async (assignmentId: string, label: string, amount: number, endDate: string) => {
    const { confirmed } = await dialog.confirm({ title: 'Submit invoice?', message: `${label} · ${money(amount)}. It will be processed after delivery (${formatDate(endDate, { year: false })}) and paid within 30 days.`, confirmLabel: 'Submit', icon: 'receipt' });
    if (!confirmed) return;
    localState.addTo('submittedInvoices', assignmentId);
    toast.show({ message: 'Invoice submitted', detail: 'Finance will confirm receipt by email.', icon: 'receipt' });
  };

  return (
    <Screen title="Payments" subtitle="Your fees, invoices and payment status.">
      <TileRow>
        <InfoTile icon="banknote" label="Paid in 2027" value={money(year)} tone="success" />
        <InfoTile icon="hourglass" label="Upcoming" value={money(pending)} tone="accent" />
      </TileRow>
      <Card padding="sm" style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 }}>
        <Icon name="landmark" size={20} tone="secondary" />
        <View style={{ flex: 1 }}>
          <Text variant="callout">Barclays · account ending 4821</Text>
          <Text variant="footnote" tone="secondary">
            Paid in USD · lifetime total {money(paid)}
          </Text>
        </View>
        <Button title="Edit" variant="plain" size="sm" onPress={() => toast.show({ message: 'Bank details are updated securely by Finance', detail: 'Simulated — a verification link would be emailed to you.', icon: 'lock', tone: 'neutral' })} />
      </Card>

      {rows.map(({ a, p, plan }) => (
        <Section key={a.id} title={p.name} subtitle={`${formatRange(p.startDate, p.endDate)} · ${a.role} · ${a.days} day${a.days === 1 ? '' : 's'}`}>
          <Card padding="sm" style={{ paddingHorizontal: 16 }}>
            {plan.map((i, idx) => (
              <View key={i.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: idx < plan.length - 1 ? 0.5 : 0, borderBottomColor: colors.separator }}>
                <View style={{ flex: 1 }}>
                  <Text variant="callout">{i.label}</Text>
                  <Text variant="footnote" tone="tertiary">
                    {i.status === 'Paid' ? `Paid ${formatDate(i.date, { year: false })}` : i.status === 'Awaiting acceptance' ? 'Confirm the request to proceed' : `Expected after ${formatDate(i.date, { year: false })}`}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text variant="headline" tabular>
                    {money(i.amount)}
                  </Text>
                  <StatusPill label={i.status} tone={TONE[i.status]} />
                </View>
              </View>
            ))}
          </Card>
          {plan.some((i) => i.status === 'Invoice due' || i.status === 'Scheduled') && p.endDate >= DEMO_TODAY ? (
            <Button title="Submit invoice" icon="receipt" variant="tinted" size="sm" onPress={() => { const i = plan.find((x) => x.status === 'Invoice due' || x.status === 'Scheduled')!; submit(a.id, `${p.shortName} · ${i.label}`, i.amount, p.endDate); }} />
          ) : null}
        </Section>
      ))}
    </Screen>
  );
}
