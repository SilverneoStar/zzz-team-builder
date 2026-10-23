// Shareable images for the Ethereals tab: the current Deadly Assault and
// Shiyu Defense rotations, each enemy's weaknesses and the site's plan.
// Same black / grey / white look as the team and Agent cards.
import { AGENT_BY_ID, ATTRIBUTE_BY_ID, shortName } from '../data/game.js';
import { DEADLY_ASSAULT, SHIYU_DEFENSE } from '../data/endgame.js';
import { bestBuff, disjointTeams, suggestTeams } from './endgame.js';
import { DISPLAY, EXPORT_SCALE, FONT, MONO, background, fit, loadAgentArt, loadImage, roundRect } from './teamCard.js';

const W = 1080;
const H = 1350;
const K = { panel: 'rgba(22,22,22,0.94)', line: '#333', fg: '#f2f2f2', text: '#e2e2e2', muted: '#a3a3a3', dim: '#7a7a7a' };
const ICON_FILE = { physical: 'physical', fire: 'fire', ice: 'ice', electric: 'electric', ether: 'ether', wind: 'wind' };

const ROLE = { stun: 'Stunner', support: 'Support', defense: 'Defense', anomaly: 'Anomaly' };
const ROLE_ORDER = ['Stunner', 'Support', 'Sub-DPS', 'Anomaly', 'Defense'];
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

/** Team makeup in words, e.g. "Electric or Ether DMG, Stunner and Support". */
function teamComp(ids, target) {
  if (!ids?.length) return '';
  const [carry, ...rest] = ids.map((id) => AGENT_BY_ID[id]);
  const weak = (target.weak ?? []).map((w) => ATTRIBUTE_BY_ID[w]?.name ?? cap(w)).join(' or ');
  const head = `${weak || ATTRIBUTE_BY_ID[carry.attribute]?.name} ${carry.specialty === 'anomaly' ? 'Anomaly' : 'DMG'}`;
  const roles = rest.map((a) => ROLE[a.specialty] ?? 'Sub-DPS').sort((a, b) => ROLE_ORDER.indexOf(a) - ROLE_ORDER.indexOf(b));
  const words = roles.every((r) => r === roles[0]) && roles.length > 1 ? [`${roles.length} more ${roles[0]}`] : roles;
  return `${head}, ${words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words.at(-1)}` : words[0]}`;
}

const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

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

function panel(ctx, x, y, w, h, accent) {
  ctx.fillStyle = K.panel;
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = accent ?? K.line;
  ctx.lineWidth = accent ? 2 : 1;
  ctx.stroke();
}

function cover(ctx, img, x, y, w, h, r = 12, focusY = 0.3) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = '#111';
  ctx.fillRect(x, y, w, h);
  if (img) {
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s;
    const dh = img.height * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * focusY, dw, dh);
  }
  ctx.restore();
}

async function loadIcons(base) {
  const out = {};
  await Promise.all(Object.entries(ICON_FILE).map(async ([id, f]) => (out[id] = await loadImage(`${base}attributes/${f}.png`))));
  return out;
}

/** "Weak" / "Resist" row of attribute icons; returns the x after it. */
function attrRow(ctx, label, ids, icons, x, y, size = 26) {
  ctx.fillStyle = K.dim;
  ctx.font = `600 13px ${MONO}`;
  ctx.fillText(label, x, y + size * 0.68);
  let px = x + 70;
  if (!ids.length) {
    ctx.fillStyle = K.muted;
    ctx.font = `500 16px ${FONT}`;
    ctx.fillText('None', px, y + size * 0.7);
    return;
  }
  ids.forEach((id) => {
    const icon = icons[ICON_FILE[id] ? id : ATTRIBUTE_BY_ID[id]?.base];
    if (icon) ctx.drawImage(icon, px, y, size, size);
    px += size + 6;
  });
}

async function teamPortraits(ctx, ids, base, x, y, size, gap = 8, names = true) {
  if (!ids) return;
  const arts = await Promise.all(ids.map((id) => loadAgentArt(id, base)));
  ids.forEach((id, i) => {
    const cx = x + i * (size + gap);
    const a = AGENT_BY_ID[id];
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#20252d';
    ctx.fill();
    ctx.clip();
    if (arts[i]) {
      const s = Math.max(size / arts[i].width, size / arts[i].height);
      ctx.drawImage(arts[i], cx + (size - arts[i].width * s) / 2, y, arts[i].width * s, arts[i].height * s);
    }
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.strokeStyle = ATTRIBUTE_BY_ID[a.attribute]?.color ?? '#888';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (names) {
      ctx.fillStyle = K.text;
      ctx.font = `600 13px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(fit(ctx, shortName(a), size + gap), cx + size / 2, y + size + 17);
      ctx.textAlign = 'left';
    }
  });
}

async function header(ctx, base, logoSrc, title, dates) {
  const grad = ctx.createLinearGradient(40, 0, W - 40, 0);
  ['#4a4f5c', '#9ea4b1', '#c3c8d2', '#6b7180', '#464b57'].forEach((c, i, arr) => grad.addColorStop(i / (arr.length - 1), c));
  ctx.fillStyle = grad;
  roundRect(ctx, 40, 32, W - 80, 6, 3);
  ctx.fill();
  const [logo, mascot] = await Promise.all([loadImage(`${base}${logoSrc}`), loadImage(`${base}mascot.svg`)]);
  let tx = 40;
  if (logo) {
    const h = 84;
    const w = (logo.width / logo.height) * h;
    ctx.drawImage(logo, 40, 60, w, h);
    tx = 40 + w + 22;
  }
  ctx.fillStyle = K.muted;
  ctx.font = `500 15px ${MONO}`;
  ctx.fillText('ZENLESS ZONE ZERO · ENDGAME', tx, 84);
  ctx.fillStyle = K.fg;
  ctx.font = `800 44px ${DISPLAY}`;
  ctx.fillText(fit(ctx, title.toUpperCase(), W - tx - 170), tx, 126);
  ctx.fillStyle = K.muted;
  ctx.font = `600 16px ${MONO}`;
  ctx.fillText(dates, tx, 150);
  if (mascot) ctx.drawImage(mascot, W - 130, 50, 90, 90);
}

function foot(ctx) {
  ctx.fillStyle = K.muted;
  ctx.font = `500 14px ${FONT}`;
  ctx.fillText('silverneostar.github.io/zzz-team-builder · Unofficial fan project, not affiliated with HoYoverse', 40, H - 30);
  ctx.textAlign = 'right';
  ctx.fillText('salman-SilverStarneo', W - 40, H - 30);
  ctx.textAlign = 'left';
}

function star(ctx, cx, cy, r, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 ? r * 0.45 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx[i ? 'lineTo' : 'moveTo'](cx + rad * Math.cos(a), cy + rad * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

async function drawDeadlyAssault(ctx, base) {
  const da = DEADLY_ASSAULT;
  await header(ctx, base, 'modes/deadly-assault.webp', 'Deadly Assault', `${fmtDate(da.start)} – ${fmtDate(da.end)}`);
  const icons = await loadIcons(base);
  const bosses = da.bosses.map((b) => ({ boss: b, buff: bestBuff(b, da.buffs) }));
  const run = disjointTeams(bosses.map((x) => ({ target: x.boss, buffs: x.buff ? [x.buff] : [] })));
  const arts = await Promise.all(da.bosses.map((b) => loadImage(`${base}${b.art}`)));

  const colW = (W - 80 - 32) / 3;
  const top = 182;
  const ph = 640;
  for (let i = 0; i < 3; i += 1) {
    const { boss, buff } = bosses[i];
    const x = 40 + i * (colW + 16);
    panel(ctx, x, top, colW, ph);
    cover(ctx, arts[i], x + 12, top + 12, colW - 24, 288, 12, 0.25);
    ctx.fillStyle = 'rgba(10,10,10,0.8)';
    roundRect(ctx, x + 22, top + 22, 74, 24, 12);
    ctx.fill();
    ctx.fillStyle = K.fg;
    ctx.font = `700 12px ${MONO}`;
    ctx.fillText(`BOSS ${i + 1}`, x + 32, top + 39);
    ctx.fillStyle = K.fg;
    ctx.font = `800 22px ${FONT}`;
    const nameLines = wrap(ctx, boss.name ?? 'To be announced', colW - 32, 2);
    nameLines.forEach((l, k) => ctx.fillText(l, x + 16, top + 330 + k * 26));
    // Same height for every name, so the rows line up across the three columns.
    let y = top + 330 + 2 * 26;
    attrRow(ctx, 'WEAK', boss.weak, icons, x + 16, y);
    attrRow(ctx, 'RESIST', boss.resist, icons, x + 16, y + 34);
    y += 82;
    if (buff) {
      ctx.fillStyle = K.dim;
      ctx.font = `600 13px ${MONO}`;
      ctx.fillText('BEST BUFF', x + 16, y);
      ctx.fillStyle = K.fg;
      ctx.font = `700 17px ${FONT}`;
      ctx.fillText(buff.name, x + 106, y + 1);
      y += 26;
    }
    ctx.fillStyle = K.dim;
    ctx.font = `600 13px ${MONO}`;
    ctx.fillText('TEAM', x + 16, y + 8);
    const size = Math.min(70, (colW - 32 - 16) / 3);
    const comp = teamComp(run[i]?.ids, boss);
    if (comp) {
      ctx.fillStyle = K.muted;
      ctx.font = `500 13px ${FONT}`;
      ctx.fillText(fit(ctx, comp, colW - 32), x + 16, y + 28);
    }
    await teamPortraits(ctx, run[i]?.ids, base, x + 16, y + 40, size, 8);
  }

  // Buffs
  let y = top + ph + 18;
  const bw = (W - 80 - 32) / 3;
  const bh = 230;
  da.buffs.forEach((b, i) => {
    const x = 40 + i * (bw + 16);
    panel(ctx, x, y, bw, bh);
    ctx.fillStyle = K.fg;
    ctx.font = `800 18px ${FONT}`;
    ctx.fillText(b.name, x + 16, y + 30);
    ctx.fillStyle = K.text;
    ctx.font = `500 14px ${FONT}`;
    let ly = y + 54;
    b.text.forEach((t) => {
      wrap(ctx, t, bw - 32, 8).forEach((l) => {
        if (ly < y + bh - 10) ctx.fillText(l, x + 16, ly);
        ly += 18;
      });
      ly += 6;
    });
  });
  y += bh + 18;

  // Score needed on each boss for each star
  if (da.stars) {
    const sh = 72;
    panel(ctx, 40, y, W - 80, sh);
    ctx.fillStyle = K.dim;
    ctx.font = `600 13px ${MONO}`;
    ctx.fillText('STARS PER BOSS', 60, y + 26);
    ctx.fillStyle = K.muted;
    ctx.font = `500 13px ${FONT}`;
    ctx.fillText('3 stars on all three', 60, y + 45);
    ctx.fillText('unlock Adversity', 60, y + 61);
    const cw = (W - 80 - 220) / 3;
    da.stars.forEach((pts, i) => {
      const cx = 40 + 220 + i * cw;
      if (i) {
        ctx.fillStyle = K.line;
        ctx.fillRect(cx - 1, y + 14, 1, sh - 28);
      }
      // Stars and score centred together in their cell.
      ctx.font = `800 24px ${FONT}`;
      const label = pts.toLocaleString('en-US');
      const sw = (i + 1) * 26 - 4;
      const total = sw + 16 + ctx.measureText(label).width;
      const sx = cx + (cw - total) / 2;
      for (let k = 0; k <= i; k += 1) star(ctx, sx + 11 + k * 26, y + sh / 2, 11, '#f5c542');
      ctx.fillStyle = K.fg;
      ctx.fillText(label, sx + sw + 16, y + sh / 2 + 9);
    });
    y += sh + 18;
  }

  // Adversity
  const bonus = da.bonus;
  if (bonus) {
    const bh2 = H - 70 - y;
    panel(ctx, 40, y, W - 80, bh2, '#8c1f1f');
    const art = bonus.art ? await loadImage(`${base}${bonus.art}`) : null;
    if (art) cover(ctx, art, 54, y + 14, 120, bh2 - 28, 10, 0.2);
    const tx = art ? 194 : 60;
    ctx.fillStyle = '#8c1f1f';
    roundRect(ctx, tx, y + 18, 110, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `700 12px ${MONO}`;
    ctx.fillText((bonus.title ?? '').toUpperCase(), tx + 12, y + 35);
    ctx.fillStyle = K.fg;
    ctx.font = `800 22px ${FONT}`;
    ctx.fillText(bonus.name ?? 'To be announced', tx + 124, y + 38);
    if (bonus.weak?.length) {
      attrRow(ctx, 'WEAK', bonus.weak, icons, tx, y + 56);
      attrRow(ctx, 'RESIST', bonus.resist, icons, tx + 150, y + 56);
      const t = suggestTeams(bonus, [], 1)[0];
      if (t) {
        await teamPortraits(ctx, t.ids, base, W - 80 - 3 * 60 - 8, y + 12, 52, 8);
        ctx.fillStyle = K.muted;
        ctx.font = `500 14px ${FONT}`;
        ctx.textAlign = 'right';
        ctx.fillText(fit(ctx, teamComp(t.ids, bonus), 300), W - 80 - 3 * 60 - 8 - 24, y + 74);
        ctx.textAlign = 'left';
      }
    }
  }
  foot(ctx);
}

async function drawShiyu(ctx, base) {
  const sd = SHIYU_DEFENSE;
  await header(ctx, base, 'modes/shiyu-defense.webp', 'Shiyu Defense', `${fmtDate(sd.start)} – ${fmtDate(sd.end)} · Critical Node`);
  const icons = await loadIcons(base);
  const st = sd.stages[sd.stages.length - 1];
  const plan = disjointTeams(st.sides.map((side) => ({ target: side, buffs: [...st.buffs, ...(side.buffs ?? [])] })));
  const arts = await Promise.all(st.sides.map((s) => (s.art ? loadImage(`${base}${s.art}`) : null)));

  let y = 182;
  const rh = 322;
  for (let i = 0; i < st.sides.length; i += 1) {
    const side = st.sides[i];
    panel(ctx, 40, y, W - 80, rh);
    cover(ctx, arts[i], 56, y + 16, 150, 150, 14, 0.4);
    ctx.fillStyle = K.dim;
    ctx.font = `600 14px ${MONO}`;
    ctx.fillText(`ROOM ${i + 1}`, 226, y + 40);
    ctx.fillStyle = K.fg;
    ctx.font = `800 26px ${FONT}`;
    ctx.fillText(fit(ctx, side.name ?? '', 470), 226, y + 72);
    attrRow(ctx, 'WEAK', side.weak, icons, 226, y + 88, 28);
    attrRow(ctx, 'RESIST', side.resist, icons, 226, y + 126, 28);
    // Room buff, then the fight tip
    let ly = y + 196;
    ctx.fillStyle = K.text;
    ctx.font = `500 14px ${FONT}`;
    (side.buffs?.[0]?.text ?? []).slice(0, 2).forEach((t) => {
      wrap(ctx, t, W - 80 - 400, 2).forEach((l) => {
        ctx.fillText(l, 56, ly);
        ly += 19;
      });
    });
    if (side.tip) {
      ly += 6;
      ctx.fillStyle = K.muted;
      ctx.font = `italic 500 14px ${FONT}`;
      wrap(ctx, side.tip, W - 80 - 400, 2).forEach((l) => {
        ctx.fillText(l, 56, ly);
        ly += 19;
      });
    }
    // Team on the right
    ctx.fillStyle = K.dim;
    ctx.font = `600 13px ${MONO}`;
    ctx.fillText('TEAM', W - 40 - 340, y + 40);
    const comp = teamComp(plan[i]?.ids, side);
    if (comp) {
      ctx.fillStyle = K.muted;
      ctx.font = `500 14px ${FONT}`;
      ctx.fillText(fit(ctx, comp, 340), W - 40 - 340, y + 62);
    }
    await teamPortraits(ctx, plan[i]?.ids, base, W - 40 - 340, y + 76, 96, 12);
    y += rh + 16;
  }
  ctx.fillStyle = K.muted;
  ctx.font = `500 16px ${FONT}`;
  wrap(ctx, st.score ?? '', W - 80, 2).forEach((l, k) => ctx.fillText(l, 40, y + 14 + k * 22));
  if (sd.bonus) {
    ctx.fillStyle = K.fg;
    ctx.font = `700 16px ${FONT}`;
    wrap(ctx, `S+: ${sd.bonus.unlock.replace(/^S\+ is the top grade: /, '')}`, W - 80, 2).forEach((l, k) =>
      ctx.fillText(l, 40, y + 66 + k * 22),
    );
  }
  foot(ctx);
}

export const ENDGAME_CARDS = { 'deadly-assault': drawDeadlyAssault, shiyu: drawShiyu };

/** Renders the endgame card for a mode ('deadly-assault' or 'shiyu'). */
export async function renderEndgameCard(mode, { base = '/', scale = EXPORT_SCALE } = {}) {
  await document.fonts?.ready;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  background(ctx, W, H);
  await (ENDGAME_CARDS[mode] ?? drawDeadlyAssault)(ctx, base);
  return canvas;
}
