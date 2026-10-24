// Glossary of ZZZ terms, written for this site. Each entry: { term, also?, category, text, related? }
export const GLOSSARY_CATEGORIES = ['Specialties', 'Attributes', 'Combat', 'Squad', 'Gear', 'Stats', 'Factions'];

// Short notes for the Factions tag. Every faction an Agent or Bangboo belongs to
// gets an entry (with its logo and members, filled in by the Glossary page);
// these add a line where the game says plainly what the group is.
export const FACTION_NOTES = {
  'Cunning Hares': 'A small do-anything agency led by Nicole Demara that takes on Hollow jobs around New Eridu.',
  'Victoria Housekeeping Co.': 'A housekeeping company that keeps New Eridu’s homes clean, and its Hollows clear of monsters.',
  'Belobog Heavy Industries': 'A construction company led by Koleda Belobog that builds New Eridu’s infrastructure and heavy machines.',
  'Sons of Calydon': 'A biker gang from the Outer Ring led by Caesar King, running a logistics company on the side.',
  'Hollow Special Operations Section 6': 'New Eridu’s elite Hollow task force under H.A.N.D., led by Hoshimi Miyabi.',
  'Criminal Investigation Special Response Team': 'A Public Security division, captained by Zhu Yuan, that investigates crime in New Eridu and its Hollows.',
  'Defense Force - Silver Squad': 'A Defense Force squad of clones grown from one supersoldier, once captained by Soldier 0 – Anby.',
  'Obol Squad': 'A New Eridu Defense Force squad, the last line against Hollows others can’t handle.',
  'Yunkui Summit': 'A martial-arts school on the Waifei Peninsula that takes in orphans and trains them, now led by Yixuan.',
  Mockingbird: 'One of New Eridu’s most mysterious factions, home of a Phantom Thieves syndicate.',
  'Angels of Delusion': 'A small underground virtual idol group aiming to become New Eridu’s next big stars.',
  'Spook Shack': 'An open Inter-Knot forum for urban legends and the paranormal, founded by Ukinami Yuzuha.',
  'Krampus Compliance Authority': 'The internal watchdog of TOPS, making sure TOPS-affiliated companies keep to its rules.',
  'Stars of Lyra': 'Built around Astra Yao, New Eridu’s most famous singer, and managed by her bodyguard Evelyn.',
  'Flint Workshop': 'The Flint family’s workshop. The family’s blood lets them forge the special material Flint Porcelloy; Claret is a weaponmaster and Roxy works the forge.',
  'Metropolitan Order Division': 'A police-style branch of New Eridu Public Security that oversees the city’s safety and residents.',
  'External Strategy Department': 'A Roscaelifer department of the Marcel Group, headed by Velina Airgid, that investigates Flint Porcelloy.',
  Phaethon: 'The legendary Proxy run in secret by siblings Belle and Wise, who guide people through Hollows remotely.',
  'Covenant of Dayat': 'A mysterious group met in Roscaelifer. Remielle Dan is its only known member so far.',
  'New Eridu Defense Force': 'The city’s military, which deals with outside threats, contains Hollows and pushes into new territory.',
  'New Eridu Public Security': 'New Eridu’s police, keeping the peace through several branches.',
  Roscaelifer: 'A floating city above New Eridu, run through its Five Central Departments.',
  'Administrative Affairs Department': 'Roscaelifer’s supreme governing body, directed by Eldreda Sunbringer.',
  'Airspace Patrol Department': 'Roscaelifer’s military and security force, led by Lindverne Sunbringer.',
  'Central Computing Department': 'Roscaelifer’s computing centre, which generates the Rosetta Data. Managed by Dracaene Sunbringer.',
  'Unknown Realm': 'Guests from beyond New Eridu, arriving in the Honkai: Star Rail collaboration. Kafka and Robin are its first members.',
};

// Extra facts shown when a faction entry is expanded. Story details are
// included, since the story chapters they come from are out.
export const FACTION_MORE = {
  'Cunning Hares': [
    'Officially named Gentle House; the Cunning Hares nickname is how New Eridu knows them.',
    'Most members were wanderers Nicole took in, and they now look out for each other like family.',
    'Nicole is close to the Phaethon siblings and often turns up in the main story.',
  ],
  'Victoria Housekeeping Co.': [
    'Von Lycaon coordinates missions and represents the company; Rina is its longest-serving member.',
    'Its true head is New Eridu’s Mayor, of the powerful Mayflower family.',
    'On the Mayor’s orders they look after the Phaethon siblings and gave them an upgraded H.D.D. system.',
  ],
  'Belobog Heavy Industries': [
    'Motto: “Our goal is not to build a house, but a home.”',
    'Its staff are all Hollow Investigators who take on dangerous jobs inside the Hollows.',
    'The company fell on hard times after Koleda’s father vanished; she and her friends are rebuilding it.',
    'Grace built its four giant machines, each with a mind of its own: Greta, Hans, Friday and Geroy.',
  ],
  'Sons of Calydon': [
    'Officially Leaps and Bounds Express Services Co., a logistics company.',
    'Caesar is Overlord of the Outer Ring’s Motor League, won in the Tour de Inferno; the gang was once led by Big Daddy.',
    'Lighter is the gang’s Champion and Piper drives its truck; Billy Kid is a former member.',
  ],
  'Hollow Special Operations Section 6': [
    'Investigates and destroys the most dangerous Hollows, and tests new H.A.N.D. and HIA technology.',
    'Miyabi is the youngest Void Hunter, a title inherited from one of New Eridu’s founding heroes, and carries the cursed sword Tailless.',
    'Yanagi is Deputy Chief, Harumasa the Executive Officer, and Soukaku a young Oni in Yanagi’s care.',
  ],
  'Criminal Investigation Special Response Team': [
    'Works mainly around Lumina Square in the Janus Quarter, with undercover agents among its ranks.',
    'Exposed Deputy Commander Bringer’s conspiracy to unleash Tailless at a public rally.',
    'That case also revealed more about the Lowell siblings and the fall of the Old Capital.',
  ],
  'Defense Force - Silver Squad': [
    'Created by Silver Company, a Defense Force subsidiary shut down for its unethical and costly methods.',
    'Soldier 0 – Anby was the first and strongest of the clones, and the squad’s captain.',
    'Soldier 11 is one of its few survivors and later moved to the Obol Squad.',
  ],
  'Obol Squad': [
    'Part of the Obsidian Division, the only Division left since the Old Capital fell to Hollow Zero.',
    'Steps in when H.A.N.D. and Section 6 can’t handle a Hollow, and researches beyond New Eridu.',
    'Soldier 0 – Anby isn’t a member but still helps them from time to time.',
  ],
  'Yunkui Summit': [
    'Based at Suibian Temple. The Qingming Sword decides who becomes High Preceptor.',
    'The sword protects everyone but its wielder, who slowly loses their senses and memories.',
    'Yijiang took up the sword to guard her sister Yixuan’s future; Yixuan leads without wielding it.',
    'Ye Shunguang now holds the Qingming Sword as the Void Hunter Qingming Arbiter.',
  ],
  Mockingbird: [
    'Founded by Jack, who mentored both Hugo Vlad and Von Lycaon.',
    'After Jack’s death, Lycaon left over a disagreement with Hugo about the way forward.',
    'Hugo later took in Vivian, a big fan of Phaethon.',
  ],
  'Angels of Delusion': [
    'Usually found at the bar Error 404; their fans are called the Delulus.',
    'Aria is the lead singer, Nangong Yu leads and handles choreography, and Sunna composes and writes the songs.',
  ],
  'Spook Shack': [
    'Not a company or crew: anyone can join, and it works behind the scenes rather than in the field.',
    'Co-founded by Yuzuha and her classmate Komano Manato.',
    'Alice gave up her family’s pharmaceutical patent to save Yuzuha.',
  ],
  'Krampus Compliance Authority': [
    'When rules are broken, Krampus “corrects” the offender in ways meant to warn everyone else.',
    'Named after the folklore creature who punishes naughty children; it has a fearsome reputation inside TOPS.',
    'Zhao is seen by other TOPS staff as a “walking disaster”.',
  ],
  'Stars of Lyra': [
    'Evelyn arranges Astra’s schedule, protects her, and checks out anyone who gets close to her.',
    'Despite her fame, Astra chooses underground shows at Reverb Arena over Starloop Tower.',
  ],
  'Metropolitan Order Division': [
    'A sister division of the Criminal Investigation Special Response Team within Public Security.',
    'Cissia works there as a Case Specialist; Severian Lowell, Seth’s brother, is also a member.',
  ],
  'External Strategy Department': [
    'Norma Hollowell is its Chief Technician.',
    'More is expected as the Roscaelifer story continues.',
  ],
  Phaethon: [
    'Belle and Wise run the video store Random Play as their public cover.',
    'They studied at Helios Academy under the researcher Carole Arna, where they got their special ocular implants.',
    'Eous is Phaethon’s Hollow avatar, and Fairy their AI assistant; Pyrois is the first Agent to join them.',
  ],
  'Airspace Patrol Department': [
    'Part of Roscaelifer and the Marcel Group, working roughly like an air force.',
    'Sigrid de L’Azur is its Deputy.',
  ],
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
