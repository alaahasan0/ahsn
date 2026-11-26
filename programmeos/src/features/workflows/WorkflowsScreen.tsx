import { router } from 'expo-router';
import { View } from 'react-native';

import { Card, Icon, IconTile, Screen, Section, Tag, Text, type IconName } from '@/components';
import type { WorkflowTemplate } from '@/data/models';
import { useDB } from '@/data/store';
import { makeStyles, useStyles } from '@/theme';

import { DELIVERY_ICON } from '../shared/helpers';
import { LoadGate, RequireAccess } from '../shared/Widgets';

export const VISUAL_WORKFLOWS: { key: 'lifecycle' | 'faculty' | 'hotel'; letter: string; title: string; detail: string; steps: number; icon: IconName; tone: 'accent' | 'warning' | 'info' }[] = [
  { key: 'lifecycle', letter: 'A', title: 'New programme lifecycle', detail: 'From approval to workspace, readiness, delivery, financial closure and archive.', steps: 13, icon: 'layers', tone: 'accent' },
  { key: 'faculty', letter: 'B', title: 'Faculty assignment', detail: 'Select, check availability, confirm, contract and feed readiness automatically.', steps: 9, icon: 'user-plus', tone: 'warning' },
  { key: 'hotel', letter: 'C', title: 'Hotel booking', detail: 'Requirements, guests, rooming list, confirmation, changes, invoice and reconciliation.', steps: 9, icon: 'bed-double', tone: 'info' },
];

export function templateTaskCount(t: WorkflowTemplate) {
  return t.phases.reduce((s, p) => s + p.tasks.length, 0);
}

/** Workflow templates and the three reference workflows, visualised. */
export default function WorkflowsScreen() {
  const db = useDB();
  const s = useStyles(styles);
  return (
    <Screen title="Workflows" subtitle="Repeatable operating playbooks. Apply a template to generate a programme’s checklist in one step.">
      <RequireAccess module="workflows">
        <Section title="Visual workflows" first>
          <View style={{ gap: 10 }}>
            {VISUAL_WORKFLOWS.map((w) => (
              <Card key={w.key} onPress={() => router.push(`/workflow/${w.key}`)} accessibilityLabel={`Workflow ${w.letter}: ${w.title}`}>
                <View style={s.row}>
                  <IconTile icon={w.icon} tone={w.tone} size={42} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="caption" tone="tertiary">
                      WORKFLOW {w.letter} · {w.steps} STEPS
                    </Text>
                    <Text variant="headline">{w.title}</Text>
                    <Text variant="subhead" tone="secondary" numberOfLines={2}>
                      {w.detail}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={18} tone="tertiary" />
                </View>
              </Card>
            ))}
          </View>
        </Section>

        <Section title="Programme templates" subtitle={`${db.workflowTemplates.length} templates · used ${db.workflowTemplates.reduce((a, t) => a + t.usedCount, 0)} times`}>
          <LoadGate loadKey="workflow-templates">
            <View style={{ gap: 10 }}>
              {db.workflowTemplates.map((t) => (
                <Card key={t.id} onPress={() => router.push(`/workflows/${t.id}`)} accessibilityLabel={t.name}>
                  <View style={s.row}>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text variant="title3">{t.name}</Text>
                      <Text variant="subhead" tone="secondary" numberOfLines={2}>
                        {t.description}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={18} tone="tertiary" />
                  </View>
                  <View style={s.tags}>
                    <Tag label={t.durationLabel} icon="clock" />
                    <Tag label={t.deliveryMode === 'Any' ? 'Any delivery' : t.deliveryMode} icon={t.deliveryMode === 'Any' ? 'globe' : DELIVERY_ICON[t.deliveryMode]} />
                    <Tag label={`${t.phases.length} phases · ${templateTaskCount(t)} tasks`} icon="list-checks" />
                    <Tag label={`Used ${t.usedCount}×`} icon="repeat" />
                  </View>
                </Card>
              ))}
            </View>
          </LoadGate>
        </Section>
      </RequireAccess>
    </Screen>
  );
}

const styles = makeStyles(() => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
}));
