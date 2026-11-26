import { Redirect, router, usePathname } from 'expo-router';
import { Platform } from 'react-native';

import { EmptyState, Screen } from '@/components';

/** Unmatched routes. When the web preview is served from a file path (…/index.html), go home. */
export default function NotFound() {
  const pathname = usePathname();
  if (Platform.OS === 'web' && (/\.html?$/.test(pathname) || pathname.split('/').filter(Boolean).length > 3)) return <Redirect href="/" />;
  return (
    <Screen title="Not found">
      <EmptyState icon="circle-help" title="This screen doesn’t exist" message={`Nothing lives at ${pathname}. It may have moved.`} actionLabel="Go to Home" onAction={() => router.replace('/')} />
    </Screen>
  );
}
