import { useState } from 'react';
import { AGENTS, ATTRIBUTE_BY_ID, SPECIALTY_BY_ID, baseAttribute, shortName } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { KIT_LINKS, MECHANICS } from '../data/kitLinks.js';
import { PASSIVES } from '../data/passives.js';
import { passiveCondition, teammatesFor } from '../lib/analyze.js';
import Portrait from './Portrait.jsx';

const SHOW = 3;

// How often each Agent shows up in the recommended teams, overall and next
// to a given Agent. Used to put the strongest examples first.
const USAGE = {};
const PAIRS = {};
Object.values(BUILDS).forEach((b) =>
  b.teams.forEach((team) =>
    team.forEach((id) => {
      USAGE[id] = (USAGE[id] ?? 0) + 1;
      team.forEach((o) => {
        if (o === id) return;
        PAIRS[id] ??= {};
        PAIRS[id][o] = (PAIRS[id][o] ?? 0) + 1;
      });
    }),
  ),
);

// The Agent page's Teammates tab: a few of the best examples per reason
// (often teamed with, kit links, who turns on the Additional Ability, same
// faction, same attribute), each with a "show all" for the rest.
export default function Teammates({ agent: a }) {
  const pairs = PAIRS[a.id] ?? {};
  const score = (x) => (pairs[x.id] ?? 0) * 100 + (USAGE[x.id] ?? 0);
  const byScore = (list) => [...list].sort((x, y) => score(y) - score(x) || x.name.localeCompare(y.name));
  const others = AGENTS.filter((x) => x.id !== a.id);
  const fit = Object.fromEntries(teammatesFor(a, AGENTS).map((f) => [f.agent.id, f]));
  const tags = (x) => {
    const f = fit[x.id];
    return [...(f?.on && f?.back ? ['Both ways'] : []), ...(f?.kit ?? [])];
  };

  const passive = PASSIVES[a.id];
  const kit = KIT_LINKS[a.id] ?? [];
  const often = byScore(others.filter((x) => pairs[x.id]));
  const kitMates = byScore(others.filter((x) => fit[x.id]?.kit.length));
  const bySpecialty = (passive?.specialties ?? []).map((s) => ({
    id: s,
    list: byScore(others.filter((x) => x.specialty === s)),
  }));
  const sameFaction = byScore(others.filter((x) => x.faction === a.faction));
  const sameAttr = byScore(others.filter((x) => baseAttribute(x.attribute) === baseAttribute(a.attribute)));
  const turnsOn = ' · turns on the Additional Ability';

  return (
    <section className="mates">
      <h3 className="mini-title">Teammates</h3>
      {passive ? (
        <p className="muted small">
          <b>{passive.name ?? 'Additional Ability'}</b>
          {passive.estimated && ' (estimated)'} turns on with: {passiveCondition(a.id)}.
        </p>
      ) : (
        <p className="muted small">{a.name}’s Additional Ability condition isn’t published yet.</p>
      )}
      {kit.length > 0 && (
        <ul className="kit-lines">
          {kit.map((k, i) => (
            <li key={i}>
              <span className="kit-tag">{MECHANICS[k.mechanic].name}</span> {k.text}
            </li>
          ))}
        </ul>
      )}

      <p className="muted small mates__legend">
        <BothWays /> turns on each other’s Additional Ability
      </p>
      <Group title="Often teamed with" note="From the recommended teams." list={often} tags={tags} />
      <Group title="Kit links" list={kitMates} tags={tags} />
      {bySpecialty.map((g) => (
        <Group key={g.id} title={`${SPECIALTY_BY_ID[g.id]?.name} Agents${turnsOn}`} list={g.list} tags={tags} />
      ))}
      <Group title={`Same faction · ${a.faction}${passive?.faction ? turnsOn : ''}`} list={sameFaction} tags={tags} />
      <Group
        title={`Same attribute · ${ATTRIBUTE_BY_ID[baseAttribute(a.attribute)]?.name}${passive?.attribute ? turnsOn : ''}`}
        list={sameAttr}
        tags={tags}
      />
    </section>
  );
}

function Group({ title, note, list, tags }) {
  const [open, setOpen] = useState(false);
  if (!list.length) return null;
  const shown = open ? list : list.slice(0, SHOW);
  return (
    <div className="mates__group">
      <h4 className="micro-title">{title}</h4>
      {note && <p className="muted small mates__note">{note}</p>}
      <ul className="mini-agents">
        {shown.map((x) => {
          const t = tags(x);
          return (
            <li key={x.id}>
              <a href={`#agent-${x.id}`} title={x.name} className={`mini-agent${t.length ? ' mini-agent--best' : ''}`}>
                <Portrait agent={x} size="sm" />
                <span>{shortName(x)}</span>
                {t.map((k) => (
                  k === 'Both ways' ? (
                    <BothWays key={k} />
                  ) : (
                    <span key={k} className="fit-tag fit-tag--kit">{k}</span>
                  )
                ))}
              </a>
            </li>
          );
        })}
        {list.length > SHOW && (
          <li>
            <button className="mini-agent mates__more" onClick={() => setOpen(!open)} aria-expanded={open}>
              <span><span>{open ? 'Show fewer' : `+${list.length - SHOW} more`}</span></span>
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

// Two arrows passing each other: these two Agents turn on each other's
// Additional Ability.
export function BothWays() {
  return (
    <span className="both-ways" role="img" aria-label="Both ways" title="Turns on each other’s Additional Ability">
      <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
        <path d="M4 7h12M12.5 3.5 16 7l-3.5 3.5M16 13H4M7.5 9.5 4 13l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
