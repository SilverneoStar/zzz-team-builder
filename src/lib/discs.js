import { DISC_FIXED, DISC_MAIN_STATS, DRIVE_DISC_BY_ID } from '../data/game.js';

// Six Drive Disc slots per Agent. Each slot: { set, rank, main } where set is
// a Drive Disc set id (or null), rank 'S' | 'A' | 'B', and main the main stat
// for slots 4–6 (slots 1–3 always roll flat HP, ATK and DEF).
export const SLOTS = [1, 2, 3, 4, 5, 6];
export const RANKS = ['S', 'A', 'B'];

// Where each slot sits on the wheel, as in the game: 1 top-left, 2 left,
// 3 bottom-left, 4 bottom-right, 5 right, 6 top-right.
export const SLOT_POSITION = { 1: 'tl', 2: 'l', 3: 'bl', 4: 'br', 5: 'r', 6: 'tr' };

export const emptyDisc = () => ({ set: null, rank: 'S', main: null });
export const emptyDiscs = () => SLOTS.map(() => emptyDisc());

// Highest main stat at level 15, by rank (B-rank maxima aren't published).
const MAIN_MAX = {
  S: {
    HP: '2,200',
    ATK: '316',
    DEF: '184',
    'HP%': '30%',
    'ATK%': '30%',
    'DEF%': '48%',
    'CRIT Rate': '24%',
    'CRIT DMG': '48%',
    'Anomaly Proficiency': '92',
    'PEN Ratio': '24%',
    'Attribute DMG': '30%',
    'Anomaly Mastery': '30%',
    Impact: '18%',
    'Energy Regen': '60%',
  },
  A: {
    HP: '1,468',
    ATK: '212',
    DEF: '124',
    'HP%': '20%',
    'ATK%': '20%',
    'DEF%': '32%',
    'CRIT Rate': '16%',
    'CRIT DMG': '32%',
    'Anomaly Proficiency': '60',
    'PEN Ratio': '16%',
    'Attribute DMG': '20%',
    'Anomaly Mastery': '20%',
    Impact: '12%',
    'Energy Regen': '40%',
  },
};
export const mainStatOf = (slot, disc) => (slot <= 3 ? DISC_FIXED[slot - 1].stat : (disc?.main ?? null));
export const mainMax = (slot, disc) => {
  const stat = mainStatOf(slot, disc);
  return stat ? (MAIN_MAX[disc?.rank]?.[stat] ?? null) : null;
};

/** Normalise whatever was saved (or nothing) into six slots. */
export function normaliseDiscs(discs, legacy = {}) {
  if (Array.isArray(discs) && discs.length === 6) {
    return discs.map((d, i) => {
      const slot = i + 1;
      const set = d?.set && DRIVE_DISC_BY_ID[d.set] ? d.set : null;
      const rank = RANKS.includes(d?.rank) ? d.rank : 'S';
      const main = slot >= 4 && DISC_MAIN_STATS[slot].includes(d?.main) ? d.main : null;
      return { set, rank, main };
    });
  }
  // Older saves had a 4-piece set, a 2-piece set and main stats for 4–6.
  const out = emptyDiscs();
  if (legacy.disc4) [0, 1, 2, 3].forEach((i) => (out[i].set = legacy.disc4));
  if (legacy.disc2) [4, 5].forEach((i) => (out[i].set = legacy.disc2));
  [4, 5, 6].forEach((s) => {
    if (DISC_MAIN_STATS[s].includes(legacy.main?.[s])) out[s - 1].main = legacy.main[s];
  });
  return out;
}

/**
 * Which set bonuses are active: { counts: [{ id, count }], four: id|null, twos: [id] }.
 * Two discs of a set give its 2-piece bonus; four give both.
 */
export function discBonuses(discs) {
  const tally = {};
  discs.forEach((d) => {
    if (d.set) tally[d.set] = (tally[d.set] ?? 0) + 1;
  });
  const counts = Object.entries(tally)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
  const four = counts.find((c) => c.count >= 4)?.id ?? null;
  const twos = counts.filter((c) => c.count >= 2).map((c) => c.id);
  return { counts, four, twos };
}

/** Short text like "4 Feathered Fate + 2 Freedom Blues". */
export function discSummary(discs) {
  const { counts } = discBonuses(discs);
  if (!counts.length) return null;
  return (
    counts
      .filter((c) => c.count >= 2)
      .map((c) => `${c.count} ${DRIVE_DISC_BY_ID[c.id].name}`)
      .join(' + ') || `${counts.reduce((n, c) => n + c.count, 0)} mixed discs`
  );
}
