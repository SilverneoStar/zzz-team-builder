// The team builder's Synergy panel: specialty counts, shared attributes and
// factions, which Additional Abilities are on, kit links and short tips.
import SpecialtyIcon from './SpecialtyIcon.jsx';
import AttributeGlyph from './AttributeGlyph.jsx';
import PassiveFace from './PassiveFace.jsx';
import { kitLinks, passiveStatus } from '../lib/analyze.js';
import { SPECIALTIES, shortName } from '../data/game.js';

export default function Analysis({ analysis }) {
  const { agents, specialtyCounts, sharedAttributes, sharedFactions, notes } = analysis;
  const passives = passiveStatus(agents.map((a) => a.id));
  const kit = kitLinks(agents.map((a) => a.id));

  return (
    <section className="analysis" aria-labelledby="analysis-title">
      <h2 id="analysis-title" className="section-title">
        Synergy
      </h2>
      <div className="analysis__side">
        <div className="roles">
          {SPECIALTIES.map((s) => (
            <span key={s.id} className={specialtyCounts[s.id] ? 'role-chip role-chip--on' : 'role-chip'}>
              <SpecialtyIcon specialty={s.id} size={15} />
              <b>{specialtyCounts[s.id]}</b> {s.name}
            </span>
          ))}
        </div>

        {agents.length > 0 && (
          <div className="passives">
            <h3 className="mini-title">
              Additional Abilities{' '}
              <span className="passives__count">
                {passives.active}/{passives.total}
              </span>
            </h3>
            <ul className="passives__list">
              {agents.map((a) => {
                const st = passives.byId[a.id];
                const state = !st.known ? 'unknown' : st.active ? 'on' : 'off';
                return (
                  <li key={a.id} className={`passive passive--${state}`}>
                    <PassiveFace state={state} size={26} />
                    <span className="passive__body">
                      <span className="passive__head">
                        <b>{shortName(a)}</b>
                        {st.name && <span className="passive__name">{st.name}</span>}
                        {st.estimated && (
                          <span className="passive__est" title="Based on the 3.3 livestream; not confirmed yet">
                            Estimated
                          </span>
                        )}
                      </span>
                      <span className="passive__cond">
                        {!st.known
                          ? 'Condition not published yet.'
                          : st.active
                            ? `Active, thanks to ${st.via.join(' and ')}.`
                            : `Needs: ${st.condition}.`}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {(sharedAttributes.length > 0 || sharedFactions.length > 0 || kit.length > 0) && (
          <ul className="reactions">
            {kit.map((k) => (
              <li key={k.id} className="reaction reaction--kit">
                <div className="reaction__head">
                  <span className="reaction__name">{k.name}</span>
                  <span className="reaction__kind">Kit link</span>
                </div>
                <ul className="kit-lines">
                  {k.payoff.map((p, i) => (
                    <li key={i}>
                      <b>{shortName(p.agent)}</b> with {p.from.join(' and ')}: {p.text}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            {sharedAttributes.map((s) => (
              <li key={s.id} className="reaction">
                <div className="reaction__head">
                  <span className="reaction__pair">
                    <AttributeGlyph attribute={s.id} size={14} />
                  </span>
                  <span className="reaction__name">{s.name}</span>
                  <span className="reaction__kind">Same attribute</span>
                </div>
                <p>{s.agents.join(', ')}</p>
              </li>
            ))}
            {sharedFactions.map((f) => (
              <li key={f.name} className="reaction">
                <div className="reaction__head">
                  <span className="reaction__name">{f.name}</span>
                  <span className="reaction__kind">Same faction</span>
                </div>
                <p>{f.agents.join(', ')}</p>
              </li>
            ))}
          </ul>
        )}

        <ul className="notes">
          {notes.map((n, i) => (
            <li key={i} className={`note note--${n.level}`}>
              {n.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
