// What each Agent needs to reach level 60, max every skill and finish their
// Core Skill (A–F), and where to farm it. Every Agent's costs are the same;
// only the items change: the promotion seals follow their specialty, the
// skill chips their attribute, and each has their own Expert Challenge and
// Notorious Hunt drops. From the Zenless Zone Zero Wiki (October 2026);
// see NOTICE.md.

// [seal type, chip type, Higher Dimensional Data, Notorious Hunt drop]
export const AGENT_MATS = {
  'alexandrina-sebastiane': ["Support", "Shock", "Destructive Advance", "Finale Dance Shoes"],
  'alice-thymefield': ["Anomaly", "Physical", "Toxic Edge", "Sycophant's Refinement"],
  'anby-demara': ["Stun", "Shock", "Murderous Obituary", "Ferocious Grip"],
  'anton-ivanov': ["Attack", "Shock", "Destructive Advance", "Living Drive"],
  'aria': ["Anomaly", "Ether", "Falling Fist", "Clouded Crystalline Substance"],
  'asaba-harumasa': ["Attack", "Shock", "Thunderous Dragon", "Sycophant's Refinement"],
  'astra-yao': ["Support", "Ether", "Thunderous Dragon", "Finale Dance Shoes"],
  'banyue': ["Rupture", "Burn", "Miasmic Elytron", "Crimson Miasma Spike"],
  'ben-bigger': ["Defense", "Burn", "Steel Malice", "Living Drive"],
  'billy-kid': ["Attack", "Physical", "Ethereal Pursuit", "Ferocious Grip"],
  'burnice-white': ["Anomaly", "Burn", "Stealth Phantom", "Scarlet Engine"],
  'caesar-king': ["Defense", "Physical", "Stealth Phantom", "Scarlet Engine"],
  'cissia': ["Attack", "Shock", "Bloodstained Miasma Feather", "Exuvia of Refinement"],
  'claret-flint': ["Armorer", "Shock", "Imitation Core", "Counterfeit Nucleus"],
  'corin-wickes': ["Attack", "Physical", "Crimson Awe", "Finale Dance Shoes"],
  'dialyn': ["Stun", "Physical", "Stealth Phantom", "Exuvia of Refinement"],
  'ellen-joe': ["Attack", "Freeze", "Murderous Obituary", "Ferocious Grip"],
  'evelyn-chevalier': ["Attack", "Burn", "Steel Malice", "Scarlet Engine"],
  'grace-howard': ["Anomaly", "Shock", "Destructive Advance", "Living Drive"],
  'hoshimi-miyabi': ["Anomaly", "Freeze", "Thunderous Dragon", "Sycophant's Refinement"],
  'hugo-vlad': ["Attack", "Freeze", "Murderous Obituary", "Finale Dance Shoes"],
  'jane-doe': ["Anomaly", "Physical", "Falling Fist", "Ferocious Grip"],
  'ju-fufu': ["Stun", "Burn", "Miasmic Elytron", "Exuvia of Refinement"],
  'koleda-belobog': ["Stun", "Burn", "Steel Malice", "Living Drive"],
  'komano-manato': ["Rupture", "Burn", "Corrupted Dreamsteel", "Crimson Miasma Spike"],
  'lighter': ["Stun", "Burn", "Crimson Awe", "Scarlet Engine"],
  'lucia-elowen': ["Support", "Ether", "Corrupted Dreamsteel", "Crimson Miasma Spike"],
  'luciana-de-montefio': ["Support", "Burn", "Steel Malice", "Ferocious Grip"],
  // Released in 3.3.
  'phoenix-reffaella': ["Anomaly", "Burn", "Bloodstained Miasma Feather", "Counterfeit Nucleus"],
  // 3.3 phase 2 (data in the game already).
  'severian-lowell': ["Attack", "Windbite", "Imitation Core", "Timeworn Husk"],
  // Armorer seals and Fire (Burn) chips follow from her specialty and attribute;
  // Core Skill drops aren't announced yet.
  'sunbringer': ["Armorer", "Burn", null, null],
  'kafka': ["Anomaly", "Shock", null, null],
  'nangong-yu': ["Stun", "Ether", "Spiked Corruption Core", "Marrow-Draining Thorn"],
  'nekomiya-mana': ["Attack", "Physical", "Crimson Awe", "Ferocious Grip"],
  'nicole-demara': ["Support", "Ether", "Murderous Obituary", "Ferocious Grip"],
  'norma-hollowell': ["Stun", "Burn", "Deep Erosion Circuit", "Timeworn Husk"],
  'orphie-magnusson-and-magus': ["Attack", "Burn", "Miasmic Elytron", "Scarlet Engine"],
  'pan-yinhu': ["Defense", "Physical", "Miasmic Elytron", "Exuvia of Refinement"],
  'piper-wheel': ["Anomaly", "Physical", "Crimson Awe", "Finale Dance Shoes"],
  'promeia': ["Anomaly", "Freeze", "Toxic Edge", "Marrow-Draining Thorn"],
  'pulchra-fellini': ["Stun", "Physical", "Stealth Phantom", "Scarlet Engine"],
  'pyrois': ["Attack", "Ether", "Deep Erosion Circuit", "Timeworn Husk"],
  'qingyi': ["Stun", "Shock", "Ethereal Pursuit", "Living Drive"],
  'remielle-dan': ["Anomaly", "Lumiflux", "Deep Erosion Circuit", "Timeworn Husk"],
  'roxy-ifrita-pryce': ["Stun", "Windbite", "Imitation Core", "Counterfeit Nucleus"],
  'seed': ["Attack", "Shock", "Mortal Cleave", "Exuvia of Refinement"],
  'seth-lowell': ["Defense", "Shock", "Falling Fist", "Living Drive"],
  'sigrid-de-lazur': ["Attack", "Freeze", "Corrupted Dreamsteel", "Crimson Miasma Spike"],
  'soldier-0-anby': ["Attack", "Shock", "Mortal Cleave", "Living Drive"],
  'soldier-11': ["Attack", "Burn", "Destructive Advance", "Finale Dance Shoes"],
  'soukaku': ["Support", "Freeze", "Murderous Obituary", "Finale Dance Shoes"],
  'starlight-billy-kid': ["Rupture", "Physical", "Bloodstained Miasma Feather", "Clouded Crystalline Substance"],
  'sunna': ["Support", "Physical", "Bloodstained Miasma Feather", "Clouded Crystalline Substance"],
  'trigger': ["Stun", "Shock", "Mortal Cleave", "Ferocious Grip"],
  'tsukishiro-yanagi': ["Anomaly", "Shock", "Destructive Advance", "Living Drive"],
  'ukinami-yuzuha': ["Support", "Physical", "Toxic Edge", "Sycophant's Refinement"],
  'velina-airgid': ["Anomaly", "Windbite", "Deep Erosion Circuit", "Timeworn Husk"],
  'vivian-banshee': ["Anomaly", "Ether", "Thunderous Dragon", "Sycophant's Refinement"],
  'von-lycaon': ["Stun", "Freeze", "Ethereal Pursuit", "Finale Dance Shoes"],
  'ye-shunguang': ["Attack", "Physical", "Spiked Corruption Core", "Clouded Crystalline Substance"],
  'yidhari-murphy': ["Rupture", "Freeze", "Corrupted Dreamsteel", "Crimson Miasma Spike"],
  'yixuan': ["Rupture", "Ether", "Miasmic Elytron", "Exuvia of Refinement"],
  'zhao': ["Defense", "Freeze", "Spiked Corruption Core", "Clouded Crystalline Substance"],
  'zhu-yuan': ["Attack", "Ether", "Ethereal Pursuit", "Living Drive"]
};

const SEAL_TOP = {
  Attack: "Pioneer's", Stun: 'Buster', Anomaly: 'Controller', Support: 'Ruler',
  Defense: 'Defender', Rupture: 'Arbiter', Armorer: 'Bladebearer',
};
const CHIP_TEST = {
  Shock: 'Current Test', Physical: 'Rigidity Test', Ether: 'Resonance Test', Burn: 'Heating Test',
  Freeze: 'Icing Test', Windbite: 'Gale Test', Lumiflux: 'Light Tuning Test',
};
const CHIP_ATTR = {
  Shock: 'Electric', Physical: 'Physical', Ether: 'Ether', Burn: 'Fire', Freeze: 'Ice', Windbite: 'Wind', Lumiflux: 'Lumiflux',
};

// Higher Dimensional Data → Expert Challenge enemy.
export const EXPERT = {
  'Murderous Obituary': 'Notorious Dullahan',
  'Imitation Core': 'Conqueror',
  'Mortal Cleave': 'Lumberjack',
  'Bloodstained Miasma Feather': 'Sacrifice - Covenant Guardian',
  'Ethereal Pursuit': 'Notorious Armored Hati',
  'Destructive Advance': 'Typhon Slugger',
  'Thunderous Dragon': 'Thracian',
  'Crimson Awe': 'Troublemaker - Wanted Enforcer',
  'Toxic Edge': 'Sacrifice - Heretic Jester',
  'Miasmic Elytron': 'Miasma Ravager - Avarus',
  'Deep Erosion Circuit': 'Airspace Sentinel',
  'Spiked Corruption Core': 'Miasma Walker - Scorpse',
  'Stealth Phantom': 'Doppelganger - Jane',
  'Steel Malice': 'Hans - Energized',
  'Corrupted Dreamsteel': 'Miasmic Komano Manato',
  'Falling Fist': 'Rampant Brute',
};

// Core Skill drop → Notorious Hunt boss (weekly).
export const HUNT = {
  'Ferocious Grip': 'Newborn Dead End Butcher',
  "Sycophant's Refinement": 'Sacrifice - Bringer',
  'Scarlet Engine': 'Corrupted Overlord - Pompey',
  'Clouded Crystalline Substance': 'Ye Shiyuan the Thrall',
  'Living Drive': 'Unknown Corruption Complex',
  'Marrow-Draining Thorn': 'Sanguine Sweeper',
  'Exuvia of Refinement': 'Miasma Priest',
  'Timeworn Husk': 'Girtablullu',
  'Counterfeit Nucleus': 'Kusarikku',
  'Finale Dance Shoes': 'Twin Marionettes',
  'Crimson Miasma Spike': 'Wandering Hunter',
};

// Agents whose Core Skill drops are estimates until release.
export const ESTIMATED_MATS = new Set([]);

/** True when the Core Skill drops (Expert Challenge and Notorious Hunt) are known. */
export const AGENT_MATS_KNOWN = (id) => Boolean(AGENT_MATS[id]?.[2] && AGENT_MATS[id]?.[3]);

export const SKILL_COUNT = 5; // Basic, Dodge, Assist, Special and Chain Attack

/**
 * The full shopping list for one Agent, in three parts:
 * promotion (level 1 → 60), skills (each skill 1 → 12) and Core Skill (A–F).
 * Each item: { name, qty, source, kind }.
 */
export function materialsFor(id) {
  const m = AGENT_MATS[id];
  if (!m) return null;
  const [seal, chip, hdd, boss] = m;
  const drill = `Combat Simulation · ${seal} Drill`;
  const test = `Combat Simulation · ${CHIP_TEST[chip]}`;
  const denny = 'Commissions, Combat Simulation, Random Play';
  return {
    seal,
    chipAttr: CHIP_ATTR[chip],
    promotion: [
      { name: `Basic ${seal} Certification Seal`, qty: 4, source: drill, kind: 'seal' },
      { name: `Advanced ${seal} Certification Seal`, qty: 32, source: drill, kind: 'seal' },
      { name: `${SEAL_TOP[seal]} Certification Seal`, qty: 30, source: drill, kind: 'seal' },
      { name: 'Denny', qty: 800000, source: denny, kind: 'denny' },
    ],
    skill: [
      { name: `Basic ${chip} Chip`, qty: 5, source: test, kind: 'chip' },
      { name: `Advanced ${chip} Chip`, qty: 15, source: test, kind: 'chip' },
      { name: `Specialized ${chip} Chip`, qty: 50, source: test, kind: 'chip' },
      { name: 'Hamster Cage Pass', qty: 1, source: 'Events, New Eridu City Fund', kind: 'pass' },
      { name: 'Denny', qty: 500000, source: denny, kind: 'denny' },
    ],
    core: [
      hdd
        ? { name: `Higher Dimensional Data: ${hdd}`, qty: 60, source: `Expert Challenge · ${EXPERT[hdd]}`, kind: 'hdd', key: hdd }
        : { name: 'Higher Dimensional Data', qty: 60, source: 'Expert Challenge · not announced yet', kind: 'hdd', key: null },
      boss
        ? { name: boss, qty: 9, source: `Notorious Hunt · ${HUNT[boss]} (weekly)`, kind: 'boss', key: boss }
        : { name: 'Notorious Hunt drop', qty: 9, source: 'Notorious Hunt · not announced yet (weekly)', kind: 'boss', key: null },
      { name: 'Denny', qty: 405000, source: denny, kind: 'denny' },
    ],
  };
}

/** Other Agents who farm the same Expert Challenge or Notorious Hunt drop. */
export function sharedWith(id, index) {
  const mine = AGENT_MATS[id]?.[index];
  if (!mine) return [];
  return Object.keys(AGENT_MATS).filter((o) => o !== id && !ESTIMATED_MATS.has(o) && AGENT_MATS[o][index] === mine);
}
