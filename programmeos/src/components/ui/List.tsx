import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Switch, View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, useStyles, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text, type TextTone } from './Text';
import { Touchable } from './Touchable';

/** Inset grouped container with hairline separators between rows. */
export function ListGroup({ children, style, inset = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; inset?: boolean }) {
  const s = useStyles(styles);
  const items = Children.toArray(children).filter((c) => isValidElement(c));
  return (
    <View style={[s.group, !inset && s.flat, style]}>
      {items.map((child, i) => (
        <Fragment key={(isValidElement(child) && child.key) || i}>
          {child}
          {i < items.length - 1 ? <View style={s.separator} /> : null}
        </Fragment>
      ))}
    </View>
  );
}

export type ListRowProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  leading?: ReactNode;
  icon?: IconName;
  iconTone?: 'accent' | 'success' | 'warning' | 'danger' | 'violet' | 'info' | 'neutral';
  trailing?: ReactNode;
  value?: string;
  chevron?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  destructive?: boolean;
  titleTone?: TextTone;
  numberOfLines?: number;
  switchValue?: boolean;
  onSwitch?: (v: boolean) => void;
  disabled?: boolean;
  compact?: boolean;
  accessibilityLabel?: string;
};

export function IconTile({ icon, tone = 'accent', size = 30 }: { icon: IconName; tone?: ListRowProps['iconTone']; size?: number }) {
  const { colors } = useTheme();
  const map = {
    accent: [colors.accentSoft, colors.accent],
    success: [colors.successSoft, colors.success],
    warning: [colors.warningSoft, colors.warning],
    danger: [colors.dangerSoft, colors.danger],
    violet: [colors.violetSoft, colors.violet],
    info: [colors.infoSoft, colors.info],
    neutral: [colors.neutralSoft, colors.neutralText],
  } as const;
  const [bg, fg] = map[tone ?? 'accent'];
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={size * 0.56} color={fg} strokeWidth={2} />
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  icon,
  iconTone,
  trailing,
  value,
  chevron,
  onPress,
  onLongPress,
  destructive,
  titleTone,
  numberOfLines = 1,
  switchValue,
  onSwitch,
  disabled,
  compact,
  accessibilityLabel,
}: ListRowProps) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const content = (
    <View style={[s.row, compact && s.compact, disabled && { opacity: 0.45 }]}>
      {leading ?? (icon ? <IconTile icon={icon} tone={iconTone} /> : null)}
      <View style={s.body}>
        <Text variant="bodyStrong" tone={destructive ? 'danger' : titleTone} numberOfLines={numberOfLines}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="subhead" tone="secondary" numberOfLines={2} style={{ marginTop: 1 }}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="footnote" tone="tertiary" numberOfLines={1} style={{ marginTop: 2 }}>
            {meta}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="callout" tone="secondary" numberOfLines={1} style={s.value}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {onSwitch ? (
        <Switch
          value={!!switchValue}
          onValueChange={onSwitch}
          trackColor={{ true: colors.success, false: colors.surfaceAlt }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.surfaceAlt}
          accessibilityLabel={title}
        />
      ) : null}
      {chevron || (onPress && chevron !== false && !onSwitch && !trailing) ? <Icon name="chevron-right" size={18} tone="tertiary" /> : null}
    </View>
  );
  if (!onPress && !onLongPress) return content;
  return (
    <Touchable onPress={onPress} onLongPress={onLongPress} disabled={disabled} feedback="highlight" pressedStyle={s.pressed} accessibilityLabel={accessibilityLabel ?? title} hitSlop={0}>
      {content}
    </Touchable>
  );
}

const styles = makeStyles((t) => ({
  group: { backgroundColor: t.colors.surface, borderRadius: t.radii.lg, overflow: 'hidden', borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  flat: { borderRadius: 0, borderWidth: 0 },
  separator: { height: t.hairline, backgroundColor: t.colors.separator, marginLeft: t.spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, paddingHorizontal: t.spacing.lg, paddingVertical: 12, minHeight: 52 },
  compact: { paddingVertical: 9, minHeight: 44 },
  body: { flex: 1, minWidth: 0 },
  value: { maxWidth: '45%', textAlign: 'right' },
  pressed: { backgroundColor: t.colors.surfacePressed },
}));
