import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Banner, Button, Card, KeyValue, Legend, ListGroup, NoFilterResults, Screen, Section, SegmentBar, SegmentedControl, Sheet, Stat, StatGrid, Text, TextField, Touchable, useToast } from '@/components';
import type { ClientInvoice } from '@/data/models';
import { getClient, getProgramme } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { DEMO_TODAY, diffDays, formatDate } from '@/utils/dates';
import { money, moneyCompact } from '@/utils/format';

import { LoadGate, RequireAccess } from '../shared/Widgets';
import { IllustrativeNote, InvoiceRow, invoiceIsOverdue, invoiceOutstanding } from './components';

type Seg = 'outstanding' | 'paid' | 'draft' | 'all';

export default function InvoicesScreen() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const [seg, setSeg] = useState<Seg>('outstanding');
  const [open, setOpen] = useState<ClientInvoice | null>(null);
  const [amount, setAmount] = useState('');

  const progs = db.programmes.filter((p) => !p.cancelled && p.contractValue > 0);
  const contract = progs.reduce((s, p) => s + p.contractValue, 0);
  const recognised = progs.reduce((s, p) => s + p.revenue, 0);
  const issued = db.clientInvoices.filter((i) => i.status !== 'Draft');
  const invoiced = issued.reduce((s, i) => s + i.amount, 0);
  const received = db.clientInvoices.reduce((s, i) => s + i.paid, 0);
  const outstandingList = issued.filter((i) => invoiceOutstanding(i) > 0);
  const outstanding = outstandingList.reduce((s, i) => s + invoiceOutstanding(i), 0);

  const buckets = [
    { label: 'Not yet due', test: (d: number) => d <= 0, color: colors.chart[0] },
    { label: '1–30 days', test: (d: number) => d > 0 && d <= 30, color: colors.warning },
    { label: '31–60 days', test: (d: number) => d > 30 && d <= 60, color: colors.danger },
    { label: '60+ days', test: (d: number) => d > 60, color: colors.dangerText },
  ].map((b) => ({ ...b, value: outstandingList.filter((i) => b.test(diffDays(DEMO_TODAY, i.dueDate))).reduce((s, i) => s + invoiceOutstanding(i), 0) }));

  const list = db.clientInvoices
    .filter((i) => (seg === 'all' ? true : seg === 'outstanding' ? i.status !== 'Draft' && invoiceOutstanding(i) > 0 : seg === 'paid' ? i.paid > 0 && invoiceOutstanding(i) === 0 : i.status === 'Draft'))
    .sort((a, b) => (seg === 'outstanding' ? a.dueDate.localeCompare(b.dueDate) : b.issuedOn.localeCompare(a.issuedOn)));

  const recordPayment = () => {
    if (!open) return;
    const n = Math.round(Number(amount.replace(/[^0-9.]/g, '')));
    const out = invoiceOutstanding(open);
    if (!n || n <= 0) return;
    const paid = Math.min(open.amount, open.paid + n);
    const status: ClientInvoice['status'] = paid >= open.amount ? 'Paid' : 'Partially Paid';
    actions.update('clientInvoices', open.id, { paid, status });
    actions.log(open.programmeId, 'payment_received', `recorded a payment of ${money(Math.min(n, out))} against ${open.reference}`);
    toast.show({ message: 'Payment recorded', detail: `${open.reference} · ${status === 'Paid' ? 'paid in full' : `${money(open.amount - paid)} remaining`}` });
    setOpen(null);
  };

  const issueDraft = (i: ClientInvoice) => {
    actions.update('clientInvoices', i.id, { status: 'Issued', issuedOn: DEMO_TODAY });
    actions.log(i.programmeId, 'invoice_issued', `issued invoice ${i.reference} (${money(i.amount)})`);
    toast.show({ message: 'Invoice issued', detail: `${i.reference} sent to ${getClient(db, i.clientId)?.shortName}`, icon: 'send' });
    setOpen(null);
  };

  return (
    <Screen title="Invoices & revenue" subtitle="Contract value, revenue recognition, invoices and receivables." refreshable>
      <RequireAccess module="finance">
        <LoadGate loadKey="finance-invoices">
          <StatGrid>
            <Stat label="Contract value" value={moneyCompact(contract)} icon="file-signature" caption={`${progs.length} programmes`} />
            <Stat label="Invoiced" value={moneyCompact(invoiced)} icon="send" caption={`${issued.length} invoices`} />
            <Stat label="Received" value={moneyCompact(received)} icon="banknote" tone="success" caption={`${invoiced ? Math.round((received / invoiced) * 100) : 0}% collected`} />
            <Stat label="Outstanding" value={moneyCompact(outstanding)} icon="hourglass" tone="warning" caption={`${outstandingList.filter(invoiceIsOverdue).length} overdue`} />
          </StatGrid>

          <Section title="Revenue recognition" subtitle={`${moneyCompact(recognised)} recognised of ${moneyCompact(contract)} contracted`}>
            <Card padding="lg" style={{ gap: 14 }}>
              {progs.map((p) => {
                const pct = p.contractValue ? (p.revenue / p.contractValue) * 100 : 0;
                return (
                  <Touchable key={p.id} onPress={() => router.push(`/programme/${p.id}/finance`)} style={{ gap: 6 }} accessibilityLabel={`${p.name}: ${Math.round(pct)}% recognised`}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                      <Text variant="callout" numberOfLines={1} style={{ flex: 1 }}>
                        {p.name}
                      </Text>
                      <Text variant="footnote" tone="secondary" tabular>
                        {moneyCompact(p.revenue)} / {moneyCompact(p.contractValue)}
                      </Text>
                    </View>
                    <SegmentBar
                      height={8}
                      total={p.contractValue}
                      segments={[
                        { value: p.revenue, color: pct >= 100 ? colors.chart[1] : colors.chart[0] },
                        { value: Math.max(0, p.contractValue - p.revenue), color: colors.chartTrack },
                      ]}
                    />
                  </Touchable>
                );
              })}
              <Legend
                items={[
                  { label: 'Recognised', color: colors.chart[0] },
                  { label: 'Fully recognised', color: colors.chart[1] },
                  { label: 'Remaining', color: colors.chartTrack },
                ]}
              />
            </Card>
          </Section>

          <Section title="Receivables ageing" subtitle={`${money(outstanding)} outstanding`}>
            <Card padding="lg" style={{ gap: 14 }}>
              <SegmentBar height={12} total={Math.max(1, outstanding)} segments={buckets.map((b) => ({ value: b.value, color: b.color }))} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 }}>
                {buckets.map((b) => (
                  <View key={b.label} style={{ flexBasis: '50%', gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: b.color }} />
                      <Text variant="footnote" tone="secondary">
                        {b.label}
                      </Text>
                    </View>
                    <Text variant="metricSm" tabular>
                      {money(b.value)}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </Section>

          <Section title="Client invoices">
            <SegmentedControl
              value={seg}
              onChange={setSeg}
              size="sm"
              options={[
                { value: 'outstanding', label: 'Outstanding' },
                { value: 'paid', label: 'Paid' },
                { value: 'draft', label: 'Scheduled' },
                { value: 'all', label: 'All' },
              ]}
            />
            {list.length ? (
              <ListGroup>
                {list.map((i) => (
                  <InvoiceRow
                    key={i.id}
                    invoice={i}
                    onPress={() => {
                      setAmount(String(invoiceOutstanding(i)));
                      setOpen(i);
                    }}
                  />
                ))}
              </ListGroup>
            ) : (
              <NoFilterResults onReset={() => setSeg('all')} />
            )}
          </Section>
          <IllustrativeNote />
        </LoadGate>
      </RequireAccess>

      <Sheet
        visible={!!open}
        onClose={() => setOpen(null)}
        title={open?.reference}
        subtitle={open ? `${getClient(db, open.clientId)?.name}` : undefined}
        footer={
          open ? (
            open.status === 'Draft' ? (
              <Button title="Issue invoice now" icon="send" onPress={() => issueDraft(open)} style={{ flex: 1 }} />
            ) : invoiceOutstanding(open) > 0 ? (
              <>
                <Button title="Send reminder" variant="secondary" onPress={() => { toast.show({ message: 'Reminder sent', detail: `Statement emailed to ${getClient(db, open.clientId)?.shortName} accounts payable`, icon: 'send' }); setOpen(null); }} style={{ flex: 1 }} />
                <Button title="Record payment" icon="banknote" onPress={recordPayment} style={{ flex: 1 }} />
              </>
            ) : (
              <Button title="Done" variant="secondary" onPress={() => setOpen(null)} style={{ flex: 1 }} />
            )
          ) : undefined
        }>
        {open ? (
          <View style={{ gap: 14 }}>
            {invoiceIsOverdue(open) ? <Banner tone="danger" title={`${diffDays(DEMO_TODAY, open.dueDate)} days overdue`} message={`${money(invoiceOutstanding(open))} was due ${formatDate(open.dueDate)}.`} /> : null}
            <Card variant="alt" padding="md" style={{ paddingVertical: 4 }}>
              <KeyValue label="Programme" value={getProgramme(db, open.programmeId)?.name ?? ''} />
              <KeyValue label="Milestone" value={open.milestone} />
              <KeyValue label="Amount" value={money(open.amount)} />
              <KeyValue label="Paid" value={money(open.paid)} valueTone={open.paid ? 'success' : 'primary'} />
              <KeyValue label="Issued" value={open.status === 'Draft' ? `Scheduled ${formatDate(open.issuedOn)}` : formatDate(open.issuedOn)} />
              <KeyValue label="Due" value={formatDate(open.dueDate)} last />
            </Card>
            {open.status !== 'Draft' && invoiceOutstanding(open) > 0 ? <TextField label="Payment received" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" prefix="$" helper={`Outstanding ${money(invoiceOutstanding(open))}. Partial payments are supported.`} /> : null}
          </View>
        ) : null}
      </Sheet>
    </Screen>
  );
}
