import { AGENT_BY_ID, baseAttribute, shortName } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { passiveStatus } from './analyze.js';

// Suggests squads for an endgame target ({ weak, resist }) under a set of buffs.
// The candidates are the community teams in builds.js; the site scores them
// against the game facts: the main damage dealer hitting a weakness counts
// most, any member the target resists counts against, and members the buffs
// reward add a little.

// Armorers (Claret, Sunbringer) carry teams too, so they count as damage dealers.
const DAMAGE = new Set(['attack', 'anomaly', 'rupture', 'armorer']);
// Damage dealers who play as a sub-DPS, so they never lead a team here.
const SUB_DPS = new Set(['orphie-magnusson-and-magus']);
// Defense Agents are rarely used in endgame now; Zhao plays as a support, so she's fine.
const DEFENSE_OK = new Set(['zhao']);
// Agents that have fallen out of endgame use; suggestions avoid them.
const RARELY_USED = new Set(['anby-demara']);

// Every recommended team once, keyed by its members, main damage dealer first.
const TEAMS = (() => {
  const seen = new Map();
  Object.values(BUILDS).forEach((b) =>
    b.teams.forEach((members) => {
      const ids = members.filter((id) => AGENT_BY_ID[id] && !AGENT_BY_ID[id].upcoming);
      if (ids.length !== 3) return;
      const key = [...ids].sort().join('|');
      if (!seen.has(key)) seen.set(key, ids);
    }),
  );
  return [...seen.values()];
})();

const attr = (a) => baseAttribute(a.attribute);

function favorScore(a, favors) {
  let s = 0;
  s += favors.specialty?.[a.specialty] ?? 0;
  s += favors.attribute?.[attr(a)] ?? 0;
  s += Math.max(0, ...(a.attackType ?? []).map((t) => favors.attackType?.[t] ?? 0));
  return s;
}

/** Scores one team. Returns { score, reasons } or null if it doesn't fit at all. */
export function scoreTeam(ids, target, buffs = []) {
  const agents = ids.map((id) => AGENT_BY_ID[id]);
  // Soldier 0 – Anby plays with the Obol Squad (and Soldier 11), not her A-rank self.
  if (ids.includes('soldier-0-anby') && ids.includes('anby-demara')) return null;
  const dealers = agents.filter((a) => DAMAGE.has(a.specialty) && !SUB_DPS.has(a.id));
  if (!dealers.length) return null;
  const main = dealers[0];
  if (!target.weak.includes(attr(main))) return null; // the carry must hit a weakness
  let score = 6;
  const reasons = [`${shortName(main)} hits its weakness`];
  agents.forEach((a) => {
    if (a === main) return;
    if (target.weak.includes(attr(a))) score += DAMAGE.has(a.specialty) ? 3 : 1.5;
    if (target.resist.includes(attr(a))) score -= DAMAGE.has(a.specialty) ? 4 : 1.5;
  });
  const defense = agents.filter((a) => a.specialty === 'defense' && !DEFENSE_OK.has(a.id));
  score -= defense.length * 3;
  score -= agents.filter((a) => RARELY_USED.has(a.id)).length * 3;
  // Members whose Additional Ability stays off in this squad count against it.
  const passives = passiveStatus(ids);
  const idle = agents.filter((a) => passives.byId[a.id]?.known && !passives.byId[a.id].active);
  score -= idle.length * 2.5;
  if (idle.length) reasons.push(`${idle.map((a) => shortName(a)).join(', ')}: Additional Ability off`);
  let buffPts = 0;
  buffs.forEach((b) => {
    const f = b.favors ?? {};
    agents.forEach((a) => (buffPts += favorScore(a, f) * (a === main ? 1.5 : 1)));
    const anomalies = agents.filter((a) => a.specialty === 'anomaly').length;
    if (f.anomalyPair && anomalies >= 2) {
      buffPts += anomalies === 3 ? 4 : 3;
      reasons.push(`${anomalies} Anomaly Agents for ${b.name}`);
    }
    if (f.anyAttribute && main.specialty === 'anomaly') buffPts += 1;
  });
  // Buffs refine the pick; the weaknesses decide it.
  score += buffPts * 0.5;
  if (buffs.length && buffPts >= 4 && !reasons.some((r) => r.includes('Anomaly Agents'))) {
    reasons.push(`suits ${buffs.map((b) => b.name).join(' + ')}`);
  }
  const resisted = agents.filter((a) => target.resist.includes(attr(a)));
  if (resisted.length) reasons.push(`${resisted.map((a) => shortName(a)).join(', ')} resisted`);
  // Main damage dealer first, so Load team builds around them.
  const ordered = [main.id, ...ids.filter((id) => id !== main.id)];
  return { ids: ordered, score: Math.round(score * 10) / 10, reasons };
}

/**
 * The best few teams for a target, best first: hand-picked teams in the data
 * (`target.picks`) come first, then the best-scoring others, with one team per
 * main damage dealer so the list shows different options.
 */
export function suggestTeams(target, buffs = [], limit = 3, exclude = new Set()) {
  const ok = (ids) => !ids.some((id) => exclude.has(id));
  const picked = (target.picks ?? [])
    .map((slots) => {
      // A slot listing several Agents: score with the first, show the others as options.
      const ids = slots.map((x) => (Array.isArray(x) ? x[0] : x));
      const options = Object.fromEntries(slots.map((x) => Array.isArray(x) && [x[0], x]).filter(Boolean));
      return { ids, options };
    })
    .filter(({ ids }) => ok(ids))
    .map(({ ids, options }) => ({ ...(scoreTeam(ids, target, buffs) ?? { ids, score: 0, reasons: [] }), options }))
    // Picks all rank alike, so the full run can choose whichever pick leaves
    // the best teams for the other bosses.
    .map((t) => ({ ...t, score: 100 + t.score * 0.1, reasons: ['Recommended pick', ...t.reasons] }));
  const mains = new Set(picked.map((t) => t.ids[0]));
  const rest = TEAMS.filter(ok)
    .map((ids) => scoreTeam(ids, target, buffs))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .filter((t) => (mains.has(t.ids[0]) ? false : (mains.add(t.ids[0]), true)));
  return [...picked, ...rest].slice(0, Math.max(limit, picked.length));
}

/** The buff that gives the best team for this target. */
export function bestBuff(target, buffs) {
  let best = null;
  buffs.forEach((b) => {
    const top2 = suggestTeams({ ...target, picks: [] }, [b], 1)[0];
    if (top2 && (!best || top2.score > best.score)) best = { buff: b, score: top2.score };
  });
  return best?.buff ?? null;
}

/**
 * One team per target with no Agent used twice (Deadly Assault bosses, Shiyu
 * sides). Tries the top few teams for each target and keeps the best total.
 */
export function disjointTeams(targets, depth = 8) {
  const options = targets.map((t) => suggestTeams(t.target, t.buffs, depth));
  let best = null;
  const walk = (i, used, picked, total) => {
    if (i === options.length) {
      if (!best || total > best.total) best = { total, picked: [...picked] };
      return;
    }
    let any = false;
    options[i].forEach((t) => {
      if (t.ids.some((id) => used.has(id))) return;
      any = true;
      t.ids.forEach((id) => used.add(id));
      picked.push(t);
      walk(i + 1, used, picked, total + t.score);
      picked.pop();
      t.ids.forEach((id) => used.delete(id));
    });
    if (!any) {
      picked.push(null);
      walk(i + 1, used, picked, total);
      picked.pop();
    }
  };
  walk(0, new Set(), [], 0);
  return best?.picked ?? targets.map(() => null);
}
