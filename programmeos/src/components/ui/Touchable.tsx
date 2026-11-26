import * as Haptics from 'expo-haptics';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export type TouchableProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  /** Visual feedback when pressed */
  feedback?: 'opacity' | 'highlight' | 'scale' | 'none';
  pressedStyle?: StyleProp<ViewStyle>;
  haptic?: 'selection' | 'light' | 'medium' | 'success' | 'warning' | false;
};

export function haptic(kind: Exclude<TouchableProps['haptic'], false | undefined>) {
  if (Platform.OS === 'web') return;
  try {
    if (kind === 'selection') Haptics.selectionAsync();
    else if (kind === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (kind === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Haptics unavailable — ignore.
  }
}

/** Pressable with consistent, restrained feedback and optional haptics. */
export function Touchable({ style, feedback = 'opacity', pressedStyle, haptic: h, onPress, hitSlop = 6, ...rest }: TouchableProps) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={hitSlop}
      onPress={(e) => {
        if (h) haptic(h);
        onPress?.(e);
      }}
      style={(state) => {
        const base = typeof style === 'function' ? style(state) : style;
        if (!state.pressed || feedback === 'none') return base;
        if (feedback === 'opacity') return [base, { opacity: 0.6 }, pressedStyle];
        if (feedback === 'scale') return [base, { transform: [{ scale: 0.97 }], opacity: 0.92 }, pressedStyle];
        return [base, pressedStyle];
      }}
      {...rest}
    />
  );
}
