// The reader's own endgame teams (Ethereals tab): what they used, or what they
// suggest, for the current rotation of each mode. Kept in this browser only and
// exported as a card. Shape:
//   { kind: 'used' | 'suggest', teams: [[id|null ×3] …], scores: [n|null …],
//     buffs: [buffId|null …] (Deadly Assault), bonus: [id|null ×3], bonusScore }
const KEY = 'zzz-team-builder:myEndgame';

const readAll = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
};

export const emptyMine = (n) => ({
  kind: 'used',
  teams: Array.from({ length: n }, () => [null, null, null]),
  scores: Array(n).fill(null),
  buffs: Array(n).fill(null),
  bonus: [null, null, null],
  bonusScore: null,
});

/** Saved teams for a rotation (e.g. 'deadly-assault:3.3.1'), filled out to n targets. */
export function loadMine(key, n) {
  const saved = readAll()[key];
  if (!saved) return emptyMine(n);
  const base = emptyMine(n);
  return {
    ...base,
    ...saved,
    teams: base.teams.map((t, i) => [0, 1, 2].map((k) => saved.teams?.[i]?.[k] ?? null)),
    scores: base.scores.map((_, i) => saved.scores?.[i] ?? null),
    buffs: base.buffs.map((_, i) => saved.buffs?.[i] ?? null),
    bonus: [0, 1, 2].map((k) => saved.bonus?.[k] ?? null),
  };
}

export function saveMine(key, mine) {
  try {
    const all = readAll();
    if (mine) all[key] = mine;
    else delete all[key];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage full or blocked: the teams still work until the page closes */
  }
}

export const hasMine = (mine) => Boolean(mine && (mine.teams.some((t) => t.some(Boolean)) || mine.bonus?.some(Boolean)));
