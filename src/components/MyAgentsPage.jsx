// "My Agents": every saved build laid out like shortcuts on a desktop, one
// icon per build. Tapping one opens that Agent's My build tab on that build.
// Also the one place to bring builds in: paste a build or team code, scan an
// image's QR code with the camera, upload images, or import a showcase by UID.
import { goalsOf, loadMyStats } from '../lib/statGoals.js';
import { estimateStats } from '../lib/statEstimate.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AGENT_BY_ID, ATTRIBUTE_BY_ID } from '../data/game.js';
import { allMyBuilds, readAnyCode, saveBuildsFrom, setActiveBuild } from '../lib/myBuilds.js';
import { fetchShowcase, validUid } from '../lib/enka.js';
import { scanFrame } from '../lib/screenshots.js';
import { navigate } from '../lib/route.js';
import Portrait from './Portrait.jsx';
import ScreenshotReader from './ScreenshotReader.jsx';

const SORT_KEY = 'zzz-team-builder:myAgentsSort';
const UID_KEY = 'zzz-team-builder:uid';
const get = (k, d) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};
const set = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* not kept: fine */
  }
};
const names = (ids) => ids.map((id) => AGENT_BY_ID[id]?.name ?? id).join(', ');

/** One line saying what happened after saving builds from a code or showcase. */
function summary(r) {
  const parts = [];
  if (r.added.length) parts.push(`Saved ${r.added.length === 1 ? 'a build' : `${r.added.length} builds`} for ${names(r.added)}.`);
  if (r.already.length) parts.push(`Already saved: ${names(r.already)}.`);
  if (r.full.length) parts.push(`No room (6 builds each): ${names(r.full)}. Delete one on their My build tab first.`);
  return parts.join(' ') || 'Nothing to save.';
}

/** The camera, looking for a QR code from one of the site's images. */
function QrScanner({ onText, onClose }) {
  const video = useRef(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let stream;
    let stop = false;
    let timer;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false,
        });
      } catch {
        setError('The camera couldn’t be opened. Allow camera access for this site, or upload the image instead.');
        return;
      }
      if (stop) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const v = video.current;
      v.srcObject = stream;
      await v.play().catch(() => {});
      const tick = async () => {
        if (stop) return;
        const text = await scanFrame(v).catch(() => null);
        if (stop) return;
        if (text && readAnyCode(text)) {
          onText(text);
          return;
        }
        timer = setTimeout(tick, 250);
      };
      tick();
    })();
    return () => {
      stop = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="qrscan">
      {error ? (
        <p className="mybuild__error" role="alert">
          {error}
        </p>
      ) : (
        <div className="qrscan__view">
          <video ref={video} muted playsInline aria-label="Camera view" />
          <span className="qrscan__frame" aria-hidden="true" />
        </div>
      )}
      <p className="muted small">
        Point the camera at the QR code in the corner of a team or build image. Nothing is recorded or sent anywhere.
      </p>
      <button type="button" className="btn btn--quiet" onClick={onClose}>
        Stop scanning
      </button>
    </div>
  );
}

/** What a code holds, with the choice of saving the builds or opening it as a team. */
function Found({ team, onSave, onTeam, onCancel }) {
  const ids = team.members.filter(Boolean);
  return (
    <div className="myagents__found">
      <p>
        <strong>{ids.length > 1 ? 'Team code' : 'Build code'}</strong> for {names(ids)}
        {team.name ? ` · “${team.name}”` : ''}
      </p>
      <div className="myagents__found-row">
        {ids.map((id) => (
          <span key={id} className="myagents__found-face" title={AGENT_BY_ID[id].name}>
            <Portrait agent={AGENT_BY_ID[id]} size="sm" />
          </span>
        ))}
      </div>
      <div className="mybuild__starts">
        <button type="button" className="btn btn--primary" onClick={onSave}>
          {ids.length > 1 ? `Save as ${ids.length} builds` : 'Save this build'}
        </button>
        {ids.length > 1 && (
          <button type="button" className="btn" onClick={onTeam}>
            Open as a team
          </button>
        )}
        <button type="button" className="btn btn--quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/** Imports every Agent in a player's showcase at once. */
function ShowcaseImport({ onSaved }) {
  const [uid, setUid] = useState(() => get(UID_KEY, ''));
  const [st, setSt] = useState({ busy: false, error: '', found: null, pick: {} });

  const look = async () => {
    const u = uid.trim();
    if (!validUid(u)) {
      setSt({ busy: false, error: 'A UID is 8 to 10 digits (Profile in the game, or the corner of any screen).', found: null, pick: {} });
      return;
    }
    set(UID_KEY, u);
    setSt({ busy: true, error: '', found: null, pick: {} });
    try {
      const found = await fetchShowcase(u);
      const pick = Object.fromEntries(found.agents.filter((x) => x.agentId).map((x) => [x.agentId, true]));
      setSt({ busy: false, error: '', found, pick });
    } catch (e) {
      setSt({ busy: false, error: e.message, found: null, pick: {} });
    }
  };

  const known = st.found?.agents.filter((x) => x.agentId && AGENT_BY_ID[x.agentId]) ?? [];
  const unknown = (st.found?.agents.length ?? 0) - known.length;
  const chosen = known.filter((x) => st.pick[x.agentId]);

  const save = () => {
    const members = chosen.map((x) => x.agentId);
    const r = saveBuildsFrom(
      { members, loadouts: Object.fromEntries(chosen.map((x) => [x.agentId, x.loadout])) },
      {
        name: 'Showcase',
        extras: Object.fromEntries(
          chosen.map((x) => [x.agentId, { ...(x.skills ? { skills: x.skills } : {}), ...(x.core != null ? { core: x.core } : {}) }]),
        ),
      },
    );
    setSt((s) => ({ ...s, found: null }));
    onSaved(r);
  };

  return (
    <div className="uidimport">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          look();
        }}
      >
        <label className="field">
          <span>Import your showcase by UID</span>
          <div className="code-row">
            <input
              className="code"
              inputMode="numeric"
              value={uid}
              placeholder="Your UID"
              onChange={(e) => {
                setUid(e.target.value.replace(/\D/g, '').slice(0, 10));
                setSt((s) => ({ ...s, error: '' }));
              }}
            />
            <button className="btn" type="submit" disabled={st.busy || !uid}>
              {st.busy ? 'Looking…' : 'Look up'}
            </button>
          </div>
        </label>
      </form>
      <p className="muted small">
        Reads the Agents in your in-game Agent Showcase (Profile) through Enka.Network. Only Agents you’ve put in the
        showcase come through.
      </p>
      {st.error && (
        <p className="mybuild__error" role="alert">
          {st.error}
        </p>
      )}
      {st.found && (
        <div className="myagents__found">
          <p>
            {st.found.nickname ? <strong>{st.found.nickname}</strong> : 'This player'}
            {known.length ? ` has ${known.length} Agent${known.length > 1 ? 's' : ''} in their showcase:` : ' has no Agents in their showcase yet.'}
          </p>
          <div className="myagents__pick">
            {known.map((x) => (
              <label key={x.agentId} className={`myagents__pick-item${st.pick[x.agentId] ? ' is-on' : ''}`}>
                <input
                  type="checkbox"
                  checked={!!st.pick[x.agentId]}
                  onChange={(e) => setSt((s) => ({ ...s, pick: { ...s.pick, [x.agentId]: e.target.checked } }))}
                />
                <Portrait agent={AGENT_BY_ID[x.agentId]} size="sm" />
                <span>{AGENT_BY_ID[x.agentId].name}</span>
              </label>
            ))}
          </div>
          {unknown > 0 && (
            <p className="muted small">
              {unknown} Agent{unknown > 1 ? 's' : ''} the site doesn’t have yet {unknown > 1 ? 'were' : 'was'} skipped.
            </p>
          )}
          {known.length > 0 && (
            <div className="mybuild__starts">
              <button type="button" className="btn btn--primary" onClick={save} disabled={!chosen.length}>
                Save {chosen.length === 1 ? '1 build' : `${chosen.length} builds`}
              </button>
              <button type="button" className="btn btn--quiet" onClick={() => setSt((s) => ({ ...s, found: null }))}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyAgentsPage({ onLoadTeam }) {
  const [version, setVersion] = useState(0);
  const builds = useMemo(() => allMyBuilds(), [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const [sort, setSort] = useState(() => get(SORT_KEY, 'name'));
  const [paste, setPaste] = useState('');
  const [error, setError] = useState('');
  const [found, setFound] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState('');

  const shown = useMemo(() => {
    const list = builds.filter((b) => AGENT_BY_ID[b.agentId]);
    if (sort === 'recent') return list.sort((a, b) => b.savedAt - a.savedAt);
    return list.sort((a, b) => AGENT_BY_ID[a.agentId].name.localeCompare(AGENT_BY_ID[b.agentId].name));
  }, [builds, sort]);
  const agentCount = new Set(shown.map((b) => b.agentId)).size;

  const take = (text) => {
    const t = readAnyCode(text);
    if (!t || !t.members.some(Boolean)) {
      setError('That isn’t a code the site can read. Paste a build or team code, or a team link.');
      return;
    }
    setError('');
    setNotice('');
    setFound(t);
  };
  const saved = (r) => {
    setNotice(summary(r));
    setFound(null);
    setVersion((v) => v + 1);
  };
  const open = (b) => {
    setActiveBuild(b.agentId, b.id);
    navigate(`agent-${b.agentId}~mine`);
  };

  return (
    <div className="page myagents">
      <header className="page__head">
        <h2 className="page__title">My Agents</h2>
        <p className="muted">
          All your saved builds in one place, like shortcuts on a desktop. Tap one to open it. Builds are kept in this
          browser only.
        </p>
      </header>

      <section className="myagents__desk" aria-label="Saved builds">
        <div className="myagents__bar">
          <span className="muted small">
            {shown.length
              ? `${shown.length} build${shown.length > 1 ? 's' : ''} · ${agentCount} Agent${agentCount > 1 ? 's' : ''}`
              : 'No builds yet'}
          </span>
          {shown.length > 1 && (
            <label className="myagents__sort">
              <span className="muted small">Sort</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  set(SORT_KEY, e.target.value);
                }}
              >
                <option value="name">By name</option>
                <option value="recent">Recently saved</option>
              </select>
            </label>
          )}
        </div>
        {shown.length ? (
          <ul className="myagents__grid">
            {shown.map((b) => {
              const a = AGENT_BY_ID[b.agentId];
              const el = ATTRIBUTE_BY_ID[a.attribute]?.color ?? '#888';
              return (
                <li key={`${b.agentId}-${b.id}`}>
                  <button
                    type="button"
                    className="myagents__icon"
                    style={{ '--el': el }}
                    onClick={() => open(b)}
                    title={`${a.name} · ${b.name}${b.note ? `\n${b.note}` : ''}`}
                  >
                    <span className="myagents__art">
                      <Portrait agent={a} size="lg" />
                      <span className="myagents__m">M{b.loadout.mindscape ?? 0}</span>
                    </span>
                    <span className="myagents__label">
                      <span className="myagents__name">{a.name}</span>
                      <span className="myagents__build">{b.name}</span>
                    </span>
                    <GoalChip agentId={a.id} build={b} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="myagents__empty muted">
            Builds you make on an Agent’s My build tab show up here. You can also bring them in below.
          </p>
        )}
      </section>

      <section className="myagents__add mybuild" aria-label="Add builds">
        <h3 className="myagents__h">Add builds</h3>
        {notice && (
          <p className="myagents__notice" role="status">
            {notice}
          </p>
        )}
        {found ? (
          <Found
            team={found}
            onSave={() => saved(saveBuildsFrom(found))}
            onTeam={() => onLoadTeam(found)}
            onCancel={() => setFound(null)}
          />
        ) : (
          <>
            <form
              className="mybuild__paste"
              onSubmit={(e) => {
                e.preventDefault();
                take(paste);
                setPaste('');
              }}
            >
              <label className="field">
                <span>Paste a build or team code</span>
                <div className="code-row">
                  <input
                    className="code"
                    value={paste}
                    onChange={(e) => {
                      setPaste(e.target.value);
                      setError('');
                    }}
                    placeholder="A short code, or a team link"
                    aria-invalid={Boolean(error)}
                  />
                  <button className="btn" type="submit" disabled={!paste.trim()}>
                    Read
                  </button>
                </div>
              </label>
              {error && (
                <p className="mybuild__error" role="alert">
                  {error}
                </p>
              )}
            </form>

            <div className="myagents__ways">
              {scanning ? (
                <QrScanner
                  onText={(t) => {
                    setScanning(false);
                    take(t);
                  }}
                  onClose={() => setScanning(false)}
                />
              ) : (
                <div className="shots">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setScanning(true)}
                    disabled={!navigator.mediaDevices?.getUserMedia}
                  >
                    Scan a QR code
                  </button>
                  <p className="muted small shots__hint">With your camera, from a team or build image on another screen.</p>
                </div>
              )}
              <ScreenshotReader codesOnly onCode={(t) => setFound(t)} />
            </div>

            <ShowcaseImport onSaved={saved} />
          </>
        )}
      </section>
    </div>
  );
}

// How many of the Agent's stat goals are met, from the stats typed into Stat progress.
function GoalChip({ agentId, build }) {
  const goals = goalsOf(agentId);
  const mine = { ...(estimateStats(agentId, build.loadout, build.core) ?? {}), ...loadMyStats(agentId) };
  const typed = goals.filter((g) => Number.isFinite(mine[g.stat]));
  if (!typed.length) return null;
  const met = typed.filter((g) => mine[g.stat] >= g.value).length;
  return (
    <span className={`myagents__goals${met === goals.length ? ' is-done' : ''}`} title="Stat goals met (Stat progress)">
      {met}/{goals.length} goals
    </span>
  );
}
