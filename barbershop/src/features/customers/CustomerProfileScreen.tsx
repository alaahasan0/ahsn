import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { CategoryBadge, WhatsAppStatus } from '@/components/domain/Badges';
import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { useAppState } from '@/store/AppStore';
import { useBarber, useCustomer, useCustomerStats, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';

import { CategorySheet } from './CategorySheet';
import { suggestCategory, whatsappRelation } from './helpers';
import { CustomerTimeline, InfoRow, MiniStat, QuickAction } from './parts';

export default function CustomerProfileScreen({ id }: { id: string }) {
  const { colors, radius } = useTheme();
  const { t, f, l } = useI18n();
  const toast = useToast();
  const customer = useCustomer(id);
  const stats = useCustomerStats(id);
  const { appointments } = useAppState();
  const look = useLookup();
  const preferredBarber = useBarber(customer?.preferredBarberId);
  const [catOpen, setCatOpen] = useState(false);
  const mine = useMemo(() => appointments.filter((a) => a.customerId === id), [appointments, id]);

  if (!customer || !stats) {
    return (
      <Screen header={<Header backFallback="/owner/customers" />}>
        <EmptyState icon="user-x" title={t('customers.profile.notFound')} body={t('customers.profile.notFoundBody')} actionLabel={t('common.actions.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  const name = l(customer.name);
  const relation = whatsappRelation(customer.phone, customer.whatsapp);
  const suggestion = suggestCategory(stats);
  const simulated = (msg: string) => toast({ message: msg, description: t('common.toast.simulated'), icon: 'info', tone: 'default' });
  const decided = stats.completed + stats.noShows + stats.cancellations;

  return (
    <Screen
      header={<Header backFallback="/owner/customers" right={<IconButton icon="edit-2" accessibilityLabel={t('customers.profile.actions.edit')} onPress={() => router.push(`/customers/${id}/edit`)} />} />}
    >
      <View style={{ gap: 24 }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', gap: 10 }}>
          <Avatar name={name} size={76} />
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text variant="title2" align="center">
              {name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CategoryBadge category={customer.category} />
              <Text variant="footnote" tone="tertiary">
                {t('customers.profile.customerSince', { date: f.monthYear(new Date(customer.createdAt)) })}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch', marginTop: 6 }}>
            <QuickAction primary icon="calendar" label={t('customers.profile.actions.book')} onPress={() => router.push({ pathname: '/appointment/new', params: { customerId: id } })} />
            <QuickAction icon="phone" label={t('customers.profile.actions.call')} onPress={() => simulated(t('customers.profile.callSimulated', { name }))} />
            <QuickAction icon="ion:logo-whatsapp" color={colors.whatsapp} label={t('customers.profile.actions.whatsapp')} onPress={() => simulated(t('customers.profile.whatsappSimulated', { name }))} />
            <QuickAction icon="edit-2" label={t('customers.profile.actions.edit')} onPress={() => router.push(`/customers/${id}/edit`)} />
          </View>
        </View>

        {/* Key stats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <MiniStat label={t('customers.profile.stats.visits')} value={f.number(stats.totalVisits)} />
          <MiniStat label={t('customers.profile.stats.lastVisit')} value={stats.lastVisit ? f.dayMonth(new Date(stats.lastVisit.start)) : t('customers.profile.stats.never')} caption={stats.lastVisit ? f.relative(new Date(stats.lastVisit.start), now()) : undefined} />
          <MiniStat label={t('customers.profile.stats.attendance')} value={f.percent(stats.attendanceRate)} tone={stats.attendanceRate < 0.8 ? 'warning' : 'success'} />
          <MiniStat label={t('customers.profile.stats.spent')} value={f.money(stats.totalSpent)} />
        </View>

        {/* Next appointment */}
        <Section title={t('customers.profile.nextAppointment')}>
          {stats.nextAppointment ? (
            <AppointmentCard appointment={stats.nextAppointment} variant="card" showDate />
          ) : (
            <Card variant="muted" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Icon name="calendar" size={18} color={colors.textTertiary} />
              <Text variant="callout" tone="secondary" style={{ flex: 1 }}>
                {t('customers.profile.noUpcoming')}
              </Text>
              <Button size="sm" label={t('customers.profile.actions.book')} onPress={() => router.push({ pathname: '/appointment/new', params: { customerId: id } })} />
            </Card>
          )}
        </Section>

        {/* Contact */}
        <Section title={t('customers.profile.contact')} card>
          <InfoRow icon="phone" label={t('customers.profile.primaryPhone')} value={f.phone(customer.phone.country, customer.phone.number)} ltr />
          <View>
            <InfoRow icon="ion:logo-whatsapp" label={t('customers.profile.whatsapp')} value={customer.whatsapp ? f.phone(customer.whatsapp.country, customer.whatsapp.number) : undefined} ltr>
              {!customer.whatsapp ? (
                <Text variant="callout" tone="tertiary">
                  {t('common.labels.none')}
                </Text>
              ) : null}
            </InfoRow>
            <View style={{ paddingHorizontal: 16, paddingBottom: 12, paddingStart: 45, gap: 8 }}>
              {customer.whatsapp ? <WhatsAppStatus status={customer.whatsappVerification} /> : null}
              {relation !== 'same' ? (
                <View style={{ flexDirection: 'row', gap: 8, padding: 10, borderRadius: radius.sm, backgroundColor: relation === 'none' ? colors.surfaceMuted : colors.warningSoft }}>
                  <Icon name="info" size={14} color={relation === 'none' ? colors.textSecondary : colors.warning} />
                  <Text variant="footnote" color={relation === 'none' ? colors.textSecondary : colors.warning} style={{ flex: 1 }}>
                    {relation === 'none'
                      ? `${t('customers.profile.noWhatsapp')}. ${t('customers.profile.noWhatsappHint')}`
                      : relation === 'differentPrefix'
                        ? t('customers.profile.differentPrefix', { prefix: `\u200E${customer.whatsapp!.country}\u200E` })
                        : t('customers.profile.differentNumber')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <InfoRow icon="message-circle" label={t('customers.profile.preferredChannel')} value={t(`common.phone.channels.${customer.preferredChannel}`)} />
        </Section>

        {/* Preferences */}
        <Section title={t('customers.profile.preferences')} card>
          <InfoRow icon="scissors" label={t('customers.profile.preferredBarber')}>
            {preferredBarber ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <BarberAvatar barber={preferredBarber} size={22} />
                <Text variant="callout" weight="medium">
                  {l(preferredBarber.name)}
                </Text>
              </View>
            ) : (
              <Text variant="callout" tone="tertiary">
                {t('customers.profile.noPreference')}
              </Text>
            )}
          </InfoRow>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
            <Text variant="callout" tone="secondary">
              {t('customers.profile.preferredServices')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {customer.preferredServiceIds.length ? (
                customer.preferredServiceIds.map((sid) => (
                  <View key={sid} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted }}>
                    <Text variant="footnote">{l(look.service(sid)?.name)}</Text>
                  </View>
                ))
              ) : (
                <Text variant="footnote" tone="tertiary">
                  {t('customers.profile.noPreference')}
                </Text>
              )}
            </View>
          </View>
        </Section>

        {/* Reliability + classification */}
        <Section title={t('customers.profile.reliability')}>
          <Card style={{ gap: 14 }}>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="subhead" tone="secondary">
                  {t('customers.profile.stats.attendance')}
                </Text>
                <Text variant="subhead" tabular>
                  {t('customers.trust.attended', { done: f.number(stats.completed), total: f.number(decided) })}
                </Text>
              </View>
              <ProgressBar value={stats.attendanceRate} color={stats.attendanceRate < 0.8 ? colors.warning : colors.success} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                { label: t('customers.profile.stats.cancellations'), value: stats.cancellations },
                { label: t('customers.profile.stats.lateCancellations'), value: stats.lateCancellations },
                { label: t('customers.profile.stats.noShows'), value: stats.noShows },
              ].map((x) => (
                <View key={x.label} style={{ flex: 1, gap: 2 }}>
                  <Text variant="title3" tabular color={x.value > 1 ? colors.danger : colors.text}>
                    {f.number(x.value)}
                  </Text>
                  <Text variant="caption" tone="tertiary" numberOfLines={2}>
                    {x.label}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ height: 1, backgroundColor: colors.separator }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="subhead" tone="secondary">
                  {t('customers.profile.category')}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <CategoryBadge category={customer.category} size="md" />
                  <Text variant="caption" tone="tertiary">
                    {customer.categoryManual ? t('customers.profile.categoryManual') : t('customers.profile.categoryAuto')}
                  </Text>
                </View>
              </View>
              <Button size="sm" variant="secondary" label={t('customers.profile.changeCategory')} onPress={() => setCatOpen(true)} />
            </View>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Icon name="lock" size={12} color={colors.textTertiary} />
              <Text variant="caption" tone="tertiary" style={{ flex: 1 }}>
                {t('domain.categoryPrivacy')}
              </Text>
            </View>
          </Card>
        </Section>

        {/* Notes */}
        <Section title={t('customers.profile.notes')} actionLabel={t('common.actions.edit')} onAction={() => router.push(`/customers/${id}/edit`)}>
          <Card variant="muted">
            <Text variant="callout" tone={customer.notes ? 'primary' : 'tertiary'}>
              {customer.notes || t('customers.profile.noNotes')}
            </Text>
          </Card>
        </Section>

        {/* Timeline */}
        <Section title={t('customers.profile.timeline')} actionLabel={t('customers.profile.fullHistory')} onAction={() => router.push(`/customers/${id}/history`)}>
          <Card>
            <CustomerTimeline customer={customer} appointments={mine.filter((a) => new Date(a.start) <= now())} limit={8} />
          </Card>
        </Section>
      </View>
      <CategorySheet customer={customer} visible={catOpen} onClose={() => setCatOpen(false)} suggested={suggestion} />
    </Screen>
  );
}
