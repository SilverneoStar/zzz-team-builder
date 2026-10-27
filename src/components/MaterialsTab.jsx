import { useState } from 'react';
import { materialIcon } from '../lib/materialIcons.js';
import { AGENT_BY_ID, ATTRIBUTE_BY_ID, SPECIALTY_BY_ID, shortName, signatureOf } from '../data/game.js';
import { AGENT_MATS_KNOWN, ESTIMATED_MATS, SKILL_COUNT, materialsFor, sharedWith } from '../data/materials.js';
import MiniAgents from './MiniAgents.jsx';
import WEngineArt from './WEngineArt.jsx';
import { mergeItems, wEngineMaterials } from '../data/levelMats.js';

const fmt = (n) => n.toLocaleString('en');
// Short marks on each item's colour tile.
const KIND_MARK = { seal: 'S', chip: 'C', hdd: 'D', boss: 'H', pass: 'P', denny: '$', exp: 'X' };

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
          {a.upcoming
            ? `${a.name}’s materials are listed here once they’re released.`
            : `No material list for ${a.name} yet.`}
        </p>
      </section>
    );
  }
  const times = allSkills ? SKILL_COUNT : 1;
  const skill = m.skill.map((x) => ({ ...x, qty: x.qty * times }));
  const sig = signatureOf(a.id);
  const sigMats = sig && !sig.upcoming ? wEngineMaterials(sig) : null;
  const total = mergeItems([m.promotion, skill, m.core, sigMats ?? []]);

  return (
    <section className="mats">
      <h3 className="mini-title">Materials</h3>
      <p className="muted small">Everything to take {shortName(a)} from scratch to fully built, and where it drops.</p>

      <Group title="Level up" note="Promotions, level 1 → 60" items={m.promotion}>
        <p className="muted small mats__foot">
          <span className="mats__exp">
            <img src={materialIcon('Trainee Investigator Log')} alt="" width="22" height="22" />
            <img src={materialIcon('Senior Investigator Log')} alt="" width="22" height="22" />
            <img src={materialIcon('Official Investigator Log')} alt="" width="22" height="22" />
          </span>
          Agent EXP: Trainee, Senior and Official Investigator Logs from Combat Simulation · Investigation
          Specialization.
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
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={allSkills === v}
                className={`skills__level${allSkills === v ? ' is-on' : ''}`}
                onClick={() => setAllSkills(v)}
              >
                {l}
              </button>
            ))}
          </div>
        }
      >
        <p className="muted small mats__foot">
          {m.chipAttr} skill chips. The Hamster Cage Pass is only for level 11 → 12.
        </p>
      </Group>

      <Group title="Core Skill" note="Base → F" items={m.core}>
        {ESTIMATED_MATS.has(a.id) && (
          <p className="muted small mats__foot">
            <span className="passive__est">Estimated</span> {a.name} isn’t released yet. The promotion seals and skill
            chips follow other {ATTRIBUTE_BY_ID[a.attribute]?.name} {SPECIALTY_BY_ID[a.specialty]?.name} Agents;{' '}
            {AGENT_MATS_KNOWN(a.id)
              ? 'the Core Skill drops come from community reports until they’re confirmed in game.'
              : 'the Expert Challenge and Notorious Hunt drops haven’t been announced yet.'}
          </p>
        )}
        <Shared label="Same Expert Challenge" ids={sharedWith(a.id, 2)} />
        <Shared label="Same Notorious Hunt" ids={sharedWith(a.id, 3)} />
      </Group>

      {sigMats && (
        <Group title="Signature W-Engine" note={`${sig.name}, level 1 → 60`} items={sigMats}>
          <p className="muted small mats__foot">
            <a href={`#w-engine-${sig.id}`} className="mats__sig">
              <WEngineArt w={sig} size={22} />
              {sig.name}
            </a>{' '}
            Promotion components follow its type ({SPECIALTY_BY_ID[sig.specialty]?.name}).
          </p>
        </Group>
      )}

      <Group closed title="Full build total" note={sigMats ? 'Agent + signature W-Engine' : 'Agent'} items={total}>
        <p className="muted small mats__foot">The same items added up across every section above.</p>
      </Group>

      <p className="muted small">
        Costs and drop locations from the{' '}
        <a href="https://zenless-zone-zero.fandom.com/" target="_blank" rel="noreferrer">
          Zenless Zone Zero Wiki
        </a>
        .
      </p>
    </section>
  );
}

// The item's icon where we have one, else a colour tile with a letter.
export function MatIcon({ item }) {
  const src = materialIcon(item.name);
  if (src)
    return <img className="mats__icon" src={src} alt="" width="34" height="34" loading="lazy" decoding="async" />;
  return (
    <span className="mats__dot" aria-hidden="true">
      {KIND_MARK[item.kind] ?? ''}
    </span>
  );
}

/** A list of items with icon, name, where it drops and how many. */
export function MatList({ items }) {
  return (
    <ul className="mats__list">
      {items.map((x) => (
        <li key={x.name} className={`mats__item mats__item--${x.kind}`}>
          <MatIcon item={x} />
          <span className="mats__name">
            <b>{x.name}</b>
            <span className="muted small">{x.source}</span>
          </span>
          <span className="mats__qty">×{fmt(x.qty)}</span>
        </li>
      ))}
    </ul>
  );
}

function Group({ title, note, items, action, children, closed = false }) {
  return (
    <details className="skills__group" open={!closed}>
      <summary>
        <span className="skills__cat">{title}</span>
        <span className="skills__peek">{note}</span>
      </summary>
      <div className="skills__body">
        {action}
        <MatList items={items} />
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
      <MiniAgents ids={ids} />
    </div>
  );
}
