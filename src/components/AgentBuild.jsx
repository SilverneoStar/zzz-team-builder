import { useState } from 'react';
import { AGENT_BY_ID, BANGBOO_BY_ID, DRIVE_DISC_BY_ID, W_ENGINE_BY_ID, shortName, signatureOf } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { UPCOMING } from '../data/upcoming.js';
import { GUIDE_URL, STAT_TARGETS } from '../data/statTargets.js';
import { passiveStatus, kitLinks } from '../lib/analyze.js';
import { recommendedLoadout, recommendedTeam } from '../lib/builds.js';
import { setColor } from './DiscWheel.jsx';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import WEngineArt from './WEngineArt.jsx';
import BangbooArt from './BangbooArt.jsx';
import DiscArt from './DiscArt.jsx';

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
      <Targets agent={a} />

      <h4 className="micro-title">W-Engines · best first</h4>
      <ol className="build__engines">
        {b.wEngines.map((id, i) => {
          const w = W_ENGINE_BY_ID[id];
          return (
            <li key={id}>
              <a className={`engine-row${i === 0 ? ' engine-row--sig' : ''}`} href={`#w-engine-${id}`}>
                <WEngineArt w={w} size={30} />
                <span className="engine-row__name">{w.name}</span>
                <RankBadge rank={w.rank} size={16} />
                {w.signatureOf === a.id && <span className="chip-tag">Signature</span>}
                {w.provisional && <span className="card__tag card__tag--warn">Subject to change</span>}
                <span className="muted small">{w.advanced ? `${w.advanced.stat} ${w.advanced.max}` : ''}</span>
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
        {inActiveTeam && done && (
          <span className="muted small" role="status">
            Equipped: best W-Engine, 4 + 2 discs and main stats.
          </span>
        )}
      </div>
    </section>
  );
}

// Best teams show this many, the rest fold behind a button.
const TEAMS_SHOWN = 3;

export function AgentTeams({ agent: a, onLoadTeam }) {
  const [allTeams, setAllTeams] = useState(false);
  const b = BUILDS[a.id];
  if (!b && UPCOMING[a.id]?.teams) return <UpcomingTeams agent={a} onLoadTeam={onLoadTeam} />;
  if (!b) return <NoBuild agent={a} />;
  const bangboo = b.bangboo.map((id) => BANGBOO_BY_ID[id]).filter(Boolean);
  return (
    <section className="build">
      <h3 className="mini-title">Best teams</h3>
      <p className="muted small">
        Load a team to add it to your teams, with each Agent’s recommended W-Engine and Drive Discs equipped.
      </p>
      <ul className="best-teams">
        {(allTeams ? b.teams : b.teams.slice(0, TEAMS_SHOWN)).map((members, i) => {
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
                <span className="fit-tag" title="Additional Abilities active">
                  Abilities {passives.active}/{passives.total}
                </span>
                {kit.map((k) => (
                  <span key={k.id} className="fit-tag fit-tag--kit">
                    {k.name}
                  </span>
                ))}
              </span>
              <button className="btn btn--small" onClick={() => onLoadTeam(recommendedTeam(a.id, members))}>
                Load team
              </button>
            </li>
          );
        })}
      </ul>
      {b.teams.length > TEAMS_SHOWN && (
        <button
          type="button"
          className="btn btn--quiet btn--small best-teams__more"
          onClick={() => setAllTeams(!allTeams)}
          aria-expanded={allTeams}
        >
          {allTeams ? 'Show fewer teams' : `Show ${b.teams.length - TEAMS_SHOWN} more teams`}
        </button>
      )}
      {bangboo.length > 0 && (
        <>
          <h4 className="micro-title">Bangboo</h4>
          <ul className="mini-agents">
            {bangboo.map((x) => (
              <li key={x.id}>
                <a className="mini-agent" href={`#bangboo-${x.id}`} title={x.name}>
                  <BangbooArt id={x.id} size={24} />
                  <span>{x.name}</span>
                </a>
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
          <DiscArt id={id} size={24} />
          <span>{DRIVE_DISC_BY_ID[id].name}</span>
          {i === 0 && <span className="fit-tag fit-tag--kit">Best</span>}
        </li>
      ))}
    </ul>
  );
}

function NoBuild({ agent }) {
  const style = UPCOMING[agent.id]?.style;
  const trial = UPCOMING[agent.id]?.trial;
  const sig = signatureOf(agent.id);
  const engines = (UPCOMING[agent.id]?.engines ?? []).map((id) => W_ENGINE_BY_ID[id]).filter(Boolean);
  return (
    <section className="build">
      {engines.length > 0 ? (
        <>
          <h4 className="micro-title">W-Engines · best first</h4>
          <ol className="build__engines">
            {engines.map((w, i) => (
              <li key={w.id}>
                <a className={`engine-row${i === 0 ? ' engine-row--sig' : ''}`} href={`#w-engine-${w.id}`}>
                  <WEngineArt w={w} size={30} />
                  <span className="engine-row__name">{w.name}</span>
                  <RankBadge rank={w.rank} size={16} />
                  {w.signatureOf === agent.id && <span className="chip-tag">Signature</span>}
                  {w.provisional && <span className="card__tag card__tag--warn">Subject to change</span>}
                  <span className="muted small">
                    {w.advanced ? `${w.advanced.stat} ${w.advanced.max}` : 'Stats not published yet'}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </>
      ) : (
        sig && (
          <>
            <h4 className="micro-title">Signature W-Engine</h4>
            <a className="engine-row engine-row--sig" href={`#w-engine-${sig.id}`}>
              <WEngineArt w={sig} size={30} />
              <span className="engine-row__name">{sig.name}</span>
              <RankBadge rank={sig.rank} size={16} />
              {sig.provisional && <span className="card__tag card__tag--warn">Subject to change</span>}
              <span className="muted small">
                {sig.advanced ? `${sig.advanced.stat} ${sig.advanced.max}` : 'Stats not published yet'}
              </span>
            </a>
          </>
        )
      )}
      {trial && (
        <>
          {trial.fourPiece && (
            <>
              <h4 className="micro-title">Drive Discs · {trial.source}</h4>
              <div className="build__discs">
                <div>
                  <h4 className="micro-title">4-piece set</h4>
                  <SetList ids={trial.fourPiece} />
                </div>
                <div>
                  <h4 className="micro-title">2-piece set</h4>
                  <SetList ids={trial.twoPiece} />
                </div>
              </div>
            </>
          )}
          {trial.main && (
            <>
              <h4 className="micro-title">
                Main stats · {trial.source}
                {agent.upcoming && !UPCOMING[agent.id]?.confirmed && (
                  <>
                    {' '}
                    <span className="card__tag card__tag--warn">Subject to change</span>
                  </>
                )}
              </h4>
              <dl className="build__stats">
                {[4, 5, 6].map((n) => (
                  <div key={n}>
                    <dt>Slot {n}</dt>
                    <dd>{trial.main[n]}</dd>
                  </div>
                ))}
                <div>
                  <dt>Substats</dt>
                  <dd>{trial.substats}</dd>
                </div>
              </dl>
            </>
          )}
          {trial.skills && (
            <>
              <h4 className="micro-title">Skill priority</h4>
              <ol className="small trial-notes">
                {trial.skills.map(([k, lv]) => (
                  <li key={k}>
                    {k} → {lv}
                  </li>
                ))}
              </ol>
            </>
          )}
          {trial.notes && (
            <>
              <h4 className="micro-title">What to build for</h4>
              <ul className="small trial-notes">
                {trial.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      {style && (
        <>
          <h3 className="mini-title">Expected build</h3>
          <p className="small">
            {style}{' '}
            {agent.upcoming && !UPCOMING[agent.id]?.confirmed && <span className="passive__est">Estimated</span>}
          </p>
        </>
      )}
      <p className="muted small">
        {agent.upcoming
          ? `${agent.name} isn’t released yet${agent.phase ? ` (coming in Version ${agent.version}, phase ${agent.phase})` : ''}, so the full recommended build comes at launch.`
          : `${agent.name}’s full recommended build (Drive Disc sets and best teams) is on the way.`}
      </p>
    </section>
  );
}

// Teams for an Agent who isn't out yet: ones HoYoverse has shown, and close
// estimates. Loading one fills the squad; gear is left for you to choose.
function UpcomingTeams({ agent: a, onLoadTeam }) {
  return (
    <section className="build">
      <h3 className="mini-title">Teams so far</h3>
      <p className="muted small">
        {UPCOMING[a.id]?.confirmed
          ? `${a.name} isn’t released yet${a.phase ? ` (Version ${a.version}, phase ${a.phase})` : ''}. These teams come from his in-game data and community guides.`
          : `${a.name} isn’t released yet. These are the teams HoYoverse has shown, plus close estimates, until the full guide is out.`}
      </p>
      <ul className="best-teams">
        {UPCOMING[a.id].teams.map(({ members, source }, i) => {
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
                <span className="fit-tag" title="Additional Abilities active">
                  Abilities {passives.active}/{passives.total}
                </span>
                {kit.map((k) => (
                  <span key={k.id} className="fit-tag fit-tag--kit">
                    {k.name}
                  </span>
                ))}
                <span className={`fit-tag${source.startsWith('Estimate') ? '' : ' fit-tag--kit'}`}>{source}</span>
              </span>
              <button className="btn btn--small" onClick={() => onLoadTeam(recommendedTeam(a.id, members))}>
                Load team
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// Role and in-combat stat targets, where the build guide has them.
function Targets({ agent }) {
  const t = STAT_TARGETS[agent.id];
  if (!t) return null;
  return (
    <div className="targets">
      <div className="targets__head">
        <span className="micro-title">Role</span>
        <b>{t.role}</b>
      </div>
      {t.targets?.length > 0 && (
        <>
          <h4 className="micro-title">Stat targets · in combat</h4>
          <ul className="targets__list">
            {t.targets.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </>
      )}
      {t.note && <p className="muted small">{t.note}</p>}
      <p className="muted small targets__src">
        From the community{' '}
        <a href={GUIDE_URL} target="_blank" rel="noreferrer">
          ZZZ Agent Build Guide
        </a>
        {t.version ? ` (updated for ${t.version})` : ''}.
      </p>
    </div>
  );
}
