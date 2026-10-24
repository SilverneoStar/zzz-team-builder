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
};
