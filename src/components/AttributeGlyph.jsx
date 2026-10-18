import { ATTRIBUTE_BY_ID } from '../data/game.js';

// A small hexagon in the attribute's colour with its initial. Original
// artwork, not the game's attribute icons.
export default function AttributeGlyph({ attribute, size = 14, title }) {
  const a = ATTRIBUTE_BY_ID[attribute];
  if (!a) return null;
  const letter = a.name[0];
  return (
    <svg
      className="attr-glyph"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d="M10 1.5 17.4 5.75v8.5L10 18.5 2.6 14.25v-8.5Z" fill={a.color} stroke="#0a0a0a" strokeWidth="1.2" />
      {a.base && <path d="M10 4.6 14.7 7.3v5.4L10 15.4 5.3 12.7V7.3Z" fill="none" stroke="#0a0a0a" strokeOpacity="0.45" strokeWidth="1" />}
      <text x="10" y="13.6" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#0a0a0a" fontFamily="IBM Plex Sans, system-ui, sans-serif">
        {letter}
      </text>
    </svg>
  );
}

export function AttributeTag({ attribute }) {
  const a = ATTRIBUTE_BY_ID[attribute];
  if (!a) return <span>—</span>;
  return (
    <span className="cell-el">
      <AttributeGlyph attribute={attribute} size={14} />
      {a.name}
    </span>
  );
}
