// Team synergy score: one number (0–100) and a rank letter for how well a
// squad fits together, with the reasons behind it. It's a guide to team
// building, not a damage calculator: investment, rotations and skill matter
// more in a real fight. Shown by Cortado in the team builder's Synergy panel.
//
// Points (113 in total, scaled back to 100):
//   Additional Abilities  35  share of members whose ability is on
//   Roles                 20  a damage dealer, plus Stun and Support/Defense
//                             (a full Anomaly team needs neither)
//   Field time & Assists   8  an Agent who works off-field (Astra Yao…), or
//                             field time that splits cleanly; and at least
//                             one parry (see data/fieldTime.js)
//   Kit links             15  Ether Veil, Aftershock, Disorder, Remielle's Refringe
//   Team buffs            20  buffs that suit a squadmate's damage: PEN for
//                             non-Rupture, Sheer for Rupture, Sharp for Armorer,
//                             Chain Attack, Aftershock, CRIT DMG, Stun windows,
//                             duo buffs, Anomaly and Attribute DMG,
//                             RES reduction and general squad buffs
//                             (see data/teamBuffs.js)
//   Known team             7  the squad (or its core pair) is a recommended team;
//                             a top pick gets 7, other recommended teams 6
//   Bangboo                8  its Additional Ability is on, or it's recommended
//   Gear (bonus part)     12  squad-wide 4-piece sets and W-Engine passives, and
//                             W-Engines whose passive works for their wearer.
//                             Only counted once some gear is equipped; the
//                             score is then out of 125 and scaled back to 100.
//   Mindscapes & Potential  up to 8 bonus points on top (not added to the
//                             total to aim for), with the score capped at 100.
import { AGENT_BY_ID, ATTRIBUTE_BY_ID, BANGBOO_BY_ID, DAMAGE_SPECIALTIES, baseAttribute, shortName } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { PRESETS } from '../data/presets.js';
import { BANGBOO_SKILLS, needMet } from '../data/bangbooSkills.js';
import { kitLinks, passiveStatus } from './analyze.js';
import { GEAR_BUFFS, TEAM_BUFFS } from '../data/teamBuffs.js';
import { KIT_LINKS } from '../data/kitLinks.js';
import { W_ENGINE_BY_ID, DRIVE_DISC_BY_ID } from '../data/game.js';
import { showBeta } from './betaInfo.js';
import { EVASIVE_ASSIST, OFF_FIELD } from '../data/fieldTime.js';
import { ROMAN, hasPotential } from '../data/potentials.js';

/** Rank letters from best to worst, with the lowest score for each. */
export const SYNERGY_RANKS = [
  { rank: 'S+', min: 90 },
  { rank: 'S', min: 75 },
  { rank: 'A', min: 60 },
  { rank: 'B', min: 40 },
  { rank: 'C', min: 0 },
];

// Rank letter colours (top to bottom of the letter), matching the Shiyu rank
// boxes. Shared by the Synergy panel and the exported team images.
export const SYNERGY_RANK_STOPS = {
  'S+': ['#ffffff', '#c9d6e6', '#6fb8ff'],
  S: ['#fff27a', '#ffc21c', '#ff8a00'],
  A: ['#f6a8ff', '#c55cff', '#8b3dff'],
  B: ['#a8ecff', '#3fa5ff', '#2a62ff'],
  C: ['#ffffff', '#d4d4d4', '#a8a8a8'],
};

// Cortado's mood per rank: the brow on its face screen (in the mascot's
// 64-unit drawing) and a short word.
export const SYNERGY_MOODS = {
  'S+': { brow: 'M23.4 28.6 Q27.6 26.6 32 27.8 Q36.4 26.6 40.6 28.6', word: 'Thrilled' },
  S: { brow: 'M24.2 28.3 Q28 27 32 27.9 Q36 27 39.8 28.3', word: 'Happy' },
  A: { brow: 'M24.2 28.3 Q28 27.4 32 28.1 Q36 27.4 39.8 28.3', word: 'Pleased' },
  B: { brow: 'M24.2 28.4 Q28 28.4 32 28.4 Q36 28.4 39.8 28.4', word: 'Unsure' },
  C: { brow: 'M24 28.8 Q28 27.6 32 28.4 Q36 27.6 40 28.8', word: 'Worried' },
};

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

// Top picks: the first team in each Agent's list, and the preset teams. Other
// recommended teams still work, just less well (e.g. Seed is best with Cissia,
// good with Soldier 0 – Anby), so they score a point less.
const TOP_TEAMS = new Set(
  [...Object.values(BUILDS).map((b) => b.teams[0]).filter(Boolean), ...PRESETS.map((p) => p.members)]
    .filter((t) => t.filter(Boolean).length === 3)
    .map((t) => [...t].sort().join('|')),
);

const dealsAftershock = (a) => (KIT_LINKS[a.id] ?? []).some((l) => l.mechanic === 'aftershock' && l.side === 'provider');

const round = (n) => Math.round(n * 10) / 10;

// Bonus points per Mindscape (M0–M6) and Potential level (0–VI). The first
// levels count most: M1–M2 are where most players stop, and Potential II
// unlocks the Awakened Potential.
const MINDSCAPE_PTS = [0, 1, 1.6, 2, 2.3, 2.5, 2.7];
const POTENTIAL_PTS = [0, 0.8, 1.8, 2.1, 2.4, 2.7, 3];
// Awakened Potentials that buff the whole squad (from Potential II).
const AWAKENED_SQUAD_BUFFS = {
  'alexandrina-sebastiane': 'Perfect Service gives the squad ATK and DEF',
  'koleda-belobog': 'Demolition Ops gives Armorer Agents Laceration DMG and the rest CRIT DMG',
};


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
export function synergyScore(memberIds, bangbooId, loadouts = {}) {
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
  // Three main damage dealers fight over field time, unless one of them does
  // their damage off-field (Orphie, Vivian).
  const offField = (a) => OFF_FIELD[a.id] && (!OFF_FIELD[a.id].beta || showBeta());
  if (dealers.length === 3 && anomalyCount < 3 && !dealers.some(offField)) {
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

  // Field time and Assists: an Agent who keeps working off-field (Astra Yao in
  // Idyllic Cadenza, Yuzuha's Kama, Orphie's lasers…) leaves the field to the
  // damage dealer, and a squad wants at least one parry (Defensive Assist),
  // which deals massive Daze; Evasive Assists dodge and give Vital View instead.
  const fieldBits = [];
  let fieldPts = 0;
  const helpers = squad.filter(offField);
  const onField = squad.filter((a) => !offField(a));
  if (helpers.length && onField.length && squad.length >= 2) {
    fieldPts += 5;
    helpers.forEach((a) => fieldBits.push(`${shortName(a)} ${OFF_FIELD[a.id].text}`));
  } else if (squad.length >= 2) {
    const carries = onField.filter((a) => DAMAGE_SPECIALTIES.includes(a.specialty)).length;
    if (carries <= 2 || fullAnomaly) {
      fieldPts += 3;
      fieldBits.push('field time splits cleanly');
    } else fieldBits.push('everyone needs field time');
  }
  const evasive = squad.filter((a) => EVASIVE_ASSIST.has(a.id));
  if (squad.length && evasive.length < squad.length) fieldPts += 3;
  if (evasive.length) {
    fieldBits.push(
      evasive.length === squad.length && squad.length
        ? 'no parry: every Assist here is Evasive (dodge and Vital View), so no Defensive Assist Daze'
        : `${evasive.map(shortName).join(', ')}: Evasive Assist (dodge and Vital View, no parry); the others parry for Daze`,
    );
  }
  parts.push({
    id: 'field',
    label: 'Field time & Assists',
    points: fieldPts,
    max: 8,
    detail: fieldBits.length ? fieldBits.join('; ') : 'Add more Agents',
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
        (!b.to.notRupture || a.specialty !== 'rupture') &&
        (!b.to.aftershock || dealsAftershock(a)),
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
    points: Math.min(20, buffPts),
    max: 20,
    detail: buffBits.length ? buffBits.join('; ') : 'No buffs here that suit a squadmate’s damage type',
  });

  // Known team: a full recommended trio, or at least a recommended pair.
  const key = [...ids].sort().join('|');
  const pairs = ids.flatMap((x, i) => ids.slice(i + 1).map((y) => [x, y].sort().join('|')));
  const knownPairs = pairs.filter((p) => KNOWN_PAIRS.has(p)).length;
  const top = ids.length === 3 && TOP_TEAMS.has(key);
  const knownPts = ids.length === 3 && KNOWN_TEAMS.has(key) ? (top ? 7 : 6) : Math.min(4, knownPairs * 2);
  parts.push({
    id: 'known',
    label: 'Known team',
    points: knownPts,
    max: 7,
    detail:
      knownPts >= 6
        ? top
          ? 'A top recommended team'
          : 'A recommended team (another pairing is a little stronger)'
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
    // A recommended Bangboo is mostly picked for its active skill, so it
    // scores well even when its Additional Ability stays off.
    bbPts = Math.min(8, (met ? 6 : 0) + (recommended ? 4 : 0));
    if (met === null && recommended) bbPts = 8;
    // Snap's Superstar triggers on Quick Assists, which swap helpers (Astra Yao…) set off often.
    const swapper = bangboo.id === 'snap' && squad.find((a) => offField(a) && OFF_FIELD[a.id].swaps);
    if (swapper) bbPts = Math.min(8, bbPts + 2);
    bbDetail =
      [met ? 'ability on' : met === false ? 'ability off' : null, recommended ? 'recommended' : null]
        .concat(swapper ? [`${shortName(swapper)}’s Quick Assists set off Superstar`] : [])
        .filter(Boolean)
        .join(', ') || 'no bonus here';
  }
  parts.push({ id: 'bangboo', label: 'Bangboo', points: bbPts, max: 8, detail: bbDetail });

  // Gear: only once something is equipped, so bare squads aren't marked down.
  const geared = squad.filter((a) => loadouts[a.id]?.wEngine || loadouts[a.id]?.discs?.some((d) => d?.set));
  if (geared.length) {
    const gearBits = [];
    let squadBuffs = 0;
    const seen = new Set();
    let fits = 0;
    squad.forEach((a) => {
      const lo = loadouts[a.id];
      if (!lo) return;
      const w = lo.wEngine && W_ENGINE_BY_ID[lo.wEngine];
      if (w && w.specialty === a.specialty) {
        fits += 1;
        const g = GEAR_BUFFS.wEngines[w.id];
        if (g && !seen.has(w.id) && (!g.beta || showBeta()) && g.when(a, baseAttribute)) {
          seen.add(w.id);
          squadBuffs += 1;
          gearBits.push(`${w.name} on ${shortName(a)}: ${g.text}`);
        }
      }
      const counts = {};
      (lo.discs ?? []).forEach((d) => d?.set && (counts[d.set] = (counts[d.set] ?? 0) + 1));
      Object.entries(counts).forEach(([set, n]) => {
        const g = GEAR_BUFFS.discs[set];
        if (n < 4 || !g || seen.has(set)) return;
        if (!g.when(a, baseAttribute)) {
          gearBits.push(`${DRIVE_DISC_BY_ID[set]?.name} on ${shortName(a)} needs a different specialty to buff the squad`);
          return;
        }
        seen.add(set);
        squadBuffs += 1;
        gearBits.push(`4-piece ${DRIVE_DISC_BY_ID[set]?.name} on ${shortName(a)}: ${g.text}`);
      });
    });
    const offSpec = squad.filter((a) => {
      const w = loadouts[a.id]?.wEngine && W_ENGINE_BY_ID[loadouts[a.id].wEngine];
      return w && w.specialty !== a.specialty;
    }).length;
    if (offSpec > 0) gearBits.push(`${offSpec} W-Engine${offSpec > 1 ? 's' : ''} from another specialty (passive off)`);
    const gearPts = Math.min(8, squadBuffs * 4) + 4 * (fits / Math.max(1, squad.length));
    parts.push({
      id: 'gear',
      label: 'Gear',
      points: round(gearPts),
      max: 12,
      detail: gearBits.length ? gearBits.join('; ') : 'No squad-wide gear buffs equipped',
    });
  }

  // Mindscapes and Potential: a bonus on top, so a squad without them loses
  // nothing. Early levels count most (most players stop at M1–M2, few go to
  // M6), and an Awakened Potential that buffs the squad counts extra.
  const invested = squad
    .map((a) => ({
      a,
      m: loadouts[a.id]?.mindscape ?? 0,
      p: hasPotential(a.id) ? (loadouts[a.id]?.potential ?? 0) : 0,
    }))
    .filter((x) => x.m || x.p);
  if (invested.length) {
    const bits = [];
    let pts = 0;
    invested.forEach(({ a, m, p }) => {
      pts += MINDSCAPE_PTS[m] + POTENTIAL_PTS[p];
      bits.push(`${shortName(a)} ${[m && `M${m}`, p && `Potential ${ROMAN[p]}`].filter(Boolean).join(', ')}`);
      const squadBuff = AWAKENED_SQUAD_BUFFS[a.id];
      if (squadBuff && p >= 2 && squad.length > 1) {
        pts += 1.5;
        bits.push(`${shortName(a)}’s Awakened Potential ${squadBuff}`);
      }
    });
    parts.push({
      id: 'invest',
      label: 'Mindscapes & Potential (bonus)',
      points: round(Math.min(8, pts)),
      max: 8,
      bonus: true,
      detail: bits.join('; '),
    });
  }

  // Bonus parts add points but don't raise the total to aim for.
  const total = parts.reduce((n, p) => n + p.points, 0);
  const max = parts.reduce((n, p) => n + (p.bonus ? 0 : p.max), 0);
  const score = Math.min(100, Math.round((total / max) * 100));
  const rank = SYNERGY_RANKS.find((r) => score >= r.min).rank;
  return { score, rank, parts, filled: squad.length };
}
