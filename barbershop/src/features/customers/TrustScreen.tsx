import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { CategoryBadge } from '@/components/domain/Badges';
import { CATEGORY_ICON } from '@/components/domain/meta';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useAppState } from '@/store/AppStore';
import { useAllCustomerStats } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Customer, CustomerCategory } from '@/types/models';

import { CategorySheet } from './CategorySheet';
import { riskScore, suggestCategory } from './helpers';

type Sort = 'risk' | 'attendance' | 'visits';

/** Internal reliability overview. Explicitly not a public rating. */
export default function TrustScreen() {
  const { colors, radius } = useTheme();
  const { t, tp, f, l } = useI18n();
  const { customers } = useAppState();
  const stats = useAllCustomerStats();
  const [sort, setSort] = useState<Sort>('risk');
  const [filter, setFilter] = useState<'all' | CustomerCategory>('all');
  const [editing, setEditing] = useState<Customer | null>(null);

  const totals = useMemo(() => {
    let done = 0;
    let noShows = 0;
    let cancels = 0;
    let late = 0;
    customers.forEach((c) => {
      const s = stats.get(c.id)!;
      done += s.completed;
      noShows += s.noShows;
      cancels += s.cancellations;
      late += s.lateCancellations;
    });
    const decided = done + noShows + cancels;
    return { attendance: decided ? done / decided : 1, noShowRate: decided ? noShows / decided : 0, late };
  }, [customers, stats]);

  // Two or more no-shows / late cancellations that also make up a noticeable share of visits.
  const attention = customers
    .filter((c) => {
      const s = stats.get(c.id)!;
      const decided = s.completed + s.noShows + s.cancellations;
      const misses = s.noShows + s.lateCancellations;
      return misses >= 2 && misses / Math.max(1, decided) >= 0.06;
    })
    .sort((a, b) => riskScore(stats.get(b.id)!) - riskScore(stats.get(a.id)!))
    .slice(0, 5);

  const list = customers
    .filter((c) => filter === 'all' || c.category === filter)
    .sort((a, b) => {
      const sa = stats.get(a.id)!;
      const sb = stats.get(b.id)!;
      if (sort === 'risk') return riskScore(sb) - riskScore(sa);
      if (sort === 'attendance') return sa.attendanceRate - sb.attendanceRate;
      return sb.totalVisits - sa.totalVisits;
    });

  const groups: CustomerCategory[] = ['trusted', 'regular', 'new'];
  const tone = (c: CustomerCategory) => (c === 'trusted' ? colors.success : c === 'regular' ? colors.info : colors.accent);

  return (
    <Screen header={<Header title={t('customers.trust.title')} subtitle={t('customers.trust.subtitle')} backFallback="/owner/more" />}>
      <View style={{ gap: 24, paddingTop: 4 }}>
        <View style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted }}>
          <Icon name="lock" size={18} color={colors.text} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="subhead">{t('customers.trust.privacyTitle')}</Text>
            <Text variant="footnote" tone="secondary">
              {t('customers.trust.privacyBody')}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {groups.map((g) => {
            const n = customers.filter((c) => c.category === g).length;
            return (
              <Card key={g} padding={14} style={{ flex: 1, gap: 8 }} onPress={() => setFilter(filter === g ? 'all' : g)}>
                <Icon name={CATEGORY_ICON[g]} size={18} color={tone(g)} />
                <Text variant="title2" tabular>
                  {f.number(n)}
                </Text>
                <Text variant="footnote" tone="secondary" numberOfLines={1}>
                  {t(`domain.category.${g}`)}
                </Text>
                <ProgressBar value={n / customers.length} color={tone(g)} height={4} />
              </Card>
            );
          })}
        </View>

        <Card style={{ flexDirection: 'row' }} padding={0}>
          {[
            { label: t('customers.trust.avgAttendance'), value: f.percent(totals.attendance) },
            { label: t('customers.trust.noShowRate'), value: f.percent(totals.noShowRate, 1) },
            { label: t('customers.trust.lateCancels'), value: f.number(totals.late) },
          ].map((x, i) => (
            <View key={x.label} style={{ flex: 1, flexDirection: 'row' }}>
              {i > 0 ? <Divider vertical /> : null}
              <View style={{ flex: 1, padding: 14, gap: 4 }}>
                <Text variant="title3" tabular>
                  {x.value}
                </Text>
                <Text variant="caption" tone="tertiary" numberOfLines={2}>
                  {x.label}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        <Section title={t('customers.trust.attention')} subtitle={t('customers.trust.attentionBody')}>
          {attention.length === 0 ? (
            <Card variant="muted">
              <Text variant="callout" tone="secondary">
                {t('customers.trust.noAttention')}
              </Text>
            </Card>
          ) : (
            <View style={{ gap: 8 }}>
              {attention.map((c) => {
                const s = stats.get(c.id)!;
                return (
                  <Card key={c.id} padding={12} onPress={() => router.push(`/customers/${c.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Avatar name={l(c.name)} size={40} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="callout" weight="semibold" numberOfLines={1}>
                        {l(c.name)}
                      </Text>
                      <Text variant="footnote" tone="danger" numberOfLines={2}>
                        {tp('customers.trust.noShows', s.noShows)} · {tp('customers.trust.cancels', s.lateCancellations)}
                      </Text>
                    </View>
                    <Button size="sm" variant="secondary" label={t('customers.trust.reclassify')} onPress={() => setEditing(c)} />
                  </Card>
                );
              })}
            </View>
          )}
        </Section>

        <Section title={t('customers.trust.all')}>
          <View style={{ marginHorizontal: -20 }}>
            <ChipRow>
              {(['risk', 'attendance', 'visits'] as Sort[]).map((s) => (
                <Chip key={s} size="sm" label={t(`customers.trust.sort.${s}`)} selected={sort === s} onPress={() => setSort(s)} />
              ))}
              <View style={{ width: 1, backgroundColor: colors.border, marginHorizontal: 4 }} />
              {(['all', 'trusted', 'regular', 'new'] as const).map((k) => (
                <Chip key={k} size="sm" label={k === 'all' ? t('common.labels.all') : t(`domain.category.${k}`)} selected={filter === k} onPress={() => setFilter(k)} />
              ))}
            </ChipRow>
          </View>
          <Card padding={0}>
            {list.map((c, i) => {
              const s = stats.get(c.id)!;
              const decided = s.completed + s.noShows + s.cancellations;
              const suggestion = suggestCategory(s);
              return (
                <View key={c.id}>
                  {i > 0 ? <Divider inset={16} /> : null}
                  <Pressable onPress={() => setEditing(c)} style={{ padding: 14, gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text variant="callout" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>
                        {l(c.name)}
                      </Text>
                      <CategoryBadge category={c.category} />
                    </View>
                    <ProgressBar value={s.attendanceRate} height={4} color={s.attendanceRate < 0.8 ? colors.warning : colors.success} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                      <Text variant="caption" tone="secondary">
                        {t('customers.trust.attended', { done: f.number(s.completed), total: f.number(decided) })}
                      </Text>
                      <Text variant="caption" color={s.noShows ? colors.danger : colors.textTertiary}>
                        {tp('customers.trust.noShows', s.noShows)}
                      </Text>
                      <Text variant="caption" tone="tertiary">
                        {tp('customers.trust.cancels', s.cancellations)}
                      </Text>
                      {suggestion !== c.category ? (
                        <Text variant="caption" tone="accent">
                          {t('customers.trust.suggested', { category: t(`domain.category.${suggestion}`) })}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </Card>
        </Section>

        <Section title={t('customers.trust.howTitle')} card>
          {groups.map((g) => (
            <View key={g} style={{ flexDirection: 'row', gap: 12, padding: 14 }}>
              <Icon name={CATEGORY_ICON[g]} size={16} color={tone(g)} />
              <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
                {t(g === 'trusted' ? 'customers.trust.howTrusted' : g === 'regular' ? 'customers.trust.howRegular' : 'customers.trust.howNew')}
              </Text>
            </View>
          ))}
        </Section>
      </View>
      {editing ? <CategorySheet customer={customers.find((c) => c.id === editing.id) ?? editing} visible={!!editing} onClose={() => setEditing(null)} suggested={suggestCategory(stats.get(editing.id)!)} /> : null}
    </Screen>
  );
}
