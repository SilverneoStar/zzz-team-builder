import SpecialtyIcon, { SpecialtyTag } from './SpecialtyIcon.jsx';
import { useMemo, useState } from 'react';
import { AGENTS, AGENT_BY_ID, SPECIALTIES, SPECIALTY_BY_ID, W_ENGINES, W_ENGINE_BY_ID } from '../data/game.js';
import { navigate } from '../lib/route.js';
import Portrait from './Portrait.jsx';
import WEngineArt from './WEngineArt.jsx';

const RANKS = ['S', 'A', 'B'];
const RANK_ORDER = { S: 0, A: 1, B: 2 };

export default function WEnginesPage({ specialty: routeSpecialty, wEngineId }) {
  const selected = wEngineId ? W_ENGINE_BY_ID[wEngineId] : null;
  const specialty = selected ? selected.specialty : SPECIALTY_BY_ID[routeSpecialty] ? routeSpecialty : 'all';
  const [rank, setRank] = useState('all');
  const [query, setQuery] = useState('');
  const counts = Object.fromEntries(SPECIALTIES.map((s) => [s.id, W_ENGINES.filter((w) => w.specialty === s.id).length]));

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return W_ENGINES.filter(
      (w) =>
        (specialty === 'all' || w.specialty === specialty) &&
        (rank === 'all' || w.rank === rank) &&
        (!q || w.name.toLowerCase().includes(q) || (w.signatureOf && AGENT_BY_ID[w.signatureOf]?.name.toLowerCase().includes(q))),
    ).sort((a, b) => RANK_ORDER[a.rank] - RANK_ORDER[b.rank] || (b.base?.max ?? 0) - (a.base?.max ?? 0) || a.name.localeCompare(b.name));
  }, [specialty, rank, query]);

  const users = specialty === 'all' ? [] : AGENTS.filter((a) => a.specialty === specialty && !a.upcoming);

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">W-Engines</h2>
        <p className="muted">An Agent can equip any W-Engine, but its passive only works when the W-Engine matches their specialty.</p>
      </header>

      {selected && <WEngineDetail w={selected} onClose={() => navigate(`w-engines-${selected.specialty}`)} />}

      <div className="type-tabs" role="tablist" aria-label="Specialty">
        <a className="type-tab" role="tab" aria-selected={specialty === 'all'} href="#w-engines">
          All <span>{W_ENGINES.length}</span>
        </a>
        {SPECIALTIES.map((s) => (
          <a key={s.id} className="type-tab" role="tab" aria-selected={specialty === s.id} href={`#w-engines-${s.id}`}>
            <SpecialtyIcon specialty={s.id} size={18} />
            {s.name} <span>{counts[s.id]}</span>
          </a>
        ))}
      </div>

      {users.length > 0 && (
        <div className="wielders">
          <span className="mini-title">{SPECIALTY_BY_ID[specialty].name} Agents</span>
          <ul>
            {users.map((a) => (
              <li key={a.id}>
                <a href={`#agent-${a.id}`} className="wielder">
                  <Portrait agent={a} size="sm" />
                  {a.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="filters filters--page filters--row">
        <label className="sr-only" htmlFor="engine-search">Search W-Engines</label>
        <input id="engine-search" className="search search--inline" type="search" placeholder="Search name or Agent" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="chips" role="group" aria-label="Filter by rank">
          <button className="chip" aria-pressed={rank === 'all'} onClick={() => setRank('all')}>Any rank</button>
          {RANKS.map((r) => (
            <button key={r} className="chip" aria-pressed={rank === r} onClick={() => setRank(rank === r ? 'all' : r)}>{r}-rank</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">No W-Engines match these filters.</p>
      ) : (
        <ul className="arc-grid">
          {list.map((w) => {
            const sig = w.signatureOf && AGENT_BY_ID[w.signatureOf];
            return (
              <li
                key={w.id}
                className="arc-card arc-card--link"
                aria-current={selected?.id === w.id ? 'true' : undefined}
                onClick={(e) => {
                  if (!e.target.closest('a, button')) navigate(`w-engine-${w.id}`);
                }}
              >
                <div className="arc-card__top">
                  <WEngineArt w={w} size={36} />
                  <h3 className="arc-card__name"><a href={`#w-engine-${w.id}`}>{w.name}</a></h3>
                  {specialty === 'all' && <span className="arc-card__type"><SpecialtyTag specialty={w.specialty} size={15} /></span>}
                  {w.upcoming && <span className="card__tag">Upcoming</span>}
                  {w.provisional && <span className="card__tag card__tag--warn">Subject to change</span>}
                </div>
                <dl className="gear-stats">
                  <div><dt>Base {w.base?.stat ?? 'stat'}</dt><dd>{w.base?.max ?? '—'}</dd></div>
                  <div><dt>{w.advanced?.stat ?? 'Advanced'}</dt><dd>{w.advanced?.max ?? '—'}</dd></div>
                </dl>
                {sig && (
                  <div className="arc-card__users">
                    <a href={`#agent-${sig.id}`} className="arc-user" title={`Signature: ${sig.name}`}>
                      <span className="arc-tag arc-tag--sig">Sig</span>
                      <Portrait agent={sig} size="sm" />
                      {sig.name}
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="muted small">Stats at level 60. “—” means not published yet.</p>
    </div>
  );
}

function WEngineDetail({ w, onClose }) {
  const sig = w.signatureOf && AGENT_BY_ID[w.signatureOf];
  const fits = AGENTS.filter((a) => a.specialty === w.specialty && a.id !== w.signatureOf && !a.upcoming);
  return (
    <article className="detail detail--compact" aria-labelledby="engine-name">
      <header className="detail__head">
        <WEngineArt w={w} size={56} />
        <div className="detail__title">
          <p className="eyebrow">
            <span>{w.rank}-rank · <SpecialtyTag specialty={w.specialty} size={15} /></span>
            <span className="eyebrow__ver">Ver {w.version}</span>
          </p>
          <h2 id="engine-name" className="detail__name">{w.name}</h2>
        </div>
        <div className="detail__head-actions">
          <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">×</button>
        </div>
      </header>
      <dl className="facts">
        <div><dt>Base {w.base?.stat ?? 'stat'}</dt><dd>{w.base ? `${w.base.lv1} → ${w.base.max}` : 'Not published yet'}</dd></div>
        <div><dt>Advanced stat</dt><dd>{w.advanced ? `${w.advanced.stat} ${w.advanced.lv1} → ${w.advanced.max}` : 'Not published yet'}</dd></div>
        <div><dt>Signature of</dt><dd>{sig ? <a href={`#agent-${sig.id}`}>{sig.name}</a> : 'None'}</dd></div>
      </dl>
      {w.provisional && (
        <p className="muted small">
          <span className="card__tag card__tag--warn">Subject to change</span>{' '}
          These stats are from test-server data ahead of its release and may change before Version {w.version} goes live.
        </p>
      )}
      {fits.length > 0 && (
        <>
          <h3 className="mini-title">Other {SPECIALTY_BY_ID[w.specialty]?.name} Agents who can use its passive</h3>
          <ul className="mini-agents">
            {fits.map((a) => (
              <li key={a.id}>
                <a href={`#agent-${a.id}`} className="mini-agent"><Portrait agent={a} size="sm" /><span>{a.name}</span></a>
              </li>
            ))}
          </ul>
        </>
      )}
    </article>
  );
}
