import { useLocalSearchParams } from 'expo-router';

import BarberProfileScreen from '@/features/team/BarberProfileScreen';

export default function BarberRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BarberProfileScreen id={id} />;
}
