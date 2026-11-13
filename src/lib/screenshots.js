// Reads in-game screenshots (and the site's own exported images) in the
// browser: the text is read with Tesseract.js, loaded from a CDN the first time
// it's needed, and the pictures never leave the device or get saved.
//
// What it understands:
//   • a team or build image from this site: its code (from inside the PNG
//     file when it's the saved image, otherwise read off the picture)
//   • a Drive Disc screen: set, slot, rank (from its max level), main stat and
//     substats with their +upgrades
//   • an Agent's Base Stats screen: which Agent, level, and the game's own
//     Active Modifier Count, to compare with the site's
//   • the Equipment screen: the W-Engine's name
import { AGENTS, DISC_MAIN_STATS, DRIVE_DISC_SETS, W_ENGINES } from '../data/game.js';
import { decodeCardCode } from './cardCode.js';
import { readCode } from './pngText.js';

const TESSERACT = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
let loading = null;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = TESSERACT;
    s.async = true;
    s.onload = () => resolve(window.Tesseract);
    s.onerror = () => {
      loading = null;
      reject(new Error('Couldn’t load the text reader. Check your connection and try again.'));
    };
    document.head.appendChild(s);
  });
  return loading;
}

// QR codes: the browser's own reader where there is one, else jsQR (Apache 2.0) from the CDN.
const JSQR = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
let jsqrLoading = null;
const loadJsQR = () =>
  window.jsQR
    ? Promise.resolve(window.jsQR)
    : (jsqrLoading ??= new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = JSQR;
        s.onload = () => resolve(window.jsQR);
        s.onerror = () => {
          jsqrLoading = null;
          reject(new Error('qr'));
        };
        document.head.appendChild(s);
      }));

/** The text of a QR code in the picture, or null. Looks at the whole picture, then its bottom-right corner. */
async function readQR(bitmap) {
  if ('BarcodeDetector' in window) {
    try {
      const found = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(bitmap);
      if (found[0]?.rawValue) return found[0].rawValue;
    } catch {
      /* fall back to jsQR */
    }
  }
  const jsQR = await loadJsQR().catch(() => null);
  if (!jsQR) return null;
  const tries = [
    [0.55, 0.55, 1, 1],
    [0.45, 0, 1, 0.45],
    [0, 0, 1, 1],
  ];
  for (const [x0, y0, x1, y1] of tries) {
    const c = await crop(bitmap, x0, y0, x1, y1);
    // Large pictures are scaled down (quicker, just as good); small re-shared
    // ones scaled up so each square of the code is a few pixels.
    const k = Math.min(2, 1600 / Math.max(c.width, c.height));
    const s = document.createElement('canvas');
    s.width = Math.round(c.width * k);
    s.height = Math.round(c.height * k);
    s.getContext('2d').drawImage(c, 0, 0, s.width, s.height);
    const img = s.getContext('2d').getImageData(0, 0, s.width, s.height);
    const r = jsQR(img.data, img.width, img.height);
    if (r?.data) return r.data;
  }
  return null;
}

let worker = null;
let progress = null;
async function getWorker() {
  const T = await loadTesseract();
  worker ??= T.createWorker('eng', 1, {
    logger: (m) => m.status === 'recognizing text' && progress?.(m.progress),
  });
  return worker;
}
const CODE_CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ-';

async function readText(source, onProgress, params = null) {
  const w = await getWorker();
  progress = onProgress;
  await w.setParameters(params ?? { tessedit_char_whitelist: '', tessedit_pageseg_mode: '3' });
  // Tesseract.js takes a canvas, image, Blob or URL, but not an ImageBitmap:
  // draw bitmaps onto a canvas first (an ImageBitmap reads as nothing).
  let src = source;
  if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) {
    src = document.createElement('canvas');
    src.width = source.width;
    src.height = source.height;
    src.getContext('2d').drawImage(source, 0, 0);
  }
  const { data } = await w.recognize(src);
  return data.text;
}

/** Part of the picture (fractions of its width and height) as a canvas. */
async function crop(bitmap, x0, y0, x1, y1) {
  const c = document.createElement('canvas');
  c.width = Math.round(bitmap.width * (x1 - x0));
  c.height = Math.round(bitmap.height * (y1 - y0));
  c.getContext('2d').drawImage(bitmap, -bitmap.width * x0, -bitmap.height * y0);
  return c;
}

/**
 * Skill levels from the Skills tab: the game's digits are heavy italics that
 * one reading often gets wrong, so each level is read eight ways and kept only
 * when at least two readings agree. Positions are for phone screenshots
 * (about 2.2 : 1); [basic, dodge, assist, special, chain], null where unsure.
 */
async function readSkillLevels(bitmap, onProgress) {
  const centres = [0.59, 0.667, 0.744, 0.823, 0.9];
  const ways = [
    [1, true, '7'],
    [2, true, '7'],
    [4, true, '8'],
    [2, false, '7'],
    [4, false, '8'],
    [3, true, '7'],
    [3, false, '7'],
    [2, true, '8'],
  ];
  const out = [];
  for (const cx of centres) {
    const x0 = cx - 0.035;
    const x1 = cx + 0.005;
    const sw = Math.round(bitmap.width * (x1 - x0));
    const sh = Math.round(bitmap.height * 0.055);
    const votes = {};
    for (const [k, thresh, psm] of ways) {
      const c = document.createElement('canvas');
      c.width = sw * k + 40;
      c.height = sh * k + 40;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, bitmap.width * x0, bitmap.height * 0.705, sw, sh, 20, 20, sw * k, sh * k);
      const img = ctx.getImageData(20, 20, sw * k, sh * k);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const m = Math.max(d[i], d[i + 1], d[i + 2]);
        d[i] = d[i + 1] = d[i + 2] = thresh ? (m > 150 ? 0 : 255) : 255 - m;
      }
      ctx.putImageData(img, 20, 20);
      const t = (await readText(c, onProgress, { tessedit_char_whitelist: '0123456789', tessedit_pageseg_mode: psm })).trim();
      const n = /^\d{1,2}$/.test(t) ? Number(t) : NaN;
      if (n >= 1 && n <= 16) votes[n] = (votes[n] ?? 0) + 1;
    }
    const best = Object.entries(votes).sort((a, b) => b[1] - a[1]);
    out.push(best[0] && best[0][1] >= 3 && (!best[1] || best[1][1] * 2 <= best[0][1]) ? Number(best[0][0]) : null);
  }
  return out;
}

/** The Active Modifier Count from the Base Stats tab (right of its label), or null. */
async function readCount(bitmap, onProgress) {
  const x0 = 0.745, y0 = 0.76, x1 = 0.81, y1 = 0.83;
  const w = Math.round(bitmap.width * (x1 - x0)), h = Math.round(bitmap.height * (y1 - y0));
  const c = document.createElement('canvas');
  c.width = w * 3;
  c.height = h * 3;
  const ctx = c.getContext('2d');
  ctx.drawImage(bitmap, bitmap.width * x0, bitmap.height * y0, w, h, 0, 0, c.width, c.height);
  // Bright in any channel (the pink digits) → black on white.
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) d[i] = d[i + 1] = d[i + 2] = Math.max(d[i], d[i + 1], d[i + 2]) > 140 ? 0 : 255;
  ctx.putImageData(img, 0, 0);
  const t = await readText(c, onProgress, { tessedit_char_whitelist: '0123456789', tessedit_pageseg_mode: '7' });
  const m = t.match(/\d{1,2}/);
  return m ? Number(m[0]) : null;
}

/** The picture as a canvas, cropped to its bottom part (where codes are), scaled, and as dark text on white. */
async function codeStrip(bitmap, scale, threshold) {
  const top = Math.round(bitmap.height * 0.8);
  const h = bitmap.height - top;
  const k = (Math.max(1, 2400 / bitmap.width) * scale);
  const c = document.createElement('canvas');
  c.width = Math.round(bitmap.width * k);
  c.height = Math.round(h * k);
  const ctx = c.getContext('2d');
  ctx.drawImage(bitmap, 0, top, bitmap.width, h, 0, 0, c.width, c.height);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    let v = 255 - (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
    if (threshold) v = v > threshold ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

const norm = (s) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();

// ---------- codes ----------

/** Finds a valid card code in OCR text: groups of 5 letters/digits joined by dashes. */
export function findCode(text) {
  const flat = text
    .toUpperCase()
    .replace(/-\s*\n\s*/g, '-') // codes wrapped over two lines
    .replace(/[ \t]+-[ \t]*/g, '-');
  const runs = flat.match(/[0-9A-Z]{4,5}(?:-[0-9A-Z]{1,5}){3,}/g) ?? [];
  for (const run of runs.sort((a, b) => b.length - a.length)) {
    const fixed = run.replace(/O/g, '0').replace(/[IL]/g, '1').replace(/U/g, 'V');
    const t = decodeCardCode(fixed);
    if (t) return { code: fixed, team: t };
  }
  return null;
}

// ---------- Drive Disc screens ----------

const SUB_NAMES = [
  ['CRIT Rate', 'CRIT Rate'],
  ['CRIT DMG', 'CRIT DMG'],
  ['Anomaly Proficiency', 'Anomaly Proficiency'],
  ['PEN', 'PEN'],
  ['ATK', 'ATK'],
  ['HP', 'HP'],
  ['DEF', 'DEF'],
];
const MAIN_NAMES = [
  ['CRIT Rate', 'CRIT Rate'],
  ['CRIT DMG', 'CRIT DMG'],
  ['Anomaly Proficiency', 'Anomaly Proficiency'],
  ['Anomaly Mastery', 'Anomaly Mastery'],
  ['PEN Ratio', 'PEN Ratio'],
  ['Energy Regen', 'Energy Regen'],
  ['Impact', 'Impact'],
  [/(Physical|Fire|Ice|Electric|Ether|Wind) DMG(?: Bonus)?/i, 'Attribute DMG'],
  ['ATK', 'ATK'],
  ['HP', 'HP'],
  ['DEF', 'DEF'],
];
const RANK_BY_MAX = { 15: 'S', 12: 'A', 9: 'B' };

/**
 * A line like "HP +4 15%" → { stat, up, pct }. Some screenshots read the values
 * as their own column after the names, so with `bare` a name with no value
 * counts too (`bare: true`; parseDisc hands it the value from that column).
 */
function statLine(line, names, bare = false) {
  const l = line.replace(/[|_—~]+/g, ' ').trim();
  const tail = bare ? String.raw`(?:\s+([\d.,]+)\s*(%?))?` : String.raw`\s+([\d.,]+)\s*(%?)`;
  for (const [pat, stat] of names) {
    const src = typeof pat === 'string' ? pat.replace(/ /g, String.raw`\s+`) : pat.source;
    const m = l.match(new RegExp(String.raw`^${src}\b\s*(?:\+\s*(\d))?` + tail, 'i'));
    if (m) {
      const k = typeof pat === 'string' ? 1 : 2;
      if (m[k + 1] == null) {
        // A stray character before the value: take the first number later on the line.
        const later = l.slice(m[0].length).match(/^\W{0,3}([\d.,]+)\s*(%?)/);
        if (later) return { stat, up: Number(m[k] ?? 0), pct: later[2] === '%', bare: false, val: later[1] };
      }
      return { stat, up: Number(m[k] ?? 0), pct: m[k + 2] === '%', bare: m[k + 1] == null, val: m[k + 1] };
    }
  }
  return null;
}
const VALUE_ONLY = /^[\d.,]+\s*%?$/;
// ATK, HP and DEF substats come flat or as a percentage. The "%" is easy to
// miss, so the value decides: a percentage roll is a few points (3% a roll),
// a flat one is much larger (19 ATK, 112 HP, 15 DEF a roll).
const FLAT_ROLL = { S: { ATK: 19, HP: 112, DEF: 15 }, A: { ATK: 13, HP: 75, DEF: 10 } };
const PCT_ROLL = { S: { ATK: 3, HP: 3, DEF: 4.8 }, A: { ATK: 2, HP: 2, DEF: 3.2 } };
function flatOrPct(st, rank) {
  const v = parseFloat(String(st.val ?? '').replace(',', '.'));
  if (!Number.isFinite(v)) return st.pct;
  const n = 1 + (st.up ?? 0);
  const flat = (FLAT_ROLL[rank] ?? FLAT_ROLL.S)[st.stat] * n;
  const pct = (PCT_ROLL[rank] ?? PCT_ROLL.S)[st.stat] * n;
  return Math.abs(Math.log(v / pct)) < Math.abs(Math.log(v / flat));
}

/** { slot, set, rank, level, main, subs, four } from a Drive Disc screen, or null. */
export function parseDisc(text) {
  if (!/sub-?\s*stats/i.test(text) || !/main\s*stat/i.test(text)) return null;
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const mainAt = lines.findIndex((l) => /^main\s*stat/i.test(l));
  const subAt = lines.findIndex((l) => /^sub-?\s*stats/i.test(l));
  const endAt = lines.findIndex((l, i) => i > subAt && /^set\s*effect/i.test(l));
  // The set: the first known set name above "Main Stat" (it can wrap onto two lines).
  const above = norm(lines.slice(0, Math.max(0, mainAt)).join(' '));
  const set = [...DRIVE_DISC_SETS]
    .map((d) => ({ d, at: above.lastIndexOf(norm(d.name)) }))
    .filter((x) => x.at >= 0)
    .sort((x, y) => y.at - x.at || y.d.name.length - x.d.name.length)[0]?.d;
  const slotHit = lines.slice(0, Math.max(1, mainAt)).join(' ').match(/[[(|]\s*([1-6])\s*[\])|]/);
  const lv = text.match(/[LTlti]v\.?\s*(\d{1,2})\s*\/\s*(\d{1,2})/i);
  const rank = lv ? (RANK_BY_MAX[Number(lv[2])] ?? 'S') : 'S';

  // Values read as their own column (after the names) are handed out in order.
  const values = lines.slice(mainAt + 1).filter((l) => VALUE_ONLY.test(l));
  let guessed = 0;
  const fill = (st) => {
    if (st?.bare) {
      const v = values.shift();
      st.pct = !!v?.endsWith('%');
      st.val = v?.replace('%', '');
      guessed += 1;
    }
    return st;
  };

  let mainRaw = null;
  if (mainAt >= 0) {
    for (const l of lines.slice(mainAt + 1, subAt > mainAt ? subAt : mainAt + 3)) {
      const st = fill(statLine(l, MAIN_NAMES, true));
      if (st) {
        mainRaw = st.pct && ['ATK', 'HP', 'DEF'].includes(st.stat) ? `${st.stat}%` : st.stat;
        break;
      }
    }
  }
  // No slot number read: work it out from the main stat where only one slot has it.
  const FIXED = { HP: 1, ATK: 2, DEF: 3 };
  const only = mainRaw && [4, 5, 6].filter((n) => DISC_MAIN_STATS[n].includes(mainRaw));
  const slot = slotHit ? Number(slotHit[1]) : (FIXED[mainRaw] ?? (only?.length === 1 ? only[0] : null));
  if (!slot) return null;
  // Slots 4–6 never have a flat main stat: a missed "%" is still a percentage.
  if (slot >= 4 && ['ATK', 'HP', 'DEF'].includes(mainRaw)) mainRaw = `${mainRaw}%`;
  const main = slot >= 4 && DISC_MAIN_STATS[slot].includes(mainRaw) ? mainRaw : null;

  const subs = [];
  lines.slice(subAt + 1, endAt > subAt ? endAt : subAt + 6).forEach((l) => {
    const st = fill(statLine(l, SUB_NAMES, true));
    if (!st || subs.length >= 4) return;
    const stat = ['ATK', 'HP', 'DEF'].includes(st.stat) && flatOrPct(st, rank) ? `${st.stat}%` : st.stat;
    if (!subs.some((x) => x.stat === stat)) subs.push({ stat, up: Math.min(5, st.up) });
  });
  const ups = subs.reduce((n, x) => n + x.up, 0);
  return { kind: 'disc', slot, set: set?.id ?? null, setName: set?.name ?? null, rank, level: lv ? Number(lv[1]) : null, main, mainRaw, subs, four: ups > 4, guessed };
}

/** Two readings of the same disc screen combined: the fuller one wins each part. */
export function mergeDisc(a, b) {
  if (!a || !b) return a ?? b;
  return {
    ...a,
    slot: a.slot ?? b.slot,
    set: a.set ?? b.set,
    setName: a.setName ?? b.setName,
    main: a.main ?? b.main,
    level: a.level ?? b.level,
    // More substats wins; on a tie, the reading that paired fewer values by guess.
    ...(() => {
      const w = b.subs.length > a.subs.length || (b.subs.length === a.subs.length && (b.guessed ?? 0) < (a.guessed ?? 0)) ? b : a;
      return { subs: w.subs, four: w.four, guessed: w.guessed };
    })(),
  };
}

// ---------- Agent screens ----------

// Edit distance, for names the text reader got slightly wrong ("Savertan Lowell").
function distance(a, b) {
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cur = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return d[b.length];
}

/** Which Agent a screen is about, by name: exact first, then the closest line. */
function findAgent(text) {
  const t = norm(text);
  const exact = [...AGENTS].sort((a, b) => b.name.length - a.name.length).find((a) => t.includes(norm(a.name)));
  if (exact) return exact;
  let best = null;
  text.split('\n').forEach((raw) => {
    const line = norm(raw);
    if (line.length < 4) return;
    AGENTS.forEach((a) => {
      const n = norm(a.name);
      const score = 1 - distance(line, n) / Math.max(line.length, n.length);
      if (score >= 0.7 && (!best || score > best.score)) best = { a, score };
    });
  });
  return best?.a ?? null;
}

/** Base Stats: { agentId, level, active } or null. */
export function parseBaseStats(text) {
  if (!/crit\s*dmg/i.test(text) || !/energy\s*regen/i.test(text) || /sub-?\s*stats/i.test(text)) return null;
  const agent = findAgent(text);
  const lv = text.match(/Lv\.?\s*(\d{1,2})\s*\/?\s*(\d{2})?/i);
  let am = text.match(/Active\s*Modifier[\s\S]{0,40}?(\d{1,2})/i);
  if (!am) {
    // The label is often misread; the count is the lone number on the line after Energy Regen.
    const lines = text.split('\n');
    const er = lines.findIndex((l) => /energy\s*regen/i.test(l));
    am = er >= 0 ? (lines.slice(er + 1, er + 3).join(' ').match(/(?:^|\s)(\d{1,2})(?=\s|$)/) ?? null) : null;
  }
  return { kind: 'stats', agentId: agent?.id ?? null, level: lv ? Number(lv[1]) : null, active: am ? Number(am[1]) : null };
}

/** The Skills tab: recognised so it isn't reported as unreadable (skill levels aren't used yet). */
export function parseSkills(text) {
  // The level digits are stylised and often unread: the three tab names, with no
  // stats, W-Engine or disc on the page, also mean the Skills tab.
  const levels = (text.match(/\b\d{2}\s*\/?\s*12\b/g) ?? []).length >= 3;
  const tabs = /base\s*stats/i.test(text) && /equipment/i.test(text) && /sk[il1|]{1,3}s/i.test(text);
  if (!(/base\s*stats/i.test(text) && (levels || tabs))) return null;
  // Levels read as "11 12" or "11/12", in the game's order (Basic, Dodge,
  // Assist, Special, Chain). Only used when all five are read.
  const nums = [...text.matchAll(/\b(\d{1,2})\s*[/|]?\s*1[2-6]\b/g)].map((m) => Number(m[1])).filter((n) => n >= 1 && n <= 16);
  return { kind: 'skills', levels: nums.length === 5 ? nums : null };
}

/** Equipment: the W-Engine's name, or null. */
export function parseEquipment(text) {
  const t = norm(text);
  const w = [...W_ENGINES].sort((a, b) => b.name.length - a.name.length).find((x) => t.includes(norm(x.name)));
  if (!w) return null;
  const agent = findAgent(text);
  const phase = text.match(/Phase\s*([1-5])/i) ?? text.match(/\bP([1-5])\b/);
  return { kind: 'engine', wEngine: w.id, name: w.name, agentId: agent?.id ?? null, phase: phase ? Number(phase[1]) : null };
}

/**
 * Reads one picture: the code stored in it, else its text. Returns a result
 * object ({ kind: 'code' | 'disc' | 'stats' | 'engine' | 'unknown', … }).
 */
export async function readScreenshot(file, onProgress) {
  const stored = await readCode(file).catch(() => null);
  if (stored) {
    const team = decodeCardCode(stored);
    if (team) return { kind: 'code', code: stored, team, exact: true };
  }
  const bitmap = await createImageBitmap(file);
  try {
    // A QR code from one of the site's images: exact, and no text reading needed.
    const qr = await readQR(bitmap);
    const qc = qr?.match(/(?:^ZZZ:|#code=)([0-9A-Za-z-]+)/)?.[1];
    const qt = qc && decodeCardCode(qc);
    if (qt) return { kind: 'code', code: qc, team: qt, exact: true };
    const text = await readText(bitmap, onProgress);
    const code = findCode(text);
    if (code) return { kind: 'code', ...code, exact: false };
    let found = parseDisc(text);
    if (found || /sub-?\s*stats|main\s*stat/i.test(text)) {
      // Disc screens: read the details column on its own too, and combine.
      const col = await crop(bitmap, 0.3, 0.12, 0.54, 0.92);
      found = mergeDisc(found, parseDisc(await readText(col, onProgress)));
    }
    found ??= parseBaseStats(text) ?? parseEquipment(text) ?? parseSkills(text);
    if (found?.kind === 'skills' && !found.levels) {
      const lv = await readSkillLevels(bitmap, onProgress);
      if (lv.some((n) => n != null)) found.levels = lv;
    }
    if (found?.kind === 'stats') {
      // The Active Modifier Count is pink on dark and often half-read: read its
      // box again on its own, digits only.
      const n = await readCount(bitmap, onProgress);
      if (n != null && (found.active == null || n >= found.active)) found.active = n;
    }
    if (found && !/(TEAM|BUILD)\s*C[O0]DE/i.test(text)) return found;
    // A team or build image from this site: read the code strip more carefully,
    // a few ways, and keep the first reading whose check digit matches.
    if (/(TEAM|BUILD)\s*C[O0]DE/i.test(text)) {
      for (const [scale, threshold] of [[1.5, 150], [3, 150], [1.5, 110], [2, 0]]) {
        const strip = await codeStrip(bitmap, scale, threshold);
        const t = await readText(strip, onProgress, { tessedit_char_whitelist: CODE_CHARS, tessedit_pageseg_mode: '6' });
        const c = findCode(t);
        if (c) return { kind: 'code', ...c, exact: false };
      }
      return { kind: 'unknown', reason: 'code' };
    }
    return found ?? { kind: 'unknown' };
  } finally {
    bitmap.close?.(); // nothing of the picture is kept
  }
}
