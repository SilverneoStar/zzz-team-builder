// Team synergy score: one number (0–100) and a rank letter for how well a
// squad fits together, with the reasons behind it. It's a guide to team
// building, not a damage calculator: investment, rotations and skill matter
// more in a real fight. Shown by Cortado in the team builder's Synergy panel.
//
// Points (100 in total):
//   Additional Abilities  40  share of members whose ability is on
//   Roles                 25  a damage dealer, plus Stun and Support/Defense
//                             (a full Anomaly team needs neither)
//   Kit links             15  Ether Veil, Aftershock, Anomaly Disorder pairs
//   Known team            10  the squad (or its core pair) is a recommended team
//   Bangboo                10  its Additional Ability is on, or it's recommended
import { AGENT_BY_ID, BANGBOO_BY_ID, DAMAGE_SPECIALTIES, baseAttribute } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { PRESETS } from '../data/presets.js';
import { BANGBOO_SKILLS, needMet } from '../data/bangbooSkills.js';
import { kitLinks, passiveStatus } from './analyze.js';

/** Rank letters from best to worst, with the lowest score for each. */
export const SYNERGY_RANKS = [
  { rank: 'S+', min: 90 },
  { rank: 'S', min: 75 },
  { rank: 'A', min: 60 },
  { rank: 'B', min: 40 },
  { rank: 'C', min: 0 },
];

// Every recommended trio, as sorted keys, for the "known team" check.
const KNOWN_TEAMS = new Set(
  [...Object.values(BUILDS).flatMap((b) => b.teams), ...PRESETS.map((p) => p.members)]
    .filter((t) => t.filter(Boolean).length === 3)
    .map((t) => [...t].sort().join('|')),
);
// Pairs that appear together in a recommended team.
const KNOWN_PAIRS = new Set(
  Object.values(BUILDS).flatMap((b) =>
    b.teams.flatMap((t) => t.flatMap((x, i) => t.slice(i + 1).map((y) => [x, y].sort().join('|')))),
  ),
);

const round = (n) => Math.round(n * 10) / 10;

// Agents whose kit grows stronger with each Anomaly Agent in the squad, so a
// full Anomaly team (for example Aria, Velina and Remielle) needs no Stun or
// Support Agent to be among the strongest teams.
const ANOMALY_SCALERS = ['remielle-dan'];

/**
 * Scores a squad. Returns { score, rank, parts, filled } where each part is
 * { id, label, points, max, detail }. Partial squads are scored too, but most
 * parts need all three Agents to reach full marks.
 */
export function synergyScore(memberIds, bangbooId) {
  const ids = memberIds.filter(Boolean);
  const squad = ids.map((id) => AGENT_BY_ID[id]).filter(Boolean);
  const parts = [];

  // Additional Abilities: the biggest single factor in ZZZ team building.
  const ps = passiveStatus(ids);
  const known = Object.values(ps.byId).filter((v) => v.known);
  const on = known.filter((v) => v.active);
  const abilityPts = squad.length ? (known.length ? (on.length / 3) * 40 : 20 * (squad.length / 3)) : 0;
  parts.push({
    id: 'abilities',
    label: 'Additional Abilities',
    points: round(abilityPts),
    max: 40,
    detail: known.length
      ? `${on.length} of ${known.length} on${known.length < squad.length ? ' (some not revealed yet)' : ''}`
      : 'Not revealed yet',
  });

  // Roles: someone to deal damage, someone to Stun, someone to buff or protect.
  const has = (list) => squad.some((a) => list.includes(a.specialty));
  const dealers = squad.filter((a) => DAMAGE_SPECIALTIES.includes(a.specialty));
  const anomalyCount = squad.filter((a) => a.specialty === 'anomaly').length;
  let rolePts = 0;
  const roleBits = [];
  if (dealers.length) {
    rolePts += 10;
    roleBits.push('damage dealer');
  }
  const fullAnomaly = anomalyCount === 3;
  if (fullAnomaly) {
    // Three Anomaly Agents build and trigger Anomalies on their own: Stun and
    // Support aren't needed, so the squad gets full role marks.
    rolePts = 25;
    roleBits.push('full Anomaly team (no Stun or Support needed)');
  }
  // Two Anomaly Agents can carry a team without a Stun Agent.
  else if (has(['stun']) || anomalyCount >= 2) {
    rolePts += 8;
    roleBits.push(has(['stun']) ? 'Stun' : 'Anomaly pair');
  }
  if (!fullAnomaly && has(['support', 'defense'])) {
    rolePts += 7;
    roleBits.push('Support/Defense');
  }
  // Three main damage dealers fight over field time.
  if (dealers.length === 3 && anomalyCount < 3) {
    rolePts -= 5;
    roleBits.push('three damage dealers (−5)');
  }
  parts.push({
    id: 'roles',
    label: 'Roles',
    points: Math.max(0, rolePts),
    max: 25,
    detail: roleBits.length ? roleBits.join(', ') : 'No clear roles yet',
  });

  // Kit links and Disorder.
  const links = kitLinks(ids);
  const anomalyAttrs = new Set(squad.filter((a) => a.specialty === 'anomaly').map((a) => baseAttribute(a.attribute)));
  const kitBits = links.map((l) => l.name);
  let kitPts = links.length * 7.5;
  if (anomalyAttrs.size >= 2) {
    kitPts += 7.5;
    kitBits.push('Disorder');
  }
  const scaler = squad.find((a) => ANOMALY_SCALERS.includes(a.id));
  if (scaler && anomalyCount >= 2) {
    kitPts += anomalyCount === 3 ? 7.5 : 4;
    kitBits.push(`${scaler.name.split(' ')[0]} stacks with ${anomalyCount} Anomaly Agents`);
  }
  parts.push({
    id: 'kit',
    label: 'Kit links',
    points: Math.min(15, kitPts),
    max: 15,
    detail: kitBits.length ? kitBits.join(', ') : 'None in this squad',
  });

  // Known team: a full recommended trio, or at least a recommended pair.
  const key = [...ids].sort().join('|');
  const pairs = ids.flatMap((x, i) => ids.slice(i + 1).map((y) => [x, y].sort().join('|')));
  const knownPairs = pairs.filter((p) => KNOWN_PAIRS.has(p)).length;
  const knownPts = ids.length === 3 && KNOWN_TEAMS.has(key) ? 10 : Math.min(6, knownPairs * 3);
  parts.push({
    id: 'known',
    label: 'Known team',
    points: knownPts,
    max: 10,
    detail:
      knownPts === 10
        ? 'A recommended team'
        : knownPairs
          ? `${knownPairs} recommended pair${knownPairs > 1 ? 's' : ''}`
          : 'Not a recommended pairing',
  });

  // Bangboo: its own Additional Ability on, or recommended for a member.
  const bangboo = bangbooId && BANGBOO_BY_ID[bangbooId];
  let bbPts = 0;
  let bbDetail = 'No Bangboo';
  if (bangboo) {
    const need = BANGBOO_SKILLS[bangboo.id]?.ability?.[1];
    const met = need && squad.length ? needMet(need, squad, baseAttribute) : null;
    const recommended = ids.some((id) => BUILDS[id]?.bangboo.includes(bangboo.id));
    bbPts = (met ? 7 : 0) + (recommended ? 3 : 0);
    if (met === null && recommended) bbPts = 10;
    bbDetail =
      [met ? 'ability on' : met === false ? 'ability off' : null, recommended ? 'recommended' : null]
        .filter(Boolean)
        .join(', ') || 'no bonus here';
  }
  parts.push({ id: 'bangboo', label: 'Bangboo', points: bbPts, max: 10, detail: bbDetail });

  const score = Math.round(parts.reduce((n, p) => n + p.points, 0));
  const rank = SYNERGY_RANKS.find((r) => score >= r.min).rank;
  return { score, rank, parts, filled: squad.length };
}
