// Ways to close a stat gap with the discs you have, each one worked out by
// re-running the stat estimate on a changed copy of the build:
//   • a different main stat on slot 4, 5 or 6 (and what you'd lose),
//   • a disc whose off-stat rolls landed on the stat you need instead
//     (a replacement or re-rolled disc; slots 1–3 count as much as 4–6),
//   • a different 2-piece.
import { BUILDS } from '../data/builds.js';
import { SET_FIT } from '../data/discFit.js';
import { DISC_MAIN_STATS, DRIVE_DISC_BY_ID, DRIVE_DISC_SETS } from '../data/game.js';
import { subPriority } from './builds.js';
import { discBonuses, normaliseDiscs } from './discs.js';
import { estimateStats } from './statEstimate.js';
import { fmt } from './statGoals.js';

// The disc main stat and substat that raise each goal stat.
const MAIN_FOR = { ATK: 'ATK%', HP: 'HP%', DEF: 'DEF%', 'CRIT Rate': 'CRIT Rate', 'CRIT DMG': 'CRIT DMG', 'Anomaly Proficiency': 'Anomaly Proficiency', 'Anomaly Mastery': 'Anomaly Mastery', 'Energy Regen': 'Energy Regen', Impact: 'Impact', 'PEN Ratio': 'PEN Ratio' };
const SUB_FOR = { ATK: 'ATK%', HP: 'HP%', DEF: 'DEF%', 'CRIT Rate': 'CRIT Rate', 'CRIT DMG': 'CRIT DMG', 'Anomaly Proficiency': 'Anomaly Proficiency' };
const TWO_FOR = { ATK: 'atk', HP: 'hp', DEF: 'def', 'CRIT Rate': 'critRate', 'CRIT DMG': 'critDmg', 'Anomaly Proficiency': 'ap', 'Anomaly Mastery': 'am', 'Energy Regen': 'er', Impact: 'impact', 'PEN Ratio': 'pen' };
const MAIN_LABEL = { 'Attribute DMG': 'Attribute DMG' };

const copy = (lo) => ({ ...lo, discs: normaliseDiscs(lo.discs ?? []).map((d) => ({ ...d, subs: (d.subs ?? []).map((x) => ({ ...x })) })) });
const rolls = (subs) => subs.reduce((n, x) => n + 1 + (x.up ?? 0), 0);

/**
 * Up to 4 options for the stats furthest short, best first:
 * [{ stat, text, reaches, gain }]. `mine` is what the bars show (typed or
 * worked out); typed numbers shift the estimate so the "after" figures match.
 */
export function statFixes(agentId, loadout, core, goals, mine) {
  const base = estimateStats(agentId, loadout, core);
  if (!base) return [];
  const short = goals
    .filter((g) => Number.isFinite(mine[g.stat]) && mine[g.stat] < g.value && base[g.stat] != null)
    .sort((a, b) => (b.value - mine[b.stat]) / b.value - (a.value - mine[a.stat]) / a.value);
  if (!short.length) return [];
  // Stats the build guide lists at all count as useful; anything else is an off-stat.
  const fav = new Set(subPriority(agentId).keys());
  const rec = BUILDS[agentId];
  const shift = (stat) => (mine[stat] ?? base[stat]) - base[stat];
  const after = (est, stat) => est[stat] + shift(stat);
  // Other goals a change would push under their target.
  const hurts = (est) =>
    goals.filter((g) => Number.isFinite(mine[g.stat]) && mine[g.stat] >= g.value && after(est, g.stat) < g.value).map((g) => g.stat);

  const out = [];
  for (const g of short.slice(0, 2)) {
    const opts = [];
    const judge = (lo, label, cost, kind) => {
      const est = estimateStats(agentId, lo, core);
      const gain = est[g.stat] - base[g.stat];
      if (gain <= 0) return;
      const now = after(est, g.stat);
      const reaches = now >= g.value;
      const broken = hurts(est);
      const bits = [`${label}: ${g.stat} +${fmt(gain, g.pct)}`];
      bits.push(reaches ? 'reaches the goal' : `still ${fmt(g.value - now, g.pct)} short`);
      let text = `${bits[0]} (${bits[1]})`;
      if (cost) text += `. ${cost}`;
      if (broken.length) text += `. ${broken.join(' and ')} would drop under ${broken.length > 1 ? 'their goals' : 'its goal'}`;
      opts.push({ stat: g.stat, kind, cost, text: `${text}.`, reaches: reaches && !broken.length, gain: gain / g.value, lo });
    };

    // 1. Main stat on slots 4–6.
    const want = MAIN_FOR[g.stat];
    [4, 5, 6].forEach((slot) => {
      const lo = copy(loadout);
      const d = lo.discs[slot - 1];
      if (!DISC_MAIN_STATS[slot].includes(want) || d.main === want) return;
      const old = d.main;
      d.main = want;
      d.subs = d.subs.filter((x) => x.stat !== want);
      const used = old && (fav.has(old) || (rec?.main?.[slot] ?? '').includes(old));
      const cost = old
        ? `You’d lose ${MAIN_LABEL[old] ?? old} on slot ${slot}${used ? ', which they use too, so only if the goal matters more' : ''}`
        : '';
      judge(lo, `Slot ${slot} main stat ${want}`, cost, 'main');
    });

    // 2. One disc's off-stat rolls on the stat you need (any slot, 1–6).
    const sub = SUB_FOR[g.stat];
    if (sub) {
      loadout.discs?.forEach((_, i) => {
        const lo = copy(loadout);
        const d = lo.discs[i];
        const mainHere = i < 3 ? null : d.main;
        if (mainHere === sub || i < 3 && sub === ['HP', 'ATK', 'DEF'][i]) return;
        const dead = d.subs.filter((x) => !fav.has(x.stat) && x.stat !== sub);
        const n = rolls(dead);
        if (n < 2) return;
        const had = d.subs.find((x) => x.stat === sub);
        d.subs = d.subs.filter((x) => !dead.includes(x));
        if (had) had.up = (had.up ?? 0) + n;
        else d.subs.push({ stat: sub, up: n - 1 });
        const what = dead.map((x) => `${x.stat}${x.up ? ` +${x.up}` : ''}`).join(', ');
        judge(lo, `Slot ${i + 1} with its ${n} rolls on ${what} landing on ${sub} instead (a replacement or re-rolled disc)`, '', 'sub');
      });
    }

    // 3. The 2-piece.
    const { four, twos } = discBonuses(normaliseDiscs(loadout.discs ?? []));
    const two = twos.find((id) => id !== four);
    const key = TWO_FOR[g.stat];
    if (two && SET_FIT[two]?.two !== key) {
      DRIVE_DISC_SETS.filter((s) => SET_FIT[s.id]?.two === key && s.id !== four)
        .slice(0, 1)
        .forEach((s) => {
          const lo = copy(loadout);
          lo.discs.forEach((d) => d.set === two && (d.set = s.id));
          const sameKey = DRIVE_DISC_SETS.filter((x) => SET_FIT[x.id]?.two === key && x.id !== four).map((x) => x.name);
          judge(lo, `2-piece ${sameKey.join(' / ')} instead of ${DRIVE_DISC_BY_ID[two].name}`, `You’d lose ${DRIVE_DISC_BY_ID[two].twoPiece}`, 'two');
        });
    }

    opts.sort((a, b) => b.reaches - a.reaches || b.gain - a.gain);
    // Keep the best of each kind (main stat, substats, 2-piece) so the
    // alternatives stay distinct.
    const picks = ['main', 'sub', 'two'].map((k) => opts.find((o) => o.kind === k)).filter(Boolean);
    // No single change gets there: try the two biggest that touch different discs.
    if (picks.length > 1 && !picks.some((o) => o.reaches)) {
      const orig = normaliseDiscs(loadout.discs ?? []);
      const changed = (lo) => lo.discs.map((d, i) => (JSON.stringify(d) !== JSON.stringify(orig[i]) ? i : -1)).filter((i) => i >= 0);
      const ranked = [...opts].sort((a, b) => b.gain - a.gain);
      let best = null;
      for (let i = 0; i < ranked.length && !best; i++)
        for (let j = i + 1; j < ranked.length && !best; j++) {
          const A = changed(ranked[i].lo);
          const B = changed(ranked[j].lo);
          if (B.some((x) => A.includes(x))) continue;
          const both = copy(ranked[i].lo);
          B.forEach((x) => (both.discs[x] = { ...ranked[j].lo.discs[x], subs: ranked[j].lo.discs[x].subs.map((y) => ({ ...y })) }));
          const est = estimateStats(agentId, both, core);
          const now = after(est, g.stat);
          const broken = hurts(est);
          if (now >= g.value && !broken.length) best = { i, j, now };
          else if (i === 0 && j === 1) best = { i, j, now, broken, partial: true };
        }
      if (best) {
        const name = (o) => o.text.split(':')[0];
        picks.push({
          stat: g.stat,
          kind: 'combo',
          text: `${name(ranked[best.i])} + ${name(ranked[best.j]).replace(/^Slot/, 'slot')}: ${g.stat} ${fmt(best.now, g.pct)} (${best.now >= g.value ? 'reaches the goal' : `still ${fmt(g.value - best.now, g.pct)} short`}).`,
          reaches: !best.partial,
          gain: (best.now - mine[g.stat]) / g.value,
          cost: [ranked[best.i].cost, ranked[best.j].cost].filter(Boolean).map((c) => c.replace(/^You’d lose /, '').replace(/, which.*$/, '')).join(' and '),
        });
      }
    }
    picks.forEach((o) => o.kind === 'combo' && o.cost && (o.text = o.text.replace(/\.$/, `. You’d lose ${o.cost}.`)));
    picks.sort((a, b) => b.reaches - a.reaches || b.gain - a.gain);
    out.push(...picks.slice(0, g === short[0] ? 4 : 1));
  }
  return out.map(({ lo, ...o }) => o);
}
