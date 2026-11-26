import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View, type ScrollViewInstance } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconButton, Text, Touchable, toneColors } from '@/components';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { fontFor, makeStyles, useStyles, useTheme } from '@/theme';

import { answer, SUGGESTED, type Answer } from './answers';

type Msg = { id: number; role: 'user' | 'assistant'; text: string; answer?: Answer };

export default function AssistantScreen() {
  const s = useStyles(styles);
  const db = useDB();
  const { userId } = useSession();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string; programme?: string }>();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const asked = useRef(false);

  const ask = (text: string) => {
    if (!text.trim() || typing) return;
    const id = Date.now();
    setMsgs((m) => [...m, { id, role: 'user', text: text.trim() }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { id: id + 1, role: 'assistant', text: '', answer: answer(db, text, userId, params.programme) }]);
      setTyping(false);
    }, 900);
  };

  useEffect(() => {
    if (params.q && !asked.current) {
      asked.current = true;
      ask(params.q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q]);

  useEffect(() => {
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
  }, [msgs.length, typing]);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <IconButton icon="x" accessibilityLabel="Close assistant" onPress={() => router.back()} variant="filled" size={32} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text variant="headline">Programme Assistant</Text>
          <Text variant="caption" tone="tertiary">
            Answers from live ProgrammeOS data
          </Text>
        </View>
        <IconButton icon="rotate-ccw" accessibilityLabel="New conversation" onPress={() => setMsgs([])} size={32} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          {!msgs.length ? (
            <Animated.View entering={FadeInUp.duration(300)} style={{ gap: 16, paddingTop: 24 }}>
              <View style={[s.orb, { backgroundColor: colors.violetSoft }]}>
                <Icon name="sparkles" size={30} tone="violet" />
              </View>
              <Text variant="title2" align="center">
                How can I help?
              </Text>
              <Text variant="callout" tone="secondary" align="center" style={{ maxWidth: 320, alignSelf: 'center' }}>
                Ask about readiness, risks, conflicts, priorities or finance. I read the same records as the rest of ProgrammeOS.
              </Text>
              <View style={{ gap: 8, marginTop: 8 }}>
                {SUGGESTED.map((q) => (
                  <Touchable key={q} onPress={() => ask(q)} style={s.suggestion} feedback="scale" accessibilityLabel={q}>
                    <Text variant="callout" style={{ flex: 1 }}>
                      {q}
                    </Text>
                    <Icon name="arrow-up-right" size={16} tone="tertiary" />
                  </Touchable>
                ))}
              </View>
            </Animated.View>
          ) : null}
          {msgs.map((m) =>
            m.role === 'user' ? (
              <Animated.View key={m.id} entering={FadeInUp.duration(200)} style={s.userBubble}>
                <Text variant="body" color={colors.textOnAccent}>
                  {m.text}
                </Text>
              </Animated.View>
            ) : (
              <Animated.View key={m.id} entering={FadeInUp.duration(260)} style={s.assistant}>
                <View style={[s.avatar, { backgroundColor: colors.violetSoft }]}>
                  <Icon name="sparkles" size={14} tone="violet" />
                </View>
                <View style={{ flex: 1, gap: 10 }}>
                  <Text variant="body">{m.answer?.text}</Text>
                  {m.answer?.items?.length ? (
                    <View style={s.card}>
                      {m.answer.items.map((it, i) => {
                        const tc = toneColors(it.tone ?? 'accent', colors);
                        return (
                          <Touchable key={`${it.title}-${i}`} onPress={() => it.route && router.push(it.route as Href)} disabled={!it.route} style={[s.item, i > 0 && s.itemBorder]} accessibilityLabel={it.title}>
                            <Icon name={it.icon} size={17} color={tc.solid} />
                            <View style={{ flex: 1 }}>
                              <Text variant="callout" weight="medium" numberOfLines={2}>
                                {it.title}
                              </Text>
                              {it.detail ? (
                                <Text variant="footnote" tone="secondary" numberOfLines={2}>
                                  {it.detail}
                                </Text>
                              ) : null}
                            </View>
                            {it.route ? <Icon name="chevron-right" size={15} tone="tertiary" /> : null}
                          </Touchable>
                        );
                      })}
                    </View>
                  ) : null}
                  {m.answer?.footnote ? (
                    <Text variant="footnote" tone="tertiary">
                      {m.answer.footnote}
                    </Text>
                  ) : null}
                  {m.answer?.followUps?.length ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {m.answer.followUps.map((f) => (
                        <Touchable key={f} onPress={() => ask(f)} style={s.follow} accessibilityLabel={f}>
                          <Text variant="footnote" tone="accent" weight="medium">
                            {f}
                          </Text>
                        </Touchable>
                      ))}
                    </View>
                  ) : null}
                </View>
              </Animated.View>
            ),
          )}
          {typing ? <TypingDots /> : null}
        </ScrollView>
        <View style={[s.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={s.inputWrap}>
            <TextInput value={input} onChangeText={setInput} placeholder="Ask about any programme…" placeholderTextColor={colors.textTertiary} style={[fontFor('regular'), s.input]} onSubmitEditing={() => ask(input)} returnKeyType="send" accessibilityLabel="Message the assistant" />
            <Touchable onPress={() => router.push('/voice')} accessibilityLabel="Voice input" hitSlop={8}>
              <Icon name="mic" size={19} tone="secondary" />
            </Touchable>
          </View>
          <IconButton icon="send" variant="primary" accessibilityLabel="Send" onPress={() => ask(input)} disabled={!input.trim() || typing} size={42} />
        </View>
        <Text variant="caption" tone="tertiary" align="center" style={{ paddingBottom: 6 }}>
          Prototype: simulated responses from sample data · no AI service connected
        </Text>
      </KeyboardAvoidingView>
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const { colors } = useTheme();
  const o = useSharedValue(0.3);
  useEffect(() => {
    o.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })), -1));
  }, [delay, o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.violet }, st]} />;
}

function TypingDots() {
  const s = useStyles(styles);
  return (
    <View style={[s.assistant, { alignItems: 'center' }]} accessibilityLabel="Assistant is thinking">
      <View style={s.typing}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}

const styles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: t.hairline, borderBottomColor: t.colors.border },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  orb: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: t.radii.lg, backgroundColor: t.colors.surface, borderWidth: t.hairline, borderColor: t.colors.border },
  userBubble: { alignSelf: 'flex-end', maxWidth: '84%', backgroundColor: t.colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomRightRadius: 6 },
  assistant: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  card: { backgroundColor: t.colors.surface, borderRadius: t.radii.lg, borderWidth: t.hairline, borderColor: t.colors.border, overflow: 'hidden' },
  item: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12 },
  itemBorder: { borderTopWidth: t.hairline, borderTopColor: t.colors.separator },
  follow: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: t.colors.accentSoft },
  typing: { flexDirection: 'row', gap: 5, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: t.colors.surface, marginLeft: 38 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: t.hairline, borderTopColor: t.colors.border, backgroundColor: t.colors.background },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 42, borderRadius: 21, paddingHorizontal: 14, backgroundColor: t.colors.surfaceAlt },
  input: { flex: 1, fontSize: 15, color: t.colors.text, paddingVertical: 10, outlineStyle: 'none' } as never,
}));
