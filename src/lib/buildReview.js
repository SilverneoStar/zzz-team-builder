// Cortado's review of one Agent's build (My build): how well the slot 4–6
// main stats and the substats suit them. Main stats are checked against the
// recommended build; substats by the Active Modifier Count (rolls on stats the
// Agent favours) against the count a top build reaches for their specialty.
import { AGENT_BY_ID, DRIVE_DISC_BY_ID } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { activeStats, subPriority } from './builds.js';
import { activeRolls, discBonuses, totalRolls } from './discs.js';
import { ACTIVE_FULL, MAIN_PATTERNS, SYNERGY_RANKS, slot5Close } from './synergy.js';

/** Returns { score, rank, notes: [{ tone: 'good'|'warn'|'bad', text }], hasSubs } or null. */
export function reviewBuild(agentId, loadout) {
  const a = AGENT_BY_ID[agentId];
  const b = BUILDS[agentId];
  if (!a || !b || !loadout) return null;
  const discs = loadout.discs ?? [];
  const notes = [];

  // Main stats, slots 4–6.
  let mainOk = 0;
  let mainSet = 0;
  [4, 5, 6].forEach((slot) => {
    const m = discs[slot - 1]?.main;
    const rec = b.main[slot];
    if (!m || !rec) return;
    mainSet += 1;
    const ok = MAIN_PATTERNS[m]?.test(rec) ?? false;
    if (ok) mainOk += 1;
    else if (slot === 5 && slot5Close(a, m, rec)) {
      // Close enough: counts as right, with a word on when it's better or worse.
      mainOk += 1;
      notes.push({
        tone: 'good',
        text:
          m === 'PEN Ratio'
            ? `Slot 5: PEN Ratio is within a few % of ${rec}: better against high-DEF bosses, weaker next to DEF Shred (like Nicole).`
            : `Slot 5: ${m} is within a few % of ${rec} in most content.`,
      });
    } else notes.push({ tone: 'bad', text: `Slot ${slot}: ${m} doesn’t suit them. Go for ${rec}.` });
  });
  if (mainSet && mainOk === mainSet) notes.unshift({ tone: 'good', text: `Main stats on slots 4–6 all match the recommended build.` });
  if (mainSet < 3) notes.push({ tone: 'warn', text: `Set the main stat on ${3 - mainSet === 1 ? 'one more slot' : `${3 - mainSet} more slots`} (4–6) for a full review.` });

  // Set bonuses: a 4-piece set at all.
  const { four } = discBonuses(discs);
  if (!four && discs.some((d) => d.set)) notes.push({ tone: 'warn', text: 'No 4-piece set yet: most builds want one.' });
  else if (four && !b.fourPiece.includes(four))
    notes.push({ tone: 'warn', text: `${DRIVE_DISC_BY_ID[four]?.name} isn’t one of their recommended 4-piece sets.` });

  // Substats.
  const fav = activeStats(agentId);
  const rolls = discs.reduce((n, d) => n + totalRolls(d), 0);
  const active = discs.reduce((n, d) => n + activeRolls(d, fav), 0);
  const target = ACTIVE_FULL[a.specialty];
  const hasSubs = rolls > 0;
  let subScore = null;
  if (hasSubs) {
    const best = [...subPriority(agentId).entries()].filter(([, t]) => t === 0).map(([s]) => s);
    // Judge only the discs with substats entered, so a half-filled build isn't
    // marked down for discs not entered yet.
    const entered = discs.filter((d) => (d.subs ?? []).length).length;
    if (target) {
      const aim = Math.round((target * entered) / 6);
      subScore = Math.min(1, active / aim);
      notes.push({
        tone: active >= aim ? 'good' : active >= aim * 0.75 ? 'warn' : 'bad',
        text:
          entered < 6
            ? `Active modifiers: ${active} of ${rolls} rolls on stats they favour, on the ${entered} disc${entered > 1 ? 's' : ''} entered (aim for about ${aim}; ${target}+ across all six is a top build).`
            : `Active modifiers: ${active} of ${rolls} rolls on stats they favour. A top build is about ${target}+.`,
      });
    } else {
      subScore = rolls ? active / rolls : 0;
      notes.push({ tone: 'warn', text: `Active modifiers: ${active} of ${rolls}. For Supports this says less: buffs and Energy Regen matter more.` });
    }
    // Discs that wasted the most upgrades.
    const weak = discs
      .map((d, i) => ({ slot: i + 1, d, wasted: totalRolls(d) - activeRolls(d, fav) }))
      .filter((x) => x.wasted >= 4)
      .sort((x, y) => y.wasted - x.wasted);
    weak.slice(0, 2).forEach(({ slot, d, wasted }) => {
      const off = (d.subs ?? []).filter((x) => !fav.has(x.stat)).map((x) => `${x.stat}${x.up ? ` +${x.up}` : ''}`);
      notes.push({ tone: 'bad', text: `Slot ${slot}: ${wasted} of ${totalRolls(d)} rolls on ${off.join(', ')}. Worth replacing.` });
    });
    if (best.length && !discs.some((d) => (d.subs ?? []).some((x) => best.includes(x.stat))))
      notes.push({ tone: 'warn', text: `None of their top substats (${best.join(', ')}) yet.` });
  } else {
    notes.push({ tone: 'warn', text: 'Add substats to your discs (tap a disc slot) and Cortado will rate them too.' });
  }

  if (!mainSet && !hasSubs) return { score: null, rank: null, notes, hasSubs };
  const mainScore = mainSet ? mainOk / 3 : 0;
  const score = Math.round((hasSubs ? mainScore * 0.4 + subScore * 0.6 : mainScore) * 100);
  const rank = SYNERGY_RANKS.find((r) => score >= r.min).rank;
  return { score, rank, notes, hasSubs };
}
