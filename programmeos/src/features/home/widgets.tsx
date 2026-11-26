import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Avatar, Button, Card, Icon, IconTile, ListGroup, ListRow, ProgressBar, ProgressRing, Section, StatusPill, Text, Touchable, toneColors, type IconName } from '@/components';
import type { StaffRoleKey } from '@/data/models';
import {
  facultyName,
  getFaculty,
  getLearner,
  getProgramme,
  groupTasks,
  isAtRisk,
  learnerName,
  pendingApprovalsFor,
  personName,
  portfolioFinance,
  programmePhase,
  readinessFor,
  scheduleConflicts,
  sessionsOnDate,
  sortByPriority,
  unreadCount,
} from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { canSeeFinancials } from '@/navigation/access';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { countdown, DEMO_TODAY, diffDays, dueLabel, formatDate } from '@/utils/dates';
import { money, moneyCompact } from '@/utils/format';

import { readinessTone } from '../shared/helpers';
import { SessionRow, TaskRow } from '../shared/Rows';
import { SmartAlertCard } from '../shared/Widgets';

// ─── Hero: the single most important next action for this role ───────────────

type Hero = { eyebrow: string; title: string; detail: string; cta: string; route: string; icon: IconName; tone: 'accent' | 'warning' | 'danger' | 'success' | 'violet'; ring?: number };

export function useHero(role: StaffRoleKey): Hero {
  const db = useDB();
  const elp = readinessFor(db, 'p-elp');
  const conflicts = scheduleConflicts(db);
  switch (role) {
    case 'programme_manager':
      return { eyebrow: 'Next best action', title: `ELP is ${Math.round(elp.overall)}% ready`, detail: `Go / No-Go on ${formatDate(elp.goNoGoDate, { year: false })}. ${elp.pendingCount} items open, ${elp.criticalCount} critical — travel and venue are behind.`, cta: 'Review readiness', route: '/programme/p-elp/readiness', icon: 'gauge', tone: 'accent', ring: elp.overall };
    case 'programme_coordinator': {
      const today = sessionsOnDate(db, DEMO_TODAY).length;
      return { eyebrow: 'Today’s run', title: `${today} live sessions today`, detail: 'SMP coaching circles at 15:00 SGT and the GBS case clinic at 18:00 GST. Dietary list for ELP catering is overdue.', cta: 'Open calendar', route: '/calendar', icon: 'calendar-clock', tone: 'violet' };
    }
    case 'academic_coordinator': {
      const queue = db.materials.filter((m) => m.status === 'Submitted' || m.status === 'Under Review');
      return { eyebrow: 'Review queue', title: `${queue.length} materials need your review`, detail: 'DTE Module 2 slides are first — the programme starts in 21 days and Orion wants pre-reading by 5 April.', cta: 'Start reviewing', route: '/academics', icon: 'book-open', tone: 'violet' };
    }
    case 'faculty_operations':
      return { eyebrow: 'Needs you now', title: conflicts.length ? 'Schedule conflict on 14 April' : 'Faculty confirmations pending', detail: 'Dr. Marcus Thorne is booked for ELP in Dubai and SMP online at the same moment (09:00 GST = 13:00 SGT).', cta: 'Resolve conflict', route: '/session/ss-smp-3', icon: 'calendar-x', tone: 'danger' };
    case 'logistics_coordinator': {
      const missing = db.itineraries.filter((t) => t.programmeId === 'p-elp' && !['Booked', 'Ticketed', 'Completed'].includes(t.status)).length;
      return { eyebrow: 'Deadline today 18:00', title: `${missing} ELP flights to book`, detail: 'SkyTrail is holding fares until 18:00 GST. The Creekside Grand venue hold also expires on Friday.', cta: 'Open travel', route: '/travel?programme=p-elp', icon: 'plane', tone: 'warning' };
    }
    case 'finance_officer':
      return { eyebrow: 'Finance focus', title: 'GBS travel is 18% over budget', detail: 'Prepare the variance note for Rajiv. Two ELP payments are waiting on approval before Thursday.', cta: 'Open finance', route: '/finance', icon: 'wallet', tone: 'warning' };
    case 'finance_approver': {
      const mine = pendingApprovalsFor(db, 's-rajiv');
      const total = mine.reduce((s, a) => s + (a.amount ?? 0), 0);
      return { eyebrow: 'Awaiting your decision', title: `${mine.length} approvals · ${moneyCompact(total)}`, detail: 'The Creekside Grand deposit is due Thursday — rooms are released if it isn’t paid.', cta: 'Review approvals', route: '/approvals', icon: 'stamp', tone: 'accent' };
    }
    case 'learner_support': {
      const pending = db.enrollments.filter((e) => e.programmeId === 'p-elp' && ['Invited', 'Nominated'].includes(e.status)).length;
      return { eyebrow: 'Participants', title: `${pending} ELP registrations outstanding`, detail: 'Programme starts in 14 days. Joining instructions go out once everyone is registered.', cta: 'View participants', route: '/programme/p-elp/participants', icon: 'user-plus', tone: 'accent' };
    }
    case 'senior_management': {
      const pf = portfolioFinance(db);
      return { eyebrow: 'Portfolio', title: `${moneyCompact(pf.contract)} under contract`, detail: `Forecast margin ${pf.marginPct.toFixed(1)}%. ${db.programmes.filter((p) => isAtRisk(db, p) && !p.archived && !p.cancelled).length} programmes need attention this month.`, cta: 'Executive overview', route: '/report/executive', icon: 'chart-line', tone: 'accent' };
    }
    default:
      return { eyebrow: 'Platform', title: 'All systems operational', detail: '12 active users across 10 roles. 5 workflow templates published. Integrations (email, WhatsApp, calendar) are planned.', cta: 'Open settings', route: '/settings', icon: 'shield-check', tone: 'success' };
  }
}

export function HeroCard({ hero }: { hero: Hero }) {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const tc = toneColors(hero.tone, colors);
  return (
    <Card padding="lg" style={s.hero}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="overline" color={tc.fg}>
            {hero.eyebrow}
          </Text>
          <Text variant="title2">{hero.title}</Text>
          <Text variant="callout" tone="secondary">
            {hero.detail}
          </Text>
        </View>
        {hero.ring != null ? (
          <ProgressRing value={hero.ring} size={64} stroke={6} color={colors[readinessTone(hero.ring) === 'success' ? 'success' : readinessTone(hero.ring) === 'warning' ? 'warning' : 'accent']}>
            <Text variant="headline" tabular>
              {Math.round(hero.ring)}%
            </Text>
          </ProgressRing>
        ) : (
          <View style={[s.heroIcon, { backgroundColor: tc.bg }]}>
            <Icon name={hero.icon} size={24} color={tc.solid} />
          </View>
        )}
      </View>
      <Button title={hero.cta} iconRight="arrow-right" onPress={() => router.push(hero.route as Href)} style={{ marginTop: 14, alignSelf: 'flex-start' }} size="md" />
    </Card>
  );
}

// ─── Today strip ──────────────────────────────────────────────────────────────

export function TodayStrip() {
  const db = useDB();
  const { userId } = useSession();
  const s = useStyles(styles);
  const mine = groupTasks(db.tasks.filter((t) => t.ownerId === userId));
  const items: { label: string; value: number; icon: IconName; route: string; tone: 'danger' | 'accent' | 'warning' | 'violet' }[] = [
    { label: 'Overdue', value: mine.overdue.length, icon: 'circle-alert', route: '/tasks', tone: 'danger' },
    { label: 'Due today', value: mine.today.length, icon: 'square-check-big', route: '/tasks', tone: 'accent' },
    { label: 'Sessions', value: sessionsOnDate(db, DEMO_TODAY).length, icon: 'calendar-days', route: '/calendar', tone: 'violet' },
    { label: 'Approvals', value: pendingApprovalsFor(db, userId).length, icon: 'stamp', route: '/approvals', tone: 'warning' },
  ];
  return (
    <View style={s.strip}>
      {items.map((i) => (
        <Touchable key={i.label} onPress={() => router.push(i.route as Href)} feedback="scale" style={s.stripItem} accessibilityLabel={`${i.value} ${i.label}`}>
          <IconTile icon={i.icon} tone={i.value ? i.tone : 'neutral'} size={28} />
          <Text variant="metricSm" tabular>
            {i.value}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {i.label}
          </Text>
        </Touchable>
      ))}
    </View>
  );
}

// ─── Smart alerts carousel ────────────────────────────────────────────────────

const ROLE_ALERTS: Partial<Record<StaffRoleKey, string[]>> = {
  academic_coordinator: ['materials_missing', 'faculty_confirmation'],
  faculty_operations: ['schedule_conflict', 'faculty_confirmation', 'materials_missing'],
  logistics_coordinator: ['itinerary_missing', 'hotel_deadline', 'schedule_conflict'],
  finance_officer: ['budget_overrun', 'hotel_deadline'],
  finance_approver: ['budget_overrun'],
  learner_support: ['registration_incomplete', 'itinerary_missing'],
};

export function AlertsCarousel({ role }: { role: StaffRoleKey }) {
  const db = useDB();
  const filter = ROLE_ALERTS[role];
  const alerts = db.smartAlerts.filter((a) => !a.dismissed && (!filter || filter.includes(a.kind)));
  if (!alerts.length) return null;
  return (
    <Section title="Smart alerts" subtitle={`${alerts.length} things ProgrammeOS noticed`} action="See all" onAction={() => router.push('/alerts')}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }} snapToInterval={282} decelerationRate="fast">
        {alerts.map((a) => (
          <SmartAlertCard key={a.id} alert={a} width={272} />
        ))}
      </ScrollView>
    </Section>
  );
}

// ─── Readiness overview ───────────────────────────────────────────────────────

export function ReadinessOverview() {
  const db = useDB();
  const { colors } = useTheme();
  const upcoming = db.programmes.filter((p) => programmePhase(p) === 'upcoming').sort((a, b) => a.startDate.localeCompare(b.startDate));
  return (
    <Section title="Programme readiness" subtitle="Upcoming programmes, soonest first" action="All" onAction={() => router.push('/programmes')}>
      <ListGroup>
        {upcoming.map((p) => {
          const r = readinessFor(db, p.id);
          const tone = readinessTone(r.overall, r.threshold);
          const days = diffDays(p.startDate, DEMO_TODAY);
          return (
            <Touchable key={p.id} onPress={() => router.push(`/programme/${p.id}/readiness`)} feedback="highlight" pressedStyle={{ backgroundColor: colors.surfacePressed }} style={{ padding: 14, gap: 8 }} accessibilityLabel={`${p.name} ${Math.round(r.overall)}% ready`}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                  {p.name}
                </Text>
                <Text variant="headline" tabular color={toneColors(tone, colors).fg}>
                  {Math.round(r.overall)}%
                </Text>
              </View>
              <ProgressBar value={r.overall} color={toneColors(tone, colors).solid} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="footnote" tone={days <= 21 && r.overall < r.threshold ? 'warning' : 'secondary'}>
                  {countdown(p.startDate)} · {formatDate(p.startDate, { year: false })}
                </Text>
                <Text variant="footnote" tone="tertiary">
                  {r.criticalCount ? `${r.criticalCount} critical` : `${r.pendingCount} open`}
                </Text>
              </View>
            </Touchable>
          );
        })}
      </ListGroup>
    </Section>
  );
}

// ─── Priorities & sessions ────────────────────────────────────────────────────

export function Priorities() {
  const db = useDB();
  const { userId } = useSession();
  const open = db.tasks.filter((t) => t.ownerId === userId && t.status !== 'Done').sort(sortByPriority);
  const top = [...open.filter((t) => t.dueDate <= DEMO_TODAY), ...open.filter((t) => t.dueDate > DEMO_TODAY)].slice(0, 4);
  return (
    <Section title="Your priorities" action="All tasks" onAction={() => router.push('/tasks')}>
      {top.length ? (
        <ListGroup>
          {top.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </ListGroup>
      ) : (
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="circle-check-big" size={20} tone="success" />
            <Text tone="secondary">You’re all caught up. Nice work.</Text>
          </View>
        </Card>
      )}
    </Section>
  );
}

export function TodaySessions() {
  const db = useDB();
  const list = sessionsOnDate(db, DEMO_TODAY);
  const upcoming = db.sessions.filter((s) => s.date > DEMO_TODAY && s.status !== 'Cancelled').sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)).slice(0, 2);
  return (
    <Section title="Today’s sessions" action="Calendar" onAction={() => router.push('/calendar')}>
      <ListGroup>
        {list.map((s) => (
          <SessionRow key={s.id} session={s} />
        ))}
        {upcoming.map((s) => (
          <SessionRow key={s.id} session={s} showDate compact />
        ))}
      </ListGroup>
    </Section>
  );
}

// ─── Role-specific widgets ────────────────────────────────────────────────────

export function ApprovalsWidget() {
  const db = useDB();
  const { userId } = useSession();
  const mine = pendingApprovalsFor(db, userId);
  if (!mine.length) return null;
  return (
    <Section title="Waiting for your approval" action="All" onAction={() => router.push('/approvals')}>
      <ListGroup>
        {mine.slice(0, 4).map((a) => (
          <ListRow key={a.id} icon="stamp" iconTone={a.urgent ? 'danger' : 'warning'} title={a.title} subtitle={`${getProgramme(db, a.programmeId)?.shortName} · ${a.kind}${a.amount ? ` · ${money(a.amount)}` : ''}`} meta={dueLabel(a.dueDate).text} onPress={() => router.push(`/approval/${a.id}`)} />
        ))}
      </ListGroup>
    </Section>
  );
}

export function FinanceSnapshot() {
  const db = useDB();
  const pf = portfolioFinance(db, db.programmes.filter((p) => !p.archived).map((p) => p.id));
  const s = useStyles(styles);
  return (
    <Section title="Finance snapshot" subtitle="Active portfolio · illustrative figures" action="Finance" onAction={() => router.push('/finance')}>
      <View style={s.kpis}>
        <Kpi label="Contracted" value={moneyCompact(pf.contract)} />
        <Kpi label="Committed" value={moneyCompact(pf.committed)} />
        <Kpi label="Receivable" value={moneyCompact(pf.receivable)} tone="warning" />
        <Kpi label="Margin" value={`${pf.marginPct.toFixed(1)}%`} tone="success" />
      </View>
    </Section>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  const s = useStyles(styles);
  return (
    <View style={s.kpi}>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
      <Text variant="metricSm" tone={tone ?? 'primary'}>
        {value}
      </Text>
    </View>
  );
}

export function ReviewQueue() {
  const db = useDB();
  const queue = db.materials.filter((m) => ['Submitted', 'Under Review', 'Changes Requested'].includes(m.status));
  return (
    <Section title="Materials in review" action="Academics" onAction={() => router.push('/academics')}>
      <ListGroup>
        {queue.map((m) => (
          <ListRow key={m.id} icon="file-text" iconTone="violet" title={m.title} subtitle={`${getProgramme(db, m.programmeId)?.shortName} · ${facultyName(getFaculty(db, m.ownerFacultyId))}`} trailing={<StatusPill label={m.status} />} onPress={() => router.push(`/material/${m.id}`)} />
        ))}
      </ListGroup>
    </Section>
  );
}

export function FacultyConfirmations() {
  const db = useDB();
  const pending = db.facultyAssignments.filter((a) => ['Request Sent', 'Proposed', 'Declined'].includes(a.status) && !getProgramme(db, a.programmeId)?.archived);
  return (
    <Section title="Faculty confirmations" action="Assign" onAction={() => router.push('/faculty/assign')}>
      <ListGroup>
        {pending.map((a) => {
          const f = getFaculty(db, a.facultyId);
          return <ListRow key={a.id} leading={<Avatar name={f?.name ?? ''} hue={f?.avatarHue} size={34} />} title={facultyName(f)} subtitle={`${getProgramme(db, a.programmeId)?.shortName} · ${a.role} · requested ${formatDate(a.requestedOn, { year: false })}`} trailing={<StatusPill label={a.status} />} onPress={() => router.push(`/faculty/${a.facultyId}`)} />;
        })}
      </ListGroup>
    </Section>
  );
}

export function LogisticsWatch() {
  const db = useDB();
  const deadlines = db.hotelBookings.filter((b) => ['Provisional', 'Requested'].includes(b.status)).slice(0, 3);
  const missing = db.itineraries.filter((t) => ['Missing', 'Options Sent', 'Requested'].includes(t.status)).length;
  return (
    <Section title="Logistics watch" action="Logistics" onAction={() => router.push('/logistics')}>
      <ListGroup>
        <ListRow icon="plane" iconTone="warning" title={`${missing} itineraries not yet booked`} subtitle="Across ELP, AFL and AI4BL" onPress={() => router.push('/travel')} />
        {deadlines.map((b) => (
          <ListRow key={b.id} icon="bed-double" iconTone="info" title={`${personName(db, b.guest.id)} · ${b.status}`} subtitle={`${getProgramme(db, b.programmeId)?.shortName} · releases ${formatDate(b.cancellationDeadline, { year: false })}`} onPress={() => router.push(`/booking/${b.id}`)} />
        ))}
      </ListGroup>
    </Section>
  );
}

export function RegistrationsWidget() {
  const db = useDB();
  const pending = db.enrollments.filter((e) => ['Invited', 'Nominated'].includes(e.status) && programmePhase(getProgramme(db, e.programmeId)!) === 'upcoming').slice(0, 5);
  const needs = db.learners.filter((l) => l.accessibility).slice(0, 3);
  return (
    <>
      <Section title="Registrations to chase">
        <ListGroup>
          {pending.map((e) => {
            const l = getLearner(db, e.learnerId);
            return <ListRow key={e.id} leading={<Avatar name={learnerName(l)} hue={l?.avatarHue} size={34} />} title={learnerName(l)} subtitle={`${getProgramme(db, e.programmeId)?.shortName} · ${l?.jobTitle}`} trailing={<StatusPill label={e.status} />} onPress={() => router.push(`/learner/${e.learnerId}`)} />;
          })}
        </ListGroup>
      </Section>
      <Section title="Accessibility requirements">
        <ListGroup>
          {needs.map((l) => (
            <ListRow key={l.id} icon="accessibility" iconTone="accent" title={learnerName(l)} subtitle={l.accessibility} numberOfLines={1} onPress={() => router.push(`/learner/${l.id}`)} />
          ))}
        </ListGroup>
      </Section>
    </>
  );
}

export function AtRiskProgrammes() {
  const db = useDB();
  const list = db.programmes.filter((p) => !p.archived && !p.cancelled && isAtRisk(db, p));
  return (
    <Section title="Needs leadership attention">
      <ListGroup>
        {list.map((p) => (
          <ListRow key={p.id} icon="triangle-alert" iconTone="warning" title={p.name} subtitle={programmePhase(p) === 'upcoming' ? `${Math.round(readinessFor(db, p.id).overall)}% ready · ${countdown(p.startDate)}` : `Financial status: ${p.status.financial}`} onPress={() => router.push(`/programme/${p.id}`)} />
        ))}
      </ListGroup>
    </Section>
  );
}

export function AdminWidget() {
  const db = useDB();
  return (
    <Section title="Administration">
      <ListGroup>
        <ListRow icon="users" title="Users & roles" value={`${db.staff.length} staff`} onPress={() => router.push('/people')} />
        <ListRow icon="workflow" title="Workflow templates" value={`${db.workflowTemplates.length}`} onPress={() => router.push('/workflows')} />
        <ListRow icon="link-2" title="Integrations" value="Planned" onPress={() => router.push('/settings')} />
        <ListRow icon="layout-dashboard" title="UI state gallery" onPress={() => router.push('/states')} />
        <ListRow icon="bell" title="Unread notifications" value={`${unreadCount(db, 'staff')}`} onPress={() => router.push('/notifications')} />
      </ListGroup>
    </Section>
  );
}

export function AssistantPrompt() {
  const s = useStyles(styles);
  const { colors } = useTheme();
  const prompts = ['What is still pending before ELP?', 'Which programmes are at risk?', 'Summarise today’s priorities'];
  return (
    <Section title="Ask ProgrammeOS">
      <Card padding="md" style={{ gap: 12 }}>
        <Touchable onPress={() => router.push('/assistant')} style={s.askBar} accessibilityLabel="Ask the programme assistant">
          <Icon name="sparkles" size={18} tone="violet" />
          <Text tone="tertiary" style={{ flex: 1 }}>
            Ask about any programme…
          </Text>
          <Touchable onPress={() => router.push('/voice')} accessibilityLabel="Voice to action" hitSlop={10} style={[s.mic, { backgroundColor: colors.violetSoft }]}>
            <Icon name="mic" size={16} tone="violet" />
          </Touchable>
        </Touchable>
        <View style={{ gap: 8 }}>
          {prompts.map((p) => (
            <Touchable key={p} onPress={() => router.push(`/assistant?q=${encodeURIComponent(p)}`)} style={s.prompt} accessibilityLabel={p}>
              <Icon name="arrow-up-right" size={14} tone="tertiary" />
              <Text variant="callout" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
                {p}
              </Text>
            </Touchable>
          ))}
        </View>
      </Card>
    </Section>
  );
}

export function RoleWidgets({ role }: { role: StaffRoleKey }): ReactNode {
  const seeFinance = canSeeFinancials(role);
  switch (role) {
    case 'programme_manager':
      return (
        <>
          <AlertsCarousel role={role} />
          <ReadinessOverview />
          <Priorities />
          <ApprovalsWidget />
          <TodaySessions />
          <AssistantPrompt />
        </>
      );
    case 'programme_coordinator':
      return (
        <>
          <TodaySessions />
          <Priorities />
          <AlertsCarousel role={role} />
          <ReadinessOverview />
          <AssistantPrompt />
        </>
      );
    case 'academic_coordinator':
      return (
        <>
          <ReviewQueue />
          <Priorities />
          <AlertsCarousel role={role} />
          <TodaySessions />
        </>
      );
    case 'faculty_operations':
      return (
        <>
          <AlertsCarousel role={role} />
          <FacultyConfirmations />
          <Priorities />
          <TodaySessions />
        </>
      );
    case 'logistics_coordinator':
      return (
        <>
          <AlertsCarousel role={role} />
          <LogisticsWatch />
          <Priorities />
          <ReadinessOverview />
        </>
      );
    case 'finance_officer':
    case 'finance_approver':
      return (
        <>
          <ApprovalsWidget />
          <FinanceSnapshot />
          <AlertsCarousel role={role} />
          <Priorities />
        </>
      );
    case 'learner_support':
      return (
        <>
          <RegistrationsWidget />
          <AlertsCarousel role={role} />
          <Priorities />
        </>
      );
    case 'senior_management':
      return (
        <>
          {seeFinance ? <FinanceSnapshot /> : null}
          <AtRiskProgrammes />
          <ReadinessOverview />
          <ApprovalsWidget />
          <AssistantPrompt />
        </>
      );
    default:
      return (
        <>
          <AdminWidget />
          <AlertsCarousel role={role} />
          <AssistantPrompt />
        </>
      );
  }
}

const styles = makeStyles((t) => ({
  hero: { borderWidth: t.hairline, borderColor: t.colors.border },
  heroIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  strip: { flexDirection: 'row', gap: 8, marginTop: t.spacing.lg },
  stripItem: { flex: 1, backgroundColor: t.colors.surface, borderRadius: t.radii.lg, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', gap: 4, borderWidth: t.isDark ? t.hairline : 0, borderColor: t.colors.border },
  kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: { flexGrow: 1, flexBasis: '45%', backgroundColor: t.colors.surface, borderRadius: t.radii.lg, padding: 14, gap: 2 },
  askBar: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, borderRadius: 23, paddingLeft: 14, paddingRight: 6, backgroundColor: t.colors.surfaceAlt },
  mic: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
}));
