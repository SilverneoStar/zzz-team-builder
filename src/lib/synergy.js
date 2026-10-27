// Team synergy score: one number (0–100) and a rank letter for how well a
// squad fits together, with the reasons behind it. It's a guide to team
// building, not a damage calculator: investment, rotations and skill matter
// more in a real fight. Shown by Cortado in the team builder's Synergy panel.
//
// Points (100 in total):
//   Additional Abilities  35  share of members whose ability is on
//   Roles                 20  a damage dealer, plus Stun and Support/Defense
//                             (a full Anomaly team needs neither)
//   Kit links             15  Ether Veil, Aftershock, Disorder, Remielle's Refringe
//   Team buffs            15  buffs that suit a squadmate's damage: PEN for
//                             non-Rupture, Sheer for Rupture, Sharp for Armorer,
//                             Chain Attack, Anomaly and Attribute DMG,
//                             RES reduction and general squad buffs
//                             (see data/teamBuffs.js)
//   Known team             7  the squad (or its core pair) is a recommended team
//   Bangboo                8  its Additional Ability is on, or it's recommended
import { AGENT_BY_ID, ATTRIBUTE_BY_ID, BANGBOO_BY_ID, DAMAGE_SPECIALTIES, baseAttribute, shortName } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { PRESETS } from '../data/presets.js';
import { BANGBOO_SKILLS, needMet } from '../data/bangbooSkills.js';
import { kitLinks, passiveStatus } from './analyze.js';
import { TEAM_BUFFS } from '../data/teamBuffs.js';
import { showBeta } from './betaInfo.js';

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


// Remielle's Lumiflux adds the Anomaly of the Agent in the slot to her right
// (wrapping round to the first slot), so for Disorder she counts as that
// Agent's attribute.
const MIRRORS_RIGHT = ['remielle-dan'];
function anomalyAttribute(memberIds, i) {
  const a = AGENT_BY_ID[memberIds[i]];
  if (!MIRRORS_RIGHT.includes(a.id)) return baseAttribute(a.attribute);
  for (let k = 1; k < memberIds.length; k += 1) {
    const right = AGENT_BY_ID[memberIds[(i + k) % memberIds.length]];
    if (right) return baseAttribute(right.attribute);
  }
  return baseAttribute(a.attribute);
}

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
  const abilityPts = squad.length ? (known.length ? (on.length / 3) * 35 : 17.5 * (squad.length / 3)) : 0;
  parts.push({
    id: 'abilities',
    label: 'Additional Abilities',
    points: round(abilityPts),
    max: 35,
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
    rolePts += 6;
    roleBits.push('damage dealer');
  }
  const fullAnomaly = anomalyCount === 3;
  if (fullAnomaly) {
    // Three Anomaly Agents build and trigger Anomalies on their own: Stun and
    // Support aren't needed, so the squad gets full role marks.
    rolePts = 20;
    roleBits.push('full Anomaly team (no Stun or Support needed)');
  }
  // Two Anomaly Agents can carry a team without a Stun Agent.
  else if (has(['stun']) || anomalyCount >= 2) {
    rolePts += 8;
    roleBits.push(has(['stun']) ? 'Stun' : 'Anomaly pair');
  }
  if (!fullAnomaly && has(['support', 'defense'])) {
    rolePts += 6;
    roleBits.push('Support/Defense');
  }
  // Three main damage dealers fight over field time.
  if (dealers.length === 3 && anomalyCount < 3) {
    rolePts -= 4;
    roleBits.push('three damage dealers (−4)');
  }
  parts.push({
    id: 'roles',
    label: 'Roles',
    points: Math.max(0, rolePts),
    max: 20,
    detail: roleBits.length ? roleBits.join(', ') : 'No clear roles yet',
  });

  // Kit links and Disorder.
  const links = kitLinks(ids);
  const anomalyAttrs = new Set(
    memberIds
      .map((id, i) => (id && AGENT_BY_ID[id]?.specialty === 'anomaly' ? anomalyAttribute(memberIds, i) : null))
      .filter(Boolean),
  );
  const kitBits = links.map((l) => l.name);
  let kitPts = links.length * 7.5;
  if (anomalyAttrs.size >= 2) {
    kitPts += 7.5;
    kitBits.push('Disorder');
  }
  // Remielle Refringes a squadmate's Anomaly, adding the one of the Agent to her right.
  memberIds.forEach((id, i) => {
    if (!id || !MIRRORS_RIGHT.includes(id) || squad.length < 2) return;
    const attr = anomalyAttribute(memberIds, i);
    if (anomalyCount >= 2) kitPts += 7.5;
    kitBits.push(`${shortName(AGENT_BY_ID[id])} adds ${ATTRIBUTE_BY_ID[attr]?.name ?? attr} Anomaly (from the slot to her right)`);
  });
  parts.push({
    id: 'kit',
    label: 'Kit links',
    points: Math.min(15, kitPts),
    max: 15,
    detail: kitBits.length ? kitBits.join(', ') : 'None in this squad',
  });

  // Team buffs: a squadmate's buff that suits another member's damage type.
  const buffBits = [];
  let buffPts = 0;
  let generalCounted = false;
  TEAM_BUFFS.forEach((b) => {
    if (b.beta && !showBeta()) return;
    if (b.kind === 'general' && generalCounted) return;
    const giver = squad.find((a) => a.id === b.agent);
    if (!giver) return;
    const helped = squad.filter(
      (a) =>
        (!b.to.others || a.id !== giver.id) &&
        (!b.to.specialties || b.to.specialties.includes(a.specialty)) &&
        (!b.to.attributes || b.to.attributes.includes(baseAttribute(a.attribute))) &&
        (!b.to.notRupture || a.specialty !== 'rupture'),
    );
    if (!helped.length) return;
    if (b.kind === 'general') generalCounted = true;
    buffPts += 5;
    buffBits.push(`${shortName(giver)}: ${b.text} (${helped.map(shortName).join(', ')})`);
  });
  // PEN buffs wasted on a Rupture carry are worth pointing out.
  const pensOnly = TEAM_BUFFS.filter((b) => b.kind === 'pen' && squad.some((a) => a.id === b.agent));
  const ruptureCarry = squad.some((a) => a.specialty === 'rupture');
  if (pensOnly.length && ruptureCarry && !buffBits.length)
    buffBits.push('PEN and DEF-ignore buffs don’t help Rupture Agents: their Sheer DMG already ignores DEF');
  parts.push({
    id: 'buffs',
    label: 'Team buffs',
    points: Math.min(15, buffPts),
    max: 15,
    detail: buffBits.length ? buffBits.join('; ') : 'No buffs here that suit a squadmate’s damage type',
  });

  // Known team: a full recommended trio, or at least a recommended pair.
  const key = [...ids].sort().join('|');
  const pairs = ids.flatMap((x, i) => ids.slice(i + 1).map((y) => [x, y].sort().join('|')));
  const knownPairs = pairs.filter((p) => KNOWN_PAIRS.has(p)).length;
  const knownPts = ids.length === 3 && KNOWN_TEAMS.has(key) ? 7 : Math.min(4, knownPairs * 2);
  parts.push({
    id: 'known',
    label: 'Known team',
    points: knownPts,
    max: 7,
    detail:
      knownPts === 7
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
    bbPts = (met ? 6 : 0) + (recommended ? 2 : 0);
    if (met === null && recommended) bbPts = 8;
    bbDetail =
      [met ? 'ability on' : met === false ? 'ability off' : null, recommended ? 'recommended' : null]
        .filter(Boolean)
        .join(', ') || 'no bonus here';
  }
  parts.push({ id: 'bangboo', label: 'Bangboo', points: bbPts, max: 8, detail: bbDetail });

  const score = Math.round(parts.reduce((n, p) => n + p.points, 0));
  const rank = SYNERGY_RANKS.find((r) => score >= r.min).rank;
  return { score, rank, parts, filled: squad.length };
}
