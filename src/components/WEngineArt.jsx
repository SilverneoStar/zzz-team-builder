import { useState } from 'react';
import RankBadge from './RankBadge.jsx';

// W-Engine with a picture in public/w-engines/<id>.webp. Add an id here when
// adding a new W-Engine's image; until then it falls back to the rank badge.
export const W_ENGINES_WITH_ART = new Set([
  'deep-sea-visitor', 'ode-of-resurrected-wings', 'joyau-dore', 'boisterous-echoes',
  'the-vault', 'weeping-cradle', 'weeping-gemini', 'roaring-ride', 'kaboom-the-cannon',
  'sharpened-stinger', 'sin-ban-cage', 'nirvana-s-first-plume',
  'myriad-eclipse', 'demara-battery-mark-ii', 'bashful-demon', 'krakens-cradle', 'wrathful-vajra', 'qingming-birdcage', 'starlight-rider-faceplate', 'angel-in-the-shell', 'neon-fantasies', 'thoughtbop', 'serpentine-seeker', 'cloudcleave-radiance',
  'half-sugar-bunny', 'yesterday-calls', 'dreamlit-hearth',
  'grill-owisp', 'bellicose-blaze', 'tremor-trigram-vessel', 'elegant-vanity', 'severed-innocence', 'practiced-perfection', 'peacekeeper-specialized', 'metanukimorphosis', 'zanshin-herb-case', 'flight-of-fancy',
  'the-brimstone', 'crimson-thirst', 'knights-extolment', 'riot-suppressor-mark-vi', 'starlight-engine-replica', 'timeweaver', 'catty-luck', 'steel-cushion',
  'heartstring-nocturne', 'cordis-germina', 'sol-exuvia', 'cannon-rotor', 'cauldron-of-clarity', 'drill-rig-red-axis', 'tusks-of-fury',
  'housekeeper', 'crimson-moon-casket', 'marcato-desire', 'gilded-blossom', 'starlight-engine', 'street-superstar', 'lunar-pleniluna', 'lunar-noviluna', 'lunar-decrescent', 'bloodmarrow-coffer', 'lunar-semiluna',
  'candlelit-scheme', 'puzzle-sphere', 'radiowave-journey', 'cinder-cobalt', 'frostfall-sickle', 'flamemaker-shaker', 'hailstorm-shrine',
]);
const BASE = import.meta.env.BASE_URL;
export const wEngineArt = (id) => (id && W_ENGINES_WITH_ART.has(id) ? `${BASE}w-engines/${id}.webp` : null);

// The icon art, or the rank badge as a fallback when there's no art yet.
// Callers that want the rank badge *alongside* the art (once it's shown)
// render their own <RankBadge> next to the name, same as the Bangboo cards.
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
