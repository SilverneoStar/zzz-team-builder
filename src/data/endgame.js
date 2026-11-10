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
  id: '3.3.2',
  label: 'Deadly Assault 3.3.2',
  start: '2026-11-06',
  end: '2026-11-20',
  note: 'Pick one buff for each boss. An Agent can only be used against one boss per run.',
  // Score needed on each boss for 1, 2 and 3 stars (3 stars = S rank).
  stars: [6000, 14000, 20000],
  // The extra boss for players who earn all 9 stars.
  bonus: {
    title: 'Adversity',
    unlock: 'Unlocks once you earn all 9 stars (3 stars on each of the three bosses). Level 70, 3-minute limit; stars at 10,000, 20,000 and 30,000 points. Score = damage + Performance Points; your best score of the season is kept.',
    name: 'Rewritten – Sanguine Sweeper',
    art: 'enemies/da-3-3-2-adversity.webp',
    weak: ['wind', 'fire'],
    resist: ['physical'],
    mechanics: [
      'After a Shutdown against its Control Skill, your whole squad gets +15% Daze and +30% DEF, and while attacks hit, +75% CRIT DMG and +15% Attribute Anomaly DMG.',
      'While it’s Stunned, Sharp DMG from the whole squad rises by 60%, and Wind and Ice CRIT DMG by 80%, ignoring 40% of its DEF.',
    ],
  },
  buffs: [
    {
      id: 'da-1',
      name: 'Blazing Radiance',
      icon: 'enemies/da-3-3-2-buff-1.webp',
      text: [
        'Anomaly Agents’ ATK increases by 10%, and Fire Anomaly Buildup Rate by 10%.',
        'When an Agent deals Attribute Anomaly DMG and lands a CRIT, the squad’s Anomaly Proficiency increases by 30 and Attribute Anomaly DMG by 10% for 15s. Repeated triggers reset the duration.',
      ],
      favors: { specialty: { anomaly: 2 }, attribute: { fire: 1.5 }, anomalyPair: true },
    },
    {
      id: 'da-2',
      name: 'Storm Tribulation',
      icon: 'enemies/da-3-3-2-buff-2.webp',
      text: [
        'Agents’ Wind DMG increases by 40%, and Wind CRIT DMG by 40%.',
        'Attack Agents’ ATK increases by 25%, and Basic Attack DMG by 40%.',
      ],
      favors: { specialty: { attack: 1.5 }, attribute: { wind: 2 } },
    },
    {
      id: 'da-3',
      name: 'Corroding Edge',
      icon: 'enemies/da-3-3-2-buff-3.webp',
      text: [
        'Agents’ Electric DMG increases by 30%, and Sharp DMG by 10%.',
        'Attack and Armorer Agents’ PEN Ratio increases by 20%, and Special Attack and EX Special Attack DMG by 30%.',
      ],
      favors: { specialty: { attack: 1, armorer: 1.5 }, attribute: { electric: 2 } },
    },
  ],
  bosses: [
    {
      id: 'da-3-3-2-1',
      name: 'Etheric Other – Truvia',
      about: 'The Blasphemer',
      art: 'enemies/da-3-3-2-1.webp',
      weak: ['fire'],
      resist: ['ice'],
      // Fire Anomaly with Blazing Radiance. Squad Building Guide picks first, then the Phoenix trio.
      ranked: true,
      buff: 'da-1',
      picks: [
        ['phoenix-reffaella', 'velina-airgid', 'ukinami-yuzuha'],
        ['burnice-white', 'velina-airgid', 'remielle-dan'],
        ['phoenix-reffaella', 'velina-airgid', 'remielle-dan'],
      ],
    },
    {
      id: 'da-3-3-2-2',
      name: 'Infernal Revenant',
      type: 'Ethereal',
      isNew: true,
      art: 'enemies/da-3-3-2-2.webp',
      weak: ['wind', 'ice'],
      resist: ['physical'],
      ranked: true,
      buff: 'da-2',
      picks: [
        ['sigrid-de-lazur', 'dialyn', 'astra-yao'],
        ['sigrid-de-lazur', 'dialyn', 'sunna'],
      ],
    },
    {
      id: 'da-3-3-2-3',
      name: 'Autonomous Assault Unit – Typhon Destroyer',
      type: 'Machine',
      isNew: true,
      about: 'Best with a Stun Agent. No Electric team? Ye Shunguang, Dialyn and Sunna with Storm Tribulation can brute-force it.',
      tip: 'Dodge until its missile barrage, then parry the three heavy attacks that follow to Impair it.',
      gimmicks: [
        'Dodge its attacks until it fires a missile barrage. Three heavy attacks follow: parry all three with Defensive Assists.',
        'Each Defensive Assist hit stacks Overwhelmed (+15% Daze, and +10% Chain Attack and Ultimate DMG taken while Stunned). Three stacks Impair it.',
        'Performance Points: 300 per Perfect Assist and 900 for Impairing it, up to 5,000.',
        'Assists don’t use Assist Points here. It repairs and clears Overwhelmed while charging and after a Stun, and gets more aggressive over time.',
        'Shock slows it down, which makes it easier to Stun.',
      ],
      art: 'enemies/da-3-3-2-3.webp',
      weak: ['electric', 'wind'],
      resist: ['fire'],
      ranked: true,
      buff: 'da-3',
      // Teams with a Stun Agent first.
      picks: [
        ['claret-flint', 'roxy-ifrita-pryce', 'alexandrina-sebastiane'],
        ['soldier-0-anby', 'trigger', 'sunna'],
        ['seed', 'cissia', 'astra-yao'],
        ['ye-shunguang', 'dialyn', 'sunna'],
      ],
    },
  ],
};

export const SHIYU_DEFENSE = {
  id: '2026-10-30',
  label: 'Shiyu Defense: Critical Node',
  start: '2026-10-30',
  end: '2026-11-12',
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
          name: 'Miasma Ravager – Avarus',
          waves: ['Frenzied Maniac, Wicked Wraith', 'Miasma Ravager – Avarus'],
          tip: 'Parry its rolling attack with Defensive Assists 3 times in a row to interrupt it and expose its weakness.',
          gimmicks: [
            'Rolls its massive body at you: parry it with Defensive Assists 3 times in a row to interrupt the roll and expose its weakness.',
            'After taking enough DMG it activates a Miasmic Field.',
          ],
          art: 'enemies/sd-5-1.webp',
          weak: ['fire', 'ether'],
          resist: ['ice'],
          buffs: [
            {
              id: 'sd-5-1',
              name: 'Room 1',
              text: [
                'Anomaly Agents’ Fire DMG +20%.',
                'When an Agent’s Attribute Anomaly DMG crits, the squad recovers 20 Energy and Attribute Anomaly DMG rises by 30% for 20s (once every 20s).',
              ],
              favors: { specialty: { anomaly: 3 }, attribute: { fire: 1.5, ether: 1 }, anomalyPair: true },
            },
          ],
          // Picks in order of preference: full Anomaly teams first.
          ranked: true,
          picks: [
            ['phoenix-reffaella', 'velina-airgid', 'remielle-dan'],
            ['burnice-white', 'velina-airgid', 'remielle-dan'],
            ['phoenix-reffaella', 'velina-airgid', 'ukinami-yuzuha'],
            ['vivian-banshee', 'jane-doe', 'ukinami-yuzuha'],
          ],
        },
        {
          name: 'Lockspring',
          waves: ['Assault Gunner, Guardian MK II', 'Lockspring'],
          tip: 'Some of its blows hit so hard that even a successful Defensive Assist gets no Assist Follow-Up, and it may taunt you.',
          gimmicks: [
            'Certain blows hit so hard that even after a successful Defensive Assist, no Assist Follow-Up can activate.',
            'After those blows, Lockspring may respond with a taunt.',
          ],
          art: 'enemies/sd-5-2.webp',
          weak: ['physical', 'electric'],
          resist: ['ether'],
          buffs: [
            {
              id: 'sd-5-2',
              name: 'Room 2',
              text: [
                'Agent Sharp DMG +20% (for Armorer Agents) and DEF +20%.',
                'When an Agent defeats an Elite enemy, Stun Agents restore 30 Energy and the squad restores 500 Decibels.',
              ],
              // Sharp DMG is the Armorer part (Claret for now).
              favors: { specialty: { armorer: 3, stun: 1 }, attribute: { electric: 1, physical: 1 } },
            },
          ],
          // Claret's Armorer team first; Nekomata deals great damage since her Potential update.
          ranked: true,
          picks: [
            ['claret-flint', 'roxy-ifrita-pryce', 'alexandrina-sebastiane'],
            ['nekomiya-mana', 'dialyn', 'astra-yao'],
            ['ye-shunguang', 'dialyn', 'sunna'],
            ['soldier-0-anby', 'trigger', ['seed', 'orphie-magnusson-and-magus']],
          ],
        },
        {
          name: 'Miasmic Komano Manato',
          waves: ['Miasmic – Huskron, Miasma Spawn, Huskron', 'Miasmic Komano Manato'],
          tip: 'Parry his skills: Defensive Assists interrupt some of them, and parrying his powerful skills forces him into a Weakened state.',
          gimmicks: [
            'A Defensive Assist against some of his skills interrupts his attacks.',
            'Parrying his powerful skills forces him into a Weakened state.',
            'After taking enough DMG he activates a Miasmic Field and unleashes powerful attacks.',
          ],
          art: 'enemies/sd-5-3.webp',
          weak: ['ice'],
          resist: ['physical'],
          buffs: [
            {
              id: 'sd-5-3',
              name: 'Room 3',
              text: [
                'Attack Agents’ Ether and Ice DMG +20%, and their CRIT DMG +40%.',
                'When an Agent Stuns an enemy, its Stun recovery rate drops by 15% for 15s (repeat triggers reset the duration).',
              ],
              favors: { specialty: { attack: 3, stun: 1 }, attribute: { ice: 2, ether: 1 } },
            },
          ],
          // Made for Hugo, Sigrid or Pyrois.
          ranked: true,
          picks: [
            ['hugo-vlad', 'von-lycaon', 'lighter'],
            ['sigrid-de-lazur', 'norma-hollowell', 'sunna'],
            ['pyrois', 'dialyn', 'sunna'],
            // A budget option: Norma and Nicole.
            ['pyrois', 'norma-hollowell', 'nicole-demara'],
          ],
        },
      ],
    },
  ],
};
