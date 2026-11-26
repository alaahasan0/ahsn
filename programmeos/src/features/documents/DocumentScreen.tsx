import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ActionSheet, Button, Card, DocumentPage, EmptyState, HeaderActions, Icon, IconButton, KeyValue, ListGroup, ListRow, Screen, Section, SelectSheet, StatusPill, Tag, Text, useDialog, useToast } from '@/components';
import { facultyName, getClient, getFaculty, getProgramme, personName } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { DEMO_TODAY, formatDate } from '@/utils/dates';
import { fileSize } from '@/utils/format';

export default function DocumentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { colors } = useTheme();
  const [menu, setMenu] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const d = db.documents.find((x) => x.id === id);

  if (!d) {
    return (
      <Screen title="Document">
        <EmptyState icon="file-search" title="Document not found" message="It may have been deleted or moved." actionLabel="All documents" onAction={() => router.replace('/documents')} />
      </Screen>
    );
  }

  const prog = getProgramme(db, d.programmeId);
  const client = getClient(db, d.clientId);
  const fac = getFaculty(db, d.facultyId);
  const linkedTasks = db.tasks.filter((t) => t.attachmentIds.includes(d.id));

  const newVersion = () => {
    const n = Number(d.version.replace(/\D/g, '')) || 1;
    const next = `v${n + 1}`;
    actions.update('documents', d.id, { version: next, status: 'Under Review', uploadedOn: DEMO_TODAY });
    if (d.programmeId) actions.log(d.programmeId, 'document_uploaded', `uploaded ${d.title} ${next}`);
    toast.show({ message: `${next} uploaded`, detail: 'Previous version kept in history', icon: 'file-up' });
  };

  const remove = async () => {
    const { confirmed } = await dialog.confirm({ title: 'Delete this document?', message: 'It will be removed from the programme and any linked tasks. This can’t be undone in the prototype.', confirmLabel: 'Delete', destructive: true, icon: 'trash-2' });
    if (confirmed) {
      actions.remove('documents', d.id);
      toast.show({ message: 'Document deleted', detail: d.title, icon: 'trash-2', tone: 'neutral' });
      router.back();
    }
  };

  return (
    <Screen
      title={d.title}
      eyebrow={`${d.kind} · ${d.format}`}
      headerRight={
        <HeaderActions>
          <IconButton icon="ellipsis" accessibilityLabel="More actions" onPress={() => setMenu(true)} />
        </HeaderActions>
      }
      footer={
        <>
          <Button title="Share" variant="secondary" icon="share-2" onPress={() => toast.show({ message: 'Secure link copied', detail: 'Internal staff only · expires in 7 days', icon: 'link-2' })} style={{ flex: 1 }} />
          <Button title="Download" icon="download" onPress={() => toast.show({ message: 'Download started', detail: `${d.title}.${d.format.toLowerCase()} (simulated)`, icon: 'download' })} style={{ flex: 1 }} />
        </>
      }>
      <View style={{ alignItems: 'center', paddingVertical: 4 }}>
        <View style={{ width: d.format === 'PPTX' ? '100%' : '78%', maxWidth: 360 }}>
          <DocumentPage title={d.title} format={d.format} subtitle={d.summary} lines={10} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <StatusPill label={d.status} size="md" />
          <Text variant="footnote" tone="secondary">
            {d.version !== d.status ? `${d.version} · ` : ''}{d.pages} page{d.pages === 1 ? '' : 's'} · {fileSize(d.sizeKb)}
          </Text>
        </View>
      </View>

      <Section title="Summary">
        <Card padding="md">
          <Text variant="callout">{d.summary}</Text>
          {d.tags.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {d.tags.map((t) => (
                <Tag key={t} label={t} icon="tag" />
              ))}
            </View>
          ) : null}
        </Card>
      </Section>

      {d.extracted?.length ? (
        <Section title="Extracted information" subtitle="Read by Document Intelligence · reviewed">
          <Card padding="md" style={{ paddingVertical: 4 }}>
            {d.extracted.map((e, i) => (
              <KeyValue key={e.label} label={e.label} value={e.value} icon="sparkle" last={i === d.extracted!.length - 1} />
            ))}
          </Card>
        </Section>
      ) : null}

      <Section title="Details">
        <Card padding="md" style={{ paddingVertical: 4 }}>
          <KeyValue label="Type" value={d.kind} icon="file-text" />
          <KeyValue label="Format" value={d.format} icon="paperclip" />
          <KeyValue label="Version" value={d.version} icon="history" />
          <KeyValue label="Uploaded by" value={personName(db, d.uploadedBy)} icon="user" />
          <KeyValue label="Uploaded" value={formatDate(d.uploadedOn)} icon="calendar" last />
        </Card>
      </Section>

      <Section title="Linked records">
        {prog || client || fac || linkedTasks.length ? (
          <ListGroup>
            {prog ? <ListRow icon="layers" title={prog.name} subtitle={`Programme · ${prog.code}`} onPress={() => router.push(`/programme/${prog.id}`)} /> : null}
            {client ? <ListRow icon="briefcase" iconTone="violet" title={client.name} subtitle="Client" onPress={() => router.push(`/client/${client.id}`)} /> : null}
            {fac ? <ListRow icon="users" iconTone="warning" title={facultyName(fac)} subtitle="Faculty" onPress={() => router.push(`/faculty/${fac.id}`)} /> : null}
            {linkedTasks.map((t) => (
              <ListRow key={t.id} icon="square-check-big" iconTone="info" title={t.title} subtitle="Attached to task" trailing={<StatusPill label={t.status} />} onPress={() => router.push(`/task/${t.id}`)} />
            ))}
          </ListGroup>
        ) : (
          <Card padding="md" style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="link-2" size={18} tone="tertiary" />
            <Text tone="secondary" style={{ flex: 1 }}>
              Not linked to a programme yet.
            </Text>
          </Card>
        )}
      </Section>

      <Section title="Visibility" subtitle="Internal staff can always see programme documents">
        <ListGroup>
          <ListRow icon="users" iconTone="warning" title="Visible to faculty" subtitle="Appears in Faculty Mode for assigned faculty" switchValue={!!d.visibleToFaculty} onSwitch={(v) => { actions.update('documents', d.id, { visibleToFaculty: v }); toast.show({ message: v ? 'Shared with faculty' : 'Hidden from faculty', icon: v ? 'eye' : 'eye-off', tone: 'neutral' }); }} />
          <ListRow icon="graduation-cap" iconTone="success" title="Visible to learners" subtitle="Appears in Learner Mode materials" switchValue={!!d.visibleToLearners} onSwitch={(v) => { actions.update('documents', d.id, { visibleToLearners: v }); toast.show({ message: v ? 'Shared with learners' : 'Hidden from learners', icon: v ? 'eye' : 'eye-off', tone: 'neutral' }); }} />
        </ListGroup>
        {d.visibleToLearners && d.kind === 'Contract' ? (
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: colors.warningSoft }}>
            <Icon name="shield-alert" size={16} tone="warning" />
            <Text variant="footnote" tone="warning" style={{ flex: 1 }}>
              Contracts usually contain commercial terms — check before sharing with learners.
            </Text>
          </View>
        ) : null}
      </Section>

      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title={d.title}
        actions={[
          { label: 'Upload new version', icon: 'file-up', onPress: newVersion },
          { label: 'Mark as final', icon: 'badge-check', onPress: () => { actions.update('documents', d.id, { status: 'Final' }); toast.show({ message: 'Marked as final', icon: 'badge-check' }); }, disabled: d.status === 'Final' || d.status === 'Signed' },
          { label: prog ? 'Change linked programme' : 'Link to programme', icon: 'link-2', onPress: () => setLinkOpen(true) },
          { label: 'Delete document', icon: 'trash-2', destructive: true, onPress: remove },
        ]}
      />
      <SelectSheet
        visible={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Link to programme"
        value={d.programmeId}
        options={db.programmes.filter((p) => !p.cancelled).map((p) => ({ value: p.id, label: p.name, detail: p.code }))}
        onSelect={(pid) => {
          actions.update('documents', d.id, { programmeId: pid });
          actions.log(pid, 'document_uploaded', `linked ${d.title} to the programme`);
          toast.show({ message: 'Linked to programme', detail: getProgramme(db, pid)?.name, icon: 'link-2' });
        }}
      />
    </Screen>
  );
}
