/* temporary sample role so the shell can be checked — replaced by the mobile build */
(function () { const B = window.B, M = B.m, { L } = B;
  B.mrole({ id: 'tech', name: { en: 'Field Technician', ar: 'فني ميداني' }, icon: 'wrench', persona: { name: { en: 'Ali Darwish', ar: 'علي درويش' }, sub: { en: 'Sanad Facility Services', ar: 'سند لخدمات المرافق' } }, home: 'home',
    tabs: [{ id: 'home', label: { en: 'Jobs', ar: 'المهام' }, icon: 'clipboard' }, { id: 'history', label: { en: 'History', ar: 'السجل' }, icon: 'history' }],
    screens: { home: () => ({ title: L('Today', 'اليوم'), large: true, kicker: L('Thursday 27 Nov', 'الخميس 27 ت٢'), body: M.kpis([{ label: L('Assigned', 'مُسندة'), value: 4, icon: 'clipboard' }, { label: L('Overdue', 'متأخرة'), value: 1, icon: 'alert', alert: true }]) + M.section(L('Next job', 'المهمة التالية'), M.group([M.cell({ icon: 'elevator', tone: 'warn', title: 'Elevator 3 door operator', sub: 'Manara Business Center · 10:30', go: 'history' })])) }),
      history: () => ({ title: L('History', 'السجل'), back: 'home', body: M.empty('history', L('No history yet', 'لا يوجد سجل')) }) } });
})();
