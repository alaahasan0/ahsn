import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import type { PhoneNumber } from '@/types/models';

import { PortalShell } from './PortalShell';

/** "+970 59•••3456" */
export function maskPhone(p?: PhoneNumber): string {
  if (!p) return '';
  const n = p.number;
  return `${p.country} ${n.slice(0, 2)}•••${n.slice(-4)}`;
}

export function SalonNotFound() {
  const { t } = useI18n();
  return (
    <PortalShell>
      <EmptyState icon="map-pin" title={t('portal.notFound')} body={t('portal.notFoundBody')} />
    </PortalShell>
  );
}

/** Label/value line used in summaries. */
export function SummaryRow({ icon, label, value, sub, ltr }: { icon: IconName; label: string; value: string; sub?: string; ltr?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 12, paddingHorizontal: 16 }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={15} color={colors.textSecondary} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="caption" tone="tertiary">
          {label}
        </Text>
        <Text variant="callout" weight="medium" style={ltr ? { writingDirection: 'ltr' } : undefined}>
          {value}
        </Text>
        {sub ? (
          <Text variant="footnote" tone="secondary">
            {sub}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** Big success / state hero used by confirmation and result pages. */
export function StateHero({ icon, tone, title, body }: { icon: IconName; tone: 'success' | 'danger' | 'warning' | 'accent' | 'neutral'; title: string; body?: string }) {
  const { colors } = useTheme();
  const map = {
    success: [colors.success, colors.successSoft],
    danger: [colors.danger, colors.dangerSoft],
    warning: [colors.warning, colors.warningSoft],
    accent: [colors.accent, colors.accentSoft],
    neutral: [colors.textSecondary, colors.surfaceMuted],
  }[tone];
  return (
    <View style={{ alignItems: 'center', gap: 14, paddingVertical: 12 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: map[1], alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={32} color={map[0]} />
      </View>
      <View style={{ gap: 6, alignItems: 'center' }}>
        <Text variant="title2" align="center">
          {title}
        </Text>
        {body ? (
          <Text variant="callout" tone="secondary" align="center">
            {body}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function ContactSalonButtons({ phone, whatsapp }: { phone: PhoneNumber; whatsapp: PhoneNumber }) {
  const { t, f } = useI18n();
  const toast = useToast();
  const simulate = (label: string, p: PhoneNumber) => toast({ message: `${label} · ${f.phone(p.country, p.number)}`, description: t('common.toast.simulated'), icon: 'phone', tone: 'default' });
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Button label={t('portal.info.callSalon')} icon="phone" variant="secondary" style={{ flex: 1 }} onPress={() => simulate(t('portal.info.callSalon'), phone)} />
      <Button label={t('portal.info.whatsappSalon')} icon="ion:logo-whatsapp" variant="secondary" style={{ flex: 1 }} onPress={() => simulate(t('portal.info.whatsappSalon'), whatsapp)} />
    </View>
  );
}
