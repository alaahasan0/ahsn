import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { useTheme } from '@/theme';

export type TimelineStepState = 'done' | 'current' | 'upcoming' | 'at_risk' | 'skipped';

export type TimelineStep = {
  key: string;
  title: string;
  detail?: string;
  meta?: string;
  state: TimelineStepState;
  icon?: IconName;
  onPress?: () => void;
  extra?: ReactNode;
};

/** Vertical stepper used for workflows, milestones and approval chains. */
export function Timeline({ steps, dense }: { steps: TimelineStep[]; dense?: boolean }) {
  const { colors } = useTheme();
  return (
    <View>
      {steps.map((st, i) => {
        const last = i === steps.length - 1;
        const color = st.state === 'done' ? colors.success : st.state === 'current' ? colors.accent : st.state === 'at_risk' ? colors.warning : colors.borderStrong;
        const nextDone = steps[i + 1]?.state === 'done' || (st.state === 'done' && steps[i + 1]?.state === 'current');
        const body = (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 26 }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: st.state === 'done' ? colors.success : st.state === 'current' ? colors.accent : st.state === 'at_risk' ? colors.warningSoft : colors.surface,
                  borderWidth: st.state === 'upcoming' || st.state === 'skipped' ? 1.5 : st.state === 'at_risk' ? 1.5 : 0,
                  borderColor: color,
                }}>
                {st.state === 'done' ? (
                  <Icon name="check" size={14} color="#FFFFFF" strokeWidth={3} />
                ) : st.state === 'current' ? (
                  <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#FFFFFF' }} />
                ) : st.state === 'at_risk' ? (
                  <Icon name="triangle-alert" size={13} color={colors.warning} strokeWidth={2.4} />
                ) : st.icon ? (
                  <Icon name={st.icon} size={13} tone="tertiary" />
                ) : (
                  <Text variant="caption" tone="tertiary">
                    {i + 1}
                  </Text>
                )}
              </View>
              {!last ? <View style={{ width: 2, flex: 1, minHeight: dense ? 12 : 18, backgroundColor: nextDone ? colors.success : colors.border, marginVertical: 3, borderRadius: 1 }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: last ? 0 : dense ? 12 : 18, paddingTop: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <Text variant={st.state === 'current' ? 'headline' : 'bodyStrong'} tone={st.state === 'upcoming' || st.state === 'skipped' ? 'secondary' : 'primary'} style={{ flex: 1 }}>
                  {st.title}
                </Text>
                {st.meta ? (
                  <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                    {st.meta}
                  </Text>
                ) : null}
              </View>
              {st.detail ? (
                <Text variant="subhead" tone={st.state === 'at_risk' ? 'warning' : 'secondary'} style={{ marginTop: 2 }}>
                  {st.detail}
                </Text>
              ) : null}
              {st.extra}
            </View>
          </View>
        );
        return st.onPress ? (
          <Touchable key={st.key} onPress={st.onPress} accessibilityLabel={`${st.title}, ${st.state}`}>
            {body}
          </Touchable>
        ) : (
          <View key={st.key} accessibilityLabel={`${st.title}, ${st.state}`}>
            {body}
          </View>
        );
      })}
    </View>
  );
}

/** Horizontal compact progress through a lifecycle (dots). */
export function StageDots({ total, current, color }: { total: number; current: number; color?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < current ? (color ?? colors.success) : i === current ? colors.accent : colors.chartTrack }} />
      ))}
    </View>
  );
}
