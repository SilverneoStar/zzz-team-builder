import { SPECIALTY_BY_ID } from '../data/game.js';

// The in-game specialty (combat class) icons in public/specialties/<id>.png.
const BASE = import.meta.env.BASE_URL;

export default function SpecialtyIcon({ specialty, size = 16, title }) {
  const s = SPECIALTY_BY_ID[specialty];
  if (!s) return null;
  return (
    <img
      className="spec-icon"
      src={`${BASE}specialties/${specialty}.png`}
      width={size}
      height={size}
      alt={title ?? ''}
      title={title}
      aria-hidden={title ? undefined : true}
      loading="lazy"
    />
  );
}

/** Icon followed by the specialty name. */
export function SpecialtyTag({ specialty, size = 15 }) {
  const s = SPECIALTY_BY_ID[specialty];
  if (!s) return null;
  return (
    <span className="spec-tag">
      <SpecialtyIcon specialty={specialty} size={size} />
      {s.name}
    </span>
  );
}
