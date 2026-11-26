import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { initialsOf } from '@/utils/format';

import { Text } from './Text';

export type AvatarProps = {
  name: string;
  hue?: number;
  size?: number;
  initials?: string;
  ring?: boolean;
  status?: 'online' | 'busy' | 'away';
  square?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Initials avatar with a calm, hue-derived tint (no photos needed in the prototype). */
export function Avatar({ name, hue = 220, size = 36, initials, ring, status, square, style }: AvatarProps) {
  const { colors, isDark } = useTheme();
  const bg = isDark ? `hsl(${hue}, 32%, 26%)` : `hsl(${hue}, 55%, 92%)`;
  const fg = isDark ? `hsl(${hue}, 70%, 82%)` : `hsl(${hue}, 45%, 34%)`;
  const label = initials ?? initialsOf(name);
  return (
    <View
      accessibilityLabel={name}
      style={[
        {
          width: size,
          height: size,
          borderRadius: square ? size * 0.28 : size / 2,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ring ? 2 : 0,
          borderColor: colors.surface,
        },
        style,
      ]}>
      <Text weight="semibold" color={fg} style={{ fontSize: size * 0.38, lineHeight: size * 0.46, letterSpacing: 0.2 }} maxFontSizeMultiplier={1}>
        {label}
      </Text>
      {status ? (
        <View
          style={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size,
            borderWidth: 2,
            borderColor: colors.surface,
            backgroundColor: status === 'online' ? colors.success : status === 'busy' ? colors.danger : colors.warning,
          }}
        />
      ) : null}
    </View>
  );
}

export function AvatarStack({ people, size = 26, max = 4 }: { people: { name: string; hue?: number }[]; size?: number; max?: number }) {
  const { colors } = useTheme();
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {shown.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} name={p.name} hue={p.hue} size={size} ring style={{ marginLeft: i ? -size * 0.32 : 0 }} />
      ))}
      {extra > 0 ? (
        <View style={{ marginLeft: -size * 0.32, width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="caption" tone="secondary" style={{ fontSize: size * 0.36 }}>
            +{extra}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Rounded-square monogram for organisations (clients, hotels, venues). */
export function Monogram({ name, hue = 220, size = 40 }: { name: string; hue?: number; size?: number }) {
  return <Avatar name={name} hue={hue} size={size} square />;
}
