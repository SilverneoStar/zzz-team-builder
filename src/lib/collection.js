// Which Agents the player has recruited, kept in this browser only, and which
// missing ones would add the most to their account if they come back (rerun).
import { BUILDS } from '../data/builds.js';
import { AGENTS, AGENT_BY_ID, acquisition, shortName } from '../data/game.js';
import { UPCOMING } from '../data/upcoming.js';

const KEY = 'zzz-team-builder:owned';

export function loadOwned() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return Array.isArray(v) ? new Set(v) : null; // null: never set up
  } catch {
    return null;
  }
}

export function saveOwned(set) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...set]));
    return true;
  } catch {
    return false;
  }
}

/** Agents shown in the collection: released ones, then announced ones last. */
export const COLLECTION = [...AGENTS].sort(
  (a, b) => (a.upcoming ? 1 : 0) - (b.upcoming ? 1 : 0) || shortName(a).localeCompare(shortName(b)),
);

// Every recommended team once (each Agent's best teams, all three members).
const TEAMS = (() => {
  const seen = new Map();
  for (const b of Object.values(BUILDS))
    b.teams.forEach((t, i) => {
      const key = [...t].sort().join('|');
      // Keep the best rank a team gets on any of its members' lists.
      if (!seen.has(key) || seen.get(key).rank > i) seen.set(key, { members: t, rank: i });
    });
  // Announced Agents' teams (official reveals and beta), after the released ones.
  for (const u of Object.values(UPCOMING))
    (u.teams ?? []).forEach((t, i) => {
      const key = [...t.members].sort().join('|');
      if (!seen.has(key)) seen.set(key, { members: t.members, rank: i });
    });
  return [...seen.values()];
})();

/**
 * Missing Agents worth a pull, best first: [{ agent, teams, partners, listedBy,
 * how, score }]. teams: recommended teams this Agent would complete with
 * Agents you have; partners: who they'd team with most; listedBy: your Agents
 * whose best teams include them; how: 'limited' (wait for a rerun),
 * 'standard' (permanent channel), 'a-rank' or 'free'.
 */
export function worthAPull(owned) {
  const out = [];
  for (const a of AGENTS) {
    if (owned.has(a.id)) continue;
    const done = TEAMS.filter((t) => t.members.includes(a.id) && t.members.every((m) => m === a.id || owned.has(m)));
    const listedBy = [...owned].filter((id) => BUILDS[id]?.teams.some((t) => t.includes(a.id)));
    if (a.upcoming && !UPCOMING[a.id]) continue;
    const partners = new Map();
    done.forEach((t) => t.members.forEach((m) => m !== a.id && partners.set(m, (partners.get(m) ?? 0) + 1)));
    // Better-ranked teams count more; being on your Agents' lists counts too.
    const score = done.reduce((s, t) => s + 1 / (1 + t.rank * 0.5), 0) + listedBy.length * 0.6 + (a.rank === 'S' ? 0.3 : 0);
    if (!done.length && !listedBy.length) continue;
    out.push({
      agent: a,
      teams: done,
      partners: [...partners.entries()].sort((x, y) => y[1] - x[1]).map(([id]) => AGENT_BY_ID[id]),
      listedBy: listedBy.map((id) => AGENT_BY_ID[id]),
      how: a.upcoming ? 'upcoming' : acquisition(a),
      score,
    });
  }
  return out.sort((x, y) => y.score - x.score);
}
