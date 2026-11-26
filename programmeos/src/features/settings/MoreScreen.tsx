import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Avatar, Button, Card, CountBadge, Icon, ListGroup, ListRow, Screen, Section, Text, type IconName } from '@/components';
import { getStaff, pendingApprovalsFor } from '@/data/selectors';
import { useSession } from '@/data/session';
import { useDB } from '@/data/store';
import { canAccess, type ModuleKey } from '@/navigation/access';

type Item = { label: string; icon: IconName; tone: 'accent' | 'success' | 'warning' | 'violet' | 'info' | 'danger' | 'neutral'; route: string; module?: ModuleKey; detail?: string; badge?: number };

export default function MoreScreen() {
  const db = useDB();
  const { userId, role } = useSession();
  const me = getStaff(db, userId);
  const roleLabel = db.roles.find((r) => r.key === role)?.label;
  const approvals = pendingApprovalsFor(db, userId).length;

  const groups: { title: string; items: Item[] }[] = [
    {
      title: 'Workspace',
      items: [
        { label: 'People', icon: 'users-round', tone: 'accent', route: '/people', module: 'people', detail: 'Staff, faculty, learners, contacts' },
        { label: 'Faculty', icon: 'users', tone: 'warning', route: '/faculty', module: 'faculty', detail: `${db.faculty.length} instructors` },
        { label: 'Learners', icon: 'graduation-cap', tone: 'success', route: '/learners', module: 'learners', detail: `${db.learners.length} participants` },
        { label: 'Clients', icon: 'building-2', tone: 'info', route: '/clients', module: 'clients', detail: `${db.clients.length} institutional & corporate` },
        { label: 'Calendar', icon: 'calendar-days', tone: 'violet', route: '/calendar', module: 'calendar', detail: 'Programme & faculty schedules' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Academics', icon: 'book-open', tone: 'violet', route: '/academics', module: 'academics', detail: 'Modules, materials, reviews' },
        { label: 'Logistics', icon: 'plane', tone: 'info', route: '/logistics', module: 'logistics', detail: 'Travel, hotels, venues' },
        { label: 'Finance', icon: 'wallet', tone: 'success', route: '/finance', module: 'finance', detail: 'Budgets, costs, revenue' },
        { label: 'Approvals', icon: 'stamp', tone: 'warning', route: '/approvals', module: 'approvals', badge: approvals },
        { label: 'Documents', icon: 'folder', tone: 'neutral', route: '/documents', module: 'documents', detail: `${db.documents.length} files` },
      ],
    },
    {
      title: 'Insight & automation',
      items: [
        { label: 'Reports', icon: 'chart-column', tone: 'accent', route: '/reports', module: 'reports', detail: '12 reports' },
        { label: 'Workflows', icon: 'workflow', tone: 'violet', route: '/workflows', module: 'workflows', detail: 'Templates & visual workflows' },
        { label: 'Smart alerts', icon: 'zap', tone: 'danger', route: '/alerts', detail: `${db.smartAlerts.filter((a) => !a.dismissed).length} active` },
        { label: 'Programme assistant', icon: 'sparkles', tone: 'violet', route: '/assistant', module: 'assistant' },
        { label: 'Voice to action', icon: 'mic', tone: 'danger', route: '/voice' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Settings', icon: 'settings', tone: 'neutral', route: '/settings' },
        { label: 'Profile', icon: 'user-round', tone: 'neutral', route: '/profile' },
        { label: 'UI states gallery', icon: 'layout-dashboard', tone: 'neutral', route: '/states', detail: 'Empty, loading, error, offline…' },
      ],
    },
  ];

  return (
    <Screen title="More" back={false}>
      <Card padding="lg" onPress={() => router.push('/profile')} style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={me?.name ?? ''} hue={me?.avatarHue} size={56} />
          <View style={{ flex: 1 }}>
            <Text variant="title3">{me?.name}</Text>
            <Text variant="subhead" tone="secondary">
              {me?.title}
            </Text>
            <Text variant="footnote" tone="tertiary">
              {db.organization.name} · {me?.location}
            </Text>
          </View>
          <Icon name="chevron-right" size={18} tone="tertiary" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="tertiary">
              Previewing as
            </Text>
            <Text variant="headline">{roleLabel}</Text>
          </View>
          <Button title="Switch role" icon="repeat" size="sm" variant="tinted" onPress={() => router.push('/role-switcher')} />
        </View>
      </Card>

      {groups.map((g) => (
        <Section key={g.title} title={g.title}>
          <ListGroup>
            {g.items.map((i) => {
              const locked = i.module ? !canAccess(role, i.module) : false;
              return (
                <ListRow
                  key={i.label}
                  icon={i.icon}
                  iconTone={i.tone}
                  title={i.label}
                  subtitle={locked ? 'Restricted for your role' : i.detail}
                  trailing={locked ? <Icon name="lock" size={16} tone="tertiary" /> : i.badge ? <CountBadge count={i.badge} /> : undefined}
                  chevron
                  onPress={() => router.push(i.route as Href)}
                />
              );
            })}
          </ListGroup>
        </Section>
      ))}
      <Text variant="footnote" tone="tertiary" align="center" style={{ marginTop: 24 }}>
        ProgrammeOS · prototype build 0.9 · sample data only
      </Text>
    </Screen>
  );
}
