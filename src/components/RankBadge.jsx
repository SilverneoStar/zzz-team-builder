// Rank badge in the style of the game's S / A / B icons: a heavy italic
// letter in its rank colours on a dark disc, finished to look like metal:
// a thin silver outline, a darker extruded edge for depth, a glossy
// highlight across the top of the letter, and a beveled gunmetal disc.
const GRADIENTS = {
  S: ['#ffe866', '#ff9d3a', '#ff3d8f'],
  A: ['#ff7ad9', '#e04cff', '#9c46ff'],
  B: ['#c35bff', '#7f7dff', '#47d9ff'],
};
// Darker shades of each rank's colours for the extruded edge.
const DEPTH = { S: '#8a2a1c', A: '#4d1a7a', B: '#22306e' };

export default function RankBadge({ rank, size = 22 }) {
  const stops = GRADIENTS[rank] ?? ['#d7dbe4', '#a9b0bf', '#7d869a'];
  const depth = DEPTH[rank] ?? '#3a3f4a';
  const id = `rank-${rank}`;
  const letter = { x: 16.3, y: 23.2, textAnchor: 'middle', className: 'rank-badge__letter' };
  return (
    <svg className="rank-badge" width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={`${rank}-rank`}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={stops[0]} />
          <stop offset="0.5" stopColor={stops[1]} />
          <stop offset="1" stopColor={stops[2]} />
        </linearGradient>
        {/* Shared metal finishes */}
        <linearGradient id="rank-edge" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#c9ccd2" />
          <stop offset="0.55" stopColor="#8b8f97" />
          <stop offset="1" stopColor="#e6e8ec" />
        </linearGradient>
        <linearGradient id="rank-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="rank-disc" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#3a3d44" />
          <stop offset="0.55" stopColor="#1a1c21" />
          <stop offset="1" stopColor="#0c0d10" />
        </radialGradient>
        <linearGradient id="rank-bevel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9aa0aa" />
          <stop offset="0.5" stopColor="#3b3f47" />
          <stop offset="1" stopColor="#15171b" />
        </linearGradient>
      </defs>

      {/* Disc with a beveled metal rim */}
      <circle cx="16" cy="16" r="15.2" fill="url(#rank-bevel)" />
      <circle cx="16" cy="16" r="13.9" fill="url(#rank-disc)" />

      {/* Extruded edge: the letter repeated a little down and right, in a deep shade */}
      <text {...letter} x={17.4} y={24.4} fill={depth} stroke={depth} strokeWidth="1">
        {rank}
      </text>
      {/* The letter: rank colours with a thin silver outline */}
      <text {...letter} fill={`url(#${id}-fill)`} stroke="url(#rank-edge)" strokeWidth="1">
        {rank}
      </text>
      {/* Gloss across the top half */}
      <text {...letter} fill="url(#rank-shine)" stroke="none">
        {rank}
      </text>
    </svg>
  );
}
