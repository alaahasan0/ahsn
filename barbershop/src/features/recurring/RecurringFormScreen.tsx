import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { addDays, fromISODate, toISODate } from '@/lib/dates';
import { nextOccurrences } from '@/lib/recurrence';
import { useActions, useAppState } from '@/store/AppStore';
import { barberWorksOn, isSlotFree } from '@/store/availability';
import { useAvailabilityContext, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { ClockTime, ID, RecurrenceFrequency, RecurringMode, RecurringSeries, Weekday } from '@/types/models';

import { DateField, FieldLabel, PickerField, Stepper, TimePickerSheet, ToggleRow, WEEK_ORDER } from '../availability/controls';
import { CustomerPickerSheet } from '../customers/CustomerPickerSheet';
import { ServiceSingleSelect } from '../services/ServiceSelect';
import { BarberSelect } from '../team/BarberSelect';
import { ruleText } from './helpers';

type EndMode = 'never' | 'onDate' | 'after';

export default function RecurringFormScreen({ id }: { id?: string }) {
  const params = useLocalSearchParams<{ customerId?: string }>();
  const { colors, radius } = useTheme();
  const i18n = useI18n();
  const { t, tp, l, f } = i18n;
  const actions = useActions();
  const toast = useToast();
  const look = useLookup();
  const ctx = useAvailabilityContext();
  const { recurring, salon } = useAppState();
  const existing = recurring.find((r) => r.id === id);
  const initialCustomer = existing ? look.customer(existing.customerId) : look.customer(params.customerId);

  const [customerId, setCustomerId] = useState<ID | undefined>(existing?.customerId ?? initialCustomer?.id);
  const [serviceId, setServiceId] = useState<ID>(existing?.serviceId ?? initialCustomer?.preferredServiceIds[0] ?? 's1');
  const [barberId, setBarberId] = useState<ID>(existing?.barberId ?? initialCustomer?.preferredBarberId ?? 'b2');
  const [mode, setMode] = useState<RecurringMode>(existing?.mode ?? 'fixed');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(existing?.frequency ?? 'biweekly');
  const [intervalWeeks, setIntervalWeeks] = useState(existing?.intervalWeeks ?? 3);
  const [weekday, setWeekday] = useState<Weekday>(existing?.weekday ?? (today().getDay() as Weekday));
  const [time, setTime] = useState<ClockTime>(existing?.time ?? '17:30');
  const [startDate, setStartDate] = useState<Date>(existing ? fromISODate(existing.startDate) : today());
  const [endMode, setEndMode] = useState<EndMode>(existing?.endDate ? 'onDate' : existing?.occurrenceLimit ? 'after' : 'never');
  const [endDate, setEndDate] = useState<Date>(existing?.endDate ? fromISODate(existing.endDate) : addDays(today(), 180));
  const [limit, setLimit] = useState(existing?.occurrenceLimit ?? 10);
  const [excludeHolidays, setExcludeHolidays] = useState(existing?.excludeHolidays ?? true);
  const [inviteDays, setInviteDays] = useState(existing?.inviteDaysBefore ?? 2);
  const [pickCustomer, setPickCustomer] = useState(false);
  const [pickTime, setPickTime] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const service = look.service(serviceId);
  const customer = look.customer(customerId);
  const draft: RecurringSeries = {
    id: existing?.id ?? 'draft',
    salonId: salon.id,
    customerId: customerId ?? '',
    barberId,
    serviceId,
    mode,
    frequency,
    intervalWeeks,
    weekday,
    time,
    startDate: toISODate(startDate),
    endDate: endMode === 'onDate' ? toISODate(endDate) : undefined,
    occurrenceLimit: endMode === 'after' ? limit : undefined,
    status: existing?.status ?? 'active',
    pausedUntil: existing?.pausedUntil,
    excludeHolidays,
    skippedDates: existing?.skippedDates ?? [],
    inviteDaysBefore: inviteDays,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  const holidays = salon.holidays.map((h) => h.date);
  const preview = useMemo(() => nextOccurrences(draft, today(), 6, holidays), [JSON.stringify(draft), holidays.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  if (id && !existing) {
    return (
      <Screen header={<Header close />}>
        <EmptyState icon="repeat" title={t('recurring.details.notFound')} body={t('recurring.details.notFoundBody')} />
      </Screen>
    );
  }

  const selectCustomer = (cid: ID) => {
    setCustomerId(cid);
    const c = look.customer(cid);
    if (!existing && c) {
      if (c.preferredServiceIds[0]) setServiceId(c.preferredServiceIds[0]);
      if (c.preferredBarberId) setBarberId(c.preferredBarberId);
    }
  };

  const save = () => {
    setSubmitted(true);
    if (!customerId || !service) return;
    const { id: _id, salonId: _s, createdAt: _c, ...input } = draft;
    if (existing) {
      actions.upsertRecurring({ ...existing, ...input });
      toast(t('recurring.form.updated'));
      router.back();
      return;
    }
    const created = actions.createRecurring(input);
    // Fixed reservations hold upcoming slots right away (next 3 weeks) so they appear in the calendar.
    if (mode === 'fixed') {
      nextOccurrences(draft, today(), 6, holidays)
        .filter((d) => d <= addDays(today(), 21) && isSlotFree(ctx, barberId, d, service))
        .forEach((d) => actions.createAppointment({ customerId, serviceId, barberId, start: d, source: 'recurring', sendLink: false, status: 'confirmed', recurringId: created.id, createdBy: 'system' }));
    }
    toast(t('recurring.form.created'));
    router.replace(`/recurring/${created.id}`);
  };

  return (
    <Screen header={<Header close title={id ? t('recurring.form.editTitle') : t('recurring.form.newTitle')} backFallback="/recurring" />} footer={<Button label={id ? t('recurring.form.update') : t('recurring.form.save')} onPress={save} size="lg" fullWidth />}>
      <View style={{ gap: 22, paddingTop: 8 }}>
        <View style={{ gap: 6 }}>
          <FieldLabel label={t('recurring.form.customer')} />
          <Pressable onPress={() => !existing && setPickCustomer(true)} disabled={!!existing} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: submitted && !customerId ? colors.danger : colors.border, backgroundColor: colors.surface }}>
            {customer ? <Avatar name={l(customer.name)} size={36} /> : <Avatar icon="user" size={36} />}
            <Text variant="callout" weight={customer ? 'semibold' : 'regular'} tone={customer ? 'primary' : 'tertiary'} style={{ flex: 1 }}>
              {customer ? l(customer.name) : t('recurring.form.chooseCustomer')}
            </Text>
            {!existing ? <Icon name="chevron-down" size={16} color={colors.textTertiary} /> : null}
          </Pressable>
          {submitted && !customerId ? (
            <Text variant="footnote" tone="danger">
              {t('recurring.form.errors.customer')}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('recurring.form.mode')} />
          <View style={{ gap: 8 }}>
            {(['fixed', 'invitation'] as RecurringMode[]).map((m) => {
              const sel = mode === m;
              return (
                <Pressable key={m} onPress={() => setMode(m)} haptic="selection" accessibilityState={{ selected: sel }} style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.lg, borderWidth: 1.5, borderColor: sel ? colors.accent : colors.border, backgroundColor: sel ? colors.accentSoft : colors.surface }}>
                  <Icon name={m === 'fixed' ? 'lock' : 'send'} size={18} color={sel ? colors.accent : colors.textSecondary} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text variant="headline">{t(`recurring.modes.${m}`)}</Text>
                    <Text variant="footnote" tone="secondary">
                      {t(`recurring.modeHints.${m}`)}
                    </Text>
                  </View>
                  <Icon name={sel ? 'check-circle' : 'circle'} size={20} color={sel ? colors.accent : colors.borderStrong} />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('recurring.form.service')} />
          <ServiceSingleSelect value={serviceId} onChange={(sid) => {
            setServiceId(sid);
            const s = look.service(sid);
            if (s && !s.barberIds.includes(barberId)) setBarberId(s.barberIds[0]);
          }} />
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('recurring.form.barber')} />
          <BarberSelect value={barberId} onChange={(b) => b && setBarberId(b)} onlyIds={service?.barberIds} />
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('recurring.form.frequency')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(['weekly', 'biweekly', 'monthly', 'custom'] as RecurrenceFrequency[]).map((fr) => (
              <Chip key={fr} label={t(`recurring.form.frequencies.${fr}`)} selected={frequency === fr} onPress={() => setFrequency(fr)} />
            ))}
          </View>
          {frequency === 'custom' ? <Stepper value={intervalWeeks} onChange={setIntervalWeeks} min={1} max={12} format={(v) => `${t('recurring.form.everyN')} ${tp('common.counts.weeks', v)}`} /> : null}
        </View>

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('recurring.form.weekday')} />
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {WEEK_ORDER.map((d) => {
              const sel = weekday === d;
              return (
                <Pressable key={d} onPress={() => setWeekday(d)} haptic="selection" accessibilityLabel={f.weekday(d)} accessibilityState={{ selected: sel }} style={{ flex: 1, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? colors.ink : colors.surface, borderWidth: 1, borderColor: sel ? colors.ink : colors.border }}>
                  <Text variant="caption" align="center" color={sel ? colors.inkText : colors.text} numberOfLines={1}>
                    {f.weekday(d, 'short')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <PickerField compact label={t('recurring.form.time')} icon="clock" value={f.clock(time)} onPress={() => setPickTime(true)} />
        </View>
        <DateField label={t('recurring.form.startDate')} value={startDate} onChange={setStartDate} />

        <View style={{ gap: 8 }}>
          <FieldLabel label={t('recurring.form.end')} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['never', 'onDate', 'after'] as EndMode[]).map((m) => (
              <Chip key={m} label={t(`recurring.form.ends.${m}`)} selected={endMode === m} onPress={() => setEndMode(m)} />
            ))}
          </View>
          {endMode === 'onDate' ? <DateField value={endDate} onChange={setEndDate} minDate={startDate} /> : null}
          {endMode === 'after' ? <Stepper value={limit} onChange={setLimit} min={1} max={52} format={(v) => tp('recurring.form.occurrences', v)} /> : null}
        </View>

        <Card style={{ gap: 14 }}>
          <ToggleRow icon="sun" title={t('recurring.form.excludeHolidays')} hint={t('recurring.form.excludeHolidaysHint')} value={excludeHolidays} onChange={setExcludeHolidays} />
          {mode === 'invitation' ? (
            <View style={{ gap: 8 }}>
              <FieldLabel label={t('recurring.form.inviteDaysBefore')} />
              <Stepper value={inviteDays} onChange={setInviteDays} min={0} max={7} format={(v) => tp('recurring.form.daysBefore', v)} />
            </View>
          ) : null}
        </Card>

        <View style={{ gap: 10 }}>
          <FieldLabel label={t('recurring.form.preview')} hint={ruleText(draft, i18n)} />
          <Card padding={0}>
            {preview.length === 0 ? (
              <View style={{ padding: 16 }}>
                <Text variant="callout" tone="tertiary">
                  {t('recurring.form.previewEmpty')}
                </Text>
              </View>
            ) : (
              preview.map((d, i) => {
                const barber = look.barber(barberId);
                const off = barber && !barberWorksOn(barber, d);
                return (
                  <View key={d.toISOString()} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.separator }}>
                    <Text variant="caption" tone="tertiary" tabular style={{ width: 20 }}>
                      {f.digits(String(i + 1))}
                    </Text>
                    <Text variant="callout" style={{ flex: 1 }}>
                      {f.dateLong(d)}
                    </Text>
                    {off ? (
                      <Text variant="caption" tone="warning">
                        {t('recurring.form.barberOff')}
                      </Text>
                    ) : (
                      <Text variant="callout" tabular tone="secondary">
                        {f.time(d)}
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </Card>
        </View>
      </View>
      <CustomerPickerSheet visible={pickCustomer} onClose={() => setPickCustomer(false)} value={customerId} onSelect={selectCustomer} />
      <TimePickerSheet visible={pickTime} onClose={() => setPickTime(false)} value={time} onSelect={setTime} from="08:00" to="22:00" title={t('recurring.form.time')} />
    </Screen>
  );
}
