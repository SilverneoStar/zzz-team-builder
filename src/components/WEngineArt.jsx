import { useState } from 'react';
import RankBadge from './RankBadge.jsx';

// W-Engine with a picture in public/w-engines/<id>.webp. Add an id here when
// adding a new W-Engine's image; until then it falls back to the rank badge.
export const W_ENGINES_WITH_ART = new Set([
  'deep-sea-visitor', 'ode-of-resurrected-wings', 'joyau-dore', 'boisterous-echoes',
  'the-vault', 'weeping-cradle', 'weeping-gemini', 'roaring-ride', 'kaboom-the-cannon',
  'sharpened-stinger', 'sin-ban-cage', 'nirvana-s-first-plume',
]);
const BASE = import.meta.env.BASE_URL;
export const wEngineArt = (id) => (id && W_ENGINES_WITH_ART.has(id) ? `${BASE}w-engines/${id}.webp` : null);

export default function WEngineArt({ w, size = 30 }) {
  const src = w ? wEngineArt(w.id) : null;
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) return <RankBadge rank={w?.rank} size={size} />;
  return (
    <img
      className="engine-art"
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailedSrc(src)}
    />
  );
}
