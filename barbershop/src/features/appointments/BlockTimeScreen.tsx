import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { barberShortName, BarberAvatar } from '@/components/domain/BarberAvatar';
import { blockReasonKey } from '@/components/domain/calendar/keys';
import { DateStrip } from '@/components/domain/DateStrip';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { goBack, Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { now, today } from '@/lib/clock';
import { addMinutes, atClock, clockToMinutes, fromISODate, isSameDay, minutesToClock, overlaps, weekdayOf } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { useBarbers } from '@/store/selectors';
import { useTheme } from '@/theme';
import { ACTIVE_STATUSES, type TimeBlock } from '@/types/models';

const REASONS: TimeBlock['reason'][] = ['break', 'personal', 'meeting', 'holiday', 'other'];
const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function BlockTimeScreen() {
  const params = useLocalSearchParams<{ barberId?: string; date?: string }>();
  const { colors, radius } = useTheme();
  const { t, tp, f, l } = useI18n();
  const toast = useToast();
  const actions = useActions();
  const { blocks, appointments, salon } = useAppState();
  const barbers = useBarbers();
  const [who, setWho] = useState<string>(params.barberId ?? 'all');
  const [date, setDate] = useState(params.date ? fromISODate(params.date) : today());
  const [startMin, setStartMin] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | 'rest'>(30);
  const [reason, setReason] = useState<TimeBlock['reason']>('break');
  const [note, setNote] = useState('');
  const [removeId, setRemoveId] = useState<string | null>(null);

  const sched = who === 'all' ? salon.hours[weekdayOf(date)] : barbers.find((b) => b.id === who)?.schedule[weekdayOf(date)];
  const working = !!sched?.enabled;
  const times = useMemo(() => {
    if (!sched?.enabled) return [];
    const out: number[] = [];
    const nowMin = isSameDay(date, now()) ? now().getHours() * 60 + now().getMinutes() : 0;
    for (let m = clockToMinutes(sched.start); m < clockToMinutes(sched.end); m += 15) if (m >= nowMin - 14) out.push(m);
    return out;
  }, [sched, date]);
  const effectiveStart = startMin ?? times[0] ?? null;
  const endMin = effectiveStart === null || !sched ? null : duration === 'rest' ? clockToMinutes(sched.end) : Math.min(effectiveStart + duration, clockToMinutes(sched.end));

  const start = effectiveStart !== null ? atClock(date, minutesToClock(effectiveStart)) : null;
  const end = endMin !== null ? atClock(date, minutesToClock(endMin)) : null;
  const conflicts = start && end ? appointments.filter((a) => (who === 'all' || a.barberId === who) && ACTIVE_STATUSES.includes(a.status) && overlaps(new Date(a.start), addMinutes(new Date(a.start), a.durationMin), start, end)) : [];
  const dayBlocks = blocks.filter((b) => isSameDay(new Date(b.start), date) && (who === 'all' || b.barberId === who || b.barberId === 'all'));

  const save = () => {
    if (!start || !end) return;
    actions.addBlock({ barberId: who as TimeBlock['barberId'], start: start.toISOString(), end: end.toISOString(), reason, note: note.trim() || undefined });
    toast({ message: t('appointment.block.saved'), icon: 'slash' });
    goBack('/owner/calendar');
  };

  return (
    <Screen
      header={<Header close title={t('appointment.block.title')} backFallback="/owner/calendar" />}
      footer={
        <View style={{ gap: 8 }}>
          {start && end ? (
            <Text variant="footnote" tone="secondary" align="center">
              {`${f.dateShort(date)} · ${t('appointment.block.range', { start: f.time(start), end: f.time(end) })}`}
            </Text>
          ) : null}
          <Button label={t('appointment.block.save')} icon="slash" onPress={save} disabled={!start || !end || !working} testID="block-save" />
        </View>
      }
    >
      <View style={{ gap: 24, paddingTop: 4 }}>
        <Text variant="callout" tone="secondary">
          {t('appointment.block.subtitle')}
        </Text>

        <Field label={t('appointment.block.who')}>
          <ChipRow contentPadding={0}>
            <Chip label={t('appointment.block.allTeam')} icon="users" selected={who === 'all'} onPress={() => { setWho('all'); setStartMin(null); }} />
            {barbers.map((b) => (
              <Chip key={b.id} label={barberShortName(b, l)} dot={b.color} selected={who === b.id} onPress={() => { setWho(b.id); setStartMin(null); }} />
            ))}
          </ChipRow>
        </Field>

        <Field label={t('appointment.block.date')}>
          <DateStrip value={date} onChange={(d) => { setDate(d); setStartMin(null); }} contentPadding={0} days={28} />
        </Field>

        {working ? (
          <>
            <Field label={t('appointment.block.start')}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {times.map((m) => (
                  <Chip key={m} label={f.clock(minutesToClock(m))} selected={effectiveStart === m} onPress={() => setStartMin(m)} />
                ))}
              </ScrollView>
            </Field>
            <Field label={t('appointment.block.duration')}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {DURATIONS.map((d) => (
                  <Chip key={d} label={f.duration(d)} selected={duration === d} onPress={() => setDuration(d)} />
                ))}
                <Chip label={t('appointment.block.allDay')} selected={duration === 'rest'} onPress={() => setDuration('rest')} />
              </View>
            </Field>
          </>
        ) : (
          <Card variant="muted" style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="moon" size={16} color={colors.textSecondary} />
            <Text variant="callout" tone="secondary">
              {t('appointment.block.noWorkingHours')}
            </Text>
          </Card>
        )}

        <Field label={t('appointment.block.reason')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {REASONS.map((r) => (
              <Chip key={r} label={t(blockReasonKey(r))} selected={reason === r} onPress={() => setReason(r)} />
            ))}
          </View>
        </Field>

        <Input label={t('appointment.block.note')} optional value={note} onChangeText={setNote} placeholder={t('appointment.block.notePlaceholder')} />

        {conflicts.length ? (
          <Card variant="outline" style={{ flexDirection: 'row', gap: 10, borderColor: colors.warning, backgroundColor: colors.warningSoft }}>
            <Icon name="alert-triangle" size={16} color={colors.warning} />
            <Text variant="footnote" style={{ flex: 1 }}>
              {tp('appointment.block.conflicts', conflicts.length)}
            </Text>
          </Card>
        ) : null}

        <Section title={t('appointment.block.existing')}>
          {dayBlocks.length === 0 ? (
            <Text variant="footnote" tone="tertiary">
              {t('appointment.block.none')}
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {dayBlocks.map((b) => {
                const barber = barbers.find((x) => x.id === b.barberId);
                return (
                  <View key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                    {barber ? <BarberAvatar barber={barber} size={32} /> : <Avatar size={32} icon="users" />}
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="callout" weight="medium">
                        {t('appointment.block.range', { start: f.time(new Date(b.start)), end: f.time(new Date(b.end)) })}
                      </Text>
                      <Text variant="footnote" tone="secondary" numberOfLines={1}>
                        {`${barber ? l(barber.name) : t('appointment.block.allTeam')} · ${b.note || t(blockReasonKey(b.reason))}`}
                      </Text>
                    </View>
                    <IconButton icon="trash-2" color={colors.danger} onPress={() => setRemoveId(b.id)} accessibilityLabel={t('common.actions.remove')} />
                  </View>
                );
              })}
            </View>
          )}
        </Section>
      </View>
      <Dialog
        visible={!!removeId}
        onClose={() => setRemoveId(null)}
        icon="trash-2"
        tone="danger"
        title={t('appointment.block.removeTitle')}
        message={t('appointment.block.removeBody')}
        confirmLabel={t('common.actions.remove')}
        onConfirm={() => {
          if (removeId) actions.removeBlock(removeId);
          toast({ message: t('appointment.block.removed') });
        }}
      />
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text variant="overline" tone="tertiary">
        {label}
      </Text>
      {children}
    </View>
  );
}
