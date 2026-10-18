// Saves teams in this browser only. Storage can be blocked (private mode),
// so every read and write is wrapped in try/catch and the app works without it.
const KEY = 'zzz-team-builder:v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.teams) || data.teams.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: teams just won't persist */
  }
}
