import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { initialsOf } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { toISODate } from '@/lib/dates';
import { isValidMobile } from '@/lib/phone';
import { useActions, useAppState } from '@/store/AppStore';
import { useBarber } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Barber, ID, PhoneNumber, UserRole } from '@/types/models';

import { FieldLabel, Stepper, ToggleRow } from '../availability/controls';
import { ServiceMultiSelect } from '../services/ServiceSelect';

const COLORS = ['#8A4520', '#2F5D50', '#3D4C7A', '#6B3A5E', '#4E5B31', '#1F5C73', '#7A3B2E', '#3F3A36'];
const ROLES: UserRole[] = ['barber', 'manager', 'owner'];

export default function BarberFormScreen({ id }: { id?: string }) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const actions = useActions();
  const toast = useToast();
  const { salon, services } = useAppState();
  const existing = useBarber(id);
  const [nameEn, setNameEn] = useState(existing?.name.en ?? '');
  const [nameAr, setNameAr] = useState(existing?.name.ar ?? '');
  const [titleEn, setTitleEn] = useState(existing?.title.en ?? '');
  const [titleAr, setTitleAr] = useState(existing?.title.ar ?? '');
  const [phone, setPhone] = useState<PhoneNumber>(existing?.phone ?? { country: '+970', number: '' });
  const [role, setRole] = useState<UserRole>(existing?.role ?? 'barber');
  const [years, setYears] = useState(existing?.yearsExperience ?? 2);
  const [color, setColor] = useState(existing?.color ?? COLORS[3]);
  const [serviceIds, setServiceIds] = useState<ID[]>(existing?.serviceIds ?? ['s1', 's2']);
  const [online, setOnline] = useState(existing?.acceptsOnline ?? true);
  const [active, setActive] = useState(existing?.active ?? true);
  const [submitted, setSubmitted] = useState(false);

  if (id && !existing) {
    return (
      <Screen header={<Header close />}>
        <EmptyState icon="user-x" title={t('team.profile.notFound')} body={t('team.profile.notFoundBody')} />
      </Screen>
    );
  }

  const nameOk = !!(nameEn.trim() || nameAr.trim());
  const preview: Barber = {
    ...(existing ?? ({} as Barber)),
    color,
    initials: { en: initialsOf(nameEn || nameAr), ar: initialsOf(nameAr || nameEn) },
  } as Barber;

  const save = () => {
    setSubmitted(true);
    if (!nameOk || !isValidMobile(phone) || serviceIds.length === 0) return;
    const data = {
      name: { en: nameEn.trim() || nameAr.trim(), ar: nameAr.trim() || nameEn.trim() },
      title: { en: titleEn.trim() || titleAr.trim(), ar: titleAr.trim() || titleEn.trim() },
      initials: preview.initials,
      phone,
      role,
      yearsExperience: years,
      color,
      serviceIds,
      acceptsOnline: online,
      active,
    };
    // Keep each service's barber list in sync with this barber's services.
    const syncServices = (barberId: ID) =>
      services.forEach((s) => {
        const has = s.barberIds.includes(barberId);
        const wants = serviceIds.includes(s.id);
        if (has !== wants) actions.upsertService({ ...s, barberIds: wants ? [...s.barberIds, barberId] : s.barberIds.filter((x) => x !== barberId) });
      });
    if (existing) {
      actions.upsertBarber({ ...existing, ...data });
      syncServices(existing.id);
      toast(t('team.form.updated'));
      router.back();
    } else {
      const b = actions.createBarber({ ...data, bio: { en: '', ar: '' }, schedule: JSON.parse(JSON.stringify(salon.hours)), daysOff: [], joinedAt: toISODate(today()) });
      syncServices(b.id);
      toast(t('team.form.created'));
      router.replace(`/team/${b.id}`);
    }
  };

  return (
    <Screen header={<Header close title={id ? t('team.form.editTitle') : t('team.form.newTitle')} backFallback="/team" />} footer={<Button label={t('team.form.save')} onPress={save} size="lg" fullWidth />}>
      <View style={{ gap: 22, paddingTop: 8 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <BarberAvatar barber={preview} size={72} />
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {COLORS.map((c) => (
              <Pressable key={c} onPress={() => setColor(c)} accessibilityLabel={t('team.form.color')} accessibilityState={{ selected: c === color }} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, alignItems: 'center', justifyContent: 'center', borderWidth: c === color ? 2 : 0, borderColor: colors.surface }}>
                {c === color ? <Icon name="check" size={14} color="#fff" /> : null}
              </Pressable>
            ))}
          </View>
        </View>
        <Input label={t('team.form.nameEn')} value={nameEn} onChangeText={setNameEn} ltr placeholder="Yousef Odeh" error={submitted && !nameOk ? t('team.form.errors.name') : undefined} />
        <Input label={t('team.form.nameAr')} value={nameAr} onChangeText={setNameAr} placeholder="يوسف عودة" />
        <Input label={t('team.form.titleEn')} value={titleEn} onChangeText={setTitleEn} ltr placeholder="Senior barber · Fades" optional />
        <Input label={t('team.form.titleAr')} value={titleAr} onChangeText={setTitleAr} placeholder={t('team.form.titlePlaceholder')} optional />
        <PhoneInput label={t('team.form.phone')} value={phone} onChange={setPhone} error={submitted && !isValidMobile(phone) ? t('team.form.errors.phone') : undefined} />
        <View style={{ gap: 8 }}>
          <FieldLabel label={t('team.form.role')} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {ROLES.map((r) => (
              <Chip key={r} label={t(`domain.role.${r}`)} selected={role === r} onPress={() => setRole(r)} />
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <FieldLabel label={t('team.form.experience')} />
          <Stepper value={years} onChange={setYears} min={0} max={50} />
        </View>
        <View style={{ gap: 8 }}>
          <FieldLabel label={t('team.form.services')} hint={submitted && serviceIds.length === 0 ? t('team.form.errors.services') : t('team.form.servicesHint')} />
          <ServiceMultiSelect value={serviceIds} onChange={setServiceIds} />
        </View>
        <Card style={{ gap: 14 }}>
          <ToggleRow icon="globe" title={t('team.form.online')} hint={t('team.form.onlineHint')} value={online} onChange={setOnline} />
          <ToggleRow icon="power" title={t('team.form.active')} hint={t('team.form.activeHint')} value={active} onChange={setActive} />
        </Card>
        {!id ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Icon name="info" size={14} color={colors.textTertiary} />
            <Text variant="footnote" tone="tertiary" style={{ flex: 1 }}>
              {t('team.form.inviteHint')}
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
