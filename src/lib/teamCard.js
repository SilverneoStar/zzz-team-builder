// Draws team images on a canvas, and the shared drawing helpers (fonts,
// backgrounds, Agent art, rank badges) that agentCards.js and
// endgameCards.js reuse. Loaded only when an image is exported.
import { FILM_STRIPS } from './filmStrips.js';
import {
  AGENT_BY_ID,
  ATTRIBUTE_BY_ID,
  BANGBOO_BY_ID,
  DRIVE_DISC_BY_ID,
  SPECIALTY_BY_ID,
  W_ENGINE_BY_ID,
  initials,
  shortName,
} from '../data/game.js';
import { encodeCardCode } from './cardCode.js';
import { loadoutOf } from './teamsReducer.js';
import { discBonuses } from './discs.js';
import { DISCS_WITH_ART } from '../components/DiscArt.jsx';
import { factionLogo } from '../components/FactionLogo.jsx';
import { BANGBOO_WITH_ART } from '../components/BangbooArt.jsx';
import { wEngineArtStem } from '../components/WEngineArt.jsx';
import { ROMAN, hasPotential } from '../data/potentials.js';
import { BANGBOO_FOCUS, DEFAULT_FOCUS } from '../data/bangbooFocus.js';
import { memberIndex, shownFaction } from './memberArt.js';
import { EXPORT_SCALE } from './exportSettings.js';

// Re-exported so older imports keep working.
export { EXPORT_SCALE, EXPORT_SIZES, TEAM_LAYOUTS, canvasToBlob } from './exportSettings.js';

// Team images, in three layouts (see TEAM_LAYOUTS in exportSettings.js):
//   columns  1200×675  three gear columns (the original card)
//   squad    1200×675  big slanted Agent cards like the in-game squad screen
//   square   1080×1080 one row per Agent, for square posts
const SIZES = { columns: [1200, 675], squad: [1200, 675], square: [1080, 1080] };

export const FONT = '"IBM Plex Sans", system-ui, sans-serif';
export const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
export const MONO = '"IBM Plex Mono", ui-monospace, monospace';
export const BADGE = '"Inter", "Arial Black", sans-serif';

export function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Draws `img` to cover the box like CSS object-fit: cover, then zooms in on `focus` ("x% y%"). */
function coverAt(ctx, img, x, y, w, h, focus = '50% 40%', zoom = 1) {
  const [fx, fy] = focus.split(' ').map((v) => parseFloat(v) / 100);
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  const ox = x + fx * w;
  const oy = y + fy * h;
  const dx = x + (w - dw) * fx;
  const dy = y + (h - dh) * fy;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, ox + (dx - ox) * zoom, oy + (dy - oy) * zoom, dw * zoom, dh * zoom);
  ctx.restore();
}

/**
 * An Agent's art for the exported images. Agents with several members
 * (Sunbringer) follow the reader's pick: one member's art, or the collage of
 * all of them as three equal strips stacked top to bottom, each framed on a
 * face, the same as on the site. `stack: [w, h]` is the shape of the frame
 * the art goes into, so the strips fit it.
 */
export async function loadAgentArt(agentOrId, base, { stack = [480, 600] } = {}) {
  const a = typeof agentOrId === 'string' ? AGENT_BY_ID[agentOrId] : agentOrId;
  if (!a) return null;
  if (!a.members) return loadImage(`${base}agents/${a.id}.webp`);
  const i = memberIndex(a);
  if (i >= 0) return loadImage(`${base}agents/${a.id}-${a.members[i].key}.webp`);
  const imgs = await Promise.all(a.members.map((m) => loadImage(`${base}agents/${a.id}-${m.key}.webp`)));
  const [sw, sh] = stack;
  const W = 600;
  const H = Math.round((600 * sh) / sw);
  const gap = 5;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.fillStyle = '#121212';
  g.fillRect(0, 0, W, H);
  const rowH = (H - gap * 2) / 3;
  a.members.slice(0, 3).forEach((m, k) => {
    // A light zoom keeps each face (eyes to chin) filling its strip.
    if (imgs[k]) coverAt(g, imgs[k], 0, k * (rowH + gap), W, rowH, m.stackFocus ?? m.focus, m.stackZoom ?? 1.1);
  });
  return c;
}

export function fit(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ---------- shared pieces ----------

export function background(ctx, W, H) {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);
  // Same strips as the page backdrop: a fixed step apart from the centre,
  // each a slightly different brightness.
  FILM_STRIPS.forEach(([k, alpha]) => {
    const x = W / 2 + k * 190;
    if (x < -400 || x > W + 400) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, H / 2);
    ctx.rotate((14 * Math.PI) / 180);
    const sw = 150;
    const sh = H * 1.8;
    ctx.fillStyle = '#131313';
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
    for (let y = -sh / 2; y < sh / 2; y += 22) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(-sw / 2 + 9, y, 10, 10);
      ctx.fillRect(sw / 2 - 19, y, 10, 10);
    }
    for (let y = -sh / 2 + 6; y < sh / 2; y += 116) {
      ctx.fillStyle = '#1b1b1b';
      ctx.fillRect(-sw / 2 + 29, y, sw - 58, 104);
    }
    ctx.restore();
  });
}

async function header(ctx, W, team, base, { titleSize = 54 } = {}) {
  const grad = ctx.createLinearGradient(40, 0, W - 40, 0);
  ['#4a4f5c', '#9ea4b1', '#c3c8d2', '#6b7180', '#464b57'].forEach((c, i, a) =>
    grad.addColorStop(i / (a.length - 1), c),
  );
  ctx.fillStyle = grad;
  roundRect(ctx, 40, 32, W - 80, 6, 3);
  ctx.fill();

  ctx.fillStyle = '#a3a3a3';
  ctx.font = `500 15px ${MONO}`;
  ctx.fillText('ZENLESS ZONE ZERO · TEAM BUILDER', 40, 74);
  ctx.fillStyle = '#f2f2f2';
  // Shrink a long team name to fit before cutting it short.
  const title = (team.name || 'Team').toUpperCase();
  let size = titleSize;
  ctx.font = `800 ${size}px ${DISPLAY}`;
  while (size > 34 && ctx.measureText(title).width > W - 260) {
    size -= 2;
    ctx.font = `800 ${size}px ${DISPLAY}`;
  }
  ctx.fillText(fit(ctx, title, W - 260), 40, 74 + titleSize);

  const mascot = await loadImage(`${base}mascot.svg`);
  if (mascot) ctx.drawImage(mascot, W - 150, 50, 110, 110);
}

function footer(ctx, W, H, team) {
  // The short card code: paste it into "Paste a friend's code" to load the team.
  ctx.fillStyle = '#b5b5b5';
  ctx.font = `600 13px ${MONO}`;
  ctx.fillText('TEAM CODE', 40, H - 66);
  const labelW = ctx.measureText('TEAM CODE').width;
  ctx.fillStyle = '#e6e6e6';
  ctx.font = `600 20px ${MONO}`;
  ctx.fillText(fit(ctx, encodeCardCode(team, loadoutOf), W - 120 - labelW), 40 + labelW + 16, H - 63);
  ctx.fillStyle = '#a3a3a3';
  ctx.font = `500 14px ${FONT}`;
  ctx.fillText(
    'silverneostar.github.io/zzz-team-builder · Unofficial fan project, not affiliated with HoYoverse',
    40,
    H - 35,
  );
  ctx.textAlign = 'right';
  ctx.fillText('salman-SilverStarneo', W - 40, H - 35);
  ctx.textAlign = 'left';
}

/** A slanted, rounded-ish frame with the art straightened inside it. */
export function slantedArt(ctx, { x, y, w, h, lean, art, agent, color, border = 3, radius = 0 }) {
  const path = () => {
    ctx.beginPath();
    if (radius) {
      // Rounded top-left and bottom-right corners, like the site's cards.
      ctx.moveTo(x + lean + radius, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - lean, y + h - radius);
      ctx.quadraticCurveTo(x + w - lean - 2, y + h, x + w - lean - radius, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + lean - 2, y + radius * 0.6);
      ctx.quadraticCurveTo(x + lean, y, x + lean + radius, y);
    } else {
      ctx.moveTo(x + lean, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - lean, y + h);
      ctx.lineTo(x, y + h);
    }
    ctx.closePath();
  };
  ctx.save();
  path();
  ctx.clip();
  const bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, '#2a3442');
  bg.addColorStop(1, '#1b2028');
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  if (art) {
    // Cover the frame, anchored to the top so faces stay in view.
    const s = Math.max(w / art.width, h / art.height);
    const dw = art.width * s;
    ctx.drawImage(art, x + (w - dw) / 2, y, dw, art.height * s);
  } else {
    ctx.fillStyle = '#f2f2f2';
    ctx.font = `800 ${Math.round(h * 0.3)}px ${DISPLAY}`;
    ctx.textAlign = 'center';
    ctx.fillText(initials(agent.name), x + w / 2, y + h / 2 + h * 0.1);
    ctx.textAlign = 'left';
  }
  ctx.restore();
  path();
  ctx.strokeStyle = color;
  ctx.lineWidth = border;
  ctx.stroke();
}

/** Small S/A/B badge drawn on the canvas, in the site's rank colours. */
export function rankBadge(ctx, rank, cx, cy, r) {
  const stops = {
    S: ['#ffe866', '#ff9d3a', '#ff3d8f'],
    A: ['#ff7ad9', '#e04cff', '#9c46ff'],
    B: ['#c35bff', '#7f7dff', '#47d9ff'],
  }[rank];
  if (!stops) return;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#16181d';
  ctx.fill();
  ctx.strokeStyle = '#5a5f68';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  stops.forEach((c, i) => g.addColorStop(i / 2, c));
  ctx.font = `italic 900 ${Math.round(r * 1.35)}px ${BADGE}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#e6e8ec';
  ctx.fillStyle = g;
  ctx.strokeText(rank, cx + 0.5, cy + 1);
  ctx.fillText(rank, cx + 0.5, cy + 1);
  ctx.restore();
}

/** Everything the layouts print about one Agent's gear. */
function gearOf(team, a) {
  const lo = loadoutOf(team, a.id);
  const w = lo.wEngine && W_ENGINE_BY_ID[lo.wEngine];
  const bonus = discBonuses(lo.discs);
  const four = bonus.four && DRIVE_DISC_BY_ID[bonus.four];
  const twos = bonus.twos.filter((id) => id !== bonus.four).map((id) => DRIVE_DISC_BY_ID[id].name);
  const statName = (m) => (m === 'Attribute DMG' ? `${ATTRIBUTE_BY_ID[a.attribute]?.name} DMG` : m);
  const main = (slot) => statName(lo.discs[slot - 1].main) ?? '—';
  return {
    mindscape: `M${lo.mindscape}${hasPotential(a.id) && lo.potential ? ` · Potential ${ROMAN[lo.potential]}` : ''}`,
    wEngine: w ? `${w.name} · P${lo.refinement}` : '—',
    wEngineRank: w?.rank ?? null,
    wEngineId: w && wEngineArtStem(w.id) ? w.id : null,
    fourId: four?.id ?? null,
    twoIds: bonus.twos.filter((id) => id !== bonus.four),
    setIds: [four?.id, ...bonus.twos.filter((id) => id !== bonus.four)].filter(Boolean),
    four: four?.name ?? '—',
    two: twos.join(' + ') || '—',
    discs: [four && `4 ${four.name}`, ...twos.map((n) => `2 ${n}`)].filter(Boolean).join(' + ') || 'No set bonuses',
    mains: [4, 5, 6].map((s) => `${s} ${main(s)}`).join(' · '),
    mainsShort: [4, 5, 6].map((s) => `${s} ${SHORT_STAT[lo.discs[s - 1].main] ?? main(s)}`).join(' · '),
    main,
  };
}

// Short stat names for tight spaces.
const SHORT_STAT = {
  'Anomaly Proficiency': 'AP',
  'Anomaly Mastery': 'AM',
  'CRIT Rate': 'CR',
  'CRIT DMG': 'CD',
  'Energy Regen': 'ER',
  'PEN Ratio': 'PEN%',
  'Attribute DMG': 'Elem DMG',
};

// Attribute and specialty icons (public/attributes, public/specialties).
// Variant attributes (Frost, Honed Edge, Auric Ink) use their base icon.
const ATTR_ICONS = new Set([
  'physical',
  'fire',
  'ice',
  'electric',
  'ether',
  'wind',
  'lumiflux',
  'sunbringer-fire',
  'frost',
  'honed-edge',
  'auric-ink',
]);
const attrIconId = (id) =>
  ATTR_ICONS.has(id) ? id : ATTR_ICONS.has(ATTRIBUTE_BY_ID[id]?.base) ? ATTRIBUTE_BY_ID[id].base : null;

/** Loads the attribute and specialty icons the given Agents need. */
export async function loadRoleIcons(base, agents) {
  const attr = {};
  const spec = {};
  await Promise.all(
    agents.filter(Boolean).flatMap((a) => [
      (async () => {
        const id = attrIconId(a.attribute);
        if (id && !(id in attr)) attr[id] = await loadImage(`${base}attributes/${id}.png`);
      })(),
      (async () => {
        if (a.specialty && !(a.specialty in spec))
          spec[a.specialty] = await loadImage(`${base}specialties/${a.specialty}.png`);
      })(),
    ]),
  );
  return { attr, spec };
}

/**
 * "[icon] Electric · [icon] Stun · S-Rank" at (x, baseline y), in the current
 * font and fill. Returns the width drawn.
 */
export function roleLine(ctx, a, icons, x, y, size, { rank = true } = {}) {
  let cx = x;
  const icon = (img) => {
    if (!img) return;
    ctx.drawImage(img, cx, y - size * 0.82, size, size);
    cx += size + 5;
  };
  const text = (t) => {
    ctx.fillText(t, cx, y);
    cx += ctx.measureText(t).width;
  };
  icon(icons?.attr[attrIconId(a.attribute)]);
  text(ATTRIBUTE_BY_ID[a.attribute]?.name ?? '');
  text('  ·  ');
  icon(icons?.spec[a.specialty]);
  text(SPECIALTY_BY_ID[a.specialty]?.name ?? '');
  if (rank && a.rank) text(`  ·  ${a.rank}-Rank`);
  return cx - x;
}

async function loadArt(team, base, artOpts = {}) {
  const arts = await Promise.all(team.members.map((id) => (id ? loadAgentArt(id, base, artOpts) : null)));
  const engines = {};
  await Promise.all(
    team.members.map(async (id) => {
      const lo = id && loadoutOf(team, id);
      const wid = lo?.wEngine;
      if (wid && wEngineArtStem(wid) && !engines[wid])
        engines[wid] = await loadImage(`${base}w-engines/${wEngineArtStem(wid)}.webp`);
    }),
  );
  const discs = {};
  const setIds = new Set();
  team.members.forEach((id) => {
    const a = id && AGENT_BY_ID[id];
    if (a) gearOf(team, a).setIds.forEach((s) => DISCS_WITH_ART.has(s) && setIds.add(s));
  });
  await Promise.all(
    [...setIds].map(async (s) => {
      discs[s] = await loadImage(`${base}discs/${s}.webp`);
    }),
  );
  const b = team.bangboo && BANGBOO_BY_ID[team.bangboo];
  const bArt = b ? await loadImage(`${base}bangboo/${BANGBOO_WITH_ART.has(b.id) ? b.id : 'placeholder'}.webp`) : null;
  const roles = await loadRoleIcons(
    base,
    team.members.map((id) => id && AGENT_BY_ID[id]),
  );
  const factions = {};
  await Promise.all(
    team.members.map(async (id) => {
      const f = id && shownFaction(AGENT_BY_ID[id]).logo;
      const src = f && factionLogo(f, base);
      if (src && !(f in factions)) factions[f] = await loadImage(src);
    }),
  );
  return { arts, bangboo: b, bArt, engines, discs, roles, factions };
}

/** W-Engine icon, scaled to fit a size×size box whose top-left is (x, y). */
export function engineIcon(ctx, img, x, y, size) {
  if (!img) return;
  const s = Math.min(size / img.width, size / img.height);
  const w = img.width * s;
  const h = img.height * s;
  ctx.drawImage(img, x + (size - w) / 2, y + (size - h) / 2, w, h);
}

/** Shrinks text from `size` down to `min` px until it fits `w`, then draws it (cut only if still too long). */
function fitText(ctx, text, x, y, w, size, min, weight = 600, family = FONT) {
  let px = size;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > min && ctx.measureText(text).width > w) {
    px -= 0.5;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  ctx.fillText(fit(ctx, text, w), x, y);
}

/** A faded faction logo inside a panel (clipped to it), behind its content. */
function factionWatermark(ctx, img, clip, x, y, size, alpha = 0.11) {
  if (!img) return;
  ctx.save();
  roundRect(ctx, clip.x, clip.y, clip.w, clip.h, clip.r);
  ctx.clip();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

/** Drive Disc set art in a row from (x, y top); returns the width used. */
export function discIcons(ctx, discs, ids, x, y, size, gap = 4) {
  let w = 0;
  ids.forEach((id) => {
    const img = discs[id];
    if (!img) return;
    ctx.drawImage(img, x + w, y, size, size);
    w += size + gap;
  });
  return w;
}

function bangbooLine(ctx, b, bArt, x, y) {
  ctx.fillStyle = '#b5b5b5';
  ctx.font = `600 14px ${MONO}`;
  ctx.fillText('BANGBOO', x, y);
  let bx = x + 100;
  if (bArt) {
    const h = 44;
    const w = (bArt.width / bArt.height) * h;
    ctx.drawImage(bArt, bx, y - 27, w, h);
    bx += w + 10;
  }
  ctx.fillStyle = '#f2f2f2';
  ctx.font = `700 20px ${FONT}`;
  ctx.fillText(b ? `${b.name}${b.rank ? ` · ${b.rank}-Rank` : ''}` : 'None', bx, y + 1);
}

// ---------- layouts ----------

async function drawColumns(ctx, W, H, team, base) {
  await header(ctx, W, team, base);
  const { arts, bangboo, bArt, engines, discs, roles, factions } = await loadArt(team, base);
  const colW = 352;
  const gap = 22;
  const top = 168;
  team.members.forEach((id, i) => {
    const x = 40 + i * (colW + gap);
    const a = id && AGENT_BY_ID[id];
    ctx.fillStyle = 'rgba(24,24,24,0.92)';
    roundRect(ctx, x, top, colW, 360, 14);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (!a) {
      ctx.fillStyle = '#555';
      ctx.font = `500 18px ${FONT}`;
      ctx.fillText('Empty slot', x + 24, top + 50);
      return;
    }
    const color = ATTRIBUTE_BY_ID[a.attribute]?.color ?? '#888';
    factionWatermark(
      ctx,
      factions[shownFaction(a).logo],
      { x, y: top, w: colW, h: 360, r: 14 },
      x + colW - 210,
      top + 140,
      240,
    );
    ctx.fillStyle = color;
    roundRect(ctx, x, top, colW, 5, 2);
    ctx.fill();

    // Portrait, about 15% bigger than before.
    slantedArt(ctx, { x: x + 20, y: top + 18, w: 86, h: 106, lean: 16, art: arts[i], agent: a, color });

    ctx.fillStyle = '#f2f2f2';
    fitText(ctx, a.name, x + 122, top + 62, colW - 140, 22, 15, 700);
    ctx.fillStyle = '#a3a3a3';
    ctx.font = `500 15px ${FONT}`;
    roleLine(ctx, a, roles, x + 120, top + 88, 18, { rank: false });

    const g = gearOf(team, a);
    const rows = [
      ['Mindscape', g.mindscape],
      ['W-Engine', g.wEngine],
      ['4-piece', g.four],
      ['2-piece', g.two],
      ['Slot 4', g.main(4)],
      ['Slot 5', g.main(5)],
      ['Slot 6', g.main(6)],
    ];
    rows.forEach(([k, v], r) => {
      const y = top + 148 + r * 31;
      ctx.fillStyle = '#b5b5b5';
      ctx.font = `600 13px ${MONO}`;
      ctx.fillText(k.toUpperCase(), x + 22, y);
      const icon = k === 'W-Engine' && g.wEngineId && engines[g.wEngineId];
      if (icon) engineIcon(ctx, icon, x + 120, y - 23, 32);
      const setIds = k === '4-piece' ? [g.fourId].filter(Boolean) : k === '2-piece' ? g.twoIds : [];
      const dw = setIds.length ? discIcons(ctx, discs, setIds, x + 122, y - 22, 28, 4) : 0;
      const ix = icon ? 38 : dw ? dw + 6 : 0;
      ctx.fillStyle = '#f2f2f2';
      fitText(ctx, v, x + 122 + ix, y, colW - 136 - ix, 17, 11);
    });
  });
  bangbooLine(ctx, bangboo, bArt, 40, 572);
  footer(ctx, W, H, team);
}

async function drawSquad(ctx, W, H, team, base) {
  await header(ctx, W, team, base, { titleSize: 44 });
  const { arts, bangboo, bArt, engines, discs, roles, factions } = await loadArt(team, base, { stack: [262, 244] });
  // Three big leaning cards, then the Bangboo disc, like the squad screen.
  const cardW = 262;
  const artH = 244;
  const lean = 46;
  const gap = 28;
  const top = 136;
  team.members.forEach((id, i) => {
    const x = 52 + i * (cardW + gap);
    const a = id && AGENT_BY_ID[id];
    // Dark card behind the art and footer.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + lean, top - 8);
    ctx.lineTo(x + cardW + 10, top - 8);
    ctx.lineTo(x + cardW + 10 - lean - 14, top + artH + 76);
    ctx.lineTo(x - 14, top + artH + 76);
    ctx.closePath();
    ctx.fillStyle = '#161616';
    ctx.fill();
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    if (!a) {
      ctx.fillStyle = '#555';
      ctx.font = `800 20px ${FONT}`;
      ctx.fillText('+ EMPTY', x + 70, top + artH / 2);
      return;
    }
    const color = ATTRIBUTE_BY_ID[a.attribute]?.color ?? '#888';
    slantedArt(ctx, { x, y: top, w: cardW, h: artH, lean, art: arts[i], agent: a, color, border: 2.5, radius: 14 });
    rankBadge(ctx, a.rank, x + 22, top + artH - 22, 15);

    // Footer: name and specialty, italic like the game.
    const fy = top + artH + 30;
    ctx.save();
    ctx.transform(1, 0, -0.18, 1, 0, 0);
    const sx = x + 6 + 0.18 * fy;
    ctx.fillStyle = '#f2f2f2';
    ctx.font = `800 24px ${FONT}`;
    const flogo = factions[shownFaction(a).logo];
    ctx.fillText(fit(ctx, shortName(a), cardW - (flogo ? 90 : 40)), sx, fy);
    ctx.fillStyle = '#cfcfcf';
    ctx.font = `800 15px ${FONT}`;
    roleLine(ctx, a, roles, sx, fy + 24, 17, { rank: false });
    ctx.restore();
    // Faction badge to the right of the name and specialty.
    if (flogo) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6;
      ctx.drawImage(flogo, x + cardW - 84, fy - 22, 40, 40);
      ctx.restore();
    }

    // Gear under the card.
    const g = gearOf(team, a);
    const gy = top + artH + 108;
    const icon = g.wEngineId && engines[g.wEngineId];
    const ix = icon ? 40 : 0;
    if (icon) engineIcon(ctx, icon, x - 12, gy - 24, 36);
    ctx.fillStyle = '#f2f2f2';
    fitText(ctx, g.wEngine, x - 10 + ix, gy, cardW - 4 - ix, 17, 12.5, 700);
    // Each disc set on its own line: "4 Set" then "2 Set".
    const sets = [g.fourId && [4, g.fourId], ...g.twoIds.map((sid) => [2, sid])].filter(Boolean).slice(0, 2);
    let ly = gy + 28;
    ctx.fillStyle = '#d6d6d6';
    if (!sets.length) {
      ctx.font = `500 15px ${FONT}`;
      ctx.fillText('No set bonuses', x - 10, ly);
      ly += 26;
    }
    sets.forEach(([n, sid]) => {
      const dw = discIcons(ctx, discs, [sid], x - 10, ly - 19, 24);
      const tx = x - 10 + (dw ? dw + 4 : 0);
      ctx.fillStyle = '#d6d6d6';
      fitText(ctx, `${n} ${DRIVE_DISC_BY_ID[sid]?.name ?? ''}`, tx, ly, cardW - 4 - (tx - x + 10), 15, 12, 500);
      ly += 27;
    });
    ctx.fillStyle = '#b5b5b5';
    fitText(ctx, `${g.mindscape} · ${g.mainsShort}`, x - 10, ly, cardW - 4, 14, 11, 600, MONO);
  });

  // Bangboo disc.
  const cx = 52 + 3 * (cardW + gap) + 60;
  const cy = top + 170;
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.fillStyle = '#161616';
  ctx.fill();
  if (bArt) {
    // Zoomed in on the head and upper body, cropped to the disc.
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 66, 0, Math.PI * 2);
    ctx.clip();
    const h = 210;
    const w = (bArt.width / bArt.height) * h;
    const [fx, fy] = BANGBOO_FOCUS[BANGBOO_WITH_ART.has(bangboo.id) ? bangboo.id : 'placeholder'] ?? DEFAULT_FOCUS;
    ctx.drawImage(bArt, cx - fx * w, cy - fy * h, w, h);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#2a2a2a';
  ctx.stroke();
  if (!bArt) {
    ctx.fillStyle = '#555';
    ctx.font = `800 40px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(bangboo ? bangboo.name.slice(0, 1) : '+', cx, cy + 14);
    ctx.textAlign = 'left';
  }
  ctx.fillStyle = '#a3a3a3';
  ctx.font = `500 13px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('BANGBOO', cx, cy + 98);
  ctx.fillStyle = '#f2f2f2';
  ctx.font = `700 17px ${FONT}`;
  ctx.fillText(bangboo ? fit(ctx, bangboo.name, 150) : 'None', cx, cy + 122);
  ctx.textAlign = 'left';
  footer(ctx, W, H, team);
}

async function drawSquare(ctx, W, H, team, base) {
  await header(ctx, W, team, base);
  const { arts, bangboo, bArt, engines, discs, roles, factions } = await loadArt(team, base);
  const top = 170;
  const rowH = 238;
  team.members.forEach((id, i) => {
    const y = top + i * (rowH + 14);
    const a = id && AGENT_BY_ID[id];
    ctx.fillStyle = 'rgba(24,24,24,0.92)';
    roundRect(ctx, 40, y, W - 80, rowH, 16);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (!a) {
      ctx.fillStyle = '#555';
      ctx.font = `500 20px ${FONT}`;
      ctx.fillText('Empty slot', 70, y + rowH / 2 + 7);
      return;
    }
    const color = ATTRIBUTE_BY_ID[a.attribute]?.color ?? '#888';
    factionWatermark(
      ctx,
      factions[shownFaction(a).logo],
      { x: 40, y, w: W - 80, h: rowH, r: 16 },
      W - 80 - 200,
      y - 10,
      rowH + 20,
    );
    ctx.fillStyle = color;
    roundRect(ctx, 40, y, 6, rowH, 3);
    ctx.fill();
    slantedArt(ctx, { x: 64, y: y + 18, w: 170, h: rowH - 36, lean: 30, art: arts[i], agent: a, color, radius: 10 });
    rankBadge(ctx, a.rank, 82, y + rowH - 38, 14);

    const tx = 262;
    ctx.fillStyle = '#f2f2f2';
    ctx.font = `700 30px ${FONT}`;
    ctx.fillText(fit(ctx, a.name, W - tx - 70), tx, y + 52);
    ctx.fillStyle = '#a3a3a3';
    ctx.font = `500 17px ${FONT}`;
    roleLine(ctx, a, roles, tx, y + 82, 20);

    const g = gearOf(team, a);
    const rows = [
      ['W-Engine', g.wEngine],
      ['Mindscape', g.mindscape],
      ['Discs', g.discs],
      ['Main stats', g.mains],
    ];
    rows.forEach(([k, v], r) => {
      const ry = y + 124 + r * 31;
      ctx.fillStyle = '#b5b5b5';
      ctx.font = `600 14px ${MONO}`;
      ctx.fillText(k.toUpperCase(), tx, ry);
      const icon = k === 'W-Engine' && g.wEngineId && engines[g.wEngineId];
      if (icon) engineIcon(ctx, icon, tx + 140, ry - 25, 34);
      const dw = k === 'Discs' ? discIcons(ctx, discs, g.setIds, tx + 142, ry - 23, 30, 5) : 0;
      const ix = (icon ? 44 : dw ? dw + 8 : 0) + 12;
      ctx.fillStyle = '#f2f2f2';
      ctx.font = `600 19px ${FONT}`;
      ctx.fillText(fit(ctx, v, W - tx - 200 - ix), tx + 130 + ix, ry);
    });
  });
  bangbooLine(ctx, bangboo, bArt, 40, top + 3 * (rowH + 14) + 30);
  footer(ctx, W, H, team);
}

const DRAW = { columns: drawColumns, squad: drawSquad, square: drawSquare };

export async function renderTeamCard(team, { base = '/', layout = 'columns', scale = EXPORT_SCALE } = {}) {
  await document.fonts?.ready;
  const id = DRAW[layout] ? layout : 'columns';
  const [W, H] = SIZES[id];
  // Drawn at `scale`× (same layout, more pixels; 2× by default) so text and icons stay sharp
  // when the image is zoomed, shared at full size or shown on high-DPI screens.
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  background(ctx, W, H);
  await DRAW[id](ctx, W, H, team, base);
  return canvas;
}
