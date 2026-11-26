import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ActionSheet, EmptyState, Icon, IconButton, Screen, SegmentedControl, Text, useToast } from '@/components';
import { DEMO_NOW, activityStamp } from '@/utils/dates';

import { LoadGate, RequireAccess } from '../shared/Widgets';
import { PERIODS, type PeriodKey } from './data';
import { reportMeta } from './registry';
import { REPORT_VIEWS } from './ReportViews';

export default function ReportScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const meta = reportMeta(key);
  const toast = useToast();
  const [period, setPeriod] = useState<PeriodKey>('ytd');
  const [share, setShare] = useState(false);

  if (!meta) {
    return (
      <Screen title="Report">
        <EmptyState icon="chart-column" title="Report not found" actionLabel="All reports" onAction={() => router.replace('/reports')} />
      </Screen>
    );
  }
  const View_ = REPORT_VIEWS[meta.key];

  return (
    <Screen
      title={meta.title}
      eyebrow="Report · Emeritus Education"
      subtitle={meta.description}
      headerRight={<IconButton icon="share-2" accessibilityLabel="Share report" onPress={() => setShare(true)} />}
      headerBelow={
        <View style={{ gap: 8 }}>
          <SegmentedControl
            value={period}
            onChange={setPeriod}
            options={(Object.keys(PERIODS) as PeriodKey[]).map((k) => ({ value: k, label: PERIODS[k].label }))}
          />
          <Text variant="footnote" tone="tertiary">
            {PERIODS[period].caption}
          </Text>
        </View>
      }>
      <RequireAccess module="reports">
        <LoadGate loadKey={`report-${meta.key}`}>
          <View_ period={period} />
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 24, paddingHorizontal: 4 }}>
            <Icon name="refresh-cw" size={12} tone="tertiary" />
            <Text variant="footnote" tone="tertiary" style={{ flex: 1 }}>
              Generated {activityStamp(DEMO_NOW).toLowerCase()} from live programme records · illustrative sample data
            </Text>
          </View>
        </LoadGate>
      </RequireAccess>
      <ActionSheet
        visible={share}
        onClose={() => setShare(false)}
        title="Share report"
        subtitle={`${meta.title} · ${PERIODS[period].label}`}
        actions={[
          { label: 'Copy link', icon: 'link-2', onPress: () => toast.show({ message: 'Link copied', detail: 'Anyone at Emeritus with access can open it', icon: 'link-2', tone: 'neutral' }) },
          { label: 'Export as PDF', icon: 'download', onPress: () => toast.show({ message: 'PDF ready', detail: `${meta.title} (${PERIODS[period].label}).pdf · simulated`, icon: 'file-text' }) },
          { label: 'Email to leadership', icon: 'mail', detail: 'James Whitfield, Rajiv Menon', onPress: () => toast.show({ message: 'Report sent', detail: 'Emailed to 2 recipients · simulated', icon: 'send' }) },
          { label: 'Schedule weekly', icon: 'calendar-clock', detail: 'Every Monday at 08:00 GST', onPress: () => toast.show({ message: 'Scheduled', detail: 'You’ll receive this report every Monday', icon: 'calendar-check' }) },
        ]}
      />
    </Screen>
  );
}
