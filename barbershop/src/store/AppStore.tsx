/**
 * Local prototype store.
 *
 * Holds the mock salon in memory and exposes the *actions* screens call (create booking,
 * cancel, reschedule…). The action signatures are the contract future phases will implement
 * against Supabase / backend RPCs — the UI does not change, only this layer does.
 *
 * Nothing here talks to a network, sends messages, or persists bookings.
 */
import { createContext, useCallback, useContext, useMemo, useReducer, type PropsWithChildren } from 'react';

import { now } from '@/lib/clock';
import { addMinutes } from '@/lib/dates';
import { linkToken, uid } from '@/lib/id';
import * as mock from '@/mock';
import type {
  AppNotification,
  Appointment,
  AppointmentEvent,
  AppointmentStatus,
  Barber,
  BookingSource,
  CommunicationChannel,
  Customer,
  CustomerCategory,
  ID,
  MessageTemplate,
  RecurringSeries,
  Salon,
  Service,
  TimeBlock,
  User,
} from '@/types/models';

import { buildNotifications } from './notifications';

export interface AppState {
  salon: Salon;
  currentUser: User;
  users: User[];
  barbers: Barber[];
  services: Service[];
  customers: Customer[];
  appointments: Appointment[];
  recurring: RecurringSeries[];
  blocks: TimeBlock[];
  templates: MessageTemplate[];
  notifications: AppNotification[];
}

function initialState(): AppState {
  return {
    salon: mock.salon,
    currentUser: mock.currentOwner,
    users: mock.teamUsers,
    barbers: mock.barbers,
    services: mock.services,
    customers: mock.customers,
    appointments: mock.appointments,
    recurring: mock.recurringSeries,
    blocks: mock.timeBlocks,
    templates: mock.templates,
    notifications: buildNotifications(mock.appointments),
  };
}

type Action =
  | { type: 'appointment/upsert'; appointment: Appointment }
  | { type: 'appointment/patch'; id: ID; patch: Partial<Appointment>; event?: AppointmentEvent }
  | { type: 'customer/upsert'; customer: Customer }
  | { type: 'service/upsert'; service: Service }
  | { type: 'barber/upsert'; barber: Barber }
  | { type: 'recurring/upsert'; series: RecurringSeries }
  | { type: 'block/upsert'; block: TimeBlock }
  | { type: 'block/remove'; id: ID }
  | { type: 'template/upsert'; template: MessageTemplate }
  | { type: 'salon/patch'; patch: Partial<Salon> }
  | { type: 'notification/add'; notification: AppNotification }
  | { type: 'notification/read'; id: ID | 'all' }
  | { type: 'reset' };

const upsert = <T extends { id: ID }>(list: T[], item: T): T[] => {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const next = list.slice();
  next[idx] = item;
  return next;
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'appointment/upsert':
      return { ...state, appointments: upsert(state.appointments, action.appointment).sort((a, b) => a.start.localeCompare(b.start)) };
    case 'appointment/patch':
      return {
        ...state,
        appointments: state.appointments
          .map((a) => (a.id === action.id ? { ...a, ...action.patch, history: action.event ? [...a.history, action.event] : a.history } : a))
          .sort((a, b) => a.start.localeCompare(b.start)),
      };
    case 'customer/upsert':
      return { ...state, customers: upsert(state.customers, action.customer) };
    case 'service/upsert':
      return { ...state, services: upsert(state.services, action.service) };
    case 'barber/upsert':
      return { ...state, barbers: upsert(state.barbers, action.barber) };
    case 'recurring/upsert':
      return { ...state, recurring: upsert(state.recurring, action.series) };
    case 'block/upsert':
      return { ...state, blocks: upsert(state.blocks, action.block) };
    case 'block/remove':
      return { ...state, blocks: state.blocks.filter((b) => b.id !== action.id) };
    case 'template/upsert':
      return { ...state, templates: upsert(state.templates, action.template) };
    case 'salon/patch':
      return { ...state, salon: { ...state.salon, ...action.patch } };
    case 'notification/add':
      return { ...state, notifications: [action.notification, ...state.notifications] };
    case 'notification/read':
      return { ...state, notifications: state.notifications.map((n) => (action.id === 'all' || n.id === action.id ? { ...n, read: true } : n)) };
    case 'reset':
      return initialState();
    default:
      return state;
  }
}

export interface CreateAppointmentInput {
  customerId: ID;
  serviceId: ID;
  barberId: ID;
  start: Date;
  source: BookingSource;
  /** Send a booking-management link (simulated). */
  sendLink: boolean;
  linkChannel?: CommunicationChannel;
  note?: string;
  autoAssigned?: boolean;
  createdBy?: AppointmentEvent['actor'];
  /** Customer-portal bookings start as confirmed (customer chose the time themselves). */
  status?: AppointmentStatus;
  recurringId?: ID;
}

export interface AppActions {
  createAppointment: (input: CreateAppointmentInput) => Appointment;
  setAppointmentStatus: (id: ID, status: AppointmentStatus, opts?: { actor?: AppointmentEvent['actor']; reason?: string }) => void;
  rescheduleAppointment: (id: ID, start: Date, barberId?: ID, actor?: AppointmentEvent['actor']) => Appointment | undefined;
  addAppointmentNote: (id: ID, text: string) => void;
  resendConfirmation: (id: ID, channel?: CommunicationChannel) => void;
  upsertCustomer: (customer: Customer) => void;
  createCustomer: (input: Omit<Customer, 'id' | 'salonId' | 'createdAt'>) => Customer;
  setCustomerCategory: (id: ID, category: CustomerCategory) => void;
  upsertService: (service: Service) => void;
  createService: (input: Omit<Service, 'id' | 'salonId'>) => Service;
  upsertBarber: (barber: Barber) => void;
  createBarber: (input: Omit<Barber, 'id' | 'salonId'>) => Barber;
  upsertRecurring: (series: RecurringSeries) => void;
  createRecurring: (input: Omit<RecurringSeries, 'id' | 'salonId' | 'createdAt'>) => RecurringSeries;
  addBlock: (block: Omit<TimeBlock, 'id'>) => TimeBlock;
  removeBlock: (id: ID) => void;
  upsertTemplate: (template: MessageTemplate) => void;
  updateSalon: (patch: Partial<Salon>) => void;
  markNotificationRead: (id: ID | 'all') => void;
  resetDemo: () => void;
}

interface StoreValue {
  state: AppState;
  actions: AppActions;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const event = useCallback((type: AppointmentEvent['type'], actor: AppointmentEvent['actor'] = 'staff', detail?: string): AppointmentEvent => ({ id: uid('ev'), at: now().toISOString(), type, actor, detail }), []);

  const notify = useCallback((type: AppNotification['type'], appointment: Appointment) => {
    dispatch({ type: 'notification/add', notification: { id: uid('nt'), type, at: now().toISOString(), read: false, appointmentId: appointment.id, customerId: appointment.customerId, barberId: appointment.barberId } });
  }, []);

  const findAppointment = useCallback((id: ID) => state.appointments.find((a) => a.id === id), [state.appointments]);

  const actions = useMemo<AppActions>(() => {
    const createAppointment: AppActions['createAppointment'] = (input) => {
      const service = state.services.find((s) => s.id === input.serviceId)!;
      const createdAt = now();
      const history: AppointmentEvent[] = [event('created', input.createdBy ?? 'staff', input.source)];
      const appointment: Appointment = {
        id: uid('a'),
        salonId: state.salon.id,
        customerId: input.customerId,
        serviceId: input.serviceId,
        barberId: input.barberId,
        start: input.start.toISOString(),
        durationMin: service.durationMin,
        price: service.price,
        status: input.status ?? (input.sendLink ? 'pending' : 'confirmed'),
        source: input.source,
        createdAt: createdAt.toISOString(),
        createdBy: input.createdBy ?? 'staff',
        recurringId: input.recurringId,
        autoAssigned: input.autoAssigned,
        notes: input.note ? [{ id: uid('n'), at: createdAt.toISOString(), authorId: state.currentUser.id, text: input.note }] : [],
        history,
      };
      if (input.sendLink) {
        appointment.confirmation = {
          token: linkToken(),
          channel: input.linkChannel ?? 'whatsapp',
          sentAt: createdAt.toISOString(),
          expiresAt: addMinutes(createdAt, state.salon.confirmationLinkHours * 60).toISOString(),
        };
        history.push(event('link_sent', 'system', appointment.confirmation.channel));
      }
      dispatch({ type: 'appointment/upsert', appointment });
      notify('new_booking', appointment);
      return appointment;
    };

    const statusEvent: Partial<Record<AppointmentStatus, AppointmentEvent['type']>> = {
      confirmed: 'confirmed',
      checked_in: 'checked_in',
      completed: 'completed',
      cancelled: 'cancelled',
      no_show: 'no_show',
      expired: 'expired',
    };

    return {
      createAppointment,
      setAppointmentStatus: (id, status, opts) => {
        const appt = findAppointment(id);
        dispatch({
          type: 'appointment/patch',
          id,
          patch: { status, ...(status === 'cancelled' && opts?.reason ? { cancellationReason: opts.reason } : null) },
          event: event(statusEvent[status] ?? 'status', opts?.actor ?? 'staff', opts?.reason ?? status),
        });
        if (appt) {
          if (status === 'cancelled') notify('cancelled', appt);
          if (status === 'confirmed') notify('confirmed', appt);
          if (status === 'no_show') notify('no_show', appt);
        }
      },
      rescheduleAppointment: (id, start, barberId, actor = 'staff') => {
        const old = findAppointment(id);
        if (!old) return undefined;
        const replacement: Appointment = {
          ...old,
          id: uid('a'),
          start: start.toISOString(),
          barberId: barberId ?? old.barberId,
          status: actor === 'customer' ? 'confirmed' : old.status === 'pending' ? 'pending' : 'confirmed',
          rescheduledFromId: old.id,
          rescheduledToId: undefined,
          createdAt: now().toISOString(),
          notes: old.notes,
          history: [...old.history, event('rescheduled', actor, old.start)],
        };
        dispatch({ type: 'appointment/patch', id, patch: { status: 'rescheduled', rescheduledToId: replacement.id }, event: event('rescheduled', actor, replacement.start) });
        dispatch({ type: 'appointment/upsert', appointment: replacement });
        notify('rescheduled', replacement);
        return replacement;
      },
      addAppointmentNote: (id, text) => {
        const appt = findAppointment(id);
        if (!appt) return;
        const note = { id: uid('n'), at: now().toISOString(), authorId: state.currentUser.id, text };
        dispatch({ type: 'appointment/patch', id, patch: { notes: [...appt.notes, note] }, event: event('note', 'staff', text) });
      },
      resendConfirmation: (id, channel) => {
        const appt = findAppointment(id);
        if (!appt) return;
        const sentAt = now();
        const confirmation = {
          token: appt.confirmation?.token ?? linkToken(),
          channel: channel ?? appt.confirmation?.channel ?? 'whatsapp',
          sentAt: sentAt.toISOString(),
          expiresAt: addMinutes(sentAt, state.salon.confirmationLinkHours * 60).toISOString(),
        };
        dispatch({
          type: 'appointment/patch',
          id,
          patch: { confirmation, status: appt.status === 'expired' || appt.status === 'draft' ? 'pending' : appt.status },
          event: event('link_sent', 'staff', confirmation.channel),
        });
      },
      upsertCustomer: (customer) => dispatch({ type: 'customer/upsert', customer }),
      createCustomer: (input) => {
        const customer: Customer = { ...input, id: uid('c'), salonId: state.salon.id, createdAt: now().toISOString() };
        dispatch({ type: 'customer/upsert', customer });
        return customer;
      },
      setCustomerCategory: (id, category) => {
        const c = state.customers.find((x) => x.id === id);
        if (c) dispatch({ type: 'customer/upsert', customer: { ...c, category, categoryManual: true } });
      },
      upsertService: (service) => dispatch({ type: 'service/upsert', service }),
      createService: (input) => {
        const service: Service = { ...input, id: uid('s'), salonId: state.salon.id };
        dispatch({ type: 'service/upsert', service });
        return service;
      },
      upsertBarber: (barber) => dispatch({ type: 'barber/upsert', barber }),
      createBarber: (input) => {
        const barber: Barber = { ...input, id: uid('b'), salonId: state.salon.id };
        dispatch({ type: 'barber/upsert', barber });
        return barber;
      },
      upsertRecurring: (series) => dispatch({ type: 'recurring/upsert', series }),
      createRecurring: (input) => {
        const series: RecurringSeries = { ...input, id: uid('r'), salonId: state.salon.id, createdAt: now().toISOString() };
        dispatch({ type: 'recurring/upsert', series });
        return series;
      },
      addBlock: (input) => {
        const block: TimeBlock = { ...input, id: uid('tb') };
        dispatch({ type: 'block/upsert', block });
        return block;
      },
      removeBlock: (id) => dispatch({ type: 'block/remove', id }),
      upsertTemplate: (template) => dispatch({ type: 'template/upsert', template: { ...template, updatedAt: now().toISOString() } }),
      updateSalon: (patch) => dispatch({ type: 'salon/patch', patch }),
      markNotificationRead: (id) => dispatch({ type: 'notification/read', id }),
      resetDemo: () => dispatch({ type: 'reset' }),
    };
  }, [state, event, notify, findAppointment]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function useStoreContext() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}

/** Read the whole prototype state. Prefer the focused selector hooks in `src/store/selectors.ts`. */
export function useAppState(): AppState {
  return useStoreContext().state;
}

export function useActions(): AppActions {
  return useStoreContext().actions;
}
