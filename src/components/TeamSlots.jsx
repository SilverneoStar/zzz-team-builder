import {
  AGENT_BY_ID,
  ATTRIBUTE_BY_ID,
  BANGBOO,
  BANGBOO_BY_ID,
  DRIVE_DISC_BY_ID,
  SPECIALTY_BY_ID,
  W_ENGINE_BY_ID,
} from '../data/game.js';
import { loadoutOf } from '../lib/teamsReducer.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import BangbooArt from './BangbooArt.jsx';
import Portrait from './Portrait.jsx';

// Three Agent slots and a Bangboo slot. Selecting a filled Agent slot opens
// its loadout below.
export default function TeamSlots({ team, selected, onSelect, dispatch }) {
  const bangboo = team.bangboo && BANGBOO_BY_ID[team.bangboo];
  return (
    <ol className="slots" aria-label="Squad">
      {team.members.map((id, index) => {
        const a = id && AGENT_BY_ID[id];
        if (!a) {
          return (
            <li key={index} className="slot slot--empty">
              <span className="slot__plus" aria-hidden="true">+</span>
              <span className="slot__hint">Pick from roster</span>
            </li>
          );
        }
        const gear = loadoutOf(team, a.id);
        const w = gear.wEngine && W_ENGINE_BY_ID[gear.wEngine];
        const d4 = gear.disc4 && DRIVE_DISC_BY_ID[gear.disc4];
        const d2 = gear.disc2 && DRIVE_DISC_BY_ID[gear.disc2];
        const isSelected = selected === index;
        return (
          <li
            key={index}
            className={`slot${isSelected ? ' slot--selected' : ''}`}
            style={{ '--el': ATTRIBUTE_BY_ID[a.attribute]?.color }}
          >
            <button
              className="slot__btn"
              onClick={() => onSelect(isSelected ? null : index)}
              aria-expanded={isSelected}
              aria-label={`${a.name}: edit gear`}
            >
              <Portrait agent={a} size="lg" />
              <span className="slot__name">{a.name}</span>
              <span className="slot__meta">{SPECIALTY_BY_ID[a.specialty]?.name}</span>
              <span className="slot__gear">
                <span className={w ? 'gear-chip gear-chip--on' : 'gear-chip'} title={w?.name ?? 'No W-Engine'}>
                  <span className="gear-chip__name">{w ? w.name : 'No W-Engine'}</span>
                  {w && w.signatureOf === a.id && <span className="chip-tag">· Sig</span>}
                </span>
                <span className="slot__gear-row">
                  <span className={d4 ? 'gear-chip gear-chip--on' : 'gear-chip'} title={d4 || d2 ? [d4 && `4: ${d4.name}`, d2 && `2: ${d2.name}`].filter(Boolean).join(' · ') : 'No Drive Discs'}>
                    <span className="gear-chip__name">{d4 ? d4.name : d2 ? `2pc ${d2.name}` : 'No discs'}</span>
                  </span>
                  <span className={gear.mindscape ? 'gear-chip gear-chip--on' : 'gear-chip'} title="Mindscape Cinema">
                    M{gear.mindscape}
                  </span>
                </span>
              </span>
            </button>
            <button
              className="slot__x"
              onClick={() => {
                if (isSelected) onSelect(null);
                dispatch({ type: 'clearSlot', index });
              }}
              aria-label={`Remove ${a.name} from squad`}
              title="Remove from squad"
            >
              ×
            </button>
          </li>
        );
      })}
      <li className={`slot slot--bangboo${bangboo ? '' : ' slot--empty'}`} style={bangboo?.attribute ? { '--el': ATTRIBUTE_BY_ID[bangboo.attribute]?.color } : undefined}>
        <span className="bangboo-slot">
          <span className="bangboo-slot__icon" aria-hidden="true">
            <BangbooArt id={bangboo?.id} size={bangboo ? 56 : 30} />
          </span>
          <label className="bangboo-slot__label" htmlFor="squad-bangboo">Bangboo</label>
          <select
            id="squad-bangboo"
            className="bangboo-slot__select"
            value={team.bangboo ?? ''}
            onChange={(e) => dispatch({ type: 'setBangboo', id: e.target.value || null })}
          >
            <option value="">None</option>
            {['S', 'A', null].map((rank) => (
              <optgroup key={rank ?? 'other'} label={rank ? `${rank}-Rank` : 'Other'}>
                {BANGBOO.filter((b) => b.rank === rank).map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {bangboo && (
            <span className="bangboo-slot__meta">
              {bangboo.attribute && <AttributeGlyph attribute={bangboo.attribute} size={13} />}
              {bangboo.faction ?? 'No faction'}
            </span>
          )}
        </span>
      </li>
    </ol>
  );
}

