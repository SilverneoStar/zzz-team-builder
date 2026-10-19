import { useState } from 'react';
import { AGENT_BY_ID, shortName } from '../data/game.js';
import Portrait from './Portrait.jsx';

// A row of small Agent chips that shows the first few and folds the rest
// behind a "+n more" button.
export const MINI_LIMIT = 3;

export default function MiniAgents({ ids, limit = MINI_LIMIT, full = false }) {
  const [open, setOpen] = useState(false);
  const list = ids.map((id) => AGENT_BY_ID[id]).filter(Boolean);
  if (!list.length) return null;
  const shown = open ? list : list.slice(0, limit);
  return (
    <ul className="mini-agents">
      {shown.map((a) => (
        <li key={a.id}>
          <a href={`#agent-${a.id}`} title={a.name} className="mini-agent">
            <Portrait agent={a} size="sm" />
            <span>{full ? a.name : shortName(a)}</span>
          </a>
        </li>
      ))}
      {list.length > limit && (
        <li>
          <button type="button" className="mini-agent mates__more" onClick={() => setOpen(!open)} aria-expanded={open}>
            <span>{open ? 'Show fewer' : `+${list.length - limit} more`}</span>
          </button>
        </li>
      )}
    </ul>
  );
}
