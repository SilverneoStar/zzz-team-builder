import { useSyncExternalStore } from 'react';

// Agents played as several people at once (Sunbringer: Eldreda, Lindverne and
// Dracaene) list them in `members`, each with art at
// public/agents/<agentId>-<member.key>.webp. By default their cards show all
// of them as a collage (index -1); the reader can pick one instead. The choice
// is remembered on this device and shared by every portrait.
const KEY = 'zzz-team-builder:memberArt';
const BASE = import.meta.env.BASE_URL;
const listeners = new Set();

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}
let picks = read();

/** Index of the member shown for this Agent, or -1 for all of them (the default). */
export const memberIndex = (agent) => {
  const n = agent?.members?.length ?? 0;
  const i = picks[agent?.id] ?? -1;
  return n && i >= 0 && i < n ? i : -1;
};

export function setMemberIndex(agentId, i) {
  picks = { ...picks, [agentId]: i };
  try {
    localStorage.setItem(KEY, JSON.stringify(picks));
  } catch {
    /* storage unavailable: the choice lasts until the page closes */
  }
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** Re-renders when the reader picks another member. */
export const useMemberIndex = (agent) => useSyncExternalStore(subscribe, () => memberIndex(agent));

/** Art for one member (the first when showing all), or the Agent's own art when it has no members. */
export const memberArt = (agent, i = memberIndex(agent)) => {
  const m = agent?.members?.[Math.max(0, i)];
  return m ? `${BASE}agents/${agent.id}-${m.key}.webp` : `${BASE}agents/${agent.id}.webp`;
};
