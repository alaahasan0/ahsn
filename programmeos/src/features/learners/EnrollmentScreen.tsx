import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Card, EmptyState, Icon, KeyValue, ListGroup, ListRow, ProgressBar, Screen, Section, SelectSheet, StatusPill, Text, useDialog, useToast } from '@/components';
import type { Enrollment, EnrollmentStatus } from '@/data/models';
import { getLearner, getProgramme, learnerName, programmePhase } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { formatDate, formatRange } from '@/utils/dates';

const STATUSES: EnrollmentStatus[] = ['Nominated', 'Invited', 'Registered', 'Confirmed', 'Attending', 'Completed', 'Waitlisted', 'Withdrawn'];

const ACCESS_NEXT: Record<Enrollment['learningAccess'], { label: string; to: Enrollment['learningAccess'] } | null> = {
  'Not Issued': { label: 'Issue learning access', to: 'Invited' },
  Invited: { label: 'Resend activation email', to: 'Invited' },
  Active: { label: 'Suspend access', to: 'Suspended' },
  Suspended: { label: 'Restore access', to: 'Active' },
};

/** One learner's participation in one programme — kept separate from the person record. */
export default function EnrollmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { colors } = useTheme();
  const [statusOpen, setStatusOpen] = useState(false);
  const e = db.enrollments.find((x) => x.id === id);
  const l = getLearner(db, e?.learnerId);
  const p = getProgramme(db, e?.programmeId);

  if (!e || !l || !p) {
    return (
      <Screen title="Enrolment">
        <EmptyState icon="user-x" title="Enrolment not found" actionLabel="Back to learners" onAction={() => router.replace('/learners')} />
      </Screen>
    );
  }

  const name = learnerName(l);
  const booking = db.hotelBookings.find((b) => b.guest.id === l.id && b.programmeId === p.id);
  const itinerary = db.itineraries.find((t) => t.traveller.id === l.id && t.programmeId === p.id);
  const cohort = db.cohorts.find((c) => c.id === e.cohortId);
  const phase = programmePhase(p);
  const access = ACCESS_NEXT[e.learningAccess];

  const changeStatus = (status: EnrollmentStatus) => {
    if (status === e.status) return;
    actions.setEnrollmentStatus(e.id, status);
    if (status === 'Registered' || status === 'Confirmed') actions.log(p.id, 'participant_registered', `registered ${name}`);
    else actions.log(p.id, 'status_changed', `changed ${name}’s enrolment to ${status}`);
    toast.show({ message: `Enrolment ${status.toLowerCase()}`, detail: `${name} · ${p.shortName}`, actionLabel: 'Undo', onAction: () => actions.setEnrollmentStatus(e.id, e.status) });
  };

  const accessAction = async () => {
    if (!access) return;
    if (access.to === 'Suspended') {
      const { confirmed } = await dialog.confirm({ title: 'Suspend learning access?', message: `${name} will lose access to materials and sessions for ${p.shortName}.`, confirmLabel: 'Suspend', destructive: true, icon: 'lock' });
      if (!confirmed) return;
    }
    actions.update('enrollments', e.id, { learningAccess: access.to });
    toast.show({ message: access.to === 'Invited' ? 'Activation email sent' : access.to === 'Suspended' ? 'Access suspended' : 'Access restored', detail: `${l.email}`, icon: access.to === 'Suspended' ? 'lock' : 'mail' });
  };

  const issueCertificate = async () => {
    const { confirmed } = await dialog.confirm({ title: 'Issue certificate?', message: `A verified digital certificate for ${p.name} will be sent to ${name}.`, confirmLabel: 'Issue', icon: 'award', tone: 'success' });
    if (!confirmed) return;
    const seq = 300 + (e.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 600);
    const certificateId = `EM-${p.shortName.replace(/[^A-Z0-9]/gi, '').toUpperCase()}27-${seq}`;
    actions.update('enrollments', e.id, { certificateIssued: true, certificateId });
    toast.show({ message: 'Certificate issued', detail: certificateId, icon: 'badge-check' });
  };

  return (
    <Screen title={p.name} eyebrow={`Enrolment · ${name}`}>
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar name={name} hue={l.avatarHue} initials={l.initials} size={44} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="headline" numberOfLines={1}>
              {name}
            </Text>
            <Text variant="footnote" tone="secondary" numberOfLines={1}>
              {l.jobTitle} · {l.organisation}
            </Text>
          </View>
          <StatusPill label={e.status} size="md" />
        </View>
        <Button title="Change enrolment status" variant="tinted" icon="repeat" onPress={() => setStatusOpen(true)} fullWidth />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="View person" size="sm" variant="secondary" icon="user-round" onPress={() => router.push(`/learner/${l.id}`)} style={{ flex: 1 }} />
          <Button title="View programme" size="sm" variant="secondary" icon="layers" onPress={() => router.push(`/programme/${p.id}`)} style={{ flex: 1 }} />
        </View>
      </Card>

      <Section title="Programme">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue label="Dates" value={formatRange(p.startDate, p.endDate)} icon="calendar" />
          <KeyValue label="Delivery" value={`${p.deliveryMode} · ${p.location}`} icon="map-pin" multiline />
          <KeyValue label="Cohort" value={cohort?.name ?? '—'} icon="users" last />
        </Card>
      </Section>

      <Section title="Nomination & registration">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          <KeyValue label="Nominated by" value={e.nominatedBy ?? 'Self-registered'} icon="handshake" />
          <KeyValue label="Nominated on" value={e.nominatedOn ? formatDate(e.nominatedOn) : '—'} icon="calendar" />
          <KeyValue label="Registered on" value={e.registeredOn ? formatDate(e.registeredOn) : 'Not yet registered'} icon="user-check" valueTone={e.registeredOn ? 'primary' : 'warning'} />
          <KeyValue label="Requirements" value={e.requirementsComplete ? 'Complete' : 'Incomplete'} icon="clipboard-list" valueTone={e.requirementsComplete ? 'success' : 'warning'} last />
        </Card>
      </Section>

      <Section title="Learning access">
        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name={e.learningAccess === 'Active' ? 'shield-check' : e.learningAccess === 'Suspended' ? 'lock' : 'mail'} size={20} tone={e.learningAccess === 'Active' ? 'success' : e.learningAccess === 'Suspended' ? 'danger' : 'warning'} />
            <View style={{ flex: 1 }}>
              <Text variant="headline">Emeritus Learning Hub</Text>
              <Text variant="footnote" tone="secondary">
                {e.learningAccess === 'Active' ? 'Active — learner can see sessions and published materials' : e.learningAccess === 'Invited' ? 'Activation email sent, awaiting first sign-in' : e.learningAccess === 'Suspended' ? 'Suspended' : 'Not issued yet'}
              </Text>
            </View>
            <StatusPill label={e.learningAccess === 'Not Issued' ? 'Not issued' : e.learningAccess} tone={e.learningAccess === 'Active' ? 'success' : e.learningAccess === 'Suspended' ? 'danger' : e.learningAccess === 'Invited' ? 'warning' : 'neutral'} />
          </View>
          {access ? <Button title={access.label} size="sm" variant={access.to === 'Suspended' ? 'destructiveTinted' : 'tinted'} onPress={accessAction} style={{ alignSelf: 'flex-start' }} /> : null}
        </Card>
      </Section>

      <Section title="Travel & accommodation">
        <ListGroup>
          <ListRow title="Requires hotel" icon="bed-double" iconTone="info" switchValue={e.requiresHotel} onSwitch={(v) => { actions.update('enrollments', e.id, { requiresHotel: v }); toast.show({ message: v ? 'Added to rooming requirements' : 'Removed from rooming requirements', tone: 'neutral' }); }} />
          <ListRow title="Requires travel" icon="plane" iconTone="info" switchValue={e.requiresTravel} onSwitch={(v) => { actions.update('enrollments', e.id, { requiresTravel: v }); toast.show({ message: v ? 'Travel requirement added' : 'Travel requirement removed', tone: 'neutral' }); }} />
          {booking ? <ListRow icon="key-round" iconTone="success" title={db.hotels.find((h) => h.id === booking.hotelId)?.name ?? 'Hotel'} numberOfLines={2} subtitle={`${formatRange(booking.checkIn, booking.checkOut)} · ${booking.roomType}`} trailing={<StatusPill label={booking.status} />} onPress={() => router.push(`/booking/${booking.id}`)} /> : null}
          {itinerary ? <ListRow icon="ticket-check" iconTone={['Booked', 'Ticketed'].includes(itinerary.status) ? 'success' : 'warning'} title="Flight itinerary" subtitle={itinerary.segments[0] ? `${itinerary.segments[0].from} → ${itinerary.segments[0].to} · ${itinerary.segments[0].flightNumber}` : itinerary.notes ?? 'No flights yet'} trailing={<StatusPill label={itinerary.status} />} onPress={() => router.push(`/travel/${itinerary.id}`)} /> : null}
        </ListGroup>
      </Section>

      <Section title="Progress & outcomes">
        <Card style={{ gap: 14 }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="callout" tone="secondary">
                Attendance
              </Text>
              <Text variant="callout" weight="semibold" tabular>
                {e.attendanceRate != null ? `${e.attendanceRate}%` : phase === 'upcoming' ? 'Starts soon' : '—'}
              </Text>
            </View>
            <ProgressBar value={e.attendanceRate ?? 0} color={(e.attendanceRate ?? 100) < 80 ? colors.warning : colors.success} />
          </View>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="callout" tone="secondary">
                Learning progress
              </Text>
              <Text variant="callout" weight="semibold" tabular>
                {e.progress != null ? `${e.progress}%` : '—'}
              </Text>
            </View>
            <ProgressBar value={e.progress ?? 0} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <MiniFact label="Assessment" value={e.assessmentScore != null ? `${e.assessmentScore}/100` : '—'} />
            <MiniFact label="Feedback" value={e.feedbackSubmitted ? 'Submitted' : 'Pending'} />
          </View>
        </Card>
      </Section>

      <Section title="Certificate">
        {e.certificateIssued ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Icon name="badge-check" size={28} tone="success" />
            <View style={{ flex: 1 }}>
              <Text variant="headline">Certificate issued</Text>
              <Text variant="footnote" tone="secondary">
                {e.certificateId} · verifiable online
              </Text>
            </View>
            <Button title="Share" size="sm" variant="secondary" onPress={() => toast.show({ message: 'Verification link copied', icon: 'copy', tone: 'neutral' })} />
          </Card>
        ) : e.status === 'Completed' ? (
          <Card style={{ gap: 10 }}>
            <Text variant="callout" tone="secondary">
              {name} has completed the programme. Issue a verified certificate.
            </Text>
            <Button title="Issue certificate" icon="award" onPress={issueCertificate} style={{ alignSelf: 'flex-start' }} />
          </Card>
        ) : (
          <EmptyState icon="award" title="Not yet eligible" message="Certificates are issued once the programme is completed with at least 80% attendance." compact />
        )}
      </Section>

      <SelectSheet visible={statusOpen} onClose={() => setStatusOpen(false)} title="Enrolment status" options={STATUSES.map((s) => ({ value: s, label: s }))} value={e.status} onSelect={changeStatus} />
    </Screen>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceAlt, gap: 2 }}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="headline">{value}</Text>
    </View>
  );
}
