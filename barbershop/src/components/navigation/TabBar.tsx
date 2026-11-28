import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n, type TKey } from '@/i18n';
import { useTheme } from '@/theme';

export interface TabItem {
  icon: IconName;
  label: TKey;
  badge?: number;
  /** Render as a prominent accent button (e.g. voice assistant). */
  prominent?: boolean;
}

/** Custom tab bar: consistent across iOS/Android/web, follows RTL order automatically. */
export function TabBar({ state, emitter, navigateToTab, items }: BottomTabBarProps & { items: Record<string, TabItem> }) {
  const { colors, layout } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: colors.backgroundElevated, borderTopWidth: 1, borderTopColor: colors.separator, paddingBottom: Math.max(insets.bottom, 8) }}>
      <View style={{ flexDirection: 'row', height: layout.tabBarHeight - 8, maxWidth: 640, width: '100%', alignSelf: 'center' }} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const item = items[route.name];
          if (!item) return null;
          const focused = state.index === index;
          const color = focused ? colors.text : colors.textTertiary;
          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };
          return (
            <Pressable key={route.key} onPress={onPress} haptic="selection" feedback="none" accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={t(item.label)} testID={`tab-${route.name}`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: 6 }}>
              {item.prominent ? (
                <View style={{ width: 44, height: 32, borderRadius: 16, backgroundColor: focused ? colors.accent : colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={item.icon} size={18} color={focused ? colors.accentText : colors.accent} />
                </View>
              ) : (
                <View style={{ width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? colors.surfaceMuted : 'transparent' }}>
                  <Icon name={item.icon} size={20} color={color} />
                  {item.badge ? (
                    <View style={{ position: 'absolute', top: 0, end: 8, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.backgroundElevated }}>
                      <Text variant="caption" color="#fff" align="center" style={{ fontSize: 9, lineHeight: 11 }}>
                        {item.badge > 9 ? '9+' : item.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}
              <Text variant="caption" color={color} numberOfLines={1} align="center" style={{ fontSize: 11 }}>
                {t(item.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
