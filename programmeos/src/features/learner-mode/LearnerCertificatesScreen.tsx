import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { LogoMark } from '@/components/brand/Logo';
import { Button, Card, EmptyState, Icon, ProgressBar, Screen, Section, StatusPill, Text, useToast } from '@/components';
import { getClient, getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { countdown, formatDateLong, formatRange } from '@/utils/dates';

import { useLearnerScope } from './data';

export default function LearnerCertificatesScreen() {
  const db = useDB();
  const { colors } = useTheme();
  const scope = useLearnerScope();
  const earned = scope.enrollments.filter((e) => e.certificateIssued);
  const pending = scope.enrollments.filter((e) => !e.certificateIssued && e.status !== 'Withdrawn');
  return (
    <Screen title="Certificates" subtitle="Your achievements with Emeritus Education.">
      <Section title="Earned" first>
        {earned.length ? (
          <View style={{ gap: 10 }}>
            {earned.map((e) => {
              const p = getProgramme(db, e.programmeId)!;
              return (
                <Card key={e.id} onPress={() => router.push(`/lm/certificate/${e.id}`)} padding="lg" style={{ gap: 10, borderWidth: 1, borderColor: colors.warning }} accessibilityLabel={`${p.name} certificate`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.warningSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="award" size={22} tone="warning" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="headline">{p.name}</Text>
                      <Text variant="footnote" tone="secondary">
                        Completed {formatDateLong(p.endDate)}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={18} tone="tertiary" />
                  </View>
                  <Text variant="caption" tone="tertiary">
                    Certificate ID {e.certificateId}
                  </Text>
                </Card>
              );
            })}
          </View>
        ) : (
          <EmptyState icon="award" title="No certificates yet" message="Complete your programme to earn your certificate." compact />
        )}
      </Section>
      {pending.length ? (
        <Section title="In progress">
          <View style={{ gap: 10 }}>
            {pending.map((e) => {
              const p = getProgramme(db, e.programmeId)!;
              const upcoming = p.startDate > '2027-03-29';
              return (
                <Card key={e.id} onPress={() => router.push(`/lm/certificate/${e.id}`)} style={{ gap: 10 }} accessibilityLabel={`${p.name} certificate locked`}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="lock" size={18} tone="tertiary" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="headline">{p.name}</Text>
                      <Text variant="footnote" tone="secondary">
                        {upcoming ? countdown(p.startDate) : `${e.progress ?? 0}% complete · unlocks after ${formatDateLong(p.endDate)}`}
                      </Text>
                    </View>
                  </View>
                  {!upcoming ? <ProgressBar value={e.progress ?? 0} color={colors.violet} /> : null}
                </Card>
              );
            })}
          </View>
        </Section>
      ) : null}
    </Screen>
  );
}

function Seal({ color }: { color: string }) {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64">
      <Path d="M32 2l7 6 9-2 3 9 9 3-2 9 6 7-6 7 2 9-9 3-3 9-9-2-7 6-7-6-9 2-3-9-9-3 2-9-6-7 6-7-2-9 9-3 3-9 9 2z" fill={color} opacity={0.9} />
      <Rect x="20" y="20" width="24" height="24" rx="12" fill="#FFFFFF" opacity={0.25} />
    </Svg>
  );
}

export function LearnerCertificateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const toast = useToast();
  const { colors, isDark } = useTheme();
  const scope = useLearnerScope();
  const e = scope.enrollments.find((x) => x.id === id);
  const p = getProgramme(db, e?.programmeId);
  if (!e || !p) {
    return (
      <Screen title="Certificate">
        <EmptyState icon="award" title="Certificate not found" />
      </Screen>
    );
  }
  const name = `${scope.me.firstName} ${scope.me.lastName}`;
  const partner = getClient(db, p.clientId)?.type === 'University' ? getClient(db, p.clientId)?.name : undefined;

  if (!e.certificateIssued) {
    const programmeAssignments = db.assignments.filter((x) => x.programmeId === p.id);
    const submittedCount = programmeAssignments.filter((x) => scope.submissions.some((s) => s.assignmentId === x.id && ['Submitted', 'Graded'].includes(s.status))).length;
    const req = [
      { label: 'Attendance of at least 80%', done: (e.attendanceRate ?? 0) >= 80, detail: `Currently ${e.attendanceRate ?? 0}%` },
      { label: 'All assignments submitted', done: submittedCount >= programmeAssignments.length, detail: `${submittedCount} of ${programmeAssignments.length} submitted` },
      { label: 'Capstone simulation completed', done: false, detail: `On ${formatRange(p.endDate, p.endDate)}` },
      { label: 'Programme evaluation', done: !!e.feedbackSubmitted, detail: 'Opens in the final week' },
    ];
    const upcoming = p.startDate > '2027-03-29';
    return (
      <Screen title="Certificate" eyebrow={p.name}>
        <Card padding="lg" style={{ alignItems: 'center', gap: 10 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="lock" size={26} tone="tertiary" />
          </View>
          <Text variant="title3" align="center">
            {upcoming ? 'Starts soon' : 'Unlocks when you complete the programme'}
          </Text>
          <Text variant="callout" tone="secondary" align="center">
            {upcoming ? `${p.name} begins ${formatDateLong(p.startDate)}.` : `You’re ${e.progress ?? 0}% of the way there.`}
          </Text>
          {!upcoming ? <ProgressBar value={e.progress ?? 0} color={colors.violet} style={{ alignSelf: 'stretch', marginTop: 4 }} /> : null}
        </Card>
        {!upcoming ? (
          <Section title="Requirements">
            <Card padding="sm" style={{ paddingHorizontal: 16 }}>
              {req.map((r, i) => (
                <View key={r.label} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 12, borderBottomWidth: i < req.length - 1 ? 0.5 : 0, borderBottomColor: colors.separator }}>
                  <Icon name={r.done ? 'circle-check' : 'circle-dashed'} size={20} tone={r.done ? 'success' : 'tertiary'} />
                  <View style={{ flex: 1 }}>
                    <Text variant="callout">{r.label}</Text>
                    <Text variant="footnote" tone="secondary">
                      {r.detail}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>
          </Section>
        ) : null}
      </Screen>
    );
  }

  const paper = isDark ? '#1B1F25' : '#FFFDF8';
  const gold = '#C9A24A';
  return (
    <Screen
      title="Certificate"
      eyebrow={p.name}
      footer={
        <>
          <Button title="Share to LinkedIn" icon="share-2" variant="secondary" style={{ flex: 1 }} onPress={() => toast.show({ message: 'Ready to share', detail: 'Simulated — adds the credential to your LinkedIn profile.', icon: 'share-2', tone: 'accent' })} />
          <Button title="Download PDF" icon="download" style={{ flex: 1 }} onPress={() => toast.show({ message: 'Certificate saved', detail: `${e.certificateId}.pdf`, icon: 'download' })} />
        </>
      }>
      <View style={{ backgroundColor: paper, borderRadius: 18, padding: 10, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } }} accessibilityLabel={`Certificate of completion for ${name}, ${p.name}`}>
        <View style={{ borderWidth: 1.5, borderColor: gold, borderRadius: 12, padding: 20, alignItems: 'center', gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LogoMark size={26} />
            <Text variant="overline" color={isDark ? '#E9D9AE' : '#7A5F1E'}>
              Emeritus Education{partner ? ` · ${partner}` : ''}
            </Text>
          </View>
          <Text variant="caption" tone="tertiary" style={{ marginTop: 10, letterSpacing: 2 }}>
            CERTIFICATE OF COMPLETION
          </Text>
          <Text variant="footnote" tone="secondary">
            This certifies that
          </Text>
          <Text style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.5 }} weight="bold" align="center">
            {name}
          </Text>
          <Text variant="footnote" tone="secondary" align="center">
            has successfully completed
          </Text>
          <Text variant="title3" align="center">
            {p.name}
          </Text>
          <Text variant="footnote" tone="secondary" align="center">
            {formatRange(p.startDate, p.endDate)} · {p.location.split(',').pop()?.trim()}
          </Text>
          <Seal color={gold} />
          <View style={{ flexDirection: 'row', alignSelf: 'stretch', gap: 16, marginTop: 4 }}>
            <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Text style={{ fontSize: 18, fontStyle: 'italic' }} tone="secondary">
                A. Grant
              </Text>
              <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: colors.borderStrong }} />
              <Text variant="caption" tone="tertiary" align="center">
                Associate Dean, Halden Business School
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
              <Text style={{ fontSize: 18, fontStyle: 'italic' }} tone="secondary">
                J. Whitfield
              </Text>
              <View style={{ height: 1, alignSelf: 'stretch', backgroundColor: colors.borderStrong }} />
              <Text variant="caption" tone="tertiary" align="center">
                Regional Director, Emeritus
              </Text>
            </View>
          </View>
          <Text variant="caption" tone="tertiary" style={{ marginTop: 8 }}>
            ID {e.certificateId} · verify at verify.emeritus.example
          </Text>
        </View>
      </View>
      <Section title="Achievement">
        <Card padding="sm" style={{ paddingHorizontal: 16, flexDirection: 'row' }}>
          <Metric label="Attendance" value={`${e.attendanceRate ?? 0}%`} />
          <Metric label="Final score" value={`${e.assessmentScore ?? '—'}`} />
          <Metric label="Status" value="Verified" pill />
        </Card>
      </Section>
    </Screen>
  );
}

function Metric({ label, value, pill }: { label: string; value: string; pill?: boolean }) {
  return (
    <View style={{ flex: 1, paddingVertical: 12, gap: 4 }}>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
      {pill ? <StatusPill label={value} tone="success" icon="badge-check" /> : <Text variant="headline" tabular>{value}</Text>}
    </View>
  );
}
