/** Shared domain vocabulary: statuses, sources, categories. */
const domain = {
  status: {
    draft: 'Draft',
    pending: 'Pending confirmation',
    pendingShort: 'Pending',
    confirmed: 'Confirmed',
    checked_in: 'Checked in',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No-show',
    rescheduled: 'Rescheduled',
    expired: 'Expired',
  },
  source: {
    phone: 'Phone call',
    whatsapp: 'WhatsApp',
    online: 'Online',
    walk_in: 'Walk-in',
    staff: 'Staff-created',
    recurring: 'Recurring',
    voice: 'Voice assistant',
  },
  sourceShort: {
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    online: 'Online',
    walk_in: 'Walk-in',
    staff: 'Staff',
    recurring: 'Recurring',
    voice: 'Voice',
  },
  category: {
    trusted: 'Trusted',
    regular: 'Regular',
    new: 'New',
  },
  categoryLong: {
    trusted: 'Trusted customer',
    regular: 'Regular customer',
    new: 'New customer',
  },
  categoryHint: {
    trusted: 'Reliable attendance. Can book without confirmation.',
    regular: 'Visits often with occasional changes.',
    new: 'First visits — confirmation recommended.',
  },
  categoryPrivacy: 'Internal salon classification. Never shown to customers.',
  role: {
    owner: 'Owner',
    manager: 'Manager',
    barber: 'Barber',
    receptionist: 'Receptionist',
  },
};
export default domain;
