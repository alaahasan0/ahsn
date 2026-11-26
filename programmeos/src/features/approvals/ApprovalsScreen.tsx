import { useState } from 'react';
import { View } from 'react-native';

import { Chip, ChipRow, NoFilterResults, Screen, SegmentedControl, StateView, Text } from '@/components';
import type { ApprovalKind } from '@/data/models';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { money } from '@/utils/format';

import { LoadGate } from '../shared/Widgets';
import { APPROVAL_KINDS, ApprovalCard } from './components';

type Seg = 'pending' | 'approved' | 'declined';

/** Approvals queue — every decision waiting on the team, with one-tap decisions for yours. */
export default function ApprovalsScreen() {
  const db = useDB();
  const { userId } = useSession();
  const [seg, setSeg] = useState<Seg>('pending');
  const myPending = db.approvals.filter((a) => a.status === 'Pending' && a.approverIds.includes(userId));
  const [mineOnly, setMineOnly] = useState(myPending.length > 0);
  const [kind, setKind] = useState<ApprovalKind | null>(null);

  const bySeg = db.approvals.filter((a) => (seg === 'pending' ? a.status === 'Pending' : seg === 'approved' ? a.status === 'Approved' : a.status === 'Rejected' || a.status === 'Changes Requested'));
  const list = bySeg
    .filter((a) => (!mineOnly || a.approverIds.includes(userId) || a.requestedBy === userId) && (!kind || a.kind === kind))
    .sort((a, b) => (seg === 'pending' ? Number(!!b.urgent) - Number(!!a.urgent) || a.dueDate.localeCompare(b.dueDate) : b.requestedOn.localeCompare(a.requestedOn)));
  const total = list.reduce((s, a) => s + (a.amount ?? 0), 0);

  return (
    <Screen
      title="Approvals"
      subtitle={myPending.length ? `${myPending.length} waiting for your decision` : 'Nothing waiting for you right now'}
      refreshable
      headerBelow={
        <>
          <SegmentedControl
            value={seg}
            onChange={setSeg}
            options={[
              { value: 'pending', label: 'Pending', count: db.approvals.filter((a) => a.status === 'Pending').length },
              { value: 'approved', label: 'Approved' },
              { value: 'declined', label: 'Declined' },
            ]}
          />
          <ChipRow>
            <Chip label="Mine" icon="user-round" selected={mineOnly} onPress={() => setMineOnly(!mineOnly)} />
            {APPROVAL_KINDS.filter((k) => db.approvals.some((a) => a.kind === k)).map((k) => (
              <Chip key={k} label={k} selected={kind === k} onPress={() => setKind(kind === k ? null : k)} />
            ))}
          </ChipRow>
        </>
      }>
      <LoadGate loadKey="approvals">
        {list.length === 0 ? (
          seg === 'pending' && !kind ? (
            <StateView icon="circle-check-big" tone="success" title="All caught up" message={mineOnly ? 'No approvals are waiting for you. Switch off “Mine” to see the whole team’s queue.' : 'No pending approvals across the team.'} actionLabel={mineOnly ? 'Show team queue' : undefined} onAction={() => setMineOnly(false)} />
          ) : (
            <NoFilterResults
              onReset={() => {
                setKind(null);
                setMineOnly(false);
              }}
            />
          )
        ) : (
          <View style={{ gap: 10, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
              <Text variant="footnote" tone="secondary">
                {list.length} {seg === 'pending' ? 'pending' : seg === 'approved' ? 'approved' : 'declined or returned'}
              </Text>
              {total ? (
                <Text variant="footnote" tone="secondary" tabular>
                  {money(total)}
                </Text>
              ) : null}
            </View>
            {list.map((a) => (
              <ApprovalCard key={a.id} approval={a} />
            ))}
          </View>
        )}
      </LoadGate>
    </Screen>
  );
}
