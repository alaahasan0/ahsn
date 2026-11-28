import { DEMO_NOW } from '@/lib/clock';
import { addMinutes } from '@/lib/dates';
import type { AppNotification, Appointment } from '@/types/models';

/** Derive the initial notification feed from recent appointment history (last 3 days). */
export function buildNotifications(appointments: Appointment[]): AppNotification[] {
  const since = DEMO_NOW.getTime() - 3 * 86_400_000;
  const out: AppNotification[] = [];
  for (const a of appointments) {
    for (const e of a.history) {
      const t = new Date(e.at).getTime();
      if (t < since || t > DEMO_NOW.getTime()) continue;
      const type: AppNotification['type'] | null =
        e.type === 'created' ? (a.status === 'draft' ? 'request' : 'new_booking') : e.type === 'confirmed' ? 'confirmed' : e.type === 'cancelled' ? 'cancelled' : e.type === 'rescheduled' && a.status === 'rescheduled' ? 'rescheduled' : e.type === 'no_show' ? 'no_show' : e.type === 'expired' ? 'link_expired' : e.type === 'reminder_sent' ? 'reminder' : null;
      if (!type) continue;
      out.push({ id: `nt_${e.id}`, type, at: e.at, read: t < DEMO_NOW.getTime() - 75 * 60_000, appointmentId: a.id, customerId: a.customerId, barberId: a.barberId });
    }
  }
  // "Starting soon" alerts for the next hour.
  for (const a of appointments) {
    const start = new Date(a.start);
    if (start > DEMO_NOW && start <= addMinutes(DEMO_NOW, 60) && (a.status === 'confirmed' || a.status === 'pending')) {
      out.push({ id: `nt_up_${a.id}`, type: 'upcoming', at: addMinutes(start, -30) > DEMO_NOW ? DEMO_NOW.toISOString() : addMinutes(start, -30).toISOString(), read: false, appointmentId: a.id, customerId: a.customerId, barberId: a.barberId });
    }
  }
  return out.sort((x, y) => y.at.localeCompare(x.at)).slice(0, 60);
}
