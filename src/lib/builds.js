import { UPCOMING } from '../data/upcoming.js';
import { BUILDS } from '../data/builds.js';
import { AGENT_BY_ID, BANGBOO_BY_ID, DISC_MAIN_STATS, shortName, signatureOf } from '../data/game.js';
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
  const bangboo = (b?.bangboo ?? UPCOMING[agentId]?.bangboo ?? []).find((id) => BANGBOO_BY_ID[id]) ?? null;
  const loadouts = Object.fromEntries(members.map((id) => [id, recommendedLoadout(id)]).filter(([, lo]) => lo));
  const name = members.map((id) => shortName(AGENT_BY_ID[id])).join(' · ');
  return { name, members, bangboo, loadouts };
}

/**
 * What the site recommends for one Agent, for the team builder's gear panel:
 * W-Engines (best first), 4-piece and 2-piece sets, and the main stat for
 * slots 4 to 6. Uses the full build when there is one, otherwise the estimate
 * for an upcoming Agent (marked `estimate`). Null when nothing is known.
 */
export function recommendationFor(agentId) {
  const b = BUILDS[agentId];
  const u = UPCOMING[agentId];
  const sig = signatureOf(agentId);
  const src = b
    ? { wEngines: b.wEngines, four: b.fourPiece, two: b.twoPiece, main: b.main, estimate: false }
    : u?.trial || u?.engines
      ? {
          wEngines: u.engines ?? [],
          four: u.trial?.fourPiece ?? [],
          two: u.trial?.twoPiece ?? [],
          main: u.trial?.main ?? {},
          estimate: !u.confirmed,
          beta: Boolean(u.beta),
        }
      : null;
  if (!src && !sig) return null;
  const wEngines = [
    ...new Set([...(sig && !src?.wEngines?.includes(sig.id) ? [sig.id] : []), ...(src?.wEngines ?? [])]),
  ];
  const four = src?.four?.[0] ?? null;
  const two = (src?.two ?? []).find((s) => s !== four) ?? null;
  const main = Object.fromEntries([4, 5, 6].map((n) => [n, mainStatFrom(src?.main?.[n], n)]));
  return {
    wEngines,
    best: wEngines[0] ?? null,
    signature: sig?.id ?? null,
    fours: src?.four ?? [],
    twos: src?.two ?? [],
    four,
    two,
    main,
    hasMain: Object.values(main).some(Boolean),
    estimate: src?.estimate ?? false,
    beta: src?.beta ?? false,
  };
}
