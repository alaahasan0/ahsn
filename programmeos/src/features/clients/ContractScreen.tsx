import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, DocumentPage, EmptyState, Icon, KeyValue, ListGroup, ListRow, Monogram, ProgressBar, Screen, Section, StatusPill, Text, useToast } from '@/components';
import { getProgramme } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { canSeeFinancials } from '@/navigation/access';
import { useTheme } from '@/theme';
import { DEMO_TODAY, diffDays, formatDate, formatRange } from '@/utils/dates';
import { money } from '@/utils/format';

import { RequireAccess } from '../shared/Widgets';

export default function ContractScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const toast = useToast();
  const { role } = useSession();
  const { colors } = useTheme();
  const k = db.contracts.find((x) => x.id === id);

  if (!k) {
    return (
      <Screen title="Agreement">
        <EmptyState icon="file-signature" title="Agreement not found" actionLabel="All clients" onAction={() => router.replace('/clients')} />
      </Screen>
    );
  }

  const client = db.clients.find((c) => c.id === k.clientId);
  const doc = db.documents.find((d) => d.id === k.documentId);
  const progs = k.programmeIds.map((pid) => getProgramme(db, pid)).filter((p): p is NonNullable<typeof p> => !!p);
  const total = Math.max(1, diffDays(k.endDate, k.startDate));
  const elapsed = Math.min(100, Math.max(0, (diffDays(DEMO_TODAY, k.startDate) / total) * 100));
  const daysLeft = diffDays(k.endDate, DEMO_TODAY);
  const showMoney = canSeeFinancials(role);
  const utilised = progs.filter((p) => !p.cancelled).reduce((s, p) => s + p.contractValue, 0);

  return (
    <Screen title={k.title} eyebrow={k.reference} large>
      <RequireAccess module="clients">
        <Card padding="md" style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Monogram name={client?.name ?? ''} hue={client?.logoHue} size={42} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="headline" numberOfLines={1}>
                {client?.name}
              </Text>
              <Text variant="footnote" tone="secondary">
                {k.type}
              </Text>
            </View>
            <StatusPill label={k.status} size="md" />
          </View>
          {showMoney ? (
            <View style={{ gap: 2 }}>
              <Text variant="caption" tone="secondary">
                Contract value
              </Text>
              <Text variant="metricXL" numberOfLines={1} adjustsFontSizeToFit>
                {money(k.value)}
              </Text>
            </View>
          ) : null}
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="footnote" tone="secondary">
                {formatRange(k.startDate, k.endDate)}
              </Text>
              <Text variant="footnote" tone={daysLeft < 0 ? 'tertiary' : daysLeft < 60 ? 'warning' : 'secondary'}>
                {daysLeft < 0 ? 'Ended' : `${daysLeft} days remaining`}
              </Text>
            </View>
            <ProgressBar value={elapsed} color={colors.violet} />
          </View>
        </Card>

        <Section title="Terms">
          <Card padding="md" style={{ paddingVertical: 4 }}>
            <KeyValue label="Reference" value={k.reference} icon="hash" />
            <KeyValue label="Type" value={k.type} icon="file-signature" />
            <KeyValue label="Start" value={formatDate(k.startDate)} icon="calendar" />
            <KeyValue label="End" value={formatDate(k.endDate)} icon="calendar-x" />
            <KeyValue label="Signed" value={k.signedDate ? formatDate(k.signedDate) : 'Not yet signed'} icon="stamp" valueTone={k.signedDate ? 'primary' : 'warning'} />
            <KeyValue label="Payment terms" value={k.paymentTerms} icon="credit-card" multiline last={!showMoney} />
            {showMoney ? <KeyValue label="Drawn down" value={`${money(utilised)} of ${money(k.value)}`} icon="chart-pie" last /> : null}
          </Card>
        </Section>

        <Section title="Linked programmes">
          {progs.length ? (
            <ListGroup>
              {progs.map((p) => (
                <ListRow key={p.id} icon="layers" title={p.name} subtitle={`${p.code} · ${formatRange(p.startDate, p.endDate)}`} trailing={<StatusPill label={p.cancelled ? 'Cancelled' : p.status.delivery} />} onPress={() => router.push(`/programme/${p.id}`)} />
              ))}
            </ListGroup>
          ) : (
            <EmptyState icon="layers" title="No programmes linked" compact />
          )}
        </Section>

        <Section title="Document">
          {doc ? (
            <Card padding="md" onPress={() => router.push(`/document/${doc.id}`)} accessibilityLabel={`Open ${doc.title}`} style={{ gap: 12 }}>
              <View style={{ maxWidth: 240, alignSelf: 'center', width: '100%' }}>
                <DocumentPage title={doc.title} format={doc.format} subtitle={doc.summary} compact lines={6} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="file-text" size={16} tone="secondary" />
                <Text variant="callout" style={{ flex: 1 }} numberOfLines={1}>
                  {doc.title}
                </Text>
                <StatusPill label={doc.status} />
              </View>
            </Card>
          ) : (
            <Card padding="lg" style={{ alignItems: 'center', gap: 8 }}>
              <Icon name="file-plus" size={24} tone="tertiary" />
              <Text variant="headline">No signed copy attached</Text>
              <Button title="Upload document" variant="tinted" icon="upload" onPress={() => router.push('/document/upload')} />
            </Card>
          )}
        </Section>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <Button title="Share" variant="secondary" icon="share-2" onPress={() => toast.show({ message: 'Secure link copied', detail: 'Expires in 7 days (simulated)', icon: 'link-2' })} style={{ flex: 1 }} />
          <Button title="Client" variant="secondary" icon="briefcase" onPress={() => router.push(`/client/${k.clientId}`)} style={{ flex: 1 }} />
        </View>
      </RequireAccess>
    </Screen>
  );
}
