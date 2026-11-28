import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/domain/BrandMark';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { ProgressBar } from '@/components/ui/Progress';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import type { LocalizedText } from '@/i18n/types';
import { usePreferences } from '@/store/preferences';
import { useTheme } from '@/theme';

import { PORTAL_STEPS, type PortalStep } from './BookingDraft';

export const PORTAL_MAX_WIDTH = 480;

export interface PortalShellProps {
  salonName?: LocalizedText;
  step?: PortalStep;
  title?: string;
  subtitle?: string;
  /** Back target; pass true to use history. */
  back?: boolean | string;
  footer?: ReactNode;
  children: ReactNode;
  testID?: string;
}

/** Customer-facing chrome: branded top bar, language toggle, step progress, centered column. */
export function PortalShell({ salonName, step, title, subtitle, back, footer, children, testID }: PortalShellProps) {
  const { colors } = useTheme();
  const { t, l, lang } = useI18n();
  const prefs = usePreferences();
  const insets = useSafeAreaInsets();
  const stepIndex = step ? PORTAL_STEPS.indexOf(step) : -1;

  const goBack = () => {
    if (typeof back === 'string') router.replace(back as never);
    else if (router.canGoBack()) router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} testID={testID}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.background }}>
        <View style={{ width: '100%', maxWidth: PORTAL_MAX_WIDTH, alignSelf: 'center', height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 }}>
          {back ? <IconButton icon="chevron-left" iconSize={24} onPress={goBack} accessibilityLabel={t('common.actions.back')} /> : <View style={{ width: 8 }} />}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BrandMark size={26} />
            <Text variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
              {l(salonName) || t('common.appName')}
            </Text>
          </View>
          <Pressable
            onPress={() => prefs.set('language', lang === 'ar' ? 'en' : 'ar')}
            accessibilityLabel={t('common.labels.language')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              height: 32,
              paddingHorizontal: 12,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text variant="caption">{lang === 'ar' ? 'EN' : 'ع'}</Text>
          </Pressable>
        </View>
        {stepIndex >= 0 ? (
          <View style={{ width: '100%', maxWidth: PORTAL_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 6, gap: 6 }}>
            <ProgressBar value={(stepIndex + 1) / PORTAL_STEPS.length} height={3} />
            <Text variant="caption" tone="tertiary">
              {t('portal.stepOf', { current: stepIndex + 1, total: PORTAL_STEPS.length })}
            </Text>
          </View>
        ) : null}
      </View>
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ width: '100%', maxWidth: PORTAL_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 20 }}
      >
        {title ? (
          <View style={{ gap: 4 }}>
            <Text variant="title1">{title}</Text>
            {subtitle ? (
              <Text variant="callout" tone="secondary">
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={{
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.separator,
            backgroundColor: colors.backgroundElevated,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingHorizontal: 20,
          }}
        >
          <View style={{ width: '100%', maxWidth: PORTAL_MAX_WIDTH - 40, alignSelf: 'center', gap: 10 }}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}
