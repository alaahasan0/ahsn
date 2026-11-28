import { useLocalSearchParams } from 'expo-router';

import CustomerHistoryScreen from '@/features/customers/CustomerHistoryScreen';

export default function CustomerHistoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CustomerHistoryScreen id={id} />;
}
