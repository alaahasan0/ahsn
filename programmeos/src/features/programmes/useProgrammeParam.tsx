import { router, useLocalSearchParams } from 'expo-router';

import { EmptyState, Screen } from '@/components';
import { getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';

export function useProgrammeParam() {
  const { id, programmeId } = useLocalSearchParams<{ id?: string; programmeId?: string }>();
  const db = useDB();
  return getProgramme(db, id ?? programmeId);
}

export function ProgrammeNotFound() {
  return (
    <Screen title="Programme">
      <EmptyState icon="search" title="Programme not found" message="It may have been removed or you may not have access." actionLabel="All programmes" onAction={() => router.replace('/programmes')} />
    </Screen>
  );
}
