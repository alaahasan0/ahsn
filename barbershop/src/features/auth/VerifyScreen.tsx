import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Pressable, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';

import { AuthScaffold } from './AuthScaffold';
import { OtpInput } from './OtpInput';

export default function VerifyScreen() {
  const { t, f } = useI18n();
  const toast = useToast();
  const params = useLocalSearchParams<{ target?: string; next?: string; salon?: string }>();
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const submit = () => {
    if (code.length < 6) {
      setError(true);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast(t('auth.verify.verified'));
      if (params.next === 'login') router.replace('/login');
      else router.replace({ pathname: '/onboarding', params: params.salon ? { salon: params.salon } : {} });
    }, 600);
  };

  return (
    <AuthScaffold
      title={t('auth.verify.title')}
      subtitle={t('auth.verify.subtitle', { target: f.ltr(params.target ?? '+970 59 912 3456') })}
      footer={<Button label={t('auth.verify.submit')} size="lg" onPress={submit} loading={loading} disabled={code.length < 6} testID="verify-submit" />}
    >
      <View style={{ gap: 20 }}>
        <OtpInput
          value={code}
          error={error}
          onChange={(v) => {
            setCode(v);
            setError(false);
          }}
        />
        {error ? (
          <Text variant="footnote" tone="danger" align="center">
            {t('auth.verify.invalid')}
          </Text>
        ) : null}
        <View style={{ alignItems: 'center', gap: 12 }}>
          {seconds > 0 ? (
            <Text variant="subhead" tone="tertiary" tabular>
              {t('auth.verify.resendIn', { seconds })}
            </Text>
          ) : (
            <Pressable
              onPress={() => {
                setSeconds(30);
                toast({ message: t('auth.verify.resent'), description: t('common.toast.simulated'), icon: 'send' });
              }}
            >
              <Text variant="subhead" tone="accent">
                {t('auth.verify.resend')}
              </Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.back()}>
            <Text variant="subhead" tone="secondary">
              {t('auth.verify.wrongNumber')}
            </Text>
          </Pressable>
          <Text variant="caption" tone="tertiary" weight="regular">
            {t('auth.verify.demoHint')}
          </Text>
        </View>
      </View>
    </AuthScaffold>
  );
}
