import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Banner, Button, Card, EmptyState, FileIcon, Icon, ListGroup, ListRow, Screen, Section, StatusPill, Tag, Text, useToast } from '@/components';
import { facultyName, getFaculty, getProgramme, getSession } from '@/data/selectors';
import { useDB } from '@/data/store';
import { makeStyles, useStyles } from '@/theme';
import { durationMinutesLabel, formatDate, formatDateLong, tzAbbr } from '@/utils/dates';

import { SESSION_KIND_ICON } from '../shared/helpers';
import { inZone, isLive, isUpcoming, JoinPanel, startsIn } from '../faculty-mode/common';
import { localState, useLocalState } from '../faculty-mode/localState';
import { attendanceHistory, useLearnerScope } from './data';

export default function LearnerSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = useStyles(styles);
  const db = useDB();
  const toast = useToast();
  const local = useLocalState();
  const scope = useLearnerScope();
  const session = getSession(db, id);
  if (!session || !scope.activeIds.includes(session.programmeId)) {
    return (
      <Screen title="Session">
        <EmptyState icon="calendar-x" title="Session not available" message="This session isn’t part of your programme." />
      </Screen>
    );
  }
  const tz = scope.tz;
  const z = inZone(session, tz);
  const p = getProgramme(db, session.programmeId)!;
  const mod = db.modules.find((m) => m.id === session.moduleId);
  const upcoming = isUpcoming(session);
  const live = isLive(session);
  const faculty = session.facultyIds.map((f) => getFaculty(db, f)!).filter(Boolean);
  const materials = session.materialIds.map((m) => scope.materials.find((x) => x.id === m)).filter((m): m is NonNullable<typeof m> => !!m);
  const added = local.calendarAdded.includes(session.id);
  const feedbackDone = local.feedbackGiven.includes(session.id);
  const attended = attendanceHistory(db, scope.me.id).find((a) => a.session?.id === session.id);
  const multiDay = session.date !== session.endDate;

  return (
    <Screen title={session.title} eyebrow={`${p.shortName}${mod ? ` · Module ${mod.order}` : ''}`}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <StatusPill label={live ? 'Happening now' : upcoming ? startsIn(session, tz) : 'Completed'} tone={live ? 'danger' : upcoming ? 'accent' : 'neutral'} size="md" icon={upcoming ? 'clock' : undefined} />
        <Tag label={session.kind} icon={SESSION_KIND_ICON[session.kind]} />
        <Tag label={session.deliveryMode === 'Virtual' ? 'Online' : session.deliveryMode} />
      </View>

      <Card padding="lg" style={{ marginTop: 14, gap: 4 }}>
        <Text variant="metric">
          {z.start}–{z.end} <Text variant="headline" tone="secondary">{tzAbbr(tz)}</Text>
        </Text>
        <Text variant="callout" tone="secondary">
          {multiDay ? `${formatDate(z.date, { weekday: true, year: false })} – ${formatDate(z.endDate, { weekday: true })}` : formatDateLong(z.date, true)} · {durationMinutesLabel(session.start, session.end)}
          {multiDay ? ' each day' : ''}
        </Text>
        {session.timeZone !== tz ? (
          <Text variant="footnote" tone="tertiary">
            {session.start}–{session.end} {tzAbbr(session.timeZone)} local to the venue
          </Text>
        ) : null}
        {upcoming ? (
          <Button
            title={added ? 'In your calendar' : 'Add to calendar'}
            icon={added ? 'calendar-check' : 'calendar-plus'}
            variant={added ? 'success' : 'tinted'}
            size="sm"
            style={{ alignSelf: 'flex-start', marginTop: 10 }}
            onPress={() => {
              if (added) return;
              localState.addTo('calendarAdded', session.id);
              toast.show({ message: 'Added to your calendar', detail: 'Simulated — includes the joining link and a 15-minute reminder.', icon: 'calendar-check' });
            }}
          />
        ) : null}
      </Card>

      {!upcoming ? (
        feedbackDone ? (
          <Banner tone="success" title="Thanks for your feedback" message="It goes straight to your faculty and programme team." style={{ marginTop: 14 }} />
        ) : (
          <Banner tone="accent" title="How was this session?" message="Two minutes, anonymous. It genuinely shapes the next session." action="Give feedback" onAction={() => router.push(`/lm/feedback-form?session=${session.id}`)} style={{ marginTop: 14 }} />
        )
      ) : null}

      <Section title={session.deliveryMode === 'Hybrid' ? 'Join in person or online' : session.deliveryMode === 'Virtual' ? 'How to join' : 'Where to go'}>
        <JoinPanel session={session} />
        {session.deliveryMode === 'Hybrid' ? (
          <Text variant="footnote" tone="secondary">
            Join in the room if you can; the online link is for participants travelling or unwell.
          </Text>
        ) : null}
      </Section>

      <Section title="What to expect">
        <Card padding="sm" style={{ paddingHorizontal: 16 }}>
          {session.agenda.map((a, i) => (
            <View key={a.time + a.item} style={[s.agendaRow, i < session.agenda.length - 1 && s.border]}>
              <Text variant="headline" tabular style={{ width: 52 }}>
                {a.time}
              </Text>
              <Text variant="callout" style={{ flex: 1 }}>
                {a.item}
              </Text>
            </View>
          ))}
        </Card>
        <Card style={{ gap: 8 }}>
          {session.objectives.map((o) => (
            <View key={o} style={{ flexDirection: 'row', gap: 8 }}>
              <Icon name="target" size={15} tone="accent" />
              <Text variant="callout" style={{ flex: 1 }}>
                {o}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title={faculty.length > 1 ? 'Faculty' : 'Your faculty'}>
        <ListGroup>
          {faculty.map((f) => (
            <ListRow key={f.id} leading={<Avatar name={f.name} hue={f.avatarHue} size={40} />} title={facultyName(f)} subtitle={f.title} numberOfLines={1} />
          ))}
        </ListGroup>
      </Section>

      <Section title="Prepare">
        {materials.length ? (
          <ListGroup>
            {materials.map((m) => (
              <ListRow key={m.id} leading={<FileIcon format={m.format} size={36} />} title={m.title} subtitle={m.kind} onPress={() => router.push(`/lm/material/${m.id}`)} />
            ))}
          </ListGroup>
        ) : (
          <Card variant="alt" padding="sm">
            <Text variant="footnote" tone="secondary">
              {upcoming ? 'Materials will be shared before the session.' : 'No materials were shared for this session.'}
            </Text>
          </Card>
        )}
      </Section>

      {attended ? (
        <Section title="Your attendance">
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon name="user-check" size={18} tone="success" />
            <Text style={{ flex: 1 }}>Recorded as {attended.status.toLowerCase()}</Text>
            <StatusPill label={attended.status} tone={attended.status === 'Present' ? 'success' : attended.status === 'Late' ? 'warning' : 'neutral'} />
          </Card>
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = makeStyles((t) => ({
  agendaRow: { flexDirection: 'row', gap: 12, paddingVertical: 11 },
  border: { borderBottomWidth: t.hairline, borderBottomColor: t.colors.separator },
}));
