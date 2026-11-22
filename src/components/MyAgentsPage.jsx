// "My Agents": every saved build laid out like shortcuts on a desktop, one
// icon per build. Tapping one opens that Agent's My build tab on that build.
// Also the one place to bring builds in: paste a build or team code, scan an
// image's QR code with the camera, upload images, or import a showcase by UID.
import { buildGoals } from '../lib/statEstimate.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AGENT_BY_ID, ATTRIBUTE_BY_ID } from '../data/game.js';
import { allMyBuilds, readAnyCode, saveBuildsFrom, setActiveBuild, shortDate } from '../lib/myBuilds.js';
import { fetchShowcase, validUid } from '../lib/enka.js';
import { forgetMyUid, getMyUid, saveMyUid } from '../lib/myUid.js';
import { scanFrame } from '../lib/screenshots.js';
import { navigate } from '../lib/route.js';
import Portrait from './Portrait.jsx';
import ScreenshotReader from './ScreenshotReader.jsx';
import AgentCollection from './AgentCollection.jsx';

const SORT_KEY = 'zzz-team-builder:myAgentsSort';
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
  if (r.replaced?.length) parts.push(`At 6 builds, so the oldest one made room: ${names(r.replaced)}.`);
  if (r.full.length) parts.push(`Couldn’t save in this browser: ${names(r.full)}.`);
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
function ShowcaseImport({ onSaved, me, nonce, onMine }) {
  const [uid, setUid] = useState(() => me.uid);
  const [st, setSt] = useState({ busy: false, error: '', found: null, pick: {} });

  const look = async (given) => {
    const u = (typeof given === 'string' ? given : uid).trim();
    if (!validUid(u)) {
      setSt({ busy: false, error: 'A UID is 8 to 10 digits (Profile in the game, or the corner of any screen).', found: null, pick: {} });
      return;
    }
    setSt({ busy: true, error: '', found: null, pick: {}, uid: u });
    try {
      const found = await fetchShowcase(u);
      const pick = Object.fromEntries(found.agents.filter((x) => x.agentId).map((x) => [x.agentId, true]));
      setSt({ busy: false, error: '', found, pick, uid: u });
      // Keep the in-game name next to your own UID up to date.
      if (u === me.uid && found.nickname && found.nickname !== me.name) onMine(u, found.nickname);
    } catch (e) {
      setSt({ busy: false, error: e.message, found: null, pick: {} });
    }
  };

  // A UID saved up top fills the box (unless you're typing another one).
  useEffect(() => {
    if (me.uid) setUid((u) => u || me.uid);
  }, [me.uid]);
  // "Update my builds" up top looks up your saved UID here.
  useEffect(() => {
    if (!nonce || !me.uid) return;
    setUid(me.uid);
    look(me.uid);
  }, [nonce]); // eslint-disable-line react-hooks/exhaustive-deps

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
          {st.uid !== me.uid && (
            <p className="small">
              <button type="button" className="btn btn--quiet" onClick={() => onMine(st.uid, st.found.nickname ?? '')}>
                Save {st.uid} as my UID
              </button>
            </p>
          )}
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
  const [me, setMe] = useState(getMyUid);
  const [nonce, setNonce] = useState(0);
  const [uidDraft, setUidDraft] = useState('');
  const addRef = useRef(null);
  const mine = (uid, name) => {
    saveMyUid(uid, name);
    setMe(getMyUid());
  };

  // One icon per Agent: their active build, with how many they have.
  const shown = useMemo(() => {
    const by = new Map();
    for (const b of builds) {
      if (!AGENT_BY_ID[b.agentId]) continue;
      const g = by.get(b.agentId) ?? { agentId: b.agentId, builds: [] };
      g.builds.push(b);
      by.set(b.agentId, g);
    }
    const list = [...by.values()].map((g) => ({
      ...g,
      main: g.builds.find((b) => b.active) ?? g.builds[0],
      latest: Math.max(...g.builds.map((b) => b.addedAt || b.savedAt || 0)),
    }));
    if (sort === 'recent') return list.sort((a, b) => b.latest - a.latest);
    return list.sort((a, b) => AGENT_BY_ID[a.agentId].name.localeCompare(AGENT_BY_ID[b.agentId].name));
  }, [builds, sort]);
  const buildCount = shown.reduce((n, g) => n + g.builds.length, 0);
  const agentCount = shown.length;

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

      <section className="myagents__me" aria-label="Your UID">
        <h3 className="myagents__h">Your UID</h3>
        {me.uid ? (
          <div className="myagents__me-row">
            <span>
              <b>{me.name || 'You'}</b> <span className="muted">· UID {me.uid}</span>
            </span>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setNonce((n) => n + 1);
                setTimeout(() => addRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
              }}
            >
              Update my builds
            </button>
            <button
              type="button"
              className="btn btn--quiet"
              onClick={() => {
                forgetMyUid();
                setMe(getMyUid());
              }}
            >
              Forget
            </button>
          </div>
        ) : (
          <form
            className="code-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (validUid(uidDraft)) {
                mine(uidDraft, '');
                setUidDraft('');
              }
            }}
          >
            <input
              className="code"
              inputMode="numeric"
              value={uidDraft}
              placeholder="Your UID (8–10 digits)"
              aria-label="Your UID"
              onChange={(e) => setUidDraft(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
            <button className="btn" type="submit" disabled={!validUid(uidDraft)}>
              Save
            </button>
          </form>
        )}
        <p className="muted small">
          Kept in this browser only. With it saved, “Update my builds” brings in your showcase in one tap, and UID imports
          fill it in for you. Looking up someone else’s UID doesn’t change it.
        </p>
      </section>

      <section className="myagents__desk" aria-label="Saved builds">
        <div className="myagents__bar">
          <span className="muted small">
            {shown.length
              ? `${buildCount} build${buildCount > 1 ? 's' : ''} · ${agentCount} Agent${agentCount > 1 ? 's' : ''}`
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
            {shown.map((g) => {
              const b = g.main;
              const a = AGENT_BY_ID[g.agentId];
              const el = ATTRIBUTE_BY_ID[a.attribute]?.color ?? '#888';
              const n = g.builds.length;
              return (
                <li key={g.agentId}>
                  <button
                    type="button"
                    className="myagents__icon"
                    style={{ '--el': el }}
                    onClick={() => open(b)}
                    title={`${a.name} · ${n} build${n > 1 ? 's' : ''}\n${g.builds
                      .map((x) => `${x.active ? '• ' : '  '}${x.name}${x.addedAt ? ` (added ${shortDate(x.addedAt)})` : ''}${goalText(x)}`)
                      .join('\n')}`}
                  >
                    <span className="myagents__art">
                      <Portrait agent={a} size="lg" />
                      <span className="myagents__m">M{b.loadout.mindscape ?? 0}</span>
                      {n > 1 && (
                        <span className="myagents__count" aria-label={`${n} builds`}>
                          {n}
                        </span>
                      )}
                    </span>
                    <span className="myagents__label">
                      <span className="myagents__name">{a.name}</span>
                      {n > 1 && <span className="myagents__build">{n} builds</span>}
                      <span className="myagents__build">{g.latest ? `added ${shortDate(g.latest)}` : b.name}</span>
                    </span>
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

      <AgentCollection buildsVersion={builds.length} />

      <section className="myagents__add mybuild" aria-label="Add builds" ref={addRef}>
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

            <ShowcaseImport onSaved={saved} me={me} nonce={nonce} onMine={mine} />
          </>
        )}
      </section>
    </div>
  );
}

// " · 2/3 goals" for one build, from its own gear (or typed stats when the
// Agent can't be worked out), or '' when there's nothing to go on.
function goalText(b) {
  const g = buildGoals(b.agentId, b.loadout, b.core);
  return g ? ` · ${g.met}/${g.total} goals` : '';
}
