import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Input, Pressable, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';

import { AuthScaffold } from './AuthScaffold';

export default function ForgotPasswordScreen() {
  const { t } = useI18n();
  const toast = useToast();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ message: t('auth.forgot.sent'), description: t('common.toast.simulated'), icon: 'send' });
      router.push({ pathname: '/verify', params: { target: identifier.trim() || '059 912 3456', next: 'login' } });
    }, 600);
  };
  return (
    <AuthScaffold title={t('auth.forgot.title')} subtitle={t('auth.forgot.subtitle')} backFallback="/login">
      <View style={{ gap: 18 }}>
        <Input label={t('auth.forgot.identifier')} value={identifier} onChangeText={setIdentifier} icon="at-sign" autoCapitalize="none" ltr />
        <Button label={t('auth.forgot.submit')} size="lg" onPress={submit} loading={loading} icon="send" />
        <Pressable onPress={() => router.replace('/login')} style={{ alignSelf: 'center' }}>
          <Text variant="subhead" tone="accent">
            {t('auth.forgot.back')}
          </Text>
        </Pressable>
      </View>
    </AuthScaffold>
  );
}
