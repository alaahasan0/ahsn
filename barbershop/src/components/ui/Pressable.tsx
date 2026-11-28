import * as Haptics from 'expo-haptics';
import { forwardRef } from 'react';
import { Platform, Pressable as RNPressable, type PressableInstance, type PressableProps as RNPressableProps, type StyleProp, type ViewStyle } from 'react-native';

export interface PressableProps extends Omit<RNPressableProps, 'style'> {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  /** Visual feedback while pressed. */
  feedback?: 'opacity' | 'scale' | 'none';
  haptic?: 'light' | 'selection' | 'none';
}

/** Pressable with restrained press feedback and optional haptics (native only). */
export const Pressable = forwardRef<PressableInstance, PressableProps>(function Pressable({ style, feedback = 'opacity', haptic = 'none', onPress, ...rest }, ref) {
  return (
    <RNPressable
      ref={ref}
      accessibilityRole={rest.accessibilityRole ?? 'button'}
      onPress={(e) => {
        if (haptic !== 'none' && Platform.OS !== 'web') {
          if (haptic === 'selection') Haptics.selectionAsync().catch(() => undefined);
          else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        }
        onPress?.(e);
      }}
      style={(state) => {
        const base = typeof style === 'function' ? style(state) : style;
        if (!state.pressed || feedback === 'none') return base;
        return [base, feedback === 'scale' ? { transform: [{ scale: 0.97 }], opacity: 0.92 } : { opacity: 0.6 }];
      }}
      {...rest}
    />
  );
});
