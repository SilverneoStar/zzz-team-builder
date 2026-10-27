// Shareable cards for one Agent, exported from their page:
//   build  1200×675  W-Engines, Drive Disc sets, main stats and Bangboo
//   farm   1200×675  everything to farm, grouped by what it's for
//   guide  1080×1350 one-page guide: build, best teams and what to farm
// Same black / gray / white look as the team images.
import {
  AGENT_BY_ID,
  ATTRIBUTE_BY_ID,
  BANGBOO_BY_ID,
  DRIVE_DISC_BY_ID,
  SPECIALTY_BY_ID,
  W_ENGINE_BY_ID,
  shortName,
} from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { SKILL_COUNT, materialsFor } from '../data/materials.js';
import { wEngineArtStem } from '../components/WEngineArt.jsx';
import { DISCS_WITH_ART } from '../components/DiscArt.jsx';
import { BANGBOO_WITH_ART } from '../components/BangbooArt.jsx';
import { setColor } from '../components/DiscWheel.jsx';
import { STAT_TARGETS } from '../data/statTargets.js';
import { materialIcon } from './materialIcons.js';
import { factionLogo } from '../components/FactionLogo.jsx';
import { discBonuses, mainMax, mainStatOf } from './discs.js';
import { buildCode } from './myBuilds.js';
import { shownFaction } from './memberArt.js';
import { ROMAN, hasPotential } from '../data/potentials.js';
import { SKILL_PRIORITY } from '../data/skillPriority.js';

const loadFactionLogo = async (a, base) => {
  const src = factionLogo(shownFaction(a).logo, base);
  return src ? loadImage(src) : null;
};
import {
  DISPLAY,
  EXPORT_SCALE,
  FONT,
  MONO,
  background,
  fit,
  loadAgentArt,
  loadImage,
  loadRoleIcons,
  rankBadge,
  roleLine,
  roundRect,
  slantedArt,
} from './teamCard.js';

// Card types live in exportSettings.js; re-exported so older imports keep working.
export { AGENT_CARDS, MY_BUILD_CARD } from './exportSettings.js';
const SIZES = { build: [1200, 675], farm: [1200, 675], guide: [1080, 1350], mine: [1200, 675] };

const K = {
  panel: 'rgba(24,24,24,0.94)',
  line: '#333',
  fg: '#f2f2f2',
  text: '#e6e6e6',
  muted: '#a3a3a3',
  dim: '#7a7a7a',
};
const fmt = (n) => n.toLocaleString('en');
const KIND = { seal: '#8fa3b8', chip: '#7fb89a', hdd: '#c9a56a', boss: '#d9826a', denny: '#9a9a9a', pass: '#b58fd0' };

/** Wraps text onto at most `max` lines of `w` pixels. */
function wrap(ctx, text, w, max = 3) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const word of words) {
    const t = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(t).width > w && cur) {
      lines.push(cur);
      cur = word;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  if (lines.length > max) {
    lines.length = max;
    lines[max - 1] = fit(ctx, `${lines[max - 1]}…`, w);
  }
  return lines;
}

function panel(ctx, x, y, w, h, title, note) {
  ctx.fillStyle = K.panel;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = K.muted;
  ctx.font = `600 14px ${MONO}`;
  ctx.fillText(title.toUpperCase(), x + 20, y + 30);
  if (note) {
    ctx.textAlign = 'right';
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${FONT}`;
    ctx.fillText(note, x + w - 20, y + 30);
    ctx.textAlign = 'left';
  }
}

function circleImage(ctx, img, cx, cy, r, ring) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#20252d';
  ctx.fill();
  ctx.clip();
  if (img) {
    const s = Math.max((r * 2) / img.width, (r * 2) / img.height);
    ctx.drawImage(img, cx - (img.width * s) / 2, cy - r, img.width * s, img.height * s);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = ring;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function engineIcon(ctx, img, x, y, size) {
  if (!img) return;
  const s = Math.min(size / img.width, size / img.height);
  ctx.drawImage(img, x + (size - img.width * s) / 2, y + (size - img.height * s) / 2, img.width * s, img.height * s);
}

async function head(ctx, W, a, base, subtitle) {
  const grad = ctx.createLinearGradient(40, 0, W - 40, 0);
  ['#4a4f5c', '#9ea4b1', '#c3c8d2', '#6b7180', '#464b57'].forEach((c, i, arr) =>
    grad.addColorStop(i / (arr.length - 1), c),
  );
  ctx.fillStyle = grad;
  roundRect(ctx, 40, 32, W - 80, 6, 3);
  ctx.fill();
  ctx.fillStyle = K.muted;
  ctx.font = `500 15px ${MONO}`;
  ctx.fillText(`ZENLESS ZONE ZERO · ${subtitle.toUpperCase()}`, 40, 72);
  const mascot = await loadImage(`${base}mascot.svg`);
  if (mascot) ctx.drawImage(mascot, W - 130, 46, 90, 90);
}

function foot(ctx, W, H) {
  ctx.fillStyle = K.muted;
  ctx.font = `500 14px ${FONT}`;
  ctx.fillText(
    'silverneostar.github.io/zzz-team-builder · Unofficial fan project, not affiliated with HoYoverse',
    40,
    H - 30,
  );
  ctx.textAlign = 'right';
  ctx.fillText('salman-SilverStarneo', W - 40, H - 30);
  ctx.textAlign = 'left';
}

async function loadEngines(ids, base) {
  const out = {};
  await Promise.all(
    ids.map(async (id) => {
      if (wEngineArtStem(id)) out[id] = await loadImage(`${base}w-engines/${wEngineArtStem(id)}.webp`);
    }),
  );
  return out;
}

async function loadDiscs(ids, base) {
  const out = {};
  await Promise.all(
    [...new Set(ids)].map(async (id) => {
      if (DISCS_WITH_ART.has(id)) out[id] = await loadImage(`${base}discs/${id}.webp`);
    }),
  );
  return out;
}

/** Agent name block with portrait, used at the top of every card. */
function agentBlock(ctx, a, art, x, y, { w = 150, h = 190, lean = 28, nameSize = 52, nameW = 760, roles = null } = {}) {
  const color = ATTRIBUTE_BY_ID[a.attribute]?.color ?? '#888';
  slantedArt(ctx, { x, y, w, h, lean, art, agent: a, color, radius: 10 });
  rankBadge(ctx, a.rank, x + 20, y + h - 20, 14);
  const tx = x + w + 28;
  ctx.fillStyle = K.fg;
  // Shrink a long name to fit before cutting it short.
  let size = nameSize;
  ctx.font = `800 ${size}px ${DISPLAY}`;
  while (size > 32 && ctx.measureText(a.name.toUpperCase()).width > nameW) {
    size -= 2;
    ctx.font = `800 ${size}px ${DISPLAY}`;
  }
  ctx.fillText(fit(ctx, a.name.toUpperCase(), nameW), tx, y + nameSize);
  ctx.fillStyle = K.muted;
  ctx.font = `500 18px ${FONT}`;
  roleLine(ctx, a, roles, tx, y + nameSize + 30, 22);
  return { tx, ty: y + nameSize + 30, color };
}

/** A rounded label; returns its width. */
function pill(
  ctx,
  text,
  x,
  y,
  { h = 28, size = 14, fg = K.text, bg = 'rgba(255,255,255,0.06)', line = '#3a3a3a' } = {},
) {
  ctx.font = `600 ${size}px ${FONT}`;
  const w = ctx.measureText(text).width + 24;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = fg;
  ctx.fillText(text, x + 12, y + h / 2 + size * 0.36);
  return w;
}

/** Role, faction and version chips, then the stat targets to aim for. */
function infoBlock(ctx, a, x, y, w, targetLines = 1, logo = null) {
  const t = STAT_TARGETS[a.id];
  let px = x;
  [
    t?.role,
    shownFaction(a).name,
    a.upcoming
      ? a.version
        ? `Ver ${a.version}${a.phase ? ` · phase ${a.phase}` : ''} · upcoming`
        : 'Upcoming'
      : `Ver ${a.version}`,
  ]
    .filter(Boolean)
    .forEach((label) => {
      if (label === shownFaction(a).name && logo) {
        // Faction logo just before its chip.
        ctx.drawImage(logo, px, y - 4, 36, 36);
        px += 40;
      }
      px += pill(ctx, label, px, y) + 8;
    });
  if (t?.targets?.length) {
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText('AIM FOR', x, y + 58);
    ctx.fillStyle = K.text;
    ctx.font = `500 16px ${FONT}`;
    wrap(ctx, t.targets.join(' · '), w - 90, targetLines).forEach((l, i) => ctx.fillText(l, x + 90, y + 58 + i * 22));
  }
}

// ---------- placeholder text for Agents without a build yet ----------

/** A titled panel of short verses (e.g. Sunbringer's reveal text), wrapped to fit. Returns its height. */
function drawQuote(ctx, quote, x, y, w, maxH) {
  const size = w > 900 ? 17 : 18;
  const lh = size * 1.38;
  ctx.font = `italic 500 ${size}px ${FONT}`;
  const blocks = quote.stanzas.map((st) => st.flatMap((line) => wrap(ctx, line, w - 48, 4)));
  const needed = 72 + blocks.reduce((n, b) => n + b.length * lh + 12, 0);
  const h = Math.min(maxH, needed);
  panel(ctx, x, y, w, h, '');
  // The title as written, rather than the panels' usual small caps.
  ctx.fillStyle = K.fg;
  ctx.font = `700 20px ${FONT}`;
  ctx.fillText(quote.title, x + 24, y + 36);
  let ty = y + 72;
  blocks.forEach((lines) => {
    lines.forEach((l, i) => {
      if (ty > y + h - 12) return;
      // The first line of each verse names the child; it's set brighter.
      ctx.fillStyle = i === 0 ? K.fg : K.text;
      ctx.font = `${i === 0 ? 'italic 700' : 'italic 500'} ${size}px ${FONT}`;
      ctx.fillText(l, x + 24, ty);
      ty += lh;
    });
    ty += 12;
  });
  return h;
}

// ---------- skill priority ----------

const SKILL_SHORT = { core: 'Core', basic: 'Basic', dodge: 'Dodge', assist: 'Assist', special: 'Special', chain: 'Chain' };

async function loadSkillIcons(ids, base) {
  const out = {};
  await Promise.all(ids.map(async (id) => (out[id] = await loadImage(`${base}skills/${id}.webp`))));
  return out;
}

/**
 * Skill icons in levelling order, best first, spread across `w` with › between.
 * Stacked puts each name under its icon; otherwise the name sits beside it.
 */
function drawPriority(ctx, ids, icons, x, y, w, size = 30, stacked = true) {
  const step = w / ids.length;
  ids.forEach((id, i) => {
    const cx = x + step * i + step / 2;
    const first = i === 0;
    ctx.font = `${first ? 700 : 500} ${stacked ? 13 : 14}px ${FONT}`;
    const label = SKILL_SHORT[id];
    const lw = ctx.measureText(label).width;
    if (first) {
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      if (stacked) roundRect(ctx, cx - step / 2 + 4, y - 4, step - 8, size + 30, 8);
      else roundRect(ctx, cx - (size + 6 + lw) / 2 - 8, y - 4, size + 6 + lw + 16, size + 8, (size + 8) / 2);
      ctx.fill();
    }
    const ix = stacked ? cx - size / 2 : cx - (size + 6 + lw) / 2;
    if (icons[id]) ctx.drawImage(icons[id], ix, y, size, size);
    ctx.fillStyle = first ? K.fg : i < 3 ? K.text : K.muted;
    if (stacked) {
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, y + size + 17);
      ctx.textAlign = 'left';
    } else {
      ctx.fillText(label, ix + size + 6, y + size / 2 + 5);
    }
    if (i < ids.length - 1) {
      ctx.fillStyle = K.dim;
      ctx.font = `600 16px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText('›', x + step * (i + 1), y + size / 2 + 6);
      ctx.textAlign = 'left';
    }
  });
}

// ---------- build ----------

function drawEngineRows(ctx, ids, icons, x, y, w, rowH, count) {
  ids.slice(0, count).forEach((id, i) => {
    const e = W_ENGINE_BY_ID[id];
    if (!e) return;
    const ry = y + i * rowH;
    engineIcon(ctx, icons[id], x, ry, rowH - 6);
    ctx.fillStyle = i === 0 ? K.fg : K.text;
    ctx.font = `${i === 0 ? 700 : 500} 20px ${FONT}`;
    ctx.fillText(fit(ctx, e.name, w - rowH - 60), x + rowH + 4, ry + rowH / 2 - 1);
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    const stat = e.advanced ? `${e.advanced.stat} ${e.advanced.max}` : '';
    ctx.fillText(
      fit(ctx, `${i === 0 ? 'BEST' : `#${i + 1}`}${stat ? ` · ${stat}` : ''}`, w - rowH - 60),
      x + rowH + 4,
      ry + rowH / 2 + 18,
    );
    rankBadge(ctx, e.rank, x + w - 18, ry + rowH / 2 - 4, 14);
  });
}

function drawSets(ctx, ids, x, y, w, count, gap = 30, discs = {}) {
  const size = Math.min(gap - 2, 32);
  ids.slice(0, count).forEach((id, i) => {
    const d = DRIVE_DISC_BY_ID[id];
    if (!d) return;
    const ry = y + i * gap;
    if (discs[id]) {
      ctx.drawImage(discs[id], x, ry - 6 - size / 2, size, size);
    } else {
      ctx.beginPath();
      ctx.arc(x + size / 2, ry - 6, 6, 0, Math.PI * 2);
      ctx.fillStyle = setColor(id);
      ctx.fill();
    }
    ctx.fillStyle = i === 0 ? K.fg : K.text;
    ctx.font = `${i === 0 ? 700 : 500} 19px ${FONT}`;
    ctx.fillText(fit(ctx, d.name, w - size - 12), x + size + 12, ry);
  });
}

function drawMains(ctx, b, x, y, w) {
  let ry = y;
  [4, 5, 6].forEach((s) => {
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText(`SLOT ${s}`, x, ry);
    ctx.fillStyle = K.text;
    ctx.font = `600 18px ${FONT}`;
    const lines = wrap(ctx, b.main[s].replace(/\bER\b/g, 'Energy Regen'), w - 80, 2);
    lines.forEach((l, i) => ctx.fillText(l, x + 80, ry + i * 21));
    ry += 21 + lines.length * 21;
  });
  const sy = ry + 6;
  ctx.fillStyle = K.dim;
  ctx.font = `500 13px ${MONO}`;
  ctx.fillText('SUBSTATS', x, sy);
  ctx.fillStyle = K.text;
  ctx.font = `500 17px ${FONT}`;
  wrap(ctx, b.substats.replace(/\bER\b/g, 'Energy Regen'), w, 3).forEach((l, i) =>
    ctx.fillText(l, x, sy + 26 + i * 22),
  );
}

async function drawBuild(ctx, W, H, a, base) {
  const b = BUILDS[a.id];
  await head(ctx, W, a, base, 'Build card');
  const art = await loadAgentArt(a, base);
  agentBlock(ctx, a, art, 56, 100, {
    w: 130,
    h: 170,
    lean: 24,
    nameSize: 46,
    nameW: W - 214 - 160,
    roles: await loadRoleIcons(base, [a]),
  });
  if (!b) {
    if (a.quote) drawQuote(ctx, a.quote, 40, 282, W - 80, 330);
    else {
      ctx.fillStyle = K.muted;
      ctx.font = `500 22px ${FONT}`;
      ctx.fillText('No recommended build yet.', 56, 340);
    }
    foot(ctx, W, H);
    return;
  }
  const icons = await loadEngines(b.wEngines.slice(0, 5), base);
  const discs = await loadDiscs([...b.fourPiece.slice(0, 3), ...b.twoPiece.slice(0, 3)], base);
  infoBlock(ctx, a, 214, 194, 860, 1, await loadFactionLogo(a, base));
  const top = 282;
  const ph = 296;
  panel(ctx, 40, top, 420, ph, 'W-Engines', 'best first');
  drawEngineRows(ctx, b.wEngines, icons, 58, top + 44, 384, 49, 5);
  panel(ctx, 476, top, 330, ph, 'Drive Disc sets', 'community picks');
  ctx.fillStyle = K.dim;
  ctx.font = `500 13px ${MONO}`;
  ctx.fillText('4-PIECE', 494, top + 56);
  drawSets(ctx, b.fourPiece, 494, top + 88, 296, 3, 32, discs);
  ctx.fillStyle = K.dim;
  ctx.font = `500 13px ${MONO}`;
  ctx.fillText('2-PIECE', 494, top + 190);
  drawSets(ctx, b.twoPiece, 494, top + 220, 296, 3, 31, discs);
  panel(ctx, 822, top, 338, ph, 'Main stats');
  drawMains(ctx, b, 840, top + 62, 304);

  const bangboo = b.bangboo.map((id) => BANGBOO_BY_ID[id]).filter(Boolean)[0];
  if (bangboo) {
    const bArt = await loadImage(
      `${base}bangboo/${BANGBOO_WITH_ART.has(bangboo.id) ? bangboo.id : 'placeholder'}.webp`,
    );
    ctx.fillStyle = K.muted;
    ctx.font = `500 14px ${MONO}`;
    ctx.fillText('BANGBOO', 60, 614);
    if (bArt) ctx.drawImage(bArt, 160, 588, (bArt.width / bArt.height) * 40, 40);
    ctx.fillStyle = K.fg;
    ctx.font = `700 20px ${FONT}`;
    ctx.fillText(bangboo.name, 160 + (bArt ? (bArt.width / bArt.height) * 40 + 12 : 0), 615);
  }
  const order = SKILL_PRIORITY[a.id];
  if (order) {
    ctx.fillStyle = K.muted;
    ctx.font = `500 14px ${MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText('LEVEL FIRST', 600, 614);
    ctx.textAlign = 'left';
    drawPriority(ctx, order, await loadSkillIcons(order, base), 612, 596, W - 40 - 612, 24, false);
  }
  foot(ctx, W, H);
}

// ---------- farm ----------

async function loadMatIcons(items, base) {
  const out = {};
  await Promise.all(
    items.map(async (it) => {
      const src = materialIcon(it.name, base);
      if (src && !(it.name in out)) out[it.name] = await loadImage(src);
    }),
  );
  return out;
}

function drawMatGroup(ctx, x, y, w, h, title, note, items, icons = {}) {
  panel(ctx, x, y, w, h, title, note);
  const rowH = Math.min(78, (h - 56) / items.length);
  items.forEach((it, i) => {
    const ry = y + 52 + i * rowH;
    if (icons[it.name]) {
      ctx.drawImage(icons[it.name], x + 14, ry + 4, 30, 30);
    } else {
      ctx.fillStyle = KIND[it.kind] ?? '#888';
      roundRect(ctx, x + 20, ry + 6, 6, rowH - 22, 3);
      ctx.fill();
    }
    ctx.fillStyle = K.text;
    ctx.font = `600 14.5px ${FONT}`;
    ctx.textAlign = 'right';
    const qty = `×${fmt(it.qty)}`;
    ctx.fillText(qty, x + w - 20, ry + 22);
    const qw = ctx.measureText(qty).width;
    ctx.textAlign = 'left';
    const hdd = it.kind === 'hdd';
    ctx.fillText(
      fit(ctx, hdd ? it.name.replace('Higher Dimensional Data: ', '') : it.name, w - 76 - qw),
      x + 52,
      ry + 22,
    );
    ctx.fillStyle = K.dim;
    ctx.font = `500 12.5px ${FONT}`;
    const src = wrap(ctx, hdd ? `Higher Dimensional Data · ${it.source}` : it.source, w - 72, 2);
    src.forEach((l, k) => ctx.fillText(l, x + 52, ry + 42 + k * 16));
  });
}

async function drawFarm(ctx, W, H, a, base) {
  const m = materialsFor(a.id);
  await head(ctx, W, a, base, 'Farming card');
  const art = await loadAgentArt(a, base);
  agentBlock(ctx, a, art, 56, 100, { w: 130, h: 170, lean: 24, nameSize: 46, roles: await loadRoleIcons(base, [a]) });
  if (!m) {
    ctx.fillStyle = K.muted;
    ctx.font = `500 22px ${FONT}`;
    ctx.fillText('No material list yet.', 56, 340);
    foot(ctx, W, H);
    return;
  }
  const top = 290;
  const ph = 300;
  const w = 354;
  const icons = await loadMatIcons([...m.promotion, ...m.skill, ...m.core], base);
  drawMatGroup(ctx, 40, top, w, ph, 'Level up', 'level 1 → 60', m.promotion, icons);
  drawMatGroup(
    ctx,
    40 + w + 29,
    top,
    w,
    ph,
    'Skills',
    `all ${SKILL_COUNT}, level 1 → 12`,
    m.skill.map((x) => ({ ...x, qty: x.qty * SKILL_COUNT })),
    icons,
  );
  drawMatGroup(ctx, 40 + 2 * (w + 29), top, w, ph, 'Core Skill', 'base → F', m.core, icons);
  ctx.fillStyle = K.dim;
  ctx.font = `400 13px ${FONT}`;
  ctx.fillText(
    `${m.chipAttr} skill chips. The Hamster Cage Pass is only for level 11 → 12. Agent EXP: Investigator Logs from Combat Simulation.`,
    40,
    616,
  );
  foot(ctx, W, H);
}

// ---------- guide ----------

function teamRow(ctx, members, arts, x, y, w, current) {
  members.forEach((id, i) => {
    const m = AGENT_BY_ID[id];
    const cx = x + 40 + i * 140;
    circleImage(ctx, arts[id], cx, y + 32, 32, id === current ? '#f2f2f2' : '#4a4a4a');
    ctx.fillStyle = id === current ? K.fg : K.text;
    ctx.font = `600 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(fit(ctx, shortName(m), 124), cx, y + 84);
    ctx.textAlign = 'left';
  });
}

async function drawGuide(ctx, W, H, a, base) {
  const b = BUILDS[a.id];
  const m = materialsFor(a.id);
  await head(ctx, W, a, base, 'Agent guide');
  const ids = [...new Set((b?.teams ?? []).flat())];
  const [art, icons, discs, ...rest] = await Promise.all([
    loadAgentArt(a, base),
    loadEngines(b?.wEngines.slice(0, 3) ?? [], base),
    loadDiscs(b ? [...b.fourPiece.slice(0, 2), ...b.twoPiece.slice(0, 2)] : [], base),
    ...ids.map((id) => loadAgentArt(id, base)),
  ]);
  const arts = Object.fromEntries(ids.map((id, i) => [id, rest[i]]));
  agentBlock(ctx, a, art, 56, 100, {
    w: 150,
    h: 196,
    lean: 28,
    nameSize: 52,
    nameW: W - 234 - 160,
    roles: await loadRoleIcons(base, [a]),
  });
  infoBlock(ctx, a, 234, 206, 760, 2, await loadFactionLogo(a, base));
  let y = 322;
  if (b) {
    panel(ctx, 40, y, 1000, 282, 'Build');
    drawEngineRows(ctx, b.wEngines, icons, 58, y + 46, 360, 56, 3);
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText('4-PIECE', 452, y + 62);
    drawSets(ctx, b.fourPiece, 452, y + 98, 250, 2, 36, discs);
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText('2-PIECE', 452, y + 168);
    drawSets(ctx, b.twoPiece, 452, y + 204, 250, 2, 34, discs);
    drawMains(ctx, b, 724, y + 70, 296);
    y += 298;
    // Up to four teams, two per row.
    const teams = b.teams.slice(0, 4);
    const tn = Math.ceil(teams.length / 2);
    panel(ctx, 40, y, 1000, 60 + tn * 100, 'Best teams');
    teams.forEach((t, i) => teamRow(ctx, t, arts, 56 + (i % 2) * 500, y + 44 + Math.floor(i / 2) * 100, 470, a.id));
    if (teams.length > 1) {
      ctx.strokeStyle = K.line;
      ctx.beginPath();
      ctx.moveTo(540, y + 50);
      ctx.lineTo(540, y + 40 + tn * 100);
      ctx.stroke();
    }
    y += 60 + tn * 100 + 18;
    // Bangboo and skill levelling order share one row.
    const bg = b.bangboo.map((id) => BANGBOO_BY_ID[id]).filter(Boolean)[0];
    const order = SKILL_PRIORITY[a.id];
    if (bg || order) {
      const bw = bg && order ? 400 : 1000;
      if (bg) {
        const bArt = await loadImage(`${base}bangboo/${BANGBOO_WITH_ART.has(bg.id) ? bg.id : 'placeholder'}.webp`);
        panel(ctx, 40, y, bw, 104, 'Bangboo');
        if (bArt) ctx.drawImage(bArt, 60, y + 42, (bArt.width / bArt.height) * 50, 50);
        ctx.fillStyle = K.fg;
        ctx.font = `700 22px ${FONT}`;
        const tx = 60 + (bArt ? (bArt.width / bArt.height) * 50 + 16 : 0);
        ctx.fillText(fit(ctx, bg.name, 40 + bw - 20 - tx), tx, y + 76);
      }
      if (order) {
        const px = bg ? 40 + bw + 16 : 40;
        const pw = 1040 - px;
        panel(ctx, px, y, pw, 104, 'Skill priority', a.upcoming ? 'subject to change' : 'level first →');
        drawPriority(ctx, order, await loadSkillIcons(order, base), px + 12, y + 44, pw - 24, bg ? 28 : 32);
      }
      y += 120;
    }
  }
  if (!b && a.quote) y += drawQuote(ctx, a.quote, 40, y, 1000, 420) + 18;
  if (m) {
    const items = [m.promotion[1], m.skill[2], m.core[0], m.core[1]].filter(Boolean);
    const rh = 56;
    panel(ctx, 40, y, 1000, 56 + items.length * rh, 'Farm first');
    const micons = await loadMatIcons(items, base);
    items.forEach((it, i) => {
      const ry = y + 46 + i * rh;
      if (micons[it.name]) {
        ctx.drawImage(micons[it.name], 54, ry, 38, 38);
      } else {
        ctx.fillStyle = KIND[it.kind];
        roundRect(ctx, 60, ry + 4, 6, rh - 20, 3);
        ctx.fill();
      }
      const tx = micons[it.name] ? 102 : 80;
      ctx.fillStyle = K.text;
      ctx.font = `600 17px ${FONT}`;
      ctx.fillText(fit(ctx, it.name, 520), tx, ry + 20);
      ctx.fillStyle = K.dim;
      ctx.font = `500 13px ${FONT}`;
      ctx.fillText(fit(ctx, it.source, 620), tx, ry + 40);
      ctx.fillStyle = K.text;
      ctx.font = `600 17px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.fillText(`×${fmt(it.qty * (it.kind === 'chip' ? SKILL_COUNT : 1))}`, 1020, ry + 24);
      ctx.textAlign = 'left';
    });
  }
  foot(ctx, W, H);
}

// ---------- my build ----------

/** Sets a font that fits `text` in `w`, shrinking from `max` to `min` px. */
function shrink(ctx, text, w, weight, max, min) {
  let size = max;
  ctx.font = `${weight} ${size}px ${FONT}`;
  while (size > min && ctx.measureText(text).width > w) ctx.font = `${weight} ${(size -= 0.5)}px ${FONT}`;
}

/** The reader's own build: their W-Engine, each Drive Disc and the set bonuses. */
async function drawMine(ctx, W, H, a, base, lo) {
  await head(ctx, W, a, base, 'My build');
  const art = await loadAgentArt(a, base);
  agentBlock(ctx, a, art, 56, 100, {
    w: 130,
    h: 170,
    lean: 24,
    nameSize: 46,
    nameW: W - 214 - 160,
    roles: await loadRoleIcons(base, [a]),
  });
  if (!lo) {
    ctx.fillStyle = K.muted;
    ctx.font = `500 22px ${FONT}`;
    ctx.fillText('No build saved yet.', 56, 340);
    foot(ctx, W, H);
    return;
  }
  const attrName = ATTRIBUTE_BY_ID[a.attribute]?.name;
  const label = (st) => (st === 'Attribute DMG' ? `${attrName} DMG` : st);
  const e = lo.wEngine && W_ENGINE_BY_ID[lo.wEngine];
  const setIds = lo.discs.map((d) => d.set).filter(Boolean);
  const [engines, discArt, logo] = await Promise.all([
    loadEngines(e ? [e.id] : [], base),
    loadDiscs(setIds, base),
    loadFactionLogo(a, base),
  ]);

  // Mindscape / Potential chips beside the faction, in place of the stat targets.
  let px = 214;
  const chips = [`Mindscape M${lo.mindscape ?? 0}`];
  if (hasPotential(a.id)) chips.push(`Potential ${lo.potential ? ROMAN[lo.potential] : 'none'}`);
  if (logo) {
    ctx.drawImage(logo, px, 190, 36, 36);
    px += 40;
  }
  [shownFaction(a).name, ...chips].forEach((t, i) => {
    px += pill(ctx, t, px, 194, i > 0 ? { fg: K.fg, bg: 'rgba(255,255,255,0.12)', line: '#5a5a5a' } : {}) + 8;
  });

  const top = 262;
  const ph = 300;

  // W-Engine
  panel(ctx, 40, top, 300, ph, 'W-Engine');
  if (e) {
    engineIcon(ctx, engines[e.id], 60, top + 48, 128);
    rankBadge(ctx, e.rank, 192, top + 66, 16);
    ctx.fillStyle = K.fg;
    ctx.font = `800 30px ${DISPLAY}`;
    ctx.fillText(`P${lo.refinement ?? 1}`, 216, top + 76);
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText('PHASE', 216, top + 98);
    ctx.fillStyle = K.fg;
    ctx.font = `700 21px ${FONT}`;
    const lines = wrap(ctx, e.name, 260, 2);
    lines.forEach((l, i) => ctx.fillText(l, 60, top + 210 + i * 26));
    const stats = [
      e.base && `Base ${e.base.stat} ${e.base.max}`,
      e.advanced && `${e.advanced.stat} ${e.advanced.max}`,
    ].filter(Boolean);
    ctx.fillStyle = K.muted;
    ctx.font = `500 15px ${FONT}`;
    stats.forEach((t, i) => ctx.fillText(fit(ctx, t, 260), 60, top + 214 + lines.length * 26 + i * 20));
    if (e.specialty !== a.specialty) {
      ctx.fillStyle = '#d9a35a';
      ctx.font = `500 13px ${FONT}`;
      ctx.fillText(fit(ctx, 'Other specialty: passive won’t apply', 260), 60, top + ph - 14);
    }
  } else {
    ctx.fillStyle = K.muted;
    ctx.font = `500 18px ${FONT}`;
    ctx.fillText('None equipped', 60, top + 80);
  }

  // Drive Discs: six tiles in wheel order, 3 × 2.
  const dx = 356;
  const dw = 530;
  panel(ctx, dx, top, dw, ph, 'Drive Discs');
  const tw = (dw - 40 - 16) / 3;
  const th = 118;
  lo.discs.forEach((d, i) => {
    const slot = i + 1;
    const tx = dx + 20 + (i % 3) * (tw + 8);
    const ty = top + 46 + Math.floor(i / 3) * (th + 10);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, tx, ty, tw, th, 10);
    ctx.fill();
    ctx.strokeStyle = d.set ? setColor(d.set) : '#3a3a3a';
    ctx.globalAlpha = d.set ? 0.55 : 1;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
    const img = d.set && discArt[d.set];
    if (img) ctx.drawImage(img, tx + 10, ty + 10, 46, 46);
    else {
      ctx.beginPath();
      ctx.arc(tx + 33, ty + 33, 21, 0, Math.PI * 2);
      ctx.strokeStyle = '#4a4a4a';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = K.dim;
    ctx.font = `600 13px ${MONO}`;
    ctx.fillText(`SLOT ${slot}`, tx + 64, ty + 28);
    if (d.set) {
      ctx.fillStyle = K.muted;
      ctx.fillText(`${d.rank}-RANK`, tx + 64, ty + 47);
    }
    ctx.fillStyle = K.fg;
    // Shrink a long set name before cutting it short.
    const name = d.set ? (DRIVE_DISC_BY_ID[d.set]?.name ?? '') : 'Empty';
    shrink(ctx, name, tw - 20, 600, 15, 12);
    ctx.fillText(fit(ctx, name, tw - 20), tx + 10, ty + 80);
    const st = mainStatOf(slot, d);
    const max = d.set ? mainMax(slot, d) : null;
    ctx.fillStyle = K.text;
    const mainText = st ? `${label(st)}${max ? ` ${max}` : ''}` : 'Main stat not set';
    shrink(ctx, mainText, tw - 20, 500, 14, 11.5);
    ctx.fillText(fit(ctx, mainText, tw - 20), tx + 10, ty + 102);
  });

  // Set bonuses
  const bx = 902;
  const bw = W - 40 - bx;
  panel(ctx, bx, top, bw, ph, 'Set bonuses');
  const { twos, counts } = discBonuses(lo.discs);
  let by = top + 58;
  if (!twos.length) {
    ctx.fillStyle = K.muted;
    ctx.font = `500 16px ${FONT}`;
    wrap(ctx, 'No set bonus yet: two discs of a set give its 2-piece bonus.', bw - 40, 3).forEach((l, i) =>
      ctx.fillText(l, bx + 20, by + i * 22),
    );
  }
  twos.slice(0, 3).forEach((id) => {
    const set = DRIVE_DISC_BY_ID[id];
    const n = counts.find((c) => c.id === id).count;
    if (discArt[id]) ctx.drawImage(discArt[id], bx + 20, by - 22, 30, 30);
    ctx.fillStyle = K.fg;
    shrink(ctx, set.name, bw - 106, 700, 17, 13);
    ctx.fillText(fit(ctx, set.name, bw - 106), bx + 58, by - 2);
    ctx.fillStyle = K.dim;
    ctx.font = `600 13px ${MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(`×${n}`, bx + bw - 20, by - 2);
    ctx.textAlign = 'left';
    ctx.fillStyle = K.text;
    ctx.font = `500 14px ${FONT}`;
    const parts = n >= 4 ? [`2: ${set.twoPiece}`, `4: ${set.fourPiece}`] : [`2: ${set.twoPiece}`];
    by += 10;
    parts.forEach((t) => {
      const lines = wrap(ctx, t, bw - 40, twos.length > 1 ? (n >= 4 ? 5 : 2) : n >= 4 ? 7 : 3);
      lines.forEach((l) => {
        by += 19;
        ctx.fillText(l, bx + 20, by);
      });
    });
    by += 34;
  });

  // Build code: paste into My build (or the team builder) to load this build.
  ctx.fillStyle = '#b5b5b5';
  ctx.font = `600 13px ${MONO}`;
  ctx.fillText('BUILD CODE', 40, H - 66);
  const labelW = ctx.measureText('BUILD CODE').width;
  ctx.fillStyle = '#e6e6e6';
  ctx.font = `600 20px ${MONO}`;
  ctx.fillText(fit(ctx, buildCode(a.id, lo), W - 120 - labelW), 40 + labelW + 16, H - 63);
  foot(ctx, W, H);
}

const DRAW = { build: drawBuild, farm: drawFarm, guide: drawGuide, mine: drawMine };

/** Renders one of the Agent cards onto a canvas. */
export async function renderAgentCard(
  agent,
  { base = '/', kind = 'build', scale = EXPORT_SCALE, loadout = null } = {},
) {
  await document.fonts?.ready;
  const id = DRAW[kind] ? kind : 'build';
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
  await DRAW[id](ctx, W, H, agent, base, loadout);
  return canvas;
}
