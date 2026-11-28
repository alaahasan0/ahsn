import { useLocalSearchParams } from 'expo-router';

import CustomerFormScreen from '@/features/customers/CustomerFormScreen';

export default function EditCustomerRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CustomerFormScreen id={id} />;
}
