import { useState } from 'react';
import { PRESETS } from '../data/presets.js';
import { decodeTeam, encodeTeam } from '../lib/share.js';
import { decodeCardCode, encodeCardCode } from '../lib/cardCode.js';
import { loadoutOf } from '../lib/teamsReducer.js';

export default function SharePanel({ team, dispatch }) {
  const code = encodeTeam(team, loadoutOf);
  const cardCode = encodeCardCode(team, loadoutOf);
  const link = `${window.location.origin}${window.location.pathname}#${code}`;
  const [copied, setCopied] = useState(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  async function copy(text, fieldId) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(fieldId);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard blocked: select the text so it can be copied by hand.
      document.getElementById(fieldId)?.select();
    }
  }

  function importCode(e) {
    e.preventDefault();
    const raw = input.includes('#') ? input.slice(input.indexOf('#') + 1) : input;
    const t = decodeCardCode(raw) ?? decodeTeam(raw);
    if (!t) {
      setError('That code isn’t valid. Paste a short team code, a code starting with zzz2~ or a team link.');
      return;
    }
    setError('');
    setInput('');
    dispatch({ type: 'import', ...t });
  }

  return (
    <section className="share" aria-labelledby="share-title">
      <h2 id="share-title" className="section-title">Presets &amp; sharing</h2>

      <label className="field">
        <span>Load a community preset into this team</span>
        <select
          id="preset"
          value=""
          onChange={(e) => {
            const p = PRESETS[Number(e.target.value)];
            if (p) dispatch({ type: 'loadPreset', ...p });
          }}
        >
          <option value="" disabled>Choose a preset…</option>
          {PRESETS.map((p, i) => <option key={p.name} value={i}>{p.name}</option>)}
        </select>
      </label>

      <div className="field">
        <label htmlFor="card-code">Short code <span className="muted">· the one printed on team images</span></label>
        <div className="code-row">
          <input id="card-code" className="code" readOnly value={cardCode} onFocus={(e) => e.target.select()} />
          <button className="btn" onClick={() => copy(cardCode, 'card-code')}>{copied === 'card-code' ? 'Copied' : 'Copy'}</button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="team-code">Full team code <span className="muted">· squad, Bangboo and gear</span></label>
        <div className="code-row">
          <input id="team-code" className="code" readOnly value={code} onFocus={(e) => e.target.select()} />
          <button className="btn" onClick={() => copy(code, 'team-code')}>{copied === 'team-code' ? 'Copied' : 'Copy'}</button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="team-link">Team link <span className="muted">· opens straight into the builder</span></label>
        <div className="code-row">
          <input id="team-link" className="code" readOnly value={link} onFocus={(e) => e.target.select()} />
          <button className="btn" onClick={() => copy(link, 'team-link')}>{copied === 'team-link' ? 'Copied' : 'Copy'}</button>
        </div>
      </div>

      <form className="field" onSubmit={importCode}>
        <label htmlFor="import-code">Paste a friend’s code or link</label>
        <div className="code-row">
          <input
            id="import-code"
            className="code"
            placeholder="Short code or zzz2~…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn" type="submit" disabled={!input.trim()}>Add team</button>
        </div>
        {error && <p className="field__error">{error}</p>}
      </form>
    </section>
  );
}
