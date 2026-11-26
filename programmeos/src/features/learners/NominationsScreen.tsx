import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Card, EmptyState, HeaderActions, IconButton, Screen, Section, SegmentedControl, StatusPill, Text, Touchable, useDialog, useToast } from '@/components';
import type { Enrollment, EnrollmentStatus } from '@/data/models';
import { getLearner, getProgramme, learnerName, programmePhase } from '@/data/selectors';
import { useActions, useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { countdown, formatDate } from '@/utils/dates';

import { LoadGate } from '../shared/Widgets';

type Filter = 'All' | 'Nominated' | 'Invited' | 'Waitlisted';

export default function NominationsScreen() {
  const params = useLocalSearchParams<{ status?: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<Filter>((['Nominated', 'Invited', 'Waitlisted'].includes(params.status ?? '') ? params.status : 'All') as Filter);

  const relevant = db.enrollments.filter((e) => {
    const p = getProgramme(db, e.programmeId);
    if (!p || p.archived || p.cancelled || programmePhase(p) === 'completed') return false;
    return ['Nominated', 'Invited', 'Waitlisted'].includes(e.status) && (filter === 'All' || e.status === filter);
  });
  const byProgramme = relevant.reduce<Record<string, Enrollment[]>>((acc, e) => {
    (acc[e.programmeId] ??= []).push(e);
    return acc;
  }, {});
  const programmeIds = Object.keys(byProgramme).sort((a, b) => (getProgramme(db, a)?.startDate ?? '').localeCompare(getProgramme(db, b)?.startDate ?? ''));
  const count = (s: EnrollmentStatus) => db.enrollments.filter((e) => e.status === s && !getProgramme(db, e.programmeId)?.archived && programmePhase(getProgramme(db, e.programmeId)!) !== 'completed').length;

  const setStatus = (e: Enrollment, status: EnrollmentStatus, message: string) => {
    const l = getLearner(db, e.learnerId);
    actions.setEnrollmentStatus(e.id, status);
    actions.log(e.programmeId, status === 'Registered' ? 'participant_registered' : 'status_changed', `${message.toLowerCase()} ${learnerName(l)}`);
    toast.show({ message, detail: `${learnerName(l)} · ${getProgramme(db, e.programmeId)?.shortName}`, actionLabel: 'Undo', onAction: () => actions.setEnrollmentStatus(e.id, e.status) });
  };

  const decline = async (e: Enrollment) => {
    const l = getLearner(db, e.learnerId);
    const { confirmed, text } = await dialog.confirm({ title: `Decline ${l?.firstName}?`, message: 'The nominating client contact will be notified.', confirmLabel: 'Decline', destructive: true, icon: 'user-x', input: { placeholder: 'Reason (optional)' } });
    if (!confirmed) return;
    setStatus(e, 'Withdrawn', 'Nomination declined');
    if (text) actions.log(e.programmeId, 'comment', `noted: “${text}”`);
  };

  const approveAll = async (pid: string) => {
    const list = byProgramme[pid].filter((e) => e.status === 'Nominated');
    const p = getProgramme(db, pid);
    const { confirmed } = await dialog.confirm({ title: `Approve ${list.length} nominations?`, message: `Invitations will be sent for ${p?.name}.`, confirmLabel: 'Approve all', icon: 'user-check', tone: 'success' });
    if (!confirmed) return;
    list.forEach((e) => actions.setEnrollmentStatus(e.id, 'Invited'));
    actions.log(pid, 'status_changed', `approved ${list.length} nominations and sent invitations`);
    toast.show({ message: `${list.length} invitations sent`, detail: p?.shortName, icon: 'send' });
  };

  return (
    <Screen
      title="Nominations"
      subtitle="Approve client nominations, chase invitations and manage waitlists"
      headerRight={
        <HeaderActions>
          <IconButton icon="import" accessibilityLabel="Import nominations" onPress={() => router.push('/learners/import')} />
        </HeaderActions>
      }
      headerBelow={
        <SegmentedControl<Filter>
          value={filter}
          onChange={setFilter}
          size="sm"
          options={[
            { value: 'All', label: 'All' },
            { value: 'Nominated', label: 'Nominated', count: count('Nominated') },
            { value: 'Invited', label: 'Invited', count: count('Invited') },
            { value: 'Waitlisted', label: 'Waitlist', count: count('Waitlisted') },
          ]}
        />
      }>
      <LoadGate loadKey="nominations">
        {programmeIds.length ? (
          programmeIds.map((pid, i) => {
            const p = getProgramme(db, pid)!;
            const list = byProgramme[pid];
            const nominated = list.filter((e) => e.status === 'Nominated').length;
            const enrolled = db.enrollments.filter((e) => e.programmeId === pid && ['Registered', 'Confirmed', 'Attending'].includes(e.status)).length;
            return (
              <Section key={pid} first={i === 0} title={p.name} subtitle={`${countdown(p.startDate)} · ${enrolled}/${p.capacity} registered`} action={nominated > 1 ? 'Approve all' : undefined} onAction={() => approveAll(pid)}>
                <View style={{ gap: 10 }}>
                  {list.map((e) => {
                    const l = getLearner(db, e.learnerId);
                    return (
                      <Card key={e.id} style={{ gap: 12 }}>
                        <Touchable onPress={() => router.push(`/enrollment/${e.id}`)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }} accessibilityLabel={`${learnerName(l)}, ${e.status}`}>
                          <Avatar name={learnerName(l)} hue={l?.avatarHue} initials={l?.initials} size={40} />
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text variant="headline" numberOfLines={1}>
                              {learnerName(l)}
                            </Text>
                            <Text variant="footnote" tone="secondary" numberOfLines={1}>
                              {l?.jobTitle} · {l?.organisation}
                            </Text>
                            <Text variant="footnote" tone="tertiary" numberOfLines={1}>
                              {e.nominatedBy ? `By ${e.nominatedBy}` : 'Self-nominated'}
                              {e.nominatedOn ? ` · ${formatDate(e.nominatedOn, { year: false })}` : ''}
                            </Text>
                          </View>
                          <StatusPill label={e.status} />
                        </Touchable>
                        <View style={{ flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: colors.separator }}>
                          {e.status === 'Nominated' ? (
                            <>
                              <Button title="Approve" size="sm" variant="success" icon="check" onPress={() => setStatus(e, 'Invited', 'Nomination approved')} style={{ flex: 1 }} />
                              <Button title="Decline" size="sm" variant="destructiveTinted" onPress={() => decline(e)} style={{ flex: 1 }} />
                            </>
                          ) : e.status === 'Invited' ? (
                            <>
                              <Button title="Mark registered" size="sm" variant="tinted" icon="user-check" onPress={() => setStatus(e, 'Registered', 'Registered')} style={{ flex: 1 }} />
                              <Button title="Resend invite" size="sm" variant="secondary" icon="send" onPress={() => toast.show({ message: 'Invitation resent', detail: l?.email, icon: 'send' })} style={{ flex: 1 }} />
                            </>
                          ) : (
                            <>
                              <Button title="Offer a place" size="sm" variant="tinted" icon="ticket-check" onPress={() => setStatus(e, 'Invited', 'Place offered')} style={{ flex: 1 }} />
                              <Button title="Remove" size="sm" variant="secondary" onPress={() => decline(e)} style={{ flex: 1 }} />
                            </>
                          )}
                        </View>
                      </Card>
                    );
                  })}
                </View>
              </Section>
            );
          })
        ) : (
          <EmptyState icon="user-check" title="All caught up" message={filter === 'All' ? 'No nominations, invitations or waitlisted participants need attention.' : `No ${filter.toLowerCase()} participants right now.`} actionLabel="Import nominations" onAction={() => router.push('/learners/import')} />
        )}
      </LoadGate>
    </Screen>
  );
}
