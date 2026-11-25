/* STUB — replaced by the full manager experience. */
(function () {
  const B = window.B; const { L } = B;
  B.role({ id: 'manager', icon: 'briefcase', nav: 'drawer', name: { en: 'Property Manager', ar: 'مدير العقارات' }, tag: { en: 'Portal', ar: 'بوابة' }, desc: { en: 'Property Manager', ar: 'مدير العقارات' }, home: 'home',
    menu: [{ id: 'home', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, icon: 'grid', tab: true }],
    pages: { home: () => B.ui.pageHead({ title: { en: 'Property Manager', ar: 'مدير العقارات' }, sub: 'Coming together…' }) } });
})();
