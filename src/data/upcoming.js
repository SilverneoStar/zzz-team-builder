// What's known about upcoming Agents before release: teams shown by HoYoverse
// (official reveals, livestream gameplay) and teams that follow from them, plus
// the expected build style. Replaced by the full build data once they're out.
export const UPCOMING = {

  'severian-lowell': {
    // His kit is in the game files ahead of his 3.3 phase 2 release, so nothing here is an estimate.
    confirmed: true,
    style:
      'CRIT-based Wind Attack Agent whose enhanced Basic Attacks do most of the damage.',
    engines: ['sin-ban-cage', 'sol-exuvia', 'the-brimstone', 'marcato-desire'],
    // From his 3.3 trial (Virtual Annihilation Operation) and community guides.
    trial: {
      source: '3.3 trial and guides',
      fourPiece: ['dawns-bloom'],
      // Woodpecker Electro keeps his CRIT balanced; Puffer Electro when using his signature W-Engine.
      twoPiece: ['woodpecker-electro', 'puffer-electro'],
      notes: [
        'CRIT Rate is the key stat: it converts into ATK, up to 100% CRIT Rate.',
        'His signature W-Engine gives +20% CRIT Rate in combat, so aim for about 80% from discs and substats (hard with discs alone, so its advanced stat may also be CRIT Rate).',
        'Enhanced Basic Attacks hit very hard, with multipliers up to around 4000%.',
        'PEN Ratio works well too. Damage bonus comes from Dawn’s Bloom and his Core Skill, and ATK from the CRIT Rate conversion.',
        'Use 2-piece Puffer Electro with his signature W-Engine (it covers his CRIT Rate); otherwise Woodpecker Electro.',
      ],
    },
    teams: [
      { members: ['severian-lowell', 'norma-hollowell', 'astra-yao'], source: '3.3 livestream gameplay' },
      { members: ['severian-lowell', 'roxy-ifrita-pryce', 'sunna'], source: 'Community guides' },
      { members: ['severian-lowell', 'dialyn', 'sunna'], source: 'Community guides' },
    ],
  },

  kafka: {
    // Default Bangboo for her teams until a better fit is known.
    bangboo: ['booressure', 'snap'],
    // Only her drip marketing is out (Electric, Anomaly), so this whole build is
    // an estimate from Anomaly Agents who play alike (Aria, Phoenix and Promeia,
    // plus the Electric ones, Yanagi and Grace) until her kit is revealed.
    style:
      'Electric Anomaly Agent. Until her kit is shown, build her like other Anomaly carries: Anomaly Proficiency first, Electric DMG on slot 5 and Anomaly Mastery on slot 6.',
    // No signature W-Engine shown yet: the best Anomaly W-Engines in general, then free options.
    engines: ['fusion-compiler', 'timeweaver', 'angel-in-the-shell', 'flight-of-fancy', 'weeping-gemini', 'electro-lip-gloss'],
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
      { members: ['sunbringer', 'norma-hollowell', 'robin-hsr'], source: '3.4 Sunbringer gameplay' },
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
      { members: ['sunbringer', 'norma-hollowell', 'robin-hsr'], source: '3.4 Sunbringer gameplay' },
      { members: ['sunbringer', 'claret-flint', 'robin-hsr'], source: 'Beta' },
      { members: ['kafka', 'nangong-yu', 'robin-hsr'], source: 'Estimate · collab pair' },
      { members: ['claret-flint', 'roxy-ifrita-pryce', 'robin-hsr'], source: 'Estimate · Armorer team' },
    ],
  },
};
