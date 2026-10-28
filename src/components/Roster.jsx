import { SpecialtyTag } from './SpecialtyIcon.jsx';
import { useState } from 'react';
import {
  AGENTS,
  AGENT_BY_ID,
  ATTRIBUTE_BY_ID,
  SPECIALTY_BY_ID,
  baseAttribute,
} from '../data/game.js';
import { kitLinksBetween } from '../lib/analyze.js';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import AgentFilters, { matchesAgentFilters, useAgentFilters } from './AgentFilters.jsx';

// What an Agent would share with the current squad if added.
function links(agent, members) {
  const team = members.filter(Boolean).map((id) => AGENT_BY_ID[id]);
  const out = [];
  if (team.some((m) => baseAttribute(m.attribute) === baseAttribute(agent.attribute))) {
    out.push(ATTRIBUTE_BY_ID[baseAttribute(agent.attribute)].name);
  }
  if (team.some((m) => m.faction === agent.faction)) out.push('Faction');
  const kit = new Set(team.filter((m) => m.id !== agent.id).flatMap((m) => kitLinksBetween(agent, m)));
  kit.forEach((k) => out.push(k));
  return out;
}

// In the phone picker sheet (`sheet`), ids get a prefix, a tap fills `slot`,
// and `onPick` closes the sheet once an Agent is added.
export default function Roster({ members, usage, dispatch, sheet = false, slot = null, onPick }) {
  const pre = sheet ? 'sheet-' : '';
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useAgentFilters();
  const [showUpcoming, setShowUpcoming] = useState(false);

  const teamFull = members.every(Boolean);
  const list = AGENTS.filter((a) => {
    if (a.upcoming && !showUpcoming) return false;
    if (!matchesAgentFilters(a, filters)) return false;
    if (query && !a.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <section className="roster" aria-labelledby={`${pre}roster-title`}>
      <div className="roster__head">
        <h2 id={`${pre}roster-title`} className="section-title">
          Agents
        </h2>
        <label className="sr-only" htmlFor={`${pre}roster-search`}>
          Search Agents
        </label>
        <input
          id={`${pre}roster-search`}
          className="search"
          type="search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filters">
        <AgentFilters filters={filters} setFilters={setFilters} idPrefix={pre} />
        <div className="filters__row">
          <label className="check">
            <input type="checkbox" checked={showUpcoming} onChange={(e) => setShowUpcoming(e.target.checked)} />
            Show upcoming
          </label>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">No Agents match these filters.</p>
      ) : (
        <ul className="grid">
          {list.map((a) => {
            const inTeam = members.includes(a.id);
            const others = usage[a.id];
            const gains = inTeam ? [] : links(a, members);
            return (
              <li key={a.id}>
                <button
                  className={`card${inTeam ? ' card--in' : ''}`}
                  aria-pressed={inTeam}
                  disabled={!inTeam && teamFull}
                  onClick={() => {
                    const adding = !members.includes(a.id);
                    dispatch({ type: 'toggle', agentId: a.id, slot });
                    if (adding) onPick?.(a.id);
                  }}
                >
                  <Portrait agent={a} />
                  <span className="card__body">
                    <span className="card__name">
                      <span className="card__nm">{a.name}</span>
                      {(a.rank === 'S' || a.rank === 'A') && <RankBadge rank={a.rank} size={18} />}
                    </span>
                    <span className="card__role">
                      <SpecialtyTag specialty={a.specialty} size={14} />
                    </span>
                    {gains.length > 0 && <span className="card__gain">Shares {gains.join(' + ')}</span>}
                    {a.upcoming && <span className="card__tag">Upcoming</span>}
                    {others && (
                      <span className="card__tag card__tag--used" title={`Also in ${others.join(', ')}`}>
                        {others.length === 1 ? `In ${others[0]}` : `In ${others.length} other teams`}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
