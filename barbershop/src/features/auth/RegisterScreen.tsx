import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Input, PhoneInput, Pressable, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { isValidMobile } from '@/lib/phone';
import type { PhoneNumber } from '@/types/models';

import { AuthScaffold } from './AuthScaffold';

export default function RegisterScreen() {
  const { t, f } = useI18n();
  const [name, setName] = useState('');
  const [salonName, setSalonName] = useState('');
  const [phone, setPhone] = useState<PhoneNumber>({ country: '+970', number: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!name.trim() || !salonName.trim() || !isValidMobile(phone)) {
      setError(t('auth.register.errorRequired'));
      return;
    }
    setError(undefined);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({ pathname: '/verify', params: { target: f.phone(phone.country, phone.number), next: 'onboarding', salon: salonName } });
    }, 600);
  };

  return (
    <AuthScaffold
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      footer={
        <>
          <Button label={t('auth.register.submit')} size="lg" onPress={submit} loading={loading} testID="register-submit" />
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            <Text variant="footnote" tone="secondary">
              {t('auth.register.haveAccount')}
            </Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text variant="footnote" tone="accent" weight="semibold">
                {t('auth.register.signIn')}
              </Text>
            </Pressable>
          </View>
        </>
      }
    >
      <View style={{ gap: 16 }}>
        <Input label={t('auth.register.fullName')} placeholder={t('auth.register.fullNamePlaceholder')} value={name} onChangeText={setName} icon="user" />
        <Input label={t('auth.register.salonName')} placeholder={t('auth.register.salonNamePlaceholder')} value={salonName} onChangeText={setSalonName} icon="scissors" />
        <PhoneInput label={t('auth.register.phone')} value={phone} onChange={setPhone} hint={t('auth.register.phoneHint')} />
        <Input label={t('auth.register.email')} value={email} onChangeText={setEmail} icon="mail" optional autoCapitalize="none" keyboardType="email-address" ltr />
        <Input label={t('auth.register.password')} value={password} onChangeText={setPassword} icon="lock" secureTextEntry hint={t('auth.register.passwordHint')} ltr />
        {error ? (
          <Text variant="footnote" tone="danger">
            {error}
          </Text>
        ) : null}
        <Text variant="caption" tone="tertiary" weight="regular">
          {t('auth.register.terms')}
        </Text>
      </View>
    </AuthScaffold>
  );
}
