import { router } from 'expo-router';
import { View } from 'react-native';

import { FileIcon, ListRow, StatusPill, Text, toneColors, toneForStatus } from '@/components';
import type { Material, MaterialStatus, MaterialVersion } from '@/data/models';
import { facultyName, getFaculty, getProgramme } from '@/data/selectors';
import { useDB } from '@/data/store';
import { useTheme } from '@/theme';
import { dueLabel } from '@/utils/dates';

export const MATERIAL_STATUSES: MaterialStatus[] = ['Not Submitted', 'Draft', 'Submitted', 'Under Review', 'Changes Requested', 'Approved', 'Published'];

export function MaterialRow({ material: m, showProgramme = true }: { material: Material; showProgramme?: boolean }) {
  const db = useDB();
  const due = dueLabel(m.dueDate);
  const open = !['Approved', 'Published'].includes(m.status);
  return (
    <ListRow
      leading={<FileIcon format={m.format} size={36} />}
      title={m.title}
      numberOfLines={2}
      subtitle={`${showProgramme ? `${getProgramme(db, m.programmeId)?.shortName} · ` : ''}${m.kind} · ${facultyName(getFaculty(db, m.ownerFacultyId))}`}
      meta={open ? due.text : m.versions.length ? `${m.versions[m.versions.length - 1].label} · ${m.versions[m.versions.length - 1].stage}` : undefined}
      trailing={<StatusPill label={m.status} />}
      onPress={() => router.push(`/material/${m.id}`)}
    />
  );
}

export function VersionStageTag({ stage }: { stage: MaterialVersion['stage'] }) {
  const tone = stage === 'Final' ? 'success' : stage === 'Revised' ? 'info' : 'neutral';
  return <StatusPill label={stage} tone={tone} dot={false} />;
}

/** Compact stacked bar of material statuses for one module/programme. */
export function StatusMiniBar({ materials }: { materials: Material[] }) {
  const { colors } = useTheme();
  if (!materials.length)
    return (
      <Text variant="caption" tone="tertiary">
        No materials
      </Text>
    );
  return (
    <View style={{ flexDirection: 'row', height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: colors.chartTrack, gap: 1.5, flex: 1 }}>
      {MATERIAL_STATUSES.map((s) => {
        const n = materials.filter((m) => m.status === s).length;
        if (!n) return null;
        return <View key={s} style={{ flex: n, backgroundColor: s === 'Not Submitted' ? colors.borderStrong : toneColors(toneForStatus(s), colors).solid }} />;
      })}
    </View>
  );
}
