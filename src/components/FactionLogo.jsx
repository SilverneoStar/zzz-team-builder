// Faction logos in public/factions/<slug>.webp. Add a slug here when adding a
// logo; factions without one show nothing extra.
const WITH_LOGO = new Set([
  'cunning-hares',
  'yunkui-summit',
  'hollow-special-operations-section-6',
  'sons-of-calydon',
  'victoria-housekeeping-co',
  'spook-shack',
  'metropolitan-order-division',
  'covenant-of-dayat',
  'defense-force-silver-squad',
  'phaethon',
  'krampus-compliance-authority',
  'belobog-heavy-industries',
  'angels-of-delusion',
  'criminal-investigation-special-response-team',
  'stars-of-lyra',
  'external-strategy-department',
  'mockingbird',
  'flint-workshop',
  'obol-squad',
  'airspace-patrol-department',
  'administrative-affairs-department',
  'central-computing-department',
]);
const BASE = import.meta.env.BASE_URL;
export const factionSlug = (name) =>
  (name ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
export const factionLogo = (name, base = BASE) =>
  WITH_LOGO.has(factionSlug(name)) ? `${base}factions/${factionSlug(name)}.webp` : null;

export default function FactionLogo({ faction, size = 20 }) {
  const src = factionLogo(faction);
  if (!src) return null;
  return <img className="faction-logo" src={src} alt="" width={size} height={size} loading="lazy" />;
}
