import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  /** 'large' for tab roots, 'compact' for pushed screens. */
  variant?: 'large' | 'compact';
  /** Show a back button (compact default true). */
  back?: boolean;
  /** Where back goes when there is no history (deep links on web). */
  backFallback?: Href;
  /** Use a close (×) icon instead of back — for modal flows. */
  close?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  /** Content under the title row (search, segmented control…). */
  children?: ReactNode;
  transparent?: boolean;
  eyebrow?: string;
}

export function goBack(fallback: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

export function Header({ title, subtitle, variant = 'compact', back = variant === 'compact', backFallback, close, onBack, right, children, transparent, eyebrow }: HeaderProps) {
  const { colors, layout } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => goBack(backFallback));

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: transparent ? 'transparent' : colors.background }}>
      <View style={{ width: '100%', maxWidth: layout.maxContentWidth + layout.screenPadding * 2, alignSelf: 'center' }}>
        {variant === 'compact' ? (
          <View style={{ height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 4 }}>
            <View style={{ width: 88, flexDirection: 'row' }}>
              {back || close ? <IconButton icon={close ? 'x' : 'chevron-left'} iconSize={close ? 22 : 24} onPress={handleBack} accessibilityLabel={close ? t('common.actions.close') : t('common.actions.back')} /> : null}
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              {title ? (
                <Text variant="headline" numberOfLines={1} align="center">
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text variant="caption" tone="secondary" numberOfLines={1} align="center">
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <View style={{ width: 88, flexDirection: 'row', justifyContent: 'flex-end', gap: 2 }}>{right}</View>
          </View>
        ) : (
          <View style={{ paddingHorizontal: layout.screenPadding, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            {back ? <IconButton icon="chevron-left" iconSize={24} onPress={handleBack} accessibilityLabel={t('common.actions.back')} style={{ marginStart: -10 }} /> : null}
            <View style={{ flex: 1, gap: 2 }}>
              {eyebrow ? (
                <Text variant="footnote" tone="secondary">
                  {eyebrow}
                </Text>
              ) : null}
              {title ? (
                <Text variant="title1" numberOfLines={1}>
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text variant="footnote" tone="secondary">
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {right ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>{right}</View> : null}
          </View>
        )}
        {children ? <View style={{ paddingHorizontal: layout.screenPadding, paddingBottom: 10, gap: 10 }}>{children}</View> : null}
      </View>
    </View>
  );
}
