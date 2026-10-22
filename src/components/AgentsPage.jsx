import { SpecialtyTag } from './SpecialtyIcon.jsx';
import { useEffect, useMemo, useState } from 'react';
import {
  AGENTS,
  AGENT_BY_ID,
  ATTRIBUTES,
  ATTRIBUTE_BY_ID,
  BASE_ATTRIBUTES,
  FACTIONS,
  SPECIALTIES,
  SPECIALTY_BY_ID,
  baseAttribute,
} from '../data/game.js';
import { navigate } from '../lib/route.js';
import AgentDetail from './AgentDetail.jsx';
import AttributeGlyph, { AttributeTag } from './AttributeGlyph.jsx';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import ViewToggle from './ViewToggle.jsx';
import AgentFrame from './AgentFrame.jsx';
import FactionLogo from './FactionLogo.jsx';

const VIEW_KEY = 'zzz-team-builder:agentView';
const loadView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
};

const verNum = (v) => (v ? Number(v.split('.')[0]) * 100 + Number(v.split('.')[1]) : 9999);
const COLUMNS = [
  { id: 'name', label: 'Agent', get: (a) => a.name },
  { id: 'attribute', label: 'Attribute', get: (a) => ATTRIBUTES.findIndex((x) => x.id === a.attribute) },
  { id: 'rank', label: 'Rank', get: (a) => a.rank },
  { id: 'specialty', label: 'Specialty', get: (a) => SPECIALTIES.findIndex((s) => s.id === a.specialty) },
  { id: 'attackType', label: 'Attack type', get: (a) => a.attackType.join(', ') || null },
  { id: 'faction', label: 'Faction', get: (a) => a.faction },
  { id: 'version', label: 'Version', numeric: true, get: (a) => verNum(a.version) },
];

function compare(a, b, col, dir) {
  const va = col.get(a);
  const vb = col.get(b);
  if (va == null && vb == null) return a.name.localeCompare(b.name);
  if (va == null) return 1;
  if (vb == null) return -1;
  const r = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
  return r ? r * dir : a.name.localeCompare(b.name);
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AgentsPage({ agentId, activeTeam, onAdd, onApplyBuild, onLoadTeam }) {
  const [query, setQuery] = useState('');
  const [attribute, setAttribute] = useState('all');
  const [specialty, setSpecialty] = useState('all');
  const [rank, setRank] = useState('all');
  const [faction, setFaction] = useState('all');
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [sort, setSort] = useState({ id: 'name', dir: 1 });
  const [view, setView] = useState(loadView);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* storage unavailable */
    }
  }, [view]);

  const selected = agentId ? AGENT_BY_ID[agentId] : null;
  const rows = useMemo(() => {
    const col = COLUMNS.find((c) => c.id === sort.id);
    return AGENTS.filter((a) => {
      if (a.upcoming && !showUpcoming) return false;
      if (attribute !== 'all' && baseAttribute(a.attribute) !== attribute) return false;
      if (specialty !== 'all' && a.specialty !== specialty) return false;
      if (rank !== 'all' && a.rank !== rank) return false;
      if (faction !== 'all' && a.faction !== faction) return false;
      if (query && !a.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    }).sort((a, b) => compare(a, b, col, sort.dir));
  }, [query, attribute, specialty, rank, faction, showUpcoming, sort]);

  function toggleSort(id) {
    const col = COLUMNS.find((c) => c.id === id);
    setSort((s) => (s.id === id ? { id, dir: -s.dir } : { id, dir: col.numeric ? -1 : 1 }));
  }

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Agents</h2>
        <p className="muted">
          Every released Agent, plus announced ones marked Upcoming. Select an Agent for details and W-Engines.
        </p>
      </header>

      {selected && (
        <AgentDetail
          agent={selected}
          inActiveTeam={activeTeam.members.includes(selected.id)}
          teamFull={activeTeam.members.every(Boolean)}
          onAdd={() => onAdd(selected.id)}
          onApplyBuild={onApplyBuild}
          onLoadTeam={onLoadTeam}
          team={activeTeam}
          onClose={() => navigate('agents')}
        />
      )}

      <div className="filters filters--page">
        <div className="chips" role="group" aria-label="Filter by attribute">
          <button className="chip" aria-pressed={attribute === 'all'} onClick={() => setAttribute('all')}>
            All
          </button>
          {BASE_ATTRIBUTES.map((a) => (
            <button
              key={a.id}
              className="chip"
              aria-pressed={attribute === a.id}
              onClick={() => setAttribute(attribute === a.id ? 'all' : a.id)}
            >
              <AttributeGlyph attribute={a.id} size={13} />
              {a.name}
            </button>
          ))}
        </div>
        <div className="filters__row">
          <label className="sr-only" htmlFor="index-search">
            Search Agents
          </label>
          <input
            id="index-search"
            className="search search--inline"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="select">
            <span>Specialty</span>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="all">Any</option>
              {SPECIALTIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="select">
            <span>Rank</span>
            <select value={rank} onChange={(e) => setRank(e.target.value)}>
              <option value="all">Any</option>
              <option value="S">S</option>
              <option value="A">A</option>
            </select>
          </label>
          <label className="select">
            <span>Faction</span>
            <select value={faction} onChange={(e) => setFaction(e.target.value)}>
              <option value="all">Any</option>
              {FACTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className={`select${view === 'list' ? ' select--phone-only' : ''}`}>
            <span>Sort</span>
            <select
              value={`${sort.id}:${sort.dir}`}
              onChange={(e) => {
                const [id, dir] = e.target.value.split(':');
                setSort({ id, dir: Number(dir) });
              }}
            >
              <option value="name:1">Name A–Z</option>
              <option value="name:-1">Name Z–A</option>
              <option value="attribute:1">Attribute</option>
              <option value="specialty:1">Specialty</option>
              <option value="rank:1">Rank</option>
              <option value="faction:1">Faction</option>
              <option value="version:-1">Newest</option>
              <option value="version:1">Oldest</option>
            </select>
          </label>
          <label className="check">
            <input type="checkbox" checked={showUpcoming} onChange={(e) => setShowUpcoming(e.target.checked)} />
            Show upcoming
          </label>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {view === 'grid' ? (
        <ul className="char-grid">
          {rows.map((a) => (
            <li key={a.id}>
              <a
                className={a.id === agentId ? 'char-tile is-selected' : 'char-tile'}
                href={`#agent-${a.id}`}
                aria-current={a.id === agentId ? 'true' : undefined}
                aria-label={a.name}
              >
                <AgentFrame agent={a} tag={a.upcoming ? 'Upcoming' : null} faction />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="table-wrap">
          <table className="index-table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={sort.id === col.id ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                  >
                    <button className="th-btn" onClick={() => toggleSort(col.id)}>
                      {col.label}
                      <span className="th-arrow" aria-hidden="true">
                        {sort.id === col.id ? (sort.dir === 1 ? '▲' : '▼') : ''}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className={a.id === agentId ? 'is-selected' : undefined}>
                  <td>
                    <a className="row-link" href={`#agent-${a.id}`}>
                      <Portrait agent={a} size="sm" />
                      <span>{a.name}</span>
                      {a.upcoming && <span className="card__tag">Upcoming</span>}
                    </a>
                  </td>
                  <td className="cell-meta-el">
                    <AttributeTag attribute={a.attribute} />
                  </td>
                  <td className="cell-meta-rank">
                    {a.rank === 'S' || a.rank === 'A' ? <RankBadge rank={a.rank} size={22} /> : '—'}
                  </td>
                  <td className="cell-meta-roles">
                    <SpecialtyTag specialty={a.specialty} />
                  </td>
                  <td className="small" data-label="Attack type">
                    {a.attackType.map(cap).join(', ') || '—'}
                  </td>
                  <td className="small" data-label="Faction">
                    <span className="cell-faction">
                      <FactionLogo faction={a.faction} size={20} />
                      {a.faction}
                    </span>
                  </td>
                  <td className="small" data-label="Version">
                    {a.version ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length === 0 && <p className="empty">No Agents match these filters.</p>}
    </div>
  );
}
