import {
  AGENT_BY_ID,
  ATTRIBUTE_BY_ID,
  BANGBOO_BY_ID,
  DAMAGE_SPECIALTIES,
  SPECIALTIES,
  SPECIALTY_BY_ID,
  baseAttribute,
} from '../data/game.js';

// Squad checks based on how ZZZ teams are put together: a Stun Agent to Daze,
// a damage dealer to cash in, and teammates who share an attribute or faction
// (which many Agents' Additional Abilities ask for).
export function analyzeTeam(memberIds, bangbooId) {
  const agents = memberIds.map((id) => id && AGENT_BY_ID[id]).filter(Boolean);
  const specialtyCounts = Object.fromEntries(SPECIALTIES.map((s) => [s.id, 0]));
  agents.forEach((a) => {
    specialtyCounts[a.specialty] += 1;
  });

  const byAttribute = groupBy(agents, (a) => baseAttribute(a.attribute));
  const byFaction = groupBy(agents, (a) => a.faction);
  const sharedAttributes = Object.entries(byAttribute)
    .filter(([, list]) => list.length > 1)
    .map(([id, list]) => ({ id, name: ATTRIBUTE_BY_ID[id].name, agents: list.map((a) => a.name) }));
  const sharedFactions = Object.entries(byFaction)
    .filter(([, list]) => list.length > 1)
    .map(([name, list]) => ({ name, agents: list.map((a) => a.name) }));

  const notes = [];
  const n = agents.length;
  if (n === 0) {
    notes.push({ level: 'info', text: 'Pick up to three Agents from the roster, then add a Bangboo.' });
    return { agents, specialtyCounts, sharedAttributes, sharedFactions, notes };
  }

  const dps = agents.filter((a) => DAMAGE_SPECIALTIES.includes(a.specialty));
  if (dps.length === 0) {
    notes.push({ level: 'warn', text: 'No Attack, Anomaly or Rupture Agent yet, so nobody is built to deal the main damage.' });
  }
  if (!specialtyCounts.stun && specialtyCounts.anomaly < 2 && n === 3) {
    notes.push({ level: 'warn', text: 'No Stun Agent: enemies will take longer to Daze, so there are fewer Stun windows for burst damage.' });
  }
  if (!specialtyCounts.support && !specialtyCounts.defense && n === 3) {
    notes.push({ level: 'info', text: 'No Support or Defense Agent: the squad has no buffer or shielder.' });
  }

  const anomalyAttrs = new Set(
    agents.filter((a) => a.specialty === 'anomaly').map((a) => baseAttribute(a.attribute)),
  );
  if (anomalyAttrs.size >= 2) {
    notes.push({ level: 'good', text: 'Anomaly Agents with different attributes can set off Disorder by stacking a second Attribute Anomaly on an enemy.' });
  }
  if (specialtyCounts.stun && dps.length) {
    notes.push({ level: 'good', text: 'Stun plus a damage dealer: the classic shape for Stun-window burst.' });
  }
  if (sharedAttributes.length || sharedFactions.length) {
    notes.push({ level: 'good', text: 'Shared attributes or factions can unlock Additional Abilities. Check each Agent’s Core Skill in game for the exact condition.' });
  } else if (n >= 2) {
    notes.push({ level: 'info', text: 'No shared attribute or faction. Some Agents’ Additional Abilities need one, so check their Core Skills.' });
  }

  const bangboo = bangbooId && BANGBOO_BY_ID[bangbooId];
  if (!bangboo && n === 3) notes.push({ level: 'info', text: 'Add a Bangboo to complete the squad.' });

  return { agents, specialtyCounts, sharedAttributes, sharedFactions, notes };
}

function groupBy(list, key) {
  return list.reduce((acc, x) => {
    (acc[key(x)] ??= []).push(x);
    return acc;
  }, {});
}

/** For each Agent in other teams: names of those teams. */
export function usageInOtherTeams(teams, activeId) {
  const out = {};
  teams.forEach((t) => {
    if (t.id === activeId) return;
    t.members.forEach((id) => {
      if (id) (out[id] ??= []).push(t.name || 'Untitled');
    });
  });
  return out;
}

export const specialtyName = (id) => SPECIALTY_BY_ID[id]?.name ?? id;
