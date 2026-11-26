import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, FileIcon, FormSection, Icon, ListGroup, Screen, SegmentedField, SelectField, Text, TextField, Touchable, useToast, DateField } from '@/components';
import type { Material, MaterialKind, MaterialVersion } from '@/data/models';
import { facultyName, getFaculty } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { addDays, DEMO_TODAY, formatDate } from '@/utils/dates';
import { fileSize, newId } from '@/utils/format';

const KINDS: MaterialKind[] = ['Presentation', 'Reading', 'Case Study', 'Assignment', 'Assessment', 'Workbook', 'Video'];

const MOCK_FILES: { name: string; format: Material['format']; sizeKb: number; from: string }[] = [
  { name: 'Session_Slides_final.pptx', format: 'PPTX', sizeKb: 8420, from: 'iCloud Drive' },
  { name: 'Case_Study_draft.pdf', format: 'PDF', sizeKb: 1260, from: 'Downloads' },
  { name: 'Pre-reading_pack.pdf', format: 'PDF', sizeKb: 3310, from: 'Email attachment' },
  { name: 'Assignment_brief.docx', format: 'DOCX', sizeKb: 84, from: 'OneDrive' },
  { name: 'Financial_model.xlsx', format: 'XLSX', sizeKb: 220, from: 'Downloads' },
];

type Mode = 'new' | 'version';

export default function MaterialSubmitScreen() {
  const params = useLocalSearchParams<{ module?: string; material?: string; programme?: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { userId } = useSession();
  const { colors } = useTheme();
  const preMaterial = db.materials.find((m) => m.id === params.material);
  const preModule = db.modules.find((m) => m.id === (params.module ?? preMaterial?.moduleId));
  const [programmeId, setProgrammeId] = useState<string | undefined>(preModule?.programmeId ?? params.programme);
  const [moduleId, setModuleId] = useState<string | undefined>(preModule?.id);
  const [sessionId, setSessionId] = useState<string | undefined>(preMaterial?.sessionId);
  const [mode, setMode] = useState<Mode>(preMaterial ? 'version' : 'new');
  const [materialId, setMaterialId] = useState<string | undefined>(preMaterial?.id);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<MaterialKind>('Presentation');
  const [fileIdx, setFileIdx] = useState<number | null>(null);
  const [stage, setStage] = useState<MaterialVersion['stage']>('Draft');
  const [note, setNote] = useState('');
  const [due, setDue] = useState(addDays(DEMO_TODAY, 14));
  const [tried, setTried] = useState(false);

  const programmes = db.programmes.filter((p) => !p.archived && !p.cancelled && db.modules.some((m) => m.programmeId === p.id));
  const modules = db.modules.filter((m) => m.programmeId === programmeId).sort((a, b) => a.order - b.order);
  const mod = db.modules.find((m) => m.id === moduleId);
  const sessions = db.sessions.filter((s) => s.moduleId === moduleId);
  const existing = db.materials.filter((m) => m.moduleId === moduleId);
  const file = fileIdx != null ? MOCK_FILES[fileIdx] : undefined;
  const owner = getFaculty(db, mod?.leadFacultyId);

  const errors = {
    programme: !programmeId ? 'Choose a programme' : undefined,
    module: !moduleId ? 'Choose a module' : undefined,
    title: mode === 'new' && !title.trim() ? 'Give the material a title' : undefined,
    material: mode === 'version' && !materialId ? 'Choose a material' : undefined,
    file: !file ? 'Select a file' : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);

  const submit = () => {
    setTried(true);
    if (!valid || !mod || !file) return;
    const author = getFaculty(db, userId) ? facultyName(getFaculty(db, userId)) : db.staff.find((s) => s.id === userId)?.name ?? 'Emeritus staff';
    if (mode === 'version' && materialId) {
      actions.addMaterialVersion(materialId, stage, note.trim() || `${stage} version from ${file.name}`, author);
      actions.log(mod.programmeId, 'material_uploaded', `uploaded a ${stage.toLowerCase()} version of “${db.materials.find((m) => m.id === materialId)?.title}”`);
      toast.show({ message: 'New version submitted', detail: file.name, icon: 'upload', actionLabel: 'Open', onAction: () => router.push(`/material/${materialId}`) });
    } else {
      const id = newId('mt');
      const material: Material = {
        id,
        programmeId: mod.programmeId,
        moduleId: mod.id,
        sessionId,
        title: title.trim(),
        kind,
        ownerFacultyId: mod.leadFacultyId,
        reviewerId: 's-priya',
        status: stage === 'Draft' ? 'Draft' : 'Submitted',
        dueDate: due,
        format: file.format,
        versions: [{ id: newId('mv'), label: 'v1', stage, date: DEMO_TODAY, authorName: author, note: note.trim() || `Uploaded ${file.name}`, sizeKb: file.sizeKb, pages: 20 }],
        comments: [],
        learnerVisible: false,
      };
      actions.add('materials', material);
      actions.log(mod.programmeId, 'material_uploaded', `submitted “${material.title}” for review`);
      toast.show({ message: stage === 'Draft' ? 'Draft saved' : 'Submitted for review', detail: material.title, icon: 'upload', actionLabel: 'Open', onAction: () => router.push(`/material/${id}`) });
    }
    router.back();
  };

  return (
    <Screen title="Submit material" back="close" large={false} footer={<Button title={stage === 'Draft' && mode === 'new' ? 'Save draft' : 'Submit for review'} icon="upload" onPress={submit} disabled={tried && !valid} style={{ flex: 1 }} />}>
      <FormSection title="Where does it belong?">
        <SelectField label="Programme" value={programmeId} onChange={(v) => { setProgrammeId(v); setModuleId(undefined); setSessionId(undefined); setMaterialId(undefined); }} icon="layers" error={tried ? errors.programme : undefined} options={programmes.map((p) => ({ value: p.id, label: p.name, detail: p.code }))} />
        <SelectField label="Module" value={moduleId} onChange={(v) => { setModuleId(v); setSessionId(undefined); setMaterialId(undefined); }} icon="book-open" error={tried ? errors.module : undefined} placeholder={programmeId ? 'Select module' : 'Choose a programme first'} options={modules.map((m) => ({ value: m.id, label: `${m.order}. ${m.title}`, detail: facultyName(getFaculty(db, m.leadFacultyId)) }))} />
        {sessions.length ? <SelectField label="Session (optional)" value={sessionId} onChange={setSessionId} icon="calendar" options={sessions.map((s) => ({ value: s.id, label: s.title, detail: formatDate(s.date, { weekday: true }) }))} /> : null}
      </FormSection>

      {moduleId ? (
        <FormSection title="Material">
          {existing.length ? (
            <SegmentedField<Mode>
              label="Submitting"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'new', label: 'New material' },
                { value: 'version', label: 'New version' },
              ]}
            />
          ) : null}
          {mode === 'version' && existing.length ? (
            <SelectField label="Material" value={materialId} onChange={setMaterialId} icon="file-text" error={tried ? errors.material : undefined} options={existing.map((m) => ({ value: m.id, label: m.title, detail: `${m.status} · ${m.versions.length} version${m.versions.length === 1 ? '' : 's'}`, leading: <FileIcon format={m.format} size={28} /> }))} />
          ) : (
            <>
              <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Module 2 — Session Slides" required error={tried ? errors.title : undefined} />
              <SelectField label="Type" value={kind} onChange={setKind} icon="tag" options={KINDS.map((k) => ({ value: k, label: k }))} />
              <DateField label="Due date" value={due} onChange={setDue} minDate={DEMO_TODAY} />
            </>
          )}
          {owner ? (
            <Text variant="footnote" tone="tertiary">
              Author: {facultyName(owner)} · Reviewer: Dr. Priya Raman
            </Text>
          ) : null}
        </FormSection>
      ) : null}

      <FormSection title="File" footer="File selection is simulated — nothing is uploaded in this prototype.">
        <ListGroup>
          {MOCK_FILES.map((f, i) => {
            const sel = i === fileIdx;
            return (
              <Touchable key={f.name} onPress={() => setFileIdx(i)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: sel ? colors.accentSoft : undefined }} accessibilityState={{ selected: sel }} accessibilityLabel={f.name}>
                <FileIcon format={f.format} size={34} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {f.name}
                  </Text>
                  <Text variant="footnote" tone="tertiary">
                    {f.from} · {fileSize(f.sizeKb)}
                  </Text>
                </View>
                {sel ? <Icon name="circle-check" size={20} tone="accent" /> : null}
              </Touchable>
            );
          })}
        </ListGroup>
        {tried && errors.file ? (
          <Text variant="footnote" tone="danger">
            {errors.file}
          </Text>
        ) : null}
      </FormSection>

      <FormSection title="Version">
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
        <TextField label="Note for the reviewer" value={note} onChangeText={setNote} placeholder="What should the reviewer know?" multiline />
      </FormSection>
    </Screen>
  );
}
