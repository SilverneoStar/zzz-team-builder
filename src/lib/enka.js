// "Import from UID": reads a player's in-game Agent Showcase from Enka.Network
// (https://enka.network, ZZZ API) and turns each shown Agent into a build.
// Only the Agents the player put in their showcase come through.
//
// Enka's API is meant to be called from a server, so requests go through a small
// relay (tools/enka-relay: a Cloudflare Worker that adds the User-Agent, caching
// and the CORS header). Until ENKA_RELAY is set, the site tries Enka directly.
import { ENKA_AGENTS, ENKA_SETS, ENKA_WEAPONS } from '../data/enkaMap.js';
import { normaliseDiscs } from './discs.js';

/** The relay's address, e.g. 'https://zzz-enka.<name>.workers.dev'. Empty = call Enka directly. */
export const ENKA_RELAY = '';

const url = (uid) => (ENKA_RELAY ? `${ENKA_RELAY.replace(/\/$/, '')}/zzz/${uid}` : `https://enka.network/api/zzz/uid/${uid}`);

// Enka property ids → the site's stat names.
const MAIN = {
  11102: 'HP%', 12102: 'ATK%', 13102: 'DEF%', 20103: 'CRIT Rate', 21103: 'CRIT DMG', 31203: 'Anomaly Proficiency',
  23103: 'PEN Ratio', 31503: 'Attribute DMG', 31603: 'Attribute DMG', 31703: 'Attribute DMG', 31803: 'Attribute DMG',
  31903: 'Attribute DMG', 31402: 'Anomaly Mastery', 12202: 'Impact', 30502: 'Energy Regen',
};
const SUB = {
  11103: 'HP', 11102: 'HP%', 12103: 'ATK', 12102: 'ATK%', 13103: 'DEF', 13102: 'DEF%', 20103: 'CRIT Rate',
  21103: 'CRIT DMG', 23203: 'PEN', 31203: 'Anomaly Proficiency',
};
const RANK = { 4: 'S', 3: 'A', 2: 'B' };
// Skill indexes in Enka's SkillLevelList → the site's skill ids.
const SKILL = { 0: 'basic', 2: 'dodge', 6: 'assist', 1: 'special', 3: 'chain' };

/** A UID is 8–10 digits. */
export const validUid = (uid) => /^\d{8,10}$/.test(String(uid ?? '').trim());

/**
 * Fetches a showcase. Resolves to { nickname, ttl, agents: [{ agentId, enkaId,
 * level, loadout, skills, core }] } (agentId null for an Agent the site doesn't
 * have yet), or throws an Error with a message for the reader.
 */
export async function fetchShowcase(uid) {
  let res;
  try {
    res = await fetch(url(String(uid).trim()));
  } catch {
    throw new Error('Couldn’t reach Enka.Network. Check your connection and try again in a moment.');
  }
  if (res.status === 400 || res.status === 404) throw new Error('No player with that UID.');
  if (res.status === 424) throw new Error('Enka.Network is updating for a new game version. Try again later.');
  if (res.status === 429) throw new Error('Too many lookups right now. Try again in a minute.');
  if (!res.ok) throw new Error(`Enka.Network didn’t answer (error ${res.status}). Try again later.`);
  return parseShowcase(await res.json());
}

/** Enka's JSON → { nickname, ttl, agents } (see fetchShowcase). */
export function parseShowcase(data) {
  const info = data?.PlayerInfo ?? {};
  const list = info.ShowcaseDetail?.AvatarList ?? [];
  return {
    nickname: info.SocialDetail?.ProfileDetail?.Nickname ?? '',
    ttl: data?.ttl ?? 0,
    agents: list.map(parseAgent),
  };
}

function skillLevels(raw, mindscape) {
  // A dict ({ "0": 11 }) or a list ([{ Index, Level }]); +2 at Mindscape 3, +4 at 5,
  // like the game shows them.
  const pairs = Array.isArray(raw) ? raw.map((x) => [x.Index, x.Level]) : Object.entries(raw ?? {});
  const bonus = mindscape >= 5 ? 4 : mindscape >= 3 ? 2 : 0;
  const out = {};
  for (const [i, lv] of pairs) if (SKILL[i] && lv) out[SKILL[i]] = Number(lv) + bonus;
  return Object.keys(out).length ? out : null;
}

function parseDisc(eq) {
  const id = Number(eq?.Id);
  const set = ENKA_SETS[Math.floor(id / 100) * 100] ?? null;
  // The rarity digit sits before the slot digit in the item id (…41 = S slot 1).
  const rank = RANK[Math.floor(id / 10) % 10] ?? 'S';
  const main = MAIN[eq?.MainStatList?.[0]?.PropertyId] ?? null;
  const subs = (eq?.RandomPropertyList ?? [])
    .map((p) => ({ stat: SUB[p.PropertyId], up: Math.max(0, (p.PropertyLevel ?? 1) - 1) }))
    .filter((x) => x.stat);
  const ups = subs.reduce((n, x) => n + x.up, 0);
  return { set, rank, main, subs, four: ups > 4 };
}

function parseAgent(a) {
  const mindscape = Number(a.TalentLevel ?? 0);
  const discs = Array.from({ length: 6 }, () => ({ set: null, rank: 'S', main: null, subs: [], four: false }));
  for (const e of a.EquippedList ?? []) {
    const slot = Number(e.Slot);
    if (slot >= 1 && slot <= 6) discs[slot - 1] = parseDisc(e.Equipment);
  }
  // Slots 1–3 have fixed main stats: the site leaves them empty.
  [0, 1, 2].forEach((i) => (discs[i].main = null));
  const w = a.Weapon;
  return {
    enkaId: a.Id,
    agentId: ENKA_AGENTS[a.Id] ?? null,
    level: a.Level ?? null,
    loadout: {
      wEngine: (w && ENKA_WEAPONS[w.Id]) ?? null,
      refinement: Math.min(5, Math.max(1, Number(w?.UpgradeLevel ?? 1))),
      mindscape: Math.min(6, Math.max(0, mindscape)),
      discs: normaliseDiscs(discs),
    },
    skills: skillLevels(a.SkillLevelList, mindscape),
    core: Number.isFinite(a.CoreSkillEnhancement) ? Math.min(6, Math.max(0, a.CoreSkillEnhancement)) : null,
  };
}
