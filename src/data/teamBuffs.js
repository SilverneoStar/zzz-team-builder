// Buffs an Agent gives squadmates that only pay off for certain kinds of
// damage, used by the synergy score (lib/synergy.js). Each entry: the Agent
// who gives it, what kind of damage it boosts, a short line for the breakdown,
// and which squadmates it helps.
//
// `to` picks the squadmates who benefit:
//   specialties  their specialty is one of these
//   attributes   their (base) attribute is one of these
//   notRupture   Rupture Agents excluded: their Sheer DMG already ignores DEF,
//                so PEN and DEF-ignore buffs do nothing for them
//   others       the giver doesn't count as their own beneficiary
// `beta` marks buffs from beta kits (hidden with beta info).
//
// Compiled from the Agents' skill summaries in data/skills/; see NOTICE.md.

const DEALERS = ['attack', 'anomaly', 'armorer'];

export const BUFF_KINDS = {
  pen: 'PEN / DEF ignore',
  sheer: 'Sheer DMG',
  sharp: 'Sharp DMG',
  chain: 'Chain Attack',
  anomaly: 'Anomaly DMG',
  element: 'Attribute DMG',
  res: 'RES reduction',
  general: 'Squad ATK / DMG',
};

export const TEAM_BUFFS = [
  // PEN Ratio and DEF ignore: everyone but Rupture Agents.
  { agent: 'alexandrina-sebastiane', kind: 'pen', text: 'raises the squad’s PEN Ratio', to: { specialties: DEALERS, notRupture: true } },
  { agent: 'burnice-white', kind: 'pen', text: 'Thermal Penetration adds squad PEN Ratio', to: { specialties: DEALERS, notRupture: true, others: true } },
  { agent: 'cissia', kind: 'pen', text: 'makes the squad’s Electric DMG ignore DEF', to: { specialties: DEALERS, attributes: ['electric'], notRupture: true, others: true } },
  { agent: 'jane-doe', kind: 'pen', text: 'squad Assaults on Gnawed enemies ignore DEF', to: { specialties: ['anomaly'], attributes: ['physical'], others: true } },
  { agent: 'remielle-dan', kind: 'pen', text: 'Anomaly DMG ignores DEF on Prismatic enemies', to: { specialties: ['anomaly'], others: true } },
  { agent: 'promeia', kind: 'pen', text: 'squad Abloom ignores DEF', to: { specialties: ['anomaly'], others: true } },

  // Sheer DMG and Sheer Force: Rupture Agents.
  { agent: 'lucia-elowen', kind: 'sheer', text: 'Darkbreaker gives Sheer Force and Sheer DMG', to: { specialties: ['rupture'] } },
  { agent: 'pan-yinhu', kind: 'sheer', text: 'Meridian Flow gives the next Agent Sheer Force', to: { specialties: ['rupture'] } },
  { agent: 'dialyn', kind: 'sheer', text: 'Rock, Scissors and Paper! adds DMG from a Rupture or Attack Agent', to: { specialties: ['rupture', 'attack'] } },

  // Sharp DMG and Laceration: Armorer Agents.
  { agent: 'claret-flint', kind: 'sharp', text: 'Remnant Edge: Armorer Agents get Laceration DMG on any Maim', to: { specialties: ['armorer'], others: true } },
  { agent: 'roxy-ifrita-pryce', kind: 'sharp', text: 'raises Armorer Agents’ Laceration DMG', to: { specialties: ['armorer'] } },
  { agent: 'sunbringer', kind: 'sharp', text: 'Laceration Enhance for Armorer Agents', to: { specialties: ['armorer'], others: true }, beta: true },
  { agent: 'robin-hsr', kind: 'sharp', text: 'raises the squad’s Laceration DMG (M1)', to: { specialties: ['armorer'] }, beta: true },

  // Chain Attacks and Ultimates.
  { agent: 'ju-fufu', kind: 'chain', text: 'Tiger’s Roar: Chain and Ultimate DMG, more Decibels', to: { specialties: ['attack', 'rupture'] } },

  // Anomaly teams.
  { agent: 'phoenix-reffaella', kind: 'anomaly', text: 'lets the squad’s Anomaly and Abloom DMG crit (not Disorder)', to: { specialties: ['anomaly'], others: true } },
  { agent: 'velina-airgid', kind: 'anomaly', text: 'Vortex and Abloom add Wind Anomaly DMG and lower Anomaly Buildup RES', to: { specialties: ['anomaly'], others: true } },
  { agent: 'remielle-dan', kind: 'anomaly', text: 'stronger with every Anomaly Agent in the squad', to: { specialties: ['anomaly'], others: true } },

  // Lower enemy RES to an attribute (or its Anomaly Buildup RES).
  { agent: 'von-lycaon', kind: 'res', text: 'lowers enemy Ice RES by 25%', to: { specialties: DEALERS.concat('rupture'), attributes: ['ice'], others: true } },
  { agent: 'lighter', kind: 'res', text: 'lowers enemy Fire and Ice RES by 15%', to: { specialties: DEALERS.concat('rupture'), attributes: ['fire', 'ice'], others: true } },
  { agent: 'seth-lowell', kind: 'res', text: 'lowers enemy Anomaly Buildup RES to every attribute', to: { specialties: ['anomaly'], others: true } },

  // Attribute DMG for certain elements.
  { agent: 'lighter', kind: 'element', text: 'Elation raises Fire and Ice DMG (refreshed by Chain Attacks)', to: { specialties: DEALERS.concat('rupture'), attributes: ['fire', 'ice'] } },
  { agent: 'soukaku', kind: 'element', text: 'Fly the Flag raises the squad’s Ice DMG', to: { specialties: DEALERS.concat('rupture'), attributes: ['ice'], others: true } },

  // General squad ATK / DMG buffs: help any damage dealer. Only one of these
  // counts towards the score, since they overlap.
  ...[
    ['astra-yao', 'raises squad DMG, CRIT DMG and ATK on swaps'],
    ['ukinami-yuzuha', 'Tanuki Wish: squad ATK and DMG'],
    ['nicole-demara', 'lowers enemy DEF and raises Ether DMG'],
    ['dialyn', 'Overwhelmingly Positive: squad DMG +40%'],
    ['norma-hollowell', 'En-Nah Barrage: squad DMG +20%'],
    ['nangong-yu', 'squad DMG and an Ether Veil with ATK'],
    ['piper-wheel', 'squad DMG +18% at 20 Power'],
    ['zhao', 'squad DMG inside an Ether Veil'],
    ['lucia-elowen', 'Dreamer’s Nursery Rhyme: squad DMG'],
    ['caesar-king', 'enemies take more DMG from the squad'],
    ['sunna', 'Ether Veil with squad ATK'],
    ['aria', 'Ether Veil with squad ATK'],
    ['luciana-de-montefio', 'Cheer On!: squad ATK'],
    ['orphie-magnusson-and-magus', 'Zeroed In: squad ATK'],
    ['remielle-dan', 'squad ATK with Anomaly Agents'],
  ].map(([agent, text]) => ({ agent, kind: 'general', text, to: { specialties: DEALERS.concat('rupture'), others: true } })),
];

// Gear that buffs the whole squad: 4-piece Drive Disc sets and W-Engine
// passives. `when` says who must wear it for the squad buff to work (a
// W-Engine's passive also needs a matching specialty, checked in synergy.js).
// Same-name effects don't stack, so each counts once per squad.
const any = () => true;
const isAttr = (...attrs) => (a, base) => attrs.includes(base(a.attribute));
const isSpec = (spec) => (a) => a.specialty === spec;

export const GEAR_BUFFS = {
  discs: {
    'king-of-the-summit': { text: 'squad CRIT DMG on EX and Chain Attacks', when: isSpec('stun') },
    'moonlight-lullaby': { text: 'squad DMG +18% on EX and Ultimates', when: isSpec('support') },
    'bunny-in-wonderland': { text: 'squad DMG on EX and Defensive or Evasive Assists', when: isSpec('defense') },
    'astral-voice': { text: 'Astral: DMG for whoever comes in by Quick Assist', when: any },
    'swing-jazz': { text: 'squad DMG +15% after Chain Attacks and Ultimates', when: any },
    'proto-punk': { text: 'squad DMG +15% after Defensive or Evasive Assists', when: any },
  },
  wEngines: {
    'reverb-mark-i': { text: 'squad Impact on EX', when: any },
    'reverb-mark-ii': { text: 'squad Anomaly Mastery and Proficiency', when: any },
    'reverb-mark-iii': { text: 'squad ATK after Chain Attacks and Ultimates', when: any },
    'bashful-demon': { text: 'squad ATK on EX', when: any },
    'kaboom-the-cannon': { text: 'squad ATK when anyone hits', when: any },
    'tusks-of-fury': { text: 'squad DMG and Daze on Interrupts and Perfect Dodges', when: any },
    'ice-jade-teapot': { text: 'squad DMG +20% at 15 Tea-riffic stacks', when: any },
    'elegant-vanity': { text: 'squad DMG +10% when spending Energy', when: any },
    'half-sugar-bunny': { text: 'squad ATK, Max HP and CRIT DMG with Ether Veils', when: any },
    'roaring-fur-nace': { text: 'squad DMG on Fire Chain Attacks and Ultimates', when: isAttr('fire') },
    'metanukimorphosis': { text: 'squad Anomaly Proficiency on Aftershocks', when: any },
    'dreamlit-hearth': { text: 'squad DMG and Max HP with Ether Veils', when: any },
    'yesterday-calls': { text: 'squad CRIT DMG +30% from Physical EX hits', when: isAttr('physical') },
    'thoughtbop': { text: 'squad DMG and ATK from Physical EX', when: isAttr('physical') },
    'neon-fantasies': { text: 'squad DMG from Ether EX and Basic Attacks', when: isAttr('ether') },
    'joyau-dore': { text: 'squad Anomaly Proficiency from Wind EX', when: isAttr('wind') },
    'chief-sidekick': { text: 'squad DMG from Fire EX', when: isAttr('fire') },
    'ode-of-resurrected-wings': { text: 'squad DMG +30% on Refringe', when: any },
    'crimson-moon-casket': { text: 'squad DMG +20% from Wind EX', when: isAttr('wind') },
    'blazing-laurel': { text: 'CRIT DMG of the squad’s Ice and Fire hits', when: any },
    'robin-hsr-signature': { text: 'squad DEF on shields, DMG on Aftershocks', when: any, beta: true },
  },
};
