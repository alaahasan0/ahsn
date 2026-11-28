import { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from 'react';
import { Animated, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

interface ToastOptions {
  message: string;
  description?: string;
  icon?: IconName;
  tone?: 'default' | 'success' | 'danger';
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

const ToastContext = createContext<(o: ToastOptions | string) => void>(() => undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const { colors, radius, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: Platform.OS !== 'web' }).start(() => setToast(null));
  }, [anim]);

  const show = useCallback(
    (o: ToastOptions | string) => {
      const opts = typeof o === 'string' ? { message: o } : o;
      if (timer.current) clearTimeout(timer.current);
      setToast(opts);
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', friction: 9 }).start();
      timer.current = setTimeout(hide, opts.duration ?? 3200);
    },
    [anim, hide],
  );

  const tone = toast?.tone ?? 'success';
  const iconColor = tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : colors.inkText;
  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={{ position: 'absolute', start: 0, end: 0, bottom: insets.bottom + 84, alignItems: 'center', paddingHorizontal: 16, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}
        >
          <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, maxWidth: 520, width: '100%', backgroundColor: colors.ink, borderRadius: radius.lg, paddingVertical: 12, paddingHorizontal: 16 }, shadow('lg')]} accessibilityLiveRegion="polite">
            <Icon name={toast.icon ?? (tone === 'danger' ? 'alert-circle' : 'check-circle')} size={20} color={iconColor} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="subhead" color={colors.inkText}>
                {toast.message}
              </Text>
              {toast.description ? (
                <Text variant="footnote" color={colors.inkText} style={{ opacity: 0.72 }}>
                  {toast.description}
                </Text>
              ) : null}
            </View>
            {toast.actionLabel ? (
              <Pressable
                onPress={() => {
                  toast.onAction?.();
                  hide();
                }}
                hitSlop={8}
              >
                <Text variant="subhead" color={colors.accent}>
                  {toast.actionLabel}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
