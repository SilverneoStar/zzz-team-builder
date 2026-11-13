import { useState } from 'react';
import LoadoutPanel from './LoadoutPanel.jsx';
import BuildReview from './BuildReview.jsx';
import ScreenshotReader from './ScreenshotReader.jsx';
import ExportIcon from './ExportIcon.jsx';
import { emptyLoadout, loadoutOf } from '../lib/teamsReducer.js';
import { recommendedLoadout } from '../lib/builds.js';
import {
  MAX_BUILDS,
  NOTE_MAX,
  noteMyBuild,
  SKILL_ORDER,
  CORE_LETTERS,
  skillsMyBuild,
  addMyBuild,
  buildCode,
  buildsOf,
  deleteMyBuild,
  readBuildCode,
  renameMyBuild,
  saveMyBuild,
  setActiveBuild,
} from '../lib/myBuilds.js';
import { loadoutOf as fillLoadout } from '../lib/teamsReducer.js';

const SKILL_NAMES = { basic: 'Basic', dodge: 'Dodge', assist: 'Assist', special: 'Special', chain: 'Chain' };

// "My build": the reader's own gear for this Agent, saved in this browser.
// Several builds per Agent (one active): each can be shared as a short code,
// pasted back in, put into the current team or exported as a card.
export default function MyBuild({ agent: a, team, inActiveTeam, onApply, onExport }) {
  const [book, setBook] = useState(() => buildsOf(a.id));
  const [adding, setAdding] = useState(false);
  const current = book.builds.find((b) => b.id === book.active);
  const loadout = adding || !current ? null : fillLoadout({ loadouts: { [a.id]: current.loadout } }, a.id);
  const refresh = () => setBook(buildsOf(a.id));
  const [status, setStatus] = useState('');
  const [paste, setPaste] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const flash = (msg) => {
    setStatus(msg);
    setTimeout(() => setStatus((s) => (s === msg ? '' : s)), 1800);
  };
  const keep = (lo) => {
    if (!saveMyBuild(a.id, lo)) flash('Couldn’t save in this browser.');
    refresh();
  };
  // A new build when adding one (or there's none yet), else it replaces the current one.
  const start = (lo) => {
    const full = { ...emptyLoadout(), ...lo };
    let id = current?.id ?? null;
    if (adding || !current) {
      const r = addMyBuild(a.id, full);
      if (!r.ok) flash('Couldn’t save in this browser.');
      id = r.id;
      refresh();
    } else keep(full);
    setAdding(false);
    setError('');
    return id;
  };
  const pick = (id) => {
    setActiveBuild(a.id, id);
    setAdding(false);
    refresh();
  };

  // Tabs for the saved builds, plus "New build".
  const switcher = book.builds.length > 0 && (
    <div className="mybuild__switch" role="tablist" aria-label={`${a.name}’s builds`}>
      {book.builds.map((b) => (
        <button
          key={b.id}
          role="tab"
          aria-selected={!adding && b.id === book.active}
          className={`chip${!adding && b.id === book.active ? ' chip--on' : ''}`}
          onClick={() => pick(b.id)}
        >
          {b.name}
        </button>
      ))}
      <button
        className={`chip chip--add${adding ? ' chip--on' : ''}`}
        onClick={() => setAdding(true)}
        disabled={book.builds.length >= MAX_BUILDS}
        title={book.builds.length >= MAX_BUILDS ? `Up to ${MAX_BUILDS} builds per Agent` : undefined}
      >
        + New build
      </button>
    </div>
  );
  const recommended = recommendedLoadout(a.id);

  function usePaste(e) {
    e.preventDefault();
    const r = readBuildCode(a.id, paste);
    if (r.error) {
      setError(r.error);
      return;
    }
    setPaste('');
    start(r.loadout);
    flash('Build loaded');
  }

  // A code read from an image: the same as pasting it.
  function useImageCode(t) {
    const lo = t.loadouts?.[a.id];
    if (!lo) {
      setError(`That image’s code doesn’t include ${a.name}.`);
      return;
    }
    start(lo);
    flash('Build loaded from the image');
  }

  const pasteForm = (
    <form className="mybuild__paste" onSubmit={usePaste}>
      <label className="field">
        <span>Paste a build code</span>
        <div className="code-row">
          <input
            className="code"
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value);
              setError('');
            }}
            placeholder="A short build or team code"
            aria-invalid={Boolean(error)}
          />
          <button className="btn" type="submit" disabled={!paste.trim()}>
            Load
          </button>
        </div>
      </label>
      {error && (
        <p className="mybuild__error" role="alert">
          {error}
        </p>
      )}
      <ScreenshotReader
        agent={a}
        loadout={loadout ?? { ...emptyLoadout(), ...(recommended ?? {}) }}
        onBuild={(lo, extra) => {
          const id = start(lo);
          if (id && extra?.levels) {
            skillsMyBuild(a.id, id, { skills: Object.fromEntries(SKILL_ORDER.map((k, i) => [k, extra.levels[i] ?? null])) });
            refresh();
          }
          flash('Build filled from your screenshots');
        }}
        onCode={useImageCode}
      />
    </form>
  );

  if (!loadout) {
    return (
      <div className="mybuild mybuild--empty">
        {switcher}
        <p className="muted">
          {adding
            ? `A new build for ${a.name}, next to your others (up to ${MAX_BUILDS}). Start it one of these ways:`
            : `Make your own build for ${a.name}: pick the W-Engine, Mindscape and each Drive Disc you actually have. It’s saved in this browser, and you can share it with a short code or as an image. You can keep up to ${MAX_BUILDS} builds per Agent.`}
        </p>
        <div className="mybuild__starts">
          {recommended && (
            <button className="btn btn--primary" onClick={() => start(recommended)}>
              Start from the recommended build
            </button>
          )}
          {inActiveTeam && (
            <button className="btn" onClick={() => start(loadoutOf(team, a.id))}>
              Copy from current team
            </button>
          )}
          <button className="btn" onClick={() => start(emptyLoadout())}>
            Start empty
          </button>
          {adding && (
            <button className="btn btn--quiet" onClick={() => setAdding(false)}>
              Cancel
            </button>
          )}
        </div>
        {pasteForm}
      </div>
    );
  }

  const code = buildCode(a.id, loadout);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      flash('Code copied');
    } catch {
      document.getElementById(`mybuild-code-${a.id}`)?.select();
    }
  }

  return (
    <div className="mybuild">
      {switcher}
      <div className="mybuild__top">
      <label className="field mybuild__name">
        <span>Build name</span>
        <input
          value={current.name}
          maxLength={24}
          onChange={(e) => {
            renameMyBuild(a.id, current.id, e.target.value);
            refresh();
          }}
          onBlur={(e) => {
            if (!e.target.value.trim()) {
              renameMyBuild(a.id, current.id, `Build ${book.builds.indexOf(current) + 1}`);
              refresh();
            }
          }}
        />
      </label>
        <div className="mybuild__delete">
        {confirmDelete ? (
          <>
            <button
              className="btn btn--danger"
              onClick={() => {
                deleteMyBuild(a.id, current.id);
                refresh();
                setConfirmDelete(false);
                flash(`${current.name} deleted`);
              }}
            >
              Delete it
            </button>
            <button className="btn btn--quiet" onClick={() => setConfirmDelete(false)}>
              Keep
            </button>
          </>
        ) : (
          <button className="btn btn--quiet" onClick={() => setConfirmDelete(true)}>
            Delete this build
          </button>
        )}
        </div>
      </div>
      <label className="field mybuild__note">
        <span>
          Notes <span className="muted">· shown on the build image</span>
        </span>
        <textarea
          rows={2}
          maxLength={NOTE_MAX}
          value={current.note ?? ''}
          placeholder="e.g. Shiyu Room 1 build, still farming a CRIT Rate disc 4"
          onChange={(e) => {
            noteMyBuild(a.id, current.id, e.target.value);
            refresh();
          }}
        />
      </label>
      <fieldset className="mybuild__skills">
        <legend>
          Skills <span className="muted">· shown on the build image</span>
        </legend>
        {SKILL_ORDER.map((k) => (
          <label key={k} className="mybuild__skill">
            <img src={`${import.meta.env.BASE_URL}skills/${k}.webp`} alt="" width="28" height="28" />
            <span>{SKILL_NAMES[k]}</span>
            <select
              value={current.skills?.[k] ?? ''}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null;
                skillsMyBuild(a.id, current.id, { skills: { ...(current.skills ?? {}), [k]: v } });
                refresh();
              }}
            >
              <option value="">–</option>
              {Array.from({ length: 16 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label className="mybuild__skill">
          <img src={`${import.meta.env.BASE_URL}skills/core.webp`} alt="" width="28" height="28" />
          <span>Core Skill</span>
          <select
            value={current.core ?? ''}
            onChange={(e) => {
              skillsMyBuild(a.id, current.id, { core: e.target.value === '' ? null : Number(e.target.value) });
              refresh();
            }}
          >
            <option value="">–</option>
            {CORE_LETTERS.map((l, i) => (
              <option key={l} value={i}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      <div className="mybuild__editor">
        <LoadoutPanel
          agent={a}
          loadout={loadout}
          onChange={(patch) => keep({ ...loadout, ...patch })}
          onClose={() => {}}
        />
      </div>

      <BuildReview agentId={a.id} loadout={loadout} />

      <div className="field">
        <label htmlFor={`mybuild-code-${a.id}`}>
          Build code <span className="muted">· paste it into My build or the team builder</span>
        </label>
        <div className="code-row">
          <input
            id={`mybuild-code-${a.id}`}
            className="code"
            readOnly
            value={code}
            onFocus={(e) => e.target.select()}
          />
          <button className="btn" onClick={copyCode}>
            Copy
          </button>
        </div>
      </div>

      <div className="mybuild__actions">
        <button
          className="btn btn--primary"
          onClick={() => {
            onApply(a.id, loadout);
            flash('Put into current team');
          }}
          disabled={!inActiveTeam}
        >
          {inActiveTeam ? 'Use in current team' : 'Add to a team to use it there'}
        </button>
        <button className="btn" onClick={onExport}>
          <ExportIcon />
          Export my build
        </button>
      </div>
      <p className="mybuild__status muted small" aria-live="polite">
        {status || 'Saved in this browser.'}
      </p>

      <details className="mybuild__more">
        <summary>Replace this build</summary>
        <div className="mybuild__starts">
          {recommended && (
            <button
              className="btn"
              onClick={() => {
                start(recommended);
                flash('Recommended build loaded');
              }}
            >
              Recommended build
            </button>
          )}
          {inActiveTeam && (
            <button
              className="btn"
              onClick={() => {
                start(loadoutOf(team, a.id));
                flash('Copied from current team');
              }}
            >
              Copy from current team
            </button>
          )}
        </div>
        {pasteForm}
      </details>
    </div>
  );
}
