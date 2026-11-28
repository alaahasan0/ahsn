import { useLocalSearchParams } from 'expo-router';

import BarberFormScreen from '@/features/team/BarberFormScreen';

export default function EditBarberRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <BarberFormScreen id={id} />;
}
