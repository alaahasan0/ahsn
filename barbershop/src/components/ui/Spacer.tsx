import { View } from 'react-native';

export function Spacer({ size = 16, flex }: { size?: number; flex?: boolean }) {
  return <View style={flex ? { flex: 1 } : { height: size, width: size }} />;
}
