// Each Agent's role and the in-combat stat targets to build towards.
// From the community ZZZ Agent Build Guide (Google Sheets), see NOTICE.md.
// `version` is the game version that guide entry was last updated for.
export const GUIDE_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTj2PaPq6Py_1B5fsOPj_Moc-tN_7mut7fICczI6lz1njyEIAInTnfB7lAraX4pYCRGNbaHGlIbFZ90/pubhtml';

export const STAT_TARGETS = {
  'claret-flint': {
    version: '3.2',
    role: 'On-Field DPS',
    targets: ['DEF 2,200–2,400+', 'CRIT Rate 120%+'],
    note: 'CRIT Rate caps at 200% in combat; Armorer Agents roll for CRIT twice, once up to 100% and again from 100–200%.',
  },
  cissia: {
    version: '3.0',
    role: 'Quick-Swap DPS',
    targets: ['ATK 2,700–3,200+ with an ATK main-stat W-Engine, 2,200–2,700+ otherwise', 'CRIT Rate 57–82%', 'CRIT DMG 110%+'],
  },
  seed: {
    version: '3.0',
    role: 'Quick-Swap DPS',
    targets: ['ATK 2,800–3,000+ with an ATK main-stat W-Engine, 2,500–2,700+ otherwise', 'CRIT Rate 60–100%', 'CRIT DMG 120%+'],
  },
};
