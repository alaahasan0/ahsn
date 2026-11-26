import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { SearchField } from '@/components/ui/Controls';
import { Text } from '@/components/ui/Text';
import { haptic, Touchable } from '@/components/ui/Touchable';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { addMonths, DEMO_TODAY, formatDateLong, formatMonthYear, monthMatrix, parseDate, sameMonth, startOfMonth, WEEKDAYS_MIN } from '@/utils/dates';
import { searchMatch } from '@/utils/format';

import { Sheet } from './Sheet';

// ─── Action sheet / context menu ──────────────────────────────────────────────

export type ActionItem = { label: string; icon?: IconName; onPress: () => void; destructive?: boolean; detail?: string; disabled?: boolean };

export function ActionSheet({ visible, onClose, title, subtitle, actions }: { visible: boolean; onClose: () => void; title?: string; subtitle?: string; actions: ActionItem[] }) {
  const s = useStyles(styles);
  return (
    <Sheet visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      <View style={s.menu}>
        {actions.map((a, i) => (
          <Touchable
            key={a.label}
            disabled={a.disabled}
            feedback="highlight"
            pressedStyle={s.menuPressed}
            onPress={() => {
              onClose();
              setTimeout(a.onPress, 240);
            }}
            style={[s.menuItem, i < actions.length - 1 && s.menuBorder, a.disabled && { opacity: 0.4 }]}>
            {a.icon ? <Icon name={a.icon} size={20} tone={a.destructive ? 'danger' : 'primary'} /> : null}
            <View style={{ flex: 1 }}>
              <Text variant="body" tone={a.destructive ? 'danger' : 'primary'}>
                {a.label}
              </Text>
              {a.detail ? (
                <Text variant="footnote" tone="secondary">
                  {a.detail}
                </Text>
              ) : null}
            </View>
          </Touchable>
        ))}
      </View>
    </Sheet>
  );
}

// ─── Searchable select ────────────────────────────────────────────────────────

export type SelectOption<T extends string = string> = { value: T; label: string; detail?: string; leading?: ReactNode; icon?: IconName; disabled?: boolean; badge?: ReactNode };

export function SelectSheet<T extends string>({
  visible,
  onClose,
  title,
  options,
  value,
  onSelect,
  multiple,
  values,
  onChangeValues,
  searchable,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: SelectOption<T>[];
  value?: T;
  onSelect?: (v: T) => void;
  multiple?: boolean;
  values?: T[];
  onChangeValues?: (v: T[]) => void;
  searchable?: boolean;
}) {
  const s = useStyles(styles);
  const [q, setQ] = useState('');
  useEffect(() => {
    if (!visible) setQ('');
  }, [visible]);
  const shown = options.filter((o) => searchMatch(q, o.label, o.detail));
  const isSearch = searchable ?? options.length > 8;
  return (
    <Sheet visible={visible} onClose={onClose} title={title} size={options.length > 8 ? 'large' : 'auto'} footer={multiple ? <Button title="Done" onPress={onClose} fullWidth style={{ flex: 1 }} /> : undefined}>
      {isSearch ? <SearchField value={q} onChangeText={setQ} placeholder={`Search ${title.toLowerCase()}`} style={{ marginBottom: 10 }} /> : null}
      <View style={s.menu}>
        {shown.map((o, i) => {
          const selected = multiple ? values?.includes(o.value) : value === o.value;
          return (
            <Touchable
              key={o.value}
              disabled={o.disabled}
              feedback="highlight"
              pressedStyle={s.menuPressed}
              accessibilityState={{ selected }}
              onPress={() => {
                haptic('selection');
                if (multiple) {
                  const cur = values ?? [];
                  onChangeValues?.(selected ? cur.filter((v) => v !== o.value) : [...cur, o.value]);
                } else {
                  onSelect?.(o.value);
                  onClose();
                }
              }}
              style={[s.menuItem, i < shown.length - 1 && s.menuBorder, o.disabled && { opacity: 0.4 }]}>
              {o.leading ?? (o.icon ? <Icon name={o.icon} size={20} tone="secondary" /> : null)}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="body" numberOfLines={1}>
                  {o.label}
                </Text>
                {o.detail ? (
                  <Text variant="footnote" tone="secondary" numberOfLines={2}>
                    {o.detail}
                  </Text>
                ) : null}
              </View>
              {o.badge}
              {selected ? <Icon name="check" size={20} tone="accent" strokeWidth={2.6} /> : multiple ? <View style={s.emptyCheck} /> : null}
            </Touchable>
          );
        })}
        {!shown.length ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text tone="secondary">No matches for “{q}”</Text>
          </View>
        ) : null}
      </View>
    </Sheet>
  );
}

// ─── Calendar & date picker ───────────────────────────────────────────────────

export function MonthCalendar({
  month,
  onMonthChange,
  selected,
  onSelect,
  rangeEnd,
  marks,
  minDate,
  compact,
}: {
  month: string;
  onMonthChange: (m: string) => void;
  selected?: string;
  onSelect?: (d: string) => void;
  rangeEnd?: string;
  marks?: Record<string, string[]>; // date → dot colours
  minDate?: string;
  compact?: boolean;
}) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const weeks = useMemo(() => monthMatrix(month), [month]);
  const cell = compact ? 38 : 44;
  return (
    <View>
      <View style={s.calHeader}>
        <Text variant="title3">{formatMonthYear(month)}</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Touchable onPress={() => onMonthChange(addMonths(month, -1))} accessibilityLabel="Previous month" style={s.calNav}>
            <Icon name="chevron-left" size={20} tone="accent" />
          </Touchable>
          <Touchable onPress={() => onMonthChange(addMonths(month, 1))} accessibilityLabel="Next month" style={s.calNav}>
            <Icon name="chevron-right" size={20} tone="accent" />
          </Touchable>
        </View>
      </View>
      <View style={s.weekRow}>
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <Text key={d} variant="caption" tone="tertiary" align="center" style={{ flex: 1 }}>
            {WEEKDAYS_MIN[d]}
          </Text>
        ))}
      </View>
      {weeks.map((w, wi) => (
        <View key={wi} style={s.weekRow}>
          {w.map((d) => {
            const inMonth = sameMonth(d, month);
            const isSel = d === selected || d === rangeEnd;
            const inRange = selected && rangeEnd && d > selected && d < rangeEnd;
            const isToday = d === DEMO_TODAY;
            const disabled = minDate ? d < minDate : false;
            const dots = marks?.[d] ?? [];
            return (
              <Touchable
                key={d}
                feedback="none"
                disabled={disabled || !onSelect}
                onPress={() => {
                  haptic('selection');
                  onSelect?.(d);
                }}
                accessibilityLabel={formatDateLong(d)}
                accessibilityState={{ selected: isSel, disabled }}
                style={[{ flex: 1, height: cell, alignItems: 'center', justifyContent: 'center' }, inRange && { backgroundColor: colors.accentSoft }]}>
                <View style={[s.day, { width: cell - 6, height: cell - 6, borderRadius: (cell - 6) / 2 }, isSel && { backgroundColor: colors.primary }, !isSel && isToday && { borderWidth: 1.5, borderColor: colors.accent }]}>
                  <Text variant="callout" weight={isSel || isToday ? 'semibold' : 'regular'} tabular color={isSel ? colors.textOnAccent : !inMonth || disabled ? colors.textTertiary : isToday ? colors.accentText : colors.text} style={{ opacity: inMonth ? 1 : 0.5 }}>
                    {parseDate(d).day}
                  </Text>
                </View>
                {dots.length ? (
                  <View style={s.dots}>
                    {dots.slice(0, 3).map((c, i) => (
                      <View key={i} style={[s.dot, { backgroundColor: isSel ? colors.accent : c }]} />
                    ))}
                  </View>
                ) : null}
              </Touchable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function DatePickerSheet({ visible, onClose, value, onChange, title = 'Select date', minDate }: { visible: boolean; onClose: () => void; value?: string; onChange: (d: string) => void; title?: string; minDate?: string }) {
  const [month, setMonth] = useState(startOfMonth(value ?? DEMO_TODAY));
  const [draft, setDraft] = useState(value ?? DEMO_TODAY);
  useEffect(() => {
    if (visible) {
      setDraft(value ?? DEMO_TODAY);
      setMonth(startOfMonth(value ?? DEMO_TODAY));
    }
  }, [visible, value]);
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={formatDateLong(draft, true)}
      footer={
        <>
          <Button title="Today" variant="secondary" onPress={() => { setDraft(DEMO_TODAY); setMonth(startOfMonth(DEMO_TODAY)); }} style={{ flex: 1 }} />
          <Button title="Done" onPress={() => { onChange(draft); onClose(); }} style={{ flex: 2 }} />
        </>
      }>
      <MonthCalendar month={month} onMonthChange={setMonth} selected={draft} onSelect={setDraft} minDate={minDate} />
    </Sheet>
  );
}

// ─── Time picker (wheel columns) ──────────────────────────────────────────────

const ROW = 40;

function Wheel({ items, value, onChange, label }: { items: string[]; value: string; onChange: (v: string) => void; label: string }) {
  const ref = useRef<ScrollViewInstance>(null);
  const { colors } = useTheme();
  const index = Math.max(0, items.indexOf(value));
  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollTo({ y: index * ROW, animated: false }), 30);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ROW);
    const v = items[Math.max(0, Math.min(items.length - 1, i))];
    if (v !== value) {
      haptic('selection');
      onChange(v);
    }
  };
  return (
    <View style={{ flex: 1, height: ROW * 5 }} accessibilityLabel={label} accessibilityValue={{ text: value }}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW}
        decelerationRate="fast"
        onMomentumScrollEnd={onEnd}
        onScrollEndDrag={onEnd}
        contentContainerStyle={{ paddingVertical: ROW * 2 }}>
        {items.map((it) => (
          <Touchable
            key={it}
            feedback="none"
            onPress={() => {
              onChange(it);
              ref.current?.scrollTo({ y: items.indexOf(it) * ROW, animated: true });
            }}
            style={{ height: ROW, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="title2" tabular color={it === value ? colors.text : colors.textTertiary} weight={it === value ? 'semibold' : 'regular'}>
              {it}
            </Text>
          </Touchable>
        ))}
      </ScrollView>
    </View>
  );
}

export function TimePickerSheet({ visible, onClose, value = '09:00', onChange, title = 'Select time', zoneLabel }: { visible: boolean; onClose: () => void; value?: string; onChange: (t: string) => void; title?: string; zoneLabel?: string }) {
  const s = useStyles(styles);
  const [h, setH] = useState(value.slice(0, 2));
  const [m, setM] = useState(value.slice(3, 5));
  useEffect(() => {
    if (visible) {
      setH(value.slice(0, 2));
      const mm = Math.round(Number(value.slice(3, 5)) / 5) * 5;
      setM(String(mm === 60 ? 55 : mm).padStart(2, '0'));
    }
  }, [visible, value]);
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const mins = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={zoneLabel}
      footer={<Button title={`Set ${h}:${m}`} onPress={() => { onChange(`${h}:${m}`); onClose(); }} fullWidth style={{ flex: 1 }} />}>
      {visible ? (
        <View style={s.wheelWrap}>
          <View style={s.wheelHighlight} pointerEvents="none" />
          <Wheel items={hours} value={h} onChange={setH} label="Hour" />
          <Text variant="title2" style={{ alignSelf: 'center' }}>
            :
          </Text>
          <Wheel items={mins} value={m} onChange={setM} label="Minute" />
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = makeStyles((t) => ({
  menu: { backgroundColor: t.colors.surface, borderRadius: t.radii.lg, overflow: 'hidden', borderWidth: t.hairline, borderColor: t.colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, minHeight: 52, paddingVertical: 10 },
  menuBorder: { borderBottomWidth: t.hairline, borderBottomColor: t.colors.separator },
  menuPressed: { backgroundColor: t.colors.surfacePressed },
  emptyCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: t.colors.borderStrong },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  calNav: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row' },
  day: { alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: 2, flexDirection: 'row', gap: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  wheelWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 40, paddingVertical: 8 },
  wheelHighlight: { position: 'absolute', left: 24, right: 24, top: 8 + ROW * 2, height: ROW, borderRadius: 10, backgroundColor: t.colors.surfaceAlt },
}));
