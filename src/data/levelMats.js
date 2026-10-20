// Levelling costs for W-Engines (level 1 → 60), Bangboo (level 1 → 60) and
// Drive Discs (S-rank, +0 → +15). From Icy Veins' leveling guide and W-Engine
// pages (October 2026); see NOTICE.md. Where the game lets you pay with one of
// several tiers of the same EXP item, they're merged into one row with the
// cheaper tiers given as alternatives.
import { SPECIALTY_BY_ID } from './game.js';

const denny = 'Commissions, Combat Simulation, Random Play';
const fmt = (n) => n.toLocaleString('en');

// Promotion components and Denny by W-Engine rank: [tier 1, tier 2, tier 3, Denny].
const W_COMPONENTS = { S: [4, 32, 30, 400000], A: [3, 26, 24, 320000], B: [2, 19, 18, 240000] };

/** Everything to take a W-Engine from level 1 to 60. */
export function wEngineMaterials(w) {
  const c = W_COMPONENTS[w?.rank];
  if (!c) return null;
  const type = SPECIALTY_BY_ID[w.specialty]?.name ?? 'Agent-Type';
  const sim = `Combat Simulation · ${type} Component`;
  const items = [
    { name: `${type} Component`, qty: c[0], source: sim, kind: 'seal' },
    { name: `Reinforced ${type} Component`, qty: c[1], source: sim, kind: 'seal' },
    { name: `Specialized ${type} Component`, qty: c[2], source: sim, kind: 'seal' },
  ];
  // The guide gives the EXP total for S-rank W-Engines only.
  if (w.rank === 'S') {
    items.push({
      name: 'W-Engine Energy Module', qty: 200, kind: 'exp',
      source: `Combat Simulation · Basic Upgrade Materials · or ${fmt(1000)} W-Engine Power Supply, or ${fmt(6000)} W-Engine Battery`,
    });
  }
  items.push({ name: 'Denny', qty: c[3], source: denny, kind: 'denny' });
  return items;
}

/** EXP to take a Bangboo from level 10 to 60 (all tiers give the same total). */
export const BANGBOO_EXP = {
  name: 'Bangboo System Widget', qty: 150, kind: 'exp',
  source: `Hollow Zero, Convenience Store · or ${fmt(750)} Bangboo Algorithm Modules, or ${fmt(4500)} Bangboo Software Patches`,
};

/** EXP to take one S-rank Drive Disc from +0 to +15. */
export const DISC_LEVEL_MATS = [
  {
    name: 'Ether Plating Agent', qty: 24, kind: 'exp',
    source: `Routine Cleanup, Combat Simulation, Convenience Store · or 96 Crystallized Plating Agents, or 480 Molded Plating Agents`,
  },
];

/** Adds up the same item across groups (e.g. Denny). */
export function mergeItems(groups) {
  const out = new Map();
  groups.flat().filter(Boolean).forEach((x) => {
    const cur = out.get(x.name);
    out.set(x.name, cur ? { ...cur, qty: cur.qty + x.qty } : { ...x });
  });
  return [...out.values()];
}
