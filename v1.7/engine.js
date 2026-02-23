// Hardcoded matching engine for Ontario Benefits Finder (Prototype)
// NOTE: Simplified rules. Always verify on official sources.

function num(v){ const n = Number(v); return Number.isFinite(n) ? n : null; }
function str(v){ return (v ?? '').toString(); }
function yn(v){ return v === 'yes' ? true : v === 'no' ? false : null; }

const STATUS = {
  ELIGIBLE: 'eligible',
  POSSIBLE: 'possible',
  NEEDS: 'needs',
  NOT: 'not'
};

const STATUS_ORDER = { eligible: 0, possible: 1, needs: 2, not: 3 };

// Language helper: return Chinese if current UI is zh-Hans, else English.
function msg(en, zh){
  return (window.__LANG === 'zh-Hans') ? zh : en;
}

function fmtMoney(n){
  if (n == null || !Number.isFinite(n)) return null;
  // CAD dollars
  return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function maxHelpFor(benefitId, profile){
  // Returns {en, zh}
  const hhSize = profile ? ((profile.adultCount ?? 1) + (profile.childCount ?? 0)) : null;
  const net = profile ? profile.incomeNet : null;

  // Default fallback
  const VARY = { en: 'Varies (see link)', zh: '因人而异（请看链接）' };

  // NOTE: These are heuristic “max” amounts meant for rough guidance only.
  // Always verify on official pages/calculators.
  switch(benefitId){
    case 'ow':
      // Ontario.ca provides an example max for single; other family types vary by shelter costs.
      return { en: 'Up to $733/month (single; basic needs + shelter)', zh: '最高约 $733/月（单身：基本生活 + 住房）' };
    case 'odsp':
      return { en: 'Up to $1,408/month (single; basic needs + shelter)', zh: '最高约 $1,408/月（单身：基本生活 + 住房）' };
    case 'cdb':
      return { en: 'Up to $200/month ($2,400/year, Jul 2025–Jun 2026)', zh: '最高 $200/月（$2,400/年，2025年7月–2026年6月）' };
    case 'oesp': {
      // Standard OESP table (non-special). We compute if after-tax income is provided, else show range.
      const maxSpecial = 113;
      if (net == null || !Number.isFinite(net) || hhSize == null){
        return { en: 'About $35–$75/month (standard); up to $113/month in special cases', zh: '标准约 $35–$75/月；特殊情况最高 $113/月' };
      }

      const size = Math.min(Math.max(hhSize, 1), 7);

      // Table (standard) from Ontario Energy Board page.
      // Income buckets are annual AFTER-TAX household income.
      let credit = null;
      if (net <= 38000){
        credit = [45,45,51,57,63,75,75][size-1];
      } else if (net <= 54000){
        credit = [40,45,51,57,63,75,75][size-1];
      } else if (net <= 65000){
        credit = [35,40,45,51,57,75,75][size-1];
      } else if (net <= 71000){
        credit = [null,35,40,45, null, null, null][size-1];
      }

      if (credit == null){
        return { en: 'Likely $0/month (standard OESP), based on income/household size', zh: '按标准 OESP（基于收入/人数）推算可能为 $0/月' };
      }
      return { en: `About $${credit}/month (standard); up to $${maxSpecial}/month in special cases`, zh: `标准约 $${credit}/月；特殊情况最高 $${maxSpecial}/月` };
    }
    case 'leap':
      // Electricity emergency; higher if home is heated electrically.
      return (profile && profile.heatedByElectricity === true)
        ? { en: 'Up to $780 (electricity; if home is heated electrically) + up to $650 (natural gas, if applicable)', zh: '电费最高 $780（若为电暖）；如适用天然气，另可最高 $650' }
        : { en: 'Up to $650 (electricity) + up to $650 (natural gas, if applicable)', zh: '电费最高 $650；如适用天然气，另可最高 $650' };
    case 'jumpstart':
      return { en: 'Typically up to ~$300 per child per activity (varies by local chapter)', zh: '通常每名儿童每项活动最高约 $300（各地略有不同）' };
    case 'accf':
      return { en: 'Loans up to $15,000 for business + up to $15,000 for training (GTA)', zh: '贷款最高：创业 $15,000 + 培训 $15,000（大多伦多及周边）' };
    case 'uw_urgent':
      return { en: 'One-time emergency grant (amount varies; local United Way program)', zh: '一次性紧急补助（金额因项目而异；由当地 United Way 决定）' };
    case 'foodbank':
    case 'dailybread':
    case 'feed_ontario':
      return { en: 'In-kind support (food). Not a cash benefit.', zh: '实物支持（食物），非现金补助。' };
    case 'furniturebank':
      return { en: 'In-kind support (furniture/household items). Not a cash benefit.', zh: '实物支持（家具/家居用品），非现金补助。' };
    case 'opseu_hardship':
      return { en: 'Varies based on individual need; emergency grants for union members', zh: '根据个人需求而定；面向工会会员的紧急补助' };
    case 'rbc_skip':
      return { en: 'Skip one mortgage payment per 12 months (interest added)', zh: '每 12 个月可跳过一次按揭还款（利息计入本金）' };
    case 'alectra_pay':
      return { en: 'Flexible payment arrangement; no fixed amount', zh: '灵活的缴费安排；无固定金额' };
    case 'kidney_transport':
      return { en: 'Up to ~$72/month (approx. $6 per dialysis trip, up to 12 trips)', zh: '每月最高约 $72（每次透析行程约 $6，可达 12 次）' };
    case 'hope_air':
      return { en: 'Free flights, lodging, ground transport and meals (varies)', zh: '免费机票、住宿、地面交通和餐食（因人而异）' };
    case 'unison':
      return { en: 'Varies; short‑term emergency assistance or ongoing support', zh: '金额因需要而异；可提供短期或持续支持' };
    case 'artist_relief':
      return { en: 'Up to $2,500 per year for professional artists in crisis', zh: '每年最高 $2,500，用于遭遇危机的专业艺术家' };
    case 'church_benevolence':
      return { en: 'Varies by congregation; small grants often $150–$750', zh: '因教会而异；常见补助范围 $150–$750' };
    case 'john_howard':
      return { en: 'In-kind support (housing, case management) – not cash', zh: '提供住房与个案管理等服务，非现金支持' };
    case 'elizabeth_fry':
      return { en: 'In-kind support (housing, services) – not cash', zh: '提供住房与服务等支持，非现金' };
    case 'special_priority':
      return { en: 'Priority access to social housing (no cash value)', zh: '优先安置到政府租金补贴住房，非现金' };
    default:
      return VARY;
  }
}

function makeResult(benefit, status, why=[], missing=[], notes=[]) {
  const mh = maxHelpFor(benefit.id, window.__PROFILE_FOR_MAXHELP || null);
  return {
    benefit_id: benefit.id,
    name: benefit.name,
    name_zh: benefit.name_zh,
    desc: benefit.desc,
    desc_zh: benefit.desc_zh,
    category: benefit.category,
    category_zh: benefit.category_zh,
    status,
    max_help: mh?.en,
    max_help_zh: mh?.zh,
    why,
    missing,
    notes,
    links: benefit.links
  };
}

// Benefit catalog (official links)
const BENEFITS = [
  {
    id: 'ow',
    name: 'Ontario Works (OW)',
    name_zh: '安省社会救助（Ontario Works，OW）',
    category: 'Income Support',
    category_zh: '收入援助',
    desc: 'Ontario Works can provide basic financial assistance and employment supports if you have little or no income. Eligibility depends on your household situation, income and assets, and may consider shelter costs. Applications are handled through your local Ontario Works office.',
    desc_zh: 'Ontario Works（OW）为低收入或无收入人士提供基本生活援助与就业支持。是否符合会综合考虑家庭情况、收入与资产，并可能参考住房/租金成本。通常需要通过当地 Ontario Works 办公室提交申请。',
    links: [
      { title: 'Program page / how to apply', title_zh: '项目介绍/申请方式（官网）', url: 'https://www.ontario.ca/page/ontario-works' }
    ]
  },
  {
    id: 'odsp',
    name: 'Ontario Disability Support Program (ODSP)',
    name_zh: '安省残障援助（ODSP）',
    category: 'Income Support / Disability',
    category_zh: '收入援助/残障',
    desc: 'ODSP provides income support and health benefits for eligible Ontario residents with disabilities. You generally need to meet both a disability determination and a financial test. The process often includes medical forms and documentation.',
    desc_zh: 'ODSP 为符合条件的残障人士提供收入援助与部分健康福利。通常需要同时满足“残障认定”和“经济测试”。申请过程中常包含医疗表格与相关证明材料。',
    links: [
      { title: 'Program page / how to apply', title_zh: '项目介绍/申请方式（官网）', url: 'https://www.ontario.ca/page/ontario-disability-support-program' }
    ]
  },
  {
    id: 'otb',
    name: 'Ontario Trillium Benefit (OTB) – OEPTC/OSTC/Northern',
    name_zh: '安省三叶草福利（OTB：能源/房产税抵免、销售税抵免、北安省能源抵免）',
    category: 'Tax Credits',
    category_zh: '税务抵免',
    desc: 'OTB combines several Ontario tax credits into one monthly payment for eligible residents. In most cases, you access it by filing your annual income tax return and completing the ON-BEN application in the Ontario tax package. Amounts depend on income, rent/property tax paid, and other factors.',
    desc_zh: 'OTB 把多项安省税务抵免合并为一项按月发放的福利。多数情况下，只要每年报税并在安省报税包中填写 ON‑BEN，即可被自动评估。金额通常与收入、租金/房产税支出等因素有关。',
    links: [
      { title: 'Ontario Trillium Benefit (overview)', title_zh: 'OTB 介绍（官网）', url: 'https://www.ontario.ca/page/ontario-trillium-benefit' },
      { title: 'ON-BEN (included in Ontario tax package)', title_zh: 'ON‑BEN（随安省报税表格一起提交）', url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms.html' }
    ]
  },
  {
    id: 'ccb',
    name: 'Canada Child Benefit (CCB)',
    name_zh: '加拿大儿童福利（CCB）',
    category: 'Family & Children',
    category_zh: '家庭/子女',
    desc: 'CCB is a tax-free monthly payment to help with the cost of raising children under 18. The amount is based mainly on adjusted family net income and your family situation. You generally need to file taxes each year to keep receiving the correct amount.',
    desc_zh: 'CCB 是用于抚养 18 岁以下儿童的免税按月福利。金额主要取决于“调整后家庭净收入”以及家庭与监护情况。通常需要每年报税以便政府持续正确计算与发放。',
    links: [
      { title: 'CCB program page', title_zh: 'CCB 介绍（官网）', url: 'https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit-overview.html' },
      { title: 'Apply (RC66 / CRA instructions)', title_zh: '申请方式（RC66 表/CRA 指引）', url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/rc66.html' }
    ]
  },
  {
    id: 'oesp',
    name: 'Ontario Electricity Support Program (OESP)',
    name_zh: '安省电费补贴（OESP）',
    category: 'Utilities',
    category_zh: '水电气/账单补贴',
    desc: 'OESP provides an ongoing monthly credit on electricity bills for eligible low-income households. Eligibility depends on after-tax household income and household size, and some special situations may increase the credit. You apply through the OESP application portal or an intake agency.',
    desc_zh: 'OESP 为符合条件的低收入家庭提供按月电费抵扣。是否符合主要取决于税后家庭收入与家庭人数，部分特殊情况可能提高补贴金额。你可以通过 OESP 申请网站或受理机构提交申请。',
    links: [
      { title: 'Apply online', title_zh: '在线申请', url: 'https://ontarioelectricitysupport.ca/' }
    ]
  },
  {
    id: 'leap',
    name: 'Low-Income Energy Assistance Program (LEAP)',
    name_zh: '低收入能源紧急援助（LEAP）',
    category: 'Utilities',
    category_zh: '水电气/紧急援助',
    desc: 'LEAP provides emergency financial assistance to help low-income households with overdue electricity or natural gas bills to avoid disconnection. Support is delivered through local intake agencies, and eligibility depends on income, household size, and arrears situation. It is usually a one-time (or limited) emergency payment.',
    desc_zh: 'LEAP 为低收入家庭提供紧急援助，用于处理电费/燃气费欠费，帮助避免停供。通常由当地受理机构处理，是否符合取决于收入、家庭人数与欠费情况。一般属于一次性或有限次数的紧急补助。',
    links: [
      { title: 'LEAP overview (intake agency)', title_zh: 'LEAP 介绍/联系受理机构', url: 'https://ontarioelectricitysupport.ca/LEAP/' }
    ]
  },
  {
    id: 'gains',
    name: 'Guaranteed Annual Income System (GAINS) – Ontario',
    name_zh: '安省老年补贴（GAINS）',
    category: 'Seniors',
    category_zh: '长者/老人',
    desc: 'GAINS is a monthly top-up for low-income Ontario seniors who receive Old Age Security (OAS) and the Guaranteed Income Supplement (GIS). In many cases it is issued automatically once you qualify through federal benefits and tax filing. Amounts depend on income and marital status.',
    desc_zh: 'GAINS 是面向低收入安省长者的按月补贴，通常要求领取 OAS 与 GIS。很多情况下，只要通过联邦福利与报税信息符合条件，就会自动发放。金额会随收入与婚姻/同居状态变化。',
    links: [
      { title: 'GAINS program page', title_zh: 'GAINS 介绍（官网）', url: 'https://www.ontario.ca/page/guaranteed-annual-income-system' }
    ]
  },
  {
    id: 'seniors_dental',
    name: 'Ontario Seniors Dental Care Program',
    name_zh: '安省低收入长者牙科计划',
    category: 'Health / Seniors',
    category_zh: '健康/长者',
    desc: 'This program provides free dental care for eligible low-income seniors aged 65 and over who do not have other dental benefits. Coverage is delivered through participating dental clinics. Eligibility is income-tested and you must apply through the program portal.',
    desc_zh: '该计划为符合条件的低收入长者（65+）提供免费牙科服务，通常要求没有其他牙科福利/保险。服务由参与的牙科诊所提供。是否符合为收入测试型，需要通过项目入口提交申请。',
    links: [
      { title: 'Program page', title_zh: '项目介绍（官网）', url: 'https://www.ontario.ca/page/dental-care-low-income-seniors' },
      { title: 'Apply (Accerta portal)', title_zh: '申请入口（Accerta）', url: 'https://seniors.accerta.ca/' }
    ]
  },
  {
    id: 'senior_homeowner_grant',
    name: "Ontario Seniors' Homeowner Property Tax Grant",
    name_zh: '安省长者业主房产税补助（Senior Homeowner Grant）',
    category: 'Seniors / Tax Credits',
    category_zh: '长者/税务抵免',
    desc: 'This grant helps eligible low- to moderate-income seniors who own their homes offset part of their Ontario property taxes. It is claimed when you file your income tax return. Eligibility depends on age, residency, home ownership and income.',
    desc_zh: '该补助用于帮助符合条件的长者业主抵消部分安省房产税。通常在报税时申领。是否符合取决于年龄、居住、是否自住房业主以及收入等条件。',
    links: [
      { title: 'Program page', title_zh: '项目介绍（官网）', url: 'https://www.ontario.ca/page/seniors-homeowners-property-tax-grant' }
    ]
  },
  {
    id: 'osap',
    name: 'OSAP – Ontario Student Assistance Program',
    name_zh: '安省学生资助（OSAP）',
    category: 'Education',
    category_zh: '教育/学费',
    desc: 'OSAP offers loans and grants to help eligible students pay for post-secondary education. The amount you receive depends on your school program, course load, family situation and assessed financial need. Applications are submitted through the OSAP portal and may require supporting documents.',
    desc_zh: 'OSAP 为符合条件的大专/大学学生提供贷款与助学金，用于支付学费和生活开支。金额取决于学校课程、学习负荷、家庭情况与经济需求评估。申请通常在 OSAP 网站提交，并可能需要上传证明文件。',
    links: [
      { title: 'OSAP overview', title_zh: 'OSAP 介绍（官网）', url: 'https://www.ontario.ca/page/osap-ontario-student-assistance-program' },
      { title: 'Apply (OSAP)', title_zh: '申请入口（OSAP）', url: 'https://osap.gov.on.ca/' }
    ]
  },
  {
    id: 'dtc',
    name: 'Disability Tax Credit (DTC) – Form T2201',
    name_zh: '残障税务抵免（DTC）— T2201 表',
    category: 'Tax Credits / Disability',
    category_zh: '税务抵免/残障',
    desc: 'The Disability Tax Credit is a non-refundable federal tax credit for people with severe and prolonged impairments. A medical practitioner must certify the impairment on Form T2201. DTC approval can also unlock other programs such as RDSP and (for working-age adults) the Canada Disability Benefit.',
    desc_zh: 'DTC（残障税务抵免）是联邦非退税型税务抵免，面向严重且长期受限的人士。需要医疗专业人员在 T2201 表上进行认证。获批 DTC 还可能解锁其他项目，例如 RDSP，以及（18–64 工作年龄）CDB。',
    links: [
      { title: 'DTC overview', title_zh: 'DTC 介绍（官网）', url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/disability-tax-credit.html' },
      { title: 'Form T2201', title_zh: 'T2201 表格（下载/提交说明）', url: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2201.html' }
    ]
  },
  {
    id: 'cdb',
    name: 'Canada Disability Benefit (CDB)',
    name_zh: '加拿大残障福利（CDB）',
    category: 'Income Support / Disability',
    category_zh: '收入援助/残障',
    desc: 'CDB is a federal benefit for working-age adults with disabilities. It is generally linked to Disability Tax Credit eligibility and is income-tested. Exact rules and application steps may evolve, so always verify on the official program page.',
    desc_zh: 'CDB 是面向工作年龄残障成人的联邦福利，通常与 DTC 资格相关，并且是收入测试型。具体规则与申请方式可能会更新，请以官网为准。',
    links: [
      { title: 'CDB overview', title_zh: 'CDB 介绍（官网）', url: 'https://www.canada.ca/en/services/benefits/disability/canada-disability-benefit.html' }
    ]
  },
  {
    id: 'rdsp',
    name: 'Registered Disability Savings Plan (RDSP) – grant & bond',
    name_zh: '残障储蓄计划（RDSP：政府配对补助/债券）',
    category: 'Savings / Disability',
    category_zh: '储蓄/残障',
    desc: 'RDSP is a long-term savings plan for people eligible for the DTC. Government grants and bonds may be paid into the plan depending on family income and contributions. You open an RDSP through a participating financial institution.',
    desc_zh: 'RDSP 是为符合 DTC 资格人士设立的长期储蓄计划。政府可能根据家庭收入与供款提供配对补助（grant）和债券（bond）。通常需要在参与的银行/金融机构开设账户。',
    links: [
      { title: 'RDSP overview', title_zh: 'RDSP 介绍（官网）', url: 'https://www.canada.ca/en/employment-social-development/programs/disability/savings.html' }
    ]
  },
  {
    id: 'adp',
    name: 'Assistive Devices Program (ADP) – Ontario',
    name_zh: '安省辅助器具资助（ADP）',
    category: 'Health / Disability',
    category_zh: '健康/残障',
    desc: 'Ontario’s Assistive Devices Program helps pay for a range of mobility and medical devices for people with long-term physical disabilities. Eligibility depends on the device category and an assessment by an authorizer or specialist. You typically apply through approved vendors or authorizers.',
    desc_zh: '安省 ADP 用于资助多种辅助器具/医疗器材（如行动辅助设备等），面向长期身体功能障碍人士。是否符合取决于器具类别，并需要授权人员/专科评估。通常通过认可的供应商或授权人员办理申请流程。',
    links: [
      { title: 'ADP program page', title_zh: 'ADP 介绍（官网）', url: 'https://www.ontario.ca/page/assistive-devices-program' }
    ]
  },
  {
    id: 'hvmp',
    name: 'Home and Vehicle Modification Program (HVMP) – March of Dimes',
    name_zh: '住房/车辆无障碍改造补助（HVMP）— March of Dimes',
    category: 'Disability / Accessibility',
    category_zh: '残障/无障碍改造',
    desc: 'HVMP may help fund modifications to a home or vehicle to improve mobility and independence for eligible people with disabilities. Typical modifications include ramps, lifts, accessible bathrooms or vehicle adaptations. Eligibility is usually based on disability-related mobility needs and may consider income.',
    desc_zh: 'HVMP 可能资助住房或车辆的无障碍改造，以提升残障人士的行动能力与独立生活能力。常见改造包括坡道、升降设备、无障碍浴室或车辆改装。是否符合通常与行动受限需求相关，并可能考虑收入等因素。',
    links: [
      { title: 'HVMP program page', title_zh: 'HVMP 介绍（官网）', url: 'https://www.marchofdimes.ca/en-ca/programs/am/hvmp/Pages/Home-and-Vehicle-Modification-Program.aspx' }
    ]
  },
  {
    id: 'tdp',
    name: 'Trillium Drug Program (TDP)',
    name_zh: '安省药费高额援助（Trillium Drug Program，TDP）',
    category: 'Health',
    category_zh: '健康/药费',
    desc: 'TDP can help Ontario residents who have high prescription drug costs relative to their household income, especially if they do not have adequate private insurance. You typically pay a deductible based on income, and the program helps cover eligible drug costs beyond that. Applications require proof of income and drug/coverage details.',
    desc_zh: 'TDP 适用于处方药支出相对税后收入较高的安省居民，尤其是没有足够私人药保的人群。通常需要先承担按收入计算的免赔额，之后项目会帮助支付符合条件的药费。申请一般需要收入证明与药费/保险覆盖信息。',
    links: [
      { title: 'TDP program page', title_zh: 'TDP 介绍（官网）', url: 'https://www.ontario.ca/page/get-help-high-prescription-drug-costs' }
    ]
  },
  {
    id: 'hso',
    name: 'Healthy Smiles Ontario (children dental)',
    name_zh: '安省儿童牙科（Healthy Smiles Ontario）',
    category: 'Family & Children / Health',
    category_zh: '家庭/子女/健康',
    desc: 'Healthy Smiles Ontario provides free dental services for eligible children and youth (typically up to age 17) from low-income families. Eligibility is income-tested by family size. Coverage can include check-ups, cleaning and other basic dental services.',
    desc_zh: 'Healthy Smiles Ontario 为符合条件的低收入家庭儿童/青少年（通常至 17 岁）提供免费牙科服务。是否符合按家庭人数进行收入测试。服务可能包括检查、洗牙及部分基础牙科治疗。',
    links: [
      { title: 'HSO program page', title_zh: '项目介绍（官网）', url: 'https://www.ontario.ca/page/get-dental-care' }
    ]
  },
  {
    id: 'acsd',
    name: 'Assistance for Children with Severe Disabilities (ACSD)',
    name_zh: '重度残障儿童家庭补助（ACSD）',
    category: 'Family & Children / Disability',
    category_zh: '家庭/子女/残障',
    desc: 'ACSD may provide monthly financial support to low- and moderate-income families caring for a child under 18 with a severe disability. The program is income-tested and considers the child’s needs and family circumstances. You apply through Ontario’s program process and may need medical and support documentation.',
    desc_zh: 'ACSD 可能为照顾 18 岁以下重度残障儿童的低/中等收入家庭提供每月补助。该项目为收入测试型，并会参考儿童需要与家庭情况。申请通常需要提交医疗与支持需求相关证明。',
    links: [
      { title: 'ACSD program page', title_zh: '项目介绍（官网）', url: 'https://www.ontario.ca/page/assistance-children-severe-disabilities' }
    ]
  },
  {
    id: 'ssah',
    name: 'Special Services at Home (SSAH)',
    name_zh: '居家特殊服务补助（SSAH）',
    category: 'Family & Children / Disability',
    category_zh: '家庭/子女/残障',
    desc: 'SSAH can fund respite and support services for families caring for a child under 18 with a physical or developmental disability, or for adults with a developmental disability. Funding is intended to help families access supports not available elsewhere. Local application processes and waitlists may apply.',
    desc_zh: 'SSAH 可为照顾残障儿童（18 岁以下）或发展障碍成人的家庭提供喘息与支持服务资金，用于补足其他渠道无法覆盖的支持。具体申请由当地机构处理，可能存在等待名单。',
    links: [
      { title: 'SSAH program page', title_zh: '项目介绍（官网）', url: 'https://www.ontario.ca/page/special-services-home' }
    ]
  },
  {
    id: 'ig',
    name: 'Incontinence Supplies Grant (Easter Seals Ontario)',
    name_zh: '失禁用品补助（Easter Seals Ontario）',
    category: 'Family & Children / Disability',
    category_zh: '家庭/子女/残障',
    desc: 'This program helps families with the cost of incontinence supplies for eligible children and youth. Eligibility typically requires medical confirmation of chronic incontinence and age requirements. The application is handled through the program portal and may request health-care provider documentation.',
    desc_zh: '该计划帮助家庭承担儿童/青少年失禁用品的费用。通常需要医疗证明确认慢性失禁，并满足年龄条件。申请可通过项目网站提交，可能需要医疗人员的证明文件。',
    links: [
      { title: 'Program page', title_zh: '项目网站/申请说明', url: 'https://igprogram.easterseals.org/' }
    ]
  },
  {
    id: 'resp',
    name: 'RESP incentives – Canada Learning Bond (CLB) & CESG',
    name_zh: 'RESP 教育储蓄激励（CLB / CESG）',
    category: 'Family & Children / Savings',
    category_zh: '家庭/子女/储蓄',
    desc: 'RESP incentives are government contributions that can help grow savings for a child’s education. CESG matches contributions (up to annual limits), and CLB can provide additional amounts for children from lower-income families. You open an RESP with a financial institution and ensure taxes are filed to assess income-tested incentives.',
    desc_zh: 'RESP 激励是政府为儿童教育储蓄提供的补助。CESG 通常会按比例配对你的供款（有年度上限），而 CLB 面向低收入家庭儿童提供额外补助。你需要在金融机构开设 RESP，并保持报税以便评估收入测试型激励。',
    links: [
      { title: 'RESP benefits (CLB/CESG) overview', title_zh: 'RESP 激励介绍（官网）', url: 'https://www.canada.ca/en/services/benefits/education/education-savings.html' }
    ]
  },
  {
    id: 'ei',
    name: 'Employment Insurance (EI)',
    name_zh: '就业保险（EI：失业/病假/产假/育儿假等）',
    category: 'Employment',
    category_zh: '就业/保险',
    desc: 'Employment Insurance provides temporary income support for eligible workers who lose their job through no fault of their own, or who need time away for sickness, maternity/parental leave, or caregiving. Eligibility depends on insurable employment and hours, and the type of EI benefit you apply for. Applications are submitted online through the Government of Canada.',
    desc_zh: 'EI 为符合条件的劳动者提供临时收入支持，例如非自愿失业、病假、产假/育儿假或照顾亲属等情形。是否符合取决于可保工作与可保小时数，以及你申请的 EI 类型。申请通常通过加拿大政府官网在线提交。',
    links: [
      { title: 'Apply for EI', title_zh: '申请 EI（官网）', url: 'https://www.canada.ca/en/services/benefits/ei/ei-regular-benefit/apply.html' },
      { title: 'EI Maternity & Parental', title_zh: 'EI 产假/育儿假（官网）', url: 'https://www.canada.ca/en/services/benefits/ei/ei-maternity-parental.html' },
      { title: 'EI Sickness', title_zh: 'EI 病假（官网）', url: 'https://www.canada.ca/en/services/benefits/ei/ei-sickness.html' }
    ]
  },

  // ===== Non-government / charity / community supports (Ontario-relevant) =====
  {
    id: 'on211',
    name: '211 Ontario (Community & Social Services Finder)',
    name_zh: '211 安省（社区与社会服务查询）',
    category: 'Charity & Community',
    category_zh: '慈善/社区资源',
    desc: '211 is a free service that helps you find local supports: food banks, housing help, mental health supports, newcomer services, seniors services, and more. It is often the fastest way to locate an intake agency in your city. You can search online, call, text, or chat depending on availability.',
    desc_zh: '211 是免费的社区服务导航平台，可帮你快速找到本地资源：食物银行、住房援助、心理健康支持、新移民服务、长者服务等。很多时候，这是定位“受理机构/申请入口”的最快方式。你可以在线搜索，也可电话/短信/在线聊天咨询。',
    links: [
      { title: 'Search services (211Ontario.ca)', title_zh: '在线查询（211Ontario.ca）', url: 'https://211ontario.ca/' }
    ]
  },
  {
    id: 'feed_ontario',
    name: 'Feed Ontario (Food bank network locator)',
    name_zh: 'Feed Ontario（食物银行网络查询）',
    category: 'Food Support',
    category_zh: '食物援助',
    desc: 'Feed Ontario supports a province-wide network of food banks and hunger-relief programs. If you need groceries or emergency food support, you can use their directory to find a food bank or program near you. Many programs have specific hours and ID requirements, so checking the listing first saves time.',
    desc_zh: 'Feed Ontario 支持安省范围内的食物银行与反饥饿项目网络。如果你需要食物/杂货援助，可使用其目录查找附近的食物银行或项目。不同地点可能有开放时间与证件要求，先查看目录可减少白跑。',
    links: [
      { title: 'Find a food bank', title_zh: '查找食物银行', url: 'https://feedontario.ca/find-a-food-bank/' }
    ]
  },
  {
    id: 'daily_bread',
    name: 'Daily Bread Food Bank (Toronto)',
    name_zh: 'Daily Bread Food Bank（多伦多）',
    category: 'Food Support',
    category_zh: '食物援助',
    desc: 'Daily Bread is a major food bank serving Toronto. It partners with many member agencies and programs across the city, and it can help you find the closest program based on your postal code. Services vary by site (hamper pickup, community meals, referral supports).',
    desc_zh: 'Daily Bread 是服务多伦多的重要食物银行，与全市多家合作机构/项目联动，可按邮编帮助你查找最近的服务点。不同地点提供的服务可能不同（领食物包、社区餐、转介支持等）。',
    links: [
      { title: 'Find food help', title_zh: '查找食物援助', url: 'https://www.dailybread.ca/need-food/' }
    ]
  },
  {
    id: 'salvation_army_help',
    name: 'Salvation Army (Ontario) – emergency assistance / shelters / community programs',
    name_zh: '救世军（安省）— 紧急援助/庇护/社区项目',
    category: 'Housing & Emergency Support',
    category_zh: '住房/紧急援助',
    desc: 'The Salvation Army operates shelters and community assistance programs in many Ontario communities. Depending on location, they may offer emergency food, clothing, housing supports, referrals, and seasonal supports. Availability is local, so you typically start by finding the nearest location or calling for intake.',
    desc_zh: '救世军在安省多地运营庇护所与社区援助项目。不同地点可能提供紧急食物、衣物、住房支持、转介服务及季节性援助等。服务以本地为主，通常先查询附近点位并联系受理/评估。',
    links: [
      { title: 'Find a Salvation Army location', title_zh: '查找救世军服务点', url: 'https://salvationarmy.ca/locator/' }
    ]
  },
  {
    id: 'united_way',
    name: 'United Way (local help & referrals)',
    name_zh: '联合公益（United Way）— 本地援助与转介',
    category: 'Charity & Community',
    category_zh: '慈善/社区资源',
    desc: 'United Way supports local community agencies across Ontario (the exact programs vary by region). If you need help with food, housing, mental health, newcomer supports, or financial stability, United Way sites often point you to partner agencies. For the fastest results, use 211 as the main intake directory in your area.',
    desc_zh: 'United Way 支持安省各地的社区合作机构（具体项目因地区而异）。如果你需要食物、住房、心理健康、新移民支持或经济稳定类援助，United Way 往往会提供合作机构转介。实际操作上，很多地区以 211 作为最通用的受理/目录入口。',
    links: [
      { title: 'United Way Greater Toronto site', title_zh: '多伦多联合公益（示例）', url: 'https://www.unitedwaygt.org/' },
      { title: 'Find United Way in your area', title_zh: '查找你所在地的 United Way', url: 'https://www.unitedway.ca/' }
    ]
  },
  {
    id: 'jumpstart',
    name: 'Jumpstart (Canadian Tire) – Kids sport & activity funding',
    name_zh: 'Jumpstart（Canadian Tire）— 儿童运动/活动费用资助',
    category: 'Family & Children',
    category_zh: '家庭/子女',
    desc: 'Jumpstart can help eligible families cover registration fees for children’s sports and recreation programs. Support is typically targeted to low-income families and varies by community. Applications are submitted online and may require proof of income or enrollment details.',
    desc_zh: 'Jumpstart 可为符合条件的家庭提供儿童运动/文体活动报名费用资助。资助通常面向低收入家庭，并会因社区而异。申请一般在线提交，可能需要收入证明或报名信息。',
    links: [
      { title: 'Jumpstart – Apply', title_zh: 'Jumpstart 申请入口', url: 'https://jumpstart.canadiantire.ca/pages/individual-child-grants' }
    ]
  },
  {
    id: 'furniture_bank',
    name: 'Furniture Bank (Toronto / GTA) – free/low-cost furniture for people in need',
    name_zh: 'Furniture Bank（多伦多/GTA）— 家具援助',
    category: 'Housing & Emergency Support',
    category_zh: '住房/紧急援助',
    desc: 'Furniture Bank helps people moving out of homelessness or crisis situations access essential furniture items. In many cases you need a referral from a social service agency or case worker. Availability depends on inventory and service area (often GTA-focused).',
    desc_zh: 'Furniture Bank 帮助从无家可归或危机处境中安置的人获得基本家具。很多情况下需要由社工/机构转介。服务范围和可用家具取决于库存与地区（通常以 GTA 为主）。',
    links: [
      { title: 'Furniture Bank (Toronto)', title_zh: 'Furniture Bank（多伦多）', url: 'https://www.furniturebank.org/' }
    ]
  },
  {
    id: 'accf',
    name: 'Access Community Capital Fund (ACCF) – low-interest loans (GTA)',
    name_zh: 'Access Community Capital Fund（ACCF）— 低息贷款（GTA）',
    category: 'Financial Help',
    category_zh: '资金/贷款',
    desc: 'ACCF provides low-interest loans for eligible people in the Greater Toronto Area to help with education/training, employment-related expenses, or starting a small business. Loans require an application and assessment, and may require participation in financial coaching. It can be a fit when you need a bridge loan rather than a grant.',
    desc_zh: 'ACCF 为大多伦多地区符合条件人士提供低息贷款，可用于学习培训、就业相关支出或小生意启动等。需要提交申请并接受评估，部分情况下会配合理财辅导。适用于“需要周转贷款”而非纯补助的情形。',
    links: [
      { title: 'ACCF – Loans & eligibility', title_zh: 'ACCF 贷款与资格说明', url: 'https://accessccf.com/' }
    ]
  },
  {
    id: 'red_cross',
    name: 'Canadian Red Cross – local programs & supports',
    name_zh: '加拿大红十字会 — 本地项目与支持',
    category: 'Charity & Community',
    category_zh: '慈善/社区资源',
    desc: 'The Canadian Red Cross offers various community programs (which can vary over time and by region), including health equipment loan programs and supports in emergencies. Because program availability is local, the best first step is to use their program finder or contact your regional office. If you need urgent help, 211 can also direct you to active local programs.',
    desc_zh: '加拿大红十字会在不同地区提供多种社区项目（会随时间与地区变化），例如医疗器材借用、紧急事件中的支持等。由于服务具有地域性，建议先通过其网站查找项目或联系本地分会。若是紧急需求，也可通过 211 获取当前可用资源。',
    links: [
      { title: 'Canadian Red Cross (Programs)', title_zh: '红十字会项目（官网）', url: 'https://www.redcross.ca/' }
    ]
  },
  {
    id: 'shelter_safe',
    name: 'ShelterSafe (women & children escaping violence – Ontario listings)',
    name_zh: 'ShelterSafe（安省家暴避难所查询）',
    category: 'Safety',
    category_zh: '安全/家暴支持',
    desc: 'ShelterSafe helps you find nearby shelters and transition houses for women and children fleeing abuse. It lists crisis phone numbers and shelter contacts across Ontario and Canada. If you are in immediate danger, call 911.',
    desc_zh: 'ShelterSafe 用于查找安省及加拿大各地为遭受家暴的妇女与儿童提供的庇护所/过渡住所，并提供危机热线和联系信息。若你处于紧急危险中，请立即拨打 911。',
    links: [
      { title: 'ShelterSafe – Find a shelter', title_zh: 'ShelterSafe 查询入口', url: 'https://www.sheltersafe.ca/' }
    ]
  },
  {
    id: 'chats',
    name: 'CHATS (Seniors) – Meals on Wheels & supports (York/Peel/Halton area)',
    name_zh: 'CHATS（长者）— 送餐与支持服务（约克/皮尔/哈顿等）',
    category: 'Seniors',
    category_zh: '长者/老人',
    desc: 'CHATS provides services for seniors, including Meals on Wheels, transportation, and in-home supports in certain Ontario regions. Eligibility depends on service area and program capacity. If you are outside the service area, 211 can help locate a Meals on Wheels program closer to you.',
    desc_zh: 'CHATS 为部分安省地区的长者提供服务，包括送餐（Meals on Wheels）、交通接送与居家支持等。是否可用取决于服务覆盖区域与名额。如不在覆盖范围内，可使用 211 查找你所在地的送餐项目。',
    links: [
      { title: 'CHATS – Programs', title_zh: 'CHATS 项目介绍', url: 'https://chats.on.ca/' }
    ]
  },
  {
    id: 'opseu_hardship',
    name: 'OPSEU/SEFPO Hardship Fund',
    name_zh: 'OPSEU/SEFPO 困难救济基金',
    category: 'Emergency / Union',
    category_zh: '紧急援助/工会',
    desc: 'The OPSEU/SEFPO Hardship Fund provides emergency financial assistance to eligible union members experiencing sudden hardship. You may need to submit an application form and proof of need.',
    desc_zh: 'OPSEU/SEFPO 困难救济基金为符合条件的工会会员在遭遇突发困难时提供紧急财务援助。可能需要提交申请表及相关需求证明。',
    links: [
      { title: 'OPSEU – Member Resources', title_zh: 'OPSEU 会员资源', url: 'https://opseu.org/' }
    ]
  },
  {
    id: 'rbc_skip',
    name: 'RBC Skip-a-Payment',
    name_zh: 'RBC 跳过还款选项',
    category: 'Financial Relief',
    category_zh: '财务缓解',
    desc: 'RBC offers a skip-a-payment option allowing eligible mortgage customers to defer one mortgage payment per year. Your mortgage must be up to date to qualify.',
    desc_zh: 'RBC 提供跳过一次还款的选项，在满足条件时每年可延后一次按揭还款。按揭需为良好还款状态。',
    links: [
      { title: 'RBC – Mortgage help', title_zh: 'RBC 按揭帮助', url: 'https://www.rbcroyalbank.com/' }
    ]
  },
  {
    id: 'alectra_pay',
    name: 'Alectra Utilities – Payment Arrangement',
    name_zh: 'Alectra 公用事业 — 缴费安排',
    category: 'Utilities',
    category_zh: '水电气/账单补贴',
    desc: 'Alectra Utilities offers flexible payment arrangements for customers facing arrears or disconnection risk. Eligibility depends on your account status and previous arrangements.',
    desc_zh: 'Alectra 为有欠费或停供风险的客户提供灵活的缴费安排。是否符合取决于账户状态及之前的安排。',
    links: [
      { title: 'Alectra – Customer Support', title_zh: 'Alectra 客户支持', url: 'https://alectrautilities.com/' }
    ]
  },
  {
    id: 'kidney_transport',
    name: 'Kidney Foundation – Transportation Subsidy',
    name_zh: '肾脏基金会 — 交通补贴',
    category: 'Health / Transport',
    category_zh: '健康/交通',
    desc: 'The Kidney Foundation provides transportation subsidies to help cover travel costs for dialysis appointments. Applications typically involve a social worker and financial assessment.',
    desc_zh: '肾脏基金会为透析出行提供交通补贴。申请通常需要社工协助及经济评估。',
    links: [
      { title: 'Kidney Foundation – Patient Support', title_zh: '肾脏基金会 — 患者支持', url: 'https://kidney.ca/' }
    ]
  },
  {
    id: 'hope_air',
    name: 'Hope Air – Medical Travel',
    name_zh: 'Hope Air — 医疗旅行',
    category: 'Health / Transport',
    category_zh: '健康/交通',
    desc: 'Hope Air provides free flights, accommodation, ground transport and meal vouchers for Canadians with financial need who must travel long distances for medical treatment not available locally.',
    desc_zh: 'Hope Air 为需要长途就医且经济困难的加拿大人提供免费机票、住宿、地面交通及餐券。',
    links: [
      { title: 'Hope Air – Apply', title_zh: 'Hope Air 申请', url: 'https://hopeair.ca/' }
    ]
  },
  {
    id: 'unison',
    name: 'Unison Fund – Music Industry Support',
    name_zh: 'Unison 基金 — 音乐行业支援',
    category: 'Emergency / Arts',
    category_zh: '紧急援助/文化艺术',
    desc: 'The Unison Fund offers emergency and ongoing support programs for Canadian music industry workers facing crises or chronic health conditions. Requires proof of service years in the industry.',
    desc_zh: 'Unison 基金为遭遇危机或慢性疾病的加拿大音乐从业者提供紧急和长期支援。需要证明行业从业年限。',
    links: [
      { title: 'Unison Fund – Programs', title_zh: 'Unison 基金项目', url: 'https://www.unisonfund.ca/' }
    ]
  },
  {
    id: 'artist_relief',
    name: 'Elephant Artist Relief Fund',
    name_zh: 'Elephant 艺术家救助基金',
    category: 'Emergency / Arts',
    category_zh: '紧急援助/文化艺术',
    desc: 'The Elephant Artist Relief Fund provides emergency grants up to $2,500 for professional artists and performers facing unforeseen health crises or catastrophic events.',
    desc_zh: 'Elephant 艺术家救助基金为遭遇突发健康危机或灾难的专业艺术家提供最高 $2,500 的紧急补助。',
    links: [
      { title: 'Artist Relief – Apply', title_zh: '艺术家救助 — 申请', url: 'https://www.elephantartistrelief.com/' }
    ]
  },
  {
    id: 'church_benevolence',
    name: 'Church Benevolence Funds',
    name_zh: '教会慈善基金',
    category: 'Community / Faith',
    category_zh: '社区/信仰',
    desc: 'Many churches maintain benevolence funds to help members and local residents facing hardship. Policies vary by congregation; non-members may also be eligible at some local churches.',
    desc_zh: '许多教会设有慈善基金，为成员及当地居民在困难时提供帮助。各教会政策不同；非成员也可能从当地教会获得帮助。',
    links: []
  },
  {
    id: 'john_howard',
    name: 'John Howard Society – Reintegration',
    name_zh: 'John Howard 协会 — 重新融入社会',
    category: 'Reintegration',
    category_zh: '重新融入社会',
    desc: 'The John Howard Society provides reintegration supports including case management, temporary housing, and assistance with record suspension applications for individuals re-entering the community after incarceration.',
    desc_zh: 'John Howard 协会提供重新融入社会的支持，包括个案管理、临时住房以及犯罪记录取消申请协助。',
    links: [
      { title: 'John Howard Society of Ontario', title_zh: 'John Howard 协会（安省）', url: 'https://johnhoward.on.ca/' }
    ]
  },
  {
    id: 'elizabeth_fry',
    name: 'Elizabeth Fry Society – Reintegration',
    name_zh: 'Elizabeth Fry 协会 — 重新融入社会',
    category: 'Reintegration',
    category_zh: '重新融入社会',
    desc: 'The Elizabeth Fry Society provides release planning and reintegration services specifically for women and gender-diverse individuals leaving custody. Regional availability varies.',
    desc_zh: 'Elizabeth Fry 协会为出狱的女性及性别多元人士提供出狱计划和重新融入社会的服务。各地服务范围可能不同。',
    links: [
      { title: 'Canadian Association of E. Fry Societies', title_zh: 'Elizabeth Fry 协会（加拿大）', url: 'https://www.caefs.ca/' }
    ]
  },
  {
    id: 'special_priority',
    name: 'Special Priority Housing Policy',
    name_zh: '特殊优先住房政策',
    category: 'Housing / Safety',
    category_zh: '住房/安全',
    desc: 'Ontario\'s Special Priority Policy can move survivors of abuse or human trafficking to the top of waiting lists for rent-geared-to-income (social) housing. You must apply within 3 months of leaving the situation with supporting documentation.',
    desc_zh: '安省的特殊优先政策可将虐待或人口贩卖的幸存者置于租金补贴住房等待名单前列。需在离开相关处境后 3 个月内提交申请及证明材料。',
    links: [
      { title: 'Ontario – Social housing', title_zh: '安省社会住房信息', url: 'https://www.ontario.ca/page/social-housing' }
    ]
  }
];

function evaluateAll(profile){
  const results = [];

  const oldest = profile.oldestAdultAge;
  const is65 = oldest != null ? oldest >= 65 : null;

  const adultCount = profile.adultCount ?? 1;
  const childCount = profile.childCount ?? 0;

  const gross = profile.incomeGross;
  const net = profile.incomeNet;

  const lowIncomeHeuristic = (gross != null && gross <= 30000) || (net != null && net <= 26000);

  const missingIncome = msg('income', '收入');
  const missingIncomeNet = msg('after-tax income', '税后收入');
  const missingTax = msg('tax filed', '是否报税');
  const missingDis = msg('disability', '是否残障');
  const missingElec = msg('electricity account', '是否有电费账户');
  const missingArrears = msg('arrears/disconnection risk', '是否欠费/停供风险');
  const missingAge = msg('age', '年龄');
  const missingChildAge = msg('child age', '孩子年龄');
  const missingDtc = msg('DTC status', 'DTC 状态');
  const missingRegion = msg('Ontario region/city', '安省地区/城市');
  const missingNeed = msg('your immediate need', '你的紧急需求');

  // New missing-field labels for expanded inputs
  const missingUnion = msg('union membership', '工会会员身份');
  const missingRBCMortgage = msg('RBC mortgage status', 'RBC 按揭状态');
  const missingAlectra = msg('Alectra customer status', 'Alectra 客户状态');
  const missingDialysis = msg('dialysis/chronic kidney disease', '透析/慢性肾病');
  const missingLongTravel = msg('long-distance medical travel', '远程医疗旅行');
  const missingMusic = msg('music industry work', '音乐行业工作');
  const missingArtist = msg('artist profession', '艺术家职业');
  const missingChurch = msg('church membership', '教会成员身份');
  const missingReintegration = msg('reintegration from incarceration', '重新融入社会');
  const missingSurvivor = msg('abuse/trafficking survivor', '虐待/贩卖幸存者');

  // 1) OW
  {
    const b = BENEFITS.find(x=>x.id==='ow');
    const missing = [];
    const why = [msg('Ontario resident (assumed).', '（假设）你是安省居民。')];
    if (gross == null && net == null) missing.push(missingIncome);

    if (lowIncomeHeuristic) {
      why.push(msg(
        'Your income looks low enough that you may meet the financial need test (final decision depends on assets and shelter costs).',
        '你的收入看起来较低，可能符合“经济困难”要求（最终取决于资产与住房费用等）。'
      ));
      results.push(makeResult(b, STATUS.POSSIBLE, why, missing, [
        msg('OW eligibility also depends on assets and specific shelter costs.', 'OW 还会考虑资产、住房费用等具体情况。')
      ]));
    } else if (gross != null && gross > 60000) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('Household income appears high for OW in most cases (assets/circumstances can still matter).',
            '你的收入看起来偏高，通常不符合 OW（但资产/特殊情况仍可能影响）。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You may qualify depending on assets and shelter costs.', '是否符合取决于资产和住房费用等。')
      ], missing, []));
    }
  }

  // 2) ODSP
  {
    const b = BENEFITS.find(x=>x.id==='odsp');
    const hasDis = profile.hasDisability;
    const missing = [];
    if (hasDis === null) missing.push(missingDis);
    if (gross == null && net == null) missing.push(missingIncome);

    if (hasDis === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated a disability.', '你表示有残障/长期健康问题。'),
        msg('ODSP also requires a disability determination and meeting a financial test.',
            'ODSP 还需要残障评估（医疗证明）并满足经济测试。')
      ], missing, [
        msg('You will typically complete a Disability Determination Package after the initial application.',
            '通常需要填写并提交“残障认定材料包”（由医疗人员协助）。')
      ]));
    } else if (hasDis === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('ODSP requires a disability that meets program criteria.', 'ODSP 需要符合项目定义的残障条件。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you have a disability.', '需要先确认是否有残障情况。')
      ], [missingDis], []));
    }
  }

  // 3) OTB
  {
    const b = BENEFITS.find(x=>x.id==='otb');
    const missing = [];
    if (profile.taxFiled === null) missing.push(missingTax);

    const whyBase = msg(
      'OTB is generally accessed by filing your Ontario income tax return (ON-BEN).',
      'OTB 通常通过安省报税（ON‑BEN）自动评估发放。'
    );

    if (profile.taxFiled === false) {
      results.push(makeResult(b, STATUS.POSSIBLE, [whyBase,
        msg('You indicated taxes were not filed last year — you may need to file to receive OTB.',
            '你表示去年未报税——通常需要先报税才可获得 OTB 等税务福利。')
      ], missing, []));
    } else if (profile.taxFiled === true) {
      results.push(makeResult(b, STATUS.ELIGIBLE, [whyBase,
        msg('You indicated you filed taxes, so you will typically be assessed automatically if eligible.',
            '你表示已报税——若符合条件通常会被自动评估发放。')
      ], missing, []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [whyBase], missing, []));
    }
  }

  // 4) CCB
  {
    const b = BENEFITS.find(x=>x.id==='ccb');
    if (childCount === 0) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('CCB is for families with children under 18.', 'CCB 适用于有 18 岁以下孩子的家庭。')
      ], [], []));
    } else {
      const why = [msg('You reported children under 18 in your household.', '你表示家庭中有 18 岁以下孩子。')];
      if (profile.taxFiled === false) {
        why.push(msg('CCB generally requires tax filing to assess income each year.',
                    'CCB 通常需要每年报税以计算家庭收入与金额。'));
      }
      results.push(makeResult(b, STATUS.POSSIBLE, why, [], [
        msg('Final amounts depend on adjusted family net income and custody/residency details.',
            '最终金额取决于调整后家庭净收入、监护/居住等细节。')
      ]));
    }
  }

  // 5) OESP
  {
    const b = BENEFITS.find(x=>x.id==='oesp');
    const missing = [];
    const hasAcct = profile.hasElectricityAccount;
    if (hasAcct === null) missing.push(missingElec);
    if (net == null) missing.push(missingIncomeNet);

    if (hasAcct === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('OESP requires an eligible electricity account for the household.',
            'OESP 通常需要家庭有符合条件的电费账户。')
      ], [], []));
    } else if (hasAcct === true) {
      if (net == null) {
        results.push(makeResult(b, STATUS.NEEDS, [
          msg('Need after-tax household income to assess OESP threshold for your household size.',
              '需要税后家庭收入来判断是否低于 OESP 的家庭规模收入门槛。')
        ], [missingIncomeNet], []));
      } else if (net > 80000) {
        results.push(makeResult(b, STATUS.NOT, [
          msg('After-tax household income appears above typical OESP thresholds.',
              '税后收入看起来高于常见的 OESP 门槛。')
        ], [], []));
      } else {
        results.push(makeResult(b, STATUS.POSSIBLE, [
          msg('You have an electricity account and provided after-tax income.',
              '你表示家庭有电费账户，并提供了税后收入。'),
          msg('Eligibility depends on household-size thresholds and special situations (medical devices, electric heat, Indigenous status).',
              '是否符合取决于“家庭人数+收入门槛”，以及医疗设备/电暖/原住民等特殊情况。')
        ], [], []));
      }
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If your household has an eligible electricity account, you may qualify depending on income.',
            '如果家庭有符合条件的电费账户，可能符合（取决于收入）。')
      ], missing, []));
    }
  }

  // 6) LEAP
  {
    const b = BENEFITS.find(x=>x.id==='leap');
    const missing = [];
    const arrears = profile.hasArrears;
    if (arrears === null) missing.push(missingArrears);
    if (net == null) missing.push(missingIncomeNet);

    if (arrears === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('LEAP is emergency help for overdue utility bills / disconnection risk.',
            'LEAP 是针对欠费/停供风险的紧急援助。')
      ], [], []));
    } else if (arrears === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated overdue utility bills / disconnection risk.',
            '你表示存在欠费/停供风险。'),
        msg('LEAP eligibility depends on income threshold by household size and local intake agency.',
            'LEAP 是否符合取决于按家庭人数划分的收入门槛与本地受理机构。')
      ], missing, [
        msg('Gather your utility bill and proof of income; you must usually try a payment arrangement first.',
            '建议准备账单与收入证明；通常需要先与电力/燃气公司沟通付款安排。')
      ]));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If you have utility arrears/disconnection risk, LEAP may help depending on income.',
            '如果你有欠费/停供风险，LEAP 可能可帮忙（取决于收入）。')
      ], missing, []));
    }
  }

  // 7) GAINS
  {
    const b = BENEFITS.find(x=>x.id==='gains');
    if (is65 === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('GAINS is for seniors aged 65+ (and requires OAS/GIS).',
            'GAINS 通常适用于 65+ 长者（并需要符合 OAS/GIS 等条件）。')
      ], [], []));
    } else if (is65 === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('Your household includes someone aged 65+.', '你家庭中有人年龄为 65+。'),
        msg('GAINS generally applies if you receive OAS and GIS and meet low-income conditions; it is often automatic.',
            'GAINS 通常在你领取 OAS 与 GIS 且符合低收入条件时适用，很多情况下会自动发放。')
      ], [], [
        msg('You may need to confirm you receive OAS/GIS and file taxes annually.',
            '你可能需要确认是否领取 OAS/GIS，并保持每年报税。')
      ]));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need the oldest adult age to assess senior eligibility.',
            '需要最年长成人年龄来判断长者相关福利。')
      ], [missingAge], []));
    }
  }

  // 8) Seniors Dental
  {
    const b = BENEFITS.find(x=>x.id==='seniors_dental');
    const privateDental = profile.hasPrivateDental;
    if (is65 === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('Program is for Ontario residents aged 65+.', '该项目适用于 65+ 的安省居民。')
      ], [], []));
    } else if (is65 === true) {
      if (privateDental === true) {
        results.push(makeResult(b, STATUS.NOT, [
          msg('Program generally requires no private dental coverage.', '该项目通常要求没有私人牙科保险。')
        ], [], []));
      } else if (gross == null) {
        results.push(makeResult(b, STATUS.NEEDS, [
          msg('Need annual income to estimate eligibility.', '需要年收入来估算是否符合。')
        ], [missingIncome], []));
      } else {
        const threshold = (adultCount >= 2) ? 41500 : 25000;
        if (gross <= threshold) {
          results.push(makeResult(b, STATUS.POSSIBLE, [
            msg('65+ and no private dental coverage indicated.', '你满足 65+ 且表示没有私人牙科保险。'),
            msg(`Income appears at or below a common threshold (≈ ${threshold}). Final determination depends on program rules.`,
                `收入看起来低于常见门槛（约 ${threshold}）。最终以官方审核为准。`)
          ], [], []));
        } else {
          results.push(makeResult(b, STATUS.NOT, [
            msg('Income appears above typical eligibility limits for this program.',
                '收入看起来高于该项目常见门槛。')
          ], [], []));
        }
      }
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need the oldest adult age to assess senior eligibility.',
            '需要最年长成人年龄来判断长者相关福利。')
      ], [missingAge], []));
    }
  }

  // 9) Senior homeowner grant
  {
    const b = BENEFITS.find(x=>x.id==='senior_homeowner_grant');
    if (is65 === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This grant is for seniors who own their home.', '该补助通常适用于长者业主（自住房）。')
      ], [], []));
    } else if (is65 === true) {
      if (profile.housing !== 'own') {
        results.push(makeResult(b, STATUS.NOT, [
          msg('This grant is for homeowners.', '该补助需要你是房屋业主。')
        ], [], []));
      } else if (gross == null) {
        results.push(makeResult(b, STATUS.NEEDS, [
          msg('Need annual income to estimate eligibility.', '需要年收入来估算是否符合。')
        ], [missingIncome], []));
      } else {
        const limit = (adultCount >= 2) ? 60000 : 50000;
        if (gross < limit) {
          const m = [];
          if (profile.taxFiled === null) m.push(missingTax);
          results.push(makeResult(b, STATUS.POSSIBLE, [
            msg('Senior household and you indicated you own your home.', '你是长者且表示拥有自住房。'),
            msg(`Income appears below a common upper limit (≈ ${limit}).`, `收入看起来低于常见上限（约 ${limit}）。`),
            msg('You must file taxes to claim this benefit.', '通常需要报税来申领该补助。')
          ], m, []));
        } else {
          results.push(makeResult(b, STATUS.NOT, [
            msg('Income appears above typical eligibility limits for this grant.',
                '收入看起来高于该补助常见门槛。')
          ], [], []));
        }
      }
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need the oldest adult age to assess senior eligibility.',
            '需要最年长成人年龄来判断长者相关福利。')
      ], [missingAge], []));
    }
  }

  // 10) OSAP
  {
    const b = BENEFITS.find(x=>x.id==='osap');
    if (profile.studentApprentice === 'student') {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you are a post-secondary student.', '你表示自己是大专/大学学生。'),
        msg('OSAP eligibility depends on residency/status, program load, and assessed financial need.',
            'OSAP 取决于居住/身份、课程负荷与经济需求评估。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NOT, [
        msg('OSAP is for students in eligible post-secondary programs.', 'OSAP 主要适用于符合条件的学生。')
      ], [], []));
    }
  }

  // 11) DTC
  {
    const b = BENEFITS.find(x=>x.id==='dtc');
    if (profile.hasDisability === true && profile.dtcApproved === false) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated a disability.', '你表示有残障/长期健康问题。'),
        msg('Applying for the DTC can unlock other benefits (CDB, RDSP).', '申请 DTC 可能会解锁其他福利（如 CDB、RDSP）。')
      ], [], [
        msg('Requires a medical practitioner to complete part of the form.', '需要医疗专业人员填写表格的一部分。')
      ]));
    } else if (profile.dtcApproved === true) {
      results.push(makeResult(b, STATUS.ELIGIBLE, [
        msg('You indicated DTC is approved.', '你表示已获批 DTC。')
      ], [], []));
    } else if (profile.hasDisability === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('DTC is for people with severe and prolonged impairments.', 'DTC 适用于严重且长期的功能受限情况。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If you have a severe/prolonged impairment, consider DTC screening.', '如果你有严重/长期受限，可考虑做 DTC 评估与申请。')
      ], [], []));
    }
  }

  // 12) CDB
  {
    const b = BENEFITS.find(x=>x.id==='cdb');
    if (profile.dtcApproved === true) {
      if (oldest != null && oldest >= 65) {
        results.push(makeResult(b, STATUS.NOT, [
          msg('CDB is for working-age adults (18–64).', 'CDB 适用于工作年龄（18–64）。')
        ], [], []));
      } else {
        const m = [];
        if (profile.taxFiled === null) m.push(missingTax);
        results.push(makeResult(b, STATUS.POSSIBLE, [
          msg('DTC approved indicated.', '你表示 DTC 已获批。'),
          msg('CDB requires tax filing; benefit amount depends on income.', 'CDB 通常需要报税；金额与收入有关。')
        ], m, []));
      }
    } else if (profile.dtcApproved === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('CDB generally requires DTC approval.', 'CDB 通常需要先获批 DTC。')
      ], [], [
        msg('Consider applying for DTC first.', '建议先申请 DTC。')
      ]));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if DTC is approved to assess this benefit.', '需要先确认是否已获批 DTC。')
      ], [missingDtc], []));
    }
  }

  // 13) RDSP
  {
    const b = BENEFITS.find(x=>x.id==='rdsp');
    if (profile.dtcApproved === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('DTC approved indicated.', '你表示 DTC 已获批。'),
        msg('You can open an RDSP at a participating financial institution; grants/bonds depend on income.',
            '你可以在银行/金融机构开设 RDSP；政府补助与收入有关。')
      ], [], []));
    } else if (profile.dtcApproved === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('RDSP requires DTC approval.', 'RDSP 需要先获批 DTC。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if DTC is approved to assess this benefit.', '需要先确认是否已获批 DTC。')
      ], [missingDtc], []));
    }
  }

  // 14) ADP
  {
    const b = BENEFITS.find(x=>x.id==='adp');
    if (profile.hasDisability === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated a disability.', '你表示有残障/长期健康问题。'),
        msg('ADP typically supports specific assistive devices for long-term physical disabilities (requires assessment/authorizer).',
            'ADP 通常资助符合条件的辅助器具（需要评估/授权人员）。')
      ], [], []));
    } else if (profile.hasDisability === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('ADP is for people who need eligible assistive devices due to a long-term physical disability.',
            'ADP 主要针对长期身体功能障碍导致需要辅助器具的人士。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If you have a long-term physical disability requiring an assistive device, ADP may help.',
            '如果你有长期身体功能障碍并需要辅助器具，ADP 可能可帮忙。')
      ], [], []));
    }
  }

  // 15) HVMP
  {
    const b = BENEFITS.find(x=>x.id==='hvmp');
    if (profile.hasDisability === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated a disability.', '你表示有残障/长期健康问题。'),
        msg('HVMP may help fund home/vehicle modifications to improve mobility; eligibility depends on mobility limitations and income.',
            'HVMP 可能资助住房/车辆无障碍改造，取决于行动受限与收入等条件。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If you have a mobility-limiting disability and need modifications, HVMP may help.',
            '如果你有行动受限且需要无障碍改造，HVMP 可能可帮忙。')
      ], [], []));
    }
  }

  // 16) TDP
  {
    const b = BENEFITS.find(x=>x.id==='tdp');
    const missing = [];
    if (net == null) missing.push(missingIncomeNet);
    results.push(makeResult(b, STATUS.POSSIBLE, [
      msg('If your household spends a significant portion of after-tax income on prescription drugs and you do not have full private coverage, TDP may help.',
          '如果你的处方药支出占税后收入比例较高，且没有全额私人保险，TDP 可能可帮忙。')
    ], missing, [
      msg('You will need drug cost and insurance details to confirm eligibility.',
          '你需要药费支出与保险覆盖细节来最终确认。')
    ]));
  }

  // 17) HSO
  {
    const b = BENEFITS.find(x=>x.id==='hso');
    if (childCount === 0) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('Program is for children/youth up to age 17.', '该项目适用于 17 岁及以下儿童/青少年。')
      ], [], []));
    } else {
      if (gross == null) {
        results.push(makeResult(b, STATUS.NEEDS, [
          msg('Need annual income to estimate eligibility.', '需要年收入来估算是否符合。')
        ], [missingIncome], []));
      } else {
        results.push(makeResult(b, STATUS.POSSIBLE, [
          msg('You reported children under 18 in your household.', '你表示家庭中有 18 岁以下孩子。'),
          msg('Eligibility depends on household income thresholds by family size.',
              '是否符合取决于按家庭人数划分的收入门槛。')
        ], [], []));
      }
    }
  }

  // 18) ACSD
  {
    const b = BENEFITS.find(x=>x.id==='acsd');
    if (childCount === 0) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('ACSD is for families caring for a child under 18 with a severe disability.',
            'ACSD 适用于照顾 18 岁以下重度残障儿童的家庭。')
      ], [], []));
    } else {
      const missing = [];
      if (gross == null) missing.push(missingIncome);
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If a child under 18 has a severe disability and your household income is within program limits, ACSD may provide monthly support.',
            '如果孩子重度残障且家庭收入在项目范围内，ACSD 可能提供每月补助。'),
        msg('This program is income-tested.', '该项目为收入测试型。')
      ], missing, []));
    }
  }

  // 19) SSAH
  {
    const b = BENEFITS.find(x=>x.id==='ssah');
    if (childCount === 0) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('SSAH is for families caring for a child under 18 with a disability.',
            'SSAH 适用于照顾 18 岁以下残障儿童的家庭。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If your child needs extra support due to a physical or developmental disability, SSAH may fund respite and supports.',
            '若孩子需要额外支持，SSAH 可能资助喘息与相关支持服务。')
      ], [], []));
    }
  }

  // 20) Incontinence Grant
  {
    const b = BENEFITS.find(x=>x.id==='ig');
    if (childCount === 0) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This grant is for children/youth with chronic incontinence.', '该补助适用于失禁问题的儿童/青少年。')
      ], [], []));
    } else {
      const yca = profile.youngestChildAge;
      if (yca == null) {
        results.push(makeResult(b, STATUS.NEEDS, [
          msg('Need the child’s age to estimate basic eligibility (typically ages 3–18).',
              '需要孩子年龄来估算基础资格（通常为 3–18 岁）。')
        ], [missingChildAge], []));
      } else if (yca <= 18) {
        results.push(makeResult(b, STATUS.POSSIBLE, [
          msg('Child age appears within typical range (3–18).', '孩子年龄看起来在常见范围（3–18 岁）。'),
          msg('Requires medical confirmation of chronic incontinence.', '需要医生/护士等医疗确认（慢性失禁）。')
        ], [], []));
      } else {
        results.push(makeResult(b, STATUS.NOT, [
          msg('Program is generally for children/youth up to 18.', '该项目通常适用于 18 岁及以下。')
        ], [], []));
      }
    }
  }

  // 21) RESP incentives
  {
    const b = BENEFITS.find(x=>x.id==='resp');
    if (childCount === 0) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('RESP incentives apply to beneficiaries (children/youth) in an RESP.',
            'RESP 激励适用于在 RESP 中作为受益人的孩子/青少年。')
      ], [], []));
    } else {
      const m = [];
      if (profile.taxFiled === false) m.push(missingTax);
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You have children; you can open an RESP at a financial institution.',
            '你有孩子，可在银行/金融机构开设 RESP。'),
        msg('CLB (low income) and CESG (matching grant) may be available depending on income.',
            'CLB（低收入）与 CESG（配对补助）可能可获得（取决于收入）。')
      ], m, [
        msg('Tax filing is important for income-tested incentives.', '报税对收入测试型激励很重要。')
      ]));
    }
  }

  // 22) EI
  {
    const b = BENEFITS.find(x=>x.id==='ei');
    results.push(makeResult(b, STATUS.POSSIBLE, [
      msg('EI eligibility depends on insurable employment and your situation (job loss, sickness, maternity/parental, caregiving).',
          'EI 是否符合取决于可保工作、可保小时数以及申请原因（失业/病假/产假/育儿假等）。')
    ], [], [
      msg('Future questions to add: worked in last 52 weeks, insurable hours, reason for claim, expected leave dates.',
          '后续可加入问题：过去 52 周是否工作、可保小时数、申请类型、请假日期等。')
    ]));
  }

  // ===== Charity / community supports =====

  // 23) 211 Ontario
  {
    const b = BENEFITS.find(x=>x.id==='on211');
    const missing = [];
    if (!profile.locationRegion || profile.locationRegion === 'unknown') missing.push(missingRegion);
    const anyNeed = [profile.urgentNeedFood, profile.urgentNeedHousing, profile.urgentNeedUtilities,
      profile.urgentNeedFurniture, profile.urgentNeedMedicalTravel, profile.domesticViolence,
      profile.newcomerRefugee, profile.needsMealsDelivery, profile.needsKidsSports, profile.needsMicroloanTraining]
      .some(v => v === true);
    if (!anyNeed) missing.push(missingNeed);

    const why = [
      msg('211 is a universal directory to find local programs (food, housing, shelters, mental health, newcomer services).',
          '211 是通用目录，可按地区查找本地项目（食物、住房、庇护、心理健康、新移民服务等）。'),
      msg('Use it when you are unsure which agency handles intake in your city.',
          '当你不确定你所在城市由哪个机构受理时，211 往往是最佳起点。')
    ];
    results.push(makeResult(b, STATUS.POSSIBLE, why, missing, [
      msg('Tip: try searching with keywords like “rent bank”, “food bank”, “utility arrears”, “women’s shelter”.',
          '小提示：可用关键词如“rent bank / 房租援助”“food bank / 食物银行”“utility arrears / 欠费”“women\'s shelter / 家暴避难所”。')
    ]));
  }

  // 24) Feed Ontario (food bank directory)
  {
    const b = BENEFITS.find(x=>x.id==='feed_ontario');
    if (profile.urgentNeedFood === false) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('Even if you do not need food right now, this directory is useful if your situation changes.',
            '即使你现在不需要食物援助，这个目录在情况变化时也很实用。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you may need food support.', '你表示可能需要食物援助。'),
        msg('Use the directory to find the closest food bank and check hours and ID requirements.',
            '可用目录查找最近的食物银行，并提前查看开放时间与证件要求。')
      ], [], []));
    }
  }

  // 25) Daily Bread (Toronto only)
  {
    const b = BENEFITS.find(x=>x.id==='daily_bread');
    const inTorontoArea = (profile.locationRegion === 'gtha');
    if (!inTorontoArea) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This program is focused on Toronto. Outside Toronto, use 211 or Feed Ontario to find a local food bank.',
            '该项目主要服务多伦多。非多伦多地区建议用 211 或 Feed Ontario 查找本地食物银行。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You selected GTA/Toronto area.', '你选择了大多伦多地区。'),
        msg('Daily Bread can help you find the closest member agency by postal code.',
            'Daily Bread 可按邮编帮你定位最近的合作服务点。')
      ], [], []));
    }
  }

  // 26) Salvation Army (location-based)
  {
    const b = BENEFITS.find(x=>x.id==='salvation_army_help');
    const missing = [];
    if (!profile.locationRegion || profile.locationRegion === 'unknown') missing.push(missingRegion);
    const why = [
      msg('If you need emergency supports (shelter, food, clothing) or referrals, Salvation Army locations may help depending on your city.',
          '如果你需要紧急支持（庇护、食物、衣物）或转介，救世军在部分城市可提供帮助。'),
      msg('Services vary widely by location, so start with the location finder and contact the nearest site.',
          '不同地点提供的服务差异较大，建议先用服务点查询并联系最近的站点。')
    ];
    results.push(makeResult(b, STATUS.POSSIBLE, why, missing, []));
  }

  // 27) United Way (referrals)
  {
    const b = BENEFITS.find(x=>x.id==='united_way');
    results.push(makeResult(b, STATUS.POSSIBLE, [
      msg('United Way sites can point you to local partner agencies for housing stability, food supports, mental health and newcomer services.',
          'United Way 往往可将你转介到本地合作机构（住房稳定、食物、心理健康、新移民服务等）。'),
      msg('Programs differ by region; if you want one unified directory, 211 is usually best.',
          '各地项目不同；若想要统一目录，通常 211 更通用。')
    ], [], []));
  }

  // 28) Jumpstart (kids sports)
  {
    const b = BENEFITS.find(x=>x.id==='jumpstart');
    if (profile.needsKidsSports === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you need help paying for children’s sports/activities.', '你表示需要儿童运动/活动费用资助。'),
        msg('Jumpstart grants may cover registration fees, depending on local funding and eligibility.',
            'Jumpstart 资助可能覆盖报名费用，取决于本地资金与资格审核。')
      ], [], [
        msg('Prepare: child details, program info, and proof of need/income if requested.',
            '建议准备：孩子信息、活动/课程信息，以及可能需要的收入/需求证明。')
      ]));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If you ever need support for kids’ sports registration fees, this grant may help.',
            '如果你需要儿童运动报名费用支持，这个项目可能有帮助。')
      ], [], []));
    }
  }

  // 29) Furniture Bank (GTA)
  {
    const b = BENEFITS.find(x=>x.id==='furniture_bank');
    const inGTA = (profile.locationRegion === 'gtha' || profile.locationRegion === 'york');
    if (!inGTA) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This organization is mainly GTA-based. Outside GTA, use 211 and search “furniture bank” or “free furniture program”.',
            '该机构主要在大多伦多地区。非 GTA 建议用 211 搜索“furniture bank / 家具援助”等关键词。')
      ], [], []));
    } else if (profile.urgentNeedFurniture === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you need basic furniture and are in the GTA area.', '你表示需要基本家具，且在 GTA 地区。'),
        msg('You may need a referral from a social service agency; check intake requirements on the site.',
            '可能需要社工/机构转介，请在官网查看受理要求。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If you need furniture after moving from shelter/crisis housing, this program may help in the GTA.',
            '若你从庇护/危机住房安置后需要家具，该项目在 GTA 可能有帮助。')
      ], [], []));
    }
  }

  // 30) ACCF microloans (GTA)
  {
    const b = BENEFITS.find(x=>x.id==='accf');
    const inGTA = (profile.locationRegion === 'gtha' || profile.locationRegion === 'york');
    if (!inGTA) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('ACCF is GTA-focused. Outside GTA, search local “community loan” or “microloan” programs via 211.',
            'ACCF 以 GTA 为主。非 GTA 可通过 211 搜索本地“community loan / microloan”等项目。')
      ], [], []));
    } else if (profile.needsMicroloanTraining === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you may need a small loan for training/employment/small business.',
            '你表示可能需要用于培训/就业/小生意的小额贷款。'),
        msg('ACCF offers low-interest loans with an application and assessment process.',
            'ACCF 提供低息贷款，需要提交申请并进行评估。')
      ], [], [
        msg('Prepare: budget, purpose of loan, and proof of residence in the GTA.',
            '建议准备：预算/用途说明，以及 GTA 居住证明等。')
      ]));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If you need a low-interest loan (not a grant) for training or work-related expenses, ACCF may be an option in the GTA.',
            '若你需要用于培训或工作相关支出的低息贷款（非补助），ACCF 在 GTA 可能是一个选择。')
      ], [], []));
    }
  }

  // 31) Red Cross (general)
  {
    const b = BENEFITS.find(x=>x.id==='red_cross');
    results.push(makeResult(b, STATUS.POSSIBLE, [
      msg('Red Cross programs vary by region. Check the program directory or contact your regional office for current supports.',
          '红十字会项目因地区而异。建议查看项目目录或联系本地分会了解当前可用服务。'),
      msg('If your need is urgent and you do not know where to start, use 211 first.',
          '如果是紧急需求且不确定从哪里开始，建议先用 211。')
    ], [], []));
  }

  // 32) ShelterSafe (domestic violence)
  {
    const b = BENEFITS.find(x=>x.id==='shelter_safe');
    if (profile.domesticViolence === false) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('This resource is mainly for people fleeing abuse. Keep it for reference if safety concerns arise.',
            '该资源主要面向家暴求助者。你可作为安全信息备用。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you may need safety support related to domestic violence.',
            '你表示可能需要家暴相关的安全支援。'),
        msg('ShelterSafe helps you find shelters and crisis contacts in Ontario.',
            'ShelterSafe 可帮助你查找安省庇护所与危机联系信息。')
      ], [], [
        msg('If you are in immediate danger, call 911.', '如处于紧急危险，请拨打 911。')
      ]));
    }
  }

  // 33) CHATS (meals/transport)
  {
    const b = BENEFITS.find(x=>x.id==='chats');
    const inServiceArea = (profile.locationRegion === 'york' || profile.locationRegion === 'gtha' || profile.locationRegion === 'hamilton');
    if (profile.needsMealsDelivery === true && is65 !== false) {
      if (!inServiceArea) {
        results.push(makeResult(b, STATUS.POSSIBLE, [
          msg('You indicated a need for meal delivery for a senior, but CHATS may not serve all regions.',
              '你表示长者需要送餐，但 CHATS 并不覆盖所有地区。'),
          msg('Use 211 to find a Meals on Wheels program in your city.',
              '建议用 211 查找你所在地的 Meals on Wheels 送餐项目。')
        ], [missingRegion], []));
      } else {
        results.push(makeResult(b, STATUS.POSSIBLE, [
          msg('You indicated a need for senior meal delivery and selected an area where CHATS is commonly active.',
              '你表示需要长者送餐，并选择了 CHATS 常见服务区域。'),
          msg('Contact the program for intake; availability depends on capacity and eligibility.',
              '请联系项目进行受理评估；是否可用取决于名额与资格。')
        ], [], []));
      }
    } else {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('If you are a senior who needs Meals on Wheels or transportation supports in certain regions, CHATS may help.',
            '如果你是需要送餐或交通支持的长者，且位于特定地区，CHATS 可能可提供帮助。')
      ], [], []));
    }
  }

  // === New benefits from expanded research ===

  // 34) OPSEU/SEFPO Hardship Fund
  {
    const b = BENEFITS.find(x => x.id === 'opseu_hardship');
    const missing = [];
    if (profile.unionMember === null) missing.push(missingUnion);
    if (profile.unionMember === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you are a union member.', '你表示是工会会员。'),
        msg('The OPSEU/SEFPO Hardship Fund provides emergency financial assistance to eligible members experiencing sudden hardship.',
            'OPSEU/SEFPO 困难救济基金为符合条件的会员在遭遇突发困难时提供紧急财务援助。')
      ], missing, [
        msg('You may need to submit an application form and proof of need.', '可能需要提交申请表及相关需求证明。')
      ]));
    } else if (profile.unionMember === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This fund is only available to OPSEU/SEFPO members.', '该基金仅适用于 OPSEU/SEFPO 会员。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you are a union member to assess this fund.', '需要知道你是否为工会会员才能评估。')
      ], missing, []));
    }
  }

  // 35) RBC Skip-a-Payment option
  {
    const b = BENEFITS.find(x => x.id === 'rbc_skip');
    const missing = [];
    if (profile.rbcmortgage === null) missing.push(missingRBCMortgage);
    if (profile.rbcmortgage === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you have an RBC mortgage.', '你表示持有 RBC 按揭。'),
        msg('RBC offers a skip-a-payment option allowing you to defer one mortgage payment per year if certain conditions are met.',
            'RBC 提供跳过一次还款的选项，在满足条件时每年可延后一次按揭还款。')
      ], missing, [
        msg('Your mortgage must be up to date, and you need to contact RBC to arrange the deferral.', '需要确保按揭未逾期，并联系 RBC 办理延期。')
      ]));
    } else if (profile.rbcmortgage === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This option applies only to RBC mortgage customers.', '此选项仅适用于 RBC 按揭客户。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you have an RBC mortgage to assess eligibility.', '需要知道你是否持有 RBC 按揭才能评估。')
      ], missing, []));
    }
  }

  // 36) Alectra Utilities payment arrangements
  {
    const b = BENEFITS.find(x => x.id === 'alectra_pay');
    const missing = [];
    if (profile.alectraCustomer === null) missing.push(missingAlectra);
    if (profile.alectraCustomer === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you are an Alectra customer.', '你表示是 Alectra 客户。'),
        msg('Alectra offers flexible payment arrangements for customers facing arrears or disconnection.',
            'Alectra 为有欠费或停供风险的客户提供灵活的缴费安排。')
      ], missing, [
        msg('Eligibility depends on your total charges and whether you have had a recent arrangement.', '资格取决于欠费金额及是否近期曾使用安排。')
      ]));
    } else if (profile.alectraCustomer === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This program is for Alectra Utilities customers.', '该项目适用于 Alectra 公用事业客户。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you are an Alectra customer to assess eligibility.', '需要知道你是否为 Alectra 客户才能评估。')
      ], missing, []));
    }
  }

  // 37) Kidney Foundation transportation subsidy
  {
    const b = BENEFITS.find(x => x.id === 'kidney_transport');
    const missing = [];
    if (profile.kidneyDialysis === null) missing.push(missingDialysis);
    if (profile.kidneyDialysis === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated that you require regular dialysis or have chronic kidney disease.', '你表示需要定期透析或患有慢性肾病。'),
        msg('The Kidney Foundation provides transportation subsidies to help with travel costs for dialysis appointments.',
            '肾脏基金会为透析出行提供交通补贴。')
      ], missing, [
        msg('Applications are often completed with a social worker and include a financial assessment.', '申请通常由社会工作者协助办理，并包含经济状况评估。')
      ]));
    } else if (profile.kidneyDialysis === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This subsidy is for people undergoing regular dialysis.', '该补贴适用于需要定期透析的人。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you receive dialysis to assess this subsidy.', '需要知道你是否在接受透析才能评估此补贴。')
      ], missing, []));
    }
  }

  // 38) Hope Air medical travel program
  {
    const b = BENEFITS.find(x => x.id === 'hope_air');
    const missing = [];
    if (profile.longDistanceMedicalTravel === null) missing.push(missingLongTravel);
    if (profile.longDistanceMedicalTravel === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you need to travel long distances for medical care.', '你表示需要为医疗护理长途旅行。'),
        msg('Hope Air provides free flights, accommodation, ground transport and meal vouchers for Canadians with financial need who must travel for treatment.',
            'Hope Air 为需要长途就医且经济困难的加拿大人提供免费机票、住宿、地面交通及餐券。')
      ], missing, [
        msg('Eligibility is based on medical need and financial criteria; contact Hope Air for details.', '资格取决于医疗需求及经济情况，请联系 Hope Air 了解详情。')
      ]));
    } else if (profile.longDistanceMedicalTravel === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This program is for those who must travel far for medical care.', '该项目适用于必须为医疗护理长途旅行的人。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you must travel long distance for care.', '需要知道你是否需要长途就医。')
      ], missing, []));
    }
  }

  // 39) Unison Fund – music industry support
  {
    const b = BENEFITS.find(x => x.id === 'unison');
    const missing = [];
    if (profile.musicProfessional === null) missing.push(missingMusic);
    if (profile.musicProfessional === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you work in the music industry.', '你表示在音乐行业工作。'),
        msg('Unison Fund offers emergency and legacy support programs for music workers facing crises or chronic conditions.',
            'Unison 基金为遭遇危机或慢性疾病的音乐从业者提供紧急和长期支援。')
      ], missing, [
        msg('Applications typically require proof of industry service (years) and documentation of need.', '申请通常需要提供行业从业年限及需求证明。')
      ]));
    } else if (profile.musicProfessional === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This fund is aimed at people who work in the Canadian music industry.', '该基金面向在加拿大音乐行业工作的人。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you are a music industry professional.', '需要知道你是否从事音乐行业。')
      ], missing, []));
    }
  }

  // 40) Elephant Artist Relief Fund
  {
    const b = BENEFITS.find(x => x.id === 'artist_relief');
    const missing = [];
    if (profile.artistProfessional === null) missing.push(missingArtist);
    if (profile.artistProfessional === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you are a professional artist or performer.', '你表示是专业艺术家或表演者。'),
        msg('Elephant Artist Relief provides emergency grants up to $2,500 for artists facing unforeseen health crises or catastrophic events.',
            'Elephant 艺术家救助基金为遭遇突发健康危机或灾难的艺术家提供最高 $2,500 的紧急补助。')
      ], missing, [
        msg('Proof of professional status and documentation of the emergency are required.', '需要提供专业身份及紧急情况证明。')
      ]));
    } else if (profile.artistProfessional === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This fund is targeted to professional artists and performers.', '该基金主要面向专业艺术家和表演者。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you are a professional artist or performer.', '需要知道你是否为专业艺术家或表演者。')
      ], missing, []));
    }
  }

  // 41) Church Benevolence Funds
  {
    const b = BENEFITS.find(x => x.id === 'church_benevolence');
    const missing = [];
    if (profile.churchMember === null) missing.push(missingChurch);
    if (profile.churchMember === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you are a member of a faith community or church.', '你表示是信仰团体/教会成员。'),
        msg('Many churches maintain benevolence funds to help members and local residents facing hardship.',
            '许多教会设有慈善基金，为成员及当地居民在困难时提供帮助。')
      ], missing, [
        msg('Policies and amounts vary by congregation; contact your church for details.', '具体政策和金额因教会而异，请联系你的教会了解详情。')
      ]));
    } else if (profile.churchMember === false) {
      // If not a member, we show as possible because local churches may still help residents in need.
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('Even if you are not a member, some local churches offer assistance to neighbours facing hardship.',
            '即使不是教会成员，一些教会也会帮助身处困境的邻里。'),
        msg('Consider contacting a nearby faith community if you need urgent help.', '如果需要紧急帮助，可以尝试联系附近的宗教社区。')
      ], missing, []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you belong to a faith community/church to gauge this option.', '需要知道你是否属于某个宗教团体/教会才能评估。')
      ], missing, []));
    }
  }

  // 42) John Howard Society Reintegration
  {
    const b = BENEFITS.find(x => x.id === 'john_howard');
    const missing = [];
    if (profile.reintegration === null) missing.push(missingReintegration);
    if (profile.reintegration === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated you or someone in your household is re-entering the community after incarceration.', '你表示你或家庭成员正在出狱后重新融入社会。'),
        msg('John Howard Society provides reintegration supports, including case management, temporary housing and assistance with record suspension applications.',
            'John Howard 协会提供重新融入社会的支持，包括个案管理、临时住房以及犯罪记录取消申请协助。')
      ], missing, [
        msg('Contact your local John Howard Society to see if services are available in your area.', '请联系当地 John Howard 协会了解服务是否覆盖你所在地区。')
      ]));
    } else if (profile.reintegration === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This program serves individuals leaving incarceration or involved with the justice system.', '该项目服务于出狱或涉司法系统的人。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you are re-entering from incarceration to assess this support.', '需要知道你是否是出狱后重新融入社会的人。')
      ], missing, []));
    }
  }

  // 43) Elizabeth Fry Society Reintegration
  {
    const b = BENEFITS.find(x => x.id === 'elizabeth_fry');
    const missing = [];
    if (profile.reintegration === null) missing.push(missingReintegration);
    if (profile.reintegration === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated a need for reintegration support.', '你表示需要重新融入社会的支持。'),
        msg('The Elizabeth Fry Society provides release planning and reintegration services for women and gender diverse individuals leaving custody.',
            'Elizabeth Fry 协会为出狱的女性及性别多元人士提供出狱计划和重新融入社会的服务。')
      ], missing, [
        msg('Contact the Society to check service availability in your region.', '请联系该协会了解你所在地区是否有服务。')
      ]));
    } else if (profile.reintegration === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This program assists women and gender diverse people leaving incarceration.', '该项目为出狱的女性及性别多元人士提供帮助。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you or someone in your household is leaving incarceration.', '需要知道你或家庭成员是否正从监禁中释出。')
      ], missing, []));
    }
  }

  // 44) Special Priority Housing Policy
  {
    const b = BENEFITS.find(x => x.id === 'special_priority');
    const missing = [];
    if (profile.survivorAbuse === null) missing.push(missingSurvivor);
    if (profile.survivorAbuse === true) {
      results.push(makeResult(b, STATUS.POSSIBLE, [
        msg('You indicated that you are a survivor of abuse or human trafficking.', '你表示是虐待或人口贩卖的幸存者。'),
        msg('Ontario’s Special Priority Policy can move survivors to the top of waiting lists for rent‑geared‑to‑income housing.',
            '安省的特殊优先政策可将幸存者置于租金补贴住房等待名单前列。')
      ], missing, [
        msg('You must apply within three months of leaving the abuser/trafficker and provide documentation.', '需要在离开施暴者/贩卖者三个月内申请并提供证明。')
      ]));
    } else if (profile.survivorAbuse === false) {
      results.push(makeResult(b, STATUS.NOT, [
        msg('This policy is specifically for survivors of abuse or human trafficking.', '该政策专门针对虐待或人口贩卖幸存者。')
      ], [], []));
    } else {
      results.push(makeResult(b, STATUS.NEEDS, [
        msg('Need to know if you are a survivor to evaluate this option.', '需要知道你是否为幸存者才能评估该选项。')
      ], missing, []));
    }
  }

  return results;
}

function normalizeProfile(raw){
  return {
    householdType: str(raw.householdType) || 'single',
    adultCount: num(raw.adultCount) ?? 1,
    childCount: num(raw.childCount) ?? 0,
    oldestAdultAge: num(raw.oldestAdultAge),
    youngestChildAge: num(raw.youngestChildAge),
    incomeGross: num(raw.incomeGross),
    incomeNet: num(raw.incomeNet),
    housing: str(raw.housing) || 'other',
    hasElectricityAccount: yn(raw.hasElectricityAccount),
    hasArrears: yn(raw.hasArrears),
    heatedByElectricity: yn(raw.heatedByElectricity),
    hasDisability: yn(raw.hasDisability),
    dtcApproved: yn(raw.dtcApproved),
    studentApprentice: str(raw.studentApprentice) || 'none',
    taxFiled: yn(raw.taxFiled),
    hasPrivateDental: yn(raw.hasPrivateDental),

    // New: charity/community fields
    locationRegion: str(raw.locationRegion) || 'unknown',
    urgentNeedFood: yn(raw.urgentNeedFood),
    urgentNeedHousing: yn(raw.urgentNeedHousing),
    urgentNeedUtilities: yn(raw.urgentNeedUtilities),
    urgentNeedFurniture: yn(raw.urgentNeedFurniture),
    urgentNeedMedicalTravel: yn(raw.urgentNeedMedicalTravel),
    domesticViolence: yn(raw.domesticViolence),
    newcomerRefugee: yn(raw.newcomerRefugee),
    needsMealsDelivery: yn(raw.needsMealsDelivery),
    needsKidsSports: yn(raw.needsKidsSports),
    needsMicroloanTraining: yn(raw.needsMicroloanTraining)

    ,unionMember: yn(raw.unionMember)
    ,rbcmortgage: yn(raw.rbcmortgage)
    ,alectraCustomer: yn(raw.alectraCustomer)
    ,kidneyDialysis: yn(raw.kidneyDialysis)
    ,longDistanceMedicalTravel: yn(raw.longDistanceMedicalTravel)
    ,musicProfessional: yn(raw.musicProfessional)
    ,artistProfessional: yn(raw.artistProfessional)
    ,churchMember: yn(raw.churchMember)
    ,reintegration: yn(raw.reintegration)
    ,survivorAbuse: yn(raw.survivorAbuse)
  };
}

window.BENEFITS_ENGINE = {
  STATUS,
  STATUS_ORDER,
  BENEFITS,
  normalizeProfile,
  evaluateAll
};
