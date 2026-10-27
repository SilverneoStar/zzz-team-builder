import SpecialtyIcon from './SpecialtyIcon.jsx';
import { useState } from 'react';
import { ATTRIBUTE_BY_ID, SPECIALTY_BY_ID, initials, shortName } from '../data/game.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import { agentArt } from './Portrait.jsx';
import { memberArt, shownFaction, useMemberIndex } from '../lib/memberArt.js';
import PassiveFace from './PassiveFace.jsx';
import RankBadge from './RankBadge.jsx';
import { factionLogo, factionSlug } from './FactionLogo.jsx';

// The slanted Agent card from the game's squad screen: a dark leaning card
// with the art inset, and a footer with the attribute and specialty icons in
// a round badge next to the name (over a second line, where the game shows
// the level), and the rank in a pill on the right.
// `passive` ({ state: 'on' | 'off' | 'unknown', title }) puts the squad screen's
// passive face in the round badge instead; the rank then moves to the art's corner.
// `faction` (the Agents page) shows the faction logo faded behind the art (a
// small 160px copy in public/factions/bg/, cached after the first load), the
// attribute and specialty icons on the right, and the rank on the art's corner.
export default function AgentFrame({ agent, sub, tag, tall = false, passive, faction = false }) {
  const member = useMemberIndex(agent);
  const src = agent.members ? memberArt(agent, member) : agentArt(agent.id);
  // Several members with none picked: all of them, one box above another.
  const collage = agent.members && member < 0;
  const [failedSrc, setFailedSrc] = useState(null);
  const color = ATTRIBUTE_BY_ID[agent.attribute]?.color;
  const ranked = agent.rank === 'S' || agent.rank === 'A';
  // A picked member shows their own department's logo.
  const factionName = shownFaction(agent, member).logo;
  const factionBg =
    faction && factionLogo(factionName)
      ? `${import.meta.env.BASE_URL}factions/bg/${factionSlug(factionName)}.webp`
      : null;
  return (
    <span
      className={`frame${tall ? ' frame--tall' : ''}${faction ? ' frame--no-badge' : ''}`}
      style={{ '--el': color }}
      title={agent.members && member >= 0 ? `${agent.name} · ${agent.members[member].name}` : agent.name}
    >
      <span className="frame__art-box">
        {factionBg && (
          <span className="frame__faction-bg" style={{ backgroundImage: `url(${factionBg})` }} aria-hidden="true" />
        )}
        {collage ? (
          <span className="frame__collage">
            {agent.members.map((m, i) => (
              <span key={m.key} className="frame__collage-cell">
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
        ) : failedSrc === src ? (
          <span className="frame__initials">{initials(agent.name)}</span>
        ) : (
          <img
            className="frame__art"
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailedSrc(src)}
          />
        )}
        {tag && <span className="frame__tag">{tag}</span>}
        {faction && ranked && (
          <span className="frame__corner-rank frame__corner-rank--right">
            <RankBadge rank={agent.rank} size={22} />
          </span>
        )}
        {passive && ranked && (
          <span className="frame__corner-rank">
            <RankBadge rank={agent.rank} size={22} />
          </span>
        )}
      </span>
      <span className="frame__foot">
        {!faction && (
          <span className="frame__badge">
            {passive ? (
              <PassiveFace state={passive.state} size={30} title={passive.title} />
            ) : (
              <span className="frame__badge-icons">
                <AttributeGlyph attribute={agent.attribute} size={14} title={ATTRIBUTE_BY_ID[agent.attribute]?.name} />
                <SpecialtyIcon specialty={agent.specialty} size={14} title={SPECIALTY_BY_ID[agent.specialty]?.name} />
              </span>
            )}
          </span>
        )}
        <span className="frame__text">
          <span className="frame__name-line">
            <span className="frame__name">{shortName(agent)}</span>
            {!passive && !faction && (
              <span className="frame__name-icons">
                <AttributeGlyph attribute={agent.attribute} size={13} title={ATTRIBUTE_BY_ID[agent.attribute]?.name} />
                <SpecialtyIcon specialty={agent.specialty} size={13} title={SPECIALTY_BY_ID[agent.specialty]?.name} />
              </span>
            )}
          </span>
          <span className="frame__sub">{sub ?? SPECIALTY_BY_ID[agent.specialty]?.name}</span>
        </span>
        <span className={faction ? 'frame__pill frame__pill--types' : 'frame__pill'}>
          {passive || faction ? (
            <>
              <AttributeGlyph attribute={agent.attribute} size={18} title={ATTRIBUTE_BY_ID[agent.attribute]?.name} />
              <SpecialtyIcon specialty={agent.specialty} size={18} title={SPECIALTY_BY_ID[agent.specialty]?.name} />
            </>
          ) : ranked ? (
            <RankBadge rank={agent.rank} size={22} />
          ) : (
            <span className="frame__badge-dot" />
          )}
        </span>
      </span>
    </span>
  );
}

// An empty squad slot in the same card, like the game's "+ SELECT / EMPTY".
export function EmptyFrame({ text = 'Select' }) {
  return (
    <span className="frame frame--tall frame--empty">
      <span className="frame__art-box">
        <span className="frame__select">+ {text}</span>
      </span>
      <span className="frame__foot frame__foot--empty">
        <span className="frame__empty-pill">Empty</span>
      </span>
    </span>
  );
}
