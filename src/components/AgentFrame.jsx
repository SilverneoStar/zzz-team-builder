import { useState } from 'react';
import { ATTRIBUTE_BY_ID, SPECIALTY_BY_ID, initials, shortName } from '../data/game.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import { agentArt } from './Portrait.jsx';
import PassiveFace from './PassiveFace.jsx';
import RankBadge from './RankBadge.jsx';

// The slanted Agent card from the game's squad screen: a dark leaning card
// with the art inset, and a footer with the rank in a round badge, the name
// over a second line (the specialty, where the game shows the level), and
// the attribute icon in a pill on the right.
// `passive` ({ state: 'on' | 'off' | 'unknown', title }) puts the squad screen's
// passive face in the round badge; the rank then moves to the art's corner.
export default function AgentFrame({ agent, sub, tag, tall = false, passive }) {
  const src = agentArt(agent.id);
  const [failedSrc, setFailedSrc] = useState(null);
  const color = ATTRIBUTE_BY_ID[agent.attribute]?.color;
  const ranked = agent.rank === 'S' || agent.rank === 'A';
  return (
    <span className={`frame${tall ? ' frame--tall' : ''}`} style={{ '--el': color }} title={agent.name}>
      <span className="frame__art-box">
        {failedSrc === src ? (
          <span className="frame__initials">{initials(agent.name)}</span>
        ) : (
          <img className="frame__art" src={src} alt="" loading="lazy" onError={() => setFailedSrc(src)} />
        )}
        {tag && <span className="frame__tag">{tag}</span>}
        {passive && ranked && <span className="frame__corner-rank"><RankBadge rank={agent.rank} size={22} /></span>}
      </span>
      <span className="frame__foot">
        <span className="frame__badge">
          {passive ? (
            <PassiveFace state={passive.state} size={30} title={passive.title} />
          ) : ranked ? (
            <RankBadge rank={agent.rank} size={22} />
          ) : (
            <span className="frame__badge-dot" />
          )}
        </span>
        <span className="frame__text">
          <span className="frame__name">{shortName(agent)}</span>
          <span className="frame__sub">{sub ?? SPECIALTY_BY_ID[agent.specialty]?.name}</span>
        </span>
        <span className="frame__pill">
          <AttributeGlyph attribute={agent.attribute} size={18} title={ATTRIBUTE_BY_ID[agent.attribute]?.name} />
        </span>
      </span>
    </span>
  );
}

// An empty squad slot in the same card, like the game's "+ SELECT / EMPTY".
export function EmptyFrame({ text = 'Select' }) {
  return (
    <span className="frame frame--tall frame--empty">
      <span className="frame__art-box">
        <span className="frame__select">+ {text}</span>
      </span>
      <span className="frame__foot frame__foot--empty">
        <span className="frame__empty-pill">Empty</span>
      </span>
    </span>
  );
}
