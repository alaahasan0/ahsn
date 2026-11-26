import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { Avatar, Button, Card, Icon, KeyValue, Screen, Section, StatusPill, Text, TextField, Touchable } from '@/components';
import { getStaff } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { makeStyles, useStyles, useTheme } from '@/theme';
import { formatDate } from '@/utils/dates';

const TRANSCRIPT = 'Remind Sofia to confirm the coach for the Meridian site visit by Friday, and add a note that Noor needs step-free access on the day.';

type Stage = 'idle' | 'recording' | 'transcribing' | 'extracted' | 'review' | 'done';

/** Voice-to-Action prototype: record → transcript → extracted fields → suggested action → confirm. */
export default function VoiceScreen() {
  const s = useStyles(styles);
  const db = useDB();
  const actions = useActions();
  const { reduceMotion } = useSession();
  const { colors } = useTheme();
  const [stage, setStage] = useState<Stage>('idle');
  const [seconds, setSeconds] = useState(0);
  const [typed, setTyped] = useState('');
  const [title, setTitle] = useState('Confirm coach for Meridian site visit (15 Apr)');
  const [taskId, setTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (stage !== 'recording') return;
    const t = setInterval(() => setSeconds((x) => x + 1), 1000);
    const stop = setTimeout(() => setStage('transcribing'), 4200);
    return () => {
      clearInterval(t);
      clearTimeout(stop);
    };
  }, [stage]);

  useEffect(() => {
    if (stage !== 'transcribing') return;
    let i = 0;
    const t = setInterval(() => {
      i += reduceMotion ? TRANSCRIPT.length : 3;
      setTyped(TRANSCRIPT.slice(0, i));
      if (i >= TRANSCRIPT.length) {
        clearInterval(t);
        setTimeout(() => setStage('extracted'), 500);
      }
    }, 24);
    return () => clearInterval(t);
  }, [stage, reduceMotion]);

  const sofia = getStaff(db, 's-sofia');
  const confirm = () => {
    const id = actions.createTask({ title, programmeId: 'p-elp', ownerId: 's-sofia', dueDate: '2027-04-02', priority: 'High', category: 'Logistics', description: `Created by voice: “${TRANSCRIPT}”`, relatedPerson: { kind: 'learner', id: 'l-13' } });
    actions.addDiscussionPost('p-elp', 'Voice note: Noor Al Hashimi needs step-free access throughout the site visit on 15 April.');
    actions.log('p-elp', 'comment', 'created a task and a note by voice');
    setTaskId(id);
    setStage('done');
  };

  return (
    <Screen title="Voice to action" back="close" large={false}>
      {stage === 'idle' || stage === 'recording' ? (
        <View style={{ alignItems: 'center', gap: 18, marginTop: 40 }}>
          <Text variant="title2" align="center">
            {stage === 'idle' ? 'Say what needs to happen' : 'Listening…'}
          </Text>
          <Text variant="callout" tone="secondary" align="center" style={{ maxWidth: 300 }}>
            {stage === 'idle' ? 'ProgrammeOS turns a voice note into tasks, notes and updates linked to the right programme.' : `0:${String(seconds).padStart(2, '0')} · tap to stop`}
          </Text>
          <Waveform active={stage === 'recording'} />
          <Touchable
            onPress={() => setStage(stage === 'idle' ? 'recording' : 'transcribing')}
            haptic="medium"
            feedback="scale"
            accessibilityLabel={stage === 'idle' ? 'Start recording' : 'Stop recording'}
            style={[s.mic, { backgroundColor: stage === 'recording' ? colors.danger : colors.primary }]}>
            <Icon name={stage === 'recording' ? 'square' : 'mic'} size={32} color="#FFFFFF" fill={stage === 'recording' ? '#FFFFFF' : undefined} />
          </Touchable>
          <Text variant="footnote" tone="tertiary" align="center">
            Simulated — no microphone access or speech recognition in this prototype.
          </Text>
        </View>
      ) : null}

      {stage !== 'idle' && stage !== 'recording' ? (
        <Animated.View entering={FadeIn} style={{ gap: 4 }}>
          <Section title="Transcript" first>
            <Card style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="audio-lines" size={16} tone="accent" />
                <Text variant="footnote" tone="secondary">
                  Voice note · 0:{String(Math.max(seconds, 4)).padStart(2, '0')}
                </Text>
              </View>
              <Text variant="body">
                {stage === 'transcribing' ? typed : TRANSCRIPT}
                {stage === 'transcribing' ? <Text tone="accent">▍</Text> : null}
              </Text>
            </Card>
          </Section>
        </Animated.View>
      ) : null}

      {stage === 'extracted' || stage === 'review' ? (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Section title="What I understood">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <StatusPill label="Programme · Executive Leadership" tone="violet" icon="layers" size="md" />
              <StatusPill label="Owner · Sofia Marques" tone="accent" icon="user-round" size="md" />
              <StatusPill label="Due · Fri 2 Apr" tone="warning" icon="calendar" size="md" />
              <StatusPill label="Related · Site visit 15 Apr" tone="info" icon="map" size="md" />
              <StatusPill label="Person · Noor Al Hashimi" tone="success" icon="accessibility" size="md" />
            </View>
          </Section>
          <Section title="Suggested actions">
            <Card style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Icon name="square-check-big" size={20} tone="accent" />
                <View style={{ flex: 1 }}>
                  <Text variant="headline">Create task</Text>
                  <Text variant="subhead" tone="secondary">
                    {title} · Sofia · due Fri 2 Apr
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <Icon name="notebook-pen" size={20} tone="violet" />
                <View style={{ flex: 1 }}>
                  <Text variant="headline">Add programme note</Text>
                  <Text variant="subhead" tone="secondary">
                    Noor needs step-free access throughout the site visit
                  </Text>
                </View>
              </View>
            </Card>
          </Section>
          {stage === 'extracted' ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Button title="Re-record" variant="secondary" icon="mic" onPress={() => { setSeconds(0); setTyped(''); setStage('idle'); }} style={{ flex: 1 }} />
              <Button title="Review" onPress={() => setStage('review')} style={{ flex: 2 }} />
            </View>
          ) : null}
        </Animated.View>
      ) : null}

      {stage === 'review' ? (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Section title="Review and confirm">
            <TextField label="Task title" value={title} onChangeText={setTitle} />
            <Card style={{ paddingVertical: 4, marginTop: 12 }}>
              <KeyValue label="Programme" value="Executive Leadership Programme" />
              <KeyValue label="Owner" value={sofia?.name ?? ''} />
              <KeyValue label="Due" value={formatDate('2027-04-02', { weekday: true })} />
              <KeyValue label="Priority" value="High" last />
            </Card>
          </Section>
          <Button title="Confirm 2 actions" icon="check" size="lg" fullWidth onPress={confirm} style={{ marginTop: 20 }} />
        </Animated.View>
      ) : null}

      {stage === 'done' ? (
        <Animated.View entering={FadeInDown} style={{ alignItems: 'center', gap: 10, marginTop: 24 }}>
          <Icon name="circle-check-big" size={52} tone="success" />
          <Text variant="title2">Done</Text>
          <Text tone="secondary" align="center">
            Task assigned to Sofia and note added to the ELP discussion.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Avatar name={sofia?.name ?? ''} hue={sofia?.avatarHue} size={26} />
            <Text variant="footnote" tone="secondary">
              Sofia has been notified
            </Text>
          </View>
          <Button title="Open task" variant="tinted" onPress={() => { router.back(); setTimeout(() => router.push(`/task/${taskId}` as Href), 250); }} style={{ marginTop: 10 }} />
          <Button title="Close" variant="plain" onPress={() => router.back()} />
        </Animated.View>
      ) : null}
    </Screen>
  );
}

function Bar({ i, active }: { i: number; active: boolean }) {
  const { colors } = useTheme();
  const h = useSharedValue(8);
  useEffect(() => {
    if (!active) {
      h.value = withTiming(8);
      return;
    }
    const peak = 14 + ((i * 37) % 46);
    h.value = withDelay((i % 7) * 60, withRepeat(withSequence(withTiming(peak, { duration: 260 + (i % 5) * 40 }), withTiming(10, { duration: 260 })), -1, true));
  }, [active, i, h]);
  const st = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[{ width: 4, borderRadius: 2, backgroundColor: active ? colors.danger : colors.borderStrong }, st]} />;
}

function Waveform({ active }: { active: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 70 }} accessibilityElementsHidden>
      {Array.from({ length: 26 }).map((_, i) => (
        <Bar key={i} i={i} active={active} />
      ))}
    </View>
  );
}

const styles = makeStyles(() => ({
  mic: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
}));
