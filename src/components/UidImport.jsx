import { useState } from 'react';
import { AGENT_BY_ID } from '../data/game.js';
import { fetchShowcase, validUid } from '../lib/enka.js';

const KEY = 'zzz-team-builder:uid';
const CORE = ['none', 'A', 'B', 'C', 'D', 'E', 'F'];
const remembered = () => {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
};

// "Import from UID": the player's in-game Agent Showcase, read through
// Enka.Network. Fills this Agent's build (gear, skill levels, Core Skill) when
// they're in the showcase. Sits inside My build's paste form, so no <form>.
export default function UidImport({ agent, onBuild }) {
  const [uid, setUid] = useState(remembered);
  const [state, setState] = useState({ busy: false, error: '', found: null });

  const load = async () => {
    const u = uid.trim();
    if (!validUid(u)) {
      setState({ busy: false, error: 'A UID is 8 to 10 digits (Profile in the game, or the corner of any screen).', found: null });
      return;
    }
    try {
      localStorage.setItem(KEY, u);
    } catch {
      /* not saved: fine */
    }
    setState({ busy: true, error: '', found: null });
    try {
      setState({ busy: false, error: '', found: await fetchShowcase(u) });
    } catch (e) {
      setState({ busy: false, error: e.message, found: null });
    }
  };

  const found = state.found;
  const me = found?.agents.find((x) => x.agentId === agent.id);
  const others = found?.agents.filter((x) => x.agentId !== agent.id).map((x) => AGENT_BY_ID[x.agentId]?.name ?? 'an Agent the site doesn’t have yet');

  return (
    <div className="uidimport">
      <label className="field">
        <span>Import from your UID</span>
        <div className="code-row">
          <input
            className="code"
            inputMode="numeric"
            value={uid}
            onChange={(e) => {
              setUid(e.target.value.replace(/\D/g, '').slice(0, 10));
              setState((s) => ({ ...s, error: '' }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                load();
              }
            }}
            placeholder="Your in-game UID"
            aria-invalid={Boolean(state.error)}
          />
          <button className="btn" type="button" onClick={load} disabled={state.busy || !uid}>
            {state.busy ? 'Loading…' : 'Look up'}
          </button>
        </div>
      </label>
      <p className="muted micro">
        Reads the Agents in your in-game showcase (Profile → Agent Showcase) through Enka.Network: gear, skill levels and
        Core Skill. Changes in the game show up after a few minutes.
      </p>
      {state.error && (
        <p className="mybuild__error" role="alert">
          {state.error}
        </p>
      )}
      {found && me && (
        <div className="uidimport__found">
          <p>
            <b>{agent.name}</b> in {found.nickname ? `${found.nickname}’s` : 'your'} showcase: Lv. {me.level ?? '?'} · Mindscape{' '}
            {me.loadout.mindscape}
            {me.core != null && ` · Core ${CORE[me.core]}`}
          </p>
          <button className="btn btn--primary" type="button" onClick={() => onBuild(me.loadout, { skills: me.skills, core: me.core })}>
            Use this build
          </button>
        </div>
      )}
      {found && !me && (
        <p className="muted" role="status">
          {agent.name} isn’t in this showcase
          {others.length ? ` (it shows ${others.join(', ')})` : ' (it’s empty or hidden)'}. Add them to your Agent
          Showcase in the game, wait a few minutes, then look up again.
        </p>
      )}
    </div>
  );
}
