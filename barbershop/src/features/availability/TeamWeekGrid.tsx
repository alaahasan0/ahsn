import { router } from 'expo-router';
import { View } from 'react-native';

import { BarberAvatar, barberShortName } from '@/components/domain/BarberAvatar';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { clockToMinutes } from '@/lib/dates';
import { useTheme } from '@/theme';
import type { Barber, WeeklySchedule } from '@/types/models';

import { WEEK_ORDER } from './controls';

/**
 * Visual week: one row per barber, one column per day. Each cell draws the working span
 * (relative to the salon's open hours) with breaks cut out.
 */
export function TeamWeekGrid({ barbers, salonHours }: { barbers: Barber[]; salonHours: WeeklySchedule }) {
  const { colors, radius } = useTheme();
  const { f, l, t } = useI18n();
  const openMin = Math.min(...WEEK_ORDER.map((d) => clockToMinutes(salonHours[d].start)));
  const closeMax = Math.max(...WEEK_ORDER.map((d) => clockToMinutes(salonHours[d].end)));
  const span = closeMax - openMin;
  const pct = (m: number) => `${((m - openMin) / span) * 100}%` as const;

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 4, paddingStart: 68 }}>
        {WEEK_ORDER.map((d) => (
          <Text key={d} variant="caption" tone="tertiary" align="center" style={{ flex: 1, fontSize: 10 }} numberOfLines={1}>
            {f.weekday(d, 'short')}
          </Text>
        ))}
      </View>
      {barbers.map((b) => (
        <Pressable key={b.id} onPress={() => router.push(`/team/${b.id}/hours`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityLabel={l(b.name)}>
          <View style={{ width: 64, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BarberAvatar barber={b} size={24} />
            <Text variant="caption" numberOfLines={1} style={{ flex: 1 }}>
              {barberShortName(b, l)}
            </Text>
          </View>
          {WEEK_ORDER.map((d) => {
            const day = b.schedule[d];
            return (
              <View key={d} style={{ flex: 1, height: 64, borderRadius: radius.xs, backgroundColor: colors.surfaceMuted, overflow: 'hidden' }}>
                {day.enabled ? (
                  <>
                    <View style={{ position: 'absolute', start: 3, end: 3, top: pct(clockToMinutes(day.start)), bottom: `${100 - ((clockToMinutes(day.end) - openMin) / span) * 100}%`, borderRadius: 4, backgroundColor: b.color, opacity: 0.85 }} />
                    {day.breaks.map((br, i) => (
                      <View key={i} style={{ position: 'absolute', start: 3, end: 3, top: pct(clockToMinutes(br.start)), height: `${((clockToMinutes(br.end) - clockToMinutes(br.start)) / span) * 100}%`, backgroundColor: colors.surface, opacity: 0.85 }} />
                    ))}
                  </>
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text variant="caption" tone="tertiary" style={{ fontSize: 10 }}>
                      {t('availability.legend.off')}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </Pressable>
      ))}
      <View style={{ flexDirection: 'row', gap: 16, paddingStart: 68, flexWrap: 'wrap' }}>
        <Legend color={colors.textSecondary} label={t('availability.legend.working')} />
        <Legend color={colors.surface} border={colors.borderStrong} label={t('availability.legend.break')} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text variant="caption" tone="tertiary">
            {f.clock(`${String(Math.floor(openMin / 60)).padStart(2, '0')}:00`)} – {f.clock(`${String(Math.floor(closeMax / 60)).padStart(2, '0')}:00`)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Legend({ color, label, border }: { color: string; label: string; border?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: color, borderWidth: border ? 1 : 0, borderColor: border }} />
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
    </View>
  );
}
