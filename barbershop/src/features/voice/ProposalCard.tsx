import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { addMinutes } from '@/lib/dates';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';

import type { Proposal } from './scripts';

interface Props {
  proposal: Proposal;
  active: boolean;
  /** Final confirmation is only offered once the user agreed to an alternative. */
  canConfirm: boolean;
  onSelectTime: (d: Date) => void;
  onConfirm: () => void;
  onDismiss: () => void;
}

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name={icon} size={15} color={colors.textTertiary} />
      <Text variant="footnote" tone="secondary" style={{ width: 70 }}>
        {label}
      </Text>
      <Text variant="subhead" style={{ flex: 1 }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/** Structured confirmation card for a proposed action. Nothing happens until Confirm. */
export function ProposalCard({ proposal: p, active, canConfirm, onSelectTime, onConfirm, onDismiss }: Props) {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const look = useLookup();

  const header = (icon: IconName, title: string, tone: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: `${tone}22`, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={14} color={tone} />
      </View>
      <Text variant="subhead" style={{ flex: 1 }}>
        {title}
      </Text>
      <Icon name="mic" size={13} color={colors.textTertiary} />
    </View>
  );

  let body: React.ReactNode = null;
  let confirmLabel = '';
  let danger = false;

  if (p.kind === 'book') {
    const c = look.customer(p.customerId);
    const s = look.service(p.serviceId);
    const b = look.barber(p.barberId);
    confirmLabel = t('voice.card.confirmBooking');
    body = (
      <>
        {header('calendar', t('voice.card.booking'), colors.accent)}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={l(c?.name)} size={40} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headline">{l(c?.name)}</Text>
            <Text variant="footnote" tone="secondary">
              {l(s?.name)} · {f.duration(s?.durationMin ?? 30)} · {f.money(s?.price ?? 0)}
            </Text>
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <Row icon="calendar" label={t('common.labels.date')} value={f.dateLong(p.start)} />
          <Row icon="clock" label={t('common.labels.time')} value={f.timeRange(p.start, addMinutes(p.start, s?.durationMin ?? 30))} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="scissors" size={15} color={colors.textTertiary} />
            <Text variant="footnote" tone="secondary" style={{ width: 70 }}>
              {t('common.labels.barber')}
            </Text>
            <BarberAvatar barber={b} size={20} />
            <Text variant="subhead">{l(b?.name)}</Text>
          </View>
        </View>
        {p.requestedTaken ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="lock" size={12} color={colors.warning} />
              <Text variant="caption" tone="warning">
                {t('voice.card.requestedTaken')} · {f.time(p.requested)}
              </Text>
            </View>
            <Text variant="overline" tone="tertiary">
              {t('voice.card.alternatives')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {p.alternatives.map((d) => (
                <Chip
                  key={d.getTime()}
                  size="sm"
                  label={f.dateNumeric(d) !== f.dateNumeric(p.requested) ? `${f.dayShort(d)} · ${f.time(d)}` : f.time(d)}
                  selected={d.getTime() === p.start.getTime()}
                  onPress={active ? () => onSelectTime(d) : undefined}
                />
              ))}
            </View>
          </View>
        ) : null}
      </>
    );
  } else if (p.kind === 'cancel') {
    const a = look.appointment(p.appointmentId);
    const c = look.customer(a?.customerId);
    const s = look.service(a?.serviceId);
    const start = a ? new Date(a.start) : new Date();
    confirmLabel = t('voice.card.confirmCancel');
    danger = true;
    body = (
      <>
        {header('x-circle', t('voice.card.cancel'), colors.danger)}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={l(c?.name)} size={40} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="headline">{l(c?.name)}</Text>
            <Text variant="footnote" tone="secondary">
              {l(s?.name)} · {f.dateShort(start)} · {f.time(start)}
            </Text>
          </View>
        </View>
      </>
    );
  } else {
    confirmLabel = t('voice.card.confirmBlock');
    danger = true;
    body = (
      <>
        {header('slash', t('voice.card.block'), colors.warning)}
        <Row icon="calendar" label={t('common.labels.date')} value={f.dateLong(p.start)} />
        <Row icon="clock" label={t('common.labels.time')} value={`${t('voice.card.whole')} · ${f.timeRange(p.start, p.end)}`} />
        {p.affected ? <Row icon="alert-triangle" label={t('common.labels.customers')} value={t('voice.replies.closeAffected', { count: p.affected })} /> : null}
      </>
    );
  }

  return (
    <View
      testID="voice-proposal"
      style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: active ? colors.borderStrong : colors.border, padding: 14, gap: 14, opacity: active ? 1 : 0.6 }}
    >
      {body}
      {active ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button label={t('voice.card.dismiss')} variant="secondary" size="sm" onPress={onDismiss} style={{ flex: 1 }} />
          {canConfirm ? <Button testID="voice-confirm" label={confirmLabel} variant={danger ? 'danger' : 'primary'} size="sm" icon="check" onPress={onConfirm} style={{ flex: 1.4 }} /> : null}
        </View>
      ) : null}
    </View>
  );
}
