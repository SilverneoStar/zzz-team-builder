// What's known about upcoming Agents before release: teams shown by HoYoverse
// (official reveals, livestream gameplay) and teams that follow from them, plus
// the expected build style. Replaced by the full build data once they're out.
export const UPCOMING = {

  'severian-lowell': {
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
      { members: ['severian-lowell', 'roxy-ifrita-pryce', 'astra-yao'], source: 'Estimate: Wind Stun partner' },
    ],
  },
};
