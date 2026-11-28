import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, View } from 'react-native';

import { BrandMark } from '@/components/domain/BrandMark';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** Splash: brand moment, then route to the welcome screen. */
export default function Splash() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }).start();
    const id = setTimeout(() => router.replace('/welcome'), 1400);
    return () => clearTimeout(id);
  }, [fade]);
  return (
    <View style={{ flex: 1, backgroundColor: '#171513', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ alignItems: 'center', gap: 20, opacity: fade, transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }}>
        <BrandMark size={84} />
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text variant="title1" color="#F5F3F0" align="center">
            {t('common.appName')}
          </Text>
          <Text variant="callout" color="#B3ADA5" align="center">
            {t('common.tagline')}
          </Text>
        </View>
      </Animated.View>
      <View style={{ position: 'absolute', bottom: 48 }}>
        <View style={{ width: 28, height: 3, borderRadius: 2, backgroundColor: colors.accent }} />
      </View>
    </View>
  );
}
