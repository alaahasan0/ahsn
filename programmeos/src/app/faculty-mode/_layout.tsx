import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { unreadCount } from '@/data/selectors';
import { homeRouteFor, useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { AppTabBar, type TabConfig } from '@/navigation/TabBar';

/** Faculty Mode — a deliberately simplified experience for instructors. */
export default function FacultyTabsLayout() {
  const { mode, signedIn } = useSession();
  const db = useDB();
  if (!signedIn) return <Redirect href="/welcome" />;
  if (mode !== 'faculty') return <Redirect href={homeRouteFor(mode)} />;
  const tabs: TabConfig[] = [
    { name: 'index', label: 'Home', icon: 'house' },
    { name: 'schedule', label: 'My Schedule', icon: 'calendar-days' },
    { name: 'programmes', label: 'My Programmes', icon: 'layers' },
    { name: 'inbox', label: 'Inbox', icon: 'inbox', badge: unreadCount(db, 'faculty') },
    { name: 'profile', label: 'Profile', icon: 'user-round' },
  ];
  return (
    <Tabs screenOptions={{ headerShown: false, animation: 'shift' }} tabBar={(props) => <AppTabBar {...props} tabs={tabs} />}>
      {tabs.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}
