import { useState } from 'react';
import { AGENT_BY_ID, BANGBOO_BY_ID, DRIVE_DISC_BY_ID, W_ENGINE_BY_ID, shortName } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { passiveStatus, kitLinks } from '../lib/analyze.js';
import { recommendedLoadout, recommendedTeam } from '../lib/builds.js';
import { setColor } from './DiscWheel.jsx';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import BangbooArt from './BangbooArt.jsx';

// The Agent page's "Build & teams" tab: the recommended W-Engines, Drive Disc
// sets and stats, and the best teams, each loadable into the team builder with
// every member's recommended gear.
export function AgentBuild({ agent: a, inActiveTeam, onApply }) {
  const b = BUILDS[a.id];
  const [done, setDone] = useState(false);
  if (!b) return <NoBuild agent={a} />;
  const statLabel = (s) => s.replace(/\bER\b/g, 'Energy Regen');
  return (
    <section className="build">
      <h3 className="mini-title">Recommended build</h3>

      <h4 className="micro-title">W-Engines · best first</h4>
      <ol className="build__engines">
        {b.wEngines.map((id, i) => {
          const w = W_ENGINE_BY_ID[id];
          return (
            <li key={id}>
              <a className={`engine-row${i === 0 ? ' engine-row--sig' : ''}`} href={`#w-engine-${id}`}>
                <RankBadge rank={w.rank} size={18} />
                <span className="engine-row__name">{w.name}</span>
                {w.signatureOf === a.id && <span className="chip-tag">Signature</span>}
                {i === 0 && <span className="fit-tag fit-tag--kit">Best</span>}
              </a>
            </li>
          );
        })}
      </ol>

      <div className="build__discs">
        <div>
          <h4 className="micro-title">4-piece set</h4>
          <SetList ids={b.fourPiece} />
        </div>
        <div>
          <h4 className="micro-title">2-piece set</h4>
          <SetList ids={b.twoPiece} />
        </div>
      </div>

      <h4 className="micro-title">Main stats</h4>
      <dl className="build__stats">
        {[4, 5, 6].map((s) => (
          <div key={s}>
            <dt>Slot {s}</dt>
            <dd>{statLabel(b.main[s])}</dd>
          </div>
        ))}
        <div className="build__subs">
          <dt>Substats</dt>
          <dd>{statLabel(b.substats)}</dd>
        </div>
      </dl>

      <div className="build__actions">
        <button
          className="btn"
          onClick={() => {
            onApply(a.id, recommendedLoadout(a.id));
            setDone(true);
          }}
          disabled={!inActiveTeam}
        >
          Equip on {shortName(a)} in current team
        </button>
        {!inActiveTeam && <span className="muted small">Add {shortName(a)} to the current team first.</span>}
        {inActiveTeam && done && <span className="muted small" role="status">Equipped: best W-Engine, 4 + 2 discs and main stats.</span>}
      </div>
    </section>
  );
}

export function AgentTeams({ agent: a, onLoadTeam }) {
  const b = BUILDS[a.id];
  if (!b) return <NoBuild agent={a} />;
  const bangboo = b.bangboo.map((id) => BANGBOO_BY_ID[id]).filter(Boolean);
  return (
    <section className="build">
      <h3 className="mini-title">Best teams</h3>
      <p className="muted small">
        Load a team to add it to your teams, with each Agent’s recommended W-Engine and Drive Discs equipped.
      </p>
      <ul className="best-teams">
        {b.teams.map((members, i) => {
          const passives = passiveStatus(members);
          const kit = kitLinks(members);
          return (
            <li key={members.join()} className="best-team">
              <span className="best-team__n">{i + 1}</span>
              <span className="best-team__members">
                {members.map((id) => {
                  const m = AGENT_BY_ID[id];
                  return (
                    <a key={id} href={`#agent-${id}`} className="best-team__member" title={m.name}>
                      <Portrait agent={m} size="sm" />
                      <span>{shortName(m)}</span>
                    </a>
                  );
                })}
              </span>
              <span className="best-team__meta">
                <span className="fit-tag" title="Additional Abilities active">AA {passives.active}/{passives.total}</span>
                {kit.map((k) => <span key={k.id} className="fit-tag fit-tag--kit">{k.name}</span>)}
              </span>
              <button className="btn btn--small" onClick={() => onLoadTeam(recommendedTeam(a.id, members))}>
                Load team
              </button>
            </li>
          );
        })}
      </ul>
      {bangboo.length > 0 && (
        <>
          <h4 className="micro-title">Bangboo</h4>
          <ul className="mini-agents">
            {bangboo.map((x) => (
              <li key={x.id}>
                <span className="mini-agent">
                  <BangbooArt id={x.id} size={24} />
                  <span>{x.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function SetList({ ids }) {
  return (
    <ul className="build__sets">
      {ids.map((id, i) => (
        <li key={id} style={{ '--set': setColor(id) }}>
          <span className="bonus__dot" />
          <span>{DRIVE_DISC_BY_ID[id].name}</span>
          {i === 0 && <span className="fit-tag fit-tag--kit">Best</span>}
        </li>
      ))}
    </ul>
  );
}

function NoBuild({ agent }) {
  return (
    <section className="build">
      <p className="muted small">
        {agent.upcoming
          ? `${agent.name} isn’t released yet, so there’s no recommended build or team until launch.`
          : `No recommended build for ${agent.name} yet.`}
      </p>
    </section>
  );
}
