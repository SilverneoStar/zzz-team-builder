import { useState } from 'react';
import { BUILDS } from '../data/builds.js';
import { SET_FIT } from '../data/discFit.js';
import { DRIVE_DISC_BY_ID, DRIVE_DISC_SETS } from '../data/game.js';
import { STAT_TARGETS } from '../data/statTargets.js';
import { fmt, goalsOf, loadMyStats, saveMyStats, suggestions, twoPieceTip } from '../lib/statGoals.js';
import { estimateStats } from '../lib/statEstimate.js';
import { statFixes } from '../lib/statFixes.js';
import { myBuildOf, myExtrasOf } from '../lib/myBuilds.js';

const VIEW_KEY = 'zzz-team-builder:statprogView';

// "Stat progress": the player types their stats from the Agent screen and sees
// a bar for each goal, plus what to work on next.
// Stats come from what you type; anything left blank is worked out from the
// build in view (or your active saved / UID-imported build) when there is one.
export default function StatProgress({ agent, compact = false, loadout, core }) {
  const from = STAT_TARGETS[agent.id]?.goalsFrom;
  const goals = goalsOf(agent.id);
  const [mine, setMine] = useState(() => loadMyStats(agent.id));
  const [shownFor, setShownFor] = useState(agent.id);
  const [detailed, setDetailed] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === 'detailed';
    } catch {
      return false;
    }
  });
  if (shownFor !== agent.id) {
    setShownFor(agent.id);
    setMine(loadMyStats(agent.id));
  }
  if (!goals.length) return null;
  const lo = loadout ?? myBuildOf(agent.id);
  const coreLv = core !== undefined ? core : myExtrasOf(agent.id).core;
  const est = estimateStats(agent.id, lo, coreLv);
  const typedOnly = mine;
  // What the bars, tips and 2-piece pick use: typed first, then the build.
  const eff = { ...Object.fromEntries(goals.filter((g) => est?.[g.stat] != null).map((g) => [g.stat, est[g.stat]])), ...typedOnly };
  const fromBuild = (stat) => !Number.isFinite(typedOnly[stat]) && est?.[stat] != null;
  const set = (stat, raw) => {
    const v = parseFloat(String(raw).replace(/[,%\s]/g, ''));
    const next = { ...mine };
    if (Number.isFinite(v)) next[stat] = v;
    else delete next[stat];
    setMine(next);
    saveMyStats(agent.id, next);
  };
  const tips = suggestions(goals, eff);
  const two = twoPieceTip(BUILDS[agent.id], SET_FIT, DRIVE_DISC_BY_ID, DRIVE_DISC_SETS, goals, eff);
  const fixes = est ? statFixes(agent.id, lo, coreLv, goals, eff) : [];
  const typed = goals.filter((g) => Number.isFinite(eff[g.stat]));
  const met = typed.filter((g) => eff[g.stat] >= g.value);
  const focus = tips.find((t) => t.kind === 'focus');
  const focusGoal = focus && goals.find((g) => g.stat === focus.stat);
  const toggle = () => {
    const v = !detailed;
    setDetailed(v);
    try {
      localStorage.setItem(VIEW_KEY, v ? 'detailed' : 'simple');
    } catch {
      /* fine: the choice just isn't remembered */
    }
  };
  return (
    <div className={`statprog${detailed ? ' is-detailed' : ''}`}>
      <div className="statprog__head">
        {!compact && <span className="micro-title">Stat progress</span>}
        {typed.length > 0 && (
          <span className={`statprog__count${met.length === goals.length ? ' is-done' : ''}`}>
            {met.length}/{goals.length} goals
          </span>
        )}
        <button type="button" className="statprog__toggle" aria-expanded={detailed} onClick={toggle}>
          {detailed ? 'Simple' : 'Details'}
        </button>
      </div>
      {goals.map((g) => {
        const have = eff[g.stat];
        const est1 = fromBuild(g.stat);
        const pct = Number.isFinite(have) ? Math.min(100, (have / g.value) * 100) : 0;
        const done = Number.isFinite(have) && have >= g.value;
        return (
          <div
            key={g.stat}
            className={`statprog__row${done ? ' is-done' : ''}${est1 ? ' is-est' : ''}`}
            title={est1 ? 'Worked out from your build: type to use your in-game number instead' : g.hint || undefined}
          >
            <span className="statprog__label">{g.stat}</span>
            <label className="statprog__bar">
              <span className="statprog__fill" style={{ width: `${pct}%` }} />
              <span className="statprog__nums">
                <input
                  inputMode="decimal"
                  aria-label={`Your ${g.stat}`}
                  placeholder={est1 ? String(have) : 'yours'}
                  defaultValue={Number.isFinite(typedOnly[g.stat]) ? typedOnly[g.stat] : ''}
                  key={`${agent.id}-${g.stat}`}
                  onChange={(e) => set(g.stat, e.target.value)}
                />
                <span>/ {fmt(g.value, g.pct)}</span>
              </span>
            </label>
            <span className="statprog__tick" aria-label={done ? 'Reached' : 'Not yet'}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M7 12.5l3.2 3.2L17 9" />
              </svg>
            </span>
          </div>
        );
      })}

      {goals.some((g) => fromBuild(g.stat)) && (
        <p className="muted small statprog__hint">
          <span className="statprog__estdot" aria-hidden="true" /> Faded numbers are worked out from your build (Lv.60,
          out of combat). Type your in-game number to replace one.
        </p>
      )}
      {typed.length === 0 ? (
        <p className="muted small statprog__hint">Tap a bar and type your stat from the Agent screen.</p>
      ) : (
        <dl className="statprog__sum">
          <div>
            <dt>Next</dt>
            <dd>
              {focus
                ? `${focus.stat} · ${fmt(focusGoal.value - eff[focus.stat], focusGoal.pct)} to go`
                : met.length === goals.length
                  ? 'All goals met'
                  : 'Type the rest of your stats'}
            </dd>
          </div>
          {two && (
            <div>
              <dt>2-piece</dt>
              <dd>{two.pick}</dd>
            </div>
          )}
        </dl>
      )}
      {fixes.length > 0 && !detailed && (
        <p className="small statprog__fix">
          <b>Best fix · </b>
          {fixes[0].text}
        </p>
      )}

      {detailed && (
        <div className="statprog__more">
          {tips.length > 0 && (
            <>
              <span className="statprog__sub">What to work on</span>
              <ul className="statprog__tips">
                {tips.map((t) => (
                  <li key={t.stat} className={`is-${t.kind}`}>
                    <b>{t.stat}</b> {t.text}
                  </li>
                ))}
              </ul>
            </>
          )}
          {fixes.length > 0 && (
            <>
              <span className="statprog__sub">Ways to close the gap (worked out from your discs)</span>
              <ul className="statprog__tips statprog__fixes">
                {fixes.map((f) => (
                  <li key={f.text} className={f.reaches ? 'is-reach' : ''}>
                    {f.text}
                  </li>
                ))}
              </ul>
            </>
          )}
          {two && (
            <>
              <span className="statprog__sub">Why this 2-piece</span>
              <p className="small statprog__two">{two.text}</p>
            </>
          )}
          <p className="muted small">
            {from ? `Goals from ${from}: aim for at least these.` : 'Goals are the top of the guide’s range.'} Type your
            stats from the Agent screen. A loose guide: your W-Engine, team buffs and which discs you own change the
            best pick, and a balanced build that fits your team still comes first.
          </p>
        </div>
      )}
    </div>
  );
}
