import { ATTRIBUTES } from '../data/game.js';

// Highlights the words that matter when building a team for a buff or enemy
// (attributes in their colour, specialties, key stats and numbers), so players
// can pick their own Agents even without the recommended ones.
const ATTR_COLOR = Object.fromEntries(ATTRIBUTES.map((a) => [a.name.toLowerCase(), a.color]));
const SPECIALTY_NAMES = ['Attack', 'Stun', 'Anomaly', 'Support', 'Defense', 'Rupture', 'Armorer'];
// A specialty only counts when it names Agents ("Stun Agents", "Anomaly specialty"),
// so "Special Attack" or "Stun recovery" aren't mistaken for one.
const SPECIALTIES = SPECIALTY_NAMES.flatMap((n) => [`${n} Agents`, `${n} Agent`, `${n} specialty`]);
const STATS = [
  'Attribute Anomaly DMG',
  'Anomaly Proficiency',
  'Disorder',
  'Sheer DMG',
  'Sharp DMG',
  'Daze',
  'Stunned',
  'Stun',
  'CRIT',
  'PEN Ratio',
  'Energy',
  'Decibels',
  'Ultimate',
  'EX Special Attack',
  'Chain Attack',
  'All-Attribute RES',
  'Miasma',
  'parried',
  'Perfect Dodge',
  'Perfect Assist',
  'Basic Attack',
  'Special Attack',
  'Ether Veil',
  'Control Skill',
  'Defensive Assist',
  'Anomaly Buildup',
  'Anomaly DMG',
];
const attrNames = ATTRIBUTES.map((a) => a.name);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const terms = [...new Set([...STATS, ...attrNames, ...SPECIALTIES])].sort((a, b) => b.length - a.length);
const RE = new RegExp(`(\\d[\\d,.]*%?|\\b(?:${terms.map(esc).join('|')})\\b)`, 'g');

export default function Keywords({ text }) {
  return text.split(RE).map((part, i) => {
    if (!part) return null;
    if (i % 2 === 0) return part;
    const low = part.toLowerCase();
    if (ATTR_COLOR[low]) {
      return (
        <b key={i} className="kw kw--attr" style={{ color: ATTR_COLOR[low] }}>
          {part}
        </b>
      );
    }
    if (/^\d/.test(part)) {
      return (
        <b key={i} className="kw kw--num">
          {part}
        </b>
      );
    }
    if (SPECIALTIES.includes(part)) {
      return (
        <b key={i} className="kw kw--spec">
          {part}
        </b>
      );
    }
    return (
      <b key={i} className="kw kw--stat">
        {part}
      </b>
    );
  });
}
