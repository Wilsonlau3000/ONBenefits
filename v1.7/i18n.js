// Minimal i18n for EN + Simplified Chinese (zh-Hans)
// Usage: add data-i18n="key" to elements, data-i18n-placeholder="key" for placeholders,
// and data-i18n-options="optionsKey" for <select> options labels (matched by value).

const I18N = {
  en: {
    appTitle: "Ontario Benefits Finder <span class=\"pill\">Prototype</span>",
    appSubtitle: "Hardcoded client-side matching engine (no backend). Educational tool only — not legal advice.",
    languageLabel: "Language",
    step1Title: "1) Quick profile",
    step1Hint: "Answer what you can. If something is unknown, leave it blank — the engine will mark “Needs info”.",
    q_householdType: "Household type",
    q_adultCount: "Adults (count)",
    q_childCount: "Children under 18 (count)",
    q_oldestAdultAge: "Oldest adult age",
    q_youngestChildAge: "Youngest child age (if any)",
    q_incomeGross: "Annual household income (before tax, CAD)",
    q_incomeNet: "Annual household income (after tax, CAD)",
    q_housing: "Housing",
    q_hasElectricityAccount: "Has electricity account in your name/household?",
    q_hasArrears: "Overdue electricity/gas bill (arrears / disconnection risk)?",
    q_heatedByElectricity: "Is your home heated primarily by electricity?",
    q_hasDisability: "Disability (self-reported)",
    q_dtcApproved: "Disability Tax Credit (DTC) approved?",
    q_studentApprentice: "Student / apprentice?",
    q_taxFiled: "Filed last year’s tax return?",
    q_hasPrivateDental: "Has private dental coverage?",
    q_locationRegion: "Where in Ontario?",
    q_urgentNeedFood: "Need food help right now?",
    q_urgentNeedHousing: "At risk of homelessness / need housing or shelter help?",
    q_urgentNeedUtilities: "Need help with overdue utility bills?",
    q_urgentNeedFurniture: "Need basic furniture (bed/sofa/table) after moving/shelter?",
    q_urgentNeedMedicalTravel: "Need help with medical travel/parking/equipment?",
    q_domesticViolence: "Experiencing domestic violence / need safety support?",
    q_newcomerRefugee: "Newcomer / refugee claimant?",
    q_needsMealsDelivery: "Senior who needs meal delivery?",
    q_needsKidsSports: "Need help paying for kids’ sports / activities?",
    q_needsMicroloanTraining: "Need a small loan for training / employment / starting a small business?",
    q_unionMember: "Union member (e.g., OPSEU/SEFPO)?",
    q_rbcmortgage: "Have an RBC mortgage?",
    q_alectraCustomer: "Alectra Utilities customer (electricity/water)?",
    q_kidneyDialysis: "Require regular dialysis / chronic kidney disease?",
    q_longDistanceMedicalTravel: "Need to travel long distance (e.g., fly) for medical care?",
    q_musicProfessional: "Work in the music industry as your profession?",
    q_artistProfessional: "Work as a professional artist/performer?",
    q_churchMember: "Member of a faith community / church?",
    q_reintegration: "Recently released from incarceration / need re-entry support?",
    q_survivorAbuse: "Survivor of abuse or human trafficking?",
    ph_oldestAdultAge: "e.g., 72",
    ph_youngestChildAge: "e.g., 4",
    ph_incomeGross: "e.g., 45000",
    ph_incomeNet: "optional; helps OESP/LEAP",
    btnFind: "Find benefits",
    btnReset: "Reset",
    btnSave: "Save profile",
    btnLoad: "Load saved",
    step2Title: "2) Results",
    filterLabel: "Filter",
    sortLabel: "Sort",
    disclaimerTitle: "Disclaimer",
    disclaimerBody: "This prototype uses simplified, hardcoded rules and may be incomplete or outdated. Always verify eligibility and apply using official government sources.",
    buildLabel: "Prototype build",
    summaryFmt: "<strong>{eligible}</strong> eligible • <strong>{possible}</strong> possible • <strong>{needs}</strong> needs info • <strong>{not}</strong> not eligible",
    statusLabels: { eligible: "Eligible", possible: "Possibly eligible", needs: "Needs info", not: "Not eligible" },
    chanceLabel: "Estimated chance",
    chanceHint: "Heuristic only — not a guarantee.",
    maxHelpLabel: "Estimated max support",
    maxHelpHint: "Heuristic only — not a guarantee. Amounts can change; always verify on official sources.",
    missingLabel: "Missing",
    notesLabel: "Notes",
    linkPrefix: "🔗 ",
    alerts: { saved: "Saved to this browser (localStorage).", noSaved: "No saved profile found." },
    householdTypeOptions: {
      single: "Single (no children)",
      couple: "Couple (no children)",
      single_parent: "Single parent",
      couple_kids: "Couple with children",
      multi_adult: "Multi-adult household (roommates / extended family)"
    },
    housingOptions: {
      rent: "Rent",
      own: "Own",
      reserve: "On-reserve",
      ltc: "Long-term care",
      other: "Other / unsure"
    },
    locationRegionOptions: {
      unknown: "Not sure",
      gtha: "GTA (Toronto + surrounding)",
      ottawa: "Ottawa",
      london: "London",
      hamilton: "Hamilton",
      kingston: "Kingston",
      york: "York Region",
      north: "Northern Ontario",
      other: "Other Ontario"
    },
    ynUnknownOptions: { yes: "Yes", no: "No", unknown: "Not sure" },
    studentApprenticeOptions: { none: "No", student: "Post-secondary student", apprentice: "Registered apprentice" },
    filterOptions: { all: "All", eligible: "Eligible", possible: "Possibly eligible", needs: "Needs info", not: "Not eligible" },
    sortOptions: { status: "Status", category: "Category", name: "Name" },
    viewLabel: "View",
    viewOptions: { auto: "Auto", desktop: "Desktop", mobile: "Mobile" }
  },
  "zh-Hans": {
    appTitle: "安省福利查询 <span class=\"pill\">原型</span>",
    appSubtitle: "纯前端硬编码匹配引擎（无后端）。仅供参考学习，不构成法律/专业建议。",
    languageLabel: "语言",
    step1Title: "1）基本信息",
    step1Hint: "能填多少填多少。不确定的留空即可——系统会标记“需要补充信息”。",
    q_householdType: "家庭类型",
    q_adultCount: "成年人数量",
    q_childCount: "18岁以下孩子数量",
    q_oldestAdultAge: "家庭中最年长成人年龄",
    q_youngestChildAge: "最小孩子年龄（如有）",
    q_incomeGross: "家庭年收入（税前，加元）",
    q_incomeNet: "家庭年收入（税后，加元）",
    q_housing: "居住情况",
    q_hasElectricityAccount: "你/家庭是否有电费账户（电费账单账户）？",
    q_hasArrears: "是否有水电气欠费/停供风险（紧急）？",
    q_heatedByElectricity: "您家主要是用电取暖吗？",
    q_hasDisability: "是否有残障/长期健康问题（自述）",
    q_dtcApproved: "是否已获批残障税务抵免（DTC）？",
    q_studentApprentice: "学生/学徒？",
    q_taxFiled: "去年是否报税？",
    q_hasPrivateDental: "是否有私人牙科保险？",
    q_locationRegion: "你在安省的哪个地区？",
    q_urgentNeedFood: "现在是否需要食物援助？",
    q_urgentNeedHousing: "是否有无家可归风险/需要住房或庇护帮助？",
    q_urgentNeedUtilities: "是否需要处理水电气欠费/停供风险？",
    q_urgentNeedFurniture: "是否需要基本家具（床/沙发/桌椅等）？",
    q_urgentNeedMedicalTravel: "是否需要医疗相关的交通/停车/器材帮助？",
    q_domesticViolence: "是否正在遭遇家暴/需要安全支援？",
    q_newcomerRefugee: "新移民/难民申请人？",
    q_needsMealsDelivery: "是否为需要送餐服务的长者？",
    q_needsKidsSports: "是否需要儿童运动/活动费用资助？",
    q_needsMicroloanTraining: "是否需要小额贷款用于培训/就业/小生意？",
    q_unionMember: "是否为工会会员（如OPSEU/SEFPO）？",
    q_rbcmortgage: "是否持有RBC银行按揭贷款？",
    q_alectraCustomer: "是否是Alectra公用事业客户（电/水）？",
    q_kidneyDialysis: "是否需要定期透析/慢性肾病？",
    q_longDistanceMedicalTravel: "是否需要为医疗护理长途旅行（如乘飞机）？",
    q_musicProfessional: "是否从事音乐行业作为职业？",
    q_artistProfessional: "是否以专业艺术家/表演者为业？",
    q_churchMember: "是否是信仰团体/教会成员？",
    q_reintegration: "是否刚从监禁中释出/需要重新融入支持？",
    q_survivorAbuse: "是否为虐待或人口贩卖的幸存者？",
    ph_oldestAdultAge: "例如：72",
    ph_youngestChildAge: "例如：4",
    ph_incomeGross: "例如：45000",
    ph_incomeNet: "可选；用于判断OESP/LEAP更准确",
    btnFind: "查询可申请福利",
    btnReset: "重置",
    btnSave: "保存资料",
    btnLoad: "加载已保存",
    step2Title: "2）结果",
    filterLabel: "筛选",
    sortLabel: "排序",
    disclaimerTitle: "免责声明",
    disclaimerBody: "本原型使用简化且硬编码的规则，可能不完整或已过期。请务必以政府官网信息为准并通过官方渠道申请。",
    buildLabel: "构建日期",
    summaryFmt: "<strong>{eligible}</strong> 符合 • <strong>{possible}</strong> 可能符合 • <strong>{needs}</strong> 需补充信息 • <strong>{not}</strong> 不符合",
    statusLabels: { eligible: "符合", possible: "可能符合", needs: "需补充信息", not: "不符合" },
    chanceLabel: "成功概率（估算）",
    chanceHint: "仅为启发式估算，不代表保证通过。",
    maxHelpLabel: "最高可获帮助（估算）",
    maxHelpHint: "仅为启发式估算，不代表保证。金额可能变化，请以官方信息为准。",
    missingLabel: "缺少信息",
    notesLabel: "备注",
    linkPrefix: "🔗 ",
    alerts: { saved: "已保存到本浏览器（localStorage）。", noSaved: "没有找到已保存的资料。" },
    householdTypeOptions: {
      single: "单身（无子女）",
      couple: "夫妻/同居（无子女）",
      single_parent: "单亲家庭",
      couple_kids: "夫妻/同居（有子女）",
      multi_adult: "多成人家庭（室友/大家庭）"
    },
    housingOptions: {
      rent: "租房",
      own: "自住房（业主）",
      reserve: "原住民保留地",
      ltc: "长期护理机构（LTC）",
      other: "其他/不确定"
    },
    locationRegionOptions: {
      unknown: "不确定",
      gtha: "大多伦多地区（GTA）",
      ottawa: "Ottawa 渥太华",
      london: "London 伦敦",
      hamilton: "Hamilton 汉密尔顿",
      kingston: "Kingston 金斯顿",
      york: "York Region 约克区",
      north: "安省北部",
      other: "安省其他地区"
    },
    ynUnknownOptions: { yes: "是", no: "否", unknown: "不确定" },
    studentApprenticeOptions: { none: "否", student: "大专/大学学生", apprentice: "注册学徒" },
    filterOptions: { all: "全部", eligible: "符合", possible: "可能符合", needs: "需补充信息", not: "不符合" },
    sortOptions: { status: "按状态", category: "按类别", name: "按名称" },
    viewLabel: "视图",
    viewOptions: { auto: "自动", desktop: "桌面版", mobile: "手机版" }
  }
};

function getLang() {
  return localStorage.getItem('obf_lang') || 'en';
}
function setLang(lang){
  localStorage.setItem('obf_lang', lang);
}

function applyI18n(lang){
  const dict = I18N[lang] || I18N.en;

  // text/html for elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const val = dict[key];
    if (val == null) return;
    // allow HTML for title pill
    el.innerHTML = val;
  });

  // placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = dict[key];
    if (val != null) el.setAttribute('placeholder', val);
  });

  // select options by value
  document.querySelectorAll('select[data-i18n-options]').forEach(sel => {
    const optKey = sel.getAttribute('data-i18n-options');
    const map = dict[optKey];
    if (!map) return;
    Array.from(sel.options).forEach(opt => {
      if (map[opt.value] != null) opt.textContent = map[opt.value];
    });
  });

  // expose to other scripts
  window.__I18N = dict;
  window.__LANG = lang;

  // update <html lang>
  document.documentElement.lang = (lang === 'zh-Hans') ? 'zh-Hans' : 'en';
}

window.I18N_HELPER = { I18N, getLang, setLang, applyI18n };
