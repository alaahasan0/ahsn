import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Banner, Button, FormSection, ListGroup, ListRow, Screen, SegmentedField, SelectField, TextField, useToast } from '@/components';
import type { Enrollment, EnrollmentStatus, Learner } from '@/data/models';
import { getLearner, getProgramme, learnerName, programmePhase } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { DEMO_TODAY, formatRange } from '@/utils/dates';
import { newId } from '@/utils/format';

type Mode = 'existing' | 'new';

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ programme?: string; learner?: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('existing');
  const [learnerId, setLearnerId] = useState<string | undefined>(params.learner);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [programmeId, setProgrammeId] = useState<string | undefined>(params.programme);
  const [source, setSource] = useState<string>('client');
  const [status, setStatus] = useState<EnrollmentStatus>('Registered');
  const [hotel, setHotel] = useState(false);
  const [travel, setTravel] = useState(false);
  const [dietary, setDietary] = useState('');
  const [accessibility, setAccessibility] = useState('');
  const [tried, setTried] = useState(false);

  const prog = getProgramme(db, programmeId);
  const client = db.clients.find((c) => c.id === prog?.clientId);
  const contacts = db.clientContacts.filter((c) => c.clientId === prog?.clientId);
  const programmes = db.programmes.filter((p) => !p.archived && !p.cancelled && programmePhase(p) !== 'completed');
  const existingLearner = getLearner(db, learnerId);
  const duplicate = mode === 'existing' && learnerId && programmeId ? db.enrollments.find((e) => e.learnerId === learnerId && e.programmeId === programmeId && e.status !== 'Withdrawn') : undefined;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailTaken = mode === 'new' && db.learners.some((l) => l.email.toLowerCase() === email.trim().toLowerCase());
  const enrolled = prog ? db.enrollments.filter((e) => e.programmeId === prog.id && e.status !== 'Withdrawn' && e.status !== 'Waitlisted').length : 0;
  const full = prog ? enrolled >= prog.capacity : false;

  const errors = {
    learner: mode === 'existing' && !learnerId ? 'Choose a person' : undefined,
    first: mode === 'new' && !first.trim() ? 'Required' : undefined,
    last: mode === 'new' && !last.trim() ? 'Required' : undefined,
    email: mode === 'new' ? (!emailValid ? 'Enter a valid email address' : emailTaken ? 'A learner with this email already exists' : undefined) : undefined,
    programme: !programmeId ? 'Choose a programme' : undefined,
  };
  const valid = !Object.values(errors).some(Boolean) && !duplicate;

  const sourceOptions = [
    ...(contacts.length ? contacts.map((c) => ({ value: c.id, label: c.name, detail: `${c.title} · ${client?.shortName}` })) : [{ value: 'client', label: client ? `${client.shortName} L&D` : 'Client', detail: 'Client nomination' }]),
    { value: 'self', label: 'Self-registered', detail: 'Open enrolment' },
    { value: 'sales', label: 'Emeritus sales team', detail: 'Direct referral' },
  ];
  const sourceValue = sourceOptions.some((o) => o.value === source) ? source : sourceOptions[0].value;

  const submit = () => {
    setTried(true);
    if (!valid || !prog) return;
    let id = learnerId;
    let person: Learner | undefined = existingLearner;
    if (mode === 'new') {
      id = newId('l');
      person = {
        id,
        firstName: first.trim(),
        lastName: last.trim(),
        initials: `${first.trim()[0] ?? ''}${last.trim()[0] ?? ''}`.toUpperCase(),
        jobTitle: title.trim() || 'Participant',
        organisation: org.trim() || client?.name || 'Independent',
        clientId: org.trim() ? undefined : client?.id,
        country: '—',
        email: email.trim(),
        phone: '—',
        dietary: dietary.trim() || undefined,
        accessibility: accessibility.trim() || undefined,
        avatarHue: Math.floor(Math.random() * 360),
      };
      actions.add('learners', person);
    } else if (person && (dietary.trim() || accessibility.trim())) {
      actions.update('learners', person.id, { dietary: dietary.trim() || person.dietary, accessibility: accessibility.trim() || person.accessibility });
    }
    const nominator = sourceOptions.find((o) => o.value === sourceValue);
    const finalStatus: EnrollmentStatus = full && status !== 'Nominated' ? 'Waitlisted' : status;
    const enrolment: Enrollment = {
      id: newId('e'),
      learnerId: id!,
      programmeId: prog.id,
      cohortId: db.cohorts.find((c) => c.programmeId === prog.id)?.id,
      status: finalStatus,
      nominatedBy: nominator?.value === 'self' ? undefined : nominator?.label,
      nominatedOn: DEMO_TODAY,
      registeredOn: finalStatus === 'Registered' ? DEMO_TODAY : undefined,
      learningAccess: 'Not Issued',
      requiresHotel: hotel,
      requiresTravel: travel,
      requirementsComplete: finalStatus === 'Registered',
    };
    actions.add('enrollments', enrolment);
    const nm = person ? learnerName(person) : 'Participant';
    actions.log(prog.id, 'participant_registered', finalStatus === 'Registered' ? `registered ${nm}` : `added ${nm} as ${finalStatus.toLowerCase()}`);
    toast.show({ message: finalStatus === 'Waitlisted' ? 'Added to waitlist' : finalStatus === 'Registered' ? 'Participant registered' : 'Nomination recorded', detail: `${nm} · ${prog.shortName}`, actionLabel: 'View', onAction: () => router.push(`/enrollment/${enrolment.id}`) });
    router.back();
  };

  return (
    <Screen title="Register participant" back="close" large={false} footer={<Button title={status === 'Nominated' ? 'Record nomination' : 'Register'} icon="user-plus" onPress={submit} disabled={tried && !valid} style={{ flex: 1 }} />}>
      <FormSection title="Person">
        <SegmentedField<Mode>
          label="Who are you registering?"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'existing', label: 'Existing person' },
            { value: 'new', label: 'New person' },
          ]}
        />
        {mode === 'existing' ? (
          <>
            <SelectField
              label="Learner"
              value={learnerId}
              onChange={setLearnerId}
              placeholder="Search people"
              icon="search"
              error={tried ? errors.learner : undefined}
              options={db.learners.map((l) => ({ value: l.id, label: learnerName(l), detail: `${l.jobTitle} · ${l.organisation}`, leading: <Avatar name={learnerName(l)} hue={l.avatarHue} initials={l.initials} size={28} /> }))}
            />
            {existingLearner ? (
              <ListGroup>
                <ListRow title={existingLearner.email} subtitle={`${db.enrollments.filter((e) => e.learnerId === existingLearner.id).length} existing enrolments · ${existingLearner.country}`} icon="mail" compact />
              </ListGroup>
            ) : null}
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextField label="First name" value={first} onChangeText={setFirst} required error={tried ? errors.first : undefined} style={{ flex: 1 }} />
              <TextField label="Last name" value={last} onChangeText={setLast} required error={tried ? errors.last : undefined} style={{ flex: 1 }} />
            </View>
            <TextField label="Work email" value={email} onChangeText={setEmail} keyboardType="email-address" icon="mail" required error={tried || email.length > 4 ? errors.email : undefined} />
            <TextField label="Job title" value={title} onChangeText={setTitle} placeholder="e.g. Director, Operations" />
            <TextField label="Organisation" value={org} onChangeText={setOrg} placeholder={client ? `Defaults to ${client.name}` : 'Organisation'} />
          </>
        )}
      </FormSection>

      <FormSection title="Programme">
        <SelectField label="Programme" value={programmeId} onChange={setProgrammeId} icon="layers" error={tried ? errors.programme : undefined} options={programmes.map((p) => ({ value: p.id, label: p.name, detail: `${formatRange(p.startDate, p.endDate)} · ${db.enrollments.filter((e) => e.programmeId === p.id && !['Withdrawn', 'Waitlisted'].includes(e.status)).length}/${p.capacity} places` }))} />
        {duplicate ? <Banner tone="warning" title="Already enrolled" message={`This person is already ${duplicate.status.toLowerCase()} on ${prog?.shortName}.`} action="Open enrolment" onAction={() => router.push(`/enrollment/${duplicate.id}`)} /> : null}
        {full && !duplicate ? <Banner tone="info" title="Programme is full" message={`${enrolled}/${prog?.capacity} places taken. New registrations go to the waitlist.`} /> : null}
        <SelectField label="Nominated by" value={sourceValue} onChange={setSource} icon="handshake" options={sourceOptions} />
        <SegmentedField<EnrollmentStatus>
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'Nominated', label: 'Nominated' },
            { value: 'Invited', label: 'Invited' },
            { value: 'Registered', label: 'Registered' },
          ]}
        />
      </FormSection>

      <FormSection title="Requirements" footer="Requirements are stored on the person and reused across programmes.">
        <ListGroup>
          <ListRow title="Requires hotel" icon="bed-double" iconTone="info" switchValue={hotel} onSwitch={setHotel} />
          <ListRow title="Requires travel" icon="plane" iconTone="info" switchValue={travel} onSwitch={setTravel} />
        </ListGroup>
        <TextField label="Dietary" value={dietary} onChangeText={setDietary} placeholder={existingLearner?.dietary ?? 'None'} icon="salad" />
        <TextField label="Accessibility" value={accessibility} onChangeText={setAccessibility} placeholder={existingLearner?.accessibility ?? 'None'} icon="accessibility" />
      </FormSection>
    </Screen>
  );
}
