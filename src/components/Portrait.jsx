import { useState } from 'react';
import { ATTRIBUTE_BY_ID, initials } from '../data/game.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import { memberArt, useMemberIndex } from '../lib/memberArt.js';

// Looks for public/agents/<id>.webp. If the file is missing, falls back to
// the Agent's initials on their attribute colour.
const BASE = import.meta.env.BASE_URL;
export const agentArt = (id) => `${BASE}agents/${id}.webp`;

export default function Portrait({ agent, size = 'md' }) {
  // Agents with several members show the one the reader picked.
  const member = useMemberIndex(agent);
  const src = agent.members ? memberArt(agent, member) : agentArt(agent.id);
  // Remember which image failed, so switching Agents retries.
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;
  const color = ATTRIBUTE_BY_ID[agent.attribute]?.color ?? '#888';
  return (
    <span className={`portrait portrait--${size}`} style={{ '--el': color }}>
      {agent.members && member < 0 && (size === 'lg' || size === 'xl') ? (
        <span className="portrait__collage">
          {agent.members.map((m, i) => (
            <span key={m.key} className="portrait__collage-cell">
              <img
                src={memberArt(agent, i)}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  objectPosition: m.stackFocus ?? m.focus,
                  '--focus': m.stackFocus ?? m.focus,
                  '--zoom': m.stackZoom ?? 1.1,
                }}
              />
            </span>
          ))}
        </span>
      ) : failed ? (
        <span className="portrait__initials">{initials(agent.name)}</span>
      ) : (
        <img
          className="portrait__img"
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      )}
      <span className="portrait__glyph">
        <AttributeGlyph attribute={agent.attribute} size={size === 'lg' || size === 'xl' ? 16 : 12} />
      </span>
    </span>
  );
}
