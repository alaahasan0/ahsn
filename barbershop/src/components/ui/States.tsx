import { useEffect, useRef } from 'react';
import { Animated, Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function EmptyState({ icon = 'inbox', title, body, actionLabel, onAction, style, compact }: { icon?: IconName; title?: string; body?: string; actionLabel?: string; onAction?: () => void; style?: StyleProp<ViewStyle>; compact?: boolean }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center', paddingVertical: compact ? 24 : 48, paddingHorizontal: 24, gap: 12 }, style]}>
      <View style={{ width: compact ? 48 : 64, height: compact ? 48 : 64, borderRadius: 32, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={compact ? 22 : 28} color={colors.textTertiary} />
      </View>
      <View style={{ gap: 4, alignItems: 'center', maxWidth: 320 }}>
        <Text variant="headline" align="center">
          {title ?? t('common.states.emptyTitle')}
        </Text>
        <Text variant="footnote" tone="secondary" align="center">
          {body ?? t('common.states.emptyBody')}
        </Text>
      </View>
      {actionLabel ? <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" /> : null}
    </View>
  );
}

export function ErrorState({ title, body, onRetry, style }: { title?: string; body?: string; onRetry?: () => void; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <View style={[{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 12 }, style]}>
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.dangerSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="wifi-off" size={24} color={colors.danger} />
      </View>
      <Text variant="headline" align="center">
        {title ?? t('common.states.errorTitle')}
      </Text>
      <Text variant="footnote" tone="secondary" align="center">
        {body ?? t('common.states.errorBody')}
      </Text>
      {onRetry ? <Button label={t('common.actions.retry')} onPress={onRetry} variant="secondary" size="sm" icon="refresh-cw" /> : null}
    </View>
  );
}

/** Shimmering placeholder block for loading states. */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: { width?: number | `${number}%`; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: colors.skeleton, opacity: pulse }, style]} />;
}

/** A list-shaped loading placeholder. */
export function LoadingList({ rows = 4 }: { rows?: number }) {
  return (
    <View style={{ gap: 14 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Skeleton width={44} height={44} radius={22} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="35%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}
