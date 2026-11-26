import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Avatar, Icon, Text, Touchable, type IconName } from '@/components';
import { makeStyles, useStyles } from '@/theme';

export type ProfileAction = { icon: IconName; label: string; onPress: () => void };

/** Identity block shared by faculty, learner and staff profiles. */
export function ProfileHeader({
  name,
  hue,
  initials,
  title,
  subtitle,
  meta,
  badges,
  actions,
}: {
  name: string;
  hue?: number;
  initials?: string;
  title?: string;
  subtitle?: string;
  meta?: string;
  badges?: ReactNode;
  actions?: ProfileAction[];
}) {
  const s = useStyles(styles);
  return (
    <View style={s.wrap}>
      <View style={s.top}>
        <Avatar name={name} hue={hue} initials={initials} size={72} />
        <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
          {title ? (
            <Text variant="callout" weight="medium" numberOfLines={2}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="subhead" tone="secondary" numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          {meta ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="map-pin" size={12} tone="tertiary" />
              <Text variant="footnote" tone="tertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
                {meta}
              </Text>
            </View>
          ) : null}
          {badges ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>{badges}</View> : null}
        </View>
      </View>
      {actions?.length ? (
        <View style={s.actions}>
          {actions.map((a) => (
            <Touchable key={a.label} onPress={a.onPress} feedback="scale" style={s.action} accessibilityLabel={a.label}>
              <Icon name={a.icon} size={19} tone="accent" />
              <Text variant="caption" tone="accent" numberOfLines={1}>
                {a.label}
              </Text>
            </Touchable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = makeStyles((t) => ({
  wrap: { gap: t.spacing.lg },
  top: { flexDirection: 'row', gap: t.spacing.lg, alignItems: 'center' },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 56, borderRadius: t.radii.md, backgroundColor: t.colors.surface, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
}));
