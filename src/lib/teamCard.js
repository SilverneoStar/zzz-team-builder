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
import { encodeTeam } from './share.js';
import { loadoutOf } from './teamsReducer.js';
import { discBonuses } from './discs.js';
import { BANGBOO_WITH_ART } from '../components/BangbooArt.jsx';

// Team images, in three layouts:
//   columns  1200×675  three gear columns (the original card)
//   squad    1200×675  big slanted Agent cards like the in-game squad screen
//   square   1080×1080 one row per Agent, for square posts
export const TEAM_LAYOUTS = [
  { id: 'columns', label: 'Columns', hint: '16:9' },
  { id: 'squad', label: 'Squad', hint: '16:9 · big art' },
  { id: 'square', label: 'Square', hint: '1:1' },
];
const SIZES = { columns: [1200, 675], squad: [1200, 675], square: [1080, 1080] };

const FONT = '"IBM Plex Sans", system-ui, sans-serif';
const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const BADGE = '"Inter", "Arial Black", sans-serif';

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fit(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ---------- shared pieces ----------

function background(ctx, W, H) {
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);
  const strips = [[-40, 1], [150, 0.5], [W - 300, 0.5], [W - 110, 1]];
  strips.forEach(([x, alpha]) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x + 88, H / 2);
    ctx.rotate((14 * Math.PI) / 180);
    const sw = 176;
    const sh = H * 1.8;
    ctx.fillStyle = '#131313';
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
    for (let y = -sh / 2; y < sh / 2; y += 26) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(-sw / 2 + 11, y, 12, 12);
      ctx.fillRect(sw / 2 - 23, y, 12, 12);
    }
    for (let y = -sh / 2 + 6; y < sh / 2; y += 136) {
      ctx.fillStyle = '#1b1b1b';
      ctx.fillRect(-sw / 2 + 34, y, sw - 68, 122);
    }
    ctx.restore();
  });
}

async function header(ctx, W, team, base, { titleSize = 54 } = {}) {
  const grad = ctx.createLinearGradient(40, 0, W - 40, 0);
  ['#4a4f5c', '#9ea4b1', '#c3c8d2', '#6b7180', '#464b57'].forEach((c, i, a) => grad.addColorStop(i / (a.length - 1), c));
  ctx.fillStyle = grad;
  roundRect(ctx, 40, 32, W - 80, 6, 3);
  ctx.fill();

  ctx.fillStyle = '#a3a3a3';
  ctx.font = `500 15px ${MONO}`;
  ctx.fillText('ZENLESS ZONE ZERO · TEAM BUILDER', 40, 74);
  ctx.fillStyle = '#f2f2f2';
  ctx.font = `800 ${titleSize}px ${DISPLAY}`;
  ctx.fillText(fit(ctx, (team.name || 'Team').toUpperCase(), W - 260), 40, 74 + titleSize);

  const mascot = await loadImage(`${base}mascot.svg`);
  if (mascot) ctx.drawImage(mascot, W - 150, 50, 110, 110);
}

function footer(ctx, W, H, team) {
  ctx.fillStyle = '#7a7a7a';
  ctx.font = `400 13px ${MONO}`;
  ctx.fillText(fit(ctx, encodeTeam(team, loadoutOf), W - 80), 40, H - 65);
  ctx.fillStyle = '#a3a3a3';
  ctx.font = `500 14px ${FONT}`;
  ctx.fillText('silverneostar.github.io/zzz-team-builder · Unofficial fan project, not affiliated with HoYoverse', 40, H - 35);
  ctx.textAlign = 'right';
  ctx.fillText('salman-SilverStarneo', W - 40, H - 35);
  ctx.textAlign = 'left';
}

/** A slanted, rounded-ish frame with the art straightened inside it. */
function slantedArt(ctx, { x, y, w, h, lean, art, agent, color, border = 3, radius = 0 }) {
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
function rankBadge(ctx, rank, cx, cy, r) {
  const stops = { S: ['#ffe866', '#ff9d3a', '#ff3d8f'], A: ['#ff7ad9', '#e04cff', '#9c46ff'], B: ['#c35bff', '#7f7dff', '#47d9ff'] }[rank];
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
    mindscape: `M${lo.mindscape}`,
    wEngine: w ? `${w.name} · P${lo.refinement}` : '—',
    wEngineRank: w?.rank ?? null,
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

const agentLine = (a) => `${a.rank}-Rank · ${ATTRIBUTE_BY_ID[a.attribute]?.name} · ${SPECIALTY_BY_ID[a.specialty]?.name}`;

async function loadArt(team, base) {
  const arts = await Promise.all(team.members.map((id) => (id ? loadImage(`${base}agents/${id}.webp`) : null)));
  const b = team.bangboo && BANGBOO_BY_ID[team.bangboo];
  const bArt = b && BANGBOO_WITH_ART.has(b.id) ? await loadImage(`${base}bangboo/${b.id}.webp`) : null;
  return { arts, bangboo: b, bArt };
}

function bangbooLine(ctx, b, bArt, x, y) {
  ctx.fillStyle = '#a3a3a3';
  ctx.font = `500 14px ${MONO}`;
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
  const { arts, bangboo, bArt } = await loadArt(team, base);
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
    ctx.fillStyle = color;
    roundRect(ctx, x, top, colW, 5, 2);
    ctx.fill();

    // Portrait, about 15% bigger than before.
    slantedArt(ctx, { x: x + 20, y: top + 18, w: 86, h: 106, lean: 16, art: arts[i], agent: a, color });

    ctx.fillStyle = '#f2f2f2';
    ctx.font = `700 22px ${FONT}`;
    ctx.fillText(fit(ctx, a.name, colW - 140), x + 122, top + 62);
    ctx.fillStyle = '#a3a3a3';
    ctx.font = `500 15px ${FONT}`;
    ctx.fillText(agentLine(a), x + 120, top + 88);

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
      const y = top + 150 + r * 29;
      ctx.fillStyle = '#7a7a7a';
      ctx.font = `500 13px ${MONO}`;
      ctx.fillText(k.toUpperCase(), x + 24, y);
      ctx.fillStyle = '#e6e6e6';
      ctx.font = `500 16px ${FONT}`;
      ctx.fillText(fit(ctx, v, colW - 140), x + 120, y);
    });
  });
  bangbooLine(ctx, bangboo, bArt, 40, 572);
  footer(ctx, W, H, team);
}

async function drawSquad(ctx, W, H, team, base) {
  await header(ctx, W, team, base, { titleSize: 44 });
  const { arts, bangboo, bArt } = await loadArt(team, base);
  // Three big leaning cards, then the Bangboo disc, like the squad screen.
  const cardW = 262;
  const artH = 266;
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
    ctx.fillText(fit(ctx, shortName(a), cardW - 40), sx, fy);
    ctx.fillStyle = '#cfcfcf';
    ctx.font = `800 15px ${FONT}`;
    ctx.fillText(`${SPECIALTY_BY_ID[a.specialty]?.name} · ${ATTRIBUTE_BY_ID[a.attribute]?.name}`, sx, fy + 24);
    ctx.restore();

    // Gear under the card.
    const g = gearOf(team, a);
    const gy = top + artH + 104;
    ctx.fillStyle = '#e6e6e6';
    ctx.font = `600 15px ${FONT}`;
    ctx.fillText(fit(ctx, g.wEngine, cardW + 20), x - 10, gy);
    ctx.fillStyle = '#a3a3a3';
    ctx.font = `500 14px ${FONT}`;
    ctx.fillText(fit(ctx, g.discs, cardW + 20), x - 10, gy + 21);
    ctx.fillStyle = '#8a8a8a';
    ctx.font = `500 13px ${MONO}`;
    ctx.fillText(fit(ctx, `${g.mindscape} · ${g.mainsShort}`, cardW + 20), x - 10, gy + 42);
  });

  // Bangboo disc.
  const cx = 52 + 3 * (cardW + gap) + 60;
  const cy = top + 170;
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.fillStyle = '#161616';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#2a2a2a';
  ctx.stroke();
  if (bArt) {
    const h = 110;
    const w = (bArt.width / bArt.height) * h;
    ctx.drawImage(bArt, cx - w / 2, cy - h / 2, w, h);
  } else {
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
  const { arts, bangboo, bArt } = await loadArt(team, base);
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
    ctx.fillText(agentLine(a), tx, y + 82);

    const g = gearOf(team, a);
    const rows = [
      ['W-Engine', g.wEngine],
      ['Mindscape', g.mindscape],
      ['Discs', g.discs],
      ['Main stats', g.mains],
    ];
    rows.forEach(([k, v], r) => {
      const ry = y + 122 + r * 28;
      ctx.fillStyle = '#7a7a7a';
      ctx.font = `500 14px ${MONO}`;
      ctx.fillText(k.toUpperCase(), tx, ry);
      ctx.fillStyle = '#e6e6e6';
      ctx.font = `500 18px ${FONT}`;
      ctx.fillText(fit(ctx, v, W - tx - 200), tx + 130, ry);
    });
  });
  bangbooLine(ctx, bangboo, bArt, 40, top + 3 * (rowH + 14) + 30);
  footer(ctx, W, H, team);
}

const DRAW = { columns: drawColumns, squad: drawSquad, square: drawSquare };

export async function renderTeamCard(team, { base = '/', layout = 'columns' } = {}) {
  await document.fonts?.ready;
  const id = DRAW[layout] ? layout : 'columns';
  const [W, H] = SIZES[id];
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  background(ctx, W, H);
  await DRAW[id](ctx, W, H, team, base);
  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
