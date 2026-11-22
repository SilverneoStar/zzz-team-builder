import { useMemo, useState } from 'react';
import { shortName } from '../data/game.js';
import { COLLECTION, loadOwned, saveOwned, worthAPull } from '../lib/collection.js';
import { allMyBuilds } from '../lib/myBuilds.js';
import Portrait from './Portrait.jsx';

const HOW = {
  limited: 'Limited: wait for a rerun',
  standard: 'Standard channel: any time',
  'a-rank': 'A-Rank: from any channel',
  free: 'Free',
  upcoming: 'New in 3.4',
};

// "Agent collection" on My Agents: tap Agents you've recruited, see who's
// missing, and which missing ones would complete the most recommended teams
// with the Agents you already have.
export default function AgentCollection({ buildsVersion = 0 }) {
  const fromBuilds = useMemo(
    () => new Set(allMyBuilds().map((b) => b.agentId)),
    [buildsVersion], // eslint-disable-line react-hooks/exhaustive-deps
  );
  // First visit: start from the Agents you have builds for.
  const [owned, setOwned] = useState(() => loadOwned() ?? new Set(fromBuilds));
  const [view, setView] = useState('all');
  const [note, setNote] = useState('');

  const update = (next) => {
    setOwned(next);
    if (!saveOwned(next)) setNote('Couldn’t save in this browser.');
  };
  const toggle = (id) => {
    const next = new Set(owned);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update(next);
  };

  const released = COLLECTION.filter((a) => !a.upcoming);
  const got = released.filter((a) => owned.has(a.id)).length;
  const picks = useMemo(() => worthAPull(owned).slice(0, 10), [owned]);
  const shown =
    view === 'got'
      ? COLLECTION.filter((a) => owned.has(a.id))
      : view === 'missing'
        ? COLLECTION.filter((a) => !owned.has(a.id))
        : COLLECTION;
  const unsynced = [...fromBuilds].filter((id) => !owned.has(id));

  return (
    <section className="collection" aria-label="Agent collection">
      <div className="collection__head">
        <h3 className="myagents__h">Agent collection</h3>
        <span className="collection__count">
          <b>{got}</b> / {released.length} recruited
        </span>
      </div>
      <p className="muted small">
        Tap the Agents you’ve recruited. Kept in this browser only.
        {unsynced.length > 0 && (
          <>
            {' '}
            <button
              type="button"
              className="btn btn--quiet btn--small"
              onClick={() => update(new Set([...owned, ...fromBuilds]))}
            >
              Add {unsynced.length} from my builds
            </button>
          </>
        )}
      </p>
      {note && (
        <p className="small" role="status">
          {note}
        </p>
      )}

      <div className="chips" role="group" aria-label="Show">
        {[
          ['all', 'All'],
          ['got', 'Recruited'],
          ['missing', 'Missing'],
          ['pulls', 'Worth a pull'],
        ].map(([id, label]) => (
          <button key={id} type="button" className="chip" aria-pressed={view === id} onClick={() => setView(id)}>
            {label}
          </button>
        ))}
      </div>

      {view === 'pulls' ? (
        picks.length ? (
          <ol className="collection__picks">
            {picks.map((p) => (
              <li key={p.agent.id}>
                <button type="button" className="collection__tile is-missing" onClick={() => toggle(p.agent.id)} title="Tap once recruited">
                  <Portrait agent={p.agent} size="md" />
                </button>
                <div>
                  <b>{p.agent.name}</b>
                  <span className={`collection__how is-${p.how}`}>{HOW[p.how]}</span>
                  <p className="small">
                    {p.teams.length > 0
                      ? `Completes ${p.teams.length} recommended team${p.teams.length > 1 ? 's' : ''} with your Agents${
                          p.partners.length ? `, most with ${p.partners.slice(0, 3).map(shortName).join(', ')}` : ''
                        }.`
                      : ''}
                    {p.listedBy.length > 0 &&
                      ` On the best-team lists of ${p.listedBy.slice(0, 3).map(shortName).join(', ')}${
                        p.listedBy.length > 3 ? ` and ${p.listedBy.length - 3} more` : ''
                      } of yours.`}
                  </p>
                  {p.agent.available && <p className="muted small">{p.agent.available}</p>}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted small">Tap the Agents you have first, and this lists the missing ones that fit your account best.</p>
        )
      ) : (
        <ul className="collection__grid">
          {shown.map((a) => {
            const has = owned.has(a.id);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  className={`collection__tile${has ? ' is-got' : ' is-missing'}${a.upcoming ? ' is-soon' : ''}`}
                  aria-pressed={has}
                  onClick={() => toggle(a.id)}
                  title={has ? `${a.name}: recruited (tap to undo)` : `${a.name}: tap once recruited`}
                >
                  <Portrait agent={a} size="md" />
                  {has && (
                    <span className="collection__tick" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  {a.upcoming && <span className="collection__soon">3.4</span>}
                  <span className="collection__name">{shortName(a)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {view === 'pulls' && (
        <p className="muted small">
          Ranked by how many recommended teams they’d complete with Agents you have, and how many of your Agents list
          them as a best teammate. Tap a portrait once you’ve recruited them.
        </p>
      )}
    </section>
  );
}
