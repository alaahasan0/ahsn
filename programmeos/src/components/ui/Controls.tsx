import { useEffect, useState } from 'react';
import { ScrollView, TextInput, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { fontFor, makeStyles, useStyles, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { CountBadge } from './StatusPill';
import { Text } from './Text';
import { haptic, Touchable } from './Touchable';

// ─── Search field ─────────────────────────────────────────────────────────────

export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  onFilterPress,
  filterCount = 0,
  autoFocus,
  style,
}: {
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  filterCount?: number;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  return (
    <View style={[s.searchRow, style]}>
      <View style={s.search}>
        <Icon name="search" size={17} tone="tertiary" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          style={[s.searchInput, fontFor('regular')]}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus={autoFocus}
          clearButtonMode="never"
          accessibilityLabel={placeholder}
        />
        {value ? (
          <Touchable onPress={() => onChangeText('')} accessibilityLabel="Clear search" hitSlop={10}>
            <Icon name="circle-x" size={17} tone="tertiary" />
          </Touchable>
        ) : null}
      </View>
      {onFilterPress ? (
        <Touchable onPress={onFilterPress} accessibilityLabel="Filters" style={[s.filterBtn, filterCount > 0 && { backgroundColor: colors.accentSoft }]}>
          <Icon name="sliders-horizontal" size={18} tone={filterCount ? 'accent' : 'primary'} />
          {filterCount > 0 ? (
            <View style={{ position: 'absolute', top: -4, right: -4 }}>
              <CountBadge count={filterCount} tone="accent" />
            </View>
          ) : null}
        </Touchable>
      ) : null}
    </View>
  );
}

// ─── Segmented control ────────────────────────────────────────────────────────

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
  size = 'md',
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md';
}) {
  const s = useStyles(styles);
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segW = width ? (width - 4) / options.length : 0;
  const x = useSharedValue(0);
  const [placed, setPlaced] = useState(false);
  useEffect(() => {
    if (!segW) return;
    // Jump into place on first layout; ease (no overshoot) on later changes.
    x.set(placed ? withTiming(index * segW, { duration: 220, easing: Easing.out(Easing.cubic) }) : index * segW);
    if (!placed) setTimeout(() => setPlaced(true), 0);
  }, [index, segW, x, placed]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View style={[s.segTrack, size === 'sm' && { height: 30 }, style]} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} accessibilityRole="tablist">
      {segW ? <Animated.View style={[s.segThumb, { width: segW }, thumb]} /> : null}
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Touchable
            key={o.value}
            feedback="none"
            onPress={() => {
              if (!active) haptic('selection');
              onChange(o.value);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            style={s.segItem}
            hitSlop={2}>
            <Text variant={size === 'sm' ? 'footnote' : 'label'} weight={active ? 'semibold' : 'medium'} tone={active ? 'primary' : 'secondary'} numberOfLines={1}>
              {o.label}
              {o.count != null ? <Text variant="footnote" tone="tertiary">{`  ${o.count}`}</Text> : null}
            </Text>
          </Touchable>
        );
      })}
    </View>
  );
}

// ─── Underline tabs (scrollable, for workspaces) ──────────────────────────────

export function UnderlineTabs<T extends string>({ tabs, value, onChange }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void }) {
  const s = useStyles(styles);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs} accessibilityRole="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <Touchable key={t.value} feedback="opacity" onPress={() => onChange(t.value)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={[s.tab, active && s.tabActive]}>
            <Text variant="label" weight={active ? 'semibold' : 'medium'} tone={active ? 'primary' : 'secondary'}>
              {t.label}
              {t.count != null ? <Text variant="footnote" tone="tertiary">{` ${t.count}`}</Text> : null}
            </Text>
          </Touchable>
        );
      })}
    </ScrollView>
  );
}

// ─── Chips ────────────────────────────────────────────────────────────────────

export function Chip({ label, selected, onPress, icon, onRemove, count }: { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; onRemove?: () => void; count?: number }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  return (
    <Touchable onPress={onPress} feedback="opacity" accessibilityState={{ selected: !!selected }} style={[s.chip, selected && { backgroundColor: colors.text, borderColor: colors.text }]}>
      {icon ? <Icon name={icon} size={14} color={selected ? colors.background : colors.textSecondary} /> : null}
      <Text variant="label" color={selected ? colors.background : colors.text} numberOfLines={1}>
        {label}
        {count != null ? <Text variant="footnote" color={selected ? colors.background : colors.textTertiary}>{`  ${count}`}</Text> : null}
      </Text>
      {onRemove ? (
        <Touchable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${label}`}>
          <Icon name="x" size={14} color={selected ? colors.background : colors.textSecondary} />
        </Touchable>
      ) : null}
    </Touchable>
  );
}

export function ChipRow({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[{ gap: 8, paddingHorizontal: 16 }, style]} style={{ marginHorizontal: -16, flexGrow: 0 }}>
      {children}
    </ScrollView>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export function ProgressBar({ value, color, height = 6, track, animated = true, style }: { value: number; color?: string; height?: number; track?: string; animated?: boolean; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const v = useSharedValue(animated ? 0 : value);
  useEffect(() => {
    v.value = animated ? withTiming(Math.max(0, Math.min(100, value)), { duration: 600 }) : value;
  }, [value, animated, v]);
  const fill = useAnimatedStyle(() => ({ width: `${v.value}%` }));
  return (
    <View style={[{ height, borderRadius: height, backgroundColor: track ?? colors.chartTrack, overflow: 'hidden' }, style]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}>
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: color ?? colors.accent }, fill]} />
    </View>
  );
}

/** Multi-segment bar, e.g. actual / committed / budget. */
export function SegmentBar({ segments, height = 8, total }: { segments: { value: number; color: string }[]; height?: number; total?: number }) {
  const { colors } = useTheme();
  const sum = total ?? segments.reduce((a, b) => a + b.value, 0);
  return (
    <View style={{ flexDirection: 'row', height, borderRadius: height, overflow: 'hidden', backgroundColor: colors.chartTrack }}>
      {segments.map((seg, i) => (
        <View key={i} style={{ width: `${sum ? (seg.value / sum) * 100 : 0}%`, backgroundColor: seg.color, marginRight: i < segments.length - 1 && seg.value ? 1.5 : 0 }} />
      ))}
    </View>
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export function Checkbox({ checked, onChange, tone = 'success', size = 24, accessibilityLabel }: { checked: boolean; onChange?: (v: boolean) => void; tone?: 'success' | 'accent'; size?: number; accessibilityLabel?: string }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const fill = tone === 'success' ? colors.success : colors.accent;
  return (
    <Touchable
      feedback="none"
      hitSlop={10}
      onPress={() => {
        scale.set(withSpring(0.82, { damping: 12, stiffness: 400 }, () => {
          scale.set(withSpring(1));
        }));
        haptic(checked ? 'selection' : 'success');
        onChange?.(!checked);
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}>
      <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, borderWidth: checked ? 0 : 1.6, borderColor: colors.borderStrong, backgroundColor: checked ? fill : 'transparent', alignItems: 'center', justifyContent: 'center' }, anim]}>
        {checked ? <Icon name="check" size={size * 0.62} color="#FFFFFF" strokeWidth={3} /> : null}
      </Animated.View>
    </Touchable>
  );
}

const styles = makeStyles((t) => ({
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, borderRadius: t.radii.md, paddingHorizontal: 12, backgroundColor: t.isDark ? t.colors.surfaceAlt : '#E9EBEE' },
  searchInput: { flex: 1, fontSize: 15, color: t.colors.text, paddingVertical: 0, height: 40, outlineStyle: 'none' } as never,
  filterBtn: { width: 40, height: 40, borderRadius: t.radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: t.isDark ? t.colors.surfaceAlt : '#E9EBEE' },
  segTrack: { flexDirection: 'row', height: 34, padding: 2, borderRadius: 9, backgroundColor: t.isDark ? t.colors.surfaceAlt : '#E7E9EC' },
  segThumb: { position: 'absolute', top: 2, bottom: 2, left: 2, borderRadius: 7, backgroundColor: t.isDark ? '#353B45' : '#FFFFFF', shadowColor: '#000', shadowOpacity: t.isDark ? 0 : 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabs: { gap: t.spacing.xl, paddingHorizontal: t.spacing.gutter, borderBottomWidth: t.hairline, borderBottomColor: t.colors.border },
  tab: { paddingVertical: 11, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: t.colors.text },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border },
}));
