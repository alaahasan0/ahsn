import { useMemo } from 'react';

import type { AvailabilityContext } from '@/store/availability';
import { useAvailabilityContext } from '@/store/selectors';

/** Availability as the public sees it: only barbers who accept online bookings. */
export function usePortalAvailability(): AvailabilityContext {
  const ctx = useAvailabilityContext();
  return useMemo(() => ({ ...ctx, barbers: ctx.barbers.filter((b) => b.acceptsOnline) }), [ctx]);
}
