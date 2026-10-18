import { SpecialtyTag } from './SpecialtyIcon.jsx';
import {
  ATTRIBUTE_BY_ID,
  DISC_FIXED,
  DISC_MAIN_MAX,
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
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';

// Gear for one Agent in this team: W-Engine, Mindscape, Drive Disc sets and
// the main stats of the slots that can roll more than one.
export default function LoadoutPanel({ agent, loadout, onChange, onClose }) {
  const fits = wEnginesFor(agent);
  const others = W_ENGINES.filter((w) => w.specialty !== agent.specialty);
  const w = loadout.wEngine && W_ENGINE_BY_ID[loadout.wEngine];
  const d4 = loadout.disc4 && DRIVE_DISC_BY_ID[loadout.disc4];
  const d2 = loadout.disc2 && DRIVE_DISC_BY_ID[loadout.disc2];
  const attrName = ATTRIBUTE_BY_ID[agent.attribute]?.name;
  const statLabel = (s) => (s === 'Attribute DMG' ? `${attrName} DMG` : s);

  return (
    <section className="loadout" aria-label={`${agent.name} loadout`}>
      <div className="loadout__head">
        <Portrait agent={agent} size="sm" />
        <h3 className="loadout__title">{agent.name}</h3>
        <span className="muted small loadout__meta"><SpecialtyTag specialty={agent.specialty} /> · {attrName}</span>
        <a className="loadout__link" href={`#agent-${agent.id}`}>Agent page</a>
        <button className="btn btn--quiet loadout__close" onClick={onClose} aria-label="Close loadout">×</button>
      </div>

      <div className="loadout__grid">
        <div className="loadout__block">
          <label className="field">
            <span>W-Engine</span>
            <select value={loadout.wEngine ?? ''} onChange={(e) => onChange({ wEngine: e.target.value || null })}>
              <option value="">None</option>
              <optgroup label={`${SPECIALTY_BY_ID[agent.specialty]?.name} W-Engines`}>
                {fits.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.rank} · {x.name}{x.signatureOf === agent.id ? ' (signature)' : ''}{x.upcoming ? ' (upcoming)' : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Other specialties (passive won’t apply)">
                {others.map((x) => <option key={x.id} value={x.id}>{x.rank} · {x.name}</option>)}
              </optgroup>
            </select>
          </label>
          {w && (
            <p className="loadout__note">
              <RankBadge rank={w.rank} size={16} />{' '}
              {w.base ? `Base ${w.base.stat} ${w.base.max}` : `Base ${w.base?.stat ?? 'stat'} not published yet`}
              {w.advanced ? ` · ${w.advanced.stat} ${w.advanced.max}` : ''}
              {w.specialty !== agent.specialty && <span className="loadout__warn"> · Its passive only works on {SPECIALTY_BY_ID[w.specialty]?.name} Agents.</span>}
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
          </div>
        </div>

        <div className="loadout__block">
          <label className="field">
            <span>Drive Discs · 4-piece</span>
            <select value={loadout.disc4 ?? ''} onChange={(e) => onChange({ disc4: e.target.value || null })}>
              <option value="">None</option>
              {DRIVE_DISC_SETS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </label>
          {d4 && <p className="loadout__note">{d4.fourPiece}</p>}
          <label className="field">
            <span>Drive Discs · 2-piece</span>
            <select value={loadout.disc2 ?? ''} onChange={(e) => onChange({ disc2: e.target.value || null })}>
              <option value="">None</option>
              {DRIVE_DISC_SETS.filter((d) => d.id !== loadout.disc4).map((d) => (
                <option key={d.id} value={d.id}>{d.name} · {d.twoPiece}</option>
              ))}
            </select>
          </label>
          {(d4 || d2) && (
            <p className="loadout__note">
              2-piece bonuses: {[d4 && `${d4.name}: ${d4.twoPiece}`, d2 && `${d2.name}: ${d2.twoPiece}`].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="loadout__block">
          <span className="field__label">Main stats</span>
          <ul className="disc-slots">
            {DISC_FIXED.map((d) => (
              <li key={d.slot} className="disc-slot disc-slot--fixed">
                <span className="disc-slot__n">{d.slot}</span>
                <span>{d.stat}</span>
                <span className="muted small">{d.max}</span>
              </li>
            ))}
            {[4, 5, 6].map((slot) => (
              <li key={slot} className="disc-slot">
                <span className="disc-slot__n">{slot}</span>
                <label className="sr-only" htmlFor={`main-${slot}`}>Slot {slot} main stat</label>
                <select
                  id={`main-${slot}`}
                  value={loadout.main[slot] ?? ''}
                  onChange={(e) => onChange({ main: { ...loadout.main, [slot]: e.target.value || null } })}
                >
                  <option value="">Not set</option>
                  {DISC_MAIN_STATS[slot].map((s) => <option key={s} value={s}>{statLabel(s)}</option>)}
                </select>
                <span className="muted small">{loadout.main[slot] ? DISC_MAIN_MAX[loadout.main[slot]] : ''}</span>
              </li>
            ))}
          </ul>
          <p className="muted small">Values are the highest an S-rank disc reaches at level 15.</p>
        </div>
      </div>
    </section>
  );
}

function Stepper({ label, value, min, max, format, onChange, disabled }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <span className="stepper__label">{label}</span>
      <button className="stepper__btn" disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label={`Lower ${label}`}>−</button>
      <span className="stepper__value" aria-live="polite">{format(value)}</span>
      <button className="stepper__btn" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label={`Raise ${label}`}>+</button>
    </div>
  );
}
