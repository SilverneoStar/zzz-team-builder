import { SpecialtyTag } from './SpecialtyIcon.jsx';
import {
  AGENTS,
  ATTRIBUTE_BY_ID,
  SPECIALTY_BY_ID,
  baseAttribute,
  signatureOf,
  wEnginesFor,
} from '../data/game.js';
import { PRESETS } from '../data/presets.js';
import { KIT_LINKS, MECHANICS } from '../data/kitLinks.js';
import { passiveCondition, teammatesFor } from '../lib/analyze.js';
import { PASSIVES } from '../data/passives.js';
import { PHONE, useMedia } from '../lib/useMedia.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import SwipeTabs from './SwipeTabs.jsx';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AgentDetail({ agent: a, inActiveTeam, teamFull, onAdd, onClose }) {
  const phone = useMedia(PHONE);
  const attr = ATTRIBUTE_BY_ID[a.attribute];
  const sig = signatureOf(a.id);
  const options = wEnginesFor(a).filter((w) => w.id !== sig?.id && w.rank !== 'B');
  const sameFaction = AGENTS.filter((x) => x.faction === a.faction && x.id !== a.id);
  const sameAttr = AGENTS.filter((x) => baseAttribute(x.attribute) === baseAttribute(a.attribute) && x.id !== a.id);
  const featured = PRESETS.filter((p) => p.members.includes(a.id));
  const fits = teammatesFor(a, AGENTS);
  const passive = PASSIVES[a.id];
  const kit = KIT_LINKS[a.id] ?? [];

  const overview = (
    <div className="detail__main">
      <dl className="facts">
        <div><dt>Attribute</dt><dd className="cell-el"><AttributeGlyph attribute={a.attribute} size={15} />{attr?.name}{attr?.base && <span className="muted"> · counts as {ATTRIBUTE_BY_ID[attr.base].name}</span>}</dd></div>
        <div><dt>Specialty</dt><dd><SpecialtyTag specialty={a.specialty} size={16} /></dd></div>
        <div><dt>Attack type</dt><dd>{a.attackType.map(cap).join(', ') || <span className="muted">Not announced yet</span>}</dd></div>
        <div><dt>Faction</dt><dd>{a.faction}</dd></div>
        <div><dt>Released</dt><dd>{a.version ? `Version ${a.version}` : <span className="muted">Upcoming</span>}</dd></div>
      </dl>
      {featured.length > 0 && (
        <section>
          <h3 className="mini-title">Featured in</h3>
          <ul className="tags">{featured.map((p) => <li key={p.name}>{p.name}</li>)}</ul>
        </section>
      )}
    </div>
  );

  const engines = (
    <section>
      <h3 className="mini-title">W-Engines</h3>
      {sig ? (
        <a className="engine-row engine-row--sig" href={`#w-engine-${sig.id}`}>
          <RankBadge rank={sig.rank} size={20} />
          <span className="engine-row__name">{sig.name}</span>
          <span className="chip-tag">Signature</span>
          <span className="muted small">{sig.advanced ? `${sig.advanced.stat} ${sig.advanced.max}` : 'Stats not published yet'}</span>
        </a>
      ) : (
        <p className="muted small">No signature W-Engine yet.</p>
      )}
      <p className="muted small">Other {SPECIALTY_BY_ID[a.specialty]?.name} W-Engines (S and A rank):</p>
      <ul className="engine-list">
        {options.map((w) => (
          <li key={w.id}>
            <a className="engine-row" href={`#w-engine-${w.id}`}>
              <RankBadge rank={w.rank} size={18} />
              <span className="engine-row__name">{w.name}</span>
              <span className="muted small">{w.advanced ? `${w.advanced.stat} ${w.advanced.max}` : ''}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );

  const mates = (
    <section>
      <h3 className="mini-title">Possible teammates</h3>
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
      <h4 className="micro-title">Good fits</h4>
      <p className="muted small">
        Agents who turn on {a.name}’s Additional Ability or link with their kit. “Both ways” means each turns on the other’s.
      </p>
      <FitList list={fits} />
      <h4 className="micro-title">Same faction · {a.faction}</h4>
      <MiniList list={sameFaction} />
      <h4 className="micro-title">Same attribute · {ATTRIBUTE_BY_ID[baseAttribute(a.attribute)]?.name}</h4>
      <MiniList list={sameAttr} />
    </section>
  );

  return (
    <article className="detail" style={{ '--el': attr?.color }} aria-labelledby="detail-name">
      <header className="detail__head">
        <Portrait agent={a} size="xl" />
        <div className="detail__title">
          <p className="eyebrow">
            <span className="eyebrow__meta">
              <AttributeGlyph attribute={a.attribute} size={16} />
              <span>{attr?.name} · <span className="nowrap">{a.rank === 'S' || a.rank === 'A' ? `${a.rank}-rank` : 'Special'}</span></span>
            </span>
            {a.version && <span className="eyebrow__ver">Ver {a.version}</span>}
            <SpecialtyTag specialty={a.specialty} size={16} />
          </p>
          <h2 id="detail-name" className="detail__name">{a.name}</h2>
          {a.upcoming && <ul className="tags"><li>Upcoming</li></ul>}
        </div>
        <div className="detail__head-actions">
          <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">×</button>
        </div>
      </header>

      {phone ? (
        <SwipeTabs
          key={a.id}
          label={`${a.name} details`}
          slides={[
            { id: 'overview', label: 'Overview', content: overview },
            { id: 'engines', label: 'W-Engines', content: engines },
            { id: 'mates', label: 'Teammates', content: mates },
          ]}
        />
      ) : (
        <>
          <div className="detail__grid">
            {overview}
            {engines}
          </div>
          {mates}
        </>
      )}

      <div className="detail__actions">
        <button className="btn btn--primary" onClick={onAdd} disabled={inActiveTeam || teamFull}>
          {inActiveTeam ? 'Already in current team' : teamFull ? 'Current team is full' : 'Add to current team'}
        </button>
      </div>
    </article>
  );
}

function MiniList({ list }) {
  if (!list.length) return <p className="muted small">None yet.</p>;
  return (
    <ul className="mini-agents">
      {list.map((x) => (
        <li key={x.id}>
          <a href={`#agent-${x.id}`} className="mini-agent">
            <Portrait agent={x} size="sm" />
            <span>{x.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function FitList({ list }) {
  if (!list.length) return <p className="muted small">None yet.</p>;
  return (
    <ul className="mini-agents">
      {list.map(({ agent: x, on, back, kit }) => (
        <li key={x.id}>
          <a href={`#agent-${x.id}`} className={`mini-agent${kit.length || (on && back) ? ' mini-agent--best' : ''}`}>
            <Portrait agent={x} size="sm" />
            <span>{x.name}</span>
            {on && back && <span className="fit-tag">Both ways</span>}
            {kit.map((k) => <span key={k} className="fit-tag fit-tag--kit">{k}</span>)}
          </a>
        </li>
      ))}
    </ul>
  );
}
