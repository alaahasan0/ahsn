import { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Pressable } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

import { RoleSwitcherSheet } from './RoleSwitcher';

/** Discreet pill reminding stakeholders this is a prototype; opens the experience switcher. */
export function DemoPill() {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityLabel={t('common.demo.switchRole')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, height: 26, borderRadius: radius.pill, backgroundColor: colors.accentSoft }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent }} />
        <Text variant="caption" color={colors.accentOnSoft}>
          {t('common.demo.banner')}
        </Text>
        <Icon name="chevron-down" size={12} color={colors.accentOnSoft} />
      </Pressable>
      <RoleSwitcherSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
