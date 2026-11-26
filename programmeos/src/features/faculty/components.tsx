import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Card, Icon, StatusPill, Tag, Text } from '@/components';
import type { Faculty } from '@/data/models';
import { facultyName, getProgramme } from '@/data/selectors';
import { useDB, type DB } from '@/data/store';
import { DEMO_TODAY } from '@/utils/dates';
import { useTheme } from '@/theme';

export function activeAssignmentCount(db: DB, facultyId: string) {
  return db.facultyAssignments.filter((a) => {
    if (a.facultyId !== facultyId || a.status === 'Declined') return false;
    const p = getProgramme(db, a.programmeId);
    return !!p && !p.archived && !p.cancelled && p.endDate >= DEMO_TODAY;
  }).length;
}

export function Rating({ value, size = 13 }: { value: number; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }} accessibilityLabel={`Rated ${value.toFixed(1)} out of 5`}>
      <Icon name="star" size={size} color={colors.warning} fill={colors.warning} />
      <Text variant="footnote" weight="semibold" tabular>
        {value.toFixed(1)}
      </Text>
    </View>
  );
}

export function FacultyCard({ faculty: f, onPress }: { faculty: Faculty; onPress?: () => void }) {
  const db = useDB();
  const { colors } = useTheme();
  const active = activeAssignmentCount(db, f.id);
  const shown = f.expertise.slice(0, 3);
  return (
    <Card onPress={onPress ?? (() => router.push(`/faculty/${f.id}`))} accessibilityLabel={`${facultyName(f)}, ${f.title}, ${f.availability}`}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Avatar name={f.name} hue={f.avatarHue} initials={f.initials} size={48} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text variant="headline" numberOfLines={1} style={{ flex: 1 }}>
              {facultyName(f)}
            </Text>
            <Rating value={f.rating} />
          </View>
          <Text variant="subhead" tone="secondary" numberOfLines={2}>
            {f.title}
          </Text>
          <Text variant="footnote" tone="tertiary" numberOfLines={1}>
            {f.institution} · {f.location}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {shown.map((e) => (
          <Tag key={e} label={e} />
        ))}
        {f.expertise.length > shown.length ? <Tag label={`+${f.expertise.length - shown.length}`} /> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: colors.separator }}>
        <StatusPill label={f.availability} />
        <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
          {active ? `${active} active assignment${active === 1 ? '' : 's'}` : 'No active assignments'}
        </Text>
        <Text variant="footnote" tone="tertiary" tabular>
          {f.utilisation}% utilised
        </Text>
      </View>
    </Card>
  );
}
