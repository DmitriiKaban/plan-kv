// Отделка стен поверх покраски: белый кирпичик, плитка, фартук и обои.
// Текстуры рисуются на canvas при запуске — без картинок, работает офлайн.
import * as THREE from 'three';

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// мелкое зерно по всей картинке (±amp по яркости)
function grain(ctx, w, h, amp, r) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 2 * amp;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

// мягкое пятно
function blob(ctx, x, y, rad, rgb, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
}

// рисует fn(x) и, если элемент вылезает за край, ещё раз с другой стороны — чтобы текстура повторялась без шва
function wrapX(W, x, w, fn) {
  fn(x);
  if (x + w > W) fn(x - W);
  if (x < 0) fn(x + W);
}

function finish(cv, srgb, aniso) {
  const t = new THREE.CanvasTexture(cv);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = aniso;
  return t;
}

// ── Белый кирпичик: перевязка со смещением в полкирпича, рельефная «колотая» поверхность ──
// В текстуре 4 кирпича × 8 рядов. Высоту ряда задаёт стена (потолок / число рядов).
export function makeBrick(aniso = 4) {
  const BW = 256, RH = 64, COLS = 4, ROWS = 8, J = 4;
  const W = BW * COLS, H = RH * ROWS;
  const cv = canvas(W, H), ctx = cv.getContext('2d');
  const bv = canvas(W, H), btx = bv.getContext('2d');
  ctx.fillStyle = '#d2cfc9'; ctx.fillRect(0, 0, W, H);          // затирка
  btx.fillStyle = '#2e2e2e'; btx.fillRect(0, 0, W, H);
  const r = rng(39);
  for (let row = 0; row < ROWS; row++) {
    const y = row * RH + J / 2, off = (row % 2) * (BW / 2);
    for (let k = -1; k <= COLS; k++) {
      const x0 = off + k * BW + J / 2;
      if (x0 >= W || x0 + BW <= 0) continue;
      const seed = Math.floor(r() * 1e9);
      wrapX(W, x0, BW - J, (x) => brick(ctx, btx, x, y, BW - J, RH - J, seed));
    }
  }
  grain(ctx, W, H, 5, rng(7));
  return { map: finish(cv, true, aniso), bump: finish(bv, false, aniso), cols: COLS, rows: ROWS };
}

function brick(ctx, btx, x, y, w, h, seed) {
  const r = rng(seed);
  const v = 240 + (r() - 0.5) * 9, warm = (r() - 0.5) * 3;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = `rgb(${v + warm},${v},${v - warm - 2})`;
  ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 7; i++) blob(ctx, x + r() * w, y + r() * h, 10 + r() * 26, r() < 0.55 ? '120,116,110' : '255,255,255', 0.05 + r() * 0.06);
  // поры и мелкие сколы
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = `rgba(110,106,100,${0.07 + r() * 0.13})`;
    const s = 0.8 + r() * 2.2;
    ctx.fillRect(x + r() * w, y + r() * h, s, s * (0.5 + r()));
  }
  // фаска: светлая кромка сверху, тень снизу и справа
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = 'rgba(80,76,70,0.10)'; ctx.fillRect(x, y + h - 3, w, 3); ctx.fillRect(x + w - 2, y, 2, h);
  ctx.restore();

  btx.save();
  btx.beginPath(); btx.rect(x, y, w, h); btx.clip();
  btx.fillStyle = '#9a9a9a'; btx.fillRect(x, y, w, h);
  btx.fillStyle = '#c2c2c2'; btx.fillRect(x + 3, y + 3, w - 6, h - 6);
  // «колотая» поверхность: бугры и ямки
  for (let i = 0; i < 26; i++) blob(btx, x + r() * w, y + r() * h, 6 + r() * 18, r() < 0.5 ? '255,255,255' : '0,0,0', 0.12 + r() * 0.12);
  for (let i = 0; i < 120; i++) {
    btx.fillStyle = r() < 0.5 ? `rgba(0,0,0,${0.15 + r() * 0.2})` : `rgba(255,255,255,${0.1 + r() * 0.2})`;
    const s = 1 + r() * 2.5;
    btx.fillRect(x + r() * w, y + r() * h, s, s);
  }
  btx.restore();
}

// ── Плитка: прямая раскладка шов в шов, матовая, с лёгким «бетонным» облаком ──
// В текстуре 4 × 4 плитки; размер плитки задаётся снаружи (по умолчанию 600 × 300).
export function makeTile(aniso = 4) {
  const TW = 256, TH = 128, COLS = 4, ROWS = 4;
  const W = TW * COLS, H = TH * ROWS;
  const cv = canvas(W, H), ctx = cv.getContext('2d');
  ctx.fillStyle = '#e4e1dc'; ctx.fillRect(0, 0, W, H);          // затирка светлее плитки
  const r = rng(30);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * TW + 1, y = row * TH + 1, w = TW - 1.5, h = TH - 1.5;
      const v = (r() - 0.5) * 5;
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.fillStyle = `rgb(${217 + v},${213 + v},${207 + v})`;
      ctx.fillRect(x, y, w, h);
      for (let i = 0; i < 9; i++) blob(ctx, x + r() * w, y + r() * h, 20 + r() * 60, r() < 0.5 ? '160,154,146' : '250,248,244', 0.04 + r() * 0.05);
      ctx.restore();
    }
  }
  grain(ctx, W, H, 3.5, rng(11));
  return { map: finish(cv, true, aniso), bump: null, cols: COLS, rows: ROWS };
}

// ── Фартук: крупные плиты 120 × 60 под светлый оникс ──
// Классический процедурный мрамор: синус вдоль диагонали, искажённый шумом, — светлые облачные
// полосы и редкие тонкие серые прожилки. Считается в половинном размере и растягивается.
export function makeSlab(aniso = 4) {
  const SW = 1024, SH = 512, COLS = 2;
  const W = SW * COLS, H = SH;
  const cv = canvas(W, H), ctx = cv.getContext('2d');
  const sw = SW / 2, sh = SH / 2;                          // расчёт в половинном размере
  const small = canvas(sw * COLS, sh), sctx = small.getContext('2d');
  const img = sctx.createImageData(sw * COLS, sh), d = img.data;
  const ss = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  for (let k = 0; k < COLS; k++) {
    const n = valueNoise(301 + k * 17), r = rng(77 + k);
    const th = 0.95 + (r() - 0.5) * 0.4, freq = 2.6 + r() * 1.2, power = 2.6 + r() * 1.2;   // разводы поднимаются вправо
    const c = Math.cos(th), sn = Math.sin(th);
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const u = x / sh, v = y / sh;                       // 1 = высота плиты (60 см)
        const t = u * c + v * sn;
        const s = Math.sin(t * freq * 2 + fbm(n, u * 2.6, v * 2.6, 5) * power * 2);
        const s2 = Math.sin(t * freq * 7 + fbm(n, u * 6 + 11, v * 6 + 5, 4) * 5);
        const cloud = fbm(n, u * 1.2 + 7.3, v * 1.2 + 3.1, 4);
        let L = 207 + (cloud - 0.5) * 20;                   // мягкие облака
        L += ss(0.2, 1.0, s) * 15;                          // светлые разводы по диагонали
        L += s2 * 3.5 * (0.4 + cloud);                      // мелкие струйки
        L -= (1 - ss(0.0, 0.09, Math.abs(s + 0.35))) * 8 * cloud * 1.6;    // редкие бледные серые прожилки
        const i = (y * sw * COLS + k * sw + x) * 4;
        d[i] = L + 3; d[i + 1] = L; d[i + 2] = L - 5; d[i + 3] = 255;
      }
    }
  }
  sctx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, 0, 0, W, H);
  ctx.fillStyle = 'rgba(140,134,126,0.55)';                 // тонкие швы между плитами
  for (let k = 0; k < COLS; k++) ctx.fillRect(k * SW, 0, 1.5, SH);
  grain(ctx, W, H, 2, rng(5));
  return { map: finish(cv, true, aniso), bump: null, cols: COLS, rows: 1 };
}

// значения шума в узлах решётки с плавной интерполяцией, 0..1
function valueNoise(seed) {
  const r = rng(seed), P = new Uint8Array(512), V = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; V[i] = r(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = P[i]; P[i] = P[j]; P[j] = t; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
    const a = V[P[P[X] + Y]], b = V[P[P[X + 1] + Y]], c = V[P[P[X] + Y + 1]], e = V[P[P[X + 1] + Y + 1]];
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v;
  };
}
function fbm(n, x, y, oct) {
  let s = 0, amp = 0.5, f = 1;
  for (let o = 0; o < oct; o++) { s += amp * n(x * f, y * f); amp *= 0.5; f *= 2; }
  return s;
}

// ── Обои Natural Forest (рулон 53 см): фактура «лён» и папоротники ──
// Текстуры нейтральные, почти белые; цвет обоев задаёт материал (умножение).

// льняное переплетение: частые тонкие нити по горизонтали и вертикали, яркость нити плавно меняется
// по длине (отсюда «льняная» неровность), редкие короткие мягкие утолщения
function linen(ctx, W, H, r, k = 1) {
  ctx.fillStyle = '#f9f9f9'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) {
    const x = r() * W, y = r() * H, rad = (80 + r() * 160) * k;
    for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) blob(ctx, x + dx, y + dy, rad, r() < 0.5 ? '205,205,205' : '255,255,255', 0.02 + r() * 0.025);
  }
  const step = 1.5 * k;
  for (const horiz of [true, false]) {
    const n = Math.floor((horiz ? H : W) / step), len = horiz ? W : H;
    for (let i = 0; i < n; i++) {
      const p = i * step + r() * step * 0.4, wdt = (0.55 + r() * 0.5) * k;
      // нить из отрезков разной яркости
      let a = 0;
      while (a < len) {
        const seg = (20 + r() * 90) * k, dark = r() < 0.55;
        ctx.fillStyle = dark ? `rgba(130,130,130,${0.02 + r() * 0.045})` : `rgba(255,255,255,${0.04 + r() * 0.07})`;
        const l = Math.min(seg, len - a);
        if (horiz) ctx.fillRect(a, p, l, wdt); else ctx.fillRect(p, a, wdt, l);
        a += seg;
      }
      if (r() < 0.12) {                                   // мягкое утолщение нити
        const b = r() * len, l = (6 + r() * 22) * k;
        ctx.fillStyle = `rgba(120,120,120,${0.03 + r() * 0.04})`;
        for (const o of [-len, 0]) { if (horiz) ctx.fillRect(b + o, p - 0.3 * k, l, wdt + 0.6 * k); else ctx.fillRect(p - 0.3 * k, b + o, wdt + 0.6 * k, l); }
      }
    }
  }
}

export function makeLinen(aniso = 4) {
  const W = 512, H = 512;                     // 53 × 53 см
  const cv = canvas(W, H), ctx = cv.getContext('2d');
  linen(ctx, W, H, rng(1007));
  grain(ctx, W, H, 2, rng(9));
  return { map: finish(cv, true, aniso), bump: null, cols: 1, rows: 1 };
}

// папоротники (NF3207): вайи под разными углами, полупрозрачные, перекрывают друг друга.
// Каждая вайя рисуется сплошной на отдельном слое и кладётся с прозрачностью — внутри вайи
// листочки не темнеют, а там, где вайи перекрываются, — темнее, как на обоях.
export function makeFern(aniso = 4) {
  const W = 1024, H = 1236;                   // 53 × 64 см
  const cv = canvas(W, H), ctx = cv.getContext('2d');
  const layer = canvas(W, H), lc = layer.getContext('2d');
  const r = rng(3207), px = W / 530;          // пикселей на мм
  linen(ctx, W, H, rng(3208), 2);
  const fronds = [];
  const cols = 4, rows = 3;
  for (let i = 0; i < cols * rows; i++) {     // равномерно, с разбросом
    const gx = i % cols, gy = Math.floor(i / cols);
    fronds.push({
      x: (gx + 0.15 + r() * 0.7) * W / cols, y: (gy + 0.15 + r() * 0.7) * H / rows,
      a: r() * Math.PI * 2, len: (240 + r() * 180) * px, bend: (r() - 0.5) * 0.6,
      alpha: r() < 0.35 ? 0.2 + r() * 0.12 : 0.42 + r() * 0.2,
    });
  }
  fronds.sort((p, q) => p.alpha - q.alpha);   // бледные — дальше
  for (const f of fronds) {
    lc.clearRect(0, 0, W, H);
    lc.fillStyle = '#cbcbcb'; lc.strokeStyle = '#cbcbcb';    // чуть контрастнее фото: под светом рисунок бледнеет
    const reach = f.len * 1.2;
    for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) {
      const x = f.x + dx, y = f.y + dy;
      if (x + reach < 0 || x - reach > W || y + reach < 0 || y - reach > H) continue;
      frond(lc, x, y, f, px);
    }
    ctx.globalAlpha = f.alpha;
    ctx.drawImage(layer, 0, 0);
  }
  ctx.globalAlpha = 1;
  grain(ctx, W, H, 2, rng(10));
  return { map: finish(cv, true, aniso), bump: null, cols: 1, rows: 1 };
}

// ── Полоска: шесть вертикальных полос по 8,8 см (рулон 53 см), чередуются светлые и чуть темнее,
// по краю тёмной полосы — тонкая линия; под рисунком та же льняная фактура ──
export function makeStripes(aniso = 4) {
  const W = 512, H = 512;                     // 53 × 53 см
  const cv = canvas(W, H), ctx = cv.getContext('2d');
  linen(ctx, W, H, rng(4401));
  const n = 6, sw = W / n;
  for (let i = 1; i < n; i += 2) {
    ctx.fillStyle = 'rgba(120,120,120,0.10)'; ctx.fillRect(i * sw, 0, sw, H);
    ctx.fillStyle = 'rgba(90,90,90,0.16)';
    ctx.fillRect(i * sw + 3, 0, 1.6, H); ctx.fillRect((i + 1) * sw - 4.6, 0, 1.6, H);
  }
  grain(ctx, W, H, 2, rng(12));
  return { map: finish(cv, true, aniso), bump: null, cols: 1, rows: 1 };
}

// ── Декоративная штукатурка под бетон: мягкие облака и следы шпателя (повтор 1,2 × 1,2 м) ──
export function makePlaster(aniso = 4) {
  const W = 512, H = 512;
  const cv = canvas(W, H), ctx = cv.getContext('2d');
  const r = rng(5150);
  ctx.fillStyle = '#f1f1f1'; ctx.fillRect(0, 0, W, H);
  const wrap = (fn) => { for (const dx of [-W, 0, W]) for (const dy of [-H, 0, H]) fn(dx, dy); };
  for (let i = 0; i < 70; i++) {                        // облака
    const x = r() * W, y = r() * H, rad = 30 + r() * 110, dark = r() < 0.55;
    const a = 0.03 + r() * 0.05, rgb = dark ? '150,150,150' : '255,255,255';
    wrap((dx, dy) => blob(ctx, x + dx, y + dy, rad, rgb, a));
  }
  for (let i = 0; i < 140; i++) {                       // следы шпателя: вытянутые полупрозрачные мазки
    const x = r() * W, y = r() * H, len = 25 + r() * 70, wd = 4 + r() * 12, ang = (r() - 0.5) * 1.4 + (r() < 0.5 ? 0 : Math.PI / 2);
    ctx.fillStyle = r() < 0.5 ? `rgba(255,255,255,${0.05 + r() * 0.06})` : `rgba(140,140,140,${0.03 + r() * 0.05})`;
    wrap((dx, dy) => { ctx.beginPath(); ctx.ellipse(x + dx, y + dy, len, wd, ang, 0, Math.PI * 2); ctx.fill(); });
  }
  for (let i = 0; i < 900; i++) {                       // поры
    ctx.fillStyle = `rgba(110,110,110,${0.05 + r() * 0.1})`;
    const sz = 0.6 + r() * 1.4;
    ctx.fillRect(r() * W, r() * H, sz, sz);
  }
  grain(ctx, W, H, 3, rng(13));
  return { map: finish(cv, true, aniso), bump: null, cols: 1, rows: 1 };
}

// ── Свои обои по фото: картинка (canvas) повторяется; её ширину на стене задают в карточке ──
export function photoTexture(cv, aniso = 4) {
  return { map: finish(cv, true, aniso), bump: null, cols: 1, rows: 1 };
}

// покраска отдельной стены: ровный матовый цвет
export function paintMaterial(color, clip) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 });
  m.clippingPlanes = clip;
  return m;
}

// превью покрытия для карточки: кусок стены viewMm × viewMm в масштабе; src — картинка текстуры
// (repW × repH мм на всю картинку), color — оттенок (умножается, как в материале)
export function drawCoverPreview(cv, src, repW, repH, color, viewMm = 450) {
  const ctx = cv.getContext('2d'), S = cv.width;
  ctx.save();
  ctx.clearRect(0, 0, S, cv.height);
  if (src) {
    const pat = ctx.createPattern(src, 'repeat');
    const k = S / viewMm;
    pat.setTransform(new DOMMatrix().scale(k * repW / src.width, k * repH / src.height));
    ctx.fillStyle = pat; ctx.fillRect(0, 0, S, cv.height);
  } else { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, S, cv.height); }
  if (color && color.toLowerCase() !== '#ffffff') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = color; ctx.fillRect(0, 0, S, cv.height);
  }
  ctx.restore();
}

// вайя: стебель-дуга, перья по обе стороны, длиннее всего ближе к основанию, к верхушке мельче
function frond(ctx, x0, y0, f, px) {
  const ux = Math.cos(f.a), uy = Math.sin(f.a), nx = -uy, ny = ux;
  const pt = (t) => {
    const along = t * f.len, side = f.bend * f.len * t * t * 0.5;
    return { x: x0 + ux * along + nx * side, y: y0 + uy * along + ny * side, a: f.a + Math.atan(f.bend * t) };
  };
  ctx.lineWidth = 1.6 * px; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let t = -0.08; t <= 1.0001; t += 0.04) { const p = pt(t); t <= -0.08 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); }
  ctx.stroke();
  const n = 17;                                         // перьев с каждой стороны: между ними видно фон, как на обоях
  for (let i = 0; i < n; i++) {
    const t = 0.05 + (i / n) * 0.9, p = pt(t);
    const size = Math.pow(1 - t, 0.7) * (0.6 + 0.4 * Math.min(1, t / 0.25));
    const L = f.len * 0.26 * size;
    if (L < 4 * px) continue;
    for (const s of [-1, 1]) {
      const off = s * 0.012 * f.len;                    // перья слегка чередуются
      const bx = p.x + Math.cos(p.a) * off, by = p.y + Math.sin(p.a) * off;
      pinna(ctx, bx, by, p.a + s * (1.15 - t * 0.45), L, px, s);
    }
  }
}

// перо: тонкая жилка и мелкие овальные долечки по обе стороны, наклонённые к кончику пера
function pinna(ctx, x, y, a, L, px, s) {
  const c = Math.cos(a), sn = Math.sin(a);
  const W = L * 0.085, spacing = Math.max(1.4 * px, W * 0.8);
  const n = Math.max(3, Math.floor(L / spacing));
  ctx.lineWidth = 0.7 * px;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + c * L, y + sn * L); ctx.stroke();
  ctx.beginPath();
  for (let k = 0; k < n; k++) {
    const u = (k + 0.6) / n, w = W * Math.pow(1 - u, 0.55) * Math.min(1, 0.45 + u * 3);
    if (w < 0.6 * px) continue;
    for (const side of [-1, 1]) {
      const along = u * L + side * spacing * 0.22;      // долечки тоже чередуются
      const cx = x + c * along - sn * side * w * 0.55, cy = y + sn * along + c * side * w * 0.55;
      const rot = a + side * 0.9;                       // наклон долечки к кончику
      const rx = w * 0.7, ry = spacing * 0.58;          // долечки заходят друг на друга — край пера зубчатый
      ctx.moveTo(cx + Math.cos(rot) * rx, cy + Math.sin(rot) * rx);
      ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
    }
  }
  ctx.fill();
}

// Материал отделки: срезается вместе со стенами (clip), принимает тени
export function finishMaterial(t, kind, clip, color = '#ffffff') {
  // у плитки шов почти в уровень — рельеф не нужен (и не рябит на косых углах); фартук — полированный, обои — матовые
  const m = new THREE.MeshStandardMaterial({
    color, map: t.map, bumpMap: kind === 'brick' ? t.bump : null,
    bumpScale: 2.2, roughness: { brick: 0.82, slab: 0.38, wallpaper: 0.92 }[kind] ?? 0.6, metalness: 0,
  });
  m.clippingPlanes = clip;
  return m;
}
