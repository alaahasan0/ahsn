import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Button, Icon, IconTile, StatusPill, Text, Touchable, useDialog, useToast, type IconName } from '@/components';
import type { Approval, ApprovalKind } from '@/data/models';
import { getProgramme, personHue, personName } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { dueLabel, formatDate } from '@/utils/dates';
import { money } from '@/utils/format';

export const APPROVAL_ICON: Record<ApprovalKind, { icon: IconName; tone: 'accent' | 'success' | 'warning' | 'violet' | 'info' | 'danger' | 'neutral' }> = {
  Budget: { icon: 'wallet', tone: 'success' },
  Payment: { icon: 'banknote', tone: 'success' },
  'Purchase Order': { icon: 'file-check', tone: 'accent' },
  Material: { icon: 'book-open', tone: 'violet' },
  'Hotel Booking': { icon: 'bed-double', tone: 'info' },
  'Faculty Contract': { icon: 'file-signature', tone: 'warning' },
  'Go / No-Go': { icon: 'gauge', tone: 'danger' },
  Expense: { icon: 'credit-card', tone: 'success' },
  'Programme Change': { icon: 'git-branch', tone: 'neutral' },
};

export const APPROVAL_KINDS: ApprovalKind[] = ['Budget', 'Payment', 'Purchase Order', 'Material', 'Hotel Booking', 'Faculty Contract', 'Go / No-Go', 'Expense', 'Programme Change'];

export function canDecide(a: Approval, userId: string) {
  return a.status === 'Pending' && a.approverIds.includes(userId);
}

/** Shared decision flow with confirmation dialog, comment and side effects. */
export function useApprovalDecision() {
  const db = useDB();
  const actions = useActions();
  const dialog = useDialog();
  const toast = useToast();
  const { userId } = useSession();

  return async (a: Approval, outcome: 'Approved' | 'Rejected' | 'Changes Requested') => {
    if (a.kind === 'Go / No-Go' && outcome === 'Approved') {
      // Go / No-Go is a programme decision — confirm with readiness context.
      const res = await dialog.confirm({ title: 'Record a Go decision?', message: `${getProgramme(db, a.programmeId)?.name} will move to Delivery Approval. Open items stay on the readiness dashboard.`, confirmLabel: 'Record Go', icon: 'gauge', tone: 'success', input: { placeholder: 'Conditions or notes (optional)' } });
      if (!res.confirmed) return false;
      actions.recordGoNoGo(a.programmeId, 'go', res.text);
      toast.show({ message: 'Go decision recorded', detail: getProgramme(db, a.programmeId)?.name });
      return true;
    }
    const verb = outcome === 'Approved' ? 'Approve' : outcome === 'Rejected' ? 'Reject' : 'Request changes';
    const res = await dialog.confirm({
      title: outcome === 'Approved' ? `Approve${a.amount ? ` ${money(a.amount)}` : ''}?` : outcome === 'Rejected' ? 'Reject this request?' : 'Request changes?',
      message: outcome === 'Approved' ? `${a.title} · ${getProgramme(db, a.programmeId)?.shortName}. ${personName(db, a.requestedBy)} will be notified.` : `${personName(db, a.requestedBy)} will see your comment and can resubmit.`,
      confirmLabel: verb,
      destructive: outcome === 'Rejected',
      icon: outcome === 'Approved' ? 'stamp' : outcome === 'Rejected' ? 'circle-x' : 'pencil',
      tone: outcome === 'Approved' ? 'success' : outcome === 'Rejected' ? 'danger' : 'warning',
      input: { placeholder: outcome === 'Approved' ? 'Add a note (optional)' : 'What needs to change?', required: outcome !== 'Approved' },
    });
    if (!res.confirmed) return false;
    actions.decideApproval(a.id, outcome, res.text);
    actions.notify({ category: 'Approvals', title: `${a.kind} ${outcome === 'Changes Requested' ? 'needs changes' : outcome.toLowerCase()}`, body: a.title, programmeId: a.programmeId, route: `/approval/${a.id}`, audience: 'staff', actorName: personName(db, userId) });
    toast.show({ message: outcome === 'Approved' ? 'Approved' : outcome === 'Rejected' ? 'Rejected' : 'Changes requested', detail: a.title, tone: outcome === 'Approved' ? 'success' : outcome === 'Rejected' ? 'danger' : 'accent', icon: outcome === 'Changes Requested' ? 'pencil' : undefined });
    return true;
  };
}

export function ApprovalCard({ approval: a }: { approval: Approval }) {
  const s = useStyles(styles);
  const db = useDB();
  const { userId } = useSession();
  const { colors } = useTheme();
  const decide = useApprovalDecision();
  const prog = getProgramme(db, a.programmeId);
  const meta = APPROVAL_ICON[a.kind];
  const due = dueLabel(a.dueDate);
  const mine = canDecide(a, userId);
  const decidedStep = [...a.chain].reverse().find((c) => c.status !== 'Waiting' && c.date);
  return (
    <View style={s.card}>
      <Touchable onPress={() => router.push(`/approval/${a.id}`)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={s.top} accessibilityLabel={`${a.title}, ${a.kind}, ${a.status}`} hitSlop={0}>
        <IconTile icon={meta.icon} tone={meta.tone} size={36} />
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="caption" tone="tertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
              {a.kind} · {prog?.shortName}
            </Text>
            {a.urgent && a.status === 'Pending' ? <StatusPill label="Urgent" tone="danger" /> : null}
          </View>
          <Text variant="headline" numberOfLines={2}>
            {a.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Avatar name={personName(db, a.requestedBy)} hue={personHue(db, a.requestedBy)} size={18} />
            <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
              {personName(db, a.requestedBy)} · {formatDate(a.requestedOn, { year: false })}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          {a.amount ? (
            <Text variant="headline" tabular>
              {money(a.amount)}
            </Text>
          ) : null}
          {a.status === 'Pending' ? (
            <Text variant="footnote" tone={due.tone === 'danger' ? 'danger' : due.tone === 'warning' ? 'warning' : 'tertiary'} weight={due.tone !== 'neutral' ? 'medium' : 'regular'}>
              {due.text}
            </Text>
          ) : (
            <StatusPill label={a.status} />
          )}
        </View>
      </Touchable>
      {a.status !== 'Pending' && decidedStep?.note ? (
        <View style={s.note}>
          <Icon name="quote" size={13} tone="tertiary" />
          <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={2}>
            {personName(db, decidedStep.approverId).split(' ')[0]}: {decidedStep.note}
          </Text>
        </View>
      ) : null}
      {mine ? (
        <View style={s.actions}>
          <Button title="Reject" variant="destructiveTinted" size="sm" onPress={() => decide(a, 'Rejected')} style={{ flex: 1 }} />
          <Button title="Changes" variant="secondary" size="sm" onPress={() => decide(a, 'Changes Requested')} style={{ flex: 1 }} />
          <Button title={a.kind === 'Go / No-Go' ? 'Record Go' : 'Approve'} variant="primary" size="sm" icon="check" onPress={() => decide(a, 'Approved')} style={{ flex: 1.3 }} />
        </View>
      ) : a.status === 'Pending' ? (
        <View style={s.waiting}>
          <Icon name="hourglass" size={13} tone="tertiary" />
          <Text variant="footnote" tone="tertiary" numberOfLines={1}>
            Waiting for {a.approverIds.map((id) => personName(db, id).split(' ')[0]).join(' & ')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = makeStyles((t) => ({
  card: { backgroundColor: t.colors.surface, borderRadius: t.radii.lg, overflow: 'hidden', borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  top: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  actions: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  waiting: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingBottom: 12, marginTop: -4 },
  note: { flexDirection: 'row', gap: 6, paddingHorizontal: 14, paddingBottom: 12, marginTop: -4 },
}));
