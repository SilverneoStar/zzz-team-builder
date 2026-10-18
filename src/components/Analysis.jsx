import { SPECIALTIES } from '../data/game.js';
import AttributeGlyph from './AttributeGlyph.jsx';

export default function Analysis({ analysis }) {
  const { specialtyCounts, sharedAttributes, sharedFactions, notes } = analysis;

  return (
    <section className="analysis" aria-labelledby="analysis-title">
      <h2 id="analysis-title" className="section-title">Synergy</h2>
      <div className="analysis__side">
        <div className="roles">
          {SPECIALTIES.map((s) => (
            <span key={s.id} className={specialtyCounts[s.id] ? 'role-chip role-chip--on' : 'role-chip'}>
              <b>{specialtyCounts[s.id]}</b> {s.name}
            </span>
          ))}
        </div>

        {(sharedAttributes.length > 0 || sharedFactions.length > 0) && (
          <ul className="reactions">
            {sharedAttributes.map((s) => (
              <li key={s.id} className="reaction">
                <div className="reaction__head">
                  <span className="reaction__pair"><AttributeGlyph attribute={s.id} size={14} /></span>
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
            <li key={i} className={`note note--${n.level}`}>{n.text}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
