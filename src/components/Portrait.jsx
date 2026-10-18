import { ATTRIBUTE_BY_ID, initials } from '../data/game.js';
import AttributeGlyph from './AttributeGlyph.jsx';

// Agent portrait: initials on the Agent's attribute colour. No official art
// is used, so nothing here depends on HoYoverse's image terms.
export default function Portrait({ agent, size = 'md' }) {
  const color = ATTRIBUTE_BY_ID[agent.attribute]?.color ?? '#888';
  return (
    <span className={`portrait portrait--${size}`} style={{ '--el': color }}>
      <span className="portrait__initials">{initials(agent.name)}</span>
      <span className="portrait__glyph">
        <AttributeGlyph attribute={agent.attribute} size={size === 'lg' ? 16 : 12} />
      </span>
    </span>
  );
}
