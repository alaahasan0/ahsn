import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Icon, IconButton, Input, Pressable, SegmentedControl, Text } from '@/components/ui';
import { useI18n } from '@/i18n';
import { usePreferences, type DemoRole } from '@/store/preferences';
import { useTheme } from '@/theme';

import { AuthScaffold } from './AuthScaffold';

export default function LoginScreen() {
  const { colors, radius } = useTheme();
  const { t } = useI18n();
  const prefs = usePreferences();
  const [identifier, setIdentifier] = useState('khaled@thebarberhouse.ps');
  const [password, setPassword] = useState('demo-password');
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<DemoRole>(prefs.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const submit = () => {
    if (!identifier.trim() || !password) {
      setError(t('auth.login.errorRequired'));
      return;
    }
    setError(undefined);
    setLoading(true);
    setTimeout(() => {
      prefs.update({ role });
      router.replace(role === 'owner' ? '/owner' : '/barber');
    }, 700);
  };

  return (
    <AuthScaffold
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Text variant="footnote" tone="secondary">
            {t('auth.login.noAccount')}
          </Text>
          <Pressable onPress={() => router.replace('/register')}>
            <Text variant="footnote" tone="accent" weight="semibold">
              {t('auth.login.register')}
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={{ gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Text variant="subhead" tone="secondary">
            {t('auth.login.signInAs')}
          </Text>
          <SegmentedControl<DemoRole>
            value={role}
            onChange={setRole}
            segments={[
              { value: 'owner', label: t('auth.login.asOwner') },
              { value: 'barber', label: t('auth.login.asBarber') },
            ]}
          />
        </View>
        <Input label={t('auth.login.identifier')} placeholder={t('auth.login.identifierPlaceholder')} value={identifier} onChangeText={setIdentifier} icon="user" autoCapitalize="none" keyboardType="email-address" ltr />
        <Input
          label={t('auth.login.password')}
          placeholder={t('auth.login.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!show}
          icon="lock"
          ltr
          error={error}
          trailing={<IconButton icon={show ? 'eye-off' : 'eye'} size={32} iconSize={17} onPress={() => setShow((s) => !s)} accessibilityLabel={t('auth.login.showPassword')} color={colors.textTertiary} />}
          onSubmitEditing={submit}
        />
        <Pressable onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-end' }}>
          <Text variant="subhead" tone="accent">
            {t('auth.login.forgot')}
          </Text>
        </Pressable>
        <Button label={t('auth.login.submit')} size="lg" onPress={submit} loading={loading} testID="login-submit" />
        <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }}>
          <Icon name="info" size={16} color={colors.textSecondary} />
          <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
            {t('auth.login.demoHint')}
          </Text>
        </View>
      </View>
    </AuthScaffold>
  );
}
