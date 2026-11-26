import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Checkbox, FileIcon, FormSection, Icon, ProgressBar, Screen, SelectField, SelectSheet, SuccessState, Text, TextField, Touchable } from '@/components';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { DEMO_TODAY, formatDate } from '@/utils/dates';
import { newId } from '@/utils/format';

import { useLearnerScope } from './data';

const FILES = [
  { name: 'Strategic_Audit_Retail_Banking_Team3.pdf', size: '1.8 MB', format: 'PDF' },
  { name: 'Strategic_Audit_Draft_v2.docx', size: '412 KB', format: 'DOCX' },
  { name: 'Simulation_Reflection_MAlKhatib.docx', size: '96 KB', format: 'DOCX' },
  { name: 'Execution_Priorities_Deck.pptx', size: '6.2 MB', format: 'PPTX' },
];

export default function LearnerSubmitScreen() {
  const params = useLocalSearchParams<{ assignment?: string }>();
  const db = useDB();
  const actions = useActions();
  const { colors } = useTheme();
  const scope = useLearnerScope();
  const open = scope.assignments.filter((a) => {
    const sub = scope.submissions.find((s) => s.assignmentId === a.id);
    return !sub || ['Not Started', 'Draft'].includes(sub.status);
  });
  const [assignmentId, setAssignmentId] = useState(params.assignment ?? open[0]?.id ?? '');
  const [file, setFile] = useState<(typeof FILES)[number] | null>(null);
  const [picker, setPicker] = useState(false);
  const [note, setNote] = useState('');
  const [own, setOwn] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const a = scope.assignments.find((x) => x.id === assignmentId);

  const submit = () => {
    setProgress(10);
    let p = 10;
    const t = setInterval(() => {
      p = Math.min(100, p + 30);
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        const existing = db.submissions.find((s) => s.assignmentId === assignmentId && s.learnerId === scope.me.id);
        if (existing) actions.update('submissions', existing.id, { status: 'Submitted', submittedOn: DEMO_TODAY });
        else actions.add('submissions', { id: newId('sb'), assignmentId, learnerId: scope.me.id, status: 'Submitted', submittedOn: DEMO_TODAY });
        setTimeout(() => setDone(true), 200);
      }
    }, 240);
  };

  if (done) {
    return (
      <Screen title="Submitted" back="close" large={false}>
        <SuccessState title="Assignment submitted" message={`${a?.title} was received on ${formatDate(DEMO_TODAY)}. You’ll be notified when it’s graded.`} actionLabel="Done" onAction={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Submit assignment"
      back="close"
      large={false}
      footer={<Button title={progress != null ? 'Submitting…' : 'Submit'} icon="send" size="lg" style={{ flex: 1 }} disabled={!file || !own || !a || progress != null} loading={progress != null && progress < 100} onPress={submit} />}>
      <FormSection title="Assignment">
        <SelectField label="Assignment" value={assignmentId} onChange={setAssignmentId} options={open.map((x) => ({ value: x.id, label: x.title, detail: `${x.kind} · due ${formatDate(x.dueDate, { year: false })}` }))} icon="notebook-pen" />
      </FormSection>
      <FormSection title="Your work">
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
              {progress != null ? <ProgressBar value={progress} animated={false} style={{ marginTop: 6 }} /> : null}
            </View>
            {progress == null ? (
              <Touchable onPress={() => setFile(null)} accessibilityLabel="Remove file" hitSlop={10}>
                <Icon name="x" size={18} tone="tertiary" />
              </Touchable>
            ) : null}
          </Card>
        ) : (
          <Touchable onPress={() => setPicker(true)} feedback="scale" accessibilityLabel="Attach your file" style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, borderRadius: 16, paddingVertical: 26, alignItems: 'center', gap: 8, backgroundColor: colors.surface }}>
            <Icon name="paperclip" size={26} tone="accent" />
            <Text variant="headline">Attach your file</Text>
            <Text variant="footnote" tone="secondary">
              PDF, Word or PowerPoint · up to 25 MB
            </Text>
          </Touchable>
        )}
        <TextField label="Comment for faculty (optional)" value={note} onChangeText={setNote} placeholder="Anything your marker should know" multiline />
      </FormSection>
      <FormSection>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          <Checkbox checked={own} onChange={setOwn} tone="accent" accessibilityLabel="Confirm academic integrity" />
          <Text variant="callout" tone="secondary" style={{ flex: 1 }}>
            {a?.kind === 'Group' ? 'This is our team’s own work and all sources are acknowledged.' : 'This is my own work and all sources are acknowledged.'}
          </Text>
        </View>
      </FormSection>
      <SelectSheet visible={picker} onClose={() => setPicker(false)} title="Choose a file" options={FILES.map((f) => ({ value: f.name, label: f.name, detail: `${f.size} · Files`, leading: <FileIcon format={f.format} size={32} /> }))} onSelect={(v) => setFile(FILES.find((f) => f.name === v) ?? null)} />
    </Screen>
  );
}
