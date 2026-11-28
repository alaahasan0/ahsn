import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { ProgressRing } from '@/components/charts';
import { AppointmentCard, DemoPill } from '@/components/domain';
import { Card, Header, Icon, IconButton, Pressable, Screen, Section, Text, type IconName } from '@/components/ui';
import { useI18n, type TKey } from '@/i18n';
import { now, today } from '@/lib/clock';
import { useAppState } from '@/store/AppStore';
import { useActivity, useAppointmentsOn, useBarbers, useDaySummary, useUnreadNotifications } from '@/store/selectors';
import { useTheme } from '@/theme';

import { ActivityItem } from './ActivityItem';
import { ChairStatus } from './ChairStatus';

const QUICK: { key: string; icon: IconName; label: TKey; href: Href }[] = [
  { key: 'customer', icon: 'user-plus', label: 'home.actions.addCustomer', href: '/customers/new' },
  { key: 'block', icon: 'slash', label: 'home.actions.blockTime', href: '/block-time' },
  { key: 'calendar', icon: 'calendar', label: 'home.actions.viewCalendar', href: '/owner/calendar' },
  { key: 'voice', icon: 'mic', label: 'home.actions.voiceAssistant', href: '/voice' },
];

export default function DashboardScreen() {
  const { colors, radius, status } = useTheme();
  const { t, tp, l, f } = useI18n();
  const { salon, currentUser } = useAppState();
  const barbers = useBarbers();
  const day = today();
  const summary = useDaySummary(day);
  const todays = useAppointmentsOn(day);
  const activity = useActivity(6);
  const unread = useUnreadNotifications();
  const current = now();

  const hour = current.getHours();
  const greeting = t(hour < 12 ? 'common.greetings.morning' : hour < 17 ? 'common.greetings.afternoon' : 'common.greetings.evening');
  const firstName = l(currentUser.name).split(' ')[0];
  const upcoming = todays.filter((a) => new Date(a.start) > current && ['confirmed', 'pending', 'draft'].includes(a.status)).slice(0, 4);
  const remaining = todays.filter((a) => new Date(a.start) > current && ['confirmed', 'pending', 'draft'].includes(a.status)).length;
  const hours = (min: number) => f.number(Math.round(min / 6) / 10, 1);

  const mini: { key: string; label: TKey; value: number; dot: string }[] = [
    { key: 'completed', label: 'home.stats.completed', value: summary.completed, dot: status.completed.dot },
    { key: 'pending', label: 'home.stats.pending', value: summary.pending, dot: status.pending.dot },
    { key: 'cancelled', label: 'home.stats.cancelled', value: summary.cancelled, dot: status.cancelled.dot },
    { key: 'noShows', label: 'home.stats.noShows', value: summary.noShows, dot: status.no_show.dot },
  ];

  return (
    <Screen
      inTabs
      testID="owner-dashboard"
      header={
        <Header
          variant="large"
          back={false}
          eyebrow={f.dateLong(day)}
          title={t('home.greeting', { greeting, name: firstName })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text variant="subhead" tone="secondary" numberOfLines={1}>
                {l(salon.name)}
              </Text>
              <DemoPill />
            </View>
            <IconButton icon="bell" variant="filled" size={44} badge={unread || undefined} onPress={() => router.push('/notifications')} accessibilityLabel={t('home.notifications')} />
          </View>
        </Header>
      }
    >
      <View style={{ gap: 28, paddingTop: 8 }}>
        {/* Today at a glance */}
        <Card variant="ink" padding={20} style={{ gap: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="overline" color={colors.inkText} style={{ opacity: 0.6 }}>
                {t('common.actions.today')}
              </Text>
              <Text variant="title2" color={colors.inkText}>
                {tp('home.summary', summary.total)}
              </Text>
              <Text variant="footnote" color={colors.inkText} style={{ opacity: 0.7 }}>
                {t('home.stats.remaining', { count: remaining })}
              </Text>
            </View>
            <ProgressRing value={summary.occupancy} size={84} stroke={8} color={colors.accent} track={`${colors.inkText}22`} accessibilityLabel={t('home.stats.occupancy')}>
              <Text variant="headline" color={colors.inkText} align="center" tabular>
                {f.percent(summary.occupancy)}
              </Text>
              <Text variant="caption" color={colors.inkText} align="center" style={{ opacity: 0.6, fontSize: 10 }}>
                {t('home.stats.occupancy')}
              </Text>
            </ProgressRing>
          </View>
          <View style={{ height: 1, backgroundColor: `${colors.inkText}1A` }} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="footnote" color={colors.inkText} style={{ opacity: 0.6 }}>
                {t('home.stats.revenue')}
              </Text>
              <Text variant="numeric" color={colors.inkText} tabular>
                {f.money(summary.revenue)}
              </Text>
              <Text variant="caption" color={colors.inkText} style={{ opacity: 0.6 }} weight="regular">
                {t('home.stats.revenueOf', { amount: f.money(summary.expectedRevenue) })}
              </Text>
            </View>
            <Text variant="caption" color={colors.inkText} style={{ opacity: 0.6, maxWidth: 150 }} align="end" weight="regular">
              {t('home.stats.occupancyHint', { booked: hours(summary.bookedMinutes), capacity: hours(summary.capacityMinutes) })}
            </Text>
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {mini.map((m) => (
            <Pressable key={m.key} onPress={() => router.push('/owner/calendar')} style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, gap: 6, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: m.dot }} />
                <Text variant="title3" tabular>
                  {f.number(m.value)}
                </Text>
              </View>
              <Text variant="caption" tone="secondary" numberOfLines={2} weight="regular" style={{ fontSize: 11 }}>
                {t(m.label)}
              </Text>
            </Pressable>
          ))}
        </View>

        {summary.pending > 0 ? (
          <Card variant="accent" onPress={() => router.push('/owner/bookings')} padding={14} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="clock" size={17} color={colors.accent} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="subhead" weight="semibold" color={colors.accentOnSoft}>
                {tp('home.pendingTitle', summary.pending)}
              </Text>
              <Text variant="caption" color={colors.accentOnSoft} style={{ opacity: 0.8 }} weight="regular">
                {t('home.pendingBody')}
              </Text>
            </View>
            <Text variant="subhead" color={colors.accentOnSoft}>
              {t('home.pendingAction')}
            </Text>
            <Icon name="chevron-right" size={16} color={colors.accentOnSoft} />
          </Card>
        ) : null}

        {/* Quick actions */}
        <Section title={t('home.quickActions')}>
          <Pressable
            testID="quick-new-appointment"
            onPress={() => router.push('/appointment/new')}
            feedback="scale"
            haptic="light"
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 16, borderRadius: radius.lg, backgroundColor: colors.accent }}
          >
            <Icon name="plus" size={20} color={colors.accentText} />
            <Text variant="headline" color={colors.accentText} style={{ flex: 1 }}>
              {t('home.actions.newAppointment')}
            </Text>
            <Icon name="arrow-right" size={18} color={colors.accentText} />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {QUICK.map((q) => (
              <Pressable
                key={q.key}
                testID={`quick-${q.key}`}
                onPress={() => router.push(q.href)}
                feedback="scale"
                style={{ flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 4, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: q.key === 'voice' ? colors.accentSoft : colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={q.icon} size={18} color={q.key === 'voice' ? colors.accent : colors.text} />
                </View>
                <Text variant="caption" align="center" numberOfLines={2} style={{ minHeight: 32 }}>
                  {t(q.label)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title={t('home.chairs')} card>
          {barbers.map((b) => (
            <ChairStatus key={b.id} barber={b} todays={todays} />
          ))}
        </Section>

        <Section title={t('home.upNext')} actionLabel={t('common.actions.viewAll')} onAction={() => router.push('/owner/calendar')}>
          {upcoming.length ? (
            <View style={{ gap: 8 }}>
              {upcoming.map((a, i) => (
                <AppointmentCard key={a.id} appointment={a} highlight={i === 0} />
              ))}
            </View>
          ) : (
            <Card variant="muted">
              <Text variant="footnote" tone="secondary" align="center">
                {t('home.upNextEmpty')}
              </Text>
            </Card>
          )}
        </Section>

        <Section title={t('home.activity')} actionLabel={t('common.actions.seeAll')} onAction={() => router.push('/owner/bookings')} card={activity.length > 0}>
          {activity.length ? (
            activity.map((e) => <ActivityItem key={e.id} event={e} />)
          ) : (
            <Text variant="footnote" tone="secondary">
              {t('home.activityEmpty')}
            </Text>
          )}
        </Section>
      </View>
    </Screen>
  );
}
