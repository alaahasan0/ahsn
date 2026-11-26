import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  ActionSheet,
  Banner,
  Button,
  Card,
  EmptyState,
  FileIcon,
  HeaderActions,
  IconButton,
  KeyValue,
  ListGroup,
  ListRow,
  RestrictedState,
  Screen,
  Section,
  Stat,
  StatGrid,
  StatusPill,
  Tag,
  Text,
  UnderlineTabs,
  useDialog,
  useToast,
} from '@/components';
import type { FacultyAssignment } from '@/data/models';
import { facultyName, getFaculty, getProgramme, scheduleConflicts } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { canSeeFinancials } from '@/navigation/access';
import { useTheme } from '@/theme';
import { DEMO_TODAY, formatDate, formatRange, tzAbbr, tzOffsetLabel } from '@/utils/dates';
import { fileSize, money } from '@/utils/format';

import { ProfileHeader } from '../people/ProfileHeader';
import { SessionRow } from '../shared/Rows';
import { Rating } from './components';

type Tab = 'overview' | 'schedule' | 'assignments' | 'fees' | 'travel' | 'documents';

const NEXT_STATUS: Partial<Record<FacultyAssignment['status'], { label: string; to: FacultyAssignment['status'] }>> = {
  Proposed: { label: 'Send request', to: 'Request Sent' },
  'Request Sent': { label: 'Mark confirmed', to: 'Confirmed' },
  Confirmed: { label: 'Issue contract', to: 'Contract Issued' },
  'Contract Issued': { label: 'Mark contracted', to: 'Contracted' },
};

export default function FacultyProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const dialog = useDialog();
  const { role } = useSession();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('overview');
  const [menu, setMenu] = useState(false);
  const f = getFaculty(db, id);

  if (!f) {
    return (
      <Screen title="Faculty">
        <EmptyState icon="user-x" title="Faculty member not found" message="This profile may have been removed." actionLabel="Back to faculty" onAction={() => router.replace('/faculty')} />
      </Screen>
    );
  }

  const name = facultyName(f);
  const assignments = db.facultyAssignments.filter((a) => a.facultyId === f.id).sort((a, b) => (getProgramme(db, b.programmeId)?.startDate ?? '').localeCompare(getProgramme(db, a.programmeId)?.startDate ?? ''));
  const sessions = db.sessions.filter((s) => s.facultyIds.includes(f.id)).sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  const upcoming = sessions.filter((s) => s.endDate >= DEMO_TODAY);
  const past = sessions.filter((s) => s.endDate < DEMO_TODAY).reverse();
  const conflicts = scheduleConflicts(db).filter((c) => c.facultyId === f.id);
  const conflicted = new Set(conflicts.flatMap((c) => [c.a.id, c.b.id]));
  const feedback = db.facultyFeedback.filter((x) => x.facultyId === f.id).sort((a, b) => b.date.localeCompare(a.date));
  const invoices = db.transactions.filter((t) => t.kind === 'Faculty Invoice' && t.payee.includes(f.name));
  const itineraries = db.itineraries.filter((t) => t.traveller.id === f.id);
  const bookings = db.hotelBookings.filter((b) => b.guest.id === f.id);
  const docs = db.documents.filter((d) => d.facultyId === f.id);
  const canFees = canSeeFinancials(role) || role === 'faculty_operations';

  const advance = async (a: FacultyAssignment) => {
    const next = NEXT_STATUS[a.status];
    if (!next) return;
    const prog = getProgramme(db, a.programmeId);
    const { confirmed } = await dialog.confirm({ title: `${next.label}?`, message: `${name} · ${prog?.name}`, confirmLabel: next.label, icon: 'user-check' });
    if (!confirmed) return;
    actions.setAssignmentStatus(a.id, next.to);
    actions.log(a.programmeId, 'faculty_assigned', `updated ${name}’s assignment to ${next.to}`);
    toast.show({ message: `${next.to}`, detail: `${name} · ${prog?.shortName}` });
  };

  const contact = (kind: string) => toast.show({ message: `${kind} ${f.honorific} ${f.name.split(' ').slice(-1)[0]}`, detail: 'Simulated — integrations arrive in a later phase.', icon: kind === 'Email' ? 'mail' : kind === 'Call' ? 'phone' : 'message-circle', tone: 'accent' });

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'schedule', label: 'Schedule', count: upcoming.length },
    { value: 'assignments', label: 'Assignments', count: assignments.length },
    { value: 'fees', label: 'Contracts & Fees' },
    { value: 'travel', label: 'Travel & Hotel', count: itineraries.length + bookings.length },
    { value: 'documents', label: 'Documents', count: docs.length },
  ];

  return (
    <Screen
      title={name}
      eyebrow="Faculty"
      headerRight={
        <HeaderActions>
          <IconButton icon="calendar-days" accessibilityLabel="Availability" onPress={() => router.push(`/faculty/${f.id}/availability`)} />
          <IconButton icon="ellipsis" accessibilityLabel="More actions" onPress={() => setMenu(true)} />
        </HeaderActions>
      }>
      <ProfileHeader
        name={f.name}
        hue={f.avatarHue}
        initials={f.initials}
        title={f.title}
        subtitle={f.institution}
        meta={`${f.location} · ${tzAbbr(f.timeZone)} (${tzOffsetLabel(f.timeZone)})`}
        badges={
          <>
            <StatusPill label={f.availability} />
            <StatusPill label={`Contract ${f.contractStatus}`} tone={f.contractStatus === 'Active' ? 'success' : 'warning'} />
          </>
        }
        actions={[
          { icon: 'phone', label: 'Call', onPress: () => contact('Call') },
          { icon: 'mail', label: 'Email', onPress: () => contact('Email') },
          { icon: 'message-circle', label: 'WhatsApp', onPress: () => contact('Message') },
          { icon: 'user-plus', label: 'Assign', onPress: () => router.push(`/faculty/assign?faculty=${f.id}`) },
        ]}
      />
      {conflicts.length ? (
        <Banner
          tone="danger"
          style={{ marginTop: 16 }}
          title={`${conflicts.length} schedule conflict${conflicts.length === 1 ? '' : 's'}`}
          message={conflicts.map((c) => `${c.a.title} (${c.a.start} ${tzAbbr(c.a.timeZone)}) overlaps ${c.b.title} (${c.b.start} ${tzAbbr(c.b.timeZone)}) on ${formatDate(c.a.date, { year: false })}`).join('\n')}
          action="Open session"
          onAction={() => router.push(`/session/${conflicts[0].b.id}`)}
        />
      ) : null}

      <View style={{ marginHorizontal: -16, marginTop: 20 }}>
        <UnderlineTabs tabs={tabs} value={tab} onChange={setTab} />
      </View>

      {tab === 'overview' ? (
        <>
          <Section first style={{ marginTop: 16 }}>
            <StatGrid>
              <Stat label="Rating" value={f.rating.toFixed(1)} caption="Participant average" icon="star" tone="warning" />
              <Stat label="Sessions delivered" value={String(f.sessionsDelivered)} caption="All-time with Emeritus" icon="presentation" />
              <Stat label="Utilisation" value={`${f.utilisation}%`} caption="This quarter" icon="gauge" tone={f.utilisation >= 85 ? 'danger' : f.utilisation >= 65 ? 'accent' : 'success'} />
              <Stat label="Active programmes" value={String(assignments.filter((a) => a.status !== 'Declined' && (getProgramme(db, a.programmeId)?.endDate ?? '') >= DEMO_TODAY).length)} caption="Current & upcoming" icon="layers" />
            </StatGrid>
          </Section>
          <Section title="Biography">
            <Card>
              <Text variant="body" tone="secondary">
                {f.bio}
              </Text>
            </Card>
          </Section>
          <Section title="Expertise">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {f.expertise.map((e) => (
                <Tag key={e} label={e} icon="sparkle" />
              ))}
            </View>
          </Section>
          <Section title="Details">
            <Card padding="sm" style={{ paddingHorizontal: 16 }}>
              <KeyValue label="Languages" value={f.languages.join(', ')} icon="languages" />
              <KeyValue label="Email" value={f.email} icon="mail" />
              <KeyValue label="Phone" value={f.phone} icon="phone" />
              <KeyValue label="Preferred airport" value={f.preferredAirport} icon="plane-takeoff" />
              <KeyValue label="Dietary" value={f.dietary ?? 'None recorded'} icon="salad" last />
            </Card>
          </Section>
          <Section title="Performance & feedback" subtitle={feedback.length ? `${feedback.length} recent evaluations` : undefined}>
            {feedback.length ? (
              <View style={{ gap: 10 }}>
                {feedback.map((fb) => (
                  <Card key={fb.id} style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Rating value={fb.rating} />
                      <Text variant="footnote" tone="tertiary" style={{ flex: 1 }} numberOfLines={1}>
                        {getProgramme(db, fb.programmeId)?.shortName} · {formatDate(fb.date)}
                      </Text>
                    </View>
                    <Text variant="callout">“{fb.comment}”</Text>
                    <Text variant="footnote" tone="secondary">
                      {fb.author}
                    </Text>
                  </Card>
                ))}
              </View>
            ) : (
              <EmptyState icon="message-square" title="No feedback yet" message="Evaluations appear here after each programme." />
            )}
          </Section>
        </>
      ) : null}

      {tab === 'schedule' ? (
        <>
          <Section title="Upcoming" first style={{ marginTop: 16 }} action="Availability" onAction={() => router.push(`/faculty/${f.id}/availability`)}>
            {upcoming.length ? (
              <ListGroup>
                {upcoming.map((s) => (
                  <View key={s.id}>
                    <SessionRow session={s} showDate viewerTz={f.timeZone} />
                    {conflicted.has(s.id) ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingBottom: 10, marginTop: -4 }}>
                        <StatusPill label="Schedule conflict" tone="danger" icon="calendar-x" />
                      </View>
                    ) : null}
                  </View>
                ))}
              </ListGroup>
            ) : (
              <EmptyState icon="calendar" title="Nothing scheduled" message="No upcoming sessions for this faculty member." />
            )}
          </Section>
          {past.length ? (
            <Section title="Delivered">
              <ListGroup>
                {past.map((s) => (
                  <SessionRow key={s.id} session={s} showDate compact viewerTz={f.timeZone} />
                ))}
              </ListGroup>
            </Section>
          ) : null}
        </>
      ) : null}

      {tab === 'assignments' ? (
        <Section first style={{ marginTop: 16 }} title="Programme assignments" action="New" onAction={() => router.push(`/faculty/assign?faculty=${f.id}`)}>
          {assignments.length ? (
            <View style={{ gap: 10 }}>
              {assignments.map((a) => {
                const p = getProgramme(db, a.programmeId);
                const next = NEXT_STATUS[a.status];
                return (
                  <Card key={a.id} style={{ gap: 10, opacity: a.status === 'Declined' ? 0.7 : 1 }} onPress={() => router.push(`/programme/${a.programmeId}`)} accessibilityLabel={`${p?.name}, ${a.status}`}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="caption" tone="tertiary">
                          {p?.code} · {a.role}
                        </Text>
                        <Text variant="headline" numberOfLines={2}>
                          {p?.name}
                        </Text>
                        <Text variant="footnote" tone="secondary">
                          {p ? formatRange(p.startDate, p.endDate) : ''} · {a.days} day{a.days === 1 ? '' : 's'}
                          {canFees ? ` · ${money(a.fee)}` : ''}
                        </Text>
                      </View>
                      <StatusPill label={a.status} />
                    </View>
                    <Text variant="footnote" tone="tertiary">
                      Requested {formatDate(a.requestedOn)}
                      {a.confirmedOn ? ` · confirmed ${formatDate(a.confirmedOn)}` : ''}
                    </Text>
                    {next && !p?.archived ? (
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Button title={next.label} size="sm" variant="tinted" onPress={() => advance(a)} />
                        {a.status === 'Request Sent' ? (
                          <Button
                            title="Send reminder"
                            size="sm"
                            variant="secondary"
                            icon="send"
                            onPress={() => {
                              actions.log(a.programmeId, 'comment', `sent a reminder to ${name}`);
                              toast.show({ message: 'Reminder sent', detail: `${name} · ${p?.shortName}`, icon: 'send' });
                            }}
                          />
                        ) : null}
                      </View>
                    ) : null}
                  </Card>
                );
              })}
            </View>
          ) : (
            <EmptyState icon="briefcase" title="No assignments" message="Assign this faculty member to a programme or session." actionLabel="Assign" onAction={() => router.push(`/faculty/assign?faculty=${f.id}`)} />
          )}
        </Section>
      ) : null}

      {tab === 'fees' ? (
        canFees ? (
          <>
            <Section first style={{ marginTop: 16 }}>
              <StatGrid>
                <Stat label="Daily fee" value={money(f.dailyFee)} caption={f.feeCurrency} icon="banknote" />
                <Stat label="Contracted this year" value={money(assignments.filter((a) => ['Confirmed', 'Contract Issued', 'Contracted'].includes(a.status)).reduce((s, a) => s + a.fee, 0))} caption="Confirmed assignments" icon="file-signature" />
                <Stat label="Invoiced" value={money(invoices.reduce((s, t) => s + t.amount, 0))} caption={`${invoices.length} faculty invoice${invoices.length === 1 ? '' : 's'}`} icon="receipt" />
                <Stat label="Paid" value={money(invoices.filter((t) => t.status === 'Paid').reduce((s, t) => s + t.amount, 0))} caption="To date" icon="circle-check" tone="success" />
              </StatGrid>
            </Section>
            <Section title="Contract">
              <Card padding="sm" style={{ paddingHorizontal: 16 }}>
                <KeyValue label="Status" value={f.contractStatus} icon="file-signature" valueTone={f.contractStatus === 'Active' ? 'success' : 'warning'} />
                <KeyValue label="Fee basis" value={`${money(f.dailyFee)} per teaching day`} icon="banknote" />
                <KeyValue label="Travel" value="Business class long-haul, per Duty of Care policy" icon="plane" multiline />
                <KeyValue label="Payment terms" value="Net 30 from invoice" icon="clock" last />
              </Card>
              {f.contractStatus !== 'Active' ? (
                <Button
                  title="Send contract for signature"
                  icon="send"
                  variant="tinted"
                  onPress={() => {
                    actions.update('faculty', f.id, { contractStatus: 'Pending Signature' });
                    toast.show({ message: 'Contract sent for e-signature', detail: name, icon: 'file-signature' });
                  }}
                />
              ) : null}
            </Section>
            <Section title="Fees by assignment">
              <ListGroup>
                {assignments.map((a) => (
                  <ListRow key={a.id} title={getProgramme(db, a.programmeId)?.name ?? ''} subtitle={`${a.role} · ${a.days} days · ${a.status}`} value={money(a.fee)} onPress={() => router.push(`/programme/${a.programmeId}`)} />
                ))}
              </ListGroup>
            </Section>
            <Section title="Faculty invoices & payments">
              {invoices.length ? (
                <ListGroup>
                  {invoices.map((t) => (
                    <ListRow key={t.id} icon="receipt" iconTone={t.status === 'Paid' ? 'success' : t.status === 'Overdue' ? 'danger' : 'warning'} title={t.reference} subtitle={`${t.description} · ${formatDate(t.date)}`} trailing={<StatusPill label={t.status} />} onPress={() => router.push(`/finance/transaction/${t.id}`)} />
                  ))}
                </ListGroup>
              ) : (
                <EmptyState icon="receipt" title="No invoices yet" message="Faculty invoices are recorded after delivery." />
              )}
            </Section>
          </>
        ) : (
          <RestrictedState module="Fee information" onRequest={() => toast.show({ message: 'Access requested', detail: 'Chen Wei will review your request.', icon: 'send' })} />
        )
      ) : null}

      {tab === 'travel' ? (
        <>
          <Section title="Itineraries" first style={{ marginTop: 16 }}>
            {itineraries.length ? (
              <ListGroup>
                {itineraries.map((t) => {
                  const out = t.segments[0];
                  return (
                    <ListRow
                      key={t.id}
                      icon="plane"
                      iconTone={['Booked', 'Ticketed'].includes(t.status) ? 'success' : 'warning'}
                      title={out ? `${out.from} → ${out.to} · ${out.flightNumber}` : getProgramme(db, t.programmeId)?.name ?? 'Itinerary'}
                      subtitle={out ? `${formatDate(out.date, { weekday: true })} ${out.depart} · ${out.cabin}` : t.notes ?? 'No flights booked yet'}
                      meta={getProgramme(db, t.programmeId)?.shortName}
                      trailing={<StatusPill label={t.status} />}
                      onPress={() => router.push(`/travel/${t.id}`)}
                    />
                  );
                })}
              </ListGroup>
            ) : (
              <EmptyState icon="plane" title="No travel" message="Itineraries booked for this faculty member appear here." compact />
            )}
          </Section>
          <Section title="Accommodation">
            {bookings.length ? (
              <ListGroup>
                {bookings.map((b) => (
                  <ListRow key={b.id} icon="bed-double" iconTone="info" title={db.hotels.find((h) => h.id === b.hotelId)?.name ?? 'Hotel'} numberOfLines={2} subtitle={`${formatRange(b.checkIn, b.checkOut)} · ${b.roomType}`} meta={b.confirmationNumber ? `Conf. ${b.confirmationNumber}` : 'Awaiting confirmation'} trailing={<StatusPill label={b.status} />} onPress={() => router.push(`/booking/${b.id}`)} />
                ))}
              </ListGroup>
            ) : (
              <EmptyState icon="bed-double" title="No hotel bookings" compact />
            )}
          </Section>
        </>
      ) : null}

      {tab === 'documents' ? (
        <Section first style={{ marginTop: 16 }} title="Documents">
          {docs.length ? (
            <ListGroup>
              {docs.map((d) => (
                <ListRow key={d.id} leading={<FileIcon format={d.format} size={36} />} title={d.title} numberOfLines={2} subtitle={`${d.kind} · ${d.version} · ${fileSize(d.sizeKb)}`} trailing={<StatusPill label={d.status} />} onPress={() => router.push(`/document/${d.id}`)} />
              ))}
            </ListGroup>
          ) : (
            <EmptyState icon="folder-open" title="No documents" message="Agreements, itineraries and briefs linked to this faculty member appear here." actionLabel="Upload document" onAction={() => router.push('/document/upload')} />
          )}
        </Section>
      ) : null}

      <View style={{ height: 8, backgroundColor: colors.background }} />
      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title={name}
        actions={[
          { label: 'Assign to programme', icon: 'user-plus', onPress: () => router.push(`/faculty/assign?faculty=${f.id}`) },
          { label: 'View availability', icon: 'calendar-days', onPress: () => router.push(`/faculty/${f.id}/availability`) },
          { label: 'Share profile', icon: 'share-2', onPress: () => toast.show({ message: 'Profile link copied', icon: 'copy', tone: 'neutral' }) },
          {
            label: f.availability === 'Unavailable' ? 'Mark available' : 'Mark unavailable this quarter',
            icon: 'calendar-x',
            onPress: () => {
              actions.update('faculty', f.id, { availability: f.availability === 'Unavailable' ? 'Available' : 'Unavailable' });
              toast.show({ message: 'Availability updated', detail: name });
            },
          },
        ]}
      />
    </Screen>
  );
}
