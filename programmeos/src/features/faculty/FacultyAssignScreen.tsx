import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  Avatar,
  Banner,
  Button,
  Card,
  Checkbox,
  ChoiceGrid,
  Icon,
  ListGroup,
  ProgressBar,
  ProgressRing,
  Screen,
  SearchField,
  Section,
  StatusPill,
  StepIndicator,
  Text,
  Timeline,
  Touchable,
  useDialog,
  useToast,
} from '@/components';
import type { FacultyAssignment, ID } from '@/data/models';
import { facultyAvailability, facultyName, getFaculty, getProgramme, programmePhase, readinessFor } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { addDays, DEMO_TODAY, formatDate, formatRange, tzAbbr } from '@/utils/dates';
import { money, searchMatch } from '@/utils/format';

import { SESSION_KIND_ICON } from '../shared/helpers';
import { TaskRow } from '../shared/Rows';
import { Rating } from './components';

const STEPS = ['Select instructor', 'Programme & sessions', 'Availability check', 'Confirmation request', 'Faculty response', 'Follow-up tasks'];
const ROLES: FacultyAssignment['role'][] = ['Lead Faculty', 'Faculty', 'Guest Speaker', 'Coach'];

/** Workflow B — Faculty Assignment, end to end (simulated). */
export default function FacultyAssignScreen() {
  const params = useLocalSearchParams<{ faculty?: string; programme?: string; session?: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { colors } = useTheme();
  const [step, setStep] = useState(params.faculty ? 1 : 0);
  const [facultyId, setFacultyId] = useState<ID | undefined>(params.faculty);
  const [programmeId, setProgrammeId] = useState<ID | undefined>(params.programme);
  const [sessionIds, setSessionIds] = useState<ID[]>(params.session ? [params.session] : []);
  const [role, setRole] = useState<FacultyAssignment['role']>('Faculty');
  const [q, setQ] = useState('');
  const [assignmentId, setAssignmentId] = useState<ID>();
  const [taskIds, setTaskIds] = useState<ID[]>([]);
  const [readinessBefore, setReadinessBefore] = useState<number>();
  const [busy, setBusy] = useState(false);

  const fac = getFaculty(db, facultyId);
  const prog = getProgramme(db, programmeId);
  const progSessions = db.sessions.filter((s) => s.programmeId === programmeId && s.status !== 'Cancelled' && s.status !== 'Completed').sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  const chosen = progSessions.filter((s) => sessionIds.includes(s.id));
  const checks = fac ? chosen.map((s) => ({ session: s, ...facultyAvailability(db, fac.id, s.date, s.start, s.end, s.timeZone) })).map((c) => ({ ...c, clashes: c.clashes.filter((x) => x.id !== c.session.id) })).map((c) => ({ ...c, free: !c.clashes.length && !c.blocked.length })) : [];
  const rangeBlocks = fac && prog ? fac.unavailable.filter((u) => u.from <= prog.endDate && u.to >= prog.startDate) : [];
  const existing = db.facultyAssignments.find((a) => a.facultyId === facultyId && a.programmeId === programmeId && a.id !== assignmentId && a.status !== 'Declined');
  const conflictCount = checks.filter((c) => !c.free).length;
  const days = Math.max(1, new Set(chosen.flatMap((s) => (s.date === s.endDate ? [s.date] : [s.date, s.endDate]))).size);
  const fee = (fac?.dailyFee ?? 0) * days;
  const programmes = db.programmes.filter((p) => !p.archived && !p.cancelled && programmePhase(p) !== 'completed').sort((a, b) => a.startDate.localeCompare(b.startDate));
  const facultyList = db.faculty.filter((f) => searchMatch(q, f.name, f.title, ...f.expertise)).sort((a, b) => (a.availability === 'Available' ? -1 : 0) - (b.availability === 'Available' ? -1 : 0) || a.utilisation - b.utilisation);

  const sendRequest = async () => {
    if (!fac || !prog) return;
    if (conflictCount || rangeBlocks.length) {
      const { confirmed } = await dialog.confirm({ title: 'Send despite conflicts?', message: `${facultyName(fac)} has ${conflictCount + rangeBlocks.length} availability issue${conflictCount + rangeBlocks.length === 1 ? '' : 's'}. You can still request and resolve the schedule later.`, confirmLabel: 'Send anyway', tone: 'warning', icon: 'triangle-alert' });
      if (!confirmed) return;
    }
    setBusy(true);
    setReadinessBefore(readinessFor(db, prog.id).categories.find((c) => c.key === 'faculty')?.percent);
    setTimeout(() => {
      const id = actions.assignFaculty({ facultyId: fac.id, programmeId: prog.id, sessionIds, role, status: 'Request Sent', days, fee, requestedOn: DEMO_TODAY });
      actions.log(prog.id, 'faculty_assigned', `sent a teaching request to ${facultyName(fac)} (${role})`);
      setAssignmentId(id);
      setBusy(false);
      setStep(3);
      toast.show({ message: 'Confirmation request sent', detail: `${facultyName(fac)} · ${prog.shortName}`, icon: 'send' });
    }, 700);
  };

  const confirmParticipation = () => {
    if (!assignmentId || !fac || !prog) return;
    setBusy(true);
    setTimeout(() => {
      actions.setAssignmentStatus(assignmentId, 'Confirmed');
      actions.notify({ category: 'Faculty', title: 'Faculty confirmed', body: `${facultyName(fac)} confirmed ${prog.shortName} (${role}).`, audience: 'staff', programmeId: prog.id, route: `/faculty/${fac.id}` });
      actions.log(prog.id, 'faculty_assigned', `${facultyName(fac)} confirmed participation`, fac.id);
      setBusy(false);
      setStep(4);
    }, 900);
  };

  const generateTasks = () => {
    if (!fac || !prog) return;
    const last = fac.name.split(' ').slice(-1)[0];
    const due = (n: number) => (addDays(DEMO_TODAY, n) < prog.startDate ? addDays(DEMO_TODAY, n) : addDays(prog.startDate, -2));
    const ids = [
      actions.createTask({ title: `Issue faculty contract — ${fac.honorific} ${last}`, programmeId: prog.id, ownerId: 's-daniel', dueDate: due(3), priority: 'High', category: 'Faculty', description: `${role}, ${days} day${days === 1 ? '' : 's'} at ${money(fac.dailyFee)}/day (${money(fee)}).`, relatedPerson: { kind: 'faculty', id: fac.id } }),
      actions.createTask({ title: `Collect session materials from ${fac.honorific} ${last}`, programmeId: prog.id, ownerId: 's-priya', dueDate: due(14), priority: 'Medium', category: 'Academic', description: `Materials for ${chosen.map((s) => s.title).join(', ') || prog.name}.`, relatedPerson: { kind: 'faculty', id: fac.id } }),
      actions.createTask({ title: `Travel & hotel requirements — ${fac.honorific} ${last}`, programmeId: prog.id, ownerId: 's-sofia', dueDate: due(7), priority: prog.deliveryMode === 'Virtual' ? 'Low' : 'Medium', category: 'Logistics', description: prog.deliveryMode === 'Virtual' ? 'Virtual delivery — confirm home-studio set-up and tech rehearsal slot.' : `Flights from ${fac.preferredAirport} and accommodation near ${prog.location}.`, relatedPerson: { kind: 'faculty', id: fac.id } }),
    ];
    setTaskIds(ids);
    actions.log(prog.id, 'status_changed', 'generated contract, materials and travel tasks for the new faculty assignment', 'system');
    setStep(5);
  };

  const footer = (() => {
    if (step === 0) return <Button title="Continue" onPress={() => setStep(1)} disabled={!facultyId} style={{ flex: 1 }} iconRight="arrow-right" />;
    if (step === 1) return <Button title="Check availability" onPress={() => setStep(2)} disabled={!programmeId || (progSessions.length > 0 && !sessionIds.length)} style={{ flex: 1 }} iconRight="arrow-right" />;
    if (step === 2) return <Button title="Send confirmation request" icon="send" onPress={sendRequest} loading={busy} disabled={!!existing} style={{ flex: 1 }} />;
    if (step === 3) return <Button title="Simulate faculty confirmation" icon="user-check" onPress={confirmParticipation} loading={busy} style={{ flex: 1 }} />;
    if (step === 4) return <Button title="Generate follow-up tasks" icon="list-checks" onPress={generateTasks} style={{ flex: 1 }} />;
    return (
      <>
        <Button title="View profile" variant="secondary" onPress={() => { router.back(); setTimeout(() => router.push(`/faculty/${facultyId}`), 50); }} style={{ flex: 1 }} />
        <Button title="Done" onPress={() => router.back()} style={{ flex: 1 }} />
      </>
    );
  })();

  const readiness = prog ? readinessFor(db, prog.id) : undefined;
  const facReady = readiness?.categories.find((c) => c.key === 'faculty');

  return (
    <Screen title="Assign faculty" back={step > 0 && step < 3 ? true : 'close'} onBack={step > 0 && step < 3 ? () => setStep(step - 1) : undefined} large={false} footer={footer}>
      <View style={{ paddingTop: 8 }}>
        <StepIndicator steps={STEPS} current={step} />
      </View>

      {fac && step > 0 ? (
        <Card style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={fac.name} hue={fac.avatarHue} initials={fac.initials} size={40} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="headline" numberOfLines={1}>
              {facultyName(fac)}
            </Text>
            <Text variant="footnote" tone="secondary" numberOfLines={1}>
              {prog ? `${prog.shortName} · ${role}${chosen.length ? ` · ${chosen.length} session${chosen.length === 1 ? '' : 's'}` : ''}` : fac.title}
            </Text>
          </View>
          {step < 3 ? (
            <Touchable onPress={() => setStep(0)} accessibilityLabel="Change instructor" hitSlop={8}>
              <Text variant="label" tone="accent" weight="semibold">
                Change
              </Text>
            </Touchable>
          ) : (
            <StatusPill label={db.facultyAssignments.find((a) => a.id === assignmentId)?.status ?? 'Request Sent'} />
          )}
        </Card>
      ) : null}

      {step === 0 ? (
        <Section title="Who should teach?" subtitle="Sorted by availability, then lowest utilisation" first style={{ marginTop: 16 }}>
          <SearchField value={q} onChangeText={setQ} placeholder="Search by name or expertise" />
          <ListGroup>
            {facultyList.map((f) => {
              const sel = f.id === facultyId;
              return (
                <Touchable key={f.id} onPress={() => setFacultyId(f.id)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={{ flexDirection: 'row', gap: 12, padding: 14, alignItems: 'center', backgroundColor: sel ? colors.accentSoft : undefined }} accessibilityState={{ selected: sel }} accessibilityLabel={`${facultyName(f)}, ${f.availability}, ${f.utilisation}% utilised`}>
                  <Avatar name={f.name} hue={f.avatarHue} initials={f.initials} size={40} />
                  <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text variant="bodyStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
                        {facultyName(f)}
                      </Text>
                      <Rating value={f.rating} size={11} />
                    </View>
                    <Text variant="footnote" tone="secondary" numberOfLines={1}>
                      {f.expertise.slice(0, 3).join(' · ')}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <ProgressBar value={f.utilisation} height={4} color={f.utilisation >= 85 ? colors.danger : f.utilisation >= 65 ? colors.warning : colors.success} style={{ flex: 1 }} />
                      <Text variant="caption" tone="tertiary" tabular>
                        {f.utilisation}%
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <StatusPill label={f.availability} />
                    {sel ? <Icon name="circle-check" size={20} tone="accent" /> : null}
                  </View>
                </Touchable>
              );
            })}
          </ListGroup>
        </Section>
      ) : null}

      {step === 1 ? (
        <>
          <Section title="Programme" first style={{ marginTop: 20 }}>
            <ListGroup>
              {programmes.map((p) => {
                const sel = p.id === programmeId;
                return (
                  <Touchable
                    key={p.id}
                    onPress={() => {
                      setProgrammeId(p.id);
                      setSessionIds([]);
                    }}
                    feedback="highlight"
                    pressedStyle={{ backgroundColor: colors.surfacePressed }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: sel ? colors.accentSoft : undefined }}
                    accessibilityState={{ selected: sel }}
                    accessibilityLabel={p.name}>
                    <View style={{ width: 8, height: 32, borderRadius: 3, backgroundColor: `hsl(${p.accentHue}, 62%, 58%)` }} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="bodyStrong" numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text variant="footnote" tone="secondary" numberOfLines={1}>
                        {formatRange(p.startDate, p.endDate)} · {p.deliveryMode}
                      </Text>
                    </View>
                    {sel ? <Icon name="circle-check" size={20} tone="accent" /> : null}
                  </Touchable>
                );
              })}
            </ListGroup>
          </Section>
          {prog ? (
            <>
              <Section title="Sessions" subtitle={progSessions.length ? 'Select one or more sessions to teach' : 'No open sessions — the assignment will cover the programme'}>
                {progSessions.length ? (
                  <ListGroup>
                    {progSessions.map((s) => {
                      const on = sessionIds.includes(s.id);
                      const others = s.facultyIds.filter((x) => x !== facultyId).map((x) => facultyName(getFaculty(db, x)));
                      return (
                        <Touchable key={s.id} onPress={() => setSessionIds(on ? sessionIds.filter((x) => x !== s.id) : [...sessionIds, s.id])} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={{ flexDirection: 'row', gap: 12, padding: 14, alignItems: 'center' }} accessibilityState={{ checked: on }} accessibilityLabel={s.title}>
                          <Checkbox checked={on} onChange={() => setSessionIds(on ? sessionIds.filter((x) => x !== s.id) : [...sessionIds, s.id])} tone="accent" />
                          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                            <Text variant="bodyStrong" numberOfLines={2}>
                              {s.title}
                            </Text>
                            <Text variant="footnote" tone="secondary">
                              {formatDate(s.date, { weekday: true, year: false })} · {s.start}–{s.end} {tzAbbr(s.timeZone)}
                            </Text>
                            {others.length ? (
                              <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                                Currently: {others.join(', ')}
                              </Text>
                            ) : null}
                          </View>
                          <Icon name={SESSION_KIND_ICON[s.kind]} size={16} tone="tertiary" />
                        </Touchable>
                      );
                    })}
                  </ListGroup>
                ) : null}
              </Section>
              <Section title="Role">
                <ChoiceGrid options={ROLES.map((r) => ({ value: r, label: r }))} value={role} onChange={setRole} columns={2} />
              </Section>
            </>
          ) : null}
        </>
      ) : null}

      {step === 2 && fac && prog ? (
        <Animated.View entering={FadeIn.duration(250)}>
          <View style={{ marginTop: 16 }}>
            {existing ? (
              <Banner tone="warning" title="Already assigned" message={`${facultyName(fac)} already has a ${existing.status.toLowerCase()} assignment on ${prog.shortName}.`} action="Open profile" onAction={() => router.push(`/faculty/${fac.id}`)} />
            ) : conflictCount || rangeBlocks.length ? (
              <Banner tone="danger" title={`${conflictCount + rangeBlocks.length} availability issue${conflictCount + rangeBlocks.length === 1 ? '' : 's'}`} message="Conflicts are checked across time zones against every scheduled session and blocked date." />
            ) : (
              <Banner tone="success" title={`${facultyName(fac)} is available`} message={chosen.length === 1 ? 'The selected session is clear across time zones.' : chosen.length ? `All ${chosen.length} selected sessions are clear across time zones.` : `No blocked dates between ${formatRange(prog.startDate, prog.endDate)}.`} />
            )}
          </View>
          {checks.length ? (
            <Section title="Session check">
              <ListGroup>
                {checks.map((c) => (
                  <View key={c.session.id} style={{ flexDirection: 'row', gap: 12, padding: 14 }}>
                    <Icon name={c.free ? 'circle-check' : 'circle-x'} size={20} tone={c.free ? 'success' : 'danger'} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text variant="bodyStrong">{c.session.title}</Text>
                      <Text variant="footnote" tone="secondary">
                        {formatDate(c.session.date, { weekday: true, year: false })} · {c.session.start}–{c.session.end} {tzAbbr(c.session.timeZone)}
                      </Text>
                      {c.clashes.map((x) => (
                        <Text key={x.id} variant="footnote" tone="danger">
                          Clashes with “{x.title}” · {x.start} {tzAbbr(x.timeZone)} ({getProgramme(db, x.programmeId)?.shortName})
                        </Text>
                      ))}
                      {c.blocked.map((b) => (
                        <Text key={b.from} variant="footnote" tone="danger">
                          Unavailable: {b.reason} ({formatRange(b.from, b.to)})
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </ListGroup>
            </Section>
          ) : null}
          {rangeBlocks.length ? (
            <Section title="Blocked dates in programme window">
              <ListGroup>
                {rangeBlocks.map((b) => (
                  <View key={b.from} style={{ flexDirection: 'row', gap: 12, padding: 14 }}>
                    <Icon name="calendar-x" size={20} tone="danger" />
                    <Text variant="callout" style={{ flex: 1 }}>
                      {b.reason} · {formatRange(b.from, b.to)}
                    </Text>
                  </View>
                ))}
              </ListGroup>
            </Section>
          ) : null}
          <Section title="Assignment summary">
            <Card padding="sm" style={{ paddingHorizontal: 16, gap: 0 }}>
              <SummaryLine label="Programme" value={prog.name} />
              <SummaryLine label="Role" value={role} />
              <SummaryLine label="Teaching days" value={String(days)} />
              <SummaryLine label="Fee" value={`${money(fee)} (${money(fac.dailyFee)}/day)`} last />
            </Card>
          </Section>
        </Animated.View>
      ) : null}

      {step === 3 && fac && prog ? (
        <Animated.View entering={FadeIn.duration(250)}>
          <Section title="Request sent" first style={{ marginTop: 20 }}>
            <Card style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="mail" size={16} tone="accent" />
                <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
                  To {fac.email}
                </Text>
                <Text variant="footnote" tone="tertiary">
                  Just now
                </Text>
              </View>
              <Text variant="headline">Teaching request: {prog.name}</Text>
              <Text variant="callout" tone="secondary">
                Dear {fac.honorific} {fac.name.split(' ').slice(-1)[0]}, we would be delighted to have you join {prog.name} ({formatRange(prog.startDate, prog.endDate)}, {prog.location}) as {role.toLowerCase()}
                {chosen.length ? ` for ${chosen.map((s) => `“${s.title}”`).join(', ')}` : ''}. Please confirm your availability in your ProgrammeOS faculty app.
              </Text>
            </Card>
          </Section>
          <Section title="Progress">
            <Timeline
              steps={[
                { key: 'sel', title: 'Faculty selected', state: 'done' },
                { key: 'av', title: 'Availability checked', state: 'done', detail: conflictCount ? `${conflictCount} conflict${conflictCount === 1 ? '' : 's'} to resolve` : 'No conflicts' },
                { key: 'cr', title: 'Assignment created', state: 'done' },
                { key: 'send', title: 'Confirmation request sent', state: 'done', meta: 'Today' },
                { key: 'conf', title: 'Awaiting faculty response', state: 'current', detail: 'Faculty usually respond within 2 working days.' },
              ]}
            />
          </Section>
        </Animated.View>
      ) : null}

      {step === 4 && fac && prog ? (
        <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'center', gap: 10, paddingVertical: 28 }}>
          <View style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="circle-check-big" size={30} tone="success" />
          </View>
          <Text variant="title2" align="center">
            {facultyName(fac)} confirmed
          </Text>
          <Text variant="callout" tone="secondary" align="center" style={{ maxWidth: 300 }}>
            Participation in {prog.name} is confirmed. Generate the contract, materials and travel tasks so nothing is forgotten.
          </Text>
        </Animated.View>
      ) : null}

      {step === 5 && fac && prog ? (
        <Animated.View entering={FadeIn.duration(300)}>
          <Section title="Tasks generated" subtitle="Assigned to the right owners automatically" first style={{ marginTop: 20 }}>
            <ListGroup>
              {taskIds
                .map((id) => db.tasks.find((t) => t.id === id))
                .filter((t): t is NonNullable<typeof t> => !!t)
                .map((t) => (
                  <TaskRow key={t.id} task={t} showOwner showProgramme={false} />
                ))}
            </ListGroup>
          </Section>
          <Section title="Readiness updated">
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <ProgressRing value={facReady?.percent ?? 100} size={64} stroke={6} color={colors.success}>
                <Text variant="headline" tabular>
                  {Math.round(facReady?.percent ?? 100)}%
                </Text>
              </ProgressRing>
              <View style={{ flex: 1, gap: 3 }}>
                <Text variant="headline">Faculty readiness</Text>
                <Text variant="subhead" tone="secondary">
                  {readiness?.configured
                    ? `${readinessBefore != null ? `${Math.round(readinessBefore)}% → ` : ''}${Math.round(facReady?.percent ?? 0)}% · programme ${Math.round(readiness.overall)}% ready overall`
                    : 'Programme readiness tracking starts when it enters preparation.'}
                </Text>
                {readiness?.configured ? (
                  <Touchable onPress={() => { router.back(); setTimeout(() => router.push(`/programme/${prog.id}/readiness`), 50); }} accessibilityLabel="Open readiness">
                    <Text variant="label" tone="accent" weight="semibold">
                      Open readiness →
                    </Text>
                  </Touchable>
                ) : null}
              </View>
            </Card>
          </Section>
          <Section title="Workflow complete">
            <Timeline
              dense
              steps={['Select faculty', 'Check availability', 'Create assignment', 'Send confirmation', 'Confirm participation', 'Generate contract task', 'Generate material task', 'Generate travel requirements', 'Update readiness'].map((t) => ({ key: t, title: t, state: 'done' as const }))}
            />
          </Section>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

function SummaryLine({ label, value, last }: { label: string; value: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 11, gap: 12, borderBottomWidth: last ? 0 : 0.5, borderBottomColor: colors.separator }}>
      <Text variant="callout" tone="secondary">
        {label}
      </Text>
      <Text variant="callout" weight="medium" align="right" style={{ flex: 1 }} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

