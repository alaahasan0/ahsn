import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CategoryBadge, SourceTag, StatusBadge, WhatsAppStatus } from '@/components/domain/Badges';
import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { SOURCE_ICON, STATUS_ICON } from '@/components/domain/meta';
import { Avatar } from '@/components/ui/Avatar';
import { Button, type ButtonVariant } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Header } from '@/components/ui/Header';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { ListRow } from '@/components/ui/ListRow';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n, type TKey } from '@/i18n';
import { now } from '@/lib/clock';
import { addMinutes } from '@/lib/dates';
import { useActions } from '@/store/AppStore';
import { usePreferences } from '@/store/preferences';
import { useAppointment, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Appointment, AppointmentEvent, AppointmentStatus } from '@/types/models';

import { CancelDialog } from './CancelDialog';
import { linkUrl } from './messages';

type ActionKey = 'approve' | 'confirm' | 'checkIn' | 'complete' | 'noShow' | 'cancel' | 'decline' | 'reschedule' | 'resend' | 'sendLink' | 'rebook';

interface ActionDef {
  key: ActionKey;
  label: TKey;
  icon: IconName;
  variant?: ButtonVariant;
}

function actionsFor(a: Appointment): { primary?: ActionDef; secondary: ActionDef[] } {
  const started = new Date(a.start) <= now();
  const live: AppointmentStatus[] = ['draft', 'pending', 'confirmed', 'checked_in'];
  const sec: ActionDef[] = [];
  let primary: ActionDef | undefined;
  switch (a.status) {
    case 'draft':
      primary = { key: 'approve', label: 'appointment.actions.approve', icon: 'check' };
      sec.push({ key: 'reschedule', label: 'appointment.actions.proposeTime', icon: 'clock' }, { key: 'decline', label: 'appointment.actions.decline', icon: 'x', variant: 'dangerSoft' });
      break;
    case 'pending':
      primary = started ? { key: 'checkIn', label: 'appointment.actions.checkIn', icon: 'user-check' } : { key: 'confirm', label: 'appointment.actions.confirm', icon: 'check' };
      sec.push({ key: 'resend', label: 'appointment.actions.resend', icon: 'send' });
      break;
    case 'confirmed':
      primary = { key: 'checkIn', label: 'appointment.actions.checkIn', icon: 'user-check' };
      break;
    case 'checked_in':
      primary = { key: 'complete', label: 'appointment.actions.complete', icon: 'check-circle' };
      break;
    case 'expired':
      primary = { key: 'resend', label: 'appointment.actions.resend', icon: 'send' };
      sec.push({ key: 'confirm', label: 'appointment.actions.confirm', icon: 'check' });
      break;
    default:
      primary = { key: 'rebook', label: 'appointment.actions.rebook', icon: 'repeat', variant: 'secondary' };
  }
  if (live.includes(a.status) && a.status !== 'draft') sec.push({ key: 'reschedule', label: 'appointment.actions.reschedule', icon: 'calendar' });
  if ((a.status === 'confirmed' || a.status === 'pending') && started) sec.push({ key: 'noShow', label: 'appointment.actions.noShow', icon: 'user-x' });
  if (live.includes(a.status) && a.status !== 'draft' && a.status !== 'checked_in') sec.push({ key: 'cancel', label: 'appointment.actions.cancel', icon: 'x-circle', variant: 'dangerSoft' });
  if (a.status === 'checked_in') sec.push({ key: 'cancel', label: 'appointment.actions.cancel', icon: 'x-circle', variant: 'dangerSoft' });
  if (a.status === 'confirmed' && !a.confirmation && a.source !== 'walk_in' && !started) sec.push({ key: 'sendLink', label: 'appointment.actions.sendLink', icon: 'link' });
  return { primary, secondary: sec };
}

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const appointment = useAppointment(id);
  const { t } = useI18n();
  if (!appointment) {
    return (
      <Screen header={<Header title={t('appointment.title')} backFallback="/owner/calendar" />}>
        <EmptyState icon="calendar" title={t('appointment.notFound')} body={t('appointment.notFoundBody')} actionLabel={t('common.actions.back')} onAction={() => router.replace('/owner/calendar')} />
      </Screen>
    );
  }
  return <Details appointment={appointment} />;
}

function Details({ appointment: a }: { appointment: Appointment }) {
  const { colors, radius, status: tones } = useTheme();
  const { t, l, f } = useI18n();
  const toast = useToast();
  const actions = useActions();
  const look = useLookup();
  const { role } = usePreferences();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [noShowOpen, setNoShowOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [note, setNote] = useState('');

  const customer = look.customer(a.customerId);
  const service = look.service(a.serviceId);
  const barber = look.barber(a.barberId);
  const start = new Date(a.start);
  const end = addMinutes(start, a.durationMin);
  const tone = tones[a.status];
  const { primary, secondary } = actionsFor(a);
  const isBarber = role === 'barber';
  const simulated = t('common.toast.simulated');

  const run = (key: ActionKey) => {
    switch (key) {
      case 'approve':
      case 'confirm':
        actions.setAppointmentStatus(a.id, 'confirmed');
        toast({ message: t('appointment.toast.confirmed'), description: key === 'approve' ? simulated : undefined });
        break;
      case 'checkIn':
        actions.setAppointmentStatus(a.id, 'checked_in');
        toast({ message: t('appointment.toast.checkedIn'), icon: 'user-check' });
        break;
      case 'complete':
        actions.setAppointmentStatus(a.id, 'completed');
        toast({ message: t('appointment.toast.completed') });
        break;
      case 'noShow':
        setNoShowOpen(true);
        break;
      case 'cancel':
        setCancelOpen(true);
        break;
      case 'decline':
        setDeclineOpen(true);
        break;
      case 'reschedule':
        router.push(`/appointment/${a.id}/reschedule`);
        break;
      case 'resend':
      case 'sendLink':
        actions.resendConfirmation(a.id, a.confirmation?.channel ?? (customer?.whatsapp ? 'whatsapp' : 'sms'));
        toast({ message: t('appointment.toast.linkSent'), description: simulated, icon: 'send' });
        break;
      case 'rebook':
        router.push(`/appointment/new?customerId=${a.customerId}&barberId=${a.barberId}`);
        break;
    }
  };

  const linkState = (() => {
    const c = a.confirmation;
    if (!c) return null;
    const confirmed = a.history.some((h) => h.type === 'confirmed' && h.actor === 'customer');
    const expired = a.status === 'expired' || (new Date(c.expiresAt) < now() && a.status === 'pending');
    return { c, confirmed, expired };
  })();

  return (
    <Screen
      header={<Header title={t('appointment.title')} backFallback="/owner/calendar" />}
      footer={
        primary ? (
          <View style={{ gap: 10 }}>
            <Button label={t(primary.label)} icon={primary.icon} variant={primary.variant ?? (primary.key === 'complete' ? 'ink' : 'primary')} size={isBarber ? 'lg' : 'md'} onPress={() => run(primary.key)} testID={`action-${primary.key}`} />
            {isBarber && secondary.length ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {secondary.slice(0, 2).map((s) => (
                  <Button key={s.key} label={t(s.key === 'cancel' ? 'appointment.actions.cancelShort' : s.label)} icon={s.icon} variant={s.variant ?? 'secondary'} size="lg" onPress={() => run(s.key)} style={{ flex: 1 }} />
                ))}
              </View>
            ) : null}
          </View>
        ) : undefined
      }
    >
      <View style={{ gap: 22, paddingTop: 4 }}>
        {/* Hero */}
        <View style={{ gap: 10 }}>
          <StatusBadge status={a.status} size="md" />
          <Text variant="title1" tabular>
            {f.timeRange(start, end)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Text variant="callout" tone="secondary">
              {f.dateLong(start)}
            </Text>
            <Text variant="callout" tone="tertiary">
              ·
            </Text>
            <SourceTag source={a.source} short={false} />
          </View>
          {a.cancellationReason && a.status === 'cancelled' ? (
            <Text variant="footnote" tone="danger">
              {t('appointment.cancellationReason', { reason: a.cancellationReason })}
            </Text>
          ) : null}
        </View>

        {a.rescheduledToId || a.rescheduledFromId ? <RescheduleBanner appointment={a} /> : null}

        {/* Customer */}
        {customer ? (
          <Card style={{ gap: 14 }}>
            <Pressable onPress={() => router.push(`/customers/${customer.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar name={l(customer.name)} size={48} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="headline" numberOfLines={1}>
                  {l(customer.name)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Text variant="footnote" tone="secondary">
                    {f.ltr(f.phone(customer.phone.country, customer.phone.number))}
                  </Text>
                  {customer.whatsapp ? <WhatsAppStatus status={customer.whatsappVerification} compact /> : null}
                </View>
              </View>
              <CategoryBadge category={customer.category} />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button label={t('common.actions.call')} icon="phone" variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => toast({ message: t('appointment.toast.calling', { name: l(customer.name) }), description: simulated, icon: 'phone' })} />
              <Button label={t('common.phone.channels.whatsapp')} icon="ion:logo-whatsapp" variant="secondary" size="sm" style={{ flex: 1 }} disabled={!customer.whatsapp} onPress={() => toast({ message: t('appointment.toast.whatsapp'), description: simulated, icon: 'message-circle' })} />
              <Button label={t('appointment.viewProfile')} icon="user" variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => router.push(`/customers/${customer.id}`)} />
            </View>
          </Card>
        ) : null}

        {/* Details */}
        <Section title={t('appointment.details')} card>
          <ListRow icon="scissors" title={l(service?.name)} subtitle={f.duration(a.durationMin)} value={f.money(a.price)} />
          <ListRow leading={<BarberAvatar barber={barber} size={32} />} title={l(barber?.name)} subtitle={a.autoAssigned ? t('appointment.assignedAuto') : l(barber?.title)} />
          <ListRow icon="calendar" title={f.dateLong(start)} subtitle={f.timeRange(start, end)} />
          <ListRow icon={SOURCE_ICON[a.source]} iconColor={a.source === 'whatsapp' ? colors.whatsapp : undefined} title={t(`domain.source.${a.source}`)} subtitle={`${t('appointment.createdAgo', { time: f.relative(new Date(a.createdAt), now()) })} · ${t(`appointment.actor.${a.createdBy}`)}`} />
          {a.recurringId ? <ListRow icon="repeat" title={t('appointment.recurringSeries')} onPress={() => router.push(`/recurring/${a.recurringId}`)} /> : null}
        </Section>

        {/* Owner actions (barbers get them in the footer) */}
        {!isBarber && secondary.length ? (
          <Section title={t('appointment.actions.title')}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {secondary.map((s) => (
                <Button key={s.key} label={t(s.label)} icon={s.icon} variant={s.variant ?? 'secondary'} size="sm" onPress={() => run(s.key)} />
              ))}
            </View>
          </Section>
        ) : null}

        {/* Confirmation link */}
        <Section title={t('appointment.link.title')}>
          <Card variant="outline" style={{ gap: 12 }}>
            {linkState ? (
              <>
                <LinkLine icon={linkState.c.channel === 'whatsapp' ? 'ion:logo-whatsapp' : 'message-square'} text={t('appointment.link.sentVia', { channel: t(`common.phone.channels.${linkState.c.channel}`), time: f.relative(new Date(linkState.c.sentAt), now()) })} />
                <LinkLine icon="eye" text={linkState.c.openedAt ? t('appointment.link.opened', { time: f.relative(new Date(linkState.c.openedAt), now()) }) : t('appointment.link.notOpened')} muted={!linkState.c.openedAt} />
                {linkState.confirmed ? (
                  <LinkLine icon="check-circle" text={t('appointment.link.confirmedByCustomer')} color={colors.success} />
                ) : linkState.expired ? (
                  <LinkLine icon="alert-triangle" text={t('appointment.link.expired', { time: f.relative(new Date(linkState.c.expiresAt), now()) })} color={tones.expired.fg} />
                ) : (
                  <LinkLine icon="clock" text={t('appointment.link.expiresIn', { time: f.relative(new Date(linkState.c.expiresAt), now()) })} muted />
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted }}>
                  <Icon name="lock" size={13} color={colors.textTertiary} />
                  <Text variant="footnote" tone="secondary" style={{ flex: 1, writingDirection: 'ltr', textAlign: 'left' }} numberOfLines={1}>
                    {linkUrl(linkState.c.token)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button label={t('appointment.link.copy')} icon="copy" variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => toast({ message: t('appointment.toast.linkCopied'), icon: 'copy' })} />
                  <Button label={t('appointment.link.preview')} icon="smartphone" variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => router.push(`/m/${linkState.c.token}`)} />
                </View>
              </>
            ) : (
              <Text variant="footnote" tone="secondary">
                {t('appointment.link.notSent')}
              </Text>
            )}
          </Card>
        </Section>

        {/* Notes */}
        <Section title={t('appointment.notes.title')} subtitle={t('appointment.notes.hint')}>
          <View style={{ gap: 10 }}>
            {a.notes.length === 0 ? (
              <Text variant="footnote" tone="tertiary">
                {t('appointment.notes.empty')}
              </Text>
            ) : (
              a.notes.map((n) => (
                <View key={n.id} style={{ padding: 12, borderRadius: radius.md, backgroundColor: colors.warningSoft, gap: 4 }}>
                  <Text variant="callout">{n.text}</Text>
                  <Text variant="caption" tone="tertiary">
                    {f.relative(new Date(n.at), now())}
                  </Text>
                </View>
              ))
            )}
            <Input
              value={note}
              onChangeText={setNote}
              placeholder={t('appointment.notes.placeholder')}
              multiline
              trailing={
                note.trim() ? (
                  <Pressable
                    onPress={() => {
                      actions.addAppointmentNote(a.id, note.trim());
                      setNote('');
                      toast({ message: t('appointment.toast.noteAdded'), icon: 'file-text' });
                    }}
                    accessibilityLabel={t('appointment.notes.add')}
                    style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}
                  >
                    <Icon name="arrow-up" size={16} color={colors.accentText} />
                  </Pressable>
                ) : null
              }
            />
          </View>
        </Section>

        {/* History */}
        <Section title={t('appointment.history.title')}>
          <View style={{ paddingStart: 4 }}>
            {[...a.history].reverse().map((e, i, arr) => (
              <HistoryItem key={e.id} event={e} last={i === arr.length - 1} tone={tone.dot} />
            ))}
          </View>
        </Section>
      </View>

      <CancelDialog
        appointment={a}
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={(reason) => {
          actions.setAppointmentStatus(a.id, 'cancelled', { reason });
          toast({ message: t('appointment.toast.cancelled'), description: simulated, tone: 'default', icon: 'x-circle' });
        }}
      />
      <Dialog
        visible={noShowOpen}
        onClose={() => setNoShowOpen(false)}
        icon="user-x"
        tone="danger"
        title={t('appointment.noShowDialog.title')}
        message={t('appointment.noShowDialog.body')}
        confirmLabel={t('appointment.noShowDialog.confirm')}
        onConfirm={() => {
          actions.setAppointmentStatus(a.id, 'no_show');
          toast({ message: t('appointment.toast.noShow'), icon: 'user-x', tone: 'default' });
        }}
      />
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
          toast({ message: t('appointment.toast.declined'), description: simulated, tone: 'default' });
        }}
      />
    </Screen>
  );
}

function LinkLine({ icon, text, muted, color }: { icon: IconName; text: string; muted?: boolean; color?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name={icon} size={15} color={color ?? (muted ? colors.textTertiary : colors.textSecondary)} />
      <Text variant="footnote" color={color} tone={muted ? 'tertiary' : 'secondary'} style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

function RescheduleBanner({ appointment: a }: { appointment: Appointment }) {
  const { colors, radius, status } = useTheme();
  const { t, f } = useI18n();
  const look = useLookup();
  const other = look.appointment(a.rescheduledToId ?? a.rescheduledFromId);
  if (!other) return null;
  const to = !!a.rescheduledToId;
  return (
    <Pressable onPress={() => router.push(`/appointment/${other.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, backgroundColor: status.rescheduled.bg }}>
      <Icon name="repeat" size={18} color={status.rescheduled.fg} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="callout" weight="semibold" color={status.rescheduled.fg}>
          {t(to ? 'appointment.rescheduledTo' : 'appointment.rescheduledFrom', { date: `${f.dateShort(new Date(other.start))} · ${f.time(new Date(other.start))}` })}
        </Text>
        <Text variant="footnote" color={status.rescheduled.fg}>
          {t(to ? 'appointment.viewNew' : 'appointment.viewOriginal')}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

const EVENT_ICON: Record<AppointmentEvent['type'], IconName> = {
  created: 'plus-circle',
  link_sent: 'send',
  confirmed: STATUS_ICON.confirmed,
  checked_in: STATUS_ICON.checked_in,
  completed: STATUS_ICON.completed,
  cancelled: STATUS_ICON.cancelled,
  no_show: STATUS_ICON.no_show,
  rescheduled: STATUS_ICON.rescheduled,
  expired: STATUS_ICON.expired,
  note: 'file-text',
  reminder_sent: 'bell',
  status: 'activity',
};

function HistoryItem({ event: e, last, tone }: { event: AppointmentEvent; last: boolean; tone: string }) {
  const { colors } = useTheme();
  const { t, f } = useI18n();
  const label =
    e.type === 'created'
      ? t('appointment.history.created', { source: t(`domain.source.${(e.detail as Appointment['source']) ?? 'staff'}`) })
      : e.type === 'link_sent'
        ? t('appointment.history.link_sent', { channel: t(`common.phone.channels.${e.detail === 'sms' ? 'sms' : e.detail === 'call' ? 'call' : 'whatsapp'}`) })
        : t(`appointment.history.${e.type}`);
  const at = new Date(e.at);
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ alignItems: 'center', width: 28 }}>
        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={EVENT_ICON[e.type]} size={13} color={e.type === 'confirmed' || e.type === 'completed' ? tone : colors.textSecondary} />
        </View>
        {!last ? <View style={{ flex: 1, width: 1.5, backgroundColor: colors.separator, marginVertical: 2 }} /> : null}
      </View>
      <View style={{ flex: 1, paddingBottom: last ? 0 : 16, gap: 2 }}>
        <Text variant="callout">{label}</Text>
        {e.type === 'note' && e.detail ? (
          <Text variant="footnote" tone="secondary" numberOfLines={2}>
            “{e.detail}”
          </Text>
        ) : null}
        <Text variant="caption" tone="tertiary">
          {`${f.dateShort(at)} · ${f.time(at)} · ${t('appointment.history.by', { actor: t(`appointment.actor.${e.actor}`) })}`}
        </Text>
      </View>
    </View>
  );
}
