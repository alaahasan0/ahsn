import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { CountBadge } from '@/components/ui/StatusPill';
import { Text } from '@/components/ui/Text';
import { haptic, Touchable } from '@/components/ui/Touchable';
import { useTheme } from '@/theme';

export type TabConfig = { name: string; label: string; icon: IconName; badge?: number };

/**
 * Shared bottom navigation for all three experiences. Translucent on iOS/web, solid on
 * Android, safe-area aware, with count badges and haptic selection feedback.
 */
export function AppTabBar({ state, emitter, navigateToTab, insets, tabs }: BottomTabBarProps & { tabs: TabConfig[] }) {
  const { colors, isDark } = useTheme();
  const bottom = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 10);
  return (
    <View style={[styles.wrap, { paddingBottom: bottom, borderTopColor: colors.border }]} accessibilityRole="tablist">
      {Platform.OS === 'android' ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
      ) : (
        <>
          <BlurView tint={isDark ? 'dark' : 'light'} intensity={70} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.chrome }]} />
        </>
      )}
      {state.routes.map((route, index) => {
        const cfg = tabs.find((t) => t.name === route.name);
        if (!cfg) return null;
        const focused = state.index === index;
        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true } as never) as { defaultPrevented?: boolean };
          if (!focused && !event?.defaultPrevented) {
            haptic('selection');
            navigateToTab(route.key);
          }
        };
        const color = focused ? colors.accent : colors.textTertiary;
        return (
          <Touchable
            key={route.key}
            onPress={onPress}
            feedback="none"
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={cfg.badge ? `${cfg.label}, ${cfg.badge} new` : cfg.label}
            style={styles.item}
            hitSlop={0}>
            <View>
              <Icon name={cfg.icon} size={24} color={color} strokeWidth={focused ? 2.2 : 1.8} />
              {cfg.badge ? (
                <View style={styles.badge}>
                  <CountBadge count={cfg.badge} />
                </View>
              ) : null}
            </View>
            <Text variant="caption" color={focused ? colors.accentText : colors.textTertiary} weight={focused ? 'semibold' : 'medium'} numberOfLines={1} style={{ fontSize: 10.5 }} maxFontSizeMultiplier={1.2}>
              {cfg.label}
            </Text>
          </Touchable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', paddingTop: 7, borderTopWidth: StyleSheet.hairlineWidth, position: 'absolute', left: 0, right: 0, bottom: 0 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 44 },
  badge: { position: 'absolute', top: -5, right: -11 },
});
