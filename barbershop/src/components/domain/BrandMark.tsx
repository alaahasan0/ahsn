import Svg, { Circle, Path, Rect } from 'react-native-svg';

/** Product mark: a barber-pole stripe inside a rounded tile. Vector, theme-independent. */
export function BrandMark({ size = 48, tile = '#A9582A', fg = '#FFF7F0' }: { size?: number; tile?: string; fg?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Rect x={0} y={0} width={64} height={64} rx={18} fill={tile} />
      <Rect x={24} y={12} width={16} height={40} rx={8} fill="none" stroke={fg} strokeWidth={3.5} />
      <Path d="M26 24 L38 18 M26 33 L38 27 M26 42 L38 36" stroke={fg} strokeWidth={3.5} strokeLinecap="round" />
      <Circle cx={32} cy={8.5} r={3} fill={fg} />
      <Circle cx={32} cy={55.5} r={3} fill={fg} />
    </Svg>
  );
}
