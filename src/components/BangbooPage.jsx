import { useMemo, useState } from 'react';
import { ATTRIBUTE_BY_ID, BANGBOO } from '../data/game.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import RankBadge from './RankBadge.jsx';
import BangbooArt from './BangbooArt.jsx';
import BangbooDetail from './BangbooDetail.jsx';

export default function BangbooPage({ activeTeam, onPick }) {
  const [rank, setRank] = useState('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const selected = BANGBOO.find((b) => b.id === open);
  const show = (id) => {
    setOpen(id);
    requestAnimationFrame(() => document.querySelector('.bb-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BANGBOO.filter(
      (b) =>
        (rank === 'all' || b.rank === rank) &&
        (!q || b.name.toLowerCase().includes(q) || (b.faction ?? '').toLowerCase().includes(q)),
    ).sort((a, b) => (a.rank ?? 'Z').localeCompare(b.rank ?? 'Z') || a.name.localeCompare(b.name));
  }, [rank, query]);

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Bangboo</h2>
        <p className="muted">Each squad brings one Bangboo. Pick one here or from the Bangboo slot in the Team Builder.</p>
      </header>

      {selected && <BangbooDetail bangboo={selected} activeTeam={activeTeam} onPick={onPick} onClose={() => setOpen(null)} />}

      <div className="filters filters--page filters--row">
        <label className="sr-only" htmlFor="bangboo-search">Search Bangboo</label>
        <input id="bangboo-search" className="search search--inline" type="search" placeholder="Search name or faction" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="chips" role="group" aria-label="Filter by rank">
          <button className="chip" aria-pressed={rank === 'all'} onClick={() => setRank('all')}>Any rank</button>
          {['S', 'A'].map((r) => (
            <button key={r} className="chip" aria-pressed={rank === r} onClick={() => setRank(rank === r ? 'all' : r)}>{r}-rank</button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">No Bangboo match these filters.</p>
      ) : (
        <ul className="bangboo-grid">
          {list.map((b) => {
            const on = activeTeam.bangboo === b.id;
            return (
              <li key={b.id} className={`bangboo-card${on ? ' is-on' : ''}`} style={b.attribute ? { '--el': ATTRIBUTE_BY_ID[b.attribute]?.color } : undefined}>
                <span className="bangboo-card__icon" aria-hidden="true"><BangbooArt id={b.id} size={44} /></span>
                <span className="bangboo-card__body">
                  <span className="bangboo-card__name">
                    {b.name}
                    {b.rank && <RankBadge rank={b.rank} size={18} />}
                  </span>
                  <span className="bangboo-card__meta">
                    {b.attribute ? <><AttributeGlyph attribute={b.attribute} size={13} />{ATTRIBUTE_BY_ID[b.attribute].name}</> : 'No attribute'}
                    {b.faction && <> · {b.faction}</>}
                  </span>
                  <span className="muted small">Ver {b.version}</span>
                  <button className="link-btn bangboo-card__more" onClick={() => show(b.id)} aria-expanded={open === b.id}>
                    Skills &amp; details
                  </button>
                </span>
                <button className={on ? 'btn btn--quiet btn--small' : 'btn btn--small'} onClick={() => onPick(on ? null : b.id)} aria-pressed={on}>
                  {on ? 'In current team' : 'Use in team'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
