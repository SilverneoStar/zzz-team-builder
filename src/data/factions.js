// Factions that sit inside a bigger one: a department of Roscaelifer counts as
// Roscaelifer for faction-based Additional Abilities and Bangboo, and the other
// way round (Norma, of the External Strategy Department, works with Sunbringer,
// as in the 3.4 PlayStation showcase).
export const FACTION_PARENT = {
  'External Strategy Department': 'Roscaelifer',
  'Administrative Affairs Department': 'Roscaelifer',
  'Airspace Patrol Department': 'Roscaelifer',
  'Central Computing Department': 'Roscaelifer',
};

/** Whether two factions count as the same: equal, or one is the other's parent. */
export const sameFaction = (a, b) =>
  !!a && !!b && (a === b || FACTION_PARENT[a] === b || FACTION_PARENT[b] === a);

/** Whether an Agent's faction is (or sits inside) one of these factions. */
export const inFaction = (faction, names) => names.some((n) => sameFaction(faction, n));
