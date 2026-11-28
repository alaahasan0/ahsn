import { Tabs } from 'expo-router/js-tabs';

import { TabBar, type TabItem } from '@/components/navigation/TabBar';
import { useInboxCounts } from '@/store/selectors';
import { useTheme } from '@/theme';

/** Salon owner / manager: Home · Calendar · Bookings · Customers · More */
export default function OwnerTabs() {
  const { colors } = useTheme();
  const inbox = useInboxCounts();
  const items: Record<string, TabItem> = {
    index: { icon: 'home', label: 'common.nav.home' },
    calendar: { icon: 'calendar', label: 'common.nav.calendar' },
    bookings: { icon: 'inbox', label: 'common.nav.bookings', badge: inbox.requests + inbox.expired },
    customers: { icon: 'users', label: 'common.nav.customers' },
    more: { icon: 'grid', label: 'common.nav.more' },
  };
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }} tabBar={(props) => <TabBar {...props} items={items} />}>
      {/* SDK 58: only screens declared here are rendered. */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="customers" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
