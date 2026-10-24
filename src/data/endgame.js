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

const ROOM_1 = {
  id: 'sd-5-1',
  name: 'Room 1',
  text: [
    'Agent Sharp DMG +20% (for Armorer Agents). After defeating normal enemies, Stun Agents restore 15 Energy.',
    'Basic Attack, Special Attack and Ultimate hits raise PEN Ratio by 10%. Hitting a Stunned enemy ignores 15% of its Electric RES.',
  ],
  // Sharp DMG is the Armorer part (Claret for now).
  favors: { specialty: { stun: 1, armorer: 3 }, attribute: { electric: 1 } },
};

export const SHIYU_DEFENSE = {
  id: '2026-10-16',
  label: 'Shiyu Defense: Critical Node',
  start: '2026-10-16',
  end: '2026-10-29',
  note: 'The score check is Stage 5: three rooms, each needing its own squad, so no Agent can be in two rooms.',
  stages: [
    {
      n: 5,
      name: 'Fifth Frontier',
      // Rank per room by score, best first.
      ranks: [['S', 25000], ['A', 18000], ['B', 8000]],
      // The top grade for the whole node.
      topRank: { rank: 'S+', total: 100000, need: 'S in all three rooms' },
      score: 'Each room caps at 50,000, and points scored earlier in the fight get a bigger multiplier.',
      buffs: [],
      sides: [
        {
          name: 'Metamorphosed Scorpse',
          waves: ['City Guardboo ×3', 'Special Anti-Riotboo ×1, Airspace Patrolboo ×2', 'Metamorphosed Scorpse'],
          tip: 'The Scorpse throws out Miasma pools; standing in them deals extra damage.',
          art: 'enemies/sd-5-1.webp',
          weak: ['wind', 'electric'],
          resist: ['ice'],
          buffs: [ROOM_1],
          picks: [
            ['claret-flint', 'roxy-ifrita-pryce', 'alexandrina-sebastiane'],
            ['soldier-0-anby', 'trigger', ['seed', 'orphie-magnusson-and-magus']],
            ['seed', 'trigger', 'cissia'],
          ],
        },
        {
          name: 'Miasmic Thracian',
          waves: ['Ionized – Farbauti, Ionized – Dullahan', 'Miasmic Thracian'],
          tip: 'When fully charged, the Thracian vanishes and rains spears (it can’t be hit then), then teleports back with an attack that tracks your active Agent.',
          art: 'enemies/sd-5-2.webp',
          weak: ['ether', 'wind'],
          resist: ['electric'],
          buffs: [
            {
              id: 'sd-5-2',
              name: 'Room 2',
              text: ['With 2 or 3 Anomaly Agents, Attribute Anomaly DMG rises by 10% or 60%, and the squad starts with 500 or 1,500 Decibels.'],
              favors: { specialty: { anomaly: 2 }, anomalyPair: true },
            },
          ],
          picks: [
            ['aria', 'velina-airgid', 'remielle-dan'],
            ['velina-airgid', 'phoenix-reffaella', 'jane-doe'],
            ['aria', 'nangong-yu', 'sunna'],
            ['vivian-banshee', 'jane-doe', 'ukinami-yuzuha'],
          ],
        },
        {
          name: 'Covenant Guardian',
          waves: ['Bulky Intimidator, Bulky Enforcer', 'Covenant Guardian'],
          tip: 'Its multi-hit attacks can each be parried.',
          art: 'enemies/sd-5-3.webp',
          weak: ['fire', 'physical'],
          resist: ['ice', 'wind'],
          buffs: [
            {
              id: 'sd-5-3',
              name: 'Room 3',
              text: ['Agent Fire and Ether DMG +15%, Sheer DMG +15% (for Rupture Agents), Ultimate DMG +30%. Ultimates ignore 10% of the target’s All-Attribute RES.'],
              // Sheer DMG +15% is the Rupture part: this room mainly rewards Rupture Agents.
              favors: { attribute: { fire: 1.5, ether: 1.5 }, specialty: { rupture: 4 } },
            },
          ],
          picks: [
            ['banyue', 'dialyn', 'lucia-elowen'],
            ['starlight-billy-kid', 'dialyn', 'lucia-elowen'],
          ],
        },
      ],
    },
  ],
};
