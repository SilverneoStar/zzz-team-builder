import { useState } from 'react';
import LoadoutPanel from './LoadoutPanel.jsx';
import ExportIcon from './ExportIcon.jsx';
import { emptyLoadout, loadoutOf } from '../lib/teamsReducer.js';
import { recommendedLoadout } from '../lib/builds.js';
import { buildCode, deleteMyBuild, myBuildOf, readBuildCode, saveMyBuild } from '../lib/myBuilds.js';

// "My build": the reader's own gear for this Agent, saved in this browser.
// It can be shared as a short code, pasted back in, put into the current team
// or exported as a card.
export default function MyBuild({ agent: a, team, inActiveTeam, onApply, onExport }) {
  const [loadout, setLoadout] = useState(() => myBuildOf(a.id));
  const [status, setStatus] = useState('');
  const [paste, setPaste] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const flash = (msg) => {
    setStatus(msg);
    setTimeout(() => setStatus((s) => (s === msg ? '' : s)), 1800);
  };
  const keep = (lo) => {
    setLoadout(lo);
    if (!saveMyBuild(a.id, lo)) flash('Couldn’t save in this browser. It stays until you leave the page.');
  };
  const start = (lo) => {
    keep({ ...emptyLoadout(), ...lo });
    setError('');
  };
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

  const pasteForm = (
    <form className="mybuild__paste" onSubmit={usePaste}>
      <label className="field">
        <span>Paste a build code</span>
        <div className="code-row">
          <input
            className="code"
            value={paste}
            onChange={(e) => { setPaste(e.target.value); setError(''); }}
            placeholder="A short build or team code"
            aria-invalid={Boolean(error)}
          />
          <button className="btn" type="submit" disabled={!paste.trim()}>Load</button>
        </div>
      </label>
      {error && <p className="mybuild__error" role="alert">{error}</p>}
    </form>
  );

  if (!loadout) {
    return (
      <div className="mybuild mybuild--empty">
        <p className="muted">
          Make your own build for {a.name}: pick the W-Engine, Mindscape and each Drive Disc you actually have.
          It’s saved in this browser, and you can share it with a short code or as an image.
        </p>
        <div className="mybuild__starts">
          {recommended && <button className="btn btn--primary" onClick={() => start(recommended)}>Start from the recommended build</button>}
          {inActiveTeam && <button className="btn" onClick={() => start(loadoutOf(team, a.id))}>Copy from current team</button>}
          <button className="btn" onClick={() => start(emptyLoadout())}>Start empty</button>
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
      <div className="mybuild__editor">
        <LoadoutPanel agent={a} loadout={loadout} onChange={(patch) => keep({ ...loadout, ...patch })} onClose={() => {}} />
      </div>

      <div className="field">
        <label htmlFor={`mybuild-code-${a.id}`}>Build code <span className="muted">· paste it into My build or the team builder</span></label>
        <div className="code-row">
          <input id={`mybuild-code-${a.id}`} className="code" readOnly value={code} onFocus={(e) => e.target.select()} />
          <button className="btn" onClick={copyCode}>Copy</button>
        </div>
      </div>

      <div className="mybuild__actions">
        <button className="btn btn--primary" onClick={() => { onApply(a.id, loadout); flash('Put into current team'); }} disabled={!inActiveTeam}>
          {inActiveTeam ? 'Use in current team' : 'Add to a team to use it there'}
        </button>
        <button className="btn" onClick={onExport}><ExportIcon />Export my build</button>
        {confirmDelete ? (
          <>
            <button className="btn btn--danger" onClick={() => { deleteMyBuild(a.id); setLoadout(null); setConfirmDelete(false); }}>Delete it</button>
            <button className="btn btn--quiet" onClick={() => setConfirmDelete(false)}>Keep</button>
          </>
        ) : (
          <button className="btn btn--quiet" onClick={() => setConfirmDelete(true)}>Delete my build</button>
        )}
      </div>
      <p className="mybuild__status muted small" aria-live="polite">{status || 'Saved in this browser.'}</p>

      <details className="mybuild__more">
        <summary>Replace with another build</summary>
        <div className="mybuild__starts">
          {recommended && <button className="btn" onClick={() => { start(recommended); flash('Recommended build loaded'); }}>Recommended build</button>}
          {inActiveTeam && <button className="btn" onClick={() => { start(loadoutOf(team, a.id)); flash('Copied from current team'); }}>Copy from current team</button>}
        </div>
        {pasteForm}
      </details>
    </div>
  );
}
