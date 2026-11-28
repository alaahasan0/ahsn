import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Header, Screen, Text } from '@/components/ui';

import { LanguageToggle } from './LanguageToggle';

/** Shared layout for sign-in / sign-up / verification screens. */
export function AuthScaffold({ title, subtitle, children, footer, backFallback = '/welcome' }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode; backFallback?: '/welcome' | '/login' | '/register' }) {
  return (
    <Screen header={<Header backFallback={backFallback} right={<LanguageToggle width={120} />} />} footer={footer}>
      <View style={{ gap: 8, marginTop: 8, marginBottom: 28 }}>
        <Text variant="title1">{title}</Text>
        {subtitle ? (
          <Text variant="callout" tone="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </Screen>
  );
}
