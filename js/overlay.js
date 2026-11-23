// HTML-подписи поверх 3D, рулетка и мини-карта.
import * as THREE from 'three';
import { footprint, isFlat } from './furniture.js';

const MM = 0.001;
const v = new THREE.Vector3();

// ── подписи: DOM-элементы, которые каждый кадр проецируются на экран ──
export class Labels {
  constructor(container) {
    this.root = container;
    this.pool = new Map();
  }
  // items: [{ key, pos: Vector3, html, cls }]
  sync(items, camera, w, h) {
    const seen = new Set();
    for (const it of items) {
      seen.add(it.key);
      let el = this.pool.get(it.key);
      if (!el) {
        el = document.createElement('div');
        this.root.appendChild(el);
        this.pool.set(it.key, el);
      }
      if (el._html !== it.html) { el.innerHTML = it.html; el._html = it.html; }
      if (el._cls !== it.cls) { el.className = 'lbl ' + (it.cls || ''); el._cls = it.cls; }
      v.copy(it.pos).project(camera);
      if (v.z < -1 || v.z > 1 || Math.abs(v.x) > 1.2 || Math.abs(v.y) > 1.2) { el.style.display = 'none'; continue; }
      el.style.display = '';
      const x = ((v.x + 1) / 2) * w, y = ((1 - v.y) / 2) * h;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
    }
    for (const [k, el] of this.pool) if (!seen.has(k)) { el.remove(); this.pool.delete(k); }
  }
}

// ── рулетка ──
export class Measure {
  constructor(scene) {
    this.group = new THREE.Group(); this.group.name = 'measure';
    scene.add(this.group);
    this.active = false;
    this.a = null;
    this.list = [];
    this.mat = new THREE.LineBasicMaterial({ color: '#2b45c8', depthTest: false, transparent: true });
    this.dot = new THREE.MeshBasicMaterial({ color: '#2b45c8', depthTest: false, transparent: true });
    this.preview = null;
    this.dotGeo = new THREE.SphereGeometry(0.025, 12, 8);
  }
  marker(p) {
    const m = new THREE.Mesh(this.dotGeo, this.dot);
    m.position.copy(p); m.renderOrder = 20;
    this.group.add(m);
    return m;
  }
  line(a, b) {
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), this.mat);
    l.renderOrder = 20;
    this.group.add(l);
    return l;
  }
  click(p) {
    if (!this.a) { this.a = { p: p.clone(), m: this.marker(p) }; return null; }
    const a = this.a.p, b = p.clone();
    const objs = [this.a.m, this.marker(b), this.line(a, b)];
    this.clearPreview();
    const rec = { a, b, objs, d: a.distanceTo(b) };
    this.list.push(rec);
    this.a = null;
    return rec;
  }
  hover(p) {
    if (!this.a) return;
    if (!p) { this.clearPreview(); return; }
    if (!this.preview) { this.preview = this.line(this.a.p, p); this.preview.material = this.mat; }
    this.preview.geometry.setFromPoints([this.a.p, p]);
    this.previewEnd = p.clone();
  }
  clearPreview() {
    if (this.preview) { this.group.remove(this.preview); this.preview.geometry.dispose(); this.preview = null; }
    this.previewEnd = null;
  }
  cancel() {
    if (this.a) { this.group.remove(this.a.m); this.a = null; }
    this.clearPreview();
  }
  clear() {
    this.cancel();
    for (const r of this.list) for (const o of r.objs) { this.group.remove(o); if (o.geometry !== this.dotGeo) o.geometry.dispose(); }
    this.list = [];
  }
  labels() {
    const out = this.list.map((r, i) => ({ key: 'm' + i, pos: r.a.clone().add(r.b).multiplyScalar(0.5), html: fmtLen(r.d), cls: 'measure' }));
    if (this.a && this.previewEnd) out.push({ key: 'mp', pos: this.a.p.clone().add(this.previewEnd).multiplyScalar(0.5), html: fmtLen(this.a.p.distanceTo(this.previewEnd)), cls: 'measure live' });
    return out;
  }
}

export function fmtLen(m) {
  const cm = m * 100;
  if (cm < 100) return `${cm.toFixed(cm < 10 ? 1 : 0).replace('.', ',')} см`;
  return `${(Math.round(cm) / 100).toFixed(2).replace('.', ',')} м`;
}

// ── мини-карта для прогулки ──
export class Minimap {
  constructor(canvas, building, furniture) {
    this.cv = canvas; this.b = building; this.f = furniture;
    this.ctx = canvas.getContext('2d');
  }
  layout() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = this.cv.clientWidth, h = this.cv.clientHeight;
    if (!w || !h) return false;
    if (this.cv.width !== Math.round(w * dpr)) { this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr); }
    const B = this.b.bounds, pad = 8;
    const s = Math.min((w - 2 * pad) / (B.x1 - B.x0), (h - 2 * pad) / (B.y1 - B.y0));
    this.T = { dpr, s, ox: pad + ((w - 2 * pad) - (B.x1 - B.x0) * s) / 2 - B.x0 * s, oy: pad + ((h - 2 * pad) - (B.y1 - B.y0) * s) / 2 - B.y0 * s };
    return true;
  }
  toPlan(cx, cy) { const T = this.T; return [(cx - T.ox) / T.s, (cy - T.oy) / T.s]; }
  draw(walk) {
    if (!this.layout()) return;
    const { ctx } = this, T = this.T;
    ctx.setTransform(T.dpr, 0, 0, T.dpr, 0, 0);
    ctx.clearRect(0, 0, this.cv.width, this.cv.height);
    const X = (x) => T.ox + x * T.s, Y = (y) => T.oy + y * T.s;
    ctx.fillStyle = '#f3efe7';
    for (const r of this.b.rooms) { ctx.beginPath(); r.poly.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.closePath(); ctx.fill(); }
    for (const it of this.f.items) {
      const p = footprint(it);
      ctx.beginPath(); p.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.closePath();
      ctx.globalAlpha = isFlat(it) ? 0.35 : 0.85; ctx.fillStyle = it.color; ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(40,44,50,.6)'; ctx.lineWidth = 0.7; ctx.stroke();
    }
    for (const p of this.b.pieces) {
      if (p.kind === 'lintel') continue;
      ctx.fillStyle = p.kind === 'sill' ? '#9fb6d6' : p.kind === 'door' ? '#8a8f95' : '#3c3f44';
      ctx.fillRect(X(p.x0), Y(p.y0), (p.x1 - p.x0) * T.s, (p.y1 - p.y0) * T.s);
    }
    // игрок и сектор обзора
    const px = X(walk.pos.x / MM), py = Y(walk.pos.z / MM);
    const a = Math.atan2(-Math.cos(walk.yaw), Math.sin(walk.yaw));
    ctx.fillStyle = 'rgba(43,69,200,.22)';
    ctx.beginPath(); ctx.moveTo(px, py); ctx.arc(px, py, 26, a - 0.55, a + 0.55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2b45c8'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
}
