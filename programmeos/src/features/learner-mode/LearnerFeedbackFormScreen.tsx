import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, FormSection, Icon, ListGroup, ListRow, Screen, SuccessState, Text, TextField, Touchable, haptic } from '@/components';
import { facultyName, getFaculty, getSession } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { formatDate } from '@/utils/dates';

import { localState } from '../faculty-mode/localState';
import { useLearnerScope } from './data';

function StarInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" tone="secondary">
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 6 }} accessibilityRole="adjustable" accessibilityLabel={`${label}: ${value || 'not rated'} of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Touchable
            key={i}
            feedback="scale"
            onPress={() => {
              haptic('selection');
              onChange(i);
            }}
            accessibilityLabel={`${i} star${i === 1 ? '' : 's'}`}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="star" size={30} color={i <= value ? colors.warning : colors.borderStrong} fill={i <= value ? colors.warning : undefined} strokeWidth={1.6} />
          </Touchable>
        ))}
      </View>
    </View>
  );
}

export default function LearnerFeedbackFormScreen() {
  const params = useLocalSearchParams<{ session?: string }>();
  const db = useDB();
  const { colors } = useTheme();
  const scope = useLearnerScope();
  const session = getSession(db, params.session) ?? scope.past[0];
  const [content, setContent] = useState(0);
  const [faculty, setFaculty] = useState(0);
  const [relevance, setRelevance] = useState(0);
  const [nps, setNps] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [done, setDone] = useState(false);
  const lead = getFaculty(db, session?.facultyIds[0]);

  if (done) {
    return (
      <Screen title="Thank you" back="close" large={false}>
        <SuccessState title="Feedback sent" message={`Thank you, ${scope.me.firstName}. ${facultyName(lead)} and the programme team will see a summary after the session closes.`} actionLabel="Done" onAction={() => router.back()} />
      </Screen>
    );
  }

  const ready = content > 0 && faculty > 0 && relevance > 0 && nps != null;
  return (
    <Screen
      title="Session feedback"
      back="close"
      large={false}
      footer={
        <Button
          title="Send feedback"
          icon="send"
          size="lg"
          style={{ flex: 1 }}
          disabled={!ready}
          onPress={() => {
            if (session) localState.addTo('feedbackGiven', session.id);
            setDone(true);
          }}
        />
      }>
      {session ? (
        <Card variant="alt" padding="md" style={{ gap: 2 }}>
          <Text variant="headline">{session.title}</Text>
          <Text variant="footnote" tone="secondary">
            {formatDate(session.date, { weekday: true })} · {facultyName(lead)}
          </Text>
        </Card>
      ) : null}
      <FormSection title="Rate the session">
        <StarInput label="Content & materials" value={content} onChange={setContent} />
        <StarInput label="Faculty" value={faculty} onChange={setFaculty} />
        <StarInput label="Relevance to my role" value={relevance} onChange={setRelevance} />
      </FormSection>
      <FormSection title="How likely are you to recommend this programme to a colleague?">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {Array.from({ length: 11 }, (_, i) => i).map((i) => {
            const sel = nps === i;
            const tint = i >= 9 ? colors.success : i >= 7 ? colors.warning : colors.danger;
            return (
              <Touchable
                key={i}
                feedback="scale"
                onPress={() => {
                  haptic('selection');
                  setNps(i);
                }}
                accessibilityLabel={`${i}`}
                accessibilityState={{ selected: sel }}
                style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? tint : colors.surface, borderWidth: 1, borderColor: sel ? tint : colors.border }}>
                <Text variant="headline" tabular color={sel ? '#FFFFFF' : colors.text}>
                  {i}
                </Text>
              </Touchable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="caption" tone="tertiary">
            Not likely
          </Text>
          <Text variant="caption" tone="tertiary">
            Extremely likely
          </Text>
        </View>
      </FormSection>
      <FormSection title="Anything else?">
        <TextField value={comment} onChangeText={setComment} placeholder="What worked well? What would you change?" multiline />
        <ListGroup>
          <ListRow icon="eye-off" title="Submit anonymously" subtitle="Your name won’t be shared with faculty" switchValue={anonymous} onSwitch={setAnonymous} />
        </ListGroup>
      </FormSection>
    </Screen>
  );
}
