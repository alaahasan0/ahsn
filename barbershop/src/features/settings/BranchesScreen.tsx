import { useState } from 'react';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain';
import { Badge, Button, Card, Header, Icon, Input, Screen, Sheet, Text, useToast } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useActions, useAppState } from '@/store/AppStore';
import { useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';

export default function BranchesScreen() {
  const { colors } = useTheme();
  const { t, tp, l, f } = useI18n();
  const toast = useToast();
  const { salon } = useAppState();
  const actions = useActions();
  const look = useLookup();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  return (
    <Screen header={<Header title={t('settings.branches.title')} backFallback="/settings" right={<Button label={t('common.actions.add')} size="sm" variant="soft" icon="plus" onPress={() => setOpen(true)} />} />}>
      <View style={{ gap: 14, paddingTop: 8 }}>
        <Text variant="footnote" tone="secondary">
          {t('settings.branches.hint')}
        </Text>
        {salon.branches.map((b) => (
          <Card key={b.id} style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="map-pin" size={18} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="headline" numberOfLines={1}>
                  {l(b.name)}
                </Text>
                <Text variant="footnote" tone="secondary" numberOfLines={1}>
                  {l(b.address)}
                </Text>
              </View>
              {b.isPrimary ? <Badge label={t('settings.branches.primary')} tone="accent" /> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="caption" tone="tertiary" style={{ writingDirection: 'ltr' }} weight="regular">
                {f.phone(b.phone.country, b.phone.number)}
              </Text>
              <View style={{ flex: 1 }} />
              {b.barberIds.length ? (
                <>
                  <View style={{ flexDirection: 'row' }}>
                    {b.barberIds.map((id, i) => (
                      <View key={id} style={{ marginStart: i ? -8 : 0 }}>
                        <BarberAvatar barber={look.barber(id)} size={26} ring={colors.surface} />
                      </View>
                    ))}
                  </View>
                  <Text variant="caption" tone="secondary">
                    {tp('common.counts.barbers', b.barberIds.length)}
                  </Text>
                </>
              ) : (
                <Text variant="caption" tone="tertiary">
                  {t('settings.branches.noBarbers')}
                </Text>
              )}
            </View>
          </Card>
        ))}
      </View>
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('settings.branches.addTitle')}
        footer={
          <Button
            label={t('settings.branches.addBranch')}
            disabled={!name.trim()}
            onPress={() => {
              actions.updateSalon({ branches: [...salon.branches, { id: `br_${Date.now()}`, name: { en: name, ar: name }, address: { en: address, ar: address }, phone: salon.phone, isPrimary: false, barberIds: [] }] });
              setOpen(false);
              setName('');
              setAddress('');
              toast(t('settings.branches.added'));
            }}
          />
        }
      >
        <View style={{ gap: 14 }}>
          <Input label={t('settings.branches.branchName')} value={name} onChangeText={setName} icon="home" />
          <Input label={t('settings.branches.branchAddress')} value={address} onChangeText={setAddress} icon="map-pin" />
        </View>
      </Sheet>
    </Screen>
  );
}
