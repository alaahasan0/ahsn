import { createContext, useContext, useState, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { fontFor, useTheme } from '@/theme';

export type DialogOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: IconName;
  tone?: 'accent' | 'danger' | 'success' | 'warning';
  /** Ask for an optional comment (e.g. approval notes) */
  input?: { placeholder: string; required?: boolean };
};

type Pending = DialogOptions & { resolve: (r: { confirmed: boolean; text?: string }) => void };

const DialogContext = createContext<{ confirm: (o: DialogOptions) => Promise<{ confirmed: boolean; text?: string }> } | null>(null);

/** Imperative, promise-based confirmation dialog: `const { confirmed } = await dialog.confirm({...})` */
export function DialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [text, setText] = useState('');
  const [api] = useState(() => ({
    confirm: (o: DialogOptions) =>
      new Promise<{ confirmed: boolean; text?: string }>((resolve) => {
        setText('');
        setPending({ ...o, resolve });
      }),
  }));
  const close = (confirmed: boolean) => {
    pending?.resolve({ confirmed, text: text.trim() || undefined });
    setPending(null);
  };
  return (
    <DialogContext.Provider value={api}>
      {children}
      {pending ? <DialogView o={pending} text={text} setText={setText} onClose={close} /> : null}
    </DialogContext.Provider>
  );
}

function DialogView({ o, text, setText, onClose }: { o: Pending; text: string; setText: (s: string) => void; onClose: (c: boolean) => void }) {
  const { colors, isDark } = useTheme();
  const tone = o.destructive ? 'danger' : (o.tone ?? 'accent');
  const tint = { accent: [colors.accentSoft, colors.accent], danger: [colors.dangerSoft, colors.danger], success: [colors.successSoft, colors.success], warning: [colors.warningSoft, colors.warning] }[tone];
  const disabled = !!o.input?.required && !text.trim();
  return (
    <Modal visible transparent animationType="none" onRequestClose={() => onClose(false)} statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(140)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 28 }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => onClose(false)} accessibilityLabel="Dismiss dialog" />
        <Animated.View
          entering={ZoomIn.duration(200).springify().damping(20)}
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={{ width: '100%', maxWidth: 360, borderRadius: 22, padding: 22, gap: 10, backgroundColor: isDark ? colors.surfaceRaised : colors.surface, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 30, elevation: 12 }}>
          {o.icon ? (
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: tint[0], alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
              <Icon name={o.icon} size={24} color={tint[1]} />
            </View>
          ) : null}
          <Text variant="title3" align="center">
            {o.title}
          </Text>
          {o.message ? (
            <Text variant="callout" tone="secondary" align="center">
              {o.message}
            </Text>
          ) : null}
          {o.input ? (
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={o.input.placeholder}
              placeholderTextColor={colors.textTertiary}
              multiline
              style={[fontFor('regular'), { alignSelf: 'stretch', minHeight: 72, borderRadius: 12, padding: 12, fontSize: 15, color: colors.text, backgroundColor: colors.surfaceAlt, textAlignVertical: 'top', marginTop: 4 }]}
            />
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 8 }}>
            <Button title={o.cancelLabel ?? 'Cancel'} variant="secondary" onPress={() => onClose(false)} style={{ flex: 1 }} />
            <Button title={o.confirmLabel ?? 'Confirm'} variant={o.destructive ? 'destructive' : 'primary'} onPress={() => onClose(true)} style={{ flex: 1 }} disabled={disabled} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export function useDialog() {
  const d = useContext(DialogContext);
  if (!d) throw new Error('useDialog must be used inside DialogProvider');
  return d;
}
