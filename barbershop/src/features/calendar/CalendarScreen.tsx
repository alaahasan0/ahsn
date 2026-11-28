import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { barberShortName } from '@/components/domain/BarberAvatar';
import { activeFilterCount, AgendaView, DayView, EMPTY_FILTERS, FiltersSheet, INACTIVE, MonthPicker, WeekView, type CalendarFilters } from '@/components/domain/calendar';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { SearchBar } from '@/components/ui/SearchBar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { addDays, isSameDay, startOfDay, startOfWeek, toISODate } from '@/lib/dates';
import { useAppState } from '@/store/AppStore';
import { filterAppointments, useBarbers, useServices } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Appointment } from '@/types/models';

type View_ = 'day' | 'week' | 'agenda';

export interface CalendarScreenProps {
  /** Lock the calendar to one barber (barber workspace). */
  barberId?: string;
  inTabs?: boolean;
}

export default function CalendarScreen({ barberId, inTabs }: CalendarScreenProps) {
  const { colors, radius, shadow } = useTheme();
  const { t, tp, f, l } = useI18n();
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const allBarbers = useBarbers();
  const services = useServices({ includeInactive: true });
  const [view, setView] = useState<View_>('day');
  const [date, setDate] = useState(today());
  const [filters, setFilters] = useState<CalendarFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const locked = !!barberId;
  const visibleBarbers = useMemo(() => {
    if (locked) return allBarbers.filter((b) => b.id === barberId);
    return filters.barberIds.length ? allBarbers.filter((b) => filters.barberIds.includes(b.id)) : allBarbers;
  }, [allBarbers, filters.barberIds, locked, barberId]);
  const barberIds = visibleBarbers.map((b) => b.id);

  const weekStart = startOfWeek(date);
  const [from, to] = useMemo((): [Date, Date] => {
    if (view === 'week') return [weekStart, addDays(weekStart, 7)];
    if (view === 'agenda') return [startOfDay(date), addDays(startOfDay(date), 14)];
    return [startOfDay(date), addDays(startOfDay(date), 1)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, date.getTime()]);

  const inRange = useMemo(() => {
    const list = state.appointments.filter((a) => {
      const s = new Date(a.start);
      return s >= from && s < to;
    });
    return filterAppointments(state, list, { barberIds, serviceIds: filters.serviceIds, statuses: filters.statuses, sources: filters.sources });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.appointments, state.customers, from.getTime(), to.getTime(), barberIds.join(','), filters]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const lo = addDays(today(), -30);
    const hi = addDays(today(), 31);
    const list = state.appointments.filter((a) => {
      const s = new Date(a.start);
      return s >= lo && s < hi;
    });
    return filterAppointments(state, list, { barberIds, query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, state.appointments, barberIds.join(',')]);

  const dayCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of state.appointments) {
      if (INACTIVE.has(a.status) || !barberIds.includes(a.barberId)) continue;
      const k = a.start.slice(0, 10);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.appointments, barberIds.join(',')]);

  const step = (dir: 1 | -1) => setDate(addDays(date, (view === 'week' ? 7 : view === 'agenda' ? 14 : 1) * dir));
  const openAppointment = (a: Appointment) => router.push(`/appointment/${a.id}`);
  const newAppointment = (bid?: string, start?: Date) => {
    const params = new URLSearchParams();
    const b = bid ?? (visibleBarbers.length === 1 ? visibleBarbers[0].id : undefined);
    if (b) params.set('barberId', b);
    params.set('date', toISODate(start ?? date));
    if (start) params.set('time', `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`);
    router.push(`/appointment/new?${params.toString()}`);
  };

  const isToday = isSameDay(date, today());
  const label =
    view === 'week'
      ? `${f.dayMonth(weekStart)} – ${f.dayMonth(addDays(weekStart, 6))}`
      : view === 'agenda'
        ? t('calendar.agendaFrom', { date: f.dayMonth(date) })
        : isToday
          ? `${t('common.actions.today')} · ${f.dateShort(date)}`
          : f.dateLong(date);
  const filterCount = activeFilterCount(filters);
  const dayActive = (bid: string) => state.appointments.filter((a) => a.barberId === bid && isSameDay(new Date(a.start), date) && !INACTIVE.has(a.status)).length;

  return (
    <Screen
      inTabs={inTabs}
      scroll={false}
      padded={false}
      header={
        <Header
          variant="large"
          back={false}
          title={t('calendar.title')}
          subtitle={locked ? l(visibleBarbers[0]?.name) : undefined}
          right={
            <>
              <IconButton icon={searchOpen ? 'x' : 'search'} onPress={() => { setSearchOpen(!searchOpen); setQuery(''); }} accessibilityLabel={t('common.actions.search')} variant="filled" size={38} iconSize={18} />
              <IconButton icon="sliders" onPress={() => setFiltersOpen(true)} accessibilityLabel={t('common.actions.filters')} variant="filled" size={38} iconSize={18} badge={filterCount || undefined} />
            </>
          }
        >
          {searchOpen ? <SearchBar value={query} onChangeText={setQuery} placeholder={t('calendar.searchPlaceholder')} autoFocus /> : null}
          {!query ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <IconButton icon="chevron-left" onPress={() => step(-1)} accessibilityLabel={t('calendar.previous')} size={36} />
                <Pressable onPress={() => setPickerOpen(true)} accessibilityLabel={t('calendar.pickDate')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 36 }}>
                  <Text variant="headline" numberOfLines={1} align="center">
                    {label}
                  </Text>
                  <Icon name="chevron-down" size={14} color={colors.textTertiary} />
                </Pressable>
                <IconButton icon="chevron-right" onPress={() => step(1)} accessibilityLabel={t('calendar.next')} size={36} />
                <Pressable
                  onPress={() => setDate(today())}
                  disabled={isToday && view !== 'week'}
                  style={{ height: 30, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', opacity: isToday ? 0.45 : 1 }}
                >
                  <Text variant="caption">{t('common.actions.today')}</Text>
                </Pressable>
              </View>
              <SegmentedControl
                size="sm"
                value={view}
                onChange={setView}
                segments={[
                  { value: 'day', label: t('calendar.views.day') },
                  { value: 'week', label: t('calendar.views.week') },
                  { value: 'agenda', label: t('calendar.views.agenda') },
                ]}
              />
              {!locked ? (
                <ChipRow contentPadding={0}>
                  <Chip size="sm" label={t('calendar.allBarbers')} selected={filters.barberIds.length === 0} onPress={() => setFilters({ ...filters, barberIds: [] })} />
                  {allBarbers.map((b) => (
                    <Chip
                      key={b.id}
                      size="sm"
                      label={barberShortName(b, l)}
                      dot={b.color}
                      count={view === 'day' ? dayActive(b.id) : undefined}
                      selected={filters.barberIds.includes(b.id)}
                      onPress={() => setFilters({ ...filters, barberIds: filters.barberIds.includes(b.id) ? filters.barberIds.filter((x) => x !== b.id) : [...filters.barberIds, b.id] })}
                    />
                  ))}
                </ChipRow>
              ) : null}
            </>
          ) : (
            <Text variant="footnote" tone="secondary">
              {`${tp('common.counts.results', searchResults.length)} · ${t('calendar.searchResults')}`}
            </Text>
          )}
        </Header>
      }
    >
      <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: colors.separator }}>
        {query ? (
          <AgendaView from={today()} appointments={searchResults} flat showBarber={!locked} emptyTitle={t('common.states.noResults')} emptyBody={t('common.states.noResultsBody')} />
        ) : view === 'day' ? (
          <DayView
            date={date}
            barbers={visibleBarbers}
            appointments={inRange}
            blocks={state.blocks}
            onPressAppointment={openAppointment}
            onPressSlot={(bid, start) => newAppointment(bid, start)}
            onPressBarber={locked ? undefined : (bid) => setFilters({ ...filters, barberIds: [bid] })}
          />
        ) : view === 'week' ? (
          <WeekView
            weekStart={weekStart}
            selected={date}
            barbers={visibleBarbers}
            appointments={inRange}
            onPressAppointment={openAppointment}
            onPressDay={(d) => {
              setDate(d);
              setView('day');
            }}
          />
        ) : (
          <AgendaView from={date} appointments={inRange} showBarber={!locked} />
        )}
      </View>
      <Pressable
        onPress={() => newAppointment()}
        feedback="scale"
        haptic="light"
        accessibilityLabel={t('calendar.newAppointment')}
        testID="calendar-fab"
        style={[{ position: 'absolute', end: 20, bottom: inTabs ? 20 : insets.bottom + 20, height: 56, paddingHorizontal: 20, borderRadius: 28, backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', gap: 8 }, shadow('lg')]}
      >
        <Icon name="plus" size={20} color={colors.accentText} />
        <Text variant="headline" color={colors.accentText}>
          {t('calendar.newAppointment')}
        </Text>
      </Pressable>
      <FiltersSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} value={filters} onApply={setFilters} barbers={allBarbers} services={services} showBarbers={!locked} />
      <MonthPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} value={date} onChange={setDate} countFor={(d) => dayCounts.get(toISODate(d)) ?? 0} />
    </Screen>
  );
}
