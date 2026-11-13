import { emptyLoadout, loadoutOf } from './teamsReducer.js';
import { decodeCardCode, encodeCardCode } from './cardCode.js';

// Personal Agent builds ("My build"): up to MAX_BUILDS saved loadouts per Agent,
// one of them active, kept in this browser only. Same shape as a team loadout (see teamsReducer.js), so a build
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

export const MAX_BUILDS = 6;
const newId = () => Math.random().toString(36).slice(2, 8);

/**
 * An Agent's saved builds as { active, builds: [{ id, name, loadout }] }.
 * Older saves (one loadout per Agent) read as a single build.
 */
export function buildsOf(agentId, all = loadMyBuilds()) {
  const v = all[agentId];
  if (!v) return { active: null, builds: [] };
  if (!Array.isArray(v.builds)) return { active: 'b1', builds: [{ id: 'b1', name: 'Build 1', loadout: v }] };
  const active = v.builds.some((b) => b.id === v.active) ? v.active : v.builds[0]?.id ?? null;
  return { active, builds: v.builds };
}
const fill = (agentId, lo) => loadoutOf({ loadouts: { [agentId]: lo } }, agentId);

/** The active saved build for an Agent, filled out with defaults, or null. */
export function myBuildOf(agentId, all = loadMyBuilds()) {
  const { active, builds } = buildsOf(agentId, all);
  const b = builds.find((x) => x.id === active);
  return b ? fill(agentId, b.loadout) : null;
}

function put(agentId, book) {
  const all = loadMyBuilds();
  if (book.builds.length) all[agentId] = book;
  else delete all[agentId];
  return store(all);
}

/** Saves the active build (makes one if there's none). */
export function saveMyBuild(agentId, loadout) {
  const book = buildsOf(agentId);
  const lo = { ...loadout, savedAt: Date.now() };
  if (!book.active) return addMyBuild(agentId, loadout).ok;
  return put(agentId, { ...book, builds: book.builds.map((b) => (b.id === book.active ? { ...b, loadout: lo } : b)) });
}

/** Adds a build and makes it active. { ok, id }; not added past MAX_BUILDS. */
export function addMyBuild(agentId, loadout, name) {
  const book = buildsOf(agentId);
  if (book.builds.length >= MAX_BUILDS) return { ok: false, id: null };
  let n = book.builds.length + 1;
  while (book.builds.some((b) => b.name === `Build ${n}`)) n += 1;
  const id = newId();
  const ok = put(agentId, {
    active: id,
    builds: [...book.builds, { id, name: name || `Build ${n}`, loadout: { ...loadout, savedAt: Date.now() } }],
  });
  return { ok, id };
}

/** The active build's note (shown on the build image), or ''. */
export function myNoteOf(agentId, all = loadMyBuilds()) {
  const { active, builds } = buildsOf(agentId, all);
  return builds.find((b) => b.id === active)?.note ?? '';
}

export function noteMyBuild(agentId, id, note) {
  const book = buildsOf(agentId);
  return put(agentId, { ...book, builds: book.builds.map((b) => (b.id === id ? { ...b, note: note.slice(0, NOTE_MAX) } : b)) });
}
export const NOTE_MAX = 160;

export const setActiveBuild = (agentId, id) => put(agentId, { ...buildsOf(agentId), active: id });

export function renameMyBuild(agentId, id, name) {
  const book = buildsOf(agentId);
  return put(agentId, { ...book, builds: book.builds.map((b) => (b.id === id ? { ...b, name: name.slice(0, 24) } : b)) });
}

/** Removes one build (the active one by default); the next one becomes active. */
export function deleteMyBuild(agentId, id) {
  const book = buildsOf(agentId);
  const gone = id ?? book.active;
  const i = book.builds.findIndex((b) => b.id === gone);
  const builds = book.builds.filter((b) => b.id !== gone);
  const active = book.active === gone ? builds[Math.min(i, builds.length - 1)]?.id ?? null : book.active;
  return put(agentId, { active, builds });
}

const solo = (agentId, loadout) => ({
  members: [agentId, null, null],
  bangboo: null,
  loadouts: { [agentId]: loadout },
});

/** Short share code for one Agent's build (the same format as team image codes). */
export const buildCode = (agentId, loadout, opts) => encodeCardCode(solo(agentId, loadout), loadoutOf, opts);

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
