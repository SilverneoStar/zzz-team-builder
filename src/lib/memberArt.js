import { useSyncExternalStore } from 'react';

// Agents played as several people at once (Sunbringer: Eldreda, Lindverne and
// Dracaene) list them in `members`, each with art at
// public/agents/<agentId>-<member.key>.webp. Which one is shown on top is the
// reader's choice, remembered on this device and shared by every portrait.
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

/** Index of the member shown for this Agent (0 when none is picked). */
export const memberIndex = (agent) => {
  const n = agent?.members?.length ?? 0;
  const i = picks[agent?.id] ?? 0;
  return n && i >= 0 && i < n ? i : 0;
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

/** Art for one member, or the Agent's own art when it has no members. */
export const memberArt = (agent, i = memberIndex(agent)) =>
  agent?.members?.[i] ? `${BASE}agents/${agent.id}-${agent.members[i].key}.webp` : `${BASE}agents/${agent.id}.webp`;
