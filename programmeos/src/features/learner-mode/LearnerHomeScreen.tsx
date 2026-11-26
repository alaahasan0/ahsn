import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Button, Card, HeaderActions, Icon, IconButton, ListGroup, ListRow, ProgressRing, Screen, Section, StatusPill, Text, Touchable } from '@/components';
import { getStaff, unreadCount } from '@/data/selectors';
import { useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { countdown, dueLabel, formatDate, formatDateLong, greeting, timeAgo, tzAbbr } from '@/utils/dates';

import { inZone, InfoTile, JoinPanel, localNow, modeLine, MODE_ICON, PersonaSessionRow, startsIn, TileRow } from '../faculty-mode/common';
import { announcements, moduleProgress, useLearnerScope } from './data';

export default function LearnerHomeScreen() {
  const s = useStyles(styles);
  const db = useDB();
  const { colors } = useTheme();
  const scope = useLearnerScope();
  const { me, tz, current, currentProgramme: p } = scope;
  const now = localNow(tz);
  const next = scope.upcoming[0];
  const z = next ? inZone(next, tz) : undefined;
  const mod = scope.modules.find((m) => moduleProgress(m).state === 'In progress') ?? scope.modules[0];
  const modIndex = mod ? scope.modules.indexOf(mod) + 1 : 0;
  const nextMilestone = db.milestones.filter((m) => m.programmeId === p?.id && m.date >= now.date).sort((a, b) => a.date.localeCompare(b.date))[0];
  const due = scope.assignments
    .map((a) => ({ a, sub: scope.submissions.find((x) => x.assignmentId === a.id) }))
    .filter(({ a, sub }) => a.dueDate >= now.date && (!sub || ['Not Started', 'Draft'].includes(sub.status)))
    .sort((x, y) => x.a.dueDate.localeCompare(y.a.dueDate));
  const openAssessments = scope.assessments.filter((a) => a.status === 'Open');
  const graded = scope.submissions.filter((x) => x.status === 'Graded');
  const avg = graded.length ? Math.round(graded.reduce((t, x) => t + (x.score ?? 0), 0) / graded.length) : undefined;
  const modulesDone = scope.modules.filter((m) => moduleProgress(m).state === 'Completed').length;
  const news = announcements(db, p?.id);

  return (
    <Screen
      title={`${greeting(now.time)}, ${me.firstName}`}
      eyebrow={`${formatDateLong(now.date, true)} · ${tzAbbr(tz)}`}
      subtitle="Welcome back. Here’s your learning at a glance."
      back={false}
      refreshable
      headerRight={
        <HeaderActions>
          <IconButton icon="bell" accessibilityLabel="Notifications" badge={unreadCount(db, 'learner') > 0} onPress={() => router.push('/lm/notifications')} />
          <Touchable onPress={() => router.push('/learner-mode/profile')} accessibilityLabel="Profile" style={{ marginLeft: 4 }}>
            <Avatar name={`${me.firstName} ${me.lastName}`} hue={me.avatarHue} size={32} />
          </Touchable>
        </HeaderActions>
      }>
      {next && z ? (
        <Card padding="lg" style={s.hero}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="overline" tone="accent" style={{ flex: 1 }}>
              Your next session
            </Text>
            <StatusPill label={startsIn(next, tz)} tone="accent" icon="clock" />
          </View>
          <Text variant="title2" style={{ marginTop: 8 }}>
            {next.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Icon name="calendar" size={14} tone="secondary" />
            <Text variant="callout" tone="secondary">
              {formatDate(z.date, { weekday: true, year: false })} · {z.start}–{z.end} {tzAbbr(tz)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Icon name={MODE_ICON[next.deliveryMode]} size={14} tone="secondary" />
            <Text variant="callout" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
              {modeLine(next)}
            </Text>
          </View>
          <View style={{ marginTop: 14 }}>
            <JoinPanel session={next} compact />
          </View>
          <Button title="Session details" variant="plain" iconRight="arrow-right" onPress={() => router.push(`/lm/session/${next.id}`)} style={{ alignSelf: 'flex-start', marginTop: 6 }} />
        </Card>
      ) : null}

      {p && current ? (
        <Section title="Your programme">
          <Card onPress={() => router.push('/learner-mode/programme')} padding="lg" accessibilityLabel={`${p.name}, ${current.progress ?? 0}% complete`}>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <ProgressRing value={current.progress ?? 0} size={68} stroke={7} color={colors.violet}>
                <Text variant="headline" tabular>
                  {current.progress ?? 0}%
                </Text>
              </ProgressRing>
              <View style={{ flex: 1, gap: 3 }}>
                <Text variant="title3">{p.name}</Text>
                {mod ? (
                  <Text variant="subhead" tone="secondary">
                    Module {modIndex} of {scope.modules.length} · {mod.title}
                  </Text>
                ) : null}
                {nextMilestone ? (
                  <Text variant="footnote" tone="accent">
                    Next: {nextMilestone.title} · {formatDate(nextMilestone.date, { year: false })}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        </Section>
      ) : null}

      {due.length || openAssessments.length ? (
        <Section title="Due soon">
          <ListGroup>
            {due.slice(0, 2).map(({ a, sub }) => {
              const d = dueLabel(a.dueDate);
              return <ListRow key={a.id} icon="notebook-pen" iconTone={d.tone === 'neutral' ? 'accent' : d.tone} title={a.title} subtitle={`${a.kind} assignment · ${sub?.status === 'Draft' ? 'Draft saved' : 'Not started'}`} meta={d.text} onPress={() => router.push(`/lm/assignment/${a.id}`)} />;
            })}
            {openAssessments.map((a) => (
              <ListRow key={a.id} icon="users" iconTone="violet" title={a.title} subtitle={`${a.kind} · open now`} meta={dueLabel(a.date).text} onPress={() => router.push('/lm/assessments')} />
            ))}
          </ListGroup>
        </Section>
      ) : null}

      <Section title="Coming up" action="Schedule" onAction={() => router.push('/learner-mode/schedule')}>
        {scope.upcoming.length > 1 ? (
          <ListGroup>
            {scope.upcoming.slice(1, 4).map((x) => (
              <PersonaSessionRow key={x.id} session={x} tz={tz} route={`/lm/session/${x.id}`} />
            ))}
          </ListGroup>
        ) : (
          <Card>
            <Text tone="secondary">No more sessions scheduled yet.</Text>
          </Card>
        )}
      </Section>

      <Section title="Your progress">
        <TileRow>
          <InfoTile icon="user-check" label="Attendance" value={`${current?.attendanceRate ?? 0}%`} tone="success" />
          <InfoTile icon="award" label="Average grade" value={avg ? `${avg} / 100` : '—'} tone="violet" />
          <InfoTile icon="layers" label="Modules complete" value={`${modulesDone} of ${scope.modules.length}`} tone="accent" />
          <InfoTile icon="notebook-pen" label="Assignments graded" value={`${graded.length} of ${scope.assignments.length}`} tone="warning" />
        </TileRow>
      </Section>

      {news.length ? (
        <Section title="Announcements">
          <View style={{ gap: 10 }}>
            {news.map((n) => {
              const from = getStaff(db, n.from);
              return (
                <Card key={n.id} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Avatar name={from?.name ?? ''} hue={from?.avatarHue} size={26} />
                    <Text variant="footnote" tone="secondary" style={{ flex: 1 }} numberOfLines={1}>
                      {from?.name} · {timeAgo(n.date)}
                    </Text>
                    {n.pinned ? <Icon name="pin" size={14} tone="accent" /> : null}
                  </View>
                  <Text variant="headline">{n.title}</Text>
                  <Text variant="callout" tone="secondary">
                    {n.body}
                  </Text>
                </Card>
              );
            })}
          </View>
        </Section>
      ) : null}

      {scope.enrollments.some((e) => e.status === 'Registered' && e.programmeId !== p?.id) ? (
        <Section title="Also on your horizon">
          <ListGroup>
            {scope.enrollments
              .filter((e) => e.status === 'Registered' && e.programmeId !== p?.id)
              .map((e) => {
                const prog = db.programmes.find((x) => x.id === e.programmeId)!;
                return <ListRow key={e.id} icon="graduation-cap" iconTone="accent" title={prog.name} subtitle={`${countdown(prog.startDate)} · ${prog.location}`} onPress={() => router.push(`/lm/overview?programme=${prog.id}`)} />;
              })}
          </ListGroup>
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = makeStyles((t) => ({
  hero: { borderWidth: t.hairline, borderColor: t.colors.border },
}));
