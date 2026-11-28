import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export function Divider({ inset = 0, style, vertical }: { inset?: number; style?: StyleProp<ViewStyle>; vertical?: boolean }) {
  const { colors } = useTheme();
  if (vertical) return <View style={[{ width: StyleSheet.hairlineWidth * 2, alignSelf: 'stretch', backgroundColor: colors.separator }, style]} />;
  return <View style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.separator, marginStart: inset }, style]} />;
}
