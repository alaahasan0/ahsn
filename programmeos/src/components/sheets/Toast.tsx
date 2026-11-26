import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { Touchable } from '@/components/ui/Touchable';
import { useTheme } from '@/theme';

type ToastInput = { message: string; detail?: string; icon?: IconName; tone?: 'success' | 'neutral' | 'danger' | 'accent'; actionLabel?: string; onAction?: () => void; duration?: number };
type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<{ show: (t: ToastInput) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((t: ToastInput) => {
    if (timer.current) clearTimeout(timer.current);
    const id = Date.now();
    setToast({ ...t, id });
    timer.current = setTimeout(() => setToast((cur) => (cur?.id === id ? null : cur)), t.duration ?? 2600);
  }, []);
  const [api] = useState(() => ({ show: (t: ToastInput) => show(t) }));
  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? <ToastView key={toast.id} toast={toast} onClose={() => setToast(null)} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const tone = toast.tone ?? 'success';
  const iconColor = tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : tone === 'accent' ? colors.accent : colors.textSecondary;
  return (
    <Animated.View entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)} style={{ position: 'absolute', top: insets.top + 6, left: 16, right: 16, alignItems: 'center', zIndex: 1000 }} pointerEvents="box-none">
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 11,
          paddingHorizontal: 14,
          borderRadius: 16,
          maxWidth: 480,
          alignSelf: 'stretch',
          backgroundColor: isDark ? '#262B33' : '#FFFFFF',
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.4 : 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
          borderWidth: isDark ? 0.5 : 0,
          borderColor: colors.borderStrong,
        }}>
        <Icon name={toast.icon ?? (tone === 'danger' ? 'circle-alert' : 'circle-check')} size={20} color={iconColor} />
        <View style={{ flex: 1 }}>
          <Text variant="headline" numberOfLines={2}>
            {toast.message}
          </Text>
          {toast.detail ? (
            <Text variant="footnote" tone="secondary" numberOfLines={2}>
              {toast.detail}
            </Text>
          ) : null}
        </View>
        {toast.actionLabel ? (
          <Touchable
            onPress={() => {
              toast.onAction?.();
              onClose();
            }}
            hitSlop={10}>
            <Text variant="label" weight="semibold" tone="accent">
              {toast.actionLabel}
            </Text>
          </Touchable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function useToast() {
  const t = useContext(ToastContext);
  if (!t) throw new Error('useToast must be used inside ToastProvider');
  return t;
}
