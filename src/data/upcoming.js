// What's known about upcoming Agents before release: teams shown by HoYoverse
// (official reveals, livestream gameplay) and teams that follow from them, plus
// the expected build style. Replaced by the full build data once they're out.
export const UPCOMING = {
  'phoenix-reffaella': {
    // Community picks (videos): her signature, then engines that give the same kind of stats.
    engines: ['nirvana-s-first-plume', 'angel-in-the-shell', 'flight-of-fancy', 'fusion-compiler', 'electro-lip-gloss', 'weeping-gemini'],
    teams: [
      { members: ['phoenix-reffaella', 'velina-airgid', 'remielle-dan'], source: 'Official reveal' },
      { members: ['phoenix-reffaella', 'velina-airgid', 'ukinami-yuzuha'], source: 'Official reveal' },
    ],
  },
  'severian-lowell': {
    style:
      'CRIT-based Wind Attack Agent whose enhanced Basic Attacks do most of the damage.',
    // From his 3.3 trial in Virtual Annihilation Operation (official in-game trial).
    trial: {
      source: '3.3 trial (Virtual Annihilation Operation)',
      fourPiece: ['dawns-bloom'],
      twoPiece: ['puffer-electro'],
      notes: [
        'CRIT Rate is the key stat: it converts into ATK, up to 100% CRIT Rate.',
        'His signature W-Engine gives +20% CRIT Rate in combat, so aim for about 80% from discs and substats (hard with discs alone, so its advanced stat may also be CRIT Rate).',
        'Enhanced Basic Attacks hit very hard, with multipliers up to around 4000%.',
        'PEN Ratio works well too. Damage bonus comes from Dawn’s Bloom and his Core Skill, and ATK from the CRIT Rate conversion.',
      ],
    },
    teams: [
      { members: ['severian-lowell', 'norma-hollowell', 'astra-yao'], source: '3.3 livestream gameplay' },
      { members: ['severian-lowell', 'roxy-ifrita-pryce', 'astra-yao'], source: 'Estimate: Wind Stun partner' },
    ],
  },
};
