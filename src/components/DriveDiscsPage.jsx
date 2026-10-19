import { useEffect, useMemo, useState } from 'react';
import DiscArt, { discArt } from './DiscArt.jsx';
import ViewToggle from './ViewToggle.jsx';
import { AGENT_BY_ID, DISC_FIXED, DISC_MAIN_MAX, DISC_MAIN_STATS, DRIVE_DISC_SETS, SPECIALTIES } from '../data/game.js';
import { BUILDS } from '../data/builds.js';

const VIEW_KEY = 'zzz-team-builder:discView';
const loadView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
};

// The stat a 2-piece bonus raises: "CRIT DMG +16%" → "CRIT DMG".
const twoStat = (d) => d.twoPiece.replace(/\s*[+-]?\d+(\.\d+)?%?\s*$/, '').trim();
const TWO_STATS = [...new Set(DRIVE_DISC_SETS.map(twoStat))].sort();

// Sets that recommended builds use, by the Agent's specialty.
const USED_BY = {};
Object.entries(BUILDS).forEach(([id, b]) => {
  const sp = AGENT_BY_ID[id]?.specialty;
  if (!sp) return;
  (USED_BY[sp] ??= new Set());
  [...b.fourPiece, ...b.twoPiece].forEach((s) => USED_BY[sp].add(s));
});

export default function DriveDiscsPage({ discId }) {
  const [query, setQuery] = useState('');
  const [stat, setStat] = useState('all');
  const [usedBy, setUsedBy] = useState('all');
  const [view, setView] = useState(loadView);
  const [playing, setPlaying] = useState(discId ?? null);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* storage unavailable */
    }
  }, [view]);
  useEffect(() => {
    if (discId) setPlaying(discId);
  }, [discId]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DRIVE_DISC_SETS.filter((d) => {
      if (q && ![d.name, d.twoPiece, d.fourPiece].some((s) => s.toLowerCase().includes(q))) return false;
      if (stat !== 'all' && twoStat(d) !== stat) return false;
      if (usedBy !== 'all' && !USED_BY[usedBy]?.has(d.id)) return false;
      return true;
    });
  }, [query, stat, usedBy]);

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
        <label className="select">
          <span>2-piece</span>
          <select value={stat} onChange={(e) => setStat(e.target.value)}>
            <option value="all">Any stat</option>
            {TWO_STATS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="select">
          <span>Used by</span>
          <select value={usedBy} onChange={(e) => setUsedBy(e.target.value)}>
            <option value="all">Any Agent</option>
            {SPECIALTIES.filter((s) => USED_BY[s.id]).map((s) => <option key={s.id} value={s.id}>{s.name} Agents</option>)}
          </select>
        </label>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {list.length === 0 ? (
        <p className="empty">No sets match these filters.</p>
      ) : view === 'grid' ? (
        <ul className="vinyl-grid">
          {list.map((d) => {
            const on = playing === d.id;
            const art = discArt(d.id);
            return (
              <li key={d.id} id={`disc-${d.id}`} className={`vinyl${on ? ' is-playing' : ''}`} aria-current={d.id === discId ? 'true' : undefined}>
                <button
                  type="button"
                  className="vinyl__deck"
                  aria-pressed={on}
                  aria-label={`${d.name}: ${on ? 'hide' : 'show'} the 4-piece bonus`}
                  onClick={() => setPlaying(on ? null : d.id)}
                >
                  <span className="vinyl__platter">
                    <span className="vinyl__record">
                      {art && <img src={art} alt="" loading="lazy" />}
                    </span>
                    <span className="vinyl__spindle" />
                  </span>
                  <span className="vinyl__arm" aria-hidden="true">
                    <span className="vinyl__rod" />
                  </span>
                  <span className="vinyl__pivot" aria-hidden="true" />
                  <span className="vinyl__led" aria-hidden="true" />
                </button>
                <div className="vinyl__label">
                  <h3 className="vinyl__name">{d.name}</h3>
                  <p className="vinyl__line"><span className="vinyl__tag">2</span>{d.twoPiece}</p>
                  {on ? (
                    <p className="vinyl__line vinyl__line--four"><span className="vinyl__tag">4</span>{d.fourPiece}</p>
                  ) : (
                    <p className="vinyl__hint muted small">Tap the record to play its 4-piece bonus.</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="arc-grid">
          {list.map((d) => (
            <li key={d.id} id={`disc-${d.id}`} className="arc-card" aria-current={d.id === discId ? 'true' : undefined}>
              <div className="arc-card__top arc-card__top--disc">
                <DiscArt id={d.id} size={56} />
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
