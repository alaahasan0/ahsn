import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import type { Barber } from '@/types/models';

/** First name for compact UI ("Yousef", "يوسف"). */
export function barberShortName(barber: Barber, l: (t: Barber['name']) => string) {
  return l(barber.name).split(' ')[0];
}

export function BarberAvatar({ barber, size = 32, ring }: { barber?: Barber; size?: number; ring?: string }) {
  const { l } = useI18n();
  if (!barber) return <Avatar size={size} icon="users" />;
  return <Avatar size={size} color={barber.color} initials={l(barber.initials)} ring={ring} />;
}

/** Avatar + name inline (used in cards and pickers). */
export function BarberInline({ barber, size = 20 }: { barber?: Barber; size?: number }) {
  const { l, t } = useI18n();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <BarberAvatar barber={barber} size={size} />
      <Text variant="footnote" tone="secondary" numberOfLines={1}>
        {barber ? barberShortName(barber, l) : t('common.labels.anyBarberShort')}
      </Text>
    </View>
  );
}
