// Agent filters in the style of HoYoLAB's Agent Collection: a row of round
// icon toggles each for attribute, specialty and rank. Several picks in one
// row widen the search (Electric or Fire); picks in different rows narrow it
// (Electric or Fire, and Attack or Anomaly, and S-Rank). Used by the Agents
// tab and the team builder's roster.
import { useState } from 'react';
import { BASE_ATTRIBUTES, FACTIONS, SPECIALTIES, baseAttribute } from '../data/game.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import SpecialtyIcon from './SpecialtyIcon.jsx';
import RankBadge from './RankBadge.jsx';

const EMPTY = { attribute: [], specialty: [], rank: [], faction: 'all' };

/** Filter state and its setter, starting with nothing picked. */
export const useAgentFilters = () => useState(EMPTY);

/** Does an Agent pass the filters? An empty row lets everyone through. */
export function matchesAgentFilters(a, f) {
  const ok = (picked, value) => !picked.length || picked.includes(value);
  return (
    ok(f.attribute, baseAttribute(a.attribute)) &&
    ok(f.specialty, a.specialty) &&
    ok(f.rank, a.rank) &&
    (f.faction === 'all' || a.faction === f.faction)
  );
}

export const anyAgentFilter = (f) =>
  f.attribute.length > 0 || f.specialty.length > 0 || f.rank.length > 0 || f.faction !== 'all';

function Row({ label, children }) {
  return (
    <div className="afilter__row" role="group" aria-label={`Filter by ${label.toLowerCase()}`}>
      <span className="afilter__label">{label}</span>
      <div className="afilter__icons">{children}</div>
    </div>
  );
}

function Toggle({ on, name, onClick, children }) {
  return (
    <button type="button" className="afilter__btn" aria-pressed={on} aria-label={name} title={name} onClick={onClick}>
      {children}
    </button>
  );
}

export default function AgentFilters({ filters, setFilters, idPrefix = '' }) {
  const flip = (key, value) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));
  return (
    <div className="afilter">
      <Row label="Attribute">
        {BASE_ATTRIBUTES.map((a) => (
          <Toggle key={a.id} name={a.name} on={filters.attribute.includes(a.id)} onClick={() => flip('attribute', a.id)}>
            <AttributeGlyph attribute={a.id} size={20} />
          </Toggle>
        ))}
      </Row>
      <Row label="Specialty">
        {SPECIALTIES.map((s) => (
          <Toggle key={s.id} name={s.name} on={filters.specialty.includes(s.id)} onClick={() => flip('specialty', s.id)}>
            <SpecialtyIcon specialty={s.id} size={20} />
          </Toggle>
        ))}
      </Row>
      <Row label="Rank">
        {['S', 'A'].map((r) => (
          <Toggle key={r} name={`${r}-Rank`} on={filters.rank.includes(r)} onClick={() => flip('rank', r)}>
            <RankBadge rank={r} size={24} />
          </Toggle>
        ))}
      </Row>
      <Row label="Faction">
        <select
          id={`${idPrefix}filter-faction`}
          className="afilter__select"
          aria-label="Faction"
          value={filters.faction}
          onChange={(e) => setFilters((f) => ({ ...f, faction: e.target.value }))}
        >
          <option value="all">Any</option>
          {FACTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        {anyAgentFilter(filters) && (
          <button type="button" className="rec-btn afilter__clear" onClick={() => setFilters(EMPTY)}>
            Clear filters
          </button>
        )}
      </Row>
    </div>
  );
}
