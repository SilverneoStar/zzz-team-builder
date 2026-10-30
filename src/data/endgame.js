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
  id: '3.3.1',
  label: 'Deadly Assault 3.3.1',
  start: '2026-10-23',
  end: '2026-11-06',
  note: 'Pick one buff for each boss. An Agent can only be used against one boss per run.',
  // Score needed on each boss for 1, 2 and 3 stars (3 stars = S rank).
  stars: [6000, 14000, 20000],
  // The extra boss for players who earn all 9 stars. Fill in once known.
  bonus: {
    title: 'Adversity',
    unlock: 'Unlocks once you earn all 9 stars (3 stars on each of the three bosses). Score = damage + Performance Points (capped at 5,000), with a 3-minute limit; your best score of the season is kept.',
    name: 'Girtablullu',
    art: 'enemies/da-3-3-1-adversity.webp',
    weak: ['wind'],
    resist: [],
    mechanics: [
      'Each Attribute Anomaly applied adds a Shadow stack (up to 3): each raises Anomaly DMG taken by 7.5% and Vortex DMG taken by 5% for 10s.',
      'During its Corruptive Barrier, applying Shadow shrinks the barrier by 20% and adds Daze.',
      'Stunning it turns Shadow stacks into Laceration: lower Anomaly Buildup RES and a higher Stun DMG multiplier until the Stun ends.',
      'Parries during the smashes after the barrier, a Chain Parry on the final slam, and breaking the barrier all give Performance Points.',
    ],
  },
  buffs: [
    {
      id: 'da-1',
      name: 'Buff 1',
      text: [
        'With 2 or 3 Anomaly Agents in the squad, the squad’s Anomaly Proficiency increases by 20 or 50.',
        'When an Anomaly Agent deals Attribute Anomaly DMG and lands a CRIT, the squad’s Attribute Anomaly DMG increases by 20% and Fire Attribute Anomaly DMG by a further 10% for 15s. Repeated triggers reset the duration.',
      ],
      favors: { specialty: { anomaly: 2 }, attribute: { fire: 1 }, anomalyPair: true },
    },
    {
      id: 'da-2',
      name: 'Buff 2',
      text: [
        'Daze dealt by Stun Agents increases by 20%, and their Energy Generation by 20%.',
        'After an Agent uses an EX Special Attack or Special Attack, Sharp DMG (for Armorer Agents) increases by 30% and their attacks ignore 20% of the target’s Electric and Ether RES for 15s. Repeated triggers reset the duration.',
      ],
      // Sharp DMG is the Armorer part (Claret for now).
      favors: { specialty: { stun: 1, armorer: 2 }, attribute: { electric: 1.5, ether: 1.5 } },
    },
    {
      id: 'da-3',
      name: 'Buff 3',
      text: [
        'Daze dealt by Stun Agents increases by 15%. After hitting a Stunned enemy, its Stun recovery slows by 10% for 15s. Repeated triggers reset the duration.',
        'Attribute Anomaly DMG increases by 15%, and by a further 25% against Stunned enemies.',
      ],
      favors: { specialty: { stun: 1.5, anomaly: 1.5 }, anyAttribute: true },
    },
  ],
  bosses: [
    {
      id: 'da-3-3-1-1',
      name: 'The Blasphemer',
      isNew: true,
      art: 'enemies/da-3-3-1-1.webp',
      weak: ['fire'],
      resist: ['ice'],
      gimmicks: [
        'Attacking her raises Anomaly Buildup Rate by 10%.',
        'Each Attribute Anomaly applied adds 1 Afterglow Mark. At 3 marks, or when she’s Stunned, she enters Wax Wings for 30s.',
        'During Wax Wings she takes 30% more Attribute Anomaly DMG, and each Anomaly adds 5% Daze instead of a mark: save your Anomaly bursts for it.',
      ],
      // In order of cleared runs this rotation (best first).
      ranked: true,
      picks: [
        ['phoenix-reffaella', 'velina-airgid', 'remielle-dan'],
        ['burnice-white', 'velina-airgid', 'remielle-dan'],
        ['evelyn-chevalier', 'norma-hollowell', 'astra-yao'],
      ],
    },
    {
      id: 'da-3-3-1-2',
      name: 'Unknown Corruption Complex',
      type: 'Ethereal',
      art: 'enemies/da-3-3-1-2.webp',
      weak: ['electric', 'ether'],
      resist: [],
      gimmicks: [
        'Deal enough DMG to its legs to break them: it becomes Impaired.',
        'Each broken leg restores 1,000 Decibels and adds 1 Disintegration stack (up to 4, for 20s).',
        'Each Disintegration stack gives +25% CRIT DMG against it (up to +100%), so break legs before big bursts.',
      ],
      // Hand-picked teams, shown before the site's own suggestions.
      picks: [
        ['pyrois', 'dialyn', 'nicole-demara'],
        ['claret-flint', 'roxy-ifrita-pryce', 'alexandrina-sebastiane'],
        ['soldier-0-anby', 'trigger', ['seed', 'orphie-magnusson-and-magus']],
      ],
    },
    {
      id: 'da-3-3-1-3',
      name: 'Discordant Solo – Vesper',
      type: 'Machine',
      art: 'enemies/da-3-3-1-3.webp',
      weak: ['wind', 'ether'],
      resist: ['ice', 'fire'],
      gimmicks: [
        'Anomaly Buildup Rate +15%, and she takes 30% more Anomaly DMG.',
        'During an Ether Veil, her Stun DMG Multiplier rises by 30%.',
        'Control Skill: she glows purple with no attack cues. Dodge the first hit, then Defensive Assist the next 4; wait for the leap on the last one before you Assist.',
        'Off-screen attack: a charged slam, three quick slashes from off the stage, then another slam. Dodge these and save Assist Points for the Control Skill.',
      ],
      // In order of cleared runs this rotation (best first): the full Angels of Delusion squad leads.
      ranked: true,
      // The Angels of Delusion squad does best with Buff 3.
      buff: 'da-3',
      picks: [
        ['aria', 'nangong-yu', 'sunna'],
        ['aria', 'velina-airgid', 'remielle-dan'],
        ['vivian-banshee', 'jane-doe', 'ukinami-yuzuha'],
        ['yixuan', 'dialyn', 'lucia-elowen'],
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
