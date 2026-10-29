// Field time and Assists, for the synergy score (lib/synergy.js).
//
// OFF_FIELD: Agents whose kit keeps working after you switch away from them,
// so the main damage dealer gets more time on the field. `swaps` marks those
// who also trigger Quick Assists or Chain Attacks for squadmates. The text is
// taken from their kits in data/skills/.
export const OFF_FIELD = {
  'astra-yao': {
    text: 'stays on the field (invulnerable) in Idyllic Cadenza; her Chords trigger Quick Assists for the on-field Agent and her Ultimate turns the next 2 Quick Assists into Chain Attacks',
    swaps: true,
  },
  zhao: {
    text: 'invulnerable off-field; at full Frostbite Points she triggers a Quick Assist and keeps charging',
    swaps: true,
  },
  'pan-yinhu': {
    text: 'stays out using Touch of Death (invulnerable off-field) and his EX Special triggers the previous Agent’s Quick Assist',
    swaps: true,
  },
  trigger: { text: 'circles in for Harmonizing Shots (Aftershocks) whenever squadmates attack, so she rarely needs the field' },
  'ukinami-yuzuha': { text: 'her tanuki Kama joins the on-field Agent’s attacks while she’s off-field' },
  sunna: { text: 'Bubblegum attacks for her while she’s off-field' },
  'ju-fufu': { text: 'keeps spinning after you switch out and follows Chain Attacks with Suppressing Tiger Cauldron' },
  'orphie-magnusson-and-magus': { text: 'fires Crimson Vortex lasers off-field during squadmates’ attacks' },
  'luciana-de-montefio': { text: 'keeps her guard boars attacking with her stats while she’s off-field' },
  'vivian-banshee': { text: 'her Featherbloom strikes land even off-field' },
  'robin-hsr': { text: 'her Off-Field Guard keeps shielding the squad', beta: true },
};

// Agents whose Assist is an Evasive Assist (dodge, then Vital View) instead of
// a Defensive Assist (parry). Everyone else in data/skills/ parries, and a parry
// deals massive Daze, so a squad with no parry at all loses an easy way to
// Stun. Keep in line with the "Evasive Assist" entries in data/skills/.
export const EVASIVE_ASSIST = new Set([
  'alexandrina-sebastiane',
  'astra-yao',
  'billy-kid',
  'grace-howard',
  'pulchra-fellini',
  'zhu-yuan',
]);
