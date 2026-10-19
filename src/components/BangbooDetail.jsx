import { useState } from 'react';
import { AGENTS, AGENT_BY_ID, ATTRIBUTE_BY_ID, baseAttribute, shortName } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { BANGBOO_SKILLS, needMet, needText } from '../data/bangbooSkills.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import BangbooArt from './BangbooArt.jsx';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';

const LEVELS = ['1', '2', '3', '4', '5'];

const fill = (text, values) =>
  text.split(/(\{\d+\})/).map((part, i) => {
    const m = part.match(/^\{(\d+)\}$/);
    return m ? <b key={i} className="skills__num">{values[Number(m[1])] ?? '?'}</b> : part;
  });

// Agents whose recommended builds list this Bangboo.
const recommendedFor = (id) => Object.keys(BUILDS).filter((a) => BUILDS[a].bangboo.includes(id) && AGENT_BY_ID[a]);

// A Bangboo's details: Active Skill, Additional Ability (and whether the
// current team turns it on), Chain Attack, and the Agents it's recommended for.
// Every section starts folded.
export default function BangbooDetail({ bangboo: b, activeTeam, onPick, onClose }) {
  const kit = BANGBOO_SKILLS[b.id];
  const on = activeTeam.bangboo === b.id;
  const fans = recommendedFor(b.id);
  const attr = b.attribute && ATTRIBUTE_BY_ID[b.attribute];
  return (
    <article className="detail bb-detail" style={attr ? { '--el': attr.color } : undefined} aria-labelledby="bb-name">
      <header className="detail__head">
        <span className="bb-detail__art"><BangbooArt id={b.id} size={88} /></span>
        <div className="detail__title">
          <p className="eyebrow">
            <span className="eyebrow__meta">
              {attr ? <><AttributeGlyph attribute={b.attribute} size={16} /><span>{attr.name}</span></> : <span>No attribute</span>}
              {b.rank && <span className="nowrap"> · {b.rank}-rank</span>}
            </span>
            {b.version && <span className="eyebrow__ver">Ver {b.version}</span>}
          </p>
          <h2 id="bb-name" className="detail__name">{b.name}</h2>
          {b.faction && <p className="muted small">{b.faction}</p>}
        </div>
        <div className="detail__head-actions">
          <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">×</button>
        </div>
      </header>

      {kit ? (
        <section className="skills">
          <Skill title="Active Skill" name={kit.active[0]} extra={`${kit.active[2]}s cooldown`}>
            <p>{kit.active[1]}</p>
          </Skill>
          <Ability ability={kit.ability} squad={activeTeam.members.filter(Boolean).map((id) => AGENT_BY_ID[id])} />
          {kit.chain ? (
            <Skill title="Chain Attack" name={kit.chain[0]}>
              <p>{kit.chain[1]}</p>
            </Skill>
          ) : (
            <p className="muted small">{b.name} has no Bangboo Chain Attack.</p>
          )}
          {fans.length > 0 && (
            <Skill title="Recommended for" name={fans.map((id) => shortName(AGENT_BY_ID[id])).join(', ')}>
              <ul className="mini-agents">
                {fans.map((id) => {
                  const a = AGENT_BY_ID[id];
                  return (
                    <li key={id}>
                      <a href={`#agent-${id}`} className="mini-agent" title={a.name}>
                        <Portrait agent={a} size="sm" />
                        <span>{shortName(a)}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Skill>
          )}
          <p className="muted small skills__src">
            Skill details from the <a href="https://zenless-zone-zero.fandom.com/" target="_blank" rel="noreferrer">Zenless Zone Zero Wiki</a> (CC BY-SA), summarised.
          </p>
        </section>
      ) : (
        <p className="muted small">{b.name}’s skills aren’t listed yet.</p>
      )}

      <div className="detail__actions">
        <button className={on ? 'btn btn--quiet' : 'btn btn--primary'} onClick={() => onPick(on ? null : b.id)} aria-pressed={on}>
          {on ? 'In current team · remove' : 'Use in current team'}
        </button>
      </div>
    </article>
  );
}

function Skill({ title, name, extra, badge, children }) {
  return (
    <details className="skills__group">
      <summary>
        <span className="skills__cat">{title}</span>
        <span className="skills__peek">{name}{extra ? ` · ${extra}` : ''}</span>
        {badge}
      </summary>
      <div className="skills__body">{children}</div>
    </details>
  );
}

function Ability({ ability: [name, need, text, values], squad }) {
  const [lv, setLv] = useState(4);
  const keys = Object.keys(values);
  const known = !need.faction || AGENTS.some((a) => [need.faction].flat().includes(a.faction));
  const met = squad.length && known ? needMet(need, squad, baseAttribute) : null;
  const condition = needText(need, (id) => AGENT_BY_ID[id]?.name ?? id);
  return (
    <Skill
      title="Additional Ability"
      name={name}
      badge={met == null ? null : <span className={`skills__state${met ? ' is-on' : ''}`}>{met ? 'On' : 'Off'}</span>}
    >
      <p className="muted small">Turns on with {condition}.{met != null && (met ? ' Your current team has it.' : ' Your current team doesn’t yet.')}</p>
      {keys.length > 0 && (
        <div className="skills__levels" role="radiogroup" aria-label="Additional Ability level">
          {LEVELS.map((l, i) => (
            <button key={l} type="button" role="radio" aria-checked={lv === i} className={`skills__level${lv === i ? ' is-on' : ''}`} onClick={() => setLv(i)}>
              Lv {l}
            </button>
          ))}
        </div>
      )}
      <p>{fill(text, keys.map((k) => values[k][lv]))}</p>
    </Skill>
  );
}
