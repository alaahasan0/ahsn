import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface StatCardProps {
  label: string;
  value: string;
  icon?: IconName;
  /** e.g. "+12%" */
  delta?: string;
  deltaTone?: 'up' | 'down' | 'neutral';
  caption?: string;
  accentColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({ label, value, icon, delta, deltaTone = 'neutral', caption, accentColor, onPress, style }: StatCardProps) {
  const { colors } = useTheme();
  const deltaColor = deltaTone === 'up' ? colors.success : deltaTone === 'down' ? colors.danger : colors.textSecondary;
  return (
    <Card onPress={onPress} padding={14} style={[{ gap: 10, flex: 1, minWidth: 140 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon ? (
          <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: accentColor ? `${accentColor}1F` : colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={14} color={accentColor ?? colors.textSecondary} />
          </View>
        ) : null}
        <Text variant="footnote" tone="secondary" numberOfLines={1} style={{ flex: 1 }}>
          {label}
        </Text>
      </View>
      <View style={{ gap: 2 }}>
        <Text variant="title2" tabular numberOfLines={1}>
          {value}
        </Text>
        {delta || caption ? (
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            {delta ? (
              <Text variant="caption" color={deltaColor}>
                {delta}
              </Text>
            ) : null}
            {caption ? (
              <Text variant="caption" tone="tertiary" numberOfLines={1}>
                {caption}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
}
