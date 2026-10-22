import { emptyLoadout, loadoutOf } from './teamsReducer.js';
import { decodeCardCode, encodeCardCode } from './cardCode.js';

// Personal Agent builds ("My build"): one saved loadout per Agent, kept in this
// browser only. Same shape as a team loadout (see teamsReducer.js), so a build
// can be copied into a team and shared with the same short code as team images.
const KEY = 'zzz-team-builder:myBuilds';

export function loadMyBuilds() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

function store(all) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
    return true;
  } catch {
    return false; // storage full or blocked: the build still works until the page closes
  }
}

/** The saved build for an Agent, filled out with defaults, or null. */
export function myBuildOf(agentId, all = loadMyBuilds()) {
  if (!all[agentId]) return null;
  return loadoutOf({ loadouts: { [agentId]: all[agentId] } }, agentId);
}

export function saveMyBuild(agentId, loadout) {
  const all = loadMyBuilds();
  all[agentId] = { ...loadout, savedAt: Date.now() };
  return store(all);
}

export function deleteMyBuild(agentId) {
  const all = loadMyBuilds();
  delete all[agentId];
  return store(all);
}

const solo = (agentId, loadout) => ({ members: [agentId, null, null], bangboo: null, loadouts: { [agentId]: loadout } });

/** Short share code for one Agent's build (the same format as team image codes). */
export const buildCode = (agentId, loadout) => encodeCardCode(solo(agentId, loadout), loadoutOf);

/**
 * Reads a pasted build or team code. Returns this Agent's loadout from it, or
 * { error } when the code is invalid or doesn't include this Agent.
 */
export function readBuildCode(agentId, raw) {
  const text = (raw ?? '').trim();
  const t = decodeCardCode(text.includes('#') ? text.slice(text.indexOf('#') + 1) : text);
  if (!t) return { error: 'That code isn’t valid. Paste a short build or team code.' };
  if (!t.members.includes(agentId)) return { error: 'That code is for a different Agent.' };
  return { loadout: t.loadouts[agentId] ?? emptyLoadout() };
}
