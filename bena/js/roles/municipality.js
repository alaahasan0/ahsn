/* STUB — replaced by the full municipality experience. */
(function () {
  const B = window.B; const { L } = B;
  B.role({ id: 'municipality', icon: 'landmark', nav: 'drawer', name: { en: 'Municipality', ar: 'البلدية' }, tag: { en: 'Portal', ar: 'بوابة' }, desc: { en: 'Municipality', ar: 'البلدية' }, home: 'home',
    menu: [{ id: 'home', label: { en: 'Dashboard', ar: 'لوحة التحكم' }, icon: 'grid', tab: true }],
    pages: { home: () => B.ui.pageHead({ title: { en: 'Municipality', ar: 'البلدية' }, sub: 'Coming together…' }) } });
})();
