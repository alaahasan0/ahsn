import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Divider } from '@/components/ui/Divider';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { now, today } from '@/lib/clock';
import { addDays, fromISODate, isSameDay, toISODate } from '@/lib/dates';
import { nextOccurrences } from '@/lib/recurrence';
import { useActions, useAppState } from '@/store/AppStore';
import { barberWorksOn } from '@/store/availability';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';

import { InfoRow } from '../customers/parts';
import { ruleText } from './helpers';

export default function RecurringDetailScreen({ id }: { id: string }) {
  const { colors, radius } = useTheme();
  const i18n = useI18n();
  const { t, tp, l, f } = i18n;
  const actions = useActions();
  const toast = useToast();
  const look = useLookup();
  const { recurring, appointments, salon } = useAppState();
  const series = recurring.find((r) => r.id === id);
  const [skipDate, setSkipDate] = useState<Date | null>(null);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const holidays = salon.holidays.map((h) => h.date);

  const linked = useMemo(() => appointments.filter((a) => a.recurringId === id), [appointments, id]);
  const upcoming = useMemo(() => (series && series.status !== 'ended' ? nextOccurrences({ ...series, status: 'active', pausedUntil: undefined }, today(), 8, holidays) : []), [series, holidays.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!series) {
    return (
      <Screen header={<Header backFallback="/recurring" />}>
        <EmptyState icon="repeat" title={t('recurring.details.notFound')} body={t('recurring.details.notFoundBody')} />
      </Screen>
    );
  }

  const customer = look.customer(series.customerId);
  const service = look.service(series.serviceId);
  const barber = look.barber(series.barberId);
  const past = linked.filter((a) => new Date(a.start) <= now()).sort((a, b) => b.start.localeCompare(a.start)).slice(0, 5);
  const isPausedOn = (d: Date) => series.status === 'paused' && (!series.pausedUntil || toISODate(d) <= series.pausedUntil);
  const futureLinked = (d: Date) => linked.find((a) => isSameDay(new Date(a.start), d) && ['confirmed', 'pending', 'draft'].includes(a.status));

  const skip = (d: Date) => {
    const iso = toISODate(d);
    actions.upsertRecurring({ ...series, skippedDates: [...series.skippedDates, iso] });
    const appt = futureLinked(d);
    if (appt) actions.setAppointmentStatus(appt.id, 'cancelled', { reason: 'Recurring visit skipped' });
    toast(t('recurring.details.skipped', { date: f.dayMonth(d) }));
  };

  const pause = (weeks: number) => {
    actions.upsertRecurring({ ...series, status: 'paused', pausedUntil: toISODate(addDays(today(), weeks * 7)) });
    setPauseOpen(false);
    toast(t('recurring.details.paused'));
  };

  return (
    <Screen header={<Header title={t('recurring.details.title')} backFallback="/recurring" right={series.status !== 'ended' ? <IconButton icon="edit-2" accessibilityLabel={t('common.actions.edit')} onPress={() => router.push(`/recurring/${id}/edit`)} /> : undefined} />}>
      <View style={{ gap: 24, paddingTop: 4 }}>
        <Card style={{ gap: 14 }}>
          <Pressable onPress={() => customer && router.push(`/customers/${customer.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={l(customer?.name)} size={48} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="title3" numberOfLines={1}>
                {l(customer?.name)}
              </Text>
              <Text variant="footnote" tone="secondary">
                {l(service?.name)} · {f.duration(service?.durationMin ?? 0)} · {f.money(service?.price ?? 0)}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textTertiary} />
          </Pressable>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Badge label={t(`recurring.modes.${series.mode}`)} tone={series.mode === 'fixed' ? 'info' : 'accent'} icon={series.mode === 'fixed' ? 'lock' : 'send'} size="md" />
            <Badge
              label={series.status === 'paused' && series.pausedUntil ? t('recurring.pausedUntil', { date: f.dayMonth(fromISODate(series.pausedUntil)) }) : t(`recurring.status.${series.status}`)}
              tone={series.status === 'active' ? 'success' : series.status === 'paused' ? 'warning' : 'neutral'}
              size="md"
            />
          </View>
          <Text variant="footnote" tone="secondary">
            {t(`recurring.modeHints.${series.mode}`)}
          </Text>
        </Card>

        <Section title={t('recurring.details.schedule')} card>
          <InfoRow icon="repeat" label={ruleText(series, i18n)} />
          <InfoRow icon="scissors" label={t('recurring.form.barber')}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <BarberAvatar barber={barber} size={20} />
              <Text variant="callout" weight="medium">
                {l(barber?.name)}
              </Text>
            </View>
          </InfoRow>
          <InfoRow icon="calendar" label={t('recurring.details.started', { date: f.dateMedium(fromISODate(series.startDate)) })} value={series.endDate ? f.dateMedium(fromISODate(series.endDate)) : series.occurrenceLimit ? tp('recurring.form.occurrences', series.occurrenceLimit) : t('recurring.form.ends.never')} />
          {series.excludeHolidays ? <InfoRow icon="sun" label={t('recurring.details.holidaysSkipped')} /> : null}
          {series.mode === 'invitation' ? <InfoRow icon="send" label={t('recurring.details.invitationTiming', { days: tp('recurring.form.daysBefore', series.inviteDaysBefore) })} /> : null}
        </Section>

        {series.status !== 'ended' ? (
          <Section title={t('recurring.details.upcoming')}>
            <Card padding={0}>
              {upcoming.length === 0 ? (
                <View style={{ padding: 16 }}>
                  <Text variant="callout" tone="tertiary">
                    {t('recurring.noNext')}
                  </Text>
                </View>
              ) : (
                upcoming.map((d, i) => {
                  const paused = isPausedOn(d);
                  const off = barber && !barberWorksOn(barber, d);
                  const appt = futureLinked(d);
                  return (
                    <View key={d.toISOString()}>
                      {i > 0 ? <Divider inset={16} /> : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 16, opacity: paused ? 0.45 : 1 }}>
                        <View style={{ width: 44, alignItems: 'center', paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted }}>
                          <Text variant="caption" tone="tertiary" align="center">
                            {f.weekday(d, 'short')}
                          </Text>
                          <Text variant="headline" align="center" tabular>
                            {f.digits(String(d.getDate()))}
                          </Text>
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text variant="callout" weight="medium">
                            {f.month(d)} · {f.time(d)}
                          </Text>
                          <Text variant="caption" tone={off ? 'warning' : 'tertiary'}>
                            {paused ? t('recurring.status.paused') : off ? t('recurring.form.barberOff') : appt ? t(`domain.status.${appt.status}`) : t(`recurring.modes.${series.mode}`)}
                          </Text>
                        </View>
                        {!paused ? <Button size="sm" variant="ghost" label={t('recurring.details.skip')} onPress={() => setSkipDate(d)} /> : null}
                      </View>
                    </View>
                  );
                })
              )}
            </Card>
          </Section>
        ) : null}

        {series.skippedDates.length ? (
          <Section title={t('recurring.details.skippedList')}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {series.skippedDates
                .slice()
                .sort()
                .map((iso) => (
                  <Pressable
                    key={iso}
                    onPress={() => {
                      actions.upsertRecurring({ ...series, skippedDates: series.skippedDates.filter((x) => x !== iso) });
                      toast(t('recurring.details.restored'));
                    }}
                    accessibilityLabel={t('recurring.details.restore')}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 34, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}
                  >
                    <Text variant="subhead" tone="secondary" style={{ textDecorationLine: 'line-through' }}>
                      {f.dateShort(fromISODate(iso))}
                    </Text>
                    <Icon name="rotate-ccw" size={13} color={colors.accent} />
                  </Pressable>
                ))}
            </View>
          </Section>
        ) : null}

        <Section title={t('recurring.details.past')}>
          {past.length ? (
            <View style={{ gap: 8 }}>
              {past.map((a) => (
                <AppointmentCard key={a.id} appointment={a} showDate showBarber={false} />
              ))}
            </View>
          ) : (
            <Text variant="footnote" tone="tertiary">
              {t('recurring.details.noPast')}
            </Text>
          )}
        </Section>

        {series.status !== 'ended' ? (
          <View style={{ gap: 10 }}>
            {series.status === 'paused' ? (
              <Button
                label={t('recurring.details.resume')}
                icon="play"
                onPress={() => {
                  actions.upsertRecurring({ ...series, status: 'active', pausedUntil: undefined });
                  toast(t('recurring.details.resumed'));
                }}
              />
            ) : (
              <Button label={t('recurring.details.pause')} icon="pause" variant="secondary" onPress={() => setPauseOpen(true)} />
            )}
            <Button label={t('recurring.details.cancelSeries')} icon="x-circle" variant="dangerSoft" onPress={() => setCancelOpen(true)} />
          </View>
        ) : null}
      </View>

      <Dialog
        visible={!!skipDate}
        onClose={() => setSkipDate(null)}
        title={t('recurring.details.skipTitle')}
        message={skipDate ? t('recurring.details.skipBody', { date: f.dateLong(skipDate) }) : undefined}
        icon="calendar"
        tone="danger"
        confirmLabel={t('recurring.details.skip')}
        cancelLabel={t('common.actions.keep')}
        onConfirm={() => skipDate && skip(skipDate)}
      />
      <Dialog
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={t('recurring.details.cancelSeriesTitle')}
        message={t('recurring.details.cancelSeriesBody', { name: l(customer?.name) })}
        icon="x-circle"
        tone="danger"
        confirmLabel={t('recurring.details.cancelSeries')}
        cancelLabel={t('common.actions.keep')}
        onConfirm={() => {
          actions.upsertRecurring({ ...series, status: 'ended', endDate: toISODate(today()) });
          linked.filter((a) => new Date(a.start) > now() && ['confirmed', 'pending', 'draft'].includes(a.status)).forEach((a) => actions.setAppointmentStatus(a.id, 'cancelled', { reason: 'Recurring series cancelled' }));
          toast(t('recurring.details.seriesCancelled'));
        }}
      />
      <Sheet visible={pauseOpen} onClose={() => setPauseOpen(false)} title={t('recurring.details.pauseTitle')} subtitle={t('recurring.details.pauseBody')}>
        <View style={{ gap: 8 }}>
          {([
            [2, 'twoWeeks'],
            [4, 'oneMonth'],
            [8, 'twoMonths'],
          ] as const).map(([weeks, key]) => (
            <Pressable key={key} onPress={() => pause(weeks)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}>
              <Icon name="pause-circle" size={18} color={colors.text} />
              <Text variant="callout" weight="medium" style={{ flex: 1 }}>
                {t(`recurring.details.pauseOptions.${key}`)}
              </Text>
              <Text variant="footnote" tone="secondary">
                {f.dayMonth(addDays(today(), weeks * 7))}
              </Text>
            </Pressable>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}
