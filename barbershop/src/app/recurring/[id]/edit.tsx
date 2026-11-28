import { useLocalSearchParams } from 'expo-router';

import RecurringFormScreen from '@/features/recurring/RecurringFormScreen';

export default function EditRecurringRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RecurringFormScreen id={id} />;
}
