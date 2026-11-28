import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { BarberAvatar } from '@/components/domain/BarberAvatar';
import { RoleSwitcherSheet } from '@/components/domain/RoleSwitcher';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Header } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/ListRow';
import { Pressable } from '@/components/ui/Pressable';
import { Screen } from '@/components/ui/Screen';
import { Section } from '@/components/ui/Section';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { Switch } from '@/components/ui/Switch';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { now, today } from '@/lib/clock';
import { fromISODate, isSameDay, startOfWeek } from '@/lib/dates';
import { useActions, useAppState } from '@/store/AppStore';
import { usePreferences, type ThemeMode } from '@/store/preferences';
import { useBarber, useBarbers } from '@/store/selectors';
import { useTheme } from '@/theme';
import type { Weekday } from '@/types/models';

const ORDER: Weekday[] = [6, 0, 1, 2, 3, 4, 5];

export default function ProfileScreen() {
  const { colors, radius } = useTheme();
  const { t, l, f } = useI18n();
  const prefs = usePreferences();
  const barber = useBarber(prefs.barberId);
  const barbers = useBarbers();
  const actions = useActions();
  const { appointments } = useAppState();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [signOut, setSignOut] = useState(false);

  const stats = useMemo(() => {
    const weekStart = startOfWeek(today());
    const mine = appointments.filter((a) => a.barberId === prefs.barberId && a.status === 'completed');
    return {
      today: mine.filter((a) => isSameDay(new Date(a.start), today())).length,
      week: mine.filter((a) => new Date(a.start) >= weekStart && new Date(a.start) <= now()).length,
    };
  }, [appointments, prefs.barberId]);

  if (!barber) return null;
  const daysOff = barber.daysOff.filter((d) => fromISODate(d) >= today()).sort();
  const themeSegments: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: t('barber.profile.themeSystem') },
    { value: 'light', label: t('barber.profile.themeLight') },
    { value: 'dark', label: t('barber.profile.themeDark') },
  ];

  return (
    <Screen inTabs header={<Header variant="large" back={false} title={t('barber.profile.title')} />}>
      <View style={{ gap: 24, paddingTop: 4 }}>
        <Card style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <BarberAvatar barber={barber} size={60} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="title3">{l(barber.name)}</Text>
              <Text variant="footnote" tone="secondary">
                {l(barber.title)}
              </Text>
              <Text variant="caption" tone="tertiary">
                {t('barber.profile.yearsExp', { count: barber.yearsExperience })}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Stat label={t('barber.profile.stats.today')} value={f.number(stats.today)} />
            <Stat label={t('barber.profile.stats.week')} value={f.number(stats.week)} />
          </View>
        </Card>

        <Section card>
          <ListRow icon="repeat" title={t('barber.profile.switchBarber')} subtitle={t('barber.profile.switchBarberHint')} value={l(barber.name).split(' ')[0]} onPress={() => setSwitchOpen(true)} />
          <ListRow
            icon="globe"
            title={t('barber.profile.acceptingOnline')}
            subtitle={t('barber.profile.acceptingOnlineHint')}
            trailing={<Switch value={barber.acceptsOnline} onValueChange={(v) => actions.upsertBarber({ ...barber, acceptsOnline: v })} accessibilityLabel={t('barber.profile.acceptingOnline')} />}
          />
        </Section>

        <Section title={t('barber.profile.hours')} actionLabel={t('barber.profile.editHours')} onAction={() => router.push(`/team/${barber.id}/hours`)}>
          <Card padding={0}>
            {ORDER.map((wd, i) => {
              const d = barber.schedule[wd];
              const isToday = today().getDay() === wd;
              return (
                <View
                  key={wd}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 11,
                    paddingHorizontal: 16,
                    borderTopWidth: i ? 1 : 0,
                    borderTopColor: colors.separator,
                    backgroundColor: isToday ? colors.accentSoft : 'transparent',
                  }}
                >
                  <Text variant="callout" weight={isToday ? 'semibold' : 'regular'} style={{ width: 96 }}>
                    {f.weekday(wd)}
                  </Text>
                  <Text variant="callout" tone={d.enabled ? 'primary' : 'tertiary'} tabular style={{ flex: 1 }}>
                    {d.enabled ? `${f.clock(d.start)} – ${f.clock(d.end)}` : t('barber.profile.off')}
                  </Text>
                  {d.enabled && d.breaks.length ? <Icon name="coffee" size={14} color={colors.textTertiary} /> : null}
                </View>
              );
            })}
          </Card>
        </Section>

        <Section title={t('barber.profile.daysOff')}>
          {daysOff.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {daysOff.map((d) => (
                <View
                  key={d}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    height: 34,
                    borderRadius: radius.pill,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Icon name="sun" size={13} color={colors.warning} />
                  <Text variant="subhead">{f.dateShort(fromISODate(d))}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text variant="footnote" tone="secondary">
              {t('barber.profile.noDaysOff')}
            </Text>
          )}
        </Section>

        <Section title={t('barber.profile.preferences')} card>
          <ListRow
            icon="type"
            title={t('barber.profile.language')}
            trailing={
              <SegmentedControl
                size="sm"
                style={{ width: 150 }}
                segments={[
                  { value: 'ar', label: 'العربية' },
                  { value: 'en', label: 'English' },
                ]}
                value={prefs.language}
                onChange={(v) => prefs.set('language', v)}
              />
            }
          />
          <View style={{ padding: 16, gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="moon" size={17} color={colors.text} />
              </View>
              <Text variant="callout" weight="medium">
                {t('barber.profile.darkMode')}
              </Text>
            </View>
            <SegmentedControl size="sm" segments={themeSegments} value={prefs.themeMode} onChange={(v) => prefs.set('themeMode', v)} />
          </View>
        </Section>

        <Section card>
          <ListRow icon="shuffle" title={t('barber.profile.switchExperience')} onPress={() => setRoleOpen(true)} />
          <ListRow icon="log-out" title={t('barber.profile.signOut')} destructive onPress={() => setSignOut(true)} />
        </Section>
      </View>

      <Sheet visible={switchOpen} onClose={() => setSwitchOpen(false)} title={t('barber.profile.switchBarber')} subtitle={t('barber.profile.switchBarberHint')}>
        <View style={{ gap: 8 }}>
          {barbers.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => {
                prefs.set('barberId', b.id);
                setSwitchOpen(false);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.md, backgroundColor: b.id === barber.id ? colors.accentSoft : colors.surfaceMuted }}
            >
              <BarberAvatar barber={b} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="callout" weight="semibold">
                  {l(b.name)}
                </Text>
                <Text variant="footnote" tone="secondary">
                  {l(b.title)}
                </Text>
              </View>
              {b.id === barber.id ? <Icon name="check" size={18} color={colors.accent} /> : null}
            </Pressable>
          ))}
        </View>
      </Sheet>
      <RoleSwitcherSheet visible={roleOpen} onClose={() => setRoleOpen(false)} />
      <Dialog
        visible={signOut}
        onClose={() => setSignOut(false)}
        icon="log-out"
        title={t('barber.profile.signOut')}
        message={t('barber.profile.signOutConfirm')}
        tone="danger"
        confirmLabel={t('barber.profile.signOut')}
        onConfirm={() => router.replace('/welcome')}
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, radius } = useTheme();
  return (
    <View style={{ flex: 1, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, gap: 2 }}>
      <Text variant="title3" tabular>
        {value}
      </Text>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}
