import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Icon, ProgressRing, StatusPill, Text, toneColors } from '@/components';
import type { Programme } from '@/data/models';
import { getClient, getStaff, isAtRisk, programmeHealth, programmePhase } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { countdown, formatRange } from '@/utils/dates';

import { DELIVERY_ICON } from './helpers';

/** Primary programme list item: identity, dates, health ring and the two most telling statuses. */
export function ProgrammeCard({ programme: p, compact }: { programme: Programme; compact?: boolean }) {
  const db = useDB();
  const { colors } = useTheme();
  const client = getClient(db, p.clientId);
  const manager = getStaff(db, p.managerId);
  const health = programmeHealth(db, p);
  const phase = programmePhase(p);
  const risk = isAtRisk(db, p);
  const ringColor = toneColors(health.tone as never, colors).solid;
  const phaseLabel = phase === 'upcoming' ? countdown(p.startDate) : phase === 'in_delivery' ? 'In delivery' : phase === 'completed' ? 'Completed' : phase === 'archived' ? 'Archived' : 'Cancelled';

  return (
    <Card onPress={() => router.push(`/programme/${p.id}`)} accessibilityLabel={`${p.name}, ${client?.name}, ${phaseLabel}`} padding="md">
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <View style={{ flex: 1, gap: 6, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: `hsl(${p.accentHue}, 62%, 58%)` }} />
            <Text variant="caption" tone="tertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
              {p.code} · {client?.shortName}
            </Text>
            {risk ? <StatusPill label="At risk" tone="warning" icon="triangle-alert" /> : null}
          </View>
          <Text variant="title3" numberOfLines={2}>
            {p.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Icon name="calendar" size={13} tone="tertiary" />
            <Text variant="footnote" tone="secondary">
              {formatRange(p.startDate, p.endDate)}
            </Text>
            <Text variant="footnote" tone="tertiary">
              ·
            </Text>
            <Icon name={DELIVERY_ICON[p.deliveryMode]} size={13} tone="tertiary" />
            <Text variant="footnote" tone="secondary">
              {p.deliveryMode}
            </Text>
          </View>
        </View>
        <ProgressRing value={health.value} size={54} stroke={5} color={ringColor} label={`${health.label} ${health.value}%`}>
          {health.kind === 'done' ? (
            <Icon name={phase === 'cancelled' ? 'ban' : 'check'} size={20} color={ringColor} strokeWidth={2.4} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text variant="headline" tabular style={{ lineHeight: 18 }}>
                {health.value}
                <Text variant="caption" tone="tertiary">
                  %
                </Text>
              </Text>
              <Text variant="caption" tone="tertiary" style={{ fontSize: 9, lineHeight: 11 }}>
                {health.kind === 'readiness' ? 'ready' : 'done'}
              </Text>
            </View>
          )}
        </ProgressRing>
      </View>
      {!compact ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: colors.separator }}>
          <StatusPill label={p.status.operational} />
          <StatusPill label={p.status.financial} />
          <View style={{ flex: 1 }} />
          <Text variant="footnote" tone={phase === 'upcoming' && risk ? 'warning' : 'tertiary'} numberOfLines={1}>
            {phase === 'upcoming' ? phaseLabel : manager?.name}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}
