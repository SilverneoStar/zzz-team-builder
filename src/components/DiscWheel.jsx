import { ATTRIBUTE_BY_ID, DRIVE_DISC_BY_ID, initials } from '../data/game.js';
import { SLOTS, SLOT_POSITION, mainMax, mainStatOf } from '../lib/discs.js';
import RankBadge from './RankBadge.jsx';
import { discArt } from './DiscArt.jsx';
import { wEngineArt } from './WEngineArt.jsx';

// A stable colour per Drive Disc set, so each set's discs match on the wheel.
export function setColor(id) {
  if (!id) return '#3a3a3a';
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 55% 58%)`;
}

const shortSet = (name) => initials(name.replace(/&/g, ' '));

// The equipment wheel from the game: the W-Engine in the middle with its Phase
// under it, and the six Drive Disc slots around it in their in-game places.
export default function DiscWheel({ agent, wEngine, phase, discs, selected, onSelect, onEngine }) {
  const statLabel = (s) => (s === 'Attribute DMG' ? `${ATTRIBUTE_BY_ID[agent.attribute]?.name} DMG` : s);
  return (
    <div className="wheel" role="group" aria-label="Drive Disc slots">
      <div className="wheel__plate" aria-hidden="true" />
      <button
        type="button"
        className={`wheel__engine${wEngine ? '' : ' is-empty'}${wEngine && wEngineArt(wEngine.id) ? ' has-art' : ''}`}
        aria-label={wEngine ? `W-Engine: ${wEngine.name}` : 'Choose a W-Engine'}
        onClick={onEngine}
        title={wEngine ? wEngine.name : 'Choose a W-Engine'}
      >
        {wEngine ? (
          <>
            {wEngineArt(wEngine.id) ? (
              <span className="wheel__engine-art">
                <img src={wEngineArt(wEngine.id)} alt="" />
                <span className="wheel__engine-rank">
                  <RankBadge rank={wEngine.rank} size={20} />
                </span>
              </span>
            ) : (
              <>
                <RankBadge rank={wEngine.rank} size={22} />
                <span className="wheel__engine-name">{wEngine.name}</span>
              </>
            )}
          </>
        ) : (
          <span className="wheel__engine-name">W-Engine</span>
        )}
      </button>
      <span className="wheel__phase" aria-label={`Phase ${phase}`}>
        P{phase}
      </span>

      {SLOTS.map((slot) => {
        const d = discs[slot - 1];
        const set = d.set && DRIVE_DISC_BY_ID[d.set];
        const stat = mainStatOf(slot, d);
        const art = set && discArt(set.id);
        const label = `Slot ${slot}: ${set ? `${set.name}, ${d.rank}-rank` : 'empty'}${stat ? `, ${statLabel(stat)} ${mainMax(slot, d) ?? ''}` : ''}`;
        return (
          <button
            key={slot}
            type="button"
            className={`wheel__slot wheel__slot--${SLOT_POSITION[slot]}${selected === slot ? ' is-selected' : ''}${set ? '' : ' is-empty'}${art ? ' has-art' : ''}`}
            style={{ '--set': setColor(d.set) }}
            onClick={() => onSelect(selected === slot ? null : slot)}
            aria-pressed={selected === slot}
            aria-label={label}
            title={label}
          >
            <span className="wheel__disc">
              {art ? (
                <img className="wheel__art" src={art} alt="" />
              ) : (
                <span className="wheel__label">{set ? shortSet(set.name) : '+'}</span>
              )}
            </span>
            <span className="wheel__num">{slot}</span>
            {set && (
              <span className="wheel__rank">
                <RankBadge rank={d.rank} size={20} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
