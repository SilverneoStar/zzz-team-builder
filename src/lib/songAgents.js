// Which Agents a song belongs to, going by the names in its title and album
// ("1% Battery Girl - Phoenix EP" is Phoenix's). Each Agent is matched by the
// names fans and the soundtrack use for them, as whole words in the same case,
// so "Billy Mode" is Billy's while "billy" in a sentence isn't. Names that are
// also everyday words ("Starlight", "Seed") or shared ("Demara") are left out.
import { AGENTS } from '../data/agents.js';

const ALIASES = {
  'alexandrina-sebastiane': ['Alexandrina', 'Rina'],
  'asaba-harumasa': ['Harumasa'],
  'komano-manato': ['Manato'],
  'nekomiya-mana': ['Nekomiya', 'Nekomata'],
  'tsukishiro-yanagi': ['Yanagi'],
  'ukinami-yuzuha': ['Yuzuha'],
  'nangong-yu': ['Nangong Yu'],
  'pan-yinhu': ['Pan Yinhu'],
  'von-lycaon': ['Lycaon'],
  'soldier-0-anby': ['Soldier 0'],
  'soldier-11': ['Soldier 11'],
  'starlight-billy-kid': [],
  'orphie-magnusson-and-magus': ['Orphie'],
  'roxy-ifrita-pryce': ['Roxy'],
  'remielle-dan': ['Remielle'],
  'phoenix-reffaella': ['Phoenix'],
  'severian-lowell': ['Severian'],
  'sigrid-de-lazur': ['Sigrid'],
  'luciana-de-montefio': ['Luciana'],
  'ju-fufu': ['Ju Fufu'],
  'zhu-yuan': ['Zhu Yuan'],
  'jane-doe': ['Jane Doe', 'Jane'],
  'seed': [],
};
// First names that would catch too much on their own.
const SKIP_FIRST = new Set(['Soldier', 'Starlight', 'Seed', 'Ju', 'Pan', 'Nangong', 'Zhu', 'Von']);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MATCHERS = AGENTS.map((a) => {
  const first = a.name.split(/\s+/)[0];
  // Listed names, or else the full name and the first name; an empty list means
  // the Agent isn't matched at all (their name is an everyday word).
  const listed = ALIASES[a.id];
  const names = listed ? (listed.length ? [a.name, ...listed] : []) : [a.name, ...(SKIP_FIRST.has(first) ? [] : [first])];
  return {
    id: a.id,
    name: a.name,
    re: names.length ? new RegExp(`(^|[^\\p{L}\\p{N}])(${names.map(escape).join('|')})(?![\\p{L}\\p{N}])`, 'u') : null,
  };
}).filter((m) => m.re);

/** The ids of the Agents a song is about, from its name and album. */
export function songAgents(song) {
  const text = `${song.name || ''} ${song.album || ''}`;
  return MATCHERS.filter((m) => m.re.test(text)).map((m) => m.id);
}

/** All Agents, for naming them in lists. */
export const AGENT_NAMES = Object.fromEntries(AGENTS.map((a) => [a.id, a.name]));
