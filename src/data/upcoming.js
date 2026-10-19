// What's known about upcoming Agents before release: teams shown by HoYoverse
// (official reveals, livestream gameplay) and teams that follow from them, plus
// the expected build style. Replaced by the full build data once they're out.
export const UPCOMING = {
  'phoenix-reffaella': {
    // Community picks (videos): her signature, then engines that give the same kind of stats.
    engines: ['nirvana-s-first-plume', 'angel-in-the-shell', 'flight-of-fancy', 'fusion-compiler'],
    teams: [
      { members: ['phoenix-reffaella', 'velina-airgid', 'remielle-dan'], source: 'Official reveal' },
      { members: ['phoenix-reffaella', 'velina-airgid', 'ukinami-yuzuha'], source: 'Official reveal' },
    ],
  },
  'severian-lowell': {
    style:
      'CRIT-based Wind Attack Agent, expected to build like other CRIT damage dealers such as Sigrid and Pyrois.',
    teams: [
      { members: ['severian-lowell', 'norma-hollowell', 'astra-yao'], source: '3.3 livestream gameplay' },
      { members: ['severian-lowell', 'roxy-ifrita-pryce', 'astra-yao'], source: 'Estimate: Wind Stun partner' },
    ],
  },
};
