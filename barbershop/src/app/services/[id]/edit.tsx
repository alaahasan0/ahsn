import { useLocalSearchParams } from 'expo-router';

import ServiceFormScreen from '@/features/services/ServiceFormScreen';

export default function EditServiceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ServiceFormScreen id={id} />;
}
