import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Banner, Button, Card, FileIcon, Icon, ListGroup, ListRow, Screen, Section, SelectField, StepIndicator, SuccessState, Text, Touchable, useToast } from '@/components';
import type { Enrollment, Learner } from '@/data/models';
import { getProgramme, programmePhase } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { DEMO_TODAY, formatDate } from '@/utils/dates';
import { fileSize, newId } from '@/utils/format';

import { importFiles, type ImportRow } from './importData';

const STEPS = ['Choose file', 'Map columns', 'Validate', 'Import'];

/** Simulated CSV/Excel import with mapping and validation preview. No file is actually read. */
export default function ImportScreen() {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [fileId, setFileId] = useState<string>();
  const [programmeId, setProgrammeId] = useState<string>();
  const [analysing, setAnalysing] = useState(false);
  const [skipErrors, setSkipErrors] = useState(true);
  const [imported, setImported] = useState(0);

  const file = importFiles.find((f) => f.id === fileId);
  const prog = getProgramme(db, programmeId ?? file?.programmeId);
  const counts = { valid: file?.rows.filter((r) => r.status === 'valid').length ?? 0, warning: file?.rows.filter((r) => r.status === 'warning').length ?? 0, error: file?.rows.filter((r) => r.status === 'error').length ?? 0 };
  const toImport = file?.rows.filter((r) => r.status !== 'error') ?? [];

  const analyse = () => {
    setAnalysing(true);
    setTimeout(() => {
      setAnalysing(false);
      setStep(1);
    }, 1000);
  };

  const runImport = () => {
    if (!file || !prog) return;
    const cohortId = db.cohorts.find((c) => c.programmeId === prog.id)?.id;
    const status = file.programmeId === 'p-psl' ? 'Nominated' : 'Invited';
    toImport.forEach((r: ImportRow) => {
      const existing = db.learners.find((l) => l.email.toLowerCase() === r.email.toLowerCase());
      const id = existing?.id ?? newId('l');
      if (!existing) {
        const learner: Learner = { id, firstName: r.first, lastName: r.last, initials: `${r.first[0]}${r.last.replace(/^Al /, '')[0]}`.toUpperCase(), jobTitle: r.title, organisation: r.organisation, clientId: prog.clientId, country: prog.location.split(',').pop()?.trim() ?? '—', email: r.email, phone: r.phone, dietary: r.dietary, avatarHue: (r.row * 53) % 360 };
        actions.add('learners', learner, { append: true });
      }
      const waitlist = r.message?.includes('waitlisted');
      const enrolment: Enrollment = { id: newId('e'), learnerId: id, programmeId: prog.id, cohortId, status: waitlist ? 'Waitlisted' : status, nominatedBy: db.clientContacts.find((c) => c.clientId === prog.clientId && c.primary)?.name, nominatedOn: DEMO_TODAY, learningAccess: 'Not Issued', requiresHotel: prog.deliveryMode !== 'Virtual', requiresTravel: false, requirementsComplete: false };
      actions.add('enrollments', enrolment);
    });
    actions.log(prog.id, 'participant_registered', `imported ${toImport.length} participants from ${file.name}`);
    setImported(toImport.length);
    setStep(3);
    toast.show({ message: `${toImport.length} participants imported`, detail: prog.shortName });
  };

  const footer =
    step === 0 ? (
      <Button title={analysing ? 'Analysing…' : 'Analyse file'} icon="scan-text" onPress={analyse} loading={analysing} disabled={!fileId} style={{ flex: 1 }} />
    ) : step === 1 ? (
      <Button title="Validate rows" iconRight="arrow-right" onPress={() => setStep(2)} style={{ flex: 1 }} />
    ) : step === 2 ? (
      <Button title={`Import ${toImport.length} participants`} icon="import" onPress={runImport} disabled={!toImport.length} style={{ flex: 1 }} />
    ) : (
      <>
        <Button title="Done" variant="secondary" onPress={() => router.back()} style={{ flex: 1 }} />
        <Button
          title="View participants"
          onPress={() => {
            router.back();
            setTimeout(() => router.push(`/programme/${prog?.id}/participants`), 50);
          }}
          style={{ flex: 1 }}
        />
      </>
    );

  return (
    <Screen title="Import participants" back={step === 1 || step === 2 ? true : 'close'} onBack={step === 1 || step === 2 ? () => setStep(step - 1) : undefined} large={false} footer={footer}>
      <View style={{ paddingTop: 8 }}>
        <StepIndicator steps={STEPS} current={step} />
      </View>

      {step === 0 ? (
        <>
          <Section title="Choose a file" subtitle="Excel (.xlsx) or CSV — recent files from email and Downloads" first style={{ marginTop: 20 }}>
            <ListGroup>
              {importFiles.map((f) => {
                const sel = f.id === fileId;
                return (
                  <Touchable
                    key={f.id}
                    onPress={() => {
                      setFileId(f.id);
                      setProgrammeId(f.programmeId);
                    }}
                    feedback="highlight"
                    pressedStyle={{ backgroundColor: colors.surfacePressed }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: sel ? colors.accentSoft : undefined }}
                    accessibilityState={{ selected: sel }}
                    accessibilityLabel={f.name}>
                    <FileIcon format={f.format} size={40} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="bodyStrong" numberOfLines={1}>
                        {f.name}
                      </Text>
                      <Text variant="footnote" tone="secondary" numberOfLines={1}>
                        {f.source}
                      </Text>
                      <Text variant="footnote" tone="tertiary">
                        {fileSize(f.sizeKb)} · {f.rows.length} rows · {formatDate(f.modified, { year: false })}
                      </Text>
                    </View>
                    {sel ? <Icon name="circle-check" size={20} tone="accent" /> : null}
                  </Touchable>
                );
              })}
            </ListGroup>
            <Card variant="outline" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderStyle: 'dashed' }}>
              <Icon name="cloud-upload" size={22} tone="tertiary" />
              <View style={{ flex: 1 }}>
                <Text variant="headline">Browse files…</Text>
                <Text variant="footnote" tone="secondary">
                  File picking is simulated in this prototype.
                </Text>
              </View>
            </Card>
          </Section>
          {file ? (
            <Section title="Import into">
              <SelectField label="Programme" value={programmeId} onChange={setProgrammeId} icon="layers" options={db.programmes.filter((p) => !p.archived && !p.cancelled && programmePhase(p) !== 'completed').map((p) => ({ value: p.id, label: p.name, detail: p.code }))} />
            </Section>
          ) : null}
          {analysing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 20 }}>
              <ActivityIndicator color={colors.accent} />
              <Text tone="secondary">Reading columns and checking rows…</Text>
            </View>
          ) : null}
        </>
      ) : null}

      {step === 1 && file ? (
        <Animated.View entering={FadeIn.duration(250)}>
          <Section title="Column mapping" subtitle={`${file.columns.filter((c) => c.field).length} of ${file.columns.length} columns matched automatically`} first style={{ marginTop: 20 }}>
            <ListGroup>
              {file.columns.map((c) => (
                <View key={c.header} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyStrong" numberOfLines={1}>
                      {c.header}
                    </Text>
                    <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                      e.g. {c.sample}
                    </Text>
                  </View>
                  <Icon name="arrow-right" size={14} tone="tertiary" />
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text variant="callout" weight="medium" tone={c.field ? 'primary' : 'tertiary'} numberOfLines={1}>
                      {c.field ?? 'Ignore column'}
                    </Text>
                  </View>
                  <Icon name={c.field ? 'circle-check' : 'circle-dashed'} size={18} tone={c.field ? 'success' : 'tertiary'} />
                </View>
              ))}
            </ListGroup>
          </Section>
          <Banner tone="info" style={{ marginTop: 14 }} title="Person and enrolment are separate" message="Rows matching an existing learner (by email) are linked to that person; new people are created once and enrolled." />
        </Animated.View>
      ) : null}

      {step === 2 && file ? (
        <Animated.View entering={FadeIn.duration(250)}>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
            <Count label="Valid" value={counts.valid} tone="success" icon="circle-check" />
            <Count label="Warnings" value={counts.warning} tone="warning" icon="triangle-alert" />
            <Count label="Errors" value={counts.error} tone="danger" icon="circle-x" />
          </View>
          <Section title="Validation preview" subtitle={`${file.name} → ${prog?.shortName}`}>
            <ListGroup>
              {file.rows.map((r) => (
                <View key={r.row} style={{ flexDirection: 'row', gap: 12, padding: 14, opacity: r.status === 'error' && skipErrors ? 0.55 : 1 }}>
                  <Icon name={r.status === 'valid' ? 'circle-check' : r.status === 'warning' ? 'triangle-alert' : 'circle-x'} size={18} tone={r.status === 'valid' ? 'success' : r.status === 'warning' ? 'warning' : 'danger'} />
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                        {r.first} {r.last}
                      </Text>
                      <Text variant="caption" tone="tertiary">
                        Row {r.row}
                      </Text>
                    </View>
                    <Text variant="footnote" tone="secondary" numberOfLines={1}>
                      {r.title} · {r.organisation}
                    </Text>
                    <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                      {r.email}
                    </Text>
                    {r.message ? (
                      <Text variant="footnote" tone={r.status === 'error' ? 'danger' : 'warning'}>
                        {r.message}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </ListGroup>
          </Section>
          {counts.error ? (
            <ListGroup style={{ marginTop: 14 }}>
              <ListRow title="Skip rows with errors" subtitle="Fix them in the source file and import again later" switchValue={skipErrors} onSwitch={setSkipErrors} />
            </ListGroup>
          ) : null}
          {!skipErrors && counts.error ? <Banner tone="danger" style={{ marginTop: 12 }} title="Rows with errors can’t be imported" message="Errors are always skipped to protect data quality." /> : null}
        </Animated.View>
      ) : null}

      {step === 3 ? (
        <Animated.View entering={FadeIn.duration(300)}>
          <SuccessState title={`${imported} participants imported`} message={`Added to ${prog?.name} as ${file?.programmeId === 'p-psl' ? 'nominations awaiting review' : 'invitations'}. ${counts.error} row${counts.error === 1 ? '' : 's'} skipped.`} />
          <ListGroup>
            <ListRow icon="user-check" iconTone="warning" title="Review nominations" subtitle="Approve or decline each nominee" onPress={() => { router.back(); setTimeout(() => router.push('/learners/nominations'), 50); }} />
          </ListGroup>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

function Count({ label, value, tone, icon }: { label: string; value: number; tone: 'success' | 'warning' | 'danger'; icon: 'circle-check' | 'triangle-alert' | 'circle-x' }) {
  const { colors } = useTheme();
  const bg = tone === 'success' ? colors.successSoft : tone === 'warning' ? colors.warningSoft : colors.dangerSoft;
  return (
    <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: bg, gap: 4 }}>
      <Icon name={icon} size={16} tone={tone} />
      <Text variant="metricSm" tabular>
        {value}
      </Text>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}
