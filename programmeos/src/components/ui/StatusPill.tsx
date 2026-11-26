import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type ColorTokens } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type Tone = 'success' | 'warning' | 'danger' | 'accent' | 'info' | 'neutral' | 'violet';

export function toneColors(tone: Tone, c: ColorTokens) {
  switch (tone) {
    case 'success':
      return { fg: c.successText, bg: c.successSoft, solid: c.success };
    case 'warning':
      return { fg: c.warningText, bg: c.warningSoft, solid: c.warning };
    case 'danger':
      return { fg: c.dangerText, bg: c.dangerSoft, solid: c.danger };
    case 'accent':
      return { fg: c.accentText, bg: c.accentSoft, solid: c.accent };
    case 'info':
      return { fg: c.infoText, bg: c.infoSoft, solid: c.info };
    case 'violet':
      return { fg: c.violetText, bg: c.violetSoft, solid: c.violet };
    default:
      return { fg: c.neutralText, bg: c.neutralSoft, solid: c.neutral };
  }
}

/** One mapping from every operational status string in the model to a tone. */
const STATUS_TONES: Record<string, Tone> = {
  // generic
  Active: 'success', Draft: 'neutral', Pending: 'warning', Approved: 'success', Rejected: 'danger', 'Changes Requested': 'warning', Completed: 'success', Complete: 'success', Cancelled: 'neutral', Closed: 'neutral', Archived: 'neutral',
  // commercial
  Proposal: 'neutral', Negotiation: 'warning', 'Contract Signed': 'success', Invoiced: 'accent',
  // operational
  Planning: 'neutral', 'In Preparation': 'accent', Ready: 'success', 'In Delivery': 'violet', Closing: 'info',
  // academic
  Design: 'neutral', 'Materials Pending': 'warning', 'Materials Under Review': 'accent', 'Materials Approved': 'success', Published: 'violet',
  // logistics
  'Not Started': 'neutral', 'In Progress': 'accent', 'Partially Confirmed': 'warning', Confirmed: 'success', 'Not Required': 'neutral',
  // financial
  'Budget Draft': 'neutral', 'Within Budget': 'success', 'At Risk': 'warning', 'Over Budget': 'danger', Reconciling: 'info',
  // tasks
  'To Do': 'neutral', Blocked: 'danger', 'In Review': 'violet', Done: 'success',
  // materials
  'Not Submitted': 'neutral', Submitted: 'accent', 'Under Review': 'violet',
  // faculty
  Proposed: 'neutral', 'Request Sent': 'warning', Declined: 'danger', 'Contract Issued': 'accent', Contracted: 'success', 'Pending Signature': 'warning', Expired: 'neutral', Available: 'success', Limited: 'warning', Unavailable: 'danger',
  // enrolment
  Nominated: 'neutral', Invited: 'warning', Registered: 'accent', Attending: 'violet', Withdrawn: 'neutral', Waitlisted: 'neutral',
  // booking & travel
  Requested: 'warning', Provisional: 'warning', Amended: 'info', 'Checked In': 'violet', 'Checked Out': 'neutral', Missing: 'danger', 'Options Sent': 'warning', Booked: 'accent', Ticketed: 'success', Changed: 'info', Enquiry: 'neutral',
  'Not Invoiced': 'neutral', 'Invoice Received': 'accent', Paid: 'success', Disputed: 'danger',
  // finance
  'Pending Approval': 'warning', Scheduled: 'info', Overdue: 'danger', Issued: 'accent', 'Partially Paid': 'warning',
  // sessions
  Tentative: 'warning', Open: 'accent', Recorded: 'success',
  // documents
  Final: 'success', Signed: 'success', Superseded: 'neutral',
  // priorities
  Urgent: 'danger', High: 'warning', Medium: 'accent', Low: 'neutral',
  // learner items
  Graded: 'success', Late: 'danger', Upcoming: 'neutral',
  Resolved: 'success',
  'Under Negotiation': 'warning',
};

export function toneForStatus(status: string): Tone {
  return STATUS_TONES[status] ?? 'neutral';
}

export type StatusPillProps = {
  label: string;
  tone?: Tone;
  size?: 'sm' | 'md';
  icon?: IconName;
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Compact status indicator — dot + label on a soft tint. */
export function StatusPill({ label, tone, size = 'sm', icon, dot = true, style }: StatusPillProps) {
  const { colors } = useTheme();
  const t = toneColors(tone ?? toneForStatus(label), colors);
  return (
    <View
      accessibilityLabel={`Status: ${label}`}
      style={[{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, backgroundColor: t.bg, borderRadius: 6, paddingHorizontal: size === 'sm' ? 7 : 9, paddingVertical: size === 'sm' ? 2.5 : 4 }, style]}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} color={t.fg} strokeWidth={2.2} /> : dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.solid }} /> : null}
      <Text variant={size === 'sm' ? 'caption' : 'label'} color={t.fg} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Plain coloured dot + text (no background), for dense rows. */
export function StatusDot({ label, tone }: { label: string; tone?: Tone }) {
  const { colors } = useTheme();
  const t = toneColors(tone ?? toneForStatus(label), colors);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: t.solid }} />
      <Text variant="footnote" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function CountBadge({ count, tone = 'danger' }: { count: number; tone?: Tone }) {
  const { colors } = useTheme();
  if (!count) return null;
  const t = toneColors(tone, colors);
  return (
    <View style={{ minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: t.solid, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="caption" color="#FFFFFF" tabular style={{ fontSize: 11, lineHeight: 13 }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

export function Tag({ label, icon }: { label: string; icon?: IconName }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: colors.surfaceAlt }}>
      {icon ? <Icon name={icon} size={12} tone="secondary" /> : null}
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
