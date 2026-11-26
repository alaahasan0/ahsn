import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/brand/Logo';
import { Button, Icon, Text, type IconName } from '@/components';
import { homeRouteFor, useSession } from '@/data/session';
import { makeStyles, useStyles } from '@/theme';

const PILLARS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'layers', title: 'One programme, one workspace', text: 'Faculty, logistics, academics, learners and finance connected to the programme they serve.' },
  { icon: 'gauge', title: 'Readiness you can trust', text: 'Live readiness computed from real bookings, contracts and registrations — not a spreadsheet.' },
  { icon: 'sparkles', title: 'The next action, made obvious', text: 'Smart alerts and a programme assistant surface what needs you today.' },
];

export default function WelcomeScreen() {
  const s = useStyles(styles);
  const insets = useSafeAreaInsets();
  const session = useSession();
  const [loading, setLoading] = useState(false);

  const signIn = () => {
    setLoading(true);
    setTimeout(() => {
      session.signIn(session.mode, session.role);
      router.replace(homeRouteFor(session.mode));
    }, 700);
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View entering={FadeInDown.duration(500)} style={{ gap: 18 }}>
          <LogoMark size={64} />
          <View style={{ gap: 8 }}>
            <Text variant="overline" tone="accent">
              Emeritus Education
            </Text>
            <Text style={s.title} weight="bold">
              ProgrammeOS
            </Text>
            <Text variant="title3" tone="secondary" weight="regular">
              The Operating System for Executive Education.
            </Text>
          </View>
        </Animated.View>

        <View style={{ gap: 14, marginTop: 36 }}>
          {PILLARS.map((p, i) => (
            <Animated.View key={p.title} entering={FadeInDown.delay(120 + i * 90).duration(450)} style={s.pillar}>
              <View style={s.pillarIcon}>
                <Icon name={p.icon} size={20} tone="accent" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="headline">{p.title}</Text>
                <Text variant="subhead" tone="secondary">
                  {p.text}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={{ flex: 1, minHeight: 32 }} />

        <Animated.View entering={FadeInDown.delay(420).duration(450)} style={{ gap: 10 }}>
          <Button title="Continue with Emeritus SSO" icon="shield-check" size="lg" onPress={signIn} loading={loading} fullWidth />
          <Button title="Preview another experience" variant="secondary" size="lg" icon="repeat" onPress={() => router.push('/role-switcher')} fullWidth />
          <Text variant="footnote" tone="tertiary" align="center" style={{ marginTop: 8 }}>
            Interactive prototype · all names, programmes and figures are fictional sample data.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.background },
  content: { flexGrow: 1, paddingHorizontal: 24, maxWidth: 560, width: '100%', alignSelf: 'center' },
  title: { fontSize: 40, lineHeight: 46, letterSpacing: -1.2, color: t.colors.text },
  pillar: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', padding: 14, borderRadius: t.radii.lg, backgroundColor: t.colors.surface },
  pillarIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
}));
