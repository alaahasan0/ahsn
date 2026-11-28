import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

import { DirectionView } from './Direction';
import { IconButton } from './IconButton';
import { Pressable } from './Pressable';
import { Text } from './Text';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Sticky footer (actions). */
  footer?: ReactNode;
  /** Let content scroll (default true). */
  scroll?: boolean;
  /** Cap height as a fraction of the window. */
  maxHeight?: number;
  testID?: string;
}

/** Bottom sheet built on Modal + Animated for full cross-platform support (no native deps). */
export function Sheet({ visible, onClose, title, subtitle, children, footer, scroll = true, maxHeight = 0.9, testID }: SheetProps) {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start();
    } else if (mounted) {
      Animated.timing(progress, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start(() => setMounted(false));
    }
  }, [visible, mounted, progress]);

  if (!mounted) return null;
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [height * 0.6, 0] });
  const isWide = width >= 720;

  return (
    <Modal transparent visible={mounted} onRequestClose={onClose} animationType="none" statusBarTranslucent>
      <DirectionView>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay, opacity: progress }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} feedback="none" accessibilityLabel={t('common.actions.close')} />
        </Animated.View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: isWide ? 'center' : 'flex-end', alignItems: 'center' }} pointerEvents="box-none">
          <Animated.View
            testID={testID}
            style={{
              width: '100%',
              maxWidth: isWide ? 560 : undefined,
              maxHeight: height * maxHeight,
              backgroundColor: colors.backgroundElevated,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              borderBottomLeftRadius: isWide ? radius.xl : 0,
              borderBottomRightRadius: isWide ? radius.xl : 0,
              paddingBottom: footer ? 0 : Math.max(insets.bottom, 16),
              transform: [{ translateY }],
              opacity: isWide ? progress : 1,
            }}
          >
            {!isWide ? <View style={{ alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, marginTop: 8 }} /> : null}
            {title ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 12 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="title3">{title}</Text>
                  {subtitle ? (
                    <Text variant="footnote" tone="secondary">
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
                <IconButton icon="x" variant="filled" size={32} iconSize={16} onPress={onClose} accessibilityLabel={t('common.actions.close')} />
              </View>
            ) : null}
            {scroll ? (
              <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
                {children}
              </ScrollView>
            ) : (
              <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>{children}</View>
            )}
            {footer ? (
              <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator, gap: 10 }}>{footer}</View>
            ) : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </DirectionView>
    </Modal>
  );
}
