import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Card, Chip, ChipRow, Icon, Monogram, NoFilterResults, NoResults, Screen, SearchField, StatusPill, Text } from '@/components';
import type { ClientType } from '@/data/models';
import { getStaff, programmePhase } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { canAccess, canSeeFinancials } from '@/navigation/access';
import { moneyCompact, searchMatch } from '@/utils/format';

import { LoadGate, RequireAccess } from '../shared/Widgets';

export const CLIENT_TYPE_ICON: Record<ClientType, 'briefcase' | 'landmark' | 'graduation-cap' | 'building'> = {
  Corporate: 'briefcase',
  Government: 'landmark',
  University: 'graduation-cap',
  Institutional: 'building',
};

export default function ClientsScreen() {
  const db = useDB();
  const { role } = useSession();
  const [q, setQ] = useState('');
  const [type, setType] = useState<ClientType | undefined>();
  const types = [...new Set(db.clients.map((c) => c.type))];
  const byType = db.clients.filter((c) => !type || c.type === type);
  const list = byType.filter((c) => searchMatch(q, c.name, c.sector, c.headquarters, c.type));

  return (
    <Screen
      title="Clients"
      subtitle="Corporate, government and academic partners"
      refreshable
      headerBelow={
        !canAccess(role, 'clients') ? undefined : <>
          <SearchField value={q} onChangeText={setQ} placeholder="Search clients or sectors" />
          <ChipRow>
            <Chip label="All" selected={!type} onPress={() => setType(undefined)} count={db.clients.length} />
            {types.map((t) => (
              <Chip key={t} label={t} icon={CLIENT_TYPE_ICON[t]} selected={type === t} onPress={() => setType(type === t ? undefined : t)} />
            ))}
          </ChipRow>
        </>
      }>
      <RequireAccess module="clients">
        <LoadGate loadKey="clients">
          {!byType.length ? (
            <NoFilterResults onReset={() => setType(undefined)} />
          ) : !list.length ? (
            <NoResults query={q} onClear={() => setQ('')} />
          ) : (
            <View style={{ gap: 10 }}>
              {list.map((c) => {
                const progs = db.programmes.filter((p) => p.clientId === c.id);
                const active = progs.filter((p) => !p.archived && !p.cancelled && ['upcoming', 'in_delivery'].includes(programmePhase(p))).length;
                const owner = getStaff(db, c.relationshipOwnerId);
                const open = db.clientRequests.filter((r) => r.clientId === c.id && r.status !== 'Resolved').length;
                return (
                  <Card key={c.id} onPress={() => router.push(`/client/${c.id}`)} accessibilityLabel={`${c.name}, ${c.type}`}>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <Monogram name={c.name} hue={c.logoHue} size={46} />
                      <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                        <Text variant="headline" numberOfLines={2}>
                          {c.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <Icon name={CLIENT_TYPE_ICON[c.type]} size={12} tone="tertiary" />
                          <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
                            {c.type} · {c.sector}
                          </Text>
                        </View>
                        <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                          {c.headquarters} · since {c.since} · {owner?.name}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }}>
                      <Meta icon="layers" text={`${active} active · ${progs.length} total`} />
                      <Meta icon="star" text={c.satisfaction.toFixed(1)} />
                      {canSeeFinancials(role) ? <Meta icon="banknote" text={moneyCompact(c.lifetimeValue)} /> : null}
                      <View style={{ flex: 1 }} />
                      {open ? <StatusPill label={`${open} open`} tone="warning" /> : <StatusPill label={c.status} />}
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </LoadGate>
      </RequireAccess>
    </Screen>
  );
}

function Meta({ icon, text }: { icon: 'layers' | 'star' | 'banknote'; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name={icon} size={13} tone="tertiary" />
      <Text variant="footnote" tone="secondary">
        {text}
      </Text>
    </View>
  );
}
