import { useState } from 'react';

// Drive Disc sets with a picture in public/discs/<id>.webp. Add an id here
// when adding a set's image; until then the set's colour dot is shown.
export const DISCS_WITH_ART = new Set([
  'wuthering-salon', 'freedom-blues', 'yunkui-tales', 'woodpecker-electro',
  'white-water-ballad', 'thunder-metal', 'thorned-rose', 'the-sky-ablaze',
  'soul-rock', 'swing-jazz', 'shockstar-disco', 'shining-aria', 'shadow-harmony',
  'puffer-electro', 'proto-punk', 'phaethons-melody', 'polar-metal', 'notes-from-the-chained',
  'moonlight-lullaby', 'king-of-the-summit', 'inferno-metal', 'hormone-punk', 'feathered-fate', 'fanged-metal',
  'dawns-bloom', 'chaotic-metal', 'chaos-jazz', 'bunny-in-wonderland', 'branch-and-blade-song', 'astral-voice',
]);
const BASE = import.meta.env.BASE_URL;
export const discArt = (id) => (id && DISCS_WITH_ART.has(id) ? `${BASE}discs/${id}.webp` : null);

export default function DiscArt({ id, size = 22 }) {
  const src = discArt(id);
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) return <span className="bonus__dot" />;
  return (
    <img className="disc-art" src={src} alt="" width={size} height={size} loading="lazy" onError={() => setFailedSrc(src)} />
  );
}
