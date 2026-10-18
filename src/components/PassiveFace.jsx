// The squad screen's passive indicator, drawn in the game's dotted LED style:
// a yellow smile when an Agent's Additional Ability is active, a lime green
// "-_-" when it isn't, and a dim grey one when the condition isn't published.
const COLORS = { on: '#f6c81a', off: '#b4e61e', unknown: '#6d6d6d' };

export default function PassiveFace({ state = 'off', size = 26, title }) {
  const c = COLORS[state];
  const led = { stroke: c, strokeLinecap: 'round', fill: 'none' };
  return (
    <svg
      className={`passive-face passive-face--${state}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <circle cx="16" cy="16" r="15" fill="#0b0b0b" />
      <circle cx="16" cy="16" r="14" fill="none" stroke="#262626" strokeWidth="1.5" />
      {state === 'on' ? (
        <g {...led}>
          {/* Tall eyes and a wide smile, in dots */}
          <path d="M11.5 9.5v5M20.5 9.5v5" strokeWidth="2.6" strokeDasharray="0.1 1.9" />
          <path d="M8.5 17.5 Q16 26 23.5 17.5" strokeWidth="2.4" strokeDasharray="0.1 1.9" />
        </g>
      ) : (
        <g {...led}>
          {/* Flat eyes and a flat mouth: -_- */}
          <path d="M8.5 13h6M17.5 13h6" strokeWidth="2.4" strokeDasharray="0.1 1.9" />
          <path d="M12 21h8" strokeWidth="2.4" strokeDasharray="0.1 1.9" />
        </g>
      )}
    </svg>
  );
}
