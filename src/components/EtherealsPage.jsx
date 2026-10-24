import { useEffect, useMemo, useState } from 'react';
import { AGENT_BY_ID, ATTRIBUTE_BY_ID, shortName } from '../data/game.js';
import { DEADLY_ASSAULT, SHIYU_DEFENSE } from '../data/endgame.js';
import { bestBuff, disjointTeams, suggestTeams } from '../lib/endgame.js';
import { recommendedTeam } from '../lib/builds.js';
import AttributeGlyph from './AttributeGlyph.jsx';
import Portrait from './Portrait.jsx';
import Keywords from './Keywords.jsx';
import ExportDialog from './ExportDialog.jsx';
import ExportIcon from './ExportIcon.jsx';
import { renderEndgameCard } from '../lib/endgameCards.js';
import MyEndgameTeams from './MyEndgameTeams.jsx';
import { hasMine, loadMine, saveMine } from '../lib/myEndgame.js';

const BASE = import.meta.env.BASE_URL;
const MODE_KEY = 'zzz-team-builder:endgameMode';
// Mode logos in public/modes/ (white on transparent; darkened in light mode).
const MODES = [
  { id: 'deadly-assault', label: 'Deadly Assault', logo: 'modes/deadly-assault.webp' },
  { id: 'shiyu', label: 'Shiyu Defense', logo: 'modes/shiyu-defense.webp' },
];
const ModeLogo = ({ id, className }) => {
  const m = MODES.find((x) => x.id === id);
  return <img className={`eg-logo ${className ?? ''}`} src={`${BASE}${m.logo}`} alt="" />;
};
const loadMode = () => {
  try {
    const v = localStorage.getItem(MODE_KEY);
    return MODES.some((m) => m.id === v) ? v : MODES[0].id;
  } catch {
    return MODES[0].id;
  }
};

const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const range = (a, b) => `${fmtDate(a)} – ${fmtDate(b)}`;

function Attrs({ ids, label, empty = 'None' }) {
  return (
    <div className="eg-attrs">
      <span className="eg-attrs__label">{label}</span>
      {ids.length ? (
        ids.map((id) => (
          <span key={id} className="eg-attr" style={{ '--el': ATTRIBUTE_BY_ID[id]?.color }}>
            <AttributeGlyph attribute={id} size={16} />
            {ATTRIBUTE_BY_ID[id]?.name}
          </span>
        ))
      ) : (
        <span className="muted small">{empty}</span>
      )}
    </div>
  );
}

function BuffCard({ buff, highlight }) {
  return (
    <div className={`eg-buff${highlight ? ' is-best' : ''}`}>
      <b>{buff.name}</b>
      {buff.text.map((t) => (
        <p key={t}>
          <Keywords text={t} />
        </p>
      ))}
    </div>
  );
}

function TeamRow({ team, onLoadTeam, label }) {
  if (!team) return <p className="muted small">No recommended team fits here yet.</p>;
  return (
    <div className="eg-team">
      {label && <span className="eg-team__label">{label}</span>}
      <div className="eg-team__members">
        {team.ids.map((id) => {
          const choices = team.options?.[id];
          if (choices) {
            // Either Agent works in this slot.
            return (
              <span key={id} className="eg-team__choice">
                {choices.map((c, k) => (
                  <span key={c} className="eg-team__choice-item">
                    {k > 0 && <span className="eg-team__or">/</span>}
                    <a href={`#agent-${c}`} className="eg-team__member" title={AGENT_BY_ID[c].name}>
                      <Portrait agent={AGENT_BY_ID[c]} size="sm" />
                      <span>{shortName(AGENT_BY_ID[c])}</span>
                    </a>
                  </span>
                ))}
              </span>
            );
          }
          return (
            <a key={id} href={`#agent-${id}`} className="eg-team__member" title={AGENT_BY_ID[id].name}>
              <Portrait agent={AGENT_BY_ID[id]} size="sm" />
              <span>{shortName(AGENT_BY_ID[id])}</span>
            </a>
          );
        })}
      </div>
      <ul className="eg-team__why">
        {team.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <button className="btn btn--small" onClick={() => onLoadTeam(recommendedTeam(team.ids[0], team.ids))}>
        Load team
      </button>
    </div>
  );
}

// The extra boss / challenge unlocked by top results. Teams are suggested once
// its weaknesses are added.
function BonusCard({ bonus, onLoadTeam }) {
  if (!bonus) return null;
  const known = bonus.weak.length > 0;
  const teams = known ? suggestTeams(bonus, [], 3) : [];
  return (
    <article className="eg-bonus">
      <div className="eg-bonus__head">
        <span className="eg-bonus__badge">{bonus.title}</span>
        <h4 className="eg-boss__name">{bonus.name ?? <span className="muted">Name to be added</span>}</h4>
      </div>
      <div className="eg-bonus__body">
        {bonus.art && <img className="eg-bonus__art" src={`${BASE}${bonus.art}`} alt="" loading="lazy" />}
        <div className="eg-bonus__info">
      <p className="small">{bonus.unlock}</p>
      {known ? (
        <>
          <Attrs ids={bonus.weak} label="Weak to" />
          <Attrs ids={bonus.resist} label="Resists" />
          {bonus.mechanics && (
            <ul className="eg-mech">
              {bonus.mechanics.map((m) => (
                <li key={m}>
                  <Keywords text={m} />
                </li>
              ))}
            </ul>
          )}
          <div className="eg-boss__teams">
            {teams.map((t) => (
              <TeamRow key={t.ids.join()} team={t} onLoadTeam={onLoadTeam} />
            ))}
          </div>
        </>
      ) : (
        <p className="muted small">Weaknesses and suggested teams will be added once they’re confirmed.</p>
      )}
        </div>
      </div>
    </article>
  );
}

function DeadlyAssault({ onLoadTeam, mine, onMine, onExportMine }) {
  const da = DEADLY_ASSAULT;
  const plan = useMemo(() => {
    const bosses = da.bosses.map((b) => {
      const buff = bestBuff(b, da.buffs);
      return { boss: b, buff, teams: suggestTeams(b, buff ? [buff] : [], 3) };
    });
    const run = disjointTeams(bosses.map((x) => ({ target: x.boss, buffs: x.buff ? [x.buff] : [] })));
    return { bosses, run };
  }, [da]);

  return (
    <section className="eg-mode">
      <header className="eg-mode__head">
        <h3 className="section-title eg-mode__title">
          <ModeLogo id="deadly-assault" className="eg-logo--head" />
          {da.label}
        </h3>
        <span className="eg-dates">{range(da.start, da.end)}</span>
      </header>
      <p className="muted small">{da.note}</p>
      {da.stars && (
        <p className="muted small">
          Stars per boss: {da.stars.map((n, i) => `${'★'.repeat(i + 1)} ${n.toLocaleString('en-US')}`).join(' · ')}
        </p>
      )}

      <h4 className="mini-title">Buffs</h4>
      <p className="eg-buff-legend">
        <span>
          Highlighted: <b className="kw kw--attr" style={{ color: '#f04a1a' }}>attributes</b>,{' '}
          <b className="kw kw--spec">specialties</b>, <b className="kw kw--stat">key stats</b> and{' '}
          <b className="kw kw--num">numbers</b>, so you can build your own team for each buff.
        </span>
      </p>
      <div className="eg-buffs">
        {da.buffs.map((b) => (
          <BuffCard key={b.id} buff={b} />
        ))}
      </div>

      <div className="eg-bosses">
        {plan.bosses.map(({ boss, buff, teams }, i) => (
          <article key={boss.id} className="eg-boss">
            <div className="eg-boss__art">
              <img src={`${BASE}${boss.art}`} alt="" loading="lazy" />
              <span className="eg-boss__stage">Boss {i + 1}</span>
              {boss.isNew && <span className="eg-boss__new">New</span>}
            </div>
            <div className="eg-boss__body">
              <h4 className="eg-boss__name">{boss.name ?? <span className="muted">Name to be added</span>}</h4>
              {(boss.type || boss.about) && <p className="muted small eg-boss__about">{[boss.type, boss.about].filter(Boolean).join(' · ')}</p>}
              <Attrs ids={boss.weak} label="Weak to" />
              <Attrs ids={boss.resist} label="Resists" />
              {buff && (
                <p className="eg-boss__buff">
                  Best buff here: <b>{buff.name}</b>
                </p>
              )}
              <h5 className="micro-title">Rec. teams</h5>
              <div className="eg-boss__teams">
                {teams.length ? teams.map((t) => <TeamRow key={t.ids.join()} team={t} onLoadTeam={onLoadTeam} />) : <TeamRow team={null} />}
              </div>
            </div>
          </article>
        ))}
      </div>

      <BonusCard bonus={da.bonus} onLoadTeam={onLoadTeam} />

      <h4 className="mini-title">Full run, no Agent used twice</h4>
      <div className="eg-run">
        {plan.run.map((t, i) => (
          <TeamRow key={i} team={t} onLoadTeam={onLoadTeam} label={`Boss ${i + 1} · ${plan.bosses[i].buff?.name ?? ''}`} />
        ))}
      </div>

      <MyEndgameTeams
        targets={da.bosses.map((b, i) => ({ label: `Boss ${i + 1}`, name: b.name }))}
        buffs={da.buffs}
        bonus={da.bonus?.name ? da.bonus : null}
        mine={mine}
        onChange={onMine}
        onExport={onExportMine}
      />
    </section>
  );
}

function Shiyu({ onLoadTeam, mine, onMine, onExportMine }) {
  const sd = SHIYU_DEFENSE;
  const stages = useMemo(
    () =>
      sd.stages.map((st) => ({
        st,
        teams: disjointTeams(st.sides.map((side) => ({ target: side, buffs: [...st.buffs, ...(side.buffs ?? [])] }))),
      })),
    [sd],
  );
  const [open, setOpen] = useState(sd.stages[sd.stages.length - 1].n);

  return (
    <section className="eg-mode">
      <header className="eg-mode__head">
        <h3 className="section-title eg-mode__title">
          <ModeLogo id="shiyu" className="eg-logo--head" />
          {sd.label}
        </h3>
        <span className="eg-dates">{range(sd.start, sd.end)}</span>
      </header>
      <p className="muted small">{sd.note}</p>

      {sd.stages.length > 1 && <div className="eg-stages" role="tablist" aria-label="Stage">
        {sd.stages.map((st) => (
          <button key={st.n} role="tab" className="chip" aria-pressed={open === st.n} onClick={() => setOpen(st.n)}>
            Stage {st.n}
          </button>
        ))}
      </div>}

      {stages
        .filter(({ st }) => st.n === open)
        .map(({ st, teams }) => (
          <article key={st.n} className="eg-stage">
            <h4 className="eg-stage__name">
              Stage {st.n} · {st.name}
            </h4>
            {st.score && <p className="muted small">{st.score}</p>}
            {st.buffs.length > 0 && (
              <div className="eg-buffs">
                {st.buffs.map((b) => (
                  <BuffCard key={b.id} buff={b} />
                ))}
              </div>
            )}
            <div className="eg-sides">
              {st.sides.map((side, i) => (
                <div key={i} className="eg-side">
                  <div className="eg-side__head">
                    {side.art && <img className="eg-side__art" src={`${BASE}${side.art}`} alt="" loading="lazy" />}
                    <div>
                      <h5 className="eg-side__name">{st.sides.length > 2 ? `Room ${i + 1}` : `Side ${i + 1}`}</h5>
                      {side.name && <p className="small eg-side__boss">{side.name}</p>}
                    </div>
                  </div>
                  <Attrs ids={side.weak} label="Weak to" />
                  <Attrs ids={side.resist} label="Resists" />
                  {side.waves && (
                    <ol className="eg-waves">
                      {side.waves.map((w, k) => (
                        <li key={k}>
                          <span>Wave {k + 1}</span>
                          {w}
                        </li>
                      ))}
                    </ol>
                  )}
                  {side.tip && (
                    <p className="small eg-tip">
                      <Keywords text={side.tip} />
                    </p>
                  )}
                  {side.buffs?.map((b) => (
                    <BuffCard key={b.id} buff={b} />
                  ))}
                  <TeamRow team={teams[i]} onLoadTeam={onLoadTeam} label="In the full plan" />
                  {(() => {
                    const others = suggestTeams(side, [...st.buffs, ...(side.buffs ?? [])], 3).filter(
                      (t) => t.ids.join() !== teams[i]?.ids.join(),
                    );
                    return (
                      others.length > 0 && (
                        <>
                          <h5 className="micro-title">Other options</h5>
                          {others.map((t) => (
                            <TeamRow key={t.ids.join()} team={t} onLoadTeam={onLoadTeam} />
                          ))}
                        </>
                      )
                    );
                  })()}
                </div>
              ))}
            </div>
          </article>
        ))}
      <BonusCard bonus={sd.bonus} onLoadTeam={onLoadTeam} />

      <MyEndgameTeams
        targets={sd.stages.at(-1).sides.map((s, i) => ({ label: `Room ${i + 1}`, name: s.name }))}
        mine={mine}
        onChange={onMine}
        onExport={onExportMine}
      />
    </section>
  );
}

export default function EtherealsPage({ onLoadTeam }) {
  const [mode, setMode] = useState(loadMode);
  // null, 'rec' (recommended teams) or 'mine' (the reader's own teams)
  const [exporting, setExporting] = useState(null);
  const mineKey = mode === 'deadly-assault' ? `deadly-assault:${DEADLY_ASSAULT.id}` : `shiyu:${SHIYU_DEFENSE.id}`;
  const targets = mode === 'deadly-assault' ? DEADLY_ASSAULT.bosses.length : SHIYU_DEFENSE.stages.at(-1).sides.length;
  const [mineAll, setMineAll] = useState({});
  const mine = mineAll[mineKey] ?? loadMine(mineKey, targets);
  const setMine = (m) => {
    setMineAll((all) => ({ ...all, [mineKey]: m }));
    saveMine(mineKey, hasMine(m) ? m : null);
  };
  const mineProps = { mine, onMine: setMine, onExportMine: () => setExporting('mine') };
  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      /* storage unavailable */
    }
  }, [mode]);
  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Ethereals</h2>
        <p className="muted">
          The current endgame rotations: what each enemy is weak to, the buffs on offer, and teams that fit. Teams are
          picked by the site from the weaknesses and buffs, using the recommended teams on each Agent’s page. They’re
          recommendations, not the only way to clear: with some investment (a strong W-Engine, good Drive Disc
          substats), other A- and S-rank Agents can clear too.
        </p>
      </header>
      <div className="filters filters--page filters--row">
        <div className="chips" role="group" aria-label="Endgame mode">
          {MODES.map((m) => (
            <button key={m.id} className="chip eg-mode-chip" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>
              <img className="eg-logo eg-logo--chip" src={`${BASE}${m.logo}`} alt="" />
              {m.label}
            </button>
          ))}
        </div>
        <button className="btn eg-export" onClick={() => setExporting('rec')}>
          <ExportIcon />
          Export card
        </button>
      </div>
      {mode === 'deadly-assault' ? (
        <DeadlyAssault onLoadTeam={onLoadTeam} {...mineProps} />
      ) : (
        <Shiyu onLoadTeam={onLoadTeam} {...mineProps} />
      )}
      {exporting && (
        <ExportDialog
          onClose={() => setExporting(null)}
          title="Endgame card"
          name={MODES.find((m) => m.id === mode).label}
          suffix="zzz"
          kinds={[
            { id: 'rec', label: 'Recommended', hint: 'Rec. teams' },
            ...(hasMine(mine) ? [{ id: 'mine', label: mine.kind === 'used' ? 'My run' : 'My picks', hint: 'Your teams' }] : []),
          ]}
          kind={exporting}
          onKind={setExporting}
          render={(opts) => renderEndgameCard(mode, { ...opts, custom: exporting === 'mine' ? mine : null })}
        />
      )}
    </div>
  );
}
