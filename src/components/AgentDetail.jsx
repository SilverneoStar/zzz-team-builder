// One Agent's page: header, beta note, member picker (Sunbringer), and the
// Overview / Skills / Materials / Build / My build / Best teams / Teammates
// tabs, plus the Export card button.
import { useEffect, useState } from 'react';
import { SpecialtyTag } from './SpecialtyIcon.jsx';
import { ATTRIBUTE_BY_ID } from '../data/game.js';
import { PRESETS } from '../data/presets.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import Portrait from './Portrait.jsx';
import SwipeTabs from './SwipeTabs.jsx';
import { AgentBuild, AgentTeams } from './AgentBuild.jsx';
import Teammates from './Teammates.jsx';
import ExportDialog from './ExportDialog.jsx';
import ExportIcon from './ExportIcon.jsx';
import { AGENT_CARDS, MY_BUILD_CARD } from '../lib/exportSettings.js';

// The card drawing code loads only when a card is exported.
const renderAgentCard = (agent, opts) => import('../lib/agentCards.js').then((m) => m.renderAgentCard(agent, opts));
import SkillsTab, { prefetchSkills } from './SkillsTab.jsx';
import MaterialsTab from './MaterialsTab.jsx';
import FactionLogo from './FactionLogo.jsx';
import MemberPicker from './MemberPicker.jsx';
import { shownFaction, useMemberIndex } from '../lib/memberArt.js';
import MyBuild from './MyBuild.jsx';
import { setShowBeta, useShowBeta } from '../lib/betaInfo.js';
import { myBuildOf } from '../lib/myBuilds.js';

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AgentDetail({
  agent: a,
  inActiveTeam,
  teamFull,
  onAdd,
  onClose,
  onApplyBuild,
  onLoadTeam,
  team,
}) {
  const fac = shownFaction(a, useMemberIndex(a));
  // Load the Skills tab's data while the reader looks at the Overview.
  useEffect(() => {
    prefetchSkills(a.id);
  }, [a.id]);
  const [card, setCard] = useState(null);
  const beta = useShowBeta();
  const attrRaw = ATTRIBUTE_BY_ID[a.attribute];
  // With beta info hidden, a beta element name falls back to its base attribute.
  const attr = attrRaw?.beta && !beta ? { ...ATTRIBUTE_BY_ID[attrRaw.base], color: attrRaw.color } : attrRaw;
  const featured = PRESETS.filter((p) => p.members.includes(a.id));

  const overview = (
    <div className="detail__main">
      <dl className="facts">
        <div>
          <dt>Attribute</dt>
          <dd className="cell-el">
            <AttributeGlyph attribute={a.attribute} size={15} />
            {attr?.name}
            {attr?.base && !attr.unnamed && (
              <span className="muted"> · counts as {ATTRIBUTE_BY_ID[attr.base].name}</span>
            )}
            {attr?.beta && <span className="card__tag card__tag--warn"> Beta</span>}
            {a.attributeNote && (!attrRaw?.beta || beta) && <span className="muted"> · {a.attributeNote}</span>}
          </dd>
        </div>
        {a.members && (
          <div>
            <dt>Members</dt>
            <dd className="members-list">
              {a.members.map((m) => (
                <span key={m.key} className="cell-faction">
                  <FactionLogo faction={m.faction} size={20} />
                  {m.name}, {m.deptName} ({m.dept})
                </span>
              ))}
            </dd>
          </div>
        )}
        <div>
          <dt>Specialty</dt>
          <dd>
            <SpecialtyTag specialty={a.specialty} size={16} />
          </dd>
        </div>
        <div>
          <dt>Attack type</dt>
          <dd>
            {(a.attackTypeBeta && !beta ? '' : a.attackType.map(cap).join(', ')) || (
              <span className="muted">Not announced yet</span>
            )}
          </dd>
        </div>
        <div>
          <dt>Faction</dt>
          <dd className="cell-faction">
            <FactionLogo faction={fac.logo} size={22} />
            {fac.name}
          </dd>
        </div>
        {a.collab && (
          <div>
            <dt>Collab</dt>
            <dd>{a.collab}</dd>
          </div>
        )}
        <div>
          <dt>Released</dt>
          <dd>
            {a.upcoming ? (
              <span className="muted">
                {a.version ? `Version ${a.version}${a.phase ? `, phase ${a.phase}` : ''} (upcoming)` : 'Upcoming'}
              </span>
            ) : (
              `Version ${a.version}`
            )}
          </dd>
        </div>
      </dl>
      {featured.length > 0 && (
        <section>
          <h3 className="mini-title">Featured in</h3>
          <ul className="tags">
            {featured.map((p) => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );

  const mates = <Teammates agent={a} />;

  return (
    <article className="detail" style={{ '--el': attr?.color }} aria-labelledby="detail-name">
      <header className="detail__head">
        <Portrait agent={a} size="xl" />
        <div className="detail__title">
          <p className="eyebrow">
            <span className="eyebrow__meta">
              <AttributeGlyph attribute={a.attribute} size={16} />
              <span>
                {attr?.name} ·{' '}
                <span className="nowrap">{a.rank === 'S' || a.rank === 'A' ? `${a.rank}-rank` : 'Special'}</span>
              </span>
            </span>
            {a.version && <span className="eyebrow__ver">Ver {a.version}</span>}
            <SpecialtyTag specialty={a.specialty} size={16} />
          </p>
          <h2 id="detail-name" className="detail__name">
            {a.name}
          </h2>
          {(a.upcoming || a.voidHunter) && (
            <ul className="tags">
              {a.upcoming && <li>Upcoming</li>}
              {a.voidHunter && <li>Void Hunter</li>}
            </ul>
          )}
        </div>
        <div className="detail__head-actions">
          <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">
            ×
          </button>
        </div>
      </header>
      {a.beta && (
        <div className="beta-note" role="note">
          <p>
            <span className="card__tag card__tag--warn">Beta</span>{' '}
            {beta
              ? `Parts of this page (kit and build${attrRaw?.beta ? ', and element name' : ''}) come from beta information and may change before release.`
              : 'Beta information for this Agent (kit, build and more) is hidden.'}{' '}
            Always check the{' '}
            <a href="https://zenless.hoyoverse.com/" target="_blank" rel="noopener noreferrer">
              official ZZZ pages
            </a>
            .
          </p>
          <button type="button" className="rec-btn" onClick={() => setShowBeta(!beta)} aria-pressed={!beta}>
            {beta ? 'Hide beta info' : 'Show beta info'}
          </button>
        </div>
      )}
      {/* Full width under the header, so the buttons sit in one row on phones too. */}
      {a.members && <MemberPicker agent={a} />}

      <SwipeTabs
        key={a.id}
        label={`${a.name} details`}
        slides={[
          {
            id: 'overview',
            label: 'Overview',
            content: overview,
          },
          { id: 'skills', label: 'Skills', content: <SkillsTab agent={a} team={team} /> },
          { id: 'materials', label: 'Materials', content: <MaterialsTab agent={a} /> },
          {
            id: 'build',
            label: 'Build',
            content: <AgentBuild agent={a} inActiveTeam={inActiveTeam} onApply={onApplyBuild} />,
          },
          {
            id: 'mine',
            label: 'My build',
            content: (
              <MyBuild
                agent={a}
                team={team}
                inActiveTeam={inActiveTeam}
                onApply={onApplyBuild}
                onExport={() => setCard('mine')}
              />
            ),
          },
          { id: 'teams', label: 'Best teams', content: <AgentTeams agent={a} onLoadTeam={onLoadTeam} /> },
          { id: 'mates', label: 'Teammates', content: mates },
        ]}
      />

      <div className="detail__actions">
        <button className="btn btn--primary" onClick={onAdd} disabled={inActiveTeam || teamFull}>
          {inActiveTeam ? 'Already in current team' : teamFull ? 'Current team is full' : 'Add to current team'}
        </button>
        <button className="btn" onClick={() => setCard('build')}>
          <ExportIcon />
          Export card
        </button>
      </div>
      {card && (
        <ExportDialog
          onClose={() => setCard(null)}
          title="Agent card"
          name={a.name}
          suffix="zzz"
          kinds={myBuildOf(a.id) ? [...AGENT_CARDS, MY_BUILD_CARD] : AGENT_CARDS}
          kind={card}
          onKind={setCard}
          render={(opts) => renderAgentCard(a, { ...opts, loadout: myBuildOf(a.id) })}
        />
      )}
    </article>
  );
}
