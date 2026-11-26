import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, HeaderActions, IconButton, Screen, Touchable } from '@/components';
import { getStaff, unreadCount } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { DEMO_TODAY, formatDateLong, greeting } from '@/utils/dates';

import { FloatingButton, QuickActionsSheet } from '../shared/Widgets';
import { HeroCard, RoleWidgets, TodayStrip, useHero } from './widgets';

/**
 * Staff Home: one clear next action, today at a glance, then role-specific context.
 * The layout adapts to the active role (see RoleWidgets).
 */
export default function HomeScreen() {
  const db = useDB();
  const { userId, role } = useSession();
  const me = getStaff(db, userId);
  const hero = useHero(role);
  const [quick, setQuick] = useState(false);
  const roleLabel = db.roles.find((r) => r.key === role)?.label;

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title={`${greeting()}, ${me?.name.replace(/^Dr\. /, '').split(' ')[0]}`}
        eyebrow={formatDateLong(DEMO_TODAY, true)}
        subtitle={roleLabel}
        back={false}
        refreshable
        contentStyle={{ paddingBottom: 190 }}
        headerRight={
          <HeaderActions>
            <IconButton icon="search" accessibilityLabel="Search" onPress={() => router.push('/search')} />
            <IconButton icon="bell" accessibilityLabel="Notifications" badge={unreadCount(db, 'staff') > 0} onPress={() => router.push('/notifications')} />
            <Touchable onPress={() => router.push('/profile')} onLongPress={() => router.push('/role-switcher')} accessibilityLabel="Profile and role" hitSlop={6} style={{ marginLeft: 4 }}>
              <Avatar name={me?.name ?? ''} hue={me?.avatarHue} size={32} />
            </Touchable>
          </HeaderActions>
        }>
        <HeroCard hero={hero} />
        <TodayStrip />
        <RoleWidgets role={role} />
      </Screen>
      <FloatingButton label="Quick actions" onPress={() => setQuick(true)} />
      <QuickActionsSheet visible={quick} onClose={() => setQuick(false)} />
    </View>
  );
}
