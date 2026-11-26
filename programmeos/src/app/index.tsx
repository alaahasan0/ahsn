import { Redirect } from 'expo-router';

import { homeRouteFor, useSession } from '@/data/session';

export default function Index() {
  const { hydrated, signedIn, mode } = useSession();
  if (!hydrated) return null;
  return <Redirect href={signedIn ? homeRouteFor(mode) : '/welcome'} />;
}
