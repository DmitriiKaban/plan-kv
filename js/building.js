// Строит 3D-модель квартиры из описания в plan.js:
// стены с проёмами, окна, двери, ламинат, потолок, зоны открывания дверей.
import * as THREE from 'three';
import { makeLaminate } from './laminate.js';
import { makeBrick, makeTile, makeSlab, makeLinen, makeFern, finishMaterial } from './finishes.js';
import { woodMat, woodUV } from './catalog.js';

const MM = 0.001;
const FRAME = 30;   // ширина дверной коробки, мм

export function polyArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

export function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function polyCentroid(poly) {
  let cx = 0, cy = 0, a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a *= 0.5;
  return [cx / (6 * a), cy / (6 * a)];
}

// Материал стены: лицевые грани — краска, изнанка — тёмная «заливка разреза»,
// чтобы при срезе стен по высоте они выглядели сплошными, как на чертеже.
function wallMaterial(color) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.93, metalness: 0, side: THREE.DoubleSide });
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      '#include <dithering_fragment>\n\tif ( ! gl_FrontFacing ) gl_FragColor = vec4( 0.235, 0.247, 0.267, 1.0 );'
    );
  };
  m.customProgramCacheKey = () => 'wall-cap';
  return m;
}

export class Building {
  constructor(scene, plan, renderer) {
    this.scene = scene;
    this.plan = plan;
    this.renderer = renderer;
    this.group = new THREE.Group();
    this.group.name = 'building';
    scene.add(this.group);

    this.cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
    const clip = [this.cutPlane];

    this.mat = {
      wall: wallMaterial('#f2efe9'),
      top: new THREE.MeshBasicMaterial({ color: '#3c3f44' }),
      floor: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.62, metalness: 0 }),
      ceiling: new THREE.MeshStandardMaterial({ color: '#f7f6f3', roughness: 1, emissive: '#1c1c1b' }),
      frame: new THREE.MeshStandardMaterial({ color: '#f6f6f4', roughness: 0.5 }),
      sill: new THREE.MeshStandardMaterial({ color: '#f4f4f2', roughness: 0.35 }),
      glass: new THREE.MeshStandardMaterial({ color: '#cfe2ec', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, depthWrite: false }),
      leaf: new THREE.MeshStandardMaterial({ color: '#f3f1ec', roughness: 0.55 }),
      // межкомнатные двери: белое полотно, матовое стекло, тёмные канавки
      leafWhite: new THREE.MeshStandardMaterial({ color: '#f8f8f6', roughness: 0.32 }),
      // матовое стекло двери: по фото чуть темнее белого полотна и с зеленоватым оттенком
      frosted: new THREE.MeshStandardMaterial({ color: '#dde5e2', roughness: 0.18, transparent: true, opacity: 0.9, depthWrite: false }),
      groove: new THREE.MeshStandardMaterial({ color: '#8e9194', roughness: 0.5 }),
      handle: new THREE.MeshStandardMaterial({ color: '#c3c6ca', roughness: 0.35, metalness: 0.35 }),
      swingFill: new THREE.MeshBasicMaterial({ color: '#2b45c8', transparent: true, opacity: 0.07, depthWrite: false }),
      swingLine: new THREE.LineBasicMaterial({ color: '#2b45c8', transparent: true, opacity: 0.55 }),
    };
    for (const k of ['wall', 'top', 'frame', 'sill', 'glass', 'leaf', 'handle', 'leafWhite', 'frosted', 'groove']) this.mat[k].clippingPlanes = clip;
    this.leafMats = new Map();

    this.opts = { ceiling: plan.M.ceiling, wallColor: '#f2efe9', laminate: 'oak-natural', plankSize: 'std', plankDir: 'y' };
    this.cutMm = null;
    this.flags = { ceiling: false, doors: true, swings: true };
    this.finishOn = {};          // id отделки → показывать ли (по умолчанию да)
    this.finishTex = {};
    this.finishMats = {};
  }

  get ceilingMm() { return this.opts.ceiling; }

  build(opts = {}) {
    Object.assign(this.opts, opts);
    // очистка
    for (const ch of [...this.group.children]) {
      this.group.remove(ch);
      ch.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    }
    this.pieces = [];
    this.swings = [];
    this.pickables = [];
    this.niches = [];
    this.doorLeaves = new THREE.Group();
    this.swingGroup = new THREE.Group();
    this.lights = new THREE.Group();
    this.group.add(this.doorLeaves, this.swingGroup, this.lights);

    const ceil = this.opts.ceiling;
    this.mat.wall.color.set(this.opts.wallColor);

    for (const w of this.plan.WALLS) this.buildWall(w, ceil);
    for (const f of this.plan.FIXTURES) {
      const m = this.box(f.x0, f.y0, f.x1, f.y1, 0, ceil, [this.mat.wall, this.mat.wall, this.mat.top, this.mat.wall, this.mat.wall, this.mat.wall]);
      m.userData.arch = f.name;
      this.pieces.push({ x0: f.x0, y0: f.y0, x1: f.x1, y1: f.y1, h0: 0, h1: ceil, kind: 'fixture', name: f.name });
    }

    this.buildFloor();
    this.buildCeiling(ceil);
    this.buildRooms();
    this.buildFinishes(ceil);
    this.buildBaseboards();
    this.buildPipes(ceil);
    this.buildRoomLights(ceil);
    this.setLaminate(this.opts.laminate, this.opts.plankSize);
    this.applyFlags();

    // препятствия для прогулки: всё, что ниже колена (стены и подоконники), мм → м
    this.obstacles = this.pieces.filter((p) => p.h0 < 400).map((p) => ({
      cx: (p.x0 + p.x1) / 2 * MM, cz: (p.y0 + p.y1) / 2 * MM,
      hx: (p.x1 - p.x0) / 2 * MM, hz: (p.y1 - p.y0) / 2 * MM, c: 1, s: 0,
    }));
    const xs = this.plan.OUTLINE.map((p) => p[0]), ys = this.plan.OUTLINE.map((p) => p[1]);
    this.bounds = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    this.setCut(this.cutMm);
  }

  box(x0, y0, x1, y1, h0, h1, mat, parent = this.group) {
    const g = new THREE.BoxGeometry((x1 - x0) * MM, (h1 - h0) * MM, (y1 - y0) * MM);
    const m = new THREE.Mesh(g, mat);
    m.position.set((x0 + x1) / 2 * MM, (h0 + h1) / 2 * MM, (y0 + y1) / 2 * MM);
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m);
    return m;
  }

  buildWall(w, ceil) {
    const horiz = (w.x1 - w.x0) >= (w.y1 - w.y0);
    const a0 = horiz ? w.x0 : w.y0, a1 = horiz ? w.x1 : w.y1;
    const rectOf = (s, e) => (horiz ? [s, w.y0, e, w.y1] : [w.x0, s, w.x1, e]);
    const solidMats = [this.mat.wall, this.mat.wall, this.mat.top, this.mat.wall, this.mat.wall, this.mat.wall];
    const add = (s, e, h0, h1, kind, rect = rectOf(s, e)) => {
      if (e - s < 0.5 || h1 - h0 < 0.5) return;
      const [x0, y0, x1, y1] = rect;
      const mesh = this.box(x0, y0, x1, y1, h0, h1, kind === 'sill' || kind === 'niche-low' ? this.mat.wall : solidMats);
      mesh.userData.arch = w.name;
      this.pickables.push(mesh);
      this.pieces.push({ x0, y0, x1, y1, h0, h1, kind, wall: w.id, name: w.name });
    };
    const ops = [...w.openings].sort((p, q) => p.from - q.from);
    let cur = a0;
    for (const o of ops) {
      add(cur, o.from, 0, ceil, 'solid');
      cur = o.to;
      if (o.type === 'niche') {
        // ниша: стена под ней и над ней целиком, за ней — тоньше на глубину ниши, внутри полка
        add(o.from, o.to, 0, o.bottom, 'niche-low');
        add(o.from, o.to, o.top, ceil, 'lintel');
        const p0 = horiz ? w.y0 : w.x0, p1 = horiz ? w.y1 : w.x1;
        const face = o.side < 0 ? p0 : p1, dir = o.side < 0 ? 1 : -1, back = face + dir * o.depth;
        const [q0, q1] = o.side < 0 ? [back, p1] : [p0, back];
        add(o.from, o.to, o.bottom, o.top, 'niche', horiz ? [o.from, q0, o.to, q1] : [q0, o.from, q1, o.to]);
        const n = { horiz, from: o.from, to: o.to, bottom: o.bottom, top: o.top, face, dir, back, shelf: o.shelf, shelfT: 40 };
        this.niches.push(n);
        if (o.shelf) {
          const [r0, r1] = [Math.min(face, back), Math.max(face, back)];
          if (horiz) this.box(o.from, r0, o.to, r1, o.shelf, o.shelf + n.shelfT, this.mat.wall);
          else this.box(r0, o.from, r1, o.to, o.shelf, o.shelf + n.shelfT, this.mat.wall);
        }
        continue;
      }
      add(o.from, o.to, 0, o.bottom, 'sill');
      add(o.from, o.to, o.top, ceil, 'lintel');
      if (o.type === 'door') this.buildDoor(w, o, horiz);
      else this.buildWindow(w, o, horiz);
    }
    add(cur, a1, 0, ceil, 'solid');
  }

  // прямоугольник в координатах «вдоль стены / поперёк / высота» → меш
  wbox(w, horiz, s, e, p0, p1, h0, h1, mat, parent) {
    return horiz ? this.box(s, p0, e, p1, h0, h1, mat, parent) : this.box(p0, s, p1, e, h0, h1, mat, parent);
  }

  buildWindow(w, o, horiz) {
    const p0 = horiz ? w.y0 : w.x0, p1 = horiz ? w.y1 : w.x1, t = p1 - p0;
    const inSide = o.sill || 1;
    const fc = inSide > 0 ? p0 + t * 0.38 : p1 - t * 0.38;   // плоскость рамы ближе к улице
    const fd = 70, fw = 60;
    const F = (s, e, h0, h1, mat = this.mat.frame) => this.wbox(w, horiz, s, e, fc - fd / 2, fc + fd / 2, h0, h1, mat);
    F(o.from, o.from + fw, o.bottom, o.top);
    F(o.to - fw, o.to, o.bottom, o.top);
    F(o.from, o.to, o.bottom, o.bottom + fw);
    F(o.from, o.to, o.top - fw, o.top);
    const width = o.to - o.from;
    const n = width > 1800 ? 2 : width > 900 ? 1 : 0;
    for (let i = 1; i <= n; i++) {
      const c = o.from + (width * i) / (n + 1);
      F(c - 35, c + 35, o.bottom + fw, o.top - fw);
    }
    const g = this.wbox(w, horiz, o.from + fw, o.to - fw, fc - 12, fc + 12, o.bottom + fw, o.top - fw, this.mat.glass);
    g.castShadow = false; g.renderOrder = 2;
    // подоконник со стороны комнаты. board.flush — подоконника нет: в проёме доска из дерева заподлицо со стеной,
    // её продолжает столешница (верх на 1 мм выше низа окна, чтобы не мерцать с гранью стены)
    const bd = o.board;
    if (bd && bd.flush) {
      if (!this.boardMats) this.boardMats = new Map();
      if (!this.boardMats.has(bd.color)) {
        const m = woodMat(bd.color).clone();
        m.clippingPlanes = [this.cutPlane];
        this.boardMats.set(bd.color, m);
      }
      const sIn = inSide > 0 ? [fc + fd / 2, p1] : [p0, fc - fd / 2], bt = bd.t || 30;
      const b = this.wbox(w, horiz, o.from + 0.5, o.to - 0.5, sIn[0], sIn[1], o.bottom - bt + 1, o.bottom + 1, this.boardMats.get(bd.color));
      woodUV(b.geometry);
    } else {
      const sIn = inSide > 0 ? [fc + fd / 2, p1 + 70] : [p0 - 70, fc - fd / 2];
      this.wbox(w, horiz, o.from - 40, o.to + 40, sIn[0], sIn[1], o.bottom - 22, o.bottom, this.mat.sill);
    }
  }

  leafMat(color) {
    if (!color) return this.mat.leaf;
    if (!this.leafMats.has(color)) {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
      m.clippingPlanes = [this.cutPlane];
      this.leafMats.set(color, m);
    }
    return this.leafMats.get(color);
  }

  buildDoor(w, o, horiz) {
    const p0 = horiz ? w.y0 : w.x0, p1 = horiz ? w.y1 : w.x1;
    const jm = this.leafMat(o.leafColor) === this.mat.leaf ? this.mat.frame : this.leafMat(o.leafColor);
    // коробка с наличниками
    this.wbox(w, horiz, o.from - 50, o.from + FRAME, p0 - 10, p1 + 10, 0, o.top + 50, jm);
    this.wbox(w, horiz, o.to - FRAME, o.to + 50, p0 - 10, p1 + 10, 0, o.top + 50, jm);
    this.wbox(w, horiz, o.from + FRAME, o.to - FRAME, p0 - 10, p1 + 10, o.top - FRAME, o.top + 50, jm);

    // полотно открыто на 90° в сторону открывания
    const leafW = o.to - o.from - 2 * FRAME - 4;
    const c = o.hinge === 'from' ? 1 : -1;
    const along = o.hinge === 'from' ? o.from + FRAME : o.to - FRAME;
    const face = o.swing > 0 ? p1 : p0;
    const hinge = horiz ? [along, face] : [face, along];
    const closed = horiz ? [c, 0] : [0, c];
    const open = horiz ? [0, o.swing] : [o.swing, 0];
    const T = 40;
    const cx = hinge[0] + open[0] * leafW / 2 + closed[0] * T / 2;
    const cy = hinge[1] + open[1] * leafW / 2 + closed[1] * T / 2;
    const sx = Math.abs(open[0]) * leafW + Math.abs(closed[0]) * T;
    const sy = Math.abs(open[1]) * leafW + Math.abs(closed[1]) * T;
    const h0 = 10, h1 = o.top - FRAME - 4;
    const leaf = new THREE.Group();
    // у открытых полотен свои копии материалов — чтобы делать их прозрачными, когда подходишь вплотную
    const own = new Map();
    const M = (m) => {
      if (o.closed) return m;
      if (!own.has(m)) { const c = m.clone(); c.clippingPlanes = m.clippingPlanes; c.userData.base = { opacity: m.opacity, transparent: m.transparent }; own.set(m, c); }
      return own.get(m);
    };
    if (o.closed) {
      // закрытое полотно (входная дверь): стоит в проёме и не пускает наружу
      const a0 = o.from + FRAME + 2, a1 = o.to - FRAME - 2;
      const q0 = o.swing > 0 ? p1 - T : p0, q1 = o.swing > 0 ? p1 : p0 + T;
      this.wbox(w, horiz, a0, a1, q0, q1, h0, h1, this.leafMat(o.leafColor), leaf);
      const hx = horiz ? (c > 0 ? a1 - 70 : a0 + 70) : (o.swing > 0 ? q0 - 18 : q1 + 18);
      const hy = horiz ? (o.swing > 0 ? q0 - 18 : q1 + 18) : (c > 0 ? a1 - 70 : a0 + 70);
      this.box(hx - 12, hy - 12, hx + 12, hy + 12, 980, 1000, this.mat.handle, leaf).castShadow = false;
      const [x0, y0, x1, y1] = horiz ? [a0, q0, a1, q1] : [q0, a0, q1, a1];
      this.pieces.push({ x0, y0, x1, y1, h0: 0, h1: o.top, kind: 'door', wall: w.id, name: o.name });
    } else if (o.glass) {
      const b = 70;
      const along0 = (s, e, a0, a1) => (Math.abs(open[0]) ? [cx - sx / 2 + s, cy - sy / 2, cx - sx / 2 + e, cy + sy / 2] : [cx - sx / 2, cy - sy / 2 + s, cx + sx / 2, cy - sy / 2 + e]);
      const r = (s, e, a0, a1, mat) => { const [x0, y0, x1, y1] = along0(s, e); return this.box(x0, y0, x1, y1, a0, a1, mat, leaf); };
      r(0, b, h0, h1, M(this.mat.frame)); r(leafW - b, leafW, h0, h1, M(this.mat.frame));
      r(0, leafW, h0, h0 + 220, M(this.mat.frame)); r(0, leafW, h1 - b, h1, M(this.mat.frame));
      const gl = r(b, leafW - b, h0 + 220, h1 - b, M(this.mat.glass)); gl.castShadow = false;
    } else if (o.style === 'strips') {
      // межкомнатная дверь по фото: белое полотно, три полосы матового стекла и две тонкие канавки
      const st = 50, H = h1 - h0;                         // боковые бруски 5 см
      const alongX = Math.abs(open[0]) > 0;
      const part = (s, e, a0, a1, mat, t = T) => {
        const [x0, y0, x1, y1] = alongX ? [cx - sx / 2 + s, cy - t / 2, cx - sx / 2 + e, cy + t / 2] : [cx - t / 2, cy - sy / 2 + s, cx + t / 2, cy - sy / 2 + e];
        return this.box(x0, y0, x1, y1, a0, a1, mat, leaf);
      };
      const white = M(this.mat.leafWhite), frosted = M(this.mat.frosted), groove = M(this.mat.groove);
      part(0, st, h0, h1, white); part(leafW - st, leafW, h0, h1, white);
      // сверху вниз, доли высоты полотна: панель, стекло, панель, канавка, панель, стекло, панель, канавка, панель, стекло, панель
      const bands = [['p', 0.15], ['g', 0.08], ['p', 0.135], ['l'], ['p', 0.13], ['g', 0.08], ['p', 0.11], ['l'], ['p', 0.105], ['g', 0.075], ['p', 0.135]];
      let top = h1;
      for (const [kind, frac] of bands) {
        if (kind === 'l') { part(st, leafW - st, top - 2, top + 2, groove, T + 2).castShadow = false; continue; }
        const bot = top - frac * H;
        if (kind === 'p') part(st, leafW - st, bot, top, white);
        else { const g = part(st, leafW - st, bot, top, frosted, 8); g.castShadow = false; g.renderOrder = 2; }
        top = bot;
      }
    } else {
      this.box(cx - sx / 2, cy - sy / 2, cx + sx / 2, cy + sy / 2, h0, h1, M(this.leafMat(o.leafColor)), leaf);
    }
    // ручка у свободного края, с обеих сторон полотна
    const hx = hinge[0] + open[0] * (leafW - 70), hy = hinge[1] + open[1] * (leafW - 70);
    for (const side of o.closed ? [] : [-1, 1]) {
      const ox = hx + closed[0] * (T / 2 + side * (T / 2 + 18)), oy = hy + closed[1] * (T / 2 + side * (T / 2 + 18));
      this.box(ox - 12, oy - 12, ox + 12, oy + 12, 980, 1000, M(this.mat.handle), leaf).castShadow = false;
    }
    leaf.userData.arch = o.name || 'Дверь';
    if (!o.closed) {
      leaf.userData.rect = { x0: cx - sx / 2, y0: cy - sy / 2, x1: cx + sx / 2, y1: cy + sy / 2 };
      leaf.userData.mats = [...own.values()];
      leaf.userData.fade = 1;
    }
    this.doorLeaves.add(leaf);

    // зона открывания: сектор радиусом с полотно
    const a0 = Math.atan2(closed[1], closed[0]);
    let d = Math.atan2(open[1], open[0]) - a0;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    const pts = [hinge];
    const N = 18;
    for (let i = 0; i <= N; i++) {
      const a = a0 + (d * i) / N;
      pts.push([hinge[0] + Math.cos(a) * leafW, hinge[1] + Math.sin(a) * leafW]);
    }
    this.swings.push({ name: o.name || 'Дверь', acc: o.acc || (o.name || 'дверь').toLowerCase(), poly: pts, hinge, r: leafW });
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x * MM, -y * MM)));
    const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape), this.mat.swingFill);
    fill.rotation.x = -Math.PI / 2; fill.position.y = 0.002; fill.renderOrder = 1;
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.slice(1).map(([x, y]) => new THREE.Vector3(x * MM, 0.003, y * MM))), this.mat.swingLine);
    this.swingGroup.add(fill, line);
  }

  buildFloor() {
    const shape = new THREE.Shape(this.plan.OUTLINE.map(([x, y]) => new THREE.Vector2(x * MM, -y * MM)));
    const geo = new THREE.ShapeGeometry(shape);
    this.floor = new THREE.Mesh(geo, this.mat.floor);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.receiveShadow = true;
    this.floor.userData.arch = 'Пол';
    this.group.add(this.floor);
    this.pickables.push(this.floor);
  }

  updateFloorUV() {
    const geo = this.floor.geometry, pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const { tileLen, tileWid } = this.lam;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = -pos.getY(i);
      if (this.opts.plankDir === 'y') uv.setXY(i, y / tileLen, x / tileWid);
      else uv.setXY(i, x / tileLen, y / tileWid);
    }
    uv.needsUpdate = true;
  }

  buildCeiling(ceil) {
    const shape = new THREE.Shape(this.plan.OUTLINE.map(([x, y]) => new THREE.Vector2(x * MM, y * MM)));
    this.ceiling = new THREE.Mesh(new THREE.ShapeGeometry(shape), this.mat.ceiling);
    this.ceiling.rotation.x = Math.PI / 2;
    this.ceiling.position.y = ceil * MM;
    this.ceiling.userData.arch = 'Потолок';
    this.group.add(this.ceiling);
    this.pickables.push(this.ceiling);
  }

  buildRooms() {
    this.rooms = this.plan.ROOMS.map((r) => {
      const xs = r.poly.map((p) => p[0]), ys = r.poly.map((p) => p[1]);
      const size = r.size || [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
      return { ...r, area: polyArea(r.poly) / 1e6, label: r.label || polyCentroid(r.poly), size };
    });
  }

  // ── Отделка: тонкие панели с текстурой поверх покрашенных стен ──
  buildFinishes(ceil) {
    this.finishMeshes = {};
    const aniso = this.renderer ? Math.min(8, this.renderer.capabilities.getMaxAnisotropy()) : 4;
    for (const f of this.plan.FINISHES || []) {
      const key = f.kind === 'wallpaper' ? `wallpaper-${f.pattern}` : f.kind;
      const make = { brick: makeBrick, tile: makeTile, slab: makeSlab, 'wallpaper-linen': makeLinen, 'wallpaper-fern': makeFern }[key];
      if (!make) continue;
      if (!this.finishTex[key]) this.finishTex[key] = make(aniso);
      const t = this.finishTex[key];
      // размер одного повтора текстуры, мм: у кирпича высота ряда — потолок / число рядов; у обоев — ширина рулона
      const size = f.kind === 'brick' ? [f.brick, ceil / f.courses] : f.kind === 'slab' ? f.slab : f.kind === 'wallpaper' ? f.repeat : f.tile;
      const repW = t.cols * size[0], repH = t.rows * size[1];
      const geo = this.finishGeometry(f, ceil, repW, repH);
      if (!geo) continue;
      if (!this.finishMats[f.id]) this.finishMats[f.id] = finishMaterial(t, f.kind, [this.cutPlane], f.color);
      const mesh = new THREE.Mesh(geo, this.finishMats[f.id]);
      mesh.receiveShadow = true;
      mesh.visible = this.finishOn[f.id] !== false;
      mesh.userData.finish = f.id;
      this.group.add(mesh);
      this.finishMeshes[f.id] = mesh;
    }
  }

  // Для каждой стороны помещения берём куски стен и коробов, чья грань лежит на этой стороне,
  // и кладём поверх панель того же размера — проёмы дверей остаются открытыми сами собой.
  finishGeometry(f, ceil, repW, repH) {
    const P = [], Nr = [], U = [], I = [];
    const OFF = 1.5;    // мм от стены, чтобы панель не мерцала
    const [band0, band1] = f.h || [0, ceil];          // полоса по высоте (фартук) или вся стена
    let ox = 0, oy = 0; // начало раскладки — угол помещения или начало участка (offset)
    const uvOf = (n) => (p) => (n[1] !== 0 ? [(p[0] - ox) / repW, (p[2] - oy) / repH]
      : n[0] !== 0 ? [(p[2] - oy) / repW, (p[1] - band0) / repH] : [(p[0] - ox) / repW, (p[1] - band0) / repH]);
    // четырёхугольник по точкам [x, высота, y] в мм; порядок обхода подбирается так, чтобы лицо смотрело по n
    const quad = (pts, n) => {
      const base = P.length / 3, uv = uvOf(n);
      for (const p of pts) { P.push(p[0] * MM, p[1] * MM, p[2] * MM); Nr.push(n[0], n[1], n[2]); U.push(...uv(p)); }
      const e1 = [0, 1, 2].map((k) => pts[1][k] - pts[0][k]), e2 = [0, 1, 2].map((k) => pts[2][k] - pts[0][k]);
      const c = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      const front = c[0] * n[0] + c[1] * n[1] + c[2] * n[2] > 0;
      I.push(...(front ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]).map((k) => base + k));
    };
    // вертикальная панель: вдоль X на линии y = c или вдоль Y на линии x = c
    const vquad = (alongX, c, a, b, h0, h1, k) => (alongX
      ? quad([[a, h0, c], [b, h0, c], [b, h1, c], [a, h1, c]], [0, 0, k])
      : quad([[c, h0, a], [c, h0, b], [c, h1, b], [c, h1, a]], [k, 0, 0]));
    const hquad = (x0, x1, y0, y1, h, k) => quad([[x0, h, y0], [x1, h, y0], [x1, h, y1], [x0, h, y1]], [0, k, 0]);
    const sideOf = (alongX, k) => (alongX ? (k > 0 ? 'N' : 'S') : (k > 0 ? 'W' : 'E'));

    for (const roomId of f.rooms) {
      const room = this.plan.ROOMS.find((r) => r.id === roomId);
      if (!room) continue;
      const poly = room.poly;
      const rx = Math.min(...poly.map((p) => p[0])), ry = Math.min(...poly.map((p) => p[1]));
      for (let i = 0; i < poly.length; i++) {
        const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length];
        const alongX = Math.abs(by - ay) < 0.5;
        if (!alongX && Math.abs(bx - ax) >= 0.5) continue;
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const k = alongX ? (pointInPoly(mx, my + 5, poly) ? 1 : -1) : (pointInPoly(mx + 5, my, poly) ? 1 : -1);
        const side = sideOf(alongX, k);
        if (f.sides && !f.sides.includes(side)) continue;
        // участки стены: вся сторона или несколько отрезков (parts) — например, обои двух видов на одной стене
        for (const part of f.parts ? f.parts.filter((q) => q.side === side) : [{}]) {
        ox = rx; oy = ry;
        if (part.offset != null) { if (alongX) ox = part.offset; else oy = part.offset; }
        const c = alongX ? ay : ax;
        const s0 = Math.max(alongX ? Math.min(ax, bx) : Math.min(ay, by), part.from ?? -Infinity);
        const s1 = Math.min(alongX ? Math.max(ax, bx) : Math.max(ay, by), part.to ?? Infinity);
        for (const p of this.pieces) {
          if (p.kind === 'door') continue;
          const face = alongX ? (k > 0 ? p.y1 : p.y0) : (k > 0 ? p.x1 : p.x0);
          if (Math.abs(face - c) > 1) continue;
          const a = Math.max(s0, alongX ? p.x0 : p.y0), b = Math.min(s1, alongX ? p.x1 : p.y1);
          const h0 = Math.max(band0, p.h0), h1 = Math.min(band1, ceil, p.h1);
          if (b - a < 1 || h1 - h0 < 1) continue;
          // соседние панели заходят друг на друга на полмиллиметра — без щелей на стыках кусков стены
          vquad(alongX, c + k * OFF, a - 0.5, b + 0.5, Math.max(0, h0 - 0.5), Math.min(ceil, h1 + 0.5), k);
        }
        }
      }
      ox = rx; oy = ry;
      // ниши, открытые в это помещение: задняя стенка, бока, низ, верх и полка
      for (const n of this.niches) {
        const mid = (n.from + n.to) / 2, out = n.face - n.dir * 50;
        if (!pointInPoly(n.horiz ? mid : out, n.horiz ? out : mid, poly)) continue;
        if (f.sides && !f.sides.includes(sideOf(n.horiz, -n.dir))) continue;
        if (f.parts || f.h) continue;                     // ниши — только у отделки на всю стену
        const [r0, r1] = [Math.min(n.face, n.back), Math.max(n.face, n.back)];
        const A = n.horiz;
        vquad(A, n.back - n.dir * OFF, n.from, n.to, n.bottom, n.top, -n.dir);
        vquad(!A, n.from + OFF, r0, r1, n.bottom, n.top, 1);
        vquad(!A, n.to - OFF, r0, r1, n.bottom, n.top, -1);
        const H = (h, kk) => (A ? hquad(n.from, n.to, r0, r1, h, kk) : hquad(r0, r1, n.from, n.to, h, kk));
        H(n.bottom + OFF, 1); H(n.top - OFF, -1);
        if (n.shelf) {
          H(n.shelf + n.shelfT + OFF, 1); H(n.shelf - OFF, -1);
          vquad(A, n.face - n.dir * OFF, n.from, n.to, n.shelf, n.shelf + n.shelfT, -n.dir);
        }
      }
    }
    if (!I.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(Nr, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    g.setIndex(I);
    return g;
  }

  // ── Отопление: стояк в углу, подача сверху и обратка снизу до торца батареи, байпас с красным краном ──
  buildPipes(ceil) {
    const R = this.plan.RAD;
    if (!R || !this.plan.HEATING) return;
    if (!this.mat.pipe) {
      this.mat.pipe = new THREE.MeshStandardMaterial({ color: '#f3f3f0', roughness: 0.45 });
      this.mat.valve = new THREE.MeshStandardMaterial({ color: '#c8372a', roughness: 0.5 });
      this.mat.pipe.clippingPlanes = this.mat.valve.clippingPlanes = [this.cutPlane];
    }
    const tube = (x, y, z, len, r, alongX, m) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r * MM, r * MM, len * MM, 12), m);
      if (alongX) mesh.rotation.z = Math.PI / 2;
      mesh.position.set(x * MM, z * MM, y * MM);
      mesh.castShadow = true; mesh.receiveShadow = true;
      this.group.add(mesh);
    };
    for (const h of this.plan.HEATING) {
      const w = h.sections * R.section, y = h.face + R.gap + R.d / 2;   // трубы в плоскости батареи
      const side = Math.sign(h.riser - h.at), end = h.at + side * w / 2;  // торец со стороны стояка
      const zTop = R.z + R.h - 45, zBot = R.z + 45, len = Math.abs(h.riser - end);
      tube(h.riser, y, ceil / 2, ceil, 16, false, this.mat.pipe);                   // стояк
      for (const z of [zTop, zBot]) tube((h.riser + end) / 2, y, z, len, 12.5, true, this.mat.pipe);
      const bx = end + side * Math.min(110, len / 2);                              // байпас у батареи
      tube(bx, y, (zTop + zBot) / 2, zTop - zBot, 12.5, false, this.mat.pipe);
      this.box(bx - 12, y + 14, bx + 12, y + 44, (zTop + zBot) / 2 - 10, (zTop + zBot) / 2 + 10, this.mat.valve);
    }
  }

  // ── Плинтус: планка по низу стен в выбранных комнатах; у дверей обрывается у наличников ──
  buildBaseboards() {
    const BB = this.plan.BASEBOARD;
    this.baseboard = null;
    if (!BB) return;
    if (!this.mat.baseboard) {
      this.mat.baseboard = new THREE.MeshStandardMaterial({ color: BB.color, roughness: 0.4 });
      this.mat.baseboard.clippingPlanes = [this.cutPlane];
    }
    const t = BB.t, top = 8;                  // сверху планка тоньше — скруглённый край
    // зоны наличников: вдоль стены от края проёма на 50 мм в обе стороны, на обеих сторонах стены
    const doors = [];
    for (const w of this.plan.WALLS) {
      const horiz = (w.x1 - w.x0) >= (w.y1 - w.y0);
      for (const o of w.openings) if (o.type === 'door') doors.push({ horiz, c0: horiz ? w.y0 : w.x0, c1: horiz ? w.y1 : w.x1, a: o.from - 50, b: o.to + 50 });
    }
    const rooms = BB.rooms.map((id) => this.plan.ROOMS.find((r) => r.id === id)).filter(Boolean);
    const inRoom = (x, y) => rooms.some((r) => pointInPoly(x, y, r.poly));
    const P = [], N = [], I = [];
    const addBox = (x0, y0, x1, y1, h0, h1) => {
      const g = new THREE.BoxGeometry((x1 - x0) * MM, (h1 - h0) * MM, (y1 - y0) * MM);
      g.translate(((x0 + x1) / 2) * MM, ((h0 + h1) / 2) * MM, ((y0 + y1) / 2) * MM);
      const base = P.length / 3;
      P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array);
      for (const i of g.index.array) I.push(base + i);
      g.dispose();
    };
    for (const room of rooms) {
      const poly = room.poly;
      for (let i = 0; i < poly.length; i++) {
        const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length];
        const alongX = Math.abs(by - ay) < 0.5;
        if (!alongX && Math.abs(bx - ax) >= 0.5) continue;
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const k = alongX ? (pointInPoly(mx, my + 5, poly) ? 1 : -1) : (pointInPoly(mx + 5, my, poly) ? 1 : -1);
        const c = alongX ? ay : ax;
        const s0 = alongX ? Math.min(ax, bx) : Math.min(ay, by), s1 = alongX ? Math.max(ax, bx) : Math.max(ay, by);
        // куски стен у пола, чья грань лежит на этой стороне комнаты
        const iv = [];
        for (const p of this.pieces) {
          if (p.kind === 'door' || p.h0 > 1) continue;
          const face = alongX ? (k > 0 ? p.y1 : p.y0) : (k > 0 ? p.x1 : p.x0);
          if (Math.abs(face - c) > 1) continue;
          const a = Math.max(s0, alongX ? p.x0 : p.y0), b = Math.min(s1, alongX ? p.x1 : p.y1);
          if (b - a > 1) iv.push([a, b]);
        }
        iv.sort((p, q) => p[0] - q[0]);
        const merged = [];
        for (const [a, b] of iv) { const last = merged[merged.length - 1]; if (last && a <= last[1] + 2) last[1] = Math.max(last[1], b); else merged.push([a, b]); }
        for (const [a, b] of merged) {
          // на внешнем углу стены планка заходит за угол на свою толщину — угол закрыт
          const out = (e, dir) => (alongX ? inRoom(e + dir * t / 2, c + k * t / 2) : inRoom(c + k * t / 2, e + dir * t / 2));
          let parts = [[a, b, out(a, -1), out(b, 1)]];
          for (const d of doors) {
            if (d.horiz !== alongX || c < d.c0 - 1 || c > d.c1 + 1) continue;
            parts = parts.flatMap(([p, q, ep, eq]) => {
              if (d.b <= p || d.a >= q) return [[p, q, ep, eq]];
              const res = [];
              if (d.a > p) res.push([p, d.a, ep, false]);
              if (d.b < q) res.push([d.b, q, false, eq]);
              return res;
            });
          }
          for (const [p, q, ep, eq] of parts) {
            const p0 = ep ? p - t : p, q0 = eq ? q + t : q;
            if (q0 - p0 < 5) continue;
            for (const [h0, h1, tt] of [[0, BB.h - top, t], [BB.h - top, BB.h, t * 0.6]]) {
              const w0 = c, w1 = c + k * tt;
              if (alongX) addBox(p0, Math.min(w0, w1), q0, Math.max(w0, w1), h0, h1);
              else addBox(Math.min(w0, w1), p0, Math.max(w0, w1), q0, h0, h1);
            }
          }
        }
      }
    }
    if (!I.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    geo.setIndex(I);
    const mesh = new THREE.Mesh(geo, this.mat.baseboard);
    mesh.receiveShadow = true;
    mesh.visible = this.baseboardOn !== false;
    this.group.add(mesh);
    this.baseboard = mesh;
  }

  setBaseboard(on) {
    this.baseboardOn = on;
    if (this.baseboard) this.baseboard.visible = on;
  }

  setFinish(id, on) {
    this.finishOn[id] = on;
    if (this.finishMeshes && this.finishMeshes[id]) this.finishMeshes[id].visible = on;
  }

  buildRoomLights(ceil) {
    for (const r of this.rooms) {
      if (r.area < 4 || r.outdoor) continue;           // свет только в больших комнатах — дешевле для телефонов
      // свет под потолком мягче, чтобы верх стен не пересвечивался и рисунок обоев был виден до потолка
      const l = new THREE.PointLight('#fff8f1', r.area > 8 ? 4.2 : 2.4, 0, 2);
      l.position.set(r.label[0] * MM, (ceil - 250) * MM, r.label[1] * MM);
      this.lights.add(l);
    }
  }

  // полотна дверей рядом с камерой (мм) становятся прозрачными; pos = null — вернуть всё как было
  fadeDoors(px, py) {
    for (const leaf of this.doorLeaves.children) {
      const r = leaf.userData.rect;
      if (!r) continue;
      let k = 1;
      if (px != null) {
        const dx = Math.max(r.x0 - px, 0, px - r.x1), dy = Math.max(r.y0 - py, 0, py - r.y1);
        const d = Math.hypot(dx, dy);
        if (d < 650) k = Math.max(0.12, (d - 120) / 530);
      }
      if (Math.abs(k - leaf.userData.fade) < 0.01) continue;
      leaf.userData.fade = k;
      for (const m of leaf.userData.mats) {
        const b = m.userData.base, tr = k < 0.999 || b.transparent;
        if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; }
        m.opacity = b.opacity * k;
        m.depthWrite = !tr;
      }
    }
  }

  roomAt(x, y) {
    return this.rooms.find((r) => pointInPoly(x, y, r.poly)) || null;
  }

  setLaminate(preset, size) {
    this.opts.laminate = preset; this.opts.plankSize = size;
    if (this.lam) { this.lam.map.dispose(); this.lam.bump.dispose(); }
    const aniso = this.renderer ? Math.min(8, this.renderer.capabilities.getMaxAnisotropy()) : 4;
    this.lam = makeLaminate(preset, size, aniso);
    this.mat.floor.map = this.lam.map;
    this.mat.floor.bumpMap = this.lam.bump;
    this.mat.floor.bumpScale = 0.9;
    this.mat.floor.needsUpdate = true;
    if (this.floor) this.updateFloorUV();
  }

  setPlankDir(dir) { this.opts.plankDir = dir; this.updateFloorUV(); }
  setWallColor(hex) { this.opts.wallColor = hex; this.mat.wall.color.set(hex); }

  setCut(mm) {
    this.cutMm = mm;
    this.cutPlane.constant = mm == null ? 100 : mm * MM;
  }

  setFlags(f) { Object.assign(this.flags, f); this.applyFlags(); }
  applyFlags() {
    if (this.ceiling) this.ceiling.visible = this.flags.ceiling;
    if (this.lights) this.lights.visible = this.flags.ceiling;
    if (this.doorLeaves) this.doorLeaves.visible = this.flags.doors;
    if (this.swingGroup) this.swingGroup.visible = this.flags.swings;
  }

  // точка попадания луча видна (не срезана и не скрыта)
  hitVisible(hit) {
    let o = hit.object;
    while (o) { if (!o.visible) return false; o = o.parent; }
    if (this.cutMm != null && hit.object.userData.arch && hit.object !== this.floor && hit.point.y > this.cutMm * MM + 0.002) return false;
    return true;
  }
}
