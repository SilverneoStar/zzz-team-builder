// Shareable cards for one Agent, exported from their page:
//   build  1200×675  W-Engines, Drive Disc sets, main stats and Bangboo
//   farm   1200×675  everything to farm, grouped by what it's for
//   guide  1080×1350 one-page guide: build, best teams and what to farm
// Same black / gray / white look as the team images.
import { AGENT_BY_ID, ATTRIBUTE_BY_ID, BANGBOO_BY_ID, DRIVE_DISC_BY_ID, SPECIALTY_BY_ID, W_ENGINE_BY_ID, shortName } from '../data/game.js';
import { BUILDS } from '../data/builds.js';
import { SKILL_COUNT, materialsFor } from '../data/materials.js';
import { W_ENGINES_WITH_ART } from '../components/WEngineArt.jsx';
import { BANGBOO_WITH_ART } from '../components/BangbooArt.jsx';
import { setColor } from '../components/DiscWheel.jsx';
import { passiveStatus } from './analyze.js';
import { DISPLAY, FONT, MONO, background, fit, loadImage, rankBadge, roundRect, slantedArt } from './teamCard.js';

export const AGENT_CARDS = [
  { id: 'build', label: 'Build', hint: '16:9' },
  { id: 'farm', label: 'Farming', hint: '16:9' },
  { id: 'guide', label: 'Guide', hint: '4:5' },
];
const SIZES = { build: [1200, 675], farm: [1200, 675], guide: [1080, 1350] };

const K = { panel: 'rgba(24,24,24,0.94)', line: '#333', fg: '#f2f2f2', text: '#e6e6e6', muted: '#a3a3a3', dim: '#7a7a7a' };
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
  ['#4a4f5c', '#9ea4b1', '#c3c8d2', '#6b7180', '#464b57'].forEach((c, i, arr) => grad.addColorStop(i / (arr.length - 1), c));
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
  ctx.fillText('silverneostar.github.io/zzz-team-builder · Unofficial fan project, not affiliated with HoYoverse', 40, H - 30);
  ctx.textAlign = 'right';
  ctx.fillText('salman-SilverStarneo', W - 40, H - 30);
  ctx.textAlign = 'left';
}

const agentLine = (a) => `${a.rank}-Rank · ${ATTRIBUTE_BY_ID[a.attribute]?.name} · ${SPECIALTY_BY_ID[a.specialty]?.name}`;

async function loadEngines(ids, base) {
  const out = {};
  await Promise.all(ids.map(async (id) => {
    if (W_ENGINES_WITH_ART.has(id)) out[id] = await loadImage(`${base}w-engines/${id}.webp`);
  }));
  return out;
}

/** Agent name block with portrait, used at the top of every card. */
function agentBlock(ctx, a, art, x, y, { w = 150, h = 190, lean = 28, nameSize = 52 } = {}) {
  const color = ATTRIBUTE_BY_ID[a.attribute]?.color ?? '#888';
  slantedArt(ctx, { x, y, w, h, lean, art, agent: a, color, radius: 10 });
  rankBadge(ctx, a.rank, x + 20, y + h - 20, 14);
  const tx = x + w + 28;
  ctx.fillStyle = K.fg;
  ctx.font = `800 ${nameSize}px ${DISPLAY}`;
  ctx.fillText(fit(ctx, a.name.toUpperCase(), 760), tx, y + nameSize);
  ctx.fillStyle = K.muted;
  ctx.font = `500 18px ${FONT}`;
  ctx.fillText(agentLine(a), tx, y + nameSize + 30);
  return { tx, ty: y + nameSize + 30, color };
}

// ---------- build ----------

function drawEngineRows(ctx, ids, icons, x, y, w, rowH, count) {
  ids.slice(0, count).forEach((id, i) => {
    const e = W_ENGINE_BY_ID[id];
    if (!e) return;
    const ry = y + i * rowH;
    engineIcon(ctx, icons[id], x, ry, rowH - 10);
    ctx.fillStyle = i === 0 ? K.fg : K.text;
    ctx.font = `${i === 0 ? 700 : 500} 18px ${FONT}`;
    ctx.fillText(fit(ctx, e.name, w - rowH - 70), x + rowH, ry + rowH / 2 - 2);
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText(i === 0 ? 'BEST' : `#${i + 1}`, x + rowH, ry + rowH / 2 + 18);
    rankBadge(ctx, e.rank, x + w - 18, ry + rowH / 2 - 6, 13);
  });
}

function drawSets(ctx, ids, x, y, w, count, gap = 30) {
  ids.slice(0, count).forEach((id, i) => {
    const d = DRIVE_DISC_BY_ID[id];
    if (!d) return;
    ctx.beginPath();
    ctx.arc(x + 7, y + i * gap - 6, 6, 0, Math.PI * 2);
    ctx.fillStyle = setColor(id);
    ctx.fill();
    ctx.fillStyle = i === 0 ? K.fg : K.text;
    ctx.font = `${i === 0 ? 700 : 500} 17px ${FONT}`;
    ctx.fillText(fit(ctx, d.name, w - 24), x + 24, y + i * gap);
  });
}

function drawMains(ctx, b, x, y, w) {
  [4, 5, 6].forEach((s, i) => {
    const ry = y + i * 50;
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText(`SLOT ${s}`, x, ry);
    ctx.fillStyle = K.text;
    ctx.font = `500 16px ${FONT}`;
    wrap(ctx, b.main[s].replace(/\bER\b/g, 'Energy Regen'), w - 80, 2).forEach((l, i) => ctx.fillText(l, x + 80, ry + i * 19));
  });
  const sy = y + 3 * 50 + 10;
  ctx.fillStyle = K.dim;
  ctx.font = `500 13px ${MONO}`;
  ctx.fillText('SUBSTATS', x, sy);
  ctx.fillStyle = K.text;
  ctx.font = `500 16px ${FONT}`;
  wrap(ctx, b.substats.replace(/\bER\b/g, 'Energy Regen'), w, 3).forEach((l, i) => ctx.fillText(l, x, sy + 26 + i * 21));
}

async function drawBuild(ctx, W, H, a, base) {
  const b = BUILDS[a.id];
  await head(ctx, W, a, base, 'Build card');
  const art = await loadImage(`${base}agents/${a.id}.webp`);
  agentBlock(ctx, a, art, 56, 100, { w: 130, h: 170, lean: 24, nameSize: 46 });
  if (!b) {
    ctx.fillStyle = K.muted;
    ctx.font = `500 22px ${FONT}`;
    ctx.fillText('No recommended build yet.', 56, 340);
    foot(ctx, W, H);
    return;
  }
  const icons = await loadEngines(b.wEngines.slice(0, 5), base);
  const top = 290;
  const ph = 276;
  panel(ctx, 40, top, 400, ph, 'W-Engines', 'best first');
  drawEngineRows(ctx, b.wEngines, icons, 60, top + 46, 360, 44, 5);
  panel(ctx, 460, top, 340, ph, 'Drive Disc sets');
  ctx.fillStyle = K.dim;
  ctx.font = `500 13px ${MONO}`;
  ctx.fillText('4-PIECE', 480, top + 62);
  drawSets(ctx, b.fourPiece, 480, top + 88, 300, 3, 28);
  ctx.fillStyle = K.dim;
  ctx.font = `500 13px ${MONO}`;
  ctx.fillText('2-PIECE', 480, top + 182);
  drawSets(ctx, b.twoPiece, 480, top + 208, 300, 3, 25);
  panel(ctx, 820, top, 340, ph, 'Main stats');
  drawMains(ctx, b, 840, top + 62, 300);

  const bangboo = b.bangboo.map((id) => BANGBOO_BY_ID[id]).filter(Boolean)[0];
  if (bangboo) {
    const bArt = await loadImage(`${base}bangboo/${BANGBOO_WITH_ART.has(bangboo.id) ? bangboo.id : 'placeholder'}.webp`);
    ctx.fillStyle = K.muted;
    ctx.font = `500 14px ${MONO}`;
    ctx.fillText('BANGBOO', 60, 606);
    if (bArt) ctx.drawImage(bArt, 160, 578, (bArt.width / bArt.height) * 40, 40);
    ctx.fillStyle = K.fg;
    ctx.font = `700 20px ${FONT}`;
    ctx.fillText(bangboo.name, 160 + (bArt ? (bArt.width / bArt.height) * 40 + 12 : 0), 607);
  }
  ctx.fillStyle = K.dim;
  ctx.font = `400 13px ${FONT}`;
  ctx.textAlign = 'right';
  ctx.fillText('Community picks, they shift with patches.', W - 40, 607);
  ctx.textAlign = 'left';
  foot(ctx, W, H);
}

// ---------- farm ----------

function drawMatGroup(ctx, x, y, w, h, title, note, items) {
  panel(ctx, x, y, w, h, title, note);
  const rowH = Math.min(78, (h - 56) / items.length);
  items.forEach((it, i) => {
    const ry = y + 52 + i * rowH;
    ctx.fillStyle = KIND[it.kind] ?? '#888';
    roundRect(ctx, x + 20, ry + 6, 6, rowH - 22, 3);
    ctx.fill();
    ctx.fillStyle = K.text;
    ctx.font = `600 16px ${FONT}`;
    ctx.textAlign = 'right';
    const qty = `×${fmt(it.qty)}`;
    ctx.fillText(qty, x + w - 20, ry + 22);
    const qw = ctx.measureText(qty).width;
    ctx.textAlign = 'left';
    const hdd = it.kind === 'hdd';
    ctx.fillText(fit(ctx, hdd ? it.name.replace('Higher Dimensional Data: ', '') : it.name, w - 70 - qw), x + 38, ry + 22);
    ctx.fillStyle = K.dim;
    ctx.font = `500 12.5px ${FONT}`;
    const src = wrap(ctx, hdd ? `Higher Dimensional Data · ${it.source}` : it.source, w - 58, 2);
    src.forEach((l, k) => ctx.fillText(l, x + 38, ry + 42 + k * 16));
  });
}

async function drawFarm(ctx, W, H, a, base) {
  const m = materialsFor(a.id);
  await head(ctx, W, a, base, 'Farming card');
  const art = await loadImage(`${base}agents/${a.id}.webp`);
  agentBlock(ctx, a, art, 56, 100, { w: 130, h: 170, lean: 24, nameSize: 46 });
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
  drawMatGroup(ctx, 40, top, w, ph, 'Level up', 'level 1 → 60', m.promotion);
  drawMatGroup(ctx, 40 + w + 29, top, w, ph, 'Skills', `all ${SKILL_COUNT}, level 1 → 12`, m.skill.map((x) => ({ ...x, qty: x.qty * SKILL_COUNT })));
  drawMatGroup(ctx, 40 + 2 * (w + 29), top, w, ph, 'Core Skill', 'base → F', m.core);
  ctx.fillStyle = K.dim;
  ctx.font = `400 13px ${FONT}`;
  ctx.fillText(`${m.chipAttr} skill chips. The Hamster Cage Pass is only for level 11 → 12. Agent EXP: Investigator Logs from Combat Simulation.`, 40, 616);
  foot(ctx, W, H);
}

// ---------- guide ----------

function teamRow(ctx, members, arts, x, y, w, current) {
  members.forEach((id, i) => {
    const m = AGENT_BY_ID[id];
    const cx = x + 34 + i * 120;
    circleImage(ctx, arts[id], cx, y + 30, 30, id === current ? '#f2f2f2' : '#4a4a4a');
    ctx.fillStyle = id === current ? K.fg : K.text;
    ctx.font = `600 14px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(fit(ctx, shortName(m), 100), cx, y + 78);
    ctx.textAlign = 'left';
  });
  const st = passiveStatus(members);
  ctx.fillStyle = K.dim;
  ctx.font = `500 13px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText(`ABILITIES ${st.active}/${st.total}`, x + w - 20, y + 36);
  ctx.textAlign = 'left';
}

async function drawGuide(ctx, W, H, a, base) {
  const b = BUILDS[a.id];
  const m = materialsFor(a.id);
  await head(ctx, W, a, base, 'Agent guide');
  const ids = [...new Set((b?.teams ?? []).flat())];
  const [art, icons, ...rest] = await Promise.all([
    loadImage(`${base}agents/${a.id}.webp`),
    loadEngines(b?.wEngines.slice(0, 3) ?? [], base),
    ...ids.map((id) => loadImage(`${base}agents/${id}.webp`)),
  ]);
  const arts = Object.fromEntries(ids.map((id, i) => [id, rest[i]]));
  agentBlock(ctx, a, art, 56, 100, { w: 150, h: 196, lean: 28, nameSize: 52 });
  let y = 322;
  if (b) {
    panel(ctx, 40, y, 1000, 250, 'Build');
    drawEngineRows(ctx, b.wEngines, icons, 60, y + 46, 360, 44, 3);
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText('4-PIECE', 460, y + 62);
    drawSets(ctx, b.fourPiece, 460, y + 90, 240, 2);
    ctx.fillStyle = K.dim;
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText('2-PIECE', 460, y + 160);
    drawSets(ctx, b.twoPiece, 460, y + 188, 240, 2, 26);
    drawMains(ctx, b, 730, y + 70, 290);
    y += 270;
    panel(ctx, 40, y, 1000, 66 + Math.min(b.teams.length, 2) * 104, 'Best teams');
    b.teams.slice(0, 2).forEach((t, i) => teamRow(ctx, t, arts, 56, y + 44 + i * 104, 960, a.id));
    y += 66 + Math.min(b.teams.length, 2) * 104 + 20;
    const bg = b.bangboo.map((id) => BANGBOO_BY_ID[id]).filter(Boolean)[0];
    if (bg) {
      const bArt = await loadImage(`${base}bangboo/${BANGBOO_WITH_ART.has(bg.id) ? bg.id : 'placeholder'}.webp`);
      panel(ctx, 40, y, 1000, 96, 'Bangboo');
      if (bArt) ctx.drawImage(bArt, 60, y + 38, (bArt.width / bArt.height) * 48, 48);
      ctx.fillStyle = K.fg;
      ctx.font = `700 22px ${FONT}`;
      ctx.fillText(bg.name, 60 + (bArt ? (bArt.width / bArt.height) * 48 + 16 : 0), y + 70);
      y += 116;
    }
  }
  if (m) {
    const items = [m.promotion[1], m.skill[2], m.core[0], m.core[1]].filter(Boolean);
    const rh = 56;
    panel(ctx, 40, y, 1000, 56 + items.length * rh, 'Farm first');
    items.forEach((it, i) => {
      const ry = y + 46 + i * rh;
      ctx.fillStyle = KIND[it.kind];
      roundRect(ctx, 60, ry + 4, 6, rh - 20, 3);
      ctx.fill();
      ctx.fillStyle = K.text;
      ctx.font = `600 17px ${FONT}`;
      ctx.fillText(fit(ctx, it.name, 520), 80, ry + 20);
      ctx.fillStyle = K.dim;
      ctx.font = `500 13px ${FONT}`;
      ctx.fillText(fit(ctx, it.source, 620), 80, ry + 40);
      ctx.fillStyle = K.text;
      ctx.font = `600 17px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.fillText(`×${fmt(it.qty * (it.kind === 'chip' ? SKILL_COUNT : 1))}`, 1020, ry + 24);
      ctx.textAlign = 'left';
    });
  }
  foot(ctx, W, H);
}

const DRAW = { build: drawBuild, farm: drawFarm, guide: drawGuide };

/** Renders one of the Agent cards onto a canvas. */
export async function renderAgentCard(agent, { base = '/', kind = 'build' } = {}) {
  await document.fonts?.ready;
  const id = DRAW[kind] ? kind : 'build';
  const [W, H] = SIZES[id];
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  background(ctx, W, H);
  await DRAW[id](ctx, W, H, agent, base);
  return canvas;
}
