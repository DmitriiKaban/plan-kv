// Мебель: добавление, перетаскивание с прилипанием к стенам, проверка пересечений
// (со стенами, другой мебелью и зонами открывания дверей) и размеры до стен.
import * as THREE from 'three';
import { buildModel, ACCESSORY } from './catalog.js';

const MM = 0.001;
const BLUE = '#2b45c8', RED = '#d23c2c', INK = '#3a3f45';

export const isFlat = (it) => it.type === 'rug' || it.h < 30;

// контур предмета в его собственных координатах (мм): обычно прямоугольник,
// у душа с обрезанным углом — пятиугольник
export function localPoly(it) {
  const w = it.w / 2, d = it.d / 2;
  if (it.type === 'showerPent') {
    const s = Math.min(460, it.w * 0.6, it.d * 0.6);
    return [[-w, -d], [w, -d], [w, -d + s], [-w + s, d], [-w, d]];
  }
  return [[-w, -d], [w, -d], [w, d], [-w, d]];
}
export function footprint(it) {
  const a = (it.rot * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return localPoly(it).map(([lx, ly]) => [it.x + lx * c - ly * s, it.y + lx * s + ly * c]);
}
export function aabbOf(it) {
  const p = footprint(it);
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
const rectPoly = (r) => [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]];
const vOverlap = (a0, a1, b0, b1) => a0 < b1 - 1 && b0 < a1 - 1;

function satOverlap(A, B, eps = 2) {
  for (const P of [A, B]) {
    for (let i = 0; i < P.length; i++) {
      const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length];
      let nx = y2 - y1, ny = x1 - x2;
      const len = Math.hypot(nx, ny);
      if (len < 1e-6) continue;
      nx /= len; ny /= len;
      let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
      for (const [x, y] of A) { const p = x * nx + y * ny; if (p < a0) a0 = p; if (p > a1) a1 = p; }
      for (const [x, y] of B) { const p = x * nx + y * ny; if (p < b0) b0 = p; if (p > b1) b1 = p; }
      if (a1 <= b0 + eps || b1 <= a0 + eps) return false;
    }
  }
  return true;
}

let uid = 0;
// точка внутри многоугольника (луч вправо)
function insidePoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// влезает ли предмет между стенками открытой полки (стенки 18 мм): проекция на ширину полки
function shelfFit(P, shelf) {
  const a = (shelf.rot * Math.PI) / 180, ax = Math.cos(a), ay = Math.sin(a);
  const ds = P.map(([x, y]) => (x - shelf.x) * ax + (y - shelf.y) * ay);
  const lo = Math.min(...ds), hi = Math.max(...ds), inner = shelf.w / 2 - 18;
  if (hi - lo > 2 * inner + 1) return `шире полки на ${fmtCm(hi - lo - 2 * inner)} см — внутри ${fmtCm(2 * inner)}`;
  if (hi > inner + 1 || lo < -inner - 1) return 'заходит в стенку полки';
  return null;
}

export const newId = () => 'f' + Date.now().toString(36) + (uid++).toString(36) + Math.floor(Math.random() * 1e4).toString(36);

export class Furniture {
  constructor(scene, building, hooks = {}) {
    this.scene = scene;
    this.building = building;
    this.hooks = hooks;
    this.group = new THREE.Group(); this.group.name = 'furniture';
    this.helpers = new THREE.Group(); this.helpers.name = 'furniture-helpers';
    scene.add(this.group, this.helpers);
    this.items = [];
    this.nodes = new Map();
    this.selectedId = null;
    this.conflicts = new Map();
    this.dimLabels = [];
    this.snapOn = true;
    this.lineMats = {
      ink: new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 }),
      inkDash: new THREE.LineDashedMaterial({ color: INK, transparent: true, opacity: 0.5, dashSize: 0.06, gapSize: 0.04 }),
      red: new THREE.LineBasicMaterial({ color: RED }),
      redDash: new THREE.LineDashedMaterial({ color: RED, dashSize: 0.06, gapSize: 0.04 }),
      blue: new THREE.LineBasicMaterial({ color: BLUE }),
      blueDash: new THREE.LineDashedMaterial({ color: BLUE, dashSize: 0.06, gapSize: 0.04 }),
      dim: new THREE.LineBasicMaterial({ color: BLUE, depthTest: false, transparent: true }),
    };
    this.redTint = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.16, depthWrite: false });
  }

  // на виде сверху контуры рисуются поверх мебели, как на чертеже
  setOutlineOnTop(on) {
    for (const k of ['ink', 'inkDash', 'red', 'redDash', 'blue', 'blueDash']) {
      const m = this.lineMats[k];
      if (m.userData.baseOpacity == null) m.userData.baseOpacity = m.opacity;
      m.depthTest = !on;
      m.opacity = on && k.startsWith('ink') ? 0.8 : m.userData.baseOpacity;
    }
    for (const n of this.nodes.values()) { n.outline.renderOrder = on ? 12 : 3; if (n.sel) n.sel.renderOrder = on ? 13 : 0; }
    this.outlineOnTop = on;
  }

  get selected() { return this.items.find((i) => i.id === this.selectedId) || null; }
  byId(id) { return this.items.find((i) => i.id === id) || null; }

  setItems(list) {
    for (const id of [...this.nodes.keys()]) this.dropNode(id);
    this.items = list.map((it) => ({ ...it }));
    for (const it of this.items) this.makeNode(it);
    if (!this.byId(this.selectedId)) this.selectedId = null;
    this.refresh();
  }

  add(data) {
    const it = { id: newId(), z: 0, rot: 0, ...data };
    if (!it.id || this.byId(it.id)) it.id = newId();
    this.items.push(it);
    this.makeNode(it);
    this.select(it.id);
    this.refresh();
    this.emit(true);
    return it;
  }

  update(id, patch, commit = true) {
    const it = this.byId(id);
    if (!it) return;
    const rebuild = ['w', 'd', 'h', 'type', 'color', 'color2', 'handles', 'metal'].some((k) => k in patch && patch[k] !== it[k]);
    Object.assign(it, patch);
    if (rebuild) { this.dropNode(id); this.makeNode(it); if (id === this.selectedId) this.attachSel(it); }
    else this.place(it);
    this.refresh();
    this.emit(commit);
  }

  remove(id) {
    const i = this.items.findIndex((x) => x.id === id);
    if (i < 0) return;
    this.items.splice(i, 1);
    this.dropNode(id);
    if (this.selectedId === id) this.select(null);
    this.refresh();
    this.emit(true);
  }

  duplicate(id) {
    const it = this.byId(id);
    if (!it) return null;
    const off = Math.max(150, Math.min(it.w, it.d) * 0.3);
    const copy = { ...it, id: newId(), x: it.x + off, y: it.y + off };
    return this.add(copy);
  }

  emit(commit) { this.hooks.onChange && this.hooks.onChange(commit); }

  makeNode(it) {
    const root = new THREE.Group();
    const model = buildModel(it);
    model.traverse((o) => { o.userData.itemId = it.id; });
    root.add(model);
    // контур на полу (у навесной мебели — пунктир)
    const lp = localPoly(it);
    const pts = [...lp, lp[0]].map(([lx, lz]) => new THREE.Vector3(lx * MM, 0, lz * MM));
    const outline = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.lineMats.ink);
    outline.computeLineDistances();
    outline.renderOrder = this.outlineOnTop ? 12 : 3;
    root.add(outline);
    // красная подсветка при конфликте
    const tint = new THREE.Mesh(new THREE.BoxGeometry(it.w * MM + 0.01, Math.max(0.01, it.h * MM) + 0.01, it.d * MM + 0.01), this.redTint);
    tint.position.y = (it.h * MM) / 2; tint.visible = false; tint.renderOrder = 4;
    root.add(tint);
    this.group.add(root);
    this.nodes.set(it.id, { root, model, outline, tint, sel: null });
    this.place(it);
  }

  dropNode(id) {
    const n = this.nodes.get(id);
    if (!n) return;
    this.group.remove(n.root);
    n.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    this.nodes.delete(id);
  }

  place(it) {
    const n = this.nodes.get(it.id);
    if (!n) return;
    n.root.position.set(it.x * MM, (it.z || 0) * MM, it.y * MM);
    n.root.rotation.y = (-it.rot * Math.PI) / 180;
    n.outline.position.y = -(it.z || 0) * MM + 0.004;
  }

  detachSel(id) {
    const n = this.nodes.get(id);
    if (n && n.sel) { n.root.remove(n.sel); n.sel.geometry.dispose(); n.sel = null; }
  }
  attachSel(it) {
    const n = this.nodes.get(it.id);
    if (!n) return;
    this.detachSel(it.id);
    const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(it.w * MM + 0.02, Math.max(0.01, it.h * MM) + 0.02, it.d * MM + 0.02));
    n.sel = new THREE.LineSegments(g, this.lineMats.blue);
    n.sel.position.y = (it.h * MM) / 2;
    n.root.add(n.sel);
  }

  select(id) {
    if (this.selectedId) this.detachSel(this.selectedId);
    this.selectedId = id && this.byId(id) ? id : null;
    const it = this.selected;
    if (it) this.attachSel(it);
    this.refresh();
    this.hooks.onSelect && this.hooks.onSelect(this.selected);
  }

  // пересоздать рамку выделения (без события выбора)
  reselect() { const it = this.selected; if (it) this.attachSel(it); }

  pick(raycaster) {
    const hits = raycaster.intersectObjects(this.group.children, true);
    for (const h of hits) {
      if (h.object.isMesh && h.object.material !== this.redTint && h.object.userData.itemId) return this.byId(h.object.userData.itemId);
    }
    return null;
  }

  // ── прилипание ──
  obstacleRects(it) {
    const z0 = it.z || 0, z1 = z0 + it.h;
    const out = [];
    for (const p of this.building.pieces) if (vOverlap(z0, z1, p.h0, p.h1)) out.push(p);
    for (const o of this.items) {
      if (o.id === it.id || isFlat(o) || isFlat(it)) continue;
      if (!vOverlap(z0, z1, o.z || 0, (o.z || 0) + o.h)) continue;
      out.push(aabbOf(o));
    }
    return out;
  }

  snap(it, x, y) {
    x = Math.round(x / 10) * 10; y = Math.round(y / 10) * 10;
    const r90 = ((it.rot % 90) + 90) % 90;
    if (!this.snapOn || (r90 > 0.5 && r90 < 89.5)) return [x, y];   // под углом — только сетка 1 см
    const th = 70;
    const probe = { ...it, x, y };
    const bb = aabbOf(probe), hx = (bb.x1 - bb.x0) / 2, hy = (bb.y1 - bb.y0) / 2;
    const obs = this.obstacleRects(it);
    const pick = (cands) => cands.reduce((b, d) => (Math.abs(d) < th && (b == null || Math.abs(d) < Math.abs(b)) ? d : b), null);
    let c = [];
    for (const b of obs) if (vOverlap(y - hy, y + hy, b.y0, b.y1)) c.push(b.x0 - (x + hx), b.x1 - (x - hx));
    const dx = pick(c); if (dx != null) x += dx;
    c = [];
    for (const b of obs) if (vOverlap(x - hx, x + hx, b.x0, b.x1)) c.push(b.y0 - (y + hy), b.y1 - (y - hy));
    const dy = pick(c); if (dy != null) y += dy;
    return [Math.round(x), Math.round(y)];
  }

  // ── пересечения ──
  computeConflicts() {
    const res = new Map();
    const swings = this.building.swings || [];
    const polys = new Map(this.items.map((it) => [it.id, footprint(it)]));
    for (const it of this.items) {
      const msgs = [];
      if (!isFlat(it)) {
        const P = polys.get(it.id), z0 = it.z || 0, z1 = z0 + it.h;
        const walls = new Set();
        for (const p of this.building.pieces) {
          if (!vOverlap(z0, z1, p.h0, p.h1)) continue;
          if (satOverlap(P, rectPoly(p))) walls.add(p.kind === 'fixture' ? p.name.toLowerCase() : p.kind === 'sill' ? 'подоконник' : p.kind === 'door' ? 'дверь' : 'стену');
        }
        for (const w of walls) msgs.push({ kind: 'wall', text: `заходит в ${w}` });
        if (z0 < 1950) for (const s of swings) if (satOverlap(P, s.poly, 4)) msgs.push({ kind: 'door', text: `мешает открыть ${s.acc}` });
        for (const o of this.items) {
          if (o.id === it.id || isFlat(o)) continue;
          // техника, которая стоит на мебели или в полке, с ней не конфликтует; в открытой полке проверяем, влезает ли
          const acc = ACCESSORY.has(it.type) ? it : ACCESSORY.has(o.type) ? o : null;
          if (acc && !(ACCESSORY.has(it.type) && ACCESSORY.has(o.type))) {
            const host = acc === it ? o : it;
            if (insidePoly(acc.x, acc.y, polys.get(host.id))) {
              if (acc === it && host.type === 'shelfOpen' && vOverlap(z0, z1, host.z || 0, (host.z || 0) + host.h)) {
                const fit = shelfFit(P, host);
                if (fit) msgs.push({ kind: 'item', text: fit });
              }
              continue;
            }
          }
          if (!vOverlap(z0, z1, o.z || 0, (o.z || 0) + o.h)) continue;
          if (satOverlap(P, polys.get(o.id))) msgs.push({ kind: 'item', text: `пересекается: ${o.name}` });
        }
      }
      if (msgs.length) res.set(it.id, msgs);
    }
    this.conflicts = res;
    return res;
  }

  refresh() {
    this.computeConflicts();
    for (const it of this.items) {
      const n = this.nodes.get(it.id);
      if (!n) continue;
      const bad = this.conflicts.has(it.id), sel = it.id === this.selectedId, up = (it.z || 0) > 300;
      n.outline.material = sel ? (up ? this.lineMats.blueDash : this.lineMats.blue) : bad ? (up ? this.lineMats.redDash : this.lineMats.red) : up ? this.lineMats.inkDash : this.lineMats.ink;
      n.tint.visible = bad && this.conflicts.get(it.id).some((m) => m.kind !== 'door');
    }
    this.updateDims();
  }

  // ── размеры от выделенного предмета до стен и мебели ──
  updateDims() {
    for (const ch of [...this.helpers.children]) { this.helpers.remove(ch); ch.geometry.dispose(); }
    this.dimLabels = [];
    const it = this.selected;
    if (!it || !this.showDims) return;
    const bb = aabbOf(it), obs = this.obstacleRects(it);
    const y = Math.max(0.012, (it.z || 0) * MM + 0.012);
    const dirs = [
      { axis: 'x', sgn: 1 }, { axis: 'x', sgn: -1 }, { axis: 'y', sgn: 1 }, { axis: 'y', sgn: -1 },
    ];
    for (const { axis, sgn } of dirs) {
      let best = null;
      for (const b of obs) {
        if (axis === 'x') {
          const o0 = Math.max(bb.y0, b.y0), o1 = Math.min(bb.y1, b.y1);
          if (o1 - o0 < 1) continue;
          const d = sgn > 0 ? b.x0 - bb.x1 : bb.x0 - b.x1;
          if (d < -1) continue;
          if (!best || d < best.d) best = { d: Math.max(0, d), at: (o0 + o1) / 2 };
        } else {
          const o0 = Math.max(bb.x0, b.x0), o1 = Math.min(bb.x1, b.x1);
          if (o1 - o0 < 1) continue;
          const d = sgn > 0 ? b.y0 - bb.y1 : bb.y0 - b.y1;
          if (d < -1) continue;
          if (!best || d < best.d) best = { d: Math.max(0, d), at: (o0 + o1) / 2 };
        }
      }
      if (!best || best.d > 9000) continue;
      let a, b;
      if (axis === 'x') {
        const x0 = sgn > 0 ? bb.x1 : bb.x0;
        a = [x0, best.at]; b = [x0 + sgn * best.d, best.at];
      } else {
        const y0 = sgn > 0 ? bb.y1 : bb.y0;
        a = [best.at, y0]; b = [best.at, y0 + sgn * best.d];
      }
      this.addDim(a, b, y, axis, best.d);
    }
  }

  addDim(a, b, y, axis, d) {
    const A = new THREE.Vector3(a[0] * MM, y, a[1] * MM), Bv = new THREE.Vector3(b[0] * MM, y, b[1] * MM);
    const pts = [A, Bv];
    // засечки под 45°, как на чертеже
    const t = 0.05;
    for (const P of [A, Bv]) pts.push(new THREE.Vector3(P.x - t, y, P.z + t), new THREE.Vector3(P.x + t, y, P.z - t));
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    const seg = new THREE.LineSegments(g, this.lineMats.dim);
    seg.renderOrder = 10;
    this.helpers.add(seg);
    this.dimLabels.push({ pos: A.clone().add(Bv).multiplyScalar(0.5), text: fmtCm(d), axis });
  }

  // препятствия для прогулки (м)
  walkObstacles() {
    return this.items.filter((it) => !isFlat(it) && (it.z || 0) < 1700 && (it.z || 0) + it.h > 120).map((it) => {
      const a = (it.rot * Math.PI) / 180;
      return { cx: it.x * MM, cz: it.y * MM, hx: (it.w / 2) * MM, hz: (it.d / 2) * MM, c: Math.cos(a), s: Math.sin(a) };
    });
  }
}

export function fmtCm(mm) {
  const cm = Math.round(mm / 5) / 2;
  return (Number.isInteger(cm) ? String(cm) : cm.toFixed(1).replace('.', ',')) ;
}
