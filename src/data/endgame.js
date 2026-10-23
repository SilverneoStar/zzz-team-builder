// Endgame modes for the Ethereals tab: the current Deadly Assault and Shiyu
// Defense rotations. Only game facts are kept here (dates, weaknesses,
// resistances, buff effects); which teams fit is worked out by the site in
// lib/endgame.js from these facts and the community team list in builds.js.
//
// A boss or side can list `picks`: hand-picked teams shown first.
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
  // The extra boss for players who earn all 9 stars. Fill in once known.
  bonus: {
    title: 'Adversity',
    unlock: 'Unlocks once you earn all 9 stars (3 stars on each of the three bosses). Score = damage + Performance Points (capped at 5,000), with a 3-minute limit; your best score of the season is kept.',
    name: null,
    weak: [],
    resist: [],
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
        'After an Agent uses an EX Special Attack or Special Attack, Sharp DMG increases by 30% and their attacks ignore 20% of the target’s Electric and Ether RES for 15s. Repeated triggers reset the duration.',
      ],
      favors: { specialty: { stun: 1 }, attribute: { electric: 1.5, ether: 1.5 } },
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
    { id: 'da-3-3-1-1', name: 'The Blasphemer', isNew: true, art: 'enemies/da-3-3-1-1.webp', weak: ['fire'], resist: ['ice'] },
    {
      id: 'da-3-3-1-2',
      name: null,
      about: 'A returning Ethereal.',
      art: 'enemies/da-3-3-1-2.webp',
      weak: ['electric', 'ether'],
      resist: [],
      // Hand-picked teams, shown before the site's own suggestions.
      picks: [
        ['pyrois', 'dialyn', 'nicole-demara'],
        ['claret-flint', 'roxy-ifrita-pryce', 'alexandrina-sebastiane'],
        ['soldier-0-anby', 'trigger', 'seed'],
      ],
    },
    { id: 'da-3-3-1-3', name: null, about: 'A returning Ethereal based on Vespera, the intelligent construct.', art: 'enemies/da-3-3-1-3.webp', weak: ['wind', 'ether'], resist: ['ice', 'fire'] },
  ],
};

const STAGE_BASE = {
  id: 'sd-base',
  name: 'Frontier effect',
  text: [
    'Agent Sharp DMG +20%.',
    'After defeating normal enemies, Stun Agents restore 15 Energy.',
  ],
  favors: { specialty: { stun: 1 } },
};
const STAGE_PEN = {
  id: 'sd-pen',
  name: 'Stages 2–4',
  text: [
    'Basic Attack, Special Attack and Ultimate hits raise PEN Ratio by 10%.',
    'Hitting a Stunned enemy ignores 15% of its Electric RES.',
  ],
  favors: { specialty: { stun: 1 }, attribute: { electric: 1 } },
};

export const SHIYU_DEFENSE = {
  id: '2026-10-16',
  label: 'Shiyu Defense: Critical Node',
  start: '2026-10-16',
  end: '2026-10-29',
  note: 'Each side of a stage needs its own squad, so an Agent can’t be on two sides of the same stage.',
  // The extra challenge for players who score enough for S+ rank. Fill in once known.
  bonus: {
    title: 'S+ rating',
    unlock: 'S+ is the top season rating: clear all three Stage 5 rooms at S and reach at least 100,000 points in total. It unlocks the full Critical Node rewards.',
    name: null,
    weak: [],
    resist: [],
  },
  stages: [
    {
      n: 1,
      name: 'First Frontier',
      buffs: [
        STAGE_BASE,
        {
          id: 'sd-1',
          name: 'Stage 1',
          text: ['After an Agent’s Chain Attack hits an enemy, it recovers from Stun 15% slower for 15s. Repeated triggers reset the duration.'],
          favors: { specialty: { stun: 1 } },
        },
      ],
      sides: [
        { weak: ['wind', 'fire'], resist: [] },
        { weak: ['physical', 'fire'], resist: ['ether'] },
      ],
    },
    {
      n: 2,
      name: 'Second Frontier',
      buffs: [STAGE_BASE, STAGE_PEN],
      sides: [
        { weak: ['wind', 'ether'], resist: ['physical'] },
        { weak: ['physical', 'fire'], resist: ['ether'] },
      ],
    },
    {
      n: 3,
      name: 'Third Frontier',
      buffs: [STAGE_BASE, STAGE_PEN],
      sides: [
        { weak: ['wind', 'electric'], resist: [] },
        { weak: ['physical', 'fire'], resist: ['ice'] },
      ],
    },
    {
      n: 4,
      name: 'Fourth Frontier',
      buffs: [STAGE_BASE, STAGE_PEN],
      sides: [
        { weak: ['wind', 'ice'], resist: ['ether'] },
        { weak: ['fire', 'physical'], resist: ['ice'] },
      ],
    },
    {
      n: 5,
      name: 'Fifth Frontier',
      score: 'S-rank above 25,000 · A above 16,000 · B above 8,000 (all three rooms)',
      buffs: [],
      sides: [
        { weak: ['wind', 'electric'], resist: ['ice'], buffs: [STAGE_BASE, STAGE_PEN] },
        {
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
        },
        {
          weak: ['fire', 'physical'],
          resist: ['ice', 'wind'],
          buffs: [
            {
              id: 'sd-5-3',
              name: 'Room 3',
              text: ['Agent Fire and Ether DMG +15%, Sheer DMG +15%, Ultimate DMG +30%. Ultimates ignore 10% of the target’s All-Attribute RES.'],
              favors: { attribute: { fire: 1.5, ether: 1.5 }, specialty: { rupture: 1.5 } },
            },
          ],
        },
      ],
    },
  ],
};
