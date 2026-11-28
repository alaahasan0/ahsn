import { router } from 'expo-router';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { useTheme } from '@/theme';
import type { Customer, CustomerStats } from '@/types/models';

import { CategoryBadge } from './Badges';

export interface CustomerRowProps {
  customer: Customer;
  stats?: CustomerStats;
  onPress?: () => void;
  selected?: boolean;
  /** Show the last-visit line (lists) vs phone (pickers). */
  detail?: 'visits' | 'phone';
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CustomerRow({ customer, stats, onPress, selected, detail = 'visits', trailing, style }: CustomerRowProps) {
  const { colors, radius } = useTheme();
  const { l, f, tp, t } = useI18n();
  const press = onPress ?? (() => router.push(`/customers/${customer.id}`));
  const sub =
    detail === 'phone'
      ? f.phone(customer.phone.country, customer.phone.number)
      : stats?.lastVisit
        ? `${tp('common.counts.visits', stats.totalVisits)} · ${f.relative(new Date(stats.lastVisit.start), now())}`
        : t('domain.categoryLong.new');
  return (
    <Pressable onPress={press} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: selected ? colors.accentSoft : 'transparent' }, style]}>
      <Avatar name={l(customer.name)} size={44} />
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="callout" weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
            {l(customer.name)}
          </Text>
          {customer.whatsapp && customer.whatsappVerification === 'verified' ? <Icon name="ion:logo-whatsapp" size={13} color={colors.whatsapp} /> : null}
        </View>
        <Text variant="footnote" tone="secondary" numberOfLines={1} style={detail === 'phone' ? { writingDirection: 'ltr' } : undefined}>
          {sub}
        </Text>
      </View>
      {trailing ?? <CategoryBadge category={customer.category} />}
      {selected ? <Icon name="check" size={18} color={colors.accent} /> : null}
    </Pressable>
  );
}
