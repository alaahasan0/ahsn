import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme';

/** ProgrammeOS mark: an orbit (the programme) around a core (one source of truth). */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="pos" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#6F8DFB" />
          <Stop offset="1" stopColor="#3D5FE0" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="48" height="48" rx="13" fill="url(#pos)" />
      <Path d="M14 31.5c3.2 3.4 7.6 5 12.2 4.2 6.1-1 10.4-6.6 9.6-12.7" stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M34 16.5c-3.2-3.4-7.6-5-12.2-4.2-6.1 1-10.4 6.6-9.6 12.7" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" />
      <Circle cx="24" cy="24" r="4.6" fill="#FFFFFF" />
      <Circle cx="35.6" cy="21.2" r="2.4" fill="#32B995" />
    </Svg>
  );
}

export function Wordmark({ size = 20 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <LogoMark size={size * 1.4} />
      <Text weight="bold" style={{ fontSize: size, lineHeight: size * 1.2, letterSpacing: -0.4 }} color={colors.text}>
        Programme<Text weight="bold" style={{ fontSize: size, lineHeight: size * 1.2 }} color={colors.accentText}>OS</Text>
      </Text>
    </View>
  );
}
