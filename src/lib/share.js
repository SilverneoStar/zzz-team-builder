import { AGENT_BY_ID, BANGBOO_BY_ID, DISC_MAIN_STATS, DRIVE_DISC_BY_ID, TEAM_SIZE, W_ENGINE_BY_ID } from '../data/game.js';
import { RANKS, normaliseDiscs } from './discs.js';

// A team code looks like:
//   zzz2~Ellen_Freeze~ellen-joe.von-lycaon.soukaku~sharkboo~<gear>.<gear>.<gear>
// Each Agent's gear is W-Engine,phase,mindscape,slot1,…,slot6 and each slot is
// set_rank_main (main as its position in DISC_MAIN_STATS for slots 4–6).
// Only letters, digits and . , _ ~ - appear, so it's safe in a URL hash.
// Older zzz1 codes (a 4-piece and 2-piece set per Agent) still import.
const PREFIX = 'zzz2';
const SLOTS = [4, 5, 6];

export function encodeTeam(team, loadoutOf) {
  const name = (team.name || 'Team')
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .slice(0, 40);
  const members = team.members.map((id) => id || 'x').join('.');
  const gear = team.members
    .map((id) => {
      if (!id) return '';
      const lo = loadoutOf(team, id);
      return [
        lo.wEngine ?? '',
        lo.refinement,
        lo.mindscape,
        ...lo.discs.map((d, i) => {
          const slot = i + 1;
          const m = slot >= 4 ? DISC_MAIN_STATS[slot].indexOf(d.main) : -1;
          return `${d.set ?? ''}_${d.rank}_${m < 0 ? '' : m}`;
        }),
      ].join(',');
    })
    .join('.');
  return `${PREFIX}~${name || 'Team'}~${members}~${team.bangboo ?? ''}~${gear}`;
}

/** Returns { name, members, bangboo, loadouts } or null if the code isn't valid. */
export function decodeTeam(code) {
  if (!code) return null;
  const parts = code.trim().replace(/^#/, '').split('~');
  if (parts.length < 3 || (parts[0] !== PREFIX && parts[0] !== 'zzz1')) return null;
  const legacy = parts[0] === 'zzz1';
  const name = parts[1].replace(/_/g, ' ') || 'Shared team';
  const ids = parts[2].split('.').slice(0, TEAM_SIZE);
  // Unknown Agents and duplicates are dropped: an Agent appears once per squad.
  const seen = new Set();
  const members = Array.from({ length: TEAM_SIZE }, (_, i) => {
    const id = ids[i];
    if (!AGENT_BY_ID[id] || seen.has(id)) return null;
    seen.add(id);
    return id;
  });
  if (!members.some(Boolean)) return null;
  const bangboo = BANGBOO_BY_ID[parts[3]] ? parts[3] : null;

  const loadouts = {};
  (parts[4] ?? '').split('.').forEach((g, i) => {
    const id = members[i];
    if (!id || !g) return;
    const [w, ref, mind, ...rest] = g.split(',');
    const base = {
      wEngine: W_ENGINE_BY_ID[w] ? w : null,
      refinement: Math.min(5, Math.max(1, Number(ref) || 1)),
      mindscape: Math.min(6, Math.max(0, Number(mind) || 0)),
    };
    if (legacy) {
      const [d4, d2, ...mains] = rest;
      const main = {};
      SLOTS.forEach((s, k) => {
        main[s] = mains[k] !== '' ? DISC_MAIN_STATS[s][Number(mains[k])] ?? null : null;
      });
      loadouts[id] = { ...base, discs: normaliseDiscs(null, { disc4: DRIVE_DISC_BY_ID[d4] ? d4 : null, disc2: DRIVE_DISC_BY_ID[d2] ? d2 : null, main }) };
      return;
    }
    const discs = rest.slice(0, 6).map((cell, i) => {
      const [set, rank, m] = (cell ?? '').split('_');
      const slot = i + 1;
      return {
        set: DRIVE_DISC_BY_ID[set] ? set : null,
        rank: RANKS.includes(rank) ? rank : 'S',
        main: slot >= 4 && m !== '' && m != null ? DISC_MAIN_STATS[slot][Number(m)] ?? null : null,
      };
    });
    loadouts[id] = { ...base, discs: normaliseDiscs(discs) };
  });
  return { name, members, bangboo, loadouts };
}
