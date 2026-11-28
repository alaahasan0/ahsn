import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { useActions } from '@/store/AppStore';
import { useService } from '@/store/selectors';
import type { ID, Service } from '@/types/models';

import { FieldLabel, Stepper, ToggleRow } from '../availability/controls';
import { BarberMultiSelect } from '../team/BarberSelect';

const CATEGORIES: Service['category'][] = ['hair', 'beard', 'combo', 'care', 'kids'];
const ICONS: Record<Service['category'], string> = { hair: 'scissors', beard: 'feather', combo: 'star', care: 'droplet', kids: 'smile' };
const DURATIONS = [10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90, 120];

export default function ServiceFormScreen({ id }: { id?: string }) {
  const { t, f } = useI18n();
  const actions = useActions();
  const toast = useToast();
  const existing = useService(id);
  const [nameEn, setNameEn] = useState(existing?.name.en ?? '');
  const [nameAr, setNameAr] = useState(existing?.name.ar ?? '');
  const [descEn, setDescEn] = useState(existing?.description.en ?? '');
  const [descAr, setDescAr] = useState(existing?.description.ar ?? '');
  const [category, setCategory] = useState<Service['category']>(existing?.category ?? 'hair');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [duration, setDuration] = useState(existing?.durationMin ?? 30);
  const [buffer, setBuffer] = useState(existing?.bufferMin ?? 0);
  const [barberIds, setBarberIds] = useState<ID[]>(existing?.barberIds ?? []);
  const [active, setActive] = useState(existing?.active ?? true);
  const [online, setOnline] = useState(existing?.bookableOnline ?? true);
  const [submitted, setSubmitted] = useState(false);

  if (id && !existing) {
    return (
      <Screen header={<Header close />}>
        <EmptyState icon="scissors" title={t('services.details.notFound')} body={t('services.details.notFoundBody')} />
      </Screen>
    );
  }

  const priceNum = Number(price.replace(/[^\d.]/g, ''));
  const errors = {
    name: submitted && !nameEn.trim() && !nameAr.trim() ? t('services.form.errors.name') : undefined,
    price: submitted && !(priceNum > 0) ? t('services.form.errors.price') : undefined,
    barbers: submitted && barberIds.length === 0 ? t('services.form.errors.barbers') : undefined,
  };

  const save = () => {
    setSubmitted(true);
    if ((!nameEn.trim() && !nameAr.trim()) || !(priceNum > 0) || barberIds.length === 0) return;
    const data = {
      name: { en: nameEn.trim() || nameAr.trim(), ar: nameAr.trim() || nameEn.trim() },
      description: { en: descEn.trim(), ar: descAr.trim() || descEn.trim() },
      price: priceNum,
      durationMin: duration,
      bufferMin: buffer,
      barberIds,
      active,
      bookableOnline: online,
      category,
      icon: existing?.icon ?? ICONS[category],
      popular: existing?.popular,
    };
    if (existing) {
      actions.upsertService({ ...existing, ...data });
      toast(t('services.form.updated'));
      router.back();
    } else {
      const s = actions.createService(data);
      toast(t('services.form.created'));
      router.replace(`/services/${s.id}`);
    }
  };

  return (
    <Screen header={<Header close title={id ? t('services.form.editTitle') : t('services.form.newTitle')} backFallback="/services" />} footer={<Button label={t('services.form.save')} onPress={save} size="lg" fullWidth />}>
      <View style={{ gap: 22, paddingTop: 8 }}>
        <Input label={t('services.form.nameEn')} value={nameEn} onChangeText={setNameEn} placeholder="Haircut" ltr error={errors.name} />
        <Input label={t('services.form.nameAr')} value={nameAr} onChangeText={setNameAr} placeholder="قص شعر" />
        <View style={{ gap: 8 }}>
          <FieldLabel label={t('services.form.category')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Chip key={c} label={t(`services.form.categories.${c}`)} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>
        <Input label={t('services.form.price')} value={price} onChangeText={setPrice} keyboardType="decimal-pad" ltr placeholder="50" icon="tag" error={errors.price} hint={price ? f.money(priceNum || 0) : undefined} />
        <View style={{ gap: 8 }}>
          <FieldLabel label={t('services.form.duration')} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DURATIONS.map((d) => (
              <Chip key={d} size="sm" label={f.duration(d)} selected={duration === d} onPress={() => setDuration(d)} />
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <FieldLabel label={t('services.form.buffer')} hint={t('services.form.bufferHint')} />
          <Stepper value={buffer} onChange={setBuffer} step={5} min={0} max={30} format={(v) => (v ? f.duration(v) : t('services.details.bufferNone'))} />
        </View>
        <View style={{ gap: 8 }}>
          <FieldLabel label={t('services.form.barbers')} hint={errors.barbers ?? t('services.form.barbersHint')} />
          <BarberMultiSelect value={barberIds} onChange={setBarberIds} />
        </View>
        <Input label={t('services.form.descriptionEn')} value={descEn} onChangeText={setDescEn} multiline optional ltr />
        <Input label={t('services.form.descriptionAr')} value={descAr} onChangeText={setDescAr} multiline optional />
        <Card style={{ gap: 14 }}>
          <ToggleRow icon="power" title={t('services.form.active')} hint={t('services.form.activeHint')} value={active} onChange={setActive} />
          <ToggleRow icon="globe" title={t('services.form.online')} hint={t('services.form.onlineHint')} value={online} onChange={setOnline} />
        </Card>
      </View>
    </Screen>
  );
}
