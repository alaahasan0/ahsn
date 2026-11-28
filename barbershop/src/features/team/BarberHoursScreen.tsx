import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { fromISODate, toISODate } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { useBarber } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { ISODate, WeeklySchedule } from '@/types/models';

import { DatePickerSheet } from '../availability/controls';
import { WeeklyScheduleEditor, weeklyHours } from '../availability/WeeklyScheduleEditor';

export default function BarberHoursScreen({ id }: { id: string }) {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const barber = useBarber(id);
  const { salon } = useAppState();
  const actions = useActions();
  const toast = useToast();
  const [schedule, setSchedule] = useState<WeeklySchedule | undefined>(barber?.schedule);
  const [daysOff, setDaysOff] = useState<ISODate[]>(barber?.daysOff ?? []);
  const [picking, setPicking] = useState(false);

  if (!barber || !schedule) {
    return (
      <Screen header={<Header backFallback="/team" />}>
        <EmptyState icon="user-x" title={t('team.profile.notFound')} body={t('team.profile.notFoundBody')} />
      </Screen>
    );
  }

  const upcoming = daysOff.filter((d) => d >= toISODate(today())).sort();

  return (
    <Screen
      header={<Header title={t('team.hours.title')} subtitle={l(barber.name)} backFallback={`/team/${id}`} />}
      footer={
        <Button
          label={t('common.actions.saveChanges')}
          size="lg"
          fullWidth
          onPress={() => {
            actions.upsertBarber({ ...barber, schedule, daysOff });
            toast(t('team.hours.saved'));
            router.back();
          }}
        />
      }
    >
      <View style={{ gap: 24, paddingTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <BarberAvatar barber={barber} size={44} />
          <View style={{ flex: 1 }}>
            <Text variant="headline">{l(barber.name)}</Text>
            <Text variant="footnote" tone="secondary">
              {t('availability.editor.hoursPerWeek', { hours: f.number(weeklyHours(schedule)) })}
            </Text>
          </View>
        </View>
        <Section title={t('team.hours.weekly')} subtitle={t('team.hours.weeklyHint')}>
          <WeeklyScheduleEditor value={schedule} onChange={setSchedule} bounds={salon.hours} />
        </Section>
        <Section title={t('team.hours.daysOff')} actionLabel={t('team.hours.addDayOff')} onAction={() => setPicking(true)}>
          {upcoming.length === 0 ? (
            <Text variant="footnote" tone="tertiary">
              {t('team.profile.noDaysOff')}
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {upcoming.map((d) => (
                <View key={d} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingStart: 14, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                  <Icon name="sun" size={16} color={colors.warning} />
                  <Text variant="callout" style={{ flex: 1 }}>
                    {f.dateLong(fromISODate(d))}
                  </Text>
                  <IconButton icon="trash-2" size={34} iconSize={16} color={colors.danger} accessibilityLabel={t('team.hours.remove')} onPress={() => setDaysOff(daysOff.filter((x) => x !== d))} />
                </View>
              ))}
            </View>
          )}
          <Button label={t('team.hours.addDayOff')} icon="plus" variant="secondary" onPress={() => setPicking(true)} />
        </Section>
      </View>
      <DatePickerSheet
        visible={picking}
        onClose={() => setPicking(false)}
        minDate={today()}
        isDisabled={(d) => daysOff.includes(toISODate(d))}
        title={t('team.hours.addDayOff')}
        onSelect={(d) => setDaysOff([...daysOff, toISODate(d)])}
      />
    </Screen>
  );
}
