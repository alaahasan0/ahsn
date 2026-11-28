import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { Header } from '@/components/ui/Header';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/States';
import { useI18n } from '@/i18n';
import { now } from '@/lib/clock';
import { useAppState } from '@/store/AppStore';
import { useCustomer } from '@/store/selectors';

type View_ = 'all' | 'upcoming' | 'completed' | 'missed';

export default function CustomerHistoryScreen({ id }: { id: string }) {
  const { t, l } = useI18n();
  const customer = useCustomer(id);
  const { appointments } = useAppState();
  const [view, setView] = useState<View_>('all');
  const mine = useMemo(() => appointments.filter((a) => a.customerId === id).sort((a, b) => b.start.localeCompare(a.start)), [appointments, id]);
  const list = mine.filter((a) => {
    if (view === 'upcoming') return new Date(a.start) > now() && ['confirmed', 'pending', 'draft'].includes(a.status);
    if (view === 'completed') return a.status === 'completed';
    if (view === 'missed') return a.status === 'cancelled' || a.status === 'no_show';
    return true;
  });
  return (
    <Screen
      header={
        <Header title={t('customers.history.title')} subtitle={l(customer?.name)} backFallback={`/customers/${id}`}>
          <SegmentedControl
            size="sm"
            value={view}
            onChange={setView}
            segments={[
              { value: 'all', label: t('customers.history.all') },
              { value: 'upcoming', label: t('customers.history.upcoming') },
              { value: 'completed', label: t('customers.history.completed') },
              { value: 'missed', label: t('customers.history.missed') },
            ]}
          />
        </Header>
      }
    >
      <View style={{ gap: 10, paddingTop: 4 }}>
        {list.length === 0 ? <EmptyState compact icon="calendar" title={t('customers.history.empty')} body="" /> : list.map((a) => <AppointmentCard key={a.id} appointment={a} showDate />)}
      </View>
    </Screen>
  );
}
