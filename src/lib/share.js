import { AGENT_BY_ID, BANGBOO_BY_ID, DISC_MAIN_STATS, DRIVE_DISC_BY_ID, TEAM_SIZE, W_ENGINE_BY_ID } from '../data/game.js';

// A team code looks like:
//   zzz1~Ellen_Freeze~ellen-joe.von-lycaon.soukaku~sharkboo~deep-sea-visitor,1,0,,,,,.,,,,,,,.,,,,,,,
// Parts: version, team name, Agents, Bangboo, then each Agent's gear as
// W-Engine,refinement,mindscape,4-piece,2-piece,slot4,slot5,slot6 (main stats
// as their position in DISC_MAIN_STATS). Only letters, digits and . , _ ~ -
// appear, so it's safe in a URL hash.
const PREFIX = 'zzz1';
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
        lo.disc4 ?? '',
        lo.disc2 ?? '',
        ...SLOTS.map((s) => {
          const i = DISC_MAIN_STATS[s].indexOf(lo.main[s]);
          return i < 0 ? '' : i;
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
  if (parts.length < 3 || parts[0] !== PREFIX) return null;
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
    const [w, ref, mind, d4, d2, ...mains] = g.split(',');
    const main = {};
    SLOTS.forEach((s, k) => {
      main[s] = DISC_MAIN_STATS[s][Number(mains[k])] && mains[k] !== '' ? DISC_MAIN_STATS[s][Number(mains[k])] : null;
    });
    loadouts[id] = {
      wEngine: W_ENGINE_BY_ID[w] ? w : null,
      refinement: Math.min(5, Math.max(1, Number(ref) || 1)),
      mindscape: Math.min(6, Math.max(0, Number(mind) || 0)),
      disc4: DRIVE_DISC_BY_ID[d4] ? d4 : null,
      disc2: DRIVE_DISC_BY_ID[d2] && d2 !== d4 ? d2 : null,
      main,
    };
  });
  return { name, members, bangboo, loadouts };
}
