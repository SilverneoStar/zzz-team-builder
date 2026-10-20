// Item icons in public/materials/<slug>.webp, by item name. Add a slug here
// when adding an icon; items without one keep their colour tile.
const WITH_ICON = new Set([
  'denny', 'hamster-cage-pass', 'senior-investigator-log', 'official-investigator-log',
  'basic-physical-chip', 'advanced-physical-chip', 'specialized-physical-chip',
  'w-engine-energy-module', 'w-engine-power-supply', 'crystallized-plating-agent', 'molded-plating-agent',
  'anomaly-component', 'reinforced-anomaly-component', 'specialized-anomaly-component', 'stun-component', 'reinforced-stun-component', 'specialized-stun-component', 'attack-component', 'reinforced-attack-component', 'specialized-attack-component',
  'support-component', 'reinforced-support-component', 'specialized-support-component', 'defense-component', 'reinforced-defense-component', 'specialized-defense-component',
  'armorer-component', 'reinforced-armorer-component', 'specialized-armorer-component', 'rupture-component', 'reinforced-rupture-component', 'specialized-rupture-component',
  'specialized-shock-chip', 'basic-freeze-chip', 'advanced-freeze-chip', 'basic-windbite-chip', 'advanced-windbite-chip', 'specialized-windbite-chip', 'basic-shock-chip', 'advanced-shock-chip', 'basic-burn-chip', 'advanced-burn-chip', 'basic-ether-chip', 'advanced-ether-chip', 'specialized-burn-chip', 'specialized-ether-chip', 'specialized-freeze-chip', 'advanced-lumiflux-chip',
  'energy-transfer-fluid', 'higher-dimensional-data-imitation-core', 'timeworn-husk',
  'higher-dimensional-data-bloodstained-miasma-feather', 'counterfeit-nucleus',
  'scarlet-engine', 'clouded-crystalline-substance', 'exuvia-of-refinement', 'crimson-miasma-spike',
  'ferocious-grip', 'living-drive', 'finale-dance-shoes', 'sycophant-s-refinement', 'marrow-draining-thorn',
  'higher-dimensional-data-murderous-obituary', 'higher-dimensional-data-crimson-awe', 'higher-dimensional-data-ethereal-pursuit',
  'higher-dimensional-data-steel-malice', 'higher-dimensional-data-destructive-advance', 'higher-dimensional-data-falling-fist',
  'higher-dimensional-data-stealth-phantom', 'higher-dimensional-data-thunderous-dragon', 'higher-dimensional-data-mortal-cleave', 'higher-dimensional-data-miasmic-elytron', 'higher-dimensional-data-toxic-edge', 'higher-dimensional-data-corrupted-dreamsteel', 'higher-dimensional-data-spiked-corruption-core', 'higher-dimensional-data-deep-erosion-circuit',
  'ruler-certification-seal', 'advanced-support-certification-seal', 'basic-support-certification-seal', 'trainee-investigator-log', 'defender-certification-seal', 'advanced-defense-certification-seal', 'basic-defense-certification-seal', 'buster-certification-seal', 'advanced-stun-certification-seal', 'basic-stun-certification-seal',
  'arbiter-certification-seal', 'advanced-rupture-certification-seal', 'basic-rupture-certification-seal', 'bladebearer-certification-seal', 'advanced-armorer-certification-seal', 'basic-armorer-certification-seal',
  'basic-lumiflux-chip', 'specialized-lumiflux-chip', 'controller-certification-seal', 'basic-anomaly-certification-seal', 'advanced-anomaly-certification-seal', 'pioneer-s-certification-seal', 'basic-attack-certification-seal', 'advanced-attack-certification-seal', 'bangboo-algorithm-module', 'ether-plating-agent', 'bangboo-system-widget', 'ether-electrolyte', 'concentrated-cooling-fluid',
]);
const BASE = import.meta.env.BASE_URL;
export const materialSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const materialIcon = (name, base = BASE) => {
  const slug = materialSlug(name);
  return WITH_ICON.has(slug) ? `${base}materials/${slug}.webp` : null;
};
