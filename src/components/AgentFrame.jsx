import { useState } from 'react';
import { ATTRIBUTE_BY_ID, SPECIALTY_BY_ID, initials } from '../data/game.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import { agentArt } from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';

// The slanted card frame from the game's Agent select and squad screens:
// art in a leaning, rounded frame with a dark name bar along the bottom
// (rank, specialty and attribute, where the game shows the level).
export default function AgentFrame({ agent, label, tag, tall = false }) {
  const src = agentArt(agent.id);
  const [failedSrc, setFailedSrc] = useState(null);
  const color = ATTRIBUTE_BY_ID[agent.attribute]?.color;
  const ranked = agent.rank === 'S' || agent.rank === 'A';
  return (
    <span className={`frame${tall ? ' frame--tall' : ''}`} style={{ '--el': color }}>
      <span className="frame__inner">
        {failedSrc === src ? (
          <span className="frame__initials">{initials(agent.name)}</span>
        ) : (
          <img className="frame__art" src={src} alt="" loading="lazy" onError={() => setFailedSrc(src)} />
        )}
        {tag && <span className="frame__tag">{tag}</span>}
        <span className="frame__bar">
          {ranked ? <RankBadge rank={agent.rank} size={20} /> : <span className="frame__rank-x" />}
          <span className="frame__label">{label ?? SPECIALTY_BY_ID[agent.specialty]?.name}</span>
          <AttributeGlyph attribute={agent.attribute} size={16} title={ATTRIBUTE_BY_ID[agent.attribute]?.name} />
        </span>
      </span>
    </span>
  );
}

// An empty squad slot in the same frame, like the game's "+ SELECT / EMPTY".
export function EmptyFrame({ text = 'Select' }) {
  return (
    <span className="frame frame--tall frame--empty">
      <span className="frame__inner">
        <span className="frame__select">+ {text}</span>
        <span className="frame__bar frame__bar--empty">Empty</span>
      </span>
    </span>
  );
}
