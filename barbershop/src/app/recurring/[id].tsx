import { useLocalSearchParams } from 'expo-router';

import RecurringDetailScreen from '@/features/recurring/RecurringDetailScreen';

export default function RecurringRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecurringDetailScreen id={id} />;
}
