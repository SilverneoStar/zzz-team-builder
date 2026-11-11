// Team synergy score: one number (0–100) and a rank letter for how well a
// squad fits together, with the reasons behind it. It's a guide to team
// building, not a damage calculator: investment, rotations and skill matter
// more in a real fight. Shown by Cortado in the team builder's Synergy panel.
//
// Points (124 in total, scaled back to 100):
//   Additional Abilities  35  share of members whose ability is on
//   Roles                 20  a damage dealer, plus Stun and a Support (a full
//                             Anomaly team needs neither); a Defense Agent
//                             only half fills the Support slot, except Zhao
//   Kit conditions         8  Core Passive buffs that need a certain squadmate
//                             (data/kitConditions.js); −5 for each unmet
//   Agent rank            10  S-Rank 3.33 each, A-Rank 40% (half at M6)
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
//   Known team         up to 7 bonus points: the squad (or its core pair) is a
//                             recommended team; a top pick gets 7, other
//                             recommended teams 6. A bonus, so a team the
//                             guides don't list isn't marked down.
//   Bangboo                8  its Additional Ability is on, or it's recommended
//   Gear (bonus part)     12  squad-wide 4-piece sets and W-Engine passives, and
//                             W-Engines whose passive works for their wearer.
//                             Only counted once some gear is equipped; the
//                             score is then out of 136 and scaled back to 100.
//   Build fit (penalty)   −10  what the equipped discs give, not their names:
//                             −3 for a 4-piece whose effect needs another kind
//                             of Agent or boosts stats they don't use, −1 for a
//                             2-piece stat they don't use, −2 for a slot 4–6
//                             main stat their build doesn't list (data/discFit.js).
//   Mindscapes & Potential  up to 8 bonus points on top (not added to the
//                             total to aim for), with the score capped at 100.
import {
  AGENT_BY_ID,
  ATTRIBUTE_BY_ID,
  BANGBOO_BY_ID,
  DAMAGE_SPECIALTIES,
  acquisition,
  baseAttribute,
  shortName,
} from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { PRESETS } from '../data/presets.js';
import { UPCOMING } from '../data/upcoming.js';
import { BANGBOO_SKILLS, needMet } from '../data/bangbooSkills.js';
import { kitLinks, passiveStatus } from './analyze.js';
import { GEAR_BUFFS, TEAM_BUFFS } from '../data/teamBuffs.js';
import { KIT_LINKS } from '../data/kitLinks.js';
import { KIT_CONDITIONS } from '../data/kitConditions.js';
import { W_ENGINE_BY_ID, DRIVE_DISC_BY_ID, SPECIALTY_BY_ID } from '../data/game.js';
import { SET_FIT, STAT_NAME } from '../data/discFit.js';
import { showBeta } from './betaInfo.js';
import { EVASIVE_ASSIST, OFF_FIELD } from '../data/fieldTime.js';
import { BETA_POTENTIAL, POTENTIAL_PASSIVE, ROMAN, hasPotential } from '../data/potentials.js';

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

// Teams shown for upcoming Agents (official gameplay, beta tests, estimates),
// best first. Beta teams count only while beta info is shown. A team that lists
// its gear (`gear`: W-Engine per member) or Potential matches only with that
// setup, so the same trio can rank differently by setup. Returns the best place
// (0 = top) this squad takes in any list, or -1.
function upcomingTeamPlace(ids, loadouts) {
  const key = [...ids].sort().join('|');
  let best = -1;
  let loose = -1;
  let beta = false;
  Object.values(UPCOMING).forEach((u) => {
    if (u.beta && !showBeta()) return;
    const teams = (u.teams ?? []).filter((t) => t.members.length === 3 && (t.source !== 'Beta' || showBeta()));
    teams.forEach((t, i) => {
      if ([...t.members].sort().join('|') !== key) return;
      const gearOk = Object.entries(t.gear ?? {}).every(([id, w]) => loadouts[id]?.wEngine === w);
      const potOk = (t.potential ?? []).every((id) => (loadouts[id]?.potential ?? 0) >= 1);
      if (gearOk && potOk) {
        if (best < 0 || i < best) beta = t.source === 'Beta';
        best = best < 0 ? i : Math.min(best, i);
      } else loose = Math.max(loose, i);
    });
  });
  return best >= 0 ? { place: best, beta } : { place: loose, beta: false };
}

// With beta info shown, a squad that matches a beta-test team (gear and
// Potential included) has its score pulled towards that team's place in the
// beta ranking: BETA_TARGETS[place], weighted BETA_WEIGHT. A stand-in until the
// kits are out and the parts above can rank these teams by themselves.
const BETA_TARGETS = [86, 82, 78, 74, 70];
const BETA_WEIGHT = 0.7;

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
// unlocks the Awakened Potential. Potential is easier to get than extra
// copies, so it counts a little less than Mindscapes. Mindscapes count by how
// hard the copies are: limited S-Rank in full, standard S-Rank a bit less, and
// A-Rank Agents and Pyrois (free copies) least, since many players have them high.
const MINDSCAPE_PTS = [0, 1.2, 2, 2.5, 2.9, 3.2, 3.5];
const POTENTIAL_PTS = [0, 0.6, 1.4, 1.6, 1.8, 2, 2.2];
const MINDSCAPE_WEIGHT = { limited: 1, standard: 0.8, 'a-rank': 0.5, free: 0.5 };
const ACQUISITION_NAME = { limited: 'limited S-Rank', standard: 'standard S-Rank', 'a-rank': 'A-Rank', free: 'free copies' };
// Awakened Potentials that buff the whole squad (from Potential II).
const AWAKENED_SQUAD_BUFFS = {
  'alexandrina-sebastiane': 'Perfect Service gives the squad ATK and DEF',
  'koleda-belobog': 'Demolition Ops gives Armorer Agents Laceration DMG and the rest CRIT DMG',
};


// Remielle's Lumiflux adds the Anomaly of the Agent in the slot to her right
// (wrapping round to the first slot), so for Disorder she counts as that
// Agent's attribute.
const MIRRORS_RIGHT = ['remielle-dan'];
// Defense Agents who play as a support (buffs, Ether Veil), so Roles counts them as one.
const DEFENSE_AS_SUPPORT = ['zhao'];
function anomalyAttribute(memberIds, i) {
  const a = AGENT_BY_ID[memberIds[i]];
  if (!MIRRORS_RIGHT.includes(a.id)) return baseAttribute(a.attribute);
  for (let k = 1; k < memberIds.length; k += 1) {
    const right = AGENT_BY_ID[memberIds[(i + k) % memberIds.length]];
    if (right) return baseAttribute(right.attribute);
  }
  return baseAttribute(a.attribute);
}

// A slot 4–6 main stat as the build text names it ("Fire DMG", "ATK %", "PEN").
const MAIN_PATTERNS = {
  'HP%': /\bHP\b/,
  'ATK%': /\bATK\b/,
  'DEF%': /\bDEF\b/,
  'CRIT Rate': /CRIT Rate/,
  'CRIT DMG': /CRIT DMG/,
  'Anomaly Proficiency': /Anomaly Proficiency/,
  'Anomaly Mastery': /Anomaly Mastery/,
  'PEN Ratio': /\bPEN\b/,
  'Attribute DMG': /\b(Physical|Fire|Ice|Electric|Ether|Wind|Attribute) DMG/,
  Impact: /Impact/,
  'Energy Regen': /Energy Regen/,
};

// Stats an Agent's recommended build values, read from its main stats and
// substats, plus what their specialty always uses.
const PROFILE_PATTERNS = {
  atk: /\bATK\b/,
  hp: /\bHP\b/,
  def: /\bDEF\b/,
  critRate: /CRIT Rate/,
  critDmg: /CRIT DMG/,
  ap: /Anomaly Proficiency/,
  am: /Anomaly Mastery/,
  pen: /\bPEN\b/,
  er: /Energy Regen/,
  impact: /Impact/,
};
const SPECIALTY_STATS = {
  attack: ['pen'],
  armorer: ['pen'],
  stun: ['impact', 'daze', 'er'],
  support: ['er', 'shield'],
  defense: ['er', 'shield', 'def', 'hp'],
  anomaly: ['ap', 'am', 'pen'],
};
// General effects that help anyone (a squad buff, more DMG, staying alive), or
// any damage dealer or Stun Agent (Basic Attack, Ultimate and Aftershock DMG).
const ANYONE = new Set(['dmg', 'team', 'survive']);
const HITTERS = new Set(['basic', 'ultimate', 'aftershock']);

function profileOf(a) {
  const b = BUILDS[a.id];
  const text = b ? [b.main[4], b.main[5], b.main[6], b.substats].join(' ') : '';
  const set = new Set(Object.keys(PROFILE_PATTERNS).filter((k) => PROFILE_PATTERNS[k].test(text)));
  (SPECIALTY_STATS[a.specialty] ?? []).forEach((k) => set.add(k));
  return set;
}

/** Does one stat key from SET_FIT help this Agent? */
function suits(stat, a, profile) {
  if (ANYONE.has(stat)) return true;
  if (HITTERS.has(stat)) return a.specialty !== 'support' && a.specialty !== 'defense';
  if (stat.startsWith('el:')) return stat.slice(3) === baseAttribute(a.attribute);
  return profile.has(stat);
}

const statText = (stat) => (stat.startsWith('el:') ? `${ATTRIBUTE_BY_ID[stat.slice(3)]?.name ?? stat.slice(3)} DMG` : (STAT_NAME[stat] ?? stat));

/**
 * How well each member's equipped discs suit them, by what the sets and main
 * stats actually give rather than by set name: a 4-piece whose effect needs
 * another kind of Agent or boosts stats they don't use, a 2-piece bonus they
 * don't use, or a slot 4–6 main stat their build doesn't list.
 */
function buildFit(squad, loadouts) {
  const bits = [];
  let penalty = 0;
  let checked = 0;
  squad.forEach((a) => {
    const discs = loadouts[a.id]?.discs ?? [];
    const profile = profileOf(a);
    const counts = {};
    discs.forEach((d) => d?.set && (counts[d.set] = (counts[d.set] ?? 0) + 1));
    Object.entries(counts).forEach(([set, n]) => {
      const f = SET_FIT[set];
      const name = DRIVE_DISC_BY_ID[set]?.name ?? set;
      if (!f || n < 2) return;
      checked += 1;
      if (n >= 4) {
        const needOk =
          !f.needs || f.needs === a.specialty || f.needs === baseAttribute(a.attribute) || f.needs === a.attribute;
        const useful = f.four.filter((st) => suits(st, a, profile));
        if (!needOk) {
          penalty += 3;
          bits.push(`${shortName(a)}: ${name}’s 4-piece only works on a ${f.needs === 'ether' ? 'Ether' : SPECIALTY_BY_ID[f.needs]?.name ?? f.needs} Agent`);
        } else if (!useful.length) {
          penalty += 3;
          bits.push(`${shortName(a)}: ${name}’s 4-piece boosts ${f.four.map(statText).join(' and ')}, which they don’t use`);
        }
      }
      if (!suits(f.two, a, profile)) {
        penalty += 1;
        bits.push(`${shortName(a)}: ${name}’s 2-piece gives ${statText(f.two)}, which they don’t use`);
      }
    });
    const b = BUILDS[a.id];
    [4, 5, 6].forEach((slot) => {
      const m = discs[slot - 1]?.main;
      const rec = b?.main[slot];
      if (!m || !rec || !MAIN_PATTERNS[m]) return;
      checked += 1;
      if (!MAIN_PATTERNS[m].test(rec)) {
        penalty += 2;
        bits.push(`${shortName(a)}: ${m} on slot ${slot} doesn’t suit them (recommended: ${rec})`);
      }
    });
  });
  if (!checked) return null;
  // A penalty only: discs that suit the Agent cost nothing (at most −10 in all).
  return {
    id: 'fit',
    label: 'Build fit',
    points: -Math.min(10, penalty),
    max: 10,
    bonus: true,
    penalty: true,
    detail: bits.length ? bits.join('; ') : 'Every equipped set and main stat gives stats its Agent uses',
  };
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
  const ps = passiveStatus(ids, loadouts);
  const known = Object.values(ps.byId).filter((v) => v.known);
  const on = known.filter((v) => v.active);
  // An ability that isn't revealed (or is hidden beta info) counts as half on,
  // so a squad isn't marked down for what can't be checked yet.
  const unknown = squad.length - known.length;
  const abilityPts = squad.length ? ((on.length + unknown * 0.5) / 3) * 35 : 0;
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
  // Two Supports (Zhao counts) can stack enough buffs to skip a Stun Agent,
  // as in Ye Shunguang's teams with Zhao and Sunna.
  else if (
    squad.filter((a) => a.specialty === 'support' || ['zhao'].includes(a.id)).length >= 2
  ) {
    rolePts += 6;
    roleBits.push('two Supports in place of a Stun Agent');
  }
  // Three main damage dealers fight over field time, unless one of them does
  // their damage off-field (Orphie, Vivian).
  const offField = (a) => OFF_FIELD[a.id] && (!OFF_FIELD[a.id].beta || showBeta());
  // Two damage dealers can fill the third slot instead of a Support: a duo
  // whose kits buff each other (Seed's Vanguard) or one who works off-field.
  const duo =
    dealers.length >= 2 &&
    (dealers.some(offField) ||
      TEAM_BUFFS.some(
        (b) => b.kind === 'duo' && dealers.some((d) => d.id === b.agent) && dealers.some((d) => d.id !== b.agent && b.to.specialties.includes(d.specialty)),
      ));
  // Combat runs on dodging and parrying, so Defense Agents add little next to
  // a Support's buffs. Zhao is the exception: she plays as a support (squad
  // buffs and Ether Veil), so she counts as one.
  const supports = squad.filter((a) => a.specialty === 'support' || DEFENSE_AS_SUPPORT.includes(a.id));
  const defenders = squad.filter((a) => a.specialty === 'defense' && !DEFENSE_AS_SUPPORT.includes(a.id));
  if (!fullAnomaly && supports.length) {
    rolePts += 6;
    roleBits.push(`Support (${supports.map(shortName).join(', ')})`);
  } else if (!fullAnomaly && duo) {
    rolePts += 6;
    roleBits.push('two damage dealers that work together');
  } else if (!fullAnomaly && defenders.length) {
    rolePts += 2;
    roleBits.push('Defense in place of a Support (a Support’s buffs usually do more)');
  }
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

  // Kit conditions: buffs in a Core Passive or kit that need a certain kind of
  // squadmate (Severian with another Wind Agent). Each one left unmet costs 5.
  const condBits = [];
  let condPts = 8;
  squad.forEach((a) => {
    const c = KIT_CONDITIONS[a.id];
    if (!c || squad.length < 2) return;
    const met = c.need(squad, a, baseAttribute);
    if (!met) condPts -= 5;
    condBits.push(`${shortName(a)}: ${c.text} (${met ? 'met' : 'not met'})`);
  });
  parts.push({
    id: 'conditions',
    label: 'Kit conditions',
    points: Math.max(0, condPts),
    max: 8,
    detail: condBits.length ? condBits.join('; ') : 'No squad conditions in these kits',
  });

  // Agent rank: A-Rank Agents have smaller kits and stats than S-Ranks, so they
  // count 40% (half at M6). Investment and skill still matter more.
  const rankPts = squad.reduce(
    (n, a) => n + (a.rank === 'A' ? ((loadouts[a.id]?.mindscape ?? 0) >= 6 ? 1.67 : 1.33) : 3.33),
    0,
  );
  const aRanks = squad.filter((a) => a.rank === 'A');
  parts.push({
    id: 'rank',
    label: 'Agent rank',
    points: round(Math.min(10, rankPts)),
    max: 10,
    detail: aRanks.length ? `${aRanks.map(shortName).join(', ')}: A-Rank (counts 40%, half at M6)` : 'All S-Rank',
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
  // General buffs of the same kind (two squad ATK buffs, say) overlap, so each
  // kind counts once; different kinds (ATK and DMG%) multiply, so both count.
  const generalCounted = new Set();
  TEAM_BUFFS.forEach((b) => {
    if (b.beta && !showBeta()) return;
    if (b.kind === 'general' && generalCounted.has(b.bucket)) return;
    const giver = squad.find((a) => a.id === b.agent);
    if (!giver) return;
    // A Potential that widens the giver's Additional Ability widens its buff too
    // (expected widenings only while beta info is shown).
    const potEntry = POTENTIAL_PASSIVE[giver.id];
    const potSpecs =
      potEntry && (loadouts[giver.id]?.potential ?? 0) >= 1 && (!potEntry.expected || showBeta()) ? potEntry.specialties : [];
    const helped = squad.filter(
      (a) =>
        (!b.to.others || a.id !== giver.id) &&
        (!b.to.specialties || b.to.specialties.includes(a.specialty) || (b.potential && potSpecs.includes(a.specialty))) &&
        (!b.to.attributes || b.to.attributes.includes(baseAttribute(a.attribute))) &&
        (!b.to.notRupture || a.specialty !== 'rupture') &&
        (!b.to.aftershock || dealsAftershock(a)),
    );
    if (!helped.length) return;
    if (b.kind === 'general') generalCounted.add(b.bucket);
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
  // Upcoming Agents' teams: 7 for the top one, half a point less for each place down (to 5).
  const upMatch = ids.length === 3 ? upcomingTeamPlace(ids, loadouts) : { place: -1, beta: false };
  const upPlace = upMatch.place;
  const top = ids.length === 3 && (TOP_TEAMS.has(key) || upPlace === 0);
  const knownPts =
    ids.length === 3 && KNOWN_TEAMS.has(key)
      ? top
        ? 7
        : 6
      : upPlace >= 0
        ? Math.max(5, 7 - upPlace * 0.5)
        : Math.min(4, knownPairs * 2);
  parts.push({
    id: 'known',
    label: 'Known team (bonus)',
    points: knownPts,
    max: 7,
    bonus: true,
    detail:
      knownPts >= 5
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

  // Build fit: each member's 4-piece set and slot 4–6 main stats against their
  // recommended build. A set or main stat the build doesn't list (Anomaly
  // Proficiency on a non-Anomaly Agent, say) lowers this part.
  const fit = buildFit(squad, loadouts);
  if (fit) parts.push(fit);

  // Mindscapes and Potential: a bonus on top, so a squad without them loses
  // nothing. Early levels count most (most players stop at M1–M2, few go to
  // M6), and an Awakened Potential that buffs the squad counts extra.
  const invested = squad
    .map((a) => ({
      a,
      m: loadouts[a.id]?.mindscape ?? 0,
      p: hasPotential(a.id) || (BETA_POTENTIAL.has(a.id) && showBeta()) ? (loadouts[a.id]?.potential ?? 0) : 0,
    }))
    .filter((x) => x.m || x.p);
  if (invested.length) {
    const bits = [];
    let pts = 0;
    invested.forEach(({ a, m, p }) => {
      const how = acquisition(a);
      pts += MINDSCAPE_PTS[m] * MINDSCAPE_WEIGHT[how] + POTENTIAL_PTS[p];
      bits.push(
        `${shortName(a)} ${[m && `M${m} (${ACQUISITION_NAME[how]})`, p && `Potential ${ROMAN[p]}`].filter(Boolean).join(', ')}`,
      );
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
  let total = parts.reduce((n, p) => n + p.points, 0);
  const max = parts.reduce((n, p) => n + (p.bonus ? 0 : p.max), 0);
  if (upMatch.beta && showBeta() && upMatch.place >= 0 && max) {
    const raw = Math.min(100, (total / max) * 100);
    const target = BETA_TARGETS[Math.min(upMatch.place, BETA_TARGETS.length - 1)];
    const adj = Math.round(((target - raw) * BETA_WEIGHT * max) / 100 * 10) / 10;
    if (adj) {
      parts.push({
        id: 'beta-rank',
        label: 'Beta test ranking',
        points: adj,
        max: Math.abs(adj),
        bonus: adj > 0,
        penalty: adj < 0,
        detail: `#${upMatch.place + 1} in the beta tests: the score leans towards that order until the kits are out`,
      });
      total += adj;
    }
  }
  const score = Math.min(100, Math.round((total / max) * 100));
  const rank = SYNERGY_RANKS.find((r) => score >= r.min).rank;
  return { score, rank, parts, filled: squad.length };
}
