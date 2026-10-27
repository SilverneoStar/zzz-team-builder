import { useMemo, useState } from 'react';
import { AGENTS } from '../data/game.js';
import ExportIcon from './ExportIcon.jsx';
import { emptyMine, hasMine } from '../lib/myEndgame.js';

// Released Agents, by name, for the team pickers.
const OPTIONS = AGENTS.filter((a) => !a.upcoming)
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name));

function TeamPick({ value, onChange, taken, label }) {
  return (
    <div className="eg-mine__slots" role="group" aria-label={label}>
      {value.map((id, k) => (
        <select
          key={k}
          className="eg-mine__select"
          value={id ?? ''}
          aria-label={`${label}, slot ${k + 1}`}
          onChange={(e) => onChange(value.map((x, j) => (j === k ? e.target.value || null : x)))}
        >
          <option value="">Slot {k + 1}</option>
          {OPTIONS.map((a) => (
            <option key={a.id} value={a.id} disabled={a.id !== id && (taken.has(a.id) || value.includes(a.id))}>
              {a.name}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}

function Score({ value, onChange, label }) {
  return (
    <label className="eg-mine__score">
      <span>Score</span>
      <input
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        placeholder="Optional"
        aria-label={`${label} score`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Math.max(0, Math.round(Number(e.target.value))))}
      />
    </label>
  );
}

/**
 * "Your teams": the reader fills in the teams they used (or suggest) for each
 * boss or room, with an optional buff and score, and exports them as a card.
 * Agents can't repeat across the main targets, as in the game.
 */
export default function MyEndgameTeams({ targets, buffs, bonus, mine, onChange, onExport }) {
  const set = (patch) => onChange({ ...mine, ...patch });
  // Folded until opened, unless the reader already filled something in.
  const [open, setOpen] = useState(() => hasMine(mine));
  const takenBy = useMemo(
    () => mine.teams.map((_, i) => new Set(mine.teams.flatMap((t, j) => (j === i ? [] : t.filter(Boolean))))),
    [mine.teams],
  );

  return (
    <details className="eg-mine" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="eg-mine__summary">
        <span className="mini-title">Your teams</span>
        <span className="muted small">Share the teams you used or suggest</span>
      </summary>
      <p className="muted small">
        Fill in the teams you cleared with, or the ones you’d suggest, and share them as a card. Saved in this browser.
      </p>
      <div className="chips" role="radiogroup" aria-label="Card says">
        {[
          ['used', 'Teams I used'],
          ['suggest', 'Teams I suggest'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="radio"
            className="chip"
            aria-checked={mine.kind === id}
            aria-pressed={mine.kind === id}
            onClick={() => set({ kind: id })}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="eg-mine__rows">
        {targets.map((t, i) => (
          <div key={i} className="eg-mine__row">
            <div className="eg-mine__head">
              <b>{t.label}</b> <span className="muted">{t.name}</span>
            </div>
            <TeamPick
              label={t.label}
              value={mine.teams[i]}
              taken={takenBy[i]}
              onChange={(team) => set({ teams: mine.teams.map((x, j) => (j === i ? team : x)) })}
            />
            <div className="eg-mine__extra">
              {buffs && (
                <label className="eg-mine__buff">
                  <span>Buff</span>
                  <select
                    value={mine.buffs[i] ?? ''}
                    onChange={(e) => set({ buffs: mine.buffs.map((x, j) => (j === i ? e.target.value || null : x)) })}
                  >
                    <option value="">Not set</option>
                    {buffs.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <Score
                label={t.label}
                value={mine.scores[i]}
                onChange={(v) => set({ scores: mine.scores.map((x, j) => (j === i ? v : x)) })}
              />
            </div>
          </div>
        ))}
        {bonus && (
          <div className="eg-mine__row eg-mine__row--bonus">
            <div className="eg-mine__head">
              <b>{bonus.title}</b> <span className="muted">{bonus.name}</span>
            </div>
            <TeamPick
              label={bonus.title}
              value={mine.bonus}
              taken={new Set()}
              onChange={(team) => set({ bonus: team })}
            />
            <div className="eg-mine__extra">
              <Score label={bonus.title} value={mine.bonusScore} onChange={(v) => set({ bonusScore: v })} />
            </div>
          </div>
        )}
      </div>

      <div className="eg-mine__actions">
        <button className="btn btn--primary" onClick={onExport} disabled={!hasMine(mine)}>
          <ExportIcon />
          Export my card
        </button>
        <button
          className="btn btn--quiet"
          onClick={() => onChange(emptyMine(targets.length))}
          disabled={!hasMine(mine)}
        >
          Clear
        </button>
      </div>
    </details>
  );
}
