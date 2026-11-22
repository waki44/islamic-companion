'use strict';
/* Noor — Shia Islamic Companion (PWA v1)
   Data: localStorage only. Sacred texts in texts.js (source: fiveshinesmedia.com). */

const PRAYERS = [
  { id: 'fajr',    en: 'Fajr',    ar: 'الفجر' },
  { id: 'dhuhr',   en: 'Dhuhr',   ar: 'الظهر' },
  { id: 'asr',     en: 'Asr',     ar: 'العصر' },
  { id: 'maghrib', en: 'Maghrib', ar: 'المغرب' },
  { id: 'isha',    en: 'Isha',    ar: 'العشاء' }
];
const QAZA_EXTRA = [
  { id: 'ayat', en: 'Namaz-e-Ayat', ar: 'صلاة الآيات', note: 'Owed for eclipses, earthquakes & other natural signs' }
];
const KEY = 'noor.data.v1';
const ISB = { lat: 33.6844, lon: 73.0479, label: 'Islamabad (default)' };

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
  qaza: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  tasbeeh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="5" r="1.6"/><circle cx="19" cy="9" r="1.6"/><circle cx="19" cy="15" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="5" cy="15" r="1.6"/><circle cx="5" cy="9" r="1.6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17.5H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 19.5V4.5"/><path d="M20 19.5H6.5A2.5 2.5 0 0 0 4 22"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-8M21 20H3"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13.5A8.5 8.5 0 1 1 10.5 4 6.8 6.8 0 0 0 20 13.5z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1"/></svg>'
};
function starSVG(size, withInlay) {
  const s = size || 150;
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 200 200">' +
    '<defs><linearGradient id="am" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#F4CF85"/><stop offset=".45" stop-color="#E0A030"/><stop offset="1" stop-color="#94610E"/></linearGradient></defs>' +
    '<g fill="url(#am)"><rect x="45" y="45" width="110" height="110" rx="6"/><rect x="45" y="45" width="110" height="110" rx="6" transform="rotate(45 100 100)"/></g>' +
    (withInlay ? '<g fill="#9E1B32" opacity=".85"><rect x="58" y="58" width="84" height="84" rx="4"/><rect x="58" y="58" width="84" height="84" rx="4" transform="rotate(45 100 100)"/></g>' : '') +
    '<circle cx="100" cy="100" r="17" fill="#0A0F1C" stroke="#F4CF85" stroke-width="2.5"/>' +
    '<circle cx="100" cy="100" r="6" fill="#EDB955"/></svg>';
}

/* ---------- state ---------- */
function blankQaza() { return { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0, ayat: 0 }; }
function defaultState() {
  return { v: 1, onboarded: false, name: '', startDate: null, reviewedThrough: null,
    days: {}, qaza: blankQaza(), qazaInitial: blankQaza(), qazaLog: {},
    planPerDay: 2, ladies: {}, tasbeehTotal: 0, roza: {}, loc: null,
    settings: { translation: true, fontSize: 28 } };
}
let S = defaultState();
try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(defaultState(), JSON.parse(raw)); } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
function dkey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function todayKey() { return dkey(new Date()); }
function parseKey(k) { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function fmtTime(d) { let h = d.getHours(), m = d.getMinutes(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return h + ':' + String(m).padStart(2, '0') + ' ' + ap; }
const HIJRI_MONTHS = ['Muharram','Safar','Rabi al-Awwal','Rabi al-Thani','Jumada al-Ula','Jumada al-Akhirah','Rajab','Shaban','Ramadan','Shawwal','Dhul-Qa‘dah','Dhul-Hijjah'];
function hijriParts(d) {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(d);
    const o = {}; parts.forEach(p => { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day };
  } catch (e) { return null; }
}
function hijriLabel(d) { const h = hijriParts(d); return h ? h.d + ' ' + HIJRI_MONTHS[h.m - 1] + ' ' + h.y + ' AH' : ''; }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.style.display = 'block'; clearTimeout(t._h); t._h = setTimeout(() => { t.style.display = 'none'; }, 2600); }
function dayRec(k) { return S.days[k] || {}; }
function prayedCount(k) { const r = dayRec(k); return PRAYERS.filter(p => r[p.id]).length; }

/* ---------- navigation ---------- */
let currentScreen = 'home';
const TAB_SCREENS = ['home', 'qaza', 'tasbeeh', 'library'];
function show(id) {
  currentScreen = id;
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === 'screen-' + id));
  document.querySelectorAll('nav#tabbar .item').forEach(it => it.classList.toggle('sel', it.dataset.tab === id));
  moveLens();
  window.scrollTo({ top: 0 });
  if (id === 'home') renderHome();
  if (id === 'qaza') renderQaza();
  if (id === 'calendar') renderCalendar();
  if (id === 'reports') renderReports();
  if (id === 'ladies') renderLadies();
  if (id === 'qibla') renderQibla();
  if (id === 'settings') renderSettings();
}
function moveLens() {
  const sel = document.querySelector('nav#tabbar .item.sel') || document.querySelector('nav#tabbar .item[data-tab="menu"]');
  const lens = $('#lens'); if (!sel || !lens) return;
  lens.style.left = sel.offsetLeft + 'px'; lens.style.width = sel.offsetWidth + 'px';
}
function openSheet(id) { $('#' + id).classList.add('open'); }
function closeSheet(id) { $('#' + id).classList.remove('open'); }

/* ---------- prayer times (Adhan, Jafari/Tehran) ---------- */
let TIMES = null; // {fajr:Date,...}
function computeTimes() {
  if (typeof Adhan === 'undefined') return;
  const loc = S.loc || ISB;
  try {
    const coords = new Adhan.Coordinates(loc.lat, loc.lon);
    const params = Adhan.CalculationMethod.Tehran();
    const pt = new Adhan.PrayerTimes(coords, new Date(), params);
    TIMES = { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha };
  } catch (e) { TIMES = null; }
}
function nextPrayer() {
  if (!TIMES) return null;
  const now = new Date();
  for (const p of PRAYERS) { if (TIMES[p.id] > now) return { p, at: TIMES[p.id] }; }
  return { p: PRAYERS[0], at: null, tomorrow: true };
}
function currentPrayerId() {
  if (!TIMES) return null;
  const now = new Date(); let cur = null;
  for (const p of PRAYERS) { if (TIMES[p.id] <= now) cur = p.id; }
  return cur;
}

/* ---------- auto-qaza suggestion ---------- */
function suggestedQaza() {
  if (!S.startDate) return null;
  const start = S.reviewedThrough ? parseKey(S.reviewedThrough) : parseKey(S.startDate);
  if (S.reviewedThrough) start.setDate(start.getDate() + 1);
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (start > y) return null;
  const counts = blankQaza(); let days = 0;
  const cur = new Date(start);
  while (cur <= y) {
    const k = dkey(cur);
    if (!S.ladies[k]) {
      const r = dayRec(k); let any = false;
      PRAYERS.forEach(p => { if (!r[p.id]) { counts[p.id]++; any = true; } });
      if (any) days++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  const total = PRAYERS.reduce((a, p) => a + counts[p.id], 0);
  return total ? { counts, total, days, through: dkey(y) } : null;
}
function suggestionBannerHTML(sug) {
  return '<div class="banner"><b>' + sug.total + ' unmarked prayers</b> from the last ' + sug.days +
    ' day(s). If they were missed, they belong in your Qaza. ' +
    '<div class="row"><button class="btn primary small" data-act="sug-add">Add to Qaza</button>' +
    '<button class="btn ghost small" data-act="sug-skip">Not missed</button></div></div>';
}
function wireSuggestion(container) {
  container.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
    const sug = suggestedQaza(); if (!sug) return;
    if (b.dataset.act === 'sug-add') {
      PRAYERS.forEach(p => { S.qaza[p.id] += sug.counts[p.id]; S.qazaInitial[p.id] += sug.counts[p.id]; });
      toast('Added ' + sug.total + ' to your Qaza');
    }
    S.reviewedThrough = sug.through; save(); renderHome(); renderQaza();
  }));
}

/* ---------- HOME ---------- */
function arcPath(cx, cy, r, a0, a1) {
  const p = a => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return 'M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A ' + r + ' ' + r + ' 0 0 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1);
}
function renderHeroRing() {
  const k = todayKey(), r = dayRec(k), cur = currentPrayerId();
  const cx = 124, cy = 124, rad = 106, seg = (Math.PI * 2) / 5, gap = 0.10;
  let paths = '';
  PRAYERS.forEach((p, i) => {
    const a0 = i * seg + gap / 2, a1 = (i + 1) * seg - gap / 2;
    let stroke = '#54483C', op = 1;
    if (r[p.id]) stroke = '#EDB955';
    else if (cur === p.id) stroke = '#E0A030';
    paths += '<path d="' + arcPath(cx, cy, rad, a0, a1) + '" fill="none" stroke="' + stroke + '" stroke-width="9" stroke-linecap="round" opacity="' + op + '"/>';
    if (cur === p.id && !r[p.id]) {
      const am = (a0 + a1) / 2;
      paths += '<circle cx="' + (cx + rad * Math.cos(am)).toFixed(1) + '" cy="' + (cy + rad * Math.sin(am)).toFixed(1) + '" r="4" fill="#F4CF85"/>';
    }
  });
  $('#hero-ring').innerHTML = paths;
  $('#hero-star').innerHTML = starSVG(148, prayedCount(k) === 5);
  $('#hero-count').textContent = prayedCount(k);
  const nx = nextPrayer();
  $('#hero-next').textContent = !TIMES ? 'Prayer times need internet once (or check Settings for location)' :
    nx.tomorrow ? 'All of today’s prayers are complete in time — Fajr is next, tomorrow' :
    'Next: ' + nx.p.en + ' · ' + fmtTime(nx.at) + (S.loc ? '' : ' · Islamabad');
}
function renderHome() {
  const now = new Date();
  $('#tb-date').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#tb-hijri').textContent = hijriLabel(now) + (S.name ? ' · ' + S.name : '');
  $('#tb-avatar').textContent = (S.name || 'N').trim().charAt(0).toUpperCase() || 'N';
  computeTimes(); renderHeroRing();
  // suggestion banner
  const sug = suggestedQaza();
  const hb = $('#home-banner'); hb.innerHTML = sug ? suggestionBannerHTML(sug) : '';
  if (sug) wireSuggestion(hb);
  // ramzan strip
  const h = hijriParts(now);
  const rs = $('#ramzan-strip');
  if (h && h.m === 9) {
    const kept = !!S.roza[todayKey()];
    rs.innerHTML = '<div class="card amber"><b>Ramadan — day ' + h.d + '</b><p class="small">Sehri ends at Fajr (' + (TIMES ? fmtTime(TIMES.fajr) : '—') + ') · Iftar at Maghrib (' + (TIMES ? fmtTime(TIMES.maghrib) : '—') + ')</p>' +
      '<button class="btn ' + (kept ? 'ghost' : 'primary') + ' small" id="roza-btn">' + (kept ? 'Roza kept ✓ (tap to undo)' : 'I kept today’s roza') + '</button></div>';
    $('#roza-btn').addEventListener('click', () => { S.roza[todayKey()] = !kept; save(); renderHome(); });
  } else rs.innerHTML = '';
  // prayer rows
  const k = todayKey(), r = dayRec(k), cur = currentPrayerId();
  $('#prayer-card').innerHTML = PRAYERS.map(p => {
    const done = !!r[p.id];
    const glyph = done ? '✓' : (cur === p.id ? '•' : '');
    return '<div class="prow ' + (done ? 'done' : '') + '" data-prayer="' + p.id + '" ' +
      (cur === p.id && !done ? 'style="background:rgba(224,160,48,.07); border-radius:16px; padding-left:8px; padding-right:8px"' : '') + '>' +
      '<div class="glyph">' + glyph + '</div>' +
      '<div class="names"><div class="en">' + p.en + '</div><div class="ar">' + p.ar + '</div></div>' +
      '<div class="time">' + (TIMES ? fmtTime(TIMES[p.id]) : '') + '</div></div>';
  }).join('');
  $('#prayer-card').querySelectorAll('.prow').forEach(row => row.addEventListener('click', () => {
    const id = row.dataset.prayer, key = todayKey();
    S.days[key] = S.days[key] || {};
    S.days[key][id] = !S.days[key][id];
    save(); renderHome();
  }));
  // qaza card
  const total = qazaTotal();
  $('#qaza-card-home').innerHTML = total === 0
    ? '<div class="qlabel">Qaza remaining</div><div class="qnum" style="font-size:36px">None — Alhamdulillah</div><div class="qlabel">Tap to open Qaza</div>'
    : '<div class="qlabel">Qaza remaining</div><div class="qnum">' + total + '</div><div class="qlabel">' + PRAYERS.concat(QAZA_EXTRA).filter(p => S.qaza[p.id] > 0).map(p => p.en + ' ' + S.qaza[p.id]).join(' · ') + '</div><div class="qlabel" style="color:var(--crimson-300)">Tap to open Qaza →</div>';
  renderAmal();
}
function renderAmal() {
  const now = new Date(), h = hijriParts(now), wd = now.getDay();
  let title = 'Aaj ka Amal', text = '', link = null;
  if (h && h.m === 1 && h.d === 10) { title = 'Day of Ashura'; text = 'Recite Ziyarat-e-Ashura today.'; link = 'ashura'; }
  else if (h && h.m === 2 && h.d === 20) { title = 'Arbaeen'; text = 'Recite Ziyarat-e-Ashura or Ziyarat-e-Waritha for the Arbaeen of Imam Husayn (a.s.).'; link = 'warith'; }
  else if (h && h.m === 9 && h.d >= 19 && h.d <= 23 && h.d % 2 === 1) { title = 'Laylatul Qadr (probable night)'; text = 'A night of worship and dua. Pray, recite and seek forgiveness.'; }
  else if (wd === 4) { title = 'Thursday night'; text = 'Recite Ziyarat-e-Waritha — and Dua-e-Kumayl tonight.'; link = 'warith'; }
  else if (wd === 5) { title = 'Jumu‘ah'; text = 'Recite Dua-e-Nudba and send salawat on Muhammad and his family.'; }
  else if (wd === 2) { title = 'Tuesday night'; text = 'Tonight is the night of Dua-e-Tawassul.'; }
  else if (h && h.d === 15) { title = 'Mid-month'; text = 'The 15th of the Hijri month — a blessed night for prayer and dua.'; }
  else { title = 'Aaj ka Amal'; text = 'Keep the five prayers on time today — that is the greatest amal.'; }
  $('#amal-card').innerHTML = '<div class="qlabel" style="color:var(--amber-300); letter-spacing:.06em; text-transform:uppercase; font-size:12px">' + title + '</div>' +
    '<p style="margin:8px 0 0; font-size:15.5px; line-height:1.55">' + text + '</p>' +
    (link ? '<div style="margin-top:10px"><button class="btn primary small" id="amal-open">Open in Library</button></div>' : '');
  const b = $('#amal-open'); if (b) b.addEventListener('click', () => openReader(link));
}

/* ---------- QAZA ---------- */
function qazaTotal() { return PRAYERS.reduce((a, p) => a + S.qaza[p.id], 0) + (S.qaza.ayat || 0); }
function qazaInitialTotal() { return PRAYERS.reduce((a, p) => a + S.qazaInitial[p.id], 0) + (S.qazaInitial.ayat || 0); }
function renderQaza() {
  const sug = suggestedQaza();
  const qb = $('#qaza-banner'); qb.innerHTML = sug ? suggestionBannerHTML(sug) : '';
  if (sug) wireSuggestion(qb);
  const total = qazaTotal(), init = qazaInitialTotal();
  const pct = init > 0 ? Math.round(((init - total) / init) * 100) : (total === 0 ? 100 : 0);
  $('#qaza-summary').innerHTML =
    '<div style="display:flex; justify-content:space-between; align-items:center"><div>' +
    '<div class="qlabel">Qaza remaining</div><div class="qnum">' + total + '</div>' +
    '<div class="qlabel">' + (init > 0 ? pct + '% of your qaza journey complete' : 'Set your starting qaza below') + '</div></div>' +
    '<svg width="86" height="86" viewBox="0 0 86 86"><circle cx="43" cy="43" r="36" fill="none" stroke="#54483C" stroke-width="6"/>' +
    '<circle cx="43" cy="43" r="36" fill="none" stroke="#D4485F" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + (2 * Math.PI * 36) + '" stroke-dashoffset="' + (2 * Math.PI * 36 * (1 - pct / 100)) + '" transform="rotate(-90 43 43)"/></svg></div>';
  $('#qaza-list').innerHTML = PRAYERS.concat(QAZA_EXTRA).map(p =>
    '<div class="qrow"><div class="names"><div class="en" style="font-weight:600">' + p.en + '</div><div class="ar" style="font-family:\'Amiri\',serif; color:var(--txt2)">' + p.ar + '</div>' + (p.note ? '<div class="small">' + p.note + '</div>' : '') + '</div>' +
    '<div class="rem">' + (S.qaza[p.id] || 0) + '</div>' +
    '<button class="btn primary small" data-perform="' + p.id + '"' + (!S.qaza[p.id] ? ' disabled style="opacity:.35"' : '') + '>Performed</button></div>'
  ).join('') +
    '<p class="small">Wrong count? Adjust any prayer:</p>' + PRAYERS.concat(QAZA_EXTRA).map(p =>
    '<div class="qrow"><div class="names"><div class="en">' + p.en + '</div></div>' +
    '<div class="stepper"><button data-adj="' + p.id + ':-1">−</button><span class="val">' + S.qaza[p.id] + '</span><button data-adj="' + p.id + ':1">+</button></div></div>'
  ).join('');
  $('#qaza-list').querySelectorAll('[data-perform]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.perform; if (S.qaza[id] <= 0) return;
    S.qaza[id]--; const k = todayKey(); S.qazaLog[k] = (S.qazaLog[k] || 0) + 1; save();
    toast('One ' + id + ' qaza performed · ' + qazaTotal() + ' remaining');
    renderQaza();
  }));
  $('#qaza-list').querySelectorAll('[data-adj]').forEach(b => b.addEventListener('click', () => {
    const [id, d] = b.dataset.adj.split(':');
    const nv = Math.max(0, (S.qaza[id] || 0) + (+d));
    S.qaza[id] = nv; if (S.qazaInitial[id] < nv) S.qazaInitial[id] = nv;
    save(); renderQaza();
  }));
  // plan
  const per = S.planPerDay || 2;
  const daysNeeded = total > 0 ? Math.ceil(total / per) : 0;
  const finish = new Date(); finish.setDate(finish.getDate() + daysNeeded);
  $('#qaza-plan').innerHTML = '<b style="font-size:17px">Qaza Khatam Plan</b>' +
    '<p class="small">At <b style="color:var(--amber-300)">' + per + ' qaza per day</b>' + (total > 0 ?
      ', you finish in <b style="color:var(--amber-300)">' + daysNeeded + ' days</b> — by <b style="color:var(--amber-300)">' + finish.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '</b>.' :
      ' there is nothing left. Alhamdulillah.') + '</p>' +
    '<div class="stepper"><button id="plan-minus">−</button><span class="val">' + per + ' / day</span><button id="plan-plus">+</button></div>';
  const pm = $('#plan-minus'), pp = $('#plan-plus');
  if (pm) pm.addEventListener('click', () => { S.planPerDay = Math.max(1, per - 1); save(); renderQaza(); });
  if (pp) pp.addEventListener('click', () => { S.planPerDay = Math.min(20, per + 1); save(); renderQaza(); });
}

/* ---------- TASBEEH ---------- */
const DHIKRS = [
  { ar: 'سُبْحَانَ الله', en: 'SubhanAllah' },
  { ar: 'الْحَمْدُ لِلَّه', en: 'Alhamdulillah' },
  { ar: 'اللهُ أَكْبَر', en: 'Allahu Akbar' },
  { ar: 'لَا إِلٰهَ إِلَّا الله', en: 'La ilaha illallah' },
  { ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّد', en: 'Salawat' },
  { ar: 'يَا حُسَيْن', en: 'Ya Husayn' },
  { ar: 'أَسْتَغْفِرُ الله', en: 'Astaghfirullah' }
];
let tas = { dhikr: 0, cycle: 33, count: 0, cyclesDone: 0 };
function renderTasbeeh() {
  $('#dhikr-chips').innerHTML = DHIKRS.map((d, i) => '<button class="chip' + (tas.dhikr === i ? ' sel' : '') + '" data-dhikr="' + i + '">' + d.en + '</button>').join('');
  $('#cycle-chips').innerHTML = [33, 100, 1000].map(c => '<button class="chip' + (tas.cycle === c ? ' sel' : '') + '" data-cycle="' + c + '">' + c + '</button>').join('') +
    '<button class="chip" id="tasbeeh-undo">Undo</button>';
  $('#tasbeeh-dhikr').textContent = DHIKRS[tas.dhikr].ar;
  $('#tasbeeh-count').textContent = tas.count;
  $('#tasbeeh-of').textContent = 'of ' + tas.cycle + (tas.cyclesDone ? ' · ' + tas.cyclesDone + ' cycle(s) done' : '');
  $('#tasbeeh-total').textContent = 'Lifetime count on this device: ' + S.tasbeehTotal;
  $('#dhikr-chips').querySelectorAll('[data-dhikr]').forEach(b => b.addEventListener('click', () => { tas.dhikr = +b.dataset.dhikr; tas.count = 0; tas.cyclesDone = 0; renderTasbeeh(); }));
  $('#cycle-chips').querySelectorAll('[data-cycle]').forEach(b => b.addEventListener('click', () => { tas.cycle = +b.dataset.cycle; tas.count = 0; tas.cyclesDone = 0; renderTasbeeh(); }));
  const u = $('#tasbeeh-undo'); if (u) u.addEventListener('click', () => { if (tas.count > 0) { tas.count--; S.tasbeehTotal = Math.max(0, S.tasbeehTotal - 1); save(); renderTasbeeh(); } });
}

/* ---------- LIBRARY & READER ---------- */
const LIBRARY = [
  { id: 'ashura', note: 'For Imam al-Husayn (a.s.) · Ashura & every day' },
  { id: 'warith', note: 'For Imam al-Husayn (a.s.) · Thursday nights & daily' },
  { id: 'kumayl', note: 'Taught by Imam Ali (a.s.) to Kumayl · Thursday nights' },
  { id: 'tawassul', note: 'Seeking intercession · Tuesday nights' },
  { id: 'nudba', note: 'For Imam Mahdi (a.t.f.s.) · Friday mornings' },
  { id: 'kisa', note: 'The Narration of the Cloak · Ahlul Bayt' },
  { id: 'yaseen', note: 'Surah Ya-Sin (36) · the heart of the Quran' },
  { id: 'mulk', note: 'Surah Al-Mulk (67) · recite before sleep' }
];
function renderLibrary() {
  $('#library-list').innerHTML = LIBRARY.map(item => {
    const t = TEXTS[item.id];
    const title = t ? t.title : ('Dua-e-' + item.id.charAt(0).toUpperCase() + item.id.slice(1));
    const art = t ? t.arabicTitle : '';
    return '<button class="lib-item" data-lib="' + item.id + '"><span class="medal">' + starSVG(40, false) + '</span>' +
      '<span style="flex:1"><b>' + title + (item.soon ? ' <span style="color:var(--amber-300); font-size:12px">· coming soon</span>' : '') + '</b>' +
      '<span class="art">' + art + '</span><span>' + item.note + '</span></span><span style="color:var(--txt3)">›</span></button>';
  }).join('');
  $('#library-list').querySelectorAll('[data-lib]').forEach(b => b.addEventListener('click', () => {
    if (LIBRARY.find(x => x.id === b.dataset.lib).soon) { toast('This text is being prepared from a verified source'); return; }
    openReader(b.dataset.lib);
  }));
}
function openReader(id) {
  const t = TEXTS[id]; if (!t) return;
  show('reader');
  $('#reader-title').textContent = t.title;
  $('#reader-intro').textContent = t.intro;
  renderReaderBody();
}
function renderReaderBody() {
  const title = $('#reader-title').textContent;
  const t = Object.values(TEXTS).find(x => x.title === title); if (!t) return;
  const showTr = S.settings.translation, fs = S.settings.fontSize;
  $('#reader-body').innerHTML = t.segments.map(seg =>
    seg[0] === 'note'
      ? '<div class="seg note">' + seg[1] + '</div>'
      : '<div class="seg"><div class="arb" style="font-size:' + fs + 'px">' + seg[0] + '</div>' + (showTr ? '<div class="eng">' + seg[1] + '</div>' : '') + '</div>'
  ).join('');
  $('#reader-translation').textContent = 'Translation: ' + (showTr ? 'On' : 'Off');
}

/* ---------- CALENDAR ---------- */
const SPECIAL = {
  '1-1': 'Islamic New Year', '1-9': 'Tasua', '1-10': 'Ashura — Shahadat of Imam Husayn (a.s.)',
  '2-20': 'Arbaeen (Chehlum) of Imam Husayn (a.s.)', '2-28': 'Shahadat of the Holy Prophet (s) & Imam Hasan (a.s.)',
  '3-8': 'Shahadat of Imam Hasan al-Askari (a.s.)', '3-9': 'Eid-e-Zahra (s.a.)', '3-17': 'Wiladat of the Holy Prophet (s) & Imam Ja‘far al-Sadiq (a.s.)',
  '5-3': 'Shahadat of Fatima al-Zahra (s.a.)', '5-20': 'Wiladat of Fatima al-Zahra (s.a.)',
  '7-3': 'Shahadat of Imam Ali al-Naqi (a.s.)', '7-13': 'Wiladat of Imam Ali (a.s.)', '7-25': 'Shahadat of Imam Musa al-Kazim (a.s.)', '7-27': 'Mab‘ath / Mi‘raj',
  '8-4': 'Wiladat of Hazrat Abbas (a.s.)', '8-11': 'Wiladat of Ali al-Akbar (a.s.)', '8-15': 'Wiladat of Imam Mahdi (a.t.f.s.)',
  '9-15': 'Wiladat of Imam Hasan (a.s.)', '9-19': 'Shab-e-Zarbat of Imam Ali (a.s.)', '9-21': 'Shahadat of Imam Ali (a.s.) · Laylatul Qadr (probable)', '9-23': 'Laylatul Qadr (probable)',
  '10-1': 'Eid al-Fitr', '10-25': 'Shahadat of Imam Ja‘far al-Sadiq (a.s.)',
  '11-29': 'Shahadat of Imam Muhammad al-Taqi (a.s.)',
  '12-7': 'Shahadat of Imam Muhammad al-Baqir (a.s.)', '12-9': 'Shahadat of Muslim ibn Aqil (a.s.) · Day of Arafah', '12-10': 'Eid al-Adha', '12-15': 'Wiladat of Imam Ali al-Naqi (a.s.)', '12-18': 'Eid al-Ghadir', '12-25': 'Eid al-Mubahala'
};
let calOff = 0;
function hijriMonthStart(offset) {
  const now = new Date(); const h = hijriParts(now); if (!h) return null;
  let tm = h.m + offset, ty = h.y;
  while (tm > 12) { tm -= 12; ty++; } while (tm < 1) { tm += 12; ty--; }
  let guess = new Date(now); guess.setDate(guess.getDate() - (h.d - 1) + Math.round((ty - h.y) * 354.37 + (h.m ? (tm - h.m) * 29.53 : 0)));
  for (let i = 0; i < 80; i++) {
    const p = hijriParts(guess);
    if (p.y === ty && p.m === tm && p.d === 1) return guess;
    const diff = (ty - p.y) * 354 + (tm - p.m) * 29 + (1 - p.d);
    guess.setDate(guess.getDate() + (diff === 0 ? 1 : diff));
  }
  return guess;
}
function renderCalendar() {
  const start = hijriMonthStart(calOff); if (!start) return;
  const h0 = hijriParts(start);
  $('#cal-subtitle').textContent = HIJRI_MONTHS[h0.m - 1] + ' ' + h0.y + ' AH';
  const cells = []; const cur = new Date(start);
  while (true) {
    const p = hijriParts(cur); if (!p || p.m !== h0.m) break;
    cells.push({ g: new Date(cur), hd: p.d });
    cur.setDate(cur.getDate() + 1);
    if (cells.length > 31) break;
  }
  const tk = todayKey();
  $('#cal-grid').innerHTML = cells.map(c => {
    const sp = SPECIAL[h0.m + '-' + c.hd];
    return '<div class="cal-cell' + (dkey(c.g) === tk ? ' today' : '') + (sp ? ' special' : '') + '" data-sp="' + (sp || '') + '" data-hd="' + c.hd + '">' + c.hd + '<span class="g">' + c.g.getDate() + ' ' + c.g.toLocaleDateString('en-GB', { month: 'short' }) + '</span></div>';
  }).join('');
  $('#cal-grid').querySelectorAll('.cal-cell').forEach(cell => cell.addEventListener('click', () => {
    $('#cal-detail').textContent = cell.dataset.hd + ' ' + HIJRI_MONTHS[h0.m - 1] + (cell.dataset.sp ? ' — ' + cell.dataset.sp : ' — no special day recorded.');
  }));
  const todaySp = (() => { const t = hijriParts(new Date()); return t ? SPECIAL[t.m + '-' + t.d] : null; })();
  $('#cal-detail').textContent = calOff === 0 && todaySp ? 'Today: ' + todaySp : 'Tap any day for details. Gold dot = special day.';
}

/* ---------- REPORTS ---------- */
function renderReports() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const daysIn = new Date(y, m + 1, 0).getDate(), elapsed = now.getDate();
  $('#report-subtitle').textContent = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  let marks = 0;
  for (let d = 1; d <= elapsed; d++) marks += prayedCount(dkey(new Date(y, m, d)));
  const pct = Math.round((marks / (elapsed * 5)) * 100);
  const prefix = y + '-' + String(m + 1).padStart(2, '0');
  const qazaDone = Object.keys(S.qazaLog).filter(k => k.startsWith(prefix)).reduce((a, k) => a + S.qazaLog[k], 0);
  $('#report-stats').innerHTML =
    '<div class="stat"><div class="v">' + pct + '%</div><div class="k">prayers on record</div></div>' +
    '<div class="stat"><div class="v">' + qazaDone + '</div><div class="k">qaza performed</div></div>' +
    '<div class="stat"><div class="v">' + S.tasbeehTotal + '</div><div class="k">tasbeeh (lifetime)</div></div>';
  const grid = $('#report-grid');
  grid.style.gridTemplateColumns = 'repeat(' + daysIn + ', 1fr)';
  let html = '';
  PRAYERS.forEach(p => {
    for (let d = 1; d <= daysIn; d++) {
      const k = dkey(new Date(y, m, d));
      let cls = 'dot';
      if (dayRec(k)[p.id]) cls += ' done';
      else if (S.ladies[k]) cls += '" style="background:rgba(158,27,50,.55)';
      html += '<div class="' + cls + '"></div>';
    }
  });
  grid.innerHTML = html;
}

/* ---------- LADIES ---------- */
let ladOff = 0;
function renderLadies() {
  const now = new Date(); const base = new Date(now.getFullYear(), now.getMonth() + ladOff, 1);
  $('#lad-month').textContent = base.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const daysIn = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const firstDow = (base.getDay() + 6) % 7;
  let html = '';
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(d => { html += '<div class="center small" style="padding:4px 0">' + d + '</div>'; });
  for (let i = 0; i < firstDow; i++) html += '<div></div>';
  for (let d = 1; d <= daysIn; d++) {
    const k = dkey(new Date(base.getFullYear(), base.getMonth(), d));
    html += '<div class="cal-cell' + (S.ladies[k] ? ' period' : '') + (k === todayKey() ? ' today' : '') + '" data-day="' + k + '">' + d + '</div>';
  }
  $('#lad-grid').innerHTML = html;
  $('#lad-grid').querySelectorAll('[data-day]').forEach(c => c.addEventListener('click', () => {
    const k = c.dataset.day;
    if (S.ladies[k]) delete S.ladies[k]; else S.ladies[k] = true;
    save(); renderLadies();
  }));
}

/* ---------- QIBLA ---------- */
let qiblaHeading = null;
function qiblaBearing(lat, lon) {
  const kaabaLat = 21.4225 * Math.PI / 180, kaabaLon = 39.8262;
  const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
  const y = Math.sin(kaabaLon - lo);
  const x = Math.cos(la) * Math.tan(kaabaLat) - Math.sin(la) * Math.cos(kaabaLon - lo);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
function renderQibla() {
  const loc = S.loc || ISB;
  const b = qiblaBearing(loc.lat, loc.lon);
  const rot = qiblaHeading == null ? b : b - qiblaHeading;
  $('#qibla-svg').innerHTML =
    '<circle cx="100" cy="100" r="88" fill="rgba(24,35,63,.5)" stroke="rgba(233,223,211,.15)"/>' +
    '<text x="100" y="26" fill="#BDAE9B" font-size="13" text-anchor="middle">N</text>' +
    '<g transform="rotate(' + rot.toFixed(1) + ' 100 100)"><path d="M100 22 L112 104 L100 92 L88 104 Z" fill="#E0A030"/></g>' +
    '<circle cx="100" cy="100" r="7" fill="#F6F0E9"/>' +
    '<g transform="translate(88,128) scale(0.24)">' + starSVG(100, false) + '</g>';
  $('#qibla-deg').textContent = b.toFixed(0) + '°';
  $('#qibla-note').textContent = S.loc ? 'From your location. Keep the phone flat; the arrow points to the Kaaba.' : 'Using Islamabad (default). Tap below for your exact location.';
}
function requestLocation(cb) {
  if (!navigator.geolocation) { toast('Location not available on this device'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    S.loc = { lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'Your location' };
    save(); computeTimes(); toast('Location saved'); if (cb) cb();
  }, () => toast('Location permission was not given'), { enableHighAccuracy: true, timeout: 10000 });
}

/* ---------- SETTINGS ---------- */
function renderSettings() {
  $('#set-name').value = S.name || '';
  const days = Object.keys(S.days).length;
  $('#backup-status').textContent = 'On this device · ' + days + ' day(s) tracked · since ' + (S.startDate || '—');
}

/* ---------- SETUP ---------- */
const setupQ = blankQaza();
function renderSetup() {
  $('#setup-qaza').innerHTML = PRAYERS.concat(QAZA_EXTRA).map(p =>
    '<div class="qrow"><div class="names"><div class="en" style="font-weight:600">' + p.en + ' qaza</div></div>' +
    '<div class="stepper"><button data-sq="' + p.id + ':-5">−</button><span class="val" id="sq-' + p.id + '">0</span><button data-sq="' + p.id + ':5">+</button></div></div>'
  ).join('') + '<p class="small">Use − / + in steps of 5, or tap + repeatedly. You can correct exact numbers later in the Qaza tab.</p>';
  $('#setup-qaza').querySelectorAll('[data-sq]').forEach(b => b.addEventListener('click', () => {
    const [id, d] = b.dataset.sq.split(':');
    setupQ[id] = Math.max(0, setupQ[id] + (+d));
    $('#sq-' + id).textContent = setupQ[id];
  }));
}

/* ---------- INIT & WIRING ---------- */
function init() {
  document.querySelectorAll('[data-ic]').forEach(el => { el.innerHTML = ICONS[el.dataset.ic] || ''; });
  $('#hero-star').innerHTML = starSVG(148, false);
  // tabs
  document.querySelectorAll('nav#tabbar .item').forEach(it => it.addEventListener('click', () => {
    if (it.dataset.tab === 'menu') { openSheet('menu-sheet'); return; }
    show(it.dataset.tab);
  }));
  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => closeSheet(el.dataset.close)));
  document.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => { closeSheet('menu-sheet'); show(b.dataset.goto); }));
  $('#tb-avatar').addEventListener('click', () => show('settings'));
  $('#tile-tasbeeh').addEventListener('click', () => show('tasbeeh'));
  $('#tile-ziyarat').addEventListener('click', () => show('library'));
  $('#qaza-card-home').addEventListener('click', () => show('qaza'));
  // tasbeeh
  $('#tasbeeh-disc').addEventListener('click', () => {
    tas.count++; S.tasbeehTotal++; save();
    if (navigator.vibrate) navigator.vibrate(8);
    if (tas.count >= tas.cycle) { tas.count = 0; tas.cyclesDone++; toast('Cycle complete — ' + DHIKRS[tas.dhikr].en + ' × ' + tas.cycle); if (navigator.vibrate) navigator.vibrate([30, 40, 30]); }
    renderTasbeeh();
  });
  $('#tasbeeh-reset').addEventListener('click', () => { tas.count = 0; tas.cyclesDone = 0; renderTasbeeh(); });
  // reader
  $('#reader-back').addEventListener('click', () => show('library'));
  $('#reader-translation').addEventListener('click', () => { S.settings.translation = !S.settings.translation; save(); renderReaderBody(); });
  $('#reader-font-plus').addEventListener('click', () => { S.settings.fontSize = Math.min(40, S.settings.fontSize + 2); save(); renderReaderBody(); });
  $('#reader-font-minus').addEventListener('click', () => { S.settings.fontSize = Math.max(20, S.settings.fontSize - 2); save(); renderReaderBody(); });
  // calendar & ladies nav
  $('#cal-prev').addEventListener('click', () => { calOff--; renderCalendar(); });
  $('#cal-next').addEventListener('click', () => { calOff++; renderCalendar(); });
  $('#cal-today').addEventListener('click', () => { calOff = 0; renderCalendar(); });
  $('#lad-prev').addEventListener('click', () => { ladOff--; renderLadies(); });
  $('#lad-next').addEventListener('click', () => { ladOff++; renderLadies(); });
  // qibla
  $('#qibla-locate').addEventListener('click', () => requestLocation(renderQibla));
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', e => {
      const hdg = e.webkitCompassHeading != null ? e.webkitCompassHeading : (e.alpha != null ? 360 - e.alpha : null);
      if (hdg != null && currentScreen === 'qibla') { qiblaHeading = hdg; renderQibla(); }
    }, true);
  }
  // reports
  $('#report-share').addEventListener('click', async () => {
    const txt = $('#report-subtitle').textContent + ' — prayers on record: ' + $('#report-stats').innerText.replace(/\n/g, ' · ') + ' · Qaza remaining: ' + qazaTotal();
    if (navigator.share) { try { await navigator.share({ title: 'My Monthly Report', text: txt }); } catch (e) {} }
    else if (navigator.clipboard) { await navigator.clipboard.writeText(txt); toast('Report copied'); }
  });
  // settings
  $('#set-name').addEventListener('change', e => { S.name = e.target.value.trim(); save(); renderHome(); toast('Saved'); });
  $('#btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'noor-backup-' + todayKey() + '.json'; a.click(); URL.revokeObjectURL(a.href);
    toast('Backup downloaded');
  });
  $('#btn-import').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { const data = JSON.parse(rd.result); if (data && data.v === 1) { S = Object.assign(defaultState(), data); save(); toast('Backup restored'); show('home'); } else toast('That file is not a Misbah-ul-Huda backup'); } catch (err) { toast('Could not read that file'); } };
    rd.readAsText(f);
  });
  $('#btn-wipe').addEventListener('click', () => {
    if (confirm('Erase ALL data on this device? Download a backup first if unsure.')) { localStorage.removeItem(KEY); location.reload(); }
  });
  // setup
  renderSetup();
  let setupPlan = 2;
  $('#setup-minus').addEventListener('click', () => { setupPlan = Math.max(1, setupPlan - 1); $('#setup-plan').textContent = setupPlan; });
  $('#setup-plus').addEventListener('click', () => { setupPlan = Math.min(20, setupPlan + 1); $('#setup-plan').textContent = setupPlan; });
  const finishSetup = withQaza => {
    if (withQaza) { S.qaza = Object.assign({}, setupQ); S.qazaInitial = Object.assign({}, setupQ); }
    S.planPerDay = setupPlan; S.onboarded = true; S.startDate = todayKey();
    save(); closeSheet('setup-sheet'); show('home'); toast('Your companion is ready');
  };
  $('#setup-done').addEventListener('click', () => finishSetup(true));
  $('#setup-skip').addEventListener('click', () => finishSetup(false));
  // privacy blur for ladies section in app switcher
  const priv = document.createElement('div');
  priv.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(10,15,28,.6);backdrop-filter:blur(30px);display:none';
  document.body.appendChild(priv);
  document.addEventListener('visibilitychange', () => { priv.style.display = (document.hidden && currentScreen === 'ladies') ? 'block' : 'none'; });
  // location: use silently only if permission already granted
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' }).then(r => { if (r.state === 'granted' && !S.loc) requestLocation(() => renderHome()); }).catch(() => {});
  }
  window.addEventListener('resize', moveLens);
  renderTasbeeh(); renderLibrary();
  show('home');
  if (!S.onboarded) openSheet('setup-sheet');
  if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').catch(() => {}); }
}
document.addEventListener('DOMContentLoaded', init);
