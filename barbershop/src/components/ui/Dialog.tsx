import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Modal, Platform, StyleSheet, View } from 'react-native';

import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

import { Button, type ButtonVariant } from './Button';
import { DirectionView } from './Direction';
import { Icon, type IconName } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  icon?: IconName;
  tone?: 'default' | 'danger' | 'success' | 'accent';
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  onConfirm?: () => void;
  children?: ReactNode;
}

/** Centered confirmation dialog. Always used before destructive or outward-facing actions. */
export function Dialog({ visible, onClose, title, message, icon, tone = 'default', confirmLabel, cancelLabel, confirmVariant, onConfirm, children }: DialogProps) {
  const { colors, radius, shadow } = useTheme();
  const { t } = useI18n();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) Animated.spring(anim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', friction: 8, tension: 90 }).start();
    else anim.setValue(0);
  }, [visible, anim]);
  const toneColor = tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : tone === 'accent' ? colors.accent : colors.text;
  const toneBg = tone === 'danger' ? colors.dangerSoft : tone === 'success' ? colors.successSoft : tone === 'accent' ? colors.accentSoft : colors.surfaceMuted;
  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade" statusBarTranslucent>
      <DirectionView style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} feedback="none" accessibilityLabel={t('common.actions.close')} />
        <Animated.View
          accessibilityRole="alert"
          style={[
            { width: '100%', maxWidth: 380, backgroundColor: colors.backgroundElevated, borderRadius: radius.xl, padding: 24, gap: 16 },
            shadow('lg'),
            { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }], opacity: anim },
          ]}
        >
          {icon ? (
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: toneBg, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} size={22} color={toneColor} />
            </View>
          ) : null}
          <View style={{ gap: 6 }}>
            <Text variant="title3">{title}</Text>
            {message ? (
              <Text variant="callout" tone="secondary">
                {message}
              </Text>
            ) : null}
          </View>
          {children}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label={cancelLabel ?? t('common.actions.cancel')} variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            {onConfirm ? (
              <Button
                label={confirmLabel ?? t('common.actions.confirm')}
                variant={confirmVariant ?? (tone === 'danger' ? 'danger' : 'primary')}
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
                style={{ flex: 1 }}
              />
            ) : null}
          </View>
        </Animated.View>
      </DirectionView>
    </Modal>
  );
}
