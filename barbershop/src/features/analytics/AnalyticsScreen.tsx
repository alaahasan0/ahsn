import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AreaChart, BarChart, DonutChart, HBarList, LegendItem } from '@/components/charts';
import { BarberAvatar } from '@/components/domain';
import { Card, Chip, Header, Icon, Screen, Section, SegmentedControl, Sheet, StatCard, Text, type IconName } from '@/components/ui';
import { useI18n, type TKey } from '@/i18n';
import { addDays } from '@/lib/dates';
import { useAppState } from '@/store/AppStore';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { BookingSource } from '@/types/models';

import { computeReport, delta, previousRange, rangeFor, type CustomPreset, type PeriodKey } from './compute';

const PRESETS: CustomPreset[] = ['last7', 'last14', 'last30', 'last60', 'thisMonth'];

export default function AnalyticsScreen() {
  const theme = useTheme();
  const { colors, status, radius } = theme;
  const { t, tp, l, f } = useI18n();
  const state = useAppState();
  const look = useLookup();
  const [period, setPeriod] = useState<PeriodKey>('week');
  const [preset, setPreset] = useState<CustomPreset>('last14');
  const [presetOpen, setPresetOpen] = useState(false);
  const [trendMetric, setTrendMetric] = useState<'revenue' | 'appointments'>('revenue');

  const range = useMemo(() => rangeFor(period, preset), [period, preset]);
  const report = useMemo(() => computeReport(state, range), [state, range]);
  const prev = useMemo(() => computeReport(state, previousRange(range)), [state, range]);

  const sourceColor: Record<BookingSource, string> = {
    phone: status.confirmed.dot,
    whatsapp: colors.whatsapp,
    online: colors.accent,
    walk_in: status.checked_in.dot,
    staff: status.rescheduled.dot,
    recurring: status.pending.dot,
    voice: status.no_show.dot,
  };

  const fmtDelta = (d: number | undefined) => (d === undefined ? undefined : f.ltr(`${d >= 0 ? '↑' : '↓'} ${f.percent(Math.abs(d))}`));
  const tone = (d: number | undefined, lowerIsBetter = false): 'up' | 'down' | 'neutral' => (d === undefined || Math.abs(d) < 0.005 ? 'neutral' : (d > 0) !== lowerIsBetter ? 'up' : 'down');

  const kpis: { key: string; label: TKey; icon: IconName; value: string; d?: number; lowerBetter?: boolean; color: string }[] = [
    { key: 'revenue', label: 'analytics.metrics.revenue', icon: 'trending-up', value: f.money(report.revenue), d: delta(report.revenue, prev.revenue), color: colors.accent },
    { key: 'appointments', label: 'analytics.metrics.appointments', icon: 'calendar', value: f.number(report.total), d: delta(report.total, prev.total), color: status.confirmed.dot },
    { key: 'completed', label: 'analytics.metrics.completed', icon: 'check-circle', value: f.number(report.completed), d: delta(report.completed, prev.completed), color: status.completed.dot },
    { key: 'cancelled', label: 'analytics.metrics.cancelled', icon: 'x-circle', value: f.number(report.cancelled), d: delta(report.cancelled, prev.cancelled), lowerBetter: true, color: status.cancelled.dot },
    { key: 'noshow', label: 'analytics.metrics.noShowRate', icon: 'user-x', value: f.percent(report.noShowRate, 1), d: delta(report.noShowRate, prev.noShowRate), lowerBetter: true, color: status.no_show.dot },
    { key: 'occupancy', label: 'analytics.metrics.occupancy', icon: 'activity', value: f.percent(report.occupancy), d: delta(report.occupancy, prev.occupancy), color: status.checked_in.dot },
  ];

  const bucketLabel = (d: Date) => (range.bucket === 'hour' ? f.digits(String(d.getHours() % 12 === 0 ? 12 : d.getHours() % 12)) : range.bucket === 'week' ? f.dayMonth(d) : f.digits(String(d.getDate())));
  const values = report.buckets.map((b) => (trendMetric === 'revenue' ? b.revenue : b.appointments));
  const compare = prev.buckets.map((b) => (trendMetric === 'revenue' ? b.revenue : b.appointments));
  const labelEvery = Math.max(1, Math.ceil(report.buckets.length / 7));
  const totalSources = report.sources.reduce((s, x) => s + x.count, 0);
  const lastDay = addDays(range.to, -1);

  return (
    <Screen header={<Header title={t('analytics.title')} backFallback="/owner/more" />}>
      <View style={{ gap: 24, paddingTop: 4 }}>
        <View style={{ gap: 10 }}>
          <SegmentedControl<PeriodKey>
            value={period}
            onChange={(p) => {
              setPeriod(p);
              if (p === 'custom') setPresetOpen(true);
            }}
            segments={[
              { value: 'day', label: t('analytics.periods.day') },
              { value: 'week', label: t('analytics.periods.week') },
              { value: 'month', label: t('analytics.periods.month') },
              { value: 'custom', label: t('analytics.periods.custom') },
            ]}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="calendar" size={13} color={colors.textTertiary} />
            <Text variant="footnote" tone="secondary">
              {period === 'day' ? f.dateLong(range.from) : t('analytics.range', { from: f.dayMonth(range.from), to: f.dayMonth(lastDay) })}
            </Text>
            <Text variant="footnote" tone="tertiary">
              · {t('analytics.vsPrevious')}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {kpis.map((k) => (
            <StatCard key={k.key} style={{ flexBasis: '46%' }} label={t(k.label)} value={k.value} icon={k.icon} accentColor={k.color} delta={fmtDelta(k.d)} deltaTone={tone(k.d, k.lowerBetter)} />
          ))}
        </View>

        <Card style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="headline">{t('analytics.sections.trend')}</Text>
              <Text variant="title2" tabular>
                {trendMetric === 'revenue' ? f.money(report.revenue) : f.number(report.total)}
              </Text>
            </View>
            <SegmentedControl
              size="sm"
              style={{ width: 170 }}
              value={trendMetric}
              onChange={setTrendMetric}
              segments={[
                { value: 'revenue', label: t('analytics.trendRevenue') },
                { value: 'appointments', label: t('analytics.trendAppointments') },
              ]}
            />
          </View>
          {report.total === 0 ? (
            <Text variant="footnote" tone="secondary">
              {t('analytics.noData')}
            </Text>
          ) : range.bucket === 'hour' ? (
            <BarChart data={report.buckets.map((b) => ({ key: b.key, label: bucketLabel(b.start), value: trendMetric === 'revenue' ? b.revenue : b.appointments, highlight: true }))} labelEvery={2} accessibilityLabel={t('analytics.sections.trend')} />
          ) : (
            <AreaChart values={values} compare={compare} labels={report.buckets.map((b) => bucketLabel(b.start))} labelEvery={labelEvery} accessibilityLabel={t('analytics.sections.trend')} />
          )}
        </Card>

        <Section title={t('analytics.sections.sources')} subtitle={t('analytics.sections.sourcesHint')}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <DonutChart data={report.sources.map((s) => ({ key: s.source, label: t(`domain.sourceShort.${s.source}`), value: s.count, color: sourceColor[s.source] }))} size={128} thickness={14} accessibilityLabel={t('analytics.sections.sources')}>
              <Text variant="title3" align="center" tabular>
                {f.number(totalSources)}
              </Text>
              <Text variant="caption" tone="tertiary" align="center" weight="regular">
                {t('analytics.metrics.appointments')}
              </Text>
            </DonutChart>
            <View style={{ flex: 1, minWidth: 150, gap: 10 }}>
              {report.sources.map((s) => (
                <LegendItem key={s.source} color={sourceColor[s.source]} label={t(`domain.source.${s.source}`)} value={totalSources ? f.percent(s.count / totalSources) : '—'} />
              ))}
            </View>
          </Card>
        </Section>

        <Section title={t('analytics.sections.customers')}>
          <Card style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="footnote" tone="secondary">
                  {t('analytics.metrics.returningCustomers')}
                </Text>
                <Text variant="title2" tabular>
                  {f.number(report.returningCustomers)}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="footnote" tone="secondary">
                  {t('analytics.metrics.newCustomers')}
                </Text>
                <Text variant="title2" tabular>
                  {f.number(report.newCustomers)}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="footnote" tone="secondary">
                  {t('analytics.metrics.retention')}
                </Text>
                <Text variant="title2" tabular>
                  {f.percent(report.retention)}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', height: 10, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: colors.surfaceMuted, gap: 2 }}>
              {report.customersServed ? (
                <>
                  <View style={{ flex: report.returningCustomers, backgroundColor: colors.accent }} />
                  <View style={{ flex: report.newCustomers, backgroundColor: status.confirmed.dot }} />
                </>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <LegendItem color={colors.accent} label={t('analytics.metrics.returningCustomers')} />
              </View>
              <View style={{ flex: 1 }}>
                <LegendItem color={status.confirmed.dot} label={t('analytics.metrics.newCustomers')} />
              </View>
            </View>
            <Text variant="footnote" tone="secondary">
              {t('analytics.retentionHint', { percent: f.percent(report.retention) })} · {t('analytics.customersServed', { count: report.customersServed })}
            </Text>
          </Card>
        </Section>

        <Section title={t('analytics.sections.barbers')}>
          <Card>
            <HBarList
              items={report.barbers.map((b) => {
                const barber = look.barber(b.barberId);
                return {
                  key: b.barberId,
                  label: l(barber?.name),
                  value: b.revenue,
                  valueLabel: f.money(b.revenue),
                  color: barber?.color,
                  caption: `${t('analytics.bookings', { count: b.completed })} · ${t('analytics.metrics.occupancy')} ${f.percent(b.occupancy)} · ${t('analytics.noShows', { count: b.noShows })}`,
                  leading: <BarberAvatar barber={barber} size={36} />,
                };
              })}
            />
          </Card>
        </Section>

        <Section title={t('analytics.sections.services')}>
          <Card>
            {report.services.length ? (
              <HBarList
                items={report.services.map((s) => ({
                  key: s.serviceId,
                  label: l(look.service(s.serviceId)?.name),
                  value: s.revenue,
                  valueLabel: f.money(s.revenue),
                  caption: tp('common.counts.appointments', s.count),
                }))}
              />
            ) : (
              <Text variant="footnote" tone="secondary">
                {t('analytics.noData')}
              </Text>
            )}
          </Card>
        </Section>

        <Text variant="caption" tone="tertiary" align="center" weight="regular">
          {t('analytics.mockNote')}
        </Text>
      </View>

      <Sheet visible={presetOpen} onClose={() => setPresetOpen(false)} title={t('analytics.customTitle')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map((p) => (
            <Chip
              key={p}
              label={t(`analytics.presets.${p}`)}
              selected={preset === p}
              onPress={() => {
                setPreset(p);
                setPresetOpen(false);
              }}
            />
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}
