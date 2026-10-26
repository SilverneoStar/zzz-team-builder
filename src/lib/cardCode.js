import {
  BANGBOO_BY_ID,
  DISC_MAIN_STATS,
  DRIVE_DISC_BY_ID,
  TEAM_SIZE,
  W_ENGINE_BY_ID,
  AGENT_BY_ID,
} from '../data/game.js';
import { RANKS, SLOTS, normaliseDiscs } from './discs.js';
import { hasPotential } from '../data/potentials.js';

// Card codes: the short code printed on team images, e.g.
//   A4R0E-8F2KQ-0X9ZM-D3T5B-7HW1C-6NP0J
// It carries the squad, Bangboo, W-Engines (with Phase), Mindscapes,
// Potentials and Drive Discs, in about 30 characters. The longer "zzz2~…"
// team code still works for sharing and importing.
//
// Layout, all bits written most significant first:
//   check value (5)
//   Agent × 3 (7 each)        index + 1 in AGENT_ORDER, 0 = empty slot
//   Bangboo (6)               index + 1 in BANGBOO_ORDER, 0 = none
//   per filled Agent:
//     W-Engine (7)            index + 1 in W_ENGINE_ORDER, 0 = none
//     Phase − 1 (3) · Mindscape (3) · Potential (3)
//     disc mode (2)           1 = no discs at all
//                             2 = slots 1–4 share one set, slots 5–6 share
//                                 another (or none), every disc S-rank:
//                                 set A (6) · set B (6) · main stats for
//                                 slots 4, 5, 6 (3 each)
//                             0 = the six discs written out:
//                                 set (6) · rank (2) · main (3) each
//   zero padding to a whole 5-character group
//
// IMPORTANT: every list below is APPEND-ONLY. A code stores positions in
// these lists, so reordering or removing an entry would break codes people
// have already shared. When the game adds an Agent, W-Engine, Drive Disc set
// or Bangboo, add it at the END of its list.

// prettier-ignore
const AGENT_ORDER = ['alexandrina-sebastiane', 'alice-thymefield', 'anby-demara', 'anton-ivanov', 'aria', 'asaba-harumasa', 'astra-yao', 'banyue', 'ben-bigger', 'billy-kid', 'burnice-white', 'caesar-king', 'cissia', 'claret-flint', 'corin-wickes', 'dialyn', 'ellen-joe', 'evelyn-chevalier', 'grace-howard', 'hoshimi-miyabi', 'hugo-vlad', 'jane-doe', 'ju-fufu', 'koleda-belobog', 'komano-manato', 'lighter', 'lucia-elowen', 'luciana-de-montefio', 'nangong-yu', 'nekomiya-mana', 'nicole-demara', 'norma-hollowell', 'orphie-magnusson-and-magus', 'pan-yinhu', 'piper-wheel', 'promeia', 'pulchra-fellini', 'pyrois', 'qingyi', 'remielle-dan', 'roxy-ifrita-pryce', 'seed', 'seth-lowell', 'sigrid-de-lazur', 'soldier-0-anby', 'soldier-11', 'soukaku', 'starlight-billy-kid', 'sunna', 'trigger', 'tsukishiro-yanagi', 'ukinami-yuzuha', 'velina-airgid', 'vivian-banshee', 'von-lycaon', 'ye-shunguang', 'yidhari-murphy', 'yixuan', 'zhao', 'zhu-yuan', 'phoenix-reffaella', 'severian-lowell', 'sunbringer', 'kafka', 'robin-hsr'];

// prettier-ignore
const W_ENGINE_ORDER = ['cinder-cobalt', 'identity-base', 'identity-inflection', 'lunar-decrescent', 'lunar-noviluna', 'lunar-pleniluna', 'lunar-semiluna', 'magnetic-storm-alpha', 'magnetic-storm-bravo', 'magnetic-storm-charlie', 'reverb-mark-i', 'reverb-mark-ii', 'reverb-mark-iii', 'vortex-arrow', 'vortex-hatchet', 'vortex-revolver', 'street-superstar', 'slice-of-time', 'rainforest-gourmet', 'starlight-engine', 'steam-oven', 'precious-fossilized-core', 'original-transmorpher', 'weeping-gemini', 'electro-lip-gloss', 'bunny-band', 'spring-embrace', 'puzzle-sphere', 'gilded-blossom', 'radiowave-journey', 'marcato-desire', 'reel-projector', 'catty-luck', 'boisterous-echoes', 'cauldron-of-clarity', 'the-simmering-pot', 'bloodmarrow-coffer', 'demara-battery-mark-ii', 'the-vault', 'housekeeper', 'starlight-engine-replica', 'drill-rig-red-axis', 'big-cylinder', 'bashful-demon', 'kaboom-the-cannon', 'peacekeeper-specialized', 'roaring-ride', 'box-cutter', 'tremor-trigram-vessel', 'grill-owisp', 'cannon-rotor', 'unfettered-game-ball', 'six-shooter', 'steel-cushion', 'the-brimstone', 'krakens-cradle', 'tusks-of-fury', 'hailstorm-shrine', 'hellfire-gears', 'the-restrained', 'blazing-laurel', 'flamemaker-shaker', 'fusion-compiler', 'deep-sea-visitor', 'zanshin-herb-case', 'weeping-cradle', 'timeweaver', 'riot-suppressor-mark-vi', 'ice-jade-teapot', 'sharpened-stinger', 'myriad-eclipse', 'bellicose-blaze', 'elegant-vanity', 'heartstring-nocturne', 'flight-of-fancy', 'half-sugar-bunny', 'spectral-gaze', 'qingming-birdcage', 'severed-innocence', 'roaring-fur-nace', 'practiced-perfection', 'metanukimorphosis', 'cloudcleave-radiance', 'dreamlit-hearth', 'cordis-germina', 'wrathful-vajra', 'yesterday-calls', 'thoughtbop', 'angel-in-the-shell', 'neon-fantasies', 'serpentine-seeker', 'starlight-rider-faceplate', 'frostfall-sickle', 'sol-exuvia', 'joyau-dore', 'chief-sidekick', 'ode-of-resurrected-wings', 'knights-extolment', 'crimson-thirst', 'crimson-moon-casket', 'candlelit-scheme', 'sin-ban-cage', 'nirvana-s-first-plume', 'sunbringer-signature', 'robin-hsr-signature'];

// prettier-ignore
const DISC_ORDER = ['astral-voice', 'branch-and-blade-song', 'bunny-in-wonderland', 'chaos-jazz', 'chaotic-metal', 'dawns-bloom', 'fanged-metal', 'feathered-fate', 'freedom-blues', 'hormone-punk', 'inferno-metal', 'king-of-the-summit', 'moonlight-lullaby', 'notes-from-the-chained', 'phaethons-melody', 'polar-metal', 'proto-punk', 'puffer-electro', 'shadow-harmony', 'shining-aria', 'shockstar-disco', 'soul-rock', 'swing-jazz', 'the-sky-ablaze', 'thorned-rose', 'thunder-metal', 'white-water-ballad', 'woodpecker-electro', 'wuthering-salon', 'yunkui-tales'];

// prettier-ignore
const BANGBOO_ORDER = ['agent-gulliver', 'amillion', 'ariel', 'avocaboo', 'baddieboo', 'bagboo', 'bangvolver', 'belion', 'biggest-fan', 'bild-n-boolok', 'birkblick', 'boollseye', 'booltergeist', 'booressure', 'brawlerboo', 'butler', 'cryboo', 'devilboo', 'electroboo', 'excaliboo', 'exploreboo', 'knightboo', 'luckyboo', 'magnetiboo', 'mercury', 'miss-esme', 'officer-cui', 'overtimeboo', 'paperboo', 'penguinboo', 'plugboo', 'red-moccus', 'resonaboo', 'robin', 'rocketboo', 'safety', 'sharkboo', 'snap', 'sprout', 'sumoboo', 'ultra-jake'];

// Crockford base 32: no I, L, O or U, so codes are easy to read and type.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const SALT = 0x15; // change if the layout ever changes, so old and new codes can't be mixed up
const GROUP = 5;

class BitWriter {
  bits = [];
  write(value, width) {
    for (let i = width - 1; i >= 0; i -= 1) this.bits.push((value >> i) & 1);
  }
}

class BitReader {
  constructor(bits) {
    this.bits = bits;
    this.pos = 0;
  }
  read(width) {
    if (this.pos + width > this.bits.length) throw new Error('short');
    let v = 0;
    for (let i = 0; i < width; i += 1) v = (v << 1) | this.bits[this.pos++];
    return v;
  }
}

const toChars = (bits) => {
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    let v = 0;
    for (let k = 0; k < 5; k += 1) v = (v << 1) | (bits[i + k] ?? 0);
    out += ALPHABET[v];
  }
  return out;
};

const toBits = (chars) =>
  [...chars].flatMap((ch) => {
    const v = ALPHABET.indexOf(ch);
    return [4, 3, 2, 1, 0].map((i) => (v >> i) & 1);
  });

const check = (bits) => {
  let sum = 0;
  for (let i = 0; i < bits.length; i += 5) {
    let v = 0;
    for (let k = 0; k < 5; k += 1) v = (v << 1) | (bits[i + k] ?? 0);
    sum += v * (i / 5 + 3);
  }
  return sum % 32 ^ SALT;
};

const pos = (list, id) => (id ? list.indexOf(id) + 1 : 0); // 0 = none; −1 + 1 = 0 also when unknown
const mainIndex = (slot, main) => (main ? DISC_MAIN_STATS[slot].indexOf(main) + 1 : 0);

/** Slots 1–4 one set, slots 5–6 another (or none), all S-rank: the usual 4 + 2 build. */
function simple(discs) {
  const [a, b] = [discs[0].set, discs[4].set];
  return a && discs.slice(0, 4).every((d) => d.set === a) && discs[5].set === b && discs.every((d) => d.rank === 'S');
}

/** The short code for a team. `loadoutOf(team, id)` returns an Agent's gear. */
export function encodeCardCode(team, loadoutOf) {
  const w = new BitWriter();
  for (let i = 0; i < TEAM_SIZE; i += 1) w.write(pos(AGENT_ORDER, team.members[i]), 7);
  w.write(pos(BANGBOO_ORDER, team.bangboo), 6);
  team.members.forEach((id) => {
    if (!id) return;
    const lo = loadoutOf(team, id);
    w.write(pos(W_ENGINE_ORDER, lo.wEngine), 7);
    w.write(Math.max(0, (lo.refinement ?? 1) - 1), 3);
    w.write(lo.mindscape ?? 0, 3);
    w.write(lo.potential ?? 0, 3);
    if (lo.discs.every((d) => !d.set && !d.main && d.rank === 'S')) {
      w.write(1, 2);
    } else if (simple(lo.discs)) {
      w.write(2, 2);
      w.write(pos(DISC_ORDER, lo.discs[0].set), 6);
      w.write(pos(DISC_ORDER, lo.discs[4].set), 6);
      [4, 5, 6].forEach((s) => w.write(mainIndex(s, lo.discs[s - 1].main), 3));
    } else {
      w.write(0, 2);
      SLOTS.forEach((s) => {
        const d = lo.discs[s - 1];
        w.write(pos(DISC_ORDER, d.set), 6);
        w.write(Math.max(0, RANKS.indexOf(d.rank)), 2);
        w.write(s >= 4 ? mainIndex(s, d.main) : 0, 3);
      });
    }
  });
  const body = w.bits;
  while (body.length % 5 !== 0) body.push(0);
  const c = new BitWriter();
  c.write(check(body), 5);
  const chars = toChars([...c.bits, ...body]);
  return chars.match(new RegExp(`.{1,${GROUP}}`, 'g')).join('-');
}

const fromPos = (list, n) => (n === 0 ? null : (list[n - 1] ?? undefined));

/** { members, bangboo, loadouts } from a short code, or null if it isn't valid. */
export function decodeCardCode(code) {
  const chars = (code ?? '').toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  if (chars.length < 10 || [...chars].some((ch) => !ALPHABET.includes(ch))) return null;
  const bits = toBits(chars);
  const body = bits.slice(5);
  const r = new BitReader(bits);
  try {
    if (r.read(5) !== check(body)) return null;
    const members = [];
    const seen = new Set();
    for (let i = 0; i < TEAM_SIZE; i += 1) {
      const id = fromPos(AGENT_ORDER, r.read(7));
      if (id === undefined || (id && (!AGENT_BY_ID[id] || seen.has(id)))) return null;
      if (id) seen.add(id);
      members.push(id);
    }
    if (!members.some(Boolean)) return null;
    const bangboo = fromPos(BANGBOO_ORDER, r.read(6));
    if (bangboo === undefined || (bangboo && !BANGBOO_BY_ID[bangboo])) return null;

    const loadouts = {};
    for (const id of members) {
      if (!id) continue;
      const wEngine = fromPos(W_ENGINE_ORDER, r.read(7));
      if (wEngine === undefined || (wEngine && !W_ENGINE_BY_ID[wEngine])) return null;
      const refinement = r.read(3) + 1;
      const mindscape = r.read(3);
      const potential = r.read(3);
      if (refinement > 5 || mindscape > 6 || potential > 6) return null;
      const set = (n) => {
        const s = fromPos(DISC_ORDER, n);
        if (s === undefined || (s && !DRIVE_DISC_BY_ID[s])) throw new Error('bad set');
        return s;
      };
      const main = (slot, n) => {
        if (n === 0) return null;
        const m = DISC_MAIN_STATS[slot][n - 1];
        if (!m) throw new Error('bad main');
        return m;
      };
      let discs;
      const mode = r.read(2);
      if (mode === 3) return null;
      if (mode === 1) {
        discs = SLOTS.map(() => ({ set: null, rank: 'S', main: null }));
      } else if (mode === 2) {
        const a = set(r.read(6));
        const b = set(r.read(6));
        const mains = [4, 5, 6].map((s) => main(s, r.read(3)));
        discs = SLOTS.map((s) => ({ set: s <= 4 ? a : b, rank: 'S', main: s >= 4 ? mains[s - 4] : null }));
      } else {
        discs = SLOTS.map((s) => {
          const d = { set: set(r.read(6)), rank: RANKS[r.read(2)] ?? 'S' };
          const m = r.read(3);
          return { ...d, main: s >= 4 ? main(s, m) : null };
        });
      }
      loadouts[id] = {
        wEngine,
        refinement,
        mindscape,
        potential: hasPotential(id) ? potential : 0,
        discs: normaliseDiscs(discs),
      };
    }
    return { name: 'Shared team', members, bangboo, loadouts };
  } catch {
    return null;
  }
}
