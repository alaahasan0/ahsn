import { View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import type { AppointmentStatus, BookingSource, CustomerCategory, WhatsAppVerification } from '@/types/models';

import { CATEGORY_ICON, SOURCE_ICON, STATUS_ICON } from './meta';

export function StatusBadge({ status, size = 'sm', short }: { status: AppointmentStatus; size?: 'sm' | 'md'; short?: boolean }) {
  const { status: tones } = useTheme();
  const { t } = useI18n();
  const tone = tones[status];
  const label = short && status === 'pending' ? t('domain.status.pendingShort') : t(`domain.status.${status}`);
  return <Badge label={label} fg={tone.fg} bg={tone.bg} icon={size === 'md' ? STATUS_ICON[status] : undefined} dot={size === 'sm'} size={size} />;
}

/** Small source marker: icon + optional label. */
export function SourceTag({ source, showLabel = true, short = true }: { source: BookingSource; showLabel?: boolean; short?: boolean }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const color = source === 'whatsapp' ? colors.whatsapp : colors.textTertiary;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityLabel={t(`domain.source.${source}`)}>
      <Icon name={SOURCE_ICON[source]} size={13} color={color} />
      {showLabel ? (
        <Text variant="caption" tone="tertiary" numberOfLines={1}>
          {short ? t(`domain.sourceShort.${source}`) : t(`domain.source.${source}`)}
        </Text>
      ) : null}
    </View>
  );
}

export function CategoryBadge({ category, size = 'sm' }: { category: CustomerCategory; size?: 'sm' | 'md' }) {
  const { t } = useI18n();
  const tone = category === 'trusted' ? 'success' : category === 'regular' ? 'info' : 'accent';
  return <Badge label={t(`domain.category.${category}`)} tone={tone} icon={CATEGORY_ICON[category]} size={size} />;
}

export function WhatsAppStatus({ status, compact }: { status: WhatsAppVerification; compact?: boolean }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const map = {
    verified: { icon: 'check-circle' as const, color: colors.whatsapp, label: t('common.phone.verified') },
    pending: { icon: 'clock' as const, color: colors.warning, label: t('common.phone.pending') },
    unverified: { icon: 'help-circle' as const, color: colors.textTertiary, label: t('common.phone.unverified') },
  }[status];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={map.icon} size={13} color={map.color} />
      {!compact ? (
        <Text variant="caption" color={map.color}>
          {map.label}
        </Text>
      ) : null}
    </View>
  );
}
