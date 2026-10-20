import { useState } from 'react';
import { AGENTS, AGENT_BY_ID, ATTRIBUTE_BY_ID, baseAttribute, shortName } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { BANGBOO_MATS, BANGBOO_SKILLS, BANGBOO_STATS, needMet, needText } from '../data/bangbooSkills.js';
import SwipeTabs from './SwipeTabs.jsx';
import { MatIcon } from './MaterialsTab.jsx';
import { materialIcon } from '../lib/materialIcons.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import BangbooArt from './BangbooArt.jsx';
import MiniAgents from './MiniAgents.jsx';
import FactionLogo from './FactionLogo.jsx';

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
const STAT_LABELS = ['HP', 'ATK', 'DEF', 'CRIT Rate', 'CRIT DMG'];
const fmt = (n) => n.toLocaleString('en');

// A Bangboo's own page, laid out like an Agent's: Overview (facts, level-60
// stats, whether the current team turns on its Additional Ability), Skills,
// Best with (the Agents it's recommended for) and Materials. Every skill
// section starts folded.
export default function BangbooDetail({ bangboo: b, activeTeam, onPick, onClose }) {
  const kit = BANGBOO_SKILLS[b.id];
  const on = activeTeam.bangboo === b.id;
  const fans = recommendedFor(b.id);
  const attr = b.attribute && ATTRIBUTE_BY_ID[b.attribute];
  const squad = activeTeam.members.filter(Boolean).map((id) => AGENT_BY_ID[id]);
  const stats = BANGBOO_STATS[b.id];

  const overview = (
    <div className="detail__main">
      <dl className="facts">
        <div><dt>Rank</dt><dd>{b.rank ? `${b.rank}-rank` : '—'}</dd></div>
        <div><dt>Attribute</dt><dd className="cell-el">{attr ? <><AttributeGlyph attribute={b.attribute} size={15} />{attr.name}</> : <span className="muted">None</span>}</dd></div>
        <div><dt>Faction</dt><dd className="cell-faction">{b.faction ? <><FactionLogo faction={b.faction} size={22} />{b.faction}</> : <span className="muted">None</span>}</dd></div>
        <div><dt>Released</dt><dd>{b.version ? `Version ${b.version}` : <span className="muted">Upcoming</span>}</dd></div>
      </dl>
      {kit && <AbilityStatus ability={kit.ability} squad={squad} />}
      {stats && (
        <section>
          <h3 className="mini-title">Stats at level 60</h3>
          <dl className="build__stats bb-stats">
            {STAT_LABELS.map((l, i) => (
              <div key={l}><dt>{l}</dt><dd>{stats[i]}</dd></div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );

  const skills = kit ? (
    <section className="skills">
      <h3 className="mini-title">Skills</h3>
      <p className="muted small">Short summaries in plain words, with the game’s numbers. Tap a section to open it.</p>
      <Skill title="Active Skill" name={kit.active[0]} extra={`${kit.active[2]}s cooldown`}>
        <p>{kit.active[1]}</p>
      </Skill>
      <Ability ability={kit.ability} squad={squad} />
      {kit.chain ? (
        <Skill title="Chain Attack" name={kit.chain[0]}>
          <p>{kit.chain[1]}</p>
        </Skill>
      ) : (
        <p className="muted small">{b.name} has no Bangboo Chain Attack.</p>
      )}
      <p className="muted small skills__src">
        Skill details from the <a href="https://zenless-zone-zero.fandom.com/" target="_blank" rel="noreferrer">Zenless Zone Zero Wiki</a> (CC BY-SA), summarised.
      </p>
    </section>
  ) : (
    <p className="muted small">{b.name}’s skills aren’t listed yet.</p>
  );

  const best = (
    <section className="mates">
      <h3 className="mini-title">Best with</h3>
      {fans.length ? (
        <>
          <p className="muted small">Agents whose recommended builds list {b.name}.</p>
          <MiniAgents ids={fans} />
        </>
      ) : (
        <p className="muted small">No Agent’s recommended build lists {b.name} yet.</p>
      )}
      {kit && <p className="muted small">Its Additional Ability turns on with {needText(kit.ability[1], (id) => AGENT_BY_ID[id]?.name ?? id)}.</p>}
    </section>
  );

  const materials = (
    <section className="mats">
      <h3 className="mini-title">Materials</h3>
      <p className="muted small">To raise {b.name} to level 60. Every Bangboo needs the same.</p>
      <ul className="mats__list">
        {BANGBOO_MATS.map((x) => (
          <li key={x.name} className={`mats__item mats__item--${x.kind}`}>
            <MatIcon item={x} />
            <span className="mats__name"><b>{x.name}</b><span className="muted small">{x.source}</span></span>
            <span className="mats__qty">×{fmt(x.qty)}</span>
          </li>
        ))}
      </ul>
      <p className="muted small mats__foot"><span className="mats__exp"><img src={materialIcon('Bangboo Algorithm Module')} alt="" width="22" height="22" /></span>Bangboo EXP: Bangboo Algorithm Modules from Hollow Zero.</p>
    </section>
  );

  return (
    <article className="detail bb-detail" style={attr ? { '--el': attr.color } : undefined} aria-labelledby="bb-name">
      <header className="detail__head">
        <span className="bb-detail__art"><BangbooArt id={b.id} size={96} /></span>
        <div className="detail__title">
          <p className="eyebrow">
            <span className="eyebrow__meta">
              {attr ? <><AttributeGlyph attribute={b.attribute} size={16} /><span>{attr.name}</span></> : <span>No attribute</span>}
              {b.rank && <span className="nowrap"> · {b.rank}-rank</span>}
            </span>
            {b.version && <span className="eyebrow__ver">Ver {b.version}</span>}
          </p>
          <h2 id="bb-name" className="detail__name">{b.name}</h2>
        </div>
        <div className="detail__head-actions">
          <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">×</button>
        </div>
      </header>

      <SwipeTabs
        key={b.id}
        label={`${b.name} details`}
        slides={[
          { id: 'overview', label: 'Overview', content: overview },
          { id: 'skills', label: 'Skills', content: skills },
          { id: 'best', label: 'Best with', content: best },
          { id: 'materials', label: 'Materials', content: materials },
        ]}
      />

      <div className="detail__actions">
        <button className={on ? 'btn btn--quiet' : 'btn btn--primary'} onClick={() => onPick(on ? null : b.id)} aria-pressed={on}>
          {on ? 'In current team · remove' : 'Use in current team'}
        </button>
      </div>
    </article>
  );
}

function AbilityStatus({ ability: [name, need], squad }) {
  const known = !need.faction || AGENTS.some((a) => [need.faction].flat().includes(a.faction));
  const met = squad.length && known ? needMet(need, squad, baseAttribute) : null;
  return (
    <section>
      <h3 className="mini-title">Additional Ability</h3>
      <p className="small">
        <b>{name}</b>{' '}
        {met != null && <span className={`skills__state${met ? ' is-on' : ''}`}>{met ? 'On' : 'Off'}</span>}
      </p>
      <p className="muted small">
        Turns on with {needText(need, (id) => AGENT_BY_ID[id]?.name ?? id)}.
        {met != null && (met ? ' Your current team has it.' : ' Your current team doesn’t yet.')}
      </p>
    </section>
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
