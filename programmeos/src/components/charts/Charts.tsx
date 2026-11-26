import { useEffect, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { Text } from '@/components/ui/Text';
import { haptic, Touchable } from '@/components/ui/Touchable';
import { textStyleFor, useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function useWidth(initial = 0) {
  const [w, setW] = useState(initial);
  return [w, (e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width))] as const;
}

// ─── Progress ring ────────────────────────────────────────────────────────────

export function ProgressRing({ value, size = 64, stroke = 7, color, track, children, label }: { value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode; label?: string }) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(Math.max(0, Math.min(100, value)) / 100, { duration: 800 });
  }, [value, p]);
  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track ?? colors.chartTrack} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

// ─── Bar chart (vertical, optional grouped series, tap to inspect) ────────────

export type BarSeries = { name: string; color: string; values: number[] };

export function BarChart({ labels, series, height = 180, format = (n: number) => String(n), highlightLast, stacked, targetLine }: { labels: string[]; series: BarSeries[]; height?: number; format?: (n: number) => string; highlightLast?: boolean; stacked?: boolean; targetLine?: { value: number; label: string } }) {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const [sel, setSel] = useState<number | null>(null);
  const padTop = 22;
  const padBottom = 22;
  const chartH = height - padTop - padBottom;
  const totals = labels.map((_, i) => (stacked ? series.reduce((s, se) => s + (se.values[i] ?? 0), 0) : Math.max(...series.map((se) => se.values[i] ?? 0))));
  const max = Math.max(1, ...totals, targetLine?.value ?? 0) * 1.08;
  const groupW = w / Math.max(1, labels.length);
  const barGap = 3;
  const innerW = Math.min(groupW * 0.64, stacked ? 30 : 14 * series.length + barGap * (series.length - 1));
  const barW = stacked ? innerW : (innerW - barGap * (series.length - 1)) / series.length;
  const y = (v: number) => padTop + chartH - (v / max) * chartH;
  const lbl = textStyleFor('caption');
  return (
    <View onLayout={onLayout} style={{ height }}>
      {w > 0 ? (
        <Svg width={w} height={height}>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <Line key={f} x1={0} x2={w} y1={padTop + chartH * (1 - f)} y2={padTop + chartH * (1 - f)} stroke={colors.chartGrid} strokeWidth={1} />
          ))}
          <Line x1={0} x2={w} y1={padTop + chartH} y2={padTop + chartH} stroke={colors.border} strokeWidth={1} />
          {targetLine ? (
            <G>
              <Line x1={0} x2={w} y1={y(targetLine.value)} y2={y(targetLine.value)} stroke={colors.textTertiary} strokeDasharray="4 4" strokeWidth={1} />
              <SvgText x={w - 2} y={y(targetLine.value) - 4} fill={colors.textTertiary} fontSize={10} textAnchor="end" fontFamily={lbl.fontFamily}>
                {targetLine.label}
              </SvgText>
            </G>
          ) : null}
          {labels.map((l, i) => {
            const gx = i * groupW + (groupW - innerW) / 2;
            const dim = sel != null && sel !== i;
            let acc = 0;
            return (
              <G key={l} opacity={dim ? 0.35 : 1}>
                {series.map((se, si) => {
                  const v = se.values[i] ?? 0;
                  const h = (v / max) * chartH;
                  const x = stacked ? gx : gx + si * (barW + barGap);
                  const top = stacked ? padTop + chartH - acc - h : y(v);
                  acc += stacked ? h : 0;
                  const faded = highlightLast && i !== labels.length - 1 && sel == null;
                  return <Rect key={se.name} x={x} y={top} width={Math.max(2, barW)} height={Math.max(0, h)} rx={Math.min(4, barW / 2)} fill={se.color} opacity={faded ? 0.55 : 1} />;
                })}
                <SvgText x={i * groupW + groupW / 2} y={height - 6} fill={sel === i ? colors.text : colors.textTertiary} fontSize={10.5} textAnchor="middle" fontFamily={lbl.fontFamily} fontWeight={sel === i ? '600' : '400'}>
                  {l}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      ) : null}
      {/* Touch targets */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' }}>
        {labels.map((l, i) => (
          <Touchable
            key={l}
            feedback="none"
            hitSlop={0}
            style={{ flex: 1 }}
            accessibilityLabel={`${l}: ${series.map((se) => `${se.name} ${format(se.values[i] ?? 0)}`).join(', ')}`}
            onPress={() => {
              haptic('selection');
              setSel(sel === i ? null : i);
            }}
          />
        ))}
      </View>
      {sel != null && w > 0 ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: Math.min(Math.max(0, sel * groupW + groupW / 2 - 70), w - 140), width: 140, alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.text, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 1 }}>
            {series.map((se) => (
              <Text key={se.name} variant="caption" color={colors.background} numberOfLines={1}>
                {series.length > 1 ? `${se.name}: ` : `${labels[sel]}: `}
                {format(se.values[sel] ?? 0)}
              </Text>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ─── Line / area chart ────────────────────────────────────────────────────────

export function LineChart({ labels, series, height = 170, format = (n: number) => String(n), area = true, yMax }: { labels: string[]; series: { name: string; color: string; values: (number | null)[]; dashed?: boolean }[]; height?: number; format?: (n: number) => string; area?: boolean; yMax?: number }) {
  const { colors } = useTheme();
  const [w, onLayout] = useWidth();
  const [sel, setSel] = useState<number | null>(null);
  const padTop = 16;
  const padBottom = 22;
  const padX = 8;
  const chartH = height - padTop - padBottom;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v != null));
  const max = yMax ?? Math.max(1, ...all) * 1.1;
  const min = 0;
  const step = labels.length > 1 ? (w - padX * 2) / (labels.length - 1) : 0;
  const px = (i: number) => padX + i * step;
  const py = (v: number) => padTop + chartH - ((v - min) / (max - min)) * chartH;
  const lbl = textStyleFor('caption');
  const pathFor = (vals: (number | null)[]) => {
    let d = '';
    vals.forEach((v, i) => {
      if (v == null) return;
      d += `${d ? 'L' : 'M'}${px(i).toFixed(1)},${py(v).toFixed(1)} `;
    });
    return d;
  };
  return (
    <View onLayout={onLayout} style={{ height }}>
      {w > 0 ? (
        <Svg width={w} height={height}>
          <Defs>
            {series.map((s, i) => (
              <LinearGradient key={s.name} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={s.color} stopOpacity={0.22} />
                <Stop offset="1" stopColor={s.color} stopOpacity={0} />
              </LinearGradient>
            ))}
          </Defs>
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <Line key={f} x1={0} x2={w} y1={padTop + chartH * (1 - f)} y2={padTop + chartH * (1 - f)} stroke={colors.chartGrid} strokeWidth={1} />
          ))}
          {series.map((s, i) => {
            const d = pathFor(s.values);
            const lastIdx = s.values.reduce((acc: number, v, j) => (v != null ? j : acc), 0);
            const firstIdx = s.values.findIndex((v) => v != null);
            return (
              <G key={s.name}>
                {area && !s.dashed && d ? <Path d={`${d} L${px(lastIdx)},${padTop + chartH} L${px(firstIdx)},${padTop + chartH} Z`} fill={`url(#g${i})`} /> : null}
                <Path d={d} stroke={s.color} strokeWidth={2.2} fill="none" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? '5 5' : undefined} />
                {sel != null && s.values[sel] != null ? <Circle cx={px(sel)} cy={py(s.values[sel]!)} r={4.5} fill={colors.surface} stroke={s.color} strokeWidth={2.2} /> : null}
              </G>
            );
          })}
          {sel != null ? <Line x1={px(sel)} x2={px(sel)} y1={padTop} y2={padTop + chartH} stroke={colors.borderStrong} strokeWidth={1} /> : null}
          {labels.map((l, i) => (
            <SvgText key={l + i} x={px(i)} y={height - 6} fill={sel === i ? colors.text : colors.textTertiary} fontSize={10.5} textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'} fontFamily={lbl.fontFamily}>
              {labels.length > 8 && i % 2 && i !== labels.length - 1 ? '' : l}
            </SvgText>
          ))}
        </Svg>
      ) : null}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' }}>
        {labels.map((l, i) => (
          <Touchable key={l + i} feedback="none" hitSlop={0} style={{ flex: 1 }} accessibilityLabel={`${l}: ${series.map((s) => `${s.name} ${s.values[i] != null ? format(s.values[i]!) : 'no data'}`).join(', ')}`} onPress={() => { haptic('selection'); setSel(sel === i ? null : i); }} />
        ))}
      </View>
      {sel != null && w > 0 ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: -6, left: Math.min(Math.max(0, px(sel) - 70), w - 140), width: 140, alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.text, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text variant="caption" color={colors.background} weight="semibold">
              {labels[sel]}
            </Text>
            {series.map((s) =>
              s.values[sel] != null ? (
                <Text key={s.name} variant="caption" color={colors.background} numberOfLines={1}>
                  {s.name}: {format(s.values[sel]!)}
                </Text>
              ) : null,
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

// ─── Donut ────────────────────────────────────────────────────────────────────

export function DonutChart({ data, size = 140, stroke = 18, centerLabel, centerValue, format = (n: number) => String(n) }: { data: { label: string; value: number; color: string }[]; size?: number; stroke?: number; centerLabel?: string; centerValue?: string; format?: (n: number) => string }) {
  const { colors } = useTheme();
  const [sel, setSel] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offsets = data.reduce<number[]>((acc, d, i) => [...acc, i === 0 ? 0 : acc[i - 1] + (data[i - 1].value / total) * c], []);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.chartTrack} strokeWidth={stroke} fill="none" />
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const gap = data.length > 1 ? 2.5 : 0;
            return (
              <Circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={d.color}
                strokeWidth={sel === i ? stroke + 3 : stroke}
                strokeOpacity={sel != null && sel !== i ? 0.35 : 1}
                fill="none"
                strokeDasharray={`${Math.max(0, len - gap)} ${c}`}
                strokeDashoffset={-offsets[i]}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
        </Svg>
        <View style={{ alignItems: 'center', maxWidth: size - stroke * 2 - 8 }}>
          <Text variant="metricSm" numberOfLines={1} adjustsFontSizeToFit>
            {sel != null ? format(data[sel].value) : centerValue}
          </Text>
          <Text variant="caption" tone="tertiary" align="center" numberOfLines={2}>
            {sel != null ? data[sel].label : centerLabel}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, gap: 8 }}>
        {data.map((d, i) => (
          <Touchable key={d.label} onPress={() => { haptic('selection'); setSel(sel === i ? null : i); }} feedback="opacity" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: sel != null && sel !== i ? 0.5 : 1 }} accessibilityLabel={`${d.label} ${format(d.value)}`}>
            <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: d.color }} />
            <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
              {d.label}
            </Text>
            <Text variant="footnote" weight="semibold" tabular>
              {Math.round((d.value / total) * 100)}%
            </Text>
          </Touchable>
        ))}
      </View>
    </View>
  );
}

// ─── Horizontal bars (ranked list) ────────────────────────────────────────────

export function HBarList({ items, format = (n: number) => String(n), max, threshold }: { items: { label: string; value: number; color?: string; detail?: string; onPress?: () => void }[]; format?: (n: number) => string; max?: number; threshold?: number }) {
  const { colors } = useTheme();
  const m = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <View style={{ gap: 12 }}>
      {items.map((it) => {
        const pct = Math.min(100, (it.value / m) * 100);
        const row = (
          <View style={{ gap: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text variant="callout" numberOfLines={1} style={{ flex: 1 }}>
                {it.label}
              </Text>
              {it.detail ? (
                <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                  {it.detail}
                </Text>
              ) : null}
              <Text variant="callout" weight="semibold" tabular>
                {format(it.value)}
              </Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.chartTrack, overflow: 'hidden' }}>
              <View style={{ width: `${pct}%`, height: 8, borderRadius: 4, backgroundColor: it.color ?? colors.accent }} />
              {threshold ? <View style={{ position: 'absolute', left: `${(threshold / m) * 100}%`, top: -2, bottom: -2, width: 2, backgroundColor: colors.text, opacity: 0.35 }} /> : null}
            </View>
          </View>
        );
        return it.onPress ? (
          <Touchable key={it.label} onPress={it.onPress} accessibilityLabel={`${it.label} ${format(it.value)}`}>
            {row}
          </Touchable>
        ) : (
          <View key={it.label}>{row}</View>
        );
      })}
    </View>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

export function Sparkline({ values, width = 72, height = 26, color }: { values: number[]; width?: number; height?: number; color?: string }) {
  const { colors } = useTheme();
  const max = Math.max(...values);
  const min = Math.min(...values);
  const step = width / Math.max(1, values.length - 1);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(height - 2 - ((v - min) / Math.max(1, max - min)) * (height - 4)).toFixed(1)}`).join(' ');
  return (
    <Svg width={width} height={height}>
      <Path d={d} stroke={color ?? colors.accent} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Semi-circle gauge ────────────────────────────────────────────────────────

export function Gauge({ value, max = 100, size = 180, color, label, valueLabel }: { value: number; max?: number; size?: number; color?: string; label?: string; valueLabel?: string }) {
  const { colors } = useTheme();
  const stroke = 14;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const frac = Math.max(0, Math.min(1, value / max));
  const arc = (f: number) => {
    const a = Math.PI * (1 - f);
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };
  const end = arc(frac);
  const start = arc(0);
  const full = arc(1);
  return (
    <View style={{ width: size, height: size / 2 + 26, alignItems: 'center' }}>
      <Svg width={size} height={size / 2 + stroke}>
        <Path d={`M${start.x},${start.y} A${r},${r} 0 0 1 ${full.x},${full.y}`} stroke={colors.chartTrack} strokeWidth={stroke} fill="none" strokeLinecap="round" />
        <Path d={`M${start.x},${start.y} A${r},${r} 0 0 1 ${end.x},${end.y}`} stroke={color ?? colors.accent} strokeWidth={stroke} fill="none" strokeLinecap="round" />
      </Svg>
      <View style={{ position: 'absolute', bottom: 0, alignItems: 'center' }}>
        <Text variant="metric">{valueLabel ?? String(value)}</Text>
        {label ? (
          <Text variant="caption" tone="tertiary">
            {label}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      {items.map((i) => (
        <View key={i.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 10, height: i.dashed ? 2 : 10, borderRadius: 3, backgroundColor: i.color }} />
          <Text variant="footnote" tone="secondary">
            {i.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
