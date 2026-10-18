import { BUILDS } from '../data/builds.js';
import { AGENT_BY_ID, BANGBOO_BY_ID, DISC_MAIN_STATS, shortName } from '../data/game.js';
import { normaliseDiscs } from './discs.js';

// Turns a recommended main stat line ("CRIT Rate / CRIT DMG", "Fire DMG > ATK %")
// into the first option's in-game stat name for that slot.
const STAT = [
  [/^crit (rate|rate %)$/i, 'CRIT Rate'],
  [/^crit (dmg|damage|dmg %)$/i, 'CRIT DMG'],
  [/^atk ?%$/i, 'ATK%'],
  [/^hp ?%$/i, 'HP%'],
  [/^def ?%$/i, 'DEF%'],
  [/^pen( ratio| %)?$/i, 'PEN Ratio'],
  [/^(physical|fire|ice|electric|ether|wind) dmg ?%?$/i, 'Attribute DMG'],
  [/^impact ?%?$/i, 'Impact'],
  [/^(energy regen|er)$/i, 'Energy Regen'],
  [/^anomaly mastery$/i, 'Anomaly Mastery'],
  [/^anomaly proficiency$/i, 'Anomaly Proficiency'],
];

export function mainStatFrom(text, slot) {
  const options = (text ?? '').split(/\s*(?:\/|>+|=|,)\s*/).map((s) => s.replace(/\(.*?\)/g, '').trim());
  for (const opt of options) {
    const hit = STAT.find(([re]) => re.test(opt));
    if (hit && DISC_MAIN_STATS[slot].includes(hit[1])) return hit[1];
  }
  return null;
}

/** The recommended gear for an Agent as a loadout, or null if there's no build. */
export function recommendedLoadout(agentId) {
  const b = BUILDS[agentId];
  if (!b) return null;
  const four = b.fourPiece[0] ?? null;
  const two = b.twoPiece.find((s) => s !== four) ?? null;
  const discs = [1, 2, 3, 4, 5, 6].map((slot) => ({
    set: slot <= 4 ? four : two,
    rank: 'S',
    main: slot >= 4 ? mainStatFrom(b.main[slot], slot) : null,
  }));
  return { wEngine: b.wEngines[0] ?? null, refinement: 1, mindscape: 0, discs: normaliseDiscs(discs) };
}

/** A whole recommended team, ready for the teams reducer's `import`. */
export function recommendedTeam(agentId, members) {
  const b = BUILDS[agentId];
  const bangboo = b?.bangboo.find((id) => BANGBOO_BY_ID[id]) ?? null;
  const loadouts = Object.fromEntries(
    members.map((id) => [id, recommendedLoadout(id)]).filter(([, lo]) => lo),
  );
  const name = members.map((id) => shortName(AGENT_BY_ID[id])).join(' · ');
  return { name, members, bangboo, loadouts };
}
