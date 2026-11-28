import { useLocalSearchParams } from 'expo-router';

import BarberHoursScreen from '@/features/team/BarberHoursScreen';

export default function BarberHoursRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BarberHoursScreen id={id} />;
}
