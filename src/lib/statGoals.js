import { STAT_TARGETS } from '../data/statTargets.js';

// Stat goals for the "Stat progress" bars on an Agent's Build tab, and the
// player's own stats typed in next to them (kept in this browser only).

const NAMES = ['HP', 'ATK', 'DEF', 'Impact', 'CRIT Rate', 'CRIT DMG', 'Anomaly Proficiency', 'Anomaly Mastery', 'Energy Regen', 'PEN Ratio'];
const RE = new RegExp(`^(${NAMES.join('|')}) ([\\d,.]+)(?:–([\\d,.]+))?(%)?`);
const num = (s) => Number(s.replace(/,/g, ''));

/**
 * An Agent's goals as [{ stat, value, pct, hint }]. Uses the entry's own
 * `goals` when it has them; otherwise reads the guide's ranges and takes the top
 * of the first one (the build with the matching main-stat W-Engine).
 * "about" ranges (Energy Regen) are left out: they're a band, not a goal.
 */
export function goalsOf(agentId) {
  const t = STAT_TARGETS[agentId];
  if (!t) return [];
  if (t.goals) return t.goals.map((g) => ({ pct: false, hint: '', ...g }));
  const out = [];
  for (const line of t.targets ?? []) {
    for (const part of line.split(' · ')) {
      const m = part.match(RE);
      if (!m || out.some((g) => g.stat === m[1])) continue;
      out.push({ stat: m[1], value: num(m[3] ?? m[2]), pct: !!m[4], hint: part });
    }
  }
  return out;
}

const KEY = 'zzz-team-builder:myStats';

export function loadMyStats(agentId) {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')[agentId] ?? {};
  } catch {
    return {};
  }
}

export function saveMyStats(agentId, stats) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    if (Object.keys(stats).length) all[agentId] = stats;
    else delete all[agentId];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage blocked: the numbers stay until the page closes */
  }
}

// What one more S-rank substat roll adds, in the stat's own units. ATK% and HP%
// rolls are turned into flat numbers with a typical Lv.60 base (Agent + W-Engine).
const ROLL = {
  ATK: { size: 48, how: 'ATK% rolls (≈48 ATK each) or flat ATK (19)' },
  HP: { size: 230, how: 'HP% rolls (≈230 HP each) or flat HP (112)' },
  DEF: { size: 15, how: 'DEF% rolls (4.8%) or flat DEF (15)' },
  'CRIT Rate': { size: 2.4, how: 'CRIT Rate rolls (2.4% each)' },
  'CRIT DMG': { size: 4.8, how: 'CRIT DMG rolls (4.8% each)' },
  'Anomaly Proficiency': { size: 9, how: 'Anomaly Proficiency rolls (9 each)' },
};
// Where a main stat closes a big gap in one go.
const MAIN = {
  ATK: 'an ATK% main stat on slot 4, 5 or 6 (+30%, ≈480 ATK)',
  HP: 'an HP% main stat on slot 4, 5 or 6 (+30%)',
  'CRIT Rate': 'a CRIT Rate main stat on slot 4 (+24%)',
  'CRIT DMG': 'a CRIT DMG main stat on slot 4 (+48%)',
  'Anomaly Proficiency': 'an Anomaly Proficiency main stat on slot 4 (+92)',
  'Anomaly Mastery': 'an Anomaly Mastery main stat on slot 6 (+30%)',
  Impact: 'an Impact main stat on slot 6 (+18%)',
  'PEN Ratio': 'a PEN Ratio main stat on slot 5 (+24%)',
  'Energy Regen': 'an Energy Regen main stat on slot 6 (+60%)',
};

/**
 * Suggestions from the gaps between the player's stats and the goals:
 * [{ stat, text, kind: 'focus' | 'more' | 'done' | 'spare' }], biggest gap first.
 */
export function suggestions(goals, mine) {
  const rows = goals
    .filter((g) => Number.isFinite(mine[g.stat]))
    .map((g) => ({ ...g, have: mine[g.stat], gap: g.value - mine[g.stat] }));
  const short = rows.filter((r) => r.gap > 0).sort((a, b) => b.gap / b.value - a.gap / a.value);
  const out = [];
  short.forEach((r, i) => {
    const roll = ROLL[r.stat];
    const n = roll ? Math.ceil(r.gap / roll.size) : null;
    const amount = `${fmt(r.gap, r.pct)} short`;
    let text;
    if (roll && n <= 6) text = `${amount}: about ${n} more ${roll.how}.`;
    else if (MAIN[r.stat]) text = `${amount}: that's a lot of rolls; ${MAIN[r.stat]} closes it faster.`;
    else text = `${amount}.`;
    out.push({ stat: r.stat, text, kind: i === 0 ? 'focus' : 'more' });
  });
  for (const r of rows.filter((x) => x.gap <= 0)) {
    const roll = ROLL[r.stat];
    const extra = roll ? Math.floor(-r.gap / roll.size) : 0;
    if (extra >= 2 && short.length)
      out.push({ stat: r.stat, kind: 'spare', text: `Past the goal by ${fmt(-r.gap, r.pct)}: when you re-roll or swap discs, new rolls do more on ${short[0].stat}.` });
    else out.push({ stat: r.stat, kind: 'done', text: 'Goal reached.' });
  }
  return out;
}

export const fmt = (v, pct) => (pct ? `${Math.round(v * 10) / 10}%` : Math.round(v).toLocaleString('en-US'));
