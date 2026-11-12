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
      tip: 'Chain Parry her glowing 3-hit attack, and step onto the golden area to counter when the arena splits.',
      gimmicks: [
        'When her blade glows before a 3-hit attack, Defensive Assist, dodge, then Chain Parry to cancel the damage and counter.',
        'The arena splits in two: step onto the golden area and Defensive Assist to counter her attack.',
        'Each Attribute Anomaly gives her an Afterglow Mark. At 3 marks (or when Stunned) she enters Wax Wings for 30s: +30% Attribute Anomaly DMG taken and extra Daze.',
        'Parry the attacks with gold glints to break her Corruptive Barrier quickly.',
        'Performance Points: 1,000 per Chain Parry and 1,500 per golden-area counter, up to 5,000.',
      ],
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
      tip: 'Destroy the molten rocks and fire tornado it summons: its defenses toughen while they’re up.',
      gimmicks: [
        'It summons molten rocks (flintstones) and a fire tornado onto the stage, and its defenses get tougher while they stand. Destroy them to weaken it; each rock gives the squad 20 Energy. Agents with wide hits, like Miyabi, break them all at once.',
        'Its Infernal state cuts Attribute Anomaly DMG taken by 30%.',
        'Shutdown: after a purple flash, Defensive Assist or Perfect Dodge the first attack, then Defensive Assist the next four (a white burst marks each one).',
        'Chain Parries, and every 2 Defensive Assists or Perfect Dodges, stack Overheat: +25% squad CRIT DMG per stack, up to 3, for 20s.',
        'Performance Points: 2,000 for a Shutdown and 1,000 per rock destroyed, up to 5,000.',
      ],
      art: 'enemies/da-3-3-2-2.webp',
      weak: ['wind', 'ice'],
      resist: ['physical'],
      ranked: true,
      buff: 'da-2',
      picks: [
        ['sigrid-de-lazur', 'dialyn', 'astra-yao'],
        ['sigrid-de-lazur', 'dialyn', 'sunna'],
        ['severian-lowell', 'norma-hollowell', 'astra-yao'],
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
  id: '2026-11-13',
  label: 'Shiyu Defense: Critical Node',
  start: '2026-11-13',
  end: '2026-11-26',
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
          name: 'AAU – Airspace Sentinel',
          art: 'enemies/sd-1113-1.webp',
          weak: ['ice', 'wind'],
          resist: ['ether'],
          buffs: [
            {
              id: 'sd-1113-1',
              name: 'Room 1',
              text: [
                'Attack Agents’ ATK +35%, and Wind DMG +20%.',
                'When an Agent’s Ultimate hits an enemy, its Wind RES drops by 15% for 30s (repeat triggers reset the duration).',
              ],
              favors: { specialty: { attack: 3, stun: 1 }, attribute: { wind: 2, ice: 1 } },
            },
          ],
          // Made for Severian: Wind Attack with Roxy; Sigrid for Ice.
          ranked: true,
          picks: [
            ['severian-lowell', 'roxy-ifrita-pryce', ['astra-yao', 'sunna']],
            ['severian-lowell', 'norma-hollowell', 'astra-yao'],
            ['sigrid-de-lazur', 'roxy-ifrita-pryce', 'sunna'],
            ['sigrid-de-lazur', 'von-lycaon', 'sunna'],
          ],
        },
        {
          name: 'The Defector – Isolde',
          art: 'enemies/sd-1113-2.webp',
          weak: ['fire', 'physical'],
          resist: ['ether'],
          buffs: [
            {
              id: 'sd-1113-2',
              name: 'Room 2',
              text: [
                'When an Anomaly Agent’s Attribute Anomaly DMG crits, the whole squad gets ATK +10% and Attribute Anomaly DMG +20% for 15s (repeat triggers reset the duration).',
                'When an Agent inflicts Burn (Fire Anomaly), the target’s Fire RES drops by 10% for 15s (repeat triggers reset the duration).',
              ],
              favors: { specialty: { anomaly: 3 }, attribute: { fire: 2, physical: 1 }, anomalyPair: true, anyAttribute: true },
            },
          ],
          // Full Anomaly teams: Phoenix for Fire, Jane for Physical.
          ranked: true,
          picks: [
            ['phoenix-reffaella', 'jane-doe', 'remielle-dan'],
            ['phoenix-reffaella', 'velina-airgid', 'remielle-dan'],
            ['jane-doe', 'burnice-white', 'ukinami-yuzuha'],
            ['phoenix-reffaella', 'jane-doe', 'ukinami-yuzuha'],
          ],
        },
        {
          name: 'Haytor',
          art: 'enemies/sd-1113-3.webp',
          weak: ['ice', 'fire'],
          resist: ['electric'],
          buffs: [
            {
              id: 'sd-1113-3',
              name: 'Room 3',
              text: [
                'Agents’ Sheer DMG +35%.',
                'After a Rupture Agent uses their Ultimate, their Fire DMG and Ice DMG rise by 50% for 15s (repeat triggers reset the duration).',
              ],
              favors: { specialty: { rupture: 3, stun: 1 }, attribute: { fire: 1.5, ice: 1.5 } },
            },
          ],
          // Rupture teams: Starlight Billy, Banyue, Yidhari or Manato.
          ranked: true,
          picks: [
            ['starlight-billy-kid', 'dialyn', 'lucia-elowen'],
            ['banyue', 'ju-fufu', 'lucia-elowen'],
            ['yidhari-murphy', 'von-lycaon', 'lucia-elowen'],
            ['komano-manato', 'dialyn', 'pan-yinhu'],
          ],
        },
      ],
    },
  ],
};
