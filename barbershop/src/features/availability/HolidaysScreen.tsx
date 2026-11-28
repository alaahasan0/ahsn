import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Dialog } from '@/components/ui/Dialog';
import { Divider } from '@/components/ui/Divider';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { Sheet } from '@/components/ui/Sheet';
import { EmptyState } from '@/components/ui/States';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/i18n';
import { today } from '@/lib/clock';
import { fromISODate, toISODate } from '@/lib/dates';
import { uid } from '@/lib/id';
import { useActions, useAppState } from '@/store/AppStore';
import { useTheme } from '@/theme';
import type { Holiday, ISODate } from '@/types/models';

import { DateField, ToggleRow } from './controls';

/** Approximate dates; the owner confirms them each year. */
function presets(): { key: 'christmas' | 'newYear' | 'eidFitr' | 'eidAdha'; date: ISODate }[] {
  const y = today().getFullYear();
  const t0 = toISODate(today());
  const next = (md: string) => (`${y}-${md}` >= t0 ? `${y}-${md}` : `${y + 1}-${md}`);
  return [
    { key: 'christmas', date: next('12-25') },
    { key: 'newYear', date: next('01-01') },
    { key: 'eidFitr', date: '2027-03-10' },
    { key: 'eidAdha', date: '2027-05-17' },
  ];
}

export default function HolidaysScreen() {
  const { colors } = useTheme();
  const { t, f, l, lang } = useI18n();
  const { salon } = useAppState();
  const actions = useActions();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [closed, setClosed] = useState(true);
  const [removing, setRemoving] = useState<Holiday | null>(null);

  const iso = toISODate(today());
  const upcoming = salon.holidays.filter((h) => h.date >= iso).sort((a, b) => a.date.localeCompare(b.date));
  const past = salon.holidays.filter((h) => h.date < iso).sort((a, b) => b.date.localeCompare(a.date));
  const available = presets().filter((p) => !salon.holidays.some((h) => h.date === p.date));

  const add = (h: Omit<Holiday, 'id'>) => {
    actions.updateSalon({ holidays: [...salon.holidays, { ...h, id: uid('hol') }] });
    toast(t('availability.holidaysScreen.added'));
  };
  const setHolidayClosed = (h: Holiday, v: boolean) => actions.updateSalon({ holidays: salon.holidays.map((x) => (x.id === h.id ? { ...x, closed: v } : x)) });

  const renderList = (list: Holiday[]) => (
    <Card padding={0}>
      {list.map((h, i) => (
        <View key={h.id}>
          {i > 0 ? <Divider inset={16} /> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <Icon name="sun" size={16} color={h.closed ? colors.warning : colors.textTertiary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="callout" weight="medium">
                {l(h.name)}
              </Text>
              <Text variant="footnote" tone="secondary">
                {f.dateLong(fromISODate(h.date))} · {h.closed ? t('common.labels.closed') : t('availability.holidaysScreen.reduced')}
              </Text>
            </View>
            <Switch value={h.closed} onValueChange={(v) => setHolidayClosed(h, v)} accessibilityLabel={t('availability.holidaysScreen.closed')} />
            <IconButton icon="trash-2" size={34} iconSize={16} color={colors.danger} accessibilityLabel={t('common.actions.remove')} onPress={() => setRemoving(h)} />
          </View>
        </View>
      ))}
    </Card>
  );

  return (
    <Screen header={<Header title={t('availability.holidaysScreen.title')} backFallback="/availability" />} footer={<Button label={t('availability.holidaysScreen.add')} icon="plus" size="lg" fullWidth onPress={() => setAdding(true)} />}>
      <View style={{ gap: 24, paddingTop: 4 }}>
        {available.length ? (
          <Section title={t('availability.holidaysScreen.suggestions')}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {available.map((p) => (
                <Chip
                  key={p.key}
                  icon="plus"
                  label={`${t(`availability.holidaysScreen.presets.${p.key}`)} · ${f.dayMonth(fromISODate(p.date))}`}
                  onPress={() => {
                    const label = { en: '', ar: '' };
                    label[lang] = t(`availability.holidaysScreen.presets.${p.key}`);
                    label[lang === 'en' ? 'ar' : 'en'] = label[lang];
                    add({ date: p.date, name: label, closed: true });
                  }}
                />
              ))}
            </View>
          </Section>
        ) : null}
        <Section title={t('availability.holidaysScreen.upcoming')}>{upcoming.length ? renderList(upcoming) : <EmptyState compact icon="sun" title={t('availability.noHolidays')} body={t('availability.holidaysScreen.empty')} />}</Section>
        {past.length ? <Section title={t('availability.holidaysScreen.past')}>{renderList(past)}</Section> : null}
      </View>

      <Sheet
        visible={adding}
        onClose={() => setAdding(false)}
        title={t('availability.holidaysScreen.add')}
        footer={
          <Button
            label={t('common.actions.add')}
            size="lg"
            fullWidth
            disabled={!name.trim() || !date}
            onPress={() => {
              if (!date) return;
              add({ date: toISODate(date), name: { en: name.trim(), ar: name.trim() }, closed });
              setAdding(false);
              setName('');
              setDate(undefined);
              setClosed(true);
            }}
          />
        }
      >
        <View style={{ gap: 16 }}>
          <Input label={t('availability.holidaysScreen.name')} placeholder={t('availability.holidaysScreen.namePlaceholder')} value={name} onChangeText={setName} />
          <DateField label={t('availability.holidaysScreen.date')} value={date} onChange={setDate} minDate={today()} />
          <ToggleRow title={t('availability.holidaysScreen.closed')} hint={t('availability.holidaysScreen.closedHint')} value={closed} onChange={setClosed} />
        </View>
      </Sheet>

      <Dialog
        visible={!!removing}
        onClose={() => setRemoving(null)}
        title={t('availability.holidaysScreen.remove')}
        message={removing ? t('availability.holidaysScreen.removeBody', { name: l(removing.name) }) : undefined}
        icon="trash-2"
        tone="danger"
        confirmLabel={t('common.actions.remove')}
        onConfirm={() => {
          if (removing) actions.updateSalon({ holidays: salon.holidays.filter((h) => h.id !== removing.id) });
          toast(t('availability.holidaysScreen.removedToast'));
        }}
      />
    </Screen>
  );
}
