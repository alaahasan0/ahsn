import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ActionSheet, Button, Card, DateField, EmptyState, HeaderActions, Icon, IconButton, KeyValue, Screen, Section, Sheet, StatusPill, Text, TextField, Timeline, toneColors, useDialog, useToast } from '@/components';
import type { HotelBooking, InvoiceStatus } from '@/data/models';
import { getHotel, getProgramme, personName } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/dates';
import { money } from '@/utils/format';

import { daysUntil, guestKindLabel, hotelWorkflowSteps, nights, PENDING_BOOKING, PersonCell, profileRoute } from './components';

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { colors } = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [amendOpen, setAmendOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const b = db.hotelBookings.find((x) => x.id === id);
  const hotel = b ? getHotel(db, b.hotelId) : undefined;
  const [conf, setConf] = useState('');
  const [dates, setDates] = useState({ checkIn: b?.checkIn ?? '', checkOut: b?.checkOut ?? '' });

  if (!b || !hotel) {
    return (
      <Screen title="Booking">
        <EmptyState icon="bed-double" title="Booking not found" actionLabel="All hotels" onAction={() => router.replace('/hotels')} />
      </Screen>
    );
  }

  const prog = getProgramme(db, b.programmeId);
  const guest = personName(db, b.guest.id);
  const pending = PENDING_BOOKING.includes(b.status) && b.status !== 'Amended';
  const cancelled = b.status === 'Cancelled';
  const deadlineDays = daysUntil(b.cancellationDeadline);
  const rate = hotel.roomTypes.find((r) => r.name === b.roomType)?.rate ?? hotel.contractedRate;

  const heroTone = cancelled ? 'neutral' : pending ? 'warning' : 'success';
  const tc = toneColors(heroTone, colors);

  const update = (patch: Partial<HotelBooking>, message: string, icon: 'circle-check' | 'key-round' | 'log-out' | 'receipt' | 'calendar' | 'ban' = 'circle-check') => {
    actions.update('hotelBookings', b.id, patch);
    toast.show({ message, detail: `${guest} · ${hotel.name}`, icon });
  };

  const openConfirm = () => {
    setConf(b.confirmationNumber ?? `${hotel.name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase()}-${48500 + Math.floor(Math.random() * 400)}`);
    setConfirmOpen(true);
  };

  const confirm = () => {
    actions.setBookingStatus(b.id, 'Confirmed', conf.trim() || undefined);
    actions.log(b.programmeId, 'hotel_confirmed', `confirmed ${guest}’s room at ${hotel.name}${conf ? ` (${conf})` : ''}`);
    setConfirmOpen(false);
    toast.show({ message: 'Booking confirmed', detail: conf ? `Confirmation ${conf}` : hotel.name, icon: 'circle-check' });
  };

  const cancel = async () => {
    const { confirmed } = await dialog.confirm({
      title: 'Cancel this booking?',
      message: deadlineDays >= 0 ? `No penalty — the free cancellation deadline is ${formatDate(b.cancellationDeadline)}.` : `The free cancellation deadline passed on ${formatDate(b.cancellationDeadline)}. ${hotel.name} may charge one night (${money(rate)}).`,
      confirmLabel: 'Cancel booking',
      cancelLabel: 'Keep',
      destructive: true,
      icon: 'ban',
    });
    if (confirmed) {
      update({ status: 'Cancelled' }, 'Booking cancelled', 'ban');
      actions.log(b.programmeId, 'booking_changed', `cancelled ${guest}’s booking at ${hotel.name}`);
    }
  };

  const setInvoice = (s: InvoiceStatus) => update({ invoiceStatus: s }, `Invoice ${s.toLowerCase()}`, 'receipt');

  const primary = cancelled
    ? undefined
    : pending
      ? { title: 'Confirm booking', icon: 'circle-check' as const, onPress: openConfirm }
      : b.status === 'Confirmed' || b.status === 'Amended'
        ? { title: 'Check in', icon: 'key-round' as const, onPress: () => update({ status: 'Checked In' }, 'Guest checked in', 'key-round') }
        : b.status === 'Checked In'
          ? { title: 'Check out', icon: 'log-out' as const, onPress: () => update({ status: 'Checked Out' }, 'Guest checked out', 'log-out') }
          : b.invoiceStatus === 'Not Invoiced'
            ? { title: 'Mark invoice received', icon: 'receipt' as const, onPress: () => setInvoice('Invoice Received') }
            : undefined;

  return (
    <Screen
      title={guest}
      eyebrow={`Hotel booking · ${prog?.shortName ?? ''}`}
      headerRight={
        <HeaderActions>
          <IconButton icon="ellipsis" accessibilityLabel="More actions" onPress={() => setMenu(true)} />
        </HeaderActions>
      }
      footer={
        primary ? (
          <>
            <Button title="Amend" variant="secondary" icon="calendar" onPress={() => { setDates({ checkIn: b.checkIn, checkOut: b.checkOut }); setAmendOpen(true); }} style={{ flex: 1 }} disabled={b.status === 'Checked Out'} />
            <Button title={primary.title} icon={primary.icon} onPress={primary.onPress} style={{ flex: 2 }} />
          </>
        ) : undefined
      }>
      {/* Confirmation status hero */}
      <Card padding="lg" style={{ gap: 14, borderWidth: 1, borderColor: tc.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: tc.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={cancelled ? 'ban' : pending ? 'hourglass' : 'circle-check-big'} size={26} color={tc.solid} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="overline" color={tc.fg}>
              {cancelled ? 'Cancelled' : pending ? 'Awaiting confirmation' : b.status}
            </Text>
            <Text variant="title2" tabular numberOfLines={1}>
              {b.confirmationNumber ?? 'No confirmation yet'}
            </Text>
            <Text variant="footnote" tone="secondary" numberOfLines={1}>
              {hotel.name}
            </Text>
          </View>
        </View>
        {pending ? (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: deadlineDays <= 7 ? colors.dangerSoft : colors.warningSoft }}>
            <Icon name="calendar-x" size={16} color={deadlineDays <= 7 ? colors.danger : colors.warning} />
            <Text variant="subhead" color={deadlineDays <= 7 ? colors.dangerText : colors.warningText} style={{ flex: 1 }}>
              {deadlineDays < 0 ? `Release date passed on ${formatDate(b.cancellationDeadline, { year: false })}` : `Room released ${deadlineDays === 0 ? 'today' : `in ${deadlineDays} days`} (${formatDate(b.cancellationDeadline, { year: false })}) unless guaranteed`}
            </Text>
          </View>
        ) : null}
      </Card>

      <Section title="Booking record">
        <Card padding="md" style={{ paddingVertical: 4 }}>
          <KeyValue label="Hotel" value={hotel.name} icon="hotel" onPress={() => router.push(`/hotel/${hotel.id}`)} />
          <KeyValue label="Programme" value={prog?.name ?? '—'} icon="layers" onPress={() => router.push(`/programme/${b.programmeId}`)} />
          <KeyValue label="Guest" value={`${guest} · ${guestKindLabel(b.guest.kind)}`} icon="user" onPress={() => router.push(profileRoute(b.guest) as never)} />
          <KeyValue label="Room type" value={b.roomType + (b.roomNumber ? ` · Room ${b.roomNumber}` : '')} icon="bed-double" />
          <KeyValue label="Check-in" value={formatDate(b.checkIn, { weekday: true })} icon="calendar-check" />
          <KeyValue label="Check-out" value={formatDate(b.checkOut, { weekday: true })} icon="calendar" />
          <KeyValue label="Nights" value={String(nights(b))} icon="moon" />
          <KeyValue label="Confirmation" value={b.confirmationNumber ?? 'Pending'} icon="hash" valueTone={b.confirmationNumber ? 'primary' : 'warning'} />
          <KeyValue label="Status" value={b.status} icon="circle-dot" />
          <KeyValue label="Cost" value={`${money(b.cost)} · ${money(rate)}/night`} icon="banknote" />
          <KeyValue label="Invoice" value={b.invoiceStatus} icon="receipt" valueTone={b.invoiceStatus === 'Paid' ? 'success' : b.invoiceStatus === 'Disputed' ? 'danger' : 'primary'} />
          <KeyValue label="Cancel by" value={formatDate(b.cancellationDeadline)} icon="calendar-x" last={!b.specialRequests} valueTone={pending && deadlineDays <= 7 ? 'danger' : 'primary'} />
          {b.specialRequests ? <KeyValue label="Special requests" value={b.specialRequests} icon="message-square" multiline last /> : null}
        </Card>
      </Section>

      <Section title="Booking workflow" subtitle="Select hotel → confirm → invoice → reconcile">
        <Card padding="md">
          <Timeline steps={hotelWorkflowSteps(b)} dense />
        </Card>
      </Section>

      <Section title="Guest">
        <Card padding="md" onPress={() => router.push(`/rooming/${b.programmeId}`)} accessibilityLabel="Open rooming list">
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <PersonCell db={db} person={b.guest} size={40} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">{guest}</Text>
              <Text variant="footnote" tone="secondary">
                On the {prog?.shortName} rooming list
              </Text>
            </View>
            <StatusPill label={b.status} />
            <Icon name="chevron-right" size={18} tone="tertiary" />
          </View>
        </Card>
      </Section>

      {/* Confirm sheet */}
      <Sheet visible={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm booking" subtitle={hotel.name} footer={<Button title="Confirm booking" icon="circle-check" onPress={confirm} style={{ flex: 1 }} />}>
        <View style={{ gap: 14 }}>
          <Text variant="callout" tone="secondary">
            Record the confirmation number from {hotel.contactName.split(' · ')[0]}’s email. The rooming list and readiness update straight away.
          </Text>
          <TextField label="Confirmation number" value={conf} onChangeText={setConf} placeholder="e.g. CGH-48210" icon="hash" required />
          <Card variant="alt" padding="sm">
            <Text variant="footnote" tone="secondary">
              {guest} · {b.roomType} · {nights(b)} nights · {money(b.cost)}
            </Text>
          </Card>
        </View>
      </Sheet>

      {/* Amend sheet */}
      <Sheet
        visible={amendOpen}
        onClose={() => setAmendOpen(false)}
        title="Amend dates"
        subtitle={`${nights(dates)} nights · ${money(nights(dates) * rate)}`}
        footer={
          <Button
            title="Send amendment"
            icon="send"
            disabled={dates.checkOut <= dates.checkIn}
            onPress={() => {
              actions.update('hotelBookings', b.id, { checkIn: dates.checkIn, checkOut: dates.checkOut, cost: nights(dates) * rate, status: b.status === 'Confirmed' ? 'Amended' : b.status });
              actions.log(b.programmeId, 'booking_changed', `amended ${guest}’s stay to ${formatDate(dates.checkIn, { year: false })}–${formatDate(dates.checkOut, { year: false })}`);
              setAmendOpen(false);
              toast.show({ message: 'Amendment sent to hotel', detail: `${formatDate(dates.checkIn, { year: false })} – ${formatDate(dates.checkOut, { year: false })}`, icon: 'send' });
            }}
            style={{ flex: 1 }}
          />
        }>
        <View style={{ gap: 14 }}>
          <DateField label="Check-in" value={dates.checkIn} onChange={(d) => setDates((x) => ({ ...x, checkIn: d }))} />
          <DateField label="Check-out" value={dates.checkOut} onChange={(d) => setDates((x) => ({ ...x, checkOut: d }))} minDate={dates.checkIn} helper={dates.checkOut <= dates.checkIn ? 'Check-out must be after check-in' : undefined} />
        </View>
      </Sheet>

      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title="Booking actions"
        actions={[
          { label: 'Confirm booking', icon: 'circle-check', onPress: openConfirm, disabled: !pending },
          { label: 'Mark invoice received', icon: 'receipt', onPress: () => setInvoice('Invoice Received'), disabled: b.invoiceStatus !== 'Not Invoiced' },
          { label: 'Approve invoice', icon: 'stamp', onPress: () => setInvoice('Approved'), disabled: b.invoiceStatus !== 'Invoice Received' },
          { label: 'Mark invoice paid', icon: 'banknote', onPress: () => setInvoice('Paid'), disabled: b.invoiceStatus !== 'Approved' },
          { label: 'Open rooming list', icon: 'list', onPress: () => router.push(`/rooming/${b.programmeId}`) },
          { label: 'Cancel booking', icon: 'ban', destructive: true, onPress: cancel, disabled: cancelled || b.status === 'Checked Out' },
        ]}
      />
    </Screen>
  );
}
