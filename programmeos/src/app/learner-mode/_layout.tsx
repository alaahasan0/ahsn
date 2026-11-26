import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { homeRouteFor, useSession } from '@/data/session';
import { AppTabBar, type TabConfig } from '@/navigation/TabBar';

/** Learner Mode — welcoming, effortless access to the participant's programme. */
export default function LearnerTabsLayout() {
  const { mode, signedIn } = useSession();
  if (!signedIn) return <Redirect href="/welcome" />;
  if (mode !== 'learner') return <Redirect href={homeRouteFor(mode)} />;
  const tabs: TabConfig[] = [
    { name: 'index', label: 'Home', icon: 'house' },
    { name: 'programme', label: 'My Programme', icon: 'graduation-cap' },
    { name: 'schedule', label: 'Schedule', icon: 'calendar-days' },
    { name: 'materials', label: 'Materials', icon: 'book-open' },
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
