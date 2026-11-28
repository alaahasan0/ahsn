import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import { APPOINTMENT_STATUSES, BOOKING_SOURCES, type AppointmentStatus, type Barber, type BookingSource, type Service } from '@/types/models';

import { barberShortName } from '../BarberAvatar';
import { SOURCE_ICON } from '../meta';

export interface CalendarFilters {
  barberIds: string[];
  serviceIds: string[];
  statuses: AppointmentStatus[];
  sources: BookingSource[];
}

export const EMPTY_FILTERS: CalendarFilters = { barberIds: [], serviceIds: [], statuses: [], sources: [] };

export function activeFilterCount(f: CalendarFilters, includeBarbers = false) {
  return f.serviceIds.length + f.statuses.length + f.sources.length + (includeBarbers ? f.barberIds.length : 0);
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function FiltersSheet({ visible, onClose, value, onApply, barbers, services, showBarbers }: { visible: boolean; onClose: () => void; value: CalendarFilters; onApply: (f: CalendarFilters) => void; barbers: Barber[]; services: Service[]; showBarbers: boolean }) {
  const { status } = useTheme();
  const { t, l } = useI18n();
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const group = (title: string, children: React.ReactNode) => (
    <View style={{ gap: 10 }}>
      <Text variant="overline" tone="tertiary">
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
    </View>
  );

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('calendar.filtersTitle')}
      subtitle={t('calendar.filtersBody')}
      footer={
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button label={t('common.actions.reset')} variant="secondary" onPress={() => setDraft(EMPTY_FILTERS)} style={{ flex: 1 }} />
          <Button
            label={t('calendar.showResults')}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      <View style={{ gap: 22 }}>
        {showBarbers
          ? group(
              t('calendar.filterBarbers'),
              barbers.map((b) => <Chip key={b.id} label={barberShortName(b, l)} dot={b.color} selected={draft.barberIds.includes(b.id)} onPress={() => setDraft({ ...draft, barberIds: toggle(draft.barberIds, b.id) })} />),
            )
          : null}
        {group(
          t('calendar.filterServices'),
          services.map((s) => <Chip key={s.id} label={l(s.name)} selected={draft.serviceIds.includes(s.id)} onPress={() => setDraft({ ...draft, serviceIds: toggle(draft.serviceIds, s.id) })} />),
        )}
        {group(
          t('calendar.filterStatuses'),
          APPOINTMENT_STATUSES.map((st) => <Chip key={st} label={t(`domain.status.${st}`)} dot={status[st].dot} selected={draft.statuses.includes(st)} onPress={() => setDraft({ ...draft, statuses: toggle(draft.statuses, st) })} />),
        )}
        {group(
          t('calendar.filterSources'),
          BOOKING_SOURCES.map((src) => <Chip key={src} label={t(`domain.sourceShort.${src}`)} icon={SOURCE_ICON[src]} selected={draft.sources.includes(src)} onPress={() => setDraft({ ...draft, sources: toggle(draft.sources, src) })} />),
        )}
      </View>
    </Sheet>
  );
}
