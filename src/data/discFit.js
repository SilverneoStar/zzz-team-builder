// What each Drive Disc set actually gives, for the synergy score's Build fit
// check: the stat on its 2-piece bonus, and what its 4-piece effect boosts
// (and who it needs). Read from the set text in data/driveDiscs.js.
//
// Stat keys: atk, hp, def, critRate, critDmg, ap (Anomaly Proficiency),
// am (Anomaly Mastery), pen, er (Energy Regen), impact, daze, shield,
// el:<attribute> (that attribute's DMG), and general ones that suit anyone:
// dmg, team (a squad buff), basic, ultimate, aftershock, survive.
export const SET_FIT = {
  'astral-voice': { two: 'atk', four: ['team'] },
  'branch-and-blade-song': { two: 'critDmg', four: ['critDmg', 'critRate'] },
  'bunny-in-wonderland': { two: 'hp', four: ['team'], needs: 'defense' },
  'chaos-jazz': { two: 'ap', four: ['el:fire', 'el:electric'] },
  'chaotic-metal': { two: 'el:ether', four: ['critDmg'] },
  'dawns-bloom': { two: 'basic', four: ['basic'] },
  'fanged-metal': { two: 'el:physical', four: ['dmg'] },
  'feathered-fate': { two: 'ap', four: ['ap'] },
  'freedom-blues': { two: 'ap', four: ['ap'] },
  'hormone-punk': { two: 'atk', four: ['atk'] },
  'inferno-metal': { two: 'el:fire', four: ['critRate'] },
  'king-of-the-summit': { two: 'daze', four: ['team'], needs: 'stun' },
  'moonlight-lullaby': { two: 'er', four: ['team'], needs: 'support' },
  'notes-from-the-chained': { two: 'el:ice', four: ['ap'] },
  'phaethons-melody': { two: 'am', four: ['ap'] },
  'polar-metal': { two: 'el:ice', four: ['basic'] },
  'proto-punk': { two: 'shield', four: ['team'] },
  'puffer-electro': { two: 'pen', four: ['ultimate', 'atk'] },
  'shadow-harmony': { two: 'aftershock', four: ['aftershock'] },
  'shining-aria': { two: 'el:ether', four: ['ap'] },
  'shockstar-disco': { two: 'impact', four: ['daze'] },
  'soul-rock': { two: 'def', four: ['survive'] },
  'swing-jazz': { two: 'er', four: ['team'] },
  'the-sky-ablaze': { two: 'el:ether', four: ['critDmg', 'atk'], needs: 'ether' },
  'thorned-rose': { two: 'def', four: ['dmg', 'critRate'] },
  'thunder-metal': { two: 'el:electric', four: ['atk'] },
  'white-water-ballad': { two: 'el:physical', four: ['critRate', 'atk'] },
  'woodpecker-electro': { two: 'critRate', four: ['atk'] },
  'wuthering-salon': { two: 'el:wind', four: ['ap'] },
  'yunkui-tales': { two: 'hp', four: ['critRate'] },
};

// Plain names for the breakdown.
export const STAT_NAME = {
  atk: 'ATK',
  hp: 'HP',
  def: 'DEF',
  critRate: 'CRIT Rate',
  critDmg: 'CRIT DMG',
  ap: 'Anomaly Proficiency',
  am: 'Anomaly Mastery',
  pen: 'PEN Ratio',
  er: 'Energy Regen',
  impact: 'Impact',
  daze: 'Daze',
  shield: 'shields',
};
