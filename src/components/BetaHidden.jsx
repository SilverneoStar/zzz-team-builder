import { setShowBeta } from '../lib/betaInfo.js';

// Stand-in for a section built from beta information when the reader hid it.
export default function BetaHidden({ what = 'This section' }) {
  return (
    <p className="beta-hidden">
      <span className="card__tag card__tag--warn">Beta</span> {what} comes from beta information and may change before
      release, so it’s hidden.{' '}
      <button type="button" className="rec-btn" onClick={() => setShowBeta(true)}>
        Show beta info
      </button>
    </p>
  );
}
