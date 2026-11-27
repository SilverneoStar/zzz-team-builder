// Endgame modes for the Ethereals tab: the current Deadly Assault and Shiyu
// Defense rotations. Only game facts are kept here (dates, weaknesses,
// resistances, buff effects); which teams fit is worked out by the site in
// lib/endgame.js from these facts and the community team list in builds.js.
//
// A boss or side can list `picks`: hand-picked teams shown first. A slot can
// be a list of Agents (['seed', 'orphie-…']) when any of them works there.
// `favors` says what a buff rewards, for scoring teams:
//   specialty / attribute / attackType: { id: weight }
//   anomalyPair: true when 2+ Anomaly Agents in the squad unlock the buff
//   anyAttribute: true when the buff boosts Attribute Anomaly DMG of any element

export const DEADLY_ASSAULT = {
  id: '3.3.3',
  label: 'Deadly Assault 3.3.3',
  start: '2026-11-20',
  end: '2026-12-04',
  note: 'Pick one buff for each boss (the same buff can be picked more than once). An Agent can only be used against one boss per run.',
  // Score needed on each boss for 1, 2 and 3 stars (3 stars = S rank).
  stars: [6000, 14000, 20000],
  // The extra boss for players who earn all 9 stars.
  bonus: {
    title: 'Adversity',
    unlock: 'Unlocks once you earn all 9 stars (3 stars on each of the three bosses). Level 70, 3-minute limit; stars at 10,000, 20,000 and 30,000 points. Score = damage + Performance Points; your best score of the season is kept.',
    name: 'Integrated – Girtablullu',
    art: 'enemies/da-3-3-3-adversity.webp',
    weak: ['wind', 'fire'],
    resist: [],
    // Its rules are added once its in-game details are in.
    mechanics: [],
  },
  buffs: [
    {
      id: 'da-1',
      name: 'Sweeping Frost',
      icon: 'enemies/da-3-3-3-buff-1.webp',
      text: [
        'Agents’ Wind DMG increases by 30%. When attacks hit enemies, ignore 30% of their Wind RES.',
        'Attack Agents’ CRIT DMG increases by 40%, and Basic Attack DMG by 50%.',
      ],
      favors: { specialty: { attack: 2 }, attribute: { wind: 2 } },
    },
    {
      id: 'da-2',
      name: 'Surging Thunder',
      icon: 'enemies/da-3-3-3-buff-2.webp',
      text: [
        'Agents’ DEF increases by 10%, and their Sharp DMG by 15%.',
        'After an Agent uses an EX Special Attack, Special Attack or Ultimate, Electric and Wind DMG increase by 20% for 15s. Repeated triggers reset the duration.',
      ],
      favors: { specialty: { armorer: 2 }, attribute: { electric: 1.5, wind: 1 } },
    },
    {
      id: 'da-3',
      name: 'Spirit Zenith',
      icon: 'enemies/da-3-3-3-buff-3.webp',
      text: [
        'Anomaly Agents’ ATK increases by 10%, and Fire and Wind Anomaly Buildup Rate by 10%.',
        'When an Agent deals Attribute Anomaly DMG and lands a CRIT, the whole squad gains 20 Energy, and Attribute Anomaly DMG increases by 20% for 20s. Can trigger once every 20s.',
      ],
      favors: { specialty: { anomaly: 2 }, attribute: { fire: 1, wind: 1 }, anyAttribute: true },
    },
  ],
  bosses: [
    {
      id: 'da-3-3-3-1',
      name: 'Infernal Revenant',
      type: 'Ethereal',
      tip: 'Destroy the molten rocks and fire tornado it summons: its defenses toughen while they’re up.',
      gimmicks: [
        'It summons molten rocks (flintstones) and a fire tornado onto the stage, and its defenses get tougher while they stand. Destroy them to weaken it; each rock gives the squad 20 Energy. Agents with wide hits, like Miyabi, break them all at once.',
        'Its Infernal state cuts Attribute Anomaly DMG taken by 30%.',
        'Shutdown: after a purple flash, Defensive Assist or Perfect Dodge the first attack, then Defensive Assist the next four (a white burst marks each one).',
        'Chain Parries, and every 2 Defensive Assists or Perfect Dodges, stack Overheat: +25% squad CRIT DMG per stack, up to 3, for 20s.',
        'Performance Points: 2,000 for a Shutdown and 1,000 per rock destroyed, up to 5,000.',
      ],
      art: 'enemies/da-3-3-3-1.webp',
      weak: ['wind', 'ice'],
      resist: ['physical'],
      ranked: true,
      buff: 'da-1',
      // The in-game Squad Building Guide's teams, both with Sweeping Frost.
      picks: [
        ['severian-lowell', 'norma-hollowell', 'sunna'],
        ['sigrid-de-lazur', 'dialyn', 'sunna'],
      ],
    },
    {
      id: 'da-3-3-3-2',
      name: 'Kusarikku',
      type: 'Ethereal',
      isNew: true,
      about: 'An Armorer stage: Laceration DMG is what Exposed boosts, and Attribute Anomaly DMG taken is cut by 40%. No Armorer? The Ye Shunguang or Seed teams from the in-game guide work as fallbacks.',
      tip: 'Defensive Assist its Rift Assault and Stun it to stack Exposed: each stack makes it take more Laceration DMG.',
      gimmicks: [
        'Attribute Anomaly DMG it takes is reduced by 40%.',
        'A Defensive Assist against its Rift Assault applies 1 stack of Exposed; Stunning it applies 2. Each stack makes it take 20% more Laceration DMG, up to 4 stacks for 30s (repeat triggers reset the duration).',
        'After it activates Corruptive Barrier, Defensive Assist its Rift Assault to counter it and leave it Impaired.',
        'Performance Points: 1,000 for leaving it Impaired after Corruptive Barrier, 700 per Rift Assault countered with a Defensive Assist, and 2,000 for a Shutdown on its Control Skill, up to 5,000.',
      ],
      art: 'enemies/da-3-3-3-2.webp',
      weak: ['fire', 'electric'],
      resist: ['ice'],
      ranked: true,
      // An Armorer stage: Surging Thunder's Sharp DMG suits Armorer teams. The in-game
      // Squad Building Guide's Ye Shunguang and Seed teams (with Sweeping Frost) are fallbacks.
      buff: 'da-2',
      picks: [
        ['claret-flint', 'roxy-ifrita-pryce', 'alexandrina-sebastiane'],
        // Sunbringer and Robin arrive with 3.4 (2 Dec).
        ['sunbringer', 'roxy-ifrita-pryce', 'robin-hsr'],
        ['ye-shunguang', 'zhao', 'astra-yao'],
        ['seed', 'cissia', 'astra-yao'],
      ],
    },
    {
      id: 'da-3-3-3-3',
      name: 'Phaethon of the Scorched Horizon',
      isNew: true,
      about: 'Suited to Anomaly Agents: every Anomaly you inflict strips its damage buff and makes it take more Abloom DMG.',
      tip: 'Keep inflicting Anomalies to strip Into Flames, and knock it down while it attacks in mid-air.',
      gimmicks: [
        'After it activates Gale Scorcher, it gains 5 stacks of Into Flames. Each stack raises its DMG dealt by 10% and cuts the CRIT DMG it takes by 25%.',
        'Each Anomaly you inflict removes 1 stack of Into Flames, and it then takes 10% more Abloom DMG for 15s (up to 3 stacks; repeat triggers reset the duration).',
        'Performance Points: 1,250 for Impairing it in Gale Scorcher state, 1,500 for striking it down while it attacks in mid-air, and 2,000 for a Shutdown on its Control Skill, up to 5,000.',
      ],
      art: 'enemies/da-3-3-3-3.webp',
      weak: ['wind', 'ice'],
      resist: ['physical'],
      ranked: true,
      buff: 'da-3',
      picks: [
        ['remielle-dan', 'phoenix-reffaella', 'velina-airgid'],
        ['remielle-dan', 'aria', 'velina-airgid'],
      ],
    },
  ],
};

export const SHIYU_DEFENSE = {
  id: '2026-11-27',
  label: 'Shiyu Defense: Critical Node',
  start: '2026-11-27',
  // Two-week rotation, like the last one (13–26 Nov).
  end: '2026-12-10',
  note: 'The score check is Stage 5: three rooms, each needing its own squad, so no Agent can be in two rooms.',
  stages: [
    {
      n: 5,
      name: 'Fifth Frontier',
      // Rank per room by score, best first.
      ranks: [['S', 25000], ['A', 16000], ['B', 8000]],
      // The top grade for the whole node.
      topRank: { rank: 'S+', total: 100000, need: 'S in all three rooms' },
      score:
        'Dealing DMG earns DMG Score and defeating a normal or elite enemy earns Elimination Score. Each room caps at 50,000, and points scored earlier in the fight get a bigger multiplier.',
      buffs: [],
      sides: [
        {
          // Three waves, with City Guardboo, Airspace Patrolboo and Special Anti-Riotboo.
          name: 'Conqueror',
          art: 'enemies/sd-1127-1.webp',
          weak: ['electric', 'wind'],
          resist: ['physical'],
          buffs: [
            {
              id: 'sd-1127-1',
              name: 'Room 1',
              text: [
                'Attack Agents’ Wind DMG +30% and CRIT DMG +40%.',
                'After an Agent uses an EX Special Attack, attacks ignore 20% of the enemy’s Wind RES for 15s (repeat triggers reset the duration).',
              ],
              favors: { specialty: { attack: 3, stun: 1 }, attribute: { wind: 3, electric: 1.5 } },
            },
          ],
          // Made for Severian (Wind Attack); Electric Attack teams also hit its weakness.
          ranked: true,
          picks: [
            ['severian-lowell', 'roxy-ifrita-pryce', ['astra-yao', 'sunna']],
            ['severian-lowell', 'norma-hollowell', 'astra-yao'],
            ['asaba-harumasa', 'trigger', 'astra-yao'],
            ['soldier-0-anby', 'trigger', 'orphie-magnusson-and-magus'],
          ],
        },
        {
          // Two waves, with Lahmu and Doppelganger – Pulchra. (Doppelganger – Starlight – Billy was
          // listed here by mistake in the game's description; kept for later: weak to Fire and
          // Electric, resists Physical, art in enemies/doppelganger-starlight-billy.webp.)
          name: 'Miasmic – Terror Raptor',
          art: 'enemies/sd-1127-2.webp',
          weak: ['fire', 'electric'],
          resist: ['ether'],
          buffs: [
            {
              id: 'sd-1127-2',
              name: 'Room 2',
              text: [
                'Armorer Agents’ DEF +15%, and Sharp DMG +15%.',
                'When an Agent’s attack hits an enemy, it ignores 10% of the enemy’s Fire RES and Electric RES.',
              ],
              favors: { specialty: { armorer: 3, attack: 1, stun: 1 }, attribute: { fire: 2, electric: 2 } },
            },
          ],
          // An Armorer room: Claret, or Sunbringer once she's out (2 Dec); Fire Attack as a fallback.
          ranked: true,
          picks: [
            ['claret-flint', 'roxy-ifrita-pryce', 'alexandrina-sebastiane'],
            ['sunbringer', 'roxy-ifrita-pryce', 'robin-hsr'],
            ['claret-flint', 'norma-hollowell', 'alexandrina-sebastiane'],
            ['evelyn-chevalier', 'ju-fufu', 'astra-yao'],
          ],
        },
        {
          // Two waves, with Ionized – Farbauti and Ionized – Dullahan.
          name: 'Miasmic – Thracian',
          art: 'enemies/sd-1127-3.webp',
          weak: ['wind', 'ether'],
          resist: ['electric'],
          buffs: [
            {
              id: 'sd-1127-3',
              name: 'Room 3',
              text: [
                'Agents’ Anomaly Proficiency +30. After an enemy is Stunned, its Stun recovery rate drops by 10% for 15s (repeat triggers reset the duration).',
                'In Ether Veil, Agents’ ATK +15% and attacks ignore 20% of the enemy’s Ether RES.',
              ],
              favors: { specialty: { anomaly: 3, stun: 1 }, attribute: { ether: 2, wind: 2 }, anomalyPair: true },
            },
          ],
          // Ether or Wind Anomaly; Nangong Yu and Sunna both bring Ether Veil.
          ranked: true,
          picks: [
            ['aria', 'nangong-yu', 'sunna'],
            ['aria', 'nangong-yu', 'ukinami-yuzuha'],
            ['vivian-banshee', 'jane-doe', 'ukinami-yuzuha'],
            ['velina-airgid', 'remielle-dan', 'ukinami-yuzuha'],
          ],
        },
      ],
    },
  ],
};
