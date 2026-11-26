import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Banner, Button, Card, EmptyState, IconButton, KeyValue, Screen, Section, Timeline, useDialog, useToast, type TimelineStep } from '@/components';
import type { Transaction } from '@/data/models';
import { byId, getProgramme, personName } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { formatDate, formatDateLong, dueLabel } from '@/utils/dates';
import { money } from '@/utils/format';

import { RequireAccess } from '../shared/Widgets';
import { BudgetLineRow, IllustrativeNote, MoneyHero } from './components';

const COMMIT_KINDS = ['Purchase Request', 'Purchase Order'];

function steps(tx: Transaction, approverName: string): TimelineStep[] {
  const order = COMMIT_KINDS.includes(tx.kind) ? ['Draft', 'Submitted', 'Approved', 'Committed'] : ['Draft', 'Submitted', 'Approved', 'Scheduled', 'Paid'];
  // Index of the step currently in progress (steps before it are done).
  const commit = COMMIT_KINDS.includes(tx.kind);
  const current: Record<string, number> = { Draft: 0, Submitted: 2, 'Pending Approval': 2, Rejected: 2, Approved: commit ? 4 : 3, Scheduled: 4, Overdue: 3, Paid: 5 };
  const at = current[tx.status] ?? 0;
  const labels: Record<string, string> = {
    Draft: 'Draft created',
    Submitted: 'Submitted for approval',
    Approved: tx.status === 'Rejected' ? 'Rejected' : `Approval · ${approverName}`,
    Scheduled: tx.status === 'Overdue' ? 'Payment overdue' : 'Scheduled in payment run',
    Paid: 'Paid',
    Committed: 'Committed against budget',
  };
  return order.map((k, i) => {
    let state: TimelineStep['state'] = i < at ? 'done' : i === at ? 'current' : 'upcoming';
    if (tx.status === 'Rejected' && k === 'Approved') state = 'at_risk';
    if (tx.status === 'Overdue' && k === 'Scheduled') state = 'at_risk';
    return {
      key: k,
      title: labels[k],
      state,
      meta: i === 0 ? formatDate(tx.date, { year: false }) : k === 'Scheduled' && tx.dueDate ? formatDate(tx.dueDate, { year: false }) : undefined,
      detail: state === 'current' && k === 'Approved' ? `Waiting for ${approverName}` : undefined,
    };
  });
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const dialog = useDialog();
  const toast = useToast();
  const { userId, role } = useSession();
  const tx = byId(db.transactions, id);

  if (!tx) {
    return (
      <Screen title="Transaction">
        <EmptyState icon="receipt" title="Transaction not found" message="It may have been removed or you followed an old link." actionLabel="All transactions" onAction={() => router.replace('/finance/transactions')} />
      </Screen>
    );
  }

  const prog = getProgramme(db, tx.programmeId);
  const approverName = tx.approverId ? personName(db, tx.approverId) : 'Finance';
  const linked = byId(db.transactions, tx.linkedId);
  const doc = byId(db.documents, tx.documentId);
  const line = db.budgetLines.find((l) => l.programmeId === tx.programmeId && l.category === tx.category);
  const approval = db.approvals.find((a) => a.relatedRoute === `/finance/transaction/${tx.id}` && a.status === 'Pending');
  const canApprove = tx.approverId === userId || role === 'finance_approver';
  const due = tx.dueDate ? dueLabel(tx.dueDate) : null;

  const setStatus = (status: Transaction['status'], message: string, logText: string) => {
    actions.setTransactionStatus(tx.id, status);
    actions.log(tx.programmeId, status === 'Paid' ? 'payment_received' : 'status_changed', logText);
    toast.show({ message, detail: `${tx.reference} · ${money(tx.amount)}` });
  };

  const decide = async (outcome: 'Approved' | 'Rejected') => {
    const res = await dialog.confirm({
      title: outcome === 'Approved' ? `Approve ${money(tx.amount)}?` : 'Reject this request?',
      message: outcome === 'Approved' ? `${tx.kind} to ${tx.payee} for ${prog?.shortName}. This commits the amount against the ${tx.category} budget.` : 'The requester will be notified with your comment.',
      confirmLabel: outcome === 'Approved' ? 'Approve' : 'Reject',
      destructive: outcome === 'Rejected',
      icon: outcome === 'Approved' ? 'stamp' : 'circle-x',
      tone: outcome === 'Approved' ? 'success' : 'danger',
      input: { placeholder: outcome === 'Approved' ? 'Add a note (optional)' : 'Reason for rejection', required: outcome === 'Rejected' },
    });
    if (!res.confirmed) return;
    if (approval) actions.decideApproval(approval.id, outcome, res.text);
    else {
      actions.setTransactionStatus(tx.id, outcome);
      actions.log(tx.programmeId, 'approval_granted', `${outcome.toLowerCase()} ${tx.kind.toLowerCase()} ${tx.reference}`);
    }
    actions.notify({ category: 'Finance', title: `${tx.kind} ${outcome.toLowerCase()}`, body: `${tx.payee} · ${money(tx.amount)}`, programmeId: tx.programmeId, route: `/finance/transaction/${tx.id}`, audience: 'staff', actorName: personName(db, userId) });
    toast.show({ message: outcome === 'Approved' ? 'Approved' : 'Rejected', detail: `${tx.reference} · ${money(tx.amount)}`, tone: outcome === 'Approved' ? 'success' : 'danger' });
  };

  let footer: React.ReactNode = null;
  if (tx.status === 'Draft') footer = <Button title="Submit for approval" icon="send" onPress={() => setStatus(tx.approverId ? 'Pending Approval' : 'Submitted', 'Submitted for approval', `submitted ${tx.reference} for approval`)} style={{ flex: 1 }} />;
  else if ((tx.status === 'Pending Approval' || tx.status === 'Submitted') && canApprove)
    footer = (
      <>
        <Button title="Reject" variant="destructiveTinted" onPress={() => decide('Rejected')} style={{ flex: 1 }} />
        <Button title="Approve" icon="check" onPress={() => decide('Approved')} style={{ flex: 2 }} />
      </>
    );
  else if (tx.status === 'Pending Approval' || tx.status === 'Submitted') footer = <Button title={`Remind ${approverName.split(' ')[0]}`} variant="secondary" icon="bell" onPress={() => toast.show({ message: 'Reminder sent', detail: `${approverName} will get a nudge in ProgrammeOS`, icon: 'send' })} style={{ flex: 1 }} />;
  else if (tx.status === 'Approved' && !COMMIT_KINDS.includes(tx.kind)) footer = <Button title="Schedule payment" icon="calendar-check" onPress={() => setStatus('Scheduled', 'Added to the next payment run', `scheduled payment for ${tx.reference}`)} style={{ flex: 1 }} />;
  else if (tx.status === 'Scheduled') footer = <Button title="Mark as paid" icon="banknote" onPress={() => setStatus('Paid', 'Marked as paid', `marked ${tx.reference} as paid`)} style={{ flex: 1 }} />;
  else if (tx.status === 'Overdue') footer = <Button title="Pay now" variant="destructive" icon="banknote" onPress={() => setStatus('Paid', 'Payment released', `released overdue payment ${tx.reference}`)} style={{ flex: 1 }} />;
  else if (tx.status === 'Rejected') footer = <Button title="Revise and resubmit" variant="secondary" icon="rotate-ccw" onPress={() => setStatus('Pending Approval', 'Resubmitted', `resubmitted ${tx.reference}`)} style={{ flex: 1 }} />;

  return (
    <Screen
      title={tx.payee}
      eyebrow={`${tx.kind} · ${tx.reference}`}
      headerRight={<IconButton icon="share-2" accessibilityLabel="Share" onPress={() => toast.show({ message: 'Link copied', detail: tx.reference, icon: 'link-2', tone: 'neutral' })} />}
      footer={footer}>
      <RequireAccess module="finance">
        <MoneyHero label={tx.category} amount={tx.amount} status={tx.status} caption={tx.description} tone={tx.status === 'Overdue' ? 'danger' : 'primary'} />
        {tx.status === 'Overdue' ? <Banner tone="danger" title="Payment overdue" message={`Was due ${formatDateLong(tx.dueDate!)}. The supplier may apply late fees.`} style={{ marginTop: 12 }} /> : null}
        {tx.status === 'Pending Approval' && !canApprove ? <Banner tone="warning" title={`Waiting for ${approverName}`} message="You’ll be notified as soon as a decision is made." style={{ marginTop: 12 }} /> : null}
        {tx.status === 'Rejected' ? <Banner tone="danger" title="Rejected" message="Update the details and resubmit, or contact the approver." style={{ marginTop: 12 }} /> : null}

        <Section title="Progress">
          <Card padding="lg">
            <Timeline steps={steps(tx, approverName)} dense />
          </Card>
        </Section>

        <Section title="Details">
          <Card padding="md" style={{ paddingVertical: 4 }}>
            <KeyValue label="Programme" value={prog?.name ?? '—'} icon="layers" onPress={prog ? () => router.push(`/programme/${prog.id}/finance`) : undefined} />
            <KeyValue label="Category" value={tx.category} icon="tag" />
            <KeyValue label="Payee" value={tx.payee} icon="building-2" />
            <KeyValue label="Raised by" value={personName(db, tx.requestedBy)} icon="user-round" />
            {tx.approverId ? <KeyValue label="Approver" value={approverName} icon="stamp" /> : null}
            <KeyValue label="Date" value={formatDate(tx.date)} icon="calendar" />
            {tx.dueDate ? <KeyValue label="Due" value={`${formatDate(tx.dueDate)}${tx.status !== 'Paid' && due ? ` · ${due.text}` : ''}`} icon="clock" valueTone={due?.tone === 'danger' && tx.status !== 'Paid' ? 'danger' : 'primary'} /> : null}
            {linked ? <KeyValue label="Linked record" value={`${linked.kind} ${linked.reference}`} icon="link-2" onPress={() => router.push(`/finance/transaction/${linked.id}`)} /> : null}
            {doc ? <KeyValue label="Document" value={doc.title} icon="file-text" onPress={() => router.push(`/document/${doc.id}`)} last /> : <KeyValue label="Document" value="None attached" icon="paperclip" last />}
          </Card>
        </Section>

        {line ? (
          <Section title="Budget impact" subtitle={`${tx.category} · ${prog?.shortName}`}>
            <View style={{ backgroundColor: 'transparent' }}>
              <Card padding="none">
                <BudgetLineRow category={line.category} budget={line.budget} committed={line.committed} actual={line.actual} pending={line.pending} />
              </Card>
            </View>
          </Section>
        ) : null}
        <IllustrativeNote />
      </RequireAccess>
    </Screen>
  );
}
