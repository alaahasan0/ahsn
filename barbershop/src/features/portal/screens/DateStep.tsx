import { Redirect, router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { addDays, isSameDay, startOfWeek } from '@/lib/dates';
import { slotsFor } from '@/store/availability';
import { useAvailabilityContext, useService } from '@/store/selectors';
import { useTheme } from '@/theme';

import { useBookingDraft } from '../BookingDraft';
import { PortalShell } from '../PortalShell';
import { SalonNotFound } from '../shared';
import { usePortalAvailability } from '../usePortalAvailability';

const HORIZON_DAYS = 21;

export default function DateStep() {
  const { colors, radius } = useTheme();
  const { t, tp, f } = useI18n();
  const { salon, draft, update, path } = useBookingDraft();
  const service = useService(draft.serviceId);
  const ctx = usePortalAvailability();
  const base = useAvailabilityContext();

  const weeks = useMemo(() => {
    const start = startOfWeek(today());
    return Array.from({ length: 4 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
  }, []);

  const freeCount = useMemo(() => {
    const m = new Map<number, number>();
    if (!service) return m;
    for (const week of weeks)
      for (const d of week) {
        if (d < today() || d >= addDays(today(), HORIZON_DAYS)) continue;
        m.set(d.getTime(), slotsFor(ctx, draft.barberId, d, service).filter((s) => s.available).length);
      }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, base.appointments, draft.barberId, service, weeks]);

  useEffect(() => {
    if ((freeCount.get(draft.date.getTime()) ?? 0) > 0) return;
    const first = [...freeCount.entries()].sort((a, b) => a[0] - b[0]).find(([, c]) => c > 0);
    if (first) update({ date: new Date(first[0]), slot: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeCount]);

  if (!salon) return <SalonNotFound />;
  if (!service) return <Redirect href={path('service') as never} />;
  const selectedCount = freeCount.get(draft.date.getTime()) ?? 0;

  return (
    <PortalShell
      salonName={salon.name}
      step="date"
      back
      title={t('portal.steps.date')}
      subtitle={t('portal.date.hint')}
      footer={<Button label={t('common.actions.continue')} size="lg" disabled={selectedCount === 0} onPress={() => router.push(path('time') as never)} testID="portal-date-continue" />}
    >
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 6 }}>
        <Text variant="headline" align="center" style={{ paddingVertical: 6 }}>
          {f.monthYear(draft.date)}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {weeks[0].map((d) => (
            <Text key={d.getDay()} variant="caption" tone="tertiary" align="center" style={{ flex: 1 }}>
              {f.weekday(d, 'short')}
            </Text>
          ))}
        </View>
        {weeks.map((week, wi) => (
          <View key={wi} style={{ flexDirection: 'row' }}>
            {week.map((d) => {
              const count = freeCount.get(d.getTime());
              const disabled = count === undefined || count === 0;
              const selected = isSameDay(d, draft.date);
              const isToday = isSameDay(d, today());
              return (
                <View key={d.getTime()} style={{ flex: 1, alignItems: 'center', paddingVertical: 3 }}>
                  <Pressable
                    disabled={disabled}
                    onPress={() => update({ date: d, slot: undefined })}
                    haptic="selection"
                    accessibilityState={{ selected, disabled }}
                    accessibilityLabel={f.dateLong(d)}
                    style={{
                      width: 42,
                      height: 46,
                      borderRadius: radius.sm,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? colors.ink : 'transparent',
                      borderWidth: isToday && !selected ? 1 : 0,
                      borderColor: colors.borderStrong,
                    }}
                  >
                    <Text
                      variant="callout"
                      weight={selected ? 'semibold' : 'regular'}
                      align="center"
                      tabular
                      color={selected ? colors.inkText : disabled ? colors.textTertiary : colors.text}
                      style={disabled ? { opacity: 0.45 } : undefined}
                    >
                      {f.digits(String(d.getDate()))}
                    </Text>
                    <View style={{ width: 4, height: 4, borderRadius: 2, marginTop: 2, backgroundColor: !disabled ? (selected ? colors.accent : colors.success) : 'transparent' }} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: radius.md, backgroundColor: selectedCount ? colors.successSoft : colors.surfaceMuted }}>
        <Text variant="subhead" color={selectedCount ? colors.success : colors.textSecondary} style={{ flex: 1 }}>
          {f.dateLong(draft.date)}
        </Text>
        <Text variant="footnote" color={selectedCount ? colors.success : colors.textSecondary}>
          {selectedCount ? tp('portal.date.freeTimes', selectedCount) : t('portal.time.none')}
        </Text>
      </View>
    </PortalShell>
  );
}
