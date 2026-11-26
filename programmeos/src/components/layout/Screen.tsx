import { BlurView } from 'expo-blur';
import { router, useNavigation } from 'expo-router';
import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { useContext, useState, type ReactNode } from 'react';
import { Platform, RefreshControl, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, Extrapolation } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/feedback/States';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { useToast } from '@/components/sheets/Toast';
import { makeStyles, useStyles, useTheme } from '@/theme';

const NAV_HEIGHT = 44;

export type ScreenProps = {
  title: string;
  /** Small line above the large title, e.g. programme code */
  eyebrow?: string;
  subtitle?: string;
  /** Large collapsing title (iOS style). Defaults to true for top-level and detail screens. */
  large?: boolean;
  back?: boolean | 'close';
  backLabel?: string;
  onBack?: () => void;
  headerRight?: ReactNode;
  /** Content rendered under the large title, before children (search, segmented control) */
  headerBelow?: ReactNode;
  /** Sticky content pinned under the nav bar (e.g. segmented control) */
  sticky?: ReactNode;
  children?: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  refreshable?: boolean;
  onRefresh?: () => Promise<void> | void;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  background?: 'canvas' | 'surface';
};

/**
 * Standard screen frame: safe areas, translucent nav bar with a title that fades in as the
 * large title scrolls away, optional pull-to-refresh, and automatic bottom padding for the
 * tab bar. Every screen in the app is built on this so headers behave identically.
 */
export function Screen({
  title,
  eyebrow,
  subtitle,
  large = true,
  back,
  backLabel,
  onBack,
  headerRight,
  headerBelow,
  sticky,
  children,
  scroll = true,
  padded = true,
  refreshable,
  onRefresh,
  footer,
  contentStyle,
  keyboardShouldPersistTaps = 'handled',
  background = 'canvas',
}: ScreenProps) {
  const s = useStyles(styles);
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const navigation = useNavigation();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const y = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    y.value = e.contentOffset.y;
  });

  const showBack = back ?? navigation.canGoBack();
  const handleBack = () => {
    if (onBack) return onBack();
    if (navigation.canGoBack()) navigation.goBack();
    else router.replace('/');
  };

  const navTitleStyle = useAnimatedStyle(() => ({
    opacity: large ? interpolate(y.value, [18, 44], [0, 1], Extrapolation.CLAMP) : 1,
    transform: [{ translateY: large ? interpolate(y.value, [18, 44], [6, 0], Extrapolation.CLAMP) : 0 }],
  }));
  const chromeStyle = useAnimatedStyle(() => ({ opacity: interpolate(y.value, [0, 12], [0, 1], Extrapolation.CLAMP) }));

  const doRefresh = async () => {
    setRefreshing(true);
    try {
      await (onRefresh?.() ?? new Promise((r) => setTimeout(r, 900)));
    } finally {
      setRefreshing(false);
      toast.show({ message: 'Up to date', icon: 'refresh-cw', tone: 'neutral' });
    }
  };

  const topPad = insets.top + NAV_HEIGHT;
  const bottomPad = (tabBarHeight || insets.bottom) + (footer ? 84 : 28);
  const bg = background === 'surface' ? colors.surface : colors.background;

  const largeTitle = large ? (
    <View style={s.largeTitle}>
      {eyebrow ? (
        <Text variant="overline" tone="tertiary" numberOfLines={1} style={{ marginBottom: 2 }}>
          {eyebrow}
        </Text>
      ) : null}
      <Text variant="largeTitle" accessibilityRole="header" numberOfLines={3}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="callout" tone="secondary" style={{ marginTop: 4 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  ) : null;

  const body = (
    <>
      {largeTitle}
      {headerBelow ? <View style={s.headerBelow}>{headerBelow}</View> : null}
      {children}
    </>
  );

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      {scroll ? (
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="never"
          stickyHeaderIndices={sticky ? [0] : undefined}
          contentContainerStyle={[{ paddingTop: topPad, paddingBottom: bottomPad }, padded && s.padded, contentStyle]}
          refreshControl={
            refreshable ? <RefreshControl refreshing={refreshing} onRefresh={doRefresh} tintColor={colors.textTertiary} colors={[colors.accent]} progressViewOffset={topPad} /> : undefined
          }>
          {sticky ? <View style={[s.sticky, { backgroundColor: bg }]}>{sticky}</View> : null}
          {body}
        </Animated.ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingTop: topPad }, contentStyle]}>{body}</View>
      )}

      {/* Navigation bar */}
      <View style={[s.nav, { paddingTop: insets.top, height: topPad }]} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, large && scroll ? chromeStyle : null]} pointerEvents="none">
          {Platform.OS === 'ios' || Platform.OS === 'web' ? (
            <BlurView tint={isDark ? 'dark' : 'light'} intensity={60} style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'android' ? bg : colors.chrome }]} />
          <View style={[s.navBorder, { backgroundColor: colors.border }]} />
        </Animated.View>
        <OfflineBannerSlot />
        <View style={s.navRow} pointerEvents="box-none">
          <View style={s.navSide}>
            {showBack ? (
              <Touchable onPress={handleBack} accessibilityLabel={back === 'close' ? 'Close' : 'Back'} style={s.backBtn} hitSlop={12}>
                {back === 'close' ? (
                  <Icon name="x" size={22} tone="primary" />
                ) : (
                  <>
                    <Icon name={Platform.OS === 'android' ? 'arrow-left' : 'chevron-left'} size={Platform.OS === 'android' ? 22 : 26} tone="accent" strokeWidth={2.2} />
                    {Platform.OS !== 'android' && backLabel ? (
                      <Text variant="body" tone="accent" numberOfLines={1} style={{ maxWidth: 90 }}>
                        {backLabel}
                      </Text>
                    ) : null}
                  </>
                )}
              </Touchable>
            ) : null}
          </View>
          <Animated.View style={[s.navTitle, navTitleStyle]} pointerEvents="none">
            <Text variant="headline" numberOfLines={1}>
              {title}
            </Text>
          </Animated.View>
          <View style={[s.navSide, s.navRight]}>{headerRight}</View>
        </View>
      </View>

      {footer ? <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) + (tabBarHeight ? tabBarHeight - insets.bottom : 0), backgroundColor: colors.chrome, borderTopColor: colors.border }]}>{footer}</View> : null}
    </View>
  );
}

function OfflineBannerSlot() {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: -26 }} pointerEvents="none">
      <OfflineBanner />
    </View>
  );
}

/** Row of header icon buttons with consistent spacing. */
export function HeaderActions({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>{children}</View>;
}

const styles = makeStyles((t) => ({
  root: { flex: 1 },
  padded: { paddingHorizontal: t.spacing.gutter },
  largeTitle: { paddingTop: 4, paddingBottom: t.spacing.md },
  headerBelow: { paddingBottom: t.spacing.sm, gap: t.spacing.md },
  sticky: { marginHorizontal: -t.spacing.gutter, paddingHorizontal: t.spacing.gutter, paddingVertical: t.spacing.sm, zIndex: 2 },
  nav: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  navBorder: { position: 'absolute', left: 0, right: 0, bottom: 0, height: t.hairline },
  navRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  navSide: { minWidth: 76, flexDirection: 'row', alignItems: 'center' },
  navRight: { justifyContent: 'flex-end', paddingRight: 4 },
  navTitle: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingRight: 8, marginLeft: -2 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 12, paddingHorizontal: t.spacing.gutter, borderTopWidth: t.hairline, flexDirection: 'row', gap: 10 },
}));
