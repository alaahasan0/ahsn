import CalendarScreen from '@/features/calendar/CalendarScreen';
import { usePreferences } from '@/store/preferences';

export default function BarberCalendar() {
  const { barberId } = usePreferences();
  return <CalendarScreen barberId={barberId} inTabs />;
}
