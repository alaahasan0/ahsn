import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Badge, Button, Chip, Header, Icon, Input, PhoneInput, Screen, Section, Sheet, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { useAppState } from '@/store/AppStore';
import { useTheme } from '@/theme';
import type { PhoneNumber, UserRole } from '@/types/models';

const ROLES: UserRole[] = ['owner', 'manager', 'barber', 'receptionist'];

export default function UsersScreen() {
  const { colors } = useTheme();
  const { t, l, f } = useI18n();
  const toast = useToast();
  const { users, currentUser } = useAppState();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState<PhoneNumber>({ country: '+970', number: '' });
  const [role, setRole] = useState<UserRole>('barber');
  const lastActive = [3, 12, 95, 60 * 26];

  return (
    <Screen header={<Header title={t('settings.users.title')} backFallback="/settings" right={<Button label={t('settings.users.invite')} size="sm" variant="soft" icon="user-plus" onPress={() => setOpen(true)} />} />}>
      <View style={{ gap: 14, paddingTop: 8 }}>
        <Text variant="footnote" tone="secondary">
          {t('settings.users.subtitle')}
        </Text>
        <Section card>
          {users.map((u, i) => (
            <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 }}>
              <Avatar name={l(u.name)} size={42} />
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text variant="callout" weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {l(u.name)}
                  </Text>
                  {u.id === currentUser.id ? <Badge label={t('settings.users.you')} tone="accent" /> : null}
                </View>
                <Text variant="footnote" tone="secondary" numberOfLines={1}>
                  {t(`domain.role.${u.role}`)} · {t('settings.users.lastActive', { time: f.relative(new Date(now().getTime() - lastActive[i % lastActive.length] * 60000), now()) })}
                </Text>
              </View>
              {u.twoFactor ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="shield" size={13} color={colors.success} />
                  <Text variant="caption" tone="success">
                    {t('settings.users.twoFactorOn')}
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </Section>
      </View>
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('settings.users.inviteTitle')}
        subtitle={t('settings.users.inviteBody')}
        footer={
          <Button
            label={t('settings.users.sendInvite')}
            icon="send"
            disabled={!name.trim() || phone.number.length < 9}
            onPress={() => {
              setOpen(false);
              toast({ message: t('settings.users.invited'), description: t('common.toast.simulated'), icon: 'send' });
              setName('');
              setPhone({ country: '+970', number: '' });
            }}
          />
        }
      >
        <View style={{ gap: 16 }}>
          <Input label={t('settings.users.name')} value={name} onChangeText={setName} icon="user" />
          <PhoneInput label={t('settings.users.phone')} value={phone} onChange={setPhone} />
          <View style={{ gap: 8 }}>
            <Text variant="subhead" tone="secondary">
              {t('settings.users.role')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ROLES.filter((r) => r !== 'owner').map((r) => (
                <Chip key={r} label={t(`domain.role.${r}`)} selected={role === r} onPress={() => setRole(r)} />
              ))}
            </View>
          </View>
        </View>
      </Sheet>
    </Screen>
  );
}
