import type en from '../en/domain';
import type { DeepTranslation } from '../../types';

const domain: DeepTranslation<typeof en> = {
  status: {
    draft: 'مسودة',
    pending: 'بانتظار التأكيد',
    pendingShort: 'بانتظار',
    confirmed: 'مؤكد',
    checked_in: 'وصل',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    no_show: 'ما حضر',
    rescheduled: 'تغيّر موعده',
    expired: 'منتهي',
  },
  source: {
    phone: 'اتصال هاتفي',
    whatsapp: 'واتساب',
    online: 'حجز أونلاين',
    walk_in: 'حضور مباشر',
    staff: 'من الموظف',
    recurring: 'موعد دوري',
    voice: 'المساعد الصوتي',
  },
  sourceShort: {
    phone: 'تلفون',
    whatsapp: 'واتساب',
    online: 'أونلاين',
    walk_in: 'مباشر',
    staff: 'موظف',
    recurring: 'دوري',
    voice: 'صوتي',
  },
  category: {
    trusted: 'موثوق',
    regular: 'دائم',
    new: 'جديد',
  },
  categoryLong: {
    trusted: 'زبون موثوق',
    regular: 'زبون دائم',
    new: 'زبون جديد',
  },
  categoryHint: {
    trusted: 'ملتزم بمواعيده. بيقدر يحجز بدون تأكيد.',
    regular: 'بيزور كثير مع تغييرات أحياناً.',
    new: 'أول زيارات — يُفضّل طلب التأكيد.',
  },
  categoryPrivacy: 'تصنيف داخلي للصالون. ما بيظهر للزبائن أبداً.',
  role: {
    owner: 'صاحب الصالون',
    manager: 'مدير',
    barber: 'حلاق',
    receptionist: 'استقبال',
  },
};
export default domain;
