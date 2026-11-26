import { useEffect, useState } from 'react';

import { useSession } from '@/data/session';

const seen = new Set<string>();

/**
 * Simulates network latency for list screens so loading skeletons and error states can be
 * reviewed. The first visit to a screen shows a short skeleton; when "Simulate slow loading"
 * is on, it is longer every time; when "Simulate errors" is on, the load fails until retried.
 */
export function useSimulatedLoad(key: string) {
  const { simulateSlowLoading, simulateErrors } = useSession();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(() => (!seen.has(key) || simulateSlowLoading || simulateErrors ? 'loading' : 'ready'));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (state !== 'loading') return;
    const t = setTimeout(
      () => {
        seen.add(key);
        setState(simulateErrors && attempt === 0 ? 'error' : 'ready');
      },
      simulateSlowLoading ? 1800 : 450,
    );
    return () => clearTimeout(t);
  }, [state, attempt, key, simulateErrors, simulateSlowLoading]);

  const retry = () => {
    setAttempt((a) => a + 1);
    setState('loading');
  };

  return { loading: state === 'loading', error: state === 'error', retry };
}
