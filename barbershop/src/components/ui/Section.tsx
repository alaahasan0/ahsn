import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Divider } from './Divider';
import { Pressable } from './Pressable';
import { Text } from './Text';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Wrap children in a card with hairline separators between rows. */
  card?: boolean;
  footer?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Horizontal padding for the header when the section content is full-bleed. */
  headerInset?: number;
}

export function Section({ title, subtitle, actionLabel, onAction, card, footer, children, style, headerInset = 0 }: SectionProps) {
  const { colors, radius, shadow, isDark } = useTheme();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[{ gap: 10 }, style]}>
      {title || actionLabel ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: headerInset, gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            {title ? <Text variant="headline">{title}</Text> : null}
            {subtitle ? (
              <Text variant="footnote" tone="secondary">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {actionLabel ? (
            <Pressable onPress={onAction} hitSlop={8}>
              <Text variant="subhead" tone="accent">
                {actionLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {card ? (
        <View style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: isDark ? 1 : 0, borderColor: colors.border }, isDark ? null : shadow('sm')]}>
          {items.map((child, i) => (
            <Fragment key={(child as { key?: string }).key ?? i}>
              {i > 0 ? <Divider inset={16} /> : null}
              {child}
            </Fragment>
          ))}
        </View>
      ) : (
        children
      )}
      {footer ? (
        <Text variant="footnote" tone="tertiary" style={{ paddingHorizontal: 4 }}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}
