import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { inboxUnread, groupTasks } from '@/data/selectors';
import { homeRouteFor, useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { AppTabBar, type TabConfig } from '@/navigation/TabBar';

export default function StaffTabsLayout() {
  const { mode, signedIn, userId } = useSession();
  const db = useDB();
  if (!signedIn) return <Redirect href="/welcome" />;
  if (mode !== 'staff') return <Redirect href={homeRouteFor(mode)} />;
  const mine = groupTasks(db.tasks.filter((t) => t.ownerId === userId));
  const tabs: TabConfig[] = [
    { name: 'home', label: 'Home', icon: 'house' },
    { name: 'programmes', label: 'Programmes', icon: 'layers' },
    { name: 'tasks', label: 'Tasks', icon: 'square-check-big', badge: mine.overdue.length + mine.today.length },
    { name: 'inbox', label: 'Inbox', icon: 'inbox', badge: inboxUnread(db) },
    { name: 'more', label: 'More', icon: 'layout-grid' },
  ];
  return (
    <Tabs screenOptions={{ headerShown: false, animation: 'shift' }} tabBar={(props) => <AppTabBar {...props} tabs={tabs} />}>
      {tabs.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
      ))}
    </Tabs>
  );
}
