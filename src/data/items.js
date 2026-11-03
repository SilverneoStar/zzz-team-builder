// Items for the Glossary's Items section, as on the NTE site: every material
// the site tracks, with what it's for, how to get it, and who uses it. Items
// that do the same job in tiers (a seal family, a chip family, EXP items) share
// one card. Families tied to a specialty or attribute say so instead of
// listing every Agent; one-off drops list the Agents who use them. Built from
// the material data (materials.js, levelMats.js, bangbooSkills.js), so it stays
// in step with the Materials tabs.
import { AGENTS, SPECIALTIES } from './game.js';
import { AGENT_MATS, EXPERT, HUNT } from './materials.js';
import { BANGBOO_MATS } from './bangbooSkills.js';

export const ITEM_GROUPS = [
  'Promotion seals',
  'Skill chips',
  'Expert Challenge drops',
  'Notorious Hunt drops',
  'W-Engine components',
  'EXP and upgrades',
  'Bangboo materials',
  'Currency',
];

const SEAL_TOP = {
  Attack: "Pioneer's", Stun: 'Buster', Anomaly: 'Controller', Support: 'Ruler',
  Defense: 'Defender', Rupture: 'Arbiter', Armorer: 'Bladebearer',
};
// Skill chip family → [Combat Simulation test, attribute id].
const CHIPS = {
  Shock: ['Current Test', 'electric'], Physical: ['Rigidity Test', 'physical'], Ether: ['Resonance Test', 'ether'],
  Burn: ['Heating Test', 'fire'], Freeze: ['Icing Test', 'ice'], Windbite: ['Gale Test', 'wind'],
  Lumiflux: ['Light Tuning Test', 'lumiflux'],
};
const SIM = 'Combat Simulation (spends Battery Charge)';

const released = AGENTS.filter((a) => !a.upcoming || AGENT_MATS[a.id]?.[2]);
const agentsWhere = (fn) => released.filter((a) => AGENT_MATS[a.id] && fn(AGENT_MATS[a.id])).map((a) => a.id);

const items = [];
// Each item: { name, names (tiers, lowest first), group, text, get, for?, agents? }
// `for` is { specialty } or { attribute } (who the family is for); `agents` lists users.
const add = (it) => items.push({ names: [it.name], agents: [], ...it });

SPECIALTIES.forEach((s) => {
  add({
    name: `${s.name} Certification Seals`,
    names: [`Basic ${s.name} Certification Seal`, `Advanced ${s.name} Certification Seal`, `${SEAL_TOP[s.name]} Certification Seal`],
    group: 'Promotion seals',
    text: `Promote ${s.name} Agents at their level breakpoints (10 → 60), from Basic to ${SEAL_TOP[s.name]}.`,
    get: [`${SIM} · ${s.name} Drill`],
    for: { specialty: s.id },
  });
  add({
    name: `${s.name} Components`,
    names: [`${s.name} Component`, `Reinforced ${s.name} Component`, `Specialized ${s.name} Component`],
    group: 'W-Engine components',
    text: `Promote ${s.name} W-Engines at their level breakpoints (10 → 60).`,
    get: [`${SIM} · ${s.name} Component`],
    for: { specialty: s.id, wEngines: true },
  });
});

Object.entries(CHIPS).forEach(([chip, [test, attr]]) =>
  add({
    name: `${chip} Chips`,
    names: [`Basic ${chip} Chip`, `Advanced ${chip} Chip`, `Specialized ${chip} Chip`],
    group: 'Skill chips',
    text: 'Level the skills of Agents of this attribute.',
    get: [`${SIM} · ${test}`],
    for: { attribute: attr },
  }),
);

// Core Skill drops: each one goes to a few named Agents.
Object.entries(EXPERT).forEach(([hdd, enemy]) =>
  add({
    name: `Higher Dimensional Data: ${hdd}`,
    group: 'Expert Challenge drops',
    text: 'Raises Agents’ Core Skill (A → F), with a Notorious Hunt drop.',
    get: [`Expert Challenge · ${enemy}`],
    agents: agentsWhere((m) => m[2] === hdd),
  }),
);
Object.entries(HUNT).forEach(([drop, boss]) =>
  add({
    name: drop,
    group: 'Notorious Hunt drops',
    text: 'Raises Agents’ Core Skill (A → F), with Higher Dimensional Data. Weekly boss drop.',
    get: [`Notorious Hunt · ${boss} (weekly)`],
    agents: agentsWhere((m) => m[3] === drop),
  }),
);
add({
  name: 'Hamster Cage Pass',
  group: 'Notorious Hunt drops',
  text: 'Needed to take any skill from level 11 to 12.',
  get: ['Events', 'New Eridu City Fund'],
});

// EXP: three sizes of the same item, smallest first.
[
  ['Investigator Logs', ['Trainee Investigator Log', 'Official Investigator Log', 'Senior Investigator Log'], 'Agent EXP.', [`${SIM} · Basic Upgrade Materials`]],
  ['W-Engine EXP', ['W-Engine Battery', 'W-Engine Power Supply', 'W-Engine Energy Module'], 'W-Engine EXP.', [`${SIM} · Basic Upgrade Materials`]],
  ['Plating Agents', ['Molded Plating Agent', 'Crystallized Plating Agent', 'Ether Plating Agent'], 'Drive Disc EXP.', ['Routine Cleanup', 'Combat Simulation', 'Convenience Store']],
].forEach(([name, names, text, get]) => add({ name, names, group: 'EXP and upgrades', text, get }));

add({
  name: 'Bangboo EXP',
  names: ['Bangboo Software Patch', 'Bangboo Algorithm Module', 'Bangboo System Widget'],
  group: 'Bangboo materials',
  text: 'Bangboo EXP, smallest to largest.',
  get: ['Hollow Zero', 'Convenience Store'],
});
add({
  name: 'Bangboo promotion materials',
  names: BANGBOO_MATS.filter((m) => m.kind !== 'denny').map((m) => m.name),
  group: 'Bangboo materials',
  text: 'Promote any Bangboo at its level breakpoints (10 → 60).',
  get: ['Hollow Zero', 'Convenience Store', 'Bangbuck Exchange', 'Crafting'],
});

add({
  name: 'Denny',
  group: 'Currency',
  text: 'New Eridu’s money. Spent on every upgrade: Agent, skill, Core Skill, W-Engine, Bangboo and Drive Disc levels.',
  get: ['Commissions', 'Combat Simulation', 'Random Play'],
});

export const ITEMS = items;
