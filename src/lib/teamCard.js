import {
  AGENT_BY_ID,
  ATTRIBUTE_BY_ID,
  BANGBOO_BY_ID,
  DRIVE_DISC_BY_ID,
  SPECIALTY_BY_ID,
  W_ENGINE_BY_ID,
  initials,
} from '../data/game.js';
import { encodeTeam } from './share.js';
import { loadoutOf } from './teamsReducer.js';
import { BANGBOO_WITH_ART } from '../components/BangbooArt.jsx';

// Draws a 1200×675 team image (16:9, the size most social sites preview).
const W = 1200;
const H = 675;
const FONT = '"IBM Plex Sans", system-ui, sans-serif';
const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, monospace';

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

export async function renderTeamCard(team, { base = '/' } = {}) {
  await document.fonts?.ready;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background: black with tilted gray bands, like the site.
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate((-12 * Math.PI) / 180);
  [[-260, 150], [-40, 110], [170, 170]].forEach(([y, h]) => {
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    roundRect(ctx, -W, y, W * 2, h, h / 2);
    ctx.fill();
    ctx.setLineDash([10, 9]);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    roundRect(ctx, -W + 90, y + 22, W * 2 - 180, h - 44, (h - 44) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  });
  ctx.restore();

  // Silver rule along the top.
  const grad = ctx.createLinearGradient(40, 0, W - 40, 0);
  ['#4a4f5c', '#9ea4b1', '#c3c8d2', '#6b7180', '#464b57'].forEach((c, i, a) => grad.addColorStop(i / (a.length - 1), c));
  ctx.fillStyle = grad;
  roundRect(ctx, 40, 32, W - 80, 6, 3);
  ctx.fill();

  // Title.
  ctx.fillStyle = '#a3a3a3';
  ctx.font = `500 15px ${MONO}`;
  ctx.fillText('ZENLESS ZONE ZERO · TEAM BUILDER', 40, 74);
  ctx.fillStyle = '#f2f2f2';
  ctx.font = `800 54px ${DISPLAY}`;
  ctx.fillText(fit(ctx, (team.name || 'Team').toUpperCase(), 900), 40, 128);

  const mascot = await loadImage(`${base}mascot.svg`);
  if (mascot) ctx.drawImage(mascot, W - 150, 50, 110, 110);

  // Agent columns.
  const colW = 352;
  const gap = 22;
  const top = 168;
  const arts = await Promise.all(team.members.map((id) => (id ? loadImage(`${base}agents/${id}.webp`) : null)));
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

    // Portrait in a ring of the attribute colour; initials if there's no art.
    ctx.beginPath();
    ctx.arc(x + 58, top + 66, 40, 0, Math.PI * 2);
    ctx.fill();
    if (arts[i]) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 58, top + 66, 37, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + 21, top + 29, 74, 74);
      ctx.drawImage(arts[i], x + 21, top + 29, 74, 74);
      ctx.restore();
    } else {
      ctx.fillStyle = '#0a0a0a';
      ctx.font = `800 32px ${DISPLAY}`;
      ctx.textAlign = 'center';
      ctx.fillText(initials(a.name), x + 58, top + 78);
      ctx.textAlign = 'left';
    }

    ctx.fillStyle = '#f2f2f2';
    ctx.font = `700 22px ${FONT}`;
    ctx.fillText(fit(ctx, a.name, colW - 130), x + 110, top + 58);
    ctx.fillStyle = '#a3a3a3';
    ctx.font = `500 15px ${FONT}`;
    ctx.fillText(`${a.rank}-Rank · ${ATTRIBUTE_BY_ID[a.attribute]?.name} · ${SPECIALTY_BY_ID[a.specialty]?.name}`, x + 110, top + 84);

    const lo = loadoutOf(team, a.id);
    const w = lo.wEngine && W_ENGINE_BY_ID[lo.wEngine];
    const d4 = lo.disc4 && DRIVE_DISC_BY_ID[lo.disc4];
    const d2 = lo.disc2 && DRIVE_DISC_BY_ID[lo.disc2];
    const rows = [
      ['Mindscape', `M${lo.mindscape}`],
      ['W-Engine', w ? `${w.name} · P${lo.refinement}` : '—'],
      ['4-piece', d4?.name ?? '—'],
      ['2-piece', d2?.name ?? '—'],
      ['Slot 4', lo.main[4] ?? '—'],
      ['Slot 5', lo.main[5] === 'Attribute DMG' ? `${ATTRIBUTE_BY_ID[a.attribute]?.name} DMG` : lo.main[5] ?? '—'],
      ['Slot 6', lo.main[6] ?? '—'],
    ];
    rows.forEach(([k, v], r) => {
      const y = top + 142 + r * 30;
      ctx.fillStyle = '#7a7a7a';
      ctx.font = `500 13px ${MONO}`;
      ctx.fillText(k.toUpperCase(), x + 24, y);
      ctx.fillStyle = '#e6e6e6';
      ctx.font = `500 16px ${FONT}`;
      ctx.fillText(fit(ctx, v, colW - 140), x + 120, y);
    });
  });

  // Bangboo and footer.
  const b = team.bangboo && BANGBOO_BY_ID[team.bangboo];
  const bArt = b && BANGBOO_WITH_ART.has(b.id) ? await loadImage(`${base}bangboo/${b.id}.webp`) : null;
  ctx.fillStyle = '#a3a3a3';
  ctx.font = `500 14px ${MONO}`;
  ctx.fillText('BANGBOO', 40, 572);
  let bx = 140;
  if (bArt) {
    const h = 44;
    const w = (bArt.width / bArt.height) * h;
    ctx.drawImage(bArt, bx, 545, w, h);
    bx += w + 10;
  }
  ctx.fillStyle = '#f2f2f2';
  ctx.font = `700 20px ${FONT}`;
  ctx.fillText(b ? `${b.name}${b.rank ? ` · ${b.rank}-Rank` : ''}` : 'None', bx, 573);

  ctx.fillStyle = '#7a7a7a';
  ctx.font = `400 13px ${MONO}`;
  ctx.fillText(fit(ctx, encodeTeam(team, loadoutOf), W - 80), 40, 610);
  ctx.fillStyle = '#a3a3a3';
  ctx.font = `500 14px ${FONT}`;
  ctx.fillText('silverneostar.github.io/zzz-team-builder · Unofficial fan project, not affiliated with HoYoverse', 40, 640);
  ctx.textAlign = 'right';
  ctx.fillText('salman-SilverStarneo', W - 40, 640);
  ctx.textAlign = 'left';

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
