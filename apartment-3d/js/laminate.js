// Процедурная текстура ламината «под дерево»: доски со смещением рядов,
// волокна, «соборный» рисунок, редкие сучки и фаски на стыках.
import * as THREE from 'three';

export const LAMINATE_PRESETS = [
  { id: 'oak-natural', name: 'Дуб натуральный', base: '#c39a6b', dark: '#7f5a37', light: '#dfc097', vary: 0.075 },
  { id: 'oak-light',   name: 'Дуб светлый',     base: '#d8bf98', dark: '#a3845c', light: '#ecdcbf', vary: 0.055 },
  { id: 'oak-white',   name: 'Дуб беленый',     base: '#e2d8c8', dark: '#b6a892', light: '#f3eee6', vary: 0.04 },
  { id: 'oak-grey',    name: 'Дуб серый',       base: '#aaa298', dark: '#776e64', light: '#c9c3ba', vary: 0.06 },
  { id: 'oak-smoked',  name: 'Дуб копчёный',    base: '#8e6c4d', dark: '#583d27', light: '#ad8c6d', vary: 0.08 },
  { id: 'walnut',      name: 'Орех',            base: '#6f4c34', dark: '#432d1d', light: '#8c6849', vary: 0.08 },
];

export const PLANK_SIZES = [
  { id: 'std', name: '1380 × 193 мм', len: 1380, wid: 193 },
  { id: 'wide', name: '1380 × 244 мм', len: 1380, wid: 244 },
  { id: 'long', name: '2050 × 240 мм', len: 2050, wid: 240 },
];

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const shade = (c, k) => c.map((v) => Math.max(0, Math.min(255, v * k)));

const COLS = 2;     // досок по длине в одной плитке текстуры
const ROWS = 8;     // рядов в плитке

export function makeLaminate(presetId, sizeId, anisotropy = 8) {
  const preset = LAMINATE_PRESETS.find((p) => p.id === presetId) || LAMINATE_PRESETS[0];
  const size = PLANK_SIZES.find((s) => s.id === sizeId) || PLANK_SIZES[0];
  const W = 2048, Hc = 1024;
  const plankW = W / COLS, rowH = Hc / ROWS;
  const rnd = mulberry32(1234 + presetId.length * 97 + size.wid);

  const base = hexToRgb(preset.base), dark = hexToRgb(preset.dark), light = hexToRgb(preset.light);

  const cv = document.createElement('canvas'); cv.width = W; cv.height = Hc;
  const ctx = cv.getContext('2d');
  const bv = document.createElement('canvas'); bv.width = W; bv.height = Hc;
  const btx = bv.getContext('2d');
  btx.fillStyle = '#8a8a8a'; btx.fillRect(0, 0, W, Hc);

  // смещения рядов: «лесенка» без совпадающих стыков у соседних рядов
  const offsets = [];
  let prev = -1;
  for (let r = 0; r < ROWS; r++) {
    let o;
    do { o = Math.floor(rnd() * 6) / 6; } while (prev >= 0 && Math.abs(o - prev) < 0.2);
    prev = o; offsets.push(o * plankW);
  }

  const drawAt = (fn, x, y, w, h) => {
    fn(x, y, w, h);
    if (x + w > W) fn(x - W, y, w, h);
    if (x < 0) fn(x + W, y, w, h);
  };

  for (let r = 0; r < ROWS; r++) {
    const y = r * rowH;
    for (let k = -1; k < COLS + 1; k++) {
      const x = offsets[r] + k * plankW;
      if (x >= W || x + plankW <= 0) continue;
      const seed = Math.floor(rnd() * 1e9);
      drawAt((px, py, pw, ph) => plank(ctx, btx, px, py, pw, ph, mulberry32(seed), base, dark, light, preset.vary), x, y, plankW, rowH);
    }
  }

  const map = new THREE.CanvasTexture(cv);
  map.colorSpace = THREE.SRGBColorSpace;
  const bump = new THREE.CanvasTexture(bv);
  for (const t of [map, bump]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = anisotropy;
  }
  return { map, bump, tileLen: (size.len * COLS) / 1000, tileWid: (size.wid * ROWS) / 1000 };
}

function plank(ctx, btx, x, y, w, h, rnd, base, dark, light, vary) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

  const k = 1 + (rnd() - 0.5) * 2 * vary;
  const warm = (rnd() - 0.5) * 10;
  const col = [base[0] * k + warm, base[1] * k, base[2] * k - warm * 0.6];
  ctx.fillStyle = rgba(col, 1); ctx.fillRect(x, y, w, h);

  // широкие тональные полосы
  for (let i = 0; i < 5; i++) {
    const yy = y + rnd() * h, bh = h * (0.12 + rnd() * 0.4);
    ctx.fillStyle = rgba(rnd() < 0.6 ? dark : light, 0.035 + rnd() * 0.05);
    ctx.fillRect(x, yy - bh / 2, w, bh);
  }

  // «соборный» рисунок — вложенные дуги
  if (rnd() < 0.55) {
    const cx = x + w * (0.25 + rnd() * 0.5), cy = y + h * (0.3 + rnd() * 0.4);
    const n = 6 + Math.floor(rnd() * 6);
    for (let i = 0; i < n; i++) {
      const rx = 30 + i * (18 + rnd() * 10), ry = 4 + i * (h / 2.6 / n);
      ctx.beginPath();
      for (let t = -1; t <= 1.0001; t += 0.05) {
        const px = cx + t * rx * 2.4, py = cy + (1 - t * t) * -ry + ry * 0.5 + Math.sin(t * 9 + i) * 0.8;
        t === -1 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = rgba(dark, 0.06 + rnd() * 0.08);
      ctx.lineWidth = 0.8 + rnd() * 1.2;
      ctx.stroke();
    }
  }

  // волокна
  const n = 30 + Math.floor(rnd() * 16);
  for (let i = 0; i < n; i++) {
    const yy = y + ((i + rnd()) / n) * h;
    const amp = 0.6 + rnd() * 2.6, fr = 0.003 + rnd() * 0.009, ph = rnd() * 6.283;
    ctx.beginPath();
    for (let xx = 0; xx <= w + 16; xx += 16) {
      const yv = yy + Math.sin(xx * fr + ph) * amp + Math.sin(xx * fr * 3.3 + ph * 1.7) * amp * 0.35;
      xx === 0 ? ctx.moveTo(x + xx, yv) : ctx.lineTo(x + xx, yv);
    }
    const isDark = rnd() < 0.72;
    ctx.strokeStyle = rgba(isDark ? dark : light, isDark ? 0.05 + rnd() * 0.13 : 0.08 + rnd() * 0.1);
    ctx.lineWidth = 0.5 + rnd() * 1.5;
    ctx.stroke();
  }

  // поры — короткие штрихи
  for (let i = 0; i < 160; i++) {
    const px = x + rnd() * w, py = y + rnd() * h, len = 4 + rnd() * 14;
    ctx.strokeStyle = rgba(dark, 0.08 + rnd() * 0.1);
    ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + len, py + (rnd() - 0.5)); ctx.stroke();
  }

  // сучки
  if (rnd() < 0.22) {
    const kx = x + w * (0.1 + rnd() * 0.8), ky = y + h * (0.25 + rnd() * 0.5);
    for (let i = 5; i >= 0; i--) {
      ctx.beginPath();
      ctx.ellipse(kx, ky, 3 + i * 3.5, 2 + i * 1.6, 0, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(shade(dark, 0.8), 0.12 + (5 - i) * 0.04);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.fillStyle = rgba(shade(dark, 0.7), 0.5);
    ctx.beginPath(); ctx.ellipse(kx, ky, 2.5, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // фаски по краям доски
  ctx.fillStyle = 'rgba(40,24,10,0.30)';
  ctx.fillRect(x, y, w, 1.6);
  ctx.fillRect(x, y, 1.8, h);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(x, y + 1.6, w, 1.2);

  // рельеф: стыки темнее, лёгкая фактура волокон
  btx.fillStyle = '#2a2a2a';
  btx.fillRect(x, y, w, 2.2);
  btx.fillRect(x, y, 2.4, h);
  btx.save();
  btx.beginPath(); btx.rect(x + 3, y + 3, w - 4, h - 4); btx.clip();
  for (let i = 0; i < 22; i++) {
    const yy = y + rnd() * h;
    btx.strokeStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '0,0,0'},${0.05 + rnd() * 0.06})`;
    btx.lineWidth = 1;
    btx.beginPath(); btx.moveTo(x, yy); btx.lineTo(x + w, yy + (rnd() - 0.5) * 3); btx.stroke();
  }
  btx.restore();
}
