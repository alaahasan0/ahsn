import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import {
  ActionSheet,
  Avatar,
  Banner,
  Button,
  Card,
  DocumentPage,
  EmptyState,
  HeaderActions,
  Icon,
  IconButton,
  KeyValue,
  Screen,
  Section,
  SegmentedField,
  Sheet,
  StatusPill,
  Text,
  TextField,
  Touchable,
  useDialog,
  useToast,
} from '@/components';
import type { MaterialStatus, MaterialVersion } from '@/data/models';
import { facultyName, getFaculty, getProgramme, getSession, getStaff, personHue, personName } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { fontFor, useTheme } from '@/theme';
import { activityStamp, dueLabel, formatDate } from '@/utils/dates';
import { fileSize } from '@/utils/format';

import { VersionStageTag } from './shared';

export default function MaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { userId } = useSession();
  const { colors } = useTheme();
  const [comment, setComment] = useState('');
  const [menu, setMenu] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [stage, setStage] = useState<MaterialVersion['stage']>('Revised');
  const [note, setNote] = useState('');
  const m = db.materials.find((x) => x.id === id);

  if (!m) {
    return (
      <Screen title="Material">
        <EmptyState icon="file-search" title="Material not found" actionLabel="Back to academics" onAction={() => router.replace('/academics')} />
      </Screen>
    );
  }

  const p = getProgramme(db, m.programmeId);
  const mod = db.modules.find((x) => x.id === m.moduleId);
  const session = getSession(db, m.sessionId);
  const owner = getFaculty(db, m.ownerFacultyId);
  const reviewer = getStaff(db, m.reviewerId);
  const latest = m.versions[m.versions.length - 1];
  const due = dueLabel(m.dueDate);
  const overdue = !['Approved', 'Published'].includes(m.status) && due.tone === 'danger';
  const pendingApproval = db.approvals.find((a) => a.status === 'Pending' && a.relatedRoute === `/material/${m.id}`);

  const setStatus = (status: MaterialStatus, text?: string, message?: string) => {
    if (pendingApproval && (status === 'Approved' || status === 'Changes Requested')) {
      actions.decideApproval(pendingApproval.id, status, text);
      if (text) actions.setMaterialStatus(m.id, status, text);
    } else {
      actions.setMaterialStatus(m.id, status, text);
    }
    actions.log(m.programmeId, status === 'Approved' || status === 'Published' ? 'material_approved' : 'status_changed', `${status === 'Published' ? 'published' : status === 'Approved' ? 'approved' : `set to ${status.toLowerCase()}`} “${m.title}”`);
    toast.show({ message: message ?? status, detail: m.title, actionLabel: 'Undo', onAction: () => actions.setMaterialStatus(m.id, m.status) });
  };

  const approve = async () => {
    const { confirmed } = await dialog.confirm({ title: 'Approve material?', message: `${latest ? `${latest.label} (${latest.stage})` : 'Current version'} of “${m.title}” will be marked approved for print and portal.`, confirmLabel: 'Approve', icon: 'badge-check', tone: 'success' });
    if (confirmed) {
      setStatus('Approved', undefined, 'Material approved');
      if (owner) actions.notify({ category: 'Approvals', title: 'Materials approved', body: `“${m.title}” was approved by ${personName(db, userId)}.`, audience: 'faculty', programmeId: m.programmeId, route: '/fm/materials' });
    }
  };
  const requestChanges = async () => {
    const { confirmed, text } = await dialog.confirm({ title: 'Request changes', message: `${facultyName(owner)} will be notified with your comments.`, confirmLabel: 'Send request', icon: 'pencil', tone: 'warning', input: { placeholder: 'What needs to change?', required: true } });
    if (confirmed) setStatus('Changes Requested', text, 'Changes requested');
  };
  const publish = async () => {
    const { confirmed } = await dialog.confirm({ title: 'Publish to learners?', message: `Participants on ${p?.shortName} will see this in their materials library.`, confirmLabel: 'Publish', icon: 'send', tone: 'accent' });
    if (confirmed) setStatus('Published', undefined, 'Published to learners');
  };
  const addVersion = () => {
    actions.addMaterialVersion(m.id, stage, note.trim() || `${stage} version uploaded`, personName(db, userId));
    actions.log(m.programmeId, 'material_uploaded', `uploaded ${stage.toLowerCase()} version of “${m.title}”`);
    setVersionOpen(false);
    setNote('');
    toast.show({ message: `v${m.versions.length + 1} uploaded`, detail: `${stage} · ${m.title}`, icon: 'upload' });
  };
  const send = () => {
    if (!comment.trim()) return;
    actions.setMaterialStatus(m.id, m.status, comment.trim());
    setComment('');
    toast.show({ message: 'Comment added', tone: 'neutral', icon: 'message-square' });
  };

  const primary = (() => {
    switch (m.status) {
      case 'Not Submitted':
        return (
          <>
            <Button title="Send reminder" variant="secondary" icon="send" onPress={() => { actions.notify({ category: 'Tasks', title: 'Material reminder', body: `Please submit “${m.title}” (due ${formatDate(m.dueDate)}).`, audience: 'faculty', programmeId: m.programmeId, route: '/fm/materials' }); toast.show({ message: 'Reminder sent', detail: facultyName(owner), icon: 'send' }); }} style={{ flex: 1 }} />
            <Button title="Upload for faculty" icon="upload" onPress={() => { setStage('Draft'); setVersionOpen(true); }} style={{ flex: 1 }} />
          </>
        );
      case 'Draft':
      case 'Submitted':
        return (
          <>
            <Button title="Request changes" variant="secondary" onPress={requestChanges} style={{ flex: 1 }} />
            <Button title="Start review" icon="eye" onPress={() => setStatus('Under Review', undefined, 'Review started')} style={{ flex: 1 }} />
          </>
        );
      case 'Under Review':
        return (
          <>
            <Button title="Request changes" variant="secondary" onPress={requestChanges} style={{ flex: 1 }} />
            <Button title="Approve" icon="badge-check" onPress={approve} style={{ flex: 1 }} />
          </>
        );
      case 'Changes Requested':
        return <Button title="Upload revised version" icon="upload" onPress={() => { setStage('Revised'); setVersionOpen(true); }} style={{ flex: 1 }} />;
      case 'Approved':
        return <Button title="Publish to learners" icon="send" onPress={publish} style={{ flex: 1 }} />;
      default:
        return <Button title="Unpublish" variant="secondary" onPress={() => setStatus('Approved', undefined, 'Removed from learner portal')} style={{ flex: 1 }} />;
    }
  })();

  return (
    <Screen
      title={m.title}
      eyebrow={`${p?.shortName} · ${m.kind}`}
      footer={primary}
      headerRight={
        <HeaderActions>
          <IconButton icon="ellipsis" accessibilityLabel="More actions" onPress={() => setMenu(true)} />
        </HeaderActions>
      }>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <StatusPill label={m.status} size="md" />
        {m.learnerVisible ? <StatusPill label="Visible to learners" tone="violet" icon="eye" /> : null}
        {overdue ? <StatusPill label={due.text} tone="danger" icon="clock" /> : null}
      </View>

      {pendingApproval ? <Banner tone="warning" icon="stamp" style={{ marginBottom: 14 }} title="Academic approval requested" message={`Requested by ${personName(db, pendingApproval.requestedBy)} · due ${formatDate(pendingApproval.dueDate, { year: false })}`} /> : null}

      {m.versions.length ? (
        <View style={{ paddingHorizontal: m.format === 'PPTX' ? 0 : 32 }}>
          <DocumentPage title={m.title} format={m.format} subtitle={`${p?.name} · ${mod?.title}`} />
          <Text variant="footnote" tone="tertiary" align="center" style={{ marginTop: 8 }}>
            {latest?.label} · {latest?.stage} · {latest?.pages ? `${latest.pages} pages · ` : ''}
            {latest ? fileSize(latest.sizeKb) : ''}
          </Text>
        </View>
      ) : (
        <Card variant="outline" style={{ alignItems: 'center', gap: 8, paddingVertical: 28, borderStyle: 'dashed' }}>
          <Icon name="file-clock" size={28} tone="tertiary" />
          <Text variant="headline">Not submitted yet</Text>
          <Text variant="subhead" tone="secondary" align="center">
            {facultyName(owner)} · due {formatDate(m.dueDate)}
          </Text>
        </Card>
      )}

      <Section title="Details">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue label="Programme" value={p?.name ?? ''} icon="layers" onPress={() => router.push(`/programme/${m.programmeId}`)} />
          <KeyValue label="Module" value={mod?.title ?? '—'} icon="book-open" onPress={mod ? () => router.push(`/module/${mod.id}`) : undefined} />
          {session ? <KeyValue label="Session" value={session.title} icon="calendar" onPress={() => router.push(`/session/${session.id}`)} /> : null}
          <KeyValue label="Author" value={facultyName(owner)} icon="user-round" onPress={() => router.push(`/faculty/${m.ownerFacultyId}`)} />
          <KeyValue label="Reviewer" value={reviewer?.name ?? '—'} icon="user-check" />
          <KeyValue label="Due" value={formatDate(m.dueDate)} icon="clock" valueTone={overdue ? 'danger' : 'primary'} />
          <KeyValue label="Format" value={m.format} icon="file-text" last />
        </Card>
      </Section>

      <Section title="Version history" subtitle="Draft, Final and Revised versions are kept side by side" action="Upload" onAction={() => setVersionOpen(true)}>
        {m.versions.length ? (
          <Card padding="none">
            {[...m.versions].reverse().map((v, i, arr) => (
              <View key={v.id} style={{ flexDirection: 'row', gap: 12, padding: 14, borderBottomWidth: i < arr.length - 1 ? 0.5 : 0, borderBottomColor: colors.separator }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: i === 0 ? colors.accentSoft : colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="label" weight="semibold" tone={i === 0 ? 'accent' : 'secondary'}>
                    {v.label}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <VersionStageTag stage={v.stage} />
                    {i === 0 ? <StatusPill label="Current" tone="accent" dot={false} /> : null}
                  </View>
                  <Text variant="callout">{v.note}</Text>
                  <Text variant="footnote" tone="tertiary">
                    {v.authorName} · {formatDate(v.date)} · {fileSize(v.sizeKb)}
                  </Text>
                </View>
                <Touchable onPress={() => toast.show({ message: `Downloading ${v.label}`, detail: 'Simulated — no file transferred.', icon: 'download', tone: 'neutral' })} accessibilityLabel={`Download ${v.label}`} hitSlop={10}>
                  <Icon name="download" size={18} tone="tertiary" />
                </Touchable>
              </View>
            ))}
          </Card>
        ) : (
          <EmptyState icon="history" title="No versions yet" compact />
        )}
      </Section>

      <Section title="Review comments" subtitle={m.comments.length ? `${m.comments.length} comment${m.comments.length === 1 ? '' : 's'}` : undefined}>
        <Card style={{ gap: 14 }}>
          {m.comments.map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
              <Avatar name={personName(db, c.authorId)} hue={personHue(db, c.authorId)} size={30} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="footnote" tone="secondary">
                  <Text variant="footnote" weight="semibold">
                    {personName(db, c.authorId)}
                  </Text>
                  {`  ${activityStamp(c.date)}`}
                </Text>
                <Text variant="callout">{c.text}</Text>
              </View>
            </View>
          ))}
          {!m.comments.length ? (
            <Text variant="callout" tone="tertiary">
              No comments yet. Start the review conversation.
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 4 }}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Add a review comment…"
              placeholderTextColor={colors.textTertiary}
              multiline
              accessibilityLabel="Review comment"
              style={[fontFor('regular'), { flex: 1, minHeight: 40, maxHeight: 120, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.text, backgroundColor: colors.surfaceAlt }]}
            />
            <IconButton icon="send-horizontal" variant="primary" size={40} accessibilityLabel="Send comment" onPress={send} disabled={!comment.trim()} />
          </View>
        </Card>
      </Section>

      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title={m.title}
        actions={[
          { label: 'Upload new version', icon: 'upload', onPress: () => setVersionOpen(true) },
          { label: 'Download current version', icon: 'download', onPress: () => toast.show({ message: 'Download started', detail: 'Simulated', icon: 'download', tone: 'neutral' }), disabled: !m.versions.length },
          { label: 'Share with faculty', icon: 'share-2', onPress: () => toast.show({ message: 'Shared with faculty', detail: facultyName(owner), icon: 'share-2' }) },
          { label: m.learnerVisible ? 'Hide from learners' : 'Make visible to learners', icon: m.learnerVisible ? 'eye-off' : 'eye', onPress: () => { actions.update('materials', m.id, { learnerVisible: !m.learnerVisible }); toast.show({ message: m.learnerVisible ? 'Hidden from learners' : 'Visible to learners', tone: 'neutral' }); } },
        ]}
      />

      <Sheet visible={versionOpen} onClose={() => setVersionOpen(false)} title="Upload new version" subtitle={m.title} footer={<Button title={`Upload as v${m.versions.length + 1}`} icon="upload" onPress={addVersion} style={{ flex: 1 }} />}>
        <View style={{ gap: 14 }}>
          <Card variant="alt" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="file-up" size={22} tone="accent" />
            <View style={{ flex: 1 }}>
              <Text variant="headline" numberOfLines={1}>
                {m.title.replace(/[^A-Za-z0-9]+/g, '_').slice(0, 32)}_v{m.versions.length + 1}.{m.format.toLowerCase()}
              </Text>
              <Text variant="footnote" tone="secondary">
                Selected from Files (simulated)
              </Text>
            </View>
          </Card>
          <SegmentedField<MaterialVersion['stage']>
            label="Version type"
            value={stage}
            onChange={setStage}
            options={[
              { value: 'Draft', label: 'Draft' },
              { value: 'Final', label: 'Final' },
              { value: 'Revised', label: 'Revised' },
            ]}
          />
          <TextField label="What changed?" value={note} onChangeText={setNote} placeholder="e.g. Replaced US examples with GCC data" multiline />
        </View>
      </Sheet>
    </Screen>
  );
}
