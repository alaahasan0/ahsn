import { router } from 'expo-router';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { addMinutes } from '@/lib/dates';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Appointment } from '@/types/models';

import { StatusBadge, SourceTag } from './Badges';
import { BarberInline } from './BarberAvatar';

export interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
  /** 'row': time column + details (agenda/lists). 'card': standalone card with avatar. 'mini': one line. */
  variant?: 'row' | 'card' | 'mini';
  showBarber?: boolean;
  showDate?: boolean;
  highlight?: boolean;
  style?: StyleProp<ViewStyle>;
  right?: React.ReactNode;
}

export function AppointmentCard({ appointment: a, onPress, variant = 'row', showBarber = true, showDate, highlight, style, right }: AppointmentCardProps) {
  const { colors, radius, status, shadow, isDark } = useTheme();
  const { l, f } = useI18n();
  const look = useLookup();
  const customer = look.customer(a.customerId);
  const service = look.service(a.serviceId);
  const barber = look.barber(a.barberId);
  const start = new Date(a.start);
  const end = addMinutes(start, a.durationMin);
  const tone = status[a.status];
  const muted = a.status === 'cancelled' || a.status === 'no_show' || a.status === 'rescheduled' || a.status === 'expired';
  const press = onPress ?? (() => router.push(`/appointment/${a.id}`));

  if (variant === 'mini') {
    return (
      <Pressable onPress={press} style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }, style]}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tone.dot }} />
        <Text variant="subhead" tabular style={{ width: 72 }}>
          {f.time(start)}
        </Text>
        <Text variant="callout" numberOfLines={1} style={{ flex: 1 }}>
          {l(customer?.name)}
        </Text>
        <Text variant="footnote" tone="secondary" numberOfLines={1}>
          {l(service?.name)}
        </Text>
      </Pressable>
    );
  }

  if (variant === 'card') {
    return (
      <Pressable
        onPress={press}
        feedback="scale"
        style={[
          { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, gap: 12, borderWidth: highlight ? 1.5 : isDark ? 1 : 0, borderColor: highlight ? colors.accent : colors.border },
          isDark ? null : shadow('sm'),
          style,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={l(customer?.name)} size={44} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headline" numberOfLines={1}>
              {l(customer?.name)}
            </Text>
            <Text variant="footnote" tone="secondary" numberOfLines={1}>
              {l(service?.name)} · {f.duration(a.durationMin)}
            </Text>
          </View>
          {right ?? <StatusBadge status={a.status} short />}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="clock" size={14} color={colors.textTertiary} />
            <Text variant="subhead" tabular>
              {showDate ? `${f.dateShort(start)} · ` : ''}
              {f.timeRange(start, end)}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          {showBarber ? <BarberInline barber={barber} /> : null}
          <SourceTag source={a.source} showLabel={false} />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={press}
      feedback="opacity"
      style={[{ flexDirection: 'row', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: highlight ? 1.5 : 1, borderColor: highlight ? colors.accent : colors.border, opacity: muted ? 0.72 : 1 }, style]}
      accessibilityLabel={`${l(customer?.name)}, ${l(service?.name)}, ${f.time(start)}`}
    >
      <View style={{ width: 64, gap: 2 }}>
        {showDate ? (
          <Text variant="caption" tone="tertiary" numberOfLines={1}>
            {f.dayShort(start)}
          </Text>
        ) : null}
        <Text variant="subhead" tabular numberOfLines={1}>
          {f.time(start)}
        </Text>
        <Text variant="caption" tone="tertiary">
          {f.duration(a.durationMin)}
        </Text>
      </View>
      <View style={{ width: 3, borderRadius: 2, backgroundColor: tone.dot }} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="callout" weight="semibold" numberOfLines={1} style={{ flex: 1, textDecorationLine: a.status === 'cancelled' ? 'line-through' : 'none' }}>
            {l(customer?.name)}
          </Text>
          {right ?? <StatusBadge status={a.status} short />}
        </View>
        <Text variant="footnote" tone="secondary" numberOfLines={1}>
          {l(service?.name)} · {f.money(a.price)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {showBarber ? <BarberInline barber={barber} size={18} /> : null}
          <SourceTag source={a.source} />
          {a.recurringId && a.source !== 'recurring' ? <Icon name="repeat" size={12} color={colors.textTertiary} /> : null}
          {a.notes.length ? <Icon name="file-text" size={12} color={colors.textTertiary} /> : null}
        </View>
      </View>
    </Pressable>
  );
}
