import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

import {
  Avatar,
  Banner,
  Button,
  Card,
  ChoiceGrid,
  Icon,
  ProgressBar,
  ProgressRing,
  Screen,
  Section,
  Sheet,
  StateView,
  StatusPill,
  Text,
  TextField,
  Touchable,
  toneColors,
  useToast,
} from '@/components';
import type { Programme } from '@/data/models';
import { getStaff, personName, programmePhase, readinessFor, type PendingItem, type ReadinessCategoryView } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { countdown, diffDays, DEMO_TODAY, dueLabel, formatDate, formatDateLong } from '@/utils/dates';

import { READINESS_ICON, readinessTone, readinessToneColor } from '../shared/helpers';
import { ProgrammeNotFound, useProgrammeParam } from './useProgrammeParam';

export default function ReadinessScreen() {
  const p = useProgrammeParam();
  if (!p) return <ProgrammeNotFound />;
  return <Readiness p={p} />;
}

function Readiness({ p }: { p: Programme }) {
  const s = useStyles(styles);
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const r = readinessFor(db, p.id);
  const [open, setOpen] = useState<string | null>(r.categories.find((c) => c.applicable && c.tone === 'critical')?.key ?? r.categories.find((c) => c.applicable && c.percent < 100)?.key ?? null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const phase = programmePhase(p);

  if (!r.configured) {
    return (
      <Screen title="Readiness" eyebrow={p.name}>
        <StateView
          icon={phase === 'cancelled' ? 'ban' : 'circle-check-big'}
          tone={phase === 'cancelled' ? 'neutral' : 'success'}
          title={phase === 'in_delivery' ? 'Readiness achieved' : phase === 'cancelled' ? 'Programme cancelled' : 'Programme delivered'}
          message={phase === 'in_delivery' ? `${p.shortName} passed its Go / No-Go checkpoint and is now in delivery. Track delivery in the schedule and tasks.` : phase === 'cancelled' ? p.cancellationReason : 'Readiness monitoring closed when delivery began.'}
          actionLabel="Open schedule"
          onAction={() => router.push(`/programme/${p.id}/sessions`)}
        />
      </Screen>
    );
  }

  const resolve = (cat: ReadinessCategoryView, item: PendingItem) => {
    const res = item.resolve;
    if (!res) return;
    switch (res.kind) {
      case 'readinessItem':
        actions.setReadinessItem(p.id, res.id, true);
        break;
      case 'logistics':
        actions.toggleLogisticsItem(res.id);
        break;
      case 'enrollment':
        actions.setEnrollmentStatus(res.id, 'Registered');
        break;
      case 'itinerary':
        actions.setItineraryStatus(res.id, 'Ticketed');
        break;
      case 'booking':
        actions.setBookingStatus(res.id, 'Confirmed', `CNF-${res.id.replace(/[^0-9a-z]/gi, '').slice(-5).toUpperCase()}`);
        break;
      case 'assignment':
        actions.setAssignmentStatus(res.id, 'Confirmed');
        break;
      case 'material':
        actions.setMaterialStatus(res.id, 'Approved', 'Approved from the readiness dashboard');
        break;
    }
    const nextCat = cat.total ? Math.min(100, ((cat.done + 1) / cat.total) * 100) : 100;
    const applicable = r.categories.filter((c) => c.applicable);
    const nextOverall = (applicable.reduce((sum, c) => sum + (c.key === cat.key ? nextCat : c.percent), 0) / applicable.length);
    actions.log(p.id, 'status_changed', `resolved “${item.label}” (${cat.label})`);
    toast.show({ message: `${cat.label} now ${Math.round(nextCat)}%`, detail: `Overall readiness ${Math.round(nextOverall)}% · updated from the source record`, icon: 'gauge' });
  };

  const critical = r.categories.flatMap((c) => c.pending.filter((i) => i.critical).map((i) => ({ cat: c, item: i })));
  const overallTone = readinessTone(r.overall, r.threshold);
  const tc = toneColors(overallTone, colors);
  const recTone = r.recommendation === 'go' ? 'success' : r.recommendation === 'conditional' ? 'warning' : 'danger';
  const daysToGo = diffDays(r.goNoGoDate, DEMO_TODAY);

  return (
    <Screen title="Readiness" eyebrow={`${p.code} · ${p.shortName}`} subtitle={p.name}>
      {/* Hero */}
      <Card padding="lg" style={{ alignItems: 'center', gap: 14 }}>
        <ProgressRing value={r.overall} size={168} stroke={13} color={tc.solid} label={`Overall readiness ${Math.round(r.overall)}%`}>
          <Text variant="metricXL" tabular>
            {Math.round(r.overall)}
            <Text variant="title2" tone="tertiary">
              %
            </Text>
          </Text>
          <Text variant="footnote" tone="secondary">
            ready · target {r.threshold}%
          </Text>
        </ProgressRing>
        <View style={s.heroFacts}>
          <Fact icon="calendar" label="Programme start" value={formatDate(p.startDate)} />
          <Fact icon="hourglass" label="Countdown" value={countdown(p.startDate).replace('Starts ', '')} />
          <Fact icon="flag" label="Go / No-Go" value={formatDate(r.goNoGoDate, { year: false })} />
        </View>
      </Card>

      {/* Go / No-Go checkpoint */}
      <Section title="Go / No-Go checkpoint">
        <Card padding="lg" style={{ gap: 12 }}>
          {r.decision ? (
            <Animated.View entering={FadeIn} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Decision outcome={r.decision.outcome} />
                <View style={{ flex: 1 }}>
                  <Text variant="headline">Decision recorded</Text>
                  <Text variant="footnote" tone="secondary">
                    {personName(db, r.decision.by)} · {formatDateLong(r.decision.date)}
                  </Text>
                </View>
              </View>
              {r.decision.note ? (
                <Text variant="callout" tone="secondary">
                  “{r.decision.note}”
                </Text>
              ) : null}
            </Animated.View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Decision outcome={r.recommendation} suggested />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="overline" tone="tertiary">
                    System recommendation
                  </Text>
                  <Text variant="title3" color={toneColors(recTone, colors).fg}>
                    {r.recommendation === 'go' ? 'Go' : r.recommendation === 'conditional' ? 'Conditional Go' : 'Not ready'}
                  </Text>
                </View>
              </View>
              <Text variant="callout" tone="secondary">
                {r.recommendation === 'go'
                  ? 'All categories meet the threshold and nothing critical is open.'
                  : `Readiness is ${Math.round(r.overall)}% against a ${r.threshold}% target with ${r.criticalCount} critical item${r.criticalCount === 1 ? '' : 's'} open. ${daysToGo > 0 ? `Checkpoint in ${daysToGo} days.` : 'Checkpoint is due.'}`}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title="Record decision" icon="stamp" onPress={() => setDecisionOpen(true)} style={{ flex: 1 }} />
                <Button title="Ask assistant" variant="secondary" icon="sparkles" onPress={() => router.push(`/assistant?q=${encodeURIComponent(`What is still pending before ${p.shortName}?`)}` as Href)} style={{ flex: 1 }} />
              </View>
            </>
          )}
        </Card>
      </Section>

      {/* Category grid */}
      <Section title="Readiness dimensions" subtitle="Calculated live from bookings, contracts, registrations and checklists">
        <View style={s.grid}>
          {r.categories.map((c) => {
            const t = toneColors(readinessToneColor(c.tone), colors);
            return (
              <Touchable key={c.key} onPress={() => c.applicable && setOpen(open === c.key ? null : c.key)} feedback="scale" style={[s.tile, open === c.key && { borderColor: t.solid }, !c.applicable && { opacity: 0.5 }]} accessibilityLabel={`${c.label} ${c.applicable ? `${Math.round(c.percent)}%` : 'not applicable'}`}>
                <ProgressRing value={c.applicable ? c.percent : 0} size={46} stroke={4.5} color={t.solid}>
                  <Icon name={READINESS_ICON[c.key]} size={17} color={c.applicable ? t.solid : colors.textTertiary} />
                </ProgressRing>
                <Text variant="caption" tone="secondary" align="center" numberOfLines={1}>
                  {c.label.replace('Academic ', '').replace(' Preparation', '').replace(' Approval', '')}
                </Text>
                <Text variant="headline" tabular color={c.applicable ? t.fg : colors.textTertiary}>
                  {c.applicable ? `${Math.round(c.percent)}%` : 'N/A'}
                </Text>
              </Touchable>
            );
          })}
        </View>
      </Section>

      {critical.length ? (
        <Section title="Critical alerts" subtitle={`${critical.length} item${critical.length === 1 ? '' : 's'} could block delivery`}>
          <View style={{ gap: 8 }}>
            {critical.map(({ cat, item }) => (
              <Banner key={item.id} tone="danger" title={item.label} message={`${cat.label}${item.detail ? ` · ${item.detail}` : ''}${item.due ? ` · ${dueLabel(item.due).text}` : ''}`} action={item.resolve ? item.resolve.label : item.route ? 'Open' : undefined} onAction={() => (item.resolve ? resolve(cat, item) : item.route && router.push(item.route as Href))} />
            ))}
          </View>
        </Section>
      ) : null}

      {/* Detail list */}
      <Section title="Pending by dimension">
        <View style={{ gap: 10 }}>
          {r.categories
            .filter((c) => c.applicable)
            .map((c) => (
              <CategoryCard key={c.key} c={c} expanded={open === c.key} onToggle={() => setOpen(open === c.key ? null : c.key)} onResolve={(item) => resolve(c, item)} />
            ))}
          {r.categories.some((c) => !c.applicable) ? (
            <Text variant="footnote" tone="tertiary" style={{ marginTop: 4 }}>
              Not applicable for this {p.deliveryMode.toLowerCase()} programme: {r.categories.filter((c) => !c.applicable).map((c) => c.label).join(', ')}.
            </Text>
          ) : null}
        </View>
      </Section>

      <DecisionSheet visible={decisionOpen} onClose={() => setDecisionOpen(false)} programme={p} recommendation={r.recommendation} />
    </Screen>
  );
}

function Fact({ icon, label, value }: { icon: 'calendar' | 'hourglass' | 'flag'; label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <Icon name={icon} size={15} tone="tertiary" />
      <Text variant="caption" tone="tertiary" numberOfLines={1}>
        {label}
      </Text>
      <Text variant="label" weight="semibold" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Decision({ outcome, suggested }: { outcome: 'go' | 'no_go' | 'conditional'; suggested?: boolean }) {
  const { colors } = useTheme();
  const tone = outcome === 'go' ? 'success' : outcome === 'conditional' ? 'warning' : 'danger';
  const t = toneColors(tone, colors);
  return (
    <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', borderWidth: suggested ? 1.5 : 0, borderColor: t.solid, borderStyle: suggested ? 'dashed' : 'solid' }}>
      <Icon name={outcome === 'go' ? 'circle-check' : outcome === 'conditional' ? 'circle-alert' : 'circle-x'} size={24} color={t.solid} />
    </View>
  );
}

function CategoryCard({ c, expanded, onToggle, onResolve }: { c: ReadinessCategoryView; expanded: boolean; onToggle: () => void; onResolve: (item: PendingItem) => void }) {
  const s = useStyles(styles);
  const db = useDB();
  const { colors } = useTheme();
  const t = toneColors(readinessToneColor(c.tone), colors);
  const owner = getStaff(db, c.ownerId);
  const [showDone, setShowDone] = useState(false);
  return (
    <Animated.View layout={Layout.duration(220)} style={s.cat}>
      <Touchable onPress={onToggle} style={s.catHead} accessibilityLabel={`${c.label}, ${Math.round(c.percent)}%, ${c.pending.length} pending`} accessibilityState={{ expanded }}>
        <View style={[s.catIcon, { backgroundColor: t.bg }]}>
          <Icon name={READINESS_ICON[c.key]} size={18} color={t.solid} />
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="headline" style={{ flex: 1 }} numberOfLines={1}>
              {c.label}
            </Text>
            <Text variant="headline" tabular color={t.fg}>
              {Math.round(c.percent)}%
            </Text>
          </View>
          <ProgressBar value={c.percent} color={t.solid} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Avatar name={owner?.name ?? ''} hue={owner?.avatarHue} size={18} />
            <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
              {owner?.name} · {c.done}/{c.total} · due {formatDate(c.due, { year: false })}
            </Text>
            <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} tone="tertiary" />
          </View>
        </View>
      </Touchable>
      {expanded ? (
        <Animated.View entering={FadeIn.duration(180)} style={s.catBody}>
          {c.pending.length ? (
            c.pending.map((item) => (
              <View key={item.id} style={s.item}>
                <Icon name={item.critical ? 'circle-alert' : 'circle-dashed'} size={18} color={item.critical ? colors.danger : colors.textTertiary} />
                <Touchable style={{ flex: 1 }} onPress={() => item.route && router.push(item.route as Href)} disabled={!item.route} accessibilityLabel={item.label}>
                  <Text variant="callout" numberOfLines={2}>
                    {item.label}
                  </Text>
                  <Text variant="footnote" tone={item.critical ? 'danger' : 'tertiary'} numberOfLines={1}>
                    {[item.detail, item.ownerId ? personName(db, item.ownerId) : undefined, item.due ? dueLabel(item.due).text : undefined].filter(Boolean).join(' · ')}
                  </Text>
                </Touchable>
                {item.resolve ? <Button title={item.resolve.label} size="sm" variant="tinted" onPress={() => onResolve(item)} /> : item.route ? <Icon name="chevron-right" size={16} tone="tertiary" /> : null}
              </View>
            ))
          ) : (
            <View style={s.item}>
              <Icon name="circle-check" size={18} tone="success" />
              <Text variant="callout" tone="secondary">
                Everything in {c.label.toLowerCase()} is complete.
              </Text>
            </View>
          )}
          {c.completed.length ? (
            <Touchable onPress={() => setShowDone(!showDone)} style={{ paddingVertical: 8 }}>
              <Text variant="footnote" tone="accent" weight="medium">
                {showDone ? 'Hide' : 'Show'} {c.completed.length} completed
              </Text>
            </Touchable>
          ) : null}
          {showDone
            ? c.completed.map((item) => (
                <View key={item.id} style={s.item}>
                  <Icon name="circle-check" size={18} tone="success" />
                  <Text variant="callout" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
                    {item.label}
                  </Text>
                  {item.detail ? <StatusPill label={item.detail.split(' · ').pop() ?? ''} /> : null}
                </View>
              ))
            : null}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

function DecisionSheet({ visible, onClose, programme, recommendation }: { visible: boolean; onClose: () => void; programme: Programme; recommendation: 'go' | 'no_go' | 'conditional' }) {
  const actions = useActions();
  const toast = useToast();
  const [choice, setChoice] = useState<'go' | 'conditional' | 'no_go'>(recommendation);
  const [note, setNote] = useState('');
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Go / No-Go decision"
      subtitle={programme.name}
      footer={
        <Button
          title="Record decision"
          onPress={() => {
            actions.recordGoNoGo(programme.id, choice, note.trim() || undefined);
            onClose();
            toast.show({ message: choice === 'no_go' ? 'No-Go recorded' : choice === 'go' ? 'Go decision recorded' : 'Conditional Go recorded', detail: 'Programme team and approvers notified', icon: 'stamp' });
          }}
          fullWidth
          style={{ flex: 1 }}
        />
      }>
      <ChoiceGrid
        columns={1}
        value={choice}
        onChange={setChoice}
        options={[
          { value: 'go', label: 'Go', detail: 'Proceed to delivery as planned.', icon: 'circle-check' },
          { value: 'conditional', label: 'Conditional Go', detail: 'Proceed, provided named items close by an agreed date.', icon: 'circle-alert' },
          { value: 'no_go', label: 'No-Go', detail: 'Pause delivery and agree a recovery plan with the client.', icon: 'circle-x' },
        ]}
      />
      <TextField label="Decision note" value={note} onChangeText={setNote} placeholder="Conditions, owners and dates…" multiline style={{ marginTop: 16 }} />
    </Sheet>
  );
}

const styles = makeStyles((t) => ({
  heroFacts: { flexDirection: 'row', alignSelf: 'stretch', paddingTop: 14, borderTopWidth: t.hairline, borderTopColor: t.colors.separator },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '31.5%', flexGrow: 1, alignItems: 'center', gap: 5, paddingVertical: 12, paddingHorizontal: 4, borderRadius: t.radii.lg, backgroundColor: t.colors.surface, borderWidth: 1.5, borderColor: 'transparent' },
  cat: { backgroundColor: t.colors.surface, borderRadius: t.radii.lg, overflow: 'hidden', borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  catHead: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  catIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  catBody: { paddingHorizontal: 14, paddingBottom: 8, borderTopWidth: t.hairline, borderTopColor: t.colors.separator },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: t.hairline, borderBottomColor: t.colors.separator },
}));
