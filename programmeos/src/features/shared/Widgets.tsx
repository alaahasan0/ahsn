import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ErrorState, Icon, IconTile, ListSkeleton, RestrictedState, Sheet, Text, Touchable, toneColors, useToast, type IconName } from '@/components';
import type { SmartAlert } from '@/data/models';
import { getProgramme } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useActions, useDB } from '@/data/store';
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad';
import { canAccess, type ModuleKey } from '@/navigation/access';
import { makeStyles, useStyles, useTheme } from '@/theme';

// ─── Smart alert card ─────────────────────────────────────────────────────────

const ALERT_ICON: Record<SmartAlert['kind'], IconName> = {
  faculty_confirmation: 'user-x',
  materials_missing: 'file-warning',
  hotel_deadline: 'bed-double',
  registration_incomplete: 'user-plus',
  itinerary_missing: 'plane',
  budget_overrun: 'trending-up',
  schedule_conflict: 'calendar-x',
};

export function SmartAlertCard({ alert, width }: { alert: SmartAlert; width?: number }) {
  const db = useDB();
  const actions = useActions();
  const toast = useToast();
  const { colors } = useTheme();
  const tone = alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'accent';
  const tc = toneColors(tone, colors);
  const prog = getProgramme(db, alert.programmeId);
  return (
    <View style={{ width, backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 10, borderWidth: colors.border ? 0.5 : 0, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: tc.bg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={ALERT_ICON[alert.kind]} size={15} color={tc.solid} />
        </View>
        <Text variant="caption" tone="tertiary" style={{ flex: 1 }} numberOfLines={1}>
          {prog?.shortName} · {alert.severity === 'critical' ? 'Critical' : alert.severity === 'warning' ? 'Needs attention' : 'Heads up'}
        </Text>
        <Touchable
          onPress={() => {
            actions.dismissAlert(alert.id);
            toast.show({ message: 'Alert dismissed', tone: 'neutral', icon: 'eye-off', actionLabel: 'Undo', onAction: () => actions.update('smartAlerts', alert.id, { dismissed: false }) });
          }}
          accessibilityLabel="Dismiss alert"
          hitSlop={10}>
          <Icon name="x" size={15} tone="tertiary" />
        </Touchable>
      </View>
      <View style={{ gap: 3, flex: 1 }}>
        <Text variant="headline" numberOfLines={2}>
          {alert.title}
        </Text>
        <Text variant="subhead" tone="secondary" numberOfLines={3}>
          {alert.detail}
        </Text>
      </View>
      <Touchable onPress={() => router.push(alert.route as Href)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} accessibilityLabel={alert.actionLabel}>
        <Text variant="label" weight="semibold" color={tc.fg}>
          {alert.actionLabel}
        </Text>
        <Icon name="arrow-right" size={14} color={tc.fg} />
      </Touchable>
    </View>
  );
}

// ─── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS: { label: string; icon: IconName; route: string; tone: 'accent' | 'success' | 'warning' | 'violet' | 'info' | 'danger' | 'neutral' }[] = [
  { label: 'New programme', icon: 'layers', route: '/programme/new', tone: 'accent' },
  { label: 'Add task', icon: 'square-check-big', route: '/task/new', tone: 'violet' },
  { label: 'Add session', icon: 'calendar-plus', route: '/session/new', tone: 'info' },
  { label: 'Assign faculty', icon: 'user-plus', route: '/faculty/assign', tone: 'warning' },
  { label: 'Add learner', icon: 'graduation-cap', route: '/learners/register', tone: 'success' },
  { label: 'Upload document', icon: 'scan-text', route: '/document/upload', tone: 'neutral' },
  { label: 'Record expense', icon: 'receipt', route: '/expense/new', tone: 'success' },
  { label: 'Book hotel', icon: 'bed-double', route: '/hotel-booking/new', tone: 'info' },
  { label: 'Voice note', icon: 'mic', route: '/voice', tone: 'danger' },
  { label: 'Ask assistant', icon: 'sparkles', route: '/assistant', tone: 'violet' },
];

export function QuickActionsSheet({ visible, onClose, programmeId }: { visible: boolean; onClose: () => void; programmeId?: string }) {
  const s = useStyles(styles);
  const go = (route: string) => {
    onClose();
    setTimeout(() => router.push((programmeId ? `${route}?programme=${programmeId}` : route) as Href), 240);
  };
  return (
    <Sheet visible={visible} onClose={onClose} title="Quick actions" subtitle="Create without leaving where you are">
      <View style={s.grid}>
        {QUICK_ACTIONS.map((a) => (
          <Touchable key={a.label} onPress={() => go(a.route)} feedback="scale" style={s.tile} accessibilityLabel={a.label}>
            <IconTile icon={a.icon} tone={a.tone} size={40} />
            <Text variant="label" align="center" numberOfLines={2}>
              {a.label}
            </Text>
          </Touchable>
        ))}
      </View>
    </Sheet>
  );
}

// ─── Access + loading gates ───────────────────────────────────────────────────

const MODULE_LABEL: Record<ModuleKey, string> = {
  programmes: 'Programmes', people: 'People', faculty: 'Faculty', learners: 'Learners', clients: 'Clients', calendar: 'Calendar', finance: 'Finance', academics: 'Academics', logistics: 'Logistics', approvals: 'Approvals', documents: 'Documents', reports: 'Reports', workflows: 'Workflows', assistant: 'Assistant', settings: 'Settings', admin: 'Administration',
};

/** Shows the designed "Permission restricted" state when the active role lacks access. */
export function RequireAccess({ module, children }: { module: ModuleKey; children: ReactNode }) {
  const { role, mode } = useSession();
  const toast = useToast();
  if (mode === 'staff' && !canAccess(role, module)) {
    return <RestrictedState module={MODULE_LABEL[module]} onRequest={() => toast.show({ message: 'Access requested', detail: 'Chen Wei (Administrator) will review your request.', icon: 'send' })} />;
  }
  return <>{children}</>;
}

/** Simulated network load: skeleton first, error state when "Simulate errors" is on. */
export function LoadGate({ loadKey, children, skeleton }: { loadKey: string; children: ReactNode; skeleton?: ReactNode }) {
  const { loading, error, retry } = useSimulatedLoad(loadKey);
  if (loading) return <>{skeleton ?? <ListSkeleton count={4} />}</>;
  if (error) return <ErrorState onRetry={retry} />;
  return <>{children}</>;
}

/** Floating action button that sits above the tab bar. */
export function FloatingButton({ icon = 'plus', onPress, label }: { icon?: IconName; onPress: () => void; label: string }) {
  const { colors } = useTheme();
  return (
    <Touchable
      onPress={onPress}
      haptic="light"
      feedback="scale"
      accessibilityLabel={label}
      style={{ position: 'absolute', right: 18, bottom: 104, width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
      <Icon name={icon} size={24} color="#FFFFFF" strokeWidth={2.4} />
    </Touchable>
  );
}

const styles = makeStyles((t) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 6 },
  tile: { width: '30.5%', flexGrow: 1, alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 6, borderRadius: t.radii.lg, backgroundColor: t.colors.surface, borderWidth: t.hairline, borderColor: t.colors.border },
}));
