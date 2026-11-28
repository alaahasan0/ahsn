import { router } from 'expo-router';
import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useAppState } from '@/store/AppStore';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme';

/** Prototype-only experience switcher (owner / barber / customer portal / management link). */
export function RoleSwitcherSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const { update } = usePreferences();
  const { appointments, salon } = useAppState();
  const sampleLink = appointments.find((a) => a.status === 'pending' && a.confirmation)?.confirmation?.token ?? 'demo-link';

  const options: { key: string; icon: IconName; title: string; body: string; go: () => void }[] = [
    { key: 'owner', icon: 'briefcase', title: t('common.demo.roles.owner'), body: t('common.demo.roles.ownerBody'), go: () => { update({ role: 'owner' }); router.replace('/owner'); } },
    { key: 'barber', icon: 'scissors', title: t('common.demo.roles.barber'), body: t('common.demo.roles.barberBody'), go: () => { update({ role: 'barber' }); router.replace('/barber'); } },
    { key: 'customer', icon: 'smartphone', title: t('common.demo.roles.customer'), body: t('common.demo.roles.customerBody'), go: () => router.push(`/book/${salon.slug}`) },
    { key: 'link', icon: 'link', title: t('common.demo.roles.manageLink'), body: t('common.demo.roles.manageLinkBody'), go: () => router.push(`/m/${sampleLink}`) },
  ];
  return (
    <Sheet visible={visible} onClose={onClose} title={t('common.demo.switchRole')} subtitle={t('common.demo.bannerBody')}>
      <View style={{ gap: 10 }}>
        {options.map((o) => (
          <Pressable
            key={o.key}
            testID={`role-${o.key}`}
            onPress={() => {
              onClose();
              setTimeout(o.go, 220);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={o.icon} size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="headline">{o.title}</Text>
              <Text variant="footnote" tone="secondary">
                {o.body}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
