import { PASSIVES } from '../data/passives.js';
import { KIT_LINKS, MECHANICS } from '../data/kitLinks.js';
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

// ---------- Additional Abilities ----------

const SPEC_NAME = (id) => SPECIALTY_BY_ID[id]?.name ?? id;
const orList = (items) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`;

/** Plain-language condition, e.g. "Another Stun or Support Agent, or one with the same faction". */
export function passiveCondition(agentId) {
  const p = PASSIVES[agentId];
  if (!p) return null;
  if (p.note) return `${p.note}${p.faction ? ', or one with the same faction' : ''}`;
  const parts = [];
  if (p.specialties) parts.push(`Another ${orList(p.specialties.map(SPEC_NAME))} Agent`);
  const shared = [p.attribute && 'attribute', p.faction && 'faction'].filter(Boolean);
  if (shared.length) parts.push(`${parts.length ? 'one' : 'Another Agent'} with the same ${shared.join(' or ')}`);
  return parts.join(', or ');
}

/**
 * Whether each squad member's Additional Ability is on.
 * Returns { byId: { [id]: { known, active, name, condition, via: [names] } }, active, total }.
 */
export function passiveStatus(memberIds) {
  const squad = memberIds.map((id) => id && AGENT_BY_ID[id]).filter(Boolean);
  const byId = {};
  let active = 0;
  squad.forEach((a) => {
    const p = PASSIVES[a.id];
    if (!p) {
      byId[a.id] = { known: false, active: false, name: null, condition: 'Not published yet', via: [] };
      return;
    }
    const via = squad
      .filter((o) => o.id !== a.id)
      .filter(
        (o) =>
          p.specialties?.includes(o.specialty) ||
          (p.attribute && baseAttribute(o.attribute) === baseAttribute(a.attribute)) ||
          (p.faction && o.faction === a.faction),
      )
      .map((o) => o.name);
    const on = via.length > 0;
    if (on) active += 1;
    byId[a.id] = { known: true, estimated: !!p.estimated, active: on, name: p.name ?? 'Additional Ability', condition: passiveCondition(a.id), via };
  });
  return { byId, active, total: squad.length };
}

// ---------- Kit links (Ether Veil, Aftershock) ----------

const fits = (payoff, provider) =>
  payoff.mechanic === provider.mechanic && (!payoff.veil || payoff.veil === provider.veil);

/**
 * Kit links in a squad: for each mechanic, the members who provide it and the
 * members who get stronger from a squadmate's. Only links with a payoff Agent
 * and a different provider Agent are returned.
 */
export function kitLinks(memberIds) {
  const squad = memberIds.map((id) => id && AGENT_BY_ID[id]).filter(Boolean);
  return Object.entries(MECHANICS)
    .map(([id, m]) => {
      const payoff = [];
      const providers = new Set();
      squad.forEach((a) => {
        (KIT_LINKS[a.id] ?? []).filter((l) => l.mechanic === id && l.side === 'payoff').forEach((l) => {
          const from = squad.filter(
            (o) => o.id !== a.id && (KIT_LINKS[o.id] ?? []).some((x) => x.side === 'provider' && fits(l, x)),
          );
          if (from.length) {
            payoff.push({ agent: a, text: l.text, from: from.map((o) => o.name) });
            from.forEach((o) => providers.add(o.name));
          }
        });
      });
      return { id, name: m.name, payoff, providers: [...providers] };
    })
    .filter((x) => x.payoff.length);
}

const score = (x) => (x.kit.length ? 2 : 0) + (x.on && x.back ? 2 : 0) + (x.on ? 1 : 0);

/** Does `other` turn on `owner`'s Additional Ability? */
function turnsOn(owner, other) {
  const p = PASSIVES[owner.id];
  if (!p || owner.id === other.id) return false;
  return (
    !!p.specialties?.includes(other.specialty) ||
    (!!p.attribute && baseAttribute(other.attribute) === baseAttribute(owner.attribute)) ||
    (!!p.faction && other.faction === owner.faction)
  );
}

/** Mechanic names that link two Agents in either direction. */
export function kitLinksBetween(a, b) {
  const la = KIT_LINKS[a.id] ?? [];
  const lb = KIT_LINKS[b.id] ?? [];
  const names = new Set();
  la.forEach((x) =>
    lb.forEach((y) => {
      if ((x.side === 'payoff' && y.side === 'provider' && fits(x, y)) || (y.side === 'payoff' && x.side === 'provider' && fits(y, x))) {
        names.add(MECHANICS[x.mechanic].name);
      }
    }),
  );
  return [...names];
}

/**
 * Teammates for one Agent: who turns on their Additional Ability, whether
 * they turn on each other's (both ways), and any kit links. Best fits first.
 */
export function teammatesFor(agent, pool) {
  return pool
    .filter((o) => o.id !== agent.id)
    .map((o) => ({
      agent: o,
      on: turnsOn(agent, o),
      back: turnsOn(o, agent),
      kit: kitLinksBetween(agent, o),
    }))
    .filter((x) => x.on || x.kit.length)
    .sort((x, y) => score(y) - score(x) || x.agent.name.localeCompare(y.agent.name));
}
