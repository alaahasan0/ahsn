import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useBarbers } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Barber, ID } from '@/types/models';

function BarberOption({ barber, selected, onPress, label }: { barber?: Barber; selected: boolean; onPress: () => void; label?: string }) {
  const { colors, radius } = useTheme();
  const { l } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      haptic="selection"
      accessibilityState={{ selected }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, paddingEnd: 14, borderRadius: radius.md, borderWidth: 1.5, borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.accentSoft : colors.surface }}
    >
      {barber ? <BarberAvatar barber={barber} size={30} /> : <Avatar size={30} icon="shuffle" />}
      <View style={{ flexShrink: 1 }}>
        <Text variant="subhead" numberOfLines={1}>
          {label ?? l(barber?.name)}
        </Text>
      </View>
      {selected ? <Icon name="check" size={16} color={colors.accent} /> : null}
    </Pressable>
  );
}

/** Single barber choice. `allowNone` adds a "No preference" option (value undefined). */
export function BarberSelect({ value, onChange, allowNone, noneLabel, onlyIds }: { value?: ID; onChange: (id?: ID) => void; allowNone?: boolean; noneLabel?: string; onlyIds?: ID[] }) {
  const barbers = useBarbers().filter((b) => !onlyIds || onlyIds.includes(b.id));
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {allowNone ? <BarberOption selected={!value} onPress={() => onChange(undefined)} label={noneLabel} /> : null}
      {barbers.map((b) => (
        <BarberOption key={b.id} barber={b} selected={value === b.id} onPress={() => onChange(b.id)} />
      ))}
    </View>
  );
}

export function BarberMultiSelect({ value, onChange }: { value: ID[]; onChange: (ids: ID[]) => void }) {
  const barbers = useBarbers({ includeInactive: true });
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {barbers.map((b) => {
        const sel = value.includes(b.id);
        return <BarberOption key={b.id} barber={b} selected={sel} onPress={() => onChange(sel ? value.filter((x) => x !== b.id) : [...value, b.id])} />;
      })}
    </View>
  );
}
