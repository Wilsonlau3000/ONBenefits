// UI glue for Ontario Benefits Finder (Prototype) with EN/zh-Hans toggle

const $ = (id) => document.getElementById(id);

function collectRaw(){
  return {
    householdType: $('householdType').value,
    adultCount: $('adultCount').value,
    childCount: $('childCount').value,
    oldestAdultAge: $('oldestAdultAge').value,
    youngestChildAge: $('youngestChildAge').value,
    incomeGross: $('incomeGross').value,
    incomeNet: $('incomeNet').value,
    housing: $('housing').value,
    hasElectricityAccount: $('hasElectricityAccount').value,
    hasArrears: $('hasArrears').value,
    heatedByElectricity: $('heatedByElectricity').value,
    hasDisability: $('hasDisability').value,
    dtcApproved: $('dtcApproved').value,
    studentApprentice: $('studentApprentice').value,
    taxFiled: $('taxFiled').value,
    hasPrivateDental: $('hasPrivateDental').value,

    // New: non-government / charity signals
    locationRegion: $('locationRegion').value,
    urgentNeedFood: $('urgentNeedFood').value,
    urgentNeedHousing: $('urgentNeedHousing').value,
    urgentNeedUtilities: $('urgentNeedUtilities').value,
    urgentNeedFurniture: $('urgentNeedFurniture').value,
    urgentNeedMedicalTravel: $('urgentNeedMedicalTravel').value,
    domesticViolence: $('domesticViolence').value,
    newcomerRefugee: $('newcomerRefugee').value,
    needsMealsDelivery: $('needsMealsDelivery').value,
    needsKidsSports: $('needsKidsSports').value,
    needsMicroloanTraining: $('needsMicroloanTraining').value,

    // Newly added fields for expanded benefits
    unionMember: $('unionMember').value,
    rbcmortgage: $('rbcmortgage').value,
    alectraCustomer: $('alectraCustomer').value,
    kidneyDialysis: $('kidneyDialysis').value,
    longDistanceMedicalTravel: $('longDistanceMedicalTravel').value,
    musicProfessional: $('musicProfessional').value,
    artistProfessional: $('artistProfessional').value,
    churchMember: $('churchMember').value,
    reintegration: $('reintegration').value,
    survivorAbuse: $('survivorAbuse').value
  };
}

function getStatusLabel(status){
  const dict = window.__I18N;
  const labels = (dict && dict.statusLabels) ? dict.statusLabels : {
    eligible: 'Eligible', possible: 'Possibly eligible', needs: 'Needs info', not: 'Not eligible'
  };
  return labels[status] || status;
}

function renderSummary(results){
  const counts = { eligible:0, possible:0, needs:0, not:0 };
  results.forEach(r => counts[r.status] = (counts[r.status]||0) + 1);
  const fmt = (window.__I18N && window.__I18N.summaryFmt) || "<strong>{eligible}</strong> eligible • <strong>{possible}</strong> possible • <strong>{needs}</strong> needs info • <strong>{not}</strong> not eligible";
  $('summary').innerHTML = `<div class="meta">${fmt
    .replaceAll('{eligible}', counts.eligible)
    .replaceAll('{possible}', counts.possible)
    .replaceAll('{needs}', counts.needs)
    .replaceAll('{not}', counts.not)
  }</div>`;
}

function badge(status){
  const label = getStatusLabel(status);
  const cls = status === 'eligible' ? 'ok' : status === 'possible' ? 'maybe' : status === 'needs' ? 'needs' : 'no';
  return `<span class="badge ${cls}">${escapeHtml(label)}</span>`;
}

// Very rough heuristic probability (0-100). This is NOT a guarantee.
// Goal: give users an intuitive sense of "how close" they are, based on
// status + how much missing info remains.
function estimateChance(r){
  let base = 50;
  if (r.status === 'eligible') base = 92;
  else if (r.status === 'possible') base = 72;
  else if (r.status === 'needs') base = 52;
  else if (r.status === 'not') base = 12;

  const missingCount = (r.missing && r.missing.length) ? r.missing.length : 0;
  // missing info reduces confidence
  base -= missingCount * 8;

  // if the engine explicitly says "not" but also has missing fields, keep it low
  if (r.status === 'not' && missingCount > 0) base = Math.min(base, 15);

  // clamp
  base = Math.max(0, Math.min(100, Math.round(base)));
  return base;
}

function chanceBar(r){
  const pct = estimateChance(r);
  const label = (window.__I18N && window.__I18N.chanceLabel) || 'Estimated chance';
  const hint = (window.__I18N && window.__I18N.chanceHint) || 'Heuristic only — not a guarantee.';
  const cls = r.status === 'eligible' ? 'ok' : r.status === 'possible' ? 'maybe' : r.status === 'needs' ? 'needs' : 'no';
  return `
    <div class="chance" title="${escapeHtml(hint)}">
      <div class="chance-top"><span>${escapeHtml(label)}</span><span class="chance-pct">${pct}%</span></div>
      <div class="chance-track"><div class="chance-fill ${cls}" style="width:${pct}%"></div></div>
    </div>
  `;
}

function renderResults(results){
  const filter = $('filterStatus').value;
  const sortBy = $('sortBy').value;

  let list = results.slice();

  if (filter !== 'all') list = list.filter(r => r.status === filter);

  if (sortBy === 'status') {
    list.sort((a,b) => (window.BENEFITS_ENGINE.STATUS_ORDER[a.status] - window.BENEFITS_ENGINE.STATUS_ORDER[b.status]) || getName(a).localeCompare(getName(b)));
  } else if (sortBy === 'category') {
    list.sort((a,b) => getCategory(a).localeCompare(getCategory(b)) || getName(a).localeCompare(getName(b)));
  } else {
    list.sort((a,b) => getName(a).localeCompare(getName(b)));
  }

  const missingLabel = (window.__I18N && window.__I18N.missingLabel) || 'Missing';
  const notesLabel = (window.__I18N && window.__I18N.notesLabel) || 'Notes';
  const maxHelpLabel = (window.__I18N && window.__I18N.maxHelpLabel) || 'Estimated max support';
  const maxHelpHint = (window.__I18N && window.__I18N.maxHelpHint) || 'Heuristic only — not a guarantee.';

  $('results').innerHTML = list.map(r => {
    const desc = (r.desc || r.desc_zh)
      ? `<p class="desc">${escapeHtml((window.__LANG === 'zh-Hans' && r.desc_zh) ? r.desc_zh : r.desc)}</p>`
      : '';
    const chance = chanceBar(r);
    const maxHelpText = (window.__LANG === 'zh-Hans' && r.max_help_zh) ? r.max_help_zh : r.max_help;
    const maxHelp = maxHelpText
      ? `<div class="maxhelp" title="${escapeHtml(maxHelpHint)}"><strong>${escapeHtml(maxHelpLabel)}:</strong> ${escapeHtml(maxHelpText)}</div>`
      : '';
    const missing = (r.missing && r.missing.length)
      ? `<div class="missing"><strong>${escapeHtml(missingLabel)}:</strong> ${r.missing.map(escapeHtml).join(', ')}</div>`
      : '';
    const notes = (r.notes && r.notes.length)
      ? `<div class="missing"><strong>${escapeHtml(notesLabel)}:</strong> ${r.notes.map(x=>escapeHtml(x)).join(' • ')}</div>`
      : '';
    const links = (r.links && r.links.length)
      ? `<div class="links">${
          r.links.map(l => `<a href="${l.url}" target="_blank" rel="noreferrer">🔗 ${escapeHtml(getLinkTitle(l))}</a>`).join('')
        }</div>`
      : '';
    const why = (r.why && r.why.length)
      ? `<ul class="why">${r.why.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`
      : '';
    return `
      <div class="result">
        <div class="topline">
          <div>
            <div><strong>${escapeHtml(getName(r))}</strong></div>
            <div class="meta">${escapeHtml(getCategory(r))}</div>
          </div>
          ${badge(r.status)}
        </div>
        ${desc}
        ${chance}
        ${maxHelp}
        ${why}
        ${missing}
        ${notes}
        ${links}
      </div>
    `;
  }).join('');
}

function getName(r){
  return (window.__LANG === 'zh-Hans' && r.name_zh) ? r.name_zh : r.name;
}
function getCategory(r){
  return (window.__LANG === 'zh-Hans' && r.category_zh) ? r.category_zh : r.category;
}
function getLinkTitle(l){
  return (window.__LANG === 'zh-Hans' && l.title_zh) ? l.title_zh : l.title;
}

function escapeHtml(s){
  return (s ?? '').toString()
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

function run(){
  const raw = collectRaw();
  const profile = window.BENEFITS_ENGINE.normalizeProfile(raw);
  // Provide profile to engine for max-help estimates.
  window.__PROFILE_FOR_MAXHELP = profile;
  const results = window.BENEFITS_ENGINE.evaluateAll(profile);
  renderSummary(results);
  renderResults(results);
}

function reset(){
  localStorage.removeItem('obf_profile_v1');
  // keep language
  location.reload();
}

function save(){
  const raw = collectRaw();
  localStorage.setItem('obf_profile_v1', JSON.stringify(raw));
  alert((window.__I18N && window.__I18N.alerts && window.__I18N.alerts.saved) || 'Saved.');
}

function load(){
  const s = localStorage.getItem('obf_profile_v1');
  if (!s) return alert((window.__I18N && window.__I18N.alerts && window.__I18N.alerts.noSaved) || 'No saved profile found.');
  const raw = JSON.parse(s);
  for (const [k,v] of Object.entries(raw)) {
    const el = $(k);
    if (el) el.value = v;
  }
  run();
}

// Language init
function initLang(){
  const langSel = $('langSelect');
  const lang = window.I18N_HELPER.getLang();
  langSel.value = lang;
  window.I18N_HELPER.applyI18n(lang);

  langSel.addEventListener('change', () => {
    const newLang = langSel.value;
    window.I18N_HELPER.setLang(newLang);
    window.I18N_HELPER.applyI18n(newLang);
    // re-run to translate engine output labels and benefit names
    run();
  });
}

$('runBtn').addEventListener('click', run);
$('resetBtn').addEventListener('click', reset);
$('saveBtn').addEventListener('click', save);
$('loadBtn').addEventListener('click', load);
$('filterStatus').addEventListener('change', run);
$('sortBy').addEventListener('change', run);

$('householdType').addEventListener('change', () => {
  const t = $('householdType').value;
  if (t === 'single') { $('adultCount').value = 1; $('childCount').value = 0; }
  if (t === 'couple') { $('adultCount').value = 2; $('childCount').value = 0; }
  if (t === 'single_parent') { $('adultCount').value = 1; $('childCount').value = Math.max(1, Number($('childCount').value||1)); }
  if (t === 'couple_kids') { $('adultCount').value = 2; $('childCount').value = Math.max(1, Number($('childCount').value||1)); }
  run();
});

$('buildDate').textContent = new Date().toISOString().slice(0,10);

// View mode toggle (auto / desktop / mobile)
function initViewMode(){
  const sel = $('viewMode');
  const saved = localStorage.getItem('obf_view') || 'auto';
  sel.value = saved;
  applyViewMode(saved);

  sel.addEventListener('change', () => {
    const mode = sel.value;
    localStorage.setItem('obf_view', mode);
    applyViewMode(mode);
  });
}

function applyViewMode(mode){
  const root = document.documentElement;
  root.classList.remove('force-desktop', 'force-mobile');
  if (mode === 'desktop') root.classList.add('force-desktop');
  else if (mode === 'mobile') root.classList.add('force-mobile');
}

// Disclaimer modal — show on first visit, remember acceptance
function initDisclaimer(){
  const KEY = 'obf_disclaimer_v1';
  const overlay = $('disclaimerOverlay');
  if (!overlay) return;

  if (localStorage.getItem(KEY)) return; // already accepted — stays hidden

  overlay.style.display = '';
  document.body.style.overflow = 'hidden';

  $('disclaimerAcceptBtn').addEventListener('click', () => {
    localStorage.setItem(KEY, '1');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  });
}

initViewMode();
initLang();
initDisclaimer();
run();
