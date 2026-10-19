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
import AgentFrame, { EmptyFrame } from './AgentFrame.jsx';
import WEngineArt from './WEngineArt.jsx';
import PassiveFace from './PassiveFace.jsx';
import { discSummary } from '../lib/discs.js';
import { ROMAN, hasPotential } from '../data/potentials.js';
import { passiveStatus } from '../lib/analyze.js';

// Three Agent slots and a Bangboo slot. Selecting a filled Agent slot opens
// its loadout below.
export default function TeamSlots({ team, selected, onSelect, dispatch }) {
  const bangboo = team.bangboo && BANGBOO_BY_ID[team.bangboo];
  const passives = passiveStatus(team.members);
  const allOn = passives.total > 0 && passives.active === passives.total;
  return (
    <>
    <div className="squad-passives" title="Agents whose Additional Ability is active">
      <span className="squad-passives__label">Additional Abilities</span>
      <span className={`squad-passives__count${allOn ? ' is-full' : ''}`}>
        {passives.active}/{passives.total}
      </span>
      <PassiveFace state={allOn ? 'on' : 'off'} size={30} />
    </div>
    <ol className="slots" aria-label="Squad">
      {team.members.map((id, index) => {
        const a = id && AGENT_BY_ID[id];
        if (!a) {
          return (
            <li key={index} className="slot slot--empty">
              <EmptyFrame />
              <span className="slot__hint">Pick from the Agents list</span>
            </li>
          );
        }
        const gear = loadoutOf(team, a.id);
        const w = gear.wEngine && W_ENGINE_BY_ID[gear.wEngine];
        const discText = discSummary(gear.discs);
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
              <AgentFrame agent={a} tall passive={passiveFor(passives.byId[a.id])} />
              <span className="slot__gear">
                <span className={w ? 'gear-chip gear-chip--on' : 'gear-chip'} title={w?.name ?? 'No W-Engine'}>
                  {w && <WEngineArt w={w} size={20} />}
                  <span className="gear-chip__name">{w ? w.name : 'No W-Engine'}</span>
                  {w && w.signatureOf === a.id && <span className="chip-tag">· Sig</span>}
                </span>
                <span className="slot__gear-row">
                  <span className={discText ? 'gear-chip gear-chip--on' : 'gear-chip'} title={discText ?? 'No Drive Discs'}>
                    <span className="gear-chip__name">{discText ?? 'No discs'}</span>
                  </span>
                  <span className={gear.mindscape ? 'gear-chip gear-chip--on' : 'gear-chip'} title="Mindscape Cinema">
                    M{gear.mindscape}
                  </span>
                  {hasPotential(a.id) && gear.potential > 0 && (
                    <span className="gear-chip gear-chip--on" title={`Potential ${ROMAN[gear.potential]}`}>
                      Pot {ROMAN[gear.potential]}
                    </span>
                  )}
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
    </>
  );
}


function passiveFor(st) {
  if (!st) return undefined;
  if (!st.known) return { state: 'unknown', title: 'Additional Ability: condition not published yet' };
  const head = `${st.name}${st.estimated ? ' (estimated, not confirmed yet)' : ''}: ${st.active ? 'active' : 'not active'}`;
  const why = st.active ? `Thanks to ${st.via.join(' and ')}.` : `Needs: ${st.condition}.`;
  return { state: st.active ? 'on' : 'off', title: `${head}. ${why}` };
}
