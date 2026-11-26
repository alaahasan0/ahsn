import type { IconName } from '@/components';

export type ReportKey =
  | 'executive'
  | 'portfolio'
  | 'performance'
  | 'readiness'
  | 'budget'
  | 'revenue'
  | 'profitability'
  | 'faculty-utilisation'
  | 'participation'
  | 'attendance'
  | 'evaluations'
  | 'operations';

export type ReportMeta = { key: ReportKey; title: string; description: string; icon: IconName; tone: 'accent' | 'success' | 'warning' | 'violet' | 'info' | 'danger' | 'neutral'; group: 'Portfolio' | 'Financial' | 'People & learning' | 'Operations' };

export const REPORTS: ReportMeta[] = [
  { key: 'executive', title: 'Executive Overview', description: 'Revenue, margin, delivery and satisfaction at a glance.', icon: 'layout-dashboard', tone: 'accent', group: 'Portfolio' },
  { key: 'portfolio', title: 'Programme Portfolio', description: 'Mix by delivery mode, programme type and client.', icon: 'layers', tone: 'violet', group: 'Portfolio' },
  { key: 'performance', title: 'Programme Performance', description: 'Satisfaction, NPS and completion by programme.', icon: 'star', tone: 'warning', group: 'Portfolio' },
  { key: 'readiness', title: 'Programme Readiness', description: 'Readiness of the forward book and Go / No-Go status.', icon: 'gauge', tone: 'info', group: 'Portfolio' },
  { key: 'budget', title: 'Budget vs Actual', description: 'Budget, commitments and actuals per programme.', icon: 'scale', tone: 'success', group: 'Financial' },
  { key: 'revenue', title: 'Revenue and Costs', description: 'Monthly revenue, costs and margin trend.', icon: 'chart-line', tone: 'accent', group: 'Financial' },
  { key: 'profitability', title: 'Profitability', description: 'Gross margin ranked by programme and client.', icon: 'percent', tone: 'success', group: 'Financial' },
  { key: 'faculty-utilisation', title: 'Faculty Utilisation', description: 'Teaching load, contracted days and ratings.', icon: 'users', tone: 'warning', group: 'People & learning' },
  { key: 'participation', title: 'Learner Participation', description: 'From nomination to completion, by client.', icon: 'graduation-cap', tone: 'violet', group: 'People & learning' },
  { key: 'attendance', title: 'Attendance', description: 'Attendance rates, trends and learners to support.', icon: 'user-check', tone: 'info', group: 'People & learning' },
  { key: 'evaluations', title: 'Programme Evaluations', description: 'Ratings distribution, NPS and what participants say.', icon: 'smile', tone: 'warning', group: 'People & learning' },
  { key: 'operations', title: 'Operational Performance', description: 'On-time delivery of tasks, readiness and bookings.', icon: 'activity', tone: 'danger', group: 'Operations' },
];

export const reportMeta = (key?: string) => REPORTS.find((r) => r.key === key);
