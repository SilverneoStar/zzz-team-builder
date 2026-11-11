// What's known about upcoming Agents before release: teams shown by HoYoverse
// (official reveals, livestream gameplay) and teams that follow from them, plus
// the expected build style. Replaced by the full build data once they're out.
export const UPCOMING = {

  kafka: {
    // Default Bangboo for her teams until a better fit is known.
    bangboo: ['booressure', 'snap'],
    // Only her drip marketing is out (Electric, Anomaly), so this whole build is
    // an estimate from Anomaly Agents who play alike (Aria, Phoenix and Promeia,
    // plus the Electric ones, Yanagi and Grace) until her kit is revealed.
    style:
      'Electric Anomaly Agent. Until her kit is shown, build her like other Anomaly carries: Anomaly Proficiency first, Electric DMG on slot 5 and Anomaly Mastery on slot 6.',
    // Her signature (beta), then the best Anomaly W-Engines in general, then free options.
    engines: ['kafka-signature', 'fusion-compiler', 'timeweaver', 'angel-in-the-shell', 'flight-of-fancy', 'weeping-gemini', 'electro-lip-gloss'],
    trial: {
      source: 'Estimated from similar Anomaly Agents',
      fourPiece: ['phaethons-melody', 'thunder-metal', 'chaos-jazz'],
      twoPiece: ['thunder-metal', 'freedom-blues', 'phaethons-melody', 'puffer-electro', 'chaos-jazz'],
      main: { 4: 'Anomaly Proficiency', 5: 'Electric DMG > PEN Ratio / ATK %', 6: 'Anomaly Mastery / ATK %' },
      substats: 'Anomaly Proficiency > ATK % > PEN > ATK',
      notes: [
        'Anomaly Proficiency raises her Attribute Anomaly damage (Shock and Disorder); Anomaly Mastery builds Shock faster.',
        'Phaethon’s Melody suits an on-field Anomaly carry like Aria; Thunder Metal or Chaos Jazz are the Electric options Yanagi and Grace use.',
        'Swap in her signature W-Engine and her own set once they’re revealed.',
      ],
    },
    teams: [
      { members: ['kafka', 'nangong-yu', 'ukinami-yuzuha'], source: 'Estimate · like Aria and Grace' },
      { members: ['kafka', 'velina-airgid', 'remielle-dan'], source: 'Estimate · like Aria and Phoenix' },
      { members: ['kafka', 'velina-airgid', 'ukinami-yuzuha'], source: 'Estimate · like Yanagi and Promeia' },
      { members: ['kafka', 'nangong-yu', 'sunna'], source: 'Estimate · like Aria' },
    ],
  },

  sunbringer: {
    // From beta information shared by fan sites (marked Beta on the site).
    beta: true,
    style:
      'Armorer whose Sharp DMG scales with DEF. Build CRIT Rate, Fire DMG and DEF: her Core Passive turns CRIT DMG into extra CRIT Rate.',
    engines: ['sunbringer-signature'],
    trial: {
      source: 'Beta',
      fourPiece: [],
      newFourPiece: 'Her own new 4-piece set (name not shown yet): CRIT Rate +12%, Fire Sharp DMG ignores 16% of enemy DEF.',
      newFourPieceArt: 'discs/beta/sunbringer-set.webp',
      twoPiece: ['soul-rock'],
      main: { 4: 'CRIT Rate', 5: 'Fire DMG', 6: 'DEF %' },
      substats: 'Not shown yet',
      notes: [
        'Her new 4-piece set plus 2-piece Soul Rock gives +32% DEF in total.',
        'Midnight Sun gives +40% CRIT Rate in combat, and each 1% CRIT DMG adds 0.35% CRIT Rate.',
        'Maim from other Armorer Agents (like Claret) feeds her Willpower.',
      ],
    },
    teams: [
      // Beta test teams, best score first. Robin's and Sunbringer's abilities both switch on
      // with the third member, so the third member and their setup decide the order.
      { members: ['sunbringer', 'ju-fufu', 'robin-hsr'], source: 'Beta', setup: 'Ju Fufu with her Potential unlocked and Norma’s Chief Sidekick', potential: ['ju-fufu'] },
      { members: ['sunbringer', 'roxy-ifrita-pryce', 'robin-hsr'], source: 'Beta', setup: 'Roxy with her signature Crimson Moon Casket and the new 3.4 Drive Disc set', setupArt: 'discs/beta/roxy-set.webp' },
      { members: ['sunbringer', 'norma-hollowell', 'robin-hsr'], source: 'Beta', setup: 'Norma with her signature Chief Sidekick (also seen in 3.4 gameplay)' },
      { members: ['sunbringer', 'ju-fufu', 'robin-hsr'], source: 'Beta', setup: 'Ju Fufu with her Potential unlocked and her signature Roaring Fur-nace', potential: ['ju-fufu'] },
      { members: ['sunbringer', 'claret-flint', 'robin-hsr'], source: 'Beta' },
    ],
  },

  'robin-hsr': {
    // From beta information shared by fan sites (marked Beta on the site).
    beta: true,
    // Default Bangboo for her teams until a better fit is known.
    bangboo: ['booressure', 'snap'],
    style:
      'Ether Defense Agent who shields the squad from off-field and buffs shielded Agents\u2019 DMG. Her shields and hits scale with Max HP, so build HP.',
    engines: ['robin-hsr-signature', 'original-transmorpher', 'spring-embrace', 'bunny-band'],
    trial: {
      source: 'Beta',
      fourPiece: ['bunny-in-wonderland'],
      twoPiece: ['yunkui-tales', 'swing-jazz'],
      main: { 4: 'HP % > CRIT Rate', 5: 'HP % > Ether DMG', 6: 'HP % > Energy Regen' },
      substats: 'HP % > HP',
      notes: [
        'She works mostly off-field: Robin Exit puts her in Off-Field Guard, her Aftershocks build Entry Points, and Robin Entrance comes back in at 100.',
        'Use Swing Jazz instead of Yunkui Tales if she runs short of Energy for Enhanced Aftershock.',
        'Pairs well with Armorer Agents: their Maim gives her Energy.',
      ],
    },
    teams: [
      // Beta test teams, best score first. Robin's and Sunbringer's abilities both switch on
      // with the third member, so the third member and their setup decide the order.
      { members: ['sunbringer', 'ju-fufu', 'robin-hsr'], source: 'Beta', setup: 'Ju Fufu with her Potential unlocked and Norma’s Chief Sidekick', potential: ['ju-fufu'] },
      { members: ['sunbringer', 'roxy-ifrita-pryce', 'robin-hsr'], source: 'Beta', setup: 'Roxy with her signature Crimson Moon Casket and the new 3.4 Drive Disc set', setupArt: 'discs/beta/roxy-set.webp' },
      { members: ['sunbringer', 'norma-hollowell', 'robin-hsr'], source: 'Beta', setup: 'Norma with her signature Chief Sidekick (also seen in 3.4 gameplay)' },
      { members: ['sunbringer', 'ju-fufu', 'robin-hsr'], source: 'Beta', setup: 'Ju Fufu with her Potential unlocked and her signature Roaring Fur-nace', potential: ['ju-fufu'] },
      { members: ['sunbringer', 'claret-flint', 'robin-hsr'], source: 'Beta' },
      { members: ['kafka', 'nangong-yu', 'robin-hsr'], source: 'Estimate · collab pair' },
      { members: ['claret-flint', 'roxy-ifrita-pryce', 'robin-hsr'], source: 'Estimate · Armorer team' },
    ],
  },
};
