import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Appointment } from '@/types/models';

import { SOURCE_ICON } from '../meta';
import { INACTIVE } from './layout';

/** A booking drawn inside the time grid. Adapts its content to the available height. */
export function AppointmentBlock({ appointment: a, height, onPress, compact }: { appointment: Appointment; height: number; onPress: () => void; compact?: boolean }) {
  const { status, colors, radius } = useTheme();
  const { l, f } = useI18n();
  const look = useLookup();
  const tone = status[a.status];
  const muted = INACTIVE.has(a.status);
  const customer = look.customer(a.customerId);
  const service = look.service(a.serviceId);
  const start = new Date(a.start);
  const tall = height >= 52;
  return (
    <Pressable
      onPress={onPress}
      feedback="opacity"
      accessibilityLabel={`${l(customer?.name)}, ${l(service?.name)}, ${f.time(start)}`}
      style={{
        flex: 1,
        borderRadius: radius.xs,
        backgroundColor: muted ? colors.surfaceMuted : tone.bg,
        borderStartWidth: 3,
        borderStartColor: muted ? colors.borderStrong : tone.dot,
        paddingHorizontal: compact ? 3 : 6,
        paddingVertical: height < 28 ? 1 : 4,
        overflow: 'hidden',
        opacity: muted ? 0.7 : 1,
      }}
    >
      {compact ? null : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text variant="caption" color={muted ? colors.textTertiary : tone.fg} numberOfLines={1} style={{ flex: 1, fontSize: 11, lineHeight: 14, textDecorationLine: a.status === 'cancelled' ? 'line-through' : 'none' }} weight="semibold">
              {l(customer?.name)}
            </Text>
            {tall ? <Icon name={SOURCE_ICON[a.source]} size={10} color={muted ? colors.textTertiary : tone.fg} /> : null}
          </View>
          {height >= 36 ? (
            <Text variant="caption" color={muted ? colors.textTertiary : tone.fg} numberOfLines={1} style={{ fontSize: 10, lineHeight: 13, opacity: 0.85 }}>
              {f.time(start)}
              {tall ? '' : ` · ${l(service?.name)}`}
            </Text>
          ) : null}
          {tall ? (
            <Text variant="caption" color={muted ? colors.textTertiary : tone.fg} numberOfLines={height >= 80 ? 2 : 1} style={{ fontSize: 10, lineHeight: 13, opacity: 0.85 }}>
              {l(service?.name)}
            </Text>
          ) : null}
        </>
      )}
    </Pressable>
  );
}
