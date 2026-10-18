// Kit mechanics that tie Agents together beyond specialty, attribute and
// faction. Each mechanic has a provider side (opens or deals it) and a payoff
// side (gets stronger from a squadmate's). A squad has the link when one
// member is on the payoff side and a different member is a provider.
// Compiled from the Agents' skill text on the Zenless Zone Zero Wiki
// (October 2026); see NOTICE.md.
export const MECHANICS = {
  'ether-veil': {
    name: 'Ether Veil',
    provider: 'Opens an Ether Veil',
    payoff: 'Stronger with Ether Veils',
    blurb:
      'A field some Agents open with their skills. Several Agents gain resources when a squadmate opens one, or get stronger while inside any Ether Veil.',
  },
  aftershock: {
    name: 'Aftershock',
    provider: 'Deals Aftershock DMG',
    payoff: 'Boosts squad Aftershock DMG',
    blurb: 'Follow-up hits from off-field Agents. A few Agents raise the Aftershock DMG of the whole squad.',
  },
};

// [mechanic, side, what the kit does]. `veil` limits a payoff to one kind of
// Ether Veil, and names the one a provider opens.
export const KIT_LINKS = {
  // Ether Veil
  aria: [
    { mechanic: 'ether-veil', side: 'provider', veil: 'Delusion Reprise', text: 'Opens Ether Veil: Delusion Reprise (squad ATK up).' },
    { mechanic: 'ether-veil', side: 'payoff', text: 'Additional Ability: generates Fandom Power when an Ether Veil is activated.' },
  ],
  cissia: [{ mechanic: 'ether-veil', side: 'provider', veil: 'Cold-Blooded', text: 'Opens Ether Veil: Cold-Blooded.' }],
  'lucia-elowen': [
    { mechanic: 'ether-veil', side: 'provider', veil: 'Wellspring', text: 'Opens Ether Veil: Wellspring (squad Max HP up).' },
    { mechanic: 'ether-veil', side: 'payoff', text: 'Inside any Ether Veil, her ATK scales with Max HP and Harmony always CRITs.' },
    { mechanic: 'aftershock', side: 'provider', text: 'Several skills deal Aftershock DMG.' },
  ],
  'nangong-yu': [{ mechanic: 'ether-veil', side: 'provider', veil: 'Delusion Reprise', text: 'Opens Ether Veil: Delusion Reprise (squad ATK up).' }],
  sunna: [
    { mechanic: 'ether-veil', side: 'provider', veil: 'Delusion Reprise', text: 'Opens Ether Veil: Delusion Reprise (squad ATK up).' },
    { mechanic: 'ether-veil', side: 'payoff', text: 'Gains Claw Sharpeners when any squad member activates an Ether Veil, and gives the squad ATK while inside any Ether Veil.' },
  ],
  'ye-shunguang': [
    { mechanic: 'ether-veil', side: 'provider', veil: 'Verdict', text: 'Opens Ether Veil: Verdict in the Enlightened Mind state.' },
    { mechanic: 'ether-veil', side: 'payoff', text: 'Additional Ability: gains Qingming Sword Force when a squadmate activates any Ether Veil.' },
  ],
  'yidhari-murphy': [
    { mechanic: 'ether-veil', side: 'provider', veil: 'Wellspring', text: 'Opens Ether Veil: Wellspring (squad Max HP up).' },
    { mechanic: 'ether-veil', side: 'payoff', veil: 'Wellspring', text: 'Hits harder and charges faster inside Ether Veil: Wellspring.' },
  ],
  zhao: [
    { mechanic: 'ether-veil', side: 'provider', veil: 'Wellspring', text: 'Opens Ether Veil: Wellspring (squad ATK up).' },
    { mechanic: 'ether-veil', side: 'payoff', text: 'Additional Ability: squad DMG up while she is inside any Ether Veil.' },
  ],

  // Aftershock
  'pulchra-fellini': [
    { mechanic: 'aftershock', side: 'provider', text: 'Some of her attacks are Aftershocks.' },
    { mechanic: 'aftershock', side: 'payoff', text: 'Binding Trap raises all units’ Aftershock DMG against the target.' },
  ],
  'soldier-0-anby': [
    { mechanic: 'aftershock', side: 'provider', text: 'Her hits trigger Aftershocks on Silver Star targets.' },
    { mechanic: 'aftershock', side: 'payoff', text: 'Raises the squad’s Aftershock DMG and Aftershock CRIT DMG against Silver Star targets.' },
  ],
  'orphie-magnusson-and-magus': [
    { mechanic: 'aftershock', side: 'provider', text: 'Most of her skills count as Aftershock DMG.' },
    { mechanic: 'aftershock', side: 'payoff', text: 'Zeroed In gives the squad ATK, extended by Aftershocks; Additional Ability makes their Aftershocks ignore DEF.' },
  ],
  trigger: [{ mechanic: 'aftershock', side: 'provider', text: 'Her Harmonizing Shots are Aftershocks.' }],
  'ju-fufu': [{ mechanic: 'aftershock', side: 'provider', text: 'Has an Aftershock attack.' }],
  'ukinami-yuzuha': [{ mechanic: 'aftershock', side: 'provider', text: 'Hard Candy Shot is an Aftershock.' }],
};
