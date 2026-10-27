import { AGENT_BY_ID, MAX_MINDSCAPE, MAX_REFINEMENT, TEAM_SIZE } from '../data/game.js';
import { PRESETS, presetLoadouts } from '../data/presets.js';
import { MAX_POTENTIAL } from '../data/potentials.js';
import { emptyDiscs, normaliseDiscs } from './discs.js';

// All team changes go through this reducer, so the rules live in one place.
// State: { teams: [{ id, name, members: [id|null x3], bangboo, loadouts }], activeId, notice }
// loadouts: { [agentId]: { wEngine, refinement (1–5), mindscape (0–6),
//   potential (0–6, only for Agents with Potential Vision),
//   discs: [{ set, rank, main } x6] } }  (see lib/discs.js)
// Loadouts are per team, so one Agent can be geared differently in two teams.

let counter = 0;
export const newId = () => `t${Date.now().toString(36)}${(counter++).toString(36)}`;
const emptyMembers = () => Array(TEAM_SIZE).fill(null);

export function makeTeam(name, members = emptyMembers(), loadouts = {}, bangboo = null) {
  const m = Array.from({ length: TEAM_SIZE }, (_, i) => members[i] ?? null);
  return { id: newId(), name, members: m, bangboo, loadouts: structuredClone(loadouts) };
}

export const emptyLoadout = () => ({
  wEngine: null,
  refinement: 1,
  mindscape: 0,
  potential: 0,
  discs: emptyDiscs(),
});

export function loadoutOf(team, agentId) {
  // Merge with defaults so loadouts saved before new fields existed still work.
  const saved = team.loadouts?.[agentId] ?? {};
  const { disc4, disc2, main, ...rest } = { ...emptyLoadout(), ...saved };
  // Older saves stored a 4-piece and 2-piece set; turn those into slots.
  return { ...rest, discs: normaliseDiscs(saved.discs, { disc4, disc2, main }) };
}

export function initialState(saved) {
  if (saved) {
    // Older saves or hand-edited storage: keep only Agents that still exist.
    const teams = saved.teams.map((t) => ({
      ...t,
      members: Array.from({ length: TEAM_SIZE }, (_, i) => (AGENT_BY_ID[t.members?.[i]] ? t.members[i] : null)),
      bangboo: t.bangboo ?? null,
      loadouts: t.loadouts ?? {},
    }));
    const activeId = teams.some((t) => t.id === saved.activeId) ? saved.activeId : teams[0].id;
    return { teams, activeId, notice: null };
  }
  const teams = PRESETS.slice(0, 2).map((p) => makeTeam(p.name, p.members, presetLoadouts(p.members), p.bangboo));
  return { teams, activeId: teams[0].id, notice: null, isExample: true };
}

function nextName(teams) {
  let n = teams.length + 1;
  while (teams.some((t) => t.name === `Team ${n}`)) n += 1;
  return `Team ${n}`;
}

function updateActive(state, fn) {
  return {
    ...state,
    isExample: false,
    teams: state.teams.map((t) => (t.id === state.activeId ? fn(t) : t)),
  };
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number(n) || 0));

export function teamsReducer(state, action) {
  const active = state.teams.find((t) => t.id === state.activeId);
  switch (action.type) {
    case 'select':
      return { ...state, activeId: action.id, notice: null };

    case 'add': {
      const team = makeTeam(nextName(state.teams));
      return { ...state, teams: [...state.teams, team], activeId: team.id, notice: null };
    }

    case 'import': {
      const loadouts = Object.fromEntries(
        Object.entries(action.loadouts ?? {}).map(([id, lo]) => [id, { ...emptyLoadout(), ...lo }]),
      );
      const team = makeTeam(action.name, action.members, loadouts, action.bangboo ?? null);
      return {
        ...state,
        isExample: false,
        teams: [...state.teams, team],
        activeId: team.id,
        notice: `Added “${team.name}” to your teams.`,
      };
    }

    case 'duplicate': {
      const team = makeTeam(`${active.name} copy`, active.members, active.loadouts, active.bangboo);
      return { ...state, teams: [...state.teams, team], activeId: team.id, notice: null };
    }

    case 'remove': {
      if (state.teams.length === 1) {
        // Keep at least one team around; just empty it.
        return updateActive(state, (t) => ({ ...t, members: emptyMembers(), bangboo: null }));
      }
      const index = state.teams.findIndex((t) => t.id === state.activeId);
      const teams = state.teams.filter((t) => t.id !== state.activeId);
      const next = teams[Math.max(0, index - 1)];
      return { ...state, teams, activeId: next.id, notice: `Deleted “${active.name}”.` };
    }

    case 'rename':
      return updateActive(state, (t) => ({ ...t, name: action.name }));

    case 'toggle': {
      // Tap an Agent: remove if already in the team, else fill the first empty slot.
      if (active.members.includes(action.agentId)) {
        return {
          ...updateActive(state, (t) => ({
            ...t,
            members: t.members.map((id) => (id === action.agentId ? null : id)),
          })),
          notice: null,
        };
      }
      // A specific empty slot when one was tapped, else the first empty one.
      const slot =
        action.slot != null && active.members[action.slot] == null ? action.slot : active.members.indexOf(null);
      if (slot === -1) return { ...state, notice: 'This squad is full. Remove someone first.' };
      return {
        ...updateActive(state, (t) => ({
          ...t,
          members: t.members.map((id, i) => (i === slot ? action.agentId : id)),
        })),
        notice: null,
      };
    }

    case 'setBangboo':
      return { ...updateActive(state, (t) => ({ ...t, bangboo: action.id })), notice: null };

    case 'clearSlot':
      return updateActive(state, (t) => ({
        ...t,
        members: t.members.map((id, i) => (i === action.index ? null : id)),
      }));

    case 'clear':
      return updateActive(state, (t) => ({ ...t, members: emptyMembers(), bangboo: null }));

    case 'loadPreset':
      return {
        ...updateActive(state, (t) => ({
          ...t,
          name: action.name,
          members: [...action.members],
          bangboo: action.bangboo ?? null,
          loadouts: structuredClone(presetLoadouts(action.members)),
        })),
        notice: `Loaded ${action.name} into this team, with each Agent’s signature W-Engine.`,
      };

    case 'setLoadout':
      return updateActive(state, (t) => {
        const cur = loadoutOf(t, action.agentId);
        const next = { ...cur, ...action.patch };
        next.mindscape = clamp(next.mindscape, 0, MAX_MINDSCAPE);
        next.refinement = clamp(next.refinement, 1, MAX_REFINEMENT);
        next.potential = clamp(next.potential ?? 0, 0, MAX_POTENTIAL);
        // A 2-piece set can't be the same as the 4-piece set.
        next.discs = normaliseDiscs(next.discs);
        return { ...t, loadouts: { ...t.loadouts, [action.agentId]: next } };
      });

    case 'notice':
      return { ...state, notice: action.text };

    default:
      return state;
  }
}
