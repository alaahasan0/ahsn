import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Banner, Button, Card, EmptyState, Icon, IconButton, IconTile, KeyValue, ProgressRing, Screen, Section, StatusPill, Text, TextField, Timeline, useToast, type TimelineStep } from '@/components';
import { byId, getProgramme, personHue, personName, programmeFinance, readinessFor } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { DEMO_NOW, activityStamp, dueLabel, formatDate } from '@/utils/dates';
import { money, moneyCompact } from '@/utils/format';

import { BudgetLineRow } from '../finance/components';
import { APPROVAL_ICON, canDecide, useApprovalDecision } from './components';

type Comment = { id: string; authorId: string; date: string; text: string };

export default function ApprovalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const { userId } = useSession();
  const decide = useApprovalDecision();
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState('');
  const a = byId(db.approvals, id);

  if (!a) {
    return (
      <Screen title="Approval">
        <EmptyState icon="stamp" title="Approval not found" message="It may have been withdrawn by the requester." actionLabel="All approvals" onAction={() => router.replace('/approvals')} />
      </Screen>
    );
  }

  const prog = getProgramme(db, a.programmeId);
  const meta = APPROVAL_ICON[a.kind];
  const mine = canDecide(a, userId);
  const due = dueLabel(a.dueDate);
  const txId = a.relatedRoute?.startsWith('/finance/transaction/') ? a.relatedRoute.split('/').pop() : undefined;
  const tx = byId(db.transactions, txId);
  const line = tx ? db.budgetLines.find((l) => l.programmeId === tx.programmeId && l.category === tx.category) : undefined;
  const materialId = a.relatedRoute?.startsWith('/material/') ? a.relatedRoute.split('/').pop() : undefined;
  const material = byId(db.materials, materialId);
  const readiness = a.kind === 'Go / No-Go' ? readinessFor(db, a.programmeId) : null;
  const finance = a.kind === 'Budget' ? programmeFinance(db, a.programmeId) : null;
  const decided = [...a.chain].reverse().find((c) => c.status !== 'Waiting' && c.status !== 'Pending' && c.date);

  const steps: TimelineStep[] = [
    { key: 'req', title: `Requested by ${personName(db, a.requestedBy)}`, state: 'done', meta: formatDate(a.requestedOn, { year: false }), detail: a.detail },
    ...a.chain
      .filter((c, i) => !(i === 0 && c.approverId === a.requestedBy && c.note === 'Submitted'))
      .map((c, i) => ({
        key: `c${i}`,
        title: `${personName(db, c.approverId)}`,
        state: (c.status === 'Approved' ? 'done' : c.status === 'Rejected' || c.status === 'Changes Requested' ? 'at_risk' : a.status === 'Pending' && a.chain.findIndex((x) => x.status === 'Waiting') === a.chain.indexOf(c) ? 'current' : 'upcoming') as TimelineStep['state'],
        meta: c.date ? formatDate(c.date, { year: false }) : undefined,
        detail: c.status === 'Waiting' ? 'Waiting for decision' : `${c.status}${c.note ? ` — “${c.note}”` : ''}`,
      })),
  ];

  const addComment = () => {
    if (!draft.trim()) return;
    setComments([...comments, { id: `c${comments.length}`, authorId: userId, date: DEMO_NOW, text: draft.trim() }]);
    actions.log(a.programmeId, 'comment', `commented on “${a.title}”`);
    setDraft('');
    toast.show({ message: 'Comment added', tone: 'neutral', icon: 'message-square' });
  };

  const footer = mine ? (
    <>
      <Button title="Reject" variant="destructiveTinted" onPress={() => decide(a, 'Rejected')} style={{ flex: 1 }} />
      <Button title="Changes" variant="secondary" onPress={() => decide(a, 'Changes Requested')} style={{ flex: 1 }} />
      <Button title={a.kind === 'Go / No-Go' ? 'Record Go' : 'Approve'} icon="check" onPress={() => decide(a, 'Approved')} style={{ flex: 1.3 }} />
    </>
  ) : a.status === 'Pending' ? (
    <Button title="Send reminder" variant="secondary" icon="bell" onPress={() => toast.show({ message: 'Reminder sent', detail: a.approverIds.map((x) => personName(db, x)).join(', '), icon: 'send' })} style={{ flex: 1 }} />
  ) : undefined;

  return (
    <Screen title={a.title} eyebrow={`${a.kind} approval`} headerRight={<IconButton icon="share-2" accessibilityLabel="Share" onPress={() => toast.show({ message: 'Link copied', icon: 'link-2', tone: 'neutral' })} />} footer={footer}>
      {a.status === 'Pending' ? (
        <Banner tone={a.urgent ? 'danger' : 'warning'} icon="hourglass" title={mine ? 'Waiting for your decision' : `Waiting for ${a.approverIds.map((x) => personName(db, x).split(' ')[0]).join(' & ')}`} message={`${due.text}${a.urgent ? ' · marked urgent' : ''}. ${mine ? 'Approve, request changes or reject below.' : 'You can view the request but not decide on it.'}`} />
      ) : (
        <Banner
          tone={a.status === 'Approved' ? 'success' : a.status === 'Rejected' ? 'danger' : 'warning'}
          title={a.status === 'Approved' ? 'Approved' : a.status === 'Rejected' ? 'Rejected' : 'Changes requested'}
          message={decided ? `${personName(db, decided.approverId)} · ${formatDate(decided.date!, { year: false })}${decided.note ? ` — “${decided.note}”` : ''}` : undefined}
        />
      )}

      <Card padding="lg" style={{ marginTop: 12, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconTile icon={meta.icon} tone={meta.tone} size={42} />
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="tertiary">
              {prog?.code} · {prog?.shortName}
            </Text>
            <Text variant="headline" numberOfLines={2}>
              {prog?.name}
            </Text>
          </View>
          <StatusPill label={a.status} size="md" />
        </View>
        {a.amount ? (
          <View>
            <Text variant="overline" tone="tertiary">
              Amount
            </Text>
            <Text variant="metricXL" tabular>
              {money(a.amount)}
            </Text>
          </View>
        ) : null}
        <Text variant="callout" tone="secondary">
          {a.detail}
        </Text>
      </Card>

      <Section title="Details">
        <Card padding="md" style={{ paddingVertical: 4 }}>
          <KeyValue label="Programme" value={prog?.name ?? '—'} icon="layers" onPress={() => router.push(`/programme/${a.programmeId}`)} />
          <KeyValue label="Requested by" value={personName(db, a.requestedBy)} icon="user-round" />
          <KeyValue label="Requested" value={formatDate(a.requestedOn)} icon="calendar" />
          <KeyValue label="Decision due" value={formatDate(a.dueDate)} icon="clock" valueTone={a.status === 'Pending' && due.tone === 'danger' ? 'danger' : 'primary'} />
          <KeyValue label="Approvers" value={a.approverIds.map((x) => personName(db, x)).join(', ')} icon="stamp" last={!a.relatedRoute} />
          {a.relatedRoute ? <KeyValue label="Related record" value={tx ? tx.reference : material ? material.title : a.kind === 'Go / No-Go' ? 'Readiness dashboard' : 'Open'} icon="link-2" onPress={() => router.push(a.relatedRoute as Href)} last /> : null}
        </Card>
      </Section>

      {line && tx ? (
        <Section title="Budget impact" subtitle={`${tx.category} · ${prog?.shortName}`}>
          <Card padding="none">
            <BudgetLineRow category={line.category} budget={line.budget} committed={line.committed} actual={line.actual} pending={line.pending} />
          </Card>
        </Section>
      ) : null}

      {readiness ? (
        <Section title="Readiness context">
          <Card padding="lg" onPress={() => router.push(`/programme/${a.programmeId}/readiness`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <ProgressRing value={readiness.overall} size={58} stroke={6} color={readiness.overall >= readiness.threshold ? colors.success : colors.warning}>
              <Text variant="headline" tabular>
                {Math.round(readiness.overall)}%
              </Text>
            </ProgressRing>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="headline">Recommendation: {readiness.recommendation === 'go' ? 'Go' : readiness.recommendation === 'conditional' ? 'Conditional Go' : 'No-Go'}</Text>
              <Text variant="subhead" tone="secondary">
                Threshold {readiness.threshold}% · {readiness.pendingCount} open items · {readiness.criticalCount} critical
              </Text>
            </View>
            <Icon name="chevron-right" size={18} tone="tertiary" />
          </Card>
        </Section>
      ) : null}

      {finance && prog ? (
        <Section title="Budget context">
          <Card padding="md" style={{ paddingVertical: 4 }}>
            <KeyValue label="Contract value" value={money(prog.contractValue)} />
            <KeyValue label="Proposed budget" value={money(a.amount ?? finance.budget)} />
            <KeyValue label="Budgeted margin" value={`${moneyCompact(prog.contractValue - (a.amount ?? finance.budget))} · ${(((prog.contractValue - (a.amount ?? finance.budget)) / prog.contractValue) * 100).toFixed(1)}%`} valueTone="success" last />
          </Card>
        </Section>
      ) : null}

      {material ? (
        <Section title="Material">
          <Card padding="md" onPress={() => router.push(`/material/${material.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconTile icon="file-text" tone="violet" size={36} />
            <View style={{ flex: 1 }}>
              <Text variant="headline" numberOfLines={2}>
                {material.title}
              </Text>
              <Text variant="footnote" tone="secondary">
                {material.versions.at(-1)?.label ?? 'No version'} · {material.format}
              </Text>
            </View>
            <StatusPill label={material.status} />
          </Card>
        </Section>
      ) : null}

      <Section title="Approval chain">
        <Card padding="lg">
          <Timeline steps={steps} />
        </Card>
      </Section>

      <Section title="Comments">
        <Card padding="md" style={{ gap: 14 }}>
          {comments.length === 0 && !a.chain.some((c) => c.note && c.note !== 'Submitted') ? (
            <Text variant="callout" tone="tertiary">
              No comments yet.
            </Text>
          ) : null}
          {a.chain
            .filter((c) => c.note && c.note !== 'Submitted')
            .map((c, i) => (
              <CommentRow key={`n${i}`} authorId={c.approverId} text={c.note!} stamp={c.date ? formatDate(c.date, { year: false }) : ''} />
            ))}
          {comments.map((c) => (
            <CommentRow key={c.id} authorId={c.authorId} text={c.text} stamp={activityStamp(c.date)} />
          ))}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <TextField value={draft} onChangeText={setDraft} placeholder="Add a comment for the requester" style={{ flex: 1 }} />
            <IconButton icon="send" variant="primary" size={44} accessibilityLabel="Post comment" onPress={addComment} disabled={!draft.trim()} />
          </View>
        </Card>
      </Section>
    </Screen>
  );
}

function CommentRow({ authorId, text, stamp }: { authorId: string; text: string; stamp: string }) {
  const db = useDB();
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Avatar name={personName(db, authorId)} hue={personHue(db, authorId)} size={28} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="footnote" tone="secondary">
          <Text variant="footnote" weight="semibold">
            {personName(db, authorId)}
          </Text>
          {stamp ? ` · ${stamp}` : ''}
        </Text>
        <Text variant="callout">{text}</Text>
      </View>
    </View>
  );
}
