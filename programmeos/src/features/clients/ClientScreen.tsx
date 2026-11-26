import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ActionSheet, Avatar, Card, EmptyState, Icon, KeyValue, ListGroup, ListRow, Monogram, Screen, Section, StatusPill, Text, UnderlineTabs, useToast } from '@/components';
import type { ClientContact, ClientRequest } from '@/data/models';
import { getStaff, programmePhase } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { canSeeFinancials } from '@/navigation/access';
import { makeStyles, useStyles } from '@/theme';
import { formatDate, formatRange, inboxStamp } from '@/utils/dates';
import { money, moneyCompact } from '@/utils/format';

import { ProgrammeCard } from '../shared/ProgrammeCard';
import { RequireAccess } from '../shared/Widgets';
import { CLIENT_TYPE_ICON } from './ClientsScreen';

type Tab = 'overview' | 'contacts' | 'contracts' | 'programmes' | 'requests' | 'comms';

const CHANNEL_ICON = { Email: 'mail', WhatsApp: 'message-circle', Internal: 'at-sign', Discussion: 'message-square', 'Call Note': 'phone' } as const;

export default function ClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { role } = useSession();
  const s = useStyles(styles);
  const [tab, setTab] = useState<Tab>('overview');
  const [contact, setContact] = useState<ClientContact | null>(null);
  const [request, setRequest] = useState<ClientRequest | null>(null);
  const c = db.clients.find((x) => x.id === id);

  if (!c) {
    return (
      <Screen title="Client">
        <EmptyState icon="briefcase" title="Client not found" actionLabel="All clients" onAction={() => router.replace('/clients')} />
      </Screen>
    );
  }

  const contacts = db.clientContacts.filter((x) => x.clientId === c.id);
  const contracts = db.contracts.filter((x) => x.clientId === c.id);
  const progs = db.programmes.filter((p) => p.clientId === c.id).sort((a, b) => b.startDate.localeCompare(a.startDate));
  const requests = db.clientRequests.filter((r) => r.clientId === c.id).sort((a, b) => b.date.localeCompare(a.date));
  const contactNames = contacts.map((x) => x.name);
  const comms = db.communications.filter((m) => m.counterpart.org === c.name || m.counterpart.org === c.shortName || contactNames.includes(m.counterpart.name)).sort((a, b) => b.date.localeCompare(a.date));
  const owner = getStaff(db, c.relationshipOwnerId);
  const delivered = progs.filter((p) => programmePhase(p) === 'completed' || p.archived).filter((p) => !p.cancelled);
  const rated = progs.filter((p) => p.satisfaction);
  const avgSat = rated.length ? rated.reduce((sum, p) => sum + (p.satisfaction ?? 0), 0) / rated.length : c.satisfaction;
  const withNps = progs.filter((p) => p.nps != null);
  const avgNps = withNps.length ? Math.round(withNps.reduce((sum, p) => sum + (p.nps ?? 0), 0) / withNps.length) : undefined;
  const trained = db.enrollments.filter((e) => progs.some((p) => p.id === e.programmeId) && e.status === 'Completed').length;
  const showMoney = canSeeFinancials(role);
  const active = progs.filter((p) => !p.archived && !p.cancelled && ['upcoming', 'in_delivery'].includes(programmePhase(p)));

  const setRequestStatus = (r: ClientRequest, status: ClientRequest['status']) => {
    actions.update('clientRequests', r.id, { status });
    toast.show({ message: `${r.kind} marked ${status.toLowerCase()}`, detail: r.title, icon: status === 'Resolved' ? 'circle-check' : 'activity' });
  };

  return (
    <Screen title={c.shortName} eyebrow={`${c.type} client`} headerBelow={<UnderlineTabs tabs={[{ value: 'overview', label: 'Overview' }, { value: 'contacts', label: 'Contacts', count: contacts.length }, { value: 'contracts', label: 'Agreements', count: contracts.length }, { value: 'programmes', label: 'Programmes', count: progs.length }, { value: 'requests', label: 'Requests', count: requests.filter((r) => r.status !== 'Resolved').length }, { value: 'comms', label: 'Comms', count: comms.length }]} value={tab} onChange={setTab} />}>
      <RequireAccess module="clients">
        {tab === 'overview' ? (
          <>
            <Card padding="md" style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Monogram name={c.name} hue={c.logoHue} size={52} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="title3">{c.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Icon name={CLIENT_TYPE_ICON[c.type]} size={13} tone="tertiary" />
                    <Text variant="footnote" tone="secondary">
                      {c.sector}
                    </Text>
                  </View>
                </View>
                <StatusPill label={c.status} />
              </View>
              <View style={s.stats}>
                <Mini label="Active" value={String(active.length)} />
                <Mini label="Delivered" value={String(delivered.length)} />
                <Mini label="Satisfaction" value={avgSat.toFixed(1)} />
                {showMoney ? <Mini label="Lifetime" value={moneyCompact(c.lifetimeValue)} /> : <Mini label="Since" value={c.since} />}
              </View>
            </Card>

            <Section title="Relationship">
              <Card padding="md" style={{ paddingVertical: 4 }}>
                <KeyValue label="Headquarters" value={c.headquarters} icon="map-pin" />
                <KeyValue label="Owner" value={owner?.name ?? '—'} icon="user" onPress={() => owner && router.push(`/person/${owner.id}`)} />
                <KeyValue label="Client since" value={c.since} icon="calendar" />
                <KeyValue label="Primary contact" value={contacts.find((x) => x.primary)?.name ?? '—'} icon="contact" onPress={() => setTab('contacts')} last />
              </Card>
            </Section>

            <Section title="Client reporting" subtitle="Outcomes across all programmes delivered">
              <View style={s.stats}>
                <Report icon="award" label="Participants certified" value={String(trained)} />
                <Report icon="smile" label="Avg. satisfaction" value={`${avgSat.toFixed(1)} / 5`} />
                <Report icon="thumbs-up" label="Avg. NPS" value={avgNps != null ? String(avgNps) : '—'} />
                <Report icon="layers" label="Programmes" value={String(progs.filter((p) => !p.cancelled).length)} />
              </View>
            </Section>

            {active.length ? (
              <Section title="Current programmes" action="All" onAction={() => setTab('programmes')}>
                <View style={{ gap: 10 }}>
                  {active.slice(0, 2).map((p) => (
                    <ProgrammeCard key={p.id} programme={p} compact />
                  ))}
                </View>
              </Section>
            ) : null}

            {requests.some((r) => r.status !== 'Resolved') ? (
              <Section title="Open requests" action="All" onAction={() => setTab('requests')}>
                <ListGroup>
                  {requests
                    .filter((r) => r.status !== 'Resolved')
                    .map((r) => (
                      <ListRow key={r.id} icon={r.kind === 'Approval' ? 'stamp' : 'message-square'} iconTone={r.kind === 'Approval' ? 'warning' : 'accent'} title={r.title} subtitle={`${db.clientContacts.find((x) => x.id === r.raisedBy)?.name ?? ''} · ${formatDate(r.date, { year: false })}`} trailing={<StatusPill label={r.status} />} onPress={() => setRequest(r)} />
                    ))}
                </ListGroup>
              </Section>
            ) : null}
          </>
        ) : null}

        {tab === 'contacts' ? (
          contacts.length ? (
            <ListGroup>
              {contacts.map((x, i) => (
                <ListRow
                  key={x.id}
                  leading={<Avatar name={x.name} hue={(c.logoHue + i * 53) % 360} size={38} />}
                  title={x.name}
                  subtitle={x.title}
                  meta={[x.primary ? 'Primary contact' : '', x.approver ? 'Approver' : ''].filter(Boolean).join(' · ') || x.email}
                  onPress={() => setContact(x)}
                />
              ))}
            </ListGroup>
          ) : (
            <EmptyState icon="contact" title="No contacts yet" compact />
          )
        ) : null}

        {tab === 'contracts' ? (
          contracts.length ? (
            <ListGroup>
              {contracts.map((k) => (
                <ListRow key={k.id} icon="file-signature" iconTone="violet" title={k.title} subtitle={`${k.reference} · ${k.type}`} meta={`${formatRange(k.startDate, k.endDate)}${showMoney ? ` · ${money(k.value)}` : ''}`} trailing={<StatusPill label={k.status} />} onPress={() => router.push(`/contract/${k.id}`)} numberOfLines={2} />
              ))}
            </ListGroup>
          ) : (
            <EmptyState icon="file-signature" title="No agreements" compact />
          )
        ) : null}

        {tab === 'programmes' ? (
          progs.length ? (
            <View style={{ gap: 10 }}>
              {progs.map((p) => (
                <ProgrammeCard key={p.id} programme={p} compact />
              ))}
            </View>
          ) : (
            <EmptyState icon="layers" title="No programmes yet" compact />
          )
        ) : null}

        {tab === 'requests' ? (
          requests.length ? (
            <ListGroup>
              {requests.map((r) => (
                <ListRow
                  key={r.id}
                  icon={r.kind === 'Approval' ? 'stamp' : 'message-square'}
                  iconTone={r.status === 'Resolved' ? 'success' : r.kind === 'Approval' ? 'warning' : 'accent'}
                  title={r.title}
                  subtitle={r.detail}
                  meta={`${r.kind} · ${db.clientContacts.find((x) => x.id === r.raisedBy)?.name ?? ''} · ${formatDate(r.date, { year: false })}${r.programmeId ? ` · ${db.programmes.find((p) => p.id === r.programmeId)?.shortName}` : ''}`}
                  trailing={<StatusPill label={r.status} />}
                  onPress={() => setRequest(r)}
                  numberOfLines={2}
                />
              ))}
            </ListGroup>
          ) : (
            <EmptyState icon="inbox" title="No requests" compact />
          )
        ) : null}

        {tab === 'comms' ? (
          comms.length ? (
            <ListGroup>
              {comms.map((m) => (
                <ListRow key={m.id} icon={CHANNEL_ICON[m.channel]} iconTone={m.channel === 'WhatsApp' ? 'success' : m.channel === 'Email' ? 'accent' : 'neutral'} title={m.subject} subtitle={m.excerpt} meta={`${m.channel} · ${m.counterpart.name} · ${inboxStamp(m.date)}`} trailing={m.resolved ? <StatusPill label="Resolved" /> : undefined} onPress={() => router.push(`/message/${m.id}`)} />
              ))}
            </ListGroup>
          ) : (
            <EmptyState icon="message-square" title="No communication history" message="Emails, WhatsApp messages and call notes linked to this client will appear here." compact />
          )
        ) : null}
      </RequireAccess>

      <ActionSheet
        visible={!!contact}
        onClose={() => setContact(null)}
        title={contact?.name}
        subtitle={contact?.title}
        actions={[
          { label: 'Call', icon: 'phone', detail: contact?.phone, onPress: () => toast.show({ message: `Calling ${contact?.name}… (simulated)`, icon: 'phone', tone: 'neutral' }) },
          { label: 'Email', icon: 'mail', detail: contact?.email, onPress: () => toast.show({ message: 'New email (simulated)', detail: contact?.email, icon: 'mail', tone: 'neutral' }) },
          { label: 'WhatsApp', icon: 'message-circle', onPress: () => toast.show({ message: 'Opening WhatsApp… (simulated)', detail: 'The conversation will be linked to this client', icon: 'message-circle', tone: 'neutral' }) },
          { label: 'Log a call note', icon: 'notebook-pen', onPress: () => toast.show({ message: 'Call note added', detail: `Linked to ${c.shortName}`, icon: 'notebook-pen' }) },
        ]}
      />
      <ActionSheet
        visible={!!request}
        onClose={() => setRequest(null)}
        title={request?.title}
        subtitle={request?.kind}
        actions={[
          { label: 'Mark in progress', icon: 'play', disabled: request?.status === 'In Progress', onPress: () => request && setRequestStatus(request, 'In Progress') },
          { label: request?.kind === 'Approval' ? 'Mark approved' : 'Mark resolved', icon: 'circle-check', disabled: request?.status === 'Resolved', onPress: () => request && setRequestStatus(request, 'Resolved') },
          { label: 'Reopen', icon: 'rotate-ccw', disabled: request?.status === 'Open', onPress: () => request && setRequestStatus(request, 'Open') },
          ...(request?.programmeId ? [{ label: 'Open programme', icon: 'layers' as const, onPress: () => router.push(`/programme/${request.programmeId}`) }] : []),
        ]}
      />
    </Screen>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text variant="metricSm" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Report({ icon, label, value }: { icon: 'award' | 'smile' | 'thumbs-up' | 'layers'; label: string; value: string }) {
  const s = useStyles(styles);
  return (
    <View style={s.report}>
      <Icon name={icon} size={16} tone="accent" />
      <Text variant="metricSm">{value}</Text>
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = makeStyles((t) => ({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  report: { flexGrow: 1, flexBasis: '45%', backgroundColor: t.colors.surface, borderRadius: t.radii.lg, padding: 14, gap: 4, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
}));
