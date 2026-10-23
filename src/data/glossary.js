// Glossary of ZZZ terms, written for this site. Each entry: { term, also?, category, text, related? }
export const GLOSSARY_CATEGORIES = ['Specialties', 'Attributes', 'Combat', 'Squad', 'Gear', 'Stats', 'Factions'];

// Short notes for the Factions tag. Every faction an Agent or Bangboo belongs to
// gets an entry (with its logo and members, filled in by the Glossary page);
// these add a line where the game says plainly what the group is.
export const FACTION_NOTES = {
  'Cunning Hares': 'A do-anything agency run by Nicole Demara that takes on odd and risky jobs around New Eridu.',
  'Victoria Housekeeping Co.': 'A housekeeping company led by Von Lycaon that also handles dangerous assignments for its clients.',
  'Belobog Heavy Industries': 'A construction company led by Koleda Belobog.',
  'Sons of Calydon': 'A biker gang from the Outer Ring led by Caesar King.',
  'Hollow Special Operations Section 6': 'A special operations unit of the Hollow Investigative Association, led by Hoshimi Miyabi.',
  'Criminal Investigation Special Response Team': 'A New Eridu Public Security team that handles criminal cases tied to the Hollows.',
  'Defense Force - Silver Squad': 'A squad of the New Eridu Defense Force.',
  'Obol Squad': 'A unit of the New Eridu Defense Force.',
  'Yunkui Summit': 'A martial-arts school based on Yunkui Mountain.',
  'Mockingbird': 'A group of phantom thieves.',
  'Angels of Delusion': 'An idol group.',
  Roscaelifer: 'An organisation run through its Five Central Departments, among them the Administrative Affairs, Airspace Patrol and Central Computing Departments.',
  'Administrative Affairs Department': 'Roscaelifer’s supreme governing body: it makes the rules, coordinates the departments and holds final say over all operations. Directed by Eldreda Sunbringer.',
  'Airspace Patrol Department': 'Roscaelifer’s military and security force, led by Lindverne Sunbringer.',
  'Central Computing Department': 'Roscaelifer’s computing centre. It deciphers the laws of the Hollow and generates the Rosetta Data, which live Hollow data is checked against before it can become usable Carrots. Managed by Dracaene Sunbringer.',
};
// Departments that sit under a faction (shown as part of it).
export const FACTION_PARENT = {
  'Administrative Affairs Department': 'Roscaelifer',
  'Airspace Patrol Department': 'Roscaelifer',
  'Central Computing Department': 'Roscaelifer',
};

export const GLOSSARY = [
  // Specialties
  { term: 'Attack', category: 'Specialties', text: 'Agents built to deal the main damage, usually on-field for long stretches and at their best on Stunned enemies.' },
  { term: 'Stun', category: 'Specialties', text: 'Agents who fill an enemy’s Daze bar quickly so the squad can Stun it and unload damage.', related: ['Daze', 'Stun window'] },
  { term: 'Anomaly', category: 'Specialties', text: 'Agents who build up Attribute Anomalies on enemies and deal damage through them, including Disorder.', related: ['Attribute Anomaly', 'Disorder'] },
  { term: 'Support', category: 'Specialties', text: 'Agents who buff the squad or debuff enemies, often switching in briefly.' },
  { term: 'Defense', category: 'Specialties', text: 'Agents who shield or protect the squad and often add buffs or Daze on the side.' },
  { term: 'Rupture', category: 'Specialties', text: 'Damage dealers who scale on Sheer Force and deal Sheer DMG, which works differently from regular damage.', related: ['Sheer Force'] },
  { term: 'Armorer', category: 'Specialties', text: 'A specialty added in version 3.2. Armorer W-Engines use DEF as their base stat instead of ATK.' },

  // Attributes
  { term: 'Attribute', category: 'Attributes', text: 'The damage type an Agent deals: Physical, Fire, Ice, Electric, Ether or Wind, plus a few variants. Many Agents get extra effects when a teammate shares their attribute.' },
  { term: 'Variant attribute', also: 'Frost, Honed Edge, Auric Ink', category: 'Attributes', text: 'Special versions of a base attribute used by some Agents. This site counts Frost as Ice, Honed Edge as Physical and Auric Ink as Ether when matching teammates.' },
  { term: 'Attribute Anomaly', category: 'Attributes', text: 'A status that triggers when enough Anomaly Buildup of one attribute lands on an enemy, such as Burn from Fire or Shock from Electric. Each attribute has its own effect.', related: ['Disorder'] },
  { term: 'Disorder', category: 'Attributes', text: 'Bonus damage when an enemy already under one Attribute Anomaly gets a different one. Teams with two Anomaly Agents of different attributes often aim for it.' },

  // Combat
  { term: 'Daze', category: 'Combat', text: 'A bar on enemies that fills as you hit them. When it’s full, the enemy is Stunned.', related: ['Impact'] },
  { term: 'Stun window', category: 'Combat', text: 'The time an enemy stays Stunned. It takes extra damage then, so burst attacks are saved for it.' },
  { term: 'Chain Attack', category: 'Combat', text: 'A follow-up you can trigger after certain heavy hits, letting another squad member come in with a strong attack.' },
  { term: 'Assist', also: 'Quick, Defensive and Evasive Assist', category: 'Combat', text: 'Switching in another Agent at the right moment: Quick Assist when the on-field Agent is knocked back, Defensive or Evasive Assist to block or dodge an attack.' },
  { term: 'EX Special Attack', category: 'Combat', text: 'A stronger version of an Agent’s Special Attack that costs Energy.', related: ['Energy'] },
  { term: 'Ultimate', category: 'Combat', text: 'An Agent’s strongest attack, used when the squad’s Decibel meter is full.' },

  // Squad
  { term: 'Squad', category: 'Squad', text: 'Up to three Agents plus one Bangboo.' },
  { term: 'Bangboo', category: 'Squad', text: 'A small robot that joins the squad and fights alongside it with its own skills. Some Bangboo work best with certain factions or attributes.' },
  { term: 'Additional Ability', category: 'Squad', text: 'An extra effect in an Agent’s Core Skill that only turns on when the squad meets a condition, usually a teammate with the same attribute, faction or a certain specialty.' },
  { term: 'Faction', category: 'Squad', text: 'The group an Agent belongs to, such as Victoria Housekeeping Co. Shared factions can unlock Additional Abilities.' },
  { term: 'Mindscape Cinema', also: 'Mindscape, M0–M6', category: 'Squad', text: 'Upgrades an Agent unlocks from duplicate copies, up to six.' },

  // Gear
  { term: 'W-Engine', category: 'Gear', text: 'An Agent’s weapon. It gives a base stat, an advanced stat and a passive that only works when the W-Engine matches the Agent’s specialty.' },
  { term: 'Signature W-Engine', category: 'Gear', text: 'The W-Engine released alongside an Agent and designed around their kit.' },
  { term: 'Phase', also: 'Refinement, P1–P5', category: 'Gear', text: 'A W-Engine’s upgrade level from duplicate copies, which strengthens its passive.' },
  { term: 'Drive Disc', category: 'Gear', text: 'Six-slot equipment. Slots 1 to 3 always roll flat HP, ATK and DEF; slots 4 to 6 can roll different main stats. Matching sets give 2-piece and 4-piece bonuses.' },

  // Stats
  { term: 'Impact', category: 'Stats', text: 'How much Daze an Agent’s attacks deal. Key for Stun Agents.' },
  { term: 'Anomaly Proficiency', category: 'Stats', text: 'Raises the damage of the Attribute Anomalies an Agent triggers.' },
  { term: 'Anomaly Mastery', category: 'Stats', text: 'Raises how fast an Agent builds up Attribute Anomalies.' },
  { term: 'PEN Ratio', category: 'Stats', text: 'Ignores a share of the enemy’s DEF.' },
  { term: 'Energy', also: 'Energy Regen', category: 'Stats', text: 'A per-Agent resource spent on EX Special Attacks. Energy Regen raises how fast it refills.' },
  { term: 'Sheer Force', category: 'Stats', text: 'The stat Rupture Agents scale on for Sheer DMG.' },
];
