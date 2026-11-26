import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, FileIcon, FormSection, Icon, ProgressBar, Screen, SegmentedField, SelectField, SelectSheet, SuccessState, Text, TextField, Touchable } from '@/components';
import type { Material, MaterialKind } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { DEMO_TODAY } from '@/utils/dates';
import { newId } from '@/utils/format';

import { useFacultyScope } from './data';

const DEVICE_FILES = [
  { name: 'PSL_Session_Outline_v1.docx', size: '84 KB', format: 'DOCX' },
  { name: 'Keynote_Leading_Disruption_v4.pptx', size: '12.4 MB', format: 'PPTX' },
  { name: 'Leading_Change_PreReading.pdf', size: '2.1 MB', format: 'PDF' },
  { name: 'Executive_Presence_Workbook.pdf', size: '3.8 MB', format: 'PDF' },
  { name: 'Case_Notes_Halden_Global.docx', size: '146 KB', format: 'DOCX' },
];

/** Faculty material upload — choose what it’s for, attach a file, add a note. */
export default function FacultyUploadScreen() {
  const params = useLocalSearchParams<{ material?: string; session?: string; programme?: string }>();
  const db = useDB();
  const actions = useActions();
  const { colors } = useTheme();
  const scope = useFacultyScope();
  const fromSession = params.session ? scope.materials.find((m) => m.sessionId === params.session) : undefined;
  const initial = params.material ?? fromSession?.id ?? (params.programme ? scope.materials.find((m) => m.programmeId === params.programme && m.status !== 'Published')?.id : undefined) ?? (params.programme ? 'new' : scope.materials.find((m) => m.status !== 'Published')?.id ?? 'new');
  const [target, setTarget] = useState<string>(initial);
  const [title, setTitle] = useState(params.programme === 'p-psl' ? 'Leading Through Ambiguity — Session Outline' : '');
  const [programmeId, setProgrammeId] = useState(params.programme ?? scope.programmeIds.find((id) => (getProgramme(db, id)?.endDate ?? '') >= DEMO_TODAY) ?? scope.programmeIds[0]);
  const [kind, setKind] = useState<MaterialKind>('Reading');
  const [file, setFile] = useState<(typeof DEVICE_FILES)[number] | null>(null);
  const [picker, setPicker] = useState(false);
  const [stage, setStage] = useState<'Draft' | 'Final' | 'Revised'>('Final');
  const [note, setNote] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const existing = scope.materials.find((m) => m.id === target);
  useEffect(() => {
    if (existing?.status === 'Changes Requested') setStage('Revised');
  }, [existing?.status]);

  const submit = () => {
    setProgress(8);
    let p = 8;
    const t = setInterval(() => {
      p = Math.min(100, p + 23);
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        const who = `${scope.me.honorific} ${scope.me.name}`;
        let materialTitle = existing?.title ?? title;
        let pid = existing?.programmeId ?? programmeId;
        if (existing) {
          actions.addMaterialVersion(existing.id, stage, note || `${stage} uploaded from Faculty Mode`, who);
        } else {
          const mod = db.modules.find((m) => m.programmeId === programmeId);
          const material: Material = {
            id: newId('mt'),
            programmeId,
            moduleId: mod?.id ?? '',
            title: title.trim(),
            kind,
            ownerFacultyId: scope.me.id,
            reviewerId: 's-priya',
            status: 'Submitted',
            dueDate: getProgramme(db, programmeId)?.startDate ?? DEMO_TODAY,
            format: (file?.format as Material['format']) ?? 'PDF',
            versions: [{ id: newId('mv'), label: 'v1', stage, date: DEMO_TODAY, authorName: who, note: note || 'Uploaded from Faculty Mode', sizeKb: 840, pages: 6 }],
            comments: [],
            learnerVisible: false,
          };
          actions.add('materials', material, { append: true });
          materialTitle = material.title;
          pid = material.programmeId;
        }
        actions.log(pid, 'material_uploaded', `uploaded “${materialTitle}” (${stage.toLowerCase()})`, scope.me.id);
        actions.notify({ category: 'Approvals', title: 'Material submitted for review', body: `${who} submitted “${materialTitle}”.`, audience: 'staff', programmeId: pid, route: '/academics', actorName: who });
        setTimeout(() => setDone(true), 250);
      }
    }, 260);
  };

  if (done) {
    return (
      <Screen title="Uploaded" back="close" large={false}>
        <SuccessState title="Sent for review" message="Dr. Priya Raman will review it — you’ll get a notification when it’s approved or if changes are needed." actionLabel="Done" onAction={() => router.back()} />
      </Screen>
    );
  }

  const options = [
    ...scope.materials.filter((m) => m.status !== 'Published').map((m) => ({ value: m.id, label: m.title, detail: `${getProgramme(db, m.programmeId)?.shortName} · ${m.status}`, icon: 'file-text' as const })),
    { value: 'new', label: 'Something new', detail: 'A new file not yet requested', icon: 'circle-plus' as const },
  ];
  const canSubmit = !!file && (existing || title.trim().length > 3) && progress == null;

  return (
    <Screen
      title="Upload material"
      back="close"
      large={false}
      footer={<Button title={progress != null ? 'Uploading…' : 'Submit for review'} icon="upload" disabled={!canSubmit} loading={progress != null && progress < 100} onPress={submit} style={{ flex: 1 }} size="lg" />}>
      <FormSection title="What is this for?">
        <SelectField label="Material" value={target} options={options} onChange={setTarget} icon="book-open" />
        {!existing ? (
          <>
            <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Session outline" required />
            <SelectField label="Programme" value={programmeId} onChange={setProgrammeId} options={scope.programmes.filter((p) => !p.archived).map((p) => ({ value: p.id, label: p.name }))} icon="layers" />
            <SelectField<MaterialKind> label="Type" value={kind} onChange={setKind} options={(['Presentation', 'Reading', 'Case Study', 'Workbook', 'Assignment'] as MaterialKind[]).map((k) => ({ value: k, label: k }))} />
          </>
        ) : existing.comments.length ? (
          <Card variant="alt" padding="sm">
            <Text variant="footnote" tone="secondary">
              Latest reviewer note: “{existing.comments[existing.comments.length - 1].text}”
            </Text>
          </Card>
        ) : null}
      </FormSection>

      <FormSection title="File">
        {file ? (
          <Card variant="outline" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <FileIcon format={file.format} size={40} />
            <View style={{ flex: 1 }}>
              <Text variant="headline" numberOfLines={1}>
                {file.name}
              </Text>
              <Text variant="footnote" tone="secondary">
                {file.size}
              </Text>
              {progress != null ? <ProgressBar value={progress} style={{ marginTop: 6 }} animated={false} /> : null}
            </View>
            {progress == null ? (
              <Touchable onPress={() => setFile(null)} accessibilityLabel="Remove file" hitSlop={10}>
                <Icon name="x" size={18} tone="tertiary" />
              </Touchable>
            ) : null}
          </Card>
        ) : (
          <Touchable onPress={() => setPicker(true)} feedback="scale" accessibilityLabel="Choose a file" style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, borderRadius: 16, paddingVertical: 28, alignItems: 'center', gap: 8, backgroundColor: colors.surface }}>
            <Icon name="cloud-upload" size={28} tone="accent" />
            <Text variant="headline">Choose a file</Text>
            <Text variant="footnote" tone="secondary">
              PDF, PowerPoint or Word · up to 50 MB
            </Text>
          </Touchable>
        )}
      </FormSection>

      <FormSection title="Version">
        <SegmentedField
          label="Stage"
          value={stage}
          onChange={setStage}
          options={[
            { value: 'Draft', label: 'Draft' },
            { value: 'Final', label: 'Final' },
            { value: 'Revised', label: 'Revised' },
          ]}
        />
        <TextField label="Note to reviewer" value={note} onChangeText={setNote} placeholder="What changed, anything to check…" multiline />
      </FormSection>

      <SelectSheet
        visible={picker}
        onClose={() => setPicker(false)}
        title="Recent files"
        options={DEVICE_FILES.map((f) => ({ value: f.name, label: f.name, detail: `${f.size} · iCloud Drive`, leading: <FileIcon format={f.format} size={32} /> }))}
        onSelect={(v) => setFile(DEVICE_FILES.find((f) => f.name === v) ?? null)}
      />
    </Screen>
  );
}
