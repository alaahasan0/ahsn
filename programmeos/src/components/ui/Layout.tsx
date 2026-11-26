import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, useStyles, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { toneColors, type Tone } from './StatusPill';
import { Text } from './Text';
import { Touchable } from './Touchable';

export function Section({ title, action, onAction, children, style, subtitle, first }: { title?: string; subtitle?: string; action?: string; onAction?: () => void; children: ReactNode; style?: StyleProp<ViewStyle>; first?: boolean }) {
  const s = useStyles(styles);
  return (
    <View style={[s.section, first && { marginTop: 4 }, style]}>
      {title ? <SectionHeader title={title} subtitle={subtitle} action={action} onAction={onAction} /> : null}
      {children}
    </View>
  );
}

export function SectionHeader({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  const s = useStyles(styles);
  return (
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        <Text variant="title3" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="subhead" tone="secondary" style={{ marginTop: 1 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Touchable onPress={onAction} accessibilityLabel={action} hitSlop={10}>
          <Text variant="label" tone="accent" weight="semibold">
            {action}
          </Text>
        </Touchable>
      ) : null}
    </View>
  );
}

export function Row({ children, gap = 8, style, align = 'center', justify }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle>; align?: ViewStyle['alignItems']; justify?: ViewStyle['justifyContent'] }) {
  return <View style={[{ flexDirection: 'row', alignItems: align, gap, justifyContent: justify }, style]}>{children}</View>;
}

export function Stack({ children, gap = 8, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

export function Divider({ inset = 0, style }: { inset?: number; style?: StyleProp<ViewStyle> }) {
  const { colors, hairline } = useTheme();
  return <View style={[{ height: hairline, backgroundColor: colors.separator, marginLeft: inset }, style]} />;
}

export function Spacer({ size = 16 }: { size?: number }) {
  return <View style={{ height: size }} />;
}

/** Label/value pairs, e.g. programme facts. */
export function KeyValue({ label, value, icon, valueTone, last, onPress, multiline }: { label: string; value: string; icon?: IconName; valueTone?: 'primary' | 'accent' | 'danger' | 'success' | 'warning'; last?: boolean; onPress?: () => void; multiline?: boolean }) {
  const s = useStyles(styles);
  const body = (
    <View style={[s.kv, !last && s.kvBorder]}>
      <View style={s.kvLabel}>
        {icon ? <Icon name={icon} size={16} tone="tertiary" /> : null}
        <Text variant="callout" tone="secondary" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text variant="callout" weight="medium" tone={valueTone ?? 'primary'} style={s.kvValue} numberOfLines={multiline ? 3 : 2}>
        {value}
      </Text>
      {onPress ? <Icon name="chevron-right" size={16} tone="tertiary" /> : null}
    </View>
  );
  return onPress ? (
    <Touchable onPress={onPress} accessibilityLabel={`${label}: ${value}`}>
      {body}
    </Touchable>
  ) : (
    body
  );
}

export function Stat({ label, value, caption, tone, icon, style, onPress, trend }: { label: string; value: string; caption?: string; tone?: Tone; icon?: IconName; style?: StyleProp<ViewStyle>; onPress?: () => void; trend?: { dir: 'up' | 'down'; text: string; good?: boolean } }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const tc = tone ? toneColors(tone, colors) : null;
  const content = (
    <>
      <View style={s.statTop}>
        <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
          {label}
        </Text>
        {icon ? <Icon name={icon} size={15} color={tc?.solid ?? colors.textTertiary} /> : null}
      </View>
      <Text variant="metric" color={tc?.fg} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      {trend ? (
        <View style={s.trend}>
          <Icon name={trend.dir === 'up' ? 'trending-up' : 'trending-down'} size={13} color={trend.good === false ? colors.danger : colors.success} />
          <Text variant="caption" color={trend.good === false ? colors.dangerText : colors.successText} numberOfLines={1}>
            {trend.text}
          </Text>
        </View>
      ) : caption ? (
        <Text variant="caption" tone="tertiary" numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </>
  );
  if (onPress)
    return (
      <Touchable onPress={onPress} feedback="scale" style={[s.stat, style]} accessibilityLabel={`${label} ${value}`}>
        {content}
      </Touchable>
    );
  return <View style={[s.stat, style]}>{content}</View>;
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{children}</View>;
}

/** Inline contextual banner. */
export function Banner({ tone = 'info', title, message, icon, action, onAction, onDismiss, style }: { tone?: Tone; title: string; message?: string; icon?: IconName; action?: string; onAction?: () => void; onDismiss?: () => void; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  const t = toneColors(tone, colors);
  const defaultIcon: IconName = tone === 'danger' ? 'circle-alert' : tone === 'warning' ? 'triangle-alert' : tone === 'success' ? 'circle-check' : 'info';
  return (
    <View style={[{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 14, backgroundColor: t.bg }, style]} accessibilityRole="alert">
      <View style={{ paddingTop: 1 }}>
        <Icon name={icon ?? defaultIcon} size={18} color={t.solid} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="headline" color={t.fg}>
          {title}
        </Text>
        {message ? (
          <Text variant="subhead" tone="secondary">
            {message}
          </Text>
        ) : null}
        {action ? (
          <Touchable onPress={onAction} style={{ marginTop: 6 }} hitSlop={8}>
            <Text variant="label" weight="semibold" color={t.fg}>
              {action} →
            </Text>
          </Touchable>
        ) : null}
      </View>
      {onDismiss ? (
        <Touchable onPress={onDismiss} accessibilityLabel="Dismiss" hitSlop={10}>
          <Icon name="x" size={16} tone="tertiary" />
        </Touchable>
      ) : null}
    </View>
  );
}

const styles = makeStyles((t) => ({
  section: { marginTop: t.spacing.xxl, gap: t.spacing.md },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: t.spacing.md },
  kv: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, gap: t.spacing.md },
  kvBorder: { borderBottomWidth: t.hairline, borderBottomColor: t.colors.separator },
  kvLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0, maxWidth: '45%' },
  kvValue: { flex: 1, textAlign: 'right' },
  stat: { flexGrow: 1, flexBasis: '46%', minWidth: 140, backgroundColor: t.colors.surface, borderRadius: t.radii.lg, padding: 14, gap: 4, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
}));
