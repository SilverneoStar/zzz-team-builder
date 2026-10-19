import { useState } from 'react';
import { AGENT_BY_ID, shortName } from '../data/game.js';
import { ESTIMATED_MATS, SKILL_COUNT, materialsFor, sharedWith } from '../data/materials.js';
import Portrait from './Portrait.jsx';

const fmt = (n) => n.toLocaleString('en');

// The Agent page's Materials tab: what to farm to reach level 60, max the
// skills and finish the Core Skill, with where each item drops and who else
// farms the same bosses.
export default function MaterialsTab({ agent: a }) {
  const [allSkills, setAllSkills] = useState(true);
  const m = materialsFor(a.id);
  if (!m) {
    return (
      <section className="mats">
        <h3 className="mini-title">Materials</h3>
        <p className="muted small">
          {a.upcoming ? `${a.name}’s materials are listed here once they’re released.` : `No material list for ${a.name} yet.`}
        </p>
      </section>
    );
  }
  const times = allSkills ? SKILL_COUNT : 1;
  const skill = m.skill.map((x) => ({ ...x, qty: x.qty * times }));

  return (
    <section className="mats">
      <h3 className="mini-title">Materials</h3>
      <p className="muted small">Everything to take {shortName(a)} from scratch to fully built, and where it drops.</p>

      <Group title="Level up" note="Promotions, level 1 → 60" items={m.promotion}>
        <p className="muted small mats__foot">
          Agent EXP: Investigator Logs from Combat Simulation · Investigation Specialization.
        </p>
      </Group>

      <Group
        title="Skills"
        note={allSkills ? `All ${SKILL_COUNT} skills, level 1 → 12` : 'One skill, level 1 → 12'}
        items={skill}
        action={
          <div className="mats__switch" role="radiogroup" aria-label="Skills to count">
            {[
              [true, `All ${SKILL_COUNT}`],
              [false, 'One'],
            ].map(([v, l]) => (
              <button key={l} type="button" role="radio" aria-checked={allSkills === v} className={`skills__level${allSkills === v ? ' is-on' : ''}`} onClick={() => setAllSkills(v)}>
                {l}
              </button>
            ))}
          </div>
        }
      >
        <p className="muted small mats__foot">{m.chipAttr} skill chips. The Hamster Cage Pass is only for level 11 → 12.</p>
      </Group>

      <Group title="Core Skill" note="Base → F" items={m.core}>
        {ESTIMATED_MATS.has(a.id) && (
          <p className="muted small mats__foot">
            <span className="passive__est">Estimated</span> {a.name} isn’t released yet. The promotion seals and skill chips follow Anomaly and Fire Agents; the Core Skill drops are copied from Burnice White until they’re confirmed.
          </p>
        )}
        <Shared label="Same Expert Challenge" ids={sharedWith(a.id, 2)} />
        <Shared label="Same Notorious Hunt" ids={sharedWith(a.id, 3)} />
      </Group>

      <p className="muted small">
        Costs and drop locations from the <a href="https://zenless-zone-zero.fandom.com/" target="_blank" rel="noreferrer">Zenless Zone Zero Wiki</a>.
      </p>
    </section>
  );
}

function Group({ title, note, items, action, children }) {
  return (
    <details className="skills__group" open>
      <summary>
        <span className="skills__cat">{title}</span>
        <span className="skills__peek">{note}</span>
      </summary>
      <div className="skills__body">
        {action}
        <ul className="mats__list">
          {items.map((x) => (
            <li key={x.name} className={`mats__item mats__item--${x.kind}`}>
              <span className="mats__dot" aria-hidden="true" />
              <span className="mats__name">
                <b>{x.name}</b>
                <span className="muted small">{x.source}</span>
              </span>
              <span className="mats__qty">×{fmt(x.qty)}</span>
            </li>
          ))}
        </ul>
        {children}
      </div>
    </details>
  );
}

function Shared({ label, ids }) {
  if (!ids.length) return null;
  return (
    <div className="mats__shared">
      <h4 className="micro-title">{label}</h4>
      <ul className="mini-agents">
        {ids.map((id) => {
          const x = AGENT_BY_ID[id];
          return (
            <li key={id}>
              <a href={`#agent-${id}`} title={x.name} className="mini-agent">
                <Portrait agent={x} size="sm" />
                <span>{shortName(x)}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
