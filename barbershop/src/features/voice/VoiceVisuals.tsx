import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { useTheme } from '@/theme';

export type VoicePhase = 'idle' | 'listening' | 'processing' | 'responding' | 'awaiting' | 'confirm' | 'completed' | 'error';

const native = Platform.OS !== 'web';

function useLoop(active: boolean, make: () => Animated.CompositeAnimation, reset: () => void) {
  useEffect(() => {
    if (!active) {
      reset();
      return;
    }
    const loop = Animated.loop(make());
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

/** The microphone orb. Pulsing rings while listening, breathing while processing. */
export function VoiceOrb({ phase, onPress, label, size = 76 }: { phase: VoicePhase; onPress: () => void; label: string; size?: number }) {
  const { colors } = useTheme();
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;
  const listening = phase === 'listening';
  const thinking = phase === 'processing' || phase === 'responding';

  useLoop(
    listening,
    () =>
      Animated.stagger(600, [
        Animated.timing(ring1, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: native }),
        Animated.timing(ring2, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: native }),
      ]),
    () => {
      ring1.setValue(0);
      ring2.setValue(0);
    },
  );
  useLoop(
    thinking,
    () => Animated.sequence([Animated.timing(breathe, { toValue: 0.9, duration: 600, useNativeDriver: native }), Animated.timing(breathe, { toValue: 1, duration: 600, useNativeDriver: native })]),
    () => breathe.setValue(1),
  );

  const bg = phase === 'error' ? colors.danger : phase === 'completed' ? colors.success : listening ? colors.accent : colors.ink;
  const fg = phase === 'error' || phase === 'completed' ? '#FFFFFF' : listening ? colors.accentText : colors.inkText;
  const icon = listening ? 'square' : phase === 'completed' ? 'check' : phase === 'error' ? 'rotate-ccw' : 'mic';
  const ring = (v: Animated.Value) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.accent,
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
  });

  return (
    <View style={{ width: size * 1.9, height: size * 1.5, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={ring(ring1)} />
      <Animated.View style={ring(ring2)} />
      <Animated.View style={{ transform: [{ scale: breathe }] }}>
        <Pressable
          onPress={onPress}
          feedback="scale"
          haptic="light"
          accessibilityLabel={label}
          testID="voice-mic"
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name={icon} size={listening ? 22 : 28} color={fg} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

/** Live waveform bars shown under the transcript while listening. */
export function Waveform({ active, bars = 11, height = 28 }: { active: boolean; bars?: number; height?: number }) {
  const { colors } = useTheme();
  const values = useRef(Array.from({ length: bars }, () => new Animated.Value(0.2))).current;
  useEffect(() => {
    if (!active) {
      values.forEach((v) => v.setValue(0.2));
      return;
    }
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 0.35 + ((i * 37) % 60) / 100, duration: 220 + ((i * 53) % 180), useNativeDriver: native }),
          Animated.timing(v, { toValue: 0.15 + ((i * 17) % 20) / 100, duration: 200 + ((i * 29) % 160), useNativeDriver: native }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, values]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height }}>
      {values.map((v, i) => (
        <Animated.View key={i} style={{ width: 4, height, borderRadius: 2, backgroundColor: colors.accent, transform: [{ scaleY: v }] }} />
      ))}
    </View>
  );
}

/** Three bouncing dots for the processing state. */
export function TypingDots() {
  const { colors } = useTheme();
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.stagger(
        160,
        dots.map((d) => Animated.sequence([Animated.timing(d, { toValue: 1, duration: 280, useNativeDriver: native }), Animated.timing(d, { toValue: 0.3, duration: 280, useNativeDriver: native })])),
      ),
    );
    loop.start();
    return () => loop.stop();
  }, [dots]);
  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 6 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textTertiary, opacity: d, transform: [{ scale: d }] }} />
      ))}
    </View>
  );
}
