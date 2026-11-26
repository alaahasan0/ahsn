import { useEffect, useRef, useState } from 'react';

import { useSession } from '@/data/session';

const seen = new Set<string>();

/**
 * Simulates network latency for list screens so loading skeletons and error states can be
 * reviewed. The first visit to a screen shows a short skeleton; when "Simulate slow loading"
 * is on, it is longer every time; when "Simulate errors" is on, the load fails until retried.
 */
export function useSimulatedLoad(key: string) {
  const { simulateSlowLoading, simulateErrors } = useSession();
  const first = !seen.has(key);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(first || simulateSlowLoading ? 'loading' : simulateErrors ? 'error' : 'ready');
  const attempt = useRef(0);

  const run = () => {
    setState('loading');
    const delay = simulateSlowLoading ? 1800 : 450;
    const t = setTimeout(() => {
      seen.add(key);
      const fail = simulateErrors && attempt.current === 0;
      attempt.current += 1;
      setState(fail ? 'error' : 'ready');
    }, delay);
    return () => clearTimeout(t);
  };

  useEffect(() => {
    if (state === 'loading') return run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading: state === 'loading', error: state === 'error', retry: run };
}
