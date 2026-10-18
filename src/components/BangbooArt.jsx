import { useState } from 'react';

// Looks for public/bangboo/<id>.webp; falls back to the plain Bangboo mark.
const BASE = import.meta.env.BASE_URL;
export const bangbooArt = (id) => `${BASE}bangboo/${id}.webp`;

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
