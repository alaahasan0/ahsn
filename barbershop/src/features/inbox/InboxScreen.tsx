import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { SourceTag, StatusBadge } from '@/components/domain/Badges';
import { BarberInline } from '@/components/domain/BarberAvatar';
import { SOURCE_ICON } from '@/components/domain/meta';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { Header } from '@/components/ui/Header';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n, type TKey } from '@/i18n';
import { now } from '@/lib/clock';
import { addDays, isSameDay, startOfDay } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { useActivity, useInboxCounts, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import { BOOKING_SOURCES, type ActivityEvent, type Appointment, type BookingSource } from '@/types/models';

type Tab = 'requests' | 'awaiting' | 'recent' | 'expired' | 'cancelled' | 'activity';
const TABS: Tab[] = ['requests', 'awaiting', 'recent', 'expired', 'cancelled', 'activity'];

const lastEventAt = (a: Appointment, type: string) => [...a.history].reverse().find((h) => h.type === type);

export default function InboxScreen() {
  const { t, f } = useI18n();
  const { appointments } = useAppState();
  const counts = useInboxCounts();
  const activity = useActivity(80, 72);
  const [tab, setTab] = useState<Tab>(counts.requests ? 'requests' : 'awaiting');
  const [sources, setSources] = useState<BookingSource[]>([]);
  const [sourceSheet, setSourceSheet] = useState(false);

  const current = now();
  const lists = useMemo(() => {
    const upcoming = appointments.filter((a) => new Date(a.start) >= startOfDay(current));
    const recentSince = current.getTime() - 72 * 3600_000;
    const cancelledSince = current.getTime() - 7 * 86_400_000;
    return {
      requests: upcoming.filter((a) => a.status === 'draft').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      awaiting: upcoming.filter((a) => a.status === 'pending').sort((a, b) => a.start.localeCompare(b.start)),
      recent: appointments.filter((a) => new Date(a.createdAt).getTime() >= recentSince && new Date(a.createdAt) <= current && a.status !== 'rescheduled' && a.createdBy !== 'system').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      expired: appointments.filter((a) => a.status === 'expired').sort((a, b) => a.start.localeCompare(b.start)),
      cancelled: appointments
        .filter((a) => a.status === 'cancelled' && new Date(lastEventAt(a, 'cancelled')?.at ?? a.start).getTime() >= cancelledSince && new Date(lastEventAt(a, 'cancelled')?.at ?? a.start) <= current)
        .sort((a, b) => (lastEventAt(b, 'cancelled')?.at ?? '').localeCompare(lastEventAt(a, 'cancelled')?.at ?? '')),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments]);

  const bySource = <T extends { source: BookingSource }>(list: T[]) => (sources.length ? list.filter((x) => sources.includes(x.source)) : list);
  const tabCount: Record<Tab, number | undefined> = { requests: counts.requests, awaiting: counts.awaiting, recent: undefined, expired: counts.expired, cancelled: undefined, activity: undefined };

  const items = tab === 'activity' ? [] : bySource(lists[tab]);
  const events = bySource(activity);

  return (
    <Screen
      inTabs
      header={
        <Header
          variant="large"
          back={false}
          title={t('inbox.title')}
          subtitle={t('inbox.subtitle')}
          right={<IconButton icon="filter" variant="filled" size={38} iconSize={17} onPress={() => setSourceSheet(true)} badge={sources.length || undefined} accessibilityLabel={t('inbox.filterSource')} />}
        >
          <ChipRow contentPadding={0}>
            {TABS.map((k) => (
              <Chip key={k} size="sm" label={t(`inbox.tabs.${k}`)} count={tabCount[k] || undefined} selected={tab === k} onPress={() => setTab(k)} />
            ))}
          </ChipRow>
          {sources.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {sources.map((s) => (
                <Chip key={s} size="sm" icon={SOURCE_ICON[s]} label={`${t(`domain.sourceShort.${s}`)}  ✕`} onPress={() => setSources(sources.filter((x) => x !== s))} />
              ))}
            </View>
          ) : null}
        </Header>
      }
    >
      <View style={{ gap: 12, paddingTop: 6 }}>
        {tab === 'recent' ? <SourceMix /> : null}
        {tab === 'activity' ? (
          events.length ? (
            <Card padding={4}>
              {groupByDay(events).map(([label, list]) => (
                <View key={label} style={{ paddingVertical: 6 }}>
                  <Text variant="overline" tone="tertiary" style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                    {label === 'today' ? t('inbox.today') : label === 'yesterday' ? t('inbox.yesterday') : f.dateLong(new Date(label))}
                  </Text>
                  {list.map((e) => (
                    <ActivityRow key={e.id} event={e} />
                  ))}
                </View>
              ))}
            </Card>
          ) : (
            <EmptyState icon="activity" title={t('inbox.empty.activity')} body={t('inbox.empty.activityBody')} />
          )
        ) : items.length ? (
          items.map((a) => <InboxItem key={a.id} appointment={a} tab={tab} />)
        ) : (
          <EmptyState icon={tab === 'requests' ? 'inbox' : tab === 'awaiting' ? 'check-circle' : tab === 'expired' ? 'clock' : 'calendar'} title={t(`inbox.empty.${tab}` as TKey)} body={t(`inbox.empty.${tab}Body` as TKey)} />
        )}
      </View>
      <Sheet visible={sourceSheet} onClose={() => setSourceSheet(false)} title={t('inbox.filterSource')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label={t('inbox.allSources')} selected={!sources.length} onPress={() => setSources([])} />
          {BOOKING_SOURCES.map((s) => (
            <Chip key={s} icon={SOURCE_ICON[s]} label={t(`domain.source.${s}`)} selected={sources.includes(s)} onPress={() => setSources(sources.includes(s) ? sources.filter((x) => x !== s) : [...sources, s])} />
          ))}
        </View>
        <Button label={t('common.actions.done')} onPress={() => setSourceSheet(false)} style={{ marginTop: 20 }} />
      </Sheet>
    </Screen>
  );

  function groupByDay(list: ActivityEvent[]): [string, ActivityEvent[]][] {
    const m = new Map<string, ActivityEvent[]>();
    for (const e of list) {
      const d = new Date(e.at);
      const key = isSameDay(d, current) ? 'today' : isSameDay(d, addDays(current, -1)) ? 'yesterday' : startOfDay(d).toISOString();
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(e);
    }
    return [...m.entries()];
  }
}

function InboxItem({ appointment: a, tab }: { appointment: Appointment; tab: Exclude<Tab, 'activity'> }) {
  const { colors, radius, shadow, isDark, status } = useTheme();
  const { t, l, f } = useI18n();
  const toast = useToast();
  const actions = useActions();
  const look = useLookup();
  const [declineOpen, setDeclineOpen] = useState(false);
  const { recurring } = useAppState();
  const customer = look.customer(a.customerId);
  const service = look.service(a.serviceId);
  const barber = look.barber(a.barberId);
  const start = new Date(a.start);
  const current = now();
  const c = a.confirmation;
  const actor = (type: string) => t(`appointment.actor.${lastEventAt(a, type)?.actor ?? a.createdBy}`);

  let meta: { icon: IconName; text: string; color?: string } | null = null;
  const series = a.recurringId ? recurring.find((r) => r.id === a.recurringId) : undefined;
  const invitation = tab === 'requests' && a.source === 'recurring';
  const sendAt = addDays(start, -(series?.inviteDaysBefore ?? 2));
  if (invitation) meta = { icon: 'repeat', text: sendAt > current ? t('inbox.invitationScheduled', { time: f.relative(sendAt, current) }) : t('inbox.invitationDue') };
  else if (tab === 'requests') meta = { icon: SOURCE_ICON[a.source], text: t('inbox.requestFrom', { source: t(`domain.sourceShort.${a.source}`), time: f.relative(new Date(a.createdAt), current) }) };
  else if (tab === 'awaiting' && c)
    meta = { icon: c.openedAt ? 'eye' : 'send', text: `${t('inbox.linkSent', { time: f.relative(new Date(c.sentAt), current) })} · ${c.openedAt ? t('inbox.linkOpened') : t('inbox.linkNotOpened')} · ${t('inbox.expiresIn', { time: f.relative(new Date(c.expiresAt), current) })}` };
  else if (tab === 'expired' && c) meta = { icon: 'alert-triangle', text: t('inbox.expiredAgo', { time: f.relative(new Date(c.expiresAt), current) }), color: status.expired.fg };
  else if (tab === 'recent') meta = { icon: 'plus-circle', text: t('inbox.createdAgo', { time: f.relative(new Date(a.createdAt), current), actor: actor('created') }) };
  else if (tab === 'cancelled') {
    const ev = lastEventAt(a, 'cancelled');
    meta = { icon: 'x-circle', text: `${t('inbox.cancelledBy', { time: f.relative(new Date(ev?.at ?? a.start), current), actor: actor('cancelled') })}${a.cancellationReason ? ` · ${a.cancellationReason}` : ''}`, color: colors.danger };
  }

  const resend = () => {
    actions.resendConfirmation(a.id, c?.channel ?? (customer?.whatsapp ? 'whatsapp' : 'sms'));
    toast({ message: t('inbox.resent'), icon: 'send' });
  };

  return (
    <Pressable
      onPress={() => router.push(`/appointment/${a.id}`)}
      feedback="scale"
      style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, gap: 12, borderWidth: isDark ? 1 : 0, borderColor: colors.border }, isDark ? null : shadow('sm')]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={l(customer?.name)} size={42} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="callout" weight="semibold" numberOfLines={1}>
            {l(customer?.name)}
          </Text>
          <Text variant="footnote" tone="secondary" numberOfLines={1}>
            {`${l(service?.name)} · ${f.money(a.price)}`}
          </Text>
        </View>
        <StatusBadge status={a.status} short />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Icon name="calendar" size={13} color={colors.textSecondary} />
          <Text variant="subhead" numberOfLines={1} tabular style={{ flexShrink: 1 }}>
            {`${f.dateShort(start)} · ${f.time(start)}`}
          </Text>
        </View>
        <BarberInline barber={barber} size={18} />
        <SourceTag source={a.source} showLabel={false} />
      </View>
      {meta ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.separator }}>
          <Icon name={meta.icon} size={13} color={meta.color ?? colors.textTertiary} />
          <Text variant="footnote" color={meta.color} tone="secondary" style={{ flex: 1 }} numberOfLines={2}>
            {meta.text}
          </Text>
        </View>
      ) : null}
      {invitation ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label={t('inbox.sendNow')} icon="send" size="sm" style={{ flex: 1.3 }} onPress={resend} />
          <Button label={t('inbox.propose')} size="sm" variant="secondary" style={{ flex: 1 }} onPress={() => router.push(`/appointment/${a.id}/reschedule`)} />
        </View>
      ) : tab === 'requests' ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            label={t('inbox.approve')}
            icon="check"
            size="sm"
            style={{ flex: 1.3 }}
            onPress={() => {
              actions.setAppointmentStatus(a.id, 'confirmed');
              toast({ message: t('inbox.approved') });
            }}
          />
          <Button label={t('inbox.propose')} size="sm" variant="secondary" style={{ flex: 1 }} onPress={() => router.push(`/appointment/${a.id}/reschedule`)} />
          <Button label={t('inbox.decline')} size="sm" variant="dangerSoft" style={{ flex: 1 }} onPress={() => setDeclineOpen(true)} />
        </View>
      ) : tab === 'awaiting' || tab === 'expired' ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label={t('inbox.resend')} icon="send" size="sm" variant={tab === 'expired' ? 'primary' : 'secondary'} style={{ flex: 1 }} onPress={resend} />
          <Button label={t('inbox.call')} icon="phone" size="sm" variant="secondary" style={{ flex: 1 }} onPress={() => toast({ message: t('appointment.toast.calling', { name: l(customer?.name) }), description: t('common.toast.simulated'), icon: 'phone' })} />
        </View>
      ) : null}
      <Dialog
        visible={declineOpen}
        onClose={() => setDeclineOpen(false)}
        icon="x"
        tone="danger"
        title={t('appointment.declineDialog.title')}
        message={t('appointment.declineDialog.body')}
        confirmLabel={t('appointment.declineDialog.confirm')}
        onConfirm={() => {
          actions.setAppointmentStatus(a.id, 'cancelled', { reason: t('appointment.actions.decline') });
          toast({ message: t('appointment.toast.declined'), description: t('common.toast.simulated'), tone: 'default' });
        }}
      />
    </Pressable>
  );
}

const ACTIVITY_ICON: Record<ActivityEvent['kind'], IconName> = {
  created: 'plus-circle',
  request: 'inbox',
  confirmed: 'check-circle',
  cancelled: 'x-circle',
  rescheduled: 'repeat',
  link_sent: 'send',
  link_opened: 'eye',
  link_expired: 'alert-triangle',
  checked_in: 'user-check',
  completed: 'check',
  no_show: 'user-x',
};

function ActivityRow({ event: e }: { event: ActivityEvent }) {
  const { colors, status } = useTheme();
  const { t, l, f } = useI18n();
  const look = useLookup();
  const a = look.appointment(e.appointmentId);
  const customer = look.customer(a?.customerId);
  const service = look.service(a?.serviceId);
  const toneKey = e.kind === 'confirmed' ? 'confirmed' : e.kind === 'cancelled' ? 'cancelled' : e.kind === 'no_show' ? 'no_show' : e.kind === 'link_expired' ? 'expired' : e.kind === 'rescheduled' ? 'rescheduled' : e.kind === 'completed' ? 'completed' : e.kind === 'checked_in' ? 'checked_in' : e.kind === 'request' ? 'draft' : null;
  const tone = toneKey ? status[toneKey] : null;
  return (
    <Pressable onPress={() => a && router.push(`/appointment/${a.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: tone?.bg ?? colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={ACTIVITY_ICON[e.kind]} size={15} color={tone?.fg ?? colors.textSecondary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" numberOfLines={1}>
          {t(`inbox.activity.${e.kind}`, { customer: l(customer?.name), service: l(service?.name) })}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <SourceTag source={e.source} />
          <Text variant="caption" tone="tertiary">
            {`· ${t(`appointment.actor.${e.actor}`)}`}
          </Text>
        </View>
      </View>
      <Text variant="caption" tone="tertiary">
        {f.relative(new Date(e.at), now())}
      </Text>
    </Pressable>
  );
}

/** Stacked bar showing where the last week's bookings came from — the "one calendar, every booking" story. */
function SourceMix() {
  const { colors, radius, isDark } = useTheme();
  const { t, f } = useI18n();
  const { appointments } = useAppState();
  const since = now().getTime() - 7 * 86_400_000;
  const recent = appointments.filter((a) => {
    const c = new Date(a.createdAt).getTime();
    return c >= since && c <= now().getTime() && !a.rescheduledFromId;
  });
  const total = recent.length || 1;
  const palette: Record<BookingSource, string> = {
    phone: isDark ? '#8DB4F7' : '#3B6FD1',
    whatsapp: colors.whatsapp,
    online: colors.accent,
    walk_in: isDark ? '#B6A0F5' : '#7A5BD6',
    staff: isDark ? '#A9B1BD' : '#6B7380',
    recurring: isDark ? '#5ED6C9' : '#14A396',
    voice: isDark ? '#F7C25C' : '#D89A00',
  };
  const rows = BOOKING_SOURCES.map((s) => ({ s, n: recent.filter((a) => a.source === s).length })).filter((r) => r.n > 0).sort((a, b) => b.n - a.n);
  return (
    <Card style={{ gap: 14 }}>
      <View style={{ gap: 2 }}>
        <Text variant="headline">{t('inbox.sourceMix')}</Text>
        <Text variant="footnote" tone="secondary">
          {t('inbox.sourceMixBody', { count: recent.length })}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', height: 10, borderRadius: radius.pill, overflow: 'hidden', gap: 2 }}>
        {rows.map((r) => (
          <View key={r.s} style={{ flex: r.n, backgroundColor: palette[r.s] }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 16 }}>
        {rows.map((r) => (
          <View key={r.s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: palette[r.s] }} />
            <Text variant="caption" tone="secondary">
              {`${t(`domain.sourceShort.${r.s}`)} ${f.percent(r.n / total)}`}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
