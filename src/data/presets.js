// Well-known community team archetypes. Loading one copies it into the team
// you're editing, with each member's signature W-Engine equipped.
import { signatureOf } from './game.js';

export const PRESETS = [
  { name: 'Ellen Freeze', members: ['ellen-joe', 'von-lycaon', 'soukaku'], bangboo: 'sharkboo' },
  { name: 'Zhu Yuan Ether', members: ['zhu-yuan', 'qingyi', 'nicole-demara'], bangboo: null },
  { name: 'Jane Assault', members: ['jane-doe', 'seth-lowell', 'caesar-king'], bangboo: null },
  { name: 'Miyabi Frost', members: ['hoshimi-miyabi', 'tsukishiro-yanagi', 'astra-yao'], bangboo: null },
  // Recommended in HoYoverse's official Phoenix reveal (Version 3.3).
  { name: 'Phoenix · Velina · Remielle', members: ['phoenix-reffaella', 'velina-airgid', 'remielle-dan'], bangboo: null },
  { name: 'Phoenix · Velina · Yuzuha', members: ['phoenix-reffaella', 'velina-airgid', 'ukinami-yuzuha'], bangboo: null },
];

export function presetLoadouts(members) {
  return Object.fromEntries(
    members.filter(Boolean).map((id) => [id, { wEngine: signatureOf(id)?.id ?? null }]),
  );
}
