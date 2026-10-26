// Lookups and labels built on the raw lists in agents.js, wEngines.js,
// driveDiscs.js and bangboo.js. UI code imports from here.
import { AGENTS } from './agents.js';
import { W_ENGINES } from './wEngines.js';
import { DRIVE_DISC_SETS } from './driveDiscs.js';
import { BANGBOO } from './bangboo.js';

export { AGENTS, W_ENGINES, DRIVE_DISC_SETS, BANGBOO };

export const DATA_VERSION = '3.2';
export const TEAM_SIZE = 3;

// Attribute colours are matched to the in-game attribute icons.
// Variant attributes (Frost, Honed Edge, Auric Ink) count as their base
// attribute for team matching.
export const ATTRIBUTES = [
  { id: 'physical', name: 'Physical', color: '#f0b400' },
  { id: 'honed-edge', name: 'Honed Edge', color: '#f2cf5a', base: 'physical' },
  { id: 'fire', name: 'Fire', color: '#f04a1a' },
  { id: 'ice', name: 'Ice', color: '#3cd8d8' },
  { id: 'frost', name: 'Frost', color: '#8fe6ee', base: 'ice' },
  // Sunbringer's own blue Fire as a Void Hunter. The name is from the beta.
  { id: 'sunbringer-fire', name: 'Genesis Flare', color: '#3f6fe0', base: 'fire', beta: true },
  { id: 'electric', name: 'Electric', color: '#1e8ef0' },
  { id: 'ether', name: 'Ether', color: '#a956d8' },
  { id: 'auric-ink', name: 'Auric Ink', color: '#c99a3f', base: 'ether' },
  { id: 'wind', name: 'Wind', color: '#7fb0ec' },
  { id: 'lumiflux', name: 'Lumiflux', color: '#f0b0dc' },
];
export const ATTRIBUTE_BY_ID = Object.fromEntries(ATTRIBUTES.map((a) => [a.id, a]));
export const baseAttribute = (id) => ATTRIBUTE_BY_ID[id]?.base ?? id;
// Filter chips show base attributes only; variants are matched to their base.
export const BASE_ATTRIBUTES = ATTRIBUTES.filter((a) => !a.base);

export const SPECIALTIES = [
  { id: 'attack', name: 'Attack' },
  { id: 'stun', name: 'Stun' },
  { id: 'anomaly', name: 'Anomaly' },
  { id: 'support', name: 'Support' },
  { id: 'defense', name: 'Defense' },
  { id: 'rupture', name: 'Rupture' },
  { id: 'armorer', name: 'Armorer' },
];
export const SPECIALTY_BY_ID = Object.fromEntries(SPECIALTIES.map((s) => [s.id, s]));
export const DAMAGE_SPECIALTIES = ['attack', 'anomaly', 'rupture'];

export const AGENT_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));
export const W_ENGINE_BY_ID = Object.fromEntries(W_ENGINES.map((w) => [w.id, w]));
export const DRIVE_DISC_BY_ID = Object.fromEntries(DRIVE_DISC_SETS.map((d) => [d.id, d]));
export const BANGBOO_BY_ID = Object.fromEntries(BANGBOO.map((b) => [b.id, b]));

export const FACTIONS = [...new Set(AGENTS.map((a) => a.faction))].sort();

export const signatureOf = (agentId) => W_ENGINES.find((w) => w.signatureOf === agentId) ?? null;

/** W-Engines an Agent can make full use of: same specialty, best rank first. */
export function wEnginesFor(agent) {
  const order = { S: 0, A: 1, B: 2 };
  return W_ENGINES.filter((w) => w.specialty === agent.specialty).sort(
    (a, b) =>
      (b.signatureOf === agent.id) - (a.signatureOf === agent.id) ||
      order[a.rank] - order[b.rank] ||
      a.name.localeCompare(b.name),
  );
}

// Drive Disc main stats by slot (slots 1–3 are fixed flat stats).
export const DISC_MAIN_STATS = {
  4: ['HP%', 'ATK%', 'DEF%', 'CRIT Rate', 'CRIT DMG', 'Anomaly Proficiency'],
  5: ['HP%', 'ATK%', 'DEF%', 'PEN Ratio', 'Attribute DMG'],
  6: ['HP%', 'ATK%', 'DEF%', 'Anomaly Mastery', 'Impact', 'Energy Regen'],
};
// Highest S-rank main stat at level 15.
export const DISC_MAIN_MAX = {
  'HP%': '30%', 'ATK%': '30%', 'DEF%': '48%', 'CRIT Rate': '24%', 'CRIT DMG': '48%',
  'Anomaly Proficiency': '92', 'PEN Ratio': '24%', 'Attribute DMG': '30%',
  'Anomaly Mastery': '30%', 'Impact': '18%', 'Energy Regen': '60%',
};
export const DISC_FIXED = [
  { slot: 1, stat: 'HP', max: '2,200' },
  { slot: 2, stat: 'ATK', max: '316' },
  { slot: 3, stat: 'DEF', max: '184' },
];

export const MAX_MINDSCAPE = 6;
export const MAX_REFINEMENT = 5;

// The short names the game shows on Agent cards (e.g. "Lycaon", "Rina").
// Most are the first word of the full name; these are the exceptions.
const SHORT_NAMES = {
  'alexandrina-sebastiane': 'Rina',
  'asaba-harumasa': 'Harumasa',
  'hoshimi-miyabi': 'Miyabi',
  'tsukishiro-yanagi': 'Yanagi',
  'ukinami-yuzuha': 'Yuzuha',
  'komano-manato': 'Manato',
  'nekomiya-mana': 'Nekomata',
  'luciana-de-montefio': 'Lucy',
  'von-lycaon': 'Lycaon',
  'ju-fufu': 'Ju Fufu',
  'nangong-yu': 'Nangong Yu',
  'pan-yinhu': 'Pan Yinhu',
  'ye-shunguang': 'Ye Shunguang',
  'zhu-yuan': 'Zhu Yuan',
  'orphie-magnusson-and-magus': 'Orphie',
  'soldier-0-anby': 'S0 Anby',
  'soldier-11': 'Soldier 11',
  'starlight-billy-kid': 'Starlight Billy',
};
export const shortName = (agent) => SHORT_NAMES[agent.id] ?? agent.name.split(' ')[0];

export const initials = (name) =>
  name
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
