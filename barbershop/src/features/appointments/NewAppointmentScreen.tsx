import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { CategoryBadge, SourceTag } from '@/components/domain/Badges';
import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { SOURCE_ICON } from '@/components/domain/meta';
import { ServiceRow } from '@/components/domain/ServiceRow';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { Divider } from '@/components/ui/Divider';
import { goBack, Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { StepIndicator } from '@/components/ui/Progress';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { addMinutes, atClock, fromISODate, isSameDay } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { barberWorksOn, isSlotFree, slotsFor, type SlotOption } from '@/store/availability';
import { useAvailabilityContext, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Appointment, BookingSource, CommunicationChannel } from '@/types/models';

import { CustomerStep } from './CustomerStep';
import { MessagePreview } from './MessagePreview';
import { pickTemplate, renderMessage } from './messages';
import { SlotPicker } from './SlotPicker';

const STEPS = ['customer', 'service', 'barber', 'time', 'review'] as const;
const SOURCES: BookingSource[] = ['phone', 'whatsapp', 'walk_in', 'online', 'staff', 'recurring'];

export default function NewAppointmentScreen() {
  const params = useLocalSearchParams<{ customerId?: string; barberId?: string; date?: string; time?: string; source?: string; walkIn?: string }>();
  const { colors, radius } = useTheme();
  const { t, l, f, tp, lang } = useI18n();
  const toast = useToast();
  const state = useAppState();
  const actions = useActions();
  const look = useLookup();
  const ctx = useAvailabilityContext();
  const walkIn = params.walkIn === '1';

  const [step, setStep] = useState(params.customerId ? 1 : 0);
  const [customerId, setCustomerId] = useState<string | undefined>(params.customerId);
  const [serviceId, setServiceId] = useState<string>();
  const [barberChoice, setBarberChoice] = useState<string | 'any'>(params.barberId ?? 'any');
  const [date, setDate] = useState(walkIn || !params.date ? today() : fromISODate(params.date));
  const [slot, setSlot] = useState<SlotOption | null>(null);
  const [source, setSource] = useState<BookingSource>(walkIn ? 'walk_in' : (params.source as BookingSource) || 'phone');
  const [sendLink, setSendLink] = useState(!walkIn);
  const [channel, setChannel] = useState<CommunicationChannel>('whatsapp');
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>(lang);
  const [note, setNote] = useState('');
  const [created, setCreated] = useState<Appointment | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);

  const customer = look.customer(customerId);
  const service = look.service(serviceId);
  const barberId = barberChoice === 'any' ? slot?.barberId : barberChoice;
  const barber = look.barber(barberId);
  const services = state.services.filter((s) => s.active && (barberChoice === 'any' || s.barberIds.includes(barberChoice)));
  const eligibleBarbers = state.barbers.filter((b) => b.active && (!service || service.barberIds.includes(b.id)));

  // Default the link channel from the customer's contact details.
  useEffect(() => {
    if (!customer) return;
    setChannel(customer.whatsapp && customer.preferredChannel !== 'sms' ? 'whatsapp' : 'sms');
  }, [customer]);

  // Prefill a time from the calendar tap, or the next free slot for walk-ins.
  useEffect(() => {
    if (!service || slot) return;
    const options = slotsFor(ctx, barberChoice, date, service);
    if (params.time) {
      const match = options.find((s) => s.available && `${String(s.start.getHours()).padStart(2, '0')}:${String(s.start.getMinutes()).padStart(2, '0')}` === params.time);
      if (match) setSlot(match);
    } else if (walkIn) {
      const first = options.find((s) => s.available);
      if (first) setSlot(first);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id, barberChoice]);

  const canContinue = [!!customer, !!service, !!barberChoice, !!slot, true][step];
  const dirty = !!customerId || !!serviceId;

  const close = () => (dirty && !created ? setDiscardOpen(true) : goBack('/owner/calendar'));
  const back = () => (step === 0 ? close() : setStep(step - 1));

  const previewBody = useMemo(() => {
    const tpl = pickTemplate(state.templates, 'booking_created', channel, previewLang);
    if (!tpl) return '';
    return renderMessage(tpl.body, previewLang, { salon: state.salon, customer, service, barber, start: slot?.start, link: t('appointment.new.linkPlaceholder') });
  }, [state.templates, state.salon, channel, previewLang, customer, service, barber, slot, t]);

  const create = () => {
    if (!customer || !service || !slot || !barberId) return;
    if (!isSlotFree(ctx, barberId, slot.start, service)) {
      toast({ message: t('appointment.new.conflict'), tone: 'danger' });
      setSlot(null);
      setStep(3);
      return;
    }
    const appt = actions.createAppointment({
      customerId: customer.id,
      serviceId: service.id,
      barberId,
      start: slot.start,
      source,
      sendLink,
      linkChannel: channel,
      note: note.trim() || undefined,
      autoAssigned: barberChoice === 'any',
      createdBy: 'staff',
      status: source === 'walk_in' ? 'confirmed' : undefined,
    });
    setCreated(appt);
  };

  const reset = () => {
    setCreated(null);
    setStep(0);
    setCustomerId(undefined);
    setServiceId(undefined);
    setSlot(null);
    setNote('');
    setBarberChoice('any');
  };

  if (created) return <Success appointment={created} onAnother={reset} />;

  const summary = service ? [l(service.name), f.money(service.price), slot ? `${f.dayShort(slot.start)} ${f.time(slot.start)}` : null].filter(Boolean).join(' · ') : null;

  return (
    <Screen
      header={
        <Header
          close={step === 0}
          onBack={back}
          title={walkIn ? t('appointment.new.walkInTitle') : t('appointment.new.title')}
          subtitle={t('appointment.new.stepOf', { current: step + 1, total: STEPS.length })}
        >
          <StepIndicator total={STEPS.length} current={step} />
        </Header>
      }
      footer={
        <View style={{ gap: 10 }}>
          {summary && step > 1 ? (
            <Text variant="footnote" tone="secondary" align="center" numberOfLines={1}>
              {summary}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {step > 0 ? <Button label={t('common.actions.back')} variant="secondary" onPress={back} style={{ flex: 1 }} /> : null}
            {step < STEPS.length - 1 ? (
              <Button label={t('common.actions.continue')} onPress={() => setStep(step + 1)} disabled={!canContinue} style={{ flex: 2 }} iconEnd="arrow-right" testID="new-continue" />
            ) : (
              <Button label={t('appointment.new.create')} onPress={create} icon="check" style={{ flex: 2 }} testID="new-create" />
            )}
          </View>
        </View>
      }
    >
      <View style={{ gap: 18, paddingTop: 8 }}>
        <Text variant="title2">
          {t(
            ({
              customer: 'appointment.new.customerTitle',
              service: 'appointment.new.serviceTitle',
              barber: 'appointment.new.barberTitle',
              time: 'appointment.new.timeTitle',
              review: 'appointment.new.reviewTitle',
            } as const)[STEPS[step]],
          )}
        </Text>

        {step === 0 ? (
          <CustomerStep
            selectedId={customerId}
            onSelect={(c) => {
              setCustomerId(c.id);
              if (c.preferredBarberId && !params.barberId && barberChoice === 'any') setBarberChoice(c.preferredBarberId);
              setStep(1);
            }}
          />
        ) : null}

        {step === 1 ? (
          <View style={{ gap: 10 }}>
            {customer ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <Avatar name={l(customer.name)} size={28} />
                <Text variant="subhead" style={{ flex: 1 }} numberOfLines={1}>
                  {l(customer.name)}
                </Text>
                <CategoryBadge category={customer.category} />
              </View>
            ) : null}
            {services.map((s) => (
              <ServiceRow
                key={s.id}
                service={s}
                selected={s.id === serviceId}
                onPress={() => {
                  setServiceId(s.id);
                  setSlot(null);
                  if (barberChoice !== 'any' && !s.barberIds.includes(barberChoice)) setBarberChoice('any');
                  setStep(2);
                }}
                trailing={
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text variant="headline" tabular>
                      {f.money(s.price)}
                    </Text>
                    {customer?.preferredServiceIds.includes(s.id) ? <Icon name="heart" size={12} color={colors.accent} /> : null}
                  </View>
                }
              />
            ))}
          </View>
        ) : null}

        {step === 2 && service ? (
          <View style={{ gap: 10 }}>
            <BarberOption
              selected={barberChoice === 'any'}
              title={t('common.labels.anyBarber')}
              subtitle={t('appointment.new.anyBarberBody')}
              leading={<Avatar size={44} icon="users" />}
              onPress={() => {
                setBarberChoice('any');
                setSlot(null);
              }}
            />
            {eligibleBarbers.map((b) => {
              const works = barberWorksOn(b, date);
              const free = works ? slotsFor(ctx, b.id, date, service).filter((s) => s.available).length : 0;
              return (
                <BarberOption
                  key={b.id}
                  selected={barberChoice === b.id}
                  title={l(b.name)}
                  subtitle={`${l(b.title)} · ${works ? tp('appointment.new.freeSlots', free) : t('appointment.new.notWorking')}`}
                  leading={<BarberAvatar barber={b} size={44} />}
                  badge={customer?.preferredBarberId === b.id}
                  onPress={() => {
                    setBarberChoice(b.id);
                    setSlot(null);
                  }}
                />
              );
            })}
          </View>
        ) : null}

        {step === 3 && service ? <SlotPicker service={service} barberId={barberChoice} date={date} onChangeDate={(d) => { setDate(d); if (slot && !isSameDay(slot.start, d)) setSlot(null); }} value={slot} onChange={setSlot} requested={params.time && params.date ? atClock(fromISODate(params.date), params.time) : undefined} /> : null}

        {step === 4 && customer && service && slot ? (
          <View style={{ gap: 22 }}>
            <Card style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar name={l(customer.name)} size={44} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="headline">{l(customer.name)}</Text>
                  <Text variant="footnote" tone="secondary" style={{ writingDirection: 'ltr' }}>
                    {f.ltr(f.phone(customer.phone.country, customer.phone.number))}
                  </Text>
                </View>
                <CategoryBadge category={customer.category} />
              </View>
              <Divider />
              <SummaryRow icon="scissors" label={l(service.name)} value={f.duration(service.durationMin)} />
              <SummaryRow icon="calendar" label={f.dateShort(slot.start)} value={f.timeRange(slot.start, addMinutes(slot.start, service.durationMin))} />
              <SummaryRow icon="user" label={l(barber?.name)} value={barberChoice === 'any' ? t('appointment.new.autoAssigned') : undefined} />
              <Divider />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="callout" tone="secondary">
                  {t('appointment.new.total')}
                </Text>
                <Text variant="headline" tabular>
                  {f.money(service.price)}
                </Text>
              </View>
            </Card>

            <View style={{ gap: 10 }}>
              <Text variant="subhead" tone="secondary">
                {t('appointment.new.sourceTitle')}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {SOURCES.map((s) => (
                  <Chip
                    key={s}
                    label={t(`domain.sourceShort.${s}`)}
                    icon={SOURCE_ICON[s]}
                    selected={source === s}
                    onPress={() => {
                      setSource(s);
                      if (s === 'walk_in') setSendLink(false);
                    }}
                  />
                ))}
              </View>
            </View>

            <Card variant="outline" style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="link" size={17} color={colors.accent} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="callout" weight="semibold">
                    {t('appointment.new.linkTitle')}
                  </Text>
                  <Text variant="footnote" tone="secondary">
                    {t('appointment.new.linkBody')}
                  </Text>
                </View>
                <Switch value={sendLink} onValueChange={setSendLink} accessibilityLabel={t('appointment.new.linkTitle')} />
              </View>
              {sendLink ? (
                <View style={{ gap: 12 }}>
                  <SegmentedControl
                    size="sm"
                    value={channel}
                    onChange={(c) => (c === 'whatsapp' && !customer.whatsapp ? undefined : setChannel(c))}
                    segments={[
                      { value: 'whatsapp', label: t('common.phone.channels.whatsapp') },
                      { value: 'sms', label: t('common.phone.channels.sms') },
                    ]}
                  />
                  {!customer.whatsapp ? (
                    <Text variant="footnote" tone="warning">
                      {t('appointment.new.noWhatsapp')}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text variant="overline" tone="tertiary">
                      {t('appointment.new.previewTitle')}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Chip size="sm" label="عربي" selected={previewLang === 'ar'} onPress={() => setPreviewLang('ar')} />
                      <Chip size="sm" label="EN" selected={previewLang === 'en'} onPress={() => setPreviewLang('en')} />
                    </View>
                  </View>
                  <MessagePreview body={previewBody} channel={channel} language={previewLang} />
                </View>
              ) : null}
            </Card>

            <Input label={t('appointment.new.noteLabel')} optional value={note} onChangeText={setNote} placeholder={t('appointment.new.notePlaceholder')} multiline />
          </View>
        ) : null}
      </View>
      <Dialog
        visible={discardOpen}
        onClose={() => setDiscardOpen(false)}
        icon="trash-2"
        tone="danger"
        title={t('common.confirmDiscard.title')}
        message={t('common.confirmDiscard.body')}
        confirmLabel={t('common.confirmDiscard.discard')}
        onConfirm={() => setTimeout(() => goBack('/owner/calendar'), 50)}
      />
    </Screen>
  );
}

function SummaryRow({ icon, label, value }: { icon: 'scissors' | 'calendar' | 'user'; label: string; value?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name={icon} size={16} color={colors.textTertiary} />
      <Text variant="callout" style={{ flex: 1 }} numberOfLines={1}>
        {label}
      </Text>
      {value ? (
        <Text variant="footnote" tone="secondary" tabular numberOfLines={1}>
          {value}
        </Text>
      ) : null}
    </View>
  );
}

function BarberOption({ selected, title, subtitle, leading, onPress, badge }: { selected: boolean; title: string; subtitle: string; leading: React.ReactNode; onPress: () => void; badge?: boolean }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityState={{ selected }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md, borderWidth: 1.5, borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.accentSoft : colors.surface }}>
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="callout" weight="semibold" numberOfLines={1}>
            {title}
          </Text>
          {badge ? <Icon name="heart" size={12} color={colors.accent} /> : null}
        </View>
        <Text variant="footnote" tone="secondary" numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <Icon name={selected ? 'check-circle' : 'circle'} size={20} color={selected ? colors.accent : colors.borderStrong} />
    </Pressable>
  );
}

function Success({ appointment, onAnother }: { appointment: Appointment; onAnother: () => void }) {
  const { colors } = useTheme();
  const { t, l, f } = useI18n();
  const look = useLookup();
  const customer = look.customer(appointment.customerId);
  const service = look.service(appointment.serviceId);
  const barber = look.barber(appointment.barberId);
  const start = new Date(appointment.start);
  return (
    <Screen
      header={<Header close onBack={() => goBack('/owner/calendar')} />}
      footer={
        <View style={{ gap: 10 }}>
          <Button label={t('appointment.new.viewAppointment')} onPress={() => router.replace(`/appointment/${appointment.id}`)} testID="success-view" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button label={t('appointment.new.bookAnother')} variant="secondary" onPress={onAnother} style={{ flex: 1 }} icon="plus" />
            <Button label={t('appointment.new.done')} variant="secondary" onPress={() => goBack('/owner/calendar')} style={{ flex: 1 }} />
          </View>
        </View>
      }
    >
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 32 }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={36} color={colors.success} />
        </View>
        <Text variant="title1" align="center">
          {t('appointment.new.successTitle')}
        </Text>
        <Text variant="callout" tone="secondary" align="center" style={{ maxWidth: 320 }}>
          {appointment.confirmation ? t('appointment.new.successLinkSent', { channel: t(`common.phone.channels.${appointment.confirmation.channel}`) }) : t('appointment.new.successNoLink')}
        </Text>
      </View>
      <Card style={{ gap: 12, marginTop: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={l(customer?.name)} size={44} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headline">{l(customer?.name)}</Text>
            <Text variant="footnote" tone="secondary">
              {l(service?.name)} · {f.money(appointment.price)}
            </Text>
          </View>
        </View>
        <Divider />
        <SummaryRow icon="calendar" label={f.dateShort(start)} value={f.timeRange(start, addMinutes(start, appointment.durationMin))} />
        <SummaryRow icon="user" label={l(barber?.name)} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <SourceTag source={appointment.source} short={false} />
          <Text variant="footnote" tone="secondary">
            {t(`domain.status.${appointment.status}`)}
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
