import { SpecialtyTag } from './SpecialtyIcon.jsx';
import DiscArt from './DiscArt.jsx';
import {
  ATTRIBUTE_BY_ID,
  DISC_MAIN_STATS,
  DRIVE_DISC_BY_ID,
  DRIVE_DISC_SETS,
  MAX_MINDSCAPE,
  MAX_REFINEMENT,
  SPECIALTY_BY_ID,
  W_ENGINES,
  W_ENGINE_BY_ID,
  wEnginesFor,
} from '../data/game.js';
import { useRef, useState } from 'react';
import {
  RANKS,
  SUB_STATS,
  activeRolls,
  totalRolls,
  discBonuses,
  discStatTotals,
  formatStat,
  mainMax,
  mainStatOf,
  maxUpgrades,
  subValue,
  upgradesUsed,
} from '../lib/discs.js';
import DiscWheel, { setColor } from './DiscWheel.jsx';
import Portrait from './Portrait.jsx';
import { BETA_POTENTIAL, MAX_POTENTIAL, ROMAN, hasPotential } from '../data/potentials.js';
import { ENGINE_PICKS } from '../data/enginePicks.js';
import RankBadge from './RankBadge.jsx';
import MemberPicker from './MemberPicker.jsx';
import { recommendationFor, subPriority } from '../lib/builds.js';
import { BUILDS } from '../data/builds.js';
import { setShowBeta, useShowBeta } from '../lib/betaInfo.js';

// Gear for one Agent in this team: the W-Engine and its Phase, Mindscape, and
// the six Drive Disc slots on the equipment wheel, each with its own set, rank
// and main stat. Set bonuses follow from how many discs of a set are equipped.
export default function LoadoutPanel({ agent, loadout, onChange, onClose }) {
  const showBeta = useShowBeta();
  // A beta W-Engine stays in the list while it's equipped, even with beta info hidden.
  const equipped = loadout.wEngine && W_ENGINE_BY_ID[loadout.wEngine];
  const fits = [
    ...wEnginesFor(agent),
    ...(equipped?.beta && !showBeta && equipped.specialty === agent.specialty ? [equipped] : []),
  ];
  const others = W_ENGINES.filter((w) => w.specialty !== agent.specialty && (!w.beta || showBeta));
  const w = loadout.wEngine && W_ENGINE_BY_ID[loadout.wEngine];
  const attrName = ATTRIBUTE_BY_ID[agent.attribute]?.name;
  const statLabel = (s) => (s === 'Attribute DMG' ? `${attrName} DMG` : s);
  const [slot, setSlot] = useState(null);
  const engineRef = useRef(null);
  const discs = loadout.discs;
  const bonuses = discBonuses(discs);

  const setDisc = (i, patch) => onChange({ discs: discs.map((d, k) => (k === i ? { ...d, ...patch } : d)) });
  const fill = (indices, set) => onChange({ discs: discs.map((d, k) => (indices.includes(k) ? { ...d, set } : d)) });
  const cur = slot ? discs[slot - 1] : null;

  // The site's recommendation for this Agent, to tag options and fill in one tap.
  const recAll = recommendationFor(agent.id);
  const rec = recAll?.beta && !showBeta ? null : recAll;
  const recTag = rec?.beta ? 'Rec. (beta)' : rec?.estimate ? 'Rec. (est.)' : 'Rec.';
  const engineMark = (id) =>
    id === rec?.signature
      ? ' · Signature'
      : id === rec?.best
        ? ` · ${recTag} best`
        : rec?.wEngines.includes(id)
          ? ` · ${recTag}`
          : '';
  const setMark = (id, list) =>
    rec && list.includes(id) ? (id === list[0] ? ` · ${recTag} best` : ` · ${recTag}`) : '';
  const mainMark = (n, st) => (rec?.main[n] === st ? ` · ${recTag}` : '');
  // Recommended alternatives players pick over the signature (beta ones only with beta info on).
  const picks = (ENGINE_PICKS[agent.id] ?? []).filter((p) => W_ENGINE_BY_ID[p.id] && (!p.beta || showBeta));
  const pickOf = (id) => picks.find((p) => p.id === id);
  // Whether this Agent has anything beta to show, for the beta switch.
  const betaPotential = BETA_POTENTIAL.has(agent.id);
  const hasBeta =
    recAll?.beta ||
    betaPotential ||
    (ENGINE_PICKS[agent.id] ?? []).some((p) => p.beta) ||
    W_ENGINES.some((x) => x.beta && x.specialty === agent.specialty);
  const useEngine = () => rec?.best && onChange({ wEngine: rec.best });
  const useSets = () =>
    onChange({
      discs: discs.map((d, k) => {
        const set = k < 4 ? rec.four : rec.two;
        return set ? { ...d, set } : d;
      }),
    });
  const useMains = () =>
    onChange({ discs: discs.map((d, k) => (k >= 3 && rec.main[k + 1] ? { ...d, main: rec.main[k + 1] } : d)) });
  const useAll = () =>
    onChange({
      ...(rec.best ? { wEngine: rec.best } : {}),
      discs: discs.map((d, k) => {
        const set = k < 4 ? rec.four : rec.two;
        const main = k >= 3 ? rec.main[k + 1] : null;
        return { ...d, ...(set ? { set } : {}), ...(main ? { main } : {}) };
      }),
    });
  // Whether the recommendation is already in place, so the buttons can say so.
  const setsOn = rec?.four && discs.every((d, k) => d.set === ((k < 4 ? rec.four : rec.two) ?? d.set));
  const mainsOn = rec?.hasMain && [4, 5, 6].every((n) => !rec.main[n] || discs[n - 1].main === rec.main[n]);
  const allOn = (!rec?.best || loadout.wEngine === rec.best) && (!rec?.four || setsOn) && (!rec?.hasMain || mainsOn);
  const mainSummary = rec?.hasMain
    ? [4, 5, 6].map((n) => (rec.main[n] ? statLabel(rec.main[n]) : '—')).join(' · ')
    : null;

  return (
    <section className="loadout" aria-label={`${agent.name} loadout`}>
      <div className="loadout__head">
        <Portrait agent={agent} size="sm" />
        <h3 className="loadout__title">{agent.name}</h3>
        <span className="muted small loadout__meta">
          <SpecialtyTag specialty={agent.specialty} /> · {attrName}
        </span>
        <a className="loadout__link" href={`#agent-${agent.id}`}>
          Agent page
        </a>
        <button className="btn btn--quiet loadout__close" onClick={onClose} aria-label="Close loadout">
          ×
        </button>
      </div>
      {agent.members && <MemberPicker agent={agent} />}
      {hasBeta && (
        <p className="beta-switch muted small">
          <span className="card__tag card__tag--warn">Beta</span>
          {showBeta
            ? 'Showing beta info: W-Engines, Potentials and picks from beta tests. Subject to change.'
            : 'Beta W-Engines, Potentials and picks are hidden.'}
          <button type="button" className="rec-btn" onClick={() => setShowBeta(!showBeta)} aria-pressed={showBeta}>
            {showBeta ? 'Hide beta info' : 'Show beta info'}
          </button>
        </p>
      )}
      {rec && (
        <div className="rec-bar">
          <span className="rec-tag">{recTag}</span>
          <span className="muted small rec-bar__text">
            {rec.beta
              ? `Build from beta information for ${agent.name}. Subject to change: always check the official ZZZ pages.`
              : rec.estimate
                ? `Estimated build for ${agent.name} until the kit is revealed.`
                : `The recommended build from ${agent.name}’s page.`}
          </span>
          <button className="btn btn--small btn--primary" onClick={useAll} disabled={allOn}>
            {allOn ? '✓ Recommended build on' : 'Use recommended build'}
          </button>
        </div>
      )}

      <div className="loadout__grid loadout__grid--wheel">
        <div className="loadout__block">
          <label className="field">
            <span className="field__row">
              W-Engine
              {rec?.best && loadout.wEngine !== rec.best && (
                <button type="button" className="rec-btn" onClick={useEngine}>
                  Use {rec.best === rec.signature ? 'signature' : 'recommended'}
                </button>
              )}
            </span>
            <select
              ref={engineRef}
              value={loadout.wEngine ?? ''}
              onChange={(e) => onChange({ wEngine: e.target.value || null })}
            >
              <option value="">None</option>
              <optgroup label={`${SPECIALTY_BY_ID[agent.specialty]?.name} W-Engines`}>
                {fits.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.rank} · {x.name}
                    {engineMark(x.id)}
                    {pickOf(x.id) ? ` · Rec. alt${pickOf(x.id).beta ? ' (beta)' : ''}` : ''}
                    {x.upcoming ? ' (upcoming)' : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other specialties (passive won’t apply)">
                {others.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.rank} · {x.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          {picks.map((p) => (
            <p key={p.id} className="pick-note small">
              <span className="rec-tag">Rec. alt{p.beta ? ' (beta)' : ''}</span>
              <span>
                <b>{W_ENGINE_BY_ID[p.id].name}</b>: {p.note}
              </span>
              {loadout.wEngine !== p.id && (
                <button type="button" className="rec-btn" onClick={() => onChange({ wEngine: p.id })}>
                  Use
                </button>
              )}
            </p>
          ))}
          {w && (
            <p className="loadout__note">
              <RankBadge rank={w.rank} size={16} />{' '}
              {w.base ? `Base ${w.base.stat} ${w.base.max}` : `Base ${w.base?.stat ?? 'stat'} not published yet`}
              {w.advanced ? ` · ${w.advanced.stat} ${w.advanced.max}` : ''}
              {w.specialty !== agent.specialty && (
                <span className="loadout__warn">
                  {' '}
                  · Its passive only works on {SPECIALTY_BY_ID[w.specialty]?.name} Agents.
                </span>
              )}
            </p>
          )}
          <div className="loadout__steppers">
            <Stepper
              label="Phase"
              value={loadout.refinement}
              min={1}
              max={MAX_REFINEMENT}
              format={(v) => `P${v}`}
              onChange={(v) => onChange({ refinement: v })}
              disabled={!w}
            />
            <Stepper
              label="Mindscape"
              value={loadout.mindscape}
              min={0}
              max={MAX_MINDSCAPE}
              format={(v) => `M${v}`}
              onChange={(v) => onChange({ mindscape: v })}
            />
            {(hasPotential(agent.id) || (betaPotential && showBeta)) && (
              <Stepper
                label={hasPotential(agent.id) ? 'Potential' : 'Potential (beta)'}
                value={loadout.potential ?? 0}
                min={0}
                max={MAX_POTENTIAL}
                format={(v) => (v ? ROMAN[v] : 'None')}
                onChange={(v) => onChange({ potential: v })}
              />
            )}
          </div>

          <div className="quickfill">
            <span className="field__label field__row">
              Quick fill
              {rec?.four && (
                <button type="button" className="rec-btn" onClick={useSets} disabled={setsOn}>
                  {setsOn ? '✓ Recommended sets' : 'Use recommended sets'}
                </button>
              )}
            </span>
            <label className="quickfill__row">
              <span>4-piece · slots 1–4</span>
              <select value="" onChange={(e) => e.target.value && fill([0, 1, 2, 3], e.target.value)}>
                <option value="">Choose a set…</option>
                {DRIVE_DISC_SETS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {setMark(d.id, rec?.fours ?? [])}
                  </option>
                ))}
              </select>
            </label>
            <label className="quickfill__row">
              <span>2-piece · slots 5–6</span>
              <select value="" onChange={(e) => e.target.value && fill([4, 5], e.target.value)}>
                <option value="">Choose a set…</option>
                {DRIVE_DISC_SETS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {setMark(d.id, rec?.twos ?? [])} · {d.twoPiece}
                  </option>
                ))}
              </select>
            </label>
            {mainSummary && (
              <div className="quickfill__row quickfill__mains">
                <span>Main stats · slots 4–6</span>
                <span className="quickfill__rec">
                  <b>{mainSummary}</b>
                  <button type="button" className="rec-btn" onClick={useMains} disabled={mainsOn}>
                    {mainsOn ? '✓ Set' : 'Use recommended'}
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="loadout__block loadout__block--wheel">
          <DiscWheel
            agent={agent}
            wEngine={w}
            phase={loadout.refinement}
            discs={discs}
            selected={slot}
            onSelect={setSlot}
            onEngine={() => engineRef.current?.focus()}
          />

          {cur ? (
            <div className="disc-edit" style={{ '--set': setColor(cur.set) }}>
              <div className="disc-edit__head">
                <span className="disc-slot__n">{slot}</span>
                <b>Slot {slot}</b>
                <button
                  className="btn btn--quiet btn--small"
                  onClick={() => setDisc(slot - 1, { set: null, main: null })}
                >
                  Clear
                </button>
                <button
                  className="btn btn--quiet btn--small"
                  onClick={() => setSlot(null)}
                  aria-label="Done editing slot"
                >
                  Done
                </button>
              </div>
              <label className="field">
                <span>Set</span>
                <select value={cur.set ?? ''} onChange={(e) => setDisc(slot - 1, { set: e.target.value || null })}>
                  <option value="">Empty</option>
                  {DRIVE_DISC_SETS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                      {setMark(d.id, slot <= 4 ? (rec?.fours ?? []) : (rec?.twos ?? []))}
                    </option>
                  ))}
                </select>
              </label>
              <div className="disc-edit__row">
                <span className="field__label">Rank</span>
                <div className="chips" role="group" aria-label="Disc rank">
                  {RANKS.map((r) => (
                    <button
                      key={r}
                      className="chip"
                      aria-pressed={cur.rank === r}
                      onClick={() => setDisc(slot - 1, { rank: r })}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              {slot <= 3 ? (
                <p className="disc-edit__fixed">
                  Main stat: <b>{statLabel(mainStatOf(slot, cur))}</b> {mainMax(slot, cur) ?? ''}
                  <span className="muted small"> · always the same in this slot</span>
                </p>
              ) : (
                <label className="field">
                  <span>Main stat</span>
                  <select value={cur.main ?? ''} onChange={(e) => setDisc(slot - 1, { main: e.target.value || null })}>
                    <option value="">Not set</option>
                    {DISC_MAIN_STATS[slot].map((st) => (
                      <option key={st} value={st}>
                        {statLabel(st)} {mainMax(slot, { ...cur, main: st }) ?? ''}
                        {mainMark(slot, st)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <SubStats agentId={agent.id} disc={cur} slot={slot} onChange={(patch) => setDisc(slot - 1, patch)} />
            </div>
          ) : (
            <p className="muted small wheel__hint">
              Tap a disc slot to set its Drive Disc, rank and main stat. Tap the middle to change the W-Engine.
            </p>
          )}

          <DiscTotals discs={discs} label={statLabel} agentId={agent.id} />

          <div className="bonuses">
            <span className="field__label">Set bonuses</span>
            {bonuses.twos.length === 0 ? (
              <p className="muted small">
                Equip two discs of a set for its 2-piece bonus, and four for its 4-piece bonus.
              </p>
            ) : (
              <ul className="bonuses__list">
                {bonuses.twos.map((id) => {
                  const set = DRIVE_DISC_BY_ID[id];
                  const count = bonuses.counts.find((c) => c.id === id).count;
                  return (
                    <li key={id} className="bonus" style={{ '--set': setColor(id) }}>
                      <span className="bonus__head">
                        <DiscArt id={id} size={22} />
                        <b>{set.name}</b>
                        <span className="muted small">×{count}</span>
                      </span>
                      <span className="bonus__line">
                        <span className="bonus__tag">2</span>
                        {set.twoPiece}
                      </span>
                      {count >= 4 && (
                        <span className="bonus__line">
                          <span className="bonus__tag">4</span>
                          {set.fourPiece}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** A disc's up to four substats, each with its extra upgrades (shared: 4, or 5). */
function SubStats({ agentId, disc, slot, onChange }) {
  const subs = disc.subs ?? [];
  const own = mainStatOf(slot, disc);
  const used = upgradesUsed(disc);
  const cap = maxUpgrades(disc);
  const set = (i, patch) => onChange({ subs: subs.map((x, k) => (k === i ? { ...x, ...patch } : x)) });
  // The Agent's favoured substats first, best first, marked Rec.
  const fav = subPriority(agentId);
  const rank = (st) => (fav.has(st) ? fav.get(st) : 99);
  const free = (stat) =>
    SUB_STATS.filter((st) => st !== own && (st === stat || !subs.some((x) => x.stat === st))).sort((a, b) => rank(a) - rank(b));
  const mark = (st) => (fav.has(st) ? ' · Rec.' : '');
  const text = BUILDS[agentId]?.substats;
  return (
    <div className="subs">
      <div className="subs__head">
        <span className="field__label">Substats</span>
        <span className={`subs__count${used > cap ? ' is-over' : ''}`}>
          Upgrades {used}/{cap}
          {fav.size > 0 && subs.length > 0 && (
            <>
              {' · '}Active {activeRolls(disc, fav)}/{totalRolls(disc)}
            </>
          )}
        </span>
      </div>
      {text && (
        <p className="subs__fav small muted">
          Favours: <b>{text}</b>
        </p>
      )}
      {subs.map((x, i) => (
        <div key={x.stat} className={`subs__row${fav.size && !fav.has(x.stat) ? ' is-off' : ''}`}>
          <select value={x.stat} onChange={(e) => set(i, { stat: e.target.value })} aria-label={`Substat ${i + 1}`}>
            {free(x.stat).map((st) => (
              <option key={st} value={st}>
                {st}
                {mark(st)}
              </option>
            ))}
          </select>
          <span className="subs__ups" role="group" aria-label={`${x.stat} upgrades`}>
            <button type="button" className="stepper__btn" disabled={!x.up} onClick={() => set(i, { up: x.up - 1 })} aria-label={`Fewer ${x.stat} upgrades`}>
              −
            </button>
            <b className="subs__up">+{x.up}</b>
            <button type="button" className="stepper__btn" disabled={used >= cap} onClick={() => set(i, { up: x.up + 1 })} aria-label={`More ${x.stat} upgrades`}>
              +
            </button>
          </span>
          <span className="subs__val">{formatStat(x.stat, subValue(disc.rank, x.stat, x.up))}</span>
          <button type="button" className="subs__x" onClick={() => onChange({ subs: subs.filter((_, k) => k !== i) })} aria-label={`Remove ${x.stat}`}>
            ×
          </button>
        </div>
      ))}
      {subs.length < 4 && (
        <select
          className="subs__add"
          value=""
          onChange={(e) => e.target.value && onChange({ subs: [...subs, { stat: e.target.value, up: 0 }] })}
          aria-label="Add a substat"
        >
          <option value="">+ Add substat</option>
          {free(null).map((st) => (
            <option key={st} value={st}>
              {st}
              {mark(st)}
            </option>
          ))}
        </select>
      )}
      <label className="subs__four small muted">
        <input type="checkbox" checked={!!disc.four} onChange={(e) => onChange({ four: e.target.checked })} />
        Dropped with 4 substats (5 upgrades instead of 4)
      </label>
      {disc.rank === 'B' && subs.length > 0 && <p className="small muted">B-Rank substat values aren’t published.</p>}
    </div>
  );
}

/** Every stat the six discs give: main stats at level 15 plus substats. */
function DiscTotals({ discs, label, agentId }) {
  const totals = discStatTotals(discs);
  if (!totals.length) return null;
  const fav = subPriority(agentId);
  const rolls = discs.reduce((n, d) => n + totalRolls(d), 0);
  const active = discs.reduce((n, d) => n + activeRolls(d, fav), 0);
  return (
    <div className="disc-totals">
      <span className="field__label">Stats from discs</span>
      {rolls > 0 && fav.size > 0 && (
        <p className="disc-totals__active">
          Active modifiers <b>{active}</b>
          <span className="muted small">
            {' '}
            of {rolls} substat rolls on stats this Agent favours (the game’s Active Modifier Count)
          </span>
        </p>
      )}
      <ul>
        {totals.map((t) => (
          <li key={t.stat}>
            <span>{label(t.stat)}</span>
            <b>{formatStat(t.stat, t.value)}</b>
            {t.main > 0 && t.sub > 0 && (
              <span className="muted small">
                {formatStat(t.stat, t.main)} main + {formatStat(t.stat, t.sub)} sub
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="muted small">Main stats at level 15. Doesn’t include the Agent, W-Engine or set bonuses.</p>
    </div>
  );
}

function Stepper({ label, value, min, max, format, onChange, disabled }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <span className="stepper__label">{label}</span>
      <button
        className="stepper__btn"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
        aria-label={`Lower ${label}`}
      >
        −
      </button>
      <span className="stepper__value" aria-live="polite">
        {format(value)}
      </span>
      <button
        className="stepper__btn"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        aria-label={`Raise ${label}`}
      >
        +
      </button>
    </div>
  );
}
