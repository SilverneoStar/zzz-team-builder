import { useEffect, useMemo, useState } from 'react';
import DiscArt, { discArt } from './DiscArt.jsx';
import ViewToggle from './ViewToggle.jsx';
import MiniAgents from './MiniAgents.jsx';
import { MatList } from './MaterialsTab.jsx';
import { DISC_LEVEL_MATS } from '../data/levelMats.js';
import { navigate } from '../lib/route.js';
import {
  AGENT_BY_ID,
  DRIVE_DISC_BY_ID,
  DISC_FIXED,
  DISC_MAIN_MAX,
  DISC_MAIN_STATS,
  DRIVE_DISC_SETS,
  SPECIALTIES,
} from '../data/game.js';
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

// 4-piece sets that recommended builds use, by the Agent's specialty.
const USED_BY = {};
Object.entries(BUILDS).forEach(([id, b]) => {
  const sp = AGENT_BY_ID[id]?.specialty;
  if (!sp) return;
  USED_BY[sp] ??= new Set();
  b.fourPiece.forEach((s) => USED_BY[sp].add(s));
});

export default function DriveDiscsPage({ discId }) {
  const [query, setQuery] = useState('');
  const [stat, setStat] = useState('all');
  const [usedBy, setUsedBy] = useState('all');
  const [view, setView] = useState(loadView);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* storage unavailable */
    }
  }, [view]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DRIVE_DISC_SETS.filter((d) => {
      if (q && ![d.name, d.twoPiece, d.fourPiece].some((s) => s.toLowerCase().includes(q))) return false;
      if (stat !== 'all' && twoStat(d) !== stat) return false;
      if (usedBy !== 'all' && !USED_BY[usedBy]?.has(d.id)) return false;
      return true;
    });
  }, [query, stat, usedBy]);
  const selected = discId ? DRIVE_DISC_BY_ID[discId] : null;

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Drive Discs</h2>
        <p className="muted">
          An Agent equips six discs. Two from one set give its 2-piece bonus; four give both bonuses.
        </p>
      </header>

      {selected && <DiscDetail disc={selected} onClose={() => navigate('drive-discs')} />}

      <div className="filters filters--page filters--row">
        <label className="sr-only" htmlFor="disc-search">
          Search sets
        </label>
        <input
          id="disc-search"
          className="search search--inline"
          type="search"
          placeholder="Search name or bonus"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="select">
          <span>2-piece</span>
          <select value={stat} onChange={(e) => setStat(e.target.value)}>
            <option value="all">Any stat</option>
            {TWO_STATS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="select">
          <span>Used by</span>
          <select value={usedBy} onChange={(e) => setUsedBy(e.target.value)}>
            <option value="all">Any Agent</option>
            {SPECIALTIES.filter((s) => USED_BY[s.id]).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} Agents
              </option>
            ))}
          </select>
        </label>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {list.length === 0 ? (
        <p className="empty">No sets match these filters.</p>
      ) : view === 'grid' ? (
        <ul className="vinyl-grid">
          {list.map((d) => (
            <li key={d.id} id={`disc-${d.id}`} className="vinyl">
              <a
                className="vinyl__link"
                href={`#drive-disc-${d.id}`}
                aria-current={d.id === discId ? 'page' : undefined}
              >
                <Turntable id={d.id} />
                <span className="vinyl__name">{d.name}</span>
              </a>
            </li>
          ))}
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
                <div>
                  <dt>2-piece</dt>
                  <dd>{d.twoPiece}</dd>
                </div>
                <div>
                  <dt>4-piece</dt>
                  <dd>{d.fourPiece}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}

      <details className="disc-guide">
        <summary className="mini-title">Levelling discs (+0 → +15)</summary>
        <div className="table-wrap mats">
          <p className="muted small">
            For one S-rank disc. A full set of six needs six times as much: 144 Ether Plating Agents.
          </p>
          <MatList items={DISC_LEVEL_MATS} />
        </div>
      </details>

      <details className="disc-guide">
        <summary className="mini-title">Main stats by slot (1–6)</summary>
        <div className="table-wrap">
          <table className="index-table index-table--plain">
            <thead>
              <tr>
                <th scope="col">Slot</th>
                <th scope="col">Possible main stats (max at S-rank +15)</th>
              </tr>
            </thead>
            <tbody>
              {DISC_FIXED.map((d) => (
                <tr key={d.slot}>
                  <td>{d.slot}</td>
                  <td>
                    {d.stat} {d.max}
                  </td>
                </tr>
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
      </details>
    </div>
  );
}

/** A turntable with the set's record on it; spins with the arm down when playing. */
function Turntable({ id, playing = false }) {
  const art = discArt(id);
  return (
    <span className={`deck${playing ? ' is-playing' : ''}`} aria-hidden="true">
      <span className="deck__platter">
        <span className="deck__record">{art && <img src={art} alt="" loading="lazy" />}</span>
        <span className="deck__spindle" />
      </span>
      <span className="deck__arm">
        <span className="deck__rod" />
      </span>
      <span className="deck__pivot" />
      <span className="deck__led" />
    </span>
  );
}

// Agents whose recommended builds use this set, as their 4-piece or 2-piece.
const usersOf = (id, key) => Object.keys(BUILDS).filter((a) => AGENT_BY_ID[a] && BUILDS[a][key].includes(id));

const AgentRow = ({ ids }) => <MiniAgents ids={ids} />;

// One set's page: its record playing on the deck, both bonuses, and the
// Agents whose recommended builds use it.
function DiscDetail({ disc: d, onClose }) {
  const four = usersOf(d.id, 'fourPiece');
  const two = usersOf(d.id, 'twoPiece').filter((a) => !four.includes(a));
  return (
    <article className="detail disc-detail" aria-labelledby="disc-name">
      <header className="detail__head disc-detail__head">
        <Turntable key={d.id} id={d.id} playing />
        <div className="detail__title">
          <p className="eyebrow">
            <span className="eyebrow__meta">Drive Disc set</span>
          </p>
          <h2 id="disc-name" className="detail__name">
            {d.name}
          </h2>
        </div>
        <div className="detail__head-actions">
          <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">
            ×
          </button>
        </div>
      </header>
      <div className="disc-detail__body">
        <dl className="disc-bonus">
          <div>
            <dt>2-piece</dt>
            <dd>{d.twoPiece}</dd>
          </div>
          <div>
            <dt>4-piece</dt>
            <dd>{d.fourPiece}</dd>
          </div>
        </dl>
        <section className="mates">
          <h3 className="mini-title">Used by</h3>
          {four.length + two.length === 0 ? (
            <p className="muted small">No Agent’s recommended build uses {d.name} yet.</p>
          ) : (
            <>
              {four.length > 0 && (
                <>
                  <p className="muted small">As their 4-piece set</p>
                  <AgentRow ids={four} />
                </>
              )}
              {two.length > 0 && (
                <>
                  <p className="muted small">As a 2-piece set</p>
                  <AgentRow ids={two} />
                </>
              )}
            </>
          )}
        </section>
      </div>
    </article>
  );
}
