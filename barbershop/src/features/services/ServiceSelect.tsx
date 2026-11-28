import { View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { useI18n } from '@/i18n';
import { useServices } from '@/store/selectors';
import type { ID } from '@/types/models';

/** Multi-select of services as wrapping chips. */
export function ServiceMultiSelect({ value, onChange, onlyIds }: { value: ID[]; onChange: (ids: ID[]) => void; onlyIds?: ID[] }) {
  const { l } = useI18n();
  const services = useServices().filter((s) => !onlyIds || onlyIds.includes(s.id));
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {services.map((s) => {
        const sel = value.includes(s.id);
        return <Chip key={s.id} label={l(s.name)} selected={sel} icon={sel ? 'check' : undefined} onPress={() => onChange(sel ? value.filter((x) => x !== s.id) : [...value, s.id])} />;
      })}
    </View>
  );
}

/** Single service choice as chips. */
export function ServiceSingleSelect({ value, onChange, onlyIds }: { value?: ID; onChange: (id: ID) => void; onlyIds?: ID[] }) {
  const { l, f } = useI18n();
  const services = useServices().filter((s) => !onlyIds || onlyIds.includes(s.id));
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {services.map((s) => (
        <Chip key={s.id} label={`${l(s.name)} · ${f.duration(s.durationMin)}`} selected={value === s.id} onPress={() => onChange(s.id)} />
      ))}
    </View>
  );
}
