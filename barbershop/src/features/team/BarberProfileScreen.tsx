import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { now, today } from '@/lib/clock';
import { fromISODate, startOfMonth, toISODate } from '@/lib/dates';
import { useAppState } from '@/store/AppStore';
import { useBarber, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';

import { WEEK_ORDER } from '../availability/controls';
import { weeklyHours } from '../availability/WeeklyScheduleEditor';
import { MiniStat, QuickAction } from '../customers/parts';

export default function BarberProfileScreen({ id }: { id: string }) {
  const { colors, radius } = useTheme();
  const { t, tp, l, f } = useI18n();
  const toast = useToast();
  const barber = useBarber(id);
  const look = useLookup();
  const { appointments } = useAppState();

  const data = useMemo(() => {
    const from = startOfMonth(today());
    const month = appointments.filter((a) => a.barberId === id && new Date(a.start) >= from && new Date(a.start) <= now() && a.status !== 'rescheduled');
    const completed = month.filter((a) => a.status === 'completed');
    const noShows = month.filter((a) => a.status === 'no_show').length;
    const tally = new Map<string, number>();
    completed.forEach((a) => tally.set(a.serviceId, (tally.get(a.serviceId) ?? 0) + 1));
    const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const upcoming = appointments.filter((a) => a.barberId === id && new Date(a.start) > now() && ['confirmed', 'pending', 'draft'].includes(a.status)).slice(0, 4);
    return { total: month.length, completed: completed.length, noShowRate: month.length ? noShows / month.length : 0, revenue: completed.reduce((s, a) => s + a.price, 0), top, topMax: top[0]?.[1] ?? 1, upcoming };
  }, [appointments, id]);

  if (!barber) {
    return (
      <Screen header={<Header backFallback="/team" />}>
        <EmptyState icon="user-x" title={t('team.profile.notFound')} body={t('team.profile.notFoundBody')} />
      </Screen>
    );
  }

  const daysOff = barber.daysOff.filter((d) => d >= toISODate(today())).sort();

  return (
    <Screen header={<Header backFallback="/team" right={<IconButton icon="edit-2" accessibilityLabel={t('common.actions.edit')} onPress={() => router.push(`/team/${id}/edit`)} />} />}>
      <View style={{ gap: 24 }}>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <BarberAvatar barber={barber} size={80} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text variant="title2" align="center">
              {l(barber.name)}
            </Text>
            <Text variant="callout" tone="secondary" align="center">
              {l(barber.title)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Badge label={t(`domain.role.${barber.role}`)} />
              <Badge label={tp('team.years', barber.yearsExperience)} tone="accent" />
              <Badge label={barber.acceptsOnline ? t('team.profile.onlineOn') : t('team.profile.onlineOff')} tone={barber.acceptsOnline ? 'success' : 'neutral'} icon="globe" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: 6 }}>
            <QuickAction primary icon="calendar" label={t('common.nav.calendar')} onPress={() => router.push('/owner/calendar')} />
            <QuickAction icon="plus" label={t('customers.profile.actions.book')} onPress={() => router.push({ pathname: '/appointment/new', params: { barberId: id } })} />
            <QuickAction icon="phone" label={t('customers.profile.actions.call')} onPress={() => toast({ message: t('team.profile.callSimulated', { name: l(barber.name) }), description: t('common.toast.simulated'), icon: 'info', tone: 'default' })} />
            <QuickAction icon="clock" label={t('team.profile.editHours')} onPress={() => router.push(`/team/${id}/hours`)} />
          </View>
        </View>

        <Section title={t('team.profile.thisMonth')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <MiniStat label={t('team.profile.appointments')} value={f.number(data.total)} />
            <MiniStat label={t('team.profile.completed')} value={f.number(data.completed)} />
            <MiniStat label={t('team.profile.noShowRate')} value={f.percent(data.noShowRate, 1)} tone={data.noShowRate > 0.05 ? 'danger' : undefined} />
            <MiniStat label={t('team.profile.revenue')} value={f.money(data.revenue)} />
          </View>
        </Section>

        {data.top.length ? (
          <Section title={t('team.profile.topServices')}>
            <Card style={{ gap: 14 }}>
              {data.top.map(([sid, n]) => (
                <View key={sid} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="subhead">{l(look.service(sid)?.name)}</Text>
                    <Text variant="subhead" tabular tone="secondary">
                      {f.number(n)}
                    </Text>
                  </View>
                  <ProgressBar value={n / data.topMax} color={barber.color} />
                </View>
              ))}
            </Card>
          </Section>
        ) : null}

        <Section title={t('team.profile.hours')} subtitle={t('availability.editor.hoursPerWeek', { hours: f.number(weeklyHours(barber.schedule)) })} actionLabel={t('team.profile.editHours')} onAction={() => router.push(`/team/${id}/hours`)}>
          <Card padding={0}>
            {WEEK_ORDER.map((d, i) => {
              const day = barber.schedule[d];
              return (
                <View key={d}>
                  {i > 0 ? <Divider inset={16} /> : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 10 }}>
                    <Text variant="callout" style={{ flex: 1 }} tone={day.enabled ? 'primary' : 'tertiary'}>
                      {f.weekday(d)}
                    </Text>
                    <Text variant="callout" tabular tone={day.enabled ? 'primary' : 'tertiary'}>
                      {day.enabled ? `${f.clock(day.start)} – ${f.clock(day.end)}` : t('availability.editor.closed')}
                    </Text>
                    {day.enabled && day.breaks.length ? <Icon name="coffee" size={13} color={colors.textTertiary} /> : null}
                  </View>
                </View>
              );
            })}
          </Card>
        </Section>

        <Section title={t('team.profile.daysOff')}>
          {daysOff.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {daysOff.map((d) => (
                <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 34, borderRadius: radius.pill, backgroundColor: colors.warningSoft }}>
                  <Icon name="sun" size={13} color={colors.warning} />
                  <Text variant="subhead" color={colors.warning}>
                    {f.dateShort(fromISODate(d))}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text variant="footnote" tone="tertiary">
              {t('team.profile.noDaysOff')}
            </Text>
          )}
        </Section>

        <Section title={t('team.profile.services')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {barber.serviceIds.map((sid) => (
              <View key={sid} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
                <Text variant="footnote">{l(look.service(sid)?.name)}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title={t('team.profile.upcoming')}>
          {data.upcoming.length ? (
            <View style={{ gap: 8 }}>
              {data.upcoming.map((a) => (
                <AppointmentCard key={a.id} appointment={a} showBarber={false} showDate />
              ))}
            </View>
          ) : (
            <Text variant="footnote" tone="tertiary">
              {t('team.profile.noUpcoming')}
            </Text>
          )}
        </Section>

        {barber.bio ? (
          <Section title={t('team.profile.about')}>
            <Card variant="muted" style={{ gap: 6 }}>
              <Text variant="callout">{l(barber.bio)}</Text>
              <Text variant="footnote" tone="tertiary">
                {t('team.profile.joined', { date: f.monthYear(fromISODate(barber.joinedAt)) })}
              </Text>
            </Card>
          </Section>
        ) : null}

        <Button label={t('common.actions.edit')} variant="secondary" icon="edit-2" onPress={() => router.push(`/team/${id}/edit`)} />
      </View>
    </Screen>
  );
}
