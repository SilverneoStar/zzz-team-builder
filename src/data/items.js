// Items for the Glossary's Items section, as on the NTE site: every material
// the site tracks, with what it's for, how to get it, and which Agents or
// W-Engines use it. Built from the material data (materials.js, levelMats.js,
// bangbooSkills.js), so it stays in step with the Materials tabs.
import { AGENTS, SPECIALTIES } from './game.js';
import { W_ENGINES } from './wEngines.js';
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
const CHIP_TEST = {
  Shock: 'Current Test', Physical: 'Rigidity Test', Ether: 'Resonance Test', Burn: 'Heating Test',
  Freeze: 'Icing Test', Windbite: 'Gale Test', Lumiflux: 'Light Tuning Test',
};
const CHIP_ATTR = {
  Shock: 'Electric', Physical: 'Physical', Ether: 'Ether', Burn: 'Fire', Freeze: 'Ice', Windbite: 'Wind', Lumiflux: 'Lumiflux',
};
const TIERS = ['Tier 1', 'Tier 2', 'Tier 3'];
const SIM = 'Combat Simulation (spends Battery Charge)';

const released = AGENTS.filter((a) => !a.upcoming || AGENT_MATS[a.id]?.[2]);
const agentsWhere = (fn) => released.filter((a) => AGENT_MATS[a.id] && fn(AGENT_MATS[a.id])).map((a) => ({ kind: 'agent', id: a.id }));

const items = [];
const add = (it) => items.push({ usedBy: [], ...it });

// Promotion seals: one family per specialty, for Agent levels 10 → 60.
SPECIALTIES.forEach((s) => {
  const seal = s.name;
  [`Basic ${seal} Certification Seal`, `Advanced ${seal} Certification Seal`, `${SEAL_TOP[seal]} Certification Seal`].forEach(
    (name, i) =>
      add({
        name,
        group: 'Promotion seals',
        tier: i + 1,
        text: `${TIERS[i]} ${seal} seal. Promotes ${seal} Agents at level breakpoints (10 → 60).`,
        get: [`${SIM} · ${seal} Drill`],
        usedBy: agentsWhere((m) => m[0] === seal),
      }),
  );
});

// Skill chips: one family per attribute, for every skill level.
Object.keys(CHIP_TEST).forEach((chip) => {
  [`Basic ${chip} Chip`, `Advanced ${chip} Chip`, `Specialized ${chip} Chip`].forEach((name, i) =>
    add({
      name,
      group: 'Skill chips',
      tier: i + 1,
      text: `${TIERS[i]} ${chip} chip. Levels the skills of ${CHIP_ATTR[chip]} Agents.`,
      get: [`${SIM} · ${CHIP_TEST[chip]}`],
      usedBy: agentsWhere((m) => m[1] === chip),
    }),
  );
});

// Core Skill drops.
Object.entries(EXPERT).forEach(([hdd, enemy]) =>
  add({
    name: `Higher Dimensional Data: ${hdd}`,
    group: 'Expert Challenge drops',
    text: 'Raises Agents’ Core Skill (A → F), with a Notorious Hunt drop.',
    get: [`Expert Challenge · ${enemy}`],
    usedBy: agentsWhere((m) => m[2] === hdd),
  }),
);
Object.entries(HUNT).forEach(([drop, boss]) =>
  add({
    name: drop,
    group: 'Notorious Hunt drops',
    text: 'Raises Agents’ Core Skill (A → F), with Higher Dimensional Data. Weekly boss drop.',
    get: [`Notorious Hunt · ${boss} (weekly)`],
    usedBy: agentsWhere((m) => m[3] === drop),
  }),
);
add({
  name: 'Hamster Cage Pass',
  group: 'Notorious Hunt drops',
  text: 'Needed to take a skill from level 11 to 12.',
  get: ['Events', 'New Eridu City Fund'],
});

// W-Engine promotion components: one family per W-Engine type.
SPECIALTIES.forEach((s) => {
  const type = s.name;
  [`${type} Component`, `Reinforced ${type} Component`, `Specialized ${type} Component`].forEach((name, i) =>
    add({
      name,
      group: 'W-Engine components',
      tier: i + 1,
      text: `${TIERS[i]} ${type} component. Promotes ${type} W-Engines at level breakpoints (10 → 60).`,
      get: [`${SIM} · ${type} Component`],
      usedBy: W_ENGINES.filter((w) => w.specialty === s.id && !w.upcoming).map((w) => ({ kind: 'w', id: w.id, name: w.name })),
    }),
  );
});

// EXP and upgrade materials.
[
  ['Trainee Investigator Log', 'Agent EXP, smallest.', 1],
  ['Official Investigator Log', 'Agent EXP, medium.', 2],
  ['Senior Investigator Log', 'Agent EXP, largest.', 3],
].forEach(([name, text, tier]) =>
  add({ name, group: 'EXP and upgrades', tier, text, get: [`${SIM} · Basic Upgrade Materials`] }),
);
[
  ['W-Engine Battery', 'W-Engine EXP, smallest.', 1],
  ['W-Engine Power Supply', 'W-Engine EXP, medium.', 2],
  ['W-Engine Energy Module', 'W-Engine EXP, largest.', 3],
].forEach(([name, text, tier]) =>
  add({ name, group: 'EXP and upgrades', tier, text, get: [`${SIM} · Basic Upgrade Materials`] }),
);
[
  ['Molded Plating Agent', 'Drive Disc EXP, smallest.', 1],
  ['Crystallized Plating Agent', 'Drive Disc EXP, medium.', 2],
  ['Ether Plating Agent', 'Drive Disc EXP, largest.', 3],
].forEach(([name, text, tier]) =>
  add({ name, group: 'EXP and upgrades', tier, text, get: ['Routine Cleanup', 'Combat Simulation', 'Convenience Store'] }),
);

// Bangboo.
[
  ['Bangboo Software Patch', 'Bangboo EXP, smallest.', 1],
  ['Bangboo Algorithm Module', 'Bangboo EXP, medium.', 2],
  ['Bangboo System Widget', 'Bangboo EXP, largest.', 3],
].forEach(([name, text, tier]) =>
  add({ name, group: 'Bangboo materials', tier, text, get: ['Hollow Zero', 'Convenience Store'] }),
);
BANGBOO_MATS.filter((m) => m.kind !== 'denny').forEach((m, i) =>
  add({
    name: m.name,
    group: 'Bangboo materials',
    tier: i + 1,
    text: `${TIERS[i]} Bangboo promotion material, for raising any Bangboo to level 60.`,
    get: m.source.split(', '),
  }),
);

// Currency.
add({
  name: 'Denny',
  group: 'Currency',
  text: 'New Eridu’s money. Spent on every upgrade: Agent, skill, Core Skill, W-Engine, Bangboo and Drive Disc levels.',
  get: ['Commissions', 'Combat Simulation', 'Random Play'],
});

export const ITEMS = items;
