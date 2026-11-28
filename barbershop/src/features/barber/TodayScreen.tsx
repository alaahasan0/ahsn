import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { CategoryBadge, StatusBadge } from '@/components/domain/Badges';
import { BarberAvatar, barberShortName } from '@/components/domain/BarberAvatar';
import { DemoPill } from '@/components/domain/DemoBanner';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/Progress';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { now, today } from '@/lib/clock';
import { addMinutes, isSameDay } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { barberWorksOn } from '@/store/availability';
import { usePreferences } from '@/store/preferences';
import { useBarber, useCustomerStats, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Appointment } from '@/types/models';

import { ScheduleTimeline } from './ScheduleTimeline';

const end = (a: Appointment) => addMinutes(new Date(a.start), a.durationMin);

export default function TodayScreen() {
  const { colors } = useTheme();
  const { t, f, l } = useI18n();
  const { barberId } = usePreferences();
  const barber = useBarber(barberId);
  const { appointments } = useAppState();
  const actions = useActions();
  const toast = useToast();
  const look = useLookup();
  const current = now();

  const mine = useMemo(() => appointments.filter((a) => a.barberId === barberId && isSameDay(new Date(a.start), today())).sort((a, b) => a.start.localeCompare(b.start)), [appointments, barberId]);
  const live = mine.filter((a) => !['cancelled', 'rescheduled', 'expired', 'no_show'].includes(a.status));
  const inChair = mine.find((a) => a.status === 'checked_in') ?? live.find((a) => new Date(a.start) <= current && end(a) > current && a.status !== 'completed');
  const next = live.find((a) => a.id !== inChair?.id && new Date(a.start) > current && ['confirmed', 'pending', 'draft'].includes(a.status));
  const done = live.filter((a) => a.status === 'completed').length;
  const pending = useMemo(
    () =>
      appointments
        .filter((a) => a.barberId === barberId && a.status === 'pending' && new Date(a.start) > current)
        .sort((a, b) => a.start.localeCompare(b.start))
        .slice(0, 4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appointments, barberId],
  );

  if (!barber)
    return (
      <Screen inTabs>
        <EmptyState />
      </Screen>
    );
  const working = barberWorksOn(barber, today());
  const firstName = barberShortName(barber, l);
  const hour = current.getHours();
  const greeting = hour < 12 ? t('common.greetings.morning') : hour < 17 ? t('common.greetings.afternoon') : t('common.greetings.evening');

  const go = (path: string) => router.push(path as never);
  const quick: { icon: IconName; label: string; onPress: () => void; accent?: boolean }[] = [
    { icon: 'plus', label: t('barber.quick.newBooking'), onPress: () => go(`/appointment/new?barberId=${barberId}`), accent: true },
    { icon: 'mci:walk', label: t('barber.quick.walkIn'), onPress: () => go(`/appointment/new?walkIn=1&source=walk_in&barberId=${barberId}`) },
    { icon: 'slash', label: t('barber.quick.block'), onPress: () => go(`/block-time?barberId=${barberId}`) },
    { icon: 'mic', label: t('barber.quick.voice'), onPress: () => go('/barber/assistant') },
  ];

  return (
    <Screen
      inTabs
      header={
        <Header
          variant="large"
          back={false}
          eyebrow={`${greeting} · ${f.dateLong(today())}`}
          title={t('barber.hello', { name: firstName })}
          subtitle={live.length ? t('barber.summary', { total: live.length, done, left: live.length - done }) : t('barber.summaryEmpty')}
          right={<BarberAvatar barber={barber} size={40} />}
        >
          <DemoPill />
        </Header>
      }
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {quick.map((q) => (
            <Pressable
              key={q.label}
              onPress={q.onPress}
              feedback="scale"
              haptic="light"
              accessibilityLabel={q.label}
              style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 14, backgroundColor: q.accent ? colors.accent : colors.surfaceMuted }}
            >
              <Icon name={q.icon} size={20} color={q.accent ? colors.accentText : colors.text} />
              <Text variant="caption" color={q.accent ? colors.accentText : colors.text} align="center" numberOfLines={1}>
                {q.label}
              </Text>
            </Pressable>
          ))}
        </View>
      }
    >
      {!working ? (
        <EmptyState icon="sun" title={t('barber.offToday')} body={t('barber.offTodayBody')} />
      ) : (
        <View style={{ gap: 24, paddingTop: 8 }}>
          {inChair ? (
            <CurrentCard
              appointment={inChair}
              onComplete={() => {
                actions.setAppointmentStatus(inChair.id, 'completed');
                toast({ message: t('barber.completedToast', { name: l(look.customer(inChair.customerId)?.name) }) });
              }}
            />
          ) : (
            <Card variant="muted" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="coffee" size={18} color={colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="headline">{t('barber.noCurrent')}</Text>
                <Text variant="footnote" tone="secondary">
                  {t('barber.noCurrentBody')}
                </Text>
              </View>
            </Card>
          )}

          {next ? (
            <NextCard
              appointment={next}
              onCheckIn={() => {
                actions.setAppointmentStatus(next.id, 'checked_in');
                toast({ message: t('barber.checkedInToast', { name: l(look.customer(next.customerId)?.name) }) });
              }}
              onLate={() => {
                actions.addAppointmentNote(next.id, t('barber.lateToast'));
                toast({ message: t('barber.lateToast'), icon: 'clock', tone: 'default' });
              }}
            />
          ) : (
            <Card variant="outline" style={{ alignItems: 'center', gap: 4, paddingVertical: 20 }}>
              <Icon name="check-circle" size={22} color={colors.success} />
              <Text variant="headline" align="center">
                {t('barber.noNext')}
              </Text>
              <Text variant="footnote" tone="secondary" align="center">
                {t('barber.noNextBody')}
              </Text>
            </Card>
          )}

          {pending.length ? (
            <Section title={t('barber.pending')} subtitle={t('barber.pendingBody')} card>
              {pending.map((a) => {
                const c = look.customer(a.customerId);
                const start = new Date(a.start);
                return (
                  <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 }}>
                    <Pressable onPress={() => go(`/appointment/${a.id}`)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Avatar name={l(c?.name)} size={36} />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="callout" weight="semibold" numberOfLines={1}>
                          {l(c?.name)}
                        </Text>
                        <Text variant="footnote" tone="secondary" numberOfLines={1}>
                          {isSameDay(start, today()) ? t('common.actions.today') : f.dateShort(start)} · {f.time(start)}
                        </Text>
                      </View>
                    </Pressable>
                    <Button
                      label={t('barber.resend')}
                      size="sm"
                      variant="soft"
                      icon="send"
                      onPress={() => {
                        actions.resendConfirmation(a.id);
                        toast({ message: t('barber.resentToast', { name: l(c?.name) }), description: t('common.toast.simulated') });
                      }}
                    />
                  </View>
                );
              })}
            </Section>
          ) : null}

          <Section title={t('barber.schedule')}>
            <ScheduleTimeline barber={barber} appointments={mine} currentId={inChair?.id} />
          </Section>
        </View>
      )}
    </Screen>
  );
}

function CurrentCard({ appointment: a, onComplete }: { appointment: Appointment; onComplete: () => void }) {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const look = useLookup();
  const c = look.customer(a.customerId);
  const s = look.service(a.serviceId);
  const start = new Date(a.start);
  const progress = (now().getTime() - start.getTime()) / (a.durationMin * 60000);
  return (
    <View style={{ backgroundColor: colors.ink, borderRadius: radius.xl, padding: 18, gap: 16 }}>
      <Pressable onPress={() => router.push(`/appointment/${a.id}`)} style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
          <Text variant="overline" color={colors.inkText} style={{ opacity: 0.7, flex: 1 }}>
            {t('barber.current')}
          </Text>
          <Text variant="caption" color={colors.inkText} style={{ opacity: 0.7 }}>
            {t('barber.currentEnds', { time: f.time(end(a)) })}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={l(c?.name)} size={52} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="title2" color={colors.inkText} numberOfLines={1}>
              {l(c?.name)}
            </Text>
            <Text variant="callout" color={colors.inkText} style={{ opacity: 0.72 }} numberOfLines={1}>
              {l(s?.name)} · {f.timeRange(start, end(a))}
            </Text>
          </View>
        </View>
        {a.notes.length ? (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
            <Icon name="file-text" size={14} color={colors.inkText} style={{ opacity: 0.7, marginTop: 2 }} />
            <Text variant="footnote" color={colors.inkText} style={{ flex: 1, opacity: 0.8 }} numberOfLines={2}>
              {a.notes[a.notes.length - 1].text}
            </Text>
          </View>
        ) : null}
        <ProgressBar value={progress} color={colors.accent} track={`${colors.inkText}22`} />
      </Pressable>
      <Button label={t('barber.complete')} icon="check" size="lg" onPress={onComplete} fullWidth testID="barber-complete" />
    </View>
  );
}

function NextCard({ appointment: a, onCheckIn, onLate }: { appointment: Appointment; onCheckIn: () => void; onLate: () => void }) {
  const { colors } = useTheme();
  const { t, l, f } = useI18n();
  const look = useLookup();
  const c = look.customer(a.customerId);
  const s = look.service(a.serviceId);
  const stats = useCustomerStats(a.customerId);
  const start = new Date(a.start);
  const mins = Math.max(0, Math.round((start.getTime() - now().getTime()) / 60000));
  return (
    <Card style={{ gap: 14 }}>
      <Pressable onPress={() => router.push(`/appointment/${a.id}`)} style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="overline" tone="tertiary" style={{ flex: 1 }}>
            {t('barber.next')}
          </Text>
          <Text variant="caption" tone="accent">
            {mins <= 90 ? t('barber.nextIn', { duration: f.duration(mins) }) : t('barber.nextAt', { time: f.time(start) })}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={l(c?.name)} size={46} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="headline" numberOfLines={1}>
              {l(c?.name)}
            </Text>
            <Text variant="footnote" tone="secondary" numberOfLines={1}>
              {f.time(start)} · {l(s?.name)} · {f.duration(a.durationMin)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              {c ? <CategoryBadge category={c.category} /> : null}
              <Text variant="caption" tone="tertiary">
                {stats && stats.totalVisits > 0 ? t('barber.visits', { count: stats.totalVisits + 1 }) : t('barber.firstVisit')}
              </Text>
              {a.status !== 'confirmed' ? <StatusBadge status={a.status} short /> : null}
            </View>
          </View>
        </View>
        {a.notes.length || c?.notes ? (
          <View style={{ flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10, backgroundColor: colors.surfaceMuted }}>
            <Icon name="file-text" size={14} color={colors.textSecondary} style={{ marginTop: 2 }} />
            <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={2}>
              {a.notes.length ? a.notes[a.notes.length - 1].text : c?.notes}
            </Text>
          </View>
        ) : null}
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button label={t('barber.runningLate')} icon="clock" variant="secondary" onPress={onLate} style={{ flex: 1 }} />
        <Button label={t('barber.checkIn')} icon="user-check" variant="ink" onPress={onCheckIn} style={{ flex: 1.3 }} testID="barber-checkin" />
      </View>
    </Card>
  );
}
