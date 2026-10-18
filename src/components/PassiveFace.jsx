// The passive indicator, drawn as a light switch inside a dark round badge:
// switched on and glowing gold yellow-orange when an Agent's Additional
// Ability is active, switched off in lime green when it isn't, and dim grey
// when the condition isn't published yet.
const COLORS = {
  on: { lit: '#ffb81c', deep: '#f08a00', glow: 'rgb(255 176 28 / 0.55)' },
  off: { lit: '#b4e61e', deep: '#7fb010', glow: 'rgb(180 230 30 / 0.25)' },
  unknown: { lit: '#6d6d6d', deep: '#4a4a4a', glow: 'transparent' },
};

export default function PassiveFace({ state = 'off', size = 26, title }) {
  const c = COLORS[state];
  const on = state === 'on';
  // Knob sits right when on, left when off.
  const knobX = on ? 20.5 : 11.5;
  const id = `ps-${state}`;
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
      <defs>
        <linearGradient id={`${id}-knob`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#bfbfbf" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="#0b0b0b" />
      <circle cx="16" cy="16" r="14" fill="none" stroke="#262626" strokeWidth="1.5" />
      {/* Glow behind the track when lit */}
      {state !== 'unknown' && <rect x="5" y="10.5" width="22" height="11" rx="5.5" fill={c.glow} />}
      {/* Track */}
      <rect
        x="6"
        y="11.5"
        width="20"
        height="9"
        rx="4.5"
        fill={on ? c.lit : '#151515'}
        stroke={on ? c.deep : c.lit}
        strokeWidth="1.6"
      />
      {/* On/off marks on the track */}
      {on ? (
        <path d="M10.5 14v4" stroke="#3a2600" strokeWidth="1.4" strokeLinecap="round" />
      ) : (
        <circle cx="21" cy="16" r="1.8" fill="none" stroke={c.lit} strokeWidth="1.2" />
      )}
      {/* Knob */}
      <circle cx={knobX} cy="16" r="4.6" fill={`url(#${id}-knob)`} stroke="#0b0b0b" strokeWidth="1" />
    </svg>
  );
}
