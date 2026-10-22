import { useMemo, useState } from 'react';
import { navigate } from '../lib/route.js';
import { ATTRIBUTE_BY_ID, BANGBOO } from '../data/game.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import RankBadge from './RankBadge.jsx';
import { BANGBOO_SCALE, bangbooArt } from './BangbooArt.jsx';
import BangbooDetail from './BangbooDetail.jsx';

export default function BangbooPage({ bangbooId, activeTeam, onPick }) {
  const [rank, setRank] = useState('all');
  const [query, setQuery] = useState('');
  const selected = BANGBOO.find((b) => b.id === bangbooId);
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
        <p className="muted">
          Each squad brings one Bangboo. Pick one here or from the Bangboo slot in the Team Builder.
        </p>
      </header>

      {selected && (
        <BangbooDetail bangboo={selected} activeTeam={activeTeam} onPick={onPick} onClose={() => navigate('bangboo')} />
      )}

      <div className="filters filters--page filters--row">
        <label className="sr-only" htmlFor="bangboo-search">
          Search Bangboo
        </label>
        <input
          id="bangboo-search"
          className="search search--inline"
          type="search"
          placeholder="Search name or faction"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Filter by rank">
          <button className="chip" aria-pressed={rank === 'all'} onClick={() => setRank('all')}>
            Any rank
          </button>
          {['S', 'A'].map((r) => (
            <button key={r} className="chip" aria-pressed={rank === r} onClick={() => setRank(rank === r ? 'all' : r)}>
              {r}-rank
            </button>
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
              <li key={b.id} className={`bangboo-card${on ? ' is-on' : ''}`} style={{ '--el': boxColor(b) }}>
                <a
                  className="bangboo-card__link"
                  href={`#bangboo-${b.id}`}
                  aria-current={bangbooId === b.id ? 'page' : undefined}
                >
                  <ToyBox bangboo={b} />
                  <span className="bangboo-card__body">
                    <span className="bangboo-card__name">
                      {b.name}
                      {b.rank && <RankBadge rank={b.rank} size={16} />}
                    </span>
                    <span className="bangboo-card__meta">
                      {b.attribute ? (
                        <>
                          <AttributeGlyph attribute={b.attribute} size={12} />
                          {ATTRIBUTE_BY_ID[b.attribute].name}
                        </>
                      ) : (
                        'No attribute'
                      )}
                    </span>
                    <span className="muted small">Ver {b.version}</span>
                  </span>
                </a>
                <button
                  className={on ? 'btn btn--quiet btn--small' : 'btn btn--small'}
                  onClick={() => onPick(on ? null : b.id)}
                  aria-pressed={on}
                >
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

// Box colour: the Bangboo's attribute, or a steady colour of its own.
function boxColor(b) {
  const el = b.attribute && ATTRIBUTE_BY_ID[b.attribute]?.color;
  if (el) return el;
  let h = 0;
  for (const ch of b.id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 45% 52%)`;
}

// The Bangboo in a collectible toy box, like its in-game pull art: a
// "Spotlight" header card, striped backing, clear plastic front, a rank
// sticker and a cardboard base.
function ToyBox({ bangboo: b }) {
  const src = bangbooArt(b.id);
  return (
    <span className="toybox" aria-hidden="true">
      <span className="toybox__tab">
        <span className="toybox__tab-text">
          <span>Spotlight</span>
        </span>
      </span>
      <span className="toybox__case">
        <span className="toybox__back" />
        {src && (
          <img className="toybox__art" src={src} alt="" loading="lazy" style={{ '--s': BANGBOO_SCALE[b.id] ?? 1 }} />
        )}
        <span className="toybox__glass" />
      </span>
      <span className="toybox__base">
        <span className="toybox__tagline">For Hollow investigation</span>
        <span className="toybox__brand">Bangboo</span>
        <span className="toybox__barcode" />
      </span>
      {b.rank && <i className={`toybox__sticker toybox__sticker--${b.rank.toLowerCase()}`}>{b.rank}</i>}
    </span>
  );
}
