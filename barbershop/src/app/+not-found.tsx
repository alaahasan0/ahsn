import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, EmptyState, Header, Screen } from '@/components/ui';
import { useI18n } from '@/i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <Screen header={<Header backFallback="/welcome" />}>
      <View style={{ paddingTop: 48, gap: 8 }}>
        <EmptyState icon="compass" title={t('common.notFound.title')} body={t('common.notFound.body')} />
        <Button label={t('common.notFound.home')} variant="secondary" onPress={() => router.replace('/welcome')} style={{ alignSelf: 'center' }} />
      </View>
    </Screen>
  );
}
