// Cortado rates a saved build's main stats and substats (lib/buildReview.js).
import { useMemo } from 'react';
import { RankCortado } from './SynergyScore.jsx';
import { reviewBuild } from '../lib/buildReview.js';
import { SYNERGY_MOODS } from '../lib/synergy.js';

export default function BuildReview({ agentId, loadout }) {
  const r = useMemo(() => reviewBuild(agentId, loadout), [agentId, loadout]);
  if (!r) return null;
  return (
    <section className="syn review" aria-label={r.rank ? `Build review: ${r.score} out of 100, rank ${r.rank}` : 'Build review'}>
      {r.rank && <RankCortado rank={r.rank} />}
      <div className="syn__body">
        <span className="syn__label">Cortado’s build review</span>
        {r.rank && (
          <span className="syn__score">
            <b>{r.score}</b>
            <span className="muted">/100</span>
            <span className="syn__mood">
              {r.hasSubs ? `Cortado is ${SYNERGY_MOODS[r.rank].word.toLowerCase()}` : 'Main stats only so far'}
            </span>
          </span>
        )}
        <ul className="review__notes">
          {r.notes.map((n) => (
            <li key={n.text} className={`review__note review__note--${n.tone}`}>
              {n.text}
            </li>
          ))}
        </ul>
        <p className="muted small">
          Main stats count 40% and substats 60%{r.hasSubs ? '' : ' once you add them'}. Rates the stats, not the
          W-Engine or your levels.
        </p>
      </div>
    </section>
  );
}
