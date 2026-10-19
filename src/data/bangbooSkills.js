// Bangboo skills in short: Active Skill (with cooldown), Additional Ability
// (its team condition, and its numbers at Ability levels 1–5) and Bangboo
// Chain Attack. Shortened rewordings of the Zenless Zone Zero Wiki's skill
// text (CC BY-SA 4.0, October 2026), keeping the game's numbers; see NOTICE.md.
//
// need: what the squad needs for the Additional Ability.
//   { attr, n }        n Agents of an attribute
//   { faction, n }     n Agents from a faction (string or list of names)
//   { specialty, n }   n Agents of any listed specialty
//   { agent }          a specific Agent in the squad
//   { attackType }     an Agent with that attack type
// ability.text uses {0}, {1}… for the values at the chosen level.

const DF = ['Obol Squad', 'Defense Force - Silver Squad'];

export const BANGBOO_SKILLS = {
  'agent-gulliver': {
    active: ['Emergency Operation', 'Three piercing shots for Electric DMG and Electric Anomaly Buildup.', 20],
    ability: ['Bangboo Assault Squad', { faction: 'Hollow Special Operations Section 6', n: 2 },
      'Active Skill and Chain Attack deal +{0}% DMG to Shocked enemies, and build {1}% more Anomaly on enemies with another (non-Electric) Anomaly.',
      { 'DMG (%)': ['30', '37', '45', '52', '60'], 'Anomaly Buildup (%)': ['60', '75', '90', '105', '120'] }],
    chain: ['Assault Time', 'One powerful piercing shot for Electric DMG and massive Electric Anomaly Buildup.'],
  },
  amillion: {
    active: ['Portable Machine Gun - Debt-Clearer', 'Sets up a machine gun and keeps firing for massive Physical DMG.', 22],
    ability: ['Street Code', { faction: 'Cunning Hares', n: 2 },
      'Chain Attack DMG rises the fewer enemies there are: +{0}% against 1, +{1}% against 2, +{2}% against 3 or more.',
      { '1 enemy (%)': ['45', '56', '67', '78', '90'], '2 enemies (%)': ['35', '43', '51', '60', '70'], '3+ enemies (%)': ['25', '31', '37', '43', '50'] }],
    chain: ['Portable Machine Gun - Gatling Debt-Clearer', 'Machine guns and cannons for massive Physical DMG.'],
  },
  ariel: {
    active: ['Searing Flash', 'Blinks to the target and pulls enemies in over a wide area, then a Prismatic Cross deals Ether DMG. Gains 1–3 different random buffs by how many enemies it pulled: heal the Agent, restore their Energy, or +20% Prismatic Cross DMG.', 28],
    ability: ['Angel\'s Protection', { agent: 'remielle-dan' },
      'Her Active Skill always gets all three buffs, and Chain Attack DMG +{0}%.',
      { 'Chain Attack DMG (%)': ['15', '18.8', '22.5', '26.3', '30'] }],
    chain: ['Radiance', 'Glides in and throws a Dazzling Nebula for massive Ether DMG.'],
  },
  avocaboo: {
    active: ['Sweet and Juicy', 'Shoots juice at the on-field Agent; missed shots leave puddles that heal whoever touches them (up to 15 heals per fight).', 20],
    ability: ['Replenishing Sugar Levels', { specialty: ['support'], n: 1 },
      'Active Skill heals {0}% more and has 3 more charges.',
      { 'Healing (%)': ['20', '25', '30', '35', '40'] }],
  },
  baddieboo: {
    active: ['Rocket Barrage', 'Rockets and molotovs at the target for Fire DMG.', 20],
    ability: ['Unusually Short Fuse', { specialty: ['anomaly'], n: 1 },
      'Chain Attack DMG +{0}%, and {1}% more against Organic enemies.',
      { 'DMG (%)': ['20', '25', '30', '35', '40'], 'Extra vs Organic (%)': ['15', '19', '23', '27', '30'] }],
    chain: ['Rocket Blast!', 'Leaps and fires a rocket for Fire DMG over a wide area.'],
  },
  bagboo: {
    active: ['Closer, Closer...', 'Dual-blade slashes for Physical DMG.', 18],
    ability: ['Swiftly Honed', { specialty: ['attack'], n: 1 }, 'Chain Attack DMG +{0}%.', { 'DMG (%)': ['30', '37.5', '45', '52.5', '60'] }],
    chain: ['That\'s Close Enough!', 'Continuous slashes for massive Physical DMG.'],
  },
  bangvolver: {
    active: ['Revolver of Fortune', 'Fires a random round: a Powerful Firework Shell (massive Physical DMG and lots of Physical buildup), a Regular one (Physical DMG and buildup), or a dud that just shoots flowers.', 18],
    ability: ['Luck is Skill', { attr: 'physical', n: 2 }, 'Chain Attack builds {0}% more Anomaly.', { 'Anomaly Buildup (%)': ['100', '125', '150', '175', '200'] }],
    chain: ['Lucky Trigger', 'Rapid shots for Physical DMG and massive Physical Anomaly Buildup.'],
  },
  belion: {
    active: ['Phoenix Ball Dance', 'A stone ball that bounces between enemies for massive Physical DMG.', 30],
    ability: ['Way of Clouds', { faction: 'Yunkui Summit', n: 2 },
      'Belion deals +{0}% DMG. Each Agent Ultimate cuts its Active Skill cooldown by 4s (twice per Active Skill). Needs 1 Yunkui Summit Agent instead of 2 at higher levels.',
      { 'DMG (%)': ['25', '31', '37', '43', '50'] }],
    chain: ['Silver Lion Crash', 'Spinning ram for massive Physical DMG.'],
  },
  'biggest-fan': {
    active: ['I Stan My Angels', 'Cheers, healing the on-field Agent over time from its Max HP.', 24],
    ability: ['Fandom Power Unleashed', { faction: 'Angels of Delusion', n: 2 },
      'Its Active Skill gives the squad +{0} ATK for 30s, and Chain Attack builds {1}% more Anomaly. Needs 1 Angels of Delusion Agent instead of 2 at higher levels.',
      { 'ATK': ['50', '62', '75', '87', '100'], 'Anomaly Buildup (%)': ['15', '18.8', '22.5', '26', '30'] }],
    chain: ['Grab the Merch!', 'Glow-stick swings for Ether DMG and massive Ether Anomaly Buildup.'],
  },
  'bild-n-boolok': {
    active: ['Block Hopscotch', 'Builds a block hammer and swings it; after 4 hits or 3 swings, slams down and sends out Block Spikes that deal Physical DMG on contact.', 24],
    ability: ['Red Light! Nobody Move!', { specialty: ['support'], n: 1 }, 'Active Skill releases 7 Block Spikes and deals +{0}% DMG.', { 'DMG (%)': ['30', '37.5', '45', '52.5', '60'] }],
    chain: ['Castle Dodgeball', 'Full-power staff swing launching blocks for massive Physical DMG.'],
  },
  birkblick: {
    active: ['Montage Combo', 'A floating turret fires up to 3 laser volleys for Physical DMG and lots of Daze.', 28],
    ability: ['Observer Effect', { faction: 'Krampus Compliance Authority', n: 2 },
      'Each Agent EX Special gives +{0}% Daze (max 3, 15s); at 3 stacks, +{1}% DMG. Needs 1 Krampus Agent instead of 2 at higher levels.',
      { 'Daze per stack (%)': ['4', '5', '6', '7', '8'], 'DMG at 3 stacks (%)': ['10', '12.5', '15', '17.5', '20'] }],
    chain: ['Battlefield Close-Up', 'A powerful turret laser for massive Physical DMG.'],
  },
  boollseye: {
    active: ['Straight in the Heart', 'Throws a dart for Physical DMG.', 16],
    ability: ['Crossfire Missiles', { attackType: 'pierce' }, 'Chain Attack DMG +{0}%.', { 'DMG (%)': ['30', '37.5', '45', '52.5', '60'] }],
    chain: ['Dart of Desperation', 'Slingshots itself at the target for slashes dealing massive Physical DMG.'],
  },
  booltergeist: {
    active: ['Cursed Spotlight', 'Floats up and keeps firing lasers for massive Ether DMG.', 24],
    ability: ['Specialty Scare Actor', { specialty: ['attack', 'anomaly'], n: 1 }, 'Each Active Skill has a 60% chance to deal +{0}% DMG.', { 'DMG (%)': ['40', '50', '60', '70', '80'] }],
    chain: ['Mischief Maker on the Loose', 'Dives and explodes for massive Ether DMG.'],
  },
  booressure: {
    active: ['Ether Bubble', 'Releases Ether bubbles that give Energy to whoever touches them.', 26],
    ability: ['Balanced Pressure', { specialty: ['support'], n: 1 }, 'Bubbles also give off-field Agents {0}% of that Energy.', { 'Off-field share (%)': ['60', '70', '80', '90', '100'] }],
  },
  brawlerboo: {
    active: ['Falling Bangboo Asteroid Strike!', 'Rises into the air; while airborne, it dive-bombs enemies for Fire DMG when an Agent lands a heavy hit.', 28],
    ability: ['Opening Jab', { specialty: ['attack', 'anomaly'], n: 1 }, 'Starts each fight already airborne, and its first dive deals +{0}% DMG.', { 'First dive DMG (%)': ['120', '150', '180', '210', '240'] }],
    chain: ['Scorching Wind Strike', 'Leaping strikes over a wide area for Fire DMG.'],
  },
  butler: {
    active: ['Tea Break', 'Makes a snack that gives the receiving Agent Energy.', 24],
    ability: ['Personal Butler', { faction: 'Victoria Housekeeping Co.', n: 2 }, 'Active Skill gives {0}% more Energy.', { 'Energy (%)': ['20', '25', '30', '35', '40'] }],
    chain: ['Afternoon Dessert', 'Frying pan and pancakes from range for massive Physical DMG.'],
  },
  cryboo: {
    active: ['Pull-Tab Bomb', 'Throws a bomb for Fire DMG and Fire Anomaly Buildup.', 14],
    ability: ['Building Heat', { attr: 'fire', n: 2 }, 'Chain Attack builds {0}% more Anomaly.', { 'Anomaly Buildup (%)': ['60', '75', '90', '105', '120'] }],
    chain: ['Shocking Gift', 'Bomb for Fire DMG and massive Fire Anomaly Buildup.'],
  },
  devilboo: {
    active: ['Kiss of Temptation', 'Flies and fires homing shots for Ether DMG and Ether Anomaly Buildup.', 30],
    ability: ['Ether Activity Increase', { attr: 'ether', n: 2 },
      'Chain Attack builds {0}% more Anomaly, and its coordination lasts {1}s longer with {2} more shots.',
      { 'Anomaly Buildup (%)': ['40', '50', '60', '70', '80'], 'Extra duration (s)': ['5', '6', '7', '8', '9'], 'Extra shots': ['4', '5', '6', '7', '8'] }],
    chain: ['Kiss of Confusion', 'A laser, then 30s (or 10 shots) of homing shots alongside the on-field Agent\'s attacks, for Ether DMG and buildup.'],
  },
  electroboo: {
    active: ['Maximum Voltage!', 'Charges in and electrocutes the target for Electric DMG and Electric Anomaly Buildup.', 18],
    ability: ['Inductive Current', { attr: 'electric', n: 2 }, 'Chain Attack builds {0}% more Anomaly.', { 'Anomaly Buildup (%)': ['60', '75', '90', '105', '120'] }],
    chain: ['Billion Volt Thunderbolt!', 'Continuous shocks for Electric DMG and Electric Anomaly Buildup.'],
  },
  excaliboo: {
    active: ['Sacred Sword Unleashed', 'Tries to draw the sword: a triple hammer strike (Physical DMG) if it fails, a sword slash for massive Physical DMG if it succeeds.', 24],
    ability: ['Victor\'s Oath', { specialty: ['rupture'], n: 1 }, 'The sword draw always succeeds, and the Active Skill deals +{0}% DMG.', { 'DMG (%)': ['30', '37.5', '45', '52.5', '60'] }],
    chain: ['King\'s Unstoppable Might', 'Sacred sword strike for massive Physical DMG.'],
  },
  exploreboo: {
    active: ['Modded Ether Detector', 'Digs up a random buff for the Agent for 12s: healing, a Shield, or Energy Regen.', 16],
    ability: ['Ether Detection Specialist', { specialty: ['support'], n: 1 },
      'Buffs are stronger: healing +{0}%, Shield +{1}%, Energy Regen +{2}/s.',
      { 'Healing (%)': ['20', '22.5', '25', '27.5', '30'], 'Shield (%)': ['20', '22.5', '25', '27.5', '30'], 'Energy Regen (/s)': ['0.04', '0.05', '0.06', '0.07', '0.08'] }],
  },
  knightboo: {
    active: ['Knight, Charge Up!', 'Bounces around and leaves 3 Knight\'s Stars that give Energy on contact.', 24],
    ability: ['Knight\'s Chivalry', { specialty: ['support'], n: 1 }, 'Touching a Knight\'s Star also gives ATK for 10s (it grows with the Bangboo\'s level).', {}],
    chain: ['Knight, Bouncing Charge!', 'Three Pale Bouncys stomp up to 10 times, each for Ether DMG.'],
  },
  luckyboo: {
    active: ['Lavish Spending', 'A barrage of gold coins for Physical DMG and Physical Anomaly Buildup.', 22],
    ability: ['Luck is a Component of Power', { attr: 'physical', n: 2 },
      'Active Skill builds {0}% more Anomaly and keeps firing {1}s longer.',
      { 'Anomaly Buildup (%)': ['20', '25', '30', '35', '40'], 'Extra duration (s)': ['0.8', '1', '1.2', '1.4', '1.6'] }],
  },
  magnetiboo: {
    active: ['Magnetic Lock-On', 'Pulls nearby enemies in for Physical DMG.', 24],
    ability: ['Magnetic Attraction', { specialty: ['anomaly'], n: 1 }, 'Active Skill has a wider range and deals +{0}% DMG.', { 'DMG (%)': ['30', '37.5', '45', '52.5', '60'] }],
  },
  mercury: {
    active: ['Tactical Strategy I: Frontline Suppression', 'Drives a vehicle that keeps spraying flames for massive Fire DMG.', 25],
    ability: ['Tactical Strategy II: Combat Synergy', { faction: DF, n: 2 },
      'When an Agent deals Aftershock DMG, its next Active Skill gets +{0}% DMG (once per 5s, max 2). Needs 1 Defense Force Agent instead of 2 at higher levels.',
      { 'DMG per stack (%)': ['22.5', '28.1', '33.7', '39.3', '45'] }],
    chain: ['Tactical Strategy III: Explosive Ambush', 'Fires itself from the vehicle and explodes for massive Fire DMG.'],
  },
  'miss-esme': {
    active: ['Starbeam Transformation', 'Flies and summons three Spectral Bubbles (heal) or Twinkling Stars (Energy); the higher the on-field Agent\'s HP, the likelier a Star.', 30],
    ability: ['Starshine Shift', { faction: 'Spook Shack', n: 2 },
      'Bubbles heal {0}% more and Stars give {1}% more Energy. Needs 1 Spook Shack Agent instead of 2 at higher levels.',
      { 'Healing (%)': ['20', '25', '30', '35', '40'], 'Energy (%)': ['20', '25', '30', '35', '40'] }],
    chain: ['Stellar Bomb', 'Magic bomb for Physical DMG and massive Physical Anomaly Buildup.'],
  },
  'officer-cui': {
    active: ['Awoo! Woof Woof!', 'Two biting attacks for Physical DMG.', 26],
    ability: ['Provisional Security Canine', { faction: 'Criminal Investigation Special Response Team', n: 2 },
      'After its Active Skill, a 50% chance of an extra bite (up to 3 in a row). Chain Attack DMG +{0}%.',
      { 'Chain Attack DMG (%)': ['35', '43', '52', '60', '70'] }],
    chain: ['Woof Woof Woof Woof!', 'Continuous bites for massive Physical DMG.'],
  },
  overtimeboo: {
    active: ['Corporate Drone Max!', 'Rams the target with a desk and computer for Physical DMG.', 24],
    ability: ['Keyboard Smasher', { specialty: ['attack', 'anomaly'], n: 1 }, 'Each Active Skill use raises its DMG by {0}% (max {1}%).', { 'Per use (%)': ['25', '29', '32', '36', '40'], 'Max (%)': ['100', '116', '128', '144', '160'] }],
  },
  paperboo: {
    active: ['Decoy Paper Armor', 'Hides in a box and taunts; getting hit or timing out makes it explode for area Physical DMG.', 20],
    ability: ['Cardboard Armor', { specialty: ['defense'], n: 1 },
      'Chain Attack shields the squad for 24s from its Max HP: {0}% (1 enemy hit), {1}% (2), {2}% (3+).',
      { '1 enemy (% HP)': ['10', '11', '12', '13', '14'], '2 enemies (% HP)': ['12', '13.2', '14.4', '15.6', '16.8'], '3+ enemies (% HP)': ['15', '16.5', '18', '19.5', '21'] }],
    chain: ['Paper Armor: Impact Mode', 'Jumps at the target in its box and explodes for area Physical DMG.'],
  },
  penguinboo: {
    active: ['Iceblade Dance', 'Ice-blade slashes for Ice DMG and Ice Anomaly Buildup.', 20],
    ability: ['Dry Ice Field', { attr: 'ice', n: 2 }, 'Chain Attack builds {0}% more Anomaly.', { 'Anomaly Buildup (%)': ['60', '75', '90', '105', '120'] }],
    chain: ['Frozen Hurricane', 'Slash combo for Ice DMG and massive Ice Anomaly Buildup.'],
  },
  plugboo: {
    active: ['Shock Sniper', 'EM cannon shot for Electric DMG and Electric Anomaly Buildup.', 16],
    ability: ['Electromancer', { attr: 'electric', n: 2 }, 'Chain Attack builds {0}% more Anomaly.', { 'Anomaly Buildup (%)': ['100', '125', '150', '175', '200'] }],
    chain: ['High-Voltage Resistance', 'Wide electric blast for Electric DMG and massive Electric Anomaly Buildup.'],
  },
  'red-moccus': {
    active: ['Roaring Wheels', 'Rides out and pushes the farthest enemy toward the Agent for Physical DMG.', 30],
    ability: ['Drifting Technique', { faction: 'Sons of Calydon', n: 2 },
      'Active Skill DMG +{0}%; an enemy it hit dying cuts its cooldown by {1}s.',
      { 'DMG (%)': ['36', '45', '54', '63', '72'], 'Cooldown cut (s)': ['4', '5', '6', '7', '8'] }],
    chain: ['Mad Charge', 'Runs enemies over and explodes for massive Physical DMG.'],
  },
  resonaboo: {
    active: ['Mini-Black Hole', 'An Ether black hole that pulls enemies in for Ether DMG and Ether Anomaly Buildup.', 28],
    ability: ['Radiation Effect', { attr: 'ether', n: 2 }, 'Chain Attack builds {0}% more Anomaly.', { 'Anomaly Buildup (%)': ['100', '125', '150', '175', '200'] }],
    chain: ['Primordial Black Hole', 'Ether bomb for Ether DMG and massive Ether Anomaly Buildup.'],
  },
  robin: {
    active: ['The Curtain Falls', 'Fires random cards: Hearts (massive Physical DMG), Spades (Physical DMG and lots of Daze), Crowns (Ether DMG and lots of Ether buildup).', 26],
    ability: ['Master of Disguise', { faction: 'Mockingbird', n: 1 },
      'Fires only the card that suits the on-field Agent: Attack gets Hearts (+{0}% DMG), Stun gets Spades (+{1}% Daze), Anomaly gets Crowns (+{2}% Anomaly Buildup).',
      { 'Hearts DMG (%)': ['45', '56', '67', '78', '90'], 'Spades Daze (%)': ['27', '34', '40', '47', '54'], 'Crowns buildup (%)': ['90', '112.5', '135', '157.5', '180'] }],
    chain: ['Show Time!', 'Magic grenade for Ether DMG and Ether Anomaly Buildup.'],
  },
  rocketboo: {
    active: ['Boom!', 'Rides a rocket into the target; it explodes for Fire DMG and Fire Anomaly Buildup.', 18],
    ability: ['Refueling', { attr: 'fire', n: 2 }, 'Chain Attack builds {0}% more Anomaly.', { 'Anomaly Buildup (%)': ['100', '125', '150', '175', '200'] }],
    chain: ['Ka-Boom Express Shipping', 'Bigger rocket explosion for Fire DMG and massive Fire Anomaly Buildup.'],
  },
  safety: {
    active: ['Boring Burst', 'Drives into enemies and drills for Physical DMG.', 18],
    ability: ['Drill Team Mobilization', { faction: 'Belobog Heavy Industries', n: 2 },
      'Chain Attack DMG +{0}%, and {1}% more against Burning or Shocked enemies.',
      { 'DMG (%)': ['20', '25', '30', '35', '40'], 'Extra vs Burn / Shock (%)': ['20', '25', '30', '35', '40'] }],
    chain: ['Demolition Drill', 'Multi-hit drilling for massive Physical DMG.'],
  },
  sharkboo: {
    active: ['Drylands Shark Hunt', 'Plants a homing trap that bites and calls torpedoes on enemies for Ice DMG and Ice Anomaly Buildup.', 12],
    ability: ['Cold Surge', { attr: 'ice', n: 2 }, 'Chain Attack builds {0}% more Anomaly.', { 'Anomaly Buildup (%)': ['100', '125', '150', '175', '200'] }],
    chain: ['Relentless Pursuit', 'Leaps in with a homing trap and explodes for Ice DMG and massive Ice Anomaly Buildup.'],
  },
  snap: {
    active: ['Snap! Look at the Camera!', 'Gets 3 Film; when an Agent uses a Dodge Counter, Quick Assist or Assist Follow-Up, it spends 1 to give them Superstar (more DMG for 10s).', 22],
    ability: ['Superstar Moment', { faction: 'Stars of Lyra', n: 2 }, 'Superstar also heals the Agent for {0}% of their Max HP.', { 'Healing (% HP)': ['4', '5', '6', '7', '8'] }],
    chain: ['Snap! Don\'t Blink!', 'A powerful flash for Ether DMG and Ether Anomaly Buildup.'],
  },
  sprout: {
    active: ['Six-Star Flight', 'Six flying swords strike for Physical DMG and buildup; if a Sword is already on the field, it rides it for a stronger flurry instead.', 28],
    ability: ['Heartbound Bond', { agent: 'ye-shunguang' }, 'Sprout deals +{0}% DMG, and using its Active Skill inside Ether Veil: Verdict leaves a Sword on the field.', { 'DMG (%)': ['30', '37.5', '45', '52.5', '60'] }],
    chain: ['Sword of Unification', 'A huge sword stab for massive Physical DMG and buildup.'],
  },
  sumoboo: {
    active: ['Finishing Move - Rock Crusher', 'Leaping downward strike for area Physical DMG; good at interrupting.', 14],
    ability: ['Overpower All Odds', { specialty: ['stun'], n: 1 }, 'Active Skill deals {0}% more Daze to enemies above 50% Daze.', { 'Daze (%)': ['18', '22.5', '27', '31.5', '36'] }],
  },
  'ultra-jake': {
    active: ['Ultra Firepower Suppression', 'Flies and keeps firing at the target for Fire DMG and Fire Anomaly Buildup.', 30],
    ability: ['Ultra Boost Module', { faction: 'Roscaelifer', n: 1 },
      'When anyone triggers Vortex or uses a Chain Attack, the squad gains {0} Energy and its Active Skill deals +{1}% DMG for 45s (once per 30s).',
      { 'Energy': ['2', '2.5', '3', '3.5', '4'], 'DMG (%)': ['30', '37.5', '45', '52.5', '60'] }],
    chain: ['Super Ultra Cannon', 'Charged hand cannon for massive Fire DMG and Fire Anomaly Buildup.'],
  },
};

const SPECIALTY = { attack: 'Attack', stun: 'Stun', anomaly: 'Anomaly', support: 'Support', defense: 'Defense', rupture: 'Rupture' };
const ATTR = { physical: 'Physical', fire: 'Fire', ice: 'Ice', electric: 'Electric', ether: 'Ether', wind: 'Wind' };

/** The Additional Ability's team requirement, in words. */
export function needText(need, agentName = (id) => id) {
  const many = (n, what) => `${n} ${what} Agent${n > 1 ? 's' : ''}`;
  if (need.attr) return `${many(need.n, ATTR[need.attr])} in the squad`;
  if (need.faction) return `${many(need.n, [need.faction].flat()[0])} in the squad`;
  if (need.specialty) return `${many(need.n, need.specialty.map((s) => SPECIALTY[s]).join(' or '))} in the squad`;
  if (need.agent) return `${agentName(need.agent)} in the squad`;
  if (need.attackType) return 'a Pierce-type Agent in the squad';
  return '';
}

/**
 * Whether a squad meets the requirement: true, false, or null when it can't
 * tell (no Agent on the site belongs to that faction yet).
 */
export function needMet(need, squad, base = (a) => a) {
  const count = (fn) => squad.filter(fn).length;
  if (need.attr) return count((a) => base(a.attribute) === need.attr) >= need.n;
  if (need.faction) {
    const names = [need.faction].flat();
    return count((a) => names.includes(a.faction)) >= need.n;
  }
  if (need.specialty) return count((a) => need.specialty.includes(a.specialty)) >= need.n;
  if (need.agent) return squad.some((a) => a.id === need.agent);
  if (need.attackType) return squad.some((a) => a.attackType?.includes(need.attackType));
  return null;
}
