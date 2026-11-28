import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, type ScrollViewInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { BrandMark } from '@/components/domain/BrandMark';
import { Button } from '@/components/ui/Button';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { Header } from '@/components/ui/Header';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Pressable } from '@/components/ui/Pressable';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useI18n } from '@/i18n';
import { uid } from '@/lib/id';
import { useActions, useAppState } from '@/store/AppStore';
import { usePreferences } from '@/store/preferences';
import { useAvailabilityContext, useLookup } from '@/store/selectors';
import { useTheme } from '@/theme';

import { ProposalCard } from './ProposalCard';
import { runIntent, spokenDay, spokenTime, SUGGESTED_INTENTS, utteranceFor, type EngineContext, type Intent, type Proposal } from './scripts';
import { TypingDots, VoiceOrb, Waveform, type VoicePhase } from './VoiceVisuals';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Words revealed so far (live transcription / typed reply). */
  shown: number;
  appointmentIds?: string[];
  proposal?: Proposal;
  doneAppointmentId?: string;
  doneKind?: 'book' | 'cancel' | 'block';
  error?: boolean;
}

const WORD_MS_LISTEN = 230;
const WORD_MS_REPLY = 70;
const PROCESS_MS = 900;

export interface VoiceAssistantProps {
  variant: 'tab' | 'modal';
  onClose?: () => void;
}

/**
 * Simulated voice assistant. The full interaction model is real (states, transcript, proposals,
 * explicit confirmation); speech recognition and understanding are scripted (see ./scripts.ts).
 */
export function VoiceAssistant({ variant, onClose }: VoiceAssistantProps) {
  const { colors, radius, layout } = useTheme();
  const i18n = useI18n();
  const { t } = i18n;
  const insets = useSafeAreaInsets();
  const state = useAppState();
  const actions = useActions();
  const avail = useAvailabilityContext();
  const prefs = usePreferences();
  const look = useLookup();
  const barberId = prefs.role === 'barber' ? prefs.barberId : (state.currentUser.barberId ?? prefs.barberId);

  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<{ messageId: string; proposal: Proposal } | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ctxRef = useRef<EngineContext>({ state, avail, barberId, i18n });
  ctxRef.current = { state, avail, barberId, i18n };
  const lastIntent = useRef<Intent>('bookQuick');
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const scrollToEnd = () => later(() => scrollRef.current?.scrollToEnd({ animated: true }), 40);

  /** Reveal a message word by word, then call `done`. */
  const reveal = (id: string, words: number, ms: number, done: () => void) => {
    for (let i = 1; i <= words; i++) {
      later(() => {
        setMessages((list) => list.map((m) => (m.id === id ? { ...m, shown: i } : m)));
        if (i % 4 === 0 || i === words) scrollToEnd();
      }, i * ms);
    }
    later(done, words * ms + 250);
  };

  const respond = (intent: Intent) => {
    const result = runIntent(intent, ctxRef.current, pendingRef.current?.proposal);
    const id = uid('vm');
    const msg: Message = { id, role: 'assistant', text: result.reply, shown: 0, appointmentIds: result.appointmentIds, proposal: result.proposal, error: result.error };
    setPhase('responding');
    setMessages((list) => [...list, msg]);
    scrollToEnd();
    reveal(id, result.reply.split(' ').length, WORD_MS_REPLY, () => {
      if (result.error) setPhase('error');
      else if (result.proposal) {
        setPending({ messageId: id, proposal: result.proposal });
        setPhase(result.proposal.kind === 'book' && result.proposal.needsAgreement ? 'awaiting' : 'confirm');
      } else {
        setPending(null);
        setPhase('idle');
      }
      scrollToEnd();
    });
  };

  const run = (intent: Intent) => {
    clearTimers();
    // A new request supersedes any unanswered proposal (except an explicit "yes").
    if (intent !== 'affirm') setPending(null);
    const text = utteranceFor(intent, ctxRef.current);
    const id = uid('vm');
    setMessages((list) => [...list, { id, role: 'user', text, shown: 0 }]);
    setPhase('listening');
    scrollToEnd();
    reveal(id, text.split(' ').length, WORD_MS_LISTEN, () => {
      setPhase('processing');
      scrollToEnd();
      later(() => respond(intent), PROCESS_MS);
    });
  };

  const stopListening = () => {
    // Skip the rest of the simulated speech and process immediately.
    clearTimers();
    const last = [...messages].reverse().find((m) => m.role === 'user');
    if (!last) return setPhase('idle');
    setMessages((list) => list.map((m) => (m.id === last.id ? { ...m, shown: m.text.split(' ').length } : m)));
    setPhase('processing');
    later(() => respond(lastIntent.current), PROCESS_MS);
  };

  const start = (intent: Intent) => {
    lastIntent.current = intent;
    run(intent);
  };

  const onMic = () => {
    if (phase === 'listening') return stopListening();
    if (phase === 'processing' || phase === 'responding') return;
    if (phase === 'awaiting') return start('affirm');
    if (phase === 'error') return start(lastIntent.current === 'error' ? 'bookQuick' : lastIntent.current);
    start('bookQuick');
  };

  const pushAssistant = (text: string, extra: Partial<Message> = {}) => {
    const id = uid('vm');
    setMessages((list) => [...list, { id, role: 'assistant', text, shown: text.split(' ').length, ...extra }]);
    scrollToEnd();
  };

  const confirm = () => {
    if (!pending) return;
    const p = pending.proposal;
    if (p.kind === 'book') {
      const created = actions.createAppointment({
        customerId: p.customerId,
        serviceId: p.serviceId,
        barberId: p.barberId,
        start: p.start,
        source: 'voice',
        createdBy: 'voice',
        sendLink: true,
        linkChannel: 'whatsapp',
      });
      const c = look.customer(p.customerId);
      pushAssistant(t('voice.replies.booked', { customer: i18n.l(c?.name).split(' ')[0], day: spokenDay(p.start, i18n), time: spokenTime(p.start, i18n) }), {
        doneAppointmentId: created.id,
        doneKind: 'book',
      });
    } else if (p.kind === 'cancel') {
      actions.setAppointmentStatus(p.appointmentId, 'cancelled', { actor: 'voice', reason: 'Cancelled by voice assistant' });
      pushAssistant(t('voice.replies.cancelled'), { doneAppointmentId: p.appointmentId, doneKind: 'cancel' });
    } else {
      actions.addBlock({ barberId: p.barberId, start: p.start.toISOString(), end: p.end.toISOString(), reason: 'personal', note: 'Day off (voice assistant)' });
      pushAssistant(t('voice.replies.blocked', { date: i18n.f.dateLong(p.start) }), { doneKind: 'block' });
    }
    setPending(null);
    setPhase('completed');
  };

  const dismiss = () => {
    setPending(null);
    pushAssistant(t('voice.replies.dismissed'));
    setPhase('idle');
  };

  const selectTime = (d: Date) => {
    if (!pending || pending.proposal.kind !== 'book') return;
    const proposal = { ...pending.proposal, start: d };
    setPending({ ...pending, proposal });
    setMessages((list) => list.map((m) => (m.id === pending.messageId ? { ...m, proposal } : m)));
  };

  const reset = () => {
    clearTimers();
    setMessages([]);
    setPending(null);
    setPhase('idle');
  };

  const busy = phase === 'listening' || phase === 'processing' || phase === 'responding';
  const statusLabel = t(`voice.states.${phase}`);
  const hint = phase === 'awaiting' ? t('voice.tapToAnswer') : phase === 'listening' ? t('voice.stop') : t('voice.tapToSpeak');
  const suggestions = useMemo(() => SUGGESTED_INTENTS, []);

  const headerRight = (
    <>
      {messages.length ? <IconButton icon="refresh-ccw" onPress={reset} accessibilityLabel={t('voice.clear')} /> : null}
      <IconButton icon="info" onPress={() => setInfoOpen(true)} accessibilityLabel={t('voice.info.title')} />
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {variant === 'modal' ? (
        <Header title={t('voice.title')} close onBack={onClose} right={headerRight} />
      ) : (
        <Header variant="large" title={t('voice.title')} subtitle={t('voice.subtitle')} back={false} right={headerRight} />
      )}

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: layout.screenPadding,
          paddingBottom: 24,
          paddingTop: 8,
          gap: 12,
          width: '100%',
          maxWidth: layout.maxContentWidth,
          alignSelf: 'center',
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 16 }}>
            <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="mic" size={34} color={colors.accent} />
            </View>
            <View style={{ gap: 6, alignItems: 'center', maxWidth: 340 }}>
              <Text variant="title2" align="center">
                {t('voice.heroTitle')}
              </Text>
              <Text variant="callout" tone="secondary" align="center">
                {t('voice.heroBody')}
              </Text>
            </View>
            <View style={{ alignSelf: 'stretch', gap: 8, marginTop: 8 }}>
              <Text variant="overline" tone="tertiary">
                {t('voice.try')}
              </Text>
              {(['bookQuick', 'next', 'count', 'close'] as Intent[]).map((intent) => (
                <ExampleRow
                  key={intent}
                  icon={intent === 'next' ? 'user' : intent === 'count' ? 'hash' : intent === 'close' ? 'slash' : 'calendar'}
                  text={`“${utteranceFor(intent, ctxRef.current)}”`}
                  onPress={() => start(intent)}
                />
              ))}
            </View>
          </View>
        ) : (
          messages.map((m) => (
            <View key={m.id} style={{ gap: 8, alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <View
                style={{
                  maxWidth: '86%',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: radius.lg,
                  borderBottomEndRadius: m.role === 'user' ? 6 : radius.lg,
                  borderBottomStartRadius: m.role === 'assistant' ? 6 : radius.lg,
                  backgroundColor: m.role === 'user' ? colors.ink : m.error ? colors.dangerSoft : colors.surface,
                  borderWidth: m.role === 'assistant' ? 1 : 0,
                  borderColor: m.error ? colors.dangerSoft : colors.border,
                }}
              >
                {m.role === 'assistant' && m.shown === 0 ? (
                  <TypingDots />
                ) : (
                  <Text variant="callout" color={m.role === 'user' ? colors.inkText : m.error ? colors.danger : colors.text}>
                    {m.text.split(' ').slice(0, Math.max(1, m.shown)).join(' ')}
                  </Text>
                )}
              </View>
              {m.shown >= m.text.split(' ').length && m.appointmentIds?.length ? (
                <View style={{ alignSelf: 'stretch', backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 4 }}>
                  {m.appointmentIds.map((aid) => {
                    const a = look.appointment(aid);
                    return a ? <AppointmentCard key={aid} appointment={a} variant="mini" /> : null;
                  })}
                </View>
              ) : null}
              {m.shown >= m.text.split(' ').length && m.proposal ? (
                <View style={{ alignSelf: 'stretch' }}>
                  <ProposalCard
                    proposal={m.proposal}
                    active={pending?.messageId === m.id && !busy}
                    canConfirm={!(m.proposal.kind === 'book' && pending?.messageId === m.id && pending.proposal.kind === 'book' && pending.proposal.needsAgreement)}
                    onSelectTime={selectTime}
                    onConfirm={confirm}
                    onDismiss={dismiss}
                  />
                </View>
              ) : null}
              {m.doneKind ? (
                <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.successSoft }}>
                  <Icon name="check-circle" size={20} color={colors.success} />
                  <Text variant="subhead" color={colors.success} style={{ flex: 1 }}>
                    {t('voice.card.source')}
                  </Text>
                  {m.doneAppointmentId ? (
                    <Button
                      label={t('voice.card.viewAppointment')}
                      size="sm"
                      variant="secondary"
                      onPress={() => {
                        if (variant === 'modal') onClose?.();
                        router.push(`/appointment/${m.doneAppointmentId}`);
                      }}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>
          ))
        )}
        {phase === 'processing' ? (
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <TypingDots />
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.separator,
          backgroundColor: colors.backgroundElevated,
          paddingTop: 10,
          paddingBottom: variant === 'modal' ? Math.max(insets.bottom, 12) : 8,
          gap: 6,
        }}
      >
        {phase === 'awaiting' ? (
          <ChipRow>
            <Chip label={t('voice.commands.affirm')} icon="corner-down-left" selected onPress={() => start('affirm')} />
            <Chip label={t('voice.card.dismiss')} onPress={dismiss} />
          </ChipRow>
        ) : !busy && phase !== 'confirm' ? (
          <ChipRow>
            {suggestions.map((intent) => (
              <Chip key={intent} size="sm" label={utteranceFor(intent, ctxRef.current)} onPress={() => start(intent)} />
            ))}
            <Chip size="sm" icon="volume-x" label={t('voice.simulateError')} onPress={() => start('error')} />
          </ChipRow>
        ) : null}
        <View style={{ alignItems: 'center' }}>
          {phase === 'listening' ? (
            <Waveform active />
          ) : (
            <View style={{ height: 28, justifyContent: 'center' }}>
              <Text variant="caption" tone={phase === 'error' ? 'danger' : 'tertiary'} align="center">
                {statusLabel}
              </Text>
            </View>
          )}
          <VoiceOrb phase={phase === 'confirm' ? 'idle' : phase} onPress={onMic} label={hint} size={68} />
          <Text variant="caption" tone="secondary" align="center" style={{ marginTop: -6 }}>
            {hint}
          </Text>
        </View>
      </View>

      <Sheet visible={infoOpen} onClose={() => setInfoOpen(false)} title={t('voice.info.title')}>
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderRadius: radius.md, backgroundColor: colors.accentSoft }}>
            <BrandMark size={32} />
            <Text variant="footnote" color={colors.accentOnSoft} style={{ flex: 1 }}>
              {t('voice.info.simulation')}
            </Text>
          </View>
          <InfoItem icon="shield" title={t('voice.info.actionsTitle')} body={t('voice.info.actions')} />
          <InfoItem icon="check-square" title={t('voice.info.confirmTitle')} body={t('voice.info.confirm')} />
          <InfoItem icon="globe" title={t('voice.info.languagesTitle')} body={t('voice.info.languages')} />
        </View>
      </Sheet>
    </View>
  );
}

function ExampleRow({ icon, text, onPress }: { icon: IconName; text: string; onPress: () => void }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Icon name={icon} size={16} color={colors.accent} />
      <Text variant="callout" style={{ flex: 1 }}>
        {text}
      </Text>
      <Icon name="mic" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

function InfoItem({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={colors.text} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="subhead">{title}</Text>
        <Text variant="footnote" tone="secondary">
          {body}
        </Text>
      </View>
    </View>
  );
}
