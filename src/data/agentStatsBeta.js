// Base stats for Agents not in Enka's data yet, from the latest beta (v3.4.3)
// as shown by fan datamine sites, in the same shape as agentStats.js. Lv.60
// before gear; the Core Skill bonus is spread the way the game does (first stat
// at A/C/E, ATK at B/D/F; a single stat goes up every level). Beta: may change.
// Drop an entry once tools/enka/make_stats.py picks the Agent up.
export const AGENT_STATS_BETA = {
  kafka: {
    base: { hp: 7788, atk: 797, def: 612, impact: 86, critRate: 500, critDmg: 5000, am: 112, ap: 114, er: 120 },
    core: [{}, { ap: 18 }, { ap: 18, atk: 25 }, { ap: 36, atk: 25 }, { ap: 36, atk: 50 }, { ap: 54, atk: 50 }, { ap: 54, atk: 75 }],
  },
  'robin-hsr': {
    base: { hp: 8754, atk: 675, def: 706, impact: 90, critRate: 500, critDmg: 5000, am: 96, ap: 95, er: 120 },
    core: [{}, { hpPct: 600 }, { hpPct: 600, atk: 25 }, { hpPct: 1200, atk: 25 }, { hpPct: 1200, atk: 50 }, { hpPct: 1800, atk: 50 }, { hpPct: 1800, atk: 75 }],
  },
  sunbringer: {
    base: { hp: 5736, atk: 0, def: 441, impact: 93, critRate: 500, critDmg: 5000, am: 78, ap: 77, er: 0 },
    core: [{}, { critRate: 480 }, { critRate: 960 }, { critRate: 1440 }, { critRate: 1920 }, { critRate: 2400 }, { critRate: 2880 }],
  },
};
