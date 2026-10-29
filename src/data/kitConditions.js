// Squad conditions in Agents' Core Passives and kits that the Additional
// Ability check doesn't cover: a buff that only works with a certain kind of
// squadmate. The synergy score lists each one and counts the ones left unmet
// against the squad. From each Agent's skill text in data/skills/.
// `need(squad, me, base)` returns true when the squad meets it.
const others = (squad, me) => squad.filter((a) => a.id !== me.id);

export const KIT_CONDITIONS = {
  'severian-lowell': {
    text: '+27.5% DMG with another Wind Agent',
    need: (squad, me, base) => others(squad, me).some((a) => base(a.attribute) === 'wind'),
  },
  seed: {
    text: 'Vanguard buffs need an Attack squadmate',
    need: (squad, me) => others(squad, me).some((a) => a.specialty === 'attack'),
  },
  cissia: {
    text: 'Corrode Bone deals more Daze with Electric squadmates',
    need: (squad, me, base) => others(squad, me).some((a) => base(a.attribute) === 'electric'),
  },
};
