import type en from '../en/analytics';
import type { DeepTranslation } from '../../types';

const analytics: DeepTranslation<typeof en> = {
  title: 'التقارير',
  subtitle: 'كيف ماشي أداء الصالون',
  periods: {
    day: 'اليوم',
    week: 'أسبوع',
    month: 'شهر',
    custom: 'مخصص',
  },
  customTitle: 'اختار الفترة',
  presets: {
    last7: 'آخر 7 أيام',
    last14: 'آخر 14 يوم',
    last30: 'آخر 30 يوم',
    last60: 'آخر 60 يوم',
    thisMonth: 'هالشهر لحد اليوم',
  },
  vsPrevious: 'مقارنة بالفترة السابقة',
  range: '{{from}} – {{to}}',
  metrics: {
    appointments: 'المواعيد',
    completed: 'المكتملة',
    cancelled: 'الملغية',
    noShowRate: 'نسبة عدم الحضور',
    revenue: 'الدخل',
    occupancy: 'الإشغال',
    avgTicket: 'معدل الفاتورة',
    retention: 'رجوع الزبائن',
    newCustomers: 'جداد',
    returningCustomers: 'راجعين',
  },
  sections: {
    trend: 'الاتجاه',
    sources: 'مصادر الحجز',
    sourcesHint: 'من وين إجت المواعيد',
    barbers: 'أداء الحلاقين',
    services: 'أداء الخدمات',
    customers: 'زبائن جداد مقابل راجعين',
  },
  trendRevenue: 'الدخل',
  trendAppointments: 'المواعيد',
  retentionHint: '{{percent}} من زبائن الفترة الماضية رجعوا',
  customersServed: '{{count}} زبون انخدم',
  bookings: '{{count}} حجز',
  noShows: '{{count}} ما حضروا',
  noData: 'ما في مواعيد بهالفترة لسا.',
  mockNote: 'محسوبة من بيانات الصالون التجريبية بهالنموذج.',
};
export default analytics;
