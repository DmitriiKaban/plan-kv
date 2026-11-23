// Прогулка от первого лица: WASD/стрелки, взгляд перетаскиванием,
// джойстик на телефоне и столкновения со стенами и мебелью.
import * as THREE from 'three';

export class WalkControls {
  constructor(camera, getObstacles) {
    this.camera = camera;
    this.getObstacles = getObstacles;
    this.pos = new THREE.Vector3(4, 0, 6);
    this.yaw = 0; this.pitch = 0.1;
    this.eye = 1.6;
    this.radius = 0.2;
    this.speed = 1.5;
    this.keys = new Set();
    this.joy = { x: 0, y: 0 };
    this.look = null;
    this.enabled = false;
    this.moving = false;
    this.sens = 0.0042;

    this.onKey = (e) => {
      if (!this.enabled) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      const k = e.code;
      const used = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'KeyQ', 'KeyE'];
      if (!used.includes(k)) return;
      if (e.type === 'keydown') this.keys.add(k); else this.keys.delete(k);
      e.preventDefault();
    };
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKey);
    window.addEventListener('blur', () => this.keys.clear());
  }

  setPose(xm, zm, yaw, pitch = 0.1) {
    this.pos.set(xm, 0, zm); this.yaw = yaw; this.pitch = pitch;
    this.collide(); this.apply();
  }

  lookStart(e) { this.look = { id: e.pointerId, x: e.clientX, y: e.clientY }; }
  lookMove(e) {
    if (!this.look || e.pointerId !== this.look.id) return false;
    const dx = e.clientX - this.look.x, dy = e.clientY - this.look.y;
    this.look.x = e.clientX; this.look.y = e.clientY;
    // «тянем мир»: провели вправо — взгляд уходит влево, как в панорамах
    const k = e.pointerType === 'touch' ? this.sens * 1.25 : this.sens;
    this.yaw -= dx * k;
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy * k, -1.45, 1.45);
    this.apply();
    return true;
  }
  lookEnd(e) { if (this.look && e.pointerId === this.look.id) this.look = null; }

  update(dt) {
    if (!this.enabled) return false;
    const K = this.keys;
    let f = 0, s = 0, turn = 0;
    if (K.has('KeyW') || K.has('ArrowUp')) f += 1;
    if (K.has('KeyS') || K.has('ArrowDown')) f -= 1;
    if (K.has('KeyD')) s += 1;
    if (K.has('KeyA')) s -= 1;
    if (K.has('ArrowLeft') || K.has('KeyQ')) turn -= 1;
    if (K.has('ArrowRight') || K.has('KeyE')) turn += 1;
    f += -this.joy.y; s += this.joy.x;
    const run = K.has('ShiftLeft') || K.has('ShiftRight') ? 2 : 1;
    if (turn) { this.yaw += turn * 1.8 * dt; }
    const len = Math.hypot(f, s);
    this.moving = len > 0.01 || !!turn;
    if (len > 0.01) {
      const m = Math.min(1, len);
      f /= len; s /= len;
      const v = this.speed * run * m * dt;
      const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
      // вперёд по взгляду: (sin, -cos) в координатах X/Z (yaw растёт вправо)
      const dx = (f * sin + s * cos) * v, dz = (-f * cos + s * sin) * v;
      // шаг дробится, чтобы не проскакивать тонкие стены
      const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.08));
      for (let i = 0; i < steps; i++) { this.pos.x += dx / steps; this.pos.z += dz / steps; this.collide(); }
    }
    this.apply();
    return this.moving;
  }

  collide() {
    const r = this.radius, P = this.pos;
    const obs = this.getObstacles();
    for (let iter = 0; iter < 4; iter++) {
      let moved = false;
      for (const o of obs) {
        const dx = P.x - o.cx, dz = P.z - o.cz;
        const lx = dx * o.c + dz * o.s, lz = -dx * o.s + dz * o.c;
        if (Math.abs(lx) > o.hx + r || Math.abs(lz) > o.hz + r) continue;
        const qx = THREE.MathUtils.clamp(lx, -o.hx, o.hx), qz = THREE.MathUtils.clamp(lz, -o.hz, o.hz);
        const ex = lx - qx, ez = lz - qz, d2 = ex * ex + ez * ez;
        if (d2 >= r * r) continue;
        let nx, nz, push;
        if (d2 > 1e-10) { const d = Math.sqrt(d2); nx = ex / d; nz = ez / d; push = r - d; }
        else {
          const px = o.hx - Math.abs(lx), pz = o.hz - Math.abs(lz);
          if (px < pz) { nx = Math.sign(lx) || 1; nz = 0; push = px + r; } else { nx = 0; nz = Math.sign(lz) || 1; push = pz + r; }
        }
        P.x += (nx * o.c - nz * o.s) * push;
        P.z += (nx * o.s + nz * o.c) * push;
        moved = true;
      }
      if (!moved) break;
    }
  }

  apply() {
    this.camera.position.set(this.pos.x, this.eye, this.pos.z);
    this.camera.rotation.set(-this.pitch, -this.yaw, 0, 'YXZ');
  }

  // направление взгляда на полу (для мини-карты и размещения мебели)
  forward() { return { x: Math.sin(this.yaw), z: -Math.cos(this.yaw) }; }
}

// Экранный джойстик
export function attachJoystick(el, walk) {
  const knob = el.querySelector('.knob');
  let id = null, cx = 0, cy = 0;
  const R = () => el.clientWidth / 2;
  const set = (x, y) => {
    const r = R();
    let dx = x - cx, dy = y - cy;
    const d = Math.hypot(dx, dy);
    if (d > r) { dx *= r / d; dy *= r / d; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const dead = 0.12;
    const nx = dx / r, ny = dy / r, m = Math.hypot(nx, ny);
    if (m < dead) { walk.joy.x = 0; walk.joy.y = 0; }
    else { const k = (m - dead) / (1 - dead) / m; walk.joy.x = nx * k; walk.joy.y = ny * k; }
  };
  el.addEventListener('pointerdown', (e) => {
    if (id !== null) return;
    id = e.pointerId;
    el.setPointerCapture(id);
    const r = el.getBoundingClientRect();
    cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    set(e.clientX, e.clientY);
    e.preventDefault(); e.stopPropagation();
  });
  el.addEventListener('pointermove', (e) => { if (e.pointerId === id) { set(e.clientX, e.clientY); e.preventDefault(); } });
  const end = (e) => {
    if (e.pointerId !== id) return;
    id = null; walk.joy.x = 0; walk.joy.y = 0; knob.style.transform = '';
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}
