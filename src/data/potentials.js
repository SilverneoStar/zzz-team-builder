// Agents with Potential Vision: six levels bought with Potential Silhouettes
// that upgrade some skills and unlock an Awakened Potential. From the Zenless
// Zone Zero Wiki (October 2026); see NOTICE.md.
export const POTENTIAL_AGENTS = new Set([
  'alexandrina-sebastiane',
  'asaba-harumasa',
  'burnice-white',
  'ellen-joe',
  'grace-howard',
  'jane-doe',
  'koleda-belobog',
  'soldier-0-anby',
  'soldier-11',
  'von-lycaon',
]);
export const MAX_POTENTIAL = 6;

// Potential I widens some Additional Abilities: they also turn on with these
// specialties in the squad (from each Agent's Potential skills in data/skills/).
export const POTENTIAL_PASSIVE = {
  'ellen-joe': { specialties: ['stun'] },
  'grace-howard': { specialties: ['anomaly'] },
  'von-lycaon': { specialties: ['anomaly'] },
};
export const hasPotential = (id) => POTENTIAL_AGENTS.has(id);
export const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI'];
