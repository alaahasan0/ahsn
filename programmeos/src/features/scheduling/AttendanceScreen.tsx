import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Card, EmptyState, Icon, ListGroup, NoResults, ProgressBar, Screen, SearchField, SegmentBar, Text, Touchable, useToast, type IconName } from '@/components';
import { byId, getLearner, getProgramme, learnerName } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { formatDate, TIMEZONES } from '@/utils/dates';
import { searchMatch } from '@/utils/format';

type Mark = 'Present' | 'Late' | 'Absent' | 'Excused';

const MARKS: { value: Mark; icon: IconName; tone: 'success' | 'warning' | 'danger' | 'neutral' }[] = [
  { value: 'Present', icon: 'check', tone: 'success' },
  { value: 'Late', icon: 'clock', tone: 'warning' },
  { value: 'Absent', icon: 'x', tone: 'danger' },
  { value: 'Excused', icon: 'shield-check', tone: 'neutral' },
];

/** One-handed attendance taking: tap a mark per participant, then save. */
export default function AttendanceScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const s = useStyles(styles);
  const { colors } = useTheme();
  const { userId } = useSession();
  const session = byId(db.sessions, sessionId);
  const enrolments = session ? db.enrollments.filter((e) => e.programmeId === session.programmeId && ['Registered', 'Confirmed', 'Attending', 'Completed'].includes(e.status)) : [];
  const [marks, setMarks] = useState<Record<string, Mark | undefined>>(() => {
    const m: Record<string, Mark | undefined> = {};
    for (const a of db.attendance) if (a.sessionId === sessionId) m[a.learnerId] = a.status;
    return m;
  });
  const [query, setQuery] = useState('');

  if (!session) {
    return (
      <Screen title="Attendance" large={false}>
        <EmptyState icon="calendar-x" title="Session not found" actionLabel="Back" onAction={() => router.back()} />
      </Screen>
    );
  }
  const prog = getProgramme(db, session.programmeId);
  const counts = MARKS.map((m) => ({ ...m, n: enrolments.filter((e) => marks[e.learnerId] === m.value).length }));
  const unmarked = enrolments.filter((e) => !marks[e.learnerId]).length;
  const attended = counts[0].n + counts[1].n;
  const shown = enrolments.filter((e) => {
    const l = getLearner(db, e.learnerId);
    return searchMatch(query, learnerName(l), l?.jobTitle, l?.organisation);
  });

  const save = () => {
    for (const e of enrolments) {
      const m = marks[e.learnerId];
      if (m) actions.recordAttendance(session.id, e.learnerId, m);
    }
    actions.update('sessions', session.id, { attendance: 'Recorded', attendedCount: attended });
    if (prog) actions.log(prog.id, 'status_changed', `recorded attendance for “${session.title}” — ${attended}/${enrolments.length} attended`, userId);
    toast.show({ message: 'Attendance saved', detail: `${attended} of ${enrolments.length} attended${unmarked ? ` · ${unmarked} unmarked` : ''}` });
    router.back();
  };

  return (
    <Screen
      title="Attendance"
      eyebrow={`${prog?.shortName ?? ''} · ${formatDate(session.date, { weekday: true })} · ${session.start} ${TIMEZONES[session.timeZone].abbr}`}
      subtitle={session.title}
      footer={enrolments.length ? <Button title="Save attendance" icon="check" onPress={save} style={{ flex: 1 }} /> : undefined}
      headerBelow={
        enrolments.length ? (
          <>
            <Card padding="md" style={{ gap: 12 }}>
              <View style={s.counts}>
                {counts.map((c) => (
                  <View key={c.value} style={s.count}>
                    <Text variant="metricSm" tone={c.tone === 'neutral' ? 'secondary' : c.tone} tabular>
                      {c.n}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {c.value}
                    </Text>
                  </View>
                ))}
                <View style={s.count}>
                  <Text variant="metricSm" tone="tertiary" tabular>
                    {unmarked}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    Unmarked
                  </Text>
                </View>
              </View>
              <SegmentBar total={enrolments.length} segments={[{ value: counts[0].n, color: colors.success }, { value: counts[1].n, color: colors.warning }, { value: counts[2].n, color: colors.danger }, { value: counts[3].n, color: colors.neutral }]} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title="Mark all present" variant="tinted" size="sm" icon="check" onPress={() => setMarks(Object.fromEntries(enrolments.map((e) => [e.learnerId, marks[e.learnerId] ?? 'Present'])))} />
                <Button title="Clear" variant="plain" size="sm" onPress={() => setMarks({})} />
              </View>
            </Card>
            <SearchField value={query} onChangeText={setQuery} placeholder="Search participants" />
          </>
        ) : undefined
      }>
      {!enrolments.length ? (
        <EmptyState icon="users" title="No registered participants yet" message="Attendance opens once participants have registered for this programme." />
      ) : !shown.length ? (
        <NoResults query={query} onClear={() => setQuery('')} />
      ) : (
        <ListGroup>
          {shown.map((e) => {
            const l = getLearner(db, e.learnerId);
            const cur = marks[e.learnerId];
            return (
              <View key={e.id} style={s.row}>
                <View style={s.rowTop}>
                  <Avatar name={learnerName(l)} hue={l?.avatarHue} size={34} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text variant="bodyStrong" numberOfLines={1}>
                      {learnerName(l)}
                    </Text>
                    <Text variant="footnote" tone="secondary" numberOfLines={1}>
                      {l?.jobTitle}
                    </Text>
                  </View>
                </View>
                <View style={s.marks}>
                  {MARKS.map((m) => {
                    const on = cur === m.value;
                    const tc = m.tone === 'success' ? colors.success : m.tone === 'warning' ? colors.warning : m.tone === 'danger' ? colors.danger : colors.neutral;
                    return (
                      <Touchable
                        key={m.value}
                        feedback="scale"
                        haptic="selection"
                        onPress={() => setMarks({ ...marks, [e.learnerId]: on ? undefined : m.value })}
                        accessibilityLabel={`Mark ${learnerName(l)} ${m.value}`}
                        accessibilityState={{ selected: on }}
                        style={[s.mark, { backgroundColor: on ? tc : colors.surfaceAlt }]}
                        hitSlop={2}>
                        <Icon name={m.icon} size={14} color={on ? '#FFFFFF' : colors.textSecondary} strokeWidth={2.4} />
                        <Text variant="footnote" weight={on ? 'semibold' : 'medium'} color={on ? '#FFFFFF' : colors.textSecondary} numberOfLines={1}>
                          {m.value}
                        </Text>
                      </Touchable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ListGroup>
      )}
      {enrolments.length ? <ProgressBar value={((enrolments.length - unmarked) / enrolments.length) * 100} style={{ marginTop: 14 }} /> : null}
    </Screen>
  );
}

const styles = makeStyles((t) => ({
  counts: { flexDirection: 'row', justifyContent: 'space-between' },
  count: { alignItems: 'center', gap: 1, flex: 1 },
  row: { paddingHorizontal: t.spacing.lg, paddingVertical: 12, gap: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  marks: { flexDirection: 'row', gap: 6 },
  mark: { flex: 1, minHeight: 34, borderRadius: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 4 },
}));
