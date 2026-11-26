import { router, useLocalSearchParams, usePreventRemove } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';

import { Button, Card, DateField, FileIcon, FormSection, Icon, IconTile, Screen, SelectField, Tag, Text, TextField, Touchable, useDialog, useToast } from '@/components';
import { costCategories } from '@/data/mock';
import type { CostCategory } from '@/data/models';
import { getProgramme, getStaff, programmePhase } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { fontFor, makeStyles, useStyles, useTheme } from '@/theme';
import { DEMO_TODAY } from '@/utils/dates';
import { money, newId } from '@/utils/format';

import { CATEGORY_ICON } from './components';

type Receipt = { name: string; source: 'camera' | 'file'; merchant: string; amount: number; date: string };

/** Record an expense in seconds: snap a receipt, confirm the extracted details, submit. */
export default function ExpenseNewScreen() {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { userId } = useSession();
  const params = useLocalSearchParams<{ programme?: string }>();
  const me = getStaff(db, userId);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CostCategory | undefined>();
  const [programmeId, setProgrammeId] = useState<string | undefined>(params.programme);
  const [payee, setPayee] = useState(me?.name ?? '');
  const [date, setDate] = useState(DEMO_TODAY);
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [scanning, setScanning] = useState<null | 'camera' | 'file'>(null);
  const [submitted, setSubmitted] = useState(false);
  const [tried, setTried] = useState(false);

  const value = Number(amount.replace(/[^0-9.]/g, ''));
  const dirty = !submitted && !!(amount || category || description || receipt || (programmeId && programmeId !== params.programme));

  usePreventRemove(dirty, async ({ repeat }) => {
    const res = await dialog.confirm({ title: 'Discard this expense?', message: 'The details you entered will be lost.', confirmLabel: 'Discard', destructive: true, cancelLabel: 'Keep editing', icon: 'trash-2' });
    if (res.confirmed) {
      setSubmitted(true);
      setTimeout(repeat, 0);
    }
  });

  const capture = (source: 'camera' | 'file') => {
    setScanning(source);
    setTimeout(() => {
      const r: Receipt = { name: source === 'camera' ? 'IMG_2903.jpg' : 'Receipt_Inkwell_0327.pdf', source, merchant: 'Inkwell Print Studio', amount: 186, date: '2027-03-27' };
      setReceipt(r);
      setScanning(null);
      if (!amount) setAmount(String(r.amount));
      if (!category) setCategory('Learning Materials');
      if (!description) setDescription('Sample print run — participant name badges');
      setPayee(me?.name ?? r.merchant);
      setDate(r.date);
      toast.show({ message: 'Receipt read', detail: `${r.merchant} · ${money(r.amount)} — check the details below`, icon: 'scan-text', tone: 'accent' });
    }, 1300);
  };

  const errors = {
    amount: tried && !(value > 0) ? 'Enter an amount' : undefined,
    category: tried && !category ? 'Choose a category' : undefined,
    programme: tried && !programmeId ? 'Link the expense to a programme' : undefined,
  };

  const submit = () => {
    setTried(true);
    if (!(value > 0) || !category || !programmeId) return;
    const id = newId('tx');
    const ref = `EXP-2027-0${700 + Math.floor(Math.random() * 99)}`;
    const prog = getProgramme(db, programmeId);
    actions.add('transactions', {
      id,
      reference: ref,
      kind: 'Expense',
      programmeId,
      category,
      payee: payee || me?.name || 'Staff member',
      description: description || `${category} expense`,
      amount: Math.round(value),
      date,
      status: 'Pending Approval',
      requestedBy: userId,
      approverId: 's-hannah',
    });
    actions.add('approvals', {
      id: newId('a'),
      kind: 'Expense',
      title: description || `${category} expense`,
      detail: `Expense claim from ${me?.name ?? 'staff member'}.`,
      programmeId,
      requestedBy: userId,
      requestedOn: DEMO_TODAY,
      dueDate: DEMO_TODAY,
      amount: Math.round(value),
      status: 'Pending',
      approverIds: ['s-hannah'],
      chain: [{ approverId: 's-hannah', status: 'Waiting' }],
      relatedRoute: `/finance/transaction/${id}`,
    });
    actions.log(programmeId, 'document_uploaded', `submitted expense ${ref} (${money(Math.round(value))})`);
    setSubmitted(true);
    toast.show({ message: 'Expense submitted', detail: `${money(Math.round(value))} · ${prog?.shortName} · sent to Hannah Weiss for approval` });
    setTimeout(() => router.back(), 30);
  };

  const activeProgrammes = db.programmes.filter((p) => !p.cancelled && !p.archived);

  return (
    <Screen
      title="Record expense"
      back="close"
      large={false}
      footer={<Button title={value > 0 ? `Submit ${money(Math.round(value))}` : 'Submit expense'} icon="send" onPress={submit} style={{ flex: 1 }} size="lg" />}>
      <View style={s.amountWrap}>
        <Text variant="overline" tone="tertiary" align="center">
          Amount (USD)
        </Text>
        <View style={s.amountRow}>
          <Text style={[s.currency, { color: value ? colors.text : colors.textTertiary }]} weight="semibold">
            $
          </Text>
          <TextInput
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            style={[fontFor('bold'), s.amountInput, { width: Math.max(44, (amount.length || 1) * 29 + 8) }]}
            accessibilityLabel="Amount in US dollars"
            maxLength={9}
          />
        </View>
        {errors.amount ? (
          <Text variant="footnote" tone="danger" align="center">
            {errors.amount}
          </Text>
        ) : (
          <Text variant="footnote" tone="tertiary" align="center">
            Expenses over $500 need a second approver.
          </Text>
        )}
      </View>

      <FormSection title="Receipt">
        {scanning ? (
          <Card padding="lg" style={s.scan}>
            <ActivityIndicator color={colors.accent} />
            <Text variant="callout" tone="secondary">
              {scanning === 'camera' ? 'Reading receipt…' : 'Extracting details from file…'}
            </Text>
          </Card>
        ) : receipt ? (
          <Card padding="md" style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <FileIcon format={receipt.source === 'camera' ? 'JPG' : 'PDF'} size={52} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="headline" numberOfLines={1}>
                {receipt.name}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <Tag label={receipt.merchant} icon="building-2" />
                <Tag label={money(receipt.amount)} icon="dollar-sign" />
                <Tag label="27 Mar" icon="calendar" />
              </View>
              <Touchable onPress={() => setReceipt(null)} accessibilityLabel="Remove receipt" hitSlop={8}>
                <Text variant="label" tone="danger">
                  Remove
                </Text>
              </Touchable>
            </View>
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Touchable onPress={() => capture('camera')} feedback="scale" style={s.captureTile} accessibilityLabel="Scan receipt with camera">
              <IconTile icon="camera" tone="accent" size={40} />
              <Text variant="label">Scan receipt</Text>
              <Text variant="caption" tone="tertiary" align="center">
                Simulated camera
              </Text>
            </Touchable>
            <Touchable onPress={() => capture('file')} feedback="scale" style={s.captureTile} accessibilityLabel="Choose receipt file">
              <IconTile icon="file-up" tone="violet" size={40} />
              <Text variant="label">Choose file</Text>
              <Text variant="caption" tone="tertiary" align="center">
                PDF or image
              </Text>
            </Touchable>
          </View>
        )}
      </FormSection>

      <FormSection title="Details">
        <SelectField
          label="Programme"
          required
          value={programmeId}
          onChange={setProgrammeId}
          icon="layers"
          error={errors.programme}
          options={activeProgrammes.map((p) => ({ value: p.id, label: p.name, detail: `${p.code} · ${programmePhase(p) === 'in_delivery' ? 'In delivery' : programmePhase(p) === 'upcoming' ? 'Upcoming' : 'Closing'}` }))}
        />
        <SelectField
          label="Category"
          required
          value={category}
          onChange={setCategory}
          error={errors.category}
          options={costCategories.map((c) => ({ value: c, label: c, icon: CATEGORY_ICON[c] }))}
        />
        <TextField label="Paid to / claimant" value={payee} onChangeText={setPayee} icon="user-round" />
        <DateField label="Date of expense" value={date} onChange={setDate} />
        <TextField label="Description" value={description} onChangeText={setDescription} placeholder="What was this for?" multiline />
      </FormSection>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 16 }}>
        <Icon name="shield-check" size={14} tone="tertiary" />
        <Text variant="footnote" tone="tertiary" style={{ flex: 1 }}>
          Routed to Hannah Weiss (Finance Officer) for approval. Simulated — no payment is made.
        </Text>
      </View>
    </Screen>
  );
}

const styles = makeStyles((t) => ({
  amountWrap: { alignItems: 'center', gap: 6, paddingVertical: t.spacing.xl, marginTop: 8, backgroundColor: t.colors.surface, borderRadius: t.radii.xl },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  currency: { fontSize: 34, lineHeight: 44 },
  amountInput: { fontSize: 48, lineHeight: 58, color: t.colors.text, textAlign: 'center', padding: 0, outlineStyle: 'none', fontVariant: ['tabular-nums'] } as never,
  scan: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  captureTile: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 18, borderRadius: t.radii.lg, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, borderStyle: 'dashed' },
}));
