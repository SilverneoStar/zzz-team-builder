import { useState } from 'react';

// Bangboo with a picture in public/bangboo/<id>.webp. Add an id here when
// adding a new Bangboo's image; until then it shows the basic Bangboo
// (public/bangboo/placeholder.webp), e.g. for newly announced Bangboo.
export const BANGBOO_WITH_ART = new Set([
  'agent-gulliver',
  'amillion',
  'ariel',
  'avocaboo',
  'baddieboo',
  'bagboo',
  'bangvolver',
  'belion',
  'biggest-fan',
  'bild-n-boolok',
  'birkblick',
  'boollseye',
  'booltergeist',
  'booressure',
  'brawlerboo',
  'butler',
  'cryboo',
  'devilboo',
  'electroboo',
  'excaliboo',
  'exploreboo',
  'knightboo',
  'luckyboo',
  'magnetiboo',
  'mercury',
  'miss-esme',
  'officer-cui',
  'overtimeboo',
  'paperboo',
  'penguinboo',
  'plugboo',
  'red-moccus',
  'resonaboo',
  'robin',
  'rocketboo',
  'safety',
  'sharkboo',
  'snap',
  'sprout',
  'sumoboo',
  'ultra-jake',
]);
// Per-Bangboo size adjustment for large displays (the toy boxes): each
// picture fills its own frame differently (tall ears, wide fins), so these
// scale them to look the same size as each other. Worked out from how much
// of each picture the Bangboo covers.
export const BANGBOO_SCALE = {
  amillion: 1.04,
  ariel: 0.86,
  'bild-n-boolok': 1.04,
  boollseye: 0.93,
  devilboo: 0.89,
  exploreboo: 0.97,
  luckyboo: 1.03,
  mercury: 0.92,
  'miss-esme': 0.92,
  'officer-cui': 1.03,
  placeholder: 1.03,
  'red-moccus': 0.94,
  resonaboo: 1.04,
  robin: 0.97,
  safety: 1.04,
  sharkboo: 0.95,
  snap: 0.89,
  sumoboo: 0.97,
  'ultra-jake': 1.05,
};

const BASE = import.meta.env.BASE_URL;
export const PLACEHOLDER_ART = `${BASE}bangboo/placeholder.webp`;
export const bangbooArt = (id) =>
  !id ? null : BANGBOO_WITH_ART.has(id) ? `${BASE}bangboo/${id}.webp` : PLACEHOLDER_ART;

export default function BangbooArt({ id, size = 30 }) {
  const src = id ? bangbooArt(id) : null;
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) return <BangbooMark size={size} />;
  return (
    <img
      className="bangboo-art"
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailedSrc(src)}
    />
  );
}

// A simple rounded robot head: original drawing used when there's no art.
export function BangbooMark({ size = 30 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size}>
      <path d="M10 6 8 2M22 6l2-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="4" y="6" width="24" height="20" rx="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <rect x="8.5" y="11" width="15" height="9" rx="4.5" fill="currentColor" opacity="0.18" />
      <circle cx="12.5" cy="15.5" r="2" fill="currentColor" />
      <circle cx="19.5" cy="15.5" r="2" fill="currentColor" />
    </svg>
  );
}
