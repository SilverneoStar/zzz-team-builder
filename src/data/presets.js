// Well-known community team archetypes. Loading one copies it into the team
// you're editing, with each member's signature W-Engine equipped.
import { signatureOf } from './game.js';

export const PRESETS = [
  { name: 'Ellen Freeze', members: ['ellen-joe', 'von-lycaon', 'soukaku'], bangboo: 'sharkboo' },
  { name: 'Zhu Yuan Ether', members: ['zhu-yuan', 'qingyi', 'nicole-demara'], bangboo: null },
  { name: 'Jane Assault', members: ['jane-doe', 'seth-lowell', 'caesar-king'], bangboo: null },
  { name: 'Miyabi Frost', members: ['hoshimi-miyabi', 'tsukishiro-yanagi', 'astra-yao'], bangboo: null },
];

export function presetLoadouts(members) {
  return Object.fromEntries(
    members.filter(Boolean).map((id) => [id, { wEngine: signatureOf(id)?.id ?? null }]),
  );
}
