import { useEffect, useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { useSession } from '@/data/session';
import { makeStyles, useStyles, useTheme } from '@/theme';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** 'auto' sizes to content (max 92%); 'large' opens at 92% */
  size?: 'auto' | 'large';
  scroll?: boolean;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  /** Hide the default close (x) button */
  hideClose?: boolean;
  padded?: boolean;
};

/**
 * Bottom sheet: dimmed backdrop, spring presentation, drag-down to dismiss from the grabber
 * or header, keyboard-aware, safe-area aware. Built on RN Modal so it stacks above
 * navigation on iOS, Android and web.
 */
export function Sheet({ visible, onClose, title, subtitle, children, footer, size = 'auto', scroll = true, headerLeft, headerRight, hideClose, padded = true }: SheetProps) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const { reduceMotion } = useSession();
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const maxH = winH * 0.92;
  const ty = useSharedValue(winH);
  const backdrop = useSharedValue(0);
  const closingRef = useRef(false);

  useEffect(() => {
    if (visible) {
      closingRef.current = false;
      setMounted(true);
      ty.value = winH;
      backdrop.value = 0;
      requestAnimationFrame(() => {
        ty.value = reduceMotion ? withTiming(0, { duration: 1 }) : withSpring(0, { damping: 26, stiffness: 260, mass: 0.9 });
        backdrop.value = withTiming(1, { duration: 220 });
      });
    } else if (mounted) {
      backdrop.value = withTiming(0, { duration: 200 });
      ty.value = withTiming(winH, { duration: reduceMotion ? 1 : 230, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const requestClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    onClose();
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        ty.value = Math.max(0, g.dy);
        backdrop.value = Math.max(0, 1 - g.dy / 500);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 110 || g.vy > 1.1) requestCloseRef.current();
        else {
          ty.value = withSpring(0, { damping: 24, stiffness: 280 });
          backdrop.value = withTiming(1, { duration: 150 });
        }
      },
    }),
  ).current;
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: ty.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  if (!mounted) return null;

  const hasHeader = !!(title || headerLeft || headerRight || !hideClose);
  const content = scroll ? (
    <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={[padded && s.padded, { paddingBottom: footer ? 12 : Math.max(insets.bottom, 16) + 8 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[padded && s.padded, { paddingBottom: footer ? 12 : Math.max(insets.bottom, 16) + 8, flexShrink: 1 }]}>{children}</View>
  );

  return (
    <Modal visible transparent animationType="none" onRequestClose={requestClose} statusBarTranslucent navigationBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} accessibilityLabel="Close sheet" />
        </Animated.View>
        <View style={s.anchor} pointerEvents="box-none">
          <Animated.View style={[s.sheet, { maxHeight: maxH, height: size === 'large' ? maxH : undefined }, sheetStyle]} accessibilityViewIsModal>
            <View {...pan.panHandlers}>
              <View style={s.grabberWrap}>
                <View style={s.grabber} />
              </View>
              {hasHeader ? (
                <View style={s.header}>
                  <View style={s.headerSide}>{headerLeft}</View>
                  <View style={s.headerTitle}>
                    {title ? (
                      <Text variant="title3" align="center" numberOfLines={1} accessibilityRole="header">
                        {title}
                      </Text>
                    ) : null}
                    {subtitle ? (
                      <Text variant="footnote" tone="secondary" align="center" numberOfLines={1}>
                        {subtitle}
                      </Text>
                    ) : null}
                  </View>
                  <View style={[s.headerSide, { alignItems: 'flex-end' }]}>
                    {headerRight ??
                      (!hideClose ? (
                        <Touchable onPress={requestClose} accessibilityLabel="Close" style={s.close} hitSlop={10}>
                          <Icon name="x" size={16} tone="secondary" strokeWidth={2.4} />
                        </Touchable>
                      ) : null)}
                  </View>
                </View>
              ) : null}
            </View>
            {size === 'large' ? <View style={{ flex: 1 }}>{content}</View> : content}
            {footer ? <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>{footer}</View> : null}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = makeStyles((t) => ({
  anchor: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: t.colors.surfaceRaised,
    borderTopLeftRadius: t.radii.xxl,
    borderTopRightRadius: t.radii.xxl,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
    overflow: 'hidden',
  },
  grabberWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  grabber: { width: 36, height: 5, borderRadius: 3, backgroundColor: t.colors.borderStrong },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.spacing.lg, paddingBottom: t.spacing.md, paddingTop: 2, minHeight: 44 },
  headerSide: { width: 72 },
  headerTitle: { flex: 1 },
  close: { width: 30, height: 30, borderRadius: 15, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  padded: { paddingHorizontal: t.spacing.lg },
  footer: { paddingHorizontal: t.spacing.lg, paddingTop: 12, borderTopWidth: t.hairline, borderTopColor: t.colors.border, flexDirection: 'row', gap: 10 },
}));
