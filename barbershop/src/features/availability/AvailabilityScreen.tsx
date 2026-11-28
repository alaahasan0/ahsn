import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Divider } from '@/components/ui/Divider';
import { Header } from '@/components/ui/Header';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { now, today } from '@/lib/clock';
import { fromISODate, isSameDay, toISODate } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { useBarbers, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { TimeBlock, WeeklySchedule } from '@/types/models';

import { TeamWeekGrid } from './TeamWeekGrid';
import { WeeklyScheduleEditor, weeklyHours } from './WeeklyScheduleEditor';

const REASON_ICON: Record<TimeBlock['reason'], IconName> = { break: 'coffee', personal: 'user', meeting: 'users', holiday: 'sun', other: 'slash' };

export default function AvailabilityScreen() {
  const { colors, radius } = useTheme();
  const { t, f, l } = useI18n();
  const { salon, blocks } = useAppState();
  const barbers = useBarbers();
  const look = useLookup();
  const actions = useActions();
  const toast = useToast();
  const [hours, setHours] = useState<WeeklySchedule>(salon.hours);
  const [removing, setRemoving] = useState<TimeBlock | null>(null);
  const dirty = JSON.stringify(hours) !== JSON.stringify(salon.hours);
  const upcomingBlocks = blocks.filter((b) => new Date(b.end) >= now()).sort((a, b) => a.start.localeCompare(b.start));
  const holidays = salon.holidays.filter((h) => h.date >= toISODate(today())).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  return (
    <Screen
      header={<Header variant="large" back backFallback="/owner/more" title={t('availability.title')} subtitle={t('availability.subtitle')} right={<IconButton icon="slash" variant="accent" accessibilityLabel={t('availability.blockTime')} onPress={() => router.push('/block-time')} />} />}
      footer={
        dirty ? (
          <Button
            label={t('availability.saveHours')}
            size="lg"
            fullWidth
            onPress={() => {
              actions.updateSalon({ hours });
              toast(t('availability.saved'));
            }}
          />
        ) : undefined
      }
    >
      <View style={{ gap: 28, paddingTop: 4 }}>
        <Section title={t('availability.teamWeek')} subtitle={t('availability.teamWeekHint')}>
          <Card>
            <TeamWeekGrid barbers={barbers} salonHours={salon.hours} />
          </Card>
        </Section>

        <Section title={t('availability.blocks')} subtitle={t('availability.blocksHint')} actionLabel={t('availability.blockTime')} onAction={() => router.push('/block-time')}>
          {upcomingBlocks.length === 0 ? (
            <Card variant="muted">
              <Text variant="callout" tone="secondary">
                {t('availability.noBlocks')}
              </Text>
            </Card>
          ) : (
            <Card padding={0}>
              {upcomingBlocks.map((b, i) => {
                const start = new Date(b.start);
                const end = new Date(b.end);
                const barber = b.barberId === 'all' ? undefined : look.barber(b.barberId);
                return (
                  <View key={b.id}>
                    {i > 0 ? <Divider inset={16} /> : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                      <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={REASON_ICON[b.reason]} size={16} color={colors.textSecondary} />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="callout" weight="medium" numberOfLines={1}>
                          {b.note || t(`availability.reasons.${b.reason === 'other' ? 'misc' : b.reason}`)}
                        </Text>
                        <Text variant="footnote" tone="secondary" numberOfLines={1}>
                          {isSameDay(start, today()) ? t('common.actions.today') : f.dateShort(start)} · {f.timeRange(start, end)}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          {barber ? <BarberAvatar barber={barber} size={16} /> : <Icon name="home" size={12} color={colors.textTertiary} />}
                          <Text variant="caption" tone="tertiary">
                            {barber ? l(barber.name) : t('availability.wholeSalon')}
                          </Text>
                        </View>
                      </View>
                      <IconButton icon="trash-2" size={34} iconSize={16} color={colors.danger} accessibilityLabel={t('availability.removeBlock')} onPress={() => setRemoving(b)} />
                    </View>
                  </View>
                );
              })}
            </Card>
          )}
        </Section>

        <Section title={t('availability.salonHours')} subtitle={`${t('availability.salonHoursHint')} · ${t('availability.editor.hoursPerWeek', { hours: f.number(weeklyHours(hours)) })}`}>
          <WeeklyScheduleEditor value={hours} onChange={setHours} />
        </Section>

        <Section title={t('availability.holidays')} subtitle={t('availability.holidaysHint')} actionLabel={t('availability.manageHolidays')} onAction={() => router.push('/availability/holidays')}>
          <Card padding={0}>
            {holidays.length === 0 ? (
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="sun" size={18} color={colors.textTertiary} />
                <Text variant="callout" tone="secondary" style={{ flex: 1 }}>
                  {t('availability.noHolidays')}
                </Text>
                <Button size="sm" variant="secondary" label={t('availability.holidaysScreen.add')} onPress={() => router.push('/availability/holidays')} />
              </View>
            ) : (
              holidays.map((h, i) => (
                <View key={h.id}>
                  {i > 0 ? <Divider inset={16} /> : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                    <Icon name="sun" size={16} color={colors.warning} />
                    <Text variant="callout" style={{ flex: 1 }}>
                      {l(h.name)}
                    </Text>
                    <Text variant="footnote" tone="secondary">
                      {f.dateShort(fromISODate(h.date))}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </Section>
      </View>
      <Dialog
        visible={!!removing}
        onClose={() => setRemoving(null)}
        title={t('availability.removeBlock')}
        message={t('availability.removeBlockBody')}
        icon="trash-2"
        tone="danger"
        confirmLabel={t('common.actions.remove')}
        onConfirm={() => {
          if (removing) actions.removeBlock(removing.id);
          toast(t('availability.removed'));
        }}
      />
    </Screen>
  );
}
