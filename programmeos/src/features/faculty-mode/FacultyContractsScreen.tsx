import { router } from 'expo-router';
import { View } from 'react-native';

import { Banner, Button, Card, EmptyState, FileIcon, Icon, Screen, Section, StatusPill, Text, Touchable, useDialog, useToast, type Tone } from '@/components';
import type { FacultyAssignment } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { formatDate, formatRange } from '@/utils/dates';
import { money } from '@/utils/format';

import { useFacultyScope } from './data';

function contractState(a: FacultyAssignment): { label: string; tone: Tone; canSign: boolean } {
  switch (a.status) {
    case 'Contracted':
      return { label: 'Signed', tone: 'success', canSign: false };
    case 'Contract Issued':
    case 'Confirmed':
      return { label: 'Ready to sign', tone: 'warning', canSign: true };
    case 'Request Sent':
    case 'Proposed':
      return { label: 'Awaiting your acceptance', tone: 'neutral', canSign: false };
    default:
      return { label: a.status, tone: 'neutral', canSign: false };
  }
}

export default function FacultyContractsScreen() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const scope = useFacultyScope();
  const list = scope.assignments.filter((a) => a.status !== 'Declined').sort((a, b) => (getProgramme(db, b.programmeId)?.startDate ?? '').localeCompare(getProgramme(db, a.programmeId)?.startDate ?? ''));
  const toSign = list.filter((a) => contractState(a).canSign);

  const sign = async (a: FacultyAssignment) => {
    const p = getProgramme(db, a.programmeId)!;
    const { confirmed } = await dialog.confirm({ title: 'Sign agreement?', message: `${p.name} · ${a.role} · ${a.days} day${a.days === 1 ? '' : 's'} at ${money(a.fee / a.days)}/day. By signing you accept the Emeritus faculty terms.`, confirmLabel: 'Sign', icon: 'file-signature' });
    if (!confirmed) return;
    actions.setAssignmentStatus(a.id, 'Contracted');
    actions.log(a.programmeId, 'status_changed', `signed the faculty agreement for ${p.shortName}`, scope.me.id);
    actions.notify({ category: 'Faculty', title: 'Faculty agreement signed', body: `${scope.me.honorific} ${scope.me.name} signed the ${p.shortName} agreement.`, audience: 'staff', programmeId: p.id, route: `/programme/${p.id}/faculty` });
    toast.show({ message: 'Agreement signed', detail: 'A countersigned copy will appear in Documents.', icon: 'file-signature' });
  };

  return (
    <Screen title="Contracts" subtitle="Your agreements with Emeritus Education.">
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Icon name="shield-check" size={22} tone="success" />
        <View style={{ flex: 1 }}>
          <Text variant="headline">Faculty framework agreement</Text>
          <Text variant="footnote" tone="secondary">
            Status: {scope.me.contractStatus} · renews January 2028
          </Text>
        </View>
        <StatusPill label={scope.me.contractStatus} />
      </Card>
      {toSign.length ? <Banner tone="warning" title={`${toSign.length} agreement${toSign.length === 1 ? '' : 's'} ready to sign`} message="Sign so the programme team can book your travel." style={{ marginTop: 12 }} /> : null}
      <Section title="Programme agreements">
        {list.length ? (
          <View style={{ gap: 10 }}>
            {list.map((a) => {
              const p = getProgramme(db, a.programmeId)!;
              const st = contractState(a);
              const doc = scope.documents.find((d) => d.kind === 'Agreement' && d.programmeId === a.programmeId);
              return (
                <Card key={a.id} style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="headline">{p.name}</Text>
                      <Text variant="footnote" tone="secondary">
                        {formatRange(p.startDate, p.endDate)} · {a.role}
                      </Text>
                    </View>
                    <StatusPill label={st.label} tone={st.tone} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <Fig label="Days" value={`${a.days}`} />
                    <Fig label="Daily rate" value={money(a.fee / a.days)} />
                    <Fig label="Total fee" value={money(a.fee)} />
                  </View>
                  {doc ? (
                    <Touchable onPress={() => router.push('/fm/documents')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }} accessibilityLabel={doc.title}>
                      <FileIcon format={doc.format} size={32} />
                      <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
                        {doc.title} · {formatDate(doc.uploadedOn, { year: false })}
                      </Text>
                      <Icon name="chevron-right" size={16} tone="tertiary" />
                    </Touchable>
                  ) : null}
                  {st.canSign ? <Button title="Review & sign" icon="file-signature" size="sm" onPress={() => sign(a)} /> : null}
                  {a.status === 'Request Sent' ? <Button title="Respond to request" variant="secondary" size="sm" onPress={() => router.push(`/fm/programme/${p.id}`)} /> : null}
                </Card>
              );
            })}
          </View>
        ) : (
          <EmptyState icon="file-signature" title="No agreements" message="Agreements appear once you accept a teaching request." />
        )}
      </Section>
    </Screen>
  );
}

function Fig({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
      <Text variant="headline" tabular>
        {value}
      </Text>
    </View>
  );
}
