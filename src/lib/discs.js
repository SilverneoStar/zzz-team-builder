import { DISC_FIXED, DISC_MAIN_STATS, DRIVE_DISC_BY_ID } from '../data/game.js';

// Six Drive Disc slots per Agent. Each slot: { set, rank, main, subs, four }
// where set is a Drive Disc set id (or null), rank 'S' | 'A' | 'B', main the
// main stat for slots 4–6 (slots 1–3 always roll flat HP, ATK and DEF), and
// subs up to four substats as { stat, up } (up = extra upgrades it got).
//
// Substats: a disc has up to four, never its main stat. A disc that dropped
// with three gains its fourth at +3, then gets 4 upgrades (+6 to +15); one that
// dropped with four (`four`) gets 5. Each upgrade adds one more roll to one
// substat, so they can all go to one stat or be spread out.
export const SLOTS = [1, 2, 3, 4, 5, 6];
export const RANKS = ['S', 'A', 'B'];

// Where each slot sits on the wheel, as in the game: 1 top-left, 2 left,
// 3 bottom-left, 4 bottom-right, 5 right, 6 top-right.
export const SLOT_POSITION = { 1: 'tl', 2: 'l', 3: 'bl', 4: 'br', 5: 'r', 6: 'tr' };

export const emptyDisc = () => ({ set: null, rank: 'S', main: null, subs: [], four: false });

export const SUB_STATS = ['HP', 'ATK', 'DEF', 'HP%', 'ATK%', 'DEF%', 'CRIT Rate', 'CRIT DMG', 'PEN', 'Anomaly Proficiency'];
// Value of one roll, by rank. B-rank values aren't published.
const SUB_ROLL = {
  S: { HP: 112, ATK: 19, DEF: 15, 'HP%': 3, 'ATK%': 3, 'DEF%': 4.8, 'CRIT Rate': 2.4, 'CRIT DMG': 4.8, PEN: 9, 'Anomaly Proficiency': 9 },
  A: { HP: 75, ATK: 13, DEF: 10, 'HP%': 2, 'ATK%': 2, 'DEF%': 3.2, 'CRIT Rate': 1.6, 'CRIT DMG': 3.2, PEN: 6, 'Anomaly Proficiency': 6 },
};
const PERCENT = new Set(['HP%', 'ATK%', 'DEF%', 'CRIT Rate', 'CRIT DMG', 'PEN Ratio', 'Attribute DMG', 'Anomaly Mastery', 'Impact', 'Energy Regen']);
/** Most upgrades a disc's substats can share: 4, or 5 if it dropped with four substats. */
export const maxUpgrades = (disc) => (disc?.four ? 5 : 4);
export const upgradesUsed = (disc) => (disc?.subs ?? []).reduce((n, x) => n + (x.up ?? 0), 0);
/** Value of a substat with `up` extra upgrades on a disc of this rank, or null. */
export const subValue = (rank, stat, up = 0) => {
  const roll = SUB_ROLL[rank]?.[stat];
  return roll == null ? null : roll * (1 + up);
};
/** Text like "12%" or "56" for a stat value. */
export const formatStat = (stat, v) =>
  v == null ? '—' : PERCENT.has(stat) ? `${Math.round(v * 10) / 10}%` : `${Math.round(v).toLocaleString('en-US')}`;
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
      const own = mainStatOf(slot, { main });
      const four = !!d?.four;
      const subs = [];
      (Array.isArray(d?.subs) ? d.subs : []).forEach((x) => {
        if (subs.length < 4 && SUB_STATS.includes(x?.stat) && x.stat !== own && !subs.some((y) => y.stat === x.stat))
          subs.push({ stat: x.stat, up: Math.max(0, Math.min(5, Math.round(x.up) || 0)) });
      });
      // Keep the upgrades within what the disc can have.
      let left = four ? 5 : 4;
      subs.forEach((x) => {
        x.up = Math.min(x.up, left);
        left -= x.up;
      });
      return { set, rank, main, subs, four };
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

const num = (v) => (v == null ? null : Number(String(v).replace(/[,%]/g, '')));

/**
 * Stats from all six discs: main stats (at level 15) plus substats, as
 * [{ stat, value, main, sub }] in a fixed order. Attribute DMG and the like keep
 * their names; the caller labels them.
 */
export function discStatTotals(discs) {
  const tally = {};
  const add = (stat, v, kind) => {
    if (v == null || Number.isNaN(v)) return;
    tally[stat] ??= { stat, value: 0, main: 0, sub: 0 };
    tally[stat].value += v;
    tally[stat][kind] += v;
  };
  discs.forEach((d, i) => {
    if (!d.set && !d.main && !(d.subs ?? []).length) return;
    const slot = i + 1;
    const m = mainStatOf(slot, d);
    if (m) add(m, num(mainMax(slot, d)), 'main');
    (d.subs ?? []).forEach((x) => add(x.stat, subValue(d.rank, x.stat, x.up), 'sub'));
  });
  const order = ['HP', 'HP%', 'ATK', 'ATK%', 'DEF', 'DEF%', 'CRIT Rate', 'CRIT DMG', 'PEN', 'PEN Ratio', 'Anomaly Proficiency', 'Anomaly Mastery', 'Attribute DMG', 'Impact', 'Energy Regen'];
  return order.filter((k) => tally[k]).map((k) => tally[k]);
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
