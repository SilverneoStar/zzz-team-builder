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
import { RANKS, discBonuses, mainMax, mainStatOf } from '../lib/discs.js';
import DiscWheel, { setColor } from './DiscWheel.jsx';
import Portrait from './Portrait.jsx';
import { MAX_POTENTIAL, ROMAN, hasPotential } from '../data/potentials.js';
import RankBadge from './RankBadge.jsx';
import MemberPicker from './MemberPicker.jsx';
import { recommendationFor } from '../lib/builds.js';
import { useShowBeta } from '../lib/betaInfo.js';

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
            {hasPotential(agent.id) && (
              <Stepper
                label="Potential"
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
            </div>
          ) : (
            <p className="muted small wheel__hint">
              Tap a disc slot to set its Drive Disc, rank and main stat. Tap the middle to change the W-Engine.
            </p>
          )}

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
