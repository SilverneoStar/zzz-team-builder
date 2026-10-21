// Each Agent's role and, where the guide gives them, the in-combat stat
// targets to build towards.
// From the community ZZZ Agent Build Guide (Google Sheets), see NOTICE.md.
// `version` is the game version that guide entry was last updated for.
export const GUIDE_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTj2PaPq6Py_1B5fsOPj_Moc-tN_7mut7fICczI6lz1njyEIAInTnfB7lAraX4pYCRGNbaHGlIbFZ90/pubhtml';

export const STAT_TARGETS = {
  'starlight-billy-kid': {
    version: '3.2',
    role: 'On-Field DPS',
    targets: ['HP 17,000–20,000+ with an HP main-stat W-Engine, 15,000–17,000+ otherwise', 'CRIT Rate 64–88%', 'CRIT DMG 130%+'],
  },
  'sunna': {
    version: '2.7',
    role: 'Support · Ether Veil Enabler',
    targets: ['ATK 3,300–3,500 (maximizes her teamwide ATK buffs)'],
  },
  'ye-shunguang': {
    version: '2.6',
    role: 'On-Field DPS',
    targets: ['ATK 3,200–3,400+ with an ATK main-stat W-Engine, 2,700–3,000+ otherwise', 'CRIT Rate 50%', 'CRIT DMG 160–200%+'],
  },
  'dialyn': {
    version: '2.6',
    role: 'Burst Stunner',
    targets: ['CRIT Rate 80–100% without the signature W-Engine, 100% with it (100% maximizes the Impact% self-buff)'],
  },
  'alice-thymefield': {
    version: '3.1',
    role: 'On-Field DPS · Quick-Swap DPS',
    targets: ['ATK 2,500–2,900+ with an ATK main-stat W-Engine, 2,300–2,700+ otherwise', 'Anomaly Proficiency 400–420+ with an Anomaly Proficiency main-stat W-Engine, 320–350+ otherwise'],
  },
  'phoenix-reffaella': {
    version: '3.3',
    role: 'On-Field DPS · Anomaly',
    targets: ['ATK 2,500–2,700+ with an ATK main-stat W-Engine, 2,200–2,500+ otherwise', 'Anomaly Proficiency 400–420+ with an Anomaly Proficiency main-stat W-Engine, 330–350+ otherwise', 'Anomaly Mastery 255 caps the CRIT Rate her Core Passive gives Attribute Anomalies'],
  },
  'ukinami-yuzuha': {
    version: '3.0',
    role: 'Anomaly Support',
    targets: ['ATK 3,000 (maximizes her teamwide ATK buffs)'],
  },
  'caesar-king': {
    version: '3.1',
    role: 'Support · Shielder',
    targets: ['CRIT Rate 50%+', 'CRIT DMG 100%+', 'Anomaly Proficiency 220+'],
  },
  'jane-doe': {
    version: '3.1',
    role: 'On-Field DPS',
    targets: ['ATK 2,700–2,900+ with an ATK main-stat W-Engine, 2,300–2,500+ otherwise', 'Anomaly Proficiency 410–440+ with an Anomaly Proficiency main-stat W-Engine, 350–380+ otherwise'],
  },
  'nekomiya-mana': {
    version: '3.1',
    role: 'On-Field DPS',
    targets: ['ATK 3,100–3,400+ with an ATK main-stat W-Engine, 2,800–3,200+ otherwise', 'CRIT Rate 70–100%', 'CRIT DMG 130–150%+'],
  },
  'pan-yinhu': {
    version: '2.7',
    role: 'Rupture Support',
    targets: ['ATK 3,000 (maximizes his Flat Sheer Force buff)'],
  },
  'pulchra-fellini': {
    version: '2.6',
    role: 'Off-Field Stunner · Support',
    targets: ['Impact 168–193', 'CRIT Rate 50%+ (needed for the 4-piece King of the Summit)', 'CRIT DMG 100%+'],
  },
  'billy-kid': {
    version: '3.0',
    role: 'On-Field DPS',
    targets: ['ATK 2,700–3,000+ with an ATK main-stat W-Engine, 2,600–2,800+ otherwise', 'CRIT Rate 60–70%+', 'CRIT DMG 125–150%+'],
  },
  'piper-wheel': {
    version: '3.1',
    role: 'On-Field DPS · Quick-Swap DPS',
    targets: ['ATK 2,400–2,550+ with an ATK main-stat W-Engine, 2,200–2,400+ otherwise', 'Anomaly Proficiency 350–400+ with an Anomaly Proficiency main-stat W-Engine, 330–350+ otherwise'],
  },
  'corin-wickes': {
    version: '2.6',
    role: 'On-Field DPS',
    targets: ['ATK 2,700–3,000+ with an ATK main-stat W-Engine, 2,600–2,800+ otherwise', 'CRIT Rate 70–80%+', 'CRIT DMG 120–160%+'],
  },
  'norma-hollowell': {
    version: '3.2',
    role: 'Off-Field Stunner · Off-Field DPS',
    targets: ['CRIT Rate 80–100% without the signature W-Engine, 100% with it (100% maximizes the Daze% and CD% self-buffs)'],
  },
  'banyue': {
    version: '3.2',
    role: 'On-Field DPS',
    targets: ['HP 17,000–20,000+ with an HP main-stat W-Engine, 15,000–17,000+ otherwise', 'CRIT Rate 68–88%', 'CRIT DMG 130%+'],
  },
  'orphie-magnusson-and-magus': {
    version: '3.2',
    role: 'Off-Field DPS',
    targets: ['ATK 2,200–2,500+', 'CRIT Rate 38–63%', 'CRIT DMG 120–150%+'],
  },
  'ju-fufu': {
    version: '3.0',
    role: 'Off-Field Stunner · Support',
    targets: ['ATK 3,100–3,300+ without the signature W-Engine, 3,400 with it (maximizes the teamwide CD%)', 'CRIT Rate 50% (50% maximizes the 4-piece King of the Summit)'],
  },
  'evelyn-chevalier': {
    version: '3.2',
    role: 'On-Field DPS',
    targets: ['ATK 3,200–3,400+ with an ATK main-stat W-Engine, 2,700–3,000+ otherwise', 'CRIT Rate 55–75%', 'CRIT DMG 130–160%+'],
  },
  'lighter': {
    version: '3.0',
    role: 'Burst Stunner · Fire/Ice Support',
    targets: ['CRIT Rate 50%+ (50% maximizes the 4-piece King of the Summit)', 'CRIT DMG 100%+'],
  },
  'burnice-white': {
    version: '3.1',
    role: 'Off-Field DPS',
    targets: ['ATK 2,500–2,800+ with an ATK main-stat W-Engine, 2,300–2,500+ otherwise', 'Anomaly Proficiency 390–440+ with an Anomaly Proficiency main-stat W-Engine, 320–370+ otherwise'],
  },
  'soldier-11': {
    version: '3.0',
    role: 'On-Field DPS',
    targets: ['ATK 3,100–3,300+ with an ATK main-stat W-Engine, 2,600–3,000+ otherwise', 'CRIT Rate 70–100%', 'CRIT DMG 100–160%+'],
  },
  'koleda-belobog': {
    version: '3.2',
    role: 'Burst Stunner',
    targets: ['CRIT Rate 50%+ (50% maximizes the 4-piece King of the Summit)', 'CRIT DMG 100%+'],
  },
  'komano-manato': {
    version: '2.8',
    role: 'On-Field DPS',
    targets: ['HP 17,000–20,000+ with an HP main-stat W-Engine, 15,000–17,000+ otherwise', 'CRIT Rate 54–78%', 'CRIT DMG 130–150%+'],
  },
  'luciana-de-montefio': {
    version: '2.6',
    role: 'Support',
    targets: ['ATK 2,367 at EX 11, 2,265 at EX 12, 2,083 at EX 14, 1,922 at EX 16 (maximizes the ATK buff)', 'Anomaly Proficiency 250+'],
  },
  'ben-bigger': {
    version: '2.7',
    role: 'Shielder',
    targets: ['CRIT Rate 50%+', 'CRIT DMG 100%+'],
  },
  'sigrid-de-lazur': {
    version: '3.2',
    role: 'On-Field DPS',
    targets: ['ATK 3,000–3,400+ with an ATK main-stat W-Engine, 2,800–3,200+ otherwise', 'CRIT Rate 34%', 'CRIT DMG 170–210%+'],
  },
  'promeia': {
    version: '3.1',
    role: 'On-Field DPS',
    targets: ['ATK 2,600+ with an ATK main-stat W-Engine, 2,400+ otherwise', 'Anomaly Proficiency 370–400+ with an Anomaly Proficiency main-stat W-Engine, 300–330+ otherwise'],
  },
  'zhao': {
    version: '2.7',
    role: 'Support · Ether Veil Enabler',
    targets: ['HP 23,000–27,000 with an HP main-stat W-Engine, 21,000–25,000+ otherwise (maximizes the teamwide DMG%)'],
  },
  'yidhari-murphy': {
    version: '2.8',
    role: 'On-Field DPS',
    targets: ['HP 17,000–20,000+ with an HP main-stat W-Engine, 15,000–17,000+ otherwise', 'CRIT Rate 64–88%', 'CRIT DMG 130%+'],
  },
  'hugo-vlad': {
    version: '3.2',
    role: 'Burst DPS',
    targets: ['ATK 2,800–3,400+ with an ATK main-stat W-Engine, 2,700–3,200+ otherwise', 'CRIT Rate 68–88%', 'CRIT DMG 120–150%+'],
  },
  'hoshimi-miyabi': {
    version: '2.8',
    role: 'On-Field DPS',
    targets: ['ATK 2,800–3,200+ with an ATK main-stat W-Engine, 2,700–3,200+ otherwise, 2,300–2,600+ with an Anomaly Mastery slot 6', 'CRIT Rate 68–88%', 'CRIT DMG 110–150%+'],
  },
  'ellen-joe': {
    version: '3.0',
    role: 'On-Field DPS',
    targets: ['ATK 2,750–3,450+ with an ATK main-stat W-Engine, 2,700–3,000+ otherwise', 'CRIT Rate 80–100%', 'CRIT DMG 120%+'],
  },
  'von-lycaon': {
    version: '3.2',
    role: 'Burst Stunner · Off-Field Stunner · Support',
    targets: ['CRIT Rate 50%+ (50% maximizes the 4-piece King of the Summit)', 'Anomaly Proficiency 250+'],
  },
  'soukaku': {
    version: '3.1',
    role: 'Support',
    targets: ['ATK 2,500 at Core F, 2,623 at Core E, 2,778 at Core D (maximizes the ATK buff)', 'Anomaly Proficiency 250+'],
  },
  'claret-flint': {
    version: '3.2',
    role: 'On-Field DPS',
    targets: ['DEF 2,200–2,400+', 'CRIT Rate 120%+'],
    note: 'CRIT Rate caps at 200% in combat; Armorer Agents roll for CRIT twice, once up to 100% and again from 100–200%.',
  },
  'cissia': {
    version: '3.0',
    role: 'Quick-Swap DPS',
    targets: ['ATK 2,700–3,200+ with an ATK main-stat W-Engine, 2,200–2,700+ otherwise', 'CRIT Rate 57–82%', 'CRIT DMG 110%+'],
  },
  'seed': {
    version: '3.0',
    role: 'Quick-Swap DPS',
    targets: ['ATK 2,800–3,000+ with an ATK main-stat W-Engine, 2,500–2,700+ otherwise', 'CRIT Rate 60–100%', 'CRIT DMG 120%+'],
  },
  'trigger': {
    version: '3.2',
    role: 'Off-Field Stunner · Support',
    targets: ['CRIT Rate 60–90% without the signature W-Engine, 90% with it (90% maximizes the Aftershock Daze% self-buff)'],
  },
  'soldier-0-anby': {
    version: '3.0',
    role: 'On-Field DPS',
    targets: ['ATK 2,800–3,100+ with an ATK main-stat W-Engine, 2,700–3,000+ otherwise', 'CRIT Rate 58–78%', 'CRIT DMG 120–160%+'],
  },
  'asaba-harumasa': {
    version: '3.2',
    role: 'On-Field DPS',
    targets: ['ATK 3,000–3,300+ with an ATK main-stat W-Engine, 2,700–3,000+ otherwise', 'CRIT Rate 28–75%', 'CRIT DMG 130–180%+'],
  },
  'tsukishiro-yanagi': {
    version: '3.1',
    role: 'On-Field DPS · Quick-Swap DPS',
    targets: ['ATK 2,500–2,700+ with an ATK main-stat W-Engine, 2,300–2,400+ otherwise', 'Anomaly Proficiency 400–420+ with an Anomaly Proficiency main-stat W-Engine, 350–375+ otherwise'],
  },
  'qingyi': {
    version: '2.6',
    role: 'On-Field Stunner',
    targets: ['CRIT Rate 50%+ (50% maximizes the 4-piece King of the Summit)', 'CRIT DMG 100%+'],
  },
  'grace-howard': {
    version: '3.1',
    role: 'On-Field DPS · Quick-Swap DPS',
    targets: ['ATK 2,500–2,700+ with an ATK main-stat W-Engine, 2,200–2,400+ otherwise', 'Anomaly Proficiency 400–420+ with an Anomaly Proficiency main-stat W-Engine, 330–350+ otherwise'],
  },
  'alexandrina-sebastiane': {
    version: '3.1',
    role: 'Support',
    targets: ['CRIT Rate 50%+', 'CRIT DMG 100%+', 'Anomaly Proficiency 250+'],
  },
  'seth-lowell': {
    version: '2.7',
    role: 'Shielder · Anomaly Support',
    targets: ['ATK 2,200–2,600+'],
  },
  'anton-ivanov': {
    version: '2.4',
    role: 'On-Field DPS',
    targets: ['ATK 2,700–3,000+ with an ATK main-stat W-Engine, 2,400–2,700+ otherwise', 'CRIT Rate 60–70%+', 'CRIT DMG 130–170%+'],
  },
  'anby-demara': {
    version: '3.2',
    role: 'Burst Stunner · On-Field Stunner',
    targets: ['CRIT Rate 50%+ (50% maximizes the 4-piece King of the Summit)', 'CRIT DMG 100%+'],
  },
  'pyrois': {
    version: '3.2',
    role: 'On-Field DPS',
    targets: ['ATK 3,200–3,700+', 'CRIT Rate 72%', 'CRIT DMG 120–140%+'],
  },
  'nangong-yu': {
    version: '3.0',
    role: 'Anomaly Stunner · Anomaly Support · Quick-Swap DPS',
    targets: ['ATK 2,000–2,500+', 'Anomaly Proficiency 300–330+'],
  },
  'aria': {
    version: '3.1',
    role: 'On-Field DPS',
    targets: ['ATK 2,500–2,700+ with an ATK main-stat W-Engine, 2,300–2,500+ otherwise', 'Anomaly Proficiency 400–420+ with an Anomaly Proficiency main-stat W-Engine, 330–350+ otherwise'],
  },
  'lucia-elowen': {
    version: '2.8',
    role: 'Rupture Support',
    targets: ['HP 22,000–24,000 (maximizes her teamwide Sheer Force)'],
  },
  'yixuan': {
    version: '2.6',
    role: 'On-Field DPS',
    targets: ['HP 17,000–20,000+ with an HP main-stat W-Engine, 15,000–17,000+ otherwise', 'CRIT Rate 68–88%', 'CRIT DMG 130%+'],
  },
  'vivian-banshee': {
    version: '2.8',
    role: 'Off-Field DPS',
    targets: ['ATK 2,500–2,700+ with an ATK main-stat W-Engine, 2,200–2,400+ otherwise', 'Anomaly Proficiency 430–450+ with an Anomaly Proficiency main-stat W-Engine, 350–370+ otherwise'],
  },
  'astra-yao': {
    version: '3.0',
    role: 'Support',
    targets: ['ATK 3,429 (maximizes her teamwide ATK buffs)'],
  },
  'zhu-yuan': {
    version: '3.2',
    role: 'On-Field DPS',
    targets: ['ATK 2,800–3,300+ with an ATK main-stat W-Engine, 2,700–3,300+ otherwise', 'CRIT Rate 28–70%', 'CRIT DMG 150–200%+'],
  },
  'nicole-demara': {
    version: '2.2',
    role: 'Support',
    targets: ['CRIT Rate 50%+', 'CRIT DMG 100%+', 'Anomaly Proficiency 250+'],
  },
  'roxy-ifrita-pryce': {
    version: '3.2',
    role: 'Off-Field Stunner · Off-Field DPS',
    targets: ['ATK 2,000–2,500+', 'CRIT Rate 76–85%+ (100% in-combat maximizes the teamwide buffs)', 'CRIT DMG 80–100%+'],
  },
  'velina-airgid': {
    version: '3.1',
    role: 'Off-Field DPS',
    targets: ['ATK 2,500–2,700+ with an ATK main-stat W-Engine, 2,200–2,500+ otherwise', 'Anomaly Proficiency 410–430+ with an Anomaly Proficiency main-stat W-Engine, 340–360+ otherwise'],
  },
  'remielle-dan': {
    version: '3.1',
    role: 'Burst DPS · Anomaly Support',
    targets: ['ATK 3,400–3,600+ without the signature W-Engine, 3,800–4,000 with it (maximizes her teamwide ATK buff with 3 Anomaly Agents)', 'Anomaly Proficiency 400–430+'],
  },
};
