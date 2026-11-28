import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Appointment, Customer } from '@/types/models';

import { TIMELINE_META } from './helpers';

/** Compact metric tile used on profile screens. */
export function MiniStat({ label, value, caption, tone }: { label: string; value: string; caption?: string; tone?: 'danger' | 'success' | 'warning' }) {
  const { colors, radius } = useTheme();
  const color = tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : colors.text;
  return (
    <View style={{ flex: 1, minWidth: 130, padding: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 4 }}>
      <Text variant="footnote" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
      <Text variant="title3" tabular color={color} numberOfLines={1}>
        {value}
      </Text>
      {caption ? (
        <Text variant="caption" tone="tertiary" numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

/** Label/value row with optional icon, for info cards. */
export function InfoRow({ icon, label, value, children, ltr }: { icon?: IconName; label: string; value?: string; children?: ReactNode; ltr?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, minHeight: 52 }}>
      {icon ? <Icon name={icon} size={17} color={colors.textTertiary} /> : null}
      <Text variant="callout" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
        {label}
      </Text>
      {value ? (
        <Text variant="callout" weight="medium" numberOfLines={1} style={[{ maxWidth: '60%' }, ltr ? { writingDirection: 'ltr' } : null]}>
          {value}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/** Round quick-action with a label underneath. */
export function QuickAction({ icon, label, onPress, primary, color }: { icon: IconName; label: string; onPress: () => void; primary?: boolean; color?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} feedback="scale" accessibilityLabel={label} style={{ alignItems: 'center', gap: 6, flex: 1 }}>
      <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: primary ? colors.accent : colors.surface, borderWidth: primary ? 0 : 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={primary ? colors.accentText : color ?? colors.text} />
      </View>
      <Text variant="caption" tone="secondary" align="center" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Vertical activity timeline for a customer (appointments + joined event). */
export function CustomerTimeline({ customer, appointments, limit }: { customer: Customer; appointments: Appointment[]; limit?: number }) {
  const { colors, status } = useTheme();
  const { t, f, l } = useI18n();
  const look = useLookup();
  const items = appointments.slice().sort((a, b) => b.start.localeCompare(a.start));
  const shown = limit ? items.slice(0, limit) : items;
  const showJoined = !limit || items.length < limit;
  return (
    <View>
      {shown.map((a, i) => {
        const meta = TIMELINE_META[a.status];
        const tone = status[a.status];
        const barber = look.barber(a.barberId);
        const last = i === shown.length - 1 && !showJoined;
        return (
          <Pressable key={a.id} onPress={() => router.push(`/appointment/${a.id}`)} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center', width: 28 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: tone.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={meta.icon} size={13} color={tone.fg} />
              </View>
              {!last ? <View style={{ flex: 1, width: 2, backgroundColor: colors.separator, marginVertical: 2 }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: 16, gap: 2 }}>
              <Text variant="subhead" numberOfLines={1}>
                {t(`customers.timeline.${meta.key}`, { service: l(look.service(a.serviceId)?.name) })}
              </Text>
              <Text variant="footnote" tone="secondary" numberOfLines={1}>
                {f.dateShort(new Date(a.start))} · {f.time(new Date(a.start))}
                {barber ? ` · ${t('customers.timeline.withBarber', { barber: l(barber.name).split(' ')[0] })}` : ''}
              </Text>
            </View>
          </Pressable>
        );
      })}
      {showJoined ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user-plus" size={13} color={colors.accent} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="subhead">{t('customers.timeline.joined')}</Text>
            <Text variant="footnote" tone="secondary">
              {f.dateMedium(new Date(customer.createdAt))}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
