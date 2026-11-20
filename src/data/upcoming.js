// What's known about upcoming Agents before release: teams shown by HoYoverse
// (official reveals, livestream gameplay) and teams that follow from them, plus
// the expected build style. Replaced by the full build data once they're out.
export const UPCOMING = {

  kafka: {
    // Default Bangboo for her teams until a better fit is known.
    bangboo: ['booressure', 'snap'],
    // Kit shown in the 3.4 Special Program (Hunter's Overture, Lightning Surge,
    // Disorder); build from beta information shared by fan sites.
    style:
      'Electric Anomaly Agent built around Disorder. In Hunter’s Overture she chooses slashes (direct DMG) or shots (faster Anomaly buildup); slashes on an Anomaly-afflicted enemy trigger Lightning Surge. Build Anomaly Proficiency, with enough Energy Regen to keep EX Specials coming.',
    engines: ['kafka-signature', 'timeweaver', 'fusion-compiler', 'weeping-gemini', 'rainforest-gourmet', 'electro-lip-gloss'],
    trial: {
      source: 'Beta + estimate',
      fourPiece: ['freedom-blues', 'chaos-jazz'],
      twoPiece: ['swing-jazz', 'moonlight-lullaby', 'freedom-blues'],
      main: { 4: 'Anomaly Proficiency', 5: 'Electric DMG > ATK %', 6: 'Energy Regen > ATK %' },
      substats: 'Anomaly Proficiency > ATK % > PEN (estimate)',
      skills: ['core', 'special', 'basic', 'chain', 'assist', 'dodge'],
      notes: [
        'Her EX Special Attack is the centre of her kit, so Energy Regen keeps it coming; extra Energy Regen also turns into Anomaly Mastery.',
        'Freedom Blues 4-piece cuts the enemy’s Anomaly Buildup RES after her EX Special hits; Chaos Jazz is the personal-damage option.',
        'Her signature, Requiem Araneae, is also in the Filmgoer Thank-You Gift’s W-Engine choice.',
      ],
    },
    teams: [
      { members: ['kafka', 'ukinami-yuzuha', 'nangong-yu'], source: 'Beta clears' },
      { members: ['kafka', 'vivian-banshee', 'ukinami-yuzuha'], source: 'Beta clears' },
      { members: ['kafka', 'remielle-dan', 'ukinami-yuzuha'], source: 'Beta clears' },
      { members: ['kafka', 'velina-airgid', 'remielle-dan'], source: 'Estimate · like Aria and Phoenix' },
      { members: ['kafka', 'velina-airgid', 'ukinami-yuzuha'], source: 'Estimate · like Yanagi and Promeia' },
      { members: ['kafka', 'nangong-yu', 'sunna'], source: 'Estimate · like Aria' },
    ],
  },

  sunbringer: {
    // From beta information shared by fan sites (marked Beta on the site).
    // Parts not shown in the beta (alternatives, substats, skill order, ranges,
    // how to play) are estimates from her kit and from Claret, who builds alike.
    style:
      'Armorer whose Sharp DMG scales with DEF. Build CRIT Rate, Fire DMG and DEF: her Core Passive turns CRIT DMG into extra CRIT Rate.',
    // Her signature, then DEF and CRIT Rate Armorer W-Engines (estimate).
    engines: ['sunbringer-signature', 'crimson-thirst', 'bloodmarrow-coffer', 'candlelit-scheme', 'catty-luck'],
    trial: {
      source: 'Beta + estimate',
      fourPiece: ['rank-stele', 'thorned-rose'],
      twoPiece: ['soul-rock', 'thorned-rose', 'branch-and-blade-song', 'woodpecker-electro', 'inferno-metal'],
      main: { 4: 'CRIT Rate > CRIT DMG', 5: 'Fire DMG > PEN Ratio', 6: 'DEF %' },
      substats: 'CRIT Rate > CRIT DMG > DEF % > PEN > DEF (estimate)',
      skills: ['core', 'special', 'chain', 'basic', 'assist', 'dodge'],
      targets: [
        'DEF about 2,200–2,400+, like Claret',
        'CRIT Rate 120%+ in combat: Armorers roll CRIT twice (up to 200%), and Midnight Sun adds +40%',
      ],
      notes: [
        '4-piece Rank Stele plus 2-piece Soul Rock gives +32% DEF in total.',
        'Thorned Rose is the stand-in 4-piece until Rank Stele is farmed: DMG +15%, and more CRIT Rate once her DEF is high.',
        'Midnight Sun gives +40% CRIT Rate in combat, and each 1% CRIT DMG adds 0.35% CRIT Rate, so CRIT DMG is never wasted on her.',
        'Maim from other Armorer Agents (like Claret) feeds her Willpower.',
      ],
      guide: [
        'Open with an EX Special Attack: it switches on her signature’s Enhance (Fire DMG +20%, Fire Sharp DMG +10%) for 25s. Use another before it runs out.',
        'Bring Robin in first so her shield is up: with her signature, every shield gives the squad Laceration DMG +16%.',
        'Let the Stunner build Daze. Roxy with Crimson Wing Nocturne gives the whole squad Sharp DMG +8% when she uses an EX Special or Chain Attack at 50%+ CRIT Rate.',
        'Spend the Stun window on Sunbringer: Chain Attack, Ultimate, then EX Specials.',
        'With Claret as the third member, Claret’s Maim feeds Sunbringer’s Willpower, and Sunbringer’s Laceration Enhance boosts Claret back.',
      ],
    },
    teams: [
      // Beta test teams, best score first. Robin's and Sunbringer's abilities both switch on
      // with the third member, so the third member and their setup decide the order.
      { members: ['sunbringer', 'ju-fufu', 'robin-hsr'], source: 'Beta', setup: 'Ju Fufu with her Potential unlocked and Norma’s Chief Sidekick', potential: ['ju-fufu'], gear: { 'ju-fufu': 'chief-sidekick' } },
      { members: ['sunbringer', 'roxy-ifrita-pryce', 'robin-hsr'], source: 'Beta', setup: 'Roxy with her signature Crimson Moon Casket and the new 3.4 Drive Disc set Crimson Wing Nocturne', setupArt: 'discs/crimson-wing-nocturne.webp', gear: { 'roxy-ifrita-pryce': 'crimson-moon-casket' } },
      { members: ['sunbringer', 'norma-hollowell', 'robin-hsr'], source: 'Beta', setup: 'Norma with her signature Chief Sidekick (also seen in 3.4 gameplay)', gear: { 'norma-hollowell': 'chief-sidekick' } },
      { members: ['sunbringer', 'ju-fufu', 'robin-hsr'], source: 'Beta', setup: 'Ju Fufu with her Potential unlocked and her signature Roaring Fur-nace', potential: ['ju-fufu'], gear: { 'ju-fufu': 'roaring-fur-nace' } },
      { members: ['sunbringer', 'claret-flint', 'robin-hsr'], source: 'Beta' },
    ],
  },

  'robin-hsr': {
    // From beta information shared by fan sites (marked Beta on the site).
    // Alternatives, substats, skill order, ranges and how to play are estimates.
    // Default Bangboo for her teams until a better fit is known.
    bangboo: ['booressure', 'snap'],
    style:
      'Ether Defense Agent who shields the squad from off-field and buffs shielded Agents\u2019 DMG. Her shields and hits scale with Max HP, so build HP.',
    engines: ['robin-hsr-signature', 'half-sugar-bunny', 'original-transmorpher', 'bunny-band', 'spring-embrace'],
    trial: {
      source: 'Beta + estimate',
      fourPiece: ['bunny-in-wonderland', 'proto-punk'],
      twoPiece: ['yunkui-tales', 'swing-jazz', 'proto-punk'],
      main: { 4: 'HP % > CRIT Rate', 5: 'HP % > Ether DMG', 6: 'HP % > Energy Regen' },
      substats: 'HP % > HP > CRIT Rate > CRIT DMG (estimate)',
      skills: ['core', 'special', 'assist', 'chain', 'basic', 'dodge'],
      targets: [
        'Max HP as high as you can: her shields and hits scale with it',
        'Enough Energy for Enhanced Aftershock: Swing Jazz 2-piece or Energy Regen on slot 6 if she runs short',
      ],
      notes: [
        'She works mostly off-field: Robin Exit puts her in Off-Field Guard, her Aftershocks build Entry Points, and Robin Entrance comes back in at 100.',
        'Use Swing Jazz instead of Yunkui Tales if she runs short of Energy for Enhanced Aftershock.',
        'Proto Punk is the fallback 4-piece: it also rewards Defensive Assists, and its 2-piece makes shields 15% stronger.',
        'Pairs well with Armorer Agents: their Maim gives her Energy.',
      ],
      guide: [
        'Start with Robin: use her EX Special Attack to shield the squad (this also builds Bunny in Wonderland stacks), then switch out.',
        'Robin Exit puts her in Off-Field Guard. While the on-field Agent attacks, her Aftershocks hit and build Entry Points.',
        'At 100 Entry Points, Robin Entrance brings her back: refresh the shield and switch out again.',
        'Keep both signature buffs running: each shield gives the squad Laceration DMG +16%, and each Aftershock squad DMG +10% (up to 2 stacks).',
        'Her best partners are Armorers like Sunbringer and Claret: their Maim gives her Energy, and her Laceration buff boosts their damage.',
      ],
    },
    teams: [
      // Beta test teams, best score first. Robin's and Sunbringer's abilities both switch on
      // with the third member, so the third member and their setup decide the order.
      { members: ['sunbringer', 'ju-fufu', 'robin-hsr'], source: 'Beta', setup: 'Ju Fufu with her Potential unlocked and Norma’s Chief Sidekick', potential: ['ju-fufu'], gear: { 'ju-fufu': 'chief-sidekick' } },
      { members: ['sunbringer', 'roxy-ifrita-pryce', 'robin-hsr'], source: 'Beta', setup: 'Roxy with her signature Crimson Moon Casket and the new 3.4 Drive Disc set Crimson Wing Nocturne', setupArt: 'discs/crimson-wing-nocturne.webp', gear: { 'roxy-ifrita-pryce': 'crimson-moon-casket' } },
      { members: ['sunbringer', 'norma-hollowell', 'robin-hsr'], source: 'Beta', setup: 'Norma with her signature Chief Sidekick (also seen in 3.4 gameplay)', gear: { 'norma-hollowell': 'chief-sidekick' } },
      { members: ['sunbringer', 'ju-fufu', 'robin-hsr'], source: 'Beta', setup: 'Ju Fufu with her Potential unlocked and her signature Roaring Fur-nace', potential: ['ju-fufu'], gear: { 'ju-fufu': 'roaring-fur-nace' } },
      { members: ['sunbringer', 'claret-flint', 'robin-hsr'], source: 'Beta' },
      { members: ['kafka', 'nangong-yu', 'robin-hsr'], source: 'Estimate · collab pair' },
      { members: ['claret-flint', 'roxy-ifrita-pryce', 'robin-hsr'], source: 'Estimate · Armorer team' },
    ],
  },
};
