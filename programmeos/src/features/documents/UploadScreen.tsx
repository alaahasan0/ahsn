import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Banner, Button, Card, ChoiceGrid, DocumentPage, FileIcon, Icon, ListGroup, ListRow, ProgressBar, Screen, Section, SelectField, Skeleton, StepIndicator, SuccessState, Text, TextField, Touchable, toneColors, useToast, type IconName } from '@/components';
import type { DocumentKind, DocumentRecord } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { fontFor, useTheme } from '@/theme';
import { DEMO_TODAY } from '@/utils/dates';
import { fileSize, newId } from '@/utils/format';

type Field = { label: string; value: string; confidence: number };
type Sample = {
  key: string;
  file: string;
  format: DocumentRecord['format'];
  sizeKb: number;
  pages: number;
  kind: DocumentKind;
  title: string;
  summary: string;
  programmeId: string;
  match: string;
  related: Related;
  fields: Field[];
};
type Related = 'finance' | 'faculty' | 'travel' | 'learners' | 'none';

const SAMPLES: Sample[] = [
  {
    key: 'invoice', file: 'Creekside_Grand_Invoice_4471.pdf', format: 'PDF', sizeKb: 98, pages: 1, kind: 'Invoice',
    title: 'Creekside Grand — Room Block Invoice', summary: 'Supplier invoice for the ELP room block deposit.', programmeId: 'p-elp', match: 'Matched by group code MER-ELP27 and hotel name', related: 'finance',
    fields: [
      { label: 'Supplier', value: 'Creekside Grand Hotel', confidence: 98 },
      { label: 'Invoice number', value: 'CGH-INV-4471', confidence: 97 },
      { label: 'Amount', value: '$28,350.00', confidence: 95 },
      { label: 'Due date', value: '1 Apr 2027', confidence: 92 },
      { label: 'Group code', value: 'MER-ELP27', confidence: 88 },
      { label: 'VAT', value: '5%', confidence: 64 },
    ],
  },
  {
    key: 'agreement', file: 'Faculty_Agreement_Sharma_AI4BL.pdf', format: 'PDF', sizeKb: 412, pages: 6, kind: 'Agreement',
    title: 'Faculty Agreement — Prof. Aditi Sharma (AI4BL)', summary: 'Lead faculty agreement for AI for Business Leaders.', programmeId: 'p-ai', match: 'Matched by faculty name and programme title', related: 'faculty',
    fields: [
      { label: 'Faculty', value: 'Prof. Aditi Sharma', confidence: 97 },
      { label: 'Programme', value: 'AI for Business Leaders', confidence: 93 },
      { label: 'Days', value: '4', confidence: 90 },
      { label: 'Daily fee', value: '$5,600', confidence: 95 },
      { label: 'Term', value: '1 Apr – 30 Jun 2027', confidence: 78 },
      { label: 'Signature', value: 'Not signed', confidence: 66 },
    ],
  },
  {
    key: 'itinerary', file: 'EK004_Itinerary_Vasquez.pdf', format: 'PDF', sizeKb: 122, pages: 2, kind: 'Itinerary',
    title: 'Flight Itinerary — Prof. Vasquez (EK 004)', summary: 'London Heathrow to Dubai, business class.', programmeId: 'p-elp', match: 'Matched by passenger name and travel dates', related: 'travel',
    fields: [
      { label: 'Passenger', value: 'Elena Vasquez', confidence: 99 },
      { label: 'Flight', value: 'EK 004', confidence: 98 },
      { label: 'Route', value: 'LHR → DXB', confidence: 97 },
      { label: 'Departure', value: '9 Apr 2027, 21:55', confidence: 94 },
      { label: 'PNR', value: 'QZ8K2L', confidence: 85 },
      { label: 'Fare class', value: 'Business (J)', confidence: 79 },
    ],
  },
  {
    key: 'participants', file: 'NPSI_Nominations_PSL.xlsx', format: 'XLSX', sizeKb: 34, pages: 1, kind: 'Participant List',
    title: 'NPSI Nominations — Public Sector Leadership', summary: 'Nomination list received from NPSI.', programmeId: 'p-psl', match: 'Matched by client (NPSI) and programme name in sheet title', related: 'learners',
    fields: [
      { label: 'Rows detected', value: '14 nominees', confidence: 96 },
      { label: 'Columns', value: 'Name, Title, Department, Email', confidence: 92 },
      { label: 'Missing emails', value: '2 rows', confidence: 71 },
      { label: 'Possible duplicates', value: '1 row', confidence: 68 },
    ],
  },
];

const STEPS = ['Choose file', 'Processing', 'Review', 'Link', 'Done'];
const PROCESS: { label: string; icon: IconName }[] = [
  { label: 'Uploading securely', icon: 'cloud-upload' },
  { label: 'Reading document', icon: 'scan-text' },
  { label: 'Extracting fields', icon: 'sparkles' },
  { label: 'Matching to programme records', icon: 'link-2' },
];

function confidenceTone(c: number) {
  return c >= 90 ? 'success' : c >= 75 ? 'accent' : 'warning';
}

export default function UploadScreen() {
  const params = useLocalSearchParams<{ programme?: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { userId } = useSession();
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [sample, setSample] = useState<Sample | null>(null);
  const [progress, setProgress] = useState(0);
  const [fields, setFields] = useState<Field[]>([]);
  const [title, setTitle] = useState('');
  const [programmeId, setProgrammeId] = useState<string | undefined>(params.programme);
  const [related, setRelated] = useState<Related>('none');
  const [faculty, setFaculty] = useState(false);
  const [learners, setLearners] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const choose = (s: Sample) => {
    setSample(s);
    setFields(s.fields.map((f) => ({ ...f })));
    setTitle(s.title);
    setProgrammeId(params.programme ?? s.programmeId);
    setRelated(s.related);
    setProgress(0);
    setStep(1);
  };

  useEffect(() => {
    if (step !== 1) return;
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + 4;
        if (next >= 100) {
          clearInterval(t);
          setTimeout(() => setStep(2), 350);
          return 100;
        }
        return next;
      });
    }, 70);
    return () => clearInterval(t);
  }, [step]);

  const save = () => {
    if (!sample) return;
    const id = newId('d');
    const lowConfidence = fields.some((f) => f.confidence < 75);
    const doc: DocumentRecord = {
      id,
      title: title.trim() || sample.title,
      kind: sample.kind,
      format: sample.format,
      programmeId,
      facultyId: sample.key === 'agreement' ? 'f-sharma' : sample.key === 'itinerary' ? 'f-vasquez' : undefined,
      clientId: sample.key === 'participants' ? 'c-npsi' : undefined,
      uploadedBy: userId,
      uploadedOn: DEMO_TODAY,
      sizeKb: sample.sizeKb,
      pages: sample.pages,
      version: 'v1',
      status: lowConfidence ? 'Under Review' : 'Final',
      summary: sample.summary,
      extracted: fields.map((f) => ({ label: f.label, value: f.value })),
      visibleToFaculty: faculty,
      visibleToLearners: learners,
      tags: [sample.kind, related === 'none' ? 'Unlinked' : related[0].toUpperCase() + related.slice(1)],
    };
    actions.add('documents', doc);
    if (programmeId) actions.log(programmeId, 'document_uploaded', `uploaded ${doc.title} via Document Intelligence`);
    setCreatedId(id);
    setStep(4);
    toast.show({ message: 'Document saved', detail: getProgramme(db, programmeId)?.name ?? 'Not linked to a programme', icon: 'file-check' });
  };

  const reset = () => {
    setStep(0);
    setSample(null);
    setCreatedId(null);
  };

  const footer =
    step === 2 ? (
      <>
        <Button title="Back" variant="secondary" onPress={reset} style={{ flex: 1 }} />
        <Button title="Looks right" iconRight="arrow-right" onPress={() => setStep(3)} style={{ flex: 2 }} />
      </>
    ) : step === 3 ? (
      <>
        <Button title="Back" variant="secondary" onPress={() => setStep(2)} style={{ flex: 1 }} />
        <Button title="Save document" icon="file-check" onPress={save} style={{ flex: 2 }} disabled={title.trim().length < 3} />
      </>
    ) : undefined;

  return (
    <Screen title="Upload document" subtitle={step === 0 ? 'ProgrammeOS reads the document, extracts the key details and links it to the right programme.' : undefined} back="close" headerBelow={step < 4 ? <StepIndicator steps={STEPS} current={step} /> : undefined} footer={footer}>
      {step === 0 ? (
        <>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SourceTile icon="folder-open" label="Choose file" detail="PDF, Word, Excel, images" onPress={() => choose(SAMPLES[0])} />
            <SourceTile icon="camera" label="Scan" detail="Use the camera" onPress={() => choose(SAMPLES[2])} />
          </View>
          <Section title="Recent files" subtitle="Sample files for this prototype — nothing is uploaded">
            <ListGroup>
              {SAMPLES.map((s) => (
                <ListRow key={s.key} leading={<FileIcon format={s.format} size={40} />} title={s.file} subtitle={`${s.kind} · ${fileSize(s.sizeKb)} · ${s.pages} page${s.pages === 1 ? '' : 's'}`} onPress={() => choose(s)} />
              ))}
            </ListGroup>
          </Section>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, paddingHorizontal: 4 }}>
            <Icon name="shield-check" size={15} tone="tertiary" />
            <Text variant="footnote" tone="tertiary" style={{ flex: 1 }}>
              In production, files are encrypted and processed within Emeritus’ tenancy. This prototype simulates extraction only.
            </Text>
          </View>
        </>
      ) : null}

      {step === 1 && sample ? (
        <View style={{ gap: 16 }}>
          <Card padding="md" style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <FileIcon format={sample.format} size={44} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="headline" numberOfLines={1}>
                {sample.file}
              </Text>
              <Text variant="footnote" tone="secondary">
                {fileSize(sample.sizeKb)}
              </Text>
            </View>
            <Text variant="headline" tabular tone="accent">
              {progress}%
            </Text>
          </Card>
          <ProgressBar value={progress} animated={false} />
          <Card padding="md" style={{ gap: 14 }}>
            {PROCESS.map((p, i) => {
              const threshold = (i + 1) * 25;
              const done = progress >= threshold;
              const active = !done && progress >= i * 25;
              return (
                <View key={p.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? colors.successSoft : active ? colors.accentSoft : colors.surfaceAlt }}>
                    <Icon name={done ? 'check' : p.icon} size={15} color={done ? colors.success : active ? colors.accent : colors.textTertiary} strokeWidth={done ? 2.6 : 2} />
                  </View>
                  <Text variant="bodyStrong" tone={done || active ? 'primary' : 'tertiary'} style={{ flex: 1 }}>
                    {p.label}
                  </Text>
                  {active ? (
                    <Text variant="footnote" tone="accent">
                      Working…
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </Card>
          <Card padding="md" style={{ gap: 10 }}>
            <Skeleton width="55%" height={12} />
            <Skeleton width="90%" height={10} />
            <Skeleton width="80%" height={10} />
            <Skeleton width="65%" height={10} />
          </Card>
        </View>
      ) : null}

      {step === 2 && sample ? (
        <>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '62%', maxWidth: 260 }}>
              <DocumentPage title={sample.title} format={sample.format} subtitle={sample.summary} compact lines={sample.format === 'XLSX' ? 4 : 6} />
            </View>
          </View>
          {fields.some((f) => f.confidence < 75) ? <Banner tone="warning" title="Please check highlighted fields" message="Low-confidence values are marked below. Tap a value to correct it." style={{ marginTop: 16 }} /> : <Banner tone="success" title="All fields extracted with high confidence" style={{ marginTop: 16 }} />}
          <Section title="Extracted information" subtitle={`${sample.kind} · ${fields.length} fields`}>
            <ListGroup>
              {fields.map((f, i) => {
                const tc = toneColors(confidenceTone(f.confidence), colors);
                return (
                  <View key={f.label} style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 4, backgroundColor: f.confidence < 75 ? colors.warningSoft : undefined }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
                        {f.label}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tc.solid }} />
                        <Text variant="caption" color={tc.fg}>
                          {f.confidence}%{f.confidence < 75 ? ' · check' : ''}
                        </Text>
                      </View>
                    </View>
                    <TextInput
                      value={f.value}
                      onChangeText={(v) => setFields((list) => list.map((x, j) => (j === i ? { ...x, value: v, confidence: 100 } : x)))}
                      accessibilityLabel={f.label}
                      style={[fontFor('medium'), { fontSize: 15, color: colors.text, paddingVertical: 2, outlineStyle: 'none' } as never]}
                    />
                  </View>
                );
              })}
            </ListGroup>
            <Text variant="footnote" tone="tertiary">
              Edited values are marked as verified (100%).
            </Text>
          </Section>
        </>
      ) : null}

      {step === 3 && sample ? (
        <View style={{ gap: 16 }}>
          <TextField label="Document title" value={title} onChangeText={setTitle} required />
          {programmeId === sample.programmeId ? <Banner tone="accent" icon="sparkles" title={`Suggested: ${getProgramme(db, sample.programmeId)?.name}`} message={sample.match} /> : null}
          <SelectField label="Link to programme" value={programmeId} options={db.programmes.filter((p) => !p.cancelled).map((p) => ({ value: p.id, label: p.name, detail: p.code }))} onChange={setProgrammeId} icon="layers" />
          <ChoiceGrid
            label="Related record"
            value={related}
            onChange={setRelated}
            options={[
              { value: 'finance', label: 'Finance', detail: 'Invoice, PO or payment', icon: 'wallet' },
              { value: 'faculty', label: 'Faculty', detail: 'Agreement or fee', icon: 'users' },
              { value: 'travel', label: 'Travel', detail: 'Itinerary or booking', icon: 'plane' },
              { value: 'learners', label: 'Learners', detail: 'Participant list', icon: 'graduation-cap' },
            ]}
          />
          <ListGroup>
            <ListRow title="Visible to faculty" switchValue={faculty} onSwitch={setFaculty} />
            <ListRow title="Visible to learners" switchValue={learners} onSwitch={setLearners} />
          </ListGroup>
          <Card variant="alt" padding="sm" style={{ flexDirection: 'row', gap: 8 }}>
            <Icon name="info" size={15} tone="secondary" />
            <Text variant="footnote" tone="secondary" style={{ flex: 1 }}>
              {related === 'finance' ? 'Finance will see this invoice in the programme’s transactions for reconciliation.' : related === 'faculty' ? 'The faculty profile and contract status will reference this document.' : related === 'travel' ? 'The traveller’s itinerary will link to this document.' : related === 'learners' ? 'You can import these rows from Learners → Import once reviewed.' : 'Choose a related record to make this document easier to find.'}
            </Text>
          </Card>
        </View>
      ) : null}

      {step === 4 ? (
        <>
          <SuccessState title="Document saved" message={`${title} is ${programmeId ? `linked to ${getProgramme(db, programmeId)?.shortName}` : 'saved to the library'} with ${fields.length} extracted fields.`} />
          <View style={{ gap: 10 }}>
            <Button title="View document" icon="file-text" onPress={() => { router.dismiss(); if (createdId) setTimeout(() => router.push(`/document/${createdId}`), 50); }} fullWidth />
            <Button title="Upload another" variant="secondary" icon="upload" onPress={reset} fullWidth />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function SourceTile({ icon, label, detail, onPress }: { icon: IconName; label: string; detail: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Touchable onPress={onPress} feedback="scale" accessibilityLabel={label} style={{ flex: 1, padding: 16, gap: 8, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.borderStrong, backgroundColor: colors.surface, alignItems: 'flex-start' }}>
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={19} tone="accent" />
      </View>
      <Text variant="headline">{label}</Text>
      <Text variant="footnote" tone="secondary">
        {detail}
      </Text>
    </Touchable>
  );
}

