/*
 * BENA Mobile — Service Provider (Jaber Technical Services).
 * Persona: Yousef Jaber, owner. Run the business from the phone: triage
 * incoming requests, quote with live totals, dispatch the team, follow jobs
 * and customers. All customers, prices and jobs are fictional sample data;
 * quotes, invoices and messages are simulated in memory.
 */
(function () {
  const B = window.B, M = B.m, D = B.data;
  const { L, tx, icon, esc } = B;
  const T = (en, ar) => ({ en, ar });
  const R = 'provider';
  const VAT = 0.16;

  /* ======================================================================
     Styles (prefix mp-)
     ====================================================================== */
  B.css(`
  .mp-biz { background: var(--navy); color: var(--navy-ink); border-radius: 24px; padding: 18px; display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; }
  .mp-biz::after { content: ""; position: absolute; inset-inline-end: -40px; top: -40px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle, rgba(54,214,160,.2), rgba(54,214,160,0) 70%); pointer-events: none; }
  .mp-biz .b-top { display: flex; gap: 12px; align-items: center; }
  .mp-biz .b-logo { width: 46px; height: 46px; border-radius: 14px; background: var(--mint); color: var(--navy); display: grid; place-items: center; font: 800 17px/1 var(--font-display); flex: none; }
  .mp-biz h2 { color: #fff; font-size: 18px; line-height: 1.25; }
  .mp-biz .b-sub { font-size: 13.5px; margin-top: 2px; line-height: 1.4; }
  .mp-biz .b-sub svg { width: 14px; height: 14px; color: var(--mint); vertical-align: -2px; margin-inline-end: 4px; }
  .mp-biz .b-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; position: relative; z-index: 1; }
  .mp-biz .b-stats > * { background: rgba(255,255,255,.07); border-radius: 14px; padding: 10px 12px; text-align: start; min-width: 0; }
  .mp-biz .b-stats b { display: block; color: #fff; font: 700 18px/1.15 var(--font-display); font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mp-biz .b-stats small { font-size: 12px; }
  .mp-team { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; margin-inline: -16px; padding-inline: 16px; }
  .mp-team::-webkit-scrollbar { display: none; }
  .mp-mate { flex: none; width: 92px; background: #fff; border: 1px solid var(--line-2); border-radius: 18px; padding: 12px 8px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
  .mp-mate .avatar { width: 44px; height: 44px; font-size: 15px; position: relative; }
  .mp-mate b { font-size: 13px; line-height: 1.2; }
  .mp-mate small { font-size: 11.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
  .mp-mate small i { width: 7px; height: 7px; border-radius: 50%; }
  .mp-st-onjob { color: var(--violet); } .mp-st-onjob i { background: var(--violet); }
  .mp-st-available { color: var(--mint-ink); } .mp-st-available i { background: var(--mint); }
  .mp-st-office { color: var(--text-2); } .mp-st-office i { background: #B6C2BD; }
  .mp-card { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 14px 16px; display: flex; gap: 12px; align-items: flex-start; width: 100%; text-align: start; position: relative; }
  .mp-card:active { background: #F6F9F8; }
  .mp-card .c-i { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; flex: none; background: var(--mint-50); color: var(--mint-ink); }
  .mp-card .c-i svg { width: 22px; height: 22px; }
  .mp-card .c-b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .mp-card .c-b > b { font-size: 16px; line-height: 1.3; }
  .mp-card .c-b > small { font-size: 13.5px; color: var(--text-2); line-height: 1.35; }
  .mp-card .c-tags { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .mp-card .c-end { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; }
  .mp-card .c-end b { font: 700 16px/1.1 var(--font-display); font-variant-numeric: tabular-nums; }
  .mp-card .c-end small { font-size: 12px; color: var(--text-3); }
  .mp-card .chev { width: 18px; height: 18px; color: #B6C2BD; align-self: center; flex: none; }
  .mp-card.new::before { content: ""; position: absolute; top: 18px; inset-inline-start: 6px; width: 6px; height: 6px; border-radius: 50%; background: var(--mint); }
  .mp-list { display: flex; flex-direction: column; gap: 10px; }
  .mp-job { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; display: flex; align-items: stretch; width: 100%; text-align: start; overflow: hidden; min-height: 88px; }
  .mp-job:active { background: #F6F9F8; }
  .mp-job .j-t { width: 70px; flex: none; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border-inline-end: 1px solid var(--line-2); padding: 8px 4px; }
  .mp-job .j-t b { font: 700 17px/1 var(--font-display); direction: ltr; font-variant-numeric: tabular-nums; }
  .mp-job .j-t small { font-size: 11.5px; color: var(--text-3); font-weight: 600; text-align: center; }
  .mp-job .j-b { flex: 1; min-width: 0; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; justify-content: center; }
  .mp-job .j-b > b { font-size: 16px; line-height: 1.3; }
  .mp-job .j-b > small { font-size: 13.5px; color: var(--text-2); }
  .mp-job .j-who { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .mp-job .j-who .avatar { width: 24px; height: 24px; font-size: 10px; }
  .mp-job .j-who span { font-size: 13px; color: var(--text-2); font-weight: 600; }
  .mp-job .chev { width: 18px; height: 18px; color: #B6C2BD; align-self: center; margin-inline-end: 12px; flex: none; }
  .mp-head { display: flex; flex-direction: column; gap: 10px; }
  .mp-head .h-tags { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .mp-head h2 { font-size: 23px; line-height: 1.22; letter-spacing: -.015em; }
  .mp-head .h-meta { display: flex; flex-direction: column; gap: 6px; font-size: 14.5px; color: var(--text-2); }
  .mp-head .h-meta span { display: flex; gap: 8px; align-items: flex-start; }
  .mp-head .h-meta svg { width: 17px; height: 17px; color: var(--mint-ink); flex: none; margin-top: 1px; }
  .mp-text { font-size: 15.5px; line-height: 1.6; }
  .mp-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .mp-photos .mx-photo { border-radius: 14px; position: relative; }
  .mp-photos .mx-photo.filled svg { position: absolute; inset: 0; }
  .mp-sla { display: flex; gap: 12px; align-items: center; background: var(--warn-bg); color: #8A4108; border-radius: 16px; padding: 12px 14px; font-size: 14px; }
  .mp-sla svg { width: 20px; height: 20px; flex: none; color: var(--warn); }
  .mp-sla b { color: inherit; }
  .mx-screen > div:has(.mp-dock) { min-height: 100%; display: flex; flex-direction: column; }
  .mx-screen > div:has(.mp-dock) > .mx-body { flex: 1; }
  .mp-dock { position: sticky; bottom: 0; z-index: 4; margin: auto -16px -28px; padding: 12px 16px 30px; background: rgba(244,247,246,.88); backdrop-filter: saturate(1.6) blur(18px); -webkit-backdrop-filter: saturate(1.6) blur(18px); border-top: 1px solid var(--line); display: flex; gap: 10px; }
  .mp-dock .mx-btn { flex: 1; min-width: 0; min-height: 54px; border-radius: 16px; }
  .mp-dock .mx-btn.grow2 { flex: 2; }
  @media (max-width: 760px) { .mp-dock { padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px)); } }
  .mp-track { display: flex; align-items: flex-start; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 16px 6px 14px; }
  .mp-track .s { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; color: var(--text-3); position: relative; text-align: center; min-width: 0; }
  .mp-track .s i { width: 30px; height: 30px; border-radius: 50%; background: #fff; border: 2px solid var(--line); display: grid; place-items: center; position: relative; z-index: 1; color: var(--text-3); }
  .mp-track .s i svg { width: 16px; height: 16px; }
  .mp-track .s + .s::before { content: ""; position: absolute; top: 14px; inset-inline-end: 50%; width: 100%; height: 2px; background: var(--line); }
  .mp-track .s.done i { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .mp-track .s.done::before, .mp-track .s.cur::before { background: var(--mint) !important; }
  .mp-track .s.cur { color: var(--ink); }
  .mp-track .s.cur i { border-color: var(--mint-ink); color: var(--mint-ink); box-shadow: 0 0 0 5px rgba(54,214,160,.2); }
  .mp-quote { background: #fff; border: 1.5px solid var(--violet-bg); border-radius: 20px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .mp-quote .q-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .mp-quote .q-amt { font: 700 30px/1.1 var(--font-display); font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
  .mp-quote .q-row { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; color: var(--text-2); }
  .mp-quote .q-row b { color: var(--ink); font-variant-numeric: tabular-nums; font-weight: 600; }
  .mp-quote .q-row.tot { border-top: 1px solid var(--line-2); padding-top: 8px; font-size: 15px; color: var(--ink); font-weight: 700; }
  .mp-lines { display: flex; flex-direction: column; gap: 10px; }
  .mp-line { background: var(--surface-2); border: 1px solid var(--line); border-radius: 16px; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
  .mp-line .mx-input { min-height: 44px; border-radius: 12px; padding: 0 10px; font-size: 15px; }
  .mp-line .l-n { display: flex; align-items: center; gap: 6px; }
  .mp-line .l-q { width: 60px; text-align: center; }
  .mp-line .l-p { width: 84px; }
  .mp-line .l-x, .mp-line .l-cur { color: var(--text-3); font-size: 14px; font-weight: 600; }
  .mp-line .l-sum { margin-inline-start: auto; font-size: 15px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .mp-line .l-del { width: 40px; height: 44px; border-radius: 12px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; color: var(--bad); flex: none; }
  .mp-line .l-del svg { width: 18px; height: 18px; }
  .mp-addline { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; border-radius: 14px; border: 1.5px dashed #BCC9C3; color: var(--mint-ink); font-weight: 600; font-size: 15px; }
  .mp-addline svg { width: 18px; height: 18px; }
  .mp-totals { background: var(--navy); color: var(--navy-ink); border-radius: 18px; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
  .mp-totals div { display: flex; justify-content: space-between; font-size: 14px; }
  .mp-totals b { color: #fff; font-variant-numeric: tabular-nums; }
  .mp-totals .t-big { border-top: 1px solid rgba(255,255,255,.12); padding-top: 8px; margin-top: 2px; font-size: 15px; }
  .mp-totals .t-big b { font: 700 24px/1 var(--font-display); color: var(--mint); }
  .mp-week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 8px; }
  .mp-week button { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0 7px; border-radius: 14px; min-height: 64px; }
  .mp-week small { font-size: 11.5px; font-weight: 600; color: var(--text-3); }
  .mp-week b { font: 700 18px/1 var(--font-display); font-variant-numeric: tabular-nums; }
  .mp-week i { width: 5px; height: 5px; border-radius: 50%; background: transparent; }
  .mp-week .has i { background: var(--mint-ink); }
  .mp-week .today b { color: var(--mint-ink); }
  .mp-week .on { background: var(--navy); }
  .mp-week .on b, .mp-week .on small { color: #fff; }
  .mp-week .on i { background: var(--mint); }
  .mp-week .off b { color: var(--text-3); }
  .mp-day { position: relative; background: #fff; border: 1px solid var(--line-2); border-radius: 20px; padding: 6px 12px 6px 0; }
  .mp-hr { height: 56px; display: flex; gap: 10px; position: relative; }
  .mp-hr span { width: 50px; flex: none; font-size: 12px; color: var(--text-3); font-weight: 600; text-align: end; transform: translateY(-7px); font-variant-numeric: tabular-nums; direction: ltr; }
  html[dir="rtl"] .mp-hr span { text-align: start; padding-inline-start: 4px; }
  .mp-hr::after { content: ""; position: absolute; inset-inline: 60px 0; top: 0; border-top: 1px solid var(--line-2); }
  .mp-hr:first-child span { transform: translateY(2px); }
  .mp-blk { position: absolute; inset-inline: 66px 10px; border-radius: 12px; padding: 7px 10px; display: flex; flex-direction: column; gap: 2px; text-align: start; overflow: hidden; border-inline-start: 4px solid; }
  .mp-blk b { font-size: 13.5px; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mp-blk small { font-size: 12px; opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mp-now { position: absolute; inset-inline: 56px 0; height: 2px; background: #E5484D; z-index: 2; }
  .mp-now::before { content: ""; position: absolute; inset-inline-start: -4px; top: -4px; width: 10px; height: 10px; border-radius: 50%; background: #E5484D; }
  .mp-cust { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; padding: 6px 0 0; }
  .mp-cust .avatar { width: 76px; height: 76px; font-size: 26px; }
  .mp-cust h2 { font-size: 22px; }
  .mp-cust small { font-size: 14px; color: var(--text-2); }
  .mp-contact { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .mp-contact button { background: #fff; border: 1px solid var(--line-2); border-radius: 16px; min-height: 64px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; font-size: 13px; font-weight: 600; color: var(--mint-ink); }
  .mp-contact svg { width: 22px; height: 22px; }
  .mp-check { background: #fff; border: 1px solid var(--line-2); border-radius: 20px; overflow: hidden; }
  .mp-check div { display: flex; gap: 12px; padding: 12px 16px; align-items: center; font-size: 15px; position: relative; }
  .mp-check div + div::before { content: ""; position: absolute; top: 0; inset-inline: 52px 0; border-top: 1px solid var(--line-2); }
  .mp-check i { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #C3CEC9; display: grid; place-items: center; flex: none; }
  .mp-check i svg { width: 14px; height: 14px; }
  .mp-check .ok i { background: var(--mint); border-color: var(--mint); color: var(--navy); }
  .mp-check .ok span { color: var(--text-2); }
  .mp-opt { display: flex; gap: 12px; align-items: center; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 16px; cursor: pointer; background: #fff; }
  .mp-opt.on { border-color: var(--mint-ink); background: #F5FCF9; }
  .mp-opt b { font-size: 15px; display: block; }
  .mp-opt small { font-size: 13px; color: var(--text-2); }
  .mp-opt .r { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #C3CEC9; flex: none; margin-inline-start: auto; }
  .mp-opt.on .r { border-color: var(--mint-ink); background: var(--mint-ink); box-shadow: inset 0 0 0 4px #F5FCF9; }
  .mp-note { font-size: 13px; color: var(--text-3); text-align: center; display: flex; gap: 6px; align-items: center; justify-content: center; padding: 0 12px; line-height: 1.4; }
  .mp-note svg { width: 14px; height: 14px; flex: none; }
  .mp-stars { display: inline-flex; gap: 1px; color: #E9A23B; }
  .mp-stars svg { width: 14px; height: 14px; }
  .mp-stars .off { color: #D5DEDA; }
  `);

  /* ======================================================================
     Sample data (mirrors the provider web portal; self-contained)
     ====================================================================== */
  const PID = 'sp_jaber';
  const P = (D.provider && D.provider(PID)) || { id: PID, name: T('Jaber Technical Services', 'جابر للخدمات الفنية'), rating: 4.8, reviews: 214, jobs: 1320, since: 2011, response: T('~2 hrs', '~ساعتان'), verified: true, cats: ['plumbing', 'electrical', 'hvac', 'general'] };
  const TEAM = [
    { id: 't_yousef', name: T('Yousef Jaber', 'يوسف جابر'), role: T('Owner · master electrician', 'المالك · مهندس كهرباء'), status: 'office', color: '#142B3B' },
    { id: 't_ali', name: T('Ali Darwish', 'علي درويش'), role: T('Lead plumber', 'رئيس فنيي السباكة'), status: 'onjob', color: '#2D63C8' },
    { id: 't_samir', name: T('Samir Qasem', 'سمير قاسم'), role: T('Electrician', 'فني كهرباء'), status: 'onjob', color: '#B45309' },
    { id: 't_hadi', name: T('Hadi Nasr', 'هادي نصر'), role: T('HVAC technician', 'فني تكييف'), status: 'available', color: '#6E56CF' },
    { id: 't_rami', name: T('Rami Ayyad', 'رامي عياد'), role: T('Apprentice technician', 'فني متدرب'), status: 'available', color: '#0B8A60' },
  ];
  const tech = (id) => TEAM.find((t) => t.id === id) || TEAM[1];
  const TST = { onjob: T('On a job', 'في مهمة'), available: T('Available', 'متاح'), office: T('In office', 'في المكتب') };
  const RQ = (id, o) => ({ id, ...o });
  const REQS = [
    RQ('PR-24531', { bid: 'BN-RAM-00087', by: 'p_nadia', cat: 'electrical', status: 'new', priority: 'medium', created: '2026-11-24', hrs: 18, pref: { date: '2026-11-28', slot: 'morning' }, photos: 2, km: 3.4, title: T('Stairwell lights on timer keep failing', 'إنارة الدرج على المؤقت تتعطل باستمرار'), desc: T('Lights on floors 3–6 switch off after a few seconds or don’t come on at all. The timer unit is in the ground-floor cabinet.', 'إنارة الطوابق 3–6 تنطفئ بعد ثوانٍ أو لا تعمل إطلاقاً. وحدة المؤقت في خزانة الطابق الأرضي.') }),
    RQ('PR-24527', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-1102', by: 'p_khaled', cat: 'hvac', status: 'new', priority: 'medium', created: '2026-11-24', hrs: 20, pref: { date: '2026-11-30', slot: 'afternoon' }, photos: 3, km: 2.1, title: T('Install 2 split AC units before new tenant', 'تركيب مكيفين سبليت قبل المستأجر الجديد'), desc: T('Living room (18,000 BTU) and master bedroom (12,000 BTU). Units already purchased; need installation, piping and drain.', 'غرفة المعيشة (18,000 وحدة) وغرفة النوم الرئيسية (12,000 وحدة). الأجهزة مشتراة؛ نحتاج التركيب والأنابيب والتصريف.') }),
    RQ('PR-24522', { bid: 'BN-RAM-00266', unit: 'BN-RAM-00266-703', by: 'p_ruba', cat: 'plumbing', status: 'new', priority: 'high', created: '2026-11-23', hrs: 26, pref: { date: '2026-11-26', slot: 'morning' }, photos: 1, km: 1.8, title: T('Water heater not heating', 'سخان المياه لا يسخّن'), desc: T('80-litre electric heater, about 6 years old. The breaker doesn’t trip but water stays cold.', 'سخان كهربائي سعة 80 لتراً عمره نحو 6 سنوات. القاطع لا يفصل لكن المياه تبقى باردة.') }),
    RQ('PR-24519', { bid: 'BN-RAM-00415', by: 'p_rania', cat: 'electrical', status: 'new', priority: 'low', created: '2026-11-23', hrs: 30, pref: { date: '2026-12-02', slot: 'morning' }, photos: 0, km: 4.2, title: T('Quarterly panel inspection — 10 floors', 'الفحص الربعي للوحات — 10 طوابق'), desc: T('Thermal scan and torque check of floor panels plus the main distribution board. Report needed for the owners’ association.', 'مسح حراري وفحص شد للوحات الطوابق ولوحة التوزيع الرئيسية. مطلوب تقرير لجمعية المالكين.') }),
    RQ('PR-24515', { bid: 'BN-RAM-00203', unit: 'BN-RAM-00203-603', by: 'p_fadi', cat: 'general', status: 'new', priority: 'low', created: '2026-11-22', hrs: 44, pref: { date: '2026-12-04', slot: 'evening' }, photos: 2, km: 2.9, title: T('Re-seal bathroom and fix cabinet doors', 'إعادة عزل الحمّام وإصلاح أبواب الخزائن'), desc: T('Silicone around the shower is mouldy; two kitchen cabinet doors are hanging loose.', 'السيليكون حول الدش متعفن؛ وبابا خزانة في المطبخ مرتخيان.') }),
    RQ('PR-24508', { bid: 'BN-RAM-00311', unit: 'BN-RAM-00311-702', by: 'p_karim', cat: 'hvac', status: 'quoted', priority: 'medium', created: '2026-11-20', pref: { date: '2026-11-27', slot: 'morning' }, photos: 2, km: 3.0, title: T('AC condensate dripping in meeting room', 'تقطير مياه المكيف في قاعة الاجتماعات'), desc: T('Cassette unit drips onto the table after an hour of use.', 'وحدة الكاسيت تُقطّر على الطاولة بعد ساعة من التشغيل.') }),
    RQ('PR-24496', { bid: 'BN-RAM-00142', by: 'p_mona', cat: 'plumbing', status: 'quoted', priority: 'medium', created: '2026-11-18', pref: { date: '2026-11-29', slot: 'morning' }, photos: 1, km: 2.1, title: T('Booster pump pressure switch replacement', 'استبدال مفتاح ضغط مضخة التعزيز'), desc: T('Duty pump short-cycles at night; the committee wants a fixed quote before the general assembly.', 'المضخة العاملة تعمل وتتوقف بشكل متكرر ليلاً؛ تريد اللجنة عرضاً ثابتاً قبل الهيئة العامة.') }),
    RQ('PR-24489', { bid: 'BN-RAM-00744', by: 'p_basel', cat: 'electrical', status: 'quoted', priority: 'low', created: '2026-11-16', pref: { date: '2026-12-06', slot: 'afternoon' }, photos: 3, km: 6.5, title: T('Garden lighting circuit for 6 villas', 'دائرة إنارة الحديقة لـ 6 فلل'), desc: T('New outdoor circuit with 14 bollard lights and a photocell.', 'دائرة خارجية جديدة مع 14 عمود إنارة وحساس ضوئي.') }),
    RQ('PR-24480', { bid: 'BN-RAM-00529', by: 'p_hala', cat: 'electrical', status: 'declined', priority: 'medium', created: '2026-11-13', photos: 4, km: 5.1, reason: T('Fully booked on the requested dates', 'محجوزون بالكامل في المواعيد المطلوبة'), title: T('Full rewiring of a 1934 stone house', 'إعادة تمديد كاملة لبيت حجري من 1934'), desc: T('Heritage building; surface conduits preferred.', 'مبنى تراثي؛ يفضّل التمديد الخارجي.') }),
    RQ('PR-24461', { bid: 'BN-RAM-00087', by: 'p_nadia', cat: 'general', status: 'lost', priority: 'low', created: '2026-11-04', photos: 2, km: 3.4, title: T('Replace 6 stairwell windows', 'استبدال 6 نوافذ للدرج'), desc: T('Aluminium frames, double glazing.', 'إطارات ألمنيوم وزجاج مزدوج.') }),
  ];
  const QL = (d, q, p) => ({ d, q, p });
  const QUOTES = [
    { id: 'QT-3381', req: 'PR-24508', sent: '2026-11-21', valid: '2026-12-05', eta: 2, status: 'sent', lines: [QL(T('Clean and re-level cassette drain pan', 'تنظيف وتسوية حوض تصريف الكاسيت'), 1, 240), QL(T('Condensate pump replacement', 'استبدال مضخة التكثيف'), 1, 310)] },
    { id: 'QT-3376', req: 'PR-24496', sent: '2026-11-19', valid: '2026-12-03', eta: 3, status: 'sent', lines: [QL(T('Pressure switch 1.5–3 bar', 'مفتاح ضغط 1.5–3 بار'), 1, 380), QL(T('Pressure vessel recharge', 'إعادة شحن خزان الضغط'), 1, 160), QL(T('Labour (hours)', 'العمل (ساعات)'), 3, 85)] },
    { id: 'QT-3370', req: 'PR-24489', sent: '2026-11-17', valid: '2026-12-01', eta: 5, status: 'sent', lines: [QL(T('Bollard light fitting', 'عمود إنارة حديقة'), 14, 58), QL(T('Armoured cable 4 mm² (m)', 'كابل مسلح 4 مم² (م)'), 60, 6), QL(T('Labour (days)', 'العمل (أيام)'), 1, 102)] },
    { id: 'QT-3362', req: 'JB-3104', sent: '2026-11-15', valid: '2026-11-29', eta: 4, status: 'accepted', lines: [QL(T('Split AC service', 'صيانة مكيف سبليت'), 6, 135)] },
    { id: 'QT-3359', req: 'JB-3103', sent: '2026-11-12', valid: '2026-11-26', eta: 7, status: 'accepted', lines: [QL(T('LED downlight 12 W', 'سبوت LED ‏12 واط'), 22, 48), QL(T('Motion sensor', 'حساس حركة'), 1, 180), QL(T('Labour (lump sum)', 'العمل (مبلغ مقطوع)'), 1, 614)] },
    { id: 'QT-3344', req: 'MR-24355', sent: '2026-11-11', valid: '2026-11-25', eta: 1, status: 'accepted', lines: [QL(T('Booster pump bearing kit', 'طقم محامل مضخة التعزيز'), 1, 420), QL(T('Labour (hours)', 'العمل (ساعات)'), 4, 80)] },
    { id: 'QT-3352', req: 'PR-24461', sent: '2026-11-05', valid: '2026-11-19', eta: 6, status: 'declined', lines: [QL(T('Aluminium window, double glazed', 'نافذة ألمنيوم بزجاج مزدوج'), 6, 330), QL(T('Removal & installation', 'الفك والتركيب'), 1, 320)] },
  ];
  const qSub = (q) => B.sum(q.lines, (l) => l.q * l.p);
  const qTot = (q) => Math.round(qSub(q) * (1 + VAT));
  const J = (id, o) => ({ id, ...o });
  const reqT = (rid, k, fb) => { const r = D.request ? D.request(rid) : null; return (r && r[k]) || fb; };
  const CHECK = {
    electrical: [T('Isolate circuit & lock out', 'عزل الدائرة وقفلها'), T('Test with meter', 'الفحص بجهاز القياس'), T('Repair or replace component', 'إصلاح أو استبدال المكوّن'), T('Insulation & RCD test', 'اختبار العزل وقاطع التسرب'), T('Before/after photos', 'صور قبل وبعد')],
    plumbing: [T('Shut off water supply', 'إغلاق مصدر المياه'), T('Locate the source', 'تحديد مصدر المشكلة'), T('Replace fittings / parts', 'استبدال الوصلات / القطع'), T('Pressure test 15 min', 'اختبار ضغط 15 دقيقة'), T('Before/after photos', 'صور قبل وبعد')],
    hvac: [T('Isolate power', 'فصل الكهرباء'), T('Clean filters & coils', 'تنظيف الفلاتر والملفات'), T('Flush drain line', 'تنظيف خط التصريف'), T('10-minute test run', 'تشغيل تجريبي 10 دقائق'), T('Before/after photos', 'صور قبل وبعد')],
    general: [T('Protect floors & furniture', 'حماية الأرضيات والأثاث'), T('Remove old material', 'إزالة المواد القديمة'), T('Install / repair', 'التركيب / الإصلاح'), T('Quality check', 'فحص الجودة'), T('Before/after photos', 'صور قبل وبعد')],
  };
  const JOBS = [
    J('JB-3101', { bid: 'BN-RAM-00311', by: 'p_omar', cat: 'electrical', date: '2026-11-25', time: '10:30', dur: 1.5, status: 'enroute', tech: 't_samir', amount: 520, title: T('Replace faulty RCD — floor 4 panel', 'استبدال قاطع تسرب معطل — لوحة الطابق 4'), desc: T('RCD trips randomly; tenants on floor 4 lose power.', 'قاطع التسرب يفصل عشوائياً؛ تنقطع الكهرباء عن مستأجري الطابق 4.') }),
    J('JB-3102', { bid: 'BN-RAM-00087', unit: 'BN-RAM-00087-402', by: 'p_khaled', cat: 'plumbing', date: '2026-11-25', time: '13:00', dur: 1.5, status: 'scheduled', tech: 't_ali', amount: 260, title: T('Water heater thermostat replacement', 'استبدال ترموستات سخان المياه'), desc: T('Thermostat diagnosed as faulty; part in stock.', 'تم تشخيص عطل الترموستات؛ القطعة متوفرة.') }),
    J('JB-3103', { bid: 'BN-RAM-00142', by: 'p_samer', cat: 'electrical', date: '2026-11-25', time: '15:30', dur: 2.5, status: 'scheduled', tech: 't_samir', amount: 1850, quote: 'QT-3359', title: T('Lobby lighting retrofit to LED', 'تحويل إنارة الردهة إلى LED'), desc: T('Replace 22 downlights and add a motion sensor, approved by the owners’ association.', 'استبدال 22 سبوت وإضافة حساس حركة، بموافقة جمعية المالكين.') }),
    J('MR-24518', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-803', by: 'p_lina', cat: 'plumbing', date: '2026-11-26', time: '09:30', dur: 1, status: 'inProgress', tech: 't_ali', amount: 210, title: reqT('MR-24518', 'title', T('Kitchen sink leaking under cabinet', 'تسريب تحت مغسلة المطبخ')), desc: reqT('MR-24518', 'desc', T('Slow leak from the drain pipe.', 'تسريب بطيء من أنبوب التصريف.')), notes: T('First visit 23 Nov: drain trap cracked. Returning with a new trap and seal.', 'الزيارة الأولى 23 ت٢: سيفون التصريف مشقوق. العودة بسيفون وحشوة جديدة.'), checked: 3 }),
    J('MR-24355', { bid: 'BN-RAM-00203', by: 'p_layla', cat: 'plumbing', date: '2026-11-26', time: '13:00', dur: 2, status: 'scheduled', tech: 't_ali', amount: 740, quote: 'QT-3344', title: reqT('MR-24355', 'title', T('Booster pump noisy at night', 'مضخة الضغط مزعجة ليلاً')), desc: T('Replace bearings on the duty booster pump.', 'استبدال محامل مضخة التعزيز العاملة.') }),
    J('JB-3104', { bid: 'BN-RAM-00415', by: 'p_rania', cat: 'hvac', date: '2026-11-28', time: '09:00', dur: 4, status: 'scheduled', tech: 't_hadi', amount: 810, quote: 'QT-3362', title: T('AC service — 6 split units (offices)', 'صيانة 6 مكيفات سبليت (مكاتب)'), desc: T('Pre-winter service for the management office and meeting rooms.', 'صيانة ما قبل الشتاء لمكتب الإدارة وقاعات الاجتماعات.') }),
    J('JB-3105', { bid: 'BN-RAM-00618', unit: 'BN-RAM-00618-604', by: 'p_nabil', cat: 'electrical', date: '2026-12-01', time: '10:00', dur: 3, status: 'scheduled', tech: 't_samir', amount: 430, title: T('Add 4 dedicated socket circuits — clinic', 'إضافة 4 دوائر مقابس مخصصة — عيادة'), desc: T('For the dental chair and sterilisation equipment.', 'لكرسي الأسنان وأجهزة التعقيم.') }),
    J('JB-3092', { bid: 'BN-RAM-00266', unit: 'BN-RAM-00266-401', by: 'p_fadi', cat: 'electrical', date: '2026-11-24', time: '12:00', dur: 1.5, status: 'completed', tech: 't_samir', amount: 420, title: T('Replace 6 damaged sockets', 'استبدال 6 مقابس تالفة'), paid: false }),
    J('JB-3090', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-704', by: 'p_tariq', cat: 'hvac', date: '2026-11-23', time: '10:00', dur: 2, status: 'completed', tech: 't_hadi', amount: 300, rating: 4, title: T('Split AC service — 2 units', 'صيانة مكيفين سبليت'), paid: true }),
    J('JB-3077', { bid: 'BN-RAM-00087', by: 'p_ibrahim', cat: 'plumbing', date: '2026-11-21', time: '16:00', dur: 1, status: 'completed', tech: 't_rami', amount: 160, rating: 3, title: T('Leak under the stairwell sink', 'تسريب تحت مغسلة الدرج'), paid: true }),
    J('JB-3088', { bid: 'BN-RAM-00203', by: 'p_layla', cat: 'plumbing', date: '2026-11-18', time: '09:00', dur: 1.5, status: 'completed', tech: 't_ali', amount: 200, rating: 5, title: T('Booster pump diagnosis', 'تشخيص مضخة التعزيز'), paid: true }),
    J('JB-3085', { bid: 'BN-RAM-00415', by: 'p_rania', cat: 'electrical', date: '2026-11-12', time: '08:30', dur: 5, status: 'completed', tech: 't_samir', amount: 1200, rating: 5, title: T('Emergency lighting test — 10 floors', 'اختبار إنارة الطوارئ — 10 طوابق'), paid: true }),
    J('JB-3081', { bid: 'BN-RAM-00311', unit: 'BN-RAM-00311-702', by: 'p_karim', cat: 'hvac', date: '2026-11-06', time: '11:00', dur: 2, status: 'completed', tech: 't_hadi', amount: 380, rating: 4, title: T('AC drain line repair', 'إصلاح خط تصريف المكيف'), paid: true }),
    J('MR-24211', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-803', by: 'p_lina', cat: 'electrical', date: '2026-10-30', time: '17:00', dur: 1, status: 'completed', tech: 't_ali', amount: 180, rating: 5, title: reqT('MR-24211', 'title', T('Balcony light not working', 'إنارة الشرفة لا تعمل')), paid: true }),
    J('JB-3070', { bid: 'BN-RAM-00142', unit: 'BN-RAM-00142-1102', by: 'p_khaled', cat: 'general', date: '2026-09-18', time: '09:00', dur: 6, status: 'completed', tech: 't_rami', amount: 640, rating: 5, title: T('Pre-tenancy fixes — unit 1102', 'إصلاحات قبل التأجير — الوحدة 1102'), paid: true }),
    J('JB-3061', { bid: 'BN-RAM-00142', by: 'p_hiba', cat: 'electrical', date: '2026-08-30', time: '08:00', dur: 7, status: 'completed', tech: 't_samir', amount: 2100, rating: 5, title: T('Stairwell timers — all 14 floors', 'مؤقتات الدرج — جميع الطوابق الـ14'), paid: true }),
  ];
  JOBS.forEach((j) => { const list = CHECK[j.cat] || CHECK.general; const n = j.status === 'completed' ? list.length : j.checked || (j.status === 'inProgress' ? 2 : 0); j.check = list.map((_, i) => i < n); });
  const CROLE = { p_lina: T('Tenant', 'مستأجرة'), p_khaled: T('Owner', 'مالك'), p_samer: T('Association chair', 'رئيس الجمعية'), p_rania: T('Property manager · Arkan', 'مديرة عقارات · أركان'), p_omar: T('Facility manager · Sanad', 'مدير مرافق · سند'), p_nadia: T('Committee coordinator', 'منسقة اللجنة'), p_mona: T('Committee member', 'عضو لجنة'), p_layla: T('Authorised manager', 'مديرة مفوّضة'), p_hiba: T('Association treasurer', 'أمينة صندوق الجمعية'), p_karim: T('Office tenant', 'مستأجر مكتب'), p_ruba: T('Owner', 'مالكة'), p_fadi: T('Owner', 'مالك'), p_basel: T('Developer', 'مطوّر'), p_hala: T('Owner', 'مالكة'), p_nabil: T('Clinic owner', 'صاحب عيادة'), p_tariq: T('Owner', 'مالك'), p_ibrahim: T('Resident', 'ساكن') };

  /* ======================================================================
     Session state
     ====================================================================== */
  const S = { day: '2026-11-25', seq: 3390 };
  const req = (id) => REQS.find((r) => r.id === id);
  const job = (id) => JOBS.find((j) => j.id === id);
  const quoteOf = (rid) => QUOTES.find((q) => q.req === rid);
  const quote = (id) => QUOTES.find((q) => q.id === id);

  /* ======================================================================
     Helpers
     ====================================================================== */
  const bld = (id) => (D.building && D.building(id)) || { id, name: T('Sample building', 'مبنى نموذجي') };
  const bname = (id) => tx(bld(id).name);
  const pname = (p) => (D.pname ? D.pname(p) : p);
  const pobj = (p) => (D.person ? D.person(p) : { name: T(p, p) });
  const ckey = (p) => String(p).replace(/^p_/, '');
  const crole = (p) => tx(CROLE[p] || T('Customer', 'عميل'));
  const catOf = (id) => (D.cat ? D.cat(id) : { name: T(id, id), icon: 'wrench' });
  const idm = (s) => B.ui.idMono(s);
  const note = (t) => `<div class="mp-note">${icon('info')}${t}</div>`;
  const stars = (n) => `<span class="mp-stars" aria-label="${n}/5">${[1, 2, 3, 4, 5].map((i) => icon('star', i <= n ? '' : 'off')).join('')}</span>`;
  const unitNo = (u) => (u ? String(u).split('-').pop() : null);
  const where = (o) => `${bname(o.bid)}${o.unit ? ' · ' + L('unit', 'الوحدة') + ' ' + unitNo(o.unit) : ' · ' + L('common area', 'منطقة مشتركة')}`;
  const SLOT = { morning: T('Morning', 'صباحاً'), afternoon: T('Afternoon', 'بعد الظهر'), evening: T('Evening', 'مساءً') };
  const DOW = { en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'] };
  const DOWF = { en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] };
  const dow = (d, full) => (full ? DOWF : DOW)[B.isAr() ? 'ar' : 'en'][new Date(d + 'T12:00:00').getDay()];
  const dayLabel = (d) => (d === '2026-11-25' ? L('Today', 'اليوم') : d === '2026-11-26' ? L('Tomorrow', 'غداً') : d === '2026-11-24' ? L('Yesterday', 'أمس') : `${dow(d)} ${B.dateShort(d)}`);
  const JST = { scheduled: 'scheduled', enroute: 'enroute', inProgress: 'inProgress', completed: 'completed' };
  const XST = { enroute: { en: 'En route', ar: 'في الطريق', tone: 'info', icon: 'route' }, lost: { en: 'Not awarded', ar: 'لم يُرسَ', tone: 'neutral' }, sent: { en: 'Sent', ar: 'مُرسل', tone: 'violet', icon: 'send' } };
  const st = (k) => { const x = XST[k]; return x ? `<span class="badge ${x.tone}">${x.icon ? icon(x.icon) : '<i class="bd"></i>'}${tx(x)}</span>` : B.ui.status(k); };
  const stl = (k) => (XST[k] ? tx(XST[k]) : B.ui.statusLabel(k));
  const prioBadge = (p) => (p === 'high' ? B.ui.badge(L('Urgent', 'عاجل'), 'bad', 'alert') : '');
  const bell = () => ({ icon: 'bell', go: 'notifications', label: L('Notifications', 'الإشعارات'), dot: true });
  const newReqs = () => REQS.filter((r) => r.status === 'new');
  const todayJobs = () => JOBS.filter((j) => j.date === '2026-11-25').sort((a, b) => a.time.localeCompare(b.time));
  const later = (fn) => setTimeout(fn, 30);
  const ago = (h) => (h < 24 ? L(`${h} h ago`, `قبل ${h} س`) : L(`${Math.round(h / 24)} d ago`, `قبل ${Math.round(h / 24)} يوم`));

  /* ======================================================================
     Quote builder sheet (live totals without re-rendering)
     ====================================================================== */
  const SUGGEST = {
    electrical: [[T('Call-out & diagnosis', 'زيارة وتشخيص'), 1, 120], [T('Parts (timer relay / breaker)', 'قطع (مرحّل مؤقت / قاطع)'), 1, 95], [T('Labour (hours)', 'العمل (ساعات)'), 2, 85]],
    plumbing: [[T('Call-out & diagnosis', 'زيارة وتشخيص'), 1, 100], [T('Parts (element / thermostat)', 'قطع (سخان / ترموستات)'), 1, 140], [T('Labour (hours)', 'العمل (ساعات)'), 2, 75]],
    hvac: [[T('Split AC installation', 'تركيب مكيف سبليت'), 2, 450], [T('Copper piping & insulation (m)', 'أنابيب نحاس وعزل (م)'), 8, 35], [T('Drain line & wall sleeve', 'خط تصريف وجلبة جدار'), 2, 60]],
    general: [[T('Materials (silicone, hinges)', 'مواد (سيليكون، مفصلات)'), 1, 90], [T('Labour (hours)', 'العمل (ساعات)'), 3, 70]],
  };
  const lineRow = (i, l = { d: '', q: 1, p: 0 }) => `<div class="mp-line" data-line="${i}">
      <input class="mx-input l-d" id="mpd${i}" name="d${i}" value="${esc(tx(l.d))}" placeholder="${esc(L('Item description', 'وصف البند'))}" aria-label="${esc(L('Item', 'البند'))}" required>
      <div class="l-n"><input class="mx-input l-q" id="mpq${i}" name="q${i}" type="number" min="0" step="1" inputmode="numeric" value="${l.q}" aria-label="${esc(L('Quantity', 'الكمية'))}"><span class="l-x">×</span><input class="mx-input l-p" id="mpp${i}" name="p${i}" type="number" min="0" step="5" inputmode="decimal" value="${l.p}" aria-label="${esc(L('Unit price ₪', 'سعر الوحدة ₪'))}"><span class="l-cur">₪</span><b class="l-sum" data-sum>${B.money(l.q * l.p)}</b>
      <button type="button" class="l-del" data-act="mpLineDel" data-arg="${i}" aria-label="${L('Remove line', 'حذف البند')}">${icon('trash')}</button></div></div>`;
  const recalc = () => {
    const host = document.querySelector('.mx-sheet');
    if (!host) return;
    let sub = 0;
    host.querySelectorAll('.mp-line').forEach((row) => {
      const q = +(row.querySelector('[name^="q"]').value || 0), p = +(row.querySelector('[name^="p"]').value || 0);
      sub += q * p;
      row.querySelector('[data-sum]').textContent = B.money(q * p);
    });
    const set = (k, v) => { const el = host.querySelector(`[data-t="${k}"]`); if (el) el.textContent = v; };
    set('sub', B.money(sub)); set('vat', B.money(sub * VAT));
    host.querySelectorAll('[data-t="tot"]').forEach((el) => { el.textContent = B.money(Math.round(sub * (1 + VAT))); });
    const n = host.querySelectorAll('.mp-line').length;
    set('n', L(`${n} ${n === 1 ? 'line' : 'lines'}`, `${n} بنود`));
  };
  let lineSeq = 0;
  B.act.mpQuote = (rid) => {
    const r = req(rid) || newReqs()[0];
    if (!r) return M.toast(L('No open requests to quote', 'لا توجد طلبات مفتوحة للتسعير'), 'info');
    const ex = quoteOf(r.id);
    const lines = ex ? ex.lines.map((l) => ({ ...l })) : (SUGGEST[r.cat] || SUGGEST.general).map(([d, q, p]) => ({ d, q, p }));
    lineSeq = lines.length;
    M.sheet({
      title: ex ? L('Edit quote', 'تعديل العرض') : L('New quote', 'عرض سعر جديد'), sub: `${esc(tx(r.title))} · ${esc(pname(r.by))}`, form: 'mpQuote',
      body: `<input type="hidden" name="req" value="${esc(r.id)}">
        <div class="row between"><b style="font-size:15px">${L('Line items', 'البنود')}</b><span class="muted" style="font-size:13px" data-t="n"></span></div>
        <div class="mp-lines" id="mp-lines">${lines.map((l, i) => lineRow(i, l)).join('')}</div>
        <button type="button" class="mp-addline" data-act="mpLineAdd">${icon('plus')}${L('Add line', 'إضافة بند')}</button>
        <div class="mp-totals"><div><span>${L('Subtotal', 'المجموع الفرعي')}</span><b data-t="sub"></b></div><div><span>${L('VAT 16%', 'ضريبة القيمة المضافة 16%')}</span><b data-t="vat"></b></div><div class="t-big"><span>${L('Total', 'الإجمالي')}</span><b data-t="tot"></b></div></div>
        <div class="row" style="gap:10px">${M.field({ name: 'eta', label: L('Work time', 'مدة العمل'), type: 'select', value: ex ? ex.eta : 1, options: [1, 2, 3, 5, 7].map((d) => ({ v: d, l: L(`${d} ${d === 1 ? 'day' : 'days'}`, `${d} ${d === 1 ? 'يوم' : 'أيام'}`) })) })}${M.field({ name: 'valid', label: L('Valid for', 'صالح لمدة'), type: 'select', value: 14, options: [7, 14, 30].map((d) => ({ v: d, l: L(`${d} days`, `${d} يوماً`) })) })}</div>
        ${M.field({ name: 'note', label: L('Message to the customer', 'رسالة إلى العميل'), type: 'textarea', placeholder: L('e.g. Price includes parts and a 6-month warranty.', 'مثلاً: السعر يشمل القطع وضماناً لمدة 6 أشهر.') })}
        ${note(L('Quote is simulated — nothing is sent to the customer.', 'العرض محاكاة — لا يُرسل شيء إلى العميل.'))}`,
      foot: M.btn(L('Cancel', 'إلغاء'), { act: 'mxClose' }) + M.btn(`${ex ? L('Update', 'تحديث') : L('Send', 'إرسال')} · <span data-t="tot"></span>`, { kind: 'primary', type: 'submit', icon: 'send' }),
    });
    const host = document.querySelector('.mx-sheet');
    if (host) {
      host.addEventListener('input', recalc);
      host.querySelectorAll('.row .mx-field').forEach((f) => { f.style.flex = '1'; f.style.minWidth = '0'; });
    }
    recalc();
  };
  B.act.mpLineAdd = () => {
    const box = document.getElementById('mp-lines'); if (!box) return;
    box.insertAdjacentHTML('beforeend', lineRow(lineSeq++));
    recalc();
    const last = box.lastElementChild && box.lastElementChild.querySelector('input'); if (last) last.focus();
  };
  B.act.mpLineDel = (i) => {
    const box = document.getElementById('mp-lines'); if (!box) return;
    if (box.children.length <= 1) return M.toast(L('A quote needs at least one line', 'يحتاج العرض بنداً واحداً على الأقل'), 'info');
    const row = box.querySelector(`[data-line="${i}"]`); if (row) row.remove();
    recalc();
  };
  B.submit.mpQuote = (d) => {
    const r = req(d.req); if (!r) return M.close();
    const lines = Object.keys(d).filter((k) => /^d\d+$/.test(k)).map((k) => { const i = k.slice(1); const t = String(d[k] || '').trim(); return { d: T(t, t), q: +d['q' + i] || 0, p: +d['p' + i] || 0 }; }).filter((l) => l.d.en && l.q * l.p > 0);
    if (!lines.length) return M.toast(L('Add at least one priced line', 'أضف بنداً مسعّراً واحداً على الأقل'), 'alert');
    let q = quoteOf(r.id);
    if (q) { q.lines = lines; q.eta = +d.eta || q.eta; q.sent = '2026-11-25'; }
    else { q = { id: `QT-${++S.seq}`, req: r.id, sent: '2026-11-25', valid: d.valid === '7' ? '2026-12-02' : d.valid === '30' ? '2026-12-25' : '2026-12-09', eta: +d.eta || 1, status: 'sent', lines, fresh: true }; QUOTES.unshift(q); }
    r.status = 'quoted';
    B.refresh();
    M.success({ title: L('Quote sent', 'تم إرسال العرض'), text: L(`${B.money(qTot(q))} incl. VAT to ${pname(r.by)}. You’ll be notified when they respond.`, `${B.money(qTot(q))} شاملة الضريبة إلى ${pname(r.by)}. سيصلك إشعار عند الرد.`), ref: q.id, done: `m-${R}-quotes`, doneLabel: L('View quotations', 'عرض عروض الأسعار') });
  };

  /* other actions */
  B.act.mpDecline = (rid) => {
    const r = req(rid); if (!r) return;
    const reasons = [T('Fully booked on the requested dates', 'محجوزون بالكامل في المواعيد المطلوبة'), T('Outside our service area', 'خارج منطقة خدمتنا'), T('Not a service we offer', 'ليست خدمة نقدمها'), T('Need more information first', 'نحتاج معلومات إضافية أولاً')];
    M.sheet({ title: L('Decline request', 'رفض الطلب'), sub: esc(tx(r.title)), form: 'mpDecline',
      body: `<input type="hidden" name="req" value="${esc(r.id)}"><div style="display:flex;flex-direction:column;gap:8px">${reasons.map((x, i) => `<label class="mp-opt ${i === 0 ? 'on' : ''}"><input type="radio" name="reason" value="${i}" ${i === 0 ? 'checked' : ''} style="position:absolute;opacity:0;pointer-events:none"><b>${tx(x)}</b><span class="r"></span></label>`).join('')}</div>${note(L('The customer is told politely and can invite another provider.', 'يُبلَّغ العميل بلطف ويمكنه دعوة مزوّد آخر.'))}`,
      foot: M.btn(L('Cancel', 'إلغاء'), { act: 'mxClose' }) + M.btn(L('Decline', 'رفض'), { kind: 'danger', type: 'submit' }) });
    const host = document.querySelector('.mx-sheet');
    if (host) host.addEventListener('change', (e) => { if (e.target.name === 'reason') host.querySelectorAll('.mp-opt').forEach((o) => o.classList.toggle('on', o.querySelector('input').checked)); });
    host && (host.dataset.reasons = JSON.stringify(reasons));
  };
  B.submit.mpDecline = (d, f) => {
    const r = req(d.req); if (!r) return;
    const reasons = JSON.parse((f.closest('.mx-sheet') || {}).dataset.reasons || '[]');
    r.status = 'declined'; r.reason = reasons[+d.reason] || null;
    B.refresh();
    later(() => M.toast(L('Request declined — customer notified (simulated)', 'تم رفض الطلب — أُبلغ العميل (محاكاة)'), 'xCircle'));
  };
  B.act.mpQuoteView = (id) => {
    const q = quote(id); if (!q) return;
    const r = req(q.req) || job(q.req);
    const who = r ? pname(r.by) : '';
    M.sheet({ title: idm(q.id), sub: r ? `${esc(tx(r.title))} · ${esc(who)}` : '',
      body: `<div class="mp-quote"><div class="q-top"><span class="q-amt">${B.money(qTot(q))}</span>${st(q.status)}</div>${q.lines.map((l) => `<div class="q-row"><span>${esc(tx(l.d))} × ${l.q}</span><b>${B.money(l.q * l.p)}</b></div>`).join('')}<div class="q-row"><span>${L('VAT 16%', 'الضريبة 16%')}</span><b>${B.money(qSub(q) * VAT)}</b></div><div class="q-row tot"><span>${L('Total', 'الإجمالي')}</span><b>${B.money(qTot(q))}</b></div></div>`
        + B.ui.kv([[L('Sent', 'أُرسل'), B.date(q.sent)], [L('Valid until', 'صالح حتى'), B.date(q.valid)], [L('Work time', 'مدة العمل'), L(`${q.eta} ${q.eta === 1 ? 'day' : 'days'}`, `${q.eta} ${q.eta === 1 ? 'يوم' : 'أيام'}`)]])
        + note(L('Sample quotation', 'عرض سعر نموذجي')),
      foot: q.status === 'sent' ? M.btn(L('Edit', 'تعديل'), { act: 'mpQuote', arg: q.req, icon: 'edit' }) + M.btn(L('Send reminder', 'إرسال تذكير'), { kind: 'primary', act: 'mpRemind', arg: q.id, icon: 'bell' }) : q.status === 'accepted' && job(q.req) ? M.btn(L('Open job', 'فتح المهمة'), { kind: 'primary', go: `job-${q.req}`, icon: 'briefcase' }) : M.btn(L('Done', 'تم'), { kind: 'primary', act: 'mxClose' }) });
  };
  B.act.mpRemind = (id) => { M.close(); later(() => M.toast(L(`Reminder sent for ${id} (simulated)`, `تم إرسال تذكير بخصوص ${id} (محاكاة)`), 'bell')); };
  B.act.mpNewQuote = () => {
    const list = newReqs();
    if (!list.length) return M.toast(L('All requests already have quotes', 'جميع الطلبات لديها عروض بالفعل'), 'info');
    M.sheet({ title: L('Quote which request?', 'تسعير أي طلب؟'), body: M.group(list.map((r) => M.cell({ icon: catOf(r.cat).icon, tone: 'mint', title: r.title, sub: `${pname(r.by)} · ${bname(r.bid)}`, act: 'mpQuote', arg: r.id }))) });
  };
  const STAGES = ['scheduled', 'enroute', 'inProgress', 'completed'];
  B.act.mpAdvance = (id) => {
    const j = job(id); if (!j) return;
    const i = STAGES.indexOf(j.status);
    if (i < 0 || i >= STAGES.length - 1) return;
    j.status = STAGES[i + 1];
    if (j.status === 'completed') { j.check = j.check.map(() => true); j.paid = false; }
    if (j.status === 'inProgress' && !j.check.some(Boolean)) j.check[0] = true;
    B.refresh();
    later(() => M.toast(L(`Status: ${stl(j.status)} · customer notified (simulated)`, `الحالة: ${stl(j.status)} · تم إبلاغ العميل (محاكاة)`)));
  };
  B.act.mpAssign = (id) => {
    const j = job(id); if (!j) return;
    M.sheet({ title: L('Assign technician', 'إسناد فني'), sub: esc(tx(j.title)), form: 'mpAssign',
      body: `<input type="hidden" name="job" value="${esc(j.id)}"><div style="display:flex;flex-direction:column;gap:8px">${TEAM.map((t) => `<label class="mp-opt ${t.id === j.tech ? 'on' : ''}"><input type="radio" name="tech" value="${t.id}" ${t.id === j.tech ? 'checked' : ''} style="position:absolute;opacity:0;pointer-events:none">${B.ui.avatar(t.name, '', t.color + '22')}<span style="min-width:0"><b>${tx(t.name)}</b><small>${tx(t.role)} · <span class="mp-st-${t.status}">${tx(TST[t.status])}</span></small></span><span class="r"></span></label>`).join('')}</div>`,
      foot: M.btn(L('Cancel', 'إلغاء'), { act: 'mxClose' }) + M.btn(L('Assign', 'إسناد'), { kind: 'primary', type: 'submit', icon: 'userCheck' }) });
    const host = document.querySelector('.mx-sheet');
    if (host) host.addEventListener('change', (e) => { if (e.target.name === 'tech') host.querySelectorAll('.mp-opt').forEach((o) => o.classList.toggle('on', o.querySelector('input').checked)); });
  };
  B.submit.mpAssign = (d) => { const j = job(d.job); if (!j) return; j.tech = d.tech; B.refresh(); later(() => M.toast(L(`${tx(tech(d.tech).name)} assigned — job sent to their phone (simulated)`, `تم إسناد ${tx(tech(d.tech).name)} — أُرسلت المهمة إلى هاتفه (محاكاة)`), 'userCheck')); };
  B.act.mpInvoice = (id) => {
    const j = job(id); if (!j) return;
    j.invoiced = true;
    B.refresh();
    M.success({ title: L('Invoice sent', 'تم إرسال الفاتورة'), text: L(`${B.money(Math.round(j.amount * (1 + VAT)))} incl. VAT to ${pname(j.by)}. Payment is simulated in this prototype.`, `${B.money(Math.round(j.amount * (1 + VAT)))} شاملة الضريبة إلى ${pname(j.by)}. الدفع محاكاة في هذا النموذج.`), ref: 'INV-' + j.id.replace(/^\D+-/, '') });
  };
  B.act.mpDay = (d) => { S.day = d; B.refresh(); };

  /* ======================================================================
     Shared blocks
     ====================================================================== */
  const reqCard = (r) => {
    const c = catOf(r.cat);
    const q = quoteOf(r.id);
    return `<button class="mp-card ${r.status === 'new' ? 'new' : ''}" data-go="request-${r.id}"><span class="c-i">${icon(c.icon)}</span><span class="c-b"><b>${tx(r.title)}</b><small>${pname(r.by)} · ${bname(r.bid)}</small><span class="c-tags">${st(r.status)}${prioBadge(r.priority)}${r.pref && r.status === 'new' ? `<span class="badge">${icon('calendar')}${B.dateShort(r.pref.date)} · ${tx(SLOT[r.pref.slot])}</span>` : ''}${q ? `<span class="badge violet">${B.money(qTot(q))}</span>` : ''}</span></span><span class="c-end">${r.hrs ? `<small>${ago(r.hrs)}</small>` : ''}<small>${L(`${r.km} km`, `${r.km} كم`)}</small></span></button>`;
  };
  const jobCard = (j, showDay) => {
    const t = tech(j.tech);
    return `<button class="mp-job" data-go="job-${j.id}"><span class="j-t">${showDay ? `<small>${dayLabel(j.date)}</small>` : ''}<b>${j.time}</b>${showDay ? '' : `<small>${L(`${j.dur} h`, `${j.dur} س`)}</small>`}</span><span class="j-b"><span class="c-tags" style="display:flex;gap:6px;flex-wrap:wrap">${st(j.status)}${j.status === 'completed' && !j.paid ? `<span class="badge warn">${j.invoiced ? L('Invoiced', 'صدرت الفاتورة') : L('To invoice', 'بانتظار الفوترة')}</span>` : ''}</span><b>${tx(j.title)}</b><small>${where(j)}</small><span class="j-who">${B.ui.avatar(t.name, '', t.color + '22')}<span>${tx(t.name)}</span></span></span>${icon('chevR', 'chev flip')}</button>`;
  };
  const tracker = (j) => {
    const idx = STAGES.indexOf(j.status);
    const lab = [T('Scheduled', 'مجدولة'), T('En route', 'في الطريق'), T('Working', 'قيد العمل'), T('Done', 'منجزة')];
    const ic = ['calendar', 'route', 'wrench', 'check'];
    return `<div class="mp-track">${STAGES.map((s, i) => `<div class="s ${i < idx || j.status === 'completed' ? 'done' : i === idx ? 'cur' : ''}"><i>${icon(i < idx || j.status === 'completed' ? 'check' : ic[i])}</i><span>${tx(lab[i])}</span></div>`).join('')}</div>`;
  };
  const dock = (inner) => `<div class="mp-dock">${inner}</div>`;

  /* ======================================================================
     Screens
     ====================================================================== */
  const home = () => {
    const nr = newReqs();
    const tj = todayJobs();
    const sentQ = QUOTES.filter((q) => q.status === 'sent');
    const monthRev = B.sum(JOBS.filter((j) => j.status === 'completed' && j.date >= '2026-11-01'), (j) => j.amount);
    const toInvoice = JOBS.filter((j) => j.status === 'completed' && !j.paid && !j.invoiced);
    return {
      title: L('Today', 'اليوم'), large: true, kicker: L(`Good morning, Yousef · ${dow('2026-11-25', true)} ${B.dateShort('2026-11-25')}`, `صباح الخير يا يوسف · ${dow('2026-11-25', true)} ${B.dateShort('2026-11-25')}`), actions: [bell()],
      body: `<div class="mp-biz"><div class="b-top"><span class="b-logo">JT</span><div style="min-width:0"><h2>${tx(P.name)}</h2><div class="b-sub">${P.verified ? `<span style="white-space:nowrap">${icon('badgeCheck')}${L('Verified provider (sample)', 'مزوّد موثّق (نموذج)')}</span> · ` : ''}<span style="white-space:nowrap">★ ${P.rating} · ${P.reviews} ${L('reviews', 'تقييماً')}</span></div></div></div>
          <div class="b-stats"><button data-go="history"><b>${B.money(monthRev)}</b><small>${L('Billed in Nov', 'فواتير ت٢')}</small></button><button data-go="jobs"><b>${JOBS.filter((j) => j.status !== 'completed').length}</b><small>${L('Open jobs', 'مهام مفتوحة')}</small></button><div><b>${tx(P.response)}</b><small>${L('Response', 'سرعة الرد')}</small></div></div></div>`
        + M.kpis([{ label: L('New requests', 'طلبات جديدة'), value: nr.length, sub: L('Waiting for a quote', 'بانتظار عرض سعر'), icon: 'inbox', go: 'requests', alert: nr.some((r) => r.priority === 'high') }, { label: L('Quotes pending', 'عروض معلّقة'), value: sentQ.length, sub: B.money(B.sum(sentQ, qTot)), icon: 'doc', go: 'quotes' }])
        + (nr.length ? M.section(L('New requests', 'طلبات جديدة'), `<div class="mp-list">${nr.slice(0, 2).map(reqCard).join('')}</div>`, { link: { label: L(`All ${nr.length}`, `الكل ${nr.length}`), go: 'requests' } }) : '')
        + M.section(L('Today’s jobs', 'مهام اليوم'), tj.length ? `<div class="mp-list">${tj.map((j) => jobCard(j)).join('')}</div>` : M.empty('calendar', L('No jobs today', 'لا مهام اليوم')), { link: { label: L('Schedule', 'الجدول'), go: 'schedule' } })
        + M.section(L('Team', 'الفريق'), `<div class="mp-team">${TEAM.map((t) => `<div class="mp-mate">${B.ui.avatar(t.name, '', t.color + '22')}<b>${tx(t.name).split(' ')[0]}</b><small class="mp-st-${t.status}"><i></i>${tx(TST[t.status])}</small></div>`).join('')}</div>`)
        + (toInvoice.length ? M.group(toInvoice.map((j) => M.cell({ icon: 'receipt', tone: 'warn', title: L(`Invoice ${pname(j.by)}`, `فوترة ${pname(j.by)}`), sub: tx(j.title), value: B.money(j.amount), go: `job-${j.id}` })), L('Ready to invoice', 'جاهزة للفوترة')) : '')
        + note(L('Sample business data · no real customers or payments', 'بيانات أعمال نموذجية · لا عملاء أو مدفوعات حقيقية')),
    };
  };

  const requests = () => {
    const f = B.get('mp:rq', 'new');
    const list = REQS.filter((r) => (f === 'new' ? r.status === 'new' : f === 'quoted' ? r.status === 'quoted' : ['declined', 'lost', 'expired'].includes(r.status)));
    return {
      title: L('Requests', 'الطلبات'), large: true, actions: [bell()],
      body: M.seg('mp:rq', [{ id: 'new', label: L(`New · ${newReqs().length}`, `جديدة · ${newReqs().length}`) }, { id: 'quoted', label: L('Quoted', 'مسعّرة') }, { id: 'closed', label: L('Closed', 'مغلقة') }], f)
        + (f === 'new' && list.length ? `<div class="mp-sla">${icon('clock')}<div>${L('<b>Reply within 24 h</b> to keep your “~2 hrs” response badge.', '<b>ردّ خلال 24 ساعة</b> للحفاظ على شارة «~ساعتان» لسرعة الرد.')}</div></div>` : '')
        + (list.length ? `<div class="mp-list">${list.map(reqCard).join('')}</div>` : M.empty('inbox', L('Nothing here', 'لا شيء هنا'), L('New marketplace requests in your categories appear here.', 'تظهر هنا طلبات السوق الجديدة ضمن فئاتك.')))
        + note(L('Requests come from the BENA services marketplace (sample)', 'تأتي الطلبات من سوق خدمات BENA (نموذج)')),
    };
  };

  const requestScreen = (id) => {
    const r = req(id) || newReqs()[0] || REQS[0];
    const c = catOf(r.cat);
    const q = quoteOf(r.id);
    const ph = r.photos ? `<div class="mp-photos">${Array.from({ length: r.photos }, (_, i) => `<button class="mx-photo filled" data-act="mxSoon" data-arg="${esc(L('Photo viewer', 'عارض الصور'))}" aria-label="${L('Photo', 'صورة')} ${i + 1}">${B.art.interior(r.id.charCodeAt(5) + i * 3)}</button>`).join('')}</div>` : '';
    let dk = '';
    if (r.status === 'new') dk = dock(M.btn(L('Decline', 'رفض'), { act: 'mpDecline', arg: r.id }) + M.btn(L('Send quote', 'إرسال عرض'), { kind: 'primary', act: 'mpQuote', arg: r.id, icon: 'send' }).replace('class="mx-btn', 'class="mx-btn grow2'));
    else if (r.status === 'quoted') dk = dock(M.btn(L('Message', 'رسالة'), { act: 'mxSoon', arg: L('Messaging', 'المراسلة'), icon: 'chat' }) + M.btn(L('Edit quote', 'تعديل العرض'), { kind: 'dark', act: 'mpQuote', arg: r.id, icon: 'edit' }).replace('class="mx-btn', 'class="mx-btn grow2'));
    return {
      title: `<bdi>${r.id}</bdi>`, back: 'requests', backLabel: L('Requests', 'الطلبات'), tab: 'requests', hideTabs: !!dk,
      body: `<div class="mp-head"><div class="h-tags">${st(r.status)}${prioBadge(r.priority)}<span class="badge">${icon(c.icon)}${tx(c.name)}</span></div><h2>${tx(r.title)}</h2>
          <div class="h-meta"><span>${icon('pin')}${where(r)}</span>${r.pref ? `<span>${icon('calendar')}${L('Preferred', 'الموعد المفضّل')}: ${dow(r.pref.date, true)} ${B.dateShort(r.pref.date)} · ${tx(SLOT[r.pref.slot])}</span>` : ''}<span>${icon('clock')}${L('Posted', 'نُشر')} ${B.date(r.created)}</span></div></div>`
        + (q ? `<button class="mp-quote" data-act="mpQuoteView" data-arg="${q.id}" style="text-align:start"><span class="q-top"><span><small class="muted" style="font-size:13px">${L('Your quote', 'عرضك')} · ${idm(q.id)}</small><br><span class="q-amt">${B.money(qTot(q))}</span></span>${st(q.status)}</span><span class="q-row"><span>${L(`${q.lines.length} lines · valid until ${B.dateShort(q.valid)}`, `${q.lines.length} بنود · صالح حتى ${B.dateShort(q.valid)}`)}</span><b>${L('View', 'عرض')}</b></span></button>` : '')
        + (r.status === 'declined' && r.reason ? `<div class="callout dashed">${icon('xCircle')}<div>${L('Declined', 'مرفوض')}: ${tx(r.reason)}</div></div>` : '')
        + M.section(L('Details', 'التفاصيل'), `<div class="mx-card"><div class="mp-text">${tx(r.desc)}</div>${ph}</div>`)
        + M.section(L('Customer', 'العميل'), M.group([M.cell({ avatar: pobj(r.by).name, title: pname(r.by), sub: crole(r.by), go: `customer-${ckey(r.by)}` })]))
        + M.section(L('Location', 'الموقع'), `${B.map.render({ id: 'mprq' + r.id.replace(/\W/g, ''), static: true, focus: r.bid, focusW: 220, selected: r.bid, legend: false, height: '170px' })}<div class="row between" style="padding:0 4px"><span style="font-size:14.5px;font-weight:600">${bname(r.bid)}</span><span class="muted" style="font-size:13.5px">${L(`${r.km} km away`, `على بعد ${r.km} كم`)}</span></div>`)
        + note(L('Sample request · contact details shared after a quote is accepted', 'طلب نموذجي · تُشارك بيانات الاتصال بعد قبول العرض'))
        + dk,
    };
  };

  const quotes = () => {
    const f = B.get('mp:q', 'sent');
    const list = QUOTES.filter((q) => (f === 'sent' ? q.status === 'sent' : f === 'accepted' ? q.status === 'accepted' : ['declined', 'expired'].includes(q.status)));
    const won = QUOTES.filter((q) => q.status === 'accepted').length, decided = QUOTES.filter((q) => q.status !== 'sent').length;
    return {
      title: L('Quotations', 'عروض الأسعار'), large: true, back: 'menu', backLabel: L('More', 'المزيد'), tab: 'menu', actions: [{ icon: 'plus', act: 'mpNewQuote', label: L('New quote', 'عرض جديد') }],
      body: M.kpis([{ label: L('Win rate', 'نسبة الفوز'), value: `${Math.round((won / (decided || 1)) * 100)}%`, sub: L(`${won} of ${decided} decided`, `${won} من ${decided} محسومة`), icon: 'trend' }, { label: L('Awaiting reply', 'بانتظار الرد'), value: B.money(B.sum(QUOTES.filter((q) => q.status === 'sent'), qTot)), sub: L(`${QUOTES.filter((q) => q.status === 'sent').length} quotes`, `${QUOTES.filter((q) => q.status === 'sent').length} عروض`), icon: 'clock' }])
        + M.btn(L('New quote', 'عرض سعر جديد'), { kind: 'primary', block: true, icon: 'plus', act: 'mpNewQuote' })
        + M.seg('mp:q', [{ id: 'sent', label: L('Sent', 'مُرسلة') }, { id: 'accepted', label: L('Accepted', 'مقبولة') }, { id: 'closed', label: L('Closed', 'مغلقة') }], f)
        + (list.length ? M.group(list.map((q) => { const r = req(q.req) || job(q.req); return M.cell({ icon: 'doc', tone: q.status === 'accepted' ? 'mint' : q.status === 'sent' ? 'violet' : '', title: r ? tx(r.title) : q.id, sub: `${q.id} · ${r ? pname(r.by) : ''} · ${B.dateShort(q.sent)}`, value: B.money(qTot(q)), badge: q.fresh ? B.ui.badge(L('New', 'جديد'), 'mint') : '', act: 'mpQuoteView', arg: q.id }); })) : M.empty('doc', L('No quotes here', 'لا توجد عروض هنا')))
        + note(L('Amounts include 16% VAT · sample data', 'المبالغ شاملة ضريبة 16% · بيانات نموذجية')),
    };
  };

  const jobs = () => {
    const f = B.get('mp:j', 'today');
    const list = JOBS.filter((j) => (f === 'today' ? j.date === '2026-11-25' : f === 'upcoming' ? j.date > '2026-11-25' && j.status !== 'completed' : j.status === 'completed')).sort((a, b) => (f === 'done' ? -1 : 1) * (a.date + a.time).localeCompare(b.date + b.time));
    const late = JOBS.filter((j) => j.date < '2026-11-25' && j.status !== 'completed');
    return {
      title: L('Jobs', 'المهام'), large: true, actions: [bell()],
      body: M.seg('mp:j', [{ id: 'today', label: L('Today', 'اليوم') }, { id: 'upcoming', label: L('Upcoming', 'القادمة') }, { id: 'done', label: L('Done', 'منجزة') }], f)
        + (f === 'today' ? M.kpis([{ label: L('Team on jobs', 'الفريق في مهام'), value: `${TEAM.filter((t) => t.status === 'onjob').length}/${TEAM.length}`, icon: 'users' }, { label: L('Value today', 'قيمة اليوم'), value: B.money(B.sum(list, (j) => j.amount)), icon: 'wallet' }]) : '')
        + (late.length && f !== 'done' ? `<div class="mp-sla">${icon('alert')}<div>${L(`${late.length} job carried over from an earlier day`, `${late.length} مهمة مرحّلة من يوم سابق`)}</div></div>` : '')
        + (list.length ? `<div class="mp-list">${list.map((j) => jobCard(j, f !== 'today')).join('')}</div>` : M.empty('briefcase', L('No jobs', 'لا توجد مهام')))
        + note(L('Field updates come from the technicians’ app (simulated)', 'تأتي التحديثات الميدانية من تطبيق الفنيين (محاكاة)')),
    };
  };

  const jobScreen = (id) => {
    const j = job(id) || todayJobs()[0] || JOBS[0];
    const t = tech(j.tech);
    const c = catOf(j.cat);
    const list = CHECK[j.cat] || CHECK.general;
    const done = j.status === 'completed';
    const qx = j.quote ? quote(j.quote) : null;
    const nextLabel = { scheduled: L('Mark en route', 'تعيين: في الطريق'), enroute: L('Mark work started', 'تعيين: بدأ العمل'), inProgress: L('Mark completed', 'تعيين: مكتملة') }[j.status];
    const dk = done ? dock(j.paid ? M.btn(L('Receipt', 'الإيصال'), { act: 'mxSoon', arg: L('Receipt', 'الإيصال'), icon: 'receipt' }) + M.btn(L('Book again', 'حجز جديد'), { kind: 'dark', act: 'mxSoon', arg: L('Booking', 'الحجز'), icon: 'calendar' }) : M.btn(L('Message', 'رسالة'), { act: 'mxSoon', arg: L('Messaging', 'المراسلة'), icon: 'chat' }) + M.btn(j.invoiced ? L('Invoice sent ✓', 'أُرسلت الفاتورة ✓') : L('Send invoice', 'إرسال الفاتورة'), { kind: j.invoiced ? 'soft' : 'primary', act: j.invoiced ? 'mxToast' : 'mpInvoice', arg: j.invoiced ? L('Waiting for payment (simulated)', 'بانتظار الدفع (محاكاة)') : j.id, icon: 'receipt' }).replace('class="mx-btn', 'class="mx-btn grow2'))
      : dock(M.btn(L('Call tech', 'اتصل بالفني'), { act: 'mxSoon', arg: L('Calling', 'الاتصال'), icon: 'phone' }) + M.btn(nextLabel, { kind: 'primary', act: 'mpAdvance', arg: j.id, icon: j.status === 'inProgress' ? 'checkCircle' : 'arrowRight', iconCls: j.status === 'inProgress' ? '' : 'flip' }).replace('class="mx-btn', 'class="mx-btn grow2'));
    return {
      title: `<bdi>${j.id}</bdi>`, back: 'jobs', backLabel: L('Jobs', 'المهام'), tab: 'jobs', hideTabs: true,
      body: `<div class="mp-head"><div class="h-tags">${st(j.status)}<span class="badge">${icon(c.icon)}${tx(c.name)}</span></div><h2>${tx(j.title)}</h2>
          <div class="h-meta"><span>${icon('calendar')}${dow(j.date, true)} ${B.date(j.date)} · <bdi dir="ltr">${j.time}</bdi> · ${L(`${j.dur} h`, `${j.dur} س`)}</span><span>${icon('pin')}${where(j)}</span></div></div>`
        + tracker(j)
        + M.section(L('Technician', 'الفني'), M.group([M.cell({ avatar: t.name, title: tx(t.name), sub: `${tx(t.role)} · ${tx(TST[t.status])}`, act: done ? 'mxSoon' : 'mpAssign', arg: done ? L('Technician profile', 'ملف الفني') : j.id, badge: done ? '' : `<span class="badge">${L('Change', 'تغيير')}</span>` })]))
        + M.section(L('Field checklist', 'قائمة الفحص الميدانية'), `<div class="mp-check">${list.map((x, i) => `<div class="${j.check[i] ? 'ok' : ''}"><i>${j.check[i] ? icon('check') : ''}</i><span>${tx(x)}</span></div>`).join('')}</div>`, { sub: L(`${j.check.filter(Boolean).length} of ${list.length} · updated by ${tx(t.name).split(' ')[0]}`, `${j.check.filter(Boolean).length} من ${list.length} · حدّثها ${tx(t.name).split(' ')[0]}`) })
        + (j.notes ? `<div class="callout">${icon('chat')}<div><b>${tx(t.name)}:</b> ${tx(j.notes)}</div></div>` : '')
        + (j.desc ? M.section(L('Job brief', 'ملخص المهمة'), `<div class="mx-card"><div class="mp-text">${tx(j.desc)}</div></div>`) : '')
        + M.section(L('Customer & billing', 'العميل والفوترة'), M.group([M.cell({ avatar: pobj(j.by).name, title: pname(j.by), sub: crole(j.by), go: `customer-${ckey(j.by)}` }), M.cell({ icon: 'wallet', tone: 'mint', title: L('Job value', 'قيمة المهمة'), sub: qx ? L(`From quote ${qx.id}`, `من العرض ${qx.id}`) : L('Agreed price', 'السعر المتفق عليه'), value: B.money(j.amount), valueSub: L('+ VAT', '+ الضريبة'), act: qx ? 'mpQuoteView' : 'mxSoon', arg: qx ? qx.id : L('Price breakdown', 'تفاصيل السعر') }), done && j.rating ? M.cell({ icon: 'star', tone: 'warn', title: L('Customer rating', 'تقييم العميل'), badge: stars(j.rating) }) : ''].filter(Boolean)))
        + note(L('Status changes are simulated', 'تغييرات الحالة محاكاة'))
        + dk,
    };
  };

  const schedule = () => {
    const days = []; for (let i = 0; i < 7; i++) { const d = new Date(2026, 10, 23 + i); days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`); }
    const tf = B.get('mp:tf', 'all');
    const dayJobs = JOBS.filter((j) => j.date === S.day && (tf === 'all' || j.tech === tf)).sort((a, b) => a.time.localeCompare(b.time));
    const H0 = 8, H1 = 18, HP = 56;
    const hours = []; for (let h = H0; h <= H1; h++) hours.push(h);
    const blocks = dayJobs.map((j) => { const [h, m] = j.time.split(':').map(Number); const top = 6 + (h + m / 60 - H0) * HP; const ht = Math.max(46, j.dur * HP - 4); const t = tech(j.tech); return `<button class="mp-blk" data-go="job-${j.id}" style="top:${top}px;height:${ht}px;background:color-mix(in srgb, ${t.color} 9%, #fff);border-color:${t.color};color:var(--ink)"><b>${tx(j.title)}</b><small>${j.time} · ${tx(t.name).split(' ')[0]} · ${bname(j.bid)}</small></button>`; }).join('');
    const nowTop = S.day === '2026-11-25' ? 6 + (10 - H0) * HP : null;
    return {
      title: L('Schedule', 'الجدول'), large: true, kicker: B.monthYear('2026-11-25'), actions: [{ icon: 'plus', act: 'mxSoon', arg: L('New booking', 'حجز جديد'), label: L('New booking', 'حجز جديد') }],
      body: `<div class="mp-week">${days.map((d) => { const has = JOBS.some((j) => j.date === d); const fri = new Date(d + 'T12:00:00').getDay() === 5; return `<button class="${d === S.day ? 'on' : ''} ${d === '2026-11-25' ? 'today' : ''} ${has ? 'has' : ''} ${fri ? 'off' : ''}" data-act="mpDay" data-arg="${d}" aria-pressed="${d === S.day}"><small>${dow(d)}</small><b>${new Date(d + 'T12:00:00').getDate()}</b><i></i></button>`; }).join('')}</div>`
        + M.chips('mp:tf', [{ id: 'all', label: L('Whole team', 'كل الفريق') }, ...TEAM.filter((t) => t.id !== 't_yousef').map((t) => ({ id: t.id, label: tx(t.name).split(' ')[0] }))], tf)
        + `<div class="row between" style="padding:0 4px"><b style="font-size:17px">${dow(S.day, true)} ${B.dateShort(S.day)}</b><span class="muted" style="font-size:13.5px">${L(`${dayJobs.length} jobs · ${B.sum(dayJobs, (j) => j.dur)} h`, `${dayJobs.length} مهام · ${B.sum(dayJobs, (j) => j.dur)} س`)}</span></div>`
        + (dayJobs.length || new Date(S.day + 'T12:00:00').getDay() !== 5 ? `<div class="mp-day">${hours.map((h) => `<div class="mp-hr"><span>${String(h).padStart(2, '0')}:00</span></div>`).join('')}${blocks}${nowTop != null ? `<span class="mp-now" style="top:${nowTop}px"></span>` : ''}</div>` : M.empty('sun', L('Friday — day off', 'الجمعة — يوم عطلة')))
        + note(L('Sample bookings · tap a job to open it', 'حجوزات نموذجية · اضغط على مهمة لفتحها')),
    };
  };

  const customerScreen = (key) => {
    const p = key ? 'p_' + key : 'p_samer';
    const per = pobj(p);
    const js = JOBS.filter((j) => j.by === p).sort((a, b) => b.date.localeCompare(a.date));
    const rs = REQS.filter((r) => r.by === p && (r.status === 'new' || r.status === 'quoted'));
    const done = js.filter((j) => j.status === 'completed');
    const rated = done.filter((j) => j.rating);
    const blds = [...new Set([...js.map((j) => j.bid), ...REQS.filter((r) => r.by === p).map((r) => r.bid)])];
    return {
      title: L('Customer', 'العميل'), back: 'customers', tab: 'menu',
      body: `<div class="mp-cust">${B.ui.avatar(per.name)}<h2>${pname(p)}</h2><small>${crole(p)}${blds[0] ? ' · ' + bname(blds[0]) : ''}</small></div>`
        + `<div class="mp-contact"><button data-act="mxSoon" data-arg="${esc(L('Calling', 'الاتصال'))}">${icon('phone')}${L('Call', 'اتصال')}</button><button data-act="mxSoon" data-arg="${esc(L('Messaging', 'المراسلة'))}">${icon('chat')}${L('Message', 'رسالة')}</button><button data-act="mxSoon" data-arg="${esc(L('E-mail', 'البريد'))}">${icon('mail')}${L('E-mail', 'بريد')}</button></div>`
        + M.kpis([{ label: L('Jobs with us', 'مهام معنا'), value: js.length, sub: L(`${done.length} completed`, `${done.length} مكتملة`), icon: 'briefcase' }, { label: L('Billed', 'المفوتر'), value: B.money(B.sum(done, (j) => j.amount)), sub: rated.length ? L(`avg rating ${B.num1(B.sum(rated, (j) => j.rating) / rated.length)}★`, `متوسط التقييم ${B.num1(B.sum(rated, (j) => j.rating) / rated.length)}★`) : L('No ratings yet', 'لا تقييمات بعد'), icon: 'wallet' }])
        + (rs.length ? M.section(L('Open requests', 'طلبات مفتوحة'), `<div class="mp-list">${rs.map(reqCard).join('')}</div>`) : '')
        + M.section(L('Jobs', 'المهام'), js.length ? M.group(js.map((j) => M.cell({ icon: catOf(j.cat).icon, tone: j.status === 'completed' ? 'mint' : 'info', title: j.title, sub: `${B.dateShort(j.date)} · ${where(j)}`, value: B.money(j.amount), valueSub: stl(j.status), go: `job-${j.id}` }))) : M.empty('briefcase', L('No jobs yet', 'لا مهام بعد')))
        + (blds.length ? M.group(blds.map((b) => M.cell({ icon: 'building', title: bname(b), sub: `${b} · ${L('BENA reference ID', 'معرّف BENA المرجعي')}` })), L('Buildings', 'المباني')) : '')
        + note(L('Fictional customer · contact actions are simulated', 'عميل وهمي · إجراءات الاتصال محاكاة')),
    };
  };

  const customers = () => {
    const q = B.get('mp:cq', '');
    const ids = [...new Set([...JOBS.map((j) => j.by), ...REQS.map((r) => r.by)])].filter((p) => B.match(q, pobj(p).name));
    const rows = ids.map((p) => ({ p, n: JOBS.filter((j) => j.by === p).length, v: B.sum(JOBS.filter((j) => j.by === p && j.status === 'completed'), (j) => j.amount) })).sort((a, b) => b.v - a.v);
    return {
      title: L('Customers', 'العملاء'), large: true, back: 'menu', backLabel: L('More', 'المزيد'), tab: 'menu',
      body: M.search('mp:cq', L('Search customers', 'ابحث عن عميل'))
        + (rows.length ? M.group(rows.map((r) => M.cell({ avatar: pobj(r.p).name, title: pname(r.p), sub: `${crole(r.p)} · ${L(`${r.n} ${r.n === 1 ? 'job' : 'jobs'}`, `${r.n} ${r.n === 1 ? 'مهمة' : 'مهام'}`)}`, value: r.v ? B.money(r.v) : '—', go: `customer-${ckey(r.p)}` }))) : M.empty('users', L('No customers found', 'لا يوجد عملاء')))
        + note(L('Fictional customers', 'عملاء وهميون')),
    };
  };

  const history = () => {
    const done = JOBS.filter((j) => j.status === 'completed').sort((a, b) => b.date.localeCompare(a.date));
    const groups = {};
    done.forEach((j) => { const k = j.date.slice(0, 7); (groups[k] = groups[k] || []).push(j); });
    const nov = done.filter((j) => j.date >= '2026-11-01');
    const rated = done.filter((j) => j.rating);
    return {
      title: L('Service history', 'سجل الخدمات'), large: true, back: 'menu', backLabel: L('More', 'المزيد'), tab: 'menu',
      body: M.kpis([{ label: L('November', 'تشرين الثاني'), value: B.money(B.sum(nov, (j) => j.amount)), sub: L(`${nov.length} jobs completed`, `${nov.length} مهام مكتملة`), icon: 'chart' }, { label: L('Average rating', 'متوسط التقييم'), value: `${B.num1(B.sum(rated, (j) => j.rating) / (rated.length || 1))}★`, sub: L(`${rated.length} rated jobs`, `${rated.length} مهام مقيّمة`), icon: 'star' }])
        + Object.keys(groups).sort().reverse().map((k) => M.group(groups[k].map((j) => M.cell({ icon: catOf(j.cat).icon, tone: 'mint', title: j.title, sub: `${pname(j.by)} · ${B.dateShort(j.date)}`, value: B.money(j.amount), badge: j.rating ? stars(j.rating) : (!j.paid ? B.ui.badge(j.invoiced ? L('Invoiced', 'صدرت الفاتورة') : L('To invoice', 'بانتظار الفوترة'), 'warn') : ''), go: `job-${j.id}` })), `${B.monthYear(k + '-01')} · ${B.money(B.sum(groups[k], (j) => j.amount))}`)).join('')
        + note(L('Amounts exclude VAT · sample data', 'المبالغ دون الضريبة · بيانات نموذجية')),
    };
  };

  const menu = () => ({
    title: L('More', 'المزيد'), large: true,
    body: `<div class="mp-biz"><div class="b-top"><span class="b-logo">JT</span><div style="min-width:0"><h2>${pname('p_yousef')}</h2><div class="b-sub">${L('Owner', 'المالك')} · ${tx(P.name)}</div></div></div><div class="b-stats"><div><b>★ ${P.rating}</b><small>${P.reviews} ${L('reviews', 'تقييماً')}</small></div><div><b>${B.num(P.jobs)}</b><small>${L('Jobs done', 'مهام منجزة')}</small></div><div><b>${P.since}</b><small>${L('Since', 'منذ')}</small></div></div></div>`
      + M.group([M.cell({ icon: 'doc', tone: 'navy', title: L('Quotations', 'عروض الأسعار'), sub: L(`${QUOTES.filter((q) => q.status === 'sent').length} awaiting reply`, `${QUOTES.filter((q) => q.status === 'sent').length} بانتظار الرد`), go: 'quotes' }), M.cell({ icon: 'users', tone: 'navy', title: L('Customers', 'العملاء'), go: 'customers' }), M.cell({ icon: 'history', tone: 'navy', title: L('Service history', 'سجل الخدمات'), go: 'history' }), M.cell({ icon: 'badgeCheck', tone: 'mint', title: L('Marketplace profile', 'الملف في السوق'), sub: L('Plumbing · Electrical · HVAC · General', 'سباكة · كهرباء · تكييف · صيانة عامة'), act: 'mxSoon', arg: L('Profile editor', 'محرر الملف') })], L('Business', 'الأعمال'))
      + M.group([M.cell({ icon: 'globe', tone: 'info', title: L('Language', 'اللغة'), sub: B.isAr() ? 'العربية' : 'English', value: B.isAr() ? 'English' : 'العربية', act: 'lang', chevron: false }), M.cell({ icon: 'bell', tone: 'info', title: L('Notifications', 'الإشعارات'), go: 'notifications' }), M.cell({ icon: 'swap', tone: 'info', title: L('Switch profile', 'تبديل الملف'), act: 'mxRoles' })], L('Settings', 'الإعدادات'))
      + M.group([M.cell({ icon: 'grid', title: L('Open the provider web portal', 'فتح بوابة المزوّد على الويب'), go: 'provider-home' }), M.cell({ icon: 'compass', title: L('Demo hub', 'مركز العرض'), go: 'hub' })])
      + note(L('Prototype · “verified” is a sample marketplace badge, not an official licence check', 'نموذج أولي · «موثّق» شارة نموذجية في السوق وليست تحققاً رسمياً من الترخيص')),
  });

  /* notifications list (time shown as a trailing label) */
  const notifScreen = () => {
    const list = (B.mroles[R].notifications && B.mroles[R].notifications()) || [];
    return { title: L('Notifications', 'الإشعارات'), large: true, back: 'home', tab: 'home', actions: [{ icon: 'checkCircle', act: 'mxToast', arg: L('All marked as read', 'تم تعليم الكل كمقروء'), label: L('Mark all read', 'تعليم الكل كمقروء') }],
      body: list.length ? M.group(list.map((n) => M.cell({ icon: n.icon || 'bell', tone: n.tone || 'mint', title: String(tx(n.title)).replace(/\b([A-Z]{2,3}-\d{2}-\d{3,4}|[A-Z]{2,3}-\d{4,5})\b/g, '<span style="white-space:nowrap">$1</span>'), sub: n.sub, go: n.go, badge: `<span style="font-size:12.5px;color:var(--text-3);font-weight:500;white-space:nowrap">${tx(n.when || '')}</span>` }))) + `<div style="font-size:13px;color:var(--text-3);text-align:center">${L('Sample notifications', 'إشعارات نموذجية')}</div>` : M.empty('bell', L('You are all caught up', 'لا توجد إشعارات جديدة')) };
  };

  /* ======================================================================
     Register
     ====================================================================== */
  B.mrole({
    id: R, webRole: 'provider', icon: 'briefcase', home: 'home',
    name: T('Service Provider', 'مزوّد خدمة'), short: T('Provider', 'المزوّد'),
    persona: { name: T('Yousef Jaber', 'يوسف جابر'), sub: T('Jaber Technical Services', 'جابر للخدمات الفنية') },
    tabs: [
      { id: 'home', label: T('Today', 'اليوم'), icon: 'home' },
      { id: 'requests', label: T('Requests', 'الطلبات'), icon: 'inbox' },
      { id: 'jobs', label: T('Jobs', 'المهام'), icon: 'briefcase' },
      { id: 'schedule', label: T('Schedule', 'الجدول'), icon: 'calendar' },
      { id: 'menu', label: T('More', 'المزيد'), icon: 'menu' },
    ],
    more: [
      { id: 'request', label: T('Request details', 'تفاصيل الطلب'), icon: 'inbox' },
      { id: 'quotes', label: T('Quotations', 'عروض الأسعار'), icon: 'doc' },
      { id: 'job', label: T('Job status', 'حالة المهمة'), icon: 'briefcase' },
      { id: 'customers', label: T('Customers', 'العملاء'), icon: 'users' },
      { id: 'customer', label: T('Customer details', 'تفاصيل العميل'), icon: 'user' },
      { id: 'history', label: T('Service history', 'سجل الخدمات'), icon: 'history' },
      { id: 'notifications', label: T('Notifications', 'الإشعارات'), icon: 'bell' },
    ],
    screens: {
      home, requests, quotes, jobs, schedule, customers, history, menu,
      request: (id) => requestScreen(id),
      job: (id) => jobScreen(id),
      customer: (id) => customerScreen(id),
      notifications: () => notifScreen(),
    },
    notifications: () => [
      { icon: 'inbox', tone: 'mint', title: L('New request: install 2 split AC units', 'طلب جديد: تركيب مكيفين سبليت'), sub: L('Khaled Mansour · Al-Masyoun Residence Tower', 'خالد منصور · برج الماصيون السكني'), when: L('Yesterday', 'أمس'), go: 'request-PR-24527' },
      { icon: 'route', tone: 'info', title: L('Samir is on the way', 'سمير في الطريق'), sub: L('JB-3101 · Manara Business Center · 10:30', 'JB-3101 · مركز المنارة للأعمال · 10:30'), when: '10:05', go: 'job-JB-3101' },
      { icon: 'alert', tone: 'warn', title: L('Urgent request waiting 26 h', 'طلب عاجل بانتظار منذ 26 ساعة'), sub: L('Water heater not heating · Ruba Khalil', 'سخان المياه لا يسخّن · ربى خليل'), when: '09:00', go: 'request-PR-24522' },
      { icon: 'checkCircle', tone: 'mint', title: L('Quote QT-3359 accepted', 'تم قبول العرض QT-3359'), sub: L('Lobby LED retrofit · ₪1,850 · today 15:30', 'تحويل إنارة الردهة إلى LED · 1,850 ₪ · اليوم 15:30'), when: L('2 days ago', 'قبل يومين'), go: 'job-JB-3103' },
      { icon: 'star', tone: 'warn', title: L('New 4★ review from Tariq Hamdan', 'تقييم جديد 4★ من طارق حمدان'), sub: L('“Quick and tidy work.”', '«عمل سريع ومرتب.»'), when: L('2 days ago', 'قبل يومين'), go: 'history' },
    ],
  });
})();
