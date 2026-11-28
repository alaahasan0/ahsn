import { useLocalSearchParams } from 'expo-router';

import ServiceDetailScreen from '@/features/services/ServiceDetailScreen';

export default function ServiceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ServiceDetailScreen id={id} />;
}
