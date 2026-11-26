import { useEffect, type ReactNode } from 'react';
import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useSession } from '@/data/session';
import { makeStyles, useStyles, useTheme } from '@/theme';

// ─── Skeletons ────────────────────────────────────────────────────────────────

export function Skeleton({ width = '100%', height = 14, radius = 6, style }: { width?: DimensionValue; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const { reduceMotion } = useSession();
  const o = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) return;
    o.value = withRepeat(withSequence(withTiming(0.45, { duration: 700 }), withTiming(1, { duration: 700 })), -1);
  }, [o, reduceMotion]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: colors.skeleton }, anim, style]} />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  const s = useStyles(styles);
  return (
    <View style={s.skCard}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Skeleton width={40} height={40} radius={12} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="70%" height={14} />
          <Skeleton width="45%" height={11} />
        </View>
      </View>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Skeleton key={i} width={i % 2 ? '60%' : '90%'} height={11} />
      ))}
    </View>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={{ gap: 10 }} accessibilityLabel="Loading" accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </View>
  );
}

// ─── Full states ──────────────────────────────────────────────────────────────

export type StateViewProps = {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  tone?: 'neutral' | 'danger' | 'warning' | 'success' | 'accent';
  compact?: boolean;
  children?: ReactNode;
};

export function StateView({ icon, title, message, actionLabel, onAction, secondaryLabel, onSecondary, tone = 'neutral', compact, children }: StateViewProps) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const tint = { neutral: [colors.surfaceAlt, colors.textSecondary], danger: [colors.dangerSoft, colors.danger], warning: [colors.warningSoft, colors.warning], success: [colors.successSoft, colors.success], accent: [colors.accentSoft, colors.accent] }[tone];
  return (
    <View style={[s.state, compact && { paddingVertical: 28 }]} accessibilityRole="summary">
      <View style={[s.stateIcon, { backgroundColor: tint[0] }]}>
        <Icon name={icon} size={26} color={tint[1]} />
      </View>
      <Text variant="title3" align="center">
        {title}
      </Text>
      {message ? (
        <Text variant="callout" tone="secondary" align="center" style={{ maxWidth: 300 }}>
          {message}
        </Text>
      ) : null}
      {children}
      {actionLabel ? <Button title={actionLabel} onPress={onAction} variant="tinted" size="md" style={{ marginTop: 8 }} /> : null}
      {secondaryLabel ? <Button title={secondaryLabel} onPress={onSecondary} variant="plain" size="sm" /> : null}
    </View>
  );
}

export const EmptyState = (p: Omit<StateViewProps, 'tone'>) => <StateView tone="neutral" {...p} />;
export const NoResults = ({ query, onClear }: { query?: string; onClear?: () => void }) => (
  <StateView icon="search" title="No results" message={query ? `Nothing matches “${query}”. Check the spelling or try a broader term.` : 'Try a different search.'} actionLabel={onClear ? 'Clear search' : undefined} onAction={onClear} compact />
);
export const NoFilterResults = ({ onReset }: { onReset?: () => void }) => (
  <StateView icon="sliders-horizontal" title="No matches for these filters" message="Remove a filter or reset them to see more." actionLabel="Reset filters" onAction={onReset} compact />
);
export const ErrorState = ({ onRetry, message }: { onRetry?: () => void; message?: string }) => (
  <StateView icon="circle-alert" tone="danger" title="Couldn’t load this" message={message ?? 'Something went wrong while fetching the latest data. Your changes are safe.'} actionLabel="Try again" onAction={onRetry} />
);
export const OfflineState = ({ onRetry }: { onRetry?: () => void }) => (
  <StateView icon="wifi-off" tone="warning" title="You’re offline" message="Showing information saved on this device. Actions you take will sync when you’re back online." actionLabel="Retry" onAction={onRetry} />
);
export const RestrictedState = ({ module, onRequest }: { module: string; onRequest?: () => void }) => (
  <StateView icon="lock" tone="neutral" title={`${module} is restricted`} message="Your role doesn’t include access to this area. Request access and an administrator will review it." actionLabel="Request access" onAction={onRequest} />
);
export const SuccessState = ({ title, message, actionLabel, onAction }: { title: string; message?: string; actionLabel?: string; onAction?: () => void }) => (
  <StateView icon="circle-check-big" tone="success" title={title} message={message} actionLabel={actionLabel} onAction={onAction} />
);

/** App-wide strip shown while "Simulate offline" is on. */
export function OfflineBanner() {
  const { simulateOffline } = useSession();
  const { colors } = useTheme();
  if (!simulateOffline) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 6, backgroundColor: colors.warningSoft }} accessibilityRole="alert">
      <Icon name="wifi-off" size={13} color={colors.warningText} />
      <Text variant="caption" color={colors.warningText}>
        Offline · showing saved data · 2 changes waiting to sync
      </Text>
    </View>
  );
}

const styles = makeStyles((t) => ({
  skCard: { backgroundColor: t.colors.surface, borderRadius: t.radii.lg, padding: 16, gap: 12 },
  state: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 8 },
  stateIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
}));
