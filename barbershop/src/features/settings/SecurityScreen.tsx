import { useState } from 'react';
import { View } from 'react-native';

import { Button, Header, Icon, Input, ListRow, Screen, Section, Sheet, Switch, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { useAppState } from '@/store/AppStore';
import { useTheme } from '@/theme';

export default function SecurityScreen() {
  const { colors } = useTheme();
  const { t, f } = useI18n();
  const toast = useToast();
  const { currentUser } = useAppState();
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactor);
  const [alerts, setAlerts] = useState(true);
  const [pwOpen, setPwOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [devices, setDevices] = useState([
    { id: 'd1', name: 'iPhone 15 Pro · Ramallah', icon: 'smartphone' as const, minutes: 0 },
    { id: 'd2', name: 'MacBook Air · Chrome', icon: 'monitor' as const, minutes: 180 },
    { id: 'd3', name: 'Samsung Galaxy Tab · Reception', icon: 'tablet' as const, minutes: 60 * 30 },
  ]);

  return (
    <Screen header={<Header title={t('settings.security.title')} backFallback="/settings" />}>
      <View style={{ gap: 28, paddingTop: 8 }}>
        <Section card>
          <ListRow icon="shield" title={t('settings.security.twoFactor')} subtitle={t('settings.security.twoFactorHint')} trailing={<Switch value={twoFactor} onValueChange={setTwoFactor} />} />
          <ListRow icon="bell" title={t('settings.security.loginAlerts')} trailing={<Switch value={alerts} onValueChange={setAlerts} />} />
          <ListRow icon="key" title={t('settings.security.changePassword')} onPress={() => setPwOpen(true)} />
        </Section>
        <Section title={t('settings.security.sessions')} card>
          {devices.map((d, i) => (
            <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={d.icon} size={16} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="callout" weight="medium" numberOfLines={1} style={{ writingDirection: 'ltr' }}>
                  {d.name}
                </Text>
                <Text variant="footnote" tone={i === 0 ? 'success' : 'secondary'}>
                  {i === 0 ? t('settings.security.thisDevice') : t('settings.security.lastSeen', { time: f.relative(new Date(now().getTime() - d.minutes * 60000), now()) })}
                </Text>
              </View>
            </View>
          ))}
        </Section>
        {devices.length > 1 ? (
          <Button
            label={t('settings.security.signOutOthers')}
            variant="dangerSoft"
            icon="log-out"
            onPress={() => {
              setDevices((d) => d.slice(0, 1));
              toast(t('settings.security.signedOutOthers'));
            }}
          />
        ) : null}
      </View>
      <Sheet
        visible={pwOpen}
        onClose={() => setPwOpen(false)}
        title={t('settings.security.changePassword')}
        footer={
          <Button
            label={t('common.actions.save')}
            disabled={!current || next.length < 8}
            onPress={() => {
              setPwOpen(false);
              setCurrent('');
              setNext('');
              toast(t('settings.security.passwordChanged'));
            }}
          />
        }
      >
        <View style={{ gap: 14 }}>
          <Input label={t('settings.security.currentPassword')} value={current} onChangeText={setCurrent} secureTextEntry icon="lock" ltr />
          <Input label={t('settings.security.newPassword')} value={next} onChangeText={setNext} secureTextEntry icon="key" hint={t('auth.register.passwordHint')} ltr />
        </View>
      </Sheet>
    </Screen>
  );
}
