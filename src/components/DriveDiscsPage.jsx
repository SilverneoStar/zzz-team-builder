import { useMemo, useState } from 'react';
import { DISC_FIXED, DISC_MAIN_MAX, DISC_MAIN_STATS, DRIVE_DISC_SETS } from '../data/game.js';

export default function DriveDiscsPage({ discId }) {
  const [query, setQuery] = useState('');
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DRIVE_DISC_SETS.filter((d) => !q || [d.name, d.twoPiece, d.fourPiece].some((s) => s.toLowerCase().includes(q)));
  }, [query]);

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Drive Discs</h2>
        <p className="muted">An Agent equips six discs. Two from one set give its 2-piece bonus; four give both bonuses.</p>
      </header>

      <section className="disc-guide" aria-labelledby="slots-title">
        <h3 id="slots-title" className="mini-title">Main stats by slot</h3>
        <div className="table-wrap">
          <table className="index-table index-table--plain">
            <thead>
              <tr><th scope="col">Slot</th><th scope="col">Possible main stats (max at S-rank +15)</th></tr>
            </thead>
            <tbody>
              {DISC_FIXED.map((d) => (
                <tr key={d.slot}><td>{d.slot}</td><td>{d.stat} {d.max}</td></tr>
              ))}
              {[4, 5, 6].map((s) => (
                <tr key={s}>
                  <td>{s}</td>
                  <td>{DISC_MAIN_STATS[s].map((st) => `${st} ${DISC_MAIN_MAX[st]}`).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="filters filters--page filters--row">
        <label className="sr-only" htmlFor="disc-search">Search sets</label>
        <input id="disc-search" className="search search--inline" type="search" placeholder="Search name or bonus" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {list.length === 0 ? (
        <p className="empty">No sets match “{query}”.</p>
      ) : (
        <ul className="arc-grid">
          {list.map((d) => (
            <li key={d.id} id={`disc-${d.id}`} className="arc-card" aria-current={d.id === discId ? 'true' : undefined}>
              <div className="arc-card__top">
                <h3 className="arc-card__name">{d.name}</h3>
              </div>
              <dl className="disc-bonus">
                <div><dt>2-piece</dt><dd>{d.twoPiece}</dd></div>
                <div><dt>4-piece</dt><dd>{d.fourPiece}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
