// Works out an Agent's stats from a saved or imported build, the way the game's
// Agent screen shows them (out of combat): Lv.60 base + Core Skill (data from
// Enka, tools/enka/make_stats.py) + W-Engine at Lv.60 + Drive Discs + 2-piece
// bonuses. Conditional buffs (4-pieces, passives, team) aren't counted.
import { AGENT_STATS as RELEASED } from '../data/agentStats.js';
import { AGENT_STATS_BETA } from '../data/agentStatsBeta.js';
import { SET_FIT } from '../data/discFit.js';
import { DRIVE_DISC_BY_ID, W_ENGINE_BY_ID } from '../data/game.js';
import { discBonuses, discStatTotals, normaliseDiscs } from './discs.js';
import { goalsOf, loadMyStats } from './statGoals.js';

const AGENT_STATS = { ...AGENT_STATS_BETA, ...RELEASED };
const num = (v) => (v == null ? 0 : Number(String(v).replace(/[,%]/g, '')) || 0);
const ALIAS = { 'Crit Rate': 'CRIT Rate', Attack: 'ATK', Defense: 'DEF' };
// A 2-piece's stat key -> the stat it adds to.
const TWO = { atk: 'ATK%', hp: 'HP%', def: 'DEF%', critRate: 'CRIT Rate', critDmg: 'CRIT DMG', ap: 'Anomaly Proficiency', am: 'Anomaly Mastery%', er: 'Energy Regen%', pen: 'PEN Ratio', impact: 'Impact%' };

/**
 * { ATK, HP, DEF, 'CRIT Rate', 'CRIT DMG', 'Anomaly Proficiency', 'Anomaly Mastery',
 *   'Energy Regen', Impact, 'PEN Ratio' } or null when there's nothing to go on.
 * core: 0 none … 6 F; unknown counts as F (what most guides assume).
 */
export function estimateStats(agentId, loadout, core) {
  const s = AGENT_STATS[agentId];
  if (!s || !loadout) return null;
  const discs = normaliseDiscs(loadout.discs ?? []);
  const hasDiscs = discs.some((d) => d.set || d.main || (d.subs ?? []).length);
  if (!hasDiscs && !loadout.wEngine) return null;

  const b = { ...s.base };
  for (const [k, v] of Object.entries(s.core[core ?? 6] ?? {})) b[k] = (b[k] ?? 0) + v;

  // Everything that adds up: flat stats by name, percent ones with a trailing %.
  const add = {};
  const plus = (k, v) => (add[k] = (add[k] ?? 0) + v);
  for (const t of discStatTotals(discs)) {
    const k = { 'Anomaly Mastery': 'Anomaly Mastery%', 'Energy Regen': 'Energy Regen%', Impact: 'Impact%' }[t.stat] ?? t.stat;
    plus(k, t.value);
  }
  let wBase = { ATK: 0, DEF: 0 };
  const w = W_ENGINE_BY_ID[loadout.wEngine];
  if (w) {
    wBase[ALIAS[w.base.stat] ?? w.base.stat] = num(w.base.max);
    const st = ALIAS[w.advanced.stat] ?? w.advanced.stat;
    const pct = String(w.advanced.max).includes('%');
    const k = { ATK: 'ATK%', HP: 'HP%', DEF: 'DEF%', 'Anomaly Mastery': 'Anomaly Mastery%', 'Energy Regen': 'Energy Regen%', Impact: 'Impact%' }[st];
    plus(pct && k ? k : st, num(w.advanced.max));
  }
  for (const id of discBonuses(discs).twos) {
    const k = TWO[SET_FIT[id]?.two];
    const m = DRIVE_DISC_BY_ID[id]?.twoPiece?.match(/\+([\d.]+)/);
    if (k && m) plus(k, Number(m[1]));
  }
  const g = (k) => add[k] ?? 0;
  const pctOf = (base, k, extra = 0) => base * (1 + (g(k) + extra) / 100);
  return {
    HP: Math.floor(pctOf(b.hp ?? 0, 'HP%', (b.hpPct ?? 0) / 100)) + g('HP'),
    ATK: Math.floor(pctOf((b.atk ?? 0) + wBase.ATK, 'ATK%', (b.atkPct ?? 0) / 100)) + g('ATK'),
    DEF: Math.floor(pctOf((b.def ?? 0) + wBase.DEF, 'DEF%')) + g('DEF'),
    'CRIT Rate': Math.round(((b.critRate ?? 0) / 100 + g('CRIT Rate')) * 10) / 10,
    'CRIT DMG': Math.round(((b.critDmg ?? 0) / 100 + g('CRIT DMG')) * 10) / 10,
    'Anomaly Proficiency': (b.ap ?? 0) + g('Anomaly Proficiency'),
    'Anomaly Mastery': Math.floor(pctOf(b.am ?? 0, 'Anomaly Mastery%')),
    'Energy Regen': Math.round(pctOf((b.er ?? 0) / 100, 'Energy Regen%') * 100) / 100,
    Impact: Math.floor(pctOf(b.impact ?? 0, 'Impact%')),
    'PEN Ratio': Math.round(((b.penRatio ?? 0) / 100 + g('PEN Ratio')) * 10) / 10,
  };
}

/**
 * How many stat goals one build meets: { met, total } from its own gear, or
 * from typed stats when the Agent can't be worked out; null with neither.
 */
export function buildGoals(agentId, loadout, core) {
  const goals = goalsOf(agentId);
  if (!goals.length) return null;
  const vals = estimateStats(agentId, loadout, core) ?? loadMyStats(agentId);
  const known = goals.filter((g) => Number.isFinite(vals[g.stat]));
  if (!known.length) return null;
  return { met: known.filter((g) => vals[g.stat] >= g.value).length, total: goals.length };
}
