import { Tabs } from 'expo-router/js-tabs';

import { TabBar, type TabItem } from '@/components/navigation/TabBar';
import { useTheme } from '@/theme';

/** Barber workspace: Today · Calendar · Assistant · Customers · Profile */
export default function BarberTabs() {
  const { colors } = useTheme();
  const items: Record<string, TabItem> = {
    index: { icon: 'sun', label: 'common.nav.today' },
    calendar: { icon: 'calendar', label: 'common.nav.calendar' },
    assistant: { icon: 'mic', label: 'common.nav.assistant', prominent: true },
    customers: { icon: 'users', label: 'common.nav.customers' },
    profile: { icon: 'user', label: 'common.nav.profile' },
  };
  return <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }} tabBar={(props) => <TabBar {...props} items={items} />} />;
}
